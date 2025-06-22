/**
 * Scrolling-Events
 *
 * A lightweight scrolling helper class that enables:
 * 1. Body classes based on scroll direction (scroll-up / scroll-down)
 * 2. Smooth anchor scrolling with optional offset
 * 3. Automatic scrolling when collapsible elements (like Bootstrap .collapse) open
 * 4. Appear-on-scroll animations for elements
 *
 * The class is fully configurable via options and is designed to be used in CMS contexts
 * where elements can be added, removed or re-ordered dynamically.
 *
 * @author Steffen Kroggel <developer@steffenkroggel.de>
 * @copyright 2025 Steffen Kroggel
 * @version 2.0.1 – Added debug option + log helper, changed anchorScrollingDisableSelector
 * @license GNU General Public License v3.0
 * @see https://www.gnu.org/licenses/gpl-3.0.en.html
 *
 * @example
 * // Initialize with defaults
 * const scrolling = new Madj2kScrolling();
 *
 * @example
 * // Initialize with custom config
 * const scrolling = new Madj2kScrolling({
 *   anchorScrollingCollapsibleSelector: ['.collapse', '.custom-collapse'],
 *   anchorScrollingSelector: ['a[href^="#"]', '.btn-scroll'],
 *   anchorScrollingOffsetSelector: '#siteheader',
 *   anchorScrollingDisableSelector: '.js-no-scroll',
 *   appearOnScrollSelector: ['.js-appear-on-scroll'],
 *   appearOnScrollTimeout: 500,
 *   appearOnScrollThreshold: 25,
 *   debug: true
 * });
 *
 * @example
 * // Example HTML for anchor scrolling:
 * <a href="#section1">Go to Section 1</a>
 *
 * @example
 * // Example HTML for anchor scrolling with collapsibles:
 * <div class="collapse" id="accordion1">...</div>
 *
 * @example
 * // Example HTML for appear on scroll:
 * <div class="js-appear-on-scroll">
 *   <h2>Animated content</h2>
 *   <p>This will fade and move in when scrolled into view.</p>
 * </div>
 *
 * @example
 * // Suggested SCSS for appear on scroll:
 * .js-appear-on-scroll {
 *   opacity: 0;
 *   transition: opacity 0.5s ease-out, transform 0.5s ease-out;
 *   transform: translateY(1rem);
 *
 *   &[data-appear-on-scroll="0"] {
 *     opacity: 1;
 *     transform: translateY(0);
 *   }
 * }
 */

class Madj2kScrolling {
  config = {
    anchorScrollingSelector: ['a[href^="#"]'],
    anchorScrollingOffsetSelector: '',
    anchorScrollingScriptScrollTimeout: 800,
    anchorScrollingDisableSelector: '.js-no-scroll',
    anchorScrollingCollapsibleSelector: ['.collapse'],
    anchorScrollingBehavior: 'smooth',
    appearOnScrollSelector: ['.js-appear-on-scroll'],
    appearOnScrollTimeout: 500,
    appearOnScrollThreshold: 25,
    debug: false
  };

  constructor(config) {
    this.config = { ...this.config, ...config };

    this.lastScrollTop = window.scrollY;
    this.lastContentHeight = document.documentElement.scrollHeight;

    this._log('Initialized with config:', this.config);

    this.initScrollClassesForBody();
    this.initAnchorScrolling();
    this.initAppearOnScroll();
  }

  /**
   * Adds scroll classes to body based on scroll direction
   * @private
   */
  initScrollClassesForBody() {
    const addScrollClasses = () => {
      const scrollTop = window.scrollY;
      const contentHeight = document.documentElement.scrollHeight;

      if (this.lastContentHeight !== contentHeight) {
        this._log('Content height changed, skipping scroll class update');
        this.lastContentHeight = contentHeight;
        return;
      }

      if (!document.body.classList.contains('block-scroll-classes')) {
        if (scrollTop > 0) {
          document.body.classList.remove('scroll-up', 'scroll-down');
          if (scrollTop > this.lastScrollTop) {
            document.body.classList.add('scroll-down');
            this._log('Scroll direction: down');
          } else if (scrollTop < this.lastScrollTop) {
            document.body.classList.add('scroll-up');
            this._log('Scroll direction: up');
          }
        } else {
          document.body.classList.remove('scroll-down');
        }
      }

      this.lastScrollTop = scrollTop;
    };

    window.addEventListener('scroll', () => {
      addScrollClasses();
    });
  }

