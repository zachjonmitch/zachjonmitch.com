import { windowResizeController } from "./utils/window-resize-controller.js";

export function startAsteroids() {
  let isGameRunning = false;
  let resizeTimeout;
  const windowResizeControl = windowResizeController();

  function handleResize() {
    if (window.innerWidth > 992) {
      if (!isGameRunning) {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
          fadeInGameElements(800);
          initAsteroids();
          isGameRunning = true;
        }, 3000);
      }
    } else {
      clearTimeout(resizeTimeout);
      hideGame();
      isGameRunning = false;
    }
  }

  function hideGame() {
    const elements = [
      document.querySelector('[data-ui-canvas-game]'),
      document.querySelector('[data-ui-game-controls]')
    ];
    elements.forEach(el => {
      el.style.opacity = '';
      el.style.transition = '';
      el.classList.add('d-none');
    });
  }

  function fadeInGameElements(duration) {
    const elements = [
      document.querySelector('[data-ui-canvas-game]'),
      document.querySelector('[data-ui-game-controls]')
    ];
    elements.forEach(el => {
      el.classList.remove('d-none');
      el.style.opacity = 0;
      el.style.transition = `opacity ${duration}ms ease-in-out`;
      void el.offsetWidth;
      el.style.opacity = 1;
    });
  }

  windowResizeControl.subscribe(handleResize);
  handleResize();
}


