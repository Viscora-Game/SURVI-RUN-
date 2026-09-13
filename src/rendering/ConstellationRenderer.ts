import type { SkillNode } from '../systems/SkillTree';
import { SkillGlyphRenderer } from './SkillGlyphRenderer';
import { i18n } from '../i18n';

export interface Viewport {
  x: number;      // Camera center in world space
  y: number;
  zoom: number;   // 0.4 to 1.8
  width: number;  // Canvas width
  height: number; // Canvas height
}

interface CosmicStar {
  x: number;
  y: number;
  size: number;
  alpha: number;
  pulseSpeed: number;
  color: string;
}

export class ConstellationRenderer {
  private stars: CosmicStar[] = [];
  private pulseTimer: number = 0;

  constructor() {
    this.initCosmicBackground();
  }

  private initCosmicBackground() {
    const starColors = ['#ffffff', '#bae6fd', '#fef08a', '#e9d5ff', '#a7f3d0'];
    this.stars = [];
    const radius = 1800;

    for (let i = 0; i < 450; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.sqrt(Math.random()) * radius;
      this.stars.push({
        x: Math.cos(angle) * dist,
        y: Math.sin(angle) * dist,
        size: Math.random() * 2.2 + 0.8,
        alpha: Math.random() * 0.7 + 0.2,
        pulseSpeed: Math.random() * 2 + 1,
        color: starColors[Math.floor(Math.random() * starColors.length)],
      });
    }
  }

  public render(
    ctx: CanvasRenderingContext2D,
    nodes: SkillNode[],
    viewport: Viewport,
    hoveredNode: SkillNode | null,
    canUpgradeFn: (id: string) => boolean,
    isMutexLockedFn: (node: SkillNode) => boolean,
    areParentsSatisfiedFn: (node: SkillNode) => boolean,
    dt: number
  ) {
    this.pulseTimer += dt;

    const { width, height, x: camX, y: camY, zoom } = viewport;

    ctx.save();
    // 1. Clear deep space canvas
    ctx.fillStyle = '#030611';
    ctx.fillRect(0, 0, width, height);

    // Apply Camera Transform
    ctx.translate(width / 2, height / 2);
    ctx.scale(zoom, zoom);
    ctx.translate(-camX, -camY);

    // 2. Render Cosmic Nebulae & Celestial Astrolabe Grids
    this.renderNebulae(ctx);
    this.renderStars(ctx);
    this.renderCelestialRings(ctx);

    // 3. Render Connecting Conduit Lines
    this.renderConduits(ctx, nodes, hoveredNode, canUpgradeFn, isMutexLockedFn, areParentsSatisfiedFn);

    // 4. Render Central Nexus Core
    this.renderCentralNexus(ctx, this.pulseTimer);

    // 5. Render Constellation Nodes
    this.renderNodes(ctx, nodes, hoveredNode, canUpgradeFn, isMutexLockedFn, areParentsSatisfiedFn);

    ctx.restore();
  }

