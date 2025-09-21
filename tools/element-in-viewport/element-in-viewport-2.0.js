/**
 * Madj2kElementInViewport
 *
 * Adds a CSS class to any DOM element once it becomes fully (or partially) visible
 * in the viewport using the IntersectionObserver API.
 *
 * - Purely CSS-triggered transitions via class
 * - Reusable for any type of element (quotes, sections, etc.)
 * - Fully configurable: class name, threshold, delay
 * - Designed for CMS contexts with dynamically loaded content
 *
 * @author Steffen Kroggel <developer@steffenkroggel.de>
 * @copyright 2025 Steffen Kroggel
 * @version 1.0.0
 * @license GNU General Public License v3.0
 * @see https://www.gnu.org/licenses/gpl-3.0.en.html
 *
 * @example
 * // Single element with defaults
 * const el = document.querySelector('.js-animate-in');
 * new Madj2kElementInViewport(el);
 *
 * @example
 * // Single element with custom config
 * new Madj2kElementInViewport(el, {
 *   visibleClass: 'is-visible',
 *   threshold: 0.75,
 *   delay: 200,
 *   debug: true
 * });
 *
 * @example
 * // Multiple elements
 * document.querySelectorAll('.js-element-in-viewport').forEach((el) => {
 *   new Madj2kElementInViewport(el, {
 *     visibleClass: 'is-in-viewport',
 *     threshold: 1
 *   });
 * });
 */

class Madj2kElementInViewport {
  config = {
    visibleClass: 'is-in-viewport',
    threshold: 0.5,
    delay: 0,
    debug: false
  };

  /**
   * @param {HTMLElement} element - DOM element to observe
   * @param {Object} config - configuration options
   * @param {string} [config.visibleClass='in-viewport'] - class to apply when element is in view
   * @param {number} [config.threshold=1.0] - how much of the element must be visible (0–1)
   * @param {number} [config.delay=0] - optional delay before applying class (in ms)
   * @param {boolean} [config.debug=false] - enable debug logs
   */
  constructor(element, config = {}) {
    if (!(element instanceof HTMLElement)) {
      console.warn('[Madj2kElementInViewport] No valid element provided.');
      return;
    }

    this.element = element;
    this.config = { ...this.config, ...config };

    this._log('Initialized with config:', this.config);
    this._observe();
  }

  /**
   * Initializes the IntersectionObserver
   * @private
   */
  _observe() {
    const observer = new IntersectionObserver(
      ([entry], observerInstance) => {
        if (entry.isIntersecting && entry.intersectionRatio >= this.config.threshold) {
          this._log('Element in viewport:', this.element);

          if (this.config.delay > 0) {
            setTimeout(() => this._activate(observerInstance), this.config.delay);
          } else {
            this._activate(observerInstance);
          }
        }
      },
      {
        threshold: this.config.threshold
      }
    );

    observer.observe(this.element);
  }

  /**
   * Applies the visible class and stops observing
   * @param {IntersectionObserver} observer
   * @private
   */
  _activate(observer) {
    this.element.classList.add(this.config.visibleClass);
    observer.unobserve(this.element);
    this._log(`Class "${this.config.visibleClass}" added.`);
  }

  /**
   * Logs debug messages
   * @param  {...any} args
   * @private
   */
  _log(...args) {
    if (this.config.debug) {
      console.log('[Madj2kElementInViewport]', ...args);
    }
  }
}
