import type { WeaponId, EvolvedWeaponId, AnyWeaponId, PassiveId } from '../types';
import type { Player } from '../entities/Player';
import { Projectile } from '../entities/Projectile';
import type { Enemy } from '../entities/Enemy';
import { sounds } from '../audio/SoundManager';
import type { ParticleSystem } from '../systems/ParticleSystem';

export interface WeaponContext {
  player: Player;
  enemies: Enemy[];
  projectiles: Projectile[];
  particleSystem: ParticleSystem;
  dt: number;
  onDirectDamage?: (sourceId: AnyWeaponId, damage: number, isKill?: boolean) => void;
}

export abstract class Weapon {
  public id: AnyWeaponId;
  public name: string;
  public level: number = 1;
  public maxLevel: number = 5;
  public isEvolved: boolean = false;
  public cooldownTimer: number = 0;
  public baseCooldown: number = 1.0;
  public icon: string;
  public totalDamageDealt: number = 0;
  public totalKills: number = 0;

  constructor(id: AnyWeaponId, name: string, baseCooldown: number, icon: string, isEvolved: boolean = false) {
    this.id = id;
    this.name = name;
    this.baseCooldown = baseCooldown;
    this.icon = icon;
    this.isEvolved = isEvolved;
    this.cooldownTimer = Math.random() * 0.3; // Stagger initial attacks
  }

  public getActualCooldown(player: Player): number {
    let cd = this.baseCooldown / player.stats.attackSpeedMult;
    if (player.stats.isFocused) {
      cd /= (1.30 + player.focusAttackSpeedBonus + player.focusFireRateBonus);
    } else if (player.movingFireRateBonus > 0) {
      cd /= (1.0 + player.movingFireRateBonus);
    }
    if (player.overdriveTimer > 0 && player.overdriveRank > 0) {
      cd /= (1.0 + player.overdriveRank * 0.05);
    }
    return Math.max(0.06, cd);
  }

  public abstract update(context: WeaponContext): void;
  public render(_ctx: CanvasRenderingContext2D, _screenPlayerX: number, _screenPlayerY: number): void {}

  public upgrade() {
    if (this.level < this.maxLevel) {
      this.level++;
    }
  }

  protected checkCrit(player: Player): { isCrit: boolean; mult: number } {
    let chance = player.stats.critChance;
    if (player.stats.isFocused) chance += (0.15 + player.focusCritBonus);
    const isCrit = Math.random() < chance;
    let mult = isCrit ? player.stats.critDamageMult : 1.0;
    if (player.shadowDashBuffTimer > 0) {
      mult *= 1.30;
    }
    return { isCrit, mult };
  }

  protected spawnProjectile(ctx: WeaponContext, opts: import('../entities/Projectile').ProjectileOptions): Projectile {
    const p = ctx.player;
    const finalPierce = (opts.pierce ?? 1) + p.extraPierce + (p.stats.isFocused ? p.focusExtraPierce : 0);
    const finalKnockback = (opts.knockback ?? 40) * p.knockbackMult;
    const finalRadius = opts.radius * p.projectileAoEMult;

    let dmg = opts.damage;
    let isOvercharged = false;
    if (p.stats.isFocused && p.focusOverchargeShot) {
      p.focusShotCounter++;
      if (p.focusShotCounter >= 3) {
        p.focusShotCounter = 0;
        dmg = Math.round(dmg * 3.0);
        isOvercharged = true;
      }
    }

    let isExpl = opts.isExplosive ?? false;
    let explRad = opts.explosionRadius ?? 0;
    if (p.shipId === 'valkyrie' && isExpl) {
      dmg = Math.round(dmg * 1.20);
      explRad = Math.round(explRad * 1.25);
    }

    const proj = new Projectile({
      ...opts,
      damage: dmg,
      pierce: finalPierce,
      knockback: finalKnockback,
      radius: finalRadius,
      burnChance: opts.burnChance ?? p.burnChance,
      chainLightningChance: opts.chainLightningChance ?? p.chainLightningChance,
      shrapnelChance: opts.shrapnelChance ?? p.shrapnelChance,
      flakSplinterChance: opts.flakSplinterChance ?? p.flakSplinterChance,
      concussionChance: opts.concussionChance ?? p.concussionChance,
      bleedChance: opts.bleedChance ?? p.bleedChance,
      ricochetBounces: opts.ricochetBounces ?? p.ricochetBounces,
      armorPenetrationRatio: opts.armorPenetrationRatio ?? p.armorPenetrationRatio,
      superchargeOnCrit: opts.superchargeOnCrit ?? p.superchargeOnCrit,
      singularityChance: opts.singularityChance ?? p.singularityChance,
      pierceObstacles: p.shipId === 'phantom' || p.dashWarp,
      isHoming: opts.isHoming || (p.stats.isFocused && p.focusHoming),
      isOvercharged,
      isExplosive: isExpl,
      explosionRadius: explRad,
    });
    ctx.projectiles.push(proj);
    return proj;
  }

