import { initAsteroids } from "./asteroids.js";

document.addEventListener('DOMContentLoaded', () => {
  initSiteBackground();
  initParallax();
  initAsteroids();
  initMobileMenu();
  initAnchorScroll();
  initTextReveals();
  initTextTypewriters();
  initTextScrambles();
  initWorkCarousels();
});


/**
 * Controls all elements with `data-pause` attributes.
 * 
 * - Allows pausing/resuming of a specific element, by type, or all at once.
 * 
 * @returns {{
 *   register: (element: HTMLElement, type: string, onPause: Function, onResume: Function),
 *   pauseAll: Function,
 *   resumeAll: Function,
 *   pauseType: (type?: string),
 *   resumeType: (type?: string),
 *   resumeElement: (element: HTMLElement),
 * }}
 */
function pauseController() {
  if (!pauseController.instance) {
    let elements = new WeakMap();
    let trackedElements = new Set();

    pauseController.instance = {
      register: (element, type, onPause, onResume) => {
        if (!elements.has(element)) {
          elements.set(element, { type, pause: onPause, resume: onResume });
          trackedElements.add(element);

          if (element.hasAttribute('data-pause')) {
            onPause();
          }
        }
      },
      pauseAll: () => {
        trackedElements.forEach(element => {
          const entry = elements.get(element);
          if (entry) entry.pause();
        });
      },
      resumeAll: () => {
        trackedElements.forEach(element => {
          const entry = elements.get(element);
          if (entry) entry.resume();
        });
      },
      pauseType: (type = null) => {
        trackedElements.forEach(element => {
          const entry = elements.get(element);
          if (entry && (!type || entry.type === type)) {
            entry.pause();
          }
        });
      },
      resumeType: (type = null) => {
        trackedElements.forEach(element => {
          const entry = elements.get(element);
          if (entry && (!type || entry.type === type)) {
            entry.resume();
          }
        });
      },
      resumeElement: (element) => {
        const entry = elements.get(element);
        if (entry) entry.resume();
      }
    };
  }

  return pauseController.instance;
}


/**
 * Manages window scroll events.
 * 
 * @returns {{
*  subscribe: (callback: Function),
*  unsubscribe: (callback: Function)
* }}
*/
function windowScrollController() {
  if (!windowScrollController.instance) {
  const subscribers = new Set();

  windowScrollController.instance = {
    subscribe: (callback) => {
      subscribers.add(callback);
    },
    unsubscribe: (callback) => {
      subscribers.delete(callback);
    }
  }

  window.addEventListener('scroll', (event) => {
    subscribers.forEach(callback => {
      callback(event);
    });
  });
  }

  return windowScrollController.instance;
}

/**
 * Manages window resize events.
 * 
 * @returns {{
*  subscribe: (callback: Function),
*  unsubscribe: (callback: Function)
* }}
*/
function windowResizeController() {
 if (!windowResizeController.instance) {
   const subscribers = new Set();

   windowResizeController.instance = {
     subscribe: (callback) => subscribers.add(callback),
     unsubscribe: (callback) => subscribers.delete(callback)
   };

   window.addEventListener('resize', (event) => {
     subscribers.forEach(callback => callback(event));
   });
 }

 return windowResizeController.instance;
}


/**
 * Allows for multiple timeouts to be tracked and cleared to avoid conflicts.
 * 
 * @returns {{
 *   add: (id: number),
 *   clearAll: Function
 * }}
 */
function timeoutController() {
  if (!timeoutController.instance) {
    let timeouts = new Set();

    timeoutController.instance = {
      add: (id) => timeouts.add(id),
      clearAll: () => {
        timeouts.forEach(clearTimeout);
        timeouts.clear();
      }
    };
  }

  return timeoutController.instance;
}


/**
 * Observes elements with given selector using the Intersection Observer API.
 * 
 * @param {string} selector 
 * @param {Function} onIntersect 
 * @param {IntersectionObserverInit} options 
 * @returns {IntersectionObserver}
 */
function observeElements(selector, onIntersect, options = { root: null, threshold: 0 }) {
  const elements = document.querySelectorAll(selector);
  const observer = new IntersectionObserver(entries => {
    requestAnimationFrame(() => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          onIntersect(entry, observer);
        }
      });
    });
  }, options);

  elements.forEach(element => observer.observe(element));
  return observer;
}


