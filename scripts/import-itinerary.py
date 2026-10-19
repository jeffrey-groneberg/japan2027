"""Convert the supplied itinerary's content to a safe, text-only data module."""

import json
import re
import sys
from dataclasses import dataclass, field
from datetime import date
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse


@dataclass
class Element:
    tag: str
    attrs: dict = field(default_factory=dict)
    children: list = field(default_factory=list)

    def matches(self, tag=None, class_name=None):
        return (not tag or self.tag == tag) and (
            not class_name or class_name in self.attrs.get("class", "").split()
        )

    def all(self, tag=None, class_name=None):
        result = []
        for child in self.children:
            if isinstance(child, Element):
                if child.matches(tag, class_name):
                    result.append(child)
                result.extend(child.all(tag, class_name))
        return result

    def one(self, tag=None, class_name=None):
        matches = self.all(tag, class_name)
        if not matches:
            raise ValueError(f"Missing source element: {tag=}, {class_name=}")
        return matches[0]

    def text(self, exclude=()):
        parts = []
        for child in self.children:
            if isinstance(child, str):
                parts.append(child)
            elif child.tag not in exclude:
                parts.append("\n" if child.tag == "br" else child.text(exclude))
        return re.sub(r"\s+", " ", "".join(parts)).strip()


class DocumentParser(HTMLParser):
    VOID_TAGS = {"area", "base", "br", "col", "embed", "hr", "img", "input",
                 "link", "meta", "param", "source", "track", "wbr"}

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.root = Element("document")
        self.stack = [self.root]

    def handle_starttag(self, tag, attrs):
        element = Element(tag, dict(attrs))
        self.stack[-1].children.append(element)
        if tag not in self.VOID_TAGS:
            self.stack.append(element)

    def handle_endtag(self, tag):
        for index in range(len(self.stack) - 1, 0, -1):
            if self.stack[index].tag == tag:
                self.stack = self.stack[:index]
                return

    def handle_data(self, data):
        self.stack[-1].children.append(data)


def links(element):
    result = []
    for anchor in element.all("a"):
        href = anchor.attrs.get("href", "")
        parsed = urlparse(href)
        if parsed.scheme != "https" or not parsed.netloc:
            raise ValueError(f"Unsupported source booking URL: {href}")
        result.append({"label": anchor.text(), "url": href})
    return result


def price_range(label):
    numbers = re.findall(r"\d[\d.]*", label)
    amounts = [float(number.replace(".", "")) for number in numbers]
    if not amounts:
        raise ValueError(f"Missing source price: {label}")
    return {"min": amounts[0], "max": amounts[-1]}


def destination_for(iso_date):
    if iso_date < "2027-07-04" or iso_date > "2027-07-31":
        return "reise"
    if iso_date < "2027-07-11":
        return "tokyo"
    if iso_date < "2027-07-15":
        return "kyoto"
    if iso_date < "2027-07-20":
        return "osaka"
    return "vietnam"


