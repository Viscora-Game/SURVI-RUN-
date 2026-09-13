import { Entity } from './Entity';
import type { PlayerStats, AnyWeaponId, PassiveId, ShipId } from '../types';
import { sounds } from '../audio/SoundManager';
import type { ParticleSystem } from '../systems/ParticleSystem';
import { PixelArtRenderer } from '../rendering/PixelArtRenderer';
import { SHIP_CONFIGS } from './ShipConfig';

export interface TakeDamageResult {
  tookDamage: boolean;
  died: boolean;
  actualDamage: number;
  dodged?: boolean;
  deflected?: boolean;
  shieldAbsorbed?: boolean;
  thornsDamage?: number;
  triggerReactiveWave?: boolean;
}

export class Player extends Entity {
  public stats: PlayerStats;
  public shipId: ShipId;
  public level: number = 1;
  public currentXp: number = 0;
  public requiredXp: number = 15;
  public totalKills: number = 0;
  public coins: number = 0;

  // Visuals & Pixel Art
  public rotation: number = 0;
  public animTimer: number = 0;

  // Meta Progression & Base Properties
  public doubleShotChance: number = 0;
  public passiveRegenInterval: number = 0;
  public regenTimer: number = 0;
  public hasEmergencyShield: boolean = false;
  public emergencyShieldUsed: boolean = false;
  public availableRerolls: number = 0;
  public shardMultiplier: number = 1.0;
  public focusThreshold: number = 0.4;
  public focusDamageBonus: number = 0;
  public onEmergencyShieldTrigger?: () => void;

  public invulnerableTimer: number = 0;
  public equippedWeapons: Map<AnyWeaponId, number> = new Map();
  public equippedPassives: Map<PassiveId, number> = new Map();

  // 1. WARFARE SPECIALIZATIONS (All 26 nodes wired)
  public projectileSpeedMult: number = 1.0;
  public extraPierce: number = 0;
  public shrapnelChance: number = 0;
  public overdriveRank: number = 0;
  public overdriveTimer: number = 0;
  public projectileAoEMult: number = 1.0;
  public knockbackMult: number = 1.0;
  // Plasma Path
  public burnChance: number = 0;
  public chainLightningChance: number = 0;
  public armorPenetrationRatio: number = 0;
  public superchargeOnCrit: boolean = false;
  public singularityChance: number = 0;
  // Ballistic Path
  public flakSplinterChance: number = 0;
  public concussionChance: number = 0;
  public bleedChance: number = 0;
  public ricochetBounces: number = 0;
  public bossCritDamageBonus: number = 0;
  // Warfare Capstones
  public godSlayerExecute: boolean = false;

  // 2. DEFENSE SPECIALIZATIONS (All 26 nodes wired)
  public healEffectivenessMult: number = 1.0;
  public hazardDamageReduction: number = 0;
  public lowHpDoubleRegen: boolean = false;
  public deflectChance: number = 0;
  public thornsDamage: number = 0;
  public hasSecondWind: boolean = false;
  public secondWindUsed: boolean = false;
  public maxDamageTakenCap: number = 0;
  public hasShieldPulse: boolean = false;
  // Colossus Path
  public knockbackImmune: boolean = false;
  public hasReactiveWave: boolean = false;
  public bossDamageReduction: number = 0;
  public swarmerCrushDamage: number = 0;
  public hasInvincibleWill: boolean = false;
  public invincibleWillUsed: boolean = false;
  // Ghost Path
  public dodgeChance: number = 0;
  public dashDecoy: boolean = false;
  public dashStealth: boolean = false;
  public dodgeHealsHp: number = 0;
  // Defense Capstones
  public phoenixFullRevive: boolean = false;
  public hasNaniteHive: boolean = false;
  public naniteHiveAngle: number = 0;

