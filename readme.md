#  @madj2k/fe-frontend-kit
Reusable frontend toolkit including SCSS mixins and menu components (JS/SCSS).

# #  Installation
```
npm install @madj2k/fe-frontend-kit
```
Requirements:
For SCSS mixins: Bootstrap SCSS (your project needs to install bootstrap and include it in the build)
For menu components: none

## Contains
* SASS mixins (using Bootstrap 5.3 functions/mixins)
* Menu components (JS + SCSS), Bootstrap-independent
* Several JS-Tools

##  Usage in your project
###  SCSS Mixins
```
@use '@madj2k/fe-frontend-kit' as *;
```
Or import individual mixins:
```
@use '@madj2k/fe-frontend-kit/sass/00_mixins/colors' as *;
```
###  Menu components (JS and SCSS):
Each menu component can be used separately.

###  JS components (JS and SCSS):
Each JS component can be used separately.


# Flyout-Navigation
## Usage
Integrate the CSS- and JS-file into your project. Make sure jQuery is included.
Then init the menu with
```
import { Madj2kFlyoutMenu } from '@madj2k/fe-frontend-kit/menus/flyout-menu';
document.querySelectorAll('.js-flyout-toggle').forEach((el) => {
  new Madj2kFlyoutMenu(el, { animationDuration: 800 });
});
```
Optional for automatically closing of the flyout menu resizing the browser window:
```
import { Madj2kBetterResizeEvent } from '@madj2k/fe-frontend-kit/tools/better-resize-event';
document.addEventListener('madj2k-better-resize-event', () => {
    document.dispatchEvent(new CustomEvent('madj2k-flyoutmenu-close'));
});
```

CSS:
```
@use '@madj2k/fe-frontend-kit/menus/flyout-menu' as *;
```

## Basic HTML
```
<div class="siteheader" id="siteheader">

    [...]

    <nav>
        <button class="js-flyout-toggle"
            aria-label="Open menu"
            aria-controls="nav-mobile"
            aria-haspopup="true"
            aria-expanded="false">
            <span class="icon-bars"></span>
        </button>
        <div class="flyout js-flyout"
             id="nav-mobile"
             data-position-ref="siteheader">
            <div class="flyout-container js-flyout-container">
                <div class="nav-mobile-inner js-flyout-inner">
                    CONTENT HERE
                </div>
            </div>
        </div>
    </nav>
</div>
```
IMPORTANT: If the siteheader is positioned with ```position:fixed```, you have to switch that to ```position:absolute``` when the menu is opened.
Otherwise in the opened menu the scrolling won't work.
```
.flyout-open {
    .siteheader {
        position:absolute;
    }
}
```
## Special: blur/gray effect for background
* In order to achieve a blur/gray-effect for the background we add the following DIV to the main-content section:
```
<div class="background-blur"></div>
```
Then we deactivate the fullHeight of the flyout menu and make the blurry background clickable
```
import { Madj2kFlyoutdownMenu } from '@madj2k/fe-frontend-kit/menus/flyout-menu';
document.querySelectorAll('.js-flyout-toggle').forEach((el) => {
  new Madj2kFlyoutMenu(el, { fullHeight: false });
});
document.querySelector('.js-background-blur').addEventListener('click', function() {
    document.dispatchEvent(new CustomEvent('madj2k-flyoutmenu-close'));
});
```
* And we need this additional CSS:
```
/**
 * background-blur for opened flyout
 */
.background-blur {
    position:fixed;
    top:0;
    left:0;
    width: 100%;
    height: 100%;
    backdrop-filter: blur(1px) grayscale(100%);
    background-color: rgba(255, 255, 255, 0.7);
    transition: opacity 0.3s ease-in-out;
    opacity:0;
    z-index:-1;
}

.flyout-open,
.flyout-closing {
    .background-blur {
        z-index:90;
    }
}

.flyout-open{
    .background-blur {
        opacity:1;
    }
 }


```

