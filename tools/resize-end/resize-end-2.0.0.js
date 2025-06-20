/**
 * ResizeEnd Events (Vanilla JS)
 **
 * A lightweight helper class that triggers a debounced 'madj2k-resize-end' event
 * when the user finishes resizing the browser window.
 *
 * It also manages a scrolling detection state (via body attribute) to avoid triggering
 * resize-end during user scrolling, and respects active input fields (useful on mobile).
 *
 * @author Steffen Kroggel <developer@steffenkroggel.de>
 * @copyright 2025 Steffen Kroggel
 * @version 2.0.0
 * @license GNU General Public License v3.0
 * @see https://www.gnu.org/licenses/gpl-3.0.en.html
 *
 * @example
 * // Initialize with defaults
 * const resizeEnd = new Madj2kResizeEnd();
 *
 * @example
 * // Initialize with custom config
 * const resizeEnd = new Madj2kResizeEnd({
 *   resizeEndTimeout: 300,
 *   scrollingEndTimeout: 600
 * });
 *
 * @example
 * // Listen to resize-end event
 * document.addEventListener('madj2k-resize-end', () => {
 *   console.log('Resize-End fired');
 * });
 *
 * @example
 * // Example use case: reload masonry grid after resize ends
 * document.addEventListener('madj2k-resize-end', () => {
 *   myMasonry.reloadItems();
 *   myMasonry.layout();
 * });
 */
class Madj2kResizeEnd {

  config = {
    scrollingEndTimeout: 500,
    resizeEndTimeout: 200,
    scrollingDataAttr: 'data-resizeend-scrolling'
  };

  finalEventTimers = {};

  /**
   * Constructor
   * @param {Object} config - Optional config overrides
   */
  constructor(config = {}) {
    this.config = { ...this.config, ...config };
    this.initScrollingDetection();
    this.initResizeEndEvent();
  }

  /**
   * Init resizeEnd custom event
   */
  initResizeEndEvent() {
    window.addEventListener('resize', () => {
      const body = document.body;

      if (
        !body.hasAttribute(this.config.scrollingDataAttr) ||
        body.getAttribute(this.config.scrollingDataAttr) === '0'
      ) {
        this.waitForFinalEvent(() => {
          // Skip if input is focused (e.g. keyboard open on mobile)
          const active = document.activeElement;
          if (!(active && active.tagName === 'INPUT')) {
            const event = new CustomEvent('madj2k-resize-end');
            document.dispatchEvent(event);
          }
        }, this.config.resizeEndTimeout, 'resize');
      }
    });
  }

  /**
   * Init scrolling detection
   */
  initScrollingDetection() {
    const handler = () => {
      document.body.setAttribute(this.config.scrollingDataAttr, '1');

      this.waitForFinalEvent(() => {
        document.body.setAttribute(this.config.scrollingDataAttr, '0');
      }, this.config.scrollingEndTimeout, 'scrolling');
    };

    window.addEventListener('scroll', handler, { passive: true });
    window.addEventListener('touchmove', handler, { passive: true });
  }

  /**
   * Debounced final event dispatcher
   */
  waitForFinalEvent(callback, ms, uniqueId = "default") {
    if (this.finalEventTimers[uniqueId]) {
      clearTimeout(this.finalEventTimers[uniqueId]);
    }
    this.finalEventTimers[uniqueId] = setTimeout(callback, ms);
  }
}
