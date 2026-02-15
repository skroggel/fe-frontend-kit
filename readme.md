#  @madj2k/fe-frontend-kit
Reusable frontend toolkit including SCSS mixins and menu components (JS/SCSS).

##  Installation
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
                <div class="flyout-inner js-flyout-inner">
                    CONTENT HERE
                </div>
            </div>
        </div>
    </nav>
</div>
```
IMPORTANT: If the siteheader is positioned with ```position:fixed``` and you are using full-height-mode (which is the default) you have to switch that to ```position:absolute``` when the menu is opened.
Otherwise in the opened menu the scrolling won't work.
```
.flyout-open {
    .siteheader {
        position:absolute;
    }
}
```


## Options Reference

### State & Animation Classes

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| openStatusClass | string | 'open' | Applied to trigger and menu when open. |
| animationOpenStatusClass | string | 'opening' | Applied during opening animation. |
| animationCloseStatusClass | string | 'closing' | Applied during closing animation. |
| animationBodyClassPrefix | string | 'flyout' | Prefix for body animation classes like `flyout-opening`. |
| openStatusBodyClass | string | 'flyout-open' | Applied to `body` when the flyout is open. |
| openStatusBodyClassOverflow | string | 'flyout-open-overflow' | Applied when page height exceeds viewport (used in scroll-locking). |

### CSS Class Selectors

| Option                 | Type | Default               | Description                                                     |
|------------------------|------|-----------------------|-----------------------------------------------------------------|
| contentSectionClass    | string | 'js-main-content'     | Content wrapper used when creating no-scroll helper.            |
| menuClass              | string | 'js-flyout'           | Menu root element class.                                        |
| menuToggleClass        | string | 'js-flyout-toggle'    | Class for toggle buttons.                                       |
| menuCloseClass         | string | 'js-flyout-close'     | Class for close buttons inside the flyout.                      |
| menuContainerClass     | string | 'js-flyout-container' | Container used for slide animations (`top` transition).         |
| menuInnerClass         | string | 'js-flyout-inner'     | Inner content wrapper. Observed via ResizeObserver.             |
| heightCalculationClass | string | 'calculate'           | Temporary class used during height determination.               |
| hoverParentClass       | string | 'nav-main'            | Class of main container of menu (used in eventMode: 'moueover'. |

### Height & Size Behavior

| Option | Type | Default | Description                                                               |
|--------|------|---------|---------------------------------------------------------------------------|
| animationDuration | number | 500 | Animation duration in milliseconds.                                       |
| heightMode | 'full' \| 'maxContent' | 'full' | Determines height behavior of the flyout.                                 |
| heightModeClassPrefix  | string | 'height-mode' | Prefix of class that is added to the DOM to indicate the used heightMode. |

### Padding & Layout Behavior

| Option                  | Type                 | Default       | Description                                                               |
|-------------------------|----------------------|---------------|---------------------------------------------------------------------------|
| paddingBehavior         | number               | 0             | Controls dynamic horizontal padding.                                      |
| paddingViewPortMinWidth | number               | 0             | Minimum viewport width required before padding applies.                   |
| scrollHelper            | boolean              | true          | Creates additional wrapper structure to enable scroll-locking.            |
| scrollMode              | 'default' \| 'inner' | 'default'      | If set to 'inner' the inner-DIV of the flyout is scrollable.              |
| scrollModeClassPrefix  | string               | 'scroll-mode' | Prefix of class that is added to the DOM to indicate the used ccrollMode. |

### Event Handling

| Option                | Type | Default | Description |
|-----------------------|------|---------|-------------|
| eventMode             | string | 'click'`| Default event used for toggling the menu. Can be set to `click` or `mouseover`. |


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


## Options Reference

### State & Structural Classes

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| **openStatusClass** | `string` | `'open'` | Applied to menu, wrapper, and toggle when the pulldown is open. |
| **menuClass** | `string` | `'js-pulldown'` | Root class of the pulldown menu. Must match your HTML structure. |
| **menuToggleClass** | `string` | `'js-pulldown-toggle'` | Toggle buttons that control pulldown menus and also close others. |
| **menuWrapClass** | `string` | `'js-pulldown-wrap'` | Optional wrapper container that receives open/closed states. |


### Animation & Timing

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| **animationDuration** | `number` | `500` | Reserved for future open/close animation timing. Currently no CSS transition is applied by JavaScript. |


### Internal Element References

These are automatically detected:

| Property | Description |
|----------|-------------|
| **menu** | The menu element referenced via `aria-controls`. |
| **menuWrap** | Closest parent using `menuWrapClass`. |
| **toggleElement** | The trigger element passed to the constructor. |


# Slide-Navigation

A card-based, multi-level slide menu for mobile and off-canvas navigation.
The menu is generated dynamically from a JSON structure and HTML templates.

