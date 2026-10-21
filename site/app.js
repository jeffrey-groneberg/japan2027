import { trip } from "./trip-data.js";
import {
  STORAGE_KEY, buildCalendar, countdown, defaultState, destinationName,
  destinations, festivalMapsURL, festivalsForDay, filterDays, filterDining, formatDate, parseState, googleMapsURL,
} from "./lib.js?v=f3b2c04";
import { bases, dayGuides, places, railGuide, resources } from "./guide-data.js";
import { createPlaceMap } from "./map.js";
import { linkAudit } from "./link-audit.js";
import { foodByPlace, foodMapsURL, foodStops } from "./extras.js";
import { placeFigure, placeThumbnail } from "./poi-visuals.js";
import { diningBookingLabels, diningCategoryLabels, diningOptions } from "./dining-data.js";
import { festivalOptions, festivalStatusLabels, fireworksContext } from "./festival-data.js";
import { buildDayLanes, formatLaneTime } from "./lane-data.js";

const $ = (selector, root = document) => root.querySelector(selector);
const views = ["home", "itinerary", "travel", "stays", "bases", "dining", "festivals", "checklist"];
const mobileItineraryQuery = matchMedia("(max-width: 600px)");
const reducedMotionQuery = matchMedia("(prefers-reduced-motion: reduce)");
const accommodationTransportNote = "Die Anfahrten im Tagesplan beziehen sich weiterhin auf die ursprünglichen Hauptunterkünfte; eine andere Auswahl ändert sie nicht automatisch.";
const mapContexts = new Map();
const transientAnimations = new Map();
let mapsPermitted = false;
let selectedBase = "tokyo";
let selectedDaySection = "plan";
let selectedLaneBlock = null;
let state = defaultState(trip);
let currentView = "home";
let selectedDate = trip.startDate;
let mobileDayOpen = false;
let mobileItemOpen = false;
let focusDayListAfterNavigation = false;
let focusLaneBlockAfterNavigation = false;
let mobileLaneScrollTop = 0;
let mobileLaneFitFrame;
let homeFitFrame;
let filters = { destination: "all", query: "", savedOnly: false };
const diningFilters = { destination: "all", category: "all", spontaneous: false };

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

function playMotion(node, keyframes, options) {
  if (!node?.animate || reducedMotionQuery.matches) return;
  transientAnimations.get(node)?.cancel();
  const animation = node.animate(keyframes, options);
  transientAnimations.set(node, animation);
  const release = () => {
    if (transientAnimations.get(node) === animation) transientAnimations.delete(node);
  };
  animation.addEventListener("finish", release, { once: true });
  animation.addEventListener("cancel", release, { once: true });
}

function bindMotion() {
  const heroArt = $(".hero-art");
  if (!heroArt) return;
  let visible = true;
  const sync = () => heroArt.classList.toggle("motion-active", visible && !document.hidden && !reducedMotionQuery.matches);
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) heroArt.classList.add("motion-entered");
      sync();
    }, { threshold: 0.12 });
    observer.observe(heroArt);
  } else {
    heroArt.classList.add("motion-entered");
    sync();
  }
  document.addEventListener("visibilitychange", sync);
  reducedMotionQuery.addEventListener("change", () => {
    if (reducedMotionQuery.matches) {
      for (const animation of transientAnimations.values()) animation.cancel();
      transientAnimations.clear();
    }
    sync();
  });
}

function bindRouteTrainMotion() {
  const scene = $(".route-train-scene");
  if (!scene) return;
  let visible = false;
  let pointer = 0;
  let frame;
  const active = () => visible && !document.hidden && !reducedMotionQuery.matches;
  const update = () => {
    if (!active()) return;
    const rect = scene.getBoundingClientRect();
    const progress = Math.max(-1, Math.min(1, (innerHeight / 2 - rect.top - rect.height / 2) / innerHeight));
    const offset = progress * 12 + pointer * 8;
    scene.style.setProperty("--train-landscape-x", `${-offset}px`);
  };
  const schedule = () => {
    if (!active()) return;
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(update);
  };
  const sync = () => {
    scene.classList.toggle("motion-active", active());
    if (active()) schedule();
    else {
      cancelAnimationFrame(frame);
      scene.style.removeProperty("--train-landscape-x");
    }
  };
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    });
    observer.observe(scene);
  } else {
    visible = true;
    sync();
  }
  scene.addEventListener("pointermove", (event) => {
    const rect = scene.getBoundingClientRect();
    pointer = Math.max(-1, Math.min(1, (event.clientX - rect.left) / rect.width * 2 - 1));
    schedule();
  }, { passive: true });
  scene.addEventListener("pointerleave", () => { pointer = 0; schedule(); });
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule);
  document.addEventListener("visibilitychange", sync);
  reducedMotionQuery.addEventListener("change", sync);
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
  section.append(culinaryLinks(food));
  return section;
}

