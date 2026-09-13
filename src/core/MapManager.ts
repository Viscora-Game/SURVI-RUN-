import type { Camera } from './Camera';
import { Destructible } from '../entities/Destructible';
import { Hazard } from '../entities/Hazard';

export type SectorId = 'neo_kyoto' | 'chem_slums' | 'magma_core' | 'orbital_void';

export interface SectorConfig {
  id: SectorId;
  nameKey: string;
  descKey: string;
  icon: string;
  difficulty: number;
  xpMult: number;
  shardMult: number;
  bgBase: string;
  bgAlt: string;
  circuitColor: string;
  accentColor: string;
  barrierColor: string;
  dustColor: string;
  hazardType: 'acid_puddle' | 'fire_zone';
}

export const SECTORS: Record<SectorId, SectorConfig> = {
  neo_kyoto: {
    id: 'neo_kyoto',
    nameKey: 'sector_neo_kyoto_name',
    descKey: 'sector_neo_kyoto_desc',
    icon: '🏙️',
    difficulty: 1,
    xpMult: 1.0,
    shardMult: 1.0,
    bgBase: '#070c1b',
    bgAlt: '#0a1428',
    circuitColor: 'rgba(0, 229, 255, 0.12)',
    accentColor: '#00e5ff',
    barrierColor: '#ff0055',
    dustColor: '#00e5ff',
    hazardType: 'acid_puddle',
  },
  chem_slums: {
    id: 'chem_slums',
    nameKey: 'sector_chem_slums_name',
    descKey: 'sector_chem_slums_desc',
    icon: '🧪',
    difficulty: 2,
    xpMult: 1.25,
    shardMult: 1.35,
    bgBase: '#04160e',
    bgAlt: '#072418',
    circuitColor: 'rgba(16, 185, 129, 0.14)',
    accentColor: '#10b981',
    barrierColor: '#eab308',
    dustColor: '#34d399',
    hazardType: 'acid_puddle',
  },
  magma_core: {
    id: 'magma_core',
    nameKey: 'sector_magma_core_name',
    descKey: 'sector_magma_core_desc',
    icon: '🔥',
    difficulty: 3,
    xpMult: 1.5,
    shardMult: 1.75,
    bgBase: '#1a0805',
    bgAlt: '#260d08',
    circuitColor: 'rgba(249, 115, 22, 0.15)',
    accentColor: '#f97316',
    barrierColor: '#ef4444',
    dustColor: '#fbbf24',
    hazardType: 'fire_zone',
  },
  orbital_void: {
    id: 'orbital_void',
    nameKey: 'sector_orbital_void_name',
    descKey: 'sector_orbital_void_desc',
    icon: '🌌',
    difficulty: 4,
    xpMult: 2.0,
    shardMult: 2.5,
    bgBase: '#0d0722',
    bgAlt: '#140c33',
    circuitColor: 'rgba(168, 85, 247, 0.15)',
    accentColor: '#a855f7',
    barrierColor: '#ec4899',
    dustColor: '#c084fc',
    hazardType: 'fire_zone',
  },
};

interface CyberDust {
  x: number;
  y: number;
  size: number;
  alpha: number;
  speedY: number;
  speedX: number;
}

export class MapManager {
  public arenaSize: number = 3600; // 3600x3600 px Arena
  public currentSector: SectorConfig;
  public destructibles: Destructible[] = [];
  public hazards: Hazard[] = [];
  private cyberDust: CyberDust[] = [];
  private radarScanAngle: number = 0;
  public transitionGlitchTimer: number = 0;

  constructor(sectorId: SectorId = 'neo_kyoto') {
    this.currentSector = SECTORS[sectorId] || SECTORS.neo_kyoto;
    this.generateArenaObjects();
    this.initDust();
  }

  public setSector(sectorId: SectorId) {
    this.currentSector = SECTORS[sectorId] || SECTORS.neo_kyoto;
    this.transitionGlitchTimer = 1.8;
    this.generateArenaObjects();
    this.initDust();
  }

  private initDust() {
    this.cyberDust = [];
    for (let i = 0; i < 70; i++) {
      this.cyberDust.push({
        x: Math.random() * this.arenaSize - this.arenaSize / 2,
        y: Math.random() * this.arenaSize - this.arenaSize / 2,
        size: Math.random() * 2.5 + 1,
        alpha: Math.random() * 0.5 + 0.2,
        speedY: -(Math.random() * 20 + 10),
        speedX: Math.sin(Math.random() * Math.PI) * 10,
      });
    }
  }

