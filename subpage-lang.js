(function () {
  const langToggle = document.getElementById("langToggle");
  const currentLangEl = document.getElementById("currentLang");
  let isEnglish = true;

  if (langToggle && currentLangEl) {
    langToggle.addEventListener("click", () => {
      isEnglish = !isEnglish;
      const lang = isEnglish ? "en" : "ar";
      currentLangEl.textContent = isEnglish ? "EN" : "AR";
      document.documentElement.lang = lang;
      document.body.classList.toggle("rtl", !isEnglish);

      document.querySelectorAll("[data-en]").forEach((el) => {
        const text = el.getAttribute(`data-${lang}`);
        if (text) el.textContent = text;
      });
    });
  }
})();
