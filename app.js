import { trip } from "./trip-data.js";
import {
  STORAGE_KEY, buildCalendar, countdown, defaultState, destinationName,
  destinations, entriesForDay, filterDays, formatDate, parseState, googleMapsURL, placesForDay,
} from "./lib.js";
import { bases, dayGuides, places, railGuide, resources } from "./guide-data.js";
import { createPlaceMap } from "./map.js";
import { linkAudit } from "./link-audit.js";
import { alternatives, foodByPlace, foodMapsURL, foodStops } from "./extras.js";

const $ = (selector, root = document) => root.querySelector(selector);
const views = ["itinerary", "travel", "stays", "bases", "checklist"];
const accommodationTransportNote = "Die Anfahrten im Tagesplan beziehen sich weiterhin auf die ursprünglichen Hauptunterkünfte; eine andere Auswahl ändert sie nicht automatisch.";
const mapContexts = new Map();
let mapsPermitted = false;
let selectedBase = "tokyo";
let selectedDaySection = "plan";
let dayMapOpen = false;
let state = defaultState(trip);
let currentView = "itinerary";
let selectedDate = trip.startDate;
let filters = { destination: "all", query: "", savedOnly: false };

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function graphic(symbol, className = "icon", viewBox = "0 0 24 24") {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("class", className);
  svg.setAttribute("viewBox", viewBox);
  svg.setAttribute("aria-hidden", "true");
  svg.setAttribute("focusable", "false");
  const use = document.createElementNS("http://www.w3.org/2000/svg", "use");
  use.setAttribute("href", `#${symbol}`);
  svg.append(use);
  return svg;
}

function button(text, className, action) {
  const node = element("button", className, text);
  node.type = "button";
  node.addEventListener("click", action);
  return node;
}

function externalLink(label, url, className) {
  const link = element("a", className, label);
  link.href = url;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  const audit = linkAudit[url];
  if (audit) link.title = audit.message;
  return link;
}

function linkWithStatus(label, url) {
  const item = element("span", "audited-link");
  item.append(externalLink(label, url));
  const audit = linkAudit[url];
  if (audit && audit.status !== "ok") item.append(element("span", "link-caveat", audit.message));
  if (audit?.notice) item.append(element("span", "link-caveat", audit.notice));
  return item;
}

function bookingLinks(links) {
  const container = element("div", "booking-links");
  for (const link of links) {
    if (link.url.startsWith("https://www.lastminute.de/msr/route/")) {
      container.append(
        linkWithStatus("VietJet: offizielle Airline öffnen", resources.vietjet.url),
        element("span", "link-caveat", "Route, Datum und Gepäck direkt bei der Airline auswählen."),
      );
    } else container.append(linkWithStatus(link.label, link.url));
  }
  return container;
}

function resourceLinks(ids) {
  const container = element("div", "resource-links");
  for (const id of [...new Set(ids ?? [])]) {
    const resource = resources[id];
    if (!resource) throw new Error(`Unknown official source: ${id}`);
    container.append(linkWithStatus(resource.label, resource.url));
  }
  return container;
}

function foodRecommendation(id) {
  const food = foodStops[foodByPlace[id]];
  if (!food) throw new Error(`Missing culinary recommendation for ${id}`);
  const section = element("details", "food-recommendation");
  section.append(
    element("summary", "", `Unser Genuss-Tipp: ${food.name}`),
    element("p", "", food.why),
    element("p", "food-children", `Für Kinder: ${food.children}`),
    element("p", "food-practical", food.practical),
  );
  const links = element("div", "food-links");
  links.append(linkWithStatus("Offizielle Infos", food.url), linkWithStatus(`${food.name} in Google Maps`, foodMapsURL(food)));
  section.append(links);
  return section;
}

function announce(message) {
  $("#status-message").textContent = message;
}

function storageNotice(message, error) {
  console.warn("Planner storage is unavailable or invalid.", error);
  $("#storage-notice-text").textContent = message;
  $("#storage-notice").hidden = false;
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch (error) {
    storageNotice("Dein Browser konnte die Änderungen nicht speichern. Sie gelten nur für diese Sitzung. Erlaube Website-Daten, um sie nach dem Neuladen zu behalten.", error);
    return false;
  }
}

function loadState() {
  try {
    state = parseState(localStorage.getItem(STORAGE_KEY), trip);
  } catch (error) {
    storageNotice("Gespeicherte Planungsdaten konnten nicht gelesen werden. Für diese Sitzung werden die Originalwerte verwendet. Neue Änderungen versuchen wir erneut zu speichern.", error);
  }
}

function updateTheme() {
  const theme = document.documentElement.dataset.theme;
  const toggle = $("#theme-toggle");
  toggle.setAttribute("aria-label", theme === "dark" ? "Helle Ansicht aktivieren" : "Dunkle Ansicht aktivieren");
  toggle.replaceChildren(graphic(theme === "dark" ? "icon-sun" : "icon-moon"));
}

