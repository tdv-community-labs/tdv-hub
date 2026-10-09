import os
import json
import urllib.request
from google import genai

API_KEY = os.environ.get("GEMINI_API_KEY")
client = genai.Client(api_key=API_KEY)

# Yoxlanılacaq layihələr və onların canlı veb ünvanları
TARGET_SERVICES = [
    {"name": "tdv-hub", "url": "https://tdv-community-labs.github.io/tdv-hub/"},
    {"name": "tdv-e-school", "url": "https://tdv-e-school.vercel.app/"},
    {"name": "school-minifootball-tournament", "url": "https://school-minifootball-tournament.vercel.app/"},
    {"name": "tdv-games", "url": "https://tdv-games.vercel.app/"},
    {"name": "tdv-mafia", "url": "https://tdv-mafia.vercel.app/"},
    {"name": "tdv-boardgames", "url": "https://tdv-boardgames.vercel.app/"}
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

response = None
attempt_errors = []
for model_name in [os.environ.get("GEMINI_MODEL", "gemini-3.8-flash"), "gemini-3.7-flash", "gemini-2.5-flash"]:
    try:
        response = client.models.generate_content(
            model=model_name,
            contents=prompt,
        )
        if response and response.text:
            break
        attempt_errors.append(f"{model_name}: boş cavab")
    except Exception as e:
        attempt_errors.append(f"{model_name}: {str(e)}")
        if any(k in str(e).lower() for k in ["503", "404", "overload", "demand", "unavailable", "unsupported"]):
            continue
        raise

if response and response.text:
    summary = response.text
else:
    table_rows = "\n".join([
        f"| {item['name']} | {item['status']} | {item['state']} |"
        for item in status_reports
    ])
    recommendations = "- Gemini cavabı əldə olunmadı, monitorinq xülasəsi avtomatik yaradıldı."
    if attempt_errors:
        recommendations += "\n- Gemini cəhd detalları:\n" + "\n".join([f"  - {e}" for e in attempt_errors[-3:]])
    summary = (
        "## 🌐 TDV Ekosistem Sağlamlıq Hesabatı\n\n"
        "| Layihə | Status | Hal |\n"
        "|---|---|---|\n"
        f"{table_rows}\n\n"
        "### Tövsiyələr\n"
        f"{recommendations}\n"
    )

with open("health_report.md", "w", encoding="utf-8") as f:
    f.write(summary)

# Xəta varsa çıxış təyin et
with open("health_status.env", "w", encoding="utf-8") as f:
    f.write(f"HAS_FAILURES={'true' if has_failures else 'false'}\n")

print("[+] Sağlamlıq yoxlanışı tamamlandı.")
