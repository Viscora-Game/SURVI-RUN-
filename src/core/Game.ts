import { Camera } from './Camera';
import { InputManager } from './InputManager';
import { SpatialGrid } from './SpatialGrid';
import { MapManager, type SectorId } from './MapManager';
import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import { Boss } from '../entities/Boss';
import { Projectile } from '../entities/Projectile';
import { Drop } from '../entities/Drop';
import { Hazard } from '../entities/Hazard';
import { Weapon, createWeapon } from '../weapons/Weapon';
import { WaveManager } from '../systems/WaveManager';
import { UpgradeManager } from '../systems/UpgradeManager';
import { ParticleSystem } from '../systems/ParticleSystem';
import { FloatingTextManager } from '../systems/FloatingText';
import { UIManager } from '../ui/UIManager';
import { sounds } from '../audio/SoundManager';
import { i18n } from '../i18n';
import { skillTree } from '../systems/SkillTree';
import { SHIP_CONFIGS } from '../entities/ShipConfig';
import { achievementManager } from '../systems/AchievementManager';
import type { DropType, ShipId, AnyWeaponId, WeaponDamageStats } from '../types';

export type GameState = 'START' | 'PLAYING' | 'LEVEL_UP' | 'CHEST' | 'PAUSED' | 'GAME_OVER';

export class Game {
  public canvas: HTMLCanvasElement;
  public ctx: CanvasRenderingContext2D;
  public camera: Camera;
  public input: InputManager;
  public mapManager: MapManager;
  public state: GameState = 'START';

  public selectedShip: ShipId = 'vanguard';
  public weaponDamageStats: Map<AnyWeaponId, WeaponDamageStats> = new Map();

  public player: Player;
  public enemies: Enemy[] = [];
  public projectiles: Projectile[] = [];
  public drops: Drop[] = [];
  public activeWeapons: Weapon[] = [];

  public spatialGrid: SpatialGrid<Enemy>;
  public waveManager: WaveManager;
  public upgradeManager: UpgradeManager;
  public particleSystem: ParticleSystem;
  public floatingText: FloatingTextManager;
  public ui: UIManager;

  public runShardsEarned: number = 0;
  private survivalShardTimer: number = 0;

  private lastTime: number = 0;
  private isRunning: boolean = false;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext('2d', { alpha: false });
    if (!context) throw new Error('Could not get 2D context');
    this.ctx = context;

    this.camera = new Camera(window.innerWidth, window.innerHeight);
    this.input = new InputManager();
    this.mapManager = new MapManager();
    this.spatialGrid = new SpatialGrid<Enemy>(120);
    this.waveManager = new WaveManager();
    this.upgradeManager = new UpgradeManager();
    this.particleSystem = new ParticleSystem();
    this.floatingText = new FloatingTextManager();
    this.ui = new UIManager();

    const savedShip = (localStorage.getItem('survi_run_selected_ship') as ShipId) || 'vanguard';
    this.selectedShip = SHIP_CONFIGS[savedShip] ? savedShip : 'vanguard';

    this.player = new Player(0, 0, this.selectedShip);
    skillTree.applyToPlayer(this.player);
    this.player.onEmergencyShieldTrigger = () => {
      sounds.playNuke();
      this.camera.addShake(16);
      this.particleSystem.emitRing(this.player.x, this.player.y, 90, '#00ffff', 0.8);
      this.ui.showAnnouncement(i18n.t.shieldReviveAlert);
    };

    // Initial weapon from selected ship
    const startWeapon = createWeapon(SHIP_CONFIGS[this.selectedShip].startingWeapon);
    this.activeWeapons.push(startWeapon);

    // Wire Achievement Toast notification
    achievementManager.onAchievementUnlocked = (ach) => {
      const t = i18n.t as unknown as Record<string, string>;
      const achTitle = t[ach.titleKey] || ach.id;
      this.ui.showAchievementToast(ach.icon, achTitle);
    };

    // Wire WaveManager dynamic events announcement
    this.waveManager.onEventTriggered = (event) => {
      const t = i18n.t as unknown as Record<string, string>;
      const title = t[`event_${event.type}_title`] || event.name;
      const desc = t[`event_${event.type}_desc`] || '';
      this.ui.showAnnouncement(`[${title}]\n${desc}`);
      this.camera.addShake(14);
    };

