/* ============================================================
   GGEN — interakcije: navigacija, animacije, brojači, forma
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  /* ---------- navbar: solid background after scrolling ---------- */
  const navbar = document.querySelector(".navbar");
  const onScroll = () => navbar.classList.toggle("scrolled", window.scrollY > 40);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- mobile menu ---------- */
  const burger = document.querySelector(".nav-burger");
  const links = document.querySelector(".nav-links");
  if (burger && links) {
    burger.addEventListener("click", () => {
      burger.classList.toggle("open");
      links.classList.toggle("open");
    });
    links.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => {
        burger.classList.remove("open");
        links.classList.remove("open");
      })
    );
  }

  /* ---------- highlight current page in nav ---------- */
  const page = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-links a").forEach((a) => {
    if (a.getAttribute("href") === page) a.classList.add("active");
  });

  /* ---------- scroll-reveal animations ---------- */
  const revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("visible");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("visible"));
  }

  /* ---------- animated counters ----------
     <span class="count" data-count="6.45" data-decimals="2">0</span>
     Decimal separator follows the active language:
     comma for ME/IT/DE, point for EN/ZH. */
  const counters = document.querySelectorAll(".count");
  const COMMA_LANGS = ["me", "it", "de"];

  const fmt = (value, decimals) => {
    const lang = localStorage.getItem("ggen-lang") || "me";
    const s = value.toFixed(decimals);
    return COMMA_LANGS.includes(lang) ? s.replace(".", ",") : s;
  };

  const animate = (el) => {
    const target = parseFloat(el.dataset.count);
    const decimals = parseInt(el.dataset.decimals || "0", 10);
    const dur = 1600;
    const t0 = performance.now();
    const step = (t) => {
      const p = Math.min((t - t0) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(target * eased, decimals);
      if (p < 1) requestAnimationFrame(step);
      else el.dataset.done = "1";
    };
    requestAnimationFrame(step);
  };

  if ("IntersectionObserver" in window) {
    const cio = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            animate(e.target);
            cio.unobserve(e.target);
          }
        });
      },
      { threshold: 0.4 }
    );
    counters.forEach((el) => cio.observe(el));
  } else {
    counters.forEach((el) => {
      el.textContent = fmt(parseFloat(el.dataset.count), parseInt(el.dataset.decimals || "0", 10));
    });
  }

  // re-format finished counters when the language changes (decimal comma vs point)
  document.addEventListener("ggen:lang", () => {
    counters.forEach((el) => {
      if (el.dataset.done) {
        el.textContent = fmt(parseFloat(el.dataset.count), parseInt(el.dataset.decimals || "0", 10));
      }
    });
  });

  /* ---------- contact form → opens email client ----------
     No backend needed; can later be replaced by a form service
     (e.g. Formspree) by posting to its endpoint instead. */
  const form = document.getElementById("contact-form");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const get = (id) => (document.getElementById(id) || {}).value || "";
      const name = get("cf-name");
      const email = get("cf-email");
      const phone = get("cf-phone");
      const msg = get("cf-msg");
      const lang = localStorage.getItem("ggen-lang") || "me";
      const subjects = {
        me: "Upit sa sajta — ",
        en: "Website enquiry — ",
        it: "Richiesta dal sito — ",
        de: "Anfrage über die Website — ",
        zh: "网站咨询 — "
      };
      const subject = (subjects[lang] || subjects.me) + name;
      const bodyLines = [msg, "", "— " + name, email, phone].filter(Boolean);
      location.href =
        "mailto:office@ggen.me?subject=" +
        encodeURIComponent(subject) +
        "&body=" +
        encodeURIComponent(bodyLines.join("\n"));
    });
  }

  /* ---------- footer year ---------- */
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
});
