import { Enemy } from './Enemy';
import { Projectile } from './Projectile';
import { Hazard } from './Hazard';
import type { EnemyConfig } from '../types';
import { sounds } from '../audio/SoundManager';
import type { ParticleSystem } from '../systems/ParticleSystem';
import type { Camera } from '../core/Camera';
import { PixelArtRenderer } from '../rendering/PixelArtRenderer';

export type BossSkillState =
  | 'CHASING'
  | 'SPIRAL_BARRAGE'
  | 'MISSILE_LOCK'
  | 'SEISMIC_SLAM'
  | 'LASER_SWEEP'
  | 'WARP_AMBUSH';

export class Boss extends Enemy {
  public bossTitle: string;
  public skillState: BossSkillState = 'CHASING';
  public skillTimer: number = 0;
  public attackCooldown: number = 3.5;
  public bossPhase: number = 1;

  // Attack-specific variables
  private spiralAngle: number = 0;
  private spiralWavesLeft: number = 0;
  private laserAngle: number = 0;
  private laserDuration: number = 0;
  private pendingTelegraphs: { x: number; y: number; timer: number; radius: number }[] = [];

  constructor(
    x: number,
    y: number,
    name: string,
    title: string,
    hpMultiplier: number = 1,
    isSecondTier: boolean = false
  ) {
    const config: EnemyConfig = {
      type: 'boss',
      name,
      radius: isSecondTier ? 50 : 44,
      speed: isSecondTier ? 90 : 75,
      maxHp: (isSecondTier ? 3600 : 2200) * hpMultiplier,
      damage: isSecondTier ? 42 : 32,
      color: isSecondTier ? '#9333ea' : '#ef4444',
      glowColor: isSecondTier ? 'rgba(147, 51, 234, 0.9)' : 'rgba(239, 68, 68, 0.9)',
      xpValue: isSecondTier ? 120 : 60,
      isBoss: true,
    };

    super(x, y, config, 1);
    this.bossTitle = title;
    this.attackCooldown = isSecondTier ? 2.8 : 3.5;
  }

  public updateBoss(
    dt: number,
    playerX: number,
    playerY: number,
    projectiles: Projectile[],
    hazards: Hazard[],
    particleSystem: ParticleSystem,
    camera: Camera
  ) {
    super.update(dt);

    // Update Boss Phase based on HP percentage
    const hpPct = this.hp / this.maxHp;
    if (hpPct < 0.35) {
      this.bossPhase = 3;
    } else if (hpPct < 0.70) {
      this.bossPhase = 2;
    }

    // Process pending telegraph missiles
    for (let i = this.pendingTelegraphs.length - 1; i >= 0; i--) {
      const tel = this.pendingTelegraphs[i];
      tel.timer -= dt;
      if (tel.timer <= 0) {
        // Detonate missile strike at telegraph location
        sounds.playNuke();
        camera.addShake(10);
        particleSystem.emit(tel.x, tel.y, 22, '#f97316', 160, 5, 0.4);
        particleSystem.emitRing(tel.x, tel.y, tel.radius, '#ef4444', 0.4);

        // Leave lingering fire hazard zone
        hazards.push(new Hazard(tel.x, tel.y, tel.radius * 0.75, 4.0, 16, 'fire_zone'));

        this.pendingTelegraphs.splice(i, 1);
      }
    }

    // State Machine
    this.skillTimer -= dt;

    if (this.skillState === 'CHASING') {
      const dx = playerX - this.x;
      const dy = playerY - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > 0.1) {
        this.x += (dx / dist) * this.speed * dt;
        this.y += (dy / dist) * this.speed * dt;
      }

      if (this.skillTimer <= 0) {
        this.selectNextAttack(playerX, playerY, hazards);
      }

    } else if (this.skillState === 'SPIRAL_BARRAGE') {
      // Rotate and spit bullet hell spirals
      this.spiralAngle += 4.5 * dt;
      this.skillTimer -= dt;

      if (this.skillTimer <= 0 && this.spiralWavesLeft > 0) {
        this.spiralWavesLeft--;
        this.skillTimer = 0.18; // wave interval
        this.fireSpiralWave(projectiles);
      } else if (this.spiralWavesLeft <= 0) {
        this.skillState = 'CHASING';
        this.skillTimer = this.attackCooldown;
      }

    } else if (this.skillState === 'MISSILE_LOCK') {
      // Locked charging posture, waiting for strikes
      if (this.skillTimer <= 0) {
        this.skillState = 'CHASING';
        this.skillTimer = this.attackCooldown;
      }

    } else if (this.skillState === 'SEISMIC_SLAM') {
      // Rush player and ground stomp
      const dx = playerX - this.x;
      const dy = playerY - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist > 40) {
        this.x += (dx / dist) * (this.speed * 3.8) * dt;
        this.y += (dy / dist) * (this.speed * 3.8) * dt;
        particleSystem.emit(this.x, this.y, 3, '#ef4444', 40, 6, 0.2);
      }

