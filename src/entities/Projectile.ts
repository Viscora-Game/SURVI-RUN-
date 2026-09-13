import { Entity } from './Entity';
import type { AnyWeaponId } from '../types';

export interface ProjectileOptions {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  damage: number;
  life: number;
  isPlayer: boolean;
  pierce?: number;
  knockback?: number;
  color?: string;
  glowColor?: string;
  isHoming?: boolean;
  isCrit?: boolean;
  sourceWeaponId?: AnyWeaponId;
  burnChance?: number;
  chainLightningChance?: number;
  shrapnelChance?: number;
  flakSplinterChance?: number;
  concussionChance?: number;
  bleedChance?: number;
  ricochetBounces?: number;
  armorPenetrationRatio?: number;
  superchargeOnCrit?: boolean;
  singularityChance?: number;
  pierceObstacles?: boolean;
  isOvercharged?: boolean;
  isExplosive?: boolean;
  explosionRadius?: number;
}

export class Projectile extends Entity {
  public damage: number;
  public life: number;
  public maxLife: number;
  public isPlayer: boolean;
  public pierce: number;
  public knockback: number;
  public color: string;
  public glowColor: string;
  public isHoming: boolean;
  public isCrit: boolean;
  public sourceWeaponId?: AnyWeaponId;
  public hitEntityIds: Set<number> = new Set();

  // Advanced Combat Traits
  public burnChance: number = 0;
  public chainLightningChance: number = 0;
  public shrapnelChance: number = 0;
  public flakSplinterChance: number = 0;
  public concussionChance: number = 0;
  public bleedChance: number = 0;
  public ricochetBounces: number = 0;
  public armorPenetrationRatio: number = 0;
  public superchargeOnCrit: boolean = false;
  public singularityChance: number = 0;
  public pierceObstacles: boolean = false;
  public isOvercharged: boolean = false;
  public isExplosive: boolean = false;
  public explosionRadius: number = 0;

  constructor(options: ProjectileOptions) {
    super(options.x, options.y, options.radius);
    this.vx = options.vx;
    this.vy = options.vy;
    this.damage = options.damage;
    this.life = options.life;
    this.maxLife = options.life;
    this.isPlayer = options.isPlayer;
    this.pierce = options.pierce ?? 1;
    this.knockback = options.knockback ?? 40;
    this.color = options.color ?? '#00f0ff';
    this.glowColor = options.glowColor ?? 'rgba(0, 240, 255, 0.6)';
    this.isHoming = options.isHoming ?? false;
    this.isCrit = options.isCrit ?? false;
    this.sourceWeaponId = options.sourceWeaponId;

    this.burnChance = options.burnChance ?? 0;
    this.chainLightningChance = options.chainLightningChance ?? 0;
    this.shrapnelChance = options.shrapnelChance ?? 0;
    this.flakSplinterChance = options.flakSplinterChance ?? 0;
    this.concussionChance = options.concussionChance ?? 0;
    this.bleedChance = options.bleedChance ?? 0;
    this.ricochetBounces = options.ricochetBounces ?? 0;
    this.armorPenetrationRatio = options.armorPenetrationRatio ?? 0;
    this.superchargeOnCrit = options.superchargeOnCrit ?? false;
    this.singularityChance = options.singularityChance ?? 0;
    this.pierceObstacles = options.pierceObstacles ?? false;
    this.isOvercharged = options.isOvercharged ?? false;
    this.isExplosive = options.isExplosive ?? false;
    this.explosionRadius = options.explosionRadius ?? 0;
  }

  public update(dt: number): void {
    this.life -= dt;
    if (this.life <= 0 || this.pierce <= 0) {
      this.isAlive = false;
      return;
    }

    this.x += this.vx * dt;
    this.y += this.vy * dt;
  }

  public homeTowards(targetX: number, targetY: number, dt: number, turnRate: number = 6) {
    const dx = targetX - this.x;
    const dy = targetY - this.y;
    const currentSpeed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
    if (currentSpeed <= 0.01) return;

    const targetAngle = Math.atan2(dy, dx);
    const currentAngle = Math.atan2(this.vy, this.vx);

    let diff = targetAngle - currentAngle;
    while (diff < -Math.PI) diff += Math.PI * 2;
    while (diff > Math.PI) diff -= Math.PI * 2;

    const newAngle = currentAngle + Math.sign(diff) * Math.min(Math.abs(diff), turnRate * dt);
    this.vx = Math.cos(newAngle) * currentSpeed;
    this.vy = Math.sin(newAngle) * currentSpeed;
  }

  public render(ctx: CanvasRenderingContext2D, screenX: number, screenY: number): void {
    ctx.save();
    ctx.translate(screenX, screenY);

    ctx.fillStyle = this.color;
    ctx.shadowColor = this.glowColor;
    ctx.shadowBlur = this.isCrit || this.isOvercharged ? 20 : 8;

    // Directional elongated capsule
    const angle = Math.atan2(this.vy, this.vx);
    ctx.rotate(angle);

    ctx.beginPath();
    const lenMult = this.isOvercharged ? 2.2 : 1.5;
    ctx.ellipse(0, 0, this.radius * lenMult, this.radius * 0.8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Hot center
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(0, 0, this.radius * 0.8, this.radius * 0.35, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}
