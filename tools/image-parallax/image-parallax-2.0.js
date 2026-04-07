/**
 * ImageParallax
 *
 * Handles a vertical parallax scrolling effect for images inside a given container element.
 * - Applies a vertical translateY transform to an image based on scroll position.
 * - Dynamically increases image height depending on parallax range.
 * - Synchronizes picture wrapper height to avoid whitespace.
 * - Waits until image is fully loaded before initialization
 *   (supports cached images + lazyloaded images).
 *
 * CSS:
 *
 * .parallax-img {
 *     picture {
 *         position: relative;
 *         overflow: hidden;
 *         display: inline-flex;
 *         align-items: center;
 *     }
 *     img {
 *         display: block;
 *         width: 100%;
 *         height: auto;
 *         object-fit: cover;
 *         will-change: transform;
 *     }
 * }
 *
 * Usage:
 *
 * const parallax = new ImageParallax(container, 'img', {
 *   maxShift: '30%',
 *   speed: 0.5,
 *   activeClass: 'is-parallax-active'
 * });
 *
 * Author: Steffen Kroggel <developer@steffenkroggel.de>
 * Last updated: 29.03.2026
 * Version: v1.7.0
 */
class ImageParallax {
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
    this.handleImageLoad = this.onImageLoad.bind(this);

    this.initialized = false;

    if (this.img) {
      this.waitForImage();
    }
  }

  /**
   * Waits until the image is fully loaded before starting parallax.
   *
   * Handles:
   * - images already loaded from browser cache
   * - images loaded later via lazyloading
   */
  waitForImage() {
    if (this.img.complete && this.img.naturalHeight > 0) {
      this.init();
    } else {
      this.img.addEventListener('load', this.handleImageLoad, { once: true });
    }
  }

  /**
   * Called when image load event fires.
   */
  onImageLoad() {
    this.init();
  }

  /**
   * Initializes parallax once image dimensions are available.
   */
  init() {
    if (this.initialized) {
      return;
    }

    this.initialized = true;

    this.updateImageHeight();
    this.update();

    window.addEventListener('scroll', this.handleUpdate, { passive: true });
    window.addEventListener('resize', this.handleResize, { passive: true });
  }

  /**
   * Removes listeners and cleanup.
   */
  destroy() {
    window.removeEventListener('scroll', this.handleUpdate);
    window.removeEventListener('resize', this.handleResize);
    this.img?.removeEventListener('load', this.handleImageLoad);
  }

  /**
   * Recalculates dimensions on viewport resize.
   */
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
   * visible height + full parallax range
   *
   * Example:
   * container height 300px + 30px total shift range = 330px
   */
  updateImageHeight() {
    const displayedHeight = this.getDisplayedHeight();
    const maxShiftPx = this.getMaxShiftPx();
    const finalHeight = displayedHeight + maxShiftPx;

    this.img.style.height = `${finalHeight}px`;

    if (this.picture) {
      this.picture.style.height = `${displayedHeight}px`;
    }
  }

  /**
   * Updates the position of an image inside a container based on the viewport height,
   * container position, and defined speed.
   *
   * The method calculates the progress of the container's visibility within the viewport
   * and translates the image vertically based on that progress.
   *
   * @return {void}
   */
  update() {
    const vh = window.innerHeight;
    const rect = this.container.getBoundingClientRect();
    const maxShiftPx = this.getMaxShiftPx();
    const halfShiftPx = maxShiftPx / 2;

    const progress = (vh - rect.top) / (vh + rect.height);
    const centeredProgress = (progress - 0.5) * 2;

    const speedFactor = Math.max(0.01, Number(this.options.speed) || 1);
    const easedProgress = Math.max(
      -1,
      Math.min(1, centeredProgress / speedFactor)
    );

    const shift = easedProgress * halfShiftPx;

    this.img.style.transform = `translate3d(0, ${shift}px, 0)`;
    this.container.classList.add(this.options.activeClass);
  }
}
