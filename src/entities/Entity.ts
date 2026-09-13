import type { GridEntity } from '../core/SpatialGrid';

export abstract class Entity implements GridEntity {
  public x: number = 0;
  public y: number = 0;
  public vx: number = 0;
  public vy: number = 0;
  public radius: number = 16;
  public isAlive: boolean = true;

  constructor(x: number, y: number, radius: number) {
    this.x = x;
    this.y = y;
    this.radius = radius;
  }

  public abstract update(dt: number): void;
  public abstract render(ctx: CanvasRenderingContext2D, screenX: number, screenY: number): void;

  public distanceTo(other: Entity): number {
    const dx = this.x - other.x;
    const dy = this.y - other.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  public collidesWith(other: Entity): boolean {
    const dx = this.x - other.x;
    const dy = this.y - other.y;
    const r = this.radius + other.radius;
    return dx * dx + dy * dy <= r * r;
  }
}
