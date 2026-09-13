import { Entity } from './Entity';
import type { Drop } from './Drop';
import { Drop as DropClass } from './Drop';
import { sounds } from '../audio/SoundManager';
import type { ParticleSystem } from '../systems/ParticleSystem';
import type { Camera } from '../core/Camera';

export type DestructibleType = 'tech_crate' | 'explosive_barrel' | 'energy_pylon';

export class Destructible extends Entity {
  public type: DestructibleType;
  public hp: number;
  public maxHp: number;
  public hitFlashTimer: number = 0;

  constructor(x: number, y: number, type: DestructibleType) {
    let radius = 18;
    let hp = 30;
    if (type === 'explosive_barrel') {
      radius = 16;
      hp = 20;
    } else if (type === 'energy_pylon') {
      radius = 24;
      hp = 999999; // Indestructible cover / obstacle
    }

    super(x, y, radius);
    this.type = type;
    this.hp = hp;
    this.maxHp = hp;
  }

  public takeDamage(
    amount: number,
    particleSystem: ParticleSystem,
    camera: Camera
  ): { died: boolean; drops: Drop[]; explosionDamage?: { x: number; y: number; radius: number; damage: number } } {
    if (this.type === 'energy_pylon') {
      // Pylons are indestructible obstacles
      return { died: false, drops: [] };
    }

    this.hp -= amount;
    this.hitFlashTimer = 0.1;
    sounds.playHit();

    if (this.hp <= 0) {
      this.isAlive = false;
      const drops: Drop[] = [];

      if (this.type === 'tech_crate') {
        sounds.playEnemyDeath();
        particleSystem.emit(this.x, this.y, 14, '#38bdf8', 110, 4, 0.4, 'square');

        // 45% Health kit, 30% XP medium, 15% magnet, 10% nuke
        const roll = Math.random();
        if (roll < 0.45) {
          drops.push(new DropClass(this.x, this.y, 'health_pack', 30));
        } else if (roll < 0.75) {
          drops.push(new DropClass(this.x, this.y, 'xp_medium', 5));
        } else if (roll < 0.90) {
          drops.push(new DropClass(this.x, this.y, 'magnet', 1));
        } else {
          drops.push(new DropClass(this.x, this.y, 'nuke', 1));
        }

        return { died: true, drops };
      } else if (this.type === 'explosive_barrel') {
        // Detonate barrel!
        sounds.playNuke();
        camera.addShake(12);
        particleSystem.emit(this.x, this.y, 25, '#f97316', 180, 6, 0.5);
        particleSystem.emitRing(this.x, this.y, 110, '#ef4444', 0.4);

        return {
          died: true,
          drops,
          explosionDamage: {
            x: this.x,
            y: this.y,
            radius: 110,
            damage: 180,
          },
        };
      }
    }

    return { died: false, drops: [] };
  }

  public update(dt: number): void {
    if (this.hitFlashTimer > 0) {
      this.hitFlashTimer -= dt;
    }
  }

  public render(ctx: CanvasRenderingContext2D, screenX: number, screenY: number): void {
    ctx.save();
    ctx.translate(screenX, screenY);

    const isFlashing = this.hitFlashTimer > 0;

    if (this.type === 'tech_crate') {
      // Tech Supply Crate
      ctx.shadowColor = '#00e5ff';
      ctx.shadowBlur = 8;
      ctx.fillStyle = isFlashing ? '#ffffff' : '#0f2942';
      ctx.strokeStyle = '#00e5ff';
      ctx.lineWidth = 2;

      ctx.fillRect(-this.radius, -this.radius, this.radius * 2, this.radius * 2);
      ctx.strokeRect(-this.radius, -this.radius, this.radius * 2, this.radius * 2);

      // Neon Cross
      ctx.fillStyle = isFlashing ? '#ffffff' : '#00e5ff';
      ctx.fillRect(-this.radius * 0.6, -2, this.radius * 1.2, 4);
      ctx.fillRect(-2, -this.radius * 0.6, 4, this.radius * 1.2);

    } else if (this.type === 'explosive_barrel') {
      // Red Explosive Barrel
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 12;
      ctx.fillStyle = isFlashing ? '#ffffff' : '#7f1d1d';
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;

      ctx.beginPath();
      ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Hazard Stripes / Symbol
      ctx.fillStyle = '#f59e0b';
      ctx.font = 'bold 12px Orbitron, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('!', 0, 1);

    } else if (this.type === 'energy_pylon') {
      // Indestructible Energy Pylon / Column
      const pulse = Math.sin(Date.now() * 0.004) * 2;
      ctx.shadowColor = 'rgba(168, 85, 247, 0.7)';
      ctx.shadowBlur = 14 + pulse;

      ctx.fillStyle = '#1e1b4b';
      ctx.strokeStyle = '#a855f7';
      ctx.lineWidth = 3;

      // Hexagonal Pillar
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        const px = Math.cos(a) * this.radius;
        const py = Math.sin(a) * this.radius;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Glowing crystal core
      ctx.fillStyle = '#c084fc';
      ctx.beginPath();
      ctx.arc(0, 0, this.radius * 0.45, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }
}