function applyPreferredTheme() {
  const query = new URLSearchParams(location.search).get("clawpilotTheme");
  if (!query && state.theme) document.documentElement.dataset.theme = state.theme;
  updateTheme();
}

function writeLocation() {
  const hash = new URLSearchParams({ view: currentView, day: selectedDate });
  history.replaceState(null, "", `${location.pathname}${location.search}#${hash}`);
}

function setView(view, updateLocation = true) {
  currentView = view;
  for (const id of views) {
    const selected = id === view;
    const tab = $(`#tab-${id}`);
    tab.setAttribute("aria-selected", String(selected));
    tab.tabIndex = selected ? 0 : -1;
    $(`#panel-${id}`).hidden = !selected;
  }
  document.title = `${$(`#tab-${view}`).textContent.trim()} · Japan & Vietnam 2027`;
  requestAnimationFrame(() => {
    for (const context of mapContexts.values()) {
      if (mapIsVisible(context)) {
        context.map?.resize();
        if (mapsPermitted) context.start?.();
      }
    }
  });
  if (updateLocation) writeLocation();
}

function readLocation() {
  if (location.hash === "#planner") {
    setView("itinerary", false);
    return;
  }
  const params = new URLSearchParams(location.hash.slice(1));
  const requestedView = params.get("view");
  const requestedDate = params.get("day");
  if (requestedDate) {
    if (trip.days.some((day) => day.date === requestedDate)) selectedDate = requestedDate;
    else {
      selectedDate = trip.startDate;
      announce("Dieser Reisetag ist nicht im Plan. Der erste Reisetag wird angezeigt.");
    }
  }
  if (requestedView && !views.includes(requestedView)) {
    announce("Dieser Bereich ist nicht im Reiseplan. Die Tagesplanung wird angezeigt.");
  }
  setView(views.includes(requestedView) ? requestedView : "itinerary", false);
}

function resetFilters() {
  filters = { destination: "all", query: "", savedOnly: false };
  $("#day-search").value = "";
  updateFilterControls();
  renderItinerary();
}

function selectDestination(id) {
  filters = { destination: id, query: "", savedOnly: false };
  $("#day-search").value = "";
  updateFilterControls();
  setView("itinerary");
  renderItinerary();
  $("#planner").scrollIntoView({ block: "start" });
}

function renderRouteControls() {
  const route = $("#route-stops");
  destinations.forEach((destination, index) => {
    const stop = button("", "route-stop", () => selectDestination(destination.id));
    stop.dataset.destination = destination.id;
    stop.setAttribute("aria-pressed", "false");
    stop.setAttribute("aria-label", `${destination.name}, ${destination.dates}, ${destination.nights} Nächte: Tagesplan anzeigen`);
    const copy = element("span", "stop-copy");
    copy.append(
      element("span", "stop-name", destination.id === "vietnam" ? "Da Nang" : destination.name),
      element("span", "stop-dates", destination.dates),
      element("span", "stop-nights", `${destination.nights} Nächte · ${destination.country}`),
    );
    stop.append(
      element("span", "stop-number", index + 1),
      copy,
      graphic(destination.symbol, "stop-art", "0 0 200 140"),
    );
    route.append(stop);
  });
  const filterOptions = [
    ["all", "Alle Tage"],
    ...destinations.map((destination) => [destination.id, destination.id === "vietnam" ? "Vietnam" : destination.name]),
    ["reise", "An- & Rückreise"],
  ];
  for (const [id, name] of filterOptions) {
    const filter = button(name, "filter-button", () => {
      filters.destination = id;
      updateFilterControls();
      renderItinerary();
    });
    filter.dataset.destination = id;
    $("#destination-filters").append(filter);
  }
  updateFilterControls();
}

function updateFilterControls() {
  for (const node of document.querySelectorAll("[data-destination]")) {
    node.setAttribute("aria-pressed", String(node.dataset.destination === filters.destination));
  }
  $("#saved-filter").setAttribute("aria-pressed", String(filters.savedOnly));
  $("#saved-count").textContent = state.favorites.length;
}

function revealSelectedDay() {
  const list = $("#day-list");
  const selected = $(`[data-date="${selectedDate}"]`, list);
  if (!selected) return;
  const parentRect = list.getBoundingClientRect();
  const rect = selected.getBoundingClientRect();
  if (matchMedia("(max-width: 600px)").matches) {
    if (rect.left < parentRect.left || rect.right > parentRect.right) {
      list.scrollLeft += rect.left - parentRect.left - 8;
    }
  } else if (rect.top < parentRect.top || rect.bottom > parentRect.bottom) {
    list.scrollTop += rect.top - parentRect.top - 8;
  }
}

