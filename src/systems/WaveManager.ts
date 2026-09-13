import type { Camera } from '../core/Camera';
import type { EnemyType, EnemyConfig, ActiveRunEvent, RunEventType } from '../types';
import { Enemy } from '../entities/Enemy';
import { Boss } from '../entities/Boss';
import { i18n } from '../i18n';
import { sounds } from '../audio/SoundManager';

export const ENEMY_CONFIGS: Record<EnemyType, EnemyConfig> = {
  swarmer: {
    type: 'swarmer',
    name: 'Mecha-Scuttler',
    radius: 13,
    speed: 135,
    maxHp: 22,
    damage: 10,
    color: '#ef4444',
    glowColor: 'rgba(239, 68, 68, 0.5)',
    xpValue: 1,
  },
  runner: {
    type: 'runner',
    name: 'Cyber-Stalker',
    radius: 15,
    speed: 165,
    maxHp: 38,
    damage: 14,
    color: '#f97316',
    glowColor: 'rgba(249, 115, 22, 0.5)',
    xpValue: 2,
  },
  spitter: {
    type: 'spitter',
    name: 'Plasma-Spitter',
    radius: 17,
    speed: 95,
    maxHp: 55,
    damage: 12,
    color: '#8b5cf6',
    glowColor: 'rgba(139, 92, 246, 0.5)',
    xpValue: 3,
    isRanged: true,
    shootCooldown: 2.8,
  },
  brute: {
    type: 'brute',
    name: 'Goliath-Smasher',
    radius: 28,
    speed: 68,
    maxHp: 240,
    damage: 28,
    color: '#e11d48',
    glowColor: 'rgba(225, 29, 72, 0.6)',
    xpValue: 8,
  },
  phantom: {
    type: 'phantom',
    name: 'Phase-Specter',
    radius: 16,
    speed: 150,
    maxHp: 48,
    damage: 18,
    color: '#06b6d4',
    glowColor: 'rgba(6, 182, 212, 0.7)',
    xpValue: 4,
  },
  kamikaze: {
    type: 'kamikaze',
    name: 'Volatile Drone',
    radius: 14,
    speed: 185,
    maxHp: 26,
    damage: 32,
    color: '#eab308',
    glowColor: 'rgba(234, 179, 8, 0.8)',
    xpValue: 3,
  },
  shielded: {
    type: 'shielded',
    name: 'Aegis Enforcer',
    radius: 20,
    speed: 85,
    maxHp: 110,
    damage: 16,
    color: '#0284c7',
    glowColor: 'rgba(2, 132, 199, 0.6)',
    xpValue: 5,
  },
  sniper: {
    type: 'sniper',
    name: 'Apex Rail-Drone',
    radius: 18,
    speed: 105,
    maxHp: 65,
    damage: 35,
    color: '#f43f5e',
    glowColor: 'rgba(244, 63, 94, 0.75)',
    xpValue: 6,
    isRanged: true,
    shootCooldown: 3.2,
  },
  tesla: {
    type: 'tesla',
    name: 'Volt Disruptor',
    radius: 19,
    speed: 125,
    maxHp: 85,
    damage: 24,
    color: '#38bdf8',
    glowColor: 'rgba(56, 189, 248, 0.85)',
    xpValue: 6,
  },
  boss: {
    type: 'boss',
    name: 'TITAN MECH OVERLORD',
    radius: 44,
    speed: 75,
    maxHp: 2400,
    damage: 32,
    color: '#ef4444',
    glowColor: 'rgba(239, 68, 68, 0.9)',
    xpValue: 80,
    isBoss: true,
  },
};

export class WaveManager {
  public gameTime: number = 0; // seconds
  private spawnTimer: number = 0;
  private currentSpawnInterval: number = 1.0;
  private lastBossSpawnTime: number = 0;
  public activeBoss: Boss | null = null;
  public bossCount: number = 0;
  public onAnnouncement?: (text: string) => void;

  // Dynamic In-Run Events
  public activeEvent: ActiveRunEvent | null = null;
  private lastEventTriggerTime: number = 0;
  public onEventTriggered?: (event: ActiveRunEvent) => void;
  public onEventEnded?: (event: ActiveRunEvent) => void;

