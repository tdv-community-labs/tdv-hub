import os
import glob
import subprocess
from google import genai

API_KEY = os.environ.get("GEMINI_API_KEY")
TARGET_REPO = os.environ.get("TARGET_REPO", "tdv-hub")
ISSUE_TITLE = os.environ.get("ISSUE_TITLE", "Ümumi kod optimizasiyası və refaktorinq")
ISSUE_BODY = os.environ.get("ISSUE_BODY", "Xətaları aradan qaldır, kodu müasirləşdir və təmizlə.")

client = genai.Client(api_key=API_KEY)

# Repo daxilindəki kodları topla
files_context = ""
target_extensions = ("*.js", "*.jsx", "*.ts", "*.tsx", "*.html", "*.css", "*.py", "*.json")
excluded_folders = ["node_modules", ".git", "dist", "build", ".github", ".next"]

for ext in target_extensions:
    for filepath in glob.glob(f"**/{ext}", recursive=True):
        if not any(excluded in filepath for excluded in excluded_folders):
            try:
                with open(filepath, "r", encoding="utf-8") as f:
                    files_context += f"\n--- START OF FILE: {filepath} ---\n"
                    files_context += f.read()
                    files_context += f"\n--- END OF FILE: {filepath} ---\n"
            except Exception:
                pass

prompt = f"""
Sən TDV Community Labs təşkilatının peşəkar full-stack tərtibatçısısan.
Hazırda işlədiyin repozitoriya: {TARGET_REPO}

HƏLL EDİLMƏLİ TAPŞIRIQ:
Başlıq: {ISSUE_TITLE}
Təfərrüat: {ISSUE_BODY}

MÖVCUD KOD BAZASI:
{files_context}

TƏLƏBLƏR:
1. Tapşırığı tam və xətasız şəkildə həll et.
2. YALNIZ dəyişdirilməli və ya yeni yaradılmalı olan faylların TAM kodunu ver.
3. Cavab formatı MÜTLƏQ belə olmalıdır:

FILE: faylin/nisbi/yolu.ext
[CODE_START]
// tam kod buraya
[CODE_END]

Heç bir əlavə giriş, çıxış və ya izahat mətni yazma.
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

content = response.text
blocks = content.split("FILE: ")

modified_count = 0
for block in blocks[1:]:
    lines = block.strip().split("\n")
    target_file = lines[0].strip()
    
    code_part = "\n".join(lines[1:])
    if "[CODE_START]" in code_part and "[CODE_END]" in code_part:
        clean_code = code_part.split("[CODE_START]")[1].split("[CODE_END]")[0].strip()
    elif "```" in code_part:
        clean_code = code_part.split("```")[1]
        if clean_code.startswith(("javascript", "python", "typescript", "html", "css", "jsx", "tsx", "json")):
            clean_code = clean_code.split("\n", 1)[1]
        clean_code = clean_code.strip()
    else:
        clean_code = code_part.strip()
        
    dirname = os.path.dirname(target_file)
    if dirname:
        os.makedirs(dirname, exist_ok=True)

    with open(target_file, "w", encoding="utf-8") as f:
        f.write(clean_code)
    print(f"[+] Yeniləndi: {target_file}")
    modified_count += 1

print(f"[*] Cəmi dəyişdirilən fayl sayı: {modified_count}")