  public generateArenaObjects() {
    this.destructibles = [];
    this.hazards = [];

    const half = this.arenaSize / 2 - 200;

    // 1. Tactical Cover Pylons
    const pylonOffsets = [
      { x: -500, y: -500 }, { x: 500, y: -500 },
      { x: -500, y: 500 }, { x: 500, y: 500 },
      { x: -900, y: 0 }, { x: 900, y: 0 },
      { x: 0, y: -900 }, { x: 0, y: 900 },
      { x: -1100, y: -1100 }, { x: 1100, y: -1100 },
      { x: -1100, y: 1100 }, { x: 1100, y: 1100 },
    ];

    pylonOffsets.forEach((pos) => {
      this.destructibles.push(new Destructible(pos.x, pos.y, 'energy_pylon'));
    });

    // 2. Supply Crates (Tech Crates)
    for (let i = 0; i < 28; i++) {
      const x = (Math.random() * 2 - 1) * half;
      const y = (Math.random() * 2 - 1) * half;
      this.destructibles.push(new Destructible(x, y, 'tech_crate'));
    }

    // 3. Explosive Barrels
    for (let i = 0; i < 20; i++) {
      const x = (Math.random() * 2 - 1) * half;
      const y = (Math.random() * 2 - 1) * half;
      this.destructibles.push(new Destructible(x, y, 'explosive_barrel'));
    }

    // 4. Biome-specific persistent environmental hazards
    const hazardPositions = [
      { x: -350, y: 0 }, { x: 350, y: 0 },
      { x: 0, y: -350 }, { x: 0, y: 350 },
      { x: -750, y: -750 }, { x: 750, y: 750 },
      { x: -750, y: 750 }, { x: 750, y: -750 },
    ];

    const hType = this.currentSector.hazardType;
    hazardPositions.forEach((pos) => {
      this.hazards.push(new Hazard(pos.x, pos.y, 48, 999999, 14, hType));
    });
  }

  public update(dt: number) {
    this.radarScanAngle += dt * 3.5;
    if (this.transitionGlitchTimer > 0) {
      this.transitionGlitchTimer -= dt;
    }

    // Ambient dust
    for (let i = 0; i < this.cyberDust.length; i++) {
      const d = this.cyberDust[i];
      d.y += d.speedY * dt;
      d.x += d.speedX * dt;

      const half = this.arenaSize / 2;
      if (d.y < -half) d.y = half;
      if (d.x < -half) d.x = half;
      if (d.x > half) d.x = -half;
    }

    // Destructibles
    for (let i = this.destructibles.length - 1; i >= 0; i--) {
      const obj = this.destructibles[i];
      obj.update(dt);
      if (!obj.isAlive) {
        this.destructibles.splice(i, 1);
      }
    }

    // Hazards
    for (let i = this.hazards.length - 1; i >= 0; i--) {
      const h = this.hazards[i];
      h.update(dt);
      if (!h.isAlive) {
        this.hazards.splice(i, 1);
      }
    }
  }

