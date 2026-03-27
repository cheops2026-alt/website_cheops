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

  const track = document.getElementById("cvTeamworkScrollTrack");
  const layers = document.querySelectorAll(".cv-stack-layer");
  const cta = document.getElementById("cvTeamworkCta");
  const n = layers.length;

  function updateTeamworkStack() {
    if (!track || !n) return;

    const top = track.getBoundingClientRect().top + window.scrollY;
    const h = track.offsetHeight;
    const wh = window.innerHeight;
    const start = top;
    const end = top + h - wh;
    const denom = Math.max(1, end - start);
    let p = (window.scrollY - start) / denom;
    p = Math.max(0, Math.min(1, p));

    layers.forEach((layer, i) => {
      const peelStart = i / n;
      const peelEnd = (i + 1) / n;
      let op = 1;
      let ty = 0;
      if (p <= peelStart) {
        op = 1;
        ty = 0;
      } else if (p >= peelEnd) {
        op = 0;
        ty = -52;
      } else {
        const t = (p - peelStart) / (peelEnd - peelStart);
        op = 1 - t;
        ty = -52 * t;
      }
      layer.style.opacity = String(op);
      layer.style.transform = `translateY(${ty}px) scale(${1 - (1 - op) * 0.04})`;
      layer.style.visibility = op < 0.02 ? "hidden" : "visible";
    });

    if (cta) {
      if (p >= 0.97) {
        cta.classList.add("is-visible");
        cta.setAttribute("aria-hidden", "false");
      } else {
        cta.classList.remove("is-visible");
        cta.setAttribute("aria-hidden", "true");
      }
    }
  }

  if (track && layers.length) {
    window.addEventListener("scroll", updateTeamworkStack, { passive: true });
    window.addEventListener("resize", updateTeamworkStack, { passive: true });
    updateTeamworkStack();
  }
})();
