"""Check a finite link manifest without bypassing access restrictions."""

import concurrent.futures
import html
import json
import re
import sys
from datetime import datetime, timezone
from html.parser import HTMLParser
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen
from urllib.parse import parse_qs, urlparse


USER_AGENT = "Japan2027Planner-LinkCheck/1.0 (+https://github.com/jeffrey-groneberg/japan2027)"


class PageSummary(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.capture = None
        self.title = []
        self.headings = []

    def handle_starttag(self, tag, attrs):
        if tag in {"title", "h1"}:
            self.capture = tag

    def handle_endtag(self, tag):
        if tag == self.capture:
            self.capture = None

    def handle_data(self, data):
        if self.capture == "title":
            self.title.append(data)
        elif self.capture == "h1":
            self.headings.append(data)


def check(item):
    url = item["url"]
    record = {
        **item,
        "checkedAt": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "httpStatus": None,
        "finalUrl": url,
        "title": "",
        "headings": "",
        "status": "unreachable",
    }
    try:
        request = Request(url, headers={"User-Agent": USER_AGENT, "Accept": "text/html,application/xhtml+xml;q=0.9,*/*;q=0.8"})
        with urlopen(request, timeout=22) as response:
            record["httpStatus"] = response.status
            record["finalUrl"] = response.url
            charset = response.headers.get_content_charset() or "utf-8"
            content = response.read(1_500_000).decode(charset, errors="replace")
        summary = PageSummary()
        summary.feed(content)
        record["title"] = re.sub(r"\s+", " ", " ".join(summary.title)).strip()[:350]
        record["headings"] = re.sub(r"\s+", " ", " ".join(summary.headings)).strip()[:500]
        challenge = re.search(
            r"just a moment|access denied|verify (?:you are|that you)|pardon our interruption|security check|captcha|robot check",
            record["title"] + " " + record["headings"], re.I,
        )
        soft_error = re.search(r"\b404\b|not\s*found|page not found|共通エラー", record["title"], re.I)
        if urlparse(record["finalUrl"]).scheme != "https":
            record["status"] = "unsafe-redirect"
        elif soft_error:
            record["status"] = "wrong-target"
        else:
            record["status"] = "restricted" if challenge or record["httpStatus"] == 202 else "reachable"
        if item.get("coordinates"):
            final_query = parse_qs(urlparse(record["finalUrl"]).query).get("query", [])
            expected_query = ",".join(str(value) for value in item["coordinates"])
            record["coordinateQueryPreserved"] = final_query == [expected_query]
            if not record["coordinateQueryPreserved"]:
                record["status"] = "restricted"
        record["identityHint"] = any(
            term.casefold() in html.unescape(record["title"] + " " + record["headings"]).casefold()
            for term in item.get("expected", [])
        )
    except HTTPError as error:
        record["httpStatus"] = error.code
        record["finalUrl"] = error.url
        record["status"] = "restricted" if error.code in {401, 403, 429} else "unavailable"
        record["error"] = f"HTTP {error.code}"
    except (URLError, TimeoutError, OSError, ValueError) as error:
        record["error"] = str(error)
    return record


def main():
    if len(sys.argv) != 3:
        raise SystemExit("Usage: python3 scripts/check-links.py MANIFEST.json REPORT.json")
    manifest = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))
    if not isinstance(manifest, list) or any(not item.get("url", "").startswith("https://") for item in manifest):
        raise ValueError("The manifest must be a list of HTTPS URLs.")
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
        results = list(pool.map(check, manifest))
    Path(sys.argv[2]).write_text(json.dumps(results, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    for result in results:
        print(f"{result['id']}\t{result['status']}\t{result['httpStatus']}\t{result['title'] or result.get('error', '')}\t{result['finalUrl']}")


if __name__ == "__main__":
    main()