function chooseDay(day, focusTarget = "list") {
  selectedDate = day.date;
  selectedDaySection = "plan";
  renderItinerary();
  if (focusTarget === "list") $(`[data-date="${day.date}"]`, $("#day-list"))?.focus({ preventScroll: true });
  else {
    const nextFocus = $(`.day-navigation [data-direction="${focusTarget}"]:not(:disabled)`) ?? $("#day-title");
    nextFocus.focus({ preventScroll: true });
  }
  revealSelectedDay();
  const detail = $("#day-detail");
  if (detail.getBoundingClientRect().top < 74 || matchMedia("(max-width: 600px)").matches) {
    detail.scrollIntoView({ block: "start" });
  }
  announce(`${formatDate(day.date)}: ${day.title}`);
}

function renderDayList(days) {
  const list = $("#day-list");
  const previousScroll = { top: list.scrollTop, left: list.scrollLeft };
  list.replaceChildren();
  $("#day-results").textContent = `${days.length} von ${trip.days.length}`;
  for (const day of days) {
    const option = button("", "day-option", () => chooseDay(day));
    option.dataset.date = day.date;
    option.setAttribute("aria-pressed", String(day.date === selectedDate));
    option.setAttribute("aria-label", `${formatDate(day.date)}: ${day.title}`);
    const date = element("span", "day-option-date");
    date.append(
      element("strong", "", Number(day.date.slice(-2))),
      element("small", "", formatDate(day.date, { weekday: "short", month: "short" })),
    );
    const copy = element("span", "day-option-copy");
    copy.append(
      element("span", "day-option-title", day.title),
      element("span", "day-option-city", destinationName(day.destination)),
    );
    option.append(date, copy);
    if (state.favorites.includes(day.date)) option.append(graphic("icon-star", "icon day-option-star"));
    list.append(option);
  }
  if (!days.length) list.append(element("p", "empty-state muted", "Keine passenden Reisetage."));
  list.scrollTop = previousScroll.top;
  list.scrollLeft = previousScroll.left;
}

function toggleFavorite(day) {
  const wasSaved = state.favorites.includes(day.date);
  state.favorites = wasSaved ? state.favorites.filter((date) => date !== day.date) : [...state.favorites, day.date];
  const persisted = saveState();
  updateFilterControls();
  renderItinerary();
  const focus = $(".favorite-button") ?? $("#saved-filter");
  focus.focus({ preventScroll: true });
  announce(`${day.title}: ${wasSaved ? "aus der Merkliste entfernt" : "gemerkt"}${persisted ? "." : ", nur für diese Sitzung."}`);
}

function destroyMap(key) {
  const context = mapContexts.get(key);
  if (!context) return;
  context.cancelled = true;
  context.map?.remove();
  mapContexts.delete(key);
}

function mapIsVisible(context) {
  return context.element?.isConnected && context.element.getClientRects().length > 0
    && !context.element.closest("[hidden], details:not([open])");
}

function placeContent(point, showOnMap, mapLabel = "Auf Karte zeigen") {
  const content = element("div", "poi-content");
  content.append(element("p", "place-description", point.description));
  if (point.verificationNote) content.append(element("p", "place-verification", point.verificationNote));
  if (point.resource) content.append(resourceLinks([point.resource]));
  const actions = element("div", "place-actions");
  if (point.coordinates) {
    actions.append(
      button(mapLabel, "text-button", () => showOnMap(point.id)),
      linkWithStatus(`${point.name} in Google Maps`, googleMapsURL(point)),
    );
  } else actions.append(element("p", "link-caveat", "Für diesen Ort ist kein genauer Kartenpunkt bestätigt."));
  content.append(actions, foodRecommendation(point.id));
  return content;
}

