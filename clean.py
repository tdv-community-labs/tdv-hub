import re

def process_file(filename, css_file, js_file):
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()

    # CSS Replace
    content = re.sub(
        r'<style>.*?</style>',
        f'<link rel="stylesheet" href="styles/{css_file}">',
        content,
        flags=re.DOTALL
    )

    # JS Replace (skip FOUC and Tailwind configs)
    # The FOUC script has "(function()" or "localStorage.getItem"
    # The tailwind script has "tailwind.config"
    # We want to remove all other <script>...</script> tags
    
    script_pattern = re.compile(r'<script.*?>.*?</script>', re.DOTALL)
    
    def script_repl(match):
        script_content = match.group(0)
        if 'tailwind.config' in script_content or 'localStorage.getItem' in script_content:
            return script_content # keep
        if 'src=' in script_content and ('tailwindcss.com' in script_content or 'lucide' in script_content):
            return script_content # keep external CDNs
        return '' # remove custom inline

    content = script_pattern.sub(script_repl, content)
    
    # Add external JS link before </body> if not present
    if f'src="scripts/{js_file}"' not in content:
        content = content.replace('</body>', f'  <script src="scripts/{js_file}" defer></script>\n</body>')

    with open(filename, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Cleaned {filename}")

process_file('index.html', 'hub-main.css', 'hub-ui.js')
process_file('games.html', 'games-catalog.css', 'games-catalog.js')

with open('sso-broker.html', 'r', encoding='utf-8') as f:
    sso_content = f.read()
sso_content = re.sub(r'<script>.*?</script>', '<script src="scripts/sso.js"></script>', sso_content, flags=re.DOTALL)
with open('sso-broker.html', 'w', encoding='utf-8') as f:
    f.write(sso_content)
print("Cleaned sso-broker.html")