/**
 * Decodes HTML entities in a given string.
 * 
 * @param {string} html
 * @returns {string}
 */
function decodeHTML(html) {
  var txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
}

/**
 * Linearly interpolates between two values.
 * 
 * @param {number} start
 * @param {number} end
 * @param {number} factor (0 = no change, 1 = full change).
 * @returns {number}
 */
function lerp(start, end, factor) {
  return start + (end - start) * factor;
}

/**
 * Initializes the parallax scrolling effect for elements with the `data-parallax` attribute.
 * 
 * - Moves elements horizontally and/or vertically based on scroll position.
 * - Sets optional start/stop points.
 */
function initParallax() {
  const parallaxElements = document.querySelectorAll('[data-parallax]');
  let lastScrollY = window.scrollY;
  let ticking = false;

  function updateParallax() {
    const scrollY = window.scrollY;

    if (scrollY === lastScrollY) {
      ticking = false;
      requestAnimationFrame(updateParallax);
      return;
    }

    lastScrollY = scrollY;

    parallaxElements.forEach(element => {
      const speedX = parseFloat(element.dataset.parallaxSpeedX) || 0;
      const speedY = parseFloat(element.dataset.parallaxSpeedY) || 0;

      const hasStartX = element.hasAttribute('data-parallax-start-x');
      const hasStopX = element.hasAttribute('data-parallax-stop-x');
      const hasStartY = element.hasAttribute('data-parallax-start-y');
      const hasStopY = element.hasAttribute('data-parallax-stop-y');

      const startX = hasStartX ? parseFloat(element.dataset.parallaxStartX) : 0;
      const stopX = hasStopX ? parseFloat(element.dataset.parallaxStopX) : Infinity;
      const startY = hasStartY ? parseFloat(element.dataset.parallaxStartY) : 0;
      const stopY = hasStopY ? parseFloat(element.dataset.parallaxStopY) : Infinity;

      let moveX = startX + speedX * scrollY;
      let moveY = startY + speedY * scrollY;

      if (hasStartX && hasStopX) {
        moveX = Math.min(Math.max(moveX, Math.min(startX, stopX)), Math.max(startX, stopX));
      }
      if (hasStartY && hasStopY) {
        moveY = Math.min(Math.max(moveY, Math.min(startY, stopY)), Math.max(startY, stopY));
      }

      element.style.transform = `translate3d(${moveX}px, ${moveY}px, 0)`;
    });

    ticking = false;
    requestAnimationFrame(updateParallax);
  }

  // Start the loop
  requestAnimationFrame(updateParallax);
}


/**
 * Initializes the floating, draggable, canvas background.
 */
