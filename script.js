const sections = document.querySelectorAll(".reveal");

const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

if (prefersReducedMotion) {
  sections.forEach((section) => section.classList.add("in-view"));
} else {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2, rootMargin: "0px 0px -30px 0px" }
  );

  sections.forEach((section, index) => {
    section.style.transitionDelay = `${Math.min(index * 80, 320)}ms`;
    observer.observe(section);
  });
}

const carousels = document.querySelectorAll("[data-carousel]");

carousels.forEach((carousel) => {
  const track = carousel.querySelector("[data-carousel-track]");
  const slides = Array.from(carousel.querySelectorAll("[data-carousel-slide]"));
  const findControl = (selector) => {
    if (carousel.querySelector(selector)) return carousel.querySelector(selector);
    const parent = carousel.parentElement;
    if (parent && parent.querySelector(selector)) return parent.querySelector(selector);
    const section = carousel.closest("section");
    if (section && section.querySelector(selector)) return section.querySelector(selector);
    return null;
  };

  const prevBtn = findControl("[data-carousel-prev]");
  const nextBtn = findControl("[data-carousel-next]");
  const dotsWrap = carousel.querySelector("[data-carousel-dots]");
  const status = carousel.querySelector("[data-carousel-status]");

  if (!track || slides.length === 0) return;

  let currentIndex = 0;

  let dots = [];
  let metrics = null;

  const getMetrics = () => {
    const slideWidth = slides[0].getBoundingClientRect().width;
    const gapValue = getComputedStyle(track).gap || "0";
    const gap = Number.parseFloat(gapValue) || 0;
    const visibleCount = Math.max(
      1,
      Math.round(track.clientWidth / (slideWidth + gap))
    );
    const maxIndex = Math.max(0, slides.length - visibleCount);
    return { slideWidth, gap, visibleCount, maxIndex };
  };

  const buildDots = (count) => {
    if (!dotsWrap) return [];
    dotsWrap.innerHTML = "";
    const newDots = [];
    for (let index = 0; index < count; index += 1) {
      const dot = document.createElement("button");
      dot.className = "dot";
      dot.type = "button";
      dot.setAttribute("role", "tab");
      dot.setAttribute("aria-selected", "false");
      if (track.id) dot.setAttribute("aria-controls", track.id);
      dot.setAttribute("aria-label", `Go to review ${index + 1}`);
      dot.dataset.carouselDot = "";
      dotsWrap.appendChild(dot);
      newDots.push(dot);
    }
    return newDots;
  };

  const update = (newIndex, setFocus = false) => {
    if (!metrics) metrics = getMetrics();
    const positions = metrics.maxIndex + 1;
    if (positions === 0) return;

    currentIndex = ((newIndex % positions) + positions) % positions;

    const offset = currentIndex * (metrics.slideWidth + metrics.gap);
    track.style.transform = `translateX(-${offset}px)`;

    slides.forEach((slide, index) => {
      const isActive =
        index >= currentIndex &&
        index < currentIndex + metrics.visibleCount;
      slide.classList.toggle("is-active", isActive);
      slide.setAttribute("aria-hidden", isActive ? "false" : "true");
    });

    dots.forEach((dot, index) => {
      const isActive = index === currentIndex;
      dot.classList.toggle("is-active", isActive);
      dot.setAttribute("aria-selected", isActive ? "true" : "false");
      if (isActive && setFocus) dot.focus();
    });

    if (status) {
      const start = currentIndex + 1;
      const end = Math.min(currentIndex + metrics.visibleCount, slides.length);
      status.textContent = `Showing ${start}-${end} of ${slides.length}`;
    }
  };

  const refresh = () => {
    metrics = getMetrics();
    const positions = metrics.maxIndex + 1;
    if (dotsWrap && dots.length !== positions) {
      dots = buildDots(positions);
      dots.forEach((dot, index) => {
        dot.addEventListener("click", () => update(index, true));
      });
    }
    update(Math.min(currentIndex, metrics.maxIndex));
  };

  refresh();

  prevBtn?.addEventListener("click", () => update(currentIndex - 1, true));
  nextBtn?.addEventListener("click", () => update(currentIndex + 1, true));

  carousel.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      update(currentIndex - 1, true);
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      update(currentIndex + 1, true);
    }
  });

  window.addEventListener("resize", () => {
    refresh();
  });
});
