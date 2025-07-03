/**!
 * Owl with thumbnails (requires jQuery and OWL Carousel)
 *
 * A JavaScript helper class to create a main OWL carousel with a synchronized thumbnail navigation carousel.
 *
 * Supports flexible configurations for both the main and the thumbnail carousels,
 * including:
 * - Custom navigation
 * - Syncing main carousel to clicked thumbnails
 * - Syncing thumbnails to main carousel changes
 * - Optionally equalizing thumbnail heights
 * - Optionally preventing the centered thumbnail stage shift (for designs where thumbs should stay left aligned)
 * - Responsive and CMS-friendly (works with dynamic content)
 *
 * This is especially useful for image galleries or product carousels in CMS setups (e.g. TYPO3, WordPress, etc.)
 * where content may change dynamically.
 *
 * @author Steffen Kroggel <developer@steffenkroggel.de>
 * @copyright 2025 Steffen Kroggel
 * @version 1.0.0
 * @license GNU General Public License v3.0
 * @see https://www.gnu.org/licenses/gpl-3.0.en.html
 *
 * @example:
 * $('.js-highlight-slider-container').each(function () {
 *  const owlThumbnail = new Madj2kOwlThumbnail(
 *    '.js-main-carousel',
 *    '.js-thumbs-carousel',
 *    {
 *     main: {
 *       items: 1,
 *       margin: 20,
 *       dots: true,
 *       nav: true,
 *       autoHeight: true
 *     },
 *     thumbs: {
 *       items: 3,
 *       margin: 10,
 *       dots: false,
 *       nav: true,
 *       center: true
 *     },
 *     resizeEvent: 'custom.resize',
 *     equalizeThumbHeights: true,
 *     noStageOffset: true
 *     },
 *     false,
 *     this
 *   });
 * HTML example without data attributes:
 * <div class="js-main-carousel owl-carousel">
 *   <div class="item"><img src="image1.jpg" alt=""></div>
 *   <div class="item"><img src="image2.jpg" alt=""></div>
 *   <div class="item"><img src="image3.jpg" alt=""></div>
 * </div>
 * <div class="js-thumbs-carousel owl-carousel">
 *   <div class="item"><img src="thumb1.jpg" alt=""></div>
 *   <div class="item"><img src="thumb2.jpg" alt=""></div>
 *   <div class="item"><img src="thumb3.jpg" alt=""></div>
 * </div>
 *
 * HTML example with data attributes:
 * <div class="js-main-carousel owl-carousel">
 *   <div class="item"><img src="image1.jpg" alt=""></div>
 *   <div class="item"><img src="image2.jpg" alt=""></div>
 *   <div class="item"><img src="image3.jpg" alt=""></div>
 * </div>
 * <div class="js-thumbs-carousel owl-carousel">
 *   <div class="item" data-index="0"><img src="thumb1.jpg" alt=""></div>
 *   <div class="item" data-index="1"><img src="thumb2.jpg" alt=""></div>
 *   <div class="item" data-index="2"><img src="thumb3.jpg" alt=""></div>
 * </div>
 *
 */
