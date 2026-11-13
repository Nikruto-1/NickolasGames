export const reducedMotion = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
export function scrollToSection(selector) {
  document.querySelector(selector)?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth" });
}
