import { Entity } from './Entity';
import type { EnemyConfig } from '../types';
import { Projectile } from './Projectile';
import { Hazard } from './Hazard';
import { sounds } from '../audio/SoundManager';
import type { ParticleSystem } from '../systems/ParticleSystem';
import type { Camera } from '../core/Camera';
import { PixelArtRenderer } from '../rendering/PixelArtRenderer';

let nextEnemyId = 1;

export class Enemy extends Entity {
  public id: number;
  public config: EnemyConfig;
  public hp: number;
  public maxHp: number;
  public damage: number;
  public speed: number;
  public xpValue: number;
  public hitFlashTimer: number = 0;
  public shootTimer: number = 0;
  public isBoss: boolean = false;

  // Rotation & Visuals
  public rotation: number = 0;
  public animTimer: number = Math.random() * 10;

  // Separation & Knockback
  public knockbackVx: number = 0;
  public knockbackVy: number = 0;

  // Specialized Behaviors
  public pounceCooldown: number = 2.0;
  public isPouncing: boolean = false;
  public pounceTimer: number = 0;
  public pounceVx: number = 0;
  public pounceVy: number = 0;

  // Kamikaze Exploder
  public isIgniting: boolean = false;
  public fuseTimer: number = 1.0;

  // Phantom Cloaking
  public isCloaked: boolean = false;
  public cloakTimer: number = 3.0;

  // Brute Stomp
  public stompTimer: number = 4.0;

  // Sniper Aiming
  public isAiming: boolean = false;
  public aimTimer: number = 0;
  public aimTargetX: number = 0;
  public aimTargetY: number = 0;

  // Tesla Discharge
  public isDischarging: boolean = false;
  public shockTimer: number = 3.5;

  // Elite Champion Status
  public isElite: boolean = false;

  // Status Effects
  public burnTimer: number = 0;
  public burnDps: number = 0;
  public burnTickTimer: number = 0;
  public bleedTimer: number = 0;
  public bleedDps: number = 0;
  public bleedTickTimer: number = 0;
  public stunTimer: number = 0;
  public slowTimer: number = 0;
  public slowMult: number = 1.0;

  constructor(x: number, y: number, config: EnemyConfig, hpMultiplier: number = 1) {
    super(x, y, config.radius);
    this.id = nextEnemyId++;
    this.config = config;
    this.isElite = config.isElite ?? false;

    let baseHp = config.maxHp;
    if (this.isElite) {
      baseHp = Math.round(baseHp * 2.6);
      this.radius = Math.round(this.radius * 1.3);
    }

    this.maxHp = Math.round(baseHp * hpMultiplier);
    this.hp = this.maxHp;
    this.damage = this.isElite ? Math.round(config.damage * 1.3) : config.damage;
    this.speed = this.isElite ? Math.round(config.speed * 1.1) : config.speed;
    this.xpValue = this.isElite ? config.xpValue * 3 : config.xpValue;
    this.isBoss = config.isBoss ?? false;
    this.shootTimer = Math.random() * (config.shootCooldown ?? 3);
  }

  public applyBurn(duration: number, dps: number) {
    this.burnTimer = Math.max(this.burnTimer, duration);
    this.burnDps = Math.max(this.burnDps, dps);
  }

  public applyBleed(duration: number, dps: number) {
    this.bleedTimer = Math.max(this.bleedTimer, duration);
    this.bleedDps = Math.max(this.bleedDps, dps);
  }

  public applyStun(duration: number) {
    if (this.isBoss) return;
    this.stunTimer = Math.max(this.stunTimer, duration);
  }

  public applySlow(duration: number, mult: number) {
    this.slowTimer = Math.max(this.slowTimer, duration);
    this.slowMult = Math.min(this.slowMult, mult);
  }

  public takeDamage(
    amount: number,
    knockbackX: number = 0,
    knockbackY: number = 0,
    hitSourceX?: number,
    hitSourceY?: number,
    armorPenetrationRatio: number = 0
  ): boolean {
    let finalDamage = amount;

    // Shielded Enforcer front shield check
    if (this.config.type === 'shielded' && hitSourceX !== undefined && hitSourceY !== undefined) {
      const hitAngle = Math.atan2(hitSourceY - this.y, hitSourceX - this.x);
      let angleDiff = Math.abs(hitAngle - this.rotation);
      while (angleDiff > Math.PI) angleDiff = Math.PI * 2 - angleDiff;

      // Frontal 120 degree cone deflection
      if (angleDiff < Math.PI * 0.4) {
        const deflectionRatio = Math.min(1.0, 0.2 + armorPenetrationRatio * 0.8);
        finalDamage = Math.max(1, Math.round(amount * deflectionRatio));
        sounds.playSlice();
      }
    }

    this.hp -= finalDamage;
    this.hitFlashTimer = 0.1;

    // Knockback resistance
    const resistance = this.isBoss ? 0.05 : (this.config.type === 'brute' ? 0.25 : 1.0);
    this.knockbackVx += knockbackX * resistance;
    this.knockbackVy += knockbackY * resistance;

    if (this.hp <= 0) {
      this.isAlive = false;
      return true; // Died
    }
    return false;
  }