function culinaryLinks(food) {
  const links = element("div", "food-links");
  links.append(linkWithStatus("Offizielle Infos", food.url), linkWithStatus(`${food.name} in Google Maps`, foodMapsURL(food)));
  return links;
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

function writeLocation(mode = "replace", statePatch = {}) {
  const hash = new URLSearchParams({ view: currentView });
  if (currentView !== "home" && (currentView !== "itinerary" || !mobileItineraryQuery.matches || mobileDayOpen)) hash.set("day", selectedDate);
  if (currentView === "itinerary" && mobileItineraryQuery.matches && mobileDayOpen) {
    hash.set("screen", mobileItemOpen ? "item" : "day");
    if (mobileItemOpen && selectedLaneBlock) hash.set("item", selectedLaneBlock);
  }
  const nextState = {
    ...(history.state ?? {}),
    ...statePatch,
    plannerScreen: currentView === "itinerary" && mobileItineraryQuery.matches
      ? (mobileItemOpen ? "item" : mobileDayOpen ? "day" : "list")
      : null,
  };
  if (!mobileItemOpen) nextState.mobileItemEntry = false;
  if (!mobileDayOpen) nextState.mobileDayEntry = false;
  history[mode === "push" ? "pushState" : "replaceState"](nextState, "", `${location.pathname}${location.search}#${hash}`);
}

function syncMobileDayView() {
  const mobileItinerary = mobileItineraryQuery.matches && currentView === "itinerary";
  for (const root of [document.documentElement, document.body]) {
    root.classList.toggle("mobile-day-view", mobileItinerary && mobileDayOpen);
    root.classList.toggle("mobile-item-view", mobileItinerary && mobileItemOpen);
  }
}

function toggleMobileMenu(open, restoreFocus = false) {
  const nav = $(".planner-nav");
  const closing = !open && (nav.classList.contains("menu-open") || nav.classList.contains("menu-closing"))
    && mobileItineraryQuery.matches && !reducedMotionQuery.matches;
  nav.classList.toggle("menu-closing", closing);
  nav.classList.toggle("menu-open", open);
  $("#mobile-menu-toggle").setAttribute("aria-expanded", String(open));
  if (restoreFocus) $("#mobile-menu-toggle").focus({ preventScroll: true });
}

function toggleOverflowMenu(open, restoreFocus = false) {
  $("#nav-overflow").hidden = !open;
  $("#nav-more").setAttribute("aria-expanded", String(open));
  if (restoreFocus) $("#nav-more").focus({ preventScroll: true });
}

function fitPlannerNavigation() {
  const rail = $(".planner-tabs");
  const tabs = views.map((view) => $(`#tab-${view}`));
  const more = $("#nav-more");
  const overflow = $("#nav-overflow");
  const focusedView = document.activeElement?.dataset.view;
  const focusWasInMenu = overflow.contains(document.activeElement);
  const focusWasOnMore = document.activeElement === more;
  for (const tab of tabs) {
    tab.hidden = false;
    tab.tabIndex = tab.getAttribute("aria-selected") === "true" ? 0 : -1;
  }
  more.hidden = true;
  overflow.replaceChildren();
  if (mobileItineraryQuery.matches) {
    toggleOverflowMenu(false);
    if (focusWasOnMore || focusWasInMenu) $("#mobile-menu-toggle").focus({ preventScroll: true });
    return;
  }
  const gap = Number.parseFloat(getComputedStyle(rail).columnGap) || 0;
  const widths = tabs.map((tab) => tab.getBoundingClientRect().width);
  const total = widths.reduce((sum, width) => sum + width, 0) + gap * (tabs.length - 1);
  let visibleCount = tabs.length;
  if (total > rail.clientWidth) {
    more.hidden = false;
    const available = rail.clientWidth;
    let used = 0;
    visibleCount = 0;
    for (const width of widths) {
      const next = used + (visibleCount ? gap : 0) + width;
      if (next > available) break;
      used = next;
      visibleCount += 1;
    }
    tabs.forEach((tab, index) => {
      tab.hidden = index >= visibleCount;
      if (!tab.hidden) return;
      const option = button(tab.textContent.trim(), "nav-overflow-option", () => {
        activatePlannerView(tab.dataset.view);
        focusActiveNavigation();
      });
      option.dataset.view = tab.dataset.view;
      option.setAttribute("aria-pressed", tab.getAttribute("aria-selected"));
      overflow.append(option);
    });
  } else toggleOverflowMenu(false);
  const activeHidden = $(`#tab-${currentView}`).hidden;
  more.classList.toggle("nav-more-selected", activeHidden);
  more.setAttribute("aria-label", activeHidden ? `Mehr · ${$(`#tab-${currentView}`).textContent.trim()}` : "Mehr");
  if (activeHidden && visibleCount) tabs[0].tabIndex = 0;
  if (focusedView && $(`#tab-${focusedView}`)?.hidden) more.focus({ preventScroll: true });
  else if (focusWasInMenu && focusedView) $(`#tab-${focusedView}`)?.focus({ preventScroll: true });
  else if (focusWasOnMore && more.hidden) $(`#tab-${currentView}`).focus({ preventScroll: true });
}

function focusActiveNavigation() {
  const tab = $(`#tab-${currentView}`);
  const control = mobileItineraryQuery.matches ? $("#mobile-menu-toggle") : tab.hidden ? $("#nav-more") : tab;
  control.focus({ preventScroll: true });
}

function fitHomeViewport() {
  cancelAnimationFrame(homeFitFrame);
  homeFitFrame = requestAnimationFrame(() => {
    if (currentView !== "home") return;
    const home = $("#panel-home");
    const height = window.visualViewport?.height ?? innerHeight;
    document.body.classList.toggle("home-tiny", height <= 500);
    home.dataset.layout = height <= 500 ? "tiny" : height <= 820 ? "short" : height <= 1000 ? "compact" : "full";
    home.style.setProperty("--home-height", `${Math.max(0, Math.floor(height - home.offsetTop - 8))}px`);
  });
}

function setView(view, updateLocation = true) {
  currentView = view;
  document.body.classList.toggle("home-view", view === "home");
  syncMobileDayView();
  for (const id of views) {
    const selected = id === view;
    const tab = $(`#tab-${id}`);
    tab.setAttribute("aria-selected", String(selected));
    tab.tabIndex = selected ? 0 : -1;
    $(`#panel-${id}`).hidden = !selected;
  }
  toggleOverflowMenu(false);
  fitPlannerNavigation();
  fitHomeViewport();
  document.title = `${$(`#tab-${view}`).textContent.trim()} · Japan & Vietnam 2027`;
  $("#mobile-menu-label").textContent = `Menü · ${$(`#tab-${view}`).textContent.trim()}`;
  toggleMobileMenu(false);
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

function activatePlannerView(view) {
  if (view === "itinerary" && mobileItineraryQuery.matches) {
    mobileDayOpen = false;
    mobileItemOpen = false;
    setView(view, false);
    renderItinerary();
    $("#panel-itinerary").scrollIntoView({ block: "start" });
    toggleMobileMenu(false, true);
    return;
  }
  setView(view);
  if (mobileItineraryQuery.matches) toggleMobileMenu(false, true);
}

function readLocation() {
  if (location.hash === "#planner") {
    mobileDayOpen = false;
    mobileItemOpen = false;
    setView("itinerary", false);
    return;
  }
  const params = new URLSearchParams(location.hash.slice(1));
  const requestedView = params.get("view");
  const requestedDate = params.get("day");
  const requestedScreen = params.get("screen");
  const requestedItem = params.get("item");
  const resolvedView = views.includes(requestedView) ? requestedView : (requestedView || requestedDate ? "itinerary" : "home");
  if (requestedDate) {
    if (trip.days.some((day) => day.date === requestedDate)) selectedDate = requestedDate;
    else {
      selectedDate = trip.startDate;
      announce("Dieser Reisetag ist nicht im Plan. Der erste Reisetag wird angezeigt.");
    }
  }
  const itemExists = Boolean(requestedItem)
    && buildDayLanes(selectedDate).lanes.some((lane) => lane.blocks.some((block) => block.key === requestedItem));
  mobileItemOpen = resolvedView === "itinerary"
    && mobileItineraryQuery.matches
    && requestedScreen === "item"
    && itemExists;
  mobileDayOpen = resolvedView === "itinerary"
    && requestedScreen !== "list"
    && (requestedScreen === "day" || requestedScreen === "item" || Boolean(requestedDate));
  if (itemExists) selectedLaneBlock = requestedItem;
  else if (requestedScreen === "item" && requestedItem && !itemExists) {
    selectedLaneBlock = null;
    announce("Dieser Routenpunkt ist nicht im Tagesplan. Die Tagesroute wird angezeigt.");
  }
  if (requestedView && !views.includes(requestedView)) {
    announce("Dieser Bereich ist nicht im Reiseplan. Die Tagesplanung wird angezeigt.");
  }
  setView(resolvedView, false);
}

function resetFilters() {
  filters = { destination: "all", query: "", savedOnly: false };
  $("#day-search").value = "";
  updateFilterControls();
  renderItinerary();
}

function selectDestination(id) {
  filters = { destination: id, query: "", savedOnly: false };
  mobileDayOpen = false;
  mobileItemOpen = false;
  $("#day-search").value = "";
  updateFilterControls();
  setView("itinerary");
  renderItinerary();
  $("#planner").scrollIntoView({ block: "start" });
}

function renderRouteControls() {
  const route = $("#route-stops");
  destinations.forEach((destination, index) => {
    const stop = button("", "route-stop", () => {
      if (!state.trainHintDismissed) {
        state.trainHintDismissed = true;
        $("#train-cta").setAttribute("hidden", "");
        saveState();
      }
      selectDestination(destination.id);
    });
    stop.dataset.destination = destination.id;
    stop.setAttribute("aria-pressed", "false");
    stop.setAttribute("aria-label", `${destination.name}, ${destination.dates}, ${destination.nights} Nächte: Tagesplan anzeigen`);
    const copy = element("span", "stop-copy");
    const heading = element("span", "stop-heading");
    const japanese = element("span", "stop-japanese", destination.japanese);
    japanese.lang = "ja";
    heading.append(
      element("span", "stop-name", destination.id === "vietnam" ? "Da Nang" : destination.name),
      japanese,
    );
    copy.append(
      heading,
      element("span", "stop-dates", destination.dates),
      element("span", "stop-nights", `${destination.nights} Nächte · ${destination.country}`),
    );
    const target = element("span", "stop-target");
    target.append(copy, graphic(destination.symbol, "stop-art", "0 0 200 140"));
    if (index === 0) {
      const hint = graphic("icon-curved-arrow", "train-hint-arrow", "0 0 64 56");
      hint.id = "train-cta";
      hint.toggleAttribute("hidden", state.trainHintDismissed);
      target.append(hint);
    }
    stop.append(
      element("span", "stop-number", index + 1),
      target,
    );
    const window = element("span", "carriage-window");
    window.setAttribute("aria-hidden", "true");
    stop.append(window);
    const wheels = element("span", "train-wheels");
    wheels.setAttribute("aria-hidden", "true");
    stop.append(wheels);
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

function scrollIntoViewImmediately(node) {
  const root = document.documentElement;
  const previousBehavior = root.style.scrollBehavior;
  root.style.scrollBehavior = "auto";
  node.scrollIntoView({ block: "start" });
  root.style.scrollBehavior = previousBehavior;
}

function scrollMobileScreenToTop() {
  const root = document.documentElement;
  const previousBehavior = root.style.scrollBehavior;
  root.style.scrollBehavior = "auto";
  window.scrollTo(0, 0);
  root.style.scrollBehavior = previousBehavior;
}

function focusMobileDayList() {
  requestAnimationFrame(() => {
    scrollIntoViewImmediately($("#panel-itinerary"));
    const selected = $(`[data-date="${selectedDate}"]`, $("#day-list"));
    selected?.focus({ preventScroll: true });
    revealSelectedDay();
  });
}

function fitMobileLaneBoard() {
  cancelAnimationFrame(mobileLaneFitFrame);
  mobileLaneFitFrame = requestAnimationFrame(() => {
    if (!mobileItineraryQuery.matches || !mobileDayOpen || mobileItemOpen || currentView !== "itinerary") return;
    const board = $(".lane-board-scroll", $("#day-detail"));
    if (!board?.getClientRects().length) return;
    const viewport = window.visualViewport;
    const viewportHeight = viewport?.height ?? innerHeight;
    const viewportTop = viewport?.offsetTop ?? 0;
    const boardRect = board.getBoundingClientRect();
    const boardTop = Math.max(0, boardRect.top - viewportTop);
    const availableHeight = Math.max(240, Math.floor(viewportHeight - boardTop - 12));
    const axis = $(".lane-time-axis", board);
    const axisRight = axis?.getBoundingClientRect().right ?? boardRect.left + 44;
    const laneWidth = Math.max(160, Math.floor(board.clientWidth - (axisRight - boardRect.left)));
    board.style.setProperty("--lane-available-height", `${availableHeight}px`);
    $(".lane-board", board)?.style.setProperty("--lane-mobile-width", `${laneWidth}px`);
  });
}

function positionMobileDayScreen(focusBack = false) {
  requestAnimationFrame(() => {
    scrollMobileScreenToTop();
    if (focusBack) $(".mobile-day-back", $("#day-detail"))?.focus({ preventScroll: true });
    requestAnimationFrame(() => {
      scrollMobileScreenToTop();
      fitMobileLaneBoard();
    });
  });
}

function focusSelectedLaneBlock() {
  if (!selectedLaneBlock) return;
  requestAnimationFrame(() => {
    const control = $(`[data-lane-block="${CSS.escape(selectedLaneBlock)}"]`, $("#day-detail"));
    control?.focus({ preventScroll: true });
  });
}

function positionMobileItemScreen(focusDetail = false) {
  requestAnimationFrame(() => {
    scrollMobileScreenToTop();
    if (focusDetail) $("#lane-detail")?.focus({ preventScroll: true });
    requestAnimationFrame(scrollMobileScreenToTop);
  });
}

function showMobileLaneView() {
  if (!mobileItineraryQuery.matches) return;
  if (history.state?.mobileItemEntry) {
    focusLaneBlockAfterNavigation = true;
    history.back();
    return;
  }
  mobileItemOpen = false;
  renderItinerary(false);
  writeLocation();
  positionMobileDayScreen();
  focusSelectedLaneBlock();
  announce("Tagesroute");
}

function showMobileDayList() {
  if (!mobileItineraryQuery.matches) return;
  if (history.state?.mobileDayEntry) {
    focusDayListAfterNavigation = true;
    history.back();
    return;
  }
  mobileDayOpen = false;
  mobileItemOpen = false;
  renderItinerary(false);
  writeLocation();
  focusMobileDayList();
  announce("Alle Reisetage");
}

function chooseDay(day, focusTarget = "list") {
  selectedDate = day.date;
  selectedDaySection = "plan";
  selectedLaneBlock = null;
  mobileItemOpen = false;
  mobileLaneScrollTop = 0;
  const opensMobileDay = mobileItineraryQuery.matches && focusTarget === "list";
  if (opensMobileDay) mobileDayOpen = true;
  renderItinerary(false);
  writeLocation(opensMobileDay ? "push" : "replace", opensMobileDay ? { mobileDayEntry: true } : {});
  if (opensMobileDay) {
    positionMobileDayScreen(true);
  } else if (focusTarget === "list") $(`[data-date="${day.date}"]`, $("#day-list"))?.focus({ preventScroll: true });
  else {
    const nextFocus = $(`.day-navigation [data-direction="${focusTarget}"]:not(:disabled)`) ?? $("#day-title");
    nextFocus.focus({ preventScroll: true });
  }
  revealSelectedDay();
  const detail = $("#day-detail");
  if (!opensMobileDay && (detail.getBoundingClientRect().top < 74 || mobileItineraryQuery.matches)) {
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
    option.dataset.dayDestination = day.destination;
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

function placeContent(point, showOnMap, mapLabel = "Auf Karte zeigen", introduction, mapTarget = point.id) {
  const content = element("div", "poi-content");
  content.append(placeFigure(point, linkWithStatus));
  if (introduction) content.append(element("p", "agenda-context", introduction));
  content.append(element("p", "place-description", point.description));
  if (point.verificationNote) content.append(element("p", "place-verification", point.verificationNote));
  if (point.resource) content.append(resourceLinks([point.resource]));
  const actions = element("div", "place-actions");
  if (point.coordinates) {
    if (showOnMap) actions.append(button(mapLabel, "text-button", () => showOnMap(mapTarget)));
    actions.append(linkWithStatus(`${point.name} in Google Maps`, googleMapsURL(point)));
  } else actions.append(element("p", "link-caveat", "Für diesen Ort ist kein genauer Kartenpunkt bestätigt."));
  content.append(actions, foodRecommendation(point.id));
  return content;
}

function placeExplorer(points, key, headingText = "Die Orte dieses Tages", { showList = true, showReset = true, revealPlace } = {}) {
  destroyMap(key);
  const context = { map: null, pending: null, cancelled: false };
  mapContexts.set(key, context);
  const section = element("section", "place-explorer");
  context.element = section;
  section.id = `${key}-places`;
  const heading = element("h4", "places-heading", headingText);
  const mappedPoints = points.filter((point) => Array.isArray(point.coordinates));
  section.append(heading);
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
  placeholder.append(graphic("icon-pin"), load, permission);
  mapShell.append(placeholder);
  if (showReset) mapShell.append(showAll);
  mapShell.append(canvas, message);
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
          if (showReset) showAll.hidden = false;
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
  focusActiveNavigation();
}

function laneMapPoints(schedule) {
  return schedule.mapBlocks.map((block) => ({
    id: block.key,
    blockKey: block.key,
    placeId: block.placeId,
    number: block.number,
    ...places[block.placeId],
  }));
}

function appendLaneOptionDetails(container, option) {
  if (!option) return;
  container.append(element("p", "lane-when", option.when));
  if (option.booking) container.append(element("h4", "", "Eintritt & Reservierung"), element("p", "", option.booking));
  if (option.transit) container.append(element("h4", "", "Anfahrt für diese Route"), element("p", "", option.transit));
  if (option.resources?.length) container.append(resourceLinks(option.resources));
  if (option.dining) container.append(button("Sumo-Essen in Kulinarik öffnen", "button button-secondary lane-dining-link", () => openDining(option.dining)));
}

function journeyIcon(mode) {
  return {
    walk: "icon-walk",
    taxi: "icon-car",
    car: "icon-car",
    bus: "icon-bus",
    flight: "icon-plane",
    cable: "icon-mountain",
    check: "icon-info",
  }[mode] ?? "icon-train";
}

function laneSourceLabel(block) {
  if (block.kind === "travel") return "Anreise";
  if (block.kind === "buffer") return "Geplante Zeit";
  if (block.source === "alternative") return "Eigener Routenblock";
  if (block.source === "shared") return "Gemeinsamer Abschnitt";
  return "Empfohlen";
}

function appendFlexNotes(container, notes = []) {
  if (!notes.length) return;
  const section = element("section", "lane-flex-notes");
  section.append(element("h4", "", notes.length === 1 ? "Flex-Hinweis" : "Flex-Hinweise"));
  for (const note of notes) {
    const item = element("div", "lane-flex-note");
    item.append(element("strong", "", note.title), element("p", "", note.text), element("p", "lane-when", note.when));
    appendLaneOptionDetails(item, note);
    section.append(item);
  }
  container.append(section);
}

function renderLaneDetail(container, block, showOnMap) {
  container.replaceChildren();
  container.hidden = !block;
  if (!block) return;
  const heading = element("div", "lane-detail-heading");
  const copy = element("div");
  copy.append(
    element("span", "lane-detail-route", `${block.laneLabel} · ${block.laneTitle}`),
    element("h4", "", block.title),
    element("p", "lane-detail-time", `ca. ${formatLaneTime(block.start)}–${formatLaneTime(block.end)} · ${block.duration} Minuten`),
  );
  heading.append(copy, element("span", `lane-source lane-source-${block.source}`, laneSourceLabel(block)));
  container.append(heading);
  const option = block.source === "alternative" ? block.option : null;
  if (block.arrivalJourney) {
    const arrival = element("div", "lane-inline-arrival");
    const arrivalCopy = element("div");
    arrivalCopy.append(element("strong", "", "Kurzer Weg vom vorherigen Punkt"), element("p", "", block.arrivalJourney.summary));
    arrival.append(graphic(journeyIcon(block.arrivalJourney.mode)), arrivalCopy);
    container.append(arrival);
  }
  if (block.kind === "travel") {
    if (block.journey.summary !== block.text) container.append(element("p", "lane-detail-text", block.journey.summary));
    if (block.text) container.append(element("p", "lane-detail-text", block.text));
    const steps = element("ol", "lane-journey-steps");
    for (const step of block.journey.steps) steps.append(element("li", "", step));
    container.append(steps);
    if (block.journey.ticket) container.append(element("h4", "", "Ticket / Bezahlung"), element("p", "lane-detail-text", block.journey.ticket));
    if (block.journey.verify) {
      const verify = element("div", `lane-journey-check${block.journey.missing ? " lane-journey-missing" : ""}`);
      verify.append(graphic(block.journey.missing ? "icon-info" : "icon-check"), element("p", "", block.journey.verify));
      container.append(verify);
    }
  } else if (block.kind === "buffer") {
    container.append(element("p", "lane-detail-text", block.text));
  } else if (block.placeId) {
    const point = { id: block.placeId, ...places[block.placeId] };
    container.append(
      element("p", "place-kind", `${point.kind} · ${point.suggestedTime}`),
      placeContent(point, showOnMap, "Auf Tageskarte zeigen", block.text || option?.text, block.mapKey),
    );
  } else {
    container.append(element("p", "lane-detail-text", block.text));
  }
  appendLaneOptionDetails(container, option);
  appendFlexNotes(container, block.flexNotes);
}

function renderLaneBoard(schedule, selectBlock, { initialBlockKey = null, initialScrollTop = 0 } = {}) {
  const shell = element("section", "lane-board-shell");
  const scroll = element("div", "lane-board-scroll");
  scroll.setAttribute("role", "region");
  scroll.setAttribute("aria-label", "Parallele Tagesrouten mit ungefährer Zeitachse");
  scroll.tabIndex = 0;
  const initialLaneIndex = schedule.lanes.findIndex((lane) => lane.blocks.some((block) => block.key === initialBlockKey));
  let activeLaneIndex = Math.max(0, initialLaneIndex);
  let goToLane = () => {};
  const mobileNavigation = element("div", "lane-mobile-nav");
  mobileNavigation.setAttribute("role", "group");
  const previousLane = button("", "icon-button lane-route-button", () => goToLane(activeLaneIndex - 1));
  previousLane.setAttribute("aria-label", "Vorherige Route");
  previousLane.append(graphic("icon-chevron", "icon previous-icon"));
  const routeStatus = element("p", "lane-mobile-status");
  routeStatus.id = "lane-mobile-status";
  routeStatus.setAttribute("aria-live", "polite");
  routeStatus.setAttribute("aria-atomic", "true");
  const mobileRouteMark = element("span", "lane-mobile-route-mark");
  mobileRouteMark.setAttribute("aria-hidden", "true");
  const nextLane = button("", "icon-button lane-route-button", () => goToLane(activeLaneIndex + 1));
  nextLane.setAttribute("aria-label", "Nächste Route");
  nextLane.append(graphic("icon-chevron"));
  mobileNavigation.append(previousLane, mobileRouteMark, routeStatus, nextLane);
  mobileNavigation.classList.toggle("lane-mobile-nav-single", schedule.lanes.length === 1);
  mobileNavigation.setAttribute("aria-label", schedule.lanes.length > 1 ? "Zwischen Tagesrouten wechseln" : "Tagesroute");
  scroll.setAttribute("aria-describedby", routeStatus.id);
  const board = element("div", "lane-board");
  if (schedule.lanes.length > 1) board.classList.add("lane-board-multiple");
  board.style.setProperty("--lane-count", schedule.lanes.length);
  const scale = 1.8;
  const trackHeight = Math.max(280, (schedule.end - schedule.start) * scale);
  board.style.gridTemplateColumns = `56px repeat(${schedule.lanes.length}, minmax(220px, 1fr))`;
  board.style.minWidth = `${56 + schedule.lanes.length * 220}px`;
  board.append(element("div", "lane-corner", "Zeit"));
  for (const [laneIndex, lane] of schedule.lanes.entries()) {
    const tone = laneIndex % 4;
    const header = element("div", `lane-header lane-tone-${tone}${lane.isPrimary ? " lane-header-primary" : ""}`);
    const routeMark = element("span", "lane-route-mark", lane.letter);
    routeMark.setAttribute("aria-hidden", "true");
    const headerCopy = element("div", "lane-header-copy");
    headerCopy.append(
      element("strong", "", lane.label),
      element("span", "lane-header-title", lane.title),
      element("small", "lane-header-difference", lane.difference),
    );
    header.append(routeMark, headerCopy);
    board.append(header);
  }
  const axis = element("div", "lane-time-axis");
  axis.style.height = `${trackHeight}px`;
  for (let time = schedule.start; time <= schedule.end; time += 120) {
    const label = element("span", "lane-time-label", formatLaneTime(time));
    label.style.top = `${(time - schedule.start) * scale}px`;
    axis.append(label);
  }
  board.append(axis);
  for (const [laneIndex, lane] of schedule.lanes.entries()) {
    const track = element("div", `lane-track lane-tone-${laneIndex % 4}`);
    track.style.height = `${trackHeight}px`;
    track.setAttribute("aria-label", `${lane.label}: ${lane.title}`);
    for (const block of lane.blocks) {
      if (block.arrivalJourney) {
        const connector = element("div", "lane-inline-connector");
        const connectorHeight = block.arrivalJourney.duration * scale;
        connector.style.top = `${(block.start - block.arrivalJourney.duration - schedule.start) * scale + 3}px`;
        connector.style.height = `${Math.max(14, connectorHeight - 6)}px`;
        connector.title = block.arrivalJourney.summary;
        connector.setAttribute("aria-hidden", "true");
        connector.append(graphic(journeyIcon(block.arrivalJourney.mode)), element("span", "", "kurzer Weg"));
        track.append(connector);
      }
      const control = button("", `lane-block lane-block-${block.source} lane-block-${block.kind}`, () => selectBlock(block.key, true));
      const slotHeight = block.duration * scale;
      const inset = Math.min(4, slotHeight / 5);
      const renderedHeight = Math.max(18, slotHeight - inset * 2);
      control.style.top = `${(block.start - schedule.start) * scale + inset}px`;
      control.style.height = `${renderedHeight}px`;
      if (block.kind !== "activity" && renderedHeight < 34) control.classList.add("lane-block-compact");
      control.dataset.laneBlock = block.key;
      if (block.placeId) control.dataset.placeId = block.placeId;
      control.setAttribute("aria-pressed", String(selectedLaneBlock === block.key));
      control.setAttribute("aria-label", `${lane.label}, ca. ${formatLaneTime(block.start)} bis ${formatLaneTime(block.end)}: ${block.title}`);
      const text = element("span", "lane-block-copy");
      text.append(element("span", "lane-block-time", `${formatLaneTime(block.start)}–${formatLaneTime(block.end)}`), element("span", "lane-block-title", block.title));
      if (block.kind === "travel") {
        const marker = element("span", "lane-block-mode");
        marker.append(graphic(journeyIcon(block.journey.mode)));
        control.append(marker, text);
      } else if (block.kind === "buffer") {
        const marker = element("span", "lane-block-mode");
        marker.append(graphic("icon-pause"));
        control.append(marker, text);
      } else {
        const marker = element("span", "lane-block-number", block.number);
        if (block.placeId) control.append(placeThumbnail({ id: block.placeId, ...places[block.placeId] }), marker, text);
        else control.append(marker, text);
      }
      track.append(control);
    }
    board.append(track);
  }
  scroll.append(board);
  const tracks = [...board.querySelectorAll(".lane-track")];
  let renderedLaneIndex = -1;
  function updateNavigation(index) {
    activeLaneIndex = Math.max(0, Math.min(schedule.lanes.length - 1, index));
    if (activeLaneIndex === renderedLaneIndex) return;
    const animateSwitch = renderedLaneIndex >= 0;
    renderedLaneIndex = activeLaneIndex;
    const lane = schedule.lanes[activeLaneIndex];
    for (let tone = 0; tone < 4; tone += 1) mobileNavigation.classList.toggle(`lane-tone-${tone}`, tone === activeLaneIndex % 4);
    mobileRouteMark.textContent = lane.letter;
    routeStatus.replaceChildren(
      element("strong", "", `${lane.label} · ${lane.title}`),
      element("span", "", `${activeLaneIndex + 1} von ${schedule.lanes.length}`),
    );
    previousLane.disabled = activeLaneIndex === 0;
    nextLane.disabled = activeLaneIndex === schedule.lanes.length - 1;
    if (animateSwitch) {
      playMotion(mobileRouteMark, [
        { transform: "scale(.82) rotate(-10deg)" },
        { transform: "scale(1.12) rotate(4deg)", offset: .55 },
        { transform: "scale(1) rotate(0)" },
      ], { duration: 360, easing: "cubic-bezier(.16, 1, .3, 1)" });
      playMotion(routeStatus, [
        { opacity: .35, transform: "translateX(8px)" },
        { opacity: 1, transform: "translateX(0)" },
      ], { duration: 280, easing: "cubic-bezier(.16, 1, .3, 1)" });
    }
  }
  goToLane = (index, behavior = "smooth") => {
    const targetIndex = Math.max(0, Math.min(schedule.lanes.length - 1, index));
    const track = tracks[targetIndex];
    if (!track) return;
    updateNavigation(targetIndex);
    const axis = $(".lane-time-axis", scroll);
    const targetLeft = axis
      ? scroll.scrollLeft + track.getBoundingClientRect().left - axis.getBoundingClientRect().right
      : track.offsetLeft;
    scroll.scrollTo({
      left: Math.max(0, targetLeft),
      behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : behavior,
    });
  };
  updateNavigation(activeLaneIndex);
  requestAnimationFrame(() => {
    goToLane(activeLaneIndex, "auto");
    scroll.scrollTop = initialScrollTop;
  });
  shell.append(mobileNavigation, scroll);
  return shell;
}

function renderDayDetail(day, days) {
  destroyMap("day");
  const detail = $("#day-detail");
  detail.replaceChildren();
  if (!day) {
    detail.append(
      element("h3", "", filters.savedOnly ? "Keine gemerkten Tage" : "Keine Reisetage gefunden"),
      button("Filter zurücksetzen", "button button-secondary", resetFilters),
    );
    return;
  }
  const guide = dayGuides[day.date];
  const laneSchedule = buildDayLanes(day.date);
  const points = laneMapPoints(laneSchedule);
  const blocksByKey = new Map(laneSchedule.lanes.flatMap((lane) => lane.blocks.map((block) => [block.key, block])));
  let openDayMap = () => {};
  const mobileBack = button(
    mobileItemOpen ? "Zur Tagesroute" : "Alle Reisetage",
    "button button-secondary mobile-day-back",
    mobileItemOpen ? showMobileLaneView : showMobileDayList,
  );
  mobileBack.prepend(graphic("icon-chevron", "icon previous-icon"));
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
  headerActions.append(navigation);
  if (points.length) {
    const mapButton = button("", "icon-button day-map-button", () => openDayMap());
    mapButton.setAttribute("aria-label", "Tageskarte öffnen");
    mapButton.title = "Tageskarte öffnen";
    mapButton.append(graphic("icon-pin"));
    headerActions.append(mapButton);
  }
  headerActions.append(favorite);
  topline.append(location, headerActions);
  const title = element("h3", "", day.title);
  title.id = "day-title";
  title.tabIndex = -1;
  detail.append(mobileBack, topline, element("p", "day-date", formatDate(day.date)), title);
  const daySections = new Map();
  const dayTabs = element("div", "day-tabs");
  dayTabs.setAttribute("role", "tablist");
  dayTabs.setAttribute("aria-label", "Bereiche des ausgewählten Reisetags");
  for (const [id, label] of [
    ["plan", "Tagesrouten"],
    ["transit", "Anfahrt & Tickets"],
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
    if (id === "plan") fitMobileLaneBoard();
  }
  detail.append(dayTabs);
  const planPanel = daySections.get("plan").panel;
  const transitPanel = daySections.get("transit").panel;
  if (guide) {
    for (const event of festivalsForDay(day.date)) {
      const note = element("div", "festival-day-note");
      note.append(
        button(`Festoption: ${event.title}`, "text-button", () => openFestival(event.id)),
        element("span", "festival-status", festivalStatusLabels[event.dateStatus]),
      );
      planPanel.append(note);
    }
    let mapDialog;
    let laneBoard;
    const laneDetail = element("section", "lane-detail");
    laneDetail.id = "lane-detail";
    laneDetail.tabIndex = -1;
    laneDetail.setAttribute("aria-label", "Details zum ausgewählten Routenblock");
    if (!blocksByKey.has(selectedLaneBlock)) selectedLaneBlock = null;
    const showOnMap = (id) => {
      openDayMap(id);
    };
    const selectLaneBlock = (key, scroll = false) => {
      const block = blocksByKey.get(key);
      if (!block) return;
      selectedLaneBlock = key;
      if (mobileItineraryQuery.matches && mobileDayOpen) {
        selectedDaySection = "plan";
        if (!mobileItemOpen) {
          mobileLaneScrollTop = $(".lane-board-scroll", laneBoard)?.scrollTop ?? 0;
          mobileItemOpen = true;
          renderItinerary(false);
          writeLocation("push", { mobileDayEntry: true, mobileItemEntry: true });
        } else {
          renderLaneDetail(laneDetail, block, showOnMap);
          writeLocation();
        }
        positionMobileItemScreen(true);
        return;
      }
      for (const control of laneBoard?.querySelectorAll("[data-lane-block]") ?? []) {
        control.setAttribute("aria-pressed", String(control.dataset.laneBlock === key));
      }
      renderLaneDetail(laneDetail, block, showOnMap);
      if (scroll) laneDetail.scrollIntoView({ block: "nearest" });
    };
    const revealPlace = (key) => {
      mapDialog?.close();
      selectSection("plan");
      selectLaneBlock(key, true);
      laneBoard?.querySelector(`[data-lane-block="${CSS.escape(key)}"]`)?.focus({ preventScroll: true });
    };
    if (points.length) {
      mapDialog = element("dialog", "day-map-dialog");
      mapDialog.setAttribute("aria-labelledby", "day-map-dialog-title");
      const dialogHeader = element("div", "day-map-dialog-header");
      const dialogTitle = element("h4", "", `Tageskarte · ${points.length} Routenstopps`);
      dialogTitle.id = "day-map-dialog-title";
      const close = button("", "icon-button", () => mapDialog.close());
      close.setAttribute("aria-label", "Tageskarte schließen");
      close.title = "Tageskarte schließen";
      close.append(graphic("icon-close", "icon dialog-close-icon"));
      dialogHeader.append(dialogTitle, close);
      mapDialog.append(dialogHeader, placeExplorer(points, "day", "Alle Routen auf einer Karte", { showList: false, showReset: false, revealPlace }));
      mapDialog.addEventListener("click", (event) => {
        if (event.target === mapDialog) mapDialog.close();
      });
      detail.append(mapDialog);
      openDayMap = (focusId) => {
        if (!mapDialog.open) mapDialog.showModal();
        requestAnimationFrame(() => {
          const context = mapContexts.get("day");
          context.map?.resize();
          if (focusId) context.focus(focusId);
          else if (context.map) context.map.showAll();
          else if (mapsPermitted) context.start();
        });
      };
    }
    laneBoard = renderLaneBoard(laneSchedule, selectLaneBlock, {
      initialBlockKey: selectedLaneBlock,
      initialScrollTop: mobileLaneScrollTop,
    });
    planPanel.append(laneBoard, laneDetail);
    if (mobileItineraryQuery.matches && mobileDayOpen) planPanel.prepend(laneBoard, laneDetail);
    renderLaneDetail(laneDetail, selectedLaneBlock ? blocksByKey.get(selectedLaneBlock) : null, showOnMap);
    if (guide.correction) {
      const correction = element("div", "planning-correction");
      correction.append(element("h4", "", "Gut zu wissen"), element("p", "", guide.correction));
      planPanel.append(correction);
    }
    if (guide.booking || guide.tip) {
      const booking = element("details", "day-booking-note");
      booking.append(element("summary", "", guide.tip ? "Praktische Tipps & Buchung" : "Vorher klären oder buchen"));
      if (guide.booking) booking.append(element("p", "", guide.booking));
      if (guide.tip) booking.append(element("p", "day-tip", guide.tip));
      planPanel.append(booking);
    }
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
    if (day.destination !== "reise") {
      const shortcuts = element("div", "day-shortcuts");
      shortcuts.append(button(`Einkaufen bei unserer Basis in ${destinationName(day.destination)}`, "button button-secondary base-shortcut", () => openBase(day.destination)));
      if (["tokyo", "kyoto", "osaka"].includes(day.destination)) {
        shortcuts.append(button(`Abendideen in ${destinationName(day.destination)}`, "button button-secondary base-shortcut", () => {
          diningFilters.destination = day.destination;
          diningFilters.category = "all";
          diningFilters.spontaneous = false;
          renderDiningList();
          setView("dining");
          $("#planner").scrollIntoView({ block: "start" });
          focusActiveNavigation();
        }));
      }
      planPanel.append(shortcuts);
    }
  }
  if (day.base !== "Anreise" && day.base !== "Rückreise") {
    const base = element("details", "base-note");
    base.append(element("summary", "", "Unsere Basis & Bahnhöfe"), element("p", "", day.base));
    transitPanel.append(base);
  }
  for (const { panel } of daySections.values()) detail.append(panel);
  selectSection(selectedDaySection);
}

function renderItinerary(updateLocation = true) {
  const days = filterDays(trip.days, filters, state.favorites);
  if (!days.some((day) => day.date === selectedDate) && days.length) {
    selectedDate = days[0].date;
    selectedDaySection = "plan";
    selectedLaneBlock = null;
    mobileItemOpen = false;
    mobileLaneScrollTop = 0;
  }
  syncMobileDayView();
  $("#panel-itinerary").dataset.mobileScreen = mobileItemOpen ? "item" : mobileDayOpen ? "day" : "list";
  renderDayList(days);
  renderDayDetail(days.find((day) => day.date === selectedDate), days);
  if (updateLocation) writeLocation();
}

function renderTravel() {
  const container = $("#travel-content");
  const railSection = element("section", "rail-guide");
  const railHeading = element("h3", "", "Bahnfahren ohne Vorwissen");
  railHeading.id = "rail-guide-heading";
  railHeading.tabIndex = -1;
  railSection.append(railHeading);
  for (const item of railGuide) {
    const block = element("details", "rail-guide-item");
    block.open = railGuide.indexOf(item) < 2;
    block.append(element("summary", "", item.title), element("p", "", item.text));
    if (item.resources) block.append(resourceLinks(item.resources));
    railSection.append(block);
  }
  container.append(railSection, element("h3", "content-subheading", "Die geplanten Flüge"));
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
  fitPlannerNavigation();
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
    if (task.resources?.length) copy.append(resourceLinks(task.resources));
    if (destinationsForTask[task.id]) {
      const link = element("a", "check-link", labelsForTask[task.id]);
      link.href = `#view=${destinationsForTask[task.id]}&day=${selectedDate}`;
      link.addEventListener("click", (event) => {
        event.preventDefault();
        setView(destinationsForTask[task.id]);
        $("#planner").scrollIntoView({ block: "start" });
        focusActiveNavigation();
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

function renderDiningList() {
  const entries = filterDining(diningOptions, diningFilters);
  $("#dining-results").textContent = `${entries.length} ${entries.length === 1 ? "Abendidee" : "Abendideen"}`;
  $("#dining-spontaneous").checked = diningFilters.spontaneous;
  for (const control of document.querySelectorAll("[data-dining-destination]")) {
    control.setAttribute("aria-pressed", String(control.dataset.diningDestination === diningFilters.destination));
  }
  for (const control of document.querySelectorAll("[data-dining-category]")) {
    control.setAttribute("aria-pressed", String(control.dataset.diningCategory === diningFilters.category));
  }
  const list = $("#dining-list");
  list.replaceChildren();
  if (!entries.length) {
    const empty = element("div", "dining-empty");
    empty.append(
      element("h3", "", "Für diese Auswahl ist kein passender Spontantipp bestätigt."),
      element("p", "", "Andere Buchungsarten oder eine andere Kategorie zeigen mehr Ideen. Ein freier Tisch wird dadurch nicht zugesagt."),
      button("Alle Buchungsarten anzeigen", "button button-secondary", () => {
        diningFilters.spontaneous = false;
        diningFilters.category = "all";
        renderDiningList();
        $("#dining-spontaneous").focus({ preventScroll: true });
      }),
    );
    list.append(empty);
    return;
  }
  for (const entry of entries) {
    const card = element("details", "dining-option");
    card.id = `dining-${entry.id}`;
    card.name = "dining-options";
    card.dataset.destination = entry.destination;
    const visual = { id: entry.id, name: entry.name, category: entry.category, kind: diningCategoryLabels[entry.category] };
    const summary = element("summary");
    const copy = element("span", "dining-summary-copy");
    copy.append(
      element("span", "dining-name", entry.name),
      element("span", "dining-location", `${destinationName(entry.destination)} · ${diningCategoryLabels[entry.category]}`),
      element("span", "dining-booking", diningBookingLabels[entry.booking]),
    );
    if (entry.walkIn && entry.booking !== "walk-in") copy.append(element("span", "dining-walk-in", "Auch spontan versuchbar"));
    summary.append(placeThumbnail(visual), copy, graphic("icon-chevron", "icon dining-chevron"));
    const body = element("div", "dining-body");
    body.append(
      placeFigure(visual, linkWithStatus),
      element("h3", "", "Das macht den Abend besonders"),
      element("p", "", entry.why),
      element("h3", "", "Mit den Kids"),
      element("p", "food-children", entry.children),
      element("h3", "", "Spontan oder reservieren?"),
      element("p", "", entry.bookingNote),
      element("h3", "", "Wo & welcher Zugang?"),
      element("p", "dining-address", entry.location),
      element("p", "", entry.practical),
      element("p", "food-practical", entry.accessNote),
      culinaryLinks(entry),
    );
    if (entry.bookingUrl) body.append(linkWithStatus("Offizielle Tischreservierung", entry.bookingUrl));
    const sources = element("div", "resource-links");
    for (const source of entry.sources.filter((source) => source.url !== entry.url)) sources.append(linkWithStatus(source.label, source.url));
    if (sources.children.length) body.append(sources);
    card.append(summary, body);
    list.append(card);
  }
}

function openDining(id) {
  const entry = diningOptions.find((option) => option.id === id);
  if (!entry) throw new Error(`Unknown dining option: ${id}`);
  diningFilters.destination = entry.destination;
  diningFilters.category = "all";
  diningFilters.spontaneous = false;
  renderDiningList();
  setView("dining");
  const card = $(`#dining-${id}`);
  card.open = true;
  card.scrollIntoView({ block: "start" });
  $("summary", card).focus({ preventScroll: true });
}

function renderDining() {
  for (const id of ["all", "tokyo", "kyoto", "osaka"]) {
    const control = button(id === "all" ? "Alle Städte" : destinationName(id), "filter-button", () => {
      diningFilters.destination = id;
      renderDiningList();
    });
    control.dataset.diningDestination = id;
    $("#dining-destinations").append(control);
  }
  for (const [id, label] of [["all", "Alle Erlebnisse"], ...Object.entries(diningCategoryLabels)]) {
    const control = button(label, "filter-button", () => {
      diningFilters.category = id;
      renderDiningList();
    });
    control.dataset.diningCategory = id;
    $("#dining-categories").append(control);
  }
  $("#dining-spontaneous").addEventListener("change", (event) => {
    diningFilters.spontaneous = event.target.checked;
    renderDiningList();
  });
  renderDiningList();
}

function openFestival(id) {
  setView("festivals");
  const card = $(`#festival-${id}`);
  card.open = true;
  card.scrollIntoView({ block: "start" });
  $("summary", card).focus({ preventScroll: true });
}

function renderFestivals() {
  const list = $("#festival-list");
  for (const event of festivalOptions) {
    const card = element("details", "festival-option");
    card.id = `festival-${event.id}`;
    card.name = "festival-options";
    const visual = { id: event.id, name: event.title, kind: event.category === "park-show" ? "Freizeitpark" : "Sommerfest" };
    const summary = element("summary");
    const copy = element("span", "festival-summary-copy");
    const location = `${destinationName(event.destination)}${event.fromDestination ? ` · ab ${destinationName(event.fromDestination)}` : ""}`;
    copy.append(
      element("span", "festival-date", `${formatDate(event.proposedDates[0], { day: "numeric", month: "long" })} · ${location}`),
      element("span", "festival-name", event.title),
      element("span", "festival-status", festivalStatusLabels[event.dateStatus]),
    );
    summary.append(placeThumbnail(visual), copy, graphic("icon-chevron", "icon festival-chevron"));
    const body = element("div", "festival-body");
    const detail = element("div", "festival-copy");
    detail.append(
      element("h3", "", "Warum es sich lohnt"),
      element("p", "", event.why),
      element("h3", "", "Termin & Verlässlichkeit"),
      element("p", "", event.when),
      element("h3", "", "Mit den Kids"),
      element("p", "", event.children),
      element("h3", "", "So passt es in den Tag"),
      element("p", "", event.planAdvice),
      element("p", "festival-logistics", event.logistics),
    );
    const links = element("div", "food-links");
    links.append(
      linkWithStatus("Offizielles Programm prüfen", event.url),
      linkWithStatus("Ort / Festgebiet in Google Maps", festivalMapsURL(event)),
    );
    detail.append(links);
    const sources = element("div", "resource-links");
    for (const source of event.sources.filter((source) => source.url !== event.url)) sources.append(linkWithStatus(source.label, source.url));
    if (sources.children.length) detail.append(sources);
    body.append(placeFigure(visual, linkWithStatus), detail);
    card.append(summary, body);
    list.append(card);
  }
  const context = $("#fireworks-context");
  for (const event of fireworksContext) {
    const item = element("div", "fireworks-note");
    item.append(element("h3", "", event.title), element("p", "", event.text), linkWithStatus("Veranstalterseite", event.url));
    context.append(item);
  }
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
  $("#nav-more").addEventListener("click", () => {
    toggleOverflowMenu($("#nav-more").getAttribute("aria-expanded") !== "true");
  });
  let navigationFitFrame;
  const resizeNavigation = () => {
    cancelAnimationFrame(navigationFitFrame);
    navigationFitFrame = requestAnimationFrame(fitPlannerNavigation);
  };
  if ("ResizeObserver" in window) {
    let previousWidth;
    const observer = new ResizeObserver(([entry]) => {
      if (entry.contentRect.width === previousWidth) return;
      previousWidth = entry.contentRect.width;
      resizeNavigation();
    });
    observer.observe($(".planner-nav"));
  }
  window.addEventListener("resize", resizeNavigation);
  document.fonts?.ready.then(resizeNavigation);
  window.addEventListener("resize", fitHomeViewport);
  window.visualViewport?.addEventListener("resize", fitHomeViewport);
  document.fonts?.ready.then(fitHomeViewport);
  if ("ResizeObserver" in window) {
    const observer = new ResizeObserver(fitHomeViewport);
    observer.observe($(".masthead"));
    observer.observe($(".planner-nav"));
    observer.observe($("#storage-notice"));
  }
  $(".planner-tabs").addEventListener("animationend", (event) => {
    if (event.target === $(".planner-tabs")) $(".planner-nav").classList.remove("menu-closing");
  });
  $("#mobile-menu-toggle").addEventListener("click", () => {
    toggleMobileMenu($("#mobile-menu-toggle").getAttribute("aria-expanded") !== "true");
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && $("#mobile-menu-toggle").getAttribute("aria-expanded") === "true") {
      toggleMobileMenu(false, true);
    }
    if (event.key === "Escape" && $("#nav-more").getAttribute("aria-expanded") === "true") {
      toggleOverflowMenu(false, true);
    }
  });
  document.addEventListener("click", (event) => {
    if (!event.target.closest(".planner-nav")) {
      toggleMobileMenu(false);
      toggleOverflowMenu(false);
    }
  });
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
  const navigatePlanner = (event) => {
    const index = views.indexOf(event.currentTarget.dataset.view ?? currentView);
    const target = { ArrowRight: views[(index + 1) % views.length], ArrowLeft: views[(index + views.length - 1) % views.length], Home: views[0], End: views.at(-1) }[event.key];
    if (target) {
      event.preventDefault();
      activatePlannerView(target);
      if (mobileItineraryQuery.matches) $("#mobile-menu-toggle").focus({ preventScroll: true });
      else focusActiveNavigation();
    }
  };
  $("#nav-more").addEventListener("keydown", navigatePlanner);
  for (const tab of document.querySelectorAll('.planner-tabs [role="tab"]')) {
    tab.addEventListener("click", () => activatePlannerView(tab.dataset.view));
    tab.addEventListener("keydown", navigatePlanner);
  }
  for (const control of document.querySelectorAll(".calendar-download")) control.addEventListener("click", downloadCalendar);
  window.addEventListener("hashchange", () => {
    const params = new URLSearchParams(location.hash.slice(1));
    const wasMobileDayOpen = mobileDayOpen;
    const wasMobileItemOpen = mobileItemOpen;
    readLocation();
    if (location.hash !== "#planner") {
      const requestedDate = params.get("day");
      const visibleDays = filterDays(trip.days, filters, state.favorites);
      if (requestedDate && !visibleDays.some(({ date }) => date === requestedDate)) {
        filters = { destination: "all", query: "", savedOnly: false };
        $("#day-search").value = "";
        updateFilterControls();
      }
      renderItinerary();
    } else renderItinerary();
    revealSelectedDay();
    if ((focusDayListAfterNavigation || wasMobileDayOpen) && !mobileDayOpen && currentView === "itinerary") {
      focusDayListAfterNavigation = false;
      focusMobileDayList();
    } else if (mobileItineraryQuery.matches && mobileItemOpen && currentView === "itinerary") {
      positionMobileItemScreen();
    } else if (mobileItineraryQuery.matches && mobileDayOpen && currentView === "itinerary") {
      positionMobileDayScreen();
      if (focusLaneBlockAfterNavigation || wasMobileItemOpen) {
        focusLaneBlockAfterNavigation = false;
        focusSelectedLaneBlock();
      }
    }
  });
  mobileItineraryQuery.addEventListener("change", () => {
    if (currentView === "itinerary") {
      if (!mobileItineraryQuery.matches) mobileItemOpen = false;
      renderItinerary();
      if (mobileItineraryQuery.matches && mobileItemOpen) positionMobileItemScreen();
      else if (mobileItineraryQuery.matches && mobileDayOpen) positionMobileDayScreen();
    }
  });
  window.addEventListener("resize", fitMobileLaneBoard);
  window.visualViewport?.addEventListener("resize", fitMobileLaneBoard);
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
  renderDining();
  renderFestivals();
  renderChecklist();
  renderItinerary();
  bindEvents();
  bindMotion();
  bindRouteTrainMotion();
  $("#startup-notice").hidden = true;
  revealSelectedDay();
  if (mobileItineraryQuery.matches && mobileItemOpen && currentView === "itinerary") positionMobileItemScreen();
  else if (mobileItineraryQuery.matches && mobileDayOpen && currentView === "itinerary") positionMobileDayScreen();
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