function placeExplorer(points, key, headingText = "Die Orte dieses Tages", { showList = true, revealPlace } = {}) {
  destroyMap(key);
  const context = { map: null, pending: null, cancelled: false };
  mapContexts.set(key, context);
  const section = element("section", "place-explorer");
  context.element = section;
  section.id = `${key}-places`;
  const heading = element("h4", "places-heading", headingText);
  const mappedPoints = points.filter((point) => Array.isArray(point.coordinates));
  section.append(heading, element("p", "places-intro", showList
    ? "Eine Nummer antippen oder einen Ort für Details aufklappen."
    : "Alle Stopps gemeinsam. Die Nummern entsprechen dem Tagesablauf; sie sind keine berechnete Geh- oder Bahnroute."));
  const mapShell = element("div", "map-shell");
  const showAll = button("Alle Stopps zeigen", "text-button map-show-all", () => context.map.showAll());
  showAll.hidden = true;
  const placeholder = element("div", "map-placeholder");
  const message = element("p", "map-status");
  message.setAttribute("role", "status");
  const canvas = element("div", "place-map");
  canvas.id = `${key}-map`;
  canvas.setAttribute("role", "region");
  canvas.setAttribute("aria-label", `OpenStreetMap: ${headingText}`);
  canvas.hidden = true;
  const permission = element("p", "map-privacy", "Erst beim Laden werden IP- und Seitenadresse an OpenStreetMap übertragen. Keine Standortfreigabe und kein Kartenkonto erforderlich.");
  const load = button("OpenStreetMap-Karte laden", "button button-secondary", () => {
    mapsPermitted = true;
    enableMap();
  });
  placeholder.append(graphic("icon-pin"), element("p", "", "Alle bestätigten Punkte gemeinsam sehen."), load, permission);
  mapShell.append(placeholder, showAll, canvas, message);
  if (mappedPoints.length) section.append(mapShell);
  const popupFor = (point) => {
    const popup = element("div", "place-popup");
    popup.append(
      element("strong", "", `${point.number}. ${point.name}`),
      element("p", "", point.kind),
      externalLink(`${point.name} in Google Maps`, googleMapsURL(point)),
    );
    if (point.resource) popup.append(resourceLinks([point.resource]));
    if (revealPlace) popup.append(button("Details bei diesem Programmpunkt", "text-button", () => revealPlace(point.id)));
    return popup;
  };
  async function enableMap(focusId) {
    if (context.cancelled || !mapIsVisible(context)) return;
    if (context.map) {
      if (focusId) {
        context.map.focus(focusId);
        canvas.scrollIntoView({ block: "center" });
      }
      return;
    }
    if (!context.pending) {
      load.disabled = true;
      load.textContent = "Karte wird geladen …";
      message.textContent = "Die OpenStreetMap-Hintergrundkarte wird geladen.";
      canvas.hidden = false;
      context.pending = createPlaceMap(canvas, points, {
        popupFor,
        onStatus(text, error) {
          message.textContent = text;
          message.classList.toggle("map-error", error);
        },
      }).then((map) => {
        if (context.cancelled) {
          map?.remove();
          return null;
        }
        context.map = map;
        if (map) {
          placeholder.hidden = true;
          showAll.hidden = false;
        }
        return map;
      }).catch((error) => {
        console.error("The sightseeing map could not be displayed.", error);
        message.textContent = "Die Karte konnte nicht geladen werden. Versuche es erneut oder nutze die Ortsliste und Google-Maps-Links darunter.";
        message.classList.add("map-error");
        load.disabled = false;
        load.textContent = "Karte erneut laden";
        canvas.hidden = true;
        return null;
      }).finally(() => { context.pending = null; });
    }
    const map = await context.pending;
    if (focusId && map && !context.cancelled) {
      map.focus(focusId);
      canvas.scrollIntoView({ block: "center" });
    }
  }
  context.start = enableMap;
  context.focus = (id) => {
    mapsPermitted = true;
    return enableMap(id);
  };
  if (showList) {
    const list = element("ol", "place-list");
    for (const point of points) {
      const item = element("li", "place-item");
      item.id = `${key}-place-${point.id}`;
      const text = element("details", "place-item-content place-disclosure");
      text.name = `${key}-place-details`;
      const summary = element("summary");
      const title = element("h5", "", point.name);
      summary.append(title, element("p", "place-kind", `${point.kind} · ${point.suggestedTime}`), graphic("icon-chevron", "icon place-chevron"));
      text.append(summary, placeContent(point, context.focus));
      item.append(element("span", "place-number", point.number), text);
      list.append(item);
    }
    section.append(list);
  }
  if (mapsPermitted && mappedPoints.length) {
    requestAnimationFrame(() => {
      if (!context.cancelled && mapIsVisible(context)) enableMap();
    });
  }
  return section;
}

function openRailGuide() {
  setView("travel");
  const heading = $("#rail-guide-heading");
  heading.scrollIntoView({ block: "start" });
  heading.focus({ preventScroll: true });
}

function openBase(id) {
  selectedBase = bases.some((base) => base.id === id) ? id : "tokyo";
  renderBase();
  setView("bases");
  $("#planner").scrollIntoView({ block: "start" });
  $("#tab-bases").focus({ preventScroll: true });
}

