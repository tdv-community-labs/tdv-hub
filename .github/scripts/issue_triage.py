import os
import json
from google import genai

API_KEY = os.environ.get("GEMINI_API_KEY")
ISSUE_TITLE = os.environ.get("ISSUE_TITLE", "")
ISSUE_BODY = os.environ.get("ISSUE_BODY", "")
ISSUE_AUTHOR = os.environ.get("ISSUE_AUTHOR", "İstifadəçi")

client = genai.Client(api_key=API_KEY)

prompt = f"""
Sən TDV Community Labs təşkilatının avtomatlaşdırılmış texniki dəstək və idarəetmə agentisən.
Yeni bir Issue daxil olub:

MÜƏLLİF: {ISSUE_AUTHOR}
BAŞLIQ: {ISSUE_TITLE}
MƏTN: {ISSUE_BODY}

TAPŞIRIQ:
1. Bu Issue üçün ən uyğun etiketləri (labels) seç. Seçimlər: ["bug", "enhancement", "documentation", "ui/ux", "question", "help wanted"].
2. İstifadəçiyə cavab olaraq nəzakətli, peşəkar və aydın bir salamlama mətni hazırla. Əgər Issue çox qısadırsa, əlavə detalları (ekran görüntüsü, brauzer versiyası və s.) xahiş et.
3. Çıxışı YALNIZ və YALNIZ aşağıdakı JSON formatında ver, başqa heç bir markdown və ya mətn yazma:

{{
  "labels": ["seçilmiş_etiket1", "seçilmiş_etiket2"],
  "comment": "İstifadəçiyə yazılacaq cavab mətni"
}}
"""

response = None
for model_name in [os.environ.get("GEMINI_MODEL", "gemini-3.8-flash"), "gemini-3.7-flash", "gemini-2.5-flash"]:
    try:
        response = client.models.generate_content(
            model=model_name,
            contents=prompt,
        )
        if response and response.text:
            break
    except Exception as e:
        if any(k in str(e).lower() for k in ["503", "404", "overload", "demand", "unavailable", "unsupported"]):
            continue
        raise

raw_text = response.text.strip()
if raw_text.startswith("```"):
    raw_text = raw_text.split("```")[1]
    if raw_text.startswith("json"):
        raw_text = raw_text[4:].strip()
    raw_text = raw_text.strip()

try:
    data = json.loads(raw_text)
except Exception:
    data = {
        "labels": ["question"],
        "comment": f"Salam @{ISSUE_AUTHOR}, bildirişiniz qeydə alındı. Tezliklə komandamız tərəfindən araşdırılacaq."
    }

with open("triage_output.json", "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("[+] Issue triage məlumatı hazırlandı.")