function initSiteBackground() {
  const SPEED = 0.5;
  const PATTERN_WIDTH = 269;
  const FRICTION = 0.95;

  const body = document.querySelector('body');
  const canvas = document.querySelector('[data-ui-canvas-bg]');
  const ctx = canvas.getContext('2d');

  let patternImage = new Image();
  patternImage.src = '/dist/img/grit-white.png';

  let offsetX = 0;
  let offsetY = 0;
  let patternHeight;

  let isDragging = false;
  let lastMouseX = 0;
  let lastMouseY = 0;

  let velocityX = -SPEED;
  let velocityY = 0;
  let lastTime = performance.now();

  function resizeCanvas() {
    const pixelRatio = window.devicePixelRatio || 1;

    canvas.width = window.innerWidth * pixelRatio;
    canvas.height = window.innerHeight * pixelRatio;
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';

    ctx.scale(pixelRatio, pixelRatio);

    patternHeight = window.innerHeight * 0.3;
    ctx.imageSmoothingEnabled = false;
  }

  function draw(currentTime) {
    if (!patternImage.complete) {
      requestAnimationFrame(draw);
      return;
    }

    const deltaTime = (currentTime - lastTime) / 16.67;
    lastTime = currentTime;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let x = offsetX - PATTERN_WIDTH; x < window.innerWidth + PATTERN_WIDTH; x += PATTERN_WIDTH) {
      for (let y = offsetY - patternHeight; y < window.innerHeight + patternHeight; y += patternHeight) {
        ctx.drawImage(patternImage, x, y, PATTERN_WIDTH, patternHeight);
      }
    }

    if (!isDragging) {
      offsetX += velocityX * deltaTime;
      offsetY += velocityY * deltaTime;

      velocityX *= FRICTION;
      velocityY *= FRICTION;

      if (Math.abs(velocityX) < SPEED) velocityX = -SPEED; 
      if (Math.abs(velocityY) < 0.01) velocityY = 0;
    }

    if (offsetX <= -PATTERN_WIDTH) offsetX += PATTERN_WIDTH;
    if (offsetX >= PATTERN_WIDTH) offsetX -= PATTERN_WIDTH;
    if (offsetY <= -patternHeight) offsetY += patternHeight;
    if (offsetY >= patternHeight) offsetY -= patternHeight;

    requestAnimationFrame(draw);
  }

  canvas.addEventListener('mousedown', (e) => {
    isDragging = true;
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
    velocityX = 0;
    velocityY = 0;

    body.classList.add('page-grabbed');
  });

  canvas.addEventListener('mousemove', (e) => {
    if (isDragging) {
      let deltaX = e.clientX - lastMouseX;
      let deltaY = e.clientY - lastMouseY;

      offsetX -= deltaX;
      offsetY -= deltaY;

      velocityX = -deltaX; 
      velocityY = -deltaY;

      lastMouseX = e.clientX;
      lastMouseY = e.clientY;
    }
  });

  canvas.addEventListener('mouseup', () => {
    isDragging = false;
    body.classList.remove('page-grabbed');
  });

  canvas.addEventListener('mouseleave', () => {
    isDragging = false;
    body.classList.remove('page-grabbed');
  });

  resizeCanvas();
  patternImage.onload = () => requestAnimationFrame(draw);
  window.addEventListener('resize', resizeCanvas);
}


/**
 * Initializes the mobile menu functionality.
 */
function initMobileMenu() {
  const body = document.querySelector('body');
  const navbarToggle = document.querySelector('[data-ui-navbar-toggle]');
  const navbarCollapse = document.querySelector('[data-ui-navbar-collapse]');
  const navbarCloseButton = document.querySelector('[data-ui-navbar-close-button]');
  const navbarLinks = document.querySelectorAll('[data-ui-navbar-link]');
  
  const pauseControl = pauseController();
  const resizeControl = windowResizeController();

  resizeControl.subscribe(resetMobileMenu);

  navbarToggle.addEventListener('click', handleClickNavbarToggle);
  navbarCloseButton.addEventListener('click', (handleClickNavbarCloseButton));

  navbarLinks.forEach(link => {
    link.addEventListener('click', resetMobileMenu);
  });

  function handleClickNavbarToggle() {
    body.classList.add('mobile-menu-open');
    navbarCollapse.classList.add('zm-navbar__collapse--active');
    pauseControl.resumeType('text-reveal');
  }

  function handleClickNavbarCloseButton() {
    resetMobileMenu();
  }
}


/**
 * Resets the mobile menu state.
 */
function resetMobileMenu() {
  const body = document.querySelector('body');
  const navbarCollapse = document.querySelector('[data-ui-navbar-collapse]');
  
  body.classList.remove('mobile-menu-open');
  navbarCollapse.classList.remove('zm-navbar__collapse--active');
}


/**
 * Initializes smooth scrolling behavior for anchor links.
 */
function initAnchorScroll() {
  const anchors = document.querySelectorAll("a[href^='#']");

  anchors.forEach((anchor) => {
    anchor.addEventListener('click', handleAnchorClick);
  });

  function handleAnchorClick(e) {
    e.preventDefault();

    const targetId = e.currentTarget.getAttribute('href').substring(1);
    const targetElement = document.getElementById(targetId);

    if (!targetElement) return;

    const offset = 40;
    const elementPosition = targetElement.getBoundingClientRect().top + window.scrollY;

    window.scrollTo({
      top: elementPosition - offset,
      behavior: 'smooth'
    });
  }
}


/**
 * Initializes infinite scrolling animations for work carousels.
 */
