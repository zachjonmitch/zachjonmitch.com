document.addEventListener('DOMContentLoaded', () => {
  initSiteBackground();
  initTextReveal();
  initTextTypewriter();
  initMobileMenu();
  initAnchorScroll();
  initWorkCarousels();
  initTextScramble();
  // initCardTilt();
  // initCardCursor();

  window.addEventListener('resize', handleResize);
  initBreakpointListener();
});

function handleResize() {
  resetMobileMenu();
}

function initBreakpointListener() {
  const mediaQueries = {
    mobile: window.matchMedia("(max-width: 575px)"),
    tablet: window.matchMedia("(max-width: 991px)"),
  };

  let lastState = {
    mobile: mediaQueries.mobile.matches,
    tablet: mediaQueries.tablet.matches,
  };

  function handleBreakpointChange() {
    const newState = {
      mobile: mediaQueries.mobile.matches,
      tablet: mediaQueries.tablet.matches,
    };

    if (newState.mobile !== lastState.mobile) {
      lastState.mobile = newState.mobile;
      initTextReveal();
    }

    if (newState.tablet !== lastState.tablet) {
      lastState.tablet = newState.tablet;
    }
  }

  mediaQueries.mobile.addEventListener("change", handleBreakpointChange);
  mediaQueries.tablet.addEventListener("change", handleBreakpointChange);

  handleBreakpointChange();
}

/**
 * 
 */
function initSiteBackground() {
  const body = document.querySelector('body');
  const canvas = document.querySelector('[data-canvas-bg]');
  const ctx = canvas.getContext('2d');

  let patternImage = new Image();
  patternImage.src = '/dist/img/grit-white.png';

  let offsetX = 0;
  let offsetY = 0;
  let speed = 0.5;
  let patternWidth = 269;
  let patternHeight;

  let isDragging = false;
  let lastMouseX = 0;
  let lastMouseY = 0;

  let velocityX = -speed;
  let velocityY = 0;
  const friction = 0.95;

  function resizeCanvas() {
    const pixelRatio = window.devicePixelRatio || 1;

    canvas.width = window.innerWidth * pixelRatio;
    canvas.height = window.innerHeight * pixelRatio;
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;

    ctx.scale(pixelRatio, pixelRatio);

    patternHeight = window.innerHeight * 0.3;
    ctx.imageSmoothingEnabled = false;
  }

  function draw() {
    if (!patternImage.complete) {
      requestAnimationFrame(draw);
      return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let x = offsetX - patternWidth; x < window.innerWidth + patternWidth; x += patternWidth) {
      for (let y = offsetY - patternHeight; y < window.innerHeight + patternHeight; y += patternHeight) {
        ctx.drawImage(patternImage, x, y, patternWidth, patternHeight);
      }
    }

    if (!isDragging) {
      offsetX += velocityX;
      offsetY += velocityY;

      velocityX *= friction;
      velocityY *= friction;

      if (Math.abs(velocityX) < speed) velocityX = -speed; 
      if (Math.abs(velocityY) < 0.01) velocityY = 0;
    }

    if (offsetX <= -patternWidth) offsetX += patternWidth;
    if (offsetX >= patternWidth) offsetX -= patternWidth;
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
  patternImage.onload = draw;
  window.addEventListener('resize', resizeCanvas);
}

/**
 * 
 */
function initMobileMenu() {
  const body = document.querySelector('body');
  const navbarToggle = document.querySelector('[data-navbar-toggle]');
  const navbarCollapse = document.querySelector('[data-navbar-collapse]');
  const navbarCloseButton = document.querySelector('[data-navbar-close-button]');

  navbarToggle.addEventListener('click', handleClickNavbarToggle);
  navbarCloseButton.addEventListener('click', (handleClickNavbarCloseButton));

  function handleClickNavbarToggle() {
    body.classList.add('mobile-menu-open');
    navbarCollapse.classList.add('zm-navbar__collapse--active');
  }

  function handleClickNavbarCloseButton() {
    body.classList.remove('mobile-menu-open');
    navbarCollapse.classList.remove('zm-navbar__collapse--active');
  }
}

/**
 * 
 */
function resetMobileMenu() {
  const body = document.querySelector('body');
  const navbarCollapse = document.querySelector('[data-navbar-collapse]');
  
  body.classList.remove('mobile-menu-open');
  navbarCollapse.classList.remove('zm-navbar__collapse--active');
}

/**
 * 
 */
function initAnchorScroll() {
  const anchors = document.querySelectorAll('a[href^="#"]');

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
 * 
 */
function initWorkCarousels() {
  const workBoxTracks = document.querySelectorAll('[data-work-box-track]');
  const observerOptions = { root: null, threshold: 0 };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const speed = parseFloat(entry.target.dataset.speed) || 70;
        entry.target.style.animation = `scrollUp ${speed}s linear infinite`;
      }
    });
  }, observerOptions);

  workBoxTracks.forEach((track) => observer.observe(track));
}

