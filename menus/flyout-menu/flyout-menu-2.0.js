/**!
 * Madj2kFlyoutMenu
 *
 * A JavaScript class that implements a flyout menu system with smooth animations,
 * keyboard navigation, and scroll management. It provides a responsive menu that
 * slides in from the top of the viewport.
 *
 * @author Steffen Kroggel <developer@steffenkroggel.de>
 * @copyright 2025 Steffen Kroggel
 * @version 2.0.1
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
 *   heightMode: 'maxContent'
 * });
 */

class Madj2kFlyoutMenu {
  /**
   * Initializes the flyout menu with given element and options
   * @param {HTMLElement} element - The trigger element for the menu
   * @param {Object} options - Configuration options for the menu
   */
  constructor(element, options = {}) {
    const defaults = {
      openStatusClass: 'open',
      animationOpenStatusClass: 'opening',
      animationCloseStatusClass: 'closing',
      animationBodyClassPrefix: 'flyout',
      openStatusBodyClass: 'flyout-open',
      openStatusBodyClassOverflow: 'flyout-open-overflow',
      contentSectionClass: 'js-main-content',
      menuClass: 'js-flyout',
      menuToggleClass: "js-flyout-toggle",
      menuCloseClass: "js-flyout-close",
      menuContainerClass: "js-flyout-container",
      menuInnerClass: "js-flyout-inner",
      heightMode: 'full',
      paddingBehavior: 0,
      paddingViewPortMinWidth: 0,
      animationDuration: 500
    };

    this.settings = Object.assign({}, defaults, options);
    this.$element = element;
    this.settings.$element = element;

    const controls = element.getAttribute('aria-controls');
    this.settings.$menu = document.getElementById(controls);

    const posRef = this.settings.$menu.getAttribute('data-position-ref');
    this.settings.$positionReference = document.getElementById(posRef);

    const padRef = this.settings.$menu.getAttribute('data-padding-ref');
    this.settings.$paddingReference = document.getElementById(padRef);

    this.settings.$closeBtn = this.settings.$menu.querySelector(`.${this.settings.menuCloseClass}`);
    this.settings.$menuContainer = this.settings.$menu.querySelector(`.${this.settings.menuContainerClass}`);
    this.settings.$menuInner = this.settings.$menu.querySelector(`.${this.settings.menuInnerClass}`);

    this.initNoScrollHelper();
    this.resizeAndPositionMenu();
    this.paddingMenu();
    this.bindEvents();
    this.initObservers();
  }