function renderDayDetail(day, days) {
  destroyMap("day");
  const detail = $("#day-detail");
  detail.replaceChildren();
  if (!day) {
    detail.append(
      element("h3", "", filters.savedOnly ? "Deine Merkliste wartet noch." : "Hier ist gerade kein Reisetag."),
      element("p", "intro-copy", filters.savedOnly
        ? "Merke dir mit dem Stern die Tage, auf die du dich besonders freust. Oder entferne einen Suchfilter."
        : "Versuche einen anderen Suchbegriff oder zeige wieder alle Tage an."),
      button("Alle Tage anzeigen", "button button-secondary", resetFilters),
    );
    return;
  }
  const topline = element("div", "day-topline");
  const location = element("div", "day-location");
  const city = element("span", "destination-label");
  city.append(graphic("icon-pin"), document.createTextNode(destinationName(day.destination)));
  location.append(city, element("span", "day-index", `Tag ${trip.days.indexOf(day) + 1} von ${trip.days.length}`));
  const favorite = button("", "icon-button favorite-button", () => toggleFavorite(day));
  const saved = state.favorites.includes(day.date);
  favorite.setAttribute("aria-pressed", String(saved));
  favorite.setAttribute("aria-label", `${saved ? "Tag aus Merkliste entfernen" : "Tag merken"}: ${day.title}`);
  favorite.append(graphic("icon-star"));
  const headerActions = element("div", "day-header-actions");
  const navigation = element("div", "day-navigation");
  const index = days.indexOf(day);
  for (const direction of ["previous", "next"]) {
    const previous = direction === "previous";
    const adjacent = days[index + (previous ? -1 : 1)];
    const label = previous ? "Vorheriger Tag" : "Nächster Tag";
    const control = button("", "icon-button", () => chooseDay(adjacent, direction));
    control.setAttribute("aria-label", label);
    control.title = label;
    control.disabled = !adjacent;
    control.dataset.direction = direction;
    control.append(graphic("icon-chevron", previous ? "icon previous-icon" : "icon"));
    navigation.append(control);
  }
  headerActions.append(navigation, favorite);
  topline.append(location, headerActions);
  const title = element("h3", "", day.title);
  title.id = "day-title";
  title.tabIndex = -1;
  detail.append(topline, element("p", "day-date", formatDate(day.date)), title);
  const guide = dayGuides[day.date];
  const daySections = new Map();
  const dayTabs = element("div", "day-tabs");
  dayTabs.setAttribute("role", "tablist");
  dayTabs.setAttribute("aria-label", "Bereiche des ausgewählten Reisetags");
  const points = placesForDay(day.date);
  for (const [id, label] of [
    ["plan", "Tagesablauf"],
    ["transit", "Anfahrt & Tickets"], ["alternatives", "Alternativen"],
  ]) {
    const panel = element("div", "day-subpanel");
    panel.id = `day-panel-${id}`;
    panel.setAttribute("role", "tabpanel");
    panel.setAttribute("aria-labelledby", `day-tab-${id}`);
    panel.tabIndex = 0;
    const tab = button(label, "day-tab", () => selectSection(id));
    tab.id = `day-tab-${id}`;
    tab.setAttribute("role", "tab");
    tab.setAttribute("aria-controls", panel.id);
    tab.addEventListener("keydown", (event) => {
      const ids = [...daySections.keys()];
      const index = ids.indexOf(id);
      const target = { ArrowRight: ids[(index + 1) % ids.length], ArrowLeft: ids[(index + ids.length - 1) % ids.length], Home: ids[0], End: ids.at(-1) }[event.key];
      if (target) {
        event.preventDefault();
        selectSection(target);
        daySections.get(target).tab.focus();
      }
    });
    daySections.set(id, { tab, panel });
    dayTabs.append(tab);
  }
  function selectSection(id) {
    selectedDaySection = id;
    for (const [key, { tab, panel }] of daySections) {
      panel.hidden = key !== id;
      tab.setAttribute("aria-selected", String(key === id));
      tab.tabIndex = key === id ? 0 : -1;
    }
    const context = mapContexts.get("day");
    if (id === "plan" && dayMapOpen && context) {
      requestAnimationFrame(() => {
        if (!mapIsVisible(context)) return;
        context.map?.resize();
        if (mapsPermitted) context.start?.();
      });
    }
  }
  detail.append(dayTabs);
  const planPanel = daySections.get("plan").panel;
  const transitPanel = daySections.get("transit").panel;
  const alternativesPanel = daySections.get("alternatives").panel;
  alternativesPanel.append(element("p", "alternatives-intro", "Wenn ihr schneller fertig seid oder Lust auf etwas anderes habt: Diese Ideen ersetzen einen Programmpunkt oder füllen freie Zeit – kein zusätzliches Pflichtprogramm."));
  for (const option of alternatives[day.date] ?? []) {
    const block = element("details", "alternative-option");
    block.append(element("summary", "", option.title), element("p", "alternative-when", option.when), element("p", "", option.text));
    for (const id of option.places) {
      block.append(linkWithStatus(`${places[id].name} in Google Maps`, googleMapsURL(places[id])), resourceLinks([places[id].resource]));
    }
    alternativesPanel.append(block);
  }
  if (guide) {
    planPanel.append(element("p", "day-summary", guide.summary));
    let overview;
    const revealPlace = (id) => {
      selectSection("plan");
      const target = $(`#day-place-${id}`);
      target.open = true;
      target.scrollIntoView({ block: "start" });
      $("summary", target).focus({ preventScroll: true });
    };
    if (points.length) {
      overview = element("details", "day-map-overview");
      overview.open = dayMapOpen;
      const summary = element("summary");
      summary.append(graphic("icon-pin"), document.createTextNode(`Tageskarte · alle ${points.length} Orte`), graphic("icon-chevron", "icon day-map-chevron"));
      overview.append(summary, placeExplorer(points, "day", "Der ganze Tag auf einer Karte", { showList: false, revealPlace }));
      overview.addEventListener("toggle", () => {
        if (!overview.isConnected) return;
        dayMapOpen = overview.open;
        if (overview.open) {
          const context = mapContexts.get("day");
          context.map?.resize();
          if (mapsPermitted) context.start();
        }
      });
      planPanel.append(overview);
    }
    const showOnMap = (id) => {
      overview.open = true;
      dayMapOpen = true;
      mapContexts.get("day").focus(id);
    };
    const agenda = element("ol", "day-agenda");
    for (const { step, placeId, showContext, number } of entriesForDay(day.date)) {
      const item = element("li");
      const disclosure = element("details", "agenda-disclosure");
      disclosure.name = "day-agenda-points";
      const point = placeId ? points.find((point) => point.id === placeId) : null;
      if (point) {
        disclosure.id = `day-place-${point.id}`;
        disclosure.dataset.place = point.id;
      }
      const summary = element("summary");
      const heading = element("span", "agenda-heading");
      heading.append(element("span", "agenda-time", step.time), element("h4", "", point ? point.name : step.title));
      summary.append(element("span", "agenda-number", number), heading, graphic("icon-chevron", "icon agenda-chevron"));
      const body = element("div", "agenda-body");
      if (showContext) body.append(element("p", "agenda-context", step.text));
      if (point) {
        body.append(
          element("p", "place-kind", `${point.kind} · ${point.suggestedTime}`),
          placeContent(point, showOnMap, "Auf Tageskarte zeigen"),
        );
      }
      disclosure.append(summary, body);
      item.append(disclosure);
      agenda.append(item);
    }
    planPanel.append(element("p", "agenda-help", "Programmpunkte aufklappen, um alle Details zu lesen."), agenda);
    if (guide.correction) {
      const correction = element("div", "planning-correction");
      correction.append(element("h4", "", "Gut zu wissen"), element("p", "", guide.correction));
      planPanel.append(correction);
    }
    if (guide.booking) {
      const booking = element("details", "day-booking-note");
      booking.append(element("summary", "", "Vorher klären oder buchen"), element("p", "", guide.booking));
      planPanel.append(booking);
    }
    if (guide.tip) planPanel.append(element("p", "day-tip", guide.tip));
    if (guide.resources?.length) planPanel.append(resourceLinks(guide.resources));
    const transit = element("div", "transport-box");
    const transitHeading = element("h4");
    transitHeading.append(graphic("icon-train"), document.createTextNode(guide.transit.title));
    const steps = element("ol", "transit-steps");
    for (const step of guide.transit.steps) steps.append(element("li", "", step));
    transit.append(
      transitHeading, steps,
      element("h4", "ticket-heading", "Welches Ticket, wo kaufen?"),
      element("p", "", guide.transit.ticket),
      button("Was ist JR? Bahn-ABC & Ticketkauf", "text-button", openRailGuide),
    );
    transitPanel.append(transit);
    if (day.destination !== "reise") planPanel.append(button(`Einkaufen bei unserer Basis in ${destinationName(day.destination)}`, "button button-secondary base-shortcut", () => openBase(day.destination)));
  }
  if (day.base !== "Anreise" && day.base !== "Rückreise") {
    const base = element("details", "base-note");
    base.append(element("summary", "", "Unsere Basis & Bahnhöfe"), element("p", "", day.base));
    transitPanel.append(base);
  }
  for (const { panel } of daySections.values()) detail.append(panel);
  selectSection(selectedDaySection);
}