/**
 * 
 */
function initTextReveal() {
  const elements = document.querySelectorAll('[data-text-reveal]');

  const isMobile = window.matchMedia("(max-width: 575px)").matches;

  elements.forEach((element) => {
    let text = element.getAttribute(isMobile ? 'data-text-reveal-mobile' : 'data-text-reveal')?.trim();

    if (!text) {
      element.innerHTML = '';
      return;
    }

    let chars = text.split('');

    element.innerHTML = '';
    chars.forEach((char) => {
      const html = `<span class="zm-reveal-char-wrap">
                      <span class="zm-reveal-char">${char}</span>
                      <span class="zm-reveal-char-alt">${char}</span>
                    </span>`;
      element.insertAdjacentHTML('beforeend', html);
    });

    setTimeout(() => {
      const charElements = element.querySelectorAll('.zm-reveal-char');
      charElements.forEach((char, index) => {
        setTimeout(() => {
          char.classList.add('zm-reveal-char--active');
        }, index * 70);
      });
    }, 800);
  });
}

/**
 * 
 */
function initTextScramble() {
  const textScrambles = document.querySelectorAll('[data-text-scramble]');
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  textScrambles.forEach(element => {
    let textNode = Array.from(element.childNodes).find(node => node.nodeType === Node.TEXT_NODE);
    if (!textNode) return;

    let originalText = textNode.textContent.trim();

    element.addEventListener("mouseenter", () => {
      let iteration = 0;
      let interval = setInterval(() => {
        textNode.textContent = originalText
          .split("")
          .map((letter, index) => {
            if (index < iteration) {
              return originalText[index];
            }
            return letters[Math.floor(Math.random() * 26)];
          })
          .join("");

        if (iteration >= originalText.length) {
          clearInterval(interval);
        }

        iteration += 1 / 3;
      }, 30);
    });
  });
}

function initTextTypewriter() {
  const elements = document.querySelectorAll("[data-text-typewriter]");
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const element = entry.target;
        const text = element.getAttribute("data-text-typewriter");
        let index = 0;

        element.classList.add("zm-typewriter");

        setTimeout(() => {
          const interval = setInterval(() => {
            element.textContent = text.slice(0, index);
            index++;

            if (index > text.length) {
              clearInterval(interval);
              observer.unobserve(element);
            }
          }, 60);
        }, 1800);
      }
    });
  }, { threshold: 0.1 });

  elements.forEach(element => observer.observe(element));
}






















/*function initCardCursor() {
  const workSection = document.querySelector('[data-work-section]');
  const cursor = document.querySelector('[data-work-cursor]');
  const carousels = document.querySelectorAll('[data-work-box-carousel]');

  workSection.addEventListener('mousemove', (e) => {
    cursor.style.left = `${e.clientX}px`;
    cursor.style.top = `${e.clientY}px`;
  });

  carousels.forEach((carousel) => {
    carousel.addEventListener('mouseenter', () => {
      const workBox = carousel.closest('.work-box');
      if (workBox) workBox.classList.add('work-box--active');
      cursor.classList.add('work__cursor--active');
    });

    carousel.addEventListener('mouseleave', () => {
      const workBox = carousel.closest('.work-box');
      if (workBox) workBox.classList.remove('work-box--active');
      cursor.classList.remove('work__cursor--active');
    });
  });
}*/

