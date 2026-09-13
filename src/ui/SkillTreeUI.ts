import { skillTree, type SkillTreeCategory, type SkillNode } from '../systems/SkillTree';
import { ConstellationRenderer, type Viewport } from '../rendering/ConstellationRenderer';
import { SkillGlyphRenderer } from '../rendering/SkillGlyphRenderer';
import { i18n } from '../i18n';
import { sounds } from '../audio/SoundManager';

export class SkillTreeUI {
  private container: HTMLElement;
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private renderer: ConstellationRenderer;
  private viewport: Viewport;

  private isDragging: boolean = false;
  private dragStartX: number = 0;
  private dragStartY: number = 0;
  private camStartX: number = 0;
  private camStartY: number = 0;
  private hasMovedSignificantly: boolean = false;

  private hoveredNode: SkillNode | null = null;
  private tooltipEl: HTMLElement | null = null;

  // Smooth camera animation
  private isCameraAnimating: boolean = false;
  private targetCamX: number = 0;
  private targetCamY: number = 0;
  private targetZoom: number = 0.85;

  private animFrameId: number = 0;
  private lastTime: number = 0;
  public onCloseCallback?: () => void;

  constructor() {
    let el = document.getElementById('skill-tree-modal');
    if (!el) {
      el = document.createElement('div');
      el.id = 'skill-tree-modal';
      el.className = 'constellation-modal hidden';
      document.body.appendChild(el);
    }
    this.container = el;
    this.container.className = 'constellation-modal hidden';

    this.renderer = new ConstellationRenderer();
    this.viewport = {
      x: 0,
      y: 0,
      zoom: 0.9,
      width: window.innerWidth,
      height: window.innerHeight,
    };

    window.addEventListener('resize', () => {
      if (!this.container.classList.contains('hidden')) {
        this.resizeCanvas();
      }
    });

    i18n.onChange(() => {
      if (!this.container.classList.contains('hidden')) {
        this.updateTexts();
        if (this.hoveredNode) this.updateTooltip(this.hoveredNode);
      }
    });
  }

  public open() {
    this.initDOM();
    this.container.classList.remove('hidden');
    this.resizeCanvas();
    this.updateHUDValues();
    this.updateTexts();

    // Default to Center Nexus
    this.viewport.x = 0;
    this.viewport.y = 0;
    this.viewport.zoom = 0.9;
    this.isCameraAnimating = false;

    sounds.playFocus();

    this.lastTime = performance.now();
    this.startLoop();
  }

  public close() {
    this.stopLoop();
    this.container.classList.add('hidden');
    if (this.tooltipEl) {
      this.tooltipEl.classList.add('hidden');
    }
    if (this.onCloseCallback) {
      this.onCloseCallback();
    }
  }

