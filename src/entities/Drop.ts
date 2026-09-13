import { Entity } from './Entity';
import type { DropType } from '../types';

export class Drop extends Entity {
  public type: DropType;
  public value: number;
  public isAttracted: boolean = false;
  public pulseTime: number = Math.random() * Math.PI * 2;
  private attractSpeed: number = 200;

  constructor(x: number, y: number, type: DropType, value: number) {
    let radius = 8;
    if (type === 'chest') radius = 16;
    else if (type === 'health_pack' || type === 'magnet' || type === 'nuke') radius = 12;
    else if (type === 'xp_large') radius = 10;

    super(x, y, radius);
    this.type = type;
    this.value = value;
  }

  public update(dt: number): void {
    this.pulseTime += dt * 4;

    if (this.isAttracted) {
      this.attractSpeed += 900 * dt;
      this.x += this.vx * dt;
      this.y += this.vy * dt;
    }
  }

  public attractTowards(targetX: number, targetY: number, _dt: number) {
    this.isAttracted = true;
    const dx = targetX - this.x;
    const dy = targetY - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > 0.1) {
      this.vx = (dx / dist) * this.attractSpeed;
      this.vy = (dy / dist) * this.attractSpeed;
    }
  }

  public render(ctx: CanvasRenderingContext2D, screenX: number, screenY: number): void {
    const pulse = Math.sin(this.pulseTime) * 1.5;

    ctx.save();
    ctx.translate(screenX, screenY);

    if (this.type.startsWith('xp_')) {
      let color = '#00e5ff'; // cyan small
      let glow = 'rgba(0, 229, 255, 0.4)';
      let size = 6;

      if (this.type === 'xp_medium') {
        color = '#00ff66'; // green
        glow = 'rgba(0, 255, 102, 0.5)';
        size = 8;
      } else if (this.type === 'xp_large') {
        color = '#ff007f'; // neon magenta
        glow = 'rgba(255, 0, 127, 0.6)';
        size = 10;
      }

      // Diamond gem shape
      ctx.fillStyle = color;
      ctx.shadowColor = glow;
      ctx.shadowBlur = 8 + pulse;

      ctx.beginPath();
      ctx.moveTo(0, -(size + pulse));
      ctx.lineTo(size * 0.8, 0);
      ctx.lineTo(0, size + pulse);
      ctx.lineTo(-size * 0.8, 0);
      ctx.closePath();
      ctx.fill();

      // Inner shine
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-1, -1, 2, 2);

    } else if (this.type === 'health_pack') {
      // Red Cross Medkit
      ctx.fillStyle = '#ff2a55';
      ctx.shadowColor = 'rgba(255, 42, 85, 0.8)';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(0, 0, 11 + pulse * 0.5, 0, Math.PI * 2);
      ctx.fill();

      // White cross
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-6, -2, 12, 4);
      ctx.fillRect(-2, -6, 4, 12);

    } else if (this.type === 'magnet') {
      // Blue Magnet Icon
      ctx.fillStyle = '#3d84ff';
      ctx.shadowColor = 'rgba(61, 132, 255, 0.8)';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(0, 0, 12, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, 6, Math.PI, 0, true);
      ctx.stroke();

    } else if (this.type === 'nuke') {
      // Nuke Bomb
      ctx.fillStyle = '#ff9900';
      ctx.shadowColor = 'rgba(255, 153, 0, 0.8)';
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.arc(0, 0, 12, 0, Math.PI * 2);
      ctx.fill();

      // Radiation symbol lines
      ctx.fillStyle = '#111111';
      ctx.beginPath();
      ctx.arc(0, 0, 3, 0, Math.PI * 2);
      ctx.fill();

    } else if (this.type === 'chest') {
      // Golden Treasure Chest
      ctx.shadowColor = 'rgba(255, 215, 0, 0.9)';
      ctx.shadowBlur = 16 + pulse * 2;

      ctx.fillStyle = '#f5a623';
      ctx.fillRect(-12, -9, 24, 18);

      ctx.fillStyle = '#ffd700';
      ctx.fillRect(-14, -11, 28, 6);

      // Lock
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-2, -3, 4, 6);
    }

    ctx.restore();
  }
}
