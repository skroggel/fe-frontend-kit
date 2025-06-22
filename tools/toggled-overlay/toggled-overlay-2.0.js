/**!
 * ToggledOverlay
 *
 * @author Steffen Kroggel <developer@steffenkroggel.de>
 * @copyright 2025 Steffen Kroggel
 * @version 2.0.0
 * @license GNU General Public License v3.0
 * @see https://www.gnu.org/licenses/gpl-3.0.en.html
 *
 * This class toggles the visibility of any target element referenced by the `aria-controls`
 * attribute of a trigger element (button, link, etc.). It manages ARIA attributes for accessibility
 * and allows overlays to be closed externally via a custom event.
 *
 * @example
 * Example HTML:
 * <button class="js-toggled-overlay toggled-overlay-button"
 *         aria-label="Open overlay"
 *         aria-controls="my-overlay"
 *         aria-expanded="false">
 *   <span class="icon icon-info"></span>
 * </button>
 *
 * <div id="my-overlay" class="toggled-overlay" aria-hidden="true">
 *   <!-- Overlay content -->
 * </div>
 *
 * Example JavaScript:
 * const overlayToggle = new Madj2kToggledOverlay('.js-toggled-overlay');
 *
 * // External close trigger
 * window.dispatchEvent(new CustomEvent('madj2k-toggledoverlay-close'));
 *
 * Example CSS:
 * .toggled-overlay {
 *   opacity: 0;
 *   visibility: hidden;
 *   transition: opacity 0.5s ease-in-out, visibility 0s linear 0.5s;
 *
 *   &.is-visible {
 *     opacity: 1;
 *     visibility: visible;
 *     transition: opacity 0.5s ease-in-out, visibility 0s linear 0s;
 *   }
 * }
 *
 * .toggled-overlay-button[aria-expanded="true"] .icon-info::before {
 *   content: "\e8bb"; // Example: "close" icon (replace with actual icon code)
 * }
 */
class Madj2kToggledOverlay {
  /**
   * Creates a new ToggledOverlay instance.
   * @param {string} toggleSelector - CSS selector to identify all toggle buttons.
   */
  constructor(toggleSelector) {
    /** @type {NodeListOf<HTMLElement>} */
    this.toggles = document.querySelectorAll(toggleSelector);
    this.init();
    this.registerEvents();
  }

  /**
   * Initializes toggle buttons and sets up toggle behavior.
   */
  init() {
    this.toggles.forEach(toggle => {
      const targetId = toggle.getAttribute('aria-controls');
      const target = document.getElementById(targetId);
      if (!target) return;

      // Set initial ARIA state
      target.setAttribute('aria-hidden', 'true');
      toggle.setAttribute('aria-expanded', 'false');

      toggle.addEventListener('click', () => {
        const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
        toggle.setAttribute('aria-expanded', String(!isExpanded));
        target.setAttribute('aria-hidden', String(isExpanded));
        target.classList.toggle('is-visible', !isExpanded);
      });
    });
  }

  /**
   * Closes all overlays by removing the 'is-visible' class and updating ARIA attributes.
   */
  close() {
    this.toggles.forEach(toggle => {
      const targetId = toggle.getAttribute('aria-controls');
      const target = document.getElementById(targetId);
      if (!target) return;

      toggle.setAttribute('aria-expanded', 'false');
      target.setAttribute('aria-hidden', 'true');
      target.classList.remove('is-visible');
    });
  }

  /**
   * Handles clicks outside the overlay and toggles to close them.
   * @param {MouseEvent} event
   */
  handleClickOutside(event) {
    this.toggles.forEach(toggle => {
      const targetId = toggle.getAttribute('aria-controls');
      const target = document.getElementById(targetId);
      if (!target) return;

      const clickedInsideToggle = toggle.contains(event.target);
      const clickedInsideTarget = target.contains(event.target);

      if (!clickedInsideToggle && !clickedInsideTarget && toggle.getAttribute('aria-expanded') === 'true') {
        this.close();
      }
    });
  }

  /**
   * Registers all global event listeners.
   */
  registerEvents() {
    document.addEventListener('click', this.handleClickOutside.bind(this));
    document.addEventListener('madj2k-toggledoverlay-close', this.close.bind(this));
  }
}