  private initDOM() {
    const t = i18n.t as unknown as Record<string, string>;
    const shards = skillTree.getShards();
    const allocated = skillTree.getTotalAllocatedPoints();

    this.container.innerHTML = `
      <div class="constellation-wrapper">
        <!-- Interactive Fullscreen Celestial Canvas -->
        <canvas id="constellation-canvas"></canvas>

        <!-- Top Header & Navigation Bar -->
        <div class="constellation-top-bar">
          <div class="constellation-brand">
            <div class="brand-tag"><span class="constellation-dot"></span> <span id="constellation-tag">${t.stBrandTag}</span></div>
            <h2 id="constellation-title" class="constellation-title">${t.skillTreeTitle}</h2>
          </div>

          <!-- Quadrant Quick Jump Navigation Pills -->
          <div class="cluster-nav-pills">
            <button class="cluster-pill btn-warfare" data-cluster="warfare" id="pill-btn-warfare" title="${t.tipWarfare}">
              <span class="pill-icon">⚔️</span>
              <span class="pill-text" id="pill-warfare">${t.cat_warfare}</span>
            </button>
            <button class="cluster-pill btn-defense" data-cluster="defense" id="pill-btn-defense" title="${t.tipDefense}">
              <span class="pill-icon">🛡️</span>
              <span class="pill-text" id="pill-defense">${t.cat_defense}</span>
            </button>
            <button class="cluster-pill btn-mobility" data-cluster="mobility" id="pill-btn-mobility" title="${t.tipMobility}">
              <span class="pill-icon">⚡</span>
              <span class="pill-text" id="pill-mobility">${t.cat_mobility}</span>
            </button>
            <button class="cluster-pill btn-economy" data-cluster="economy" id="pill-btn-economy" title="${t.tipEconomy}">
              <span class="pill-icon">💎</span>
              <span class="pill-text" id="pill-economy">${t.cat_economy}</span>
            </button>
            <button class="cluster-pill btn-nexus" data-cluster="nexus" id="pill-btn-nexus" title="${t.tipNexus}">
              <span class="pill-icon">🎯</span>
              <span class="pill-text" id="pill-nexus">${t.nexusLabel}</span>
            </button>
          </div>

          <!-- Top-Right Wallet & Actions -->
          <div class="constellation-right-bar">
            <div class="constellation-stat-badge shard-badge" id="st-shards-badge" title="${t.tipShards}">
              <span class="badge-icon">💎</span>
              <strong id="st-shards-display" class="badge-val">${shards.toLocaleString()}</strong>
              <span class="badge-unit" id="st-shards-unit">${t.shardsUnit}</span>
            </div>

            <div class="constellation-stat-badge points-badge" id="st-points-badge" title="${t.tipPoints}">
              <span class="badge-icon">⭐</span>
              <strong id="st-points-display" class="badge-val">${allocated} / 104</strong>
            </div>

            <button id="st-respec-btn" class="constellation-action-btn respec-btn" title="${t.tipRespec}">
              <span class="btn-icon">🔄</span>
              <span id="st-respec-text">${t.respecBtn}</span>
            </button>

            <button id="st-close-btn" class="constellation-close-btn" title="${t.tipClose}">✕</button>
          </div>
        </div>

        <!-- Bottom Left Navigation Controls & Legend -->
        <div class="constellation-bottom-bar">
          <div class="zoom-controls">
            <button id="st-zoom-in" class="zoom-btn" title="${t.tipZoomIn}">+</button>
            <button id="st-zoom-out" class="zoom-btn" title="${t.tipZoomOut}">-</button>
            <button id="st-recenter" class="zoom-btn center-btn" title="${t.tipRecenter}">🎯</button>
          </div>
          <div class="controls-legend" id="st-controls-legend">
            <span>🖱️ <strong id="lbl-drag">${t.legendDrag}</strong> ${t.legendDragAction}</span>
            <span class="legend-sep">•</span>
            <span>🔍 <strong id="lbl-scroll">${t.legendScroll}</strong> ${t.legendScrollAction}</span>
            <span class="legend-sep">•</span>
            <span>⚡ <strong id="lbl-click">${t.legendClick}</strong> ${t.legendClickAction}</span>
          </div>
        </div>

        <!-- Path of Exile 2 Floating Tooltip Inspection Card -->
        <div id="st-tooltip" class="poe-tooltip hidden"></div>
      </div>
    `;

    this.canvas = document.getElementById('constellation-canvas') as HTMLCanvasElement;
    this.ctx = this.canvas.getContext('2d');
    this.tooltipEl = document.getElementById('st-tooltip');

    this.attachEvents();
  }