class Madj2kOwlThumbnail {
  /**
   * Creates a new OwlThumbnail instance
   * @param {string} mainSelector - CSS selector for main carousel element
   * @param {string} thumbSelector - CSS selector for thumbnail carousel element
   * @param {Object} options - Configuration options
   * @param {boolean} debug - Enables debug logging
   * @param {Document} container - DOM container to use for event listeners
   */
  constructor(mainSelector, thumbSelector, options = {}, debug = false, container = document) {
    this.debug = debug;

    this.$context = $(container);
    this.$main = this.$context.find(mainSelector);
    this.$thumbs = this.$context.find(thumbSelector);
    this.options = options;
    this.syncing = false;

    if (!this.$main.length) {
      this._log('Error: Main carousel element not found');
      return;
    }
    if (!this.$thumbs.length) {
      this._log('Error: Thumbnail carousel element not found');
      return;
    }

    this._log('Initializing OwlThumbnail with elements:', {main: mainSelector, thumbs: thumbSelector});
    this._init();

    if (this.options.resizeEvent) {
      this._log('Setting up resize event listener:', this.options.resizeEvent);
      $(document).on(this.options.resizeEvent, () => this._reinit());
    }
  }
  /**
   * Initializes both main and thumbnail carousels with their configurations
   * Sets up event handlers and syncs initial state
   * @private
   */
  _init() {
    const defaultMain = {
      items: 1,
      margin: 20,
      dots: true,
      nav: true,
      autoHeight: true,
      loop: false,
      onChanged: this._syncThumbs.bind(this)
    };

    // Erweitere die Standard-Thumbnail-Konfiguration
    const defaultThumbs = {
      items: 3,
      margin: 10,
      dots: false,
      nav: true,
      center: true,
      loop: false,
      onInitialized: (event) => {
        this._highlightInitialThumb(event);
        this._equalizeThumbnailHeights();
        this._repositionThumbNav();
      },
      onRefreshed: () => {
        this._equalizeThumbnailHeights();
      },
      onResized: () => {
        this._equalizeThumbnailHeights();
      }
    };

    this.configMain = {...defaultMain, ...this.options.main, loop: false};
    this.configThumbs = {...defaultThumbs, ...this.options.thumbs, loop: false};

    this._log('Initializing main carousel with config:', this.configMain);
    this.$main.owlCarousel(this.configMain);

    this._log('Initializing thumbnail carousel with config:', this.configThumbs);
    this.$thumbs.owlCarousel(this.configThumbs);

    this._log('Binding event handlers');
    this._bindThumbClick();
    this._bindThumbNav();
  }

  /**
   * Equalizes the height of all thumbnail items to match the height of the tallest item
   * @private
   * @returns {Promise<void>}
   */
  async _equalizeThumbnailHeights() {
    if (!this.options.equalizeThumbHeights) return;

    const $thumbItems = this.$thumbs.find('.owl-item');
    const $images = $thumbItems.find('img');

    // Wait until all images are loaded
    try {
      await Promise.all(
        Array.from($images).map(img => {
          if (img.complete) return Promise.resolve();
          return new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
            // Timeout nach 5 Sekunden
            setTimeout(reject, 5000);
          });
        })
      );

      // Reset height
      $thumbItems.css('height', 'auto');

      // find maximum height
      const maxHeight = Math.max(...$thumbItems.map((_, el) => $(el).outerHeight()).get());

      // Set height
      $thumbItems.css('height', maxHeight + 'px');