export function initAsteroids() {
  const PIXEL_RATIO = window.devicePixelRatio || 1;
  const FPS = 60;
  const FRICTION = 0.7;
  const LASER_DIST = 0.6;
  const LASER_EXPLODE_DURATION = 0.1;
  const LASER_MAX = 10;
  const LASER_SPEED = 500;
  const ROIDS_NUM = 8;
  const ROIDS_SIZE = 100;
  const ROIDS_SPEED = 50;
  const ROIDS_VERT = 10;
  const ROIDS_JAG = 0.4;
  const SHIP_EXPLODE_DURATION = 0.3;
  const SHIP_BLINK_DURATION = 0.1;
  const SHIP_INV_DURATION = 2.5;
  const SHIP_SIZE = 35;
  const SHIP_THRUST = 5;
  const SHIP_MAX_SPEED = 9;
  const TURN_SPEED = 360;
  const SHOW_BOUNDING = false;
  const SHOW_CENTER_DOT = false;
  
  const canvas = document.querySelector('[data-ui-canvas-game]');
  const ctx = canvas.getContext('2d');
  
  const windowResizeControl = windowResizeController();

  let scaledWidth = window.innerWidth / PIXEL_RATIO;
  let scaledHeight = window.innerHeight / PIXEL_RATIO;

  const logoPaths = [
    '/dist/img/logos/logo-angular.svg',
    '/dist/img/logos/logo-js.svg',
    '/dist/img/logos/logo-react.svg',
    '/dist/img/logos/logo-sass.svg',
    '/dist/img/logos/logo-ts.svg',
    '/dist/img/logos/logo-git.svg',
    '/dist/img/logos/logo-php.svg',
    '/dist/img/logos/logo-ruby.svg',
    '/dist/img/logos/logo-sql.svg'
  ];

  let logos = [];

  const logoPromises = logoPaths.map(path => {
    return fetch(path)
      .then(res => res.text())
      .then(svgText => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(svgText, "image/svg+xml");

        doc.querySelectorAll("path").forEach(pathEl => {
          pathEl.setAttribute("fill", "rgba(255, 255, 255, 0.15)");
        });

        const serializer = new XMLSerializer();
        const newSvgText = serializer.serializeToString(doc);
        const svgBlob = new Blob([newSvgText], { type: "image/svg+xml" });
        const url = URL.createObjectURL(svgBlob);
        const img = new Image();
        img.src = url;

        return new Promise((resolve, reject) => {
          img.onload = () => {
            URL.revokeObjectURL(url);
            resolve(img);
          };
          img.onerror = () => reject(new Error(`Failed to load modified SVG from ${path}`));
        });
      });
  });

  let lastTime = performance.now();
  
  let ship = newShip();

  let roids = [];
  createAsteroidsBelt();

  document.addEventListener('keydown', onKeyDown);
  document.addEventListener('keyup', onKeyUp);

  document.querySelectorAll('[data-ui-game-controls-key]').forEach(button => {
    const key = button.getAttribute('data-ui-game-controls-key');
  
    button.addEventListener('mousedown', () => {
      if (key === 'w') {
        keys.up = true;
        ship.thrusting = true;
      } else if (key === 'a') {
        keys.left = true;
      } else if (key === 'd') {
        keys.right = true;
      } else if (key === 'space') {
        shootLaser();
      }
  
      updateRotation();
    });
  
    button.addEventListener('mouseup', () => {
      if (key === 'w') {
        keys.up = false;
        ship.thrusting = false;
      } else if (key === 'a') {
        keys.left = false;
      } else if (key === 'd') {
        keys.right = false;
      } else if (key === 'space') {
        ship.canShoot = true;
      }
  
      updateRotation();
    });
  
    button.addEventListener('mouseleave', () => {
      if (key === 'w') {
        keys.up = false;
        ship.thrusting = false;
      } else if (key === 'a') {
        keys.left = false;
      } else if (key === 'd') {
        keys.right = false;
      } else if (key === 'space') {
        ship.canShoot = true;
      }
  
      updateRotation();
    });
  });

  function createAsteroidsBelt() {
    const shipAvoidanceRadius = ROIDS_SIZE;
    roids = [];
    
    logos.forEach(logoImg => {
      let x, y;
      let validPlacement = false;
      
      while (!validPlacement) {
        x = Math.random() * (scaledWidth - ROIDS_SIZE * 2) + ROIDS_SIZE;
        y = Math.random() * (scaledHeight - ROIDS_SIZE * 2) + ROIDS_SIZE;
        
        if (distanceBetweenPoints(ship.x, ship.y, x, y) > shipAvoidanceRadius) {
          validPlacement = true;
        }
      }
      
      roids.push(newAsteroid(x, y, Math.ceil(ROIDS_SIZE / 2), logoImg));
    });
  }

  function resetGame() {
    ship = newShip();
    createAsteroidsBelt();
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      resetGame();
    }
  });
  
  window.addEventListener('beforeunload', () => {
    resetGame();
  });

  function destroyAsteroid(index) {
    let x = roids[index].x;
    let y = roids[index].y; 
    let r = roids[index].r;
    let logoImg = roids[index].img;
  
    if (r == Math.ceil(ROIDS_SIZE / 2)) {
      roids.push(newAsteroid(x, y, Math.ceil(ROIDS_SIZE / 3), logoImg));
      roids.push(newAsteroid(x, y, Math.ceil(ROIDS_SIZE / 3), logoImg));
    }
    
    roids.splice(index, 1);
  }

  function newAsteroid(x, y, r, logoImg) {
    const roid = {
      x: x,
      y: y,
      xv: Math.random() * ROIDS_SPEED * (Math.random() < 0.5 ? 1 : -1),
      yv: Math.random() * ROIDS_SPEED * (Math.random() < 0.5 ? 1 : -1),
      r: r,
      a: Math.random() * Math.PI / 2,
      vert: Math.floor(Math.random() * (ROIDS_VERT + 1) + ROIDS_VERT / 2),
      offs: [],
      img: logoImg
    };
  
    for (let i = 0; i < roid.vert; i++) {
      roid.offs.push(Math.random() * ROIDS_JAG * 2 + 1 - ROIDS_JAG);
    }
  
    return roid;
  }

  function newShip() {
    return {
      x: 15 + SHIP_SIZE / 2,
      y: scaledHeight - 15 - SHIP_SIZE / 2,
      r: SHIP_SIZE / 2,
      a: 90 / 180 * Math.PI,
      blinkNum: Math.ceil(SHIP_INV_DURATION / SHIP_BLINK_DURATION),
      blinkTime: Math.ceil(SHIP_BLINK_DURATION * FPS),
      canShoot: true,
      explodeTime: 0,
      lasers: [],
      rot: 0,
      thrusting: false,
      thrust: { x: 0, y: 0 }
    };
  }

  function shootLaser() {
    if (ship.canShoot && ship.lasers.length < LASER_MAX) {
      ship.lasers.push({
        x: ship.x + 4 / 3 * ship.r * Math.cos(ship.a),
        y: ship.y - 4 / 3 * ship.r * Math.sin(ship.a),
        xv: LASER_SPEED * Math.cos(ship.a),
        yv: -LASER_SPEED * Math.sin(ship.a),
        dist: 0,
        explodeTime: 0
      });
    }
    ship.canShoot = false;
  }

  function distanceBetweenPoints(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  }

  function explodeShip() {
    ship.explodeTime = Math.ceil(SHIP_EXPLODE_DURATION * FPS);
  }

  const keys = {
    left: false,
    right: false,
    up: false
  };
  
  function onKeyDown(event) {
    const key = event.key.toLowerCase();
  
    if (key === 'a') {
      keys.left = true;
    } else if (key === 'w') {
      keys.up = true;
      ship.thrusting = true;
    } else if (key === 'd') {
      keys.right = true;
    } else if (key === ' ' || key === 'space') {
      shootLaser();
    }
  
    updateRotation();
  }
  
  function onKeyUp(event) {
    const key = event.key.toLowerCase();
  
    if (key === 'a') {
      keys.left = false;
    } else if (key === 'w') {
      keys.up = false;
      ship.thrusting = false;
    } else if (key === 'd') {
      keys.right = false;
    } else if (key === ' ' || key === 'space') {
      ship.canShoot = true;
    }
  
    updateRotation();
  }
  
  function updateRotation() {
    if (keys.left && !keys.right) {
      ship.rot = TURN_SPEED / 180 * Math.PI;
    } else if (keys.right && !keys.left) {
      ship.rot = -TURN_SPEED / 180 * Math.PI;
    } else {
      ship.rot = 0;
    }
  }

  function update() {
    let now = performance.now();
    let deltaTime = (now - lastTime) / 1000;
    lastTime = now;

    let blinkOn = ship.blinkNum % 2 == 0;
    let exploding = ship.explodeTime > 0;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (roids.length === 0) {
      resetGame();
    }

    if (ship.thrusting) {
      ship.thrust.x += SHIP_THRUST * Math.cos(ship.a) * deltaTime;
      ship.thrust.y -= SHIP_THRUST * Math.sin(ship.a) * deltaTime;
    } else {
      ship.thrust.x -= FRICTION * ship.thrust.x * deltaTime;
      ship.thrust.y -= FRICTION * ship.thrust.y * deltaTime;
    }

    const speed = Math.sqrt(ship.thrust.x ** 2 + ship.thrust.y ** 2);
    if (speed > SHIP_MAX_SPEED) {
      ship.thrust.x = (ship.thrust.x / speed) * SHIP_MAX_SPEED;
      ship.thrust.y = (ship.thrust.y / speed) * SHIP_MAX_SPEED;
    }

    if (!exploding) {
      if (blinkOn) {
        ctx.strokeStyle = '#05F802';
        ctx.lineWidth = SHIP_SIZE / 20;
        ctx.beginPath();
      
        ctx.moveTo(
          ship.x + 4 / 3 * ship.r * Math.cos(ship.a),
          ship.y - 4 / 3 * ship.r * Math.sin(ship.a)
        );
      
        ctx.lineTo(
          ship.x - ship.r * (2 / 3 * Math.cos(ship.a) + 0.8 * Math.sin(ship.a)),
          ship.y + ship.r * (2 / 3 * Math.sin(ship.a) - 0.8 * Math.cos(ship.a))
        );
      
        ctx.lineTo(
          ship.x - ship.r * (1 / 3 * Math.cos(ship.a)),
          ship.y + ship.r * (1 / 3 * Math.sin(ship.a))
        );
      
        ctx.lineTo(
          ship.x - ship.r * (2 / 3 * Math.cos(ship.a) - 0.8 * Math.sin(ship.a)),
          ship.y + ship.r * (2 / 3 * Math.sin(ship.a) + 0.8 * Math.cos(ship.a))
        );
      
        ctx.closePath();
        ctx.stroke();
      }

      // Handle blinking
      if (ship.blinkNum > 0) {
         ship.blinkTime--;
         if (ship.blinkTime == 0) {
          ship.blinkTime = Math.ceil(SHIP_BLINK_DURATION * FPS);
          ship.blinkNum--;
         }
      }
    } else {
      ctx.fillStyle = 'darkred';
      ctx.beginPath();
      ctx.arc(
        ship.x + (0.15 * ship.r * Math.cos(ship.a)),
        ship.y - (0.15 * ship.r * Math.sin(ship.a)),
        ship.r * 1.7,
        0,
        Math.PI * 2,
        false
      );
      ctx.fill();
      ctx.fillStyle = 'red';
      ctx.beginPath();
      ctx.arc(
        ship.x + (0.15 * ship.r * Math.cos(ship.a)),
        ship.y - (0.15 * ship.r * Math.sin(ship.a)),
        ship.r * 1.4,
        0,
        Math.PI * 2,
        false
      );
      ctx.fill();
      ctx.fillStyle = 'orange';
      ctx.beginPath();
      ctx.arc(
        ship.x + (0.15 * ship.r * Math.cos(ship.a)),
        ship.y - (0.15 * ship.r * Math.sin(ship.a)),
        ship.r * 1.1,
        0,
        Math.PI * 2,
        false
      );
      ctx.fill();
      ctx.fillStyle = 'yellow';
      ctx.beginPath();
      ctx.arc(
        ship.x + (0.15 * ship.r * Math.cos(ship.a)),
        ship.y - (0.15 * ship.r * Math.sin(ship.a)),
        ship.r * 0.8,
        0,
        Math.PI * 2,
        false
      );
      ctx.fill();
      ctx.fillStyle = 'white';
      ctx.beginPath();
      ctx.arc(
        ship.x + (0.15 * ship.r * Math.cos(ship.a)),
        ship.y - (0.15 * ship.r * Math.sin(ship.a)),
        ship.r * 0.5,
        0,
        Math.PI * 2,
        false
      );
      ctx.fill();
    }

    if (SHOW_BOUNDING) {
      ctx.strokeStyle = 'red';
      ctx.beginPath();
      ctx.arc(
        ship.x + (0.15 * ship.r * Math.cos(ship.a)),
        ship.y - (0.15 * ship.r * Math.sin(ship.a)),
        ship.r,
        0,
        Math.PI * 2,
        false
      );
      ctx.stroke();
    }

    // Draw the asteroids
    roids.forEach(roid => {
      ctx.save();
      ctx.translate(roid.x, roid.y);
      
      ctx.drawImage(roid.img, -roid.r, -roid.r, roid.r * 2, roid.r * 2);
      
      if (SHOW_BOUNDING) {
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, roid.r, 0, Math.PI * 2);
        ctx.stroke();
      }
    
      ctx.restore();
    });    

    if (SHOW_CENTER_DOT) {
      ctx.fillStyle = 'red';
      ctx.fillRect(
        ship.x - 1 + (0.15 * ship.r * Math.cos(ship.a)), 
        ship.y - 1 - (0.15 * ship.r * Math.sin(ship.a)), 
        2, 
        2
      );
    }

    // Draw the lasers
    for (let i = 0; i < ship.lasers.length; i++) {
      if (ship.lasers[i].explodeTime == 0) {
        ctx.fillStyle = 'lime';
        ctx.beginPath();
        ctx.arc(ship.lasers[i].x, ship.lasers[i].y, SHIP_SIZE / 15, 0, Math.PI * 2, false);
        ctx.fill();
      } else {
        ctx.fillStyle = 'orangered';
        ctx.beginPath();
        ctx.arc(ship.lasers[i].x, ship.lasers[i].y, ship.r * 0.75, 0, Math.PI * 2, false);
        ctx.fill();
        ctx.fillStyle = 'salmon';
        ctx.beginPath();
        ctx.arc(ship.lasers[i].x, ship.lasers[i].y, ship.r * 0.5, 0, Math.PI * 2, false);
        ctx.fill();
        ctx.fillStyle = 'pink';
        ctx.beginPath();
        ctx.arc(ship.lasers[i].x, ship.lasers[i].y, ship.r * 0.25, 0, Math.PI * 2, false);
        ctx.fill();
      }
    }

    // Detect laser hit asteroid
    let ax, ay, ar, lx, ly;
    for (let i = roids.length - 1; i >= 0; i--) {
      ax = roids[i].x;
      ay = roids[i].y;
      ar = roids[i].r;

      for (let j = ship.lasers.length - 1; j >=0; j--) {
        lx = ship.lasers[j].x;
        ly = ship.lasers[j].y;

        if (ship.lasers[j].explodeTime == 0 && distanceBetweenPoints(ax, ay, lx, ly) < ar) {
          destroyAsteroid(i);
          ship.lasers[j].explodeTime = Math.ceil(LASER_EXPLODE_DURATION * FPS)
          break;
        }
      }
    }

    // Check for asteroid collisions
    if (!exploding) {
      if (ship.blinkNum == 0) {
        for (let i = roids.length - 1; i >= 0; i--) {
          if (distanceBetweenPoints(ship.x, ship.y, roids[i].x, roids[i].y) < ship.r + roids[i].r) {
            explodeShip();
            destroyAsteroid(i);
            break;
          }
        }
      }

      // Rotate ship
      ship.a += ship.rot * deltaTime;
  
      // Move ship
      ship.x += ship.thrust.x;
      ship.y += ship.thrust.y;
    } else {
      ship.explodeTime--;

      if (ship.explodeTime == 0) {
        ship = newShip();
        ship.y = scaledHeight - 15 - ship.r;
      }
    }

    // Handle edge ship
    if (ship.x < 0 - ship.r) {
      ship.x = scaledWidth + ship.r;
    } else if (ship.x > scaledWidth + ship.r) {
      ship.x = 0 - ship.r;
    }
    if (ship.y < 0 - ship.r) {
      ship.y = scaledHeight + ship.r;
    } else if (ship.y > scaledHeight + ship.r) {
      ship.y = 0 - ship.r;
    }

    // Move the lasers
    for (let i = ship.lasers.length - 1; i >= 0; i--) { 
      if (ship.lasers[i].dist > LASER_DIST * scaledWidth) {
        ship.lasers.splice(i, 1);
        continue;
      }

      if (ship.lasers[i].explodeTime > 0) {
        ship.lasers[i].explodeTime--;
        if (ship.lasers[i].explodeTime == 0) {
          ship.lasers.splice(i, 1);
          continue;
        }
      } else {
        ship.lasers[i].x += ship.lasers[i].xv * deltaTime;
        ship.lasers[i].y += ship.lasers[i].yv * deltaTime;
        ship.lasers[i].dist += Math.sqrt(Math.pow(ship.lasers[i].xv, 2) + Math.pow(ship.lasers[i].yv, 2)) * deltaTime;
      }

      if (ship.lasers[i].x < 0) {
        ship.lasers[i].x = scaledWidth;
      } else if (ship.lasers[i].x > scaledWidth) {
        ship.lasers[i].x = 0;
      }
      if (ship.lasers[i].y < 0) {
        ship.lasers[i].y = scaledHeight;
      } else if (ship.lasers[i].y > scaledHeight) {
        ship.lasers[i].y = 0;
      }
    }

    roids.forEach(roid => {
      // Move the asteroids
      roid.x += roid.xv * deltaTime;
      roid.y += roid.yv * deltaTime;

      // Handle edges
      if (roid.x < -roid.r) {
        roid.x = scaledWidth + roid.r;
      } else if (roid.x > scaledWidth + roid.r) {
        roid.x = -roid.r;
      }

      if (roid.y < -roid.r) {
        roid.y = scaledHeight + roid.r;
      } else if (roid.y > scaledHeight + roid.r) {
        roid.y = -roid.r;
      }
    });
  
    requestAnimationFrame(update);
  }
  
  let initialSetup = true;

  function resizeCanvas() {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    
    const prevWidth = scaledWidth || window.innerWidth / PIXEL_RATIO;
    const prevHeight = scaledHeight || window.innerHeight / PIXEL_RATIO;
    
    canvas.width = window.innerWidth * PIXEL_RATIO;
    canvas.height = window.innerHeight * PIXEL_RATIO;
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
    
    ctx.scale(PIXEL_RATIO, PIXEL_RATIO);
    ctx.imageSmoothingEnabled = false;
    
    scaledWidth = canvas.width / PIXEL_RATIO;
    scaledHeight = canvas.height / PIXEL_RATIO;
    
    if (initialSetup) {
      ship.x = 15 + ship.r;
      ship.y = scaledHeight - 15 - ship.r;
      initialSetup = false;
    } else {
      ship.x *= scaledWidth / prevWidth;
      ship.y *= scaledHeight / prevHeight;
    }
    
    roids.forEach(roid => {
      roid.x *= scaledWidth / prevWidth;
      roid.y *= scaledHeight / prevHeight;
    });
  }
  
  // Start the game
  Promise.all(logoPromises)
    .then(loadedImages => {
      logos = loadedImages;
      createAsteroidsBelt();
      resizeCanvas();
      update();
      windowResizeControl.subscribe(resizeCanvas);
    })
    .catch(err => {
      console.error(err);
    });
}