  // 3. MOBILITY SPECIALIZATIONS (All 26 nodes wired)
  public driftResponsiveness: number = 1.0;
  public speedPenaltyFree: boolean = false;
  public dashFireTrail: boolean = false;
  public dashStunEnemies: boolean = false;
  public focusAttackSpeedBonus: number = 0;
  public focusCritBonus: number = 0;
  public sprintShieldMax: number = 0;
  public currentSprintShield: number = 0;
  public dashWarp: boolean = false;
  // Sniper Focus Path
  public focusFireRateBonus: number = 0;
  public focusVelocityBonus: number = 0;
  public focusExtraPierce: number = 0;
  public focusHoming: boolean = false;
  public focusOverchargeShot: boolean = false;
  public focusShotCounter: number = 0;
  public focusAuraSlow: boolean = false;
  // Blitzkrieg Path
  public sprintSpeedBonus: number = 0;
  public movingFireRateBonus: number = 0;
  public sprintStaticDischarge: boolean = false;
  public sprintStaticTimer: number = 0;
  public sprintDashRechargeMult: number = 1.0;
  public dashSonicBoom: boolean = false;
  public sprintKillResetDash: boolean = false;
  // Mobility Capstones
  public dashProjectileFreeze: boolean = false;
  public projectileFreezeTimer: number = 0;
  public eliteKillUnlimitedDash: boolean = false;
  public unlimitedDashTimer: number = 0;

  // 4. ECONOMY SPECIALIZATIONS (All 26 nodes wired)
  public xpMultiplier: number = 1.0;
  public crateRadarSensor: boolean = false;
  public coinMultiplier: number = 1.0;
  public gemAttractSpeedMult: number = 1.0;
  public chestExtraCard: boolean = false;
  public doubleShardChance: number = 0;
  public nukeExtraXp: boolean = false;
  public autoVacuumInterval: number = 0;
  public autoVacuumTimer: number = 0;
  // Tycoon Path
  public eliteBonusShards: number = 0;
  public crateBonusShardChance: number = 0;
  public shardDuplicationChance: number = 0;
  public convertCoinsToShards: boolean = false;
  // Armory Path
  public rareCardBonusChance: number = 0;
  public banishCharges: number = 0;
  public dualUpgradeChance: number = 0;
  public weaponMaxRankDiscount: number = 0;
  public upgradePowerMult: number = 1.0;
  public earlyEvolutionUnlocked: boolean = false;
  // Economy Capstones
  public infiniteAscension: boolean = false;

  // SHIP TACTICAL TRAITS
  public shadowDashBuffTimer: number = 0;
  public killsSinceLastEmp: number = 0;
  public stationaryTime: number = 0;

  private ghostTrailTimer: number = 0;

  constructor(x: number, y: number, shipId: ShipId = 'vanguard') {
    super(x, y, 18);
    this.shipId = shipId;
    const config = SHIP_CONFIGS[shipId] || SHIP_CONFIGS.vanguard;
    const mods = config.statModifiers;
    const baseHp = Math.round(100 * (mods.maxHpMult ?? 1.0));

    this.stats = {
      maxHp: baseHp,
      hp: baseHp,
      speed: Math.round(195 * (mods.speedMult ?? 1.0)),
      damageMult: 0.9 + (shipId === 'vanguard' ? 0.10 : 0),
      attackSpeedMult: mods.attackSpeedMult ?? 1.0,
      critChance: 0.08 + (mods.critChanceBonus ?? 0),
      critDamageMult: 2.0,
      armor: mods.armorBonus ?? 0,
      lifeSteal: 0,
      pickupRadius: Math.round(85 * (mods.pickupRadiusMult ?? 1.0)),
      extraProjectiles: shipId === 'valkyrie' ? 1 : 0,
      dashCooldown: shipId === 'chronos' ? 1.95 : 3.0,
      dashTimer: 0,
      isDashing: false,
      dashDuration: 0.22,
      dashSpeedMult: shipId === 'interceptor' ? 3.8 : 3.2,
      focusTime: 0,
      isFocused: false,
    };

    this.equippedWeapons.set(config.startingWeapon, 1);
  }