  private renderSectorTile(
    ctx: CanvasRenderingContext2D,
    sec: SectorConfig,
    screenX: number,
    screenY: number,
    tileSize: number,
    tileX: number,
    tileY: number,
    tileIndex: number
  ) {
    switch (sec.id) {
      case 'chem_slums': {
        // Corroded Industrial Grating & Bubbling Sludge
        ctx.fillStyle = tileIndex === 0 ? '#04160e' : (tileIndex === 2 ? '#072618' : '#03120b');
        ctx.fillRect(screenX, screenY, tileSize, tileSize);

        ctx.strokeStyle = 'rgba(16, 185, 129, 0.25)';
        ctx.lineWidth = 1;
        ctx.strokeRect(screenX, screenY, tileSize, tileSize);

        if (tileIndex === 1) {
          // Biohazard Sludge Drain
          ctx.fillStyle = 'rgba(16, 185, 129, 0.15)';
          ctx.beginPath();
          ctx.arc(screenX + tileSize / 2, screenY + tileSize / 2, 24, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#10b981';
          ctx.lineWidth = 1.5;
          ctx.stroke();

          // Bubbling Acid Node
          const bub = Math.sin(Date.now() * 0.005 + tileX) * 3;
          ctx.fillStyle = '#34d399';
          ctx.beginPath();
          ctx.arc(screenX + tileSize / 2 + bub, screenY + tileSize / 2, 5, 0, Math.PI * 2);
          ctx.fill();
        } else if (tileIndex === 3) {
          // Hazard Stripes Corner
          ctx.fillStyle = 'rgba(234, 179, 8, 0.16)';
          ctx.beginPath();
          ctx.moveTo(screenX, screenY);
          ctx.lineTo(screenX + 26, screenY);
          ctx.lineTo(screenX, screenY + 26);
          ctx.closePath();
          ctx.fill();
        }
        break;
      }

      case 'magma_core': {
        // Charred Obsidian Rock & Molten Lava Veins
        ctx.fillStyle = tileIndex === 0 ? '#180604' : (tileIndex === 2 ? '#260a06' : '#140402');
        ctx.fillRect(screenX, screenY, tileSize, tileSize);

        // Molten Lava Heat Seams
        const heatPulse = Math.sin(Date.now() * 0.004 + (tileX + tileY) * 0.2) * 0.2 + 0.5;
        ctx.strokeStyle = `rgba(249, 115, 22, ${heatPulse * 0.5})`;
        ctx.lineWidth = 2;
        ctx.strokeRect(screenX, screenY, tileSize, tileSize);

        if (tileIndex === 1 || tileIndex === 3) {
          // Molten Tectonic Fissure
          ctx.strokeStyle = `rgba(239, 68, 68, ${heatPulse * 0.7})`;
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(screenX + 10, screenY);
          ctx.lineTo(screenX + 40, screenY + 45);
          ctx.lineTo(screenX + 80, screenY + 55);
          ctx.lineTo(screenX + tileSize, screenY + 100);
          ctx.stroke();

          // Magma Node Sparks
          ctx.fillStyle = '#fbbf24';
          ctx.fillRect(screenX + 38, screenY + 43, 4, 4);
          ctx.fillRect(screenX + 78, screenY + 53, 4, 4);
        }
        break;
      }

      case 'orbital_void': {
        // Deep Space Abyss & Cosmic Gravity Fractures
        ctx.fillStyle = tileIndex === 0 ? '#0b051b' : (tileIndex === 2 ? '#14092c' : '#080315');
        ctx.fillRect(screenX, screenY, tileSize, tileSize);

        ctx.strokeStyle = 'rgba(168, 85, 247, 0.22)';
        ctx.lineWidth = 1;
        ctx.strokeRect(screenX, screenY, tileSize, tileSize);

        if (tileIndex === 1) {
          // Purple Gravity Vortex
          ctx.strokeStyle = 'rgba(192, 132, 252, 0.45)';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(screenX + tileSize / 2, screenY + tileSize / 2, 20, 0, Math.PI * 2);
          ctx.stroke();

          // Star Cross
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(screenX + tileSize / 2 - 1, screenY + tileSize / 2 - 6, 2, 12);
          ctx.fillRect(screenX + tileSize / 2 - 6, screenY + tileSize / 2 - 1, 12, 2);
        } else if (tileIndex === 2) {
          ctx.fillStyle = 'rgba(168, 85, 247, 0.3)';
          ctx.fillRect(screenX + 18, screenY + 18, 3, 3);
          ctx.fillRect(screenX + tileSize - 18, screenY + tileSize - 18, 3, 3);
        }
        break;
      }

      case 'neo_kyoto':
      default: {
        // Clean High-Tech Cyber Circuits & Landing Panels
        ctx.fillStyle = tileIndex === 0 ? sec.bgBase : (tileIndex === 2 ? sec.bgAlt : sec.bgBase);
        ctx.fillRect(screenX, screenY, tileSize, tileSize);

        ctx.strokeStyle = sec.circuitColor;
        ctx.lineWidth = 1;
        ctx.strokeRect(screenX, screenY, tileSize, tileSize);

        if (tileIndex === 1) {
          ctx.beginPath();
          ctx.moveTo(screenX + 20, screenY);
          ctx.lineTo(screenX + 20, screenY + 40);
          ctx.lineTo(screenX + 60, screenY + 80);
          ctx.lineTo(screenX + tileSize, screenY + 80);
          ctx.stroke();

          ctx.fillStyle = sec.accentColor;
          ctx.fillRect(screenX + 18, screenY + 38, 4, 4);
          ctx.fillRect(screenX + 58, screenY + 78, 4, 4);
        } else if (tileIndex === 3) {
          ctx.strokeStyle = 'rgba(0, 229, 255, 0.22)';
          ctx.lineWidth = 2;
          ctx.strokeRect(screenX + 35, screenY + 35, 50, 50);
        }
        break;
      }
    }
  }

  public render(ctx: CanvasRenderingContext2D, cam: Camera) {
    const half = this.arenaSize / 2;
    const sec = this.currentSector;

    // 1. Grid Floor & Biome Panels
    const tileSize = 120;
    const margin = tileSize * 3;
    const startX = Math.floor((cam.x - margin) / tileSize) * tileSize;
    const endX = Math.ceil((cam.x + cam.width + margin) / tileSize) * tileSize;
    const startY = Math.floor((cam.y - margin) / tileSize) * tileSize;
    const endY = Math.ceil((cam.y + cam.height + margin) / tileSize) * tileSize;

    ctx.save();

    for (let x = startX; x <= endX; x += tileSize) {
      for (let y = startY; y <= endY; y += tileSize) {
        if (x < -half || x >= half || y < -half || y >= half) continue;

        const screen = cam.worldToScreen(x, y);
        const tileIndex = (Math.abs(Math.floor(x / tileSize)) + Math.abs(Math.floor(y / tileSize))) % 4;

        this.renderSectorTile(ctx, sec, screen.x, screen.y, tileSize, x, y, tileIndex);
      }
    }

    // 2. Sector Perimeter Forcefield Barrier
    const bounds = {
      left: cam.worldToScreen(-half, 0).x,
      right: cam.worldToScreen(half, 0).x,
      top: cam.worldToScreen(0, -half).y,
      bottom: cam.worldToScreen(0, half).y,
    };

    const pulse = Math.sin(Date.now() * 0.005) * 4;
    ctx.strokeStyle = sec.barrierColor;
    ctx.shadowColor = sec.barrierColor;
    ctx.shadowBlur = 16 + pulse;
    ctx.lineWidth = 6;
    ctx.strokeRect(bounds.left, bounds.top, bounds.right - bounds.left, bounds.bottom - bounds.top);

    // Hazard striped fill border
    ctx.fillStyle = 'rgba(255, 0, 85, 0.05)';
    ctx.fillRect(bounds.left, bounds.top, bounds.right - bounds.left, bounds.bottom - bounds.top);

    // 3. Floating Dust Particles
    ctx.shadowBlur = 0;
    for (let i = 0; i < this.cyberDust.length; i++) {
      const d = this.cyberDust[i];
      if (cam.isVisible(d.x, d.y, 10)) {
        const sc = cam.worldToScreen(d.x, d.y);
        ctx.globalAlpha = d.alpha;
        ctx.fillStyle = sec.dustColor;
        ctx.fillRect(sc.x, sc.y, d.size, d.size);
      }
    }

    ctx.restore();

    // 4. Sector Atmospheric Screen Vignette & Color Tint (Screen Space)
    ctx.save();
    const grad = ctx.createRadialGradient(
      cam.width / 2, cam.height / 2, Math.min(cam.width, cam.height) * 0.35,
      cam.width / 2, cam.height / 2, Math.max(cam.width, cam.height) * 0.75
    );

    if (sec.id === 'chem_slums') {
      grad.addColorStop(0, 'rgba(16, 185, 129, 0.0)');
      grad.addColorStop(1, 'rgba(16, 185, 129, 0.18)');
    } else if (sec.id === 'magma_core') {
      grad.addColorStop(0, 'rgba(249, 115, 22, 0.0)');
      grad.addColorStop(1, 'rgba(239, 68, 68, 0.22)');
    } else if (sec.id === 'orbital_void') {
      grad.addColorStop(0, 'rgba(168, 85, 247, 0.0)');
      grad.addColorStop(1, 'rgba(168, 85, 247, 0.20)');
    } else {
      grad.addColorStop(0, 'rgba(0, 229, 255, 0.0)');
      grad.addColorStop(1, 'rgba(0, 229, 255, 0.10)');
    }
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, cam.width, cam.height);

    // 5. Warp Transition Digital Glitch Scanline Sweep
    if (this.transitionGlitchTimer > 0) {
      const progress = 1 - (this.transitionGlitchTimer / 1.8);
      const sweepY = progress * cam.height;

      ctx.fillStyle = sec.accentColor;
      ctx.globalAlpha = Math.sin(this.transitionGlitchTimer * 10) * 0.25 + 0.2;
      ctx.fillRect(0, sweepY - 30, cam.width, 60);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
      for (let y = 0; y < cam.height; y += 6) {
        ctx.fillRect(0, y, cam.width, 1.5);
      }
      ctx.globalAlpha = 1.0;
    }

    ctx.restore();
  }