  public update(dt: number): void {
    this.animTimer += dt;

    if (this.hitFlashTimer > 0) {
      this.hitFlashTimer -= dt;
    }

    // Status ticks
    if (this.burnTimer > 0) {
      this.burnTimer -= dt;
      this.burnTickTimer += dt;
      if (this.burnTickTimer >= 0.5) {
        this.burnTickTimer = 0;
        this.takeDamage(Math.max(1, Math.round(this.burnDps * 0.5)));
      }
    }

    if (this.bleedTimer > 0) {
      this.bleedTimer -= dt;
      this.bleedTickTimer += dt;
      if (this.bleedTickTimer >= 0.4) {
        this.bleedTickTimer = 0;
        this.takeDamage(Math.max(1, Math.round(this.bleedDps * 0.4)));
      }
    }

    if (this.slowTimer > 0) {
      this.slowTimer -= dt;
      if (this.slowTimer <= 0) this.slowMult = 1.0;
    }

    if (this.stunTimer > 0) {
      this.stunTimer -= dt;
    }

    // Apply knockback deceleration
    this.x += this.knockbackVx * dt;
    this.y += this.knockbackVy * dt;
    this.knockbackVx *= Math.pow(0.85, dt * 60);
    this.knockbackVy *= Math.pow(0.85, dt * 60);
  }

  public updateAI(
    dt: number,
    playerX: number,
    playerY: number,
    projectiles: Projectile[],
    hazards: Hazard[],
    particleSystem: ParticleSystem,
    camera: Camera
  ): { exploded?: boolean; explosionDamage?: number; explosionRadius?: number } {
    if (!this.isAlive) return {};
    if (this.stunTimer > 0) return {};

    const dx = playerX - this.x;
    const dy = playerY - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > 0.1) {
      this.rotation = Math.atan2(dy, dx);
    }

    // 1. SWARMER: Pounce / Lunge
    if (this.config.type === 'swarmer') {
      this.pounceCooldown -= dt;

      if (this.isPouncing) {
        this.pounceTimer -= dt;
        this.x += this.pounceVx * dt;
        this.y += this.pounceVy * dt;

        if (this.pounceTimer <= 0) {
          this.isPouncing = false;
          this.pounceCooldown = 2.2;
        }
        return {};
      }

      // Initiate pounce when close (within 130px)
      if (dist < 130 && this.pounceCooldown <= 0) {
        this.isPouncing = true;
        this.pounceTimer = 0.35;
        this.pounceVx = (dx / dist) * (this.speed * 2.8);
        this.pounceVy = (dy / dist) * (this.speed * 2.8);
        particleSystem.emit(this.x, this.y, 4, '#ff6600', 60, 4, 0.2);
        return {};
      }
    }

    // 2. KAMIKAZE: Ignite & Suicide Explosion
    if (this.config.type === 'kamikaze') {
      if (dist < 85 || this.isIgniting) {
        this.isIgniting = true;
        this.fuseTimer -= dt;

        // Pulsing warning particles
        if (Math.random() < 0.4) {
          particleSystem.emit(this.x, this.y, 2, '#ff0033', 40, 5, 0.2);
        }

        if (this.fuseTimer <= 0) {
          this.isAlive = false;
          sounds.playNuke();
          camera.addShake(10);
          particleSystem.emitRing(this.x, this.y, 110, '#ff3300', 0.5);

          return {
            exploded: true,
            explosionDamage: 38,
            explosionRadius: 120,
          };
        }
        return {};
      }
    }

    // 3. SPITTER: Telegraphed projectile barrage
    if (this.config.type === 'spitter') {
      this.shootTimer -= dt;

      // Keep medium distance (kite player at 260px)
      if (dist < 200) {
        // Back away
        this.x -= (dx / dist) * (this.speed * 0.75) * dt;
        this.y -= (dy / dist) * (this.speed * 0.75) * dt;
      } else if (dist > 320) {
        // Approach
        this.x += (dx / dist) * this.speed * dt;
        this.y += (dy / dist) * this.speed * dt;
      }

      // Fire projectile every 2.6s
      if (this.shootTimer <= 0 && dist < 420) {
        this.shootTimer = 2.6;
        sounds.playShoot();

        const angle = Math.atan2(dy, dx);
        const pSpeed = 230;
        const pRadius = 6;
        const pDamage = 14;

        projectiles.push(
          new Projectile({
            x: this.x,
            y: this.y,
            vx: Math.cos(angle) * pSpeed,
            vy: Math.sin(angle) * pSpeed,
            damage: pDamage,
            radius: pRadius,
            life: 2.5,
            color: '#10b981',
            glowColor: 'rgba(16, 185, 129, 0.6)',
            isPlayer: false,
          })
        );

        particleSystem.emit(this.x, this.y, 6, '#10b981', 80, 4, 0.25);
        return {};
      }
      return {};
    }

