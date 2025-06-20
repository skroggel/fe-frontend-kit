/**!
 * Madj2kFlyoutMenu
 *
 * A JavaScript class that implements a flyout menu system with smooth animations,
 * keyboard navigation, and scroll management. It provides a responsive menu that
 * slides in from the top of the viewport.
 *
 * @author Steffen Kroggel <developer@steffenkroggel.de>
 * @copyright 2025 Steffen Kroggel
 * @version 2.0.0
 * @license GNU General Public License v3.0
 * @see https://www.gnu.org/licenses/gpl-3.0.en.html
 *
 * @example
 * // HTML structure
 * <button class="js-flyout-toggle" aria-controls="flyout-menu">Menu</button>
 * <div id="flyout-menu" class="js-flyout" data-position-ref="main-content" data-padding-ref="content">
 *   <div class="js-flyout-container">
 *     <div class="js-flyout-inner">Menu content</div>
 *     <button class="js-flyout-close">Close</button>
 *   </div>
 * </div>
 *
 * // JavaScript initialization
 * const menuTrigger = document.querySelector('.js-flyout-toggle');
 * const flyoutMenu = new Madj2kFlyoutMenu(menuTrigger, {
 *   animationDuration: 300,
 *   fullHeight: true
 * });
 */
class Madj2kPulldownMenu {

  static defaultConfig = {
    openStatusClass: 'open',
    menuClass: 'js-pulldown',
    menuToggleClass: 'js-pulldown-toggle',
    menuWrapClass: 'js-pulldown-wrap',
    animationDuration: 500,
  };

  /**
   * Initializes a new pulldown menu instance
   * @param {HTMLElement} toggleElement - The button/element that toggles the menu
   * @param {Object} options - Optional configuration settings
   */
  constructor(toggleElement, options = {}) {
    this.settings = { ...Madj2kPulldownMenu.defaultConfig, ...options };
    this.toggleElement = toggleElement;

    const controlsId = toggleElement.getAttribute('aria-controls');
    this.menu = document.getElementById(controlsId);
    this.menuWrap = toggleElement.closest(`.${this.settings.menuWrapClass}`);

    this.init();
  }

  /**
   * Initializes event listeners for the menu
   */
  init() {
    this.toggleElement.addEventListener('click', (e) => this.toggleEvent(e));
    this.toggleElement.addEventListener('keydown', (e) => this.keyboardEvent(e));

    const focusable = this.menu.querySelectorAll('a,button,input,textarea,select');
    focusable.forEach((el) =>
      el.addEventListener('keydown', (e) => this.keyboardEvent(e))
    );

    window.addEventListener('resize', (e) => this.closeEvent(e));
    document.addEventListener('click', (e) => this.closeViaDocumentClickEvent(e));
    document.addEventListener('madj2k-pulldownmenu-close', (e) => this.closeEvent(e));
  }

  /**
   * Handles click events on the toggle element
   * @param {Event} e - The click event object
   */
  toggleEvent(e) {
    e.preventDefault();
    e.stopPropagation();
    this.toggle();
  }

  /**
   * Toggles the menu open/closed state
   */
  toggle() {
    const isOpen = this.toggleElement.classList.contains(this.settings.openStatusClass);

    // Close other menus
    document.querySelectorAll(`.${this.settings.menuToggleClass}`).forEach((el) => {
      if (el !== this.toggleElement) {
        el.dispatchEvent(new Event('madj2k-pulldownmenu-close'));
      }
    });

    isOpen ? this.close() : this.open();
  }

  /**
   * Opens the pulldown menu
   */
  open() {
    if (!this.menu.classList.contains(this.settings.openStatusClass)) {
      document.dispatchEvent(new Event('madj2k-slidemenu-close'));
      document.dispatchEvent(new Event('madj2k-flyoutmenu-close'));

      this.menu.classList.add(this.settings.openStatusClass);
      this.menuWrap?.classList.add(this.settings.openStatusClass);
      this.toggleElement.classList.add(this.settings.openStatusClass);
      this.toggleElement.setAttribute('aria-expanded', 'true');

      document.dispatchEvent(new Event('madj2k-pulldownmenu-opened'));
    }
  }

  /**
   * Closes the pulldown menu
   */
  close() {
    if (this.menu.classList.contains(this.settings.openStatusClass)) {
      this.menu.classList.remove(this.settings.openStatusClass);
      this.menuWrap?.classList.remove(this.settings.openStatusClass);
      this.toggleElement.classList.remove(this.settings.openStatusClass);
      this.toggleElement.setAttribute('aria-expanded', 'false');

      document.dispatchEvent(new Event('madj2k-pulldownmenu-closed'));
    }
  }

  /**
   * Handles closing the menu when clicking outside
   * @param {Event} e - The click event object
   */
  closeViaDocumentClickEvent(e) {
    if (!this.menu.contains(e.target) && !this.toggleElement.contains(e.target)) {
      if (document.activeElement.tagName !== 'INPUT') {
        this.close();
      }
    }
  }

  /**
   * Handles generic close events
   * @param {Event} e - The event object
   */
  closeEvent(e) {
    if (document.activeElement.tagName !== 'INPUT') {
      e.preventDefault();
      this.close();
    }
  }

  /**
   * Handles keyboard navigation events
   * @param {KeyboardEvent} e - The keyboard event object
   */
  keyboardEvent(e) {
    const key = e.key;
    const target = e.target;

    switch (key) {
      case 'ArrowUp':
        if (target === this.toggleElement) this.close();
        break;

      case 'Enter':
        if (target === this.toggleElement) {
          e.preventDefault();
          this.toggle();
        }
        break;

      case 'ArrowDown':
        if (target === this.toggleElement) {
          e.preventDefault();
          this.open();
        }
        break;

      case 'Escape':
        e.preventDefault();
        this.close();
        this.focusToggle();
        break;
    }
  }

  /**
   * Sets focus to the toggle element
   * @param {number} timeout - Optional delay in milliseconds
   */
  focusToggle(timeout = 0) {
    setTimeout(() => this.toggleElement.focus(), timeout);
  }
}
