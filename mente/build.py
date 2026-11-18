#!/usr/bin/env python3
"""Construye mente-mv.html (un solo archivo) desde mente/src + mente/protocolo.json."""
import base64, json, pathlib
R = pathlib.Path(__file__).resolve().parent
src = R / 'src'
def b64(p, mime): return f'data:{mime};base64,' + base64.b64encode((src / p).read_bytes()).decode()
icon512 = b64('icon-512.png', 'image/png')
manifest = {"name": "Mente MV", "short_name": "Mente MV", "start_url": "./mente-mv.html", "display": "standalone",
            "background_color": "#0E0C0A", "theme_color": "#0E0C0A", "icons": [{"src": icon512, "sizes": "512x512", "type": "image/png"}]}
proto = json.loads((R / 'protocolo.json').read_text())
html = (src / 'template.html').read_text()
for k, v in {
    'MANIFEST': 'data:application/manifest+json;base64,' + base64.b64encode(json.dumps(manifest).encode()).decode(),
    'ICON180': b64('icon-180.png', 'image/png'), 'ICON32': b64('icon-32.png', 'image/png'),
    'CSS': (src / 'app.css').read_text(),
    'PROTOCOLO': json.dumps(proto, ensure_ascii=False).replace('</', '<\\/'),
    'ENGINE': (src / 'engine.js').read_text(), 'UI': (src / 'ui.js').read_text(),
}.items():
    html = html.replace('{{' + k + '}}', v)
out = R.parent / 'mente-mv.html'
out.write_text(html)
print(out, len(html))
