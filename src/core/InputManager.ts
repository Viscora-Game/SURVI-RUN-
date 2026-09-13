import type { Vector2D } from '../types';

export class InputManager {
  public moveVector: Vector2D = { x: 0, y: 0 };
  public aimVector: Vector2D = { x: 1, y: 0 };
  public isDashPressed: boolean = false;
  public isPauseTriggered: boolean = false;
  public isMouseDown: boolean = false;
  public mousePos: Vector2D = { x: 0, y: 0 };

  private keys: Record<string, boolean> = {};

  // Touch Virtual Joystick
  public isTouchDevice: boolean = false;
  public touchJoystickActive: boolean = false;
  public touchOrigin: Vector2D = { x: 0, y: 0 };
  public touchCurrent: Vector2D = { x: 0, y: 0 };
  private touchId: number | null = null;
  private dashTouchId: number | null = null;

  constructor() {
    this.setupKeyboard();
    this.setupMouse();
    this.setupTouch();
  }

  private setupKeyboard() {
    window.addEventListener('keydown', (e) => {
      this.keys[e.code] = true;
      if (e.code === 'Space') {
        this.isDashPressed = true;
      }
      if (e.code === 'Escape' || e.code === 'KeyP') {
        this.isPauseTriggered = true;
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
      if (e.code === 'Space') {
        this.isDashPressed = false;
      }
    });
  }

  private setupMouse() {
    window.addEventListener('mousemove', (e) => {
      this.mousePos = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('mousedown', (e) => {
      if (e.button === 0) {
        this.isMouseDown = true;
      }
    });

    window.addEventListener('mouseup', (e) => {
      if (e.button === 0) {
        this.isMouseDown = false;
      }
    });
  }

  private setupTouch() {
    window.addEventListener('touchstart', (e) => {
      this.isTouchDevice = true;
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        // If touch is on bottom-right, treat as dash button zone
        const isRightBottom = touch.clientX > window.innerWidth * 0.65 && touch.clientY > window.innerHeight * 0.6;
        if (isRightBottom && this.dashTouchId === null) {
          this.dashTouchId = touch.identifier;
          this.isDashPressed = true;
        } else if (this.touchId === null && touch.clientX < window.innerWidth * 0.7) {
          // Left/center zone is joystick
          this.touchId = touch.identifier;
          this.touchJoystickActive = true;
          this.touchOrigin = { x: touch.clientX, y: touch.clientY };
          this.touchCurrent = { x: touch.clientX, y: touch.clientY };
        }
      }
    }, { passive: false });

    window.addEventListener('touchmove', (e) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        if (touch.identifier === this.touchId) {
          this.touchCurrent = { x: touch.clientX, y: touch.clientY };
          e.preventDefault();
        }
      }
    }, { passive: false });

    const handleTouchEnd = (e: TouchEvent) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        if (touch.identifier === this.touchId) {
          this.touchId = null;
          this.touchJoystickActive = false;
          this.touchOrigin = { x: 0, y: 0 };
          this.touchCurrent = { x: 0, y: 0 };
        }
        if (touch.identifier === this.dashTouchId) {
          this.dashTouchId = null;
          this.isDashPressed = false;
        }
      }
    };

    window.addEventListener('touchend', handleTouchEnd);
    window.addEventListener('touchcancel', handleTouchEnd);
  }

  public update() {
    let dx = 0;
    let dy = 0;

    // Keyboard checks
    if (this.keys['KeyW'] || this.keys['ArrowUp']) dy -= 1;
    if (this.keys['KeyS'] || this.keys['ArrowDown']) dy += 1;
    if (this.keys['KeyA'] || this.keys['ArrowLeft']) dx -= 1;
    if (this.keys['KeyD'] || this.keys['ArrowRight']) dx += 1;

    // Touch joystick check
    if (this.touchJoystickActive) {
      const touchDx = this.touchCurrent.x - this.touchOrigin.x;
      const touchDy = this.touchCurrent.y - this.touchOrigin.y;
      const dist = Math.sqrt(touchDx * touchDx + touchDy * touchDy);
      const maxRadius = 55;

      if (dist > 8) {
        const clampedDist = Math.min(dist, maxRadius);
        dx = (touchDx / dist) * (clampedDist / maxRadius);
        dy = (touchDy / dist) * (clampedDist / maxRadius);
      }
    }

    // Normalize if magnitude > 1
    const mag = Math.sqrt(dx * dx + dy * dy);
    if (mag > 1) {
      dx /= mag;
      dy /= mag;
    }

    this.moveVector.x = dx;
    this.moveVector.y = dy;

    if (mag > 0.1) {
      this.aimVector.x = dx / mag;
      this.aimVector.y = dy / mag;
    }
  }

  public consumePause(): boolean {
    const p = this.isPauseTriggered;
    this.isPauseTriggered = false;
    return p;
  }
}