  protected findNearestEnemy(player: Player, enemies: Enemy[], maxRange: number = 600): Enemy | null {
    let nearest: Enemy | null = null;
    let minDistSq = maxRange * maxRange;

    for (let i = 0; i < enemies.length; i++) {
      const e = enemies[i];
      if (!e.isAlive) continue;
      const dx = e.x - player.x;
      const dy = e.y - player.y;
      const distSq = dx * dx + dy * dy;
      if (distSq < minDistSq) {
        minDistSq = distSq;
        nearest = e;
      }
    }
    return nearest;
  }
}

// 1. Plasma Blaster: Rapid auto-aiming energy bolts
export class PlasmaBlaster extends Weapon {
  constructor() {
    super('plasma_blaster', 'Plasma Blaster', 0.65, 'bolt');
  }

  public update(ctx: WeaponContext): void {
    this.cooldownTimer -= ctx.dt;
    if (this.cooldownTimer <= 0) {
      const target = this.findNearestEnemy(ctx.player, ctx.enemies, 500);
      if (target) {
        this.cooldownTimer = this.getActualCooldown(ctx.player);
        this.fire(ctx, target);
      }
    }
  }

  private fire(ctx: WeaponContext, target: Enemy) {
    const p = ctx.player;
    const dx = target.x - p.x;
    const dy = target.y - p.y;
    const angle = Math.atan2(dy, dx);

    const baseCount = 1 + (this.level >= 2 ? 1 : 0) + (this.level >= 4 ? 1 : 0);
    const count = baseCount + p.stats.extraProjectiles;
    const pierce = 1 + (this.level >= 3 ? 1 : 0) + (this.level >= 5 ? 2 : 0);
    const baseDmg = (18 + this.level * 6) * p.stats.damageMult;

    const spreadAngle = 0.18;
    const startAngle = angle - ((count - 1) * spreadAngle) / 2;

    sounds.playShoot();

    for (let i = 0; i < count; i++) {
      const a = startAngle + i * spreadAngle;
      const speed = 460;
      const { isCrit, mult } = this.checkCrit(p);

      this.spawnProjectile(ctx, {
          x: p.x,
          y: p.y,
          vx: Math.cos(a) * speed,
          vy: Math.sin(a) * speed,
          radius: 5 + (this.level >= 4 ? 2 : 0),
          damage: Math.round(baseDmg * mult),
          life: 1.4,
          isPlayer: true,
          pierce,
          knockback: 60,
          color: '#00e5ff',
          glowColor: 'rgba(0, 229, 255, 0.8)',
          isCrit,
          sourceWeaponId: this.id,
        });
    }
  }
}

// 2. Orbiting Blades: Rotating plasma shields slicing enemies
export class OrbitingBlades extends Weapon {
  private rotationAngle: number = 0;
  private hitCooldowns: Map<number, number> = new Map();

  constructor() {
    super('orbiting_blades', 'Orbiting Blades', 0.01, 'sword');
  }

  public update(ctx: WeaponContext): void {
    const bladeCount = 2 + this.level;
    const orbitRadius = 70 + this.level * 8;
    const spinSpeed = 3.5 + this.level * 0.4;
    this.rotationAngle += spinSpeed * ctx.dt;

    // Decay hit cooldowns
    for (const [enemyId, cd] of this.hitCooldowns.entries()) {
      const nextCd = cd - ctx.dt;
      if (nextCd <= 0) {
        this.hitCooldowns.delete(enemyId);
      } else {
        this.hitCooldowns.set(enemyId, nextCd);
      }
    }

    // Check collision for each blade
    const p = ctx.player;
    const dmg = (14 + this.level * 5) * p.stats.damageMult;
    const bladeRadius = 14 + this.level * 2;

    for (let i = 0; i < bladeCount; i++) {
      const a = this.rotationAngle + (i * Math.PI * 2) / bladeCount;
      const bx = p.x + Math.cos(a) * orbitRadius;
      const by = p.y + Math.sin(a) * orbitRadius;

      for (let j = 0; j < ctx.enemies.length; j++) {
        const e = ctx.enemies[j];
        if (!e.isAlive || this.hitCooldowns.has(e.id)) continue;

        const dx = e.x - bx;
        const dy = e.y - by;
        const r = bladeRadius + e.radius;

        if (dx * dx + dy * dy <= r * r) {
          const { mult } = this.checkCrit(p);
          const finalDmg = Math.round(dmg * mult);
          const kbAngle = Math.atan2(e.y - p.y, e.x - p.x);

          const died = e.takeDamage(finalDmg, Math.cos(kbAngle) * 120, Math.sin(kbAngle) * 120);
          ctx.onDirectDamage?.(this.id, finalDmg, died);
          this.hitCooldowns.set(e.id, 0.28); // Can hit same enemy every 0.28s

          sounds.playSlice();
          ctx.particleSystem.emit(bx, by, 4, '#ff007f', 90, 4, 0.2);
        }
      }
    }
  }

