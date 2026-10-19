let leafletPromise;

function loadLeaflet() {
  if (window.L) return Promise.resolve(window.L);
  if (!leafletPromise) {
    leafletPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = new URL("./vendor/leaflet/leaflet.js", import.meta.url).href;
      script.addEventListener("load", () => {
        if (window.L) resolve(window.L);
        else reject(new Error("The local map library did not initialize."));
      }, { once: true });
      script.addEventListener("error", () => reject(new Error("The local map library could not be loaded.")), { once: true });
      document.head.append(script);
    }).catch((error) => {
      leafletPromise = undefined;
      throw error;
    });
  }
  return leafletPromise;
}

export async function createPlaceMap(container, points, { popupFor, onStatus }) {
  const L = await loadLeaflet();
  if (!container.isConnected) return null;
  const mapped = points.filter((point) => Array.isArray(point.coordinates));
  if (!mapped.length) throw new Error("No verified coordinates are available for this selection.");
  const map = L.map(container, {
    scrollWheelZoom: false,
    zoomControl: false,
    keyboard: true,
    fadeAnimation: !matchMedia("(prefers-reduced-motion: reduce)").matches,
    zoomAnimation: !matchMedia("(prefers-reduced-motion: reduce)").matches,
  });
  let timeout;
  try {
    L.control.zoom({ zoomInTitle: "Karte vergrößern", zoomOutTitle: "Karte verkleinern" }).addTo(map);
    map.attributionControl.setPrefix(false);
    map.fitBounds(L.latLngBounds(mapped.map((point) => point.coordinates)), { padding: [32, 32], maxZoom: 15, animate: false });
    const markers = new Map();
    mapped.forEach((point) => {
      const markerLabel = document.createElement("span");
      markerLabel.textContent = point.number;
      const marker = L.marker(point.coordinates, {
        icon: L.divIcon({ className: "place-marker", html: markerLabel, iconSize: [32, 32], iconAnchor: [16, 16] }),
        title: `${point.number}. ${point.name}`,
        alt: `${point.number}. ${point.name}`,
        keyboard: true,
      }).addTo(map);
      marker.getElement().setAttribute("aria-label", `${point.number}. ${point.name}`);
      marker.bindPopup(popupFor(point), { maxWidth: 280 });
      marker.on("popupopen", () => {
        marker.getPopup().getElement().querySelector(".leaflet-popup-close-button")?.setAttribute("aria-label", "Ortsinformation schließen");
      });
      markers.set(point.id, marker);
    });
    const tiles = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
    });
    let tileFailures = 0;
    let receivedTile = false;
    timeout = setTimeout(() => {
      if (!receivedTile) onStatus("Die Hintergrundkarte lädt noch nicht. Prüfe die Verbindung. Alle Orte und Google-Maps-Links bleiben unten verfügbar.", true);
    }, 12000);
    tiles.on("tileload", () => {
      receivedTile = true;
      clearTimeout(timeout);
      if (!tileFailures) onStatus("Karte geladen. Die Nummern gehören zur Ortsliste darunter.", false);
    });
    tiles.on("tileerror", () => {
      tileFailures += 1;
      clearTimeout(timeout);
      onStatus("Einige Kartenkacheln konnten nicht geladen werden. Die Ortsmarker und die geprüften Ziel-Links bleiben nutzbar; prüfe deine Verbindung.", true);
    });
    tiles.addTo(map);
    return {
      focus(id) {
        const marker = markers.get(id);
        if (!marker) return;
        map.setView(marker.getLatLng(), Math.max(map.getZoom(), 15), { animate: false });
        marker.openPopup();
      },
      resize() { map.invalidateSize({ animate: false }); },
      remove() {
        clearTimeout(timeout);
        map.remove();
      },
    };
  } catch (error) {
    clearTimeout(timeout);
    map.remove();
    throw error;
  }
}
