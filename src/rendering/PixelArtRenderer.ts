/**
 * High-Performance Top-Down 2D Pixel Art Generator and Renderer
 * Generates and caches authentic multi-shaded retro pixel-art sprites
 * for the Player, distinct Enemy archetypes, and the Titan Boss.
 */

import type { ShipId } from '../types';

export type PixelDirection = 'up' | 'down' | 'left' | 'right';

export class PixelArtRenderer {
  private static spriteCache: Map<string, HTMLCanvasElement> = new Map();

  /**
   * Helper to create an offscreen canvas with pixel-art smoothing disabled
   */
  private static createPixelCanvas(width: number, height: number): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;
    ctx.imageSmoothingEnabled = false;
    return { canvas, ctx };
  }

  // =========================================================================
  // 1. TOP-DOWN PLAYER (CYBER OPERATIVE / FLEET SHIPS)
  // =========================================================================
  public static getPlayerSprite(
    animFrame: number,
    isDashing: boolean,
    isFocused: boolean,
    shipId: ShipId = 'vanguard'
  ): HTMLCanvasElement {
    const frame = animFrame % 4;
    const cacheKey = `player_${shipId}_${frame}_${isDashing}_${isFocused}`;
    if (this.spriteCache.has(cacheKey)) {
      return this.spriteCache.get(cacheKey)!;
    }

    const size = 40;
    const { canvas, ctx } = this.createPixelCanvas(size, size);
    const cx = size / 2;
    const cy = size / 2;

    // A. Shadow below vessel
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.beginPath();
    ctx.ellipse(cx, cy + 9, 13, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Determine ship-specific palettes
    let primaryColor = '#00e5ff';
    let secondaryColor = '#0284c7';
    let armorColor = '#1e293b';
    let thrusterColor = '#00f0ff';

    if (shipId === 'interceptor') {
      primaryColor = '#ec4899';
      secondaryColor = '#be185d';
      armorColor = '#3b0764';
      thrusterColor = '#f472b6';
    } else if (shipId === 'dreadnought') {
      primaryColor = '#f59e0b';
      secondaryColor = '#b45309';
      armorColor = '#292524';
      thrusterColor = '#fbbf24';
    } else if (shipId === 'technomancer') {
      primaryColor = '#10b981';
      secondaryColor = '#047857';
      armorColor = '#064e3b';
      thrusterColor = '#34d399';
    } else if (shipId === 'pyroclast') {
      primaryColor = '#f97316';
      secondaryColor = '#dc2626';
      armorColor = '#1c1917';
      thrusterColor = '#fde047';
    } else if (shipId === 'valkyrie') {
      primaryColor = '#ef4444';
      secondaryColor = '#eab308';
      armorColor = '#0f172a';
      thrusterColor = '#ff5722';
    } else if (shipId === 'chronos') {
      primaryColor = '#06b6d4';
      secondaryColor = '#8b5cf6';
      armorColor = '#0f172a';
      thrusterColor = '#cffafe';
    } else if (shipId === 'phantom') {
      primaryColor = '#a855f7';
      secondaryColor = '#7c3aed';
      armorColor = '#09090b';
      thrusterColor = '#c084fc';
    }

    // B. Thruster Exhaust
    if (isDashing) {
      ctx.fillStyle = thrusterColor;
      ctx.fillRect(cx - 7, cy + 12, 14, 7);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(cx - 3, cy + 10, 6, 5);
    } else {
      const flame = frame % 2 === 0 ? 4 : 2;
      ctx.fillStyle = thrusterColor;
      if (shipId === 'dreadnought' || shipId === 'pyroclast') {
        // Quad thrusters for heavy vessels
        ctx.fillRect(cx - 8, cy + 9, 3, flame);
        ctx.fillRect(cx - 4, cy + 9, 3, flame + 1);
        ctx.fillRect(cx + 1, cy + 9, 3, flame + 1);
        ctx.fillRect(cx + 5, cy + 9, 3, flame);
      } else if (shipId === 'chronos') {
        // Dual chronon ion arcs
        ctx.fillRect(cx - 5, cy + 8, 2, flame + 2);
        ctx.fillRect(cx + 3, cy + 8, 2, flame + 2);
      } else {
        ctx.fillRect(cx - 6, cy + 9, 3, flame);
        ctx.fillRect(cx + 3, cy + 9, 3, flame);
      }
    }

    // C. Hull Chassis according to Ship Class
    if (shipId === 'interceptor') {
      // 1. Sleek swept-wing delta dagger
      ctx.fillStyle = armorColor;
      ctx.beginPath();
      ctx.moveTo(cx, cy - 15);
      ctx.lineTo(cx + 14, cy + 10);
      ctx.lineTo(cx + 6, cy + 6);
      ctx.lineTo(cx, cy + 11);
      ctx.lineTo(cx - 6, cy + 6);
      ctx.lineTo(cx - 14, cy + 10);
      ctx.closePath();
      ctx.fill();

      // Wing glow trims
      ctx.fillStyle = primaryColor;
      ctx.fillRect(cx - 14, cy + 6, 2, 5);
      ctx.fillRect(cx + 12, cy + 6, 2, 5);

      // Cockpit needle
      ctx.fillStyle = isFocused ? '#ffffff' : primaryColor;
      ctx.fillRect(cx - 2, cy - 11, 4, 10);
    } else if (shipId === 'dreadnought') {
      // 2. Heavy wide hexagonal battlecruiser hull
      ctx.fillStyle = armorColor;
      ctx.fillRect(cx - 12, cy - 7, 24, 16);
      ctx.fillStyle = secondaryColor;
      ctx.fillRect(cx - 14, cy - 3, 28, 8);
      ctx.fillStyle = primaryColor;
      ctx.fillRect(cx - 10, cy - 9, 4, 3);
      ctx.fillRect(cx + 6, cy - 9, 4, 3);

      // Heavy armor frontal ram prow
      ctx.fillStyle = '#78716c';
      ctx.fillRect(cx - 6, cy - 13, 12, 6);
      ctx.fillStyle = isFocused ? '#ffffff' : primaryColor;
      ctx.fillRect(cx - 3, cy - 12, 6, 3);
    } else if (shipId === 'technomancer') {
      // 3. Arc core saucer with floating resonance pylons
      ctx.fillStyle = armorColor;
      ctx.beginPath();
      ctx.arc(cx, cy, 11, 0, Math.PI * 2);
      ctx.fill();

      // Floating outer resonance arc nodes
      ctx.fillStyle = primaryColor;
      ctx.fillRect(cx - 13, cy - 6, 4, 4);
      ctx.fillRect(cx + 9, cy - 6, 4, 4);
      ctx.fillRect(cx - 2, cy - 14, 4, 4);

      // Rotating core rune
      ctx.fillStyle = isFocused ? '#ffffff' : thrusterColor;
      ctx.beginPath();
      ctx.arc(cx, cy, 5, 0, Math.PI * 2);
      ctx.fill();
    } else if (shipId === 'pyroclast') {
      // 4. Solaris-V Pyroclast: Heavy Molten Thermal Fortress
      ctx.fillStyle = armorColor;
      ctx.beginPath();
      ctx.moveTo(cx - 8, cy - 14);
      ctx.lineTo(cx + 8, cy - 14);
      ctx.lineTo(cx + 15, cy + 2);
      ctx.lineTo(cx + 11, cy + 12);
      ctx.lineTo(cx - 11, cy + 12);
      ctx.lineTo(cx - 15, cy + 2);
      ctx.closePath();
      ctx.fill();

      // Flared thermal radiator wings
      ctx.fillStyle = secondaryColor;
      ctx.fillRect(cx - 15, cy - 4, 4, 10);
      ctx.fillRect(cx + 11, cy - 4, 4, 10);

      // Glowing magma radiator vents
      ctx.fillStyle = primaryColor;
      ctx.fillRect(cx - 13, cy - 2, 2, 6);
      ctx.fillRect(cx + 11, cy - 2, 2, 6);

      // Molten core reactor
      ctx.fillStyle = isFocused ? '#ffffff' : thrusterColor;
      ctx.beginPath();
      ctx.arc(cx, cy - 2, 5, 0, Math.PI * 2);
      ctx.fill();

      // Frontal thermal intake cowl
      ctx.fillStyle = '#f97316';
      ctx.fillRect(cx - 3, cy - 13, 6, 3);
    } else if (shipId === 'valkyrie') {
      // 5. Valkyrie-9: Forward-Swept Missile Corvette
      ctx.fillStyle = armorColor;
      ctx.beginPath();
      ctx.moveTo(cx, cy - 16);
      ctx.lineTo(cx + 5, cy - 6);
      ctx.lineTo(cx + 15, cy - 10); // Forward-swept wingtip
      ctx.lineTo(cx + 12, cy + 8);
      ctx.lineTo(cx + 5, cy + 4);
      ctx.lineTo(cx, cy + 10);
      ctx.lineTo(cx - 5, cy + 4);
      ctx.lineTo(cx - 12, cy + 8);
      ctx.lineTo(cx - 15, cy - 10); // Forward-swept wingtip
      ctx.lineTo(cx - 5, cy - 6);
      ctx.closePath();
      ctx.fill();

      // Twin missile ordnance pods
      ctx.fillStyle = secondaryColor;
      ctx.fillRect(cx - 14, cy - 6, 4, 9);
      ctx.fillRect(cx + 10, cy - 6, 4, 9);

      // Pod warhead tips
      ctx.fillStyle = primaryColor;
      ctx.fillRect(cx - 13, cy - 8, 2, 2);
      ctx.fillRect(cx + 11, cy - 8, 2, 2);

      // Centerline tactical canopy
      ctx.fillStyle = isFocused ? '#ffffff' : primaryColor;
      ctx.fillRect(cx - 2, cy - 12, 4, 8);
    } else if (shipId === 'chronos') {
      // 6. Chronos-Zero: Temporal Chrono Weaver Spindle
      ctx.fillStyle = armorColor;
      ctx.beginPath();
      ctx.moveTo(cx, cy - 16);
      ctx.lineTo(cx + 6, cy - 3);
      ctx.lineTo(cx + 13, cy + 2);
      ctx.lineTo(cx + 4, cy + 9);
      ctx.lineTo(cx, cy + 14);
      ctx.lineTo(cx - 4, cy + 9);
      ctx.lineTo(cx - 13, cy + 2);
      ctx.lineTo(cx - 6, cy - 3);
      ctx.closePath();
      ctx.fill();

      // Outer chronon ring arc
      ctx.strokeStyle = primaryColor;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(cx, cy, 12, 6, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Central tachyon lens
      ctx.fillStyle = isFocused ? '#ffffff' : thrusterColor;
      ctx.beginPath();
      ctx.arc(cx, cy - 3, 4, 0, Math.PI * 2);
      ctx.fill();

      // Flux pylons
      ctx.fillStyle = secondaryColor;
      ctx.fillRect(cx - 12, cy, 3, 3);
      ctx.fillRect(cx + 9, cy, 3, 3);
    } else if (shipId === 'phantom') {
      // 7. Eclipse Void-Specter: Angular Dimensional Diamond Stealth Hull
      ctx.fillStyle = armorColor;
      ctx.beginPath();
      ctx.moveTo(cx, cy - 17);
      ctx.lineTo(cx + 14, cy + 4);
      ctx.lineTo(cx + 9, cy + 11);
      ctx.lineTo(cx, cy + 7);
      ctx.lineTo(cx - 9, cy + 11);
      ctx.lineTo(cx - 14, cy + 4);
      ctx.closePath();
      ctx.fill();

      // Phased outer edges
      ctx.strokeStyle = primaryColor;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Void phase core
      ctx.fillStyle = isFocused ? '#ffffff' : secondaryColor;
      ctx.fillRect(cx - 3, cy - 6, 6, 8);

      // Phase crystal eye
      ctx.fillStyle = isFocused ? '#ffffff' : primaryColor;
      ctx.fillRect(cx - 1, cy - 11, 2, 5);
    } else {
      // 8. Standard Aegis-01 Vanguard: Balanced Patrol Cruiser
      ctx.fillStyle = armorColor;
      ctx.beginPath();
      ctx.moveTo(cx, cy - 15);
      ctx.lineTo(cx + 8, cy - 4);
      ctx.lineTo(cx + 14, cy + 8);
      ctx.lineTo(cx + 6, cy + 7);
      ctx.lineTo(cx, cy + 11);
      ctx.lineTo(cx - 6, cy + 7);
      ctx.lineTo(cx - 14, cy + 8);
      ctx.lineTo(cx - 8, cy - 4);
      ctx.closePath();
      ctx.fill();

      // Twin plasma weapon sponsons
      ctx.fillStyle = secondaryColor;
      ctx.fillRect(cx - 11, cy - 4, 4, 10);
      ctx.fillRect(cx + 7, cy - 4, 4, 10);

      // Plasma emitter tips
      ctx.fillStyle = primaryColor;
      ctx.fillRect(cx - 10, cy - 7, 2, 3);
      ctx.fillRect(cx + 8, cy - 7, 2, 3);

      // Central armored canopy
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(cx - 4, cy - 11, 8, 9);
      ctx.fillStyle = isFocused ? '#ffffff' : primaryColor;
      ctx.fillRect(cx - 2, cy - 9, 4, 4);
    }

    this.spriteCache.set(cacheKey, canvas);
    return canvas;
  }

  // =========================================================================
  // 2. ENEMY: SWARMER (MECHA-SCUTTLER)
  // =========================================================================
  public static getSwarmerSprite(animFrame: number): HTMLCanvasElement {
    const frame = animFrame % 4;
    const cacheKey = `swarmer_${frame}`;
    if (this.spriteCache.has(cacheKey)) return this.spriteCache.get(cacheKey)!;

    const size = 32;
    const { canvas, ctx } = this.createPixelCanvas(size, size);
    const cx = size / 2;
    const cy = size / 2;

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.ellipse(cx, cy + 4, 8, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // 6 Scuttling Arachnid Legs
    const l1 = (frame === 0 || frame === 2) ? 2 : -2;
    const l2 = -l1;
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2;

    // Left legs
    ctx.beginPath();
    ctx.moveTo(cx - 4, cy - 4); ctx.lineTo(cx - 12, cy - 8 + l1);
    ctx.moveTo(cx - 5, cy);     ctx.lineTo(cx - 14, cy + l2);
    ctx.moveTo(cx - 4, cy + 4); ctx.lineTo(cx - 11, cy + 8 + l1);
    // Right legs
    ctx.moveTo(cx + 4, cy - 4); ctx.lineTo(cx + 12, cy - 8 - l1);
    ctx.moveTo(cx + 5, cy);     ctx.lineTo(cx + 14, cy - l2);
    ctx.moveTo(cx + 4, cy + 4); ctx.lineTo(cx + 11, cy + 8 - l1);
    ctx.stroke();

    // Carapace Body (Top-down bug shell)
    ctx.fillStyle = '#7f1d1d';
    ctx.fillRect(cx - 6, cy - 6, 12, 12);
    ctx.fillStyle = '#b91c1c';
    ctx.fillRect(cx - 4, cy - 5, 8, 10);
    ctx.fillStyle = '#f87171';
    ctx.fillRect(cx - 2, cy - 3, 4, 6);

    // Glowing Mandibles & Amber Sensor Eyes
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(cx - 4, cy - 8, 3, 3);
    ctx.fillRect(cx + 1, cy - 8, 3, 3);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(cx - 3, cy - 8, 1, 1);
    ctx.fillRect(cx + 2, cy - 8, 1, 1);

    this.spriteCache.set(cacheKey, canvas);
    return canvas;
  }

  // =========================================================================
  // 2.5 ENEMY: RUNNER (CYBORG STALKER / RAZOR RAPTOR)
  // =========================================================================
  public static getRunnerSprite(animFrame: number): HTMLCanvasElement {
    const frame = animFrame % 4;
    const cacheKey = `runner_${frame}`;
    if (this.spriteCache.has(cacheKey)) return this.spriteCache.get(cacheKey)!;

    const size = 36;
    const { canvas, ctx } = this.createPixelCanvas(size, size);
    const cx = size / 2;
    const cy = size / 2;

    // Fast dynamic shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.beginPath();
    ctx.ellipse(cx, cy + 8, 11, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // High-speed Quadruped Scuttling Limbs
    const legOffset1 = (frame === 0 || frame === 2) ? 4 : -3;
    const legOffset2 = (frame === 1 || frame === 3) ? 4 : -3;

    ctx.strokeStyle = '#581c87';
    ctx.lineWidth = 2;
    ctx.beginPath();
    // Left side legs
    ctx.moveTo(cx - 5, cy - 4); ctx.lineTo(cx - 14, cy - 10 + legOffset1);
    ctx.moveTo(cx - 6, cy + 3); ctx.lineTo(cx - 15, cy + 8 + legOffset2);
    // Right side legs
    ctx.moveTo(cx + 5, cy - 4); ctx.lineTo(cx + 14, cy - 10 - legOffset1);
    ctx.moveTo(cx + 6, cy + 3); ctx.lineTo(cx + 15, cy + 8 - legOffset2);
    ctx.stroke();

    // Razor Blade Scythes (Forward striking arms)
    ctx.strokeStyle = '#c084fc';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx - 4, cy - 8); ctx.lineTo(cx - 10, cy - 15 + (frame % 2 === 0 ? 2 : 0));
    ctx.moveTo(cx + 4, cy - 8); ctx.lineTo(cx + 10, cy - 15 - (frame % 2 === 0 ? 2 : 0));
    ctx.stroke();

    // Aerodynamic Cyber Carapace (Sleek elongated hull)
    ctx.fillStyle = '#2e1065'; // Obsidian purple
    ctx.fillRect(cx - 5, cy - 8, 10, 16);
    ctx.fillStyle = '#7e22ce'; // Electric violet
    ctx.fillRect(cx - 3, cy - 6, 6, 12);
    ctx.fillStyle = '#c084fc'; // Spine accent
    ctx.fillRect(cx - 1, cy - 5, 2, 10);

    // Glowing Neon Cyan Visor & Optical Sensor
    ctx.fillStyle = '#00e5ff';
    ctx.fillRect(cx - 4, cy - 10, 8, 3);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(cx - 2, cy - 10, 4, 1);

    // Thruster exhaust trail spark at rear
    const exhaustColor = (frame % 2 === 0) ? '#e879f9' : '#a855f7';
    ctx.fillStyle = exhaustColor;
    ctx.fillRect(cx - 2, cy + 8, 4, 3);

    this.spriteCache.set(cacheKey, canvas);
    return canvas;
  }

  // =========================================================================
  // 3. ENEMY: SPITTER (ACID MORTAR DRONE)
  // =========================================================================
  public static getSpitterSprite(animFrame: number): HTMLCanvasElement {
    const frame = animFrame % 4;
    const cacheKey = `spitter_${frame}`;
    if (this.spriteCache.has(cacheKey)) return this.spriteCache.get(cacheKey)!;

    const size = 36;
    const { canvas, ctx } = this.createPixelCanvas(size, size);
    const cx = size / 2;
    const cy = size / 2;

    // Hover shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.ellipse(cx, cy + 8, 10, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Rotoblades (spinning hover rotors)
    ctx.fillStyle = 'rgba(16, 185, 129, 0.4)';
    const rotorShift = (frame % 2 === 0) ? 10 : 7;
    ctx.fillRect(cx - rotorShift, cy - 10, rotorShift * 2, 2);
    ctx.fillRect(cx - rotorShift, cy + 10, rotorShift * 2, 2);

    // Main Bio-Drone Shell
    ctx.fillStyle = '#064e3b';
    ctx.fillRect(cx - 8, cy - 7, 16, 14);
    ctx.fillStyle = '#047857';
    ctx.fillRect(cx - 6, cy - 5, 12, 10);

    // Pulsating Bio-Acid Sac (Pew green glow)
    const glowColor = (frame === 1 || frame === 3) ? '#34d399' : '#10b981';
    ctx.fillStyle = glowColor;
    ctx.fillRect(cx - 4, cy - 2, 8, 7);
    ctx.fillStyle = '#a7f3d0';
    ctx.fillRect(cx - 2, cy, 4, 3);

    // Mortar Nozzle (Pointing forward)
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(cx - 3, cy - 12, 6, 6);
    ctx.fillStyle = '#10b981';
    ctx.fillRect(cx - 2, cy - 13, 4, 2);

    this.spriteCache.set(cacheKey, canvas);
    return canvas;
  }

  // =========================================================================
  // 4. ENEMY: BRUTE (HEAVY SIEGE COLOSSUS)
  // =========================================================================
  public static getBruteSprite(animFrame: number): HTMLCanvasElement {
    const frame = animFrame % 4;
    const cacheKey = `brute_${frame}`;
    if (this.spriteCache.has(cacheKey)) return this.spriteCache.get(cacheKey)!;

    const size = 52;
    const { canvas, ctx } = this.createPixelCanvas(size, size);
    const cx = size / 2;
    const cy = size / 2;

    // Heavy Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
    ctx.beginPath();
    ctx.ellipse(cx, cy + 12, 18, 9, 0, 0, Math.PI * 2);
    ctx.fill();

    // Tread / Heavy Step Motion
    const step = (frame === 1) ? 3 : (frame === 3 ? -3 : 0);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(cx - 16, cy - 14 + step, 7, 28);
    ctx.fillRect(cx + 9, cy - 14 - step, 7, 28);
    ctx.fillStyle = '#334155';
    for (let y = cy - 12; y <= cy + 10; y += 6) {
      ctx.fillRect(cx - 16, y + step, 7, 2);
      ctx.fillRect(cx + 9, y - step, 7, 2);
    }

    // Heavy Reinforced Hull
    ctx.fillStyle = '#78350f'; // Rust-orange heavy steel
    ctx.fillRect(cx - 11, cy - 11, 22, 22);
    ctx.fillStyle = '#b45309';
    ctx.fillRect(cx - 9, cy - 9, 18, 18);

    // Hazard Stripes on top plate
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(cx - 7, cy - 6, 14, 4);
    ctx.fillStyle = '#18181b';
    ctx.fillRect(cx - 5, cy - 6, 3, 4);
    ctx.fillRect(cx + 2, cy - 6, 3, 4);

    // Dual Hydraulic Piston Fists
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(cx - 17, cy - 18, 6, 10);
    ctx.fillRect(cx + 11, cy - 18, 6, 10);
    ctx.fillStyle = '#ef4444'; // Red hydraulic actuators
    ctx.fillRect(cx - 15, cy - 15, 2, 4);
    ctx.fillRect(cx + 13, cy - 15, 2, 4);

    // Glowing Central Sensor Slit
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(cx - 5, cy - 10, 10, 3);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(cx - 2, cy - 10, 4, 2);

    this.spriteCache.set(cacheKey, canvas);
    return canvas;
  }

  // =========================================================================
  // 5. ENEMY: KAMIKAZE (VOLATILE PULSE-MINE)
  // =========================================================================
  public static getKamikazeSprite(animFrame: number, isIgniting: boolean): HTMLCanvasElement {
    const frame = animFrame % 4;
    const cacheKey = `kamikaze_${frame}_${isIgniting}`;
    if (this.spriteCache.has(cacheKey)) return this.spriteCache.get(cacheKey)!;

    const size = 34;
    const { canvas, ctx } = this.createPixelCanvas(size, size);
    const cx = size / 2;
    const cy = size / 2;

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.ellipse(cx, cy + 6, 8, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // 8 Radial Magnetic Spikes
    ctx.fillStyle = isIgniting ? '#ef4444' : '#64748b';
    const spikeLen = isIgniting ? 5 : 4;
    ctx.fillRect(cx - 2, cy - 12 - spikeLen, 4, spikeLen); // N
    ctx.fillRect(cx - 2, cy + 12, 4, spikeLen);           // S
    ctx.fillRect(cx - 12 - spikeLen, cy - 2, spikeLen, 4); // W
    ctx.fillRect(cx + 12, cy - 2, spikeLen, 4);           // E
    // Diagonals
    ctx.fillRect(cx - 9, cy - 9, 3, 3);
    ctx.fillRect(cx + 6, cy - 9, 3, 3);
    ctx.fillRect(cx - 9, cy + 6, 3, 3);
    ctx.fillRect(cx + 6, cy + 6, 3, 3);

    // Mine Core Shell
    ctx.fillStyle = '#1e1b4b';
    ctx.beginPath();
    ctx.arc(cx, cy, 9, 0, Math.PI * 2);
    ctx.fill();

    // Flashing Hazard Core
    const flash = isIgniting || (frame % 2 === 0);
    ctx.fillStyle = flash ? '#ff0055' : '#fbbf24';
    ctx.beginPath();
    ctx.arc(cx, cy, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(cx - 2, cy - 2, 4, 4);

    this.spriteCache.set(cacheKey, canvas);
    return canvas;
  }

  // =========================================================================
  // 6. ENEMY: PHANTOM (NEON SHADOW STALKER)
  // =========================================================================
  public static getPhantomSprite(animFrame: number): HTMLCanvasElement {
    const frame = animFrame % 4;
    const cacheKey = `phantom_${frame}`;
    if (this.spriteCache.has(cacheKey)) return this.spriteCache.get(cacheKey)!;

    const size = 36;
    const { canvas, ctx } = this.createPixelCanvas(size, size);
    const cx = size / 2;
    const cy = size / 2;

    // Cloaked shadow
    ctx.fillStyle = 'rgba(139, 92, 246, 0.25)';
    ctx.beginPath();
    ctx.ellipse(cx, cy + 6, 10, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Phase Glitch trail
    ctx.fillStyle = 'rgba(168, 85, 247, 0.3)';
    ctx.fillRect(cx - 8 + (frame % 2) * 2, cy + 4, 16, 4);

    // Hooded Stalker Mantle
    ctx.fillStyle = '#2e1065'; // Dark obsidian cloak
    ctx.fillRect(cx - 7, cy - 8, 14, 16);
    ctx.fillStyle = '#4c1d95';
    ctx.fillRect(cx - 5, cy - 6, 10, 12);

    // Dual Phase Blades (Top-down side daggers)
    ctx.fillStyle = '#c084fc';
    ctx.fillRect(cx - 11, cy - 10, 3, 10);
    ctx.fillRect(cx + 8, cy - 10, 3, 10);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(cx - 10, cy - 12, 1, 4);
    ctx.fillRect(cx + 9, cy - 12, 1, 4);

    // Neon Glitch Eye Slit
    ctx.fillStyle = '#a855f7';
    ctx.fillRect(cx - 4, cy - 6, 8, 2);
    ctx.fillStyle = '#fdf4ff';
    ctx.fillRect(cx - 1, cy - 6, 2, 2);

    this.spriteCache.set(cacheKey, canvas);
    return canvas;
  }

  // =========================================================================
  // 6.5 ENEMY: SHIELDED (AEGIS ENFORCER GUARDIAN)
  // =========================================================================
  public static getShieldedSprite(animFrame: number): HTMLCanvasElement {
    const frame = animFrame % 4;
    const cacheKey = `shielded_${frame}`;
    if (this.spriteCache.has(cacheKey)) return this.spriteCache.get(cacheKey)!;

    const size = 44;
    const { canvas, ctx } = this.createPixelCanvas(size, size);
    const cx = size / 2;
    const cy = size / 2;

    // Heavy circular mech shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.beginPath();
    ctx.ellipse(cx, cy + 9, 14, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    // Reinforced tread actuators
    const step = (frame % 2 === 0) ? 2 : 0;
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(cx - 13, cy - 8 + step, 5, 18);
    ctx.fillRect(cx + 8, cy - 8 - step, 5, 18);

    // Heavy Plated Hull (Deep Cyan/Slate Titanium)
    ctx.fillStyle = '#042f2e'; // Dark Teal
    ctx.fillRect(cx - 10, cy - 10, 20, 20);
    ctx.fillStyle = '#0d9488'; // Vibrant teal
    ctx.fillRect(cx - 8, cy - 8, 16, 16);

    // Glowing Power Reactor Core
    const pulseGlow = (frame === 1 || frame === 3) ? '#22d3ee' : '#06b6d4';
    ctx.fillStyle = pulseGlow;
    ctx.fillRect(cx - 3, cy - 3, 6, 6);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(cx - 1, cy - 1, 2, 2);

    // Heavy Shoulder Shield Projector Pylons
    ctx.fillStyle = '#134e4a';
    ctx.fillRect(cx - 15, cy - 14, 6, 12);
    ctx.fillRect(cx + 9, cy - 14, 6, 12);
    ctx.fillStyle = '#00f0ff';
    ctx.fillRect(cx - 14, cy - 15, 4, 3);
    ctx.fillRect(cx + 10, cy - 15, 4, 3);

    // Projected Hexagonal Energy Shield Barrier (Frontal Arc)
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.85)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx, cy - 2, 17, -Math.PI * 0.85, -Math.PI * 0.15);
    ctx.stroke();

    // Translucent Energy Barrier Fill
    ctx.fillStyle = 'rgba(0, 240, 255, 0.22)';
    ctx.beginPath();
    ctx.arc(cx, cy - 2, 16, -Math.PI * 0.85, -Math.PI * 0.15);
    ctx.closePath();
    ctx.fill();

    // Shield Energy Hex Pips
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(cx - 11, cy - 14, 2, 2);
    ctx.fillRect(cx, cy - 19, 2, 2);
    ctx.fillRect(cx + 9, cy - 14, 2, 2);

    this.spriteCache.set(cacheKey, canvas);
    return canvas;
  }

  // =========================================================================
  // 6.6 ENEMY: SNIPER (RAILGUN LASER DRONE)
  // =========================================================================
  public static getSniperSprite(animFrame: number, isAiming: boolean = false): HTMLCanvasElement {
    const frame = animFrame % 4;
    const cacheKey = `sniper_${frame}_${isAiming}`;
    if (this.spriteCache.has(cacheKey)) return this.spriteCache.get(cacheKey)!;

    const size = 42;
    const { canvas, ctx } = this.createPixelCanvas(size, size);
    const cx = size / 2;
    const cy = size / 2;

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.beginPath();
    ctx.ellipse(cx, cy + 8, 12, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Twin Stabilizer Wings
    ctx.fillStyle = '#1e1b4b';
    ctx.fillRect(cx - 15, cy + 2, 8, 8);
    ctx.fillRect(cx + 7, cy + 2, 8, 8);
    ctx.fillStyle = '#f43f5e';
    ctx.fillRect(cx - 13, cy + 8, 4, 2);
    ctx.fillRect(cx + 9, cy + 8, 4, 2);

    // Aerodynamic Fuselage
    ctx.fillStyle = '#311024';
    ctx.fillRect(cx - 7, cy - 6, 14, 18);
    ctx.fillStyle = '#4c0519';
    ctx.fillRect(cx - 5, cy - 4, 10, 14);

    // Extended High-Velocity Railgun Barrel
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(cx - 2, cy - 18, 4, 14);
    ctx.fillStyle = isAiming ? '#f43f5e' : '#fb7185';
    ctx.fillRect(cx - 1, cy - 17, 2, 12);

    // Glowing Crimson Targeting Optic Eye
    ctx.fillStyle = isAiming ? '#ffffff' : '#f43f5e';
    ctx.fillRect(cx - 3, cy - 2, 6, 4);
    if (isAiming) {
      ctx.fillStyle = '#ffe4e6';
      ctx.fillRect(cx - 1, cy - 1, 2, 2);
    }

    this.spriteCache.set(cacheKey, canvas);
    return canvas;
  }

  // =========================================================================
  // 6.7 ENEMY: TESLA (ELECTRO DISRUPTOR DRONE)
  // =========================================================================
  public static getTeslaSprite(animFrame: number, isDischarging: boolean = false): HTMLCanvasElement {
    const frame = animFrame % 4;
    const cacheKey = `tesla_${frame}_${isDischarging}`;
    if (this.spriteCache.has(cacheKey)) return this.spriteCache.get(cacheKey)!;

    const size = 44;
    const { canvas, ctx } = this.createPixelCanvas(size, size);
    const cx = size / 2;
    const cy = size / 2;

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.beginPath();
    ctx.ellipse(cx, cy + 8, 14, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    // Quad Rotary Electro Coils
    const rot = (frame * Math.PI) / 2;
    ctx.fillStyle = '#581c87';
    for (let i = 0; i < 4; i++) {
      const a = rot + (i * Math.PI) / 2;
      const px = cx + Math.cos(a) * 12;
      const py = cy + Math.sin(a) * 12;
      ctx.fillRect(px - 3, py - 3, 6, 6);
      ctx.fillStyle = isDischarging ? '#c084fc' : '#a855f7';
      ctx.fillRect(px - 1, py - 1, 2, 2);
      ctx.fillStyle = '#581c87';
    }

    // Central Faraday Core
    ctx.fillStyle = '#1e1b4b';
    ctx.beginPath();
    ctx.arc(cx, cy, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = isDischarging ? '#e9d5ff' : '#a855f7';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Glowing Plasma Orb
    ctx.fillStyle = isDischarging ? '#ffffff' : '#c084fc';
    ctx.beginPath();
    ctx.arc(cx, cy, 5, 0, Math.PI * 2);
    ctx.fill();

    this.spriteCache.set(cacheKey, canvas);
    return canvas;
  }

  // =========================================================================
  // 7. BOSS: TITAN MECH OVERLORD
  // =========================================================================
  public static getBossSprite(animFrame: number, phase: number): HTMLCanvasElement {
    const frame = animFrame % 4;
    const cacheKey = `boss_${frame}_${phase}`;
    if (this.spriteCache.has(cacheKey)) return this.spriteCache.get(cacheKey)!;

    const size = 96;
    const { canvas, ctx } = this.createPixelCanvas(size, size);
    const cx = size / 2;
    const cy = size / 2;

    // Giant Boss Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
    ctx.beginPath();
    ctx.ellipse(cx, cy + 18, 38, 18, 0, 0, Math.PI * 2);
    ctx.fill();

    // Caterpillar Treads (Left & Right)
    const treadStep = (frame % 2 === 0) ? 2 : 0;
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(cx - 38, cy - 32, 14, 64);
    ctx.fillRect(cx + 24, cy - 32, 14, 64);
    ctx.fillStyle = '#475569';
    for (let y = cy - 28; y <= cy + 24; y += 8) {
      ctx.fillRect(cx - 38, y + treadStep, 14, 3);
      ctx.fillRect(cx + 24, y - treadStep, 14, 3);
    }

    // Main Armored Chassis
    ctx.fillStyle = '#1e1b4b'; // Dark titanium
    ctx.fillRect(cx - 26, cy - 26, 52, 52);
    ctx.fillStyle = '#312e81';
    ctx.fillRect(cx - 22, cy - 22, 44, 44);

    // Heavy Plating & Reinforced Corners
    ctx.fillStyle = '#4338ca';
    ctx.fillRect(cx - 20, cy - 20, 16, 16);
    ctx.fillRect(cx + 4, cy - 20, 16, 16);
    ctx.fillRect(cx - 20, cy + 4, 16, 16);
    ctx.fillRect(cx + 4, cy + 4, 16, 16);

    // Glowing Overlord Reactor Core (Phase 1 = Orange/Yellow, Phase 2 = Crimson rage)
    const coreColor = (phase >= 2) ? '#ff0055' : '#f59e0b';
    const coreInner = (phase >= 2) ? '#ffffff' : '#fef08a';
    ctx.fillStyle = coreColor;
    ctx.beginPath();
    ctx.arc(cx, cy, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = coreInner;
    ctx.beginPath();
    ctx.arc(cx, cy, 6, 0, Math.PI * 2);
    ctx.fill();

    // Dual Twin Heavy Cannon Barrels (Pointing forward)
    ctx.fillStyle = '#18181b';
    ctx.fillRect(cx - 18, cy - 44, 8, 22);
    ctx.fillRect(cx + 10, cy - 44, 8, 22);
    ctx.fillStyle = '#64748b';
    ctx.fillRect(cx - 16, cy - 44, 4, 4);
    ctx.fillRect(cx + 12, cy - 44, 4, 4);

    // Missile Pods on Shoulders
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(cx - 34, cy - 14, 10, 16);
    ctx.fillRect(cx + 24, cy - 14, 10, 16);
    ctx.fillStyle = '#ef4444'; // Red missile tips
    ctx.fillRect(cx - 32, cy - 12, 2, 2);
    ctx.fillRect(cx - 28, cy - 12, 2, 2);
    ctx.fillRect(cx + 26, cy - 12, 2, 2);
    ctx.fillRect(cx + 30, cy - 12, 2, 2);

    this.spriteCache.set(cacheKey, canvas);
    return canvas;
  }

  // =========================================================================
  // UNIVERSAL TOP-DOWN ROTATED RENDERER
  // =========================================================================
  public static renderSprite(
    ctx: CanvasRenderingContext2D,
    sprite: HTMLCanvasElement,
    screenX: number,
    screenY: number,
    rotation: number,
    scale: number = 1.0
  ) {
    ctx.save();
    ctx.translate(screenX, screenY);
    ctx.rotate(rotation);
    ctx.drawImage(
      sprite,
      -(sprite.width * scale) / 2,
      -(sprite.height * scale) / 2,
      sprite.width * scale,
      sprite.height * scale
    );
    ctx.restore();
  }
}
