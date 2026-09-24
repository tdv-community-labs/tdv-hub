import os
import json
import urllib.request
from google import genai

API_KEY = os.environ.get("GEMINI_API_KEY")
client = genai.Client(api_key=API_KEY)

# Yoxlanılacaq layihələr və onların canlı veb ünvanları
TARGET_SERVICES = [
    {"name": "tdv-hub", "url": "https://tdv-community-labs.github.io/tdv-hub/"},
    {"name": "tdv-mafia", "url": "https://tdv-community-labs.github.io/tdv-mafia/"},
    {"name": "tdv-e-school", "url": "https://tdv-community-labs.github.io/tdv-e-school/"},
    {"name": "tdv-games", "url": "https://tdv-community-labs.github.io/tdv-games/"},
    {"name": "school-minifootball-tournament", "url": "https://tdv-community-labs.github.io/school-minifootball-tournament/"}
]

status_reports = []
has_failures = False

for target in TARGET_SERVICES:
    name = target["name"]
    url = target["url"]
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 TDV-Monitor'})
        with urllib.request.urlopen(req, timeout=10) as response:
            status = response.getcode()
            status_reports.append({"name": name, "url": url, "status": status, "state": "OK"})
    except Exception as e:
        has_failures = True
        status_reports.append({"name": name, "url": url, "status": "ERROR", "state": str(e)})

# Nəticəni analiz etmək üçün Gemini-yə göndər
report_json = json.dumps(status_reports, indent=2, ensure_ascii=False)

prompt = f"""
Sən TDV Community Labs təşkilatının DevOps və Sistem Monitorinq agentisən.
Təşkilatın 5 canlı layihəsi yoxlanıldı. Monitorinq nəticələri:

{report_json}

Əgər heç bir xəta yoxdursa:
Xülasə bildir və bütün sistemlərin stabil olduğunu vurğula.

Əgər hər hansı layihədə xəta (ERROR, 404, Timeout və s.) varsa:
1. Xətalı xidmətləri siyahıya al.
2. Potensial səbəbi (DNS, repo parametrləri, GitHub Pages build xətası) izah et.
3. Aradan qaldırılması üçün konkret addımlar təklif et.

Nəticəni səliqəli Markdown cədvəli və tövsiyələrlə tərtib et.
"""

response = client.models.generate_content(
    model="gemini-2.5-flash",
    contents=prompt,
)

summary = response.text

with open("health_report.md", "w", encoding="utf-8") as f:
    f.write(summary)

# Xəta varsa çıxış təyin et
with open("health_status.env", "w", encoding="utf-8") as f:
    f.write(f"HAS_FAILURES={'true' if has_failures else 'false'}\n")

print("[+] Sağlamlıq yoxlanışı tamamlandı.")
