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
