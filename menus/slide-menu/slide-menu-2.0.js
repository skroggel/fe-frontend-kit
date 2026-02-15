/**!
 * Madj2kSlideMenu
 *
 * A JavaScript class that implements a slide menu system with nested cards,
 * smooth animations, keyboard navigation, accessibility support (WAI-ARIA),
 * and scroll locking.
 *
 * @author Steffen Kroggel <developer@steffenkroggel.de>
 * @copyright 2025 Steffen Kroggel
 * @version 2.0.0
 * @license GNU General Public License v3.0
 *
 * @example:
 * // JS-Initialization
 * The slide menu is initialized on a toggle element (usually a button).
 * This element must provide an `aria-controls` attribute that references
 * the menu container by ID.
 *   import { Madj2kSlideMenu } from '@madj2k/fe-frontend-kit/menus/slide-menu';
 *
 *   document.querySelectorAll('.js-slide-nav-toggle').forEach((el) => {
 *     new Madj2kSlideMenu(el, {
 *       menuItemsJson: slideNavItems
 *     });
 *   });
 *
 * // Documentation
 * Detailed documentation for:
 * - required HTML structure
 * - menu templates
 * - menuItemsJson format
 * - available options and events
 *
 * can be found in:
 *   readme.md
 */

class Madj2kSlideMenu {

  /**
   * Creates an instance of the navigation system for the specified element, enabling sliding navigation with various customizable options.
   *
   * @param {HTMLElement} element - The HTML element to which the navigation system will be attached.
   * @param {Object} [options={}] - An optional object containing configuration options for the navigation system.
   * @return {void}
   */
  constructor(element, options = {}) {

    const defaults = {
      menuItemsJson: [],

      // status classes
      openStatusClass: 'open',
      openStatusBodyClass: 'slide-open',
      openStatusBodyClassOverflow: 'slide-open-overflow',

      openCardStatusClass: 'show',
      activeStatusClass: 'active',
      currentStatusClass: 'current',
      hasChildrenStatusClass: 'has-children',
      linkTypeClass: 'link-type',
      isLinkedClass: 'linked',

      animationOpenStatusClass: 'opening',
      animationCloseStatusClass: 'closing',

      // toggle classes
      menuToggleClass: 'js-slide-nav-toggle',
      lastCardToggleClass: 'js-slide-nav-back',
      nextCardToggleClass: 'js-slide-nav-next',

      // card class
      menuWrapClass: "js-slide-nav-container",
      menuCardClass: 'js-slide-nav-card',

      // content section
      contentSectionClass: 'js-main-content',

      // special classes
      templatePartsClass: 'js-slide-nav-tmpl',

      // params
      animationDuration: 500,
      loadOnOpen: true,
      startOnHome: false,
      scrollHelper: true,
    };

    this.settings = Object.assign({}, defaults, options);
    this.settings.isLoaded = false;

    this.$element = element;
    this.settings.$element = element;

    const controls = element.getAttribute('aria-controls');
    this.settings.$menu = document.getElementById(controls);

    const positionReference = this.settings.$menu?.getAttribute('data-position-ref');
    this.settings.$positionReference = positionReference
      ? document.getElementById(positionReference)
      : null;

    this.settings.$cards = [];
    this.settings.$activeCards = [];
    this.settings.$openCard = null;

    // bind persistent handlers
    this.toggleEvent = this.toggleEvent.bind(this);
    this.closeEvent = this.closeEvent.bind(this);
    this.keyboardEvent = this.keyboardEvent.bind(this);
    this.previousCardEvent = this.previousCardEvent.bind(this);
    this.nextCardEvent = this.nextCardEvent.bind(this);
    this.resizeCardsEvent = this.resizeCardsEvent.bind(this);
    this.positionMenuEvent = this.positionMenuEvent.bind(this);

    this.initNoScrollHelper();
    this.bindInitialEvents();

    if (!this.settings.loadOnOpen) {
      this.loadMenu();
    }
  }

  /**
   * Binds initial event listeners to the specified element and document.
   * Sets up click and keydown event listeners on the element and a custom event listener on the document.
   *
   * @return {void} This method does not return a value.
   */
  bindInitialEvents() {
    this.$element.addEventListener('click', this.toggleEvent);
    this.$element.addEventListener('keydown', this.keyboardEvent);
    document.addEventListener('madj2k-slidemenu-close', this.closeEvent);
  }

