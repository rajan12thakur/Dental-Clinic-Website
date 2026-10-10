/* ==========================================================================
   Pearl — vanilla JS (no jQuery)
   One function per feature, guard clauses, IntersectionObserver,
   honours prefers-reduced-motion. Progressive enhancement throughout.
   ========================================================================== */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- Mobile navigation ------------------------------------------------- */
  function initMobileNav() {
    var toggle = document.querySelector("[data-nav-toggle]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (!toggle || !menu) return;

    var panel = menu.querySelector(".mobile-panel");
    var closeBtn = menu.querySelector("[data-nav-close]");

    function open() {
      menu.classList.add("open");
      toggle.setAttribute("aria-expanded", "true");
      document.body.style.overflow = "hidden";
      var first = menu.querySelector("a, button");
      if (first) first.focus();
    }
    function close() {
      menu.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
      toggle.focus();
    }

    toggle.addEventListener("click", open);
    if (closeBtn) closeBtn.addEventListener("click", close);
    menu.addEventListener("click", function (e) {
      if (e.target === menu) close();
    });
    menu.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", close);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && menu.classList.contains("open")) close();
    });
  }

  /* ---- Navbar shadow on scroll ------------------------------------------- */
  function initNavScroll() {
    var nav = document.querySelector("[data-site-nav]");
    if (!nav) return;
    var onScroll = function () {
      nav.classList.toggle("scrolled", window.scrollY > 8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---- Scrollspy for nav links ------------------------------------------- */
  function initScrollSpy() {
    var links = Array.prototype.slice.call(document.querySelectorAll(".nav-links a[href^='#']"));
    if (!links.length || !("IntersectionObserver" in window)) return;
    var map = {};
    links.forEach(function (l) {
      var id = l.getAttribute("href").slice(1);
      var sec = document.getElementById(id);
      if (sec) map[id] = l;
    });
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          links.forEach(function (l) { l.classList.remove("active"); });
          var active = map[en.target.id];
          if (active) active.classList.add("active");
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    Object.keys(map).forEach(function (id) { obs.observe(document.getElementById(id)); });
  }

  /* ---- Reveal on scroll -------------------------------------------------- */
  function initReveal() {
    var els = document.querySelectorAll(".reveal");
    if (!els.length) return;
    if (reduceMotion || !("IntersectionObserver" in window)) {
      els.forEach(function (el) { el.classList.add("in"); });
      return;
    }
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add("in");
          obs.unobserve(en.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    els.forEach(function (el) { obs.observe(el); });
  }

  /* ---- Count-up trust badges --------------------------------------------- */
  function initCountUp() {
    var nums = document.querySelectorAll("[data-count]");
    if (!nums.length) return;
    if (reduceMotion || !("IntersectionObserver" in window)) {
      nums.forEach(function (n) { n.textContent = format(n, +n.getAttribute("data-count")); });
      return;
    }
    function format(el, val) {
      var suffix = el.getAttribute("data-suffix") || "";
      var prefix = el.getAttribute("data-prefix") || "";
      return prefix + Math.round(val).toLocaleString("en-US") + suffix;
    }
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        var target = +el.getAttribute("data-count");
        var dur = 1400, start = null;
        function tick(ts) {
          if (!start) start = ts;
          var p = Math.min((ts - start) / dur, 1);
          var eased = 1 - Math.pow(1 - p, 3);
          el.textContent = format(el, target * eased);
          if (p < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
        obs.unobserve(el);
      });
    }, { threshold: 0.5 });
    nums.forEach(function (n) { obs.observe(n); });
  }

  /* ---- Before / after slider --------------------------------------------- */
  function initBeforeAfter() {
    var comp = document.querySelector("[data-ba]");
    if (!comp) return;
    var after = comp.querySelector(".ba-after");
    var handle = comp.querySelector(".ba-handle");
    var range = comp.querySelector(".ba-range");
    var beforeImg = comp.querySelector(".ba-before");
    var afterImg = comp.querySelector(".ba-after");
    var beforeTag = comp.querySelector(".ba-tag.before");
    var afterTag = comp.querySelector(".ba-tag.after");

    function setPos(pct) {
      pct = Math.max(0, Math.min(100, pct));
      if (after) after.style.clipPath = "inset(0 0 0 " + pct + "%)";
      if (handle) handle.style.left = pct + "%";
      if (range) range.value = pct;
    }
    if (range) {
      range.addEventListener("input", function () { setPos(+range.value); });
    }
    setPos(50);

    // Case switcher
    var cases = document.querySelectorAll("[data-ba-case]");
    cases.forEach(function (btn) {
      btn.addEventListener("click", function () {
        cases.forEach(function (b) { b.classList.remove("active"); b.setAttribute("aria-pressed", "false"); });
        btn.classList.add("active");
        btn.setAttribute("aria-pressed", "true");
        var b = btn.getAttribute("data-before");
        var a = btn.getAttribute("data-after");
        var label = btn.getAttribute("data-label") || "";
        if (beforeImg && b) { beforeImg.src = b; beforeImg.alt = "Before treatment: " + label; }
        if (afterImg && a) { afterImg.src = a; afterImg.alt = "After treatment: " + label; }
        setPos(50);
      });
    });
  }

  /* ---- Testimonials slider ----------------------------------------------- */
  function initTestimonials() {
    var root = document.querySelector("[data-tsl]");
    if (!root) return;
    var track = root.querySelector(".tsl-track");
    var slides = Array.prototype.slice.call(root.querySelectorAll(".tsl-slide"));
    var prev = root.querySelector("[data-tsl-prev]");
    var next = root.querySelector("[data-tsl-next]");
    var dotsWrap = root.querySelector("[data-tsl-dots]");
    if (slides.length < 2) return;

    var idx = 0, timer = null;

    // Build dots
    slides.forEach(function (_, i) {
      var d = document.createElement("button");
      d.className = "tsl-dot" + (i === 0 ? " active" : "");
      d.type = "button";
      d.setAttribute("aria-label", "Go to review " + (i + 1));
      d.addEventListener("click", function () { go(i); reset(); });
      dotsWrap.appendChild(d);
    });
    var dots = Array.prototype.slice.call(dotsWrap.children);

    function go(i) {
      idx = (i + slides.length) % slides.length;
      track.style.transform = "translateX(" + (-idx * 100) + "%)";
      dots.forEach(function (d, k) { d.classList.toggle("active", k === idx); });
      slides.forEach(function (s, k) { s.setAttribute("aria-hidden", k === idx ? "false" : "true"); });
    }
    track.style.transition = reduceMotion ? "none" : "transform .5s cubic-bezier(.4,0,.2,1)";
    track.style.display = "flex";

    if (next) next.addEventListener("click", function () { go(idx + 1); reset(); });
    if (prev) prev.addEventListener("click", function () { go(idx - 1); reset(); });

    function auto() { if (reduceMotion) return; timer = setInterval(function () { go(idx + 1); }, 6000); }
    function reset() { if (timer) clearInterval(timer); auto(); }

    root.addEventListener("mouseenter", function () { if (timer) clearInterval(timer); });
    root.addEventListener("mouseleave", reset);
    go(0);
    auto();
  }

  /* ---- Appointment / booking form validation ----------------------------- */
  function initForms() {
    var forms = document.querySelectorAll("[data-appt-form]");
    forms.forEach(function (form) {
      form.setAttribute("novalidate", "novalidate");
      var success = form.querySelector(".form-success");

      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var valid = true;
        var fields = form.querySelectorAll("[data-required]");
        fields.forEach(function (input) {
          var wrap = input.closest(".field") || input.parentElement;
          var ok = validateField(input);
          input.classList.toggle("is-invalid", !ok);
          if (wrap) wrap.classList.toggle("invalid", !ok);
          if (!ok && valid) input.focus();
          if (!ok) valid = false;
        });
        if (!valid) return;
        form.querySelectorAll(".form-control, .form-select, .btn[type='submit']").forEach(function (el) {
          if (el.tagName === "BUTTON") { el.disabled = true; el.textContent = "Booking…"; }
        });
        // Simulated success (static template)
        if (success) {
          success.classList.add("show");
          success.setAttribute("role", "status");
        }
        var visibleFields = form.querySelector(".appt-fields");
        if (visibleFields) visibleFields.style.display = "none";
      });

      form.querySelectorAll("[data-required]").forEach(function (input) {
        input.addEventListener("input", function () {
          var wrap = input.closest(".field") || input.parentElement;
          if (input.classList.contains("is-invalid")) {
            var ok = validateField(input);
            input.classList.toggle("is-invalid", !ok);
            if (wrap) wrap.classList.toggle("invalid", !ok);
          }
        });
      });
    });

    function validateField(input) {
      var val = (input.value || "").trim();
      if (!val) return false;
      if (input.type === "tel") return val.replace(/[^0-9]/g, "").length >= 7;
      if (input.type === "email") return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
      return true;
    }
  }

  /* ---- Set min date on date inputs (today) ------------------------------- */
  function initDateMin() {
    var inputs = document.querySelectorAll("input[type='date']");
    if (!inputs.length) return;
    var t = new Date();
    var iso = t.getFullYear() + "-" + String(t.getMonth() + 1).padStart(2, "0") + "-" + String(t.getDate()).padStart(2, "0");
    inputs.forEach(function (i) { if (!i.min) i.min = iso; });
  }

  /* ---- Smooth-scroll offset for anchor links ----------------------------- */
  function initAnchors() {
    document.querySelectorAll("a[href^='#']:not([href='#'])").forEach(function (a) {
      a.addEventListener("click", function (e) {
        var id = a.getAttribute("href").slice(1);
        var target = document.getElementById(id);
        if (!target) return;
        e.preventDefault();
        var y = target.getBoundingClientRect().top + window.scrollY - 88;
        window.scrollTo({ top: y, behavior: reduceMotion ? "auto" : "smooth" });
      });
    });
  }

  /* ---- Init -------------------------------------------------------------- */
  function init() {
    initMobileNav();
    initNavScroll();
    initScrollSpy();
    initReveal();
    initCountUp();
    initBeforeAfter();
    initTestimonials();
    initForms();
    initDateMin();
    initAnchors();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
