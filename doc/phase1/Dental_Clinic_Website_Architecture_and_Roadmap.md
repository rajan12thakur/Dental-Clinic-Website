# Dental Clinic Website --- Architecture & Implementation Plan

**Project:** Dental Clinic Website\
**Repository:** https://github.com/rajan12thakur/Dental-Clinic-Website\
**Current stack:** Python 3.11, Django 5.2.18, HTML, CSS, JavaScript,
Bootstrap 5, SQLite for local development\
**Planning status:** Foundation and shared-template integration are in
progress. Build future features in separate GitHub issues and phases.

------------------------------------------------------------------------

## 1. Project Goal

Build a polished, responsive dental-clinic website using Django. Start
with a reliable, reusable frontend foundation, then implement each page
and business feature in small, testable phases.

The implementation should: - Keep Django's project configuration
separate from the website app. - Reuse a common base template,
navigation, and footer. - Organize static assets in a predictable,
namespaced structure. - Use Django URL names rather than hard-coded
links where possible. - Be developed issue-by-issue with feature
branches and pull requests. - Add functionality progressively instead of
building the entire site in one large change.

The current design reference is the **Pearl Dental** HTML template. The
earlier custom **Everbright Dental** starter page may still appear in an
old browser tab; use the current Pearl page when checking the new
integration.

## 2. Technology and Current Environment

-   **Python:** 3.11.0
-   **Django:** 5.2.18
-   **Database for local development:** SQLite (`db.sqlite3`)
-   **Frontend:** HTML, CSS, JavaScript, Bootstrap 5
-   **Editor/OS:** VS Code on Windows, PowerShell terminal
-   **Virtual environment:** `.venv/`
-   **Django project package:** `config`
-   **Django app:** `dental_website`
-   **Project-level templates:** `templates/`
-   **Application static files:**
    `dental_website/static/dental_website/`

SQLite is the current local-development database. A production database
has not been selected in this plan.

## 3. Repository and Git Workflow

Repository: `rajan12thakur/Dental-Clinic-Website`

### Branch responsibilities

-   `main`: stable branch; do not develop features directly here.
-   `develop`: integration branch for completed and reviewed issues.
-   Feature branches: one branch per GitHub issue, created from
    `develop`.

### Standard workflow for every issue

1.  Choose or create a GitHub issue describing one coherent piece of
    work.
2.  Update local `develop` and create a feature branch from it.
3.  Implement only the scope of that issue.
4.  Run relevant checks and manually test the affected page or behavior.
5.  Review `git diff` and `git status`.
6.  Commit with a descriptive message that references the issue when
    practical.
7.  Push the feature branch.
8.  Open a pull request **into `develop`**, not directly into `main`.
9.  Merge after review/checks pass.
10. Start the next issue from the updated `develop`.

Example commands (replace the issue number and branch slug with the
actual issue details):

``` powershell
git switch develop
git pull origin develop
git switch -c <issue-number>-<short-description>

# After implementation and verification:
git status
git diff --check
git diff
git add <intended-files>
git commit -m "Build reusable base template"
git push -u origin <current-feature-branch>
```

Before committing the current work, confirm the branch with:

``` powershell
git branch --show-current
git status --short
```

Do not guess the branch name. Ensure this work is on the Issue #2
feature branch before pushing or opening the PR.

### Files that should generally not be committed

-   `.venv/`
-   `.env` or other secret-bearing environment files
-   `db.sqlite3` for this project's current workflow
-   `__pycache__/`
-   IDE-specific local configuration unless deliberately shared

Keep `requirements.txt`, source code, templates, static assets, and app
migration files under version control. `tree.txt` appears to be a
generated directory listing; do not commit it unless it is intentionally
maintained as project documentation.

## 4. Current Django Architecture

``` text
Dental-Clinic-Website/
├── manage.py
├── requirements.txt
├── README.md
├── .gitignore
├── config/
│   ├── __init__.py
│   ├── settings.py
│   ├── urls.py
│   ├── asgi.py
│   └── wsgi.py
├── dental_website/
│   ├── __init__.py
│   ├── admin.py
│   ├── apps.py
│   ├── models.py
│   ├── tests.py
│   ├── views.py
│   ├── urls.py
│   ├── migrations/
│   ├── templates/
│   │   └── dental_website/
│   │       └── home.html
│   └── static/
│       └── dental_website/
│           ├── css/
│           │   └── site.css
│           ├── js/
│           │   └── site.js
│           ├── images/
│           ├── fonts/
│           └── vendor/
│               └── pearl/
│                   ├── index.html
│                   ├── services.html
│                   ├── css/
│                   ├── img/
│                   └── js/
└── templates/
    ├── base.html
    └── includes/
        ├── navbar.html
        └── footer.html
```

