/**
 * Observes elements with given selector using the Intersection Observer API.
 * 
 * @param {string} selector 
 * @param {Function} onIntersect 
 * @param {IntersectionObserverInit} options 
 * @returns {IntersectionObserver}
 */
export function observeElements(selector, onIntersect, options = { root: null, threshold: 0 }) {
  const elements = document.querySelectorAll(selector);
  const observer = new IntersectionObserver(entries => {
    requestAnimationFrame(() => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          onIntersect(entry, observer);
        }
      });
    });
  }, options);

  elements.forEach(element => observer.observe(element));
  return observer;
}