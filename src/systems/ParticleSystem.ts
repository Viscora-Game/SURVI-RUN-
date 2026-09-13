import type { Camera } from '../core/Camera';

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  maxLife: number;
  life: number;
  shape?: 'circle' | 'square' | 'line' | 'ring';
}

export class ParticleSystem {
  private particles: Particle[] = [];

  public emit(
    x: number,
    y: number,
    count: number,
    color: string,
    speed: number = 100,
    size: number = 4,
    life: number = 0.5,
    shape: 'circle' | 'square' | 'line' | 'ring' = 'circle'
  ) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const spd = (Math.random() * 0.7 + 0.3) * speed;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd,
        size: size * (Math.random() * 0.6 + 0.7),
        color,
        alpha: 1,
        maxLife: life,
        life: life,
        shape,
      });
    }
  }

  // Ring burst (for level up, nuke, or aura pulse)
  public emitRing(x: number, y: number, radius: number, color: string, life: number = 0.4) {
    this.particles.push({
      x,
      y,
      vx: 0,
      vy: 0,
      size: radius,
      color,
      alpha: 1,
      maxLife: life,
      life: life,
      shape: 'ring',
    });
  }

  public update(dt: number) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vx *= Math.pow(0.92, dt * 60);
      p.vy *= Math.pow(0.92, dt * 60);
      p.alpha = Math.max(0, p.life / p.maxLife);
    }
  }

  public render(ctx: CanvasRenderingContext2D, camera: Camera) {
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      if (!camera.isVisible(p.x, p.y, p.size * 2)) continue;
      const screen = camera.worldToScreen(p.x, p.y);

      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.strokeStyle = p.color;

      if (p.shape === 'ring') {
        const progress = 1 - p.life / p.maxLife;
        const currentRadius = p.size * progress;
        ctx.lineWidth = 3 * (1 - progress);
        ctx.beginPath();
        ctx.arc(screen.x, screen.y, currentRadius, 0, Math.PI * 2);
        ctx.stroke();
      } else if (p.shape === 'square') {
        ctx.fillRect(screen.x - p.size / 2, screen.y - p.size / 2, p.size, p.size);
      } else {
        ctx.beginPath();
        ctx.arc(screen.x, screen.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }
  }

  public clear() {
    this.particles = [];
  }
}
