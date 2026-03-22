(function () {
  const hero = document.querySelector(".cv-hero");
  if (hero) {
    requestAnimationFrame(() => hero.classList.add("is-visible"));
  }

  const heroImgs = document.querySelectorAll(".cv-hero-img");
  function parallaxHero() {
    const y = window.scrollY;
    heroImgs.forEach((wrap, i) => {
      const dir = i === 0 ? 1 : -1;
      const offset = Math.min(y * 0.065 * dir, 72);
      wrap.style.transform = `translateY(${offset}px)`;
    });
  }
  window.addEventListener("scroll", parallaxHero, { passive: true });
  parallaxHero();

  const sections = document.querySelectorAll("[data-cv-section]");
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
  );

  sections.forEach((s) => io.observe(s));
})();