  // =========================================================================
  // COSMIC BACKGROUND & NEBULAE
  // =========================================================================
  private renderNebulae(ctx: CanvasRenderingContext2D) {
    const quadrants = [
      { x: -550, y: -550, color: 'rgba(239, 68, 68, 0.09)' },  // Warfare (Crimson)
      { x: 550, y: -550, color: 'rgba(6, 182, 212, 0.10)' },   // Defense (Cyan)
      { x: -550, y: 550, color: 'rgba(16, 185, 129, 0.09)' },  // Mobility (Emerald)
      { x: 550, y: 550, color: 'rgba(168, 85, 247, 0.10)' },   // Economy (Amethyst)
    ];

    for (const q of quadrants) {
      const grad = ctx.createRadialGradient(q.x, q.y, 40, q.x, q.y, 650);
      grad.addColorStop(0, q.color);
      grad.addColorStop(0.5, q.color.replace('0.09', '0.04').replace('0.10', '0.04'));
      grad.addColorStop(1, 'rgba(3, 6, 17, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(q.x, q.y, 650, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private renderStars(ctx: CanvasRenderingContext2D) {
    for (const star of this.stars) {
      const pulse = Math.sin(this.pulseTimer * star.pulseSpeed) * 0.2;
      const alpha = Math.max(0.1, Math.min(1, star.alpha + pulse));
      ctx.fillStyle = star.color;
      ctx.globalAlpha = alpha;
      ctx.fillRect(star.x, star.y, star.size, star.size);
    }
    ctx.globalAlpha = 1.0;
  }

  private renderCelestialRings(ctx: CanvasRenderingContext2D) {
    ctx.save();
    // Concentric Meridian Orbit Rings
    const ringRadii = [190, 300, 490, 790, 1140];
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.035)';
    ctx.lineWidth = 1;

    for (const r of ringRadii) {
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Quadrant Axis Crosshairs (North, South, East, West, Diagonals)
    ctx.strokeStyle = 'rgba(0, 229, 255, 0.04)';
    ctx.setLineDash([8, 12]);
    ctx.beginPath();
    ctx.moveTo(-1300, 0); ctx.lineTo(1300, 0);
    ctx.moveTo(0, -1300); ctx.lineTo(0, 1300);
    ctx.moveTo(-1000, -1000); ctx.lineTo(1000, 1000);
    ctx.moveTo(-1000, 1000); ctx.lineTo(1000, -1000);
    ctx.stroke();
    ctx.setLineDash([]);

    // Category Constellation Emblems (Faint background wheel artwork)
    const t = i18n.t;
    const clusterWheels = [
      { x: -570, y: -570, color: 'rgba(239, 68, 68, 0.07)', label: t.cat_warfare || 'WARFARE' },
      { x: 570, y: -570, color: 'rgba(6, 182, 212, 0.07)', label: t.cat_defense || 'DEFENSE' },
      { x: -570, y: 570, color: 'rgba(16, 185, 129, 0.07)', label: t.cat_mobility || 'MOBILITY' },
      { x: 570, y: 570, color: 'rgba(168, 85, 247, 0.07)', label: t.cat_economy || 'ECONOMY' },
    ];

    for (const w of clusterWheels) {
      ctx.strokeStyle = w.color;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(w.x, w.y, 240, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = w.color.replace('0.07', '0.14');
      ctx.font = 'bold 11px Orbitron, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(w.label, w.x, w.y - 255);
    }

    ctx.restore();
  }

  // =========================================================================
  // CENTRAL NEXUS CORE (0, 0)
  // =========================================================================
  private renderCentralNexus(ctx: CanvasRenderingContext2D, time: number) {
    ctx.save();
    const pulse = Math.sin(time * 3) * 4;

    // Glowing Radial Halo
    const grad = ctx.createRadialGradient(0, 0, 10, 0, 0, 70);
    grad.addColorStop(0, 'rgba(0, 240, 255, 0.8)');
    grad.addColorStop(0.5, 'rgba(56, 189, 248, 0.3)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, 0, 70 + pulse, 0, Math.PI * 2);
    ctx.fill();

    // 8-Point Compass Star Rays
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.7)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI) / 4 + time * 0.15;
      const rOuter = (i % 2 === 0) ? 36 : 24;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(angle) * rOuter, Math.sin(angle) * rOuter);
      ctx.stroke();
    }

    // Core Gem
    ctx.fillStyle = '#040711';
    ctx.beginPath();
    ctx.arc(0, 0, 16, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#00f0ff';
    ctx.beginPath();
    ctx.arc(0, 0, 10, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, 0, 4, 0, Math.PI * 2);
    ctx.fill();

    // Nexus Label
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 9px Orbitron, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(i18n.t.nexusCore || 'NEXUS CORE', 0, 28);

    ctx.restore();
  }

  // =========================================================================
  // CONDUITS (GLOWING LINES)
  // =========================================================================
  private renderConduits(
    ctx: CanvasRenderingContext2D,
    nodes: SkillNode[],
    hoveredNode: SkillNode | null,
    _canUpgradeFn: (id: string) => boolean,
    isMutexLockedFn: (node: SkillNode) => boolean,
    areParentsSatisfiedFn: (node: SkillNode) => boolean
  ) {
    const nodeMap = new Map<string, SkillNode>();
    nodes.forEach((n) => nodeMap.set(n.id, n));

    const activeConduits: { x1: number; y1: number; x2: number; y2: number }[] = [];

    for (const node of nodes) {
      // Determine parents
      const parents: { x: number; y: number; rank: number }[] = [];
      if (!node.parents || node.parents.length === 0) {
        // Connected to Central Nexus (0, 0)
        parents.push({ x: 0, y: 0, rank: 1 });
      } else {
        for (const pId of node.parents) {
          const p = nodeMap.get(pId);
          if (p) parents.push({ x: p.x, y: p.y, rank: p.currentRank });
        }
      }

      for (const p of parents) {
        const isChildAllocated = node.currentRank > 0;
        const isParentAllocated = p.rank > 0;
        const isMutex = isMutexLockedFn(node);
        const isReadyToUnlock = isParentAllocated && areParentsSatisfiedFn(node) && !isMutex && !isChildAllocated;
        const isHighlighted = hoveredNode && (hoveredNode.id === node.id || (hoveredNode.parents && hoveredNode.parents.includes(node.id)));

        ctx.save();

        // 1. Structural Substrate Rail (Dark Steel Track - Guarantees High Visibility)
        ctx.strokeStyle = 'rgba(15, 23, 42, 0.95)';
        ctx.lineWidth = 5.2;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(node.x, node.y);
        ctx.stroke();

        // Subtle outer border highlight for track
        ctx.strokeStyle = 'rgba(51, 65, 85, 0.35)';
        ctx.lineWidth = 5.8;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(node.x, node.y);
        ctx.stroke();

        // 2. State-Dependent Core Conduit Wire
        if (isChildAllocated && isParentAllocated) {
          // ACTIVE CONDUIT: High-power molten laser conduit
          ctx.strokeStyle = '#f97316';
          ctx.shadowColor = '#ea580c';
          ctx.shadowBlur = 14;
          ctx.lineWidth = 4.2;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(node.x, node.y);
          ctx.stroke();

          // White-hot inner core
          ctx.shadowBlur = 0;
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.6;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(node.x, node.y);
          ctx.stroke();

          activeConduits.push({ x1: p.x, y1: p.y, x2: node.x, y2: node.y });
        } else if (isReadyToUnlock || isHighlighted) {
          // PATHABLE / AVAILABLE: Pulsing neon cyan energy highway
          const pulse = Math.sin(this.pulseTimer * 4) * 0.25 + 0.75;
          ctx.strokeStyle = `rgba(0, 229, 255, ${pulse * 0.5})`;
          ctx.lineWidth = 6.0;
          ctx.shadowColor = '#00e5ff';
          ctx.shadowBlur = 12;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(node.x, node.y);
          ctx.stroke();

          // Core dashed energetic beam
          ctx.shadowBlur = 6;
          ctx.strokeStyle = '#00f0ff';
          ctx.lineWidth = 2.8;
          ctx.setLineDash([7, 4]);
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(node.x, node.y);
          ctx.stroke();

          // Directional flow indicator mote
          const flowSpeed = 90;
          const dist = Math.hypot(node.x - p.x, node.y - p.y) || 1;
          const ft = ((this.pulseTimer * flowSpeed) % dist) / dist;
          const fx = p.x + (node.x - p.x) * ft;
          const fy = p.y + (node.y - p.y) * ft;
          ctx.fillStyle = '#ffffff';
          ctx.shadowColor = '#00e5ff';
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.arc(fx, fy, 2.8, 0, Math.PI * 2);
          ctx.fill();
        } else if (isMutex) {
          // LOCKED BY MUTEX: Red warning track
          ctx.strokeStyle = 'rgba(239, 68, 68, 0.45)';
          ctx.lineWidth = 2.2;
          ctx.setLineDash([4, 4]);
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(node.x, node.y);
          ctx.stroke();
        } else {
          // INACTIVE / LOCKED: Prominent, clear celestial steel conduit
          ctx.strokeStyle = 'rgba(148, 163, 184, 0.65)';
          ctx.lineWidth = 2.2;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(node.x, node.y);
          ctx.stroke();
        }

        ctx.restore();
      }
    }

    // Moving energy pulse motes on active conduits (with trailing particles)
    ctx.save();
    for (const c of activeConduits) {
      const dx = c.x2 - c.x1;
      const dy = c.y2 - c.y1;
      const dist = Math.hypot(dx, dy) || 1;
      const speed = 85; // px/sec
      const t = ((this.pulseTimer * speed) % dist) / dist;

      const px = c.x1 + dx * t;
      const py = c.y1 + dy * t;

      // Glow Aura
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#f97316';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(px, py, 3.2, 0, Math.PI * 2);
      ctx.fill();

      // Tail mote
      const tailT = Math.max(0, t - 0.04);
      const tx = c.x1 + dx * tailT;
      const ty = c.y1 + dy * tailT;
      ctx.fillStyle = 'rgba(254, 215, 170, 0.7)';
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.arc(tx, ty, 2.0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // =========================================================================
  // NODES RENDERING
  // =========================================================================
  private renderNodes(
    ctx: CanvasRenderingContext2D,
    nodes: SkillNode[],
    hoveredNode: SkillNode | null,
    canUpgradeFn: (id: string) => boolean,
    isMutexLockedFn: (node: SkillNode) => boolean,
    areParentsSatisfiedFn: (node: SkillNode) => boolean
  ) {
    for (const node of nodes) {
      const isAllocated = node.currentRank > 0;
      const isMaxed = node.currentRank >= node.maxRank;
      const canUpgrade = canUpgradeFn(node.id);
      const isMutex = isMutexLockedFn(node);
      const isPathable = areParentsSatisfiedFn(node) && !isMutex && !isAllocated;
      const isHovered = hoveredNode?.id === node.id;

      ctx.save();
      ctx.translate(node.x, node.y);

      // Node Radius based on Type: increased for high visibility and sharp circular icon art
      const radius = node.nodeType === 'keystone' ? 34 : (node.nodeType === 'notable' ? 24 : 17);

      // 1. Outer Glow Aura for active / available nodes
      if (isAllocated) {
        ctx.fillStyle = isMaxed ? 'rgba(251, 191, 36, 0.35)' : 'rgba(249, 115, 22, 0.3)';
        ctx.beginPath();
        ctx.arc(0, 0, radius + 10, 0, Math.PI * 2);
        ctx.fill();
      } else if (canUpgrade) {
        const pulse = Math.sin(this.pulseTimer * 4) * 3;
        ctx.fillStyle = 'rgba(0, 229, 255, 0.28)';
        ctx.beginPath();
        ctx.arc(0, 0, radius + 8 + pulse, 0, Math.PI * 2);
        ctx.fill();
      }

      // 2. Keystone Unique Outer Halo / Notches
      if (node.nodeType === 'keystone') {
        const spin = this.pulseTimer * 0.4;
        ctx.strokeStyle = isAllocated ? '#fbbf24' : 'rgba(0, 229, 255, 0.6)';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.arc(0, 0, radius + 6, spin, spin + Math.PI * 1.5);
        ctx.stroke();

        // Keystone Spikes / Sun rays
        for (let k = 0; k < 6; k++) {
          const rayAngle = (k * Math.PI) / 3 + spin;
          ctx.beginPath();
          ctx.moveTo(Math.cos(rayAngle) * (radius + 2), Math.sin(rayAngle) * (radius + 2));
          ctx.lineTo(Math.cos(rayAngle) * (radius + 8), Math.sin(rayAngle) * (radius + 8));
          ctx.stroke();
        }
      }

      // 3. Notable Node Decorated Outer Flanges
      if (node.nodeType === 'notable') {
        ctx.strokeStyle = isAllocated ? '#f97316' : 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1.6;
        for (let n = 0; n < 4; n++) {
          const flangeAngle = (n * Math.PI) / 2 + Math.PI / 4;
          ctx.beginPath();
          ctx.arc(Math.cos(flangeAngle) * radius, Math.sin(flangeAngle) * radius, 3.2, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      // 4. Render Bespoke Circular Vector Emblem (100% Circular Clipped, Zero Emojis)
      SkillGlyphRenderer.renderNodeGlyph(
        ctx,
        node,
        radius,
        isAllocated,
        canUpgrade,
        isMaxed,
        isMutex,
        this.pulseTimer
      );

      // 5. Node Border Ring (PoE 2 Styling - Outer metallic bevel)
      let borderColor = 'rgba(148, 163, 184, 0.45)';
      let borderWidth = 2.2;

      if (isMaxed) {
        borderColor = '#fbbf24'; // Gold
        borderWidth = 3.2;
      } else if (isAllocated) {
        borderColor = '#f97316'; // Burning amber
        borderWidth = 3.0;
      } else if (canUpgrade) {
        borderColor = '#00e5ff'; // Cyan
        borderWidth = 2.6;
      } else if (isPathable) {
        borderColor = 'rgba(0, 229, 255, 0.55)';
      } else if (isMutex) {
        borderColor = 'rgba(239, 68, 68, 0.4)';
      }

      ctx.strokeStyle = borderColor;
      ctx.lineWidth = borderWidth;
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.stroke();

      // 7. Rank Level Pips (Bottom Arc)
      if (node.maxRank > 1) {
        const pipCount = node.maxRank;
        const pipSpacing = Math.min(0.35, 1.2 / pipCount);
        const startAngle = Math.PI / 2 - ((pipCount - 1) * pipSpacing) / 2;

        for (let r = 0; r < pipCount; r++) {
          const angle = startAngle + r * pipSpacing;
          const px = Math.cos(angle) * (radius + 5);
          const py = Math.sin(angle) * (radius + 5);

          ctx.fillStyle = r < node.currentRank ? '#fbbf24' : 'rgba(100, 116, 139, 0.5)';
          ctx.beginPath();
          ctx.arc(px, py, 2.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 8. Hover Highlight Reticle
      if (isHovered) {
        ctx.strokeStyle = '#00f0ff';
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = 14;
        ctx.lineWidth = 2.5;

        // Celestial Target Brackets
        const hR = radius + 9;
        ctx.beginPath();
        ctx.arc(0, 0, hR, -0.4, 0.4);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(0, 0, hR, Math.PI - 0.4, Math.PI + 0.4);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(0, 0, hR, Math.PI / 2 - 0.4, Math.PI / 2 + 0.4);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(0, 0, hR, -Math.PI / 2 - 0.4, -Math.PI / 2 + 0.4);
        ctx.stroke();
      }

      ctx.restore();
    }
  }

  /**
   * Helper to find node under world coordinates
   */
  public hitTest(nodes: SkillNode[], worldX: number, worldY: number): SkillNode | null {
    for (let i = nodes.length - 1; i >= 0; i--) {
      const node = nodes[i];
      const radius = node.nodeType === 'keystone' ? 36 : (node.nodeType === 'notable' ? 26 : 19);
      const dist = Math.hypot(worldX - node.x, worldY - node.y);
      if (dist <= radius) {
        return node;
      }
    }
    return null;
  }
}
