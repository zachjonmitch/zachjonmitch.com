import { windowResizeController } from "./utils/window-resize-controller.js";

export function initAsteroids() {
  const PIXEL_RATIO = window.devicePixelRatio || 1;
  const FPS = 60;
  const FRICTION = 0.7;
  const LASER_DIST = 0.6;
  const LASER_EXPLODE_DURATION = 0.1;
  const LASER_MAX = 10;
  const LASER_SPEED = 500;
  const ROIDS_NUM = 10;
  const ROIDS_SIZE = 100;
  const ROIDS_SPEED = 50;
  const ROIDS_VERT = 10; // Average number of vertices on each asteroid
  const ROIDS_JAG = 0.4; // Jaggedness of the asteriods
  const SHIP_EXPLODE_DURATION = 0.3;
  const SHIP_BLINK_DURATION = 0.1; // Duration of ships blink during invincibility
  const SHIP_INV_DURATION = 3; // Duration of ships invincibility
  const SHIP_SIZE = 35;
  const SHIP_THRUST = 5;
  const TURN_SPEED = 360;
  const SHOW_BOUNDING = false;
  const SHOW_CENTER_DOT = false;
  
  const canvas = document.querySelector('[data-ui-canvas-game]');
  const ctx = canvas.getContext('2d');
  
  const windowResizeControl = windowResizeController();

  let scaledWidth = window.innerWidth / PIXEL_RATIO;
  let scaledHeight = window.innerHeight / PIXEL_RATIO;
  
  let ship = newShip();

  let roids = [];
  createAsteroidsBelt();

  document.addEventListener('keydown', onKeyDown);
  document.addEventListener('keyup', onKeyUp);

  function createAsteroidsBelt() {
    const shipAvoidanceRadius = ROIDS_SIZE;
  
    roids = [];
  
    for (let i = 0; i < ROIDS_NUM; i++) {
      let x, y;
      let validPlacement = false;
  
      while (!validPlacement) {
        x = Math.random() * (scaledWidth - ROIDS_SIZE * 2) + ROIDS_SIZE;
        y = Math.random() * (scaledHeight - ROIDS_SIZE * 2) + ROIDS_SIZE;
  
        if (distanceBetweenPoints(ship.x, ship.y, x, y) > shipAvoidanceRadius) {
          validPlacement = true;
        }
      }
  
      roids.push(newAsteroid(x, y, Math.ceil(ROIDS_SIZE / 2)));
    }
  }

  function resetGame() {
    ship = newShip();
    createAsteroidsBelt();
  }
  
  function destroyAsteroid(index) {
    let x = roids[index].x;
    let y = roids[index].y; 
    let r = roids[index].r;

    // Split asteroid in two if needed
    if (r == Math.ceil(ROIDS_SIZE / 2)) {
      roids.push(newAsteroid(x, y, Math.ceil(ROIDS_SIZE / 4)));
      roids.push(newAsteroid(x, y, Math.ceil(ROIDS_SIZE / 4)));
    } else if (r == Math.ceil(ROIDS_SIZE / 4)) {
      roids.push(newAsteroid(x, y, Math.ceil(ROIDS_SIZE / 8)));
      roids.push(newAsteroid(x, y, Math.ceil(ROIDS_SIZE / 8)));
    }

    roids.splice(index, 1);
  }

  function newAsteroid(x, y, r) {
    const roid = {
      x: x,
      y: y,
      xv: Math.random() * ROIDS_SPEED / FPS * (Math.random() < 0.5 ? 1 : -1),
      yv: Math.random() * ROIDS_SPEED / FPS * (Math.random() < 0.5 ? 1 : -1),
      r: r,
      a: Math.random() * Math.PI / 2,
      vert: Math.floor(Math.random() * (ROIDS_VERT + 1) + ROIDS_VERT / 2),
      offs: []
    }

    for (let i = 0; i < roid.vert; i++) {
      roid.offs.push(Math.random() * ROIDS_JAG * 2 + 1 - ROIDS_JAG);
    }

    return roid;
  }

  function newShip() {
    return {
      x: 15 + SHIP_SIZE / 2,
      y: scaledHeight - 15 - SHIP_SIZE / 2, // Fixed calculation every time
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
        xv: LASER_SPEED * Math.cos(ship.a) / FPS,
        yv: -LASER_SPEED * Math.sin(ship.a) / FPS,
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
    switch(event.key.toLowerCase()) {
      case 'a': // Left
        keys.left = true;
        ship.rot = TURN_SPEED / 180 * Math.PI / FPS;
        break;
      case 'w': // Up
        keys.up = true;
        ship.thrusting = true;
        break;
      case 'd': // Right
        keys.right = true;
        ship.rot = -TURN_SPEED / 180 * Math.PI / FPS;
        break;
      case ' ':
      case 'space':
        shootLaser();
        break;
    }
  }
  
  function onKeyUp(event) {
    switch(event.key.toLowerCase()) {
      case 'a': // Left
        keys.left = false;
        if (keys.right) {
          ship.rot = -TURN_SPEED / 180 * Math.PI / FPS;
        } else {
          ship.rot = 0;
        }
        break;
      case 'w': // Up
        keys.up = false;
        ship.thrusting = false;
        break;
      case 'd': // Right
        keys.right = false;
        if (keys.left) {
          ship.rot = TURN_SPEED / 180 * Math.PI / FPS;
        } else {
          ship.rot = 0;
        }
        break;
      case ' ':
      case 'space':
        ship.canShoot = true;
        break;
    }
  }

  function update() {
    let blinkOn = ship.blinkNum % 2 == 0;
    let exploding = ship.explodeTime > 0;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (roids.length === 0) {
      resetGame();
    }

    if (ship.thrusting) {
      ship.thrust.x += SHIP_THRUST * Math.cos(ship.a) / FPS;
      ship.thrust.y -= SHIP_THRUST * Math.sin(ship.a) / FPS;
    } else {
      ship.thrust.x -= FRICTION * ship.thrust.x / FPS;
      ship.thrust.y -= FRICTION * ship.thrust.y / FPS;
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
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = SHIP_SIZE / 20;
      ctx.beginPath();
      ctx.moveTo(
        roid.x + roid.r * roid.offs[0] * Math.cos(roid.a),
        roid.y + roid.r * roid.offs[0] * Math.sin(roid.a)
      );
    
      for (let i = 1; i < roid.vert; i++) {
        ctx.lineTo(
          roid.x + roid.r * roid.offs[i] * Math.cos(roid.a + i * Math.PI * 2 / roid.vert),
          roid.y + roid.r * roid.offs[i] * Math.sin(roid.a + i * Math.PI * 2 / roid.vert)
        );
      }
    
      ctx.closePath();
      ctx.stroke();

      if (SHOW_BOUNDING) {
        ctx.strokeStyle = 'red';
        ctx.beginPath();
        ctx.arc(roid.x, roid.y, roid.r, 0, Math.PI * 2, false);
        ctx.stroke();
      }
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
      ship.a += ship.rot;
  
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
        ship.lasers[i].x += ship.lasers[i].xv;
        ship.lasers[i].y += ship.lasers[i].yv;
        ship.lasers[i].dist += Math.sqrt(Math.pow(ship.lasers[i].xv, 2) + Math.pow(ship.lasers[i].yv, 2));
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
      roid.x += roid.xv;
      roid.y += roid.yv;

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
  
  resizeCanvas();
  update();
  
  windowResizeControl.subscribe(resizeCanvas);
}