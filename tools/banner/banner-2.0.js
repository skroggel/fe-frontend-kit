/**
 * Banner / Overlay (Vanilla JS)
 *
 * A lightweight class to show a full-page overlay (banner, popup, hint or cookie layer),
 * with opening and closing animation and optional cookie persistence.
 *
 * Usage example: cookie notices, teaser banners, welcome layers.
 *
 * The overlay is only shown if no cookie with the given name is set.
 * When the user closes the overlay, a cookie is written to remember this state.
 *
 * Includes customizable CSS classes for transitions and state (active/opening/open/closing).
 *
 * Works without dependencies — ideal for CMS environments (TYPO3, WordPress, etc.).
 *
 * @author Steffen Kroggel <developer@steffenkroggel.de>
 * @copyright 2025 Steffen Kroggel
 * @version 2.0.1 – legacy bannerCloseId fallback
 * @license GNU General Public License v3.0
 * @see https://www.gnu.org/licenses/gpl-3.0.en.html
 *
 * @example
 * // Advanced usage with config:
 * const banner = new Madj2kBanner({
 *   bannerId: 'my-banner',
 *   activeClass: 'active',
 *   openClass: 'open',
 *   closingClass: 'closing',
 *   openingClass: 'opening',
 *   timeout: 1000,
 *   cookieName: 'myBannerCookie',
 *   cookieDays: 30,
 *   debug: false
 * });
 *
 * @example
 * <div id="my-banner" class="banner my-banner">
 *   <div class="my-banner-content">
 *     <button class="my-banner-close" aria-controls="my-banner">Close</button>
 *     <p>Your overlay content here ...</p>
 *   </div>
 * </div>
 *
 * @example
 * .my-banner {
 *   position: fixed;
 *   top: 0;
 *   left: 0;
 *   width: 100%;
 *   height: 100%;
 *   background: rgba(0, 0, 0, 0.8);
 *   z-index: 9999;
 * }
 */

class Madj2kBanner {

  config = {
    'bannerId' : 'banner',
    'bannerCloseId': 'banner-close', // fallback legacy
    'activeClass': 'active',
    'openClass': 'open',
    'closingClass': 'closing',
    'openingClass': 'opening',
    'timeout': '1000',
    'cookieName': 'banner',
    'cookieDays': '365',
    'debug': false
  };

  /**
   * Constructor
   * @param config
   */
  constructor(config) {
    this.config = {...this.config, ...config }
    this._log('Init Madj2kBanner');
    this.initBanner();
  }

  /**
   * Init banner if no cookie is set!
   */
  initBanner () {
    const banner = document.getElementById(this.config.bannerId);
    const self = this;

    if (banner && ! this.getCookie()) {
      this._log('No cookie found, showing banner');

      banner.classList.add(self.config.activeClass);
      setTimeout(function(){
        banner.classList.add(self.config.openingClass);
        setTimeout(function(){
          banner.classList.add(self.config.openClass);
          banner.classList.remove(self.config.openingClass);
          self._log('Banner opened');
        }, self.config.timeout);
      }, 1 );

      // Add close button(s) via aria-controls
      let bannerCloseButtons = document.querySelectorAll('[aria-controls="' + this.config.bannerId + '"]');

      // fallback to legacy ID
      if (bannerCloseButtons.length === 0 && this.config.bannerCloseId) {
        const legacyButton = document.getElementById(this.config.bannerCloseId);
        if (legacyButton) {
          this._log('Legacy close button fallback used:', this.config.bannerCloseId);
          legacyButton.addEventListener('click', (ee) => {
            this._closeBanner(banner);
          });
        }
      } else {

        bannerCloseButtons.forEach(button => {
          button.addEventListener('click', (ee) => {
            this._closeBanner(banner);
          });
        });
      }

    } else {
      if (banner) {
        this._log('Banner not shown (cookie found)');
      }
    }
  }

  /**
   * Closes the banner and sets cookie
   * @param banner
   * @private
   */
  _closeBanner(banner) {
    this.setCookie();

    banner.classList.add(this.config.closingClass);
    banner.classList.remove(this.config.openClass);
    this._log('Banner closing');

    setTimeout(() => {
      banner.classList.remove(this.config.closingClass);
      banner.classList.remove(this.config.activeClass);
      this._log('Banner closed');
    }, this.config.timeout);
  }

  /**
   * Sets cookie
   */
  setCookie() {
    let d = new Date();
    d.setTime(d.getTime() + (this.config.cookieDays * 24 * 60 * 60 * 1000));
    let expires = "expires=" + d.toUTCString();
    document.cookie = (this.config.cookieName + '=1;' + expires + ';path=/' + '; SameSite=Strict');
    this._log('Cookie set:', this.config.cookieName);
  }

  /**
   * Gets cookie values
   * @returns {string}
   */
  getCookie() {
    let name = this.config.cookieName + "=";
    let ca = document.cookie.split(';');

    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) === 0) {
        this._log('Cookie found:', this.config.cookieName);
        return c.substring(name.length, c.length);
      }
    }

    return '';
  }

  /**
   * Debug logging helper
   * @private
   */
  _log(...args) {
    if (this.config.debug) {
      console.log('[Madj2kBanner]', ...args);
    }
  }
}
