/* NUEPLEX footer reveal + dynamic year */
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".footer-year").forEach((node) => {
    node.textContent = new Date().getFullYear();
  });

  const footers = document.querySelectorAll(".reveal-footer");
  if (!("IntersectionObserver" in window)) {
    footers.forEach((footer) => footer.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver((entries, activeObserver) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        activeObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  footers.forEach((footer) => observer.observe(footer));
});