function initWorkCarousels() {
  const tracks = document.querySelectorAll("[data-ui-work-box-track]");
  const mobileMediaQuery = window.matchMedia("(max-width: 991px)");

  function setupAnimations() {
    tracks.forEach(track => {
      const speed = track.dataset.trackSpeed ? parseFloat(track.dataset.trackSpeed) : 100;
      let yOffset = 0;
      let lastTime = performance.now();
      let animationFrame = null;
      let isAnimating = false;

      function animate(time) {
        if (!isAnimating) return;

        const deltaTime = time - lastTime;
        lastTime = time;

        yOffset -= (speed / 7000) * (deltaTime / 16.67);

        if (yOffset <= -50) yOffset = 0;
        track.style.transform = `translate3d(0, ${yOffset}%, 0)`;

        animationFrame = requestAnimationFrame(animate);
      }

      function startAnimation() {
        if (!isAnimating) {
          isAnimating = true;
          lastTime = performance.now();
          requestAnimationFrame(animate);
        }
      }

      function stopAnimation() {
        isAnimating = false;
        if (animationFrame) {
          cancelAnimationFrame(animationFrame);
          animationFrame = null;
        }
      }

      function updateAnimationState() {
        if (mobileMediaQuery.matches) {
          startAnimation();
        } else {
          stopAnimation();
        }
      }

      updateAnimationState();
      mobileMediaQuery.addEventListener("change", updateAnimationState);

      const workBox = track.closest(".work-box");

      workBox.addEventListener("mouseenter", () => {
        if (!mobileMediaQuery.matches) {
          tracks.forEach(otherTrack => {
            if (otherTrack !== track) {
              otherTrack.dataset.animating = "false";
              stopAnimation.call(otherTrack);
            }
          });

          track.dataset.animating = "true";
          startAnimation();
        }
      });

      workBox.addEventListener("mouseleave", () => {
        if (!mobileMediaQuery.matches) {
          stopAnimation();
        }
      });
    });
  }

  setupAnimations();
}


/**
 * Initializes all text reveal animations.
 * 
 * - Splits the text into individual characters and wraps them in elements for animation.
 * - Adds hover effect that swaps characters with an alt version.
 */
function initTextReveals() {
  const elements = document.querySelectorAll('[data-zm-text-reveal]');
  const mediaQuery = window.matchMedia('(max-width: 575px)');
  const pauseControl = pauseController();

  function animateChar(char, delay, duration, startPosition, endPosition) {
    const animation = char.animate(
      [
        { transform: `translateY(${startPosition}%)` },
        { transform: `translateY(${endPosition}%)` }
      ],
      { 
        duration: duration, 
        easing: 'cubic-bezier(.68,-.55,.265,1.55)', 
        fill: 'forwards', 
        delay: delay 
      }
    );
  
    return animation.finished;
  }

  function insertChars(element) {
    const isMobileOnly = element.getAttribute('data-zm-text-reveal-mode') === 'mobile';

    if (!mediaQuery.matches && isMobileOnly) return;

    let text = '';
  
    if (element.hasAttribute('data-zm-text-reveal-mobile') && mediaQuery.matches) {
      text = element.getAttribute('data-zm-text-reveal-mobile');
    } else {
      text = element.getAttribute('data-zm-text-reveal');
    }
    
    // let text = element.getAttribute(mediaQuery.matches ? 'data-zm-text-reveal-mobile' : 'data-zm-text-reveal')?.trim();

    if (!text) {
      element.innerText = '';
      return;
    }
  
    let chars = text.split('');
    element.innerText = '';
  
    chars.forEach((char) => {
      if (char === ' ') {
        element.insertAdjacentHTML('beforeend', `<span class="zm-reveal-char__space">&nbsp;</span>`);
      } else {
        const html = `<span class='zm-reveal-char__wrap z-2' data-ui-reveal-char-wrap aria-hidden='true'>
                        <span class='zm-reveal-char zm-reveal-char--primary' data-ui-reveal-char>${char}</span>
                        <span class='zm-reveal-char zm-reveal-char--alt' data-ui-reveal-char-alt>${char}</span>
                      </span>`;
        element.insertAdjacentHTML('beforeend', html);
      }
    });
  }

  function revealText(element) {

    insertChars(element);

    const charElements = element.querySelectorAll('[data-ui-reveal-char]');
    if (charElements.length === 0) return;

    let animationPromises = [];
    let isPaused = false;
    
    function startAnimations() {
      if (isPaused) return;

      animationPromises = [];
      charElements.forEach((char, index) => {
        animationPromises.push(animateChar(char, index * 70, 600, 100, 0));
      });

      if (animationPromises.length > 0) {
        setTimeout(() => {
          Promise.all(animationPromises).then(() => {
            pauseControl.resumeType('typewriter');
      
            if (element.hasAttribute('data-zm-text-reveal-hover')) {
              swapCharOnHover(element);
            }
          });
        }, 400);
      }
    }

    function pause() {
      isPaused = true;
      animationPromises.forEach(animation => animation.cancel());
    }

    function resume() {
      if (!isPaused) return;
      isPaused = false;
      startAnimations();
    }

    if (element.hasAttribute('data-pause')) {
      pauseControl.register(element, 'text-reveal', pause, resume);
    }
    startAnimations();
  }

  function handleMouseEnterCharWrap(event) {
    const charWrap = event.currentTarget;
    const char = charWrap.querySelector('[data-ui-reveal-char]');
    const charAlt = charWrap.querySelector('[data-ui-reveal-char-alt]');
    animateChar(char, 0, 600, 0, -100);
    animateChar(charAlt, 0, 600, 100, 0);
  }

  function swapCharOnHover(element) {
    const charWraps = element.querySelectorAll('[data-ui-reveal-char-wrap]');

    charWraps.forEach((charWrap) => {
      charWrap.addEventListener('mouseenter', handleMouseEnterCharWrap);
    });
  }

  function handleBreakpointChange() {
    document.querySelectorAll('[data-zm-text-reveal]').forEach(revealText);
  }

  handleBreakpointChange();
  mediaQuery.addEventListener('change', handleBreakpointChange);
}