# Pulldown-Navigation
## Usage
Integrate the CSS- and JS-file into your project. Make sure jQuery is included.
Then init the menu with
```
import { Madj2kPulldownMenu } from '@madj2k/fe-frontend-kit/menus/pulldown-menu';
document.querySelectorAll('.js-pulldown-toggle').forEach((el) => {
  new Madj2kPulldownMenu(el);
});
```
Optional for automatically closing of the flyout menu resizing the browser window:
```
import { Madj2kBetterResizeEvent } from '@madj2k/fe-frontend-kit/tools/better-resize-event';
document.addEventListener('madj2k-better-resize-event', () => {
    document.dispatchEvent(new CustomEvent('madj2k-pulldownmenu-close'));
});
```

CSS:
```
@use '@madj2k/fe-frontend-kit/menus/pulldown-menu' as *;
```

## Basic HTML
```
<div class="siteheader">

    [...]

    <nav class="pulldown-wrap js-pulldown-wrap">
        <button class="pulldown-toggle js-pulldown-toggle"
           aria-label="Open Menu"
           aria-controls="nav-language"
           aria-haspopup="true"
           aria-expanded="false">
            <span>Menu-Item Level 1</span>
        </button>

        <div class="pulldown js-pulldown" id="nav-language">
            <div class="pulldown-inner">
                <ul>
                    <!-- used to have the right padding-top of the pulldown -->
                    <li class="pulldown-hide">
                        <a href="#" tabIndex="-1"><span>Menu-Item Level 1</span></a>
                    </li>
                    <li>
                        <a href="#"><span>Menu-Item I Level 2</span></a>
                    </li>
                    <li>
                        <a href="#"><span>Menu-Item II Level 2</span></a>
                    </li>
                    <li>
                        ...
                    </li>
                </ul>
            </div>
        </div>
    </nav>
</div>
```


# JS: Banner
A lightweight class to show a full-page overlay (banner, popup, hint or cookie layer),
with opening and closing animation and optional cookie persistence.

Init:
```
import { Madj2kBanner } from '@madj2k/fe-frontend-kit/tools/banner';
const banner = new Madj2kBanner({
  bannerId: 'my-banner',
  activeClass: 'active',
  openClass: 'open',
  closingClass: 'closing',
  openingClass: 'opening',
  timeout: 1000,
  cookieName: 'myBannerCookie',
  cookieDays: 30,
  debug: false
});
```

HTML:
```
<div id="my-banner" class="banner my-banner">
  <div class="my-banner-content">
    <button class="my-banner-close" aria-controls="my-banner">Close</button>
    <p>Your overlay content here ...</p>
  </div>
</div>
```

CSS:
```
.my-banner {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  z-index: 9999;
}
```

# JS: OWL-Thumbnails
A JavaScript helper class to create a main OWL carousel with a synchronized thumbnail navigation carousel.

Supports flexible configurations for both the main and the thumbnail carousels,
including:
- Custom navigation
- Syncing main carousel to clicked thumbnails
- Syncing thumbnails to main carousel changes
- Optionally equalizing thumbnail heights
- Optionally preventing the centered thumbnail stage shift (for designs where thumbs should stay left aligned)
- Responsive and CMS-friendly (works with dynamic content)

This is especially useful for image galleries or product carousels in CMS setups (e.g. TYPO3, WordPress, etc.)
where content may change dynamically.

Init with available options:
```
$('.js-slider-container').each(function () {
    const owlThumbnail = new Madj2kOwlThumbnail(
        '.js-main-carousel',
        '.js-thumbs-carousel',
        {
            main: {
              items: 1,
              margin: 20,
              dots: true,
              nav: true,
              autoHeight: true
            },
            thumbs: {
              items: 3,
              margin: 10,
              dots: false,
              nav: true,
              center: true
            },
            resizeEvent: 'custom.resize',
            equalizeThumbHeights: true,
            noStageOffset: true
        },
        false,
        this
    });
});
```

HTML:
```
<div class="js-main-carousel owl-carousel">
  <div class="item"><img src="image1.jpg" alt=""></div>
  <div class="item"><img src="image2.jpg" alt=""></div>
  <div class="item"><img src="image3.jpg" alt=""></div>
</div>
<div class="js-thumbs-carousel owl-carousel">
  <div class="item" data-index="0"><img src="thumb1.jpg" alt=""></div>
  <div class="item" data-index="1"><img src="thumb2.jpg" alt=""></div>
  <div class="item" data-index="2"><img src="thumb3.jpg" alt=""></div>
</div>
```

