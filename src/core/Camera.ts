import type { Vector2D } from '../types';

export class Camera {
  public x: number = 0;
  public y: number = 0;
  public width: number = 0;
  public height: number = 0;

  private shakeIntensity: number = 0;
  private shakeDecay: number = 0.9;
  public shakeOffsetX: number = 0;
  public shakeOffsetY: number = 0;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
  }

  public resize(width: number, height: number) {
    this.width = width;
    this.height = height;
  }

  public addShake(intensity: number) {
    this.shakeIntensity = Math.min(this.shakeIntensity + intensity, 25);
  }

  public follow(targetX: number, targetY: number, dt: number) {
    // Smooth lerp
    const lerpFactor = 1 - Math.exp(-10 * dt);
    this.x += (targetX - this.width / 2 - this.x) * lerpFactor;
    this.y += (targetY - this.height / 2 - this.y) * lerpFactor;

    // Apply shake
    if (this.shakeIntensity > 0.1) {
      this.shakeOffsetX = (Math.random() * 2 - 1) * this.shakeIntensity;
      this.shakeOffsetY = (Math.random() * 2 - 1) * this.shakeIntensity;
      this.shakeIntensity *= Math.pow(this.shakeDecay, dt * 60);
    } else {
      this.shakeIntensity = 0;
      this.shakeOffsetX = 0;
      this.shakeOffsetY = 0;
    }
  }

  public worldToScreen(worldX: number, worldY: number): Vector2D {
    return {
      x: worldX - this.x + this.shakeOffsetX,
      y: worldY - this.y + this.shakeOffsetY,
    };
  }

  public screenToWorld(screenX: number, screenY: number): Vector2D {
    return {
      x: screenX + this.x - this.shakeOffsetX,
      y: screenY + this.y - this.shakeOffsetY,
    };
  }

  public isVisible(worldX: number, worldY: number, radius: number): boolean {
    const screen = this.worldToScreen(worldX, worldY);
    return (
      screen.x + radius >= 0 &&
      screen.x - radius <= this.width &&
      screen.y + radius >= 0 &&
      screen.y - radius <= this.height
    );
  }
}
