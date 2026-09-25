with open('sw.js', 'r', encoding='utf-8') as f:
    sw = f.read()

sw = sw.replace("'tdv-hub-v4'", "'tdv-hub-v5'")
new_assets = """const STATIC_ASSETS = [
  './',
  './index.html',
  './games.html',
  './manifest.json',
  './scripts/hub-ui.js',
  './scripts/games-catalog.js',
  './scripts/sso.js',
  './styles/hub-main.css',
  './styles/games-catalog.css'
];"""
import re
sw = re.sub(r'const STATIC_ASSETS = \[.*?\];', new_assets, sw, flags=re.DOTALL)

with open('sw.js', 'w', encoding='utf-8') as f:
    f.write(sw)
print("Updated sw.js")
