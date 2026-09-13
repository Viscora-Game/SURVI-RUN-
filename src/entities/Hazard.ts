import { Entity } from './Entity';

export type HazardType = 'acid_puddle' | 'fire_zone' | 'boss_telegraph';

export class Hazard extends Entity {
  public type: HazardType;
  public duration: number;
  public maxDuration: number;
  public damage: number;
  public tickTimer: number = 0;
  public color: string;
  public glowColor: string;
  public isTelegraph: boolean;
  public onExpire?: () => void;

  constructor(
    x: number,
    y: number,
    radius: number,
    duration: number,
    damage: number,
    type: HazardType = 'acid_puddle',
    isTelegraph: boolean = false
  ) {
    super(x, y, radius);
    this.duration = duration;
    this.maxDuration = duration;
    this.damage = damage;
    this.type = type;
    this.isTelegraph = isTelegraph;

    if (type === 'acid_puddle') {
      this.color = '#10b981';
      this.glowColor = 'rgba(16, 185, 129, 0.4)';
    } else if (type === 'fire_zone') {
      this.color = '#f97316';
      this.glowColor = 'rgba(249, 115, 22, 0.5)';
    } else {
      // Telegraph warning
      this.color = '#ef4444';
      this.glowColor = 'rgba(239, 68, 68, 0.7)';
    }
  }

  public update(dt: number): void {
    this.duration -= dt;
    this.tickTimer -= dt;

    if (this.duration <= 0) {
      this.isAlive = false;
      if (this.onExpire) {
        this.onExpire();
      }
    }
  }

  public canTick(): boolean {
    if (this.tickTimer <= 0) {
      this.tickTimer = 0.4; // Damage tick every 0.4s
      return true;
    }
    return false;
  }

  public render(ctx: CanvasRenderingContext2D, screenX: number, screenY: number): void {
    ctx.save();
    ctx.translate(screenX, screenY);

    const progress = Math.max(0, this.duration / this.maxDuration);

    if (this.isTelegraph) {
      // Red pulsing telegraph warning circle with countdown sweep
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2.5;
      ctx.fillStyle = 'rgba(239, 68, 68, 0.15)';
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 10;

      ctx.beginPath();
      ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Expanding/closing inner ring
      const innerRadius = this.radius * (1 - progress);
      ctx.fillStyle = 'rgba(239, 68, 68, 0.35)';
      ctx.beginPath();
      ctx.arc(0, 0, innerRadius, 0, Math.PI * 2);
      ctx.fill();

      // Crosshair lines
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-this.radius * 0.8, 0);
      ctx.lineTo(this.radius * 0.8, 0);
      ctx.moveTo(0, -this.radius * 0.8);
      ctx.lineTo(0, this.radius * 0.8);
      ctx.stroke();

    } else {
      // Sludge / Acid puddle on ground
      const alpha = Math.min(1, progress * 1.5);
      ctx.globalAlpha = alpha * 0.8;
      ctx.fillStyle = this.color;
      ctx.shadowColor = this.glowColor;
      ctx.shadowBlur = 12;

      // Organic fluid shape
      ctx.beginPath();
      const numPoints = 8;
      for (let i = 0; i < numPoints; i++) {
        const angle = (i / numPoints) * Math.PI * 2;
        const wobble = Math.sin(angle * 3 + Date.now() * 0.005) * 4;
        const r = this.radius + wobble;
        const px = Math.cos(angle) * r;
        const py = Math.sin(angle) * r;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();

      // Bubbles
      ctx.fillStyle = '#ffffff';
      ctx.globalAlpha = alpha * 0.5;
      ctx.beginPath();
      ctx.arc(this.radius * 0.3, -this.radius * 0.2, 3, 0, Math.PI * 2);
      ctx.arc(-this.radius * 0.25, this.radius * 0.3, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }
}
