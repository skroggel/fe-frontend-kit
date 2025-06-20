/**
 * Overlay (Vanilla JS)
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
 * @version 2.0.0
 * @license GNU General Public License v3.0
 * @see https://www.gnu.org/licenses/gpl-3.0.en.html
 *
 *
 * Basic HTML structure:
 *
 * <div id="my-banner" class="my-banner">
 *   <div class="my-banner-content">
 *     <button id="my-banner-close" class="my-banner-close">Close</button>
 *     <p>Your overlay content here ...</p>
 *   </div>
 * </div>
 *
 *
 * Example CSS:
 *
 * .my-banner {
 *   position: fixed;
 *   top: 0;
 *   left: 0;
 *   width: 100%;
 *   height: 100%;
 *   background: rgba(0, 0, 0, 0.8);
 *   opacity: 0;
 *   visibility: hidden;
 *   transition: opacity 0.5s ease, visibility 0.5s ease;
 *   z-index: 9999;
 * }
 *
 * .my-banner.active {
 *   visibility: visible;
 * }
 *
 * .my-banner.open {
 *   opacity: 1;
 * }
 *
 * .my-banner.closing {
 *   opacity: 0;
 * }
 *
 *
 * Basic usage:
 *
 * const banner = new Madj2kBanner();
 *
 *
 * Advanced usage with config:
 *
 * const overlay = new Madj2kBanner({
 *   overlayId: 'my-banner',
 *   overlayCloseId: 'my-banner-close',
 *   activeClass: 'active',
 *   openClass: 'open',
 *   closingClass: 'closing',
 *   openingClass: 'opening',
 *   timeout: 1000,
 *   cookieName: 'myOverlayCookie',
 *   cookieDays: 30
 * });
 *
 */
class Madj2kBanner {

  config = {
    'overlayId' : 'overlay',
    'overlayCloseId' : 'overlay-close',
    'activeClass': 'active',
    'openClass': 'open',
    'closingClass': 'closing',
    'openingClass': 'opening',
    'timeout': '1000',
    'cookieName': 'overlay',
    'cookieDays': '365'

  };

  /**
   * Constructor
   * @param config
   */
  constructor(config) {
    this.config = {...this.config, ...config }
    this.initOverlay();
  }

  /**
   * Init overlay if no cookie is set!
   */
  initOverlay () {
    const overlay = document.getElementById(this.config.overlayId);
    const self = this;

    if (overlay && ! this.getCookie()) {

      overlay.classList.add(self.config.activeClass);
      setTimeout(function(){
        overlay.classList.add(self.config.openingClass);
        setTimeout(function(){
          overlay.classList.add(self.config.openClass);
          overlay.classList.remove(self.config.openingClass);
        }, self.config.timeout);
      }, 1 ); // minimum timeout for transitions!

      const overlayClose = document.getElementById(this.config.overlayCloseId);
      if (overlayClose) {
        overlayClose.addEventListener('click', (ee) => {

          this.setCookie();

          overlay.classList.add(self.config.closingClass);
          overlay.classList.remove(self.config.openClass);
          setTimeout(function(){
            overlay.classList.remove(self.config.closingClass);
            overlay.classList.remove(self.config.activeClass);
          }, self.config.timeout);
        });
      }
    }
  }


  /**
   * Sets cookie
   */
  setCookie() {
    let d = new Date();
    d.setTime(d.getTime() + (this.config.cookieDays * 24 * 60 * 60 * 1000));
    let expires = "expires=" + d.toUTCString();
    document.cookie = (this.config.cookieName + '=1;' + expires + ';path=/' + '; SameSite=Strict');
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
        return c.substring(name.length, c.length);
      }
    }

    return '';
  }
}
