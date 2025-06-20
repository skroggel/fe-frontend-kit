/**
 * Scrolling-Events (Vanilla JS)
 *
 * @author Steffen Kroggel <developer@steffenkroggel.de>
 * @copyright 2025 Steffen Kroggel
 * @version 2.0.0
 * @license GNU General Public License v3.0
 * @see https://www.gnu.org/licenses/gpl-3.0.en.html
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
 * @example
 * // Initialize with defaults
 * const scrolling = new Scrolling();
 *
 * @example
 * // Initialize with custom config
 * const scrolling = new Madj2kScrolling({
 *   anchorScrollingCollapsibleSelector: ['.collapse', '.custom-collapse'],
 *   anchorScrollingSelector: ['a[href^="#"]', '.btn-scroll'],*
 *   anchorScrollingOffsetSelector: '#siteheader',
 *   anchorScrollingDisableClass: 'js-no-scroll',
 *   appearOnScrollSelector: ['.js-appear-on-scroll'],
 *   appearOnScrollTimeout: 500,
 *   appearOnScrollThreshold: 25*
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
    anchorScrollingDisableClass: 'js-no-scroll',
    anchorScrollingCollapsibleSelector: ['.collapse'],
    anchorScrollingBehavior: 'smooth',
    appearOnScrollSelector: ['.js-appear-on-scroll'],
    appearOnScrollTimeout: 500,
    appearOnScrollThreshold: 25
  };

  constructor(config) {
    this.config = { ...this.config, ...config };
    this.scrollTimer = null;

    this.initScrollClassesForBody();
    this.initAnchorScrolling();
    this.initAppearOnScroll();
  }

  initScrollClassesForBody() {
    const body = document.body;
    let lastScrollTop = window.scrollY;
    let lastContentHeight = document.documentElement.scrollHeight;

    const setContentHeight = () => {
      lastContentHeight = document.documentElement.scrollHeight;
      body.setAttribute('data-last-content-height', lastContentHeight);
    };

    const addScrollClasses = () => {
      const scrollTop = window.scrollY;
      const contentHeight = document.documentElement.scrollHeight;

      if (parseInt(body.getAttribute('data-last-content-height')) !== contentHeight) {
        return;
      }

      if (!body.classList.contains('block-scroll-classes')) {
        if (scrollTop > 0) {
          body.classList.remove('scroll-up', 'scroll-down');
          if (scrollTop > lastScrollTop) {
            body.classList.add('scroll-down');
          } else if (scrollTop < lastScrollTop) {
            body.classList.add('scroll-up');
          }
        } else {
          body.classList.remove('scroll-down');
        }
      }

      body.setAttribute('data-last-scroll-top', Math.max(scrollTop, 0));
      lastScrollTop = scrollTop;
    };

    setContentHeight();

    window.addEventListener('scroll', () => {
      setContentHeight();
      addScrollClasses();
    });
  }

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
        .map(sel => `${sel}:not(.visually-hidden-focusable):not(.${this.config.anchorScrollingDisableClass})`)
        .join(', ');
    };

    const getCollapsibleSelector = () => {
      return this.config.anchorScrollingCollapsibleSelector
        .map(sel => `${sel}:not(.${this.config.anchorScrollingDisableClass})`)
        .join(', ');
    };

    document.querySelectorAll(getAnchorSelector())
      .forEach(link => {
        link.addEventListener('click', jumpToAnchorByLink);
      });

    document.querySelectorAll(getCollapsibleSelector())
      .forEach(el => {
        el.addEventListener('shown.bs.collapse', e => {
          scrollToElement(e.target);
        });
      });

    jumpToAnchorByUrl();
  }

  initAppearOnScroll() {
    const initElement = (element) => {
      const rect = element.getBoundingClientRect();
      const windowBottom = window.scrollY + window.innerHeight;
      const elementTop = window.scrollY + rect.top;

      if (windowBottom > elementTop) {
        element.setAttribute('data-appear-on-scroll', 0);
      } else {
        element.setAttribute('data-appear-on-scroll', 1);
      }
    };

    const showElement = (element) => {
      const rect = element.getBoundingClientRect();
      const windowBottom = window.scrollY + window.innerHeight;
      const elementTop = window.scrollY + rect.top;

      if (windowBottom > elementTop) {
        element.setAttribute('data-appear-on-scroll', 0);
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
}