  /**
   * Initializes anchor scrolling with optional offset
   * @private
   */
  initAnchorScrolling() {
    const offsetElement = document.querySelector(this.config.anchorScrollingOffsetSelector);
    let scriptScrollTimer = null;

    const scrollToElement = (element) => {
      if (element) {
        const rect = element.getBoundingClientRect();
        let scrollTo = window.scrollY + rect.top - 40;

        if (offsetElement && offsetElement.offsetTop >= 0 && !offsetElement.hidden) {
          scrollTo -= offsetElement.offsetHeight;
        }

        document.body.classList.add('block-scroll-classes');
        if (scriptScrollTimer) {
          clearTimeout(scriptScrollTimer);
        }

        scriptScrollTimer = setTimeout(() => {
          document.body.classList.remove('block-scroll-classes');
        }, this.config.anchorScrollingScriptScrollTimeout);

        window.scrollTo({
          top: scrollTo,
          behavior: this.config.anchorScrollingBehavior
        });

        this._log('Anchor scroll to:', element);
      }
    };

    const jumpToAnchorByUrl = () => {
      const anchorName = window.location.hash.replace('#', '');
      if (anchorName) {
        const anchor = document.querySelector(`a[id="${anchorName}"], #${anchorName}`);
        if (anchor) scrollToElement(anchor);
      }
    };

    const jumpToAnchorByLink = (event) => {
      event.preventDefault();

      const anchorId = event.currentTarget.getAttribute('href');
      if (anchorId && anchorId.startsWith('#')) {
        const anchor = document.querySelector(anchorId);
        if (anchor) scrollToElement(anchor);
      }
    };

    const getAnchorSelector = () => {
      return this.config.anchorScrollingSelector
        .map(sel => `${sel}:not(.visually-hidden-focusable):not(${this.config.anchorScrollingDisableSelector})`)
        .join(', ');
    };

    const getCollapsibleSelector = () => {
      return this.config.anchorScrollingCollapsibleSelector
        .map(sel => `${sel}:not(${this.config.anchorScrollingDisableSelector})`)
        .join(', ');
    };

    document.querySelectorAll(getAnchorSelector())
      .forEach(link => {
        link.addEventListener('click', jumpToAnchorByLink);
      });

    document.querySelectorAll(getCollapsibleSelector())
      .forEach(el => {
        el.addEventListener('shown.bs.collapse', e => {
          this._log('Collapse shown, scroll to:', e.target);
          scrollToElement(e.target);
        });
      });

    jumpToAnchorByUrl();
  }

  /**
   * Initializes appear-on-scroll animations
   * @private
   */
  initAppearOnScroll() {
    const initElement = (element) => {
      const rect = element.getBoundingClientRect();
      const windowBottom = window.scrollY + window.innerHeight;
      const elementTop = window.scrollY + rect.top;

      if (windowBottom > elementTop) {
        element.setAttribute('data-appear-on-scroll', 0);
        this._log('Appear on scroll (init):', element);
      } else {
        element.setAttribute('data-appear-on-scroll', 1);
      }
    };

    const showElement = (element) => {
      const rect = element.getBoundingClientRect();
      const windowBottom = window.scrollY + window.innerHeight;
      const elementTop = window.scrollY + rect.top;

      if (windowBottom > elementTop && element.getAttribute('data-appear-on-scroll') !== '0') {
        element.setAttribute('data-appear-on-scroll', 0);
        this._log('Appear on scroll (show):', element);
      }
    };

    const getAppearOnScrollSelector = () => {
      return this.config.appearOnScrollSelector.join(', ');
    };

    const updateOnScroll = () => {
      document.querySelectorAll(getAppearOnScrollSelector()).forEach(element => {
        showElement(element);
      });
    };

    document.querySelectorAll(getAppearOnScrollSelector()).forEach(element => {
      initElement(element);
    });

    window.addEventListener('scroll', updateOnScroll);
  }

  /**
   * Debug logging helper
   * @private
   */
  _log(...args) {
    if (this.config.debug) {
      console.log('[Madj2kScrolling]', ...args);
    }
  }
}