def convert(source):
    parser = DocumentParser()
    parser.feed(source)
    root = parser.root
    sections = {
        section.one(class_name="eyebrow").text(): section
        for section in root.all("section")
    }
    days = []
    for group in root.all(class_name="daygroup"):
        base = group.one(class_name="daygroup-head").text()
        for item in group.all(class_name="dayitem"):
            day, month = map(int, re.search(
                r"(\d+)\.(\d+)", item.one(class_name="daydate").text()
            ).groups())
            iso_date = date(2027, month, day).isoformat()
            body = item.one(class_name="daybody")
            days.append({
                "date": iso_date,
                "destination": destination_for(iso_date),
                "title": body.one("h4").text(),
                "base": base,
                "activities": [li.text() for li in body.all("li")],
            })

    stops = []
    for element in root.all(class_name="stop"):
        stops.append({
            "name": element.one("h3").text(),
            "nights": element.one(class_name="nights").text(),
            "dates": element.one(class_name="when").text(),
            "highlights": [li.text() for li in element.all("li")],
            "notes": [note.text() for note in element.all(class_name="note")],
        })

    flights = []
    for element in root.all(class_name="leg"):
        flights.append({
            "date": element.one(class_name="date").text(),
            "route": element.one(class_name="path").text(),
            "details": element.one(class_name="meta").text(exclude=("a",)),
            "carrier": (
                element.one(class_name="carrier").one("b").text() + " "
                + element.one(class_name="carrier").text(exclude=("b",))
            ),
            "links": links(element),
        })

    accommodations = []
    for index, element in enumerate(root.all(class_name="stay")):
        city_id = ["tokyo", "kyoto", "osaka"][index]
        options = []
        for option_index, pick in enumerate(element.all(class_name="pick")):
            name = pick.one(class_name="name")
            scores = name.all(class_name="score")
            badges = name.all(class_name="badge")
            price_label = pick.one(class_name="price").one("b").text()
            options.append({
                "id": f"{city_id}-{option_index}",
                "name": name.text(exclude=("span",)),
                "score": scores[0].text() if scores else "",
                "badge": badges[0].text() if badges else "",
                "description": pick.one(class_name="desc").text(exclude=("a",)),
                "priceLabel": price_label,
                "priceNote": pick.one(class_name="price").one("span").text(),
                "price": price_range(price_label),
                "links": links(pick),
            })
        accommodations.append({
            "id": city_id,
            "city": element.one(class_name="city").text(),
            "nights": element.one(class_name="nights").text(),
            "options": options,
        })

    budget = []
    budget_section = sections["Budget"]
    for index, row in enumerate(budget_section.one("tbody").all("tr")):
        if row.matches(class_name="total"):
            continue
        cells = row.all("td")
        sub = cells[0].all(class_name="sub")
        label = cells[-1].text()
        budget.append({
            "id": f"budget-{index}",
            "name": cells[0].text(exclude=("span",)),
            "description": sub[0].text() if sub else "",
            "sourceLabel": label,
            **price_range(label),
        })

    transport = sections["Transport & Tickets"]
    checklist = []
    for index, element in enumerate(sections["Nicht vergessen"].all(class_name="check")):
        what = element.one(class_name="what")
        checklist.append({
            "id": f"task-{index}",
            "deadline": element.one(class_name="deadline").text(),
            "title": what.one("b").text().rstrip(":"),
            "details": what.text(),
        })

    return {
        "title": root.one("title").text(),
        "startDate": days[0]["date"],
        "endDate": days[-1]["date"],
        "travelers": 4,
        "sourceDate": "Oktober 2026",
        "overview": sections["Überblick"].one(class_name="lede").text(),
        "routeIntroduction": sections["Reiseverlauf"].one(class_name="lede").text(),
        "stops": stops,
        "days": days,
        "flights": flights,
        "flightIntroduction": sections["Flüge"].one(class_name="lede").text(),
        "flightNotes": sections["Flüge"].one(class_name="note").text(),
        "transportIntroduction": transport.one(class_name="lede").text(),
        "transport": [{
            "title": element.one(class_name="deadline").text(),
            "details": element.one(class_name="what").text(),
        } for element in transport.all(class_name="check")],
        "transportNotes": transport.one(class_name="note").text(),
        "accommodationIntroduction": sections["Unterkünfte Japan"].one(class_name="lede").text(),
        "accommodations": accommodations,
        "accommodationNotes": sections["Unterkünfte Japan"].one(class_name="note").text(),
        "budget": budget,
        "sourceBudgetTotal": budget_section.one(class_name="total").all("td")[-1].text(),
        "budgetDisclaimer": budget_section.one(class_name="disclaim").text(),
        "checklist": checklist,
        "sourceFooter": root.one("footer").text(),
    }


def main():
    if len(sys.argv) != 3:
        raise SystemExit("Usage: python3 scripts/import-itinerary.py SOURCE.html OUTPUT.js")
    source_path, output_path = map(Path, sys.argv[1:])
    trip = convert(source_path.read_text(encoding="utf-8"))
    if len(trip["days"]) != 30:
        raise ValueError(f"Expected 30 travel days, found {len(trip['days'])}")
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(
        "// Generated from the supplied itinerary; content is text, never executable HTML.\n"
        "export const trip = " + json.dumps(trip, ensure_ascii=False, indent=2) + ";\n",
        encoding="utf-8",
    )
    print(f"Imported {len(trip['days'])} days, {len(trip['flights'])} flights, "
          f"{sum(len(city['options']) for city in trip['accommodations'])} stays "
          f"and {len(trip['checklist'])} booking tasks.")


if __name__ == "__main__":
    main()
