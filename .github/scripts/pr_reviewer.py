import os
import subprocess
from google import genai

API_KEY = os.environ.get("GEMINI_API_KEY")
PR_TITLE = os.environ.get("PR_TITLE", "Bilinməyən PR")
PR_BODY = os.environ.get("PR_BODY", "")

client = genai.Client(api_key=API_KEY)

# PR zamanı dəyişdirilmiş faylların fərqini (git diff) əldə et
try:
    diff_output = subprocess.check_output(
        ["git", "diff", "origin/main...HEAD"],
        text=True,
        encoding="utf-8",
        errors="ignore"
    )
except Exception:
    diff_output = "Diff əldə edilə bilmədi."

if not diff_output.strip():
    review_comment = "ℹ️ Bu Pull Request-də yoxlanılacaq kod fərqi aşkar edilmədi."
else:
    prompt = f"""
Sən TDV Community Labs təşkilatının baş mühəndisisən (Senior Code Reviewer).
Aşağıdakı Pull Request üçün hərtərəfli və peşəkar kod icmalı hazırla.

PR BAŞLIĞI: {PR_TITLE}
PR TƏSVİRİ: {PR_BODY}

KOD FƏRQLƏRİ (GIT DIFF):
{diff_output[:15000]}

TƏHLİL QAYDALARI:
1. Xülasə: Dəyişikliyin məğzini 1-2 cümlə ilə xarakterizə et.
2. Təhlükəsizlik və Keyfiyyət: XSS, SQLi, açıq API açarları və ya potensial səhvləri vurğula.
3. Təkliflər və Düzəlişlər: Kodu daha optimal etmək üçün konkret təkliflər ver.
4. Qərar: PR-ın birləşdirilməyə hazır olub-olmadığını bildir (Məs: 🟢 Merge üçün uyğundur və ya 🟡 Düzəliş tələb olunur).

Cavabı səliqəli Markdown formatında (başlıqlar və bullet point-lər ilə) tərtib et.
"""
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
    )
    review_comment = response.text

# Nəticəni sonrakı addımda şərh yazmaq üçün fayla çıxar
with open("review_result.md", "w", encoding="utf-8") as f:
    f.write(review_comment)

print("[+] PR icmalı uğurla hazırlandı.")
