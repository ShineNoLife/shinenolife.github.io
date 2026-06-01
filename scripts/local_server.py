#!/usr/bin/env python3
"""Run and test the local static-site preview server.

Usage:
  python3 scripts/local_server.py
  python3 scripts/local_server.py --port 8010
  python3 scripts/local_server.py --test-only --port 8001
"""

from __future__ import annotations

import argparse
import http.server
import re
import socket
import sys
import threading
import time
import urllib.error
import urllib.request
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_HOST = "127.0.0.1"
DEFAULT_PORT = 8001

ROUTES = (
    "/home/",
    "/blogs/",
    "/gallery/",
    "/blogs/competitive-programming-journey/",
)

ASSETS = (
    "/assets/styles/main.css",
    "/assets/scripts/site/analytics.js",
    "/assets/scripts/site/app.js",
    "/assets/scripts/site/background.js",
    "/analytics/config.js",
    "/blogs/content.js",
    "/gallery/content.js",
    "/home/content.js",
    "/includes/layout/nav.html",
    "/includes/layout/footer.html",
    "/home/files/CV.pdf",
    "/home/images/profile.jpg",
    "/blogs/competitive-programming-journey/images/ICPC_APAC_2025_NUS.jpg",
    "/gallery/images/mttn_2024.jpg",
)

EXPECTED_PAGE_FILES = (
    "index.html",
    "analytics/config.js",
    "home/index.html",
    "home/content.js",
    "home/images/profile.jpg",
    "home/files/CV.pdf",
    "blogs/index.html",
    "blogs/content.js",
    "blogs/competitive-programming-journey/index.html",
    "blogs/competitive-programming-journey/images/ICPC_APAC_2025_NUS.jpg",
    "gallery/index.html",
    "gallery/content.js",
    "gallery/images/mttn_2024.jpg",
)

LEGACY_PATHS = (
    "blogs.html",
    "gallery.html",
    "blogs/blog1.html",
    "blogs/competitive-programming-journey.html",
    "data",
    "assets/documents",
    "assets/images",
    "data/profile.js",
    "data/research.js",
    "data/posts.js",
    "data/gallery.js",
)


class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self) -> None:
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()

    def log_message(self, format: str, *args: object) -> None:
        sys.stderr.write("[local] " + format % args + "\n")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Serve and test the local website.")
    parser.add_argument("--host", default=DEFAULT_HOST)
    parser.add_argument("--port", type=int, default=DEFAULT_PORT)
    parser.add_argument("--test-only", action="store_true", help="Run checks against an already-running server.")
    parser.add_argument("--no-open", action="store_true", help="Reserved for future browser-opening support.")
    return parser.parse_args()


def find_available_port(host: str, preferred: int) -> int:
    for port in range(preferred, preferred + 50):
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
            sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
            try:
                sock.bind((host, port))
            except OSError:
                continue
            return port
    raise RuntimeError(f"No available port found from {preferred} to {preferred + 49}.")


def start_server(host: str, port: int) -> http.server.ThreadingHTTPServer:
    handler = lambda *args, **kwargs: NoCacheHandler(*args, directory=str(ROOT), **kwargs)
    server = http.server.ThreadingHTTPServer((host, port), handler)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    return server


def fetch(url: str) -> tuple[int, bytes]:
    request = urllib.request.Request(url, headers={"Cache-Control": "no-cache"})
    try:
        with urllib.request.urlopen(request, timeout=5) as response:
            return response.status, response.read()
    except urllib.error.HTTPError as error:
        return error.code, error.read()


def assert_ok(base_url: str, path: str) -> None:
    status, _ = fetch(f"{base_url}{path}")
    if status != 200:
        raise AssertionError(f"{path} returned HTTP {status}.")
    print(f"OK {path}")