    this.setupEvents();
    this.resize();
  }

  public recordWeaponDamage(sourceId: AnyWeaponId | undefined, damage: number, isKill: boolean = false) {
    if (!sourceId) return;
    let stat = this.weaponDamageStats.get(sourceId);
    if (!stat) {
      const t = i18n.t as unknown as Record<string, string>;
      const wName = t[sourceId + '_name'] || sourceId;
      stat = { id: sourceId, name: wName, totalDamage: 0, hits: 0, kills: 0 };
      this.weaponDamageStats.set(sourceId, stat);
    }
    stat.totalDamage += damage;
    stat.hits++;
    if (isKill) stat.kills++;
  }

  private setupEvents() {
    window.addEventListener('resize', () => this.resize());

    // Boss announcement hook
    this.waveManager.onAnnouncement = (text) => {
      this.ui.showAnnouncement(text);
      this.camera.addShake(12);
    };

    // Pause button on HUD
    const pauseBtn = document.getElementById('pause-btn');
    if (pauseBtn) {
      pauseBtn.onclick = () => this.togglePause();
    }

    // Touch Dash button
    const touchDash = document.getElementById('touch-dash-btn');
    if (touchDash) {
      touchDash.addEventListener('touchstart', (e) => {
        e.preventDefault();
        if (this.player.dash()) {
          achievementManager.reportDash();
        }
      });
    }
  }

  public resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.camera.resize(window.innerWidth, window.innerHeight);
  }

  public start() {
    this.isPlayerDying = false;
    this.isGameOverTriggered = false;
    this.isRunning = true;
    this.state = 'PLAYING';
    this.ui.setHUDVisible(true);
    sounds.playGameMusic();
    this.lastTime = performance.now();
    requestAnimationFrame((t) => this.loop(t));
  }

  private loop(currentTime: number) {
    if (!this.isRunning) return;

    let dt = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;

    if (dt > 0.1) dt = 0.1;

    try {
      if (this.input.consumePause()) {
        this.togglePause();
      }

      if (this.state === 'PLAYING') {
        this.update(dt);
      }

      this.render();
    } catch (err) {
      console.error('Game loop error:', err);
    }

    requestAnimationFrame((t) => this.loop(t));
  }

  public onReturnToMenu?: () => void;

  private togglePause() {
    if (this.state === 'PLAYING') {
      this.state = 'PAUSED';
      sounds.pauseMusic();
      this.ui.showPause(
        true,
        () => this.resumeGame(),
        () => this.restartGame(),
        () => this.returnToMainMenu()
      );
    } else if (this.state === 'PAUSED') {
      this.resumeGame();
    }
  }

  private resumeGame() {
    this.state = 'PLAYING';
    sounds.resumeMusic();
    this.ui.showPause(false, () => {}, () => {});
    this.lastTime = performance.now();
  }

  public returnToMainMenu() {
    this.isPlayerDying = false;
    this.isGameOverTriggered = false;
    this.isRunning = false;
    this.state = 'START';
    this.ui.setHUDVisible(false);
    this.ctx.fillStyle = '#03050a';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    sounds.playGem();
    sounds.playMenuMusic();

    const savedShip = (localStorage.getItem('survi_run_selected_ship') as ShipId) || 'vanguard';
    this.selectedShip = SHIP_CONFIGS[savedShip] ? savedShip : 'vanguard';
    this.player = new Player(0, 0, this.selectedShip);
    skillTree.applyToPlayer(this.player);
    this.player.onEmergencyShieldTrigger = () => {
      sounds.playNuke();
      this.camera.addShake(16);
      this.particleSystem.emitRing(this.player.x, this.player.y, 90, '#00ffff', 0.8);
      this.ui.showAnnouncement(i18n.t.shieldReviveAlert);
    };
    this.runShardsEarned = 0;
    this.survivalShardTimer = 0;
    this.weaponDamageStats.clear();
    this.enemies = [];
    this.projectiles = [];
    this.drops = [];
    this.activeWeapons = [createWeapon(SHIP_CONFIGS[this.selectedShip].startingWeapon)];
    this.waveManager = new WaveManager();
    this.waveManager.onAnnouncement = (text) => {
      this.ui.showAnnouncement(text);
      this.camera.addShake(12);
    };
    this.waveManager.onEventTriggered = (event) => {
      const t = i18n.t as unknown as Record<string, string>;
      const title = t[`event_${event.type}_title`] || event.name;
      const desc = t[`event_${event.type}_desc`] || '';
      this.ui.showAnnouncement(`[${title}]\n${desc}`);
      this.camera.addShake(14);
    };
    this.mapManager = new MapManager('neo_kyoto');
    this.particleSystem.clear();
    this.floatingText.clear();

    this.ui.showPause(false, () => {}, () => {});
    const goModal = document.getElementById('game-over-modal');
    if (goModal) goModal.classList.add('hidden');
    const upModal = document.getElementById('modal-backdrop');
    if (upModal) upModal.classList.add('hidden');

    if (this.onReturnToMenu) {
      this.onReturnToMenu();
    }
  }

  public restartGame() {
    this.isPlayerDying = false;
    this.isGameOverTriggered = false;
    sounds.playGameMusic();

    const savedShip = (localStorage.getItem('survi_run_selected_ship') as ShipId) || 'vanguard';
    this.selectedShip = SHIP_CONFIGS[savedShip] ? savedShip : 'vanguard';
    this.player = new Player(0, 0, this.selectedShip);
    skillTree.applyToPlayer(this.player);
    this.player.onEmergencyShieldTrigger = () => {
      sounds.playNuke();
      this.camera.addShake(16);
      this.particleSystem.emitRing(this.player.x, this.player.y, 90, '#00ffff', 0.8);
      this.ui.showAnnouncement(i18n.t.shieldReviveAlert);
    };
    this.runShardsEarned = 0;
    this.survivalShardTimer = 0;
    this.weaponDamageStats.clear();
    this.enemies = [];
    this.projectiles = [];
    this.drops = [];
    this.activeWeapons = [createWeapon(SHIP_CONFIGS[this.selectedShip].startingWeapon)];
    this.waveManager = new WaveManager();
    this.mapManager = new MapManager('neo_kyoto');
    this.particleSystem.clear();
    this.floatingText.clear();

    this.waveManager.onAnnouncement = (text) => {
      this.ui.showAnnouncement(text);
      this.camera.addShake(12);
    };
    this.waveManager.onEventTriggered = (event) => {
      const t = i18n.t as unknown as Record<string, string>;
      const title = t[`event_${event.type}_title`] || event.name;
      const desc = t[`event_${event.type}_desc`] || '';
      this.ui.showAnnouncement(`[${title}]\n${desc}`);
      this.camera.addShake(14);
    };

    this.state = 'PLAYING';
    this.lastTime = performance.now();
  }

  private update(dt: number) {
    sounds.update(dt);

    // If player is in dying sequence, only update visual systems and camera
    if (this.isPlayerDying) {
      this.particleSystem.update(dt);
      this.floatingText.update(dt);
      this.camera.follow(this.player.x, this.player.y, dt);
      return;
    }

    this.input.update();

    if (this.input.isDashPressed) {
      if (this.player.dash()) {
        achievementManager.reportDash();

        // Dash Fire Trail
        if (this.player.dashFireTrail) {
          this.mapManager.hazards.push(
            new Hazard(this.player.x, this.player.y, 36, 3.0, 18, 'fire_zone', false)
          );
        }

        // Dash EMP Stun
        if (this.player.dashStunEnemies) {
          const nearby = this.spatialGrid.query(this.player.x, this.player.y, 85);
          for (const ne of nearby) if (ne.isAlive) ne.applyStun(1.2);
          this.particleSystem.emitRing(this.player.x, this.player.y, 85, '#38bdf8', 0.3);
        }

        // Dash Sonic Boom Knockback
        if (this.player.dashSonicBoom) {
          const nearby = this.spatialGrid.query(this.player.x, this.player.y, 110);
          for (const ne of nearby) {
            if (ne.isAlive) {
              const kx = (ne.x - this.player.x) * 2.8;
              const ky = (ne.y - this.player.y) * 2.8;
              const died = ne.takeDamage(35, kx, ky);
              if (died) this.onEnemyKilled(ne);
            }
          }
          this.particleSystem.emitRing(this.player.x, this.player.y, 110, '#e2e8f0', 0.3);
        }
      }
      this.input.isDashPressed = false;
    }

    // 1. Update Player & clamp to arena
    this.player.updatePlayer(
      dt,
      this.input.moveVector.x,
      this.input.moveVector.y,
      this.particleSystem
    );
    this.mapManager.clampToArena(this.player);

    // Survival shard bonus (+2 every 10 seconds survived, multiplied by sector bonus)
    this.survivalShardTimer += dt;
    if (this.survivalShardTimer >= 10) {
      this.survivalShardTimer -= 10;
      this.runShardsEarned += Math.max(1, Math.round(2 * this.mapManager.currentSector.shardMult));
    }

    // 2. Obstacle / Pylon collision with Player (kiting support)
    for (const obj of this.mapManager.destructibles) {
      if (obj.type === 'energy_pylon') {
        const dx = this.player.x - obj.x;
        const dy = this.player.y - obj.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const minDist = this.player.radius + obj.radius;
        if (dist < minDist && dist > 0.01) {
          const push = minDist - dist;
          this.player.x += (dx / dist) * push;
          this.player.y += (dy / dist) * push;
        }
      }
    }

    // 3. Update Map (dust, hazards, destructibles)
    this.mapManager.update(dt);

    // 4. Check Player collision with Hazards (Acid puddles, Fire zones)
    for (const h of this.mapManager.hazards) {
      if (!h.isTelegraph && h.isAlive && this.player.collidesWith(h)) {
        if (h.canTick()) {
          const hit = this.player.takeDamage(h.damage, true, false);
          if (hit.tookDamage) {
            this.camera.addShake(4);
            this.floatingText.spawn(this.player.x, this.player.y, `-${hit.actualDamage}`, '#10b981', false, 14);
            if (hit.died) {
              this.onPlayerDeath();
              return;
            }
          }
        }
      }
    }

    // 5. Populate Spatial Grid with alive enemies
    this.spatialGrid.clear();
    for (let i = 0; i < this.enemies.length; i++) {
      if (this.enemies[i].isAlive) {
        this.spatialGrid.insert(this.enemies[i]);
      }
    }

    // Chronos & Zenith Slowing Auras
    if (this.player.shipId === 'chronos' && this.player.stationaryTime > 0.4) {
      const nearby = this.spatialGrid.query(this.player.x, this.player.y, 115);
      for (const e of nearby) if (e.isAlive) e.applySlow(0.3, 0.75);
    }
    if (this.player.stats.isFocused && this.player.focusAuraSlow) {
      const nearby = this.spatialGrid.query(this.player.x, this.player.y, 145);
      for (const e of nearby) if (e.isAlive) e.applySlow(0.3, 0.60);
    }

    // Sprint Static Electricity Arc
    if (this.player.sprintStaticDischarge && this.player.sprintStaticTimer >= 3.0) {
      this.player.sprintStaticTimer = 0;
      const target = this.enemies.find(e => e.isAlive && Math.hypot(e.x - this.player.x, e.y - this.player.y) < 220);
      if (target) {
        sounds.playHit();
        const died = target.takeDamage(65);
        this.particleSystem.emit(target.x, target.y, 8, '#00ffff', 120, 3, 0.3, 'line');
        this.floatingText.spawn(target.x, target.y - 15, '65', '#00ffff', true, 14);
        if (died) this.onEnemyKilled(target);
      }
    }

    // Auto Vacuum Pulse
    if (this.player.autoVacuumInterval > 0 && this.player.autoVacuumTimer >= this.player.autoVacuumInterval) {
      this.player.autoVacuumTimer = 0;
      sounds.playChest();
      this.floatingText.spawn(this.player.x, this.player.y - 25, 'VACUUM PULSE!', '#00e5ff', true, 16);
      this.particleSystem.emitRing(this.player.x, this.player.y, 250, '#00e5ff', 0.6);
      for (const drop of this.drops) {
        drop.isAttracted = true;
      }
    }

    // 6. Update Weapons
    for (let i = 0; i < this.activeWeapons.length; i++) {
      this.activeWeapons[i].update({
        player: this.player,
        enemies: this.enemies,
        projectiles: this.projectiles,
        particleSystem: this.particleSystem,
        dt,
        onDirectDamage: (weaponId, damage, isKill) => {
          this.recordWeaponDamage(weaponId, damage, isKill);
        },
      });
    }

    // Process Meteor Shower Detonations
    for (let i = this.waveManager.pendingMeteorTelegraphs.length - 1; i >= 0; i--) {
      const m = this.waveManager.pendingMeteorTelegraphs[i];
      if (m.timer <= 0) {
        this.waveManager.pendingMeteorTelegraphs.splice(i, 1);
        sounds.playNuke();
        this.camera.addShake(12);
        this.particleSystem.emitRing(m.x, m.y, m.radius, '#f97316', 0.5);
        this.particleSystem.emit(m.x, m.y, 25, '#f97316', 180, 5, 0.4);

        // Damage player if inside blast radius
        const distToPlayer = Math.hypot(this.player.x - m.x, this.player.y - m.y);
        if (distToPlayer <= m.radius + this.player.radius) {
          const hit = this.player.takeDamage(25);
          if (hit.tookDamage) {
            this.camera.addShake(8);
            this.floatingText.spawn(this.player.x, this.player.y, `-${hit.actualDamage}`, '#ef4444', true, 16);
            if (hit.died) {
              this.onPlayerDeath();
              return;
            }
          }
        }

        // Damage nearby enemies
        const nearby = this.spatialGrid.query(m.x, m.y, m.radius);
        for (const e of nearby) {
          if (e.isAlive) {
            const died = e.takeDamage(120, (e.x - m.x) * 2, (e.y - m.y) * 2);
            if (died) this.onEnemyKilled(e);
          }
        }
      }
    }

    // 7. Update Waves & Horde
    this.waveManager.update(dt, this.player.x, this.player.y, this.camera, this.enemies);
    this.checkSectorProgression();

    // 8. Update Enemies and AI
    for (let i = 0; i < this.enemies.length; i++) {
      const enemy = this.enemies[i];
      if (!enemy.isAlive) continue;

      if (enemy instanceof Boss) {
        enemy.updateBoss(
          dt,
          this.player.x,
          this.player.y,
          this.projectiles,
          this.mapManager.hazards,
          this.particleSystem,
          this.camera
        );
      } else {
        const aiResult = enemy.updateAI(
          dt,
          this.player.x,
          this.player.y,
          this.projectiles,
          this.mapManager.hazards,
          this.particleSystem,
          this.camera
        );

        // Check kamikaze blast
        if (aiResult.exploded) {
          const distToPlayer = Math.hypot(this.player.x - enemy.x, this.player.y - enemy.y);
          if (distToPlayer <= (aiResult.explosionRadius ?? 100)) {
            const hit = this.player.takeDamage(aiResult.explosionDamage ?? 30);
            if (hit.tookDamage) {
              this.camera.addShake(12);
              this.floatingText.spawn(this.player.x, this.player.y, `-${hit.actualDamage}`, '#ef4444', true, 18);
              if (hit.died) {
                this.onPlayerDeath();
                return;
              }
            }
          }

          // Damage other nearby enemies too!
          const nearbyEnemies = this.spatialGrid.query(enemy.x, enemy.y, aiResult.explosionRadius ?? 100);
          for (const e of nearbyEnemies) {
            if (e.isAlive && e.id !== enemy.id) {
              const died = e.takeDamage(aiResult.explosionDamage ?? 30, (e.x - enemy.x) * 2, (e.y - enemy.y) * 2);
              if (died) this.onEnemyKilled(e);
            }
          }
        }
      }

      // Check direct collision with Player
      if (enemy.isAlive && this.player.collidesWith(enemy)) {
        const hit = this.player.takeDamage(enemy.damage);
        if (hit.tookDamage) {
          this.camera.addShake(7);
          this.particleSystem.emit(this.player.x, this.player.y, 8, '#ff3366', 120, 4, 0.3);
          this.floatingText.spawn(this.player.x, this.player.y, `-${hit.actualDamage}`, '#ff3366', false, 16);

          if (hit.died) {
            this.onPlayerDeath();
            return;
          }
        }
      }
    }

    // 9. Update Projectiles & Collisions (with enemies and destructibles)
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      p.update(dt);

      if (!p.isAlive) {
        this.projectiles.splice(i, 1);
        continue;
      }

      if (p.isPlayer) {
        // A. Collide with Destructibles (Crates, Barrels, Pylons)
        for (let dIdx = 0; dIdx < this.mapManager.destructibles.length; dIdx++) {
          const dest = this.mapManager.destructibles[dIdx];
          if (!dest.isAlive) continue;

          const dx = dest.x - p.x;
          const dy = dest.y - p.y;
          const r = p.radius + dest.radius;

          if (dx * dx + dy * dy <= r * r) {
            p.isAlive = false;

            const res = dest.takeDamage(p.damage, this.particleSystem, this.camera);
            if (res.drops.length > 0) {
              this.drops.push(...res.drops);
              this.runShardsEarned += 3;
              this.floatingText.spawn(dest.x, dest.y, '+3', '#00e5ff', false, 14);
            }

            // Barrel explosion damage to enemies
            if (res.explosionDamage) {
              const nearby = this.spatialGrid.query(res.explosionDamage.x, res.explosionDamage.y, res.explosionDamage.radius);
              for (const e of nearby) {
                if (e.isAlive) {
                  const died = e.takeDamage(res.explosionDamage.damage, (e.x - dest.x) * 3, (e.y - dest.y) * 3);
                  if (died) this.onEnemyKilled(e);
                }
              }
            }

            this.particleSystem.emit(p.x, p.y, 5, p.color, 60, 3, 0.2);
            break;
          }
        }

        if (!p.isAlive) {
          this.projectiles.splice(i, 1);
          continue;
        }

        // B. Collide with Enemies
        const nearby = this.spatialGrid.query(p.x, p.y, p.radius + 15);
        for (let j = 0; j < nearby.length; j++) {
          const enemy = nearby[j];
          if (!enemy.isAlive || p.hitEntityIds.has(enemy.id)) continue;

          const dx = enemy.x - p.x;
          const dy = enemy.y - p.y;
          const r = p.radius + enemy.radius;

          if (dx * dx + dy * dy <= r * r) {
            p.hitEntityIds.add(enemy.id);
            p.pierce--;

            const kbDist = Math.sqrt(dx * dx + dy * dy) || 1;
            const kbX = (dx / kbDist) * p.knockback;
            const kbY = (dy / kbDist) * p.knockback;

            const enemyDied = enemy.takeDamage(p.damage, kbX, kbY, p.x, p.y);
            sounds.playHit();
            this.recordWeaponDamage(p.sourceWeaponId, p.damage, enemyDied);

            this.floatingText.spawn(
              enemy.x,
              enemy.y,
              `${p.damage}`,
              p.isCrit ? '#ffdd00' : '#ffffff',
              p.isCrit,
              14
            );

            this.particleSystem.emit(p.x, p.y, 4, p.color, 80, 3, 0.2);

            if (enemyDied) {
              this.onEnemyKilled(enemy);
            }

            if (p.pierce <= 0) {
              p.isAlive = false;
              this.projectiles.splice(i, 1);
              break;
            }
          }
        }
      } else {
        // Enemy projectile hits player
        const dx = this.player.x - p.x;
        const dy = this.player.y - p.y;
        const r = p.radius + this.player.radius;

        if (dx * dx + dy * dy <= r * r) {
          p.isAlive = false;
          this.projectiles.splice(i, 1);

          const hit = this.player.takeDamage(p.damage);
          if (hit.tookDamage) {
            this.camera.addShake(8);
            this.particleSystem.emit(this.player.x, this.player.y, 6, '#ff0055', 100, 3, 0.3);
            this.floatingText.spawn(this.player.x, this.player.y, `-${hit.actualDamage}`, '#ff0055', false, 16);

            if (hit.died) {
              this.onPlayerDeath();
              return;
            }
          }
        }
      }
    }

    // 10. Update Drops & Magnet attraction
    for (let i = this.drops.length - 1; i >= 0; i--) {
      const drop = this.drops[i];
      drop.update(dt);

      const dx = this.player.x - drop.x;
      const dy = this.player.y - drop.y;
      const distSq = dx * dx + dy * dy;
      const magnetRadius = this.player.stats.pickupRadius;

      if (distSq <= magnetRadius * magnetRadius || drop.isAttracted) {
        drop.attractTowards(this.player.x, this.player.y, dt);
      }

      const collectR = this.player.radius + drop.radius;
      if (distSq <= collectR * collectR) {
        this.collectDrop(drop);
        this.drops.splice(i, 1);
      }
    }

    // 11. Clean dead enemies
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      if (!this.enemies[i].isAlive) {
        this.enemies.splice(i, 1);
      }
    }

    // 12. Systems update
    this.particleSystem.update(dt);
    this.floatingText.update(dt);
    this.camera.follow(this.player.x, this.player.y, dt);

    // 13. Update HUD & Boss Bar
    this.ui.updateHUD(this.player, this.waveManager.gameTime, this.activeWeapons);
    this.ui.updateBossHUD(this.waveManager.activeBoss);
  }

  private onEnemyKilled(enemy: Enemy) {
    this.player.totalKills++;
    achievementManager.reportKill(enemy.isElite, enemy.isBoss);
    sounds.playEnemyDeath();

    let shardGain = 1;
    if (enemy.isBoss) shardGain = 50;
    else if (enemy.isElite) shardGain = 8;
    else if (enemy.config.type === 'brute') shardGain = 5;
    else if (enemy.config.type === 'spitter' || enemy.config.type === 'sniper' || enemy.config.type === 'tesla') shardGain = 2;
    this.runShardsEarned += Math.max(1, Math.round(shardGain * this.mapManager.currentSector.shardMult));

    const particleCount = enemy.isBoss ? 35 : (enemy.isElite ? 22 : (enemy.config.type === 'brute' ? 18 : 8));
    this.particleSystem.emit(enemy.x, enemy.y, particleCount, enemy.isElite ? '#fbbf24' : enemy.config.color, 140, 5, 0.4);

    if (enemy.isElite) {
      this.particleSystem.emitRing(enemy.x, enemy.y, 65, '#fbbf24', 0.45);
      this.camera.addShake(7);
      const tag = i18n.lang === 'tr' ? 'ELİT İMHA EDİLDİ!' : 'ELITE DESTROYED!';
      this.floatingText.spawn(enemy.x, enemy.y - 20, tag, '#fbbf24', true, 16);
    }

    if (Math.random() < this.player.stats.lifeSteal) {
      this.player.heal(2);
      this.floatingText.spawn(this.player.x, this.player.y, '+2 HP', '#00ff88', false, 14);
    }

    // Technomancer EMP pulse on 15 kills
    if (this.player.shipId === 'technomancer') {
      this.player.killsSinceLastEmp++;
      if (this.player.killsSinceLastEmp >= 15) {
        this.player.killsSinceLastEmp = 0;
        sounds.playNuke();
        this.camera.addShake(10);
        this.particleSystem.emitRing(this.player.x, this.player.y, 220, '#10b981', 0.5);
        this.floatingText.spawn(this.player.x, this.player.y - 30, 'EMP OVERLOAD!', '#10b981', true, 18);
        for (const e of this.enemies) {
          if (e.isAlive) {
            e.applyStun(1.5);
            const died = e.takeDamage(75);
            if (died) this.onEnemyKilled(e);
          }
        }
      }
    }

    // Warfare Overdrive on kill
    if (this.player.overdriveRank > 0) {
      this.player.overdriveTimer = 3.0;
    }

    // Mobile Blitzkrieg Perpetual Engine: reset dash if moving
    const isMoving = Math.abs(this.input.moveVector.x) > 0.01 || Math.abs(this.input.moveVector.y) > 0.01;
    if (this.player.sprintKillResetDash && isMoving) {
      this.player.stats.dashTimer = 0;
    }

    // Tachyon Rift: 3s unlimited dash on elite/boss kill
    if (this.player.eliteKillUnlimitedDash && (enemy.isElite || enemy.isBoss)) {
      this.player.unlimitedDashTimer = 3.0;
      this.floatingText.spawn(this.player.x, this.player.y - 25, 'TACHYON RIFT!', '#00f0ff', true, 16);
    }

    // Tycoon Bounty
    if (this.player.eliteBonusShards > 0 && enemy.isElite) {
      this.runShardsEarned += this.player.eliteBonusShards;
      this.floatingText.spawn(enemy.x, enemy.y - 35, `+${this.player.eliteBonusShards} BOUNTY`, '#fbbf24', true, 16);
    }

    // Shard duplication chance
    if (this.player.shardDuplicationChance > 0 && Math.random() < this.player.shardDuplicationChance) {
      this.drops.push(new Drop(enemy.x + 8, enemy.y + 8, 'xp_small', enemy.xpValue));
    }

    if (enemy.isBoss) {
      this.drops.push(new Drop(enemy.x, enemy.y, 'chest', 1));
      this.camera.addShake(15);
      return;
    }

    if (enemy.isElite) {
      // Guaranteed high-value drop from elites
      const eliteDropRand = Math.random();
      if (eliteDropRand < 0.35) {
        this.drops.push(new Drop(enemy.x, enemy.y, 'health_pack', 35));
      } else if (eliteDropRand < 0.60) {
        this.drops.push(new Drop(enemy.x, enemy.y, 'magnet', 1));
      } else {
        this.drops.push(new Drop(enemy.x, enemy.y, 'xp_large', 25));
      }
      return;
    }

    const utilRand = Math.random();
    if (utilRand < 0.015) {
      this.drops.push(new Drop(enemy.x, enemy.y, 'health_pack', 30));
      return;
    } else if (utilRand < 0.025) {
      this.drops.push(new Drop(enemy.x, enemy.y, 'magnet', 1));
      return;
    } else if (utilRand < 0.032) {
      this.drops.push(new Drop(enemy.x, enemy.y, 'nuke', 1));
      return;
    }

    const finalXp = Math.max(1, Math.round(enemy.xpValue * this.mapManager.currentSector.xpMult));
    let xpType: DropType = 'xp_small';
    if (finalXp >= 10) xpType = 'xp_large';
    else if (finalXp >= 3) xpType = 'xp_medium';

    this.drops.push(new Drop(enemy.x, enemy.y, xpType, finalXp));
  }

  private collectDrop(drop: Drop) {
    if (drop.type.startsWith('xp_')) {
      const leveledUp = this.player.addXp(drop.value);
      this.player.coins += Math.ceil((drop.value / 2) * this.player.coinMultiplier);
      if (this.player.doubleShardChance > 0 && Math.random() < this.player.doubleShardChance) {
        this.runShardsEarned += 1;
      }
      if (leveledUp && this.state !== 'LEVEL_UP') {
        this.triggerLevelUp();
      }
    } else if (drop.type === 'health_pack') {
      this.player.heal(drop.value);
      sounds.playGem();
      this.floatingText.spawn(this.player.x, this.player.y, `+${drop.value} HP`, '#00ff88', true, 18);
      this.particleSystem.emitRing(this.player.x, this.player.y, 40, '#00ff88', 0.4);
    } else if (drop.type === 'magnet') {
      sounds.playChest();
      this.ui.showAnnouncement(i18n.t.vacuumAlert);
      for (let i = 0; i < this.drops.length; i++) {
        this.drops[i].isAttracted = true;
      }
    } else if (drop.type === 'nuke') {
      sounds.playNuke();
      this.camera.addShake(20);
      this.ui.showAnnouncement(i18n.t.nukeAlert);
      this.particleSystem.emitRing(this.player.x, this.player.y, 400, '#ff9900', 0.6);

      for (let i = 0; i < this.enemies.length; i++) {
        const e = this.enemies[i];
        if (!e.isBoss) {
          e.takeDamage(9999);
          this.onEnemyKilled(e);
        }
      }
    } else if (drop.type === 'chest') {
      this.triggerChest();
    }
  }

  private triggerLevelUp() {
    this.state = 'LEVEL_UP';
    this.particleSystem.emitRing(this.player.x, this.player.y, 75, '#00ffff', 0.5);

    const showOptions = () => {
      const cards = this.upgradeManager.generateOptions(this.player, this.activeWeapons, 3);
      this.ui.showUpgradeModal(
        cards,
        (selectedCard) => {
          this.upgradeManager.applyUpgrade(selectedCard, this.player, this.activeWeapons);
          if (selectedCard.type === 'weapon_evolution') {
            achievementManager.reportEvolution();
          }
          if (this.player.stats.armor >= 10) {
            achievementManager.reportArmor(this.player.stats.armor);
          }
          if (this.player.pendingLevelUps > 0) {
            this.player.pendingLevelUps--;
            showOptions();
          } else {
            this.state = 'PLAYING';
            this.lastTime = performance.now();
          }
        },
        this.player.availableRerolls > 0
          ? () => {
              this.player.availableRerolls--;
              sounds.playGem();
              this.floatingText.spawn(this.player.x, this.player.y, 'REROLL', '#8b5cf6', true, 16);
              showOptions();
            }
          : undefined,
        this.player.availableRerolls,
        this.player,
        this.activeWeapons
      );
    };

    showOptions();
  }

  private triggerChest() {
    this.state = 'CHEST';
    const cards = this.upgradeManager.generateOptions(this.player, this.activeWeapons, 3);

    cards.forEach((card) => {
      this.upgradeManager.applyUpgrade(card, this.player, this.activeWeapons);
    });

    this.ui.showChestModal(
      cards,
      () => {
        this.state = 'PLAYING';
        this.lastTime = performance.now();
      },
      this.player,
      this.activeWeapons
    );
  }

  private checkSectorProgression() {
    const t = this.waveManager.gameTime;
    let targetSector: SectorId = 'neo_kyoto';

    if (t >= 480) {
      targetSector = 'orbital_void';
    } else if (t >= 300) {
      targetSector = 'magma_core';
    } else if (t >= 140) {
      targetSector = 'chem_slums';
    }

    if (this.mapManager.currentSector.id !== targetSector) {
      this.transitionToSector(targetSector);
    }
  }

  private transitionToSector(sectorId: SectorId) {
    this.mapManager.setSector(sectorId);
    sounds.playNuke();
    this.camera.addShake(28);
    this.particleSystem.emitRing(this.player.x, this.player.y, 350, this.mapManager.currentSector.accentColor, 1.4);

    const t = i18n.t as unknown as Record<string, string>;
    const name = t[this.mapManager.currentSector.nameKey] || this.mapManager.currentSector.id;
    this.ui.showSectorBanner(this.mapManager.currentSector, name);
  }

  private isGameOverTriggered: boolean = false;
  private isPlayerDying: boolean = false;

  private onPlayerDeath() {
    if (this.isPlayerDying || this.isGameOverTriggered || this.state === 'GAME_OVER') return;
    this.isPlayerDying = true;
    this.player.isAlive = false;
    this.player.stats.hp = 0;

    // Immediately reflect 0 HP in the in-game HUD
    this.ui.updateHUD(this.player, this.waveManager.gameTime, this.activeWeapons);

    // Stop combat BGM immediately
    sounds.stopMusic();

    // Dramatic death effects
    sounds.playHit();
    this.camera.addShake(20);
    this.particleSystem.emitRing(this.player.x, this.player.y, 90, '#ef4444', 1.0);
    this.particleSystem.emit(this.player.x, this.player.y, 35, '#ff0055', 220, 5, 0.7);
    this.particleSystem.emit(this.player.x, this.player.y, 25, '#fbbf24', 180, 4, 0.6);
    this.floatingText.spawn(this.player.x, this.player.y - 24, 'SYSTEM FAILURE', '#ef4444', true, 20);

    // Allow 700ms for player to visually register the 0 HP state and shatter effects
    setTimeout(() => {
      if (this.isRunning && !this.isGameOverTriggered) {
        this.triggerGameOver();
      }
    }, 700);
  }

  private triggerGameOver() {
    if (this.isGameOverTriggered || this.state === 'GAME_OVER') return;
    this.isGameOverTriggered = true;
    this.state = 'GAME_OVER';
    this.player.isAlive = false;

    try {
      const m = Math.floor(this.waveManager.gameTime / 60).toString().padStart(2, '0');
      const s = Math.floor(this.waveManager.gameTime % 60).toString().padStart(2, '0');
      const timeStr = `${m}:${s}`;

      let finalShards = Math.round(this.runShardsEarned * this.player.shardMultiplier);
      if (this.player.convertCoinsToShards && this.player.coins > 0) {
        finalShards += Math.floor(this.player.coins / 5);
      }
      skillTree.addShards(finalShards);
      const totalShards = skillTree.getShards();

      // Report achievements
      achievementManager.reportSurvivalTime(this.waveManager.gameTime);
      achievementManager.reportShards(finalShards);

      const damageStatsList = Array.from(this.weaponDamageStats.values());

      this.ui.showGameOver(
        timeStr,
        this.player.totalKills,
        this.player.level,
        finalShards,
        totalShards,
        () => {
          this.restartGame();
        },
        () => {
          this.returnToMainMenu();
        },
        damageStatsList,
        this.waveManager.gameTime
      );
    } catch (e) {
      console.error('Error triggering game over:', e);
      const modal = document.getElementById('game-over-modal');
      if (modal) modal.classList.remove('hidden');
    }
  }

  private render() {
    const ctx = this.ctx;
    const cam = this.camera;

    if (this.state === 'START') {
      ctx.fillStyle = '#03050a';
      ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      return;
    }

    // Clear background
    ctx.fillStyle = '#060913';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // 1. Render Map (Sci-fi tiles, circuits, sector markings, boundaries, dust)
    this.mapManager.render(ctx, cam);

    // 2. Render Hazards & Telegraphs on the ground
    for (let i = 0; i < this.mapManager.hazards.length; i++) {
      const h = this.mapManager.hazards[i];
      if (cam.isVisible(h.x, h.y, h.radius)) {
        const sc = cam.worldToScreen(h.x, h.y);
        h.render(ctx, sc.x, sc.y);
      }
    }

    // Render Event Meteor Bombardment Telegraphs
    for (let i = 0; i < this.waveManager.pendingMeteorTelegraphs.length; i++) {
      const m = this.waveManager.pendingMeteorTelegraphs[i];
      if (cam.isVisible(m.x, m.y, m.radius + 20)) {
        const sc = cam.worldToScreen(m.x, m.y);
        ctx.save();
        ctx.beginPath();
        ctx.arc(sc.x, sc.y, m.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(239, 68, 68, 0.22)';
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#ef4444';
        ctx.setLineDash([6, 4]);
        ctx.stroke();

        // Inner shrinking warning circle
        const ratio = Math.max(0, m.timer / 1.1);
        ctx.beginPath();
        ctx.arc(sc.x, sc.y, m.radius * (1 - ratio), 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(249, 115, 22, 0.45)';
        ctx.fill();
        ctx.restore();
      }
    }

    // 3. Render Destructibles (Crates, Barrels, Pylons)
    for (let i = 0; i < this.mapManager.destructibles.length; i++) {
      const d = this.mapManager.destructibles[i];
      if (cam.isVisible(d.x, d.y, d.radius)) {
        const sc = cam.worldToScreen(d.x, d.y);
        d.render(ctx, sc.x, sc.y);
      }
    }

    // 4. Render Drops
    for (let i = 0; i < this.drops.length; i++) {
      const d = this.drops[i];
      if (cam.isVisible(d.x, d.y, d.radius)) {
        const screen = cam.worldToScreen(d.x, d.y);
        d.render(ctx, screen.x, screen.y);
      }
    }

    // 5. Render Enemies & Bosses
    for (let i = 0; i < this.enemies.length; i++) {
      const e = this.enemies[i];
      if (cam.isVisible(e.x, e.y, e.radius + 20)) {
        const screen = cam.worldToScreen(e.x, e.y);
        e.render(ctx, screen.x, screen.y);
      }
    }

    // 6. Render Projectiles
    for (let i = 0; i < this.projectiles.length; i++) {
      const p = this.projectiles[i];
      if (cam.isVisible(p.x, p.y, p.radius + 10)) {
        const screen = cam.worldToScreen(p.x, p.y);
        p.render(ctx, screen.x, screen.y);
      }
    }

    // 7. Render Weapons attached to player (e.g. Orbiting Blades, Toxic Aura)
    const playerScreen = cam.worldToScreen(this.player.x, this.player.y);
    for (let i = 0; i < this.activeWeapons.length; i++) {
      this.activeWeapons[i].render(ctx, playerScreen.x, playerScreen.y);
    }

    // 8. Render Player
    this.player.render(ctx, playerScreen.x, playerScreen.y);

    // 9. Render Particles
    this.particleSystem.render(ctx, cam);

    // 10. Render Floating Text
    this.floatingText.render(ctx, cam);

    // 11. Render Touch Joystick if active
    this.ui.renderVirtualJoystick(ctx, this.input);

    // 12. Render Minimap Radar
    if (this.state === 'PLAYING' || this.state === 'PAUSED' || this.state === 'LEVEL_UP' || this.state === 'CHEST') {
      this.mapManager.renderMinimap(
        ctx,
        this.player.x,
        this.player.y,
        this.player.rotation,
        this.enemies,
        this.waveManager.activeBoss,
        this.mapManager.destructibles,
        this.canvas.width,
        this.canvas.height
      );
    }
  }
}
