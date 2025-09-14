/**
 * Madj2kSimpleFadeSlider
 *
 * A lightweight fade slider using opacity and z-index.
 * - Purely DOM based (no keyframes required)
 * - Automatic looping through an arbitrary number of slides
 * - Fully accessible with aria-hidden management
 * - Configurable via options
 * - Designed for CMS contexts with dynamic content
 *
 * @author Steffen Kroggel <developer@steffenkroggel.de>
 * @copyright 2025 Steffen Kroggel
 * @version 1.0.0
 * @license GNU General Public License v3.0
 * @see https://www.gnu.org/licenses/gpl-3.0.en.html
 *
 * @example
 * // Initialize with defaults
 * const slider = new Madj2kSimpleFadeSlider('.js-fade-sliderr');
 *
 * @example
 * // Initialize with custom config
 * const slider = new Madj2kSimpleFadeSlider('.js-fade-sliderr', {
 *   duration: 8,
 *   classSlide: 'fade-slider-item',
 *   classVisible: 'is-visible',
 *   debug: true
 * });
 *
 * @example
 * // Example HTML
 * <section class="fade-slider js-fade-sliderr" aria-label="Image gallery">
 *   <div class="fade-slider-item"><img src="img1.jpg" alt="Description 1"></div>
 *   <div class="fade-slider-item"><img src="img2.jpg" alt="Description 2"></div>
 *   <div class="fade-slider-item"><img src="img3.jpg" alt="Description 3"></div>
 * </section>
 *
 * @example
 * // Example SCSS
 * .fade-slider {
 *   position: relative;
 *   height: 300px;
 *   overflow: hidden;
 * }
 *
 * .fade-slide, .fade-slider-item {
 *   position: absolute;
 *   inset: 0;
 *   opacity: 0;
 *   z-index: 1;
 *   transition: opacity 1s ease-in-out;
 * }
 *
 * .fade-slide.is-visible, .fade-slider-item.is-visible {
 *   opacity: 1;
 *   z-index: 2;
 * }
 */

class Madj2kSimpleFadeSlider {
  config = {
    duration: 12,
    classSlide: 'fade-slide',
    classVisible: 'is-visible',
    debug: false
  };

  /**
   * @param {string} selector - CSS selector for the slider container
   * @param {Object} config - configuration options
   * @param {number} [config.duration=12] - time in seconds between slide changes
   * @param {string} [config.classSlide='fade-slide'] - class for each slide
   * @param {string} [config.classVisible='is-visible'] - class for visible slide
   * @param {boolean} [config.debug=false] - enable debug logging
   */
  constructor(selector, config = {}) {
    this.container = document.querySelector(selector);
    if (!this.container) return;

    this.config = {
      ...this.config,
      ...config
    };

    this.slides = Array.from(this.container.querySelectorAll(`.${this.config.classSlide}`));
    this.total = this.slides.length;
    this.current = 0;

    this._log('Initialized with config:', this.config);

    this.setup();
    this.start();
  }

  /**
   * Initializes all slides
   * @private
   */
  setup() {
    this.slides.forEach((slide, index) => {
      slide.classList.add(this.config.classSlide);
      slide.setAttribute('aria-hidden', index === 0 ? 'false' : 'true');
    });
    if (this.slides[0]) {
      this.slides[0].classList.add(this.config.classVisible);
    }
  }

  /**
   * Starts the automatic fade loop
   * @private
   */
  start() {
    setInterval(() => this.showNext(), this.config.duration * 1000);
  }

  /**
   * Shows the next slide
   * @private
   */
  showNext() {
    const currentSlide = this.slides[this.current];
    if (currentSlide) {
      currentSlide.classList.remove(this.config.classVisible);
      currentSlide.setAttribute('aria-hidden', 'true');
    }

    this.current = (this.current + 1) % this.total;

    const nextSlide = this.slides[this.current];
    if (nextSlide) {
      nextSlide.classList.add(this.config.classVisible);
      nextSlide.setAttribute('aria-hidden', 'false');
    }

    this._log('Switched to slide', this.current);
  }

  /**
   * Debug logging helper
   * @private
   */
  _log(...args) {
    if (this.config.debug) {
      console.log('[Madj2kSimpleFadeSlider]', ...args);
    }
  }
}