      this._log('Thumbnail heights equalized to:', maxHeight);
    } catch (error) {
      this._log('Error equalizing thumbnail heights:', error);
    }
  }

  /**
   * Reinitializes both main and thumbnail carousels after destroying them
   * Used when owl carousels need to be rebuilt, e.g. after window resize
   * @private
   */
  _reinit() {
    this.$main.trigger('destroy.owl.carousel');
    this.$thumbs.trigger('destroy.owl.carousel');

    this.$main.owlCarousel(this.configMain);
    this.$thumbs.owlCarousel(this.configThumbs);

    this._bindThumbClick();
    this._bindThumbNav();
  }

  /**
   * Syncs thumbnail carousel position with main carousel changes
   * Updates active thumbnail highlighting and centers thumbnails based on current item
   * Uses page size or configured items count to determine visible thumbnails
   * @param {Object} event - Owl carousel change event
   * @private
   */
  _syncThumbs(event) {
    if (this.syncing) return;
    this.syncing = true;

    const index = event.item.index;
    this._log('Syncing thumbnails to index:', index);

    let $target = this.$thumbs.find(`[data-index="${index}"]`);
    if (!$target.length) {
      this._log('No data-index found, falling back to index-based selection');
      $target = this.$thumbs.find('.owl-item').eq(index).find('.item');
    }

    this.$thumbs.find('.owl-item').removeClass('current');
    const $owlItem = $target.closest('.owl-item');
    $owlItem.addClass('current');

    const thumbItems = this.$thumbs.find('.owl-item');

    // Use event.page.size for visible items, fallback to config or 3
    const visible = event.page?.size || this.configThumbs.items || 3;
    this._log('Visible thumbnails:', visible);

    const itemIndex = $owlItem.index();
    const halfVisible = Math.floor(visible / 2);
    const maxIndex = thumbItems.length - visible;

    let centerIndex = itemIndex - halfVisible;

    // Set boundaries
    if (centerIndex < 0) centerIndex = 0;
    if (centerIndex > maxIndex) centerIndex = maxIndex;

    this._log('Centering thumbnails to index:', centerIndex);
    this.$thumbs.trigger('to.owl.carousel', [centerIndex, 300, true]);

    this._repositionThumbNav(index );
    this.syncing = false;
  }

  /**
   * Binds click handler to thumbnail items
   * Gets index from data attribute or item position and triggers main carousel slide
   * @private
   */
  _bindThumbClick() {
    this.$thumbs.on('click', '.owl-item', (e) => {
      const $item = $(e.currentTarget);
      let index = $item.find('[data-index]').data('index');
      if (index === undefined) index = $item.index();

      this.$main.trigger('to.owl.carousel', [index, 300, true]);
    });
  }

  /**
   * Binds navigation handlers to thumbnail carousel navigation buttons
   * Prevents default scrolling and syncs with main carousel navigation
   * @param {string} navClass - CSS class for navigation elements
   * @private
   */
  _bindThumbNav(navClass = 'owl-nav') {
    // Prevent default scrolling behavior for thumbnail nav buttons
    this.$thumbs.find('.owl-prev, .owl-next').off('click').on('click', (e) => {
      e.preventDefault();

      // Get current index of main carousel
      const mainData = this.$main.data('owl.carousel');
      if (!mainData) return;

      let newIndex;

      if ($(e.currentTarget).hasClass('owl-prev')) {
        // Previous slide in main carousel
        newIndex = mainData.relative(mainData.current()) - 1;
        if (newIndex < 0) newIndex = 0; // Kein Loop
      } else if ($(e.currentTarget).hasClass('owl-next')) {
        // Next slide in main carousel
        newIndex = mainData.relative(mainData.current()) + 1;
        if (newIndex >= mainData.items().length) newIndex = mainData.items().length - 1;
      }

      this.$main.trigger('to.owl.carousel', [newIndex, 300, true]);
    });
  }

  /**
   * Start thumbnails on the left side of the stage, even if they are centered!
   * @private
   */
  _repositionThumbNav(currentIndex = 0) {
    if (!this.options.noStageOffset) return;

    const $thumbStage = this.$thumbs.find('.owl-stage');
    const $thumbItems = this.$thumbs.find('.owl-item');
    const thumbCount = $thumbItems.length;
    const lastIndex = thumbCount - 1;

    // first thumb aligned left
    if (currentIndex === 0) {

      $thumbStage.css('transform', 'translate3d(0px, 0px, 0px)');
      this._log('Thumb stage repositioned: left-aligned (index 0)');

    // last thumb aligned right
    } else if (currentIndex === lastIndex) {
      let totalWidth = 0;
      $thumbItems.each((i, item) => {
        totalWidth += $(item).outerWidth(true); // inklusive margin
      });

      const containerWidth = this.$thumbs.width();
      const offset = Math.min(0, containerWidth - totalWidth);

      $thumbStage.css('transform', `translate3d(${offset}px, 0px, 0px)`);
      this._log(`Thumb stage repositioned: right-aligned (index ${lastIndex})`);
    } else {
      this._log(`Thumb stage normal centered (index ${currentIndex})`);
    }
  }


  /**
   * Highlights the initial active thumbnail when thumbnails carousel is initialized
   * Tries to find thumbnail by data-index first, falls back to index-based selection
   * Adds 'current' class to mark the active thumbnail
   * @param {Object} event - Owl carousel initialization event
   * @private
   */
  _highlightInitialThumb(event) {
    const currentIndex = event.item.index;
    let $target = this.$thumbs.find(`[data-index="${currentIndex}"]`).closest('.owl-item');
    if (!$target.length) $target = this.$thumbs.find('.owl-item').eq(currentIndex);
    $target.addClass('current');
  }

  /**
   * Debug logging helper
   * @private
   */
  _log(...args) {
    if (this.debug) {
      console.log('[OwlThumbnail]', ...args);
    }
  }
}
