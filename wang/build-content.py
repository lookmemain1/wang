"""Regenerate js/content-bundle.js from content/*.json (run after editing JSON files)."""
import json
from pathlib import Path

ROOT = Path(__file__).parent
FILES = {
    "transcript": "prolanis-transcript.json",
    "soap": "prolanis-soap.json",
    "prolanisCoding": "prolanis-coding.json",
    "tbCoding": "tb-discharge-coding.json",
    "geriatricCdss": "geriatric-cdss.json",
    "prolanisCdss": "prolanis-cdss.json",
    "chatPresets": "chat-presets.json",
}

data = {
    key: json.loads((ROOT / "content" / name).read_text(encoding="utf-8"))
    for key, name in FILES.items()
}

out = ROOT / "js" / "content-bundle.js"
out.write_text(
    "window.COGNITAS_CONTENT = "
    + json.dumps(data, ensure_ascii=False, separators=(",", ":"))
    + ";\n",
    encoding="utf-8",
)
print(f"Wrote {out} ({out.stat().st_size} bytes)")