  // Event hazard telegraphs
  public pendingMeteorTelegraphs: { x: number; y: number; timer: number; radius: number }[] = [];

  public update(dt: number, playerX: number, playerY: number, camera: Camera, enemies: Enemy[]) {
    this.gameTime += dt;
    this.spawnTimer -= dt;

    // Check if active boss died
    if (this.activeBoss && !this.activeBoss.isAlive) {
      this.activeBoss = null;
      sounds.playGameMusic();
      sounds.triggerHaptic('boss');
    }

    // Spawn rate speeds up as time advances
    this.currentSpawnInterval = Math.max(0.12, 0.85 - (this.gameTime / 300) * 0.7);

    // HP Scaling
    const hpScale = 1 + (this.gameTime / 60) * 0.14;

    // Horde Spawns
    if (this.spawnTimer <= 0 && enemies.length < 500) {
      this.spawnTimer = this.currentSpawnInterval;

      const batchSize = Math.min(4, 1 + Math.floor(this.gameTime / 75));
      const eliteChance = Math.min(0.20, 0.03 + (this.gameTime / 450) * 0.17);

      for (let i = 0; i < batchSize; i++) {
        const type = this.pickEnemyType();
        const pos = this.getRandomSpawnPosition(playerX, playerY, camera);
        const isElite = Math.random() < eliteChance;
        const cfg = { ...ENEMY_CONFIGS[type], isElite };
        enemies.push(new Enemy(pos.x, pos.y, cfg, hpScale));
      }
    }

    // Dynamic In-Run Events Handling
    this.updateDynamicEvents(dt, playerX, playerY, camera, enemies);

    // Boss Encounter Milestones: 1:45, 4:00, 6:30, 9:00...
    const bossInterval = 140;
    if (this.gameTime - this.lastBossSpawnTime >= bossInterval && (!this.activeBoss || !this.activeBoss.isAlive)) {
      this.lastBossSpawnTime = this.gameTime;
      this.bossCount++;
      this.spawnBoss(playerX, playerY, camera, enemies, hpScale);
    }
  }

  private updateDynamicEvents(dt: number, playerX: number, playerY: number, camera: Camera, enemies: Enemy[]) {
    // 1. Check for starting new events
    if (!this.activeEvent && !this.activeBoss) {
      if (this.gameTime >= 125 && this.lastEventTriggerTime < 120) {
        this.triggerEvent('meteor_shower', 24);
      } else if (this.gameTime >= 260 && this.lastEventTriggerTime < 250) {
        this.triggerEvent('gold_drone_swarm', 20);
      } else if (this.gameTime >= 410 && this.lastEventTriggerTime < 400) {
        this.triggerEvent('emp_storm', 22);
      } else if (this.gameTime - this.lastEventTriggerTime >= 180 && this.gameTime > 450) {
        const types: RunEventType[] = ['meteor_shower', 'gold_drone_swarm', 'emp_storm'];
        const chosen = types[Math.floor(Math.random() * types.length)];
        this.triggerEvent(chosen, 22);
      }
    }

    // 2. Process active event
    if (this.activeEvent) {
      this.activeEvent.elapsed += dt;
      this.activeEvent.intervalTimer -= dt;

      if (this.activeEvent.type === 'meteor_shower') {
        if (this.activeEvent.intervalTimer <= 0) {
          this.activeEvent.intervalTimer = 1.4;
          // Spawn 2 bombardment targets near player
          for (let k = 0; k < 2; k++) {
            const rx = playerX + (Math.random() - 0.5) * 460;
            const ry = playerY + (Math.random() - 0.5) * 460;
            this.pendingMeteorTelegraphs.push({
              x: rx,
              y: ry,
              timer: 1.1,
              radius: 65,
            });
          }
        }
      } else if (this.activeEvent.type === 'gold_drone_swarm') {
        if (this.activeEvent.intervalTimer <= 0) {
          this.activeEvent.intervalTimer = 0.9;
          const pos = this.getRandomSpawnPosition(playerX, playerY, camera);
          const goldDrone = new Enemy(
            pos.x,
            pos.y,
            {
              type: 'runner',
              name: 'Gold Infiltrator',
              radius: 14,
              speed: 180,
              maxHp: 30,
              damage: 0,
              color: '#fbbf24',
              glowColor: 'rgba(251, 191, 36, 0.95)',
              xpValue: 25,
            },
            1.0
          );
          enemies.push(goldDrone);
        }
      }

      if (this.activeEvent.elapsed >= this.activeEvent.duration) {
        const ended = this.activeEvent;
        this.activeEvent = null;
        if (this.onEventEnded) this.onEventEnded(ended);
      }
    }

    // 3. Process Meteor Telegraphs
    for (let i = this.pendingMeteorTelegraphs.length - 1; i >= 0; i--) {
      const tel = this.pendingMeteorTelegraphs[i];
      tel.timer -= dt;
    }
  }

