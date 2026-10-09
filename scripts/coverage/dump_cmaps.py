"""Record which codepoints a platform's built-in fonts cover.

Reads the cmap of every font under the given directories and writes
vendor/coverage/<id>.json as compact [start, end] ranges. Glypher's build
(scripts/build-unicode-index.mjs) folds these into the picker's portability
ranking.

    pip install fonttools brotli
    python scripts/coverage/dump_cmaps.py macos macOS "macOS 26.6" /System/Library/Fonts

Arguments: platform id, display name, where the fonts came from, font dirs.

Only point it at fonts that ship with the OS — user-installed fonts would
overstate what other people's machines can show. Apple's LastResort font
(the placeholder boxes) is always skipped.
"""
import json
import os
import sys
from datetime import date

from fontTools.ttLib import TTCollection, TTFont

FONT_EXTS = (".ttf", ".otf", ".ttc", ".otc")


def codepoints(path):
    try:
        if path.lower().endswith((".ttc", ".otc")):
            fonts = TTCollection(path, lazy=True).fonts
        else:
            fonts = [TTFont(path, lazy=True)]
        out = set()
        for f in fonts:
            out.update((f.getBestCmap() or {}).keys())
        return out
    except Exception as e:  # damaged or unsupported file: skip, but say so
        print(f"skip {path}: {e}", file=sys.stderr)
        return set()


def to_ranges(cps):
    ranges = []
    for cp in sorted(cps):
        if ranges and cp == ranges[-1][1] + 1:
            ranges[-1][1] = cp
        else:
            ranges.append([cp, cp])
    return ranges


def main():
    if len(sys.argv) < 5:
        sys.exit(__doc__)
    pid, name, source, dirs = sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4:]
    cps, count = set(), 0
    for d in dirs:
        for root, _, files in os.walk(d):
            for fn in files:
                if "LastResort" in fn or not fn.lower().endswith(FONT_EXTS):
                    continue
                cps |= codepoints(os.path.join(root, fn))
                count += 1
    here = os.path.dirname(os.path.abspath(__file__))
    out = os.path.join(here, "../../vendor/coverage", f"{pid}.json")
    with open(out, "w") as fh:
        json.dump(
            {"id": pid, "name": name, "source": source, "fonts": count, "measured": date.today().isoformat(), "ranges": to_ranges(cps)},
            fh,
            separators=(",", ":"),
        )
    print(f"{pid}: {count} fonts, {len(cps)} codepoints -> {os.path.normpath(out)}")


if __name__ == "__main__":
    main()
