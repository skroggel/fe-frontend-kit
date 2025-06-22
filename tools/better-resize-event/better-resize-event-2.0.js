/**
 * Madj2kBetterResizeEvent
 *
 * A lightweight helper class that triggers a debounced 'madj2k-better-resize-event' event
 * when the user finishes resizing the browser window.
 *
 * In some cases, you need to be able to react to the window's resize event. Unfortunately, however, the resize event is not only triggered at the end of the
 * resizing of the browser window, but every time the size is changed in between. This can lead to an overhead if the event is handled every
 * the event every time. With the JS-module, a final event is only triggered when the browser window has been resized.
 *
 * The script also considers edge-cases such as showing the software-keyboard and showing / hiding the navigation bar on mobile devices
 * (both trigger a resize event).
 *
 * Notes:
 * - On iOS (Safari), viewport height and width can change during scroll bounce or keyboard animation.
 * - This version adds "viewport delta" detection to prevent false-positive resize events.
 * - Scrolling state is now internal (no more data-resizeend-scrolling attribute).
 * - New event: 'madj2k-better-resize-event' (legacy event still supported).
 *
 * @author Steffen Kroggel <developer@steffenkroggel.de>
 * @copyright 2025 Steffen Kroggel
 * @version 2.0.1
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