  /**
   * Loads the menu by initializing templates, rendering menu items, and caching elements.
   * Verifies the presence of menu container and templates before setting up the menu.
   * Handles menu item initialization and binds necessary events.
   *
   * @return {boolean} Returns true if the menu was successfully loaded, otherwise returns false.
   */
  loadMenu() {

    if (this.settings.isLoaded) {
      return true;
    }

    if (!this.settings.$menu) {
      console.warn('Menu container not found. Can not load menu.');
      return false;
    }

    if (this.settings.menuItemsJson.length) {

      // get HTML templates
      this.settings.menuWrapTemplate =
        document.querySelector(`.${this.settings.templatePartsClass}[data-type="menuWrap"]`)?.innerHTML || '';

      this.settings.menuItemTemplate =
        document.querySelector(`.${this.settings.templatePartsClass}[data-type="menuItem"]`)?.innerHTML || '';

      this.settings.subMenuWrapTemplate =
        document.querySelector(`.${this.settings.templatePartsClass}[data-type="subMenuWrap"]`)?.innerHTML || '';

      if (
        this.settings.menuWrapTemplate &&
        this.settings.menuItemTemplate &&
        this.settings.subMenuWrapTemplate
      ) {
        this.settings.$menu.innerHTML =
          this.buildHtml(this.settings.menuItemsJson);
      }
    }

    // cache cards
    this.settings.$menuWrap =
      this.settings.$menu.querySelector(`.${this.settings.menuWrapClass}`);

    this.settings.$cards =
      Array.from(this.settings.$menu.querySelectorAll(`.${this.settings.menuCardClass}`));

    if (this.settings.$cards.length) {
      this.settings.$cards[0].classList.add(this.settings.activeStatusClass);
    }

    this.settings.$activeCards =
      this.settings.$menu.querySelectorAll(
        `.${this.settings.menuCardClass}.${this.settings.activeStatusClass}`
      );

    this.settings.$menuWrap.style.top = `-100%`;
    this.settings.isLoaded = true;
    this.bindEvents();

    return true;
  }

  /**
   * Binds various event listeners to elements and the window for handling user interaction and responsiveness.
   *
   * @return {void} This method does not return a value.
   */
  bindEvents() {

    this.settings.$menu
      .querySelectorAll(`.${this.settings.lastCardToggleClass}`)
      .forEach(el => el.addEventListener('click', this.previousCardEvent));

    this.settings.$menu
      .querySelectorAll(`.${this.settings.nextCardToggleClass}`)
      .forEach(el => {
        el.addEventListener('click', this.nextCardEvent);
        el.addEventListener('keydown', this.keyboardEvent);
      });

    this.settings.$menu
      .querySelectorAll('a,button,input,textarea,select')
      .forEach(el => el.addEventListener('keydown', this.keyboardEvent));

    window.addEventListener('resize', this.resizeCardsEvent);
    window.addEventListener('resize', this.positionMenuEvent);
  }

  /**
   * Toggles the state of an event based on the current condition.
   *
   * @param {Event} e - The event object that triggers the toggle action.
   * @return {void} This method does not return a value.
   */
  toggleEvent(e) {
    e.preventDefault();
    if (!this.open()) {
      this.close();
    }
  }

  /**
   * Handles the close event by preventing the default behavior
   * and invoking the close method.
   *
   * @param {Event} e - The event object associated with the close action.
   * @return {void} This method does not return any value.
   */
  closeEvent (e) {
    e.preventDefault();
    this.close();
  }

  /**
   * Opens the menu and performs various operations to adjust state, animations, and accessibility.
   * Includes triggering events, toggling classes, repositioning, and handling ARIA attributes.
   *
   * @return {boolean} Returns `true` if the menu was opened successfully. Returns `false` if the menu was already open, an animation was in progress, or if menu initialization failed.
   */
  open() {

    if (
      !this.loadMenu() ||
      this.settings.$menu.classList.contains(this.settings.openStatusClass) ||
      this.settings.$menu.classList.contains(this.settings.animationOpenStatusClass)
    ) {
      return false;
    }

    document.dispatchEvent(new Event('madj2k-flyoutmenu-close'));
    document.dispatchEvent(new Event('madj2k-slidemenu-opening'));

    this.toggleNoScroll();
    this.disableTabIndexOnAllCards();
    this.positionMenu();

    this.settings.$menu.classList.add(
      this.settings.openStatusClass,
      this.settings.animationOpenStatusClass
    );

    this.$element.classList.add(
      this.settings.openStatusClass,
      this.settings.animationOpenStatusClass
    );

    this.$element.setAttribute('aria-expanded', 'true');

    let openCard = this.settings.$activeCards[
      this.settings.startOnHome ? 0 : this.settings.$activeCards.length - 1
      ];

    this.setOpenCard(openCard);
    this.resizeCards();
    this.repositionCards();

    this.animateElement(
      this.settings.$menuWrap,
      { top: '-100%' },
      { top: '0' }
    );

    setTimeout(() => {
      this.settings.$menu.classList.remove(this.settings.animationOpenStatusClass);
      this.$element.classList.remove(this.settings.animationOpenStatusClass);

      this.toggleTabIndexOnOpenCard();
      this.toggleWaiAriaForOpenCard();
      this.focusFirstItemOfOpenCard();

      document.dispatchEvent(new Event('madj2k-slidemenu-opened'));
    }, this.settings.animationDuration);

    return true;
  }