function renderItinerary() {
  const days = filterDays(trip.days, filters, state.favorites);
  if (!days.some((day) => day.date === selectedDate) && days.length) {
    selectedDate = days[0].date;
    selectedDaySection = "plan";
  }
  renderDayList(days);
  renderDayDetail(days.find((day) => day.date === selectedDate), days);
  writeLocation();
}

function renderTravel() {
  const container = $("#travel-content");
  const railSection = element("section", "rail-guide");
  const railHeading = element("h3", "", "Bahnfahren ohne Vorwissen");
  railHeading.id = "rail-guide-heading";
  railHeading.tabIndex = -1;
  railSection.append(railHeading, element("p", "intro-copy", "Erst das Grundprinzip, dann die konkrete Anfahrt. Die Schrittfolge für jeden Ausflug steht zusätzlich bei seinem Reisetag."));
  for (const item of railGuide) {
    const block = element("details", "rail-guide-item");
    block.open = railGuide.indexOf(item) < 2;
    block.append(element("summary", "", item.title), element("p", "", item.text));
    if (item.resources) block.append(resourceLinks(item.resources));
    railSection.append(block);
  }
  container.append(railSection, element("h3", "content-subheading", "Die geplanten Flüge"));
  container.append(element("p", "intro-copy", "Hinflug über Hanoi nach Tokyo-Haneda, Weiterflug von Osaka nach Da Nang, Rückflug über Saigon nach Frankfurt. Die Osaka-Direktstrecke ist offiziell angekündigt; den konkreten Flug für den 20. Juli bei der Airline prüfen."));
  const flights = element("div", "flight-list");
  for (const flight of trip.flights) {
    const card = element("article", "flight-card");
    const content = element("div");
    content.append(
      element("h3", "", flight.route),
      element("p", "", flight === trip.flights[1]
        ? "Der alte lastminute-Buchungslink zeigt die ausgewählte Reise weiterhin als nicht verfügbar. Das bedeutet nicht, dass es keine Direktstrecke gibt: Kansai Airports kündigt VietJet Osaka–Da Nang ab 20. Dezember 2026 mit vier Hin- und Rückflügen pro Woche an. Verfügbarkeit und Flugzeiten für Dienstag, 20. Juli 2027, sind damit noch nicht bestätigt."
        : flight.details),
      element("span", "carrier-note", flight === trip.flights[1] ? "VietJet · Direktstrecke angekündigt" : flight.carrier),
    );
    if (flight.links.length) content.append(bookingLinks(flight.links));
    if (flight === trip.flights[1]) content.append(resourceLinks(["kansaiDaNang"]));
    card.append(element("p", "flight-date", flight.date), content);
    flights.append(card);
  }
  container.append(flights);
}