/*function initCardTilt() {
  const carousels = document.querySelectorAll('[data-work-box-carousel]');

  carousels.forEach((carousel) => {
    carousel.addEventListener('mousemove', (e) => {
      const rect = carousel.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      let rotateX = ((centerY - y) / centerY) * 10;
      let rotateY = ((x - centerX) / centerX) * 10;

      carousel.style.transition = 'transform 0.1s ease-out';
      carousel.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });

    carousel.addEventListener('mouseleave', () => {
      carousel.style.transition = 'transform 0.5s ease-out';
      carousel.style.transform = 'rotateX(0deg) rotateY(0deg)';
    });
  });
}*/


/**
 * 
 * @param {*} mouse 
 */
/*function initWorkInfo(mouse) {
  const workSection = document.querySelector('[data-work-section]');
  const workBoxes = document.querySelectorAll('[data-work-box]');
  let isMouseInsideWorkSection = false;
  let activeWorkBox = null;

  document.addEventListener('scroll', handleScroll);
  workSection.addEventListener('mouseenter', handleMouseEnterWorkSection);
  workSection.addEventListener('mouseleave', handleMouseLeaveWorkSection);
  workSection.addEventListener('mousemove', handleMouseMoveInWorkSection);

  addWorkBoxListeners();
  handleScroll();

  // Handlers
  function handleScroll() {
    checkMouseInWorkSection();
    if (isMouseInsideWorkSection) {
      console.log('test4');
      checkMouseInWorkBox();
      updateInfoPositions();
    } else {
      resetWorkBoxes();
    }
  }

  function handleMouseEnterWorkSection() {
    isMouseInsideWorkSection = true;
    checkMouseInWorkBox(); 
  }

  function handleMouseLeaveWorkSection() {
    isMouseInsideWorkSection = false;
  }

  function handleMouseMoveInWorkSection() {
    checkMouseInWorkBox();
    updateInfoPositions();
  }

  // Helpers
  function addWorkBoxListeners() {
    workBoxes.forEach((box) => {
      box.addEventListener('mouseenter', handleMouseEnterWorkBox);
      box.addEventListener('mouseleave', handleMouseLeaveWorkBox);
  
      function handleMouseEnterWorkBox() {
        activateWorkBox(box);
      }
  
      function handleMouseLeaveWorkBox() {
        deactivateWorkBox(box);
      }
    });
  }

  function checkMouseInWorkSection() {
    const rect = workSection.getBoundingClientRect();
    
    const isMouseInBounds =
      mouse.x >= rect.left &&
      mouse.x <= rect.right &&
      mouse.y >= rect.top &&
      mouse.y <= rect.bottom;

    if (isMouseInBounds) {
      isMouseInsideWorkSection = true;
    } else {
      isMouseInsideWorkSection = false;
    }
  }

  function checkMouseInWorkBox() {
    let newActiveBox = null;
  
    workBoxes.forEach((box) => {
      const rect = box.getBoundingClientRect();
      
      const isMouseInBounds =
        mouse.x >= rect.left &&
        mouse.x <= rect.right &&
        mouse.y >= rect.top &&
        mouse.y <= rect.bottom;
  
      if (isMouseInBounds) {
        newActiveBox = box;
      }
    });
  
    if (newActiveBox && newActiveBox !== activeWorkBox) {
      activateWorkBox(newActiveBox);
    } else if (!newActiveBox) {
      resetWorkBoxes();
    }
  }

  function updateInfoPositions() {
    workBoxes.forEach((box) => {
      const info = box.querySelector('[data-work-info]');
      const { offsetWidth: infoWidth, offsetHeight: infoHeight } = info;

      info.style.left = `${mouse.x - infoWidth / 2}px`;
      info.style.top = `${mouse.y - infoHeight / 2}px`;
    });
  }

  function activateWorkBox(box) {
    resetWorkBoxes();
    activeWorkBox = box;
    box.classList.add('work-box--active');
  }

  function deactivateWorkBox(box) {
    if (activeWorkBox === box) {
      activeBox = null;
      box.classList.remove('work-box--active');
    }
  }

  function resetWorkBoxes() {
    workBoxes.forEach((box) => {
      box.classList.remove('work-box--active');
    });
    activeWorkBox = null;
  }
}*/