  /**
   * Closes the menu if it is currently open and not already in the process of closing.
   * Dispatches events to notify when the menu starts closing (`madj2k-slidemenu-closing`)
   * and when the menu has fully closed (`madj2k-slidemenu-closed`).
   * Handles animations, updates ARIA attributes, and manages other related DOM properties.
   *
   * @return {boolean} Returns `true` if the menu was successfully closed, or `false` if
   * the menu was not in an open or closable state.
   */
  close() {

    if (
      !this.settings.$menu.classList.contains(this.settings.openStatusClass) ||
      this.settings.$menu.classList.contains(this.settings.animationCloseStatusClass)
    ) {
      return false;
    }

    document.dispatchEvent(new Event('madj2k-slidemenu-closing'));

    this.settings.$menu.classList.add(this.settings.animationCloseStatusClass);
    this.$element.classList.add(this.settings.animationCloseStatusClass);
    this.$element.classList.remove(this.settings.openStatusClass);
    this.$element.setAttribute('aria-expanded', 'false');

    this.toggleTabIndexOnOpenCard();
    this.toggleWaiAriaForOpenCard();

    this.animateElement(
      this.settings.$menuWrap,
      { top: '0' },
      { top: '-100%' }
    );

    setTimeout(() => {
      this.settings.$menu.classList.remove(
        this.settings.openStatusClass,
        this.settings.animationCloseStatusClass
      );

      this.$element.classList.remove(this.settings.animationCloseStatusClass);

      this.toggleNoScroll();
      document.dispatchEvent(new Event('madj2k-slidemenu-closed'));
    }, this.settings.animationDuration);

    return true;
  }


