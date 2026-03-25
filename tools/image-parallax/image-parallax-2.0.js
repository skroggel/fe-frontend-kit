/**
 * ImageParallax
 *
 * Handles a vertical parallax scrolling effect for images inside a given container element.
 * - Applies a vertical translateY transform to an image based on scroll position.
 * - Dynamically increases image height depending on parallax range.
 * - Synchronizes picture wrapper height to avoid whitespace.
 *
 * Author: Steffen Kroggel <developer@steffenkroggel.de>
 * Last updated: 22.03.2026
 * Version: v1.6.0
 */
class Madj2kImageParallax {
  /**
   * @param {HTMLElement} container
   * @param {string} [imgSelector='img']
   * @param {object} [options={}]
   * @param {number|string} [options.maxShift='30%'] - px or percentage based on displayed height
   * @param {number} [options.speed=0.5]
   * @param {string} [options.activeClass='is-parallax-active']
   */
  constructor(container, imgSelector = 'img', options = {}) {
    this.container = container;
    this.img = this.container.querySelector(imgSelector);
    this.picture = this.img?.closest('picture');

    this.options = Object.assign({
      maxShift: '30%',
      speed: 0.5,
      activeClass: 'is-parallax-active'
    }, options);

    this.handleUpdate = this.update.bind(this);
    this.handleResize = this.onResize.bind(this);

    if (this.img) {
      this.init();
    }
  }

  init() {
    this.updateImageHeight();
    this.update();

    window.addEventListener('scroll', this.handleUpdate, { passive: true });
    window.addEventListener('resize', this.handleResize, { passive: true });
  }

  destroy() {
    window.removeEventListener('scroll', this.handleUpdate);
    window.removeEventListener('resize', this.handleResize);
  }

  onResize() {
    this.updateImageHeight();
    this.update();
  }

  /**
   * Returns the visible display height of the container.
   */
  getDisplayedHeight() {
    return this.container.offsetHeight || this.container.getBoundingClientRect().height || 0;
  }

  /**
   * Converts maxShift into pixels.
   * Percentage values are based on displayed container height.
   */
  getMaxShiftPx() {
    const { maxShift } = this.options;
    const displayedHeight = this.getDisplayedHeight();

    if (typeof maxShift === 'string' && maxShift.endsWith('%')) {
      const percent = parseFloat(maxShift) / 100;
      return displayedHeight * percent;
    }

    return Number(maxShift) || 0;
  }

  /**
   * Sets the required image height:
   * visible height + full upward/downward parallax range
   *
   * Example:
   * container height 300px + 30px up + 30px down = 360px
   */
  updateImageHeight() {
    const displayedHeight = this.getDisplayedHeight();
    const maxShiftPx = this.getMaxShiftPx();
    const finalHeight = displayedHeight + (maxShiftPx * 2);

    this.img.style.height = `${finalHeight}px`;

    if (this.picture) {
      this.picture.style.height = `${displayedHeight}px`;
    }
  }

  /**
   * Updates the position of an image inside a container based on the viewport height, container position, and defined speed.
   *
   * The method calculates the progress of the container's visibility within the viewport and translates the image vertically based on that progress. Additionally, it applies a CSS class to indicate activity.
   *
   * @return {void} Does not return a value.
   */
  update() {
    const vh = window.innerHeight;
    const rect = this.container.getBoundingClientRect();
    const maxShiftPx = this.getMaxShiftPx();

    const progress = (vh - rect.top) / (vh + rect.height);

    const shift = Math.max(
      -maxShiftPx,
      Math.min(
        maxShiftPx,
        (progress - 0.5) * 2 * maxShiftPx * this.options.speed
      )
    );

    this.img.style.transform = `translate3d(0, ${shift}px, 0)`;
    this.container.classList.add(this.options.activeClass);
  }
}