  public render(ctx: CanvasRenderingContext2D, screenPlayerX: number, screenPlayerY: number): void {
    const bladeCount = 2 + this.level;
    const orbitRadius = 70 + this.level * 8;
    const bladeSize = 14 + this.level * 2;

    for (let i = 0; i < bladeCount; i++) {
      const a = this.rotationAngle + (i * Math.PI * 2) / bladeCount;
      const bx = screenPlayerX + Math.cos(a) * orbitRadius;
      const by = screenPlayerY + Math.sin(a) * orbitRadius;

      ctx.save();
      ctx.translate(bx, by);
      ctx.rotate(a + Math.PI / 2);

      ctx.shadowColor = '#ff007f';
      ctx.shadowBlur = 12;
      ctx.fillStyle = '#ff007f';

      // Curved blade shape
      ctx.beginPath();
      ctx.ellipse(0, 0, bladeSize * 1.3, bladeSize * 0.45, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(0, 0, bladeSize * 0.7, bladeSize * 0.2, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }
  }
}

// 3. Lightning Coil: Zaps random targets with chaining arcs
export class LightningCoil extends Weapon {
  constructor() {
    super('lightning_coil', 'Lightning Coil', 1.8, 'bolt');
  }

  public update(ctx: WeaponContext): void {
    this.cooldownTimer -= ctx.dt;
    if (this.cooldownTimer <= 0) {
      this.cooldownTimer = this.getActualCooldown(ctx.player);
      this.strike(ctx);
    }
  }

  private strike(ctx: WeaponContext) {
    const p = ctx.player;
    const target = this.findNearestEnemy(p, ctx.enemies, 420);
    if (!target) return;

    sounds.playLightning();

    const maxChains = 2 + this.level;
    const dmg = (28 + this.level * 10) * p.stats.damageMult;
    const hitEnemies: Enemy[] = [target];

    let currentEnemy = target;
    const { mult } = this.checkCrit(p);
    const primaryDmg = Math.round(dmg * mult);
    const primaryDied = currentEnemy.takeDamage(primaryDmg);
    ctx.onDirectDamage?.(this.id, primaryDmg, primaryDied);
    ctx.particleSystem.emit(currentEnemy.x, currentEnemy.y, 8, '#00ffff', 140, 3, 0.3, 'line');

    // Chain to nearby enemies
    for (let c = 1; c < maxChains; c++) {
      let nextEnemy: Enemy | null = null;
      let nextDistSq = 200 * 200;

      for (let i = 0; i < ctx.enemies.length; i++) {
        const candidate = ctx.enemies[i];
        if (!candidate.isAlive || hitEnemies.includes(candidate)) continue;
        const dx = candidate.x - currentEnemy.x;
        const dy = candidate.y - currentEnemy.y;
        const distSq = dx * dx + dy * dy;
        if (distSq < nextDistSq) {
          nextDistSq = distSq;
          nextEnemy = candidate;
        }
      }

      if (nextEnemy) {
        hitEnemies.push(nextEnemy);
        const chainDmg = Math.round(dmg * 0.85 * mult);
        const chainDied = nextEnemy.takeDamage(chainDmg);
        ctx.onDirectDamage?.(this.id, chainDmg, chainDied);
        ctx.particleSystem.emit(nextEnemy.x, nextEnemy.y, 6, '#00ffff', 120, 3, 0.25, 'line');
        currentEnemy = nextEnemy;
      } else {
        break;
      }
    }
  }
}

// 4. Toxic Aura: Persistent damaging field around player
export class ToxicAura extends Weapon {
  private tickTimer: number = 0;

  constructor() {
    super('toxic_aura', 'Toxic Aura', 0.4, 'atom');
  }

  public update(ctx: WeaponContext): void {
    this.tickTimer -= ctx.dt;
    if (this.tickTimer <= 0) {
      this.tickTimer = 0.35; // tick frequency

      const p = ctx.player;
      const radius = (95 + this.level * 18) * (p.shipId === 'pyroclast' ? 1.5 : 1.0);
      const rSq = radius * radius;
      const dmg = (7 + this.level * 3) * p.stats.damageMult;

      for (let i = 0; i < ctx.enemies.length; i++) {
        const e = ctx.enemies[i];
        if (!e.isAlive) continue;
        const dx = e.x - p.x;
        const dy = e.y - p.y;
        if (dx * dx + dy * dy <= rSq) {
          const finalDmg = Math.round(dmg);
          const died = e.takeDamage(finalDmg);
          ctx.onDirectDamage?.(this.id, finalDmg, died);
          if (p.shipId === 'pyroclast' || p.burnChance > 0) {
            e.applyBurn(3.0, dmg * 0.4);
          }
          // Apply slight slow
          e.speed = Math.max(e.config.speed * 0.65, e.speed * 0.95);
        }
      }
    }
  }

  public render(ctx: CanvasRenderingContext2D, screenPlayerX: number, screenPlayerY: number): void {
    const radius = 95 + this.level * 18;
    const pulse = Math.sin(Date.now() * 0.005) * 4;

    ctx.save();
    ctx.shadowColor = 'rgba(0, 255, 128, 0.4)';
    ctx.shadowBlur = 10;
    ctx.strokeStyle = 'rgba(0, 255, 128, 0.35)';
    ctx.lineWidth = 2.5;

    ctx.beginPath();
    ctx.arc(screenPlayerX, screenPlayerY, radius + pulse, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = 'rgba(0, 255, 128, 0.04)';
    ctx.beginPath();
    ctx.arc(screenPlayerX, screenPlayerY, radius + pulse, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}

// 5. Seeker Missiles: Heat-seeking rockets that explode in AoE
export class SeekerMissiles extends Weapon {
  constructor() {
    super('seeker_missiles', 'Seeker Missiles', 1.6, 'rocket');
  }

  public update(ctx: WeaponContext): void {
    this.cooldownTimer -= ctx.dt;
    if (this.cooldownTimer <= 0) {
      const target = this.findNearestEnemy(ctx.player, ctx.enemies, 600);
      if (target) {
        this.cooldownTimer = this.getActualCooldown(ctx.player);
        this.fire(ctx, target);
      }
    }

    // Update active homing missiles
    for (let i = 0; i < ctx.projectiles.length; i++) {
      const p = ctx.projectiles[i];
      if (p.isAlive && p.isHoming) {
        const nearest = this.findNearestEnemy(ctx.player, ctx.enemies, 500);
        if (nearest) {
          p.homeTowards(nearest.x, nearest.y, ctx.dt, 7);
        }
      }
    }
  }

  private fire(ctx: WeaponContext, target: Enemy) {
    const p = ctx.player;
    const count = 2 + (this.level >= 3 ? 1 : 0) + (this.level >= 5 ? 2 : 0) + p.stats.extraProjectiles;
    const dmg = (22 + this.level * 8) * p.stats.damageMult;

    sounds.playShoot();

    for (let i = 0; i < count; i++) {
      const offsetAngle = (Math.random() - 0.5) * 1.4;
      const dx = target.x - p.x;
      const dy = target.y - p.y;
      const baseAngle = Math.atan2(dy, dx) + offsetAngle;
      const speed = 320;
      const { isCrit, mult } = this.checkCrit(p);

      this.spawnProjectile(ctx, {
          x: p.x,
          y: p.y,
          vx: Math.cos(baseAngle) * speed,
          vy: Math.sin(baseAngle) * speed,
          radius: 7,
          damage: Math.round(dmg * mult),
          life: 2.2,
          isPlayer: true,
          pierce: 1,
          knockback: 100,
          color: '#ff9900',
          glowColor: 'rgba(255, 153, 0, 0.9)',
          isHoming: true,
          isCrit,
          sourceWeaponId: this.id,
        });
    }
  }
}

// 6. Scatter Cannon: Heavy cone shotgun blast
export class ScatterCannon extends Weapon {
  constructor() {
    super('scatter_cannon', 'Scatter Cannon', 1.2, '💥');
  }

  public update(ctx: WeaponContext): void {
    this.cooldownTimer -= ctx.dt;
    if (this.cooldownTimer <= 0) {
      const target = this.findNearestEnemy(ctx.player, ctx.enemies, 380);
      if (target) {
        this.cooldownTimer = this.getActualCooldown(ctx.player);
        this.fire(ctx, target);
      }
    }
  }

  private fire(ctx: WeaponContext, target: Enemy) {
    const p = ctx.player;
    const dx = target.x - p.x;
    const dy = target.y - p.y;
    const centerAngle = Math.atan2(dy, dx);

    const pelletCount = 5 + this.level * 2 + p.stats.extraProjectiles * 2;
    const spreadArc = 0.65;
    const dmg = (12 + this.level * 4) * p.stats.damageMult;

    sounds.playBlast();

    for (let i = 0; i < pelletCount; i++) {
      const angle = centerAngle + (Math.random() - 0.5) * spreadArc;
      const speed = 400 + Math.random() * 120;
      const { isCrit, mult } = this.checkCrit(p);

      this.spawnProjectile(ctx, {
          x: p.x,
          y: p.y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          radius: 4,
          damage: Math.round(dmg * mult),
          life: 0.55,
          isPlayer: true,
          pierce: 1,
          knockback: 180, // huge knockback
          color: '#ff3366',
          glowColor: 'rgba(255, 51, 102, 0.8)',
          isCrit,
          sourceWeaponId: this.id,
        });
    }
  }
}

// 7. Piercing Laser / Railgun: Line piercing beam
export class PiercingLaser extends Weapon {
  constructor() {
    super('piercing_laser', 'Piercing Laser', 1.5, '🔮');
  }

  public update(ctx: WeaponContext): void {
    this.cooldownTimer -= ctx.dt;
    if (this.cooldownTimer <= 0) {
      const target = this.findNearestEnemy(ctx.player, ctx.enemies, 550);
      if (target) {
        this.cooldownTimer = this.getActualCooldown(ctx.player);
        this.fire(ctx, target);
      }
    }
  }

  private fire(ctx: WeaponContext, target: Enemy) {
    const p = ctx.player;
    const dx = target.x - p.x;
    const dy = target.y - p.y;
    const angle = Math.atan2(dy, dx);
    const speed = 750;
    const pierce = 99; // penetrates all
    const dmg = (35 + this.level * 12) * p.stats.damageMult;

    sounds.playBlast();
    const { isCrit, mult } = this.checkCrit(p);

    this.spawnProjectile(ctx, {
        x: p.x,
        y: p.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 8 + this.level,
        damage: Math.round(dmg * mult),
        life: 0.9,
        isPlayer: true,
        pierce,
        knockback: 70,
        color: '#b026ff',
        glowColor: 'rgba(176, 38, 255, 0.9)',
        isCrit,
        sourceWeaponId: this.id,
      });
  }
}

export function createWeapon(id: WeaponId): Weapon {
  switch (id) {
    case 'plasma_blaster': return new PlasmaBlaster();
    case 'orbiting_blades': return new OrbitingBlades();
    case 'lightning_coil': return new LightningCoil();
    case 'toxic_aura': return new ToxicAura();
    case 'seeker_missiles': return new SeekerMissiles();
    case 'scatter_cannon': return new ScatterCannon();
    case 'piercing_laser': return new PiercingLaser();
    default: return new PlasmaBlaster();
  }
}

// =========================================================================
// SUPER WEAPONS (EVOLUTIONS)
// =========================================================================

// 1. Quantum Obliterator (Plasma Blaster + Overclock)
export class QuantumObliterator extends Weapon {
  private sweepAngle: number = 0;

  constructor() {
    super('quantum_obliterator', 'Quantum Obliterator', 0.09, 'bolt', true);
  }

  public update(ctx: WeaponContext): void {
    const p = ctx.player;
    this.sweepAngle += 4.5 * ctx.dt;

    this.cooldownTimer -= ctx.dt;
    if (this.cooldownTimer <= 0) {
      this.cooldownTimer = this.getActualCooldown(p);

      // 1. Sweeping Continuous Ion Bolt
      const speed = 650;
      const { isCrit, mult } = this.checkCrit(p);
      const dmg = 45 * p.stats.damageMult * mult;

      sounds.playShoot();

      this.spawnProjectile(ctx, {
          x: p.x,
          y: p.y,
          vx: Math.cos(this.sweepAngle) * speed,
          vy: Math.sin(this.sweepAngle) * speed,
          radius: 8,
          damage: Math.round(dmg),
          life: 1.2,
          isPlayer: true,
          pierce: 99,
          knockback: 75,
          color: '#00f0ff',
          glowColor: 'rgba(0, 240, 255, 0.95)',
          isCrit,
          sourceWeaponId: this.id,
        });

      // 2. Targeted Secondary Beam towards nearest high-threat enemy
      const target = this.findNearestEnemy(p, ctx.enemies, 550);
      if (target) {
        const dx = target.x - p.x;
        const dy = target.y - p.y;
        const angle = Math.atan2(dy, dx);
        ctx.projectiles.push(
          new Projectile({
            x: p.x,
            y: p.y,
            vx: Math.cos(angle) * (speed * 1.1),
            vy: Math.sin(angle) * (speed * 1.1),
            radius: 9,
            damage: Math.round(dmg * 1.3),
            life: 1.0,
            isPlayer: true,
            pierce: 3,
            knockback: 90,
            color: '#38bdf8',
            glowColor: 'rgba(56, 189, 248, 0.9)',
            isCrit,
            sourceWeaponId: this.id,
          })
        );
      }
    }
  }
}

// 2. Tachyon Vortex (Orbiting Blades + Multi-Barrel)
export class TachyonVortex extends Weapon {
  private rotationAngle: number = 0;
  private hitCooldowns: Map<number, number> = new Map();

  constructor() {
    super('tachyon_vortex', 'Tachyon Vortex', 0.01, '🌀', true);
  }

  public update(ctx: WeaponContext): void {
    const bladeCount = 8;
    const pulse = Math.sin(Date.now() * 0.006) * 35;
    const orbitRadius = 90 + pulse;
    const spinSpeed = 5.2;
    this.rotationAngle += spinSpeed * ctx.dt;

    for (const [enemyId, cd] of this.hitCooldowns.entries()) {
      const nextCd = cd - ctx.dt;
      if (nextCd <= 0) this.hitCooldowns.delete(enemyId);
      else this.hitCooldowns.set(enemyId, nextCd);
    }

    const p = ctx.player;
    const dmg = 55 * p.stats.damageMult;
    const bladeRadius = 18;

    for (let i = 0; i < bladeCount; i++) {
      const a = this.rotationAngle + (i * Math.PI * 2) / bladeCount;
      const bx = p.x + Math.cos(a) * orbitRadius;
      const by = p.y + Math.sin(a) * orbitRadius;

      for (let j = 0; j < ctx.enemies.length; j++) {
        const e = ctx.enemies[j];
        if (!e.isAlive || this.hitCooldowns.has(e.id)) continue;

        const dx = e.x - bx;
        const dy = e.y - by;
        if (dx * dx + dy * dy <= (bladeRadius + e.radius) * (bladeRadius + e.radius)) {
          const { mult } = this.checkCrit(p);
          const finalDmg = Math.round(dmg * mult);
          const kbAngle = Math.atan2(e.y - p.y, e.x - p.x);

          // Slight vortex pull inwards for swarmers
          const died = e.takeDamage(finalDmg, Math.cos(kbAngle) * 90, Math.sin(kbAngle) * 90);
          ctx.onDirectDamage?.(this.id, finalDmg, died);
          this.hitCooldowns.set(e.id, 0.20);

          sounds.playSlice();
          ctx.particleSystem.emit(bx, by, 5, '#ec4899', 110, 5, 0.25);
        }
      }
    }
  }

  public render(ctx: CanvasRenderingContext2D, screenPlayerX: number, screenPlayerY: number): void {
    const bladeCount = 8;
    const pulse = Math.sin(Date.now() * 0.006) * 35;
    const orbitRadius = 90 + pulse;
    const bladeSize = 18;

    for (let i = 0; i < bladeCount; i++) {
      const a = this.rotationAngle + (i * Math.PI * 2) / bladeCount;
      const bx = screenPlayerX + Math.cos(a) * orbitRadius;
      const by = screenPlayerY + Math.sin(a) * orbitRadius;

      ctx.save();
      ctx.translate(bx, by);
      ctx.rotate(a + Math.PI / 2);

      ctx.shadowColor = '#ec4899';
      ctx.shadowBlur = 16;
      ctx.fillStyle = '#ec4899';

      ctx.beginPath();
      ctx.ellipse(0, 0, bladeSize * 1.6, bladeSize * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(0, 0, bladeSize * 0.8, bladeSize * 0.22, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }
  }
}

// 3. Judgement Tempest (Lightning Coil + Targeting CPU)
export class JudgementTempest extends Weapon {
  constructor() {
    super('judgement_tempest', 'Judgement Tempest', 0.85, 'bolt', true);
  }

  public update(ctx: WeaponContext): void {
    this.cooldownTimer -= ctx.dt;
    if (this.cooldownTimer <= 0) {
      this.cooldownTimer = this.getActualCooldown(ctx.player);
      this.strikeAll(ctx);
    }
  }

  private strikeAll(ctx: WeaponContext) {
    const p = ctx.player;
    sounds.playLightning();

    // Select up to 6 targets on screen
    const living = ctx.enemies.filter(e => e.isAlive);
    if (living.length === 0) return;

    // Shuffle and pick 6
    const targets = living.sort(() => 0.5 - Math.random()).slice(0, 6);
    const dmg = 120 * p.stats.damageMult;
    const { mult } = this.checkCrit(p);

    for (const target of targets) {
      const finalDmg = Math.round(dmg * mult);
      const died = target.takeDamage(finalDmg);
      ctx.onDirectDamage?.(this.id, finalDmg, died);

      // Lightning column VFX
      ctx.particleSystem.emit(target.x, target.y, 16, '#facc15', 180, 4, 0.4, 'line');
      ctx.particleSystem.emitRing(target.x, target.y, 45, '#38bdf8', 0.3);
    }
  }
}

// 4. Nanite Plague (Toxic Aura + Vampire Chip)
export class NanitePlague extends Weapon {
  private tickTimer: number = 0;

  constructor() {
    super('nanite_plague', 'Nanite Plague', 0.25, 'atom', true);
  }

  public update(ctx: WeaponContext): void {
    this.tickTimer -= ctx.dt;
    if (this.tickTimer <= 0) {
      this.tickTimer = 0.25;

      const p = ctx.player;
      const radius = 170;
      const rSq = radius * radius;
      const dmg = 38 * p.stats.damageMult;

      for (let i = 0; i < ctx.enemies.length; i++) {
        const e = ctx.enemies[i];
        if (!e.isAlive) continue;
        const dx = e.x - p.x;
        const dy = e.y - p.y;
        if (dx * dx + dy * dy <= rSq) {
          const finalDmg = Math.round(dmg);
          const died = e.takeDamage(finalDmg);
          ctx.onDirectDamage?.(this.id, finalDmg, died);
          if (p.shipId === 'pyroclast' || p.burnChance > 0) {
            e.applyBurn(3.0, dmg * 0.4);
          }

          // 40% slow
          e.speed = Math.max(e.config.speed * 0.55, e.speed * 0.9);

          // Leech heal chance on plague death
          if (died && Math.random() < 0.15) {
            p.stats.hp = Math.min(p.stats.maxHp, p.stats.hp + 2);
            sounds.playPickup();
            ctx.particleSystem.emit(p.x, p.y, 8, '#10b981', 80, 3, 0.3);
          }
        }
      }
    }
  }

  public render(ctx: CanvasRenderingContext2D, screenPlayerX: number, screenPlayerY: number): void {
    const radius = 170;
    const pulse = Math.sin(Date.now() * 0.007) * 8;

    ctx.save();
    ctx.shadowColor = 'rgba(16, 185, 129, 0.6)';
    ctx.shadowBlur = 18;
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.45)';
    ctx.lineWidth = 3.5;

    ctx.beginPath();
    ctx.arc(screenPlayerX, screenPlayerY, radius + pulse, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = 'rgba(16, 185, 129, 0.08)';
    ctx.fill();

    ctx.restore();
  }
}

// 5. Doomsday ICBM (Seeker Missiles + Energy Core)
export class DoomsdayICBM extends Weapon {
  constructor() {
    super('doomsday_icbm', 'Doomsday ICBM', 1.15, 'rocket', true);
  }

  public update(ctx: WeaponContext): void {
    this.cooldownTimer -= ctx.dt;
    if (this.cooldownTimer <= 0) {
      const target = this.findNearestEnemy(ctx.player, ctx.enemies, 650);
      if (target) {
        this.cooldownTimer = this.getActualCooldown(ctx.player);
        this.fire(ctx, target);
      }
    }

    for (let i = 0; i < ctx.projectiles.length; i++) {
      const p = ctx.projectiles[i];
      if (p.isAlive && p.isHoming && p.sourceWeaponId === this.id) {
        const nearest = this.findNearestEnemy(ctx.player, ctx.enemies, 600);
        if (nearest) {
          p.homeTowards(nearest.x, nearest.y, ctx.dt, 9);
        }
      }
    }
  }

  private fire(ctx: WeaponContext, target: Enemy) {
    const p = ctx.player;
    const count = 3 + p.stats.extraProjectiles;
    const dmg = 190 * p.stats.damageMult;

    sounds.playNuke();

    for (let i = 0; i < count; i++) {
      const offsetAngle = (Math.random() - 0.5) * 1.5;
      const dx = target.x - p.x;
      const dy = target.y - p.y;
      const baseAngle = Math.atan2(dy, dx) + offsetAngle;
      const speed = 360;
      const { isCrit, mult } = this.checkCrit(p);

      this.spawnProjectile(ctx, {
          x: p.x,
          y: p.y,
          vx: Math.cos(baseAngle) * speed,
          vy: Math.sin(baseAngle) * speed,
          radius: 12,
          damage: Math.round(dmg * mult),
          life: 2.5,
          isPlayer: true,
          pierce: 1,
          knockback: 180,
          color: '#ef4444',
          glowColor: 'rgba(239, 68, 68, 0.95)',
          isHoming: true,
          isCrit,
          sourceWeaponId: this.id,
        });
    }
  }
}

// 6. Flak Fortress (Scatter Cannon + Titan Armor)
export class FlakFortress extends Weapon {
  constructor() {
    super('flak_fortress', 'Flak Fortress', 0.8, '💥', true);
  }

  public update(ctx: WeaponContext): void {
    this.cooldownTimer -= ctx.dt;
    if (this.cooldownTimer <= 0) {
      this.cooldownTimer = this.getActualCooldown(ctx.player);
      this.fireRadial(ctx);
    }
  }

  private fireRadial(ctx: WeaponContext) {
    const p = ctx.player;
    const pelletCount = 18 + p.stats.extraProjectiles * 4;
    const dmg = 48 * p.stats.damageMult;

    sounds.playBlast();

    for (let i = 0; i < pelletCount; i++) {
      const angle = (i * Math.PI * 2) / pelletCount + (Math.random() - 0.5) * 0.15;
      const speed = 440 + Math.random() * 80;
      const { isCrit, mult } = this.checkCrit(p);

      this.spawnProjectile(ctx, {
          x: p.x,
          y: p.y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          radius: 5,
          damage: Math.round(dmg * mult),
          life: 0.65,
          isPlayer: true,
          pierce: 2,
          knockback: 160,
          color: '#fbbf24',
          glowColor: 'rgba(251, 191, 36, 0.9)',
          isCrit,
          sourceWeaponId: this.id,
        });
    }
  }
}

// 7. Orbital Death Ray (Piercing Laser + Nitro Thruster)
export class OrbitalDeathRay extends Weapon {
  constructor() {
    super('orbital_death_ray', 'Orbital Death Ray', 1.25, '🔮', true);
  }

  public update(ctx: WeaponContext): void {
    this.cooldownTimer -= ctx.dt;
    if (this.cooldownTimer <= 0) {
      this.cooldownTimer = this.getActualCooldown(ctx.player);
      this.fireCrossAxis(ctx);
    }
  }

  private fireCrossAxis(ctx: WeaponContext) {
    const p = ctx.player;
    const speed = 900;
    const dmg = 180 * p.stats.damageMult;
    const { isCrit, mult } = this.checkCrit(p);

    sounds.playBlast();

    // 4 Cardinal Columns forming an orbital cross that sweeps everything
    const angles = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2];

    for (const a of angles) {
      this.spawnProjectile(ctx, {
          x: p.x,
          y: p.y,
          vx: Math.cos(a) * speed,
          vy: Math.sin(a) * speed,
          radius: 16,
          damage: Math.round(dmg * mult),
          life: 1.0,
          isPlayer: true,
          pierce: 99,
          knockback: 120,
          color: '#a855f7',
          glowColor: 'rgba(168, 85, 247, 0.95)',
          isCrit,
          sourceWeaponId: this.id,
        });
    }
  }
}

// Evolution Pairing Config
export const EVOLUTION_RECIPES: Record<WeaponId, { requiredPassive: PassiveId; evolvedId: EvolvedWeaponId }> = {
  plasma_blaster: { requiredPassive: 'overclock', evolvedId: 'quantum_obliterator' },
  orbiting_blades: { requiredPassive: 'multi_barrel', evolvedId: 'tachyon_vortex' },
  lightning_coil: { requiredPassive: 'targeting_cpu', evolvedId: 'judgement_tempest' },
  toxic_aura: { requiredPassive: 'vampire_chip', evolvedId: 'nanite_plague' },
  seeker_missiles: { requiredPassive: 'energy_core', evolvedId: 'doomsday_icbm' },
  scatter_cannon: { requiredPassive: 'titan_armor', evolvedId: 'flak_fortress' },
  piercing_laser: { requiredPassive: 'nitro_thruster', evolvedId: 'orbital_death_ray' },
};

export function createEvolvedWeapon(id: EvolvedWeaponId): Weapon {
  switch (id) {
    case 'quantum_obliterator': return new QuantumObliterator();
    case 'tachyon_vortex': return new TachyonVortex();
    case 'judgement_tempest': return new JudgementTempest();
    case 'nanite_plague': return new NanitePlague();
    case 'doomsday_icbm': return new DoomsdayICBM();
    case 'flak_fortress': return new FlakFortress();
    case 'orbital_death_ray': return new OrbitalDeathRay();
    default: return new QuantumObliterator();
  }
}