  /**
   * Handles keyboard navigation events
   * @param {KeyboardEvent} e - The keyboard event
   */
  keyboardEvent(e) {
    const element = e.target;

    switch (e.key) {
      case 'ArrowUp':
        if (element === this.$element) this.close();
        break;
      case 'Enter':
        if (element === this.$element) {
          e.preventDefault();
          this.toggle();
        }
        break;
      case 'ArrowDown':
        if (element === this.$element) {
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
   * Binds all necessary event listeners
   */
  bindEvents() {
    if (this.settings.$closeBtn) {
      this.settings.$closeBtn.addEventListener('click', e => this.closeEvent(e));
      this.settings.$closeBtn.addEventListener('keydown', e => this.keyboardEvent(e));
    }

    this.$element.addEventListener('click', e => this.toggleEvent(e));
    this.$element.addEventListener('keydown', e => this.keyboardEvent(e));

    this.settings.$menu.querySelectorAll('a,button,input,textarea,select')
      .forEach(el => el.addEventListener('keydown', e => this.keyboardEvent(e)));

    document.addEventListener('madj2k-flyoutmenu-close', e => this.closeEvent(e));
    document.addEventListener('madj2k-flyoutmenu-resize', e => this.resizeAndPositionMenuEvent(e));
  }

  /**
   * Initializes ResizeObserver to auto-resize menu
   */
  initObservers() {
    // check if supported
    if (typeof ResizeObserver === 'undefined') {
      console.warn('ResizeObserver is not supported in this browser.');
      return;
    }

    // create observer
    this.resizeObserver = new ResizeObserver(entries => {
      for (let entry of entries) {
        this.resizeMenu();
      }
    });

    // observe inner container
    if (this.settings.$menuInner) {
      this.resizeObserver.observe(this.settings.$menuInner);
    }
  }

  /**
   * Unbinds all event listeners
   */
  destroyEvents() {
    if (this.settings.$closeBtn) {
      this.settings.$closeBtn.removeEventListener('click', e => this.closeEvent(e));
      this.settings.$closeBtn.removeEventListener('keydown', e => this.keyboardEvent(e));
    }

    this.$element.removeEventListener('click', e => this.toggleEvent(e));
    this.$element.removeEventListener('keydown', e => this.keyboardEvent(e));

    this.settings.$menu.querySelectorAll('a,button,input,textarea,select')
      .forEach(el => el.removeEventListener('keydown', e => this.keyboardEvent(e)));

    document.removeEventListener('madj2k-flyoutmenu-close', e => this.closeEvent(e));
    document.removeEventListener('madj2k-flyoutmenu-resize', e => this.resizeAndPositionMenuEvent(e));
  }

  /**
   * Destroys ResizeObserver
   */
  destroyResizeObserver() {
    if (this.resizeObserver && this.settings.$menuInner) {
      this.resizeObserver.unobserve(this.settings.$menuInner);
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
  }

  /**
   * Destroys flyout menu instance
   */
  destroy() {
    this.destroyEvents();
    this.destroyResizeObserver();
    this.close();
  }


  /**
   * Handles toggle click event
   * @param {Event} e - The click event
   */
  toggleEvent(e) {
    e.preventDefault();
    this.toggle();
  }

  /**
   * Toggles the menu open/closed state
   */
  toggle() {
    const others = document.querySelectorAll(`.${this.settings.menuToggleClass}`);
    others.forEach(btn => {
      if (btn !== this.$element) btn.dispatchEvent(new CustomEvent('madj2k-flyoutmenu-close'));
    });

    if (this.$element.classList.contains(this.settings.openStatusClass)) {
      this.close();
    } else {
      this.open();
    }
  }

  /**
   * Sets focus to the toggle element
   * @param {number} timeout - Delay before focusing
   */
  focusToggle(timeout = 0) {
    setTimeout(() => this.$element.focus(), timeout);
  }


  /**
   * Opens the flyout menu
   */
  open() {
    const {$menu, $element, animationOpenStatusClass, openStatusClass} = this.settings;
    if (!$menu.classList.contains(openStatusClass) && !$menu.classList.contains(animationOpenStatusClass)) {
      document.dispatchEvent(new CustomEvent('madj2k-slidemenu-close'));
      document.dispatchEvent(new CustomEvent('madj2k-pulldownmenu-close'));
      document.dispatchEvent(new CustomEvent('madj2k-flyoutmenu-opening'));

      this.toggleNoScroll();
      this.resizeAndPositionMenu();
      this.paddingMenu();

      $menu.classList.add(openStatusClass, animationOpenStatusClass);
      $element.classList.add(openStatusClass, animationOpenStatusClass);
      $element.setAttribute('aria-expanded', true);
      document.body.classList.add(`${this.settings.animationBodyClassPrefix}-${animationOpenStatusClass}`);

      this.settings.$menuContainer.style.transition = `top ${this.settings.animationDuration}ms`;
      this.settings.$menuContainer.style.top = '0';

      setTimeout(() => {
        $menu.classList.remove(animationOpenStatusClass);
        $element.classList.remove(animationOpenStatusClass);
        document.body.classList.remove(`${this.settings.animationBodyClassPrefix}-${animationOpenStatusClass}`);
        document.dispatchEvent(new CustomEvent('madj2k-flyoutmenu-opened'));
      }, this.settings.animationDuration);
    }
  }

  /**
   * Returns true if menu is currently open
   * @returns {boolean}
   */
  isOpen() {
    return this.settings.$menu.classList.contains(this.settings.openStatusClass);
  }

  /**
   * Handles close event
   * @param {Event} e - The close event
   */
  closeEvent(e) {
    e.preventDefault();
    if (document.activeElement.tagName !== 'INPUT') {
      this.close();
      if (e.target === this.settings.$closeBtn) {
        this.focusToggle();
      }
    }
  }

  /**
   * Closes the flyout menu
   */
  close() {
    const {$menu, $element, animationCloseStatusClass, openStatusClass} = this.settings;
    if ($menu.classList.contains(openStatusClass) && !$menu.classList.contains(animationCloseStatusClass)) {
      document.dispatchEvent(new CustomEvent('madj2k-flyoutmenu-closing'));

      $menu.classList.add(animationCloseStatusClass);
      $element.classList.add(animationCloseStatusClass);
      document.body.classList.add(`${this.settings.animationBodyClassPrefix}-${animationCloseStatusClass}`);
      $element.classList.remove(openStatusClass);
      $element.setAttribute('aria-expanded', false);

      this.toggleNoScroll();

      this.settings.$menuContainer.style.transition = `top ${this.settings.animationDuration}ms`;
      this.settings.$menuContainer.style.top = '-100%';

      setTimeout(() => {
        $menu.classList.remove(openStatusClass, animationCloseStatusClass);
        $element.classList.remove(animationCloseStatusClass);
        document.body.classList.remove(`${this.settings.animationBodyClassPrefix}-${animationCloseStatusClass}`);
        document.dispatchEvent(new CustomEvent('madj2k-flyoutmenu-closed'));
      }, this.settings.animationDuration);
    }
  }

  /**
   * Handles menu resize event
   * @param {Event} e - The resize event
   */
  resizeAndPositionMenuEvent(e) {
    if (document.activeElement.tagName !== 'INPUT') {
      this.resizeAndPositionMenu();
    }
  }

  /**
   * Resizes and positions the menu
   */
  resizeAndPositionMenu() {
    this.positionMenu();
    this.resizeMenu();
  }

  /**
   * Resizes the menu based on height mode and inner content
   */
  resizeMenu() {
    if ('fullHeight' in this.settings) {
      console.warn('Option "fullHeight" is deprecated. Please use "heightMode" instead.');
    }

    let height = this.settings.$menuInner.offsetHeight || this.settings.$menu.offsetHeight;
    const refObj = this.settings.$positionReference || this.$element;
    const refPos = refObj.getBoundingClientRect();
    const flyoutTop = refPos.top + refObj.offsetHeight;

    // heightMode "full" with deprecated fullHeight-setting as fallback
    if (this.settings.heightMode === 'full' || this.settings.fullHeight === true) {
      const viewPortHeight = window.innerHeight;
      if (height < viewPortHeight) {
        this.settings.$menu.style.height = `calc(100vh + ${flyoutTop}px)`;
      } else {
        this.settings.$menu.style.height = `${height}px`;
      }

    } else if (this.settings.heightMode === 'maxContent') {
      this.settings.$menu.style.height = `max-content`;
      console.warn('heightMode: maxContent is not working on Apple Safari. Please use heightMode: full instead.');

    } else {
      this.settings.$menu.style.height = `${height}px`;
    }
  }

  /**
   * Positions the menu based on the reference element
   */
  positionMenu() {
    const refObj = this.settings.$positionReference || this.$element;
    const refPos = refObj.getBoundingClientRect();
    const flyoutTop = refPos.top + refObj.offsetHeight;

    this.settings.$menu.style.top = `${flyoutTop}px`;
  }

  /**
   * Adjusts menu padding based on settings
   */
  paddingMenu() {

    if (!this.settings.$paddingReference) return;
    if (this.settings.paddingBehavior === 0) return;
    // should be re-evaluated on a resize event after re-opening the menu
    // if (this.settings.paddingBehavior === 1 && this.settings.$menuInner.hasAttribute('data-padding-set')) return;

    let left = this.settings.$paddingReference.getBoundingClientRect().left;
    if (window.innerWidth < this.settings.paddingViewPortMinWidth) left = 0;

    this.settings.$menuInner.style.paddingLeft = `${left}px`;
    // this.settings.$menuInner.setAttribute('data-padding-set', 'true');
  }

  /**
   * Initializes the no-scroll helper elements
   */
  initNoScrollHelper() {
    const body = document.body;
    let helper = body.querySelector('.no-scroll-helper');
    const content = document.querySelector(`.${this.settings.contentSectionClass}`);

    if (!helper) {
      if (content) {
        content.innerHTML = `<div class="no-scroll-helper"><div class="no-scroll-helper-inner">${content.innerHTML}</div></div>`;
      } else {
        body.innerHTML = `<div class="no-scroll-helper"><div class="no-scroll-helper-inner">${body.innerHTML}</div></div>`;
      }
    }
  }

  /**
   * Toggles scroll behavior of the page
   */
  toggleNoScroll() {
    const body = document.body;
    const helper = body.querySelector('.no-scroll-helper');
    const inner = body.querySelector('.no-scroll-helper-inner');
    let noScrollClass = this.settings.openStatusBodyClass;

    if (document.documentElement.scrollHeight > window.innerHeight) {
      noScrollClass += ' ' + this.settings.openStatusBodyClassOverflow;
    }

    if (!body.classList.contains(this.settings.openStatusBodyClass)) {
      const scrollTop = -document.documentElement.scrollTop;
      helper.setAttribute('data-scroll-top', scrollTop);
      helper.style.cssText = 'position:relative;overflow:hidden;height:100vh;width:100%';
      inner.style.cssText = `position:absolute;top:${scrollTop}px;height:100%;width:100%`;
      body.classList.add(...noScrollClass.split(' '));
      window.scrollTo({top: 0, behavior: 'instant'});
    } else {
      const scrollTop = parseInt(helper.getAttribute('data-scroll-top') || '0') * -1;
      helper.removeAttribute('style');
      inner.removeAttribute('style');
      body.classList.remove(this.settings.openStatusBodyClass, this.settings.openStatusBodyClassOverflow);
      window.scrollTo({top: scrollTop, behavior: 'instant'});
    }
  }
}