This is a working architectural guide; exact files may change as issues
are implemented. The original Pearl HTML is retained under
`vendor/pearl/` as a reference/source while its page markup is
integrated into Django templates.

### Responsibilities

-   `config/settings.py`: installed apps, template directory, static
    settings, middleware, and other project configuration.
-   `config/urls.py`: root URL routing and inclusion of app URLs.
-   `dental_website/urls.py`: routes owned by the website app, with
    `app_name = "dental_website"`.
-   `dental_website/views.py`: request-handling/view functions for
    website pages.
-   `dental_website/templates/dental_website/`: templates specific to
    this app.
-   `templates/base.html`: shared HTML document structure and shared
    CSS/JavaScript includes.
-   `templates/includes/navbar.html`: reusable navigation.
-   `templates/includes/footer.html`: reusable footer.
-   `dental_website/static/dental_website/`: app-owned CSS, JavaScript,
    images, fonts, and vendor assets.

### URL and template conventions

The homepage route currently uses the namespaced name:

``` python
app_name = "dental_website"
urlpatterns = [
    path("", views.home, name="home"),
]
```

The root project URL configuration includes the app at `/`.

Prefer named URL reversing in templates:

``` django
<a href="{% url 'dental_website:home' %}">Home</a>
```

For links to sections on the homepage:

``` django
<a href="{% url 'dental_website:home' %}#services">Our services</a>
```

Only use a section fragment if that element actually exists on the
destination page. Replace temporary links to standalone HTML files, such
as `index.html` or `services.html`, as Django routes are implemented.

## 5. Shared Template and Static Asset Strategy

### Intended template inheritance

`base.html` owns the common document shell: - `<!DOCTYPE html>`,
`<html>`, `<head>`, and `<body>` - shared font and stylesheet includes -
shared navigation and footer includes - common JavaScript includes -
template blocks such as `title`, `content`, `extra_css`, and `extra_js`

The homepage extends the base template:

``` django
{% extends "base.html" %}

{% block title %}Pearl Dental | Your Smile Matters{% endblock %}

{% block content %}
  <!-- Homepage sections -->
{% endblock %}
```

Any template that directly uses `{% static %}` must load the tag library
in that template:

``` django
{% load static %}
```

This is important for `templates/includes/navbar.html` and
`templates/includes/footer.html` if they use static paths. Loading
`static` in `base.html` does not automatically load it inside included
template files.

### Static asset paths

Use Django's static tag rather than browser-relative paths:

``` django
{% load static %}
<link rel="stylesheet" href="{% static 'dental_website/vendor/pearl/css/style.css' %}">
<img src="{% static 'dental_website/vendor/pearl/img/clinic-map.jpg' %}" alt="Clinic map">
<script src="{% static 'dental_website/vendor/pearl/js/main.js' %}" defer></script>
```

The existing project-level template directory is configured in
`settings.py` as:

``` python
"DIRS": [BASE_DIR / "templates"]
```

The `django.contrib.staticfiles` app is enabled. The expected static URL
prefix is `/static/`.

### Vendor assets versus project assets

-   Keep the supplied Pearl template assets grouped under
    `vendor/pearl/` while using them.
-   Put project-specific styles and scripts in `css/site.css` and
    `js/site.js`.
-   Avoid duplicate/conflicting CSS rules. The Pearl stylesheet and
    existing starter CSS can override one another; verify the rendered
    result before deciding which custom rules to keep.
-   Ensure the same JavaScript library is not included twice.
-   Relative image paths inside CSS, `srcset`, lazy-loading attributes,
    and other asset references must be checked separately; converting
    only ordinary `src="img/..."` paths may not cover every case.
-   Confirm all assets return successfully in the browser's Network tab
    or by checking their URLs.

## 6. Work Completed So Far

### Issue #1 --- Initialize Django project and development environment

Completed and verified: - Created the GitHub repository and the `main`
and `develop` workflow. - Created a Django project package named
`config`. - Created the `dental_website` app and added it to
`INSTALLED_APPS`. - Created the virtual environment and installed Django
5.2.18. - Added `requirements.txt` and `.gitignore`. - Configured the
project-level templates directory. - Applied built-in Django
migrations. - Ran `python manage.py check` successfully. - Started the
development server successfully.

### Issue #2 --- Build reusable base template and shared layout

