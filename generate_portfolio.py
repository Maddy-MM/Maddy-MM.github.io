import json
from datetime import UTC, datetime
from pathlib import Path

from jinja2 import Environment, FileSystemLoader

# Load JSON data
with Path("portfolio.json").open(encoding="utf-8") as f:
    data = json.load(f)

# Add any extra context if needed
data["current_year"] = datetime.now(tz=UTC).year

# Auto-detect resume file in the resume/ directory if not explicitly specified
if "resume_path" not in data or not Path(data["resume_path"]).is_file():
    resume_files = sorted(Path("resume").glob("*.pdf"), key=lambda p: p.stat().st_mtime, reverse=True)
    if resume_files:
        data["resume_path"] = resume_files[0].as_posix()
    else:
        data["resume_path"] = "resume/Madhav_Makwana_DTU26.pdf"

# Ensure download name is configured and ends with .pdf
if "resume_download_name" not in data:
    data["resume_download_name"] = "Madhav_Makwana_DTU26.pdf"
elif not data["resume_download_name"].lower().endswith(".pdf"):
    data["resume_download_name"] += ".pdf"

if "social_links" in data:
    for link in data["social_links"]:
        if link.get("svg_path"):
            with Path(link["svg_path"]).open(encoding="utf-8") as svg_file:
                link["svg_data"] = svg_file.read()

# Set up Jinja environment
env = Environment(loader=FileSystemLoader("."), autoescape=True)
index_template = env.get_template("index_template.html")
resume_template = env.get_template("resume_template.html")

# Render the template with the data
html_output = index_template.render(**data)
resume_output = resume_template.render(**data)

# This is equivalent to...
# html_output = index_template.render(name=data["name"], label=data["label"]...)
# resume_output = resume_template.render(name=data["name"], label=data["label"]...)

# Write the output to an HTML file
with Path("index.html").open("w", encoding="utf-8") as f:
    f.write(html_output)

with Path("resume.html").open("w", encoding="utf-8") as f:
    f.write(resume_output)

print(f"HTML files generated successfully! (Resume linked: '{data['resume_path']}', download name: '{data['resume_download_name']}')")