Features:
- Unlimited menu depth
- Card-based sliding navigation
- Keyboard navigation & full accessibility (WAI-ARIA)
- Focus trapping and scroll locking
- No jQuery required (Vanilla JS)
- CMS-friendly (TYPO3 / dynamic content)

## Usage
Integrate the CSS- and JS-file into your project.
Then initialize the menu on a toggle element:

```js
import { Madj2kSlideMenu } from '@madj2k/fe-frontend-kit/menus/slide-menu';

document.querySelectorAll('.js-slide-nav-toggle').forEach((el) => {
    new Madj2kSlideMenu(el, {
        menuItemsJson: slideNavItems
    });
});
```

Optional: automatically close the slide menu on resize:

```js
import { Madj2kBetterResizeEvent } from '@madj2k/fe-frontend-kit/tools/better-resize-event';

document.addEventListener('madj2k-better-resize-event', () => {
    document.dispatchEvent(new CustomEvent('madj2k-slidemenu-close'));
});
```

CSS:
```scss
@use '@madj2k/fe-frontend-kit/menus/slide-menu' as *;
```

## Basic HTML

### Toggle element
The toggle element opens and closes the slide menu.
It MUST define an aria-controls attribute pointing to the menu container.

```html
<button class="nav-iconlink js-slide-nav-toggle"
        aria-label="Open Menu"
        aria-haspopup="true"
        aria-expanded="false"
        aria-controls="slide-nav">
    <span>Open Menu</span>
</button>
```

### Menu container
The menu container is initially empty and will be filled dynamically.

```html
<nav class="slide-nav"
     id="slide-nav"
     data-position-ref="navbar-wrap"></nav>
```
**Note:**
If data-position-ref is set, the menu will be positioned below that element (referenced by id).
Otherwise, it is positioned relative to the toggle.

### Content wrapper
To prevent background scrolling while the menu is open, the main content
should be wrapped in an element with the configured contentSectionClass
(default: js-main-content).

```html
<div class="page-main js-main-content">
    ...
</div>
```


## HTML Templates
The slide menu is rendered from <template> elements that must exist in the DOM.
These templates are not rendered by default and therefore do not duplicate
navigation markup for search engines.

**Note: There are example files for a TYPO3 CMS extension available.**

### menuWrap
```html
<template class="js-slide-nav-tmpl" data-type="menuWrap">
    <div class="slide-nav-container js-slide-nav-container">
        <div class="slide-nav-card js-slide-nav-card %levelClass%" id="slide-card-%uid%">
            <div class="slide-nav-inner">
                <ul class="slide-nav-list">
                    %menuItems%
                </ul>
            </div>
        </div>
    </div>
</template>
```

### menuItem
```html
<template class="js-slide-nav-tmpl" data-type="menuItem">
    <li class="slide-nav-item %activeClass% %hasChildrenClass%">

        <!-- normal link that opens the menu-item -->
        %ifHasNoChildrenStart%
        <a href="%link%"
           title="%titleRaw%"
           role="menuitem"
           class="slide-nav-link arrow-listing-link %activeClass% %hasChildrenClass%"
           target="%target%"
           aria-current="%ariaCurrent%">
            <span>%title%</span>
        </a>
        %ifHasNoChildrenEnd%

        <!-- link that opens next card -->
        %ifHasChildrenStart%
        <a class="slide-nav-link slide-nav-next arrow-listing-link js-slide-nav-next animation-hover %activeClass% %hasChildrenClass%"
           href="#"
           role="button"
           title="Open Submenu"
           aria-label="Open Submenu"
           aria-haspopup="true"
           aria-expanded="%ariaExpanded%"
           aria-controls="slide-card-%uid%">
            <span>%title%</span><span class="icon-arrow-right icon"></span>
        </a>
        %ifHasChildrenEnd%
        %submenu%
    </li>
</template>
```

### subMenuWrap

```html
<template class="js-slide-nav-tmpl" data-type="subMenuWrap">
    <a class="slide-nav-next js-slide-nav-next"
       href="#"
       role="button"
       title="Open Submenu"
       aria-label="Open Submenu"
       aria-haspopup="true"
       aria-expanded="%ariaExpanded%"
       aria-controls="slide-card-%uid%">&gt;</a>

    <div class="slide-nav-card js-slide-nav-card %activeClass% %levelClass%"
         id="slide-card-%uid%">
        <div class="slide-nav-inner">
            <ul class="slide-nav-list">
                <li class="slide-nav-item-back" role="none">>
                    <button class="slide-nav-back js-slide-nav-back"
                            aria-label="One Level Up"
                            aria-controls="slide-card-%uid%"
                            data-parent-card="slide-card-%parentUid%">
                        &lt;<span class="slide-nav-back-label">Back</span>
                    </button>
                </li>

                <li class="slide-nav-headline %levelClass%" role="none">

                    <!-- normal parent -->
                    %ifIsNotLinkedStart%
                    <span class="slide-nav-headline-text %currentClass% %isLinkedClass%">%title%</span>
                    %ifIsNotLinkedEnd%

                    <!-- linked parent -->
                    %ifIsLinkedStart%
                    <a href="%link%"
                       title="%titleRaw%"
                       role="menuitem"
                       class="slide-nav-headline-link %currentClass% %hasChildrenClass% %isLinkedClass%"
                       target="%target%"
                       aria-current="%ariaCurrent%">
                        <span>%title%</span>
                    </a>
                    %ifIsLinkedEnd%
                </li>

                %menuItems%
            </ul>
        </div>
    </div>
</template>
```
## Menu Data (menuItemsJson)

