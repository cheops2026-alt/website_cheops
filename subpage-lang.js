/**
 * subpage-lang.js — Lightweight EN/AR toggle for subpages that use subpage-common header
 *
 * Expects: #langToggle, #currentLang, and elements with data-en + data-ar (same attribute pair per element).
 * Also updates data-title-en / data-title-ar for title attributes (e.g. icon buttons).
 * Toggles document.documentElement.lang and body.rtl for Arabic layout.
 */
(function () {
  const langToggle = document.getElementById("langToggle");
  const currentLangEl = document.getElementById("currentLang");
  let isEnglish = true;

  function applyLanguage(lang) {
    document.documentElement.lang = lang;
    document.body.classList.toggle("rtl", lang === "ar");

    document.querySelectorAll("[data-en]").forEach((el) => {
      const text = el.getAttribute(`data-${lang}`);
      if (!text) return;
      const tag = el.tagName;
      if (tag === "IMG") {
        el.setAttribute("alt", text);
      } else if (tag === "TITLE") {
        el.textContent = text;
      } else {
        el.textContent = text;
      }
    });

    document.querySelectorAll("[data-title-en]").forEach((el) => {
      const t =
        lang === "en"
          ? el.getAttribute("data-title-en")
          : el.getAttribute("data-title-ar");
      if (t) el.setAttribute("title", t);
    });
  }

  if (langToggle && currentLangEl) {
    langToggle.addEventListener("click", () => {
      isEnglish = !isEnglish;
      const lang = isEnglish ? "en" : "ar";
      currentLangEl.textContent = isEnglish ? "EN" : "AR";
      applyLanguage(lang);
    });
  }
})();
