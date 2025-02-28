import { windowResizeController } from "./utils/window-resize-controller.js";

export function initAsteroids() {
  const PIXEL_RATIO = window.devicePixelRatio || 1;
  const FPS = 60;
  const FRICTION = 0.7;
  const SHIP_SIZE = 35;
  const SHIP_THRUST = 5;
  const TURN_SPEED = 360;
  
  const canvas = document.querySelector('[data-ui-canvas-game]');
  const ctx = canvas.getContext('2d');
  
  const windowResizeControl = windowResizeController();
  
  const ship = {
    x: 0,
    y: 0,
    r: SHIP_SIZE / 2,
    a: 90 / 180 * Math.PI,
    rot: 0,
    thrusting: false,
    thrust: {
      x: 0,
      y: 0
    }
  }

  document.addEventListener('keydown', onKeyDown);
  document.addEventListener('keyup', onKeyUp);

  function onKeyDown(event) {
    switch(event.key.toLowerCase()) {
      case 'a': // Left
        ship.rot = TURN_SPEED / 180 * Math.PI / FPS;
        break;
      case 'w': // Up
        ship.thrusting = true;
        break;
      case 'd': // Right
        ship.rot = -TURN_SPEED / 180 * Math.PI / FPS;
        break;
    }
  }
  
  function onKeyUp(event) {
    switch(event.key.toLowerCase()) {
      case 'a': // Left
        ship.rot = 0;
        break;
      case 'w': // Up
        ship.thrusting = false;
        break;
      case 'd': // Right
        ship.rot = 0;
        break;
    }
  }  

  function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (ship.thrusting) {
      ship.thrust.x += SHIP_THRUST * Math.cos(ship.a) / FPS;
      ship.thrust.y -= SHIP_THRUST * Math.sin(ship.a) / FPS;
    } else {
      ship.thrust.x -= FRICTION * ship.thrust.x / FPS;
      ship.thrust.y -= FRICTION * ship.thrust.y / FPS;
    }
  
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

    // Rotate ship
    ship.a += ship.rot;

    // Move ship
    ship.x += ship.thrust.x;
    ship.y += ship.thrust.y;

    const scaledWidth = canvas.width / PIXEL_RATIO;
    const scaledHeight = canvas.height / PIXEL_RATIO;

    // Handle edge
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
  
    // Center dot
    ctx.fillStyle = 'red';
    ctx.fillRect(
      ship.x - 1 + (0.15 * ship.r * Math.cos(ship.a)), 
      ship.y - 1 - (0.15 * ship.r * Math.sin(ship.a)), 
      2, 
      2
    );
  
    requestAnimationFrame(update);
  }
  
  function resizeCanvas() {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  
    canvas.width = window.innerWidth * PIXEL_RATIO;
    canvas.height = window.innerHeight * PIXEL_RATIO;
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
  
    ctx.scale(PIXEL_RATIO, PIXEL_RATIO);
    ctx.imageSmoothingEnabled = false;
  
    ship.x = 15 + ship.r;
    ship.y = canvas.height / PIXEL_RATIO - 15 - ship.r;
  }
  
  resizeCanvas();
  update();
  
  windowResizeControl.subscribe(resizeCanvas);
}