/**
 * Madj2kBetterResizeEvent Events (Vanilla JS)
 *
 * A lightweight helper class that triggers a debounced 'madj2k-better-resize-event' event
 * when the user finishes resizing the browser window.
 *
 * It also manages a scrolling detection state (via body attribute) to avoid triggering
 * resize-events during user scrolling on mobile, and respects active input fields (keyboard-issue on mobile).
 *
 * @author Steffen Kroggel <developer@steffenkroggel.de>
 * @copyright 2025 Steffen Kroggel
 * @version 2.0.0
 * @license GNU General Public License v3.0
 * @see https://www.gnu.org/licenses/gpl-3.0.en.html
 *
 * @example
 * // Initialize with defaults
 * const betterResizeEvent = new Madj2kBetterResizeEvent();
 *
 * @example
 * // Initialize with custom config
 * const betterResizeEvent = new Madj2kBetterResizeEvent({
 *   resizeEndTimeout: 300,
 *   scrollingEndTimeout: 600,
 *   viewportDeltaThreshold: 50
 * });
 *
 * @example
 * // Listen to resize-end event
 * document.addEventListener('madj2k-better-resize-event', () => {
 *   console.log('Resize fired');
 * });
 */

class Madj2kBetterResizeEvent {

  config = {
    scrollingEndTimeout: 500,
    resizeEndTimeout: 200,
    viewportDeltaThreshold: 50 // px threshold to filter small height/width changes (default: 50)
  };

  finalEventTimers = {};
  lastViewportHeight = window.innerHeight;
  lastViewportWidth = window.innerWidth;
  isScrolling = false;

  /**
   * Constructor
   * @param {Object} config - Optional config overrides
   */
  constructor(config = {}) {
    this.config = { ...this.config, ...config };

    this.lastViewportHeight = window.innerHeight;
    this.lastViewportWidth = window.innerWidth;
    this.isScrolling = false;

    this.initScrollingDetection();
    this.initResizeEvent();
  }

  /**
   * Init resize event
   */
  initResizeEvent() {
    window.addEventListener('resize', () => {
      const currentHeight = window.innerHeight;
      const currentWidth = window.innerWidth;

      const deltaH = Math.abs(this.lastViewportHeight - currentHeight);
      const deltaW = Math.abs(this.lastViewportWidth - currentWidth);

      // Skip if height/width change is below threshold (keyboard open/close or bounce)
      if (deltaH < this.config.viewportDeltaThreshold && deltaW < this.config.viewportDeltaThreshold) {
        return;
      }

      this.lastViewportHeight = currentHeight;
      this.lastViewportWidth = currentWidth;

      if (!this.isScrolling) {
        this.waitForFinalEvent(() => {
          // Skip if input is focused (e.g. keyboard open on mobile)
          const active = document.activeElement;
          if (!(active && active.tagName === 'INPUT')) {

            // New event
            const newEvent = new CustomEvent('madj2k-better-resize-event');
            document.dispatchEvent(newEvent);

            // Legacy event for backwards compatibility
            const legacyEvent = new CustomEvent('madj2k-resize-end');
            document.dispatchEvent(legacyEvent);
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
      this.isScrolling = true;

      this.waitForFinalEvent(() => {
        this.isScrolling = false;
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
