#!/usr/bin/env python3
"""Inject the Swarm Build effect into the bundled index.html.

index.html is a self-unpacking bundle: the real page lives as a JSON string in
<script type="__bundler/template">. This script adds swarm-build.css and
swarm-build.js to that template (replacing any earlier injection), so it can be
re-run after exporting a fresh index.html.

Usage: python3 swarm/inject.py [path/to/index.html]
"""
import json
import pathlib
import re
import sys

HERE = pathlib.Path(__file__).resolve().parent
INDEX = pathlib.Path(sys.argv[1]) if len(sys.argv) > 1 else HERE.parent / "index.html"

START, END = "<!-- swarm-build:start -->", "<!-- swarm-build:end -->"
TPL_RE = re.compile(r'(<script type="__bundler/template">)(.*?)(</script>)', re.S)

html = INDEX.read_text(encoding="utf-8")
m = TPL_RE.search(html)
if not m:
    sys.exit("bundle template not found in " + str(INDEX))
tpl = json.loads(m.group(2))

# drop a previous injection
tpl = re.sub(re.escape(START) + r".*?" + re.escape(END) + r"\n?", "", tpl, flags=re.S)
tpl = re.sub(r'<html class="swarm-boot"', "<html", tpl, count=1)

css = (HERE / "swarm-build.css").read_text(encoding="utf-8")
js = (HERE / "swarm-build.js").read_text(encoding="utf-8")
if "</script" in js.lower() or "</style" in css.lower():
    sys.exit("closing tags inside the swarm sources would break the template")

block = f"{START}\n<style id=\"swarm-build-css\">\n{css}</style>\n<script id=\"swarm-build-js\">\n{js}</script>\n{END}\n"

tpl, n = re.subn(r"<html(?=[\s>])", '<html class="swarm-boot"', tpl, count=1)
if not n:
    sys.exit("<html> tag not found in template")
idx = tpl.rfind("</body>")
if idx < 0:
    sys.exit("</body> not found in template")
tpl = tpl[:idx] + block + tpl[idx:]

encoded = re.sub(r"</(?=script)", r"<\\u002F", json.dumps(tpl, ensure_ascii=False), flags=re.I)
html = html[: m.start(2)] + encoded + html[m.end(2):]
INDEX.write_text(html, encoding="utf-8")
print(f"injected swarm build into {INDEX} ({len(js) + len(css)} bytes)")