    // 4. PHANTOM: Cloaking & Ambush Strike
    if (this.config.type === 'phantom') {
      this.cloakTimer -= dt;
      if (this.cloakTimer <= 0) {
        this.isCloaked = !this.isCloaked;
        this.cloakTimer = this.isCloaked ? 2.5 : 3.5;
        particleSystem.emit(this.x, this.y, 8, '#a855f7', 80, 4, 0.3);
      }
    }

    // 5. BRUTE: Ground Stomp Shockwave & Charge
    if (this.config.type === 'brute') {
      this.stompTimer -= dt;
      if (this.stompTimer <= 0 && dist < 180) {
        this.stompTimer = 5.0;
        camera.addShake(8);
        particleSystem.emitRing(this.x, this.y, 130, '#f59e0b', 0.5);

        // Creates a lingering fire hazard on stomp
        hazards.push(new Hazard(this.x, this.y, 55, 3.5, 8, 'fire_zone'));
      }
    }

    // 1.5 RUNNER: Agile Flanking & Zig-Zag Sprint
    if (this.config.type === 'runner') {
      const lateralFactor = Math.sin(this.animTimer * 7) * 0.45;
      const perpX = -dy / dist;
      const perpY = dx / dist;
      this.x += (dx / dist + perpX * lateralFactor) * (this.speed * 1.08) * dt;
      this.y += (dy / dist + perpY * lateralFactor) * (this.speed * 1.08) * dt;
      return {};
    }

    // 6. SNIPER: Long-Range Telegraph Laser
    if (this.config.type === 'sniper') {
      this.shootTimer -= dt;

      // Maintain sniper distance (260px - 440px)
      if (dist < 260) {
        this.x -= (dx / dist) * (this.speed * 0.9) * dt;
        this.y -= (dy / dist) * (this.speed * 0.9) * dt;
      } else if (dist > 380) {
        this.x += (dx / dist) * this.speed * dt;
        this.y += (dy / dist) * this.speed * dt;
      }

      if (dist < 480) {
        this.isAiming = true;
        this.aimTimer += dt;
        this.aimTargetX = playerX;
        this.aimTargetY = playerY;

        if (Math.random() < 0.25) {
          particleSystem.emit(this.x, this.y, 1, '#f43f5e', 30, 2, 0.2);
        }

        if (this.aimTimer >= 1.2) {
          this.aimTimer = 0;
          this.isAiming = false;
          sounds.playShoot();

          const angle = Math.atan2(playerY - this.y, playerX - this.x);
          const pSpeed = 440;
          projectiles.push(
            new Projectile({
              x: this.x,
              y: this.y,
              vx: Math.cos(angle) * pSpeed,
              vy: Math.sin(angle) * pSpeed,
              damage: this.damage,
              radius: 6,
              life: 2.0,
              color: '#f43f5e',
              glowColor: 'rgba(244, 63, 94, 0.9)',
              isPlayer: false,
            })
          );
          particleSystem.emit(this.x, this.y, 8, '#f43f5e', 110, 4, 0.25);
        }
        return {};
      } else {
        this.isAiming = false;
        this.aimTimer = 0;
      }
    }

    // 7. TESLA: Electro Discharge Burst
    if (this.config.type === 'tesla') {
      this.shockTimer -= dt;

      if (this.shockTimer <= 0.8 && this.shockTimer > 0) {
        this.isDischarging = true;
        if (dist > 0.01) {
          this.x += (dx / dist) * (this.speed * 0.25) * dt;
          this.y += (dy / dist) * (this.speed * 0.25) * dt;
        }
        if (Math.random() < 0.35) {
          particleSystem.emit(this.x, this.y, 2, '#c084fc', 50, 3, 0.2);
        }
        return {};
      }

      if (this.shockTimer <= 0) {
        this.isDischarging = false;
        this.shockTimer = 3.6;
        sounds.playSlice();
        particleSystem.emitRing(this.x, this.y, 115, '#c084fc', 0.45);

        if (dist < 115) {
          return {
            exploded: true,
            explosionDamage: this.damage,
            explosionRadius: 115,
          };
        }
        return {};
      }
    }

