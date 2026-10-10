
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parent
SOURCE = (
    ROOT / "dental_website" / "static" / "dental_website"
    / "vendor" / "pearl" / "index.html"
)
TEMPLATES = ROOT / "templates"
INCLUDES = TEMPLATES / "includes"

if not SOURCE.exists():
    raise FileNotFoundError(f"Pearl index.html not found: {SOURCE}")

html = SOURCE.read_text(encoding="utf-8")

body_match = re.search(r"<body\b[^>]*>(.*?)</body\s*>", html, re.I | re.S)
if not body_match:
    raise ValueError("Could not find the body in Pearl index.html.")

body = body_match.group(1)

header_match = re.search(r"<header\b[\s\S]*?</header\s*>", body, re.I)
footer_match = re.search(r"<footer\b[\s\S]*?</footer\s*>", body, re.I)

if not header_match or not footer_match:
    raise ValueError(
        "Could not identify the header/footer. No files were changed. "
        "Inspect the original HTML before continuing."
    )

navbar = header_match.group(0)
footer = footer_match.group(0)

# Remove shared components from the page-specific content.
body = body.replace(navbar, "", 1)
body = body.replace(footer, "", 1)

# Load shared CSS and JavaScript through Django's static system.
body = re.sub(
    r'<script\b[^>]*src=["\']js/(?:vendor/bootstrap\.bundle\.min\.js|main\.js)["\'][^>]*>\s*</script>',
    "",
    body,
    flags=re.I,
)

# Convert relative image paths into Django static references.
def convert_images(content):
    return re.sub(
        r'(?P<prefix>\b(?:src|data-src)=["\'])img/(?P<path>[^"\']+)(?P<suffix>["\'])',
        lambda m: (
            m.group("prefix")
            + "{% static 'dental_website/vendor/pearl/img/"
            + m.group("path")
            + "' %}"
            + m.group("suffix")
        ),
        content,
        flags=re.I,
    )

navbar = convert_images(navbar)
footer = convert_images(footer)
body = convert_images(body)

# Remove empty whitespace at the edges of the extracted content.
body = body.strip()

TEMPLATES.mkdir(parents=True, exist_ok=True)
INCLUDES.mkdir(parents=True, exist_ok=True)

(INCLUDES / "navbar.html").write_text(navbar + "\n", encoding="utf-8")
(INCLUDES / "footer.html").write_text(footer + "\n", encoding="utf-8")

base_template = """{% load static %}
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Modern dental care for healthier smiles.">
    <title>{% block title %}Pearl Dental{% endblock %}</title>

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;600;700;800&family=Mulish:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&display=swap" rel="stylesheet">

    <script>document.documentElement.classList.add('js')</script>

    <link rel="stylesheet" href="{% static 'dental_website/vendor/pearl/css/vendor/bootstrap.min.css' %}">
    <link rel="stylesheet" href="{% static 'dental_website/vendor/pearl/css/style.css' %}">
    <link rel="stylesheet" href="{% static 'dental_website/css/site.css' %}">

    {% block extra_css %}{% endblock %}
</head>
<body>
    {% include "includes/navbar.html" %}

    <main id="main-content">
        {% block content %}{% endblock %}
    </main>

    {% include "includes/footer.html" %}

    <script src="{% static 'dental_website/vendor/pearl/js/vendor/bootstrap.bundle.min.js' %}" defer></script>
    <script src="{% static 'dental_website/vendor/pearl/js/main.js' %}" defer></script>
    <script src="{% static 'dental_website/js/site.js' %}" defer></script>

    {% block extra_js %}{% endblock %}
</body>
</html>
"""

home_template = (
    '{% extends "base.html" %}\n'
    '{% load static %}\n'
    '{% block title %}Pearl Dental | Your Smile Matters{% endblock %}\n'
    '{% block content %}\n'
    + body
    + '\n{% endblock %}\n'
)

# Write the files only after successfully extracting the required sections.
home_dir = ROOT / "dental_website" / "templates" / "dental_website"
home_dir.mkdir(parents=True, exist_ok=True)

(TEMPLATES / "base.html").write_text(base_template, encoding="utf-8")
(home_dir / "home.html").write_text(home_template, encoding="utf-8")

print("Pearl integration files created:")
print("  templates/base.html")
print("  templates/includes/navbar.html")
print("  templates/includes/footer.html")
print("  dental_website/templates/dental_website/home.html")
print("Review the files and test the site before committing.")