Implementation is in progress and has been displayed in the browser: -
Added app URL routing and the homepage view. - Added
`templates/base.html`. - Added reusable `templates/includes/navbar.html`
and `templates/includes/footer.html`. - Added
`dental_website/templates/dental_website/home.html`. - Added app static
folders for CSS, JavaScript, images, fonts, and Pearl vendor assets. -
Integrated the Pearl Dental homepage markup into the Django template
structure. - Configured the Pearl Bootstrap CSS, main stylesheet, and
JavaScript assets. - Replaced the footer's plain homepage link with
Django URL reversing. - Fixed a template syntax error by adding
`{% load static %}` to the footer template. - Confirmed earlier that the
homepage route resolved to `/`, `findstatic` located the project CSS,
and the development server served the page and assets successfully
before the latest Pearl integration. - The latest screenshot shows the
Pearl Dental homepage rendering in the browser.

**Before marking Issue #2 complete:** run the checks below, verify all
relevant assets and links, inspect the diff, and commit/push the correct
feature branch. Do not assume this commit has already been made.

## 7. Current Verification Checklist

Run from the repository root with the virtual environment active:

``` powershell
python manage.py check
python manage.py test
git diff --check
git status --short
git diff
```

`python manage.py test` may report that no tests exist yet; that is not
a substitute for adding tests when meaningful application behavior is
implemented.

Useful static-file check:

``` powershell
python manage.py findstatic dental_website/vendor/pearl/css/style.css
```

Manual browser checks: - \[ \] Homepage returns HTTP 200. - \[ \]
Browser console has no relevant JavaScript errors. - \[ \] CSS,
JavaScript, fonts, and images load without 404 responses. - \[ \] Navbar
and footer render once each. - \[ \] Layout works at desktop and mobile
widths. - \[ \] Navigation anchors point to real sections. - \[ \] No
stale `index.html`/`services.html` links remain unless intentionally
used. - \[ \] The appointment form's behavior is understood: it is
currently template/UI markup, not yet a fully implemented booking
backend. - \[ \] No local secrets, virtual environment, database file,
or accidental generated file is staged.

The old Everbright page in an existing browser tab does not prove that
the new Pearl page is broken; check the current URL/tab and refresh with
`Ctrl + F5`.

## 8. Phased Implementation Roadmap

Use separate GitHub issues for the following phases. The list is a
planning proposal; create/adjust issues as the scope becomes clear. Each
phase should be implemented only after the previous relevant foundation
is stable.

### Phase 1 --- Project foundation

**Issue #1: Initialize Django project and development environment** ---
completed.

Deliverables: - Django project and app - virtual environment and
dependencies - settings and URL configuration - `.gitignore` - initial
migrations and successful system check

### Phase 2 --- Shared layout and design system

**Issue #2: Build reusable base template and shared layout** ---
currently being finished.

Deliverables: - `base.html` - reusable navbar and footer - template
inheritance - namespaced static files - Pearl template integration -
responsive shared layout - validated static assets and navigation

### Phase 3 --- Homepage

**Proposed issue: Build responsive dental clinic homepage**

Deliverables: - hero section and primary call to action - services
overview - clinic/value proposition section - dentist/team section -
smile gallery/cases section, if retained from the design - patient
reviews/testimonials section - appointment call to action - correct
section IDs and responsive layout

Reuse the current Pearl design where appropriate; avoid rebuilding the
shared shell inside the homepage template.

### Phase 4 --- Services/treatments page

**Proposed issue: Build treatments and services page**

Deliverables: - Django route and named URL - page-specific template
extending `base.html` - treatment/service content and clear calls to
action - responsive design - correct navbar/footer links

Do not link to the original static `services.html` once the Django page
route exists.

### Phase 5 --- About, team, and clinic information

**Proposed issue: Build clinic/about and dentist team pages or
sections**

Deliverables: - clinic story and values - dentist/team profiles -
credentials or qualifications only when accurate - accessible images and
responsive layout

Decide whether these belong on the homepage as sections, on separate
pages, or both before implementation.

### Phase 6 --- Contact and location

**Proposed issue: Build contact and clinic location page**

Deliverables: - clinic contact details - opening hours - location/map
link - contact form UI and validation plan - server-side handling and
success/error states if the form is made functional

Use real clinic details before production; current Pearl/Chicago details
are template placeholder content and should not be presented as verified
real-world business information.

### Phase 7 --- Appointment booking

**Proposed issue: Implement appointment request workflow**

Deliverables: - define required booking fields and validation - create
appropriate Django model(s), once requirements are agreed - handle
submissions server-side - confirmation and validation/error messages -
admin visibility for requests - prevent accidental duplicate submissions
and handle invalid input - decide how appointment requests are confirmed
and who receives them

