import os
import json
from datetime import datetime
from google import genai

API_KEY = os.environ.get("GEMINI_API_KEY")
TOPIC = os.environ.get("TOPIC", "Yeni layihə və turnir xəbərləri")
RAW_DETAILS = os.environ.get("RAW_DETAILS", "TDV Community Labs ekosisteminə yeni yenilənmələr əlavə olundu.")

client = genai.Client(api_key=API_KEY)

today_str = datetime.now().strftime("%Y-%m-%d")

prompt = f"""
Sən TDV Community Labs təşkilatının və məktəb kampus portalının (tdv-hub) baş redaktoru və ictimaiyyətlə əlaqələr agentisən.
Məktəb icması və şagirdlər üçün cəlbedici, ruhlandırıcı və rəsmi bir kampus elanı/xəbəri hazırla.

XƏBƏRİN MÖVZUSU: {TOPIC}
XAM TƏFƏRRÜAT: {RAW_DETAILS}
TARİX: {today_str}

TƏLƏBLƏR:
1. Başlıq: Diqqətçəkən və qısa başlıq seç.
2. Xülasə: 1-2 cümləlik giriş.
3. Əsas mətn: Hadisənin təfərrüatları, iştirakçılara və ya oxuculara çağırış (Call to Action).
4. İkonlar: Mətnin içində uyğun emojilərdən istifadə et.
5. YALNIZ və YALNIZ aşağıdakı JSON formatında cavab ver:

{{
  "id": "{today_str}-{TOPIC.lower().replace(' ', '-')[:20]}",
  "date": "{today_str}",
  "title": "Xəbər Başlığı",
  "summary": "Qısa xülasə",
  "content": "Ətraflı xəbər mətni",
  "category": "Turnir / Tədris / Ekosistem"
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
    news_item = json.loads(raw_text)
except Exception:
    news_item = {
        "id": f"{today_str}-elan",
        "date": today_str,
        "title": TOPIC,
        "summary": RAW_DETAILS[:100],
        "content": RAW_DETAILS,
        "category": "Ümumi"
    }

news_file = "announcements.json"
announcements = []

if os.path.exists(news_file):
    try:
        with open(news_file, "r", encoding="utf-8") as f:
            announcements = json.load(f)
    except Exception:
        announcements = []

# Yeni xəbəri siyahının ən əvvəlinə əlavə et
announcements.insert(0, news_item)

with open(news_file, "w", encoding="utf-8") as f:
    json.dump(announcements, f, ensure_ascii=False, indent=2)

print(f"[+] Elan uğurla əlavə olundu: {news_item.get('title')}")
