import type { Camera } from '../core/Camera';

export interface TextParticle {
  x: number;
  y: number;
  text: string;
  color: string;
  size: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  isCrit: boolean;
}

export class FloatingTextManager {
  private texts: TextParticle[] = [];

  public spawn(
    x: number,
    y: number,
    text: string,
    color: string = '#ffffff',
    isCrit: boolean = false,
    fontSize: number = 14
  ) {
    const angle = (Math.random() * 0.8 - 0.4) - Math.PI / 2;
    const speed = isCrit ? 60 : 40;
    this.texts.push({
      x: x + (Math.random() * 16 - 8),
      y: y - 10,
      text,
      color,
      size: isCrit ? fontSize * 1.5 : fontSize,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: isCrit ? 0.9 : 0.65,
      maxLife: isCrit ? 0.9 : 0.65,
      isCrit,
    });
  }

  public update(dt: number) {
    for (let i = this.texts.length - 1; i >= 0; i--) {
      const t = this.texts[i];
      t.life -= dt;
      if (t.life <= 0) {
        this.texts.splice(i, 1);
        continue;
      }
      t.x += t.vx * dt;
      t.y += t.vy * dt;
      t.vy += 25 * dt; // slight downward gravity
    }
  }

  public render(ctx: CanvasRenderingContext2D, camera: Camera) {
    for (let i = 0; i < this.texts.length; i++) {
      const t = this.texts[i];
      if (!camera.isVisible(t.x, t.y, 40)) continue;
      const screen = camera.worldToScreen(t.x, t.y);

      const alpha = Math.max(0, t.life / t.maxLife);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.font = `bold ${Math.round(t.size)}px 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Outline for readability
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = t.isCrit ? 4 : 2.5;
      ctx.strokeText(t.text, screen.x, screen.y);

      ctx.fillStyle = t.color;
      ctx.fillText(t.text, screen.x, screen.y);
      ctx.restore();
    }
  }

  public clear() {
    this.texts = [];
  }
}