The existing appointment form is only frontend/template markup until
this backend work is implemented. Do not imply that appointments are
actually booked yet.

### Phase 8 --- Data models and Django admin

**Proposed issue: Add and manage website content through Django admin**

Potential entities, only if required by the agreed scope: -
services/treatments - dentist/team members - appointment requests -
patient testimonials or reviews - contact enquiries

Plan the model fields and relationships before implementation. Add
migrations, admin configuration, validation, and tests with each
model-related issue. Avoid adding a model just because it is possible;
first decide whether content should be static or admin-managed.

### Phase 9 --- Testing, accessibility, and security

**Proposed issue: Improve quality and cover critical workflows**

Deliverables: - tests for routes, views, forms, and models -
required-field and invalid-input tests - accessibility review (labels,
headings, keyboard use, contrast, alt text) - responsive checks - secure
handling of form data and secrets - appropriate CSRF protection - error
handling and logging where needed

### Phase 10 --- Production readiness and deployment

**Proposed issue: Prepare and deploy the website**

Decisions to make before deployment: - hosting provider and deployment
method - production database choice - environment variable/secrets
strategy - `DEBUG=False`, allowed hosts, HTTPS, and security settings -
static asset collection and serving strategy - backups, logging, and
error monitoring - domain and deployment verification

No production host or production database has been selected yet. Do not
treat local `runserver` as a production deployment.

## 9. Development Principles

1.  **Issue-sized changes:** keep each branch focused on one issue.
2.  **Reusable templates:** shared structure belongs in `base.html` and
    includes, not duplicated on every page.
3.  **Django-native navigation:** use named URL patterns and `{% url %}`
    for internal links.
4.  **Namespaced static files:** use `{% static %}` for static assets
    and keep app-owned files under
    `dental_website/static/dental_website/`.
5.  **Validate before commit:** run system checks, relevant tests,
    `git diff --check`, and manual browser checks.
6.  **Separate frontend from backend behavior:** a form that looks
    functional is not a working form until it has server-side handling
    and a defined workflow.
7.  **Avoid premature complexity:** do not introduce a database model,
    external service, or deployment infrastructure until a requirement
    calls for it.
8.  **Keep secrets out of Git:** use environment variables for secrets
    and commit only safe example configuration.
9.  **Preserve useful migrations:** Django migration files belong in
    version control.
10. **Keep design changes scoped:** first stabilize the template
    integration, then create dedicated issues for responsive polish or
    redesign.

## 10. Immediate Next Actions

1.  Finish Issue #2 verification using the checklist in Section 7.

2.  Check the actual branch name using `git branch --show-current`.

3.  Inspect `git status --short` and `git diff`; exclude `tree.txt` if
    it is only a generated listing.

4.  Stage only intended Issue #2 files.

5.  Commit with a descriptive message, for example:

    ``` powershell
    git add config/settings.py config/urls.py dental_website/views.py dental_website/urls.py dental_website/templates/ dental_website/static/ templates/
    git diff --cached --check
    git diff --cached
    git commit -m "Build reusable base template and shared layout"
    git push -u origin <current-feature-branch>
    ```

    Run the `git add` command only after reviewing the listed paths and
    confirming they are all part of Issue #2. Do not paste the
    placeholder `<current-feature-branch>` literally; use the branch
    name shown by `git branch --show-current`.

6.  Open a pull request from the Issue #2 feature branch into `develop`.

7.  After it is merged, create the next issue and branch from the
    updated `develop`.

8.  Implement the homepage as the next isolated phase, then continue
    through the roadmap.

------------------------------------------------------------------------

## 11. Known Open Decisions

These decisions have not yet been finalized and should be handled in the
relevant issue rather than assumed:

-   Exact set of pages versus homepage sections.
-   Which content should remain static and which should be
    database/admin-managed.
-   Exact appointment request workflow, fields, and confirmation
    process.
-   Whether contact forms, email notifications, or other integrations
    are required.
-   Production database and hosting provider.
-   Final clinic branding and real business contact details.
-   Whether to keep all Pearl vendor assets or remove unused files after
    integration.
-   Which project-specific CSS rules should remain after reviewing
    conflicts with Pearl's stylesheet.

## 12. Definition of Done for Each Issue

An issue is ready for its pull request when: - The change matches the
issue scope. - `python manage.py check` passes. - Relevant tests pass or
any missing test coverage is explicitly understood. - `git diff --check`
passes. - The affected UI/behavior has been manually verified. - No
unrelated files or secrets are included. - Internal links, static paths,
and error states have been checked. - The branch is pushed and the PR
targets `develop`.
