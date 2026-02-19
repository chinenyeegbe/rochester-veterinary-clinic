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
  const prevBtn = carousel.querySelector("[data-carousel-prev]");
  const nextBtn = carousel.querySelector("[data-carousel-next]");
  const dots = Array.from(carousel.querySelectorAll("[data-carousel-dot]"));
  const status = carousel.querySelector("[data-carousel-status]");

  if (!track || slides.length === 0) return;

  let currentIndex = 0;

  const update = (newIndex, setFocus = false) => {
    currentIndex = (newIndex + slides.length) % slides.length;
    const offset = currentIndex * -100;
    track.style.transform = `translateX(${offset}%)`;

    slides.forEach((slide, index) => {
      const isActive = index === currentIndex;
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
      status.textContent = `Slide ${currentIndex + 1} of ${slides.length}`;
    }
  };

  update(0);

  prevBtn?.addEventListener("click", () => update(currentIndex - 1, true));
  nextBtn?.addEventListener("click", () => update(currentIndex + 1, true));

  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => update(index, true));
  });

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
});