function renderStays() {
  const container = $("#stays-content");
  container.append(
    element("p", "intro-copy stays-intro", "Ferienwohnungen und Apartments mit Platz für die Familie. Die passende Zimmerkategorie direkt beim Anbieter wählen."),
    element("p", "base-note", accommodationTransportNote),
  );
  for (const city of trip.accommodations) {
    const group = element("fieldset", "stay-city");
    group.append(element("legend", "", city.city), element("p", "stay-city-dates", city.nights));
    for (const option of city.options) {
      const row = element("div", "stay-option");
      const input = element("input");
      input.type = "radio";
      input.name = `stay-${city.id}`;
      input.value = option.id;
      input.id = `stay-${option.id}`;
      input.checked = state.stays[city.id] === option.id;
      const content = element("div");
      const label = element("label", "", option.name);
      label.htmlFor = input.id;
      const description = element("details", "stay-description");
      description.open = input.checked;
      description.append(
        element("summary", "", "Details & Buchungslinks"),
        element("p", "", option.id === "kyoto-2"
          ? "Erneut für 11.–15. Juli 2027 geprüft: Die buchbaren Standard-Apartments zeigen nur ein Schlafzimmer. Die „Suite, 2 Schlafzimmer“ ist als ausgebucht markiert; ihre Detailzeile nennt widersprüchlich „1 Schlafzimmer“. Zwei getrennte Schlafzimmer sind für eure Daten damit nicht bestätigt."
          : option.id === "osaka-1"
            ? "Erneut für 15.–20. Juli 2027 geprüft: Booking bietet ein „Apartment mit 1 Schlafzimmer“ an. Bei Expedia ist die Standardwohnung ebenfalls mit einem Schlafzimmer gelistet; die als „2 Schlafzimmer“ bezeichnete Balkon-Suite ist ausgebucht. Zwei Doppelbetten sind nicht zwei getrennte Schlafzimmer."
            : option.description),
        bookingLinks(option.links),
      );
      content.append(label, description);
      input.addEventListener("change", () => {
        state.stays[city.id] = option.id;
        description.open = true;
        const persisted = saveState();
        announce(`${city.city}: Unterkunft ausgewählt${persisted ? "." : ", nur für diese Sitzung."}`);
      });
      row.append(input, content);
      group.append(row);
    }
    container.append(group);
  }
  const beach = element("div", "beach-stay");
  beach.append(element("h3", "", "Und dann: elf Nächte am Meer."));
  beach.append(
    element("p", "", places.robinson.description),
    element("p", "", bases.find((base) => base.id === "vietnam").firstShop),
    resourceLinks(["robinson"]),
  );
  container.append(beach);
}

function renderBase() {
  const base = bases.find((item) => item.id === selectedBase);
  const container = $("#bases-content");
  destroyMap("base");
  container.replaceChildren(
    element("h3", "base-heading", base.title),
    element("p", "intro-copy", base.description),
    element("p", "base-practical", base.practical),
  );
  const firstShop = element("div", "base-first-shop");
  firstShop.append(element("h4", "", "Was besorgen wir als Erstes?"), element("p", "", base.firstShop));
  container.append(firstShop);
  if (base.resources) container.append(resourceLinks(base.resources));
  container.append(placeExplorer(base.shopping.map((id, index) => ({ id, number: index + 1, ...places[id] })), "base", "Einkaufs- und Orientierungspunkte"));
  for (const control of document.querySelectorAll("[data-base]")) {
    control.setAttribute("aria-pressed", String(control.dataset.base === selectedBase));
  }
}

function renderBases() {
  for (const base of bases) {
    const control = button(destinationName(base.id), "filter-button", () => {
      selectedBase = base.id;
      renderBase();
    });
    control.dataset.base = base.id;
    $("#base-filters").append(control);
  }
  renderBase();
}