# JS: Better Resize Event
A lightweight helper class that triggers a debounced 'madj2k-better-resize-event' event
when the user finishes resizing the browser window.

It also manages a scrolling detection state (via body attribute) to avoid triggering
resize-events during user scrolling on mobile, and respects active input fields (keyboard-issue on mobile).

Init with available options:
```
import { Madj2kBetterResizeEvent } from '@madj2k/fe-frontend-kit/tools/better-resize-event';
const betterResizeEvent = new Madj2kBetterResizeEvent({
    resizeEndTimeout: 300,
    scrollingEndTimeout: 600,
    viewportDeltaThreshold: 50
});
```
Usage:
```
document.addEventListener('madj2k-better-resize-event', () => {
  console.log('Resize fired');
});
```


# JS: Scrolling
A lightweight scrolling helper class that enables:
1. Body classes based on scroll direction (scroll-up / scroll-down)
2. Smooth anchor scrolling with optional offset
3. Automatic scrolling when collapsible elements (like Bootstrap .collapse) open
4. Appear-on-scroll animations for elements

The class is fully configurable via options and is designed to be used in CMS contexts
where elements can be added, removed or re-ordered dynamically.

Init with available options:
```
import { Madj2kScrolling } from '@madj2k/fe-frontend-kit/tools/scrolling';
const scrolling = new Madj2kScrolling({
    anchorScrolling: {
      selector: ['a[href^="#"]', 'a[href*="#"]'],
      offsetSelector: null,
      disableSelector: '.js-no-scroll',
      collapsibleSelector: ['.collapse'],
      behavior: 'smooth',
      scriptScrollTimeout: 800,
      timeout: 500,
      threshold: 40
    },
    appearOnScroll: {
      selector: ['.js-appear-on-scroll'],
      timeout: 500,
      threshold: 25
    },
    debug: false
});
```
Usage with Appear-On-Scroll (HTML):
```
<div class="js-appear-on-scroll">
  <h2>Animated content</h2>
  <p>This will fade and move in when scrolled into view.</p>
</div>
```

# JS: Toggled Overlay
This class toggles the visibility of any target element referenced by the `aria-controls`
attribute of a trigger element (button, link, etc.). It manages ARIA attributes for accessibility
and allows overlays to be closed externally via a custom event.

Init with available options:
```
import { Madj2kToggledOverlay } from '@madj2k/fe-frontend-kit/tools/toggled-overlay';
const overlayToggle = new Madj2kToggledOverlay('.js-toggled-overlay');
```

HTML:
```
<button class="js-toggled-overlay toggled-overlay-button"
        aria-label="Open overlay"
        aria-controls="my-overlay"
        aria-expanded="false">
  <span class="icon icon-info"></span>
</button>

<div id="my-overlay" class="toggled-overlay" aria-hidden="true">
  <!-- Overlay content -->
</div>
```

# JS: Simple Fade Slider
A lightweight fade slider using opacity and z-index.
- Purely DOM based (no keyframes required)
- Automatic looping through an arbitrary number of slides
- Fully accessible with aria-hidden management
- Configurable via options
- Designed for CMS contexts with dynamic content

Init with available options:
```
import { Madj2kSimpleFadeSlider } from '@madj2k/fe-frontend-kit/tools/simple-fade-slider';
const fadeSlider = new Madj2kSimpleFadeSlider('.js-fade-slider', {
    duration: 8,
    classSlide: 'fade-slider-item',
    classVisible: 'is-visible',
    debug: true
});
```

HTML:
```
<section class="fade-slider js-fade-slider" aria-label="Image gallery">
    <div class="fade-slider-item">
        <img src="img1.jpg" alt="Description 1">
    </div>
    <div class="fade-slider-item">
        <img src="img2.jpg" alt="Description 2">
    </div>
    <div class="fade-slider-item">
        <img src="img3.jpg" alt="Description 3">
    </div>
</section>
```
