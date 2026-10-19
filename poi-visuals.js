import { photosByPlace } from "./poi-photos.js";

const svgNS = "http://www.w3.org/2000/svg";

function sceneFor(point) {
  if (point.id === "crossing") return "crossing";
  if (point.id === "zauo-shinjuku") return "fishing";
  if (point.id === "kura-namba") return "sushi";
  if (["iriya-asagao", "sensoji-hozuki"].includes(point.id)) return "flowers";
  if (["gion-evening", "gion-parade"].includes(point.id)) return "float";
  const kind = `${point.kind ?? ""} ${point.category ?? ""} ${point.name}`.toLocaleLowerCase("de-DE");
  if (/aussicht|view|hochhaus/.test(kind)) return "view";
  if (/experience|erlebnis|fest|parade/.test(kind)) return "feast";
  if (/lebensmittel|restaurant|kulinarik|casual|café|ramen|snack|markt/.test(kind)) return "food";
  if (/aquarium/.test(kind)) return "aquarium";
  if (/museum|ausstellung/.test(kind)) return "museum";
  if (/freizeitpark/.test(kind)) return "arcade";
  if (/wandern|berg|wasserfall|bambus/.test(kind)) return "mountain";
  if (/schrein|tempel|burg/.test(kind)) return "shrine";
  if (/zoo|hirsch|wildpark/.test(kind)) return "nature";
  if (/park|garten/.test(kind)) return "park";
  if (/strand|promenade|brücke|meer/.test(kind)) return "coast";
  if (/shopping|gaming|pokémon|laden/.test(kind)) return "shopping";
  return "city";
}

function illustration(point, decorative) {
  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("viewBox", "0 0 320 180");
  if (decorative) svg.setAttribute("aria-hidden", "true");
  else {
    svg.setAttribute("role", "img");
    svg.setAttribute("aria-label", `Illustration: ${point.kind ?? point.category ?? point.name}`);
  }
  const use = document.createElementNS(svgNS, "use");
  use.setAttribute("href", `${new URL("./assets/poi-illustrations.svg", import.meta.url).href}#scene-${sceneFor(point)}`);
  svg.append(use);
  return svg;
}

function image(photo, thumbnail) {
  const img = document.createElement("img");
  img.src = new URL(thumbnail ? photo.thumb : photo.src, import.meta.url).href;
  img.alt = thumbnail ? "" : photo.alt;
  img.loading = "lazy";
  img.decoding = "async";
  img.width = thumbnail ? 64 : photo.width;
  img.height = thumbnail ? 44 : photo.height;
  if (thumbnail) {
    img.title = `Foto: ${photo.author} · ${photo.license}`;
    img.setAttribute("aria-hidden", "true");
  }
  return img;
}

export function placeThumbnail(point) {
  const frame = document.createElement("span");
  frame.className = "poi-thumb";
  const photo = photosByPlace[point.id];
  if (photo) {
    const thumbnail = image(photo, true);
    thumbnail.addEventListener("error", () => {
      console.warn(`Das Vorschaubild für ${point.name} konnte nicht geladen werden.`);
      thumbnail.replaceWith(illustration(point, true));
      const notice = document.createElement("span");
      notice.className = "poi-image-error";
      notice.textContent = "Bild fehlt";
      frame.append(notice);
    }, { once: true });
    frame.append(thumbnail);
  } else frame.append(illustration(point, true));
  return frame;
}

export function placeFigure(point, makeLink) {
  const figure = document.createElement("figure");
  figure.className = "poi-figure";
  const photo = photosByPlace[point.id];
  const caption = document.createElement("figcaption");
  caption.className = "poi-credit";
  if (photo) {
    const photoImage = image(photo, false);
    photoImage.addEventListener("error", () => {
      console.warn(`Das Ortsfoto für ${point.name} konnte nicht geladen werden.`);
      photoImage.replaceWith(illustration(point, false));
      caption.prepend(document.createTextNode("Foto konnte nicht geladen werden; oben eine Illustration. "));
      caption.setAttribute("role", "status");
    }, { once: true });
    figure.append(photoImage);
    caption.append(
      document.createTextNode(`Archivfoto (Ausschnitt): ${photo.author} · `),
      makeLink("Bildquelle", photo.sourceUrl),
      document.createTextNode(" · "),
      makeLink(photo.license, photo.licenseUrl),
    );
  } else {
    figure.append(illustration(point, false));
    caption.textContent = `Illustration · ${point.kind ?? point.category ?? "Japanischer Reiseabend"}, keine Ortsaufnahme`;
  }
  figure.append(caption);
  return figure;
}