      if (this.skillTimer <= 0) {
        // Slam!
        sounds.playNuke();
        camera.addShake(18);
        particleSystem.emitRing(this.x, this.y, 180, '#ef4444', 0.5);

        // Spawn ring of 12 shockwave projectiles
        for (let a = 0; a < Math.PI * 2; a += Math.PI / 6) {
          projectiles.push(
            new Projectile({
              x: this.x,
              y: this.y,
              vx: Math.cos(a) * 220,
              vy: Math.sin(a) * 220,
              radius: 8,
              damage: 22,
              life: 2.2,
              isPlayer: false,
              color: '#f97316',
              glowColor: 'rgba(249, 115, 22, 0.8)',
            })
          );
        }

        this.skillState = 'CHASING';
        this.skillTimer = this.attackCooldown;
      }

    } else if (this.skillState === 'LASER_SWEEP') {
      // Sweeping death beam
      this.laserAngle += 2.2 * dt;
      this.laserDuration -= dt;

      // Emit energy beam particles along the line
      const beamLength = 450;
      const endX = this.x + Math.cos(this.laserAngle) * beamLength;
      const endY = this.y + Math.sin(this.laserAngle) * beamLength;

      for (let s = 0.2; s <= 1.0; s += 0.2) {
        const px = this.x + (endX - this.x) * s;
        const py = this.y + (endY - this.y) * s;
        particleSystem.emit(px, py, 1, '#c084fc', 20, 4, 0.15);
      }

      // Check if player intersects beam
      const vX = endX - this.x;
      const vY = endY - this.y;
      const pX = playerX - this.x;
      const pY = playerY - this.y;
      const t = Math.max(0, Math.min(1, (pX * vX + pY * vY) / (beamLength * beamLength)));
      const closestX = this.x + t * vX;
      const closestY = this.y + t * vY;
      const distToBeam = Math.hypot(playerX - closestX, playerY - closestY);

      if (distToBeam < 28) {
        // Player takes beam damage
        projectiles.push(
          new Projectile({
            x: closestX,
            y: closestY,
            vx: 0,
            vy: 0,
            radius: 12,
            damage: 25,
            life: 0.05,
            isPlayer: false,
            color: '#c084fc',
          })
        );
      }

      if (this.laserDuration <= 0) {
        this.skillState = 'CHASING';
        this.skillTimer = this.attackCooldown;
      }
    }
  }

  private selectNextAttack(playerX: number, playerY: number, hazards: Hazard[]) {
    const attacks: BossSkillState[] = ['SPIRAL_BARRAGE', 'MISSILE_LOCK', 'SEISMIC_SLAM'];
    if (this.bossPhase >= 2) {
      attacks.push('LASER_SWEEP');
    }

    const next = attacks[Math.floor(Math.random() * attacks.length)];
    this.skillState = next;

    if (next === 'SPIRAL_BARRAGE') {
      this.spiralWavesLeft = 4 + this.bossPhase * 2;
      this.skillTimer = 0.05;
      sounds.playFocus();

    } else if (next === 'MISSILE_LOCK') {
      sounds.playFocus();
      this.skillTimer = 1.6;

      // Place 3 to 5 telegraphed target zones around the player
      const count = 3 + this.bossPhase;
      for (let i = 0; i < count; i++) {
        const offsetDist = Math.random() * 120;
        const offsetAngle = Math.random() * Math.PI * 2;
        const tx = playerX + Math.cos(offsetAngle) * offsetDist;
        const ty = playerY + Math.sin(offsetAngle) * offsetDist;
        const targetRadius = 45;

        // Visual telegraph ground hazard
        hazards.push(new Hazard(tx, ty, targetRadius, 1.2, 0, 'boss_telegraph', true));
        this.pendingTelegraphs.push({ x: tx, y: ty, timer: 1.2, radius: targetRadius });
      }

    } else if (next === 'SEISMIC_SLAM') {
      this.skillTimer = 0.9;
      sounds.playDash();

    } else if (next === 'LASER_SWEEP') {
      this.laserAngle = Math.atan2(playerY - this.y, playerX - this.x) - 1.2;
      this.laserDuration = 2.0;
      this.skillTimer = 2.0;
      sounds.playBlast();
    }
  }

  private fireSpiralWave(projectiles: Projectile[]) {
    sounds.playShoot();
    const count = 8 + this.bossPhase * 2;
    const speed = 190 + this.bossPhase * 20;

    for (let i = 0; i < count; i++) {
      const a = this.spiralAngle + (i * Math.PI * 2) / count;
      projectiles.push(
        new Projectile({
          x: this.x,
          y: this.y,
          vx: Math.cos(a) * speed,
          vy: Math.sin(a) * speed,
          radius: 7,
          damage: 18,
          life: 3.2,
          isPlayer: false,
          color: this.config.color,
          glowColor: this.config.glowColor,
        })
      );
    }
  }

  public render(ctx: CanvasRenderingContext2D, screenX: number, screenY: number): void {
    ctx.save();
    ctx.translate(screenX, screenY);

    const isFlashing = this.hitFlashTimer > 0;
    const pulse = Math.sin(Date.now() * 0.006) * 3;

    // Laser charging indicator or phase wings
    if (this.skillState === 'LASER_SWEEP') {
      ctx.strokeStyle = '#c084fc';
      ctx.lineWidth = 5;
      ctx.shadowColor = '#c084fc';
      ctx.shadowBlur = 16;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(this.laserAngle) * 450, Math.sin(this.laserAngle) * 450);
      ctx.stroke();
    }

    // Directional top-down rotation
    ctx.rotate(this.rotation + Math.PI / 2);

    // High-Fidelity 96x96 Top-Down Pixel Art Boss
    const animFrame = Math.floor(this.animTimer * 6);
    const sprite = PixelArtRenderer.getBossSprite(animFrame, this.bossPhase);
    const scale = (this.radius * 2.2) / sprite.width;

    ctx.drawImage(
      sprite,
      -(sprite.width * scale) / 2,
      -(sprite.height * scale) / 2,
      sprite.width * scale,
      sprite.height * scale
    );

    // Hit flash
    if (isFlashing) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.beginPath();
      ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
      ctx.fill();
    }

    // Reactive Shield Barrier Pulse in Phase 2
    if (this.bossPhase >= 2) {
      ctx.strokeStyle = '#ff0055';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = '#ff0055';
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.arc(0, 0, this.radius + 12 + pulse, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();
  }
}
