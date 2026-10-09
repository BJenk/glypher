"""Download the fonts Android ships, as listed in AOSP's fonts.xml.

    python scripts/coverage/fetch_android_fonts.py /tmp/android-fonts
    python scripts/coverage/dump_cmaps.py android Android "Android (AOSP main)" /tmp/android-fonts

Font files live across several AOSP repos; this walks them to find each file
fonts.xml names. The colour emoji font isn't in those repos, so it comes from
Google Fonts. Uses only the standard library.
"""
import base64
import json
import os
import re
import sys
import time
import urllib.request

AOSP = "https://android.googlesource.com/"
REPOS = [
    "platform/external/noto-fonts",
    "platform/external/roboto-fonts",
    "platform/external/roboto-flex-fonts",
    "platform/external/google-fonts/carrois-gothic-sc",
    "platform/external/google-fonts/coming-soon",
    "platform/external/google-fonts/cutive-mono",
    "platform/external/google-fonts/dancing-script",
    "platform/external/google-fonts/source-sans-pro",
]
EMOJI = "https://raw.githubusercontent.com/google/fonts/main/ofl/notocoloremoji/NotoColorEmoji-Regular.ttf"


def get(url):
    for attempt in range(8):  # googlesource rate-limits hard; back off
        try:
            data = urllib.request.urlopen(url, timeout=180).read()
            time.sleep(0.3)
            return data
        except Exception:
            if attempt == 7:
                raise
            time.sleep(2**attempt)


def text(repo, path):
    return base64.b64decode(get(f"{AOSP}{repo}/+/refs/heads/main/{path}?format=TEXT"))


def listing(repo, path=""):
    raw = get(f"{AOSP}{repo}/+/refs/heads/main/{path}?format=JSON").decode()
    return json.loads(raw[4:])["entries"]  # strip the )]}' guard


def main():
    out = sys.argv[1] if len(sys.argv) > 1 else "android-fonts"
    os.makedirs(out, exist_ok=True)
    fonts_xml = text("platform/frameworks/base", "data/fonts/fonts.xml").decode()
    wanted = set(re.findall(r"[A-Za-z0-9_-]+\.(?:ttf|otf|ttc)", fonts_xml))

    where = {}
    for e in listing("platform/frameworks/base", "data/fonts"):
        if e["name"] in wanted:
            where[e["name"]] = ("platform/frameworks/base", "data/fonts/" + e["name"])

    def walk(repo, path=""):
        for e in listing(repo, path):
            p = f"{path}/{e['name']}" if path else e["name"]
            if e["type"] == "tree":
                walk(repo, p)
            elif e["name"] in wanted:
                where.setdefault(e["name"], (repo, p))

    for repo in REPOS:
        walk(repo)

    for name, (repo, path) in sorted(where.items()):
        dest = os.path.join(out, name)
        if not os.path.exists(dest):
            with open(dest, "wb") as fh:
                fh.write(text(repo, path))
    emoji = os.path.join(out, "NotoColorEmoji.ttf")
    if not os.path.exists(emoji):
        with open(emoji, "wb") as fh:
            fh.write(get(EMOJI))

    missing = sorted(wanted - set(where) - {n for n in wanted if n.startswith("NotoColorEmoji")})
    print(f"{len(where) + 1} fonts in {out}; not found: {missing or 'none'}")


if __name__ == "__main__":
    main()
