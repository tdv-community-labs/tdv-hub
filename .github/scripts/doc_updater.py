import os
import subprocess
from datetime import datetime
from google import genai

API_KEY = os.environ.get("GEMINI_API_KEY")
PR_TITLE = os.environ.get("PR_TITLE", "Yenilənmə")
PR_BODY = os.environ.get("PR_BODY", "")

client = None
if API_KEY:
    try:
        client = genai.Client(api_key=API_KEY)
    except Exception:
        pass

# Son commit fərqlərini götür
try:
    recent_diff = subprocess.check_output(
        ["git", "diff", "HEAD~1..HEAD"],
        text=True,
        encoding="utf-8",
        errors="ignore"
    )
except Exception:
    recent_diff = "Dəyişiklik fərqi tapılmadı."

changelog_path = "CHANGELOG.md"
existing_changelog = ""
if os.path.exists(changelog_path):
    with open(changelog_path, "r", encoding="utf-8") as f:
        existing_changelog = f.read()

prompt = f"""
Sən TDV Community Labs təşkilatının texniki sənədləşdirmə agentisən.
Layihəyə indicə yeni bir dəyişiklik (PR) birləşdirildi:

PR BAŞLIĞI: {PR_TITLE}
PR İZAHI: {PR_BODY}
DƏYİŞİKLİK DIFF:
{recent_diff[:10000]}

MÖVCUD CHANGELOG:
{existing_changelog[:3000]}

TAPŞIRIQ:
Bu dəyişiklik üçün bu günün tarixinə ({datetime.now().strftime('%Y-%m-%d')}) uyğun qısa və peşəkar bir Changelog bölməsi hazırla.
Format belə olmalıdır:

### [{datetime.now().strftime('%Y-%m-%d')}] - {PR_TITLE}
- **Yenilik / Düzəliş**: Dəyişikliyin izahı
- **Təsir sahəsi**: Hansı modullar və ya fayllar yeniləndi

YALNIZ bu yeni bölmənin Markdown mətnini qaytar, əlavə heç bir izahat yazma.
"""

response = None
if client:
    for model_name in [os.environ.get("GEMINI_MODEL", "gemini-3.8-flash"), "gemini-3.7-flash", "gemini-2.5-flash"]:
        try:
            response = client.models.generate_content(
                model=model_name,
                contents=prompt,
            )
            if response and response.text:
                break
        except Exception:
            continue

if response and response.text:
    new_entry = response.text.strip()
else:
    new_entry = f"### [{datetime.now().strftime('%Y-%m-%d')}] - {PR_TITLE}\n- **Yenilik / Düzəliş**: {PR_BODY or 'Avtomatik qeydə alınan PR dəyişiklikləri.'}\n- **Təsir sahəsi**: Birləşdirilən fayllar."

# Yeni qeydi CHANGELOG.md faylının ən başına əlavə et
header = "# Layihə Tarixçəsi (Changelog)\n\nBütün mühüm dəyişikliklər avtomatik qeydə alınır.\n\n"
if existing_changelog.startswith("# Layihə Tarixçəsi (Changelog)"):
    updated_content = existing_changelog.replace(header, header + new_entry + "\n\n", 1)
else:
    updated_content = header + new_entry + "\n\n" + existing_changelog

with open(changelog_path, "w", encoding="utf-8") as f:
    f.write(updated_content)

print("[+] CHANGELOG.md uğurla yeniləndi.")