  // =========================================================================
  // IN-GAME TOP-RIGHT MINIMAP RADAR
  // =========================================================================
  public renderMinimap(
    ctx: CanvasRenderingContext2D,
    playerX: number,
    playerY: number,
    playerAngle: number,
    enemies: { x: number; y: number; isBoss?: boolean; config?: { type: string } }[],
    boss: { x: number; y: number; isAlive: boolean } | null,
    destructibles: { x: number; y: number; isAlive: boolean; type: string }[],
    screenWidth: number,
    _screenHeight: number
  ) {
    const radarRadius = 60;
    const radarCx = screenWidth - radarRadius - 24;
    const radarCy = radarRadius + 24;
    const scale = (radarRadius - 6) / (this.arenaSize / 2);

    ctx.save();

    // 1. Radar Glass Background
    ctx.fillStyle = 'rgba(6, 11, 25, 0.82)';
    ctx.beginPath();
    ctx.arc(radarCx, radarCy, radarRadius, 0, Math.PI * 2);
    ctx.fill();

    // 2. Concentric Radar Rings & Crosshair
    ctx.strokeStyle = 'rgba(0, 229, 255, 0.18)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(radarCx, radarCy, radarRadius * 0.5, 0, Math.PI * 2);
    ctx.arc(radarCx, radarCy, radarRadius, 0, Math.PI * 2);
    ctx.moveTo(radarCx - radarRadius, radarCy);
    ctx.lineTo(radarCx + radarRadius, radarCy);
    ctx.moveTo(radarCx, radarCy - radarRadius);
    ctx.lineTo(radarCx, radarCy + radarRadius);
    ctx.stroke();

    // 3. Rotating Scan Beam
    ctx.strokeStyle = 'rgba(0, 229, 255, 0.35)';
    ctx.beginPath();
    ctx.moveTo(radarCx, radarCy);
    ctx.lineTo(
      radarCx + Math.cos(this.radarScanAngle) * radarRadius,
      radarCy + Math.sin(this.radarScanAngle) * radarRadius
    );
    ctx.stroke();

    // 4. Draw Destructibles (Golden dots for crates, cyan for pylons)
    for (let i = 0; i < destructibles.length; i++) {
      const d = destructibles[i];
      if (!d.isAlive) continue;
      const rx = radarCx + d.x * scale;
      const ry = radarCy + d.y * scale;
      const dist = Math.hypot(rx - radarCx, ry - radarCy);
      if (dist < radarRadius - 2) {
        ctx.fillStyle = d.type === 'tech_crate' ? '#fbbf24' : '#38bdf8';
        ctx.fillRect(rx - 1.5, ry - 1.5, 3, 3);
      }
    }

    // 5. Draw Enemies (Red dots)
    ctx.fillStyle = '#ef4444';
    for (let i = 0; i < enemies.length; i++) {
      const e = enemies[i];
      const rx = radarCx + e.x * scale;
      const ry = radarCy + e.y * scale;
      const dist = Math.hypot(rx - radarCx, ry - radarCy);
      if (dist < radarRadius - 2) {
        ctx.fillRect(rx - 1, ry - 1, 2, 2);
      }
    }

    // 6. Draw Boss (Large pulsating skull / diamond)
    if (boss && boss.isAlive) {
      const bx = radarCx + boss.x * scale;
      const by = radarCy + boss.y * scale;
      const dist = Math.hypot(bx - radarCx, by - radarCy);

      if (dist < radarRadius - 6) {
        ctx.fillStyle = '#ff0055';
        ctx.shadowColor = '#ff0055';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(bx, by, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      } else {
        // Boss direction pointer on radar rim!
        const angle = Math.atan2(by - radarCy, bx - radarCx);
        const rimX = radarCx + Math.cos(angle) * (radarRadius - 6);
        const rimY = radarCy + Math.sin(angle) * (radarRadius - 6);

        ctx.fillStyle = '#ff0055';
        ctx.beginPath();
        ctx.arc(rimX, rimY, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 7. Draw Player (Glowing Cyan Pointer)
    const px = radarCx + playerX * scale;
    const py = radarCy + playerY * scale;

    ctx.fillStyle = '#00ffff';
    ctx.shadowColor = '#00ffff';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(px, py, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Heading arrow
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(px + Math.cos(playerAngle) * 7, py + Math.sin(playerAngle) * 7);
    ctx.stroke();

    // 8. Outer Radar Bezel
    ctx.strokeStyle = this.currentSector.accentColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(radarCx, radarCy, radarRadius, 0, Math.PI * 2);
    ctx.stroke();

    // 9. Sector Label
    ctx.font = 'bold 9px "Orbitron", monospace';
    ctx.fillStyle = this.currentSector.accentColor;
    ctx.textAlign = 'center';
    ctx.fillText(`${this.currentSector.icon} RADAR`, radarCx, radarCy + radarRadius + 14);

    ctx.restore();
  }

  public clampToArena(entity: { x: number; y: number; radius: number }) {
    const half = this.arenaSize / 2 - entity.radius - 15;
    entity.x = Math.max(-half, Math.min(half, entity.x));
    entity.y = Math.max(-half, Math.min(half, entity.y));
  }
}