  /**
   * Handles keyboard events triggered on an element.
   *
   * @param {KeyboardEvent} e - The keyboard event object containing details of the interaction.
   * @return {void} No return value.
   */
  keyboardEvent(e) {

    const element = e.target;

    switch (e.key) {

      case 'ArrowUp':
        if (element === this.$element) this.close();
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

      case 'Tab':
        if (!this.settings.$openCard) break;

        const focusables = Array.from(
          this.settings.$openCard.querySelectorAll(
            'a:not([tabindex="-1"]), button:not([tabindex="-1"]), input:not([tabindex="-1"]), textarea:not([tabindex="-1"]), select:not([tabindex="-1"])'
          )
        ).filter(el =>
          el.closest(`.${this.settings.menuCardClass}`) === this.settings.$openCard
        );

        if (!focusables.length) break;

        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }

        break;
    }
  }

  /**
   * Handles the event to navigate to the previous card in a sliding menu.
   *
   * @param {Event} e The event object triggered by the user interaction.
   * @return {void} This method does not return a value.
   */
  previousCardEvent(e) {
    e.preventDefault();

    const target = e.currentTarget;
    const controlledCard = document.getElementById(target.getAttribute('aria-controls'));
    const parentCard = document.getElementById(target.dataset.parentCard);

    if (!controlledCard || !parentCard) return;

    this.disableTabIndexOnAllCards();
    controlledCard.classList.add(this.settings.animationCloseStatusClass);

    this.animateElement(
      controlledCard,
      { left: '0' },
      { left: '100%' }
    );

    setTimeout(() => {
      this.changeOpenCard(parentCard);
      controlledCard.classList.remove(this.settings.animationCloseStatusClass);
      document.dispatchEvent(new Event('madj2k-slidemenu-previous-opened'));
    }, this.settings.animationDuration);
  }


  /**
   * Triggers the animation and logic to open the next card in a slide menu.
   * Handles disabling tab indices on all cards, animating the transition,
   * and dispatching a custom event when the next card has fully opened.
   *
   * @param {Event} e The event object triggered by clicking or interacting with the navigation element.
   * @return {void} This method does not return a value.
   */
  nextCardEvent(e) {
    e.preventDefault();

    const target = e.currentTarget;
    const controlledCard = document.getElementById(target.getAttribute('aria-controls'));

    if (!controlledCard) return;

    this.disableTabIndexOnAllCards();
    controlledCard.classList.add(this.settings.animationOpenStatusClass);

    this.animateElement(
      controlledCard,
      { left: '100%' },
      { left: '0' }
    );

    setTimeout(() => {
      this.changeOpenCard(controlledCard);
      controlledCard.classList.remove(this.settings.animationOpenStatusClass);
      document.dispatchEvent(new Event('madj2k-slidemenu-next-opened'));
    }, this.settings.animationDuration);
  }


  /**
   * Sets the provided card as the currently open card and updates its status class.
   * Removes the open card status class from all other cards in the collection.
   *
   * @param {HTMLElement} card - The card element to set as open.
   * @return {void}
   */
  setOpenCard(card) {
    this.settings.$openCard = card;
    this.settings.$cards.forEach(c =>
      c.classList.remove(this.settings.openCardStatusClass)
    );
    card.classList.add(this.settings.openCardStatusClass);
  }

  /**
   * Changes the currently open card by performing a series of actions including updating its state,
   * toggling accessibility attributes, and setting focus.
   *
   * @param {Object} card - The card object to be opened.
   * @return {void} This method does not return a value.
   */
  changeOpenCard(card) {
    this.setOpenCard(card);
    this.toggleTabIndexOnOpenCard();
    this.toggleWaiAriaForOpenCard();
    this.focusFirstItemOfOpenCard();
  }

  /**
   * Focuses the first focusable item (such as links, buttons, inputs, etc.) within the currently open card, if available.
   * Optionally allows a delay before focusing.
   *
   * @param {number} [timeout=0] - The amount of delay in milliseconds before focusing the item.
   * @return {void} Does not return any value.
   */
  focusFirstItemOfOpenCard(timeout = 0) {
    const el = this.settings.$openCard?.querySelector(
      'a:not([tabindex]),button:not([tabindex]),input:not([tabindex]),textarea:not([tabindex]),select:not([tabindex])'
    );
    if (el) setTimeout(() => el.focus(), timeout);
  }

  /**
   * Toggles the focus state of an element by applying focus after a specified timeout.
   *
   * @param {number} [timeout=0] - Optional timeout in milliseconds before the element is focused.
   * @return {void} This method does not return a value.
   */
  focusToggle(timeout = 0) {
    setTimeout(() => this.$element.focus(), timeout);
  }

  /**
   * Toggles the WAI-ARIA attributes for the currently open card.
   * Updates the `aria-expanded` attribute for card toggle elements within the menu
   * to reflect whether the corresponding card is open or closed.
   *
   * @return {void} No return value.
   */
  toggleWaiAriaForOpenCard() {
    this.settings.$menu
      .querySelectorAll(`.${this.settings.nextCardToggleClass}`)
      .forEach(el => el.setAttribute('aria-expanded', 'false'));

    if (this.$element.classList.contains(this.settings.openStatusClass)) {
      const id = this.settings.$openCard.id;
      const toggle = this.settings.$menu.querySelector(
        `.${this.settings.nextCardToggleClass}[aria-controls="${id}"]`
      );
      if (toggle) toggle.setAttribute('aria-expanded', 'true');
    }
  }

  /**
   * Toggles the tabindex attributes of focusable elements within an open card based on visibility in the viewport.
   * Ensures that only elements visible within the card have tabindex enabled, while disabling tabindex for all other cards.
   *
   * @return {void} This method does not return a value.
   */
  toggleTabIndexOnOpenCard() {
    this.disableTabIndexOnAllCards();

    if (!this.$element.classList.contains(this.settings.openStatusClass)) return;

    const width = window.innerWidth;
    this.settings.$openCard
      .querySelectorAll('a,button,input,textarea,select')
      .forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.left > 0 && rect.left <= width) {
          el.removeAttribute('tabindex');
        }
      });
  }

  /**
   * Disables the tabIndex attribute for all interactive elements
   * (such as links, buttons, inputs, textareas, and selects)
   * inside the menu element specified in the settings object.
   *
   * @return {void} This method does not return a value.
   */
  disableTabIndexOnAllCards() {
    this.settings.$menu
      .querySelectorAll('a,button,input,textarea,select')
      .forEach(el => el.setAttribute('tabindex', '-1'));
  }


  /**
   * Handles the event to resize cards by invoking the resizeCards method.
   *
   * @return {void} Does not return any value.
   */
  resizeCardsEvent() {
    this.resizeCards();
  }

  /**
   * Resizes the height of card elements based on the available space below a reference element.
   *
   * This method calculates the height by subtracting the bottom position of a reference element
   * from the height of the viewport. The calculated height is then applied to each card in the
   * collection of cards.
   *
   * @return {void} Does not return any value. The method updates the DOM elements directly.
   */
  resizeCards() {
    const ref = this.settings.$positionReference || this.$element;
    const rect = ref.getBoundingClientRect();
    const height = window.innerHeight - rect.bottom;

    this.settings.$cards.forEach(card => {
      card.style.height = `${height}px`;
    });
  }


  /**
   * Adjusts the position of all cards in the collection. Sets all cards' `left` style property
   * to "100%" with no transition effect. If a card is currently designated as open,
   * its `left` style property is set to "0".
   *
   * @return {void} This method does not return a value.
   */
  repositionCards() {
    this.settings.$cards.forEach(card => {
      card.style.transition = 'none';
      card.style.left = '100%';
    });

    if (this.settings.$openCard) {
      this.settings.$openCard.style.left = '0';
    }

    //  ALSO show all parent cards
    let parent = this.settings.$openCard.parentElement;
    while (parent) {
      if (parent.classList?.contains(this.settings.menuCardClass)) {
        parent.style.left = '0';
      }
      parent = parent.parentElement;
    }
  }

  /**
   * Positions the menu by invoking the positionMenu method.
   *
   * @return {void} Does not return a value.
   */
  positionMenuEvent() {
    this.positionMenu();
  }

  /**
   * Positions the menu element based on the reference element's position within the viewport.
   *
   * This method calculates the bottom position of the reference element and sets the menu's top style
   * to align it accordingly. If no position reference is specified in the settings, the element itself
   * is used as the reference point.
   *
   * @return {void} Does not return a value.
   */
  positionMenu() {
    const ref = this.settings.$positionReference || this.$element;
    const rect = ref.getBoundingClientRect();
    this.settings.$menu.style.top = `${rect.bottom}px`;
  }

  /**
   * Animate element to target position
   *
   * @param {HTMLElement} el
   * @param {{ left?: string, top?: string }} from
   * @param {{ left?: string, top?: string }} to
   */
  animateElement(el, from, to) {

    el.style.transition = 'none';

    if (from.left !== undefined) el.style.left = from.left;
    if (from.top !== undefined) el.style.top = from.top;

    // force reflow
    el.offsetHeight;
    el.style.transition = `all ${this.settings.animationDuration}ms ease`;

    requestAnimationFrame(() => {
      if (to.left !== undefined) el.style.left = to.left;
      if (to.top !== undefined) el.style.top = to.top;
    });
  }

  /**
   * Toggles the "no-scroll" state for the body element to enable or disable scrolling.
   * When enabling the "no-scroll" state, it stores the current scroll position, applies
   * necessary styles to lock the scroll, and resets the scroll position to the top.
   * When disabling the state, it restores the original scroll position and removes the applied styles.
   *
   * @return {void} This method does not return a value.
   */
  toggleNoScroll() {

    if (this.settings.scrollHelper) {
      const body = document.body;
      const helper = body.querySelector('.no-scroll-helper');
      const inner = body.querySelector('.no-scroll-helper-inner');
      let noScrollClass ='';

      if (document.documentElement.scrollHeight > window.innerHeight) {
        noScrollClass = this.settings.openStatusBodyClassOverflow;
      }

      if (!body.classList.contains(this.settings.openStatusBodyClass)) {
        const scrollTop = -document.documentElement.scrollTop;
        helper.setAttribute('data-scroll-top', scrollTop);
        helper.style.cssText = 'position:relative;overflow:hidden;height:100vh;width:100%';
        inner.style.cssText = `position:absolute;top:${scrollTop}px;height:100%;width:100%`;
        body.classList.add(noScrollClass);
        window.scrollTo({top: 0, behavior: 'instant'});
      } else {
        const scrollTop = parseInt(helper.getAttribute('data-scroll-top') || '0') * -1;
        helper.removeAttribute('style');
        inner.removeAttribute('style');
        body.classList.remove(this.settings.openStatusBodyClassOverflow);
        window.scrollTo({top: scrollTop, behavior: 'instant'});
      }
    }
  }

  /**
   * Initializes a 'no-scroll-helper' element within the specified content section. This method ensures
   * that the content is wrapped inside helper elements to manage scroll behavior. If the 'no-scroll-helper'
   * element already exists, the method does nothing.
   *
   * @return {void} Does not return any value.
   */
  initNoScrollHelper() {
    if (this.settings.scrollHelper) {
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
  }

  /**
   * Builds an HTML string for a menu structure based on the provided items and templates.
   *
   * @param {Array} items - The array of menu items to process. Each item should be an object with properties such as `hasSubpages` and `children`.
   * @param {Object|null} [parentItem=null] - The parent menu item of the current set of items. Defaults to `null` for the top-level items.
   * @param {number} [level=0] - The current nesting level within the menu. Defaults to `0` for the top level.
   * @return {string} The generated HTML string representing the menu structure.
   */
  buildHtml(items, parentItem = null, level = 0) {

    let html = '';

    items.forEach(item => {
      const marker = this.getItemMarker(item, parentItem, level);
      if (item.hasSubpages && item.children?.length) {
        marker.submenu = this.buildHtml(item.children, item, level + 1);
      }
      html += this.replaceHtml(this.settings.menuItemTemplate, marker);
    });

    if (parentItem) {
      const marker = this.getItemMarker(parentItem, null, level);
      marker.menuItems = html;
      html = this.replaceHtml(this.settings.subMenuWrapTemplate, marker);
    } else {
      html = this.replaceHtml(this.settings.menuWrapTemplate, {
        uid: items[0].data.pid,
        menuItems: html,
        levelClass: 'level-1'
      });
    }

    return html.replace(/<!--[\s\S]*?-->/g, '');
  }

  /**
   * Generates a marker object describing various attributes and properties for a given item.
   *
   * @param {Object} item - The item object for which the marker is being generated.
   * @param {Object|null} [parentItem=null] - The parent item object, if available. Defaults to null.
   * @param {number} [level=0] - The hierarchical level of the item within the navigation structure. Defaults to 0.
   * @return {Object} - An object containing various properties and attributes related to the item, such as classes, ARIA attributes, hierarchical level, and metadata.
   */
  getItemMarker(item, parentItem = null, level = 0) {
    return {
      activeClass: item.active ? this.settings.activeStatusClass : '',
      currentClass: item.current ? this.settings.currentStatusClass : '',
      levelClass: `level-${level + 1}`,
      ariaCurrent: item.current ? 'page' : '',
      ariaExpanded: item.current ? 'true' : 'false',
      hasChildrenClass: item.hasSubpages ? this.settings.hasChildrenStatusClass : '',
      hasChildren: !!item.hasSubpages,
      linkTypeClass: item.linkType ? `${this.settings.linkTypeClass}-${item.linkType}` : '',
      isLinkedClass: item.isLinked ? this.settings.isLinkedClass : '',
      uid: item.data.uid,
      titleRaw: item.data.title,
      title: item.title,
      link: item.link,
      target: item.target || '_self',
      parentUid: item.data.pid,
      parentTitle: parentItem?.title || '',
      parentLink: parentItem?.link || '',
      parentTarget: parentItem?.target || '_self',

      ifIsLinkedStart: item.isLinked ? '' : '<!--',
      ifIsLinkedEnd: item.isLinked ? '' : '-->',
      ifIsNotLinkedStart: item.isLinked ? '<!--' : '',
      ifIsNotLinkedEnd: item.isLinked ? '-->' : '',

      ifHasChildrenStart: item.hasSubpages ? '' : '<!--',
      ifHasChildrenEnd: item.hasSubpages ? '' : '-->',
      ifHasNoChildrenStart: item.hasSubpages ? '<!--' : '',
      ifHasNoChildrenEnd: item.hasSubpages ? '-->' : '',
    };
  }

  /**
   * Replaces placeholder tokens in the provided HTML string with corresponding values from the data object.
   *
   * @param {string} html The HTML string containing placeholders in the format %key%.
   * @param {Object} data An object containing key-value pairs where keys correspond to the placeholders in the HTML string.
   * @return {string} The HTML string with all matching placeholders replaced with their corresponding values,
   * or an empty string for placeholders with no matching key in the data object.
   */
  replaceHtml(html, data) {
    return html.replace(/%(\w+)%/g, (m, key) =>
      Object.prototype.hasOwnProperty.call(data, key) ? data[key] : ''
    );
  }
}