  public takeDamage(
    amount: number,
    isHazard: boolean = false,
    isMelee: boolean = false
  ): TakeDamageResult {
    if (this.invulnerableTimer > 0 || this.stats.isDashing || !this.isAlive) {
      return { tookDamage: false, died: false, actualDamage: 0 };
    }

    // Pyroclast ship trait: immune to hazards
    if (isHazard && this.shipId === 'pyroclast') {
      return { tookDamage: false, died: false, actualDamage: 0 };
    }

    // Dodge check (Phantom ship trait + Phase Ghost path)
    const totalDodge = this.dodgeChance + (this.shipId === 'phantom' ? 0.20 : 0);
    if (totalDodge > 0 && Math.random() < totalDodge) {
      if (this.dodgeHealsHp > 0) {
        this.heal(this.dodgeHealsHp);
      }
      sounds.playDash();
      return { tookDamage: false, died: false, actualDamage: 0, dodged: true };
    }

    // Projectile deflection check
    if (!isHazard && !isMelee && this.deflectChance > 0 && Math.random() < this.deflectChance) {
      sounds.playHit();
      return { tookDamage: false, died: false, actualDamage: 0, deflected: true };
    }

    // Hazard damage reduction
    let incomingDamage = amount;
    if (isHazard && this.hazardDamageReduction > 0) {
      incomingDamage = Math.max(1, Math.round(incomingDamage * (1 - this.hazardDamageReduction)));
    }

    let actualDamage = Math.max(1, Math.round(incomingDamage - this.stats.armor));
    if (this.maxDamageTakenCap > 0) {
      actualDamage = Math.min(this.maxDamageTakenCap, actualDamage);
    }

    // Kinetic sprint barrier absorption
    if (this.currentSprintShield > 0) {
      if (this.currentSprintShield >= actualDamage) {
        this.currentSprintShield -= actualDamage;
        return {
          tookDamage: true,
          died: false,
          actualDamage: 0,
          shieldAbsorbed: true,
          thornsDamage: isMelee ? this.thornsDamage : 0,
          triggerReactiveWave: this.hasReactiveWave || this.shipId === 'dreadnought',
        };
      } else {
        actualDamage -= this.currentSprintShield;
        this.currentSprintShield = 0;
      }
    }

    // Second Wind invulnerability trigger
    if (this.hasSecondWind && !this.secondWindUsed && this.stats.hp - actualDamage <= this.stats.maxHp * 0.20) {
      this.secondWindUsed = true;
      this.invulnerableTimer = 2.0;
      sounds.playChest();
    }

    // Lethal damage resolution
    if (this.stats.hp - actualDamage <= 0) {
      // 1. Invincible Will check
      if (this.hasInvincibleWill && !this.invincibleWillUsed) {
        this.invincibleWillUsed = true;
        this.stats.hp = 1;
        this.invulnerableTimer = 4.0;
        sounds.playChest();
        return {
          tookDamage: true,
          died: false,
          actualDamage,
          thornsDamage: isMelee ? this.thornsDamage : 0,
          triggerReactiveWave: true,
        };
      }

      // 2. Phoenix Resurrection or Emergency Shield
      if (this.hasEmergencyShield && !this.emergencyShieldUsed) {
        this.emergencyShieldUsed = true;
        this.stats.hp = this.phoenixFullRevive ? this.stats.maxHp : Math.max(1, Math.round(this.stats.maxHp * 0.25));
        this.invulnerableTimer = 4.0;
        sounds.playChest();
        sounds.triggerHaptic('heavy');
        if (this.onEmergencyShieldTrigger) {
          this.onEmergencyShieldTrigger();
        }
        return {
          tookDamage: true,
          died: false,
          actualDamage,
          thornsDamage: isMelee ? this.thornsDamage : 0,
          triggerReactiveWave: true,
        };
      }

      this.stats.hp = 0;
      this.isAlive = false;
      return { tookDamage: true, died: true, actualDamage };
    }

    this.stats.hp = Math.max(0, this.stats.hp - actualDamage);
    this.invulnerableTimer = 0.70;
    sounds.playHurt();
    sounds.triggerHaptic('hit');

    return {
      tookDamage: true,
      died: false,
      actualDamage,
      thornsDamage: isMelee ? this.thornsDamage : 0,
      triggerReactiveWave: this.hasReactiveWave || this.shipId === 'dreadnought',
    };
  }

  public heal(amount: number) {
    const effAmount = Math.round(amount * this.healEffectivenessMult);
    this.stats.hp = Math.min(this.stats.maxHp, this.stats.hp + effAmount);
  }

  public pendingLevelUps: number = 0;

  public addXp(amount: number): boolean {
    const finalAmount = Math.round(amount * this.xpMultiplier);
    this.currentXp += finalAmount;
    sounds.playGem();

    let didLevelUp = false;
    while (this.currentXp >= this.requiredXp) {
      this.currentXp -= this.requiredXp;
      this.level++;
      this.requiredXp = Math.round(this.requiredXp * 1.25 + 10);

      if (!didLevelUp) {
        didLevelUp = true;
        sounds.playLevelUp();
      } else {
        this.pendingLevelUps++;
      }

      if (this.infiniteAscension && this.level >= 25) {
        this.stats.damageMult += 0.03;
        this.stats.maxHp += 5;
        this.stats.hp += 5;
      }
    }
    return didLevelUp;
  }