    // Standard chase behavior for alive non-specializing frames
    if (dist > 0.01) {
      const moveSpd = this.speed * (this.isCloaked ? 1.4 : 1.0) * this.slowMult;
      this.x += (dx / dist) * moveSpd * dt;
      this.y += (dy / dist) * moveSpd * dt;
    }

    return {};
  }

  public render(ctx: CanvasRenderingContext2D, screenX: number, screenY: number): void {
    ctx.save();
    ctx.translate(screenX, screenY);

    const isFlashing = this.hitFlashTimer > 0;

    // Phantom cloak transparency
    if (this.config.type === 'phantom' && this.isCloaked) {
      ctx.globalAlpha = 0.25;
    }

    // Directional top-down rotation
    ctx.rotate(this.rotation + Math.PI / 2);

    // Render high-fidelity Top-Down 2D Pixel Art Sprite
    const animFrame = Math.floor(this.animTimer * 8);
    let sprite: HTMLCanvasElement;
    let scale = 1.0;

    switch (this.config.type) {
      case 'swarmer':
        sprite = PixelArtRenderer.getSwarmerSprite(animFrame);
        scale = (this.radius * 2.3) / sprite.width;
        break;
      case 'runner':
        sprite = PixelArtRenderer.getRunnerSprite(animFrame);
        scale = (this.radius * 2.5) / sprite.width;
        break;
      case 'spitter':
        sprite = PixelArtRenderer.getSpitterSprite(animFrame);
        scale = (this.radius * 2.4) / sprite.width;
        break;
      case 'brute':
        sprite = PixelArtRenderer.getBruteSprite(animFrame);
        scale = (this.radius * 2.5) / sprite.width;
        break;
      case 'kamikaze':
        sprite = PixelArtRenderer.getKamikazeSprite(animFrame, this.isIgniting);
        scale = (this.radius * 2.4) / sprite.width;
        break;
      case 'phantom':
        sprite = PixelArtRenderer.getPhantomSprite(animFrame);
        scale = (this.radius * 2.4) / sprite.width;
        break;
      case 'shielded':
        sprite = PixelArtRenderer.getShieldedSprite(animFrame);
        scale = (this.radius * 2.5) / sprite.width;
        break;
      case 'sniper':
        sprite = PixelArtRenderer.getSniperSprite(animFrame, this.isAiming);
        scale = (this.radius * 2.4) / sprite.width;
        break;
      case 'tesla':
        sprite = PixelArtRenderer.getTeslaSprite(animFrame, this.isDischarging);
        scale = (this.radius * 2.5) / sprite.width;
        break;
      default:
        sprite = PixelArtRenderer.getSwarmerSprite(animFrame);
        scale = (this.radius * 2.3) / sprite.width;
        break;
    }

    ctx.drawImage(
      sprite,
      -(sprite.width * scale) / 2,
      -(sprite.height * scale) / 2,
      sprite.width * scale,
      sprite.height * scale
    );

    // Sniper Laser Aim Sight Line
    if (this.isAiming && this.config.type === 'sniper') {
      const aimAlpha = Math.min(0.9, 0.25 + (this.aimTimer / 1.2) * 0.65);
      ctx.strokeStyle = `rgba(244, 63, 94, ${aimAlpha})`;
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 4]);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -420);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Hit flash overlay
    if (isFlashing) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.beginPath();
      ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
      ctx.fill();
    }

    // Elite Champion Visual Aura & Tag
    if (this.isElite) {
      ctx.rotate(-(this.rotation + Math.PI / 2));
      const auraPulse = Math.sin(this.animTimer * 5) * 3;
      ctx.strokeStyle = '#fbbf24';
      ctx.shadowColor = '#fbbf24';
      ctx.shadowBlur = 12;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(0, 0, this.radius + 6 + auraPulse, 0, Math.PI * 2);
      ctx.stroke();

      ctx.font = 'bold 9px Orbitron, sans-serif';
      ctx.fillStyle = '#fbbf24';
      ctx.textAlign = 'center';
      ctx.fillText('ELITE', 0, -this.radius - 14);
      ctx.shadowBlur = 0;
      ctx.rotate(this.rotation + Math.PI / 2); // restore for health bar
    }

    // Health bar for damaged enemies
    if (this.hp < this.maxHp) {
      ctx.rotate(-(this.rotation + Math.PI / 2)); // un-rotate health bar so it stays horizontal
      const barW = this.radius * 2;
      const barH = 4;
      const barY = -this.radius - 8;
      const hpPct = Math.max(0, this.hp / this.maxHp);

      ctx.shadowBlur = 0;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(-barW / 2, barY, barW, barH);

      ctx.fillStyle = this.isElite ? '#fbbf24' : '#ff3344';
      ctx.fillRect(-barW / 2, barY, barW * hpPct, barH);
    }

    ctx.restore();
  }
}