function updateChecklistProgress() {
  const count = state.completed.length;
  $("#checklist-progress-text").textContent = `${count} von ${trip.checklist.length} erledigt`;
  $("#tab-check-count").textContent = `${count}/${trip.checklist.length}`;
  $("#checklist-progress").value = count;
  $("#checklist-progress").max = trip.checklist.length;
  $("#checklist-cheer").textContent = count === trip.checklist.length ? "Alles vorbereitet. Das Abenteuer kann kommen!" : "Schritt für Schritt wird die Reise startklar.";
}

function renderChecklist() {
  const destinationsForTask = { "task-0": "travel", "task-1": "stays", "task-4": "itinerary" };
  const labelsForTask = { "task-0": "Zu den Flügen", "task-1": "Unterkünfte ansehen", "task-4": "Die Parktage im Reiseplan" };
  for (const task of trip.checklist) {
    const row = element("div", "check-row");
    const input = element("input");
    Object.assign(input, { type: "checkbox", id: task.id, checked: state.completed.includes(task.id) });
    const copy = element("div");
    const label = element("label", "check-title", task.title);
    label.htmlFor = input.id;
    copy.append(label, element("p", "", task.details));
    if (destinationsForTask[task.id]) {
      const link = element("a", "check-link", labelsForTask[task.id]);
      link.href = `#view=${destinationsForTask[task.id]}&day=${selectedDate}`;
      link.addEventListener("click", (event) => {
        event.preventDefault();
        setView(destinationsForTask[task.id]);
        $("#planner").scrollIntoView({ block: "start" });
        $(`#tab-${currentView}`).focus({ preventScroll: true });
      });
      copy.append(link);
    }
    input.addEventListener("change", () => {
      state.completed = input.checked ? [...state.completed, task.id] : state.completed.filter((id) => id !== task.id);
      const persisted = saveState();
      updateChecklistProgress();
      announce(`${state.completed.length} von ${trip.checklist.length} erledigt${persisted ? "." : ", nur für diese Sitzung gespeichert."}`);
    });
    row.append(input, copy, element("span", "check-deadline", task.deadline));
    $("#checklist-items").append(row);
  }
  updateChecklistProgress();
}

function downloadCalendar() {
  const blob = new Blob([buildCalendar(trip)], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = element("a");
  link.href = url;
  link.download = "japan-vietnam-2027.ics";
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  announce("Kalenderdatei mit allen 30 Reisetagen erstellt. Die ganztägigen Einträge können in deine Kalender-App importiert werden.");
}

function bindEvents() {
  $("#day-search").addEventListener("input", (event) => {
    filters.query = event.target.value;
    renderItinerary();
  });
  $("#saved-filter").addEventListener("click", () => {
    filters.savedOnly = !filters.savedOnly;
    updateFilterControls();
    renderItinerary();
  });
  $("#dismiss-notice").addEventListener("click", () => { $("#storage-notice").hidden = true; });
  $("#theme-toggle").addEventListener("click", () => {
    state.theme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = state.theme;
    updateTheme();
    saveState();
  });
  matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (event) => {
    if (!state.theme && !new URLSearchParams(location.search).has("clawpilotTheme")) {
      document.documentElement.dataset.theme = event.matches ? "dark" : "light";
      updateTheme();
    }
  });
  for (const tab of document.querySelectorAll('.planner-tabs [role="tab"]')) {
    tab.addEventListener("click", () => setView(tab.dataset.view));
    tab.addEventListener("keydown", (event) => {
      const index = views.indexOf(tab.dataset.view);
      const target = { ArrowRight: views[(index + 1) % views.length], ArrowLeft: views[(index + views.length - 1) % views.length], Home: views[0], End: views.at(-1) }[event.key];
      if (target) {
        event.preventDefault();
        setView(target);
        $(`#tab-${target}`).focus();
      }
    });
  }
  for (const control of document.querySelectorAll(".calendar-download")) control.addEventListener("click", downloadCalendar);
  window.addEventListener("hashchange", () => {
    readLocation();
    if (location.hash !== "#planner") resetFilters();
    revealSelectedDay();
  });
}

function initialize() {
  loadState();
  applyPreferredTheme();
  readLocation();
  $("#countdown").textContent = countdown(trip.startDate, trip.endDate);
  renderRouteControls();
  renderTravel();
  renderStays();
  renderBases();
  renderChecklist();
  renderItinerary();
  bindEvents();
  $("#startup-notice").hidden = true;
  revealSelectedDay();
}

try {
  initialize();
} catch (error) {
  console.error("The itinerary could not be initialized.", error);
  const notice = $("#startup-notice");
  notice.hidden = false;
  notice.setAttribute("role", "alert");
  notice.textContent = "Der Reiseplan konnte nicht vollständig geladen werden. Bitte die Seite neu laden. Deine gespeicherten Planungsdaten werden dabei nicht gelöscht.";
}