  public dash(): boolean {
    const canDash = this.unlimitedDashTimer > 0 || (this.stats.dashTimer <= 0 && !this.stats.isDashing);
    if (canDash) {
      this.stats.isDashing = true;
      this.stats.dashTimer = this.unlimitedDashTimer > 0 ? 0.05 : this.stats.dashCooldown;
      this.invulnerableTimer = this.stats.dashDuration;
      sounds.playDash();
      sounds.triggerHaptic('dash');

      // Interceptor trait: Shadow Dash grants 2s of +30% damage
      if (this.shipId === 'interceptor') {
        this.shadowDashBuffTimer = 2.0;
      }

      // Mobility capstone: Time freeze
      if (this.dashProjectileFreeze) {
        this.projectileFreezeTimer = 1.5;
      }

      return true;
    }
    return false;
  }

  public updatePlayer(
    dt: number,
    moveVx: number,
    moveVy: number,
    particleSystem: ParticleSystem
  ) {
    if (this.invulnerableTimer > 0) {
      this.invulnerableTimer -= dt;
    }

    // Timers decay
    if (this.shadowDashBuffTimer > 0) this.shadowDashBuffTimer -= dt;
    if (this.overdriveTimer > 0) this.overdriveTimer -= dt;
    if (this.projectileFreezeTimer > 0) this.projectileFreezeTimer -= dt;
    if (this.unlimitedDashTimer > 0) this.unlimitedDashTimer -= dt;

    // Auto vacuum pulse
    if (this.autoVacuumInterval > 0) {
      this.autoVacuumTimer += dt;
    }

    // Passive health regeneration
    if (this.passiveRegenInterval > 0 && this.stats.hp < this.stats.maxHp) {
      let interval = this.passiveRegenInterval;
      if (this.lowHpDoubleRegen && this.stats.hp < this.stats.maxHp * 0.5) {
        interval /= 2;
      }
      this.regenTimer += dt;
      if (this.regenTimer >= interval) {
        this.regenTimer = 0;
        this.heal(1);
      }
    }

    // Dash cooldown
    if (this.stats.dashTimer > 0) {
      const isMovingFast = Math.abs(moveVx) > 0.01 || Math.abs(moveVy) > 0.01;
      const rate = isMovingFast ? this.sprintDashRechargeMult : 1.0;
      this.stats.dashTimer -= dt * rate;
    }

    // Nanite hive rotation
    if (this.hasNaniteHive) {
      this.naniteHiveAngle = (this.naniteHiveAngle + dt * 3.5) % (Math.PI * 2);
    }

    // Movement & Focus detection
    const isMoving = Math.abs(moveVx) > 0.01 || Math.abs(moveVy) > 0.01;

    if (!isMoving) {
      this.stats.focusTime += dt;
      this.stationaryTime += dt;
      if (this.stats.focusTime >= this.focusThreshold && !this.stats.isFocused) {
        this.stats.isFocused = true;
        sounds.playFocus();
        particleSystem.emitRing(this.x, this.y, 35, '#00f0ff', 0.3);
      }
    } else {
      this.stats.focusTime = 0;
      this.stats.isFocused = false;
      this.stationaryTime = 0;

      // Sprint shield buildup
      if (this.sprintShieldMax > 0) {
        this.currentSprintShield = Math.min(this.sprintShieldMax, this.currentSprintShield + dt * 5);
      }

      // Static discharge buildup
      if (this.sprintStaticDischarge) {
        this.sprintStaticTimer += dt;
      }
    }

    if (isMoving) {
      this.animTimer += dt;
      this.rotation = Math.atan2(moveVy, moveVx) + Math.PI / 2;
    }

    // Calculate current movement speed with buffs
    let effectiveSpeed = this.stats.speed;
    if (isMoving && this.sprintSpeedBonus > 0) {
      effectiveSpeed += this.sprintSpeedBonus;
    }
    if (this.overdriveTimer > 0 && this.overdriveRank > 0) {
      effectiveSpeed += this.overdriveRank * 10;
    }

    // Dash state
    if (this.stats.isDashing) {
      this.ghostTrailTimer += dt;
      if (this.ghostTrailTimer >= 0.03) {
        this.ghostTrailTimer = 0;
        const trailColor = this.dashFireTrail ? '#f97316' : (this.shadowDashBuffTimer > 0 ? '#ec4899' : '#00e5ff');
        particleSystem.emit(this.x, this.y, 2, trailColor, 20, 6, 0.25, 'circle');
      }

      const dashSpeed = effectiveSpeed * this.stats.dashSpeedMult;
      this.x += (moveVx || 1) * dashSpeed * dt;
      this.y += (moveVy || 0) * dashSpeed * dt;

      if (this.stats.dashCooldown - this.stats.dashTimer >= this.stats.dashDuration) {
        this.stats.isDashing = false;
      }
    } else {
      this.x += moveVx * effectiveSpeed * dt;
      this.y += moveVy * effectiveSpeed * dt;
    }
  }

