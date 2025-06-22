#  @madj2k/frontend-kit
Reusable frontend toolkit including SCSS mixins and menu components (JS/SCSS).

# #  Installation
```
npm install @madj2k/frontend-kit
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
@use '@madj2k/frontend-kit' as *;
```
Or import individual mixins:
```
@use '@madj2k/frontend-kit/sass/00_mixins/colors' as *;
```
###  Menu components (JS and SCSS):
Each menu component can be used separately.

# JS: Banner
A lightweight class to show a full-page overlay (banner, popup, hint or cookie layer),
with opening and closing animation and optional cookie persistence.

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

# JS: Resize-End
A lightweight helper class that triggers a debounced 'madj2k-resize-end' event
when the user finishes resizing the browser window.

It also manages a scrolling detection state (via body attribute) to avoid triggering
resize-end during user scrolling, and respects active input fields (useful on mobile).

# JS: Scrolling
A lightweight scrolling helper class that enables:
1. Body classes based on scroll direction (scroll-up / scroll-down)
2. Smooth anchor scrolling with optional offset
3. Automatic scrolling when collapsible elements (like Bootstrap .collapse) open
4. Appear-on-scroll animations for elements

The class is fully configurable via options and is designed to be used in CMS contexts
where elements can be added, removed or re-ordered dynamically.

# JS: Toggled Overlay
This class toggles the visibility of any target element referenced by the `aria-controls`
attribute of a trigger element (button, link, etc.). It manages ARIA attributes for accessibility
and allows overlays to be closed externally via a custom event.

# Flyout-Navigation
## Usage
Integrate the CSS- and JS-file into your project. Make sure jQuery is included.
Then init the menu with
```
import { Madj2kFlyoutMenu } from '@madj2k/frontend-kit/menus/flyout-menu';
document.querySelectorAll('.js-flyout-toggle').forEach((el) => {
  new Madj2kFlyoutMenu(el, { animationDuration: 800 });
});
```
CSS:
```
@use '@madj2k/frontend-kit/menus/flyout-menu' as *;
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
import { Madj2kFlyoutdownMenu } from '@madj2k/frontend-kit/menus/flyout-menu';
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
 * Prevent jumping because of scrollbar
 */
html,body {
    min-height: 100.1%;
}

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
import { Madj2kPulldownMenu } from '@madj2k/frontend-kit/menus/pulldown-menu';
document.querySelectorAll('.js-pulldown-toggle').forEach((el) => {
  new Madj2kPulldownMenu(el);
});
```
CSS:
```
@use '@madj2k/frontend-kit/menus/pulldown-menu' as *;
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