  private resizeCanvas() {
    if (!this.canvas) return;
    this.viewport.width = window.innerWidth;
    this.viewport.height = window.innerHeight;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  private updateHUDValues() {
    const shardsEl = document.getElementById('st-shards-display');
    if (shardsEl) shardsEl.textContent = skillTree.getShards().toLocaleString();

    const pointsEl = document.getElementById('st-points-display');
    if (pointsEl) pointsEl.textContent = `${skillTree.getTotalAllocatedPoints()} / 104`;
  }

  private updateTexts() {
    const t = i18n.t;
    const tagEl = document.getElementById('constellation-tag');
    if (tagEl) tagEl.textContent = t.stBrandTag;

    const titleEl = document.getElementById('constellation-title');
    if (titleEl) titleEl.textContent = t.skillTreeTitle;

    const pillWarfare = document.getElementById('pill-warfare');
    if (pillWarfare) pillWarfare.textContent = t.cat_warfare;
    const pillBtnWarfare = document.getElementById('pill-btn-warfare');
    if (pillBtnWarfare) pillBtnWarfare.title = t.tipWarfare;

    const pillDefense = document.getElementById('pill-defense');
    if (pillDefense) pillDefense.textContent = t.cat_defense;
    const pillBtnDefense = document.getElementById('pill-btn-defense');
    if (pillBtnDefense) pillBtnDefense.title = t.tipDefense;

    const pillMobility = document.getElementById('pill-mobility');
    if (pillMobility) pillMobility.textContent = t.cat_mobility;
    const pillBtnMobility = document.getElementById('pill-btn-mobility');
    if (pillBtnMobility) pillBtnMobility.title = t.tipMobility;

    const pillEconomy = document.getElementById('pill-economy');
    if (pillEconomy) pillEconomy.textContent = t.cat_economy;
    const pillBtnEconomy = document.getElementById('pill-btn-economy');
    if (pillBtnEconomy) pillBtnEconomy.title = t.tipEconomy;

    const pillNexus = document.getElementById('pill-nexus');
    if (pillNexus) pillNexus.textContent = t.nexusLabel;
    const pillBtnNexus = document.getElementById('pill-btn-nexus');
    if (pillBtnNexus) pillBtnNexus.title = t.tipNexus;

    const shardsUnit = document.getElementById('st-shards-unit');
    if (shardsUnit) shardsUnit.textContent = t.shardsUnit;
    const shardsBadge = document.getElementById('st-shards-badge');
    if (shardsBadge) shardsBadge.title = t.tipShards;

    const pointsBadge = document.getElementById('st-points-badge');
    if (pointsBadge) pointsBadge.title = t.tipPoints;

    const respecText = document.getElementById('st-respec-text');
    if (respecText) respecText.textContent = t.respecBtn;
    const respecBtn = document.getElementById('st-respec-btn');
    if (respecBtn) respecBtn.title = t.tipRespec;

    const closeBtn = document.getElementById('st-close-btn');
    if (closeBtn) closeBtn.title = t.tipClose;

    const zoomIn = document.getElementById('st-zoom-in');
    if (zoomIn) zoomIn.title = t.tipZoomIn;
    const zoomOut = document.getElementById('st-zoom-out');
    if (zoomOut) zoomOut.title = t.tipZoomOut;
    const recenter = document.getElementById('st-recenter');
    if (recenter) recenter.title = t.tipRecenter;

    const legendEl = document.getElementById('st-controls-legend');
    if (legendEl) {
      legendEl.innerHTML = `
        <span>🖱️ <strong id="lbl-drag">${t.legendDrag}</strong> ${t.legendDragAction}</span>
        <span class="legend-sep">•</span>
        <span>🔍 <strong id="lbl-scroll">${t.legendScroll}</strong> ${t.legendScrollAction}</span>
        <span class="legend-sep">•</span>
        <span>⚡ <strong id="lbl-click">${t.legendClick}</strong> ${t.legendClickAction}</span>
      `;
    }
  }

  private attachEvents() {
    if (!this.canvas) return;

    // Close Button
    const closeBtn = document.getElementById('st-close-btn');
    if (closeBtn) closeBtn.onclick = () => this.close();

    // Respec Button
    const respecBtn = document.getElementById('st-respec-btn');
    if (respecBtn) {
      respecBtn.onclick = () => {
        const confirmMsg = i18n.t.respecConfirm;

        if (confirm(confirmMsg)) {
          skillTree.respecAll();
          sounds.playLevelUp();
          this.updateHUDValues();
          if (this.hoveredNode) this.updateTooltip(this.hoveredNode);
        }
      };
    }

    // Zoom Buttons
    const zoomInBtn = document.getElementById('st-zoom-in');
    if (zoomInBtn) zoomInBtn.onclick = () => this.zoomAtCenter(1.2);

    const zoomOutBtn = document.getElementById('st-zoom-out');
    if (zoomOutBtn) zoomOutBtn.onclick = () => this.zoomAtCenter(0.83);

    const recenterBtn = document.getElementById('st-recenter');
    if (recenterBtn) recenterBtn.onclick = () => this.animateCameraTo(0, 0, 0.9);

    // Cluster Jump Pills
    const clusterPills = this.container.querySelectorAll('.cluster-pill[data-cluster]');
    clusterPills.forEach((pill) => {
      pill.addEventListener('click', (e) => {
        const target = (e.currentTarget as HTMLElement).getAttribute('data-cluster');
        sounds.playSlice();
        switch (target) {
          case 'warfare':
            this.animateCameraTo(-560, -560, 0.95);
            break;
          case 'defense':
            this.animateCameraTo(560, -560, 0.95);
            break;
          case 'mobility':
            this.animateCameraTo(-560, 560, 0.95);
            break;
          case 'economy':
            this.animateCameraTo(560, 560, 0.95);
            break;
          case 'nexus':
            this.animateCameraTo(0, 0, 0.9);
            break;
        }
      });
    });

    // Mouse / Touch Drag and Interaction
    this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
    window.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    window.addEventListener('mouseup', (e) => this.handleMouseUp(e));
    this.canvas.addEventListener('wheel', (e) => this.handleWheel(e), { passive: false });

    // Touch Support
    this.canvas.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: false });
    this.canvas.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: false });
    this.canvas.addEventListener('touchend', (e) => this.handleTouchEnd(e));
  }

  // =========================================================================
  // CAMERA PAN & ZOOM
  // =========================================================================
  private handleMouseDown(e: MouseEvent) {
    this.isDragging = true;
    this.hasMovedSignificantly = false;
    this.dragStartX = e.clientX;
    this.dragStartY = e.clientY;
    this.camStartX = this.viewport.x;
    this.camStartY = this.viewport.y;
    this.isCameraAnimating = false;
  }

  private handleMouseMove(e: MouseEvent) {
    const mx = e.clientX;
    const my = e.clientY;

    if (this.isDragging) {
      const dx = mx - this.dragStartX;
      const dy = my - this.dragStartY;
      if (Math.hypot(dx, dy) > 4) {
        this.hasMovedSignificantly = true;
      }
      this.viewport.x = this.camStartX - dx / this.viewport.zoom;
      this.viewport.y = this.camStartY - dy / this.viewport.zoom;
    }

    // Hit test node under mouse
    const worldPos = this.screenToWorld(mx, my);
    const nodes = skillTree.getAllNodes();
    const hit = this.renderer.hitTest(nodes, worldPos.x, worldPos.y);

    if (hit !== this.hoveredNode) {
      this.hoveredNode = hit;
      if (hit) {
        sounds.playSlice();
        this.updateTooltip(hit);
        this.positionTooltip(mx, my);
      } else {
        if (this.tooltipEl) this.tooltipEl.classList.add('hidden');
      }
    } else if (hit) {
      this.positionTooltip(mx, my);
    }
  }

  private handleMouseUp(_e: MouseEvent) {
    if (this.isDragging && !this.hasMovedSignificantly && this.hoveredNode) {
      // Clicked on a node!
      this.onNodeClicked(this.hoveredNode);
    }
    this.isDragging = false;
  }

  private handleWheel(e: WheelEvent) {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.14 : 0.88;
    this.zoomAtScreenPoint(e.clientX, e.clientY, zoomFactor);
  }

  private zoomAtCenter(factor: number) {
    this.zoomAtScreenPoint(this.viewport.width / 2, this.viewport.height / 2, factor);
  }

  private zoomAtScreenPoint(screenX: number, screenY: number, factor: number) {
    const oldZoom = this.viewport.zoom;
    const newZoom = Math.max(0.38, Math.min(1.85, oldZoom * factor));
    if (newZoom === oldZoom) return;

    const worldBefore = this.screenToWorld(screenX, screenY);
    this.viewport.zoom = newZoom;
    const worldAfter = this.screenToWorld(screenX, screenY);

    this.viewport.x += worldBefore.x - worldAfter.x;
    this.viewport.y += worldBefore.y - worldAfter.y;
    this.isCameraAnimating = false;
  }

  private animateCameraTo(targetX: number, targetY: number, targetZoom: number) {
    this.targetCamX = targetX;
    this.targetCamY = targetY;
    this.targetZoom = targetZoom;
    this.isCameraAnimating = true;
  }

  // Touch Support
  private lastTouchDist: number = 0;
  private handleTouchStart(e: TouchEvent) {
    if (e.touches.length === 1) {
      const t = e.touches[0];
      this.isDragging = true;
      this.hasMovedSignificantly = false;
      this.dragStartX = t.clientX;
      this.dragStartY = t.clientY;
      this.camStartX = this.viewport.x;
      this.camStartY = this.viewport.y;
    } else if (e.touches.length === 2) {
      this.isDragging = false;
      this.lastTouchDist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
    }
  }

  private handleTouchMove(e: TouchEvent) {
    e.preventDefault();
    if (e.touches.length === 1 && this.isDragging) {
      const t = e.touches[0];
      const dx = t.clientX - this.dragStartX;
      const dy = t.clientY - this.dragStartY;
      if (Math.hypot(dx, dy) > 6) this.hasMovedSignificantly = true;
      this.viewport.x = this.camStartX - dx / this.viewport.zoom;
      this.viewport.y = this.camStartY - dy / this.viewport.zoom;
    } else if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      if (this.lastTouchDist > 0) {
        const factor = dist / this.lastTouchDist;
        const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
        const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
        this.zoomAtScreenPoint(midX, midY, factor);
      }
      this.lastTouchDist = dist;
    }
  }

  private handleTouchEnd(e: TouchEvent) {
    if (e.touches.length === 0) {
      if (this.isDragging && !this.hasMovedSignificantly) {
        const worldPos = this.screenToWorld(this.dragStartX, this.dragStartY);
        const hit = this.renderer.hitTest(skillTree.getAllNodes(), worldPos.x, worldPos.y);
        if (hit) {
          this.hoveredNode = hit;
          this.updateTooltip(hit);
          this.positionTooltip(this.dragStartX, this.dragStartY);
          this.onNodeClicked(hit);
        }
      }
      this.isDragging = false;
      this.lastTouchDist = 0;
    }
  }

  private screenToWorld(sx: number, sy: number): { x: number; y: number } {
    return {
      x: (sx - this.viewport.width / 2) / this.viewport.zoom + this.viewport.x,
      y: (sy - this.viewport.height / 2) / this.viewport.zoom + this.viewport.y,
    };
  }

  // =========================================================================
  // NODE CLICK & ALLOCATION
  // =========================================================================
  private onNodeClicked(node: SkillNode) {
    const canAfford = skillTree.canUpgrade(node.id);

    if (canAfford) {
      const upgraded = skillTree.upgrade(node.id);
      if (upgraded) {
        sounds.playLevelUp();
        this.updateHUDValues();
        this.updateTooltip(node);
      }
    } else {
      sounds.playHurt();
    }
  }

  // =========================================================================
  // TOOLTIP INSPECTION (PoE 2 STYLE)
  // =========================================================================
  private updateTooltip(node: SkillNode) {
    if (!this.tooltipEl) return;

    const t = i18n.t;
    const name = (t as unknown as Record<string, string>)[node.nameKey] || node.id;
    const desc = (t as unknown as Record<string, string>)[node.descKey] || '';
    const isMax = node.currentRank >= node.maxRank;
    const cost = skillTree.getNodeCost(node);
    const isMutex = skillTree.isMutexLocked(node);
    const parentsSatisfied = skillTree.areParentsSatisfied(node);
    const userShards = skillTree.getShards();
    const canAfford = !isMax && !isMutex && parentsSatisfied && userShards >= cost;

    let typeTag = t.tagMinor;
    let typeClass = 'type-minor';
    if (node.nodeType === 'keystone') {
      typeTag = t.tagKeystone;
      typeClass = 'type-keystone';
    } else if (node.nodeType === 'notable') {
      typeTag = t.tagNotable;
      typeClass = 'type-notable';
    }

    const catLabels: Record<SkillTreeCategory, string> = {
      warfare: t.cat_warfare,
      defense: t.cat_defense,
      mobility: t.cat_mobility,
      economy: t.cat_economy,
    };

    let statusHtml = '';
    if (isMax) {
      statusHtml = `<div class="tooltip-status status-maxed">${t.statusMaxed}</div>`;
    } else if (isMutex) {
      statusHtml = `<div class="tooltip-status status-mutex">${t.statusMutex}</div>`;
    } else if (!parentsSatisfied) {
      statusHtml = `<div class="tooltip-status status-locked">${t.statusPrereq}</div>`;
    } else if (canAfford) {
      statusHtml = `
        <div class="tooltip-status status-available">
          <span class="cost-tag">💎 ${cost} ${t.shardsUnit}</span>
          <span class="prompt-tag">${t.promptUpgrade}</span>
        </div>`;
    } else {
      statusHtml = `
        <div class="tooltip-status status-unaffordable">
          <span class="cost-tag">💎 ${cost} ${t.shardsUnit}</span>
          <span class="prompt-tag">${t.promptInsufficient}</span>
        </div>`;
    }

    this.tooltipEl.innerHTML = `
      <div class="tooltip-card ${typeClass}">
        <div class="tooltip-header">
          <div class="tooltip-type-badge">${typeTag}</div>
          <div class="tooltip-title-row">
            <canvas id="tooltip-emblem-canvas" width="44" height="44" class="tooltip-emblem-canvas"></canvas>
            <h3 class="node-name">${name}</h3>
          </div>
          <div class="tooltip-sub">${catLabels[node.category]} • ${t.tierLabel} ${node.tier}</div>
        </div>

        <div class="tooltip-body">
          <div class="rank-row">
            <span class="rank-lbl">${t.rankLabel}</span>
            <strong class="rank-val ${isMax ? 'gold' : ''}">${node.currentRank} / ${node.maxRank}</strong>
          </div>
          <p class="tooltip-desc">${desc}</p>
        </div>

        <div class="tooltip-footer">
          ${statusHtml}
        </div>
      </div>
    `;

    // Render exact high-fidelity circular jewel emblem onto tooltip canvas
    const emblemCanvas = this.tooltipEl.querySelector('#tooltip-emblem-canvas') as HTMLCanvasElement | null;
    if (emblemCanvas) {
      SkillGlyphRenderer.renderGlyphToCanvas(emblemCanvas, node);
    }

    this.tooltipEl.classList.remove('hidden');
  }

  private positionTooltip(screenX: number, screenY: number) {
    if (!this.tooltipEl) return;
    const pad = 18;
    const tw = 320;
    const th = 220;

    let posX = screenX + pad;
    let posY = screenY + pad;

    if (posX + tw > window.innerWidth) {
      posX = screenX - tw - pad;
    }
    if (posY + th > window.innerHeight) {
      posY = screenY - th - pad;
    }

    this.tooltipEl.style.left = `${Math.max(12, posX)}px`;
    this.tooltipEl.style.top = `${Math.max(12, posY)}px`;
  }

  // =========================================================================
  // ANIMATION & RENDER LOOP
  // =========================================================================
  private startLoop() {
    this.animFrameId = requestAnimationFrame((t) => this.loop(t));
  }

  private stopLoop() {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = 0;
    }
  }

  private loop(currentTime: number) {
    const dt = Math.min(0.1, (currentTime - this.lastTime) / 1000);
    this.lastTime = currentTime;

    // Smooth camera easing if animating
    if (this.isCameraAnimating) {
      const lerp = 1 - Math.exp(-9 * dt);
      this.viewport.x += (this.targetCamX - this.viewport.x) * lerp;
      this.viewport.y += (this.targetCamY - this.viewport.y) * lerp;
      this.viewport.zoom += (this.targetZoom - this.viewport.zoom) * lerp;

      if (
        Math.hypot(this.targetCamX - this.viewport.x, this.targetCamY - this.viewport.y) < 2 &&
        Math.abs(this.targetZoom - this.viewport.zoom) < 0.005
      ) {
        this.viewport.x = this.targetCamX;
        this.viewport.y = this.targetCamY;
        this.viewport.zoom = this.targetZoom;
        this.isCameraAnimating = false;
      }
    }

    if (this.ctx && this.canvas) {
      this.renderer.render(
        this.ctx,
        skillTree.getAllNodes(),
        this.viewport,
        this.hoveredNode,
        (id) => skillTree.canUpgrade(id),
        (n) => skillTree.isMutexLocked(n),
        (n) => skillTree.areParentsSatisfied(n),
        dt
      );
    }

    this.animFrameId = requestAnimationFrame((t) => this.loop(t));
  }
}
