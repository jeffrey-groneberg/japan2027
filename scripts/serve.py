"""Serve the static site with room for concurrent browser module requests."""

from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer


ThreadingHTTPServer.request_queue_size = 128
with ThreadingHTTPServer(
    ("127.0.0.1", 4177), partial(SimpleHTTPRequestHandler, directory="site")
) as server:
    server.serve_forever()
