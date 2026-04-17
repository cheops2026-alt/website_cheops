/**
 * core-values.js — Core Values page interactions
 *
 * 1) Hero: immediate .is-visible; optional parallax on .cv-hero-img wrappers
 * 2) Sections: IntersectionObserver adds .is-visible to [data-cv-section] for scroll reveals
 * 3) Photo stacks: every [data-cv-stack] gets an isolated drag-to-peel controller (pointer events).
 *    Optional sibling .cv-stack-cta inside .cv-teamwork-stack-stage appears when all layers are peeled
 *    (used on Teamwork section only).
 */
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
        /* threshold must include 0: very tall sections never reach a high visible
           fraction at once, so a single higher threshold alone may never fire. */
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
        }
      });
    },
    { threshold: [0, 0.08], rootMargin: "0px 0px -5% 0px" }
  );

  sections.forEach((s) => io.observe(s));

  const PEEL_THRESHOLD_PX = window.matchMedia("(pointer: coarse)").matches
    ? 52
    : 64;

  function baseRotationsForCount(n) {
    if (n <= 0) return [];
    if (n === 1) return [0];
    const half = 22.5;
    const span = 2 * half;
    const step = span / (n - 1);
    return Array.from({ length: n }, (_, i) => -half + i * step);
  }

  /** Binds pointer drag/peel logic to one stack element; state is closed over per instance. */
  function initPhotoStack(stack) {
    const layers = Array.from(stack.querySelectorAll(".cv-stack-layer"));
    const stage = stack.closest(".cv-teamwork-stack-stage");
    const cta = stage ? stage.querySelector(".cv-stack-cta") : null;
    const n = layers.length;
    if (!n) return;

    const BASE_ROT = baseRotationsForCount(n);

    function layerBaseTransform(i) {
      const deg = BASE_ROT[i] ?? 0;
      return `rotate(${deg}deg)`;
    }

    let removed = 0;
    let dragging = false;
    let peeling = false;
    let ptrId = null;
    let startX = 0;
    let startY = 0;
    let lastClientX = 0;
    let lastClientY = 0;
    let smoothDx = 0;
    let smoothDy = 0;

    function setCtaVisible(show) {
      if (!cta) return;
      if (show) {
        cta.classList.add("is-visible");
        cta.setAttribute("aria-hidden", "false");
      } else {
        cta.classList.remove("is-visible");
        cta.setAttribute("aria-hidden", "true");
      }
    }

    function syncLayers() {
      layers.forEach((layer, i) => {
        layer.style.transition = "";
        if (i < removed) {
          layer.style.opacity = "0";
          layer.style.visibility = "hidden";
          layer.style.transform = "";
        } else {
          layer.style.visibility = "visible";
          layer.style.zIndex = String(100 - (i - removed));
          if (i > removed) {
            layer.style.opacity = "1";
            layer.style.transform = layerBaseTransform(i);
          } else if (i === removed && !dragging && !peeling) {
            layer.style.opacity = "1";
            layer.style.transform = layerBaseTransform(i);
          }
        }
      });
      setCtaVisible(removed >= n);
    }

    function topLayer() {
      return removed < n ? layers[removed] : null;
    }

    function onPointerDown(e) {
      if (peeling || removed >= n) return;
      if (!topLayer()) return;
      dragging = true;
      stack.classList.add("is-dragging");
      ptrId = e.pointerId;
      startX = e.clientX;
      startY = e.clientY;
      lastClientX = startX;
      lastClientY = startY;
      smoothDx = 0;
      smoothDy = 0;
      try {
        stack.setPointerCapture(e.pointerId);
      } catch (_) {}
      const el = topLayer();
      if (el) el.style.transition = "";
    }

    function onPointerMove(e) {
      if (!dragging || e.pointerId !== ptrId) return;
      lastClientX = e.clientX;
      lastClientY = e.clientY;
      const el = topLayer();
      if (!el) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      const k = 0.52;
      smoothDx += (dx - smoothDx) * k;
      smoothDy += (dy - smoothDy) * k;
      const dist = Math.hypot(smoothDx, smoothDy);
      const fade = Math.max(0.44, 1 - dist / 340);
      const br = BASE_ROT[removed] != null ? BASE_ROT[removed] : 0;
      const dragTilt = smoothDx * 0.072 + smoothDy * 0.028;
      const tilt = Math.max(-40, Math.min(40, dragTilt));
      const scale = 1 - Math.min(dist / 980, 0.09);
      el.style.opacity = String(fade);
      el.style.transform = `translate(${smoothDx}px, ${smoothDy}px) rotate(${br + tilt}deg) scale(${scale})`;
    }

    function finishPeel(el, dx, dy) {
      peeling = true;
      const len = Math.hypot(dx, dy) || 1;
      const nx = dx / len;
      const ny = dy / len;
      const fling = 2.55;
      const vx = dx * fling + nx * 28;
      const vy = dy * fling + ny * 28;
      const br = BASE_ROT[removed] != null ? BASE_ROT[removed] : 0;
      const exitTilt = Math.max(-45, Math.min(45, dx * 0.11 + dy * 0.045));
      const endRot = br + exitTilt + (nx * 12 + ny * 6);
      el.style.transition =
        "transform 0.62s cubic-bezier(0.18, 0.82, 0.22, 1), opacity 0.55s cubic-bezier(0.18, 0.82, 0.22, 1)";
      el.style.transform = `translate(${vx}px, ${vy}px) rotate(${endRot}deg) scale(0.9)`;
      el.style.opacity = "0";

      let settled = false;
      const done = () => {
        if (settled) return;
        settled = true;
        el.removeEventListener("transitionend", onEnd);
        removed += 1;
        el.style.transform = "";
        el.style.transition = "";
        peeling = false;
        syncLayers();
      };

      function onEnd(ev) {
        if (ev.propertyName !== "opacity" && ev.propertyName !== "transform") return;
        done();
      }

      el.addEventListener("transitionend", onEnd);
      window.setTimeout(() => {
        if (!peeling || settled) return;
        done();
      }, 680);
    }

    function springBack(el) {
      const i = removed;
      el.style.transition =
        "transform 0.56s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.45s cubic-bezier(0.22, 1, 0.36, 1)";
      el.style.transform = layerBaseTransform(i);
      el.style.opacity = "1";

      function clearT() {
        el.removeEventListener("transitionend", clearT);
        el.style.transition = "";
      }
      el.addEventListener("transitionend", clearT, { once: true });
    }

    function onPointerUp(e) {
      if (e.pointerId !== ptrId) return;
      if (dragging) {
        dragging = false;
        stack.classList.remove("is-dragging");
        try {
          stack.releasePointerCapture(e.pointerId);
        } catch (_) {}
      }
      ptrId = null;

      if (peeling || removed >= n) return;

      const el = topLayer();
      if (!el) return;

      const dx = lastClientX - startX;
      const dy = lastClientY - startY;
      const dist = Math.hypot(dx, dy);
      const useDx = smoothDx || dx;
      const useDy = smoothDy || dy;

      if (dist >= PEEL_THRESHOLD_PX) {
        finishPeel(el, useDx, useDy);
      } else {
        springBack(el);
      }
    }

    layers.forEach((img) => img.setAttribute("draggable", "false"));

    syncLayers();
    stack.addEventListener("pointerdown", onPointerDown);
    stack.addEventListener("pointermove", onPointerMove);
    stack.addEventListener("pointerup", onPointerUp);
    stack.addEventListener("pointercancel", onPointerUp);
  }

  document.querySelectorAll("[data-cv-stack]").forEach(initPhotoStack);
})();
