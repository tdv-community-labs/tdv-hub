import os
import glob
from google import genai

API_KEY = os.environ.get("GEMINI_API_KEY")
ISSUE_TITLE = os.environ.get("ISSUE_TITLE", "Kod optimizasiyası")
ISSUE_BODY = os.environ.get("ISSUE_BODY", "Xətaları düzəlt və kodu təkmilləşdir.")

client = genai.Client(api_key=API_KEY)

# Kontekst topla
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
Sən peşəkar full-stack tərtibatçısan. Layihənin kodları aşağıda verilib.
Sənə həll etməli olduğun bir tapşırıq (Issue) təqdim olunur.

TAPŞIRIQ BAŞLIĞI: {ISSUE_TITLE}
DETALLAR: {ISSUE_BODY}

MÖVCUD KOD BAZASI:
{files_context}

TƏLƏB:
1. Tapşırığı tam və xətasız yerinə yetir.
2. YALNIZ dəyişdirilməli olan faylların TAM yenilənmiş kodunu ver.
3. Cavab formatı MÜTLƏQ belə olmalıdır:

FILE: faylin/tam/yolu.ext
[CODE_START]
// tam kod buraya
[CODE_END]

Heç bir əlavə izahat mətni yazma.
"""

response = client.models.generate_content(
    model="gemini-2.5-flash",
    contents=prompt,
)

content = response.text
blocks = content.split("FILE: ")

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
    print(f"[+] Dəyişiklik yazıldı: {target_file}")