  private triggerEvent(type: RunEventType, duration: number) {
    this.lastEventTriggerTime = this.gameTime;
    const t = i18n.t;
    const name = t[`event_${type}_title`] || type.toUpperCase();
    this.activeEvent = {
      type,
      name,
      duration,
      elapsed: 0,
      intervalTimer: 0,
    };
    sounds.playLevelUp();
    sounds.triggerHaptic('heavy');
    if (this.onEventTriggered) {
      this.onEventTriggered(this.activeEvent);
    }
  }

  private pickEnemyType(): EnemyType {
    const t = this.gameTime;

    if (t < 20) {
      return Math.random() < 0.55 ? 'swarmer' : 'runner';
    } else if (t < 50) {
      const r = Math.random();
      if (r < 0.30) return 'swarmer';
      if (r < 0.55) return 'runner';
      if (r < 0.75) return 'kamikaze';
      return 'spitter';
    } else if (t < 100) {
      const r = Math.random();
      if (r < 0.15) return 'swarmer';
      if (r < 0.35) return 'runner';
      if (r < 0.50) return 'kamikaze';
      if (r < 0.70) return 'spitter';
      if (r < 0.85) return 'shielded';
      return 'sniper';
    } else if (t < 180) {
      const r = Math.random();
      if (r < 0.12) return 'runner';
      if (r < 0.28) return 'spitter';
      if (r < 0.44) return 'shielded';
      if (r < 0.60) return 'brute';
      if (r < 0.74) return 'phantom';
      if (r < 0.88) return 'sniper';
      return 'tesla';
    } else {
      const r = Math.random();
      if (r < 0.12) return 'kamikaze';
      if (r < 0.26) return 'spitter';
      if (r < 0.42) return 'shielded';
      if (r < 0.58) return 'brute';
      if (r < 0.72) return 'phantom';
      if (r < 0.86) return 'sniper';
      return 'tesla';
    }
  }

  private spawnBoss(playerX: number, playerY: number, camera: Camera, enemies: Enemy[], hpScale: number) {
    const pos = this.getRandomSpawnPosition(playerX, playerY, camera);
    const isTierTwo = this.bossCount >= 2;

    const name = isTierTwo ? 'VOID REAPER' : 'TITAN MECH OVERLORD';
    const title = isTierTwo ? 'Shadow Sovereign' : 'Iron Colossus';

    const boss = new Boss(pos.x, pos.y, name, title, hpScale, isTierTwo);
    enemies.push(boss);
    this.activeBoss = boss;

    sounds.playBossMusic();
    sounds.triggerHaptic('boss');

    if (this.onAnnouncement) {
      const verb = i18n.lang === 'tr' ? 'BÖLGEYE GİRDİ!' : 'SPAWNED!';
      this.onAnnouncement(`⚠️ ${name} [${title}] ${verb} ⚠️`);
    }
  }

  private getRandomSpawnPosition(playerX: number, playerY: number, camera: Camera): { x: number; y: number } {
    const halfW = camera.width / 2 + 80;
    const halfH = camera.height / 2 + 80;
    const angle = Math.random() * Math.PI * 2;
    const dist = Math.max(halfW, halfH) + Math.random() * 100;

    return {
      x: playerX + Math.cos(angle) * dist,
      y: playerY + Math.sin(angle) * dist,
    };
  }
}
