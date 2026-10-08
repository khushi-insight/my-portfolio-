(function () {
    "use strict";

    var root = document.documentElement;
    root.classList.add("js");

    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /* ---------- Navbar: scrolled state ---------- */
    var nav = document.getElementById("nav");
    function onScroll() {
        nav.classList.toggle("is-scrolled", window.scrollY > 12);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    /* ---------- Mobile menu ---------- */
    var toggle = document.getElementById("nav-toggle");
    var links = document.getElementById("nav-links");

    function setMenu(open) {
        links.classList.toggle("is-open", open);
        toggle.setAttribute("aria-expanded", String(open));
        toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    }
    toggle.addEventListener("click", function () {
        setMenu(toggle.getAttribute("aria-expanded") !== "true");
    });
    links.addEventListener("click", function (e) {
        if (e.target.closest("a")) setMenu(false);
    });
    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape") setMenu(false);
    });
    document.addEventListener("click", function (e) {
        if (!nav.contains(e.target)) setMenu(false);
    });
    window.addEventListener("resize", function () {
        if (window.innerWidth > 860) setMenu(false);
    });

    /* ---------- Active link indicator ---------- */
    var navLinks = Array.prototype.slice.call(document.querySelectorAll(".nav__link"));
    var sections = navLinks
        .map(function (a) { return document.querySelector(a.getAttribute("href")); })
        .filter(Boolean);

    function setActive(id) {
        navLinks.forEach(function (a) {
            var on = a.getAttribute("href") === "#" + id;
            a.classList.toggle("is-active", on);
            if (on) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current");
        });
    }

    if ("IntersectionObserver" in window) {
        var spy = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) setActive(entry.target.id);
            });
        }, { rootMargin: "-45% 0px -50% 0px", threshold: 0 });
        sections.forEach(function (s) { spy.observe(s); });
    }

    /* ---------- Scroll reveal ---------- */
    var revealEls = Array.prototype.slice.call(document.querySelectorAll(".reveal"));

    // gentle stagger for siblings inside the same grid/list
    revealEls.forEach(function (el) {
        var parent = el.parentElement;
        var sibs = Array.prototype.filter.call(parent.children, function (c) { return c.classList.contains("reveal"); });
        var i = sibs.indexOf(el);
        if (i > 0) el.style.setProperty("--d", Math.min(i, 5) * 90 + "ms");
    });

    if ("IntersectionObserver" in window && !reduceMotion) {
        var io = new IntersectionObserver(function (entries, obs) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-visible");
                    obs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
        revealEls.forEach(function (el) { io.observe(el); });
    } else {
        revealEls.forEach(function (el) { el.classList.add("is-visible"); });
    }

    /* ---------- Portrait: slight pointer movement (desktop only) ---------- */
    var frame = document.getElementById("portrait-frame");
    var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (frame && finePointer && !reduceMotion) {
        var hero = document.getElementById("home");
        hero.addEventListener("mousemove", function (e) {
            var r = hero.getBoundingClientRect();
            var x = (e.clientX - r.left) / r.width - 0.5;
            var y = (e.clientY - r.top) / r.height - 0.5;
            frame.style.transform = "translate(" + (x * 10).toFixed(1) + "px," + (y * 10).toFixed(1) + "px)";
        });
        hero.addEventListener("mouseleave", function () { frame.style.transform = ""; });
    }

    /* ---------- Contact form ---------- */
    // The original form had no backend. This opens the visitor's email app with
    // the message pre-filled. Change CONTACT_EMAIL once the real address is known,
    // or swap this handler for a form service (Formspree, Web3Forms, etc.).
    var CONTACT_EMAIL = "your-email@gmail.com";
    var form = document.getElementById("contact-form");
    var status = document.getElementById("form-status");

    if (form) {
        form.addEventListener("submit", function (e) {
            e.preventDefault();
            var fields = ["name", "email", "message"].map(function (n) { return form.elements[n]; });
            var ok = true;

            fields.forEach(function (f) {
                var valid = f.value.trim() !== "" && (f.type !== "email" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.value.trim()));
                f.parentElement.classList.toggle("has-error", !valid);
                if (!valid) ok = false;
            });

            if (!ok) {
                status.textContent = "Please fill in all fields with a valid email.";
                return;
            }

            var subject = "Portfolio enquiry from " + form.elements.name.value.trim();
            var body = form.elements.message.value.trim() + "\n\n— " + form.elements.name.value.trim() + " (" + form.elements.email.value.trim() + ")";
            status.textContent = "Opening your email app…";
            window.location.href = "mailto:" + CONTACT_EMAIL + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
            form.reset();
        });
        form.addEventListener("input", function (e) {
            if (e.target.parentElement) e.target.parentElement.classList.remove("has-error");
        });
    }

    /* ---------- Footer year ---------- */
    var year = document.getElementById("year");
    if (year) year.textContent = new Date().getFullYear();
})();
