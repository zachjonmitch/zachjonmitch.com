document.addEventListener('DOMContentLoaded', () => {
  const mouse = { x: 0, y: 0 };

  initMobileMenu();
  initWorkObserver();
  initWorkInfo(mouse);

  document.addEventListener('mousemove', onMouseMoveUpdatePosition);

  function onMouseMoveUpdatePosition(e) {
    ({ clientX: mouse.x, clientY: mouse.y } = e);
  }
});

function initMobileMenu() {
  const navbarToggle = document.querySelector('[data-navbar-toggle]');
  const navbarCollapse = document.querySelector('[data-navbar-collapse]');

  window.addEventListener('resize', onResize);
  navbarToggle.addEventListener('click', onClickNavbarToggle);

  function onResize() {
    navbarCollapse.classList.remove('zm-navbar__collapse--active');
  }

  function onClickNavbarToggle() {
    navbarCollapse.classList.toggle('zm-navbar__collapse--active');
  }
}

function initWorkObserver() {
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

function initWorkInfo(mouse) {
  const workSection = document.querySelector('[data-work-section');
  const workBoxes = document.querySelectorAll('[data-work-box]');
  let isMouseInsideWorkSection = false;
  // let activeInfo = null;
  let activeWorkBox = null;

  document.addEventListener('scroll', onScroll);
  workSection.addEventListener('mouseenter', onMouseEnterWorkSection);
  workSection.addEventListener('mouseleave', onMouseLeaveWorkSection);
  workSection.addEventListener('mousemove', onMouseMoveInWorkSection);

  addWorkBoxListeners();
  onScroll();

  // Handlers
  function onScroll() {
    checkMouseInWorkSection();
    if (isMouseInsideWorkSection) {
      console.log('test4');
      checkMouseInWorkBox();
      updateInfoPositions();
    } else {
      resetWorkBoxes();
    }
  }

  function onMouseEnterWorkSection() {
    isMouseInsideWorkSection = true;
    checkMouseInWorkBox(); 
  }

  function onMouseLeaveWorkSection() {
    isMouseInsideWorkSection = false;
  }

  function onMouseMoveInWorkSection() {
    checkMouseInWorkBox();
    updateInfoPositions();
  }

  // Helpers
  function addWorkBoxListeners() {
    workBoxes.forEach((box) => {
      // const info = box.querySelector('[data-work-info]');
    
      // if (!info) return;
  
      box.addEventListener('mouseenter', onMouseEnterWorkBox);
      box.addEventListener('mouseleave', onMouseLeaveWorkBox);
  
      function onMouseEnterWorkBox() {
        activateWorkBox(box);
      }
  
      function onMouseLeaveWorkBox() {
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
    // activeInfo = info;
    // info.style.transition = '.6s cubic-bezier(.75, -1.27, .3, 2.33) transform, .4s cubic-bezier(.75, -1.27, .3, 2.33) opacity';
    // info.classList.add('work-info--active');
  }

  function deactivateWorkBox(box) {
    if (activeWorkBox === box) {
      activeBox = null;
      box.classList.remove('work-box--active');
    }
    // info.style.transition = '.25s ease-in-out';
    // if (activeInfo === info) {
    //   activeInfo = null;
    //   info.classList.remove('work-info--active');
    // }
  }

  function resetWorkBoxes() {
    workBoxes.forEach((box) => {
      box.classList.remove('work-box--active');
    });
    activeWorkBox = null;
  }
}