  public update(_dt: number): void {}

  public render(ctx: CanvasRenderingContext2D, screenX: number, screenY: number): void {
    ctx.save();
    ctx.translate(screenX, screenY);

    // Emergency Shield barrier visual effect
    if (this.invulnerableTimer > 1.0) {
      const shieldPulse = Math.sin(Date.now() * 0.01) * 4;
      ctx.strokeStyle = '#00ffff';
      ctx.shadowColor = '#00ffff';
      ctx.shadowBlur = 18;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, this.radius + 16 + shieldPulse, 0, Math.PI * 2);
      ctx.stroke();
    } else if (this.invulnerableTimer > 0 && Math.floor(Date.now() / 60) % 2 === 0) {
      ctx.globalAlpha = 0.4;
    }

    // Kinetic Sprint Shield visual ring
    if (this.currentSprintShield > 0) {
      const shieldRatio = Math.min(1.0, this.currentSprintShield / (this.sprintShieldMax || 1));
      ctx.strokeStyle = `rgba(59, 130, 246, ${0.3 + shieldRatio * 0.5})`;
      ctx.shadowColor = '#3b82f6';
      ctx.shadowBlur = 10;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(0, 0, this.radius + 6, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Shadow Dash / Overdrive visual aura
    if (this.shadowDashBuffTimer > 0) {
      const pulse = Math.sin(Date.now() * 0.02) * 3;
      ctx.strokeStyle = '#ec4899';
      ctx.shadowColor = '#ec4899';
      ctx.shadowBlur = 14;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, this.radius + 8 + pulse, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Chronos Time Dilation aura when stationary
    if (this.shipId === 'chronos' && this.stationaryTime > 0.4) {
      const pulse = Math.sin(Date.now() * 0.005) * 5;
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.35)';
      ctx.fillStyle = 'rgba(6, 182, 212, 0.06)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(0, 0, 110 + pulse, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    // Nanite Hive rotating orbiting nodes
    if (this.hasNaniteHive) {
      for (let k = 0; k < 3; k++) {
        const orbAngle = this.naniteHiveAngle + (k * Math.PI * 2) / 3;
        const orbX = Math.cos(orbAngle) * (this.radius + 18);
        const orbY = Math.sin(orbAngle) * (this.radius + 18);
        ctx.fillStyle = '#10b981';
        ctx.shadowColor = '#10b981';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(orbX, orbY, 3.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Archero Focus Aura
    if (this.stats.isFocused) {
      const pulse = Math.sin(Date.now() * 0.008) * 3;
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 18 + pulse;
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.6)';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(0, 0, this.radius + 10 + pulse, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = '#00f0ff';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('FOCUS ENGAGED', 0, -this.radius - 16);
    }

    // Magnet radius guide
    ctx.strokeStyle = 'rgba(0, 229, 255, 0.04)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(0, 0, this.stats.pickupRadius, 0, Math.PI * 2);
    ctx.stroke();

    // Top-Down 2D Pixel Art Cyber Operative
    const animFrame = Math.floor(this.animTimer * 10);
    const sprite = PixelArtRenderer.getPlayerSprite(animFrame, this.stats.isDashing, this.stats.isFocused, this.shipId);
    PixelArtRenderer.renderSprite(ctx, sprite, 0, 0, this.rotation, 1.25);

    ctx.restore();
  }
}