def assert_current_assets(base_url: str) -> None:
    _, css = fetch(f"{base_url}/assets/styles/main.css")
    css_text = css.decode("utf-8", errors="replace")
    if "--bg: #171b1d" not in css_text or "--text: #d3c6aa" not in css_text:
        raise AssertionError("CSS does not look like the current Everforest-inspired stylesheet.")
    if "cursor-halo" in css_text:
        raise AssertionError("CSS still contains cursor-halo styles.")

    _, app = fetch(f"{base_url}/assets/scripts/site/app.js")
    app_text = app.decode("utf-8", errors="replace")
    if "initCursor" in app_text or "cursor.js" in app_text:
        raise AssertionError("App module still imports cursor effects.")
    if "initAnalytics" not in app_text:
        raise AssertionError("App module does not initialize analytics.")

    _, analytics = fetch(f"{base_url}/assets/scripts/site/analytics.js")
    analytics_text = analytics.decode("utf-8", errors="replace")
    if "static.cloudflareinsights.com/beacon.min.js" not in analytics_text:
        raise AssertionError("Analytics module does not load the Cloudflare beacon.")

    _, analytics_config = fetch(f"{base_url}/analytics/config.js")
    analytics_config_text = analytics_config.decode("utf-8", errors="replace")
    if "shinenolife.github.io" not in analytics_config_text:
        raise AssertionError("Analytics config does not include the GitHub Pages hostname.")
    print("OK current CSS/JS assets")


def assert_gallery_blog_separation() -> None:
    gallery_text = strip_line_comments((ROOT / "gallery/content.js").read_text(encoding="utf-8"))
    posts_text = strip_line_comments((ROOT / "blogs/content.js").read_text(encoding="utf-8"))
    blog_html = "\n".join(path.read_text(encoding="utf-8") for path in (ROOT / "blogs").glob("**/*.html"))

    if "/blogs/" in gallery_text:
        raise AssertionError("gallery/content.js references blog content.")
    if "/gallery/" in posts_text or "/gallery/" in blog_html:
        raise AssertionError("Blog content/pages reference gallery content.")

    gallery_sources = set(re.findall(r'src:\s*"([^"]+)"', gallery_text))
    post_images = set(re.findall(r'image:\s*`?\$?\{?[^`\n"]*"?([^"`]+)"?', posts_text))
    overlap = gallery_sources & post_images
    if overlap:
        raise AssertionError(f"Gallery and post image sources overlap: {sorted(overlap)}")

    print("OK gallery/blog image separation")


def assert_clean_structure() -> None:
    missing = [path for path in EXPECTED_PAGE_FILES if not (ROOT / path).exists()]
    if missing:
        raise AssertionError(f"Expected page files are missing: {missing}")

    leftovers = [path for path in LEGACY_PATHS if (ROOT / path).exists()]
    if leftovers:
        raise AssertionError(f"Legacy files or folders should be removed: {leftovers}")

    print("OK clean folder-backed page structure")


def strip_line_comments(text: str) -> str:
    return "\n".join(line.split("//", 1)[0] for line in text.splitlines())


def run_checks(base_url: str) -> None:
    for path in (*ROUTES, *ASSETS):
        assert_ok(base_url, path)
    assert_current_assets(base_url)
    assert_gallery_blog_separation()
    assert_clean_structure()


def main() -> int:
    args = parse_args()
    host = args.host
    port = args.port if args.test_only else find_available_port(host, args.port)
    base_url = f"http://{host}:{port}"

    server = None
    try:
        if not args.test_only:
            server = start_server(host, port)
            time.sleep(0.2)

        run_checks(base_url)
        print()
        print(f"Local preview: {base_url}/home/")
        print(f"Blogs:         {base_url}/blogs/")
        print(f"Gallery:       {base_url}/gallery/")

        if args.test_only:
            return 0

        print()
        print("Press Ctrl+C to stop the server.")
        while True:
            time.sleep(3600)
    except KeyboardInterrupt:
        print("\nStopping local server.")
        return 0
    except Exception as error:
        print(f"ERROR: {error}", file=sys.stderr)
        return 1
    finally:
        if server:
            server.shutdown()
            server.server_close()


if __name__ == "__main__":
    raise SystemExit(main())