/**
 * Initializes all typewriter animations with cursor.
 * 
 * - Clears any existing typewriter timeouts to prevent overlap.
 */
function initTextTypewriters() {
  const mediaQuery = window.matchMedia('(max-width: 575px)');
  const timeoutControl = timeoutController();
  const pauseControl = pauseController();

  function runTypewriters() {
    timeoutControl.clearAll();

    const typeWriters = document.querySelectorAll('[data-zm-text-typewriter]');

    typeWriters.forEach((typeWriter) => {
      let text = decodeHTML(typeWriter.getAttribute('data-zm-text-typewriter') || '');
      let index = 0;
      let timeoutId = null;
      let isPaused = false;

      typeWriter.classList.add('zm-typewriter');
      typeWriter.innerHTML = '&nbsp;';

      function type() {
        if (isPaused) return;

        if (index === 0) {
          typeWriter.classList.add('zm-typewriter--visible');
          typeWriter.innerHTML = text[0] || '';
          index = 1;
        }

        if (index < text.length) {
          timeoutId = setTimeout(() => {
            if (isPaused) return;
            typeWriter.textContent += text[index];
            index++;
            type();
          }, 60);
          
          timeoutControl.add(timeoutId);
        } else {
          typeWriter.classList.add('zm-typewriter--blink');
        }
      }

      function pause() {
        isPaused = true;
        if (timeoutId !== null) {
          clearTimeout(timeoutId);
        }
      }

      function resume() {
        if (!isPaused) return;
        isPaused = false;

        if (index >= text.length) {
          typeWriter.classList.add('zm-typewriter--blink');
          return;
        }

        type();
      }

      pauseControl.register(typeWriter, 'typewriter', pause, resume);

      type();
    });
  }

  runTypewriters();
  mediaQuery.addEventListener('change', runTypewriters);
}



/**
 * Applies a text scrambling effect to elements on hover.
 */
function initTextScrambles() {
  const textScrambles = document.querySelectorAll('[data-zm-text-scramble]');
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  textScrambles.forEach(element => {
    let textNode = Array.from(element.childNodes).find(node => node.nodeType === Node.TEXT_NODE);
    if (!textNode) return;

    let originalText = textNode.textContent.trim();

    element.addEventListener('mouseenter', () => {
      let iteration = 0;
      let interval = setInterval(() => {
        textNode.textContent = originalText
          .split('')
          .map((letter, index) => {
            if (index < iteration) {
              return originalText[index];
            }
            return letters[Math.floor(Math.random() * 26)];
          })
          .join('');

        if (iteration >= originalText.length) {
          clearInterval(interval);
        }

        iteration += 1 / 3;
      }, 30);
    });
  });
}