The menu structure is defined as a hierarchical JSON array.

### Example
```js
const slideNavItems = [
    {
        data: { uid: 2, pid: 1 },
        title: 'Main Item',
        link: '/main',
        target: '_self',
        active: 1,
        current: 0,
        hasSubpages: 1,
        children: [
            {
                data: { uid: 3, pid: 2 },
                title: 'Sub Item',
                link: '/main/sub',
                target: '_self',
                active: 0,
                current: 0,
                hasSubpages: 0,
                children: []
            }
        ]
    },
    {
        data: { uid: 4, pid: 1 },
        title: 'Second Item',
        link: '/second',
        target: '_self',
        active: 0,
        current: 0,
        hasSubpages: 0,
        children: []
    }
];
```

### Important fields

| Property | Description |
|--------|-------------|
| data.uid | Unique identifier of the menu item |
| data.pid | Parent identifier |
| title | Display title |
| link | URL |
| target | Link target |
| active | Marks active navigation path |
| current | Marks current page |
| hasSubpages | Indicates submenu existence |
| children | Array of child items |

---

## Options Reference

### State & Animation Classes

| Option | Type | Default | Description |
|------|------|---------|-------------|
| openStatusClass | string | 'open' | Applied to toggle and menu when open |
| openCardStatusClass | string | 'show' | Marks the visible card |
| activeStatusClass | string | 'active' | Marks active navigation path |
| currentStatusClass | string | 'current' | Marks current page |
| animationOpenStatusClass | string | 'opening' | Applied during opening animation |
| animationCloseStatusClass | string | 'closing' | Applied during closing animation |

### Structural Classes

| Option | Type | Default | Description |
|------|------|---------|-------------|
| menuToggleClass | string | 'js-slide-nav-toggle' | Toggle element |
| menuWrapClass | string | 'js-slide-nav-container' | Menu container |
| menuCardClass | string | 'js-slide-nav-card' | Card element |
| nextCardToggleClass | string | 'js-slide-nav-next' | Submenu toggle |
| lastCardToggleClass | string | 'js-slide-nav-back' | Back button |
| contentSectionClass | string | 'js-main-content' | Scroll-lock wrapper |

### Behavior

| Option | Type | Default | Description |
|------|------|---------|-------------|
| animationDuration | number | 500 | Animation duration in ms |
| loadOnOpen | boolean | true | Build menu on first open |
| startOnHome | boolean | false | Always start on first level |
| scrollHelper            | boolean              | true          | Creates additional wrapper structure to enable scroll-locking.            |

---

## Events

The component dispatches the following custom events on `document`:

- madj2k-slidemenu-opening
- madj2k-slidemenu-opened
- madj2k-slidemenu-closing
- madj2k-slidemenu-closed
- madj2k-slidemenu-next-opened
- madj2k-slidemenu-previous-opened


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

# JS: Element In Viewport
A lightweight helper class that adds a configurable class to any DOM element once it becomes visible in the viewport.
Perfect for triggering CSS-based animations (e.g., quote reveals, fade-ins, transitions) when an element enters view.
* Works with IntersectionObserver API
* Purely DOM-based (no keyframes required)
* Fully configurable (threshold, delay, class)
* Ideal for CMS-driven content (dynamic DOM)
* Designed for performance and flexibility

Init:
```
document.querySelectorAll('.js-inview').forEach((el) => {
    new Madj2kElementInViewport(el, {
        visibleClass: 'is-in-viewport',
        threshold: 0.5,
        debug: false
    });
});
```

HTML-Example
```
<section class="my-element js-inview">
    <div class="my-element-content">Lorem ipsum dolor sit amet.</div>
</section>
```

SCSS-Example
```
.my-element {
    .my-element-content {
        opacity: 0;
        transform: translateY(20%);
        transition: opacity 0.6s ease, transform 0.6s ease;
    }

    &.is-in-viewport {
        .my-element-content {
            opacity: 1;
            transform: translateY(0);
        }
    }
}
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
document.querySelectorAll('.js-fade-slider').forEach((el) => {
    new Madj2kSimpleFadeSlider(el, {
        duration: 8,
        classSlide: 'fade-slider-item',
        classVisible: 'is-visible',
        debug: true
    });
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
