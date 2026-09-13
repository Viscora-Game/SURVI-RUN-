import { SHIP_CONFIGS } from '../entities/ShipConfig';
import { PixelArtRenderer } from '../rendering/PixelArtRenderer';
import { skillTree } from '../systems/SkillTree';
import { i18n } from '../i18n';
import { sounds } from '../audio/SoundManager';
import type { ShipId } from '../types';

export class HangarUI {
  private modal: HTMLElement;
  public onCloseCallback?: () => void;

  constructor() {
    let el = document.getElementById('hangar-modal');
    if (!el) {
      el = document.createElement('div');
      el.id = 'hangar-modal';
      el.className = 'drawer-modal hidden';
      document.body.appendChild(el);
    }
    this.modal = el;

    i18n.onChange(() => {
      if (!this.modal.classList.contains('hidden')) {
        this.render();
      }
    });
  }

  public getUnlockedShips(): ShipId[] {
    try {
      const raw = localStorage.getItem('survi_run_unlocked_ships');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed as ShipId[];
        }
      }
    } catch {
      // fallback
    }
    return ['vanguard'];
  }

  public getSelectedShip(): ShipId {
    const saved = localStorage.getItem('survi_run_selected_ship') as ShipId;
    if (saved && SHIP_CONFIGS[saved]) {
      return saved;
    }
    return 'vanguard';
  }

  public open() {
    this.render();
    this.modal.classList.remove('hidden');
    sounds.playFocus();
  }

  public close() {
    this.modal.classList.add('hidden');
    if (this.onCloseCallback) {
      this.onCloseCallback();
    }
  }

  public render() {
    const t = i18n.t as unknown as Record<string, string>;
    const unlockedShips = this.getUnlockedShips();
    const selectedShip = this.getSelectedShip();
    const shards = skillTree.getShards();

    this.modal.innerHTML = `
      <div class="drawer-content hangar-drawer-content">
        <div class="drawer-header">
          <div class="header-left">
            <h2>🚀 ${t.hangarTitle}</h2>
            <span class="sub-label">${t.hangarSubtitle}</span>
          </div>
          <div class="header-right">
            <span class="shard-badge">💎 <strong id="hangar-shards-display">${shards.toLocaleString()}</strong></span>
            <button id="close-hangar-btn" class="drawer-close-btn">✕</button>
          </div>
        </div>

        <div class="hangar-grid">
          ${(Object.keys(SHIP_CONFIGS) as ShipId[]).map((shipId) => {
            const cfg = SHIP_CONFIGS[shipId];
            const isUnlocked = unlockedShips.includes(shipId) || cfg.unlockedByDefault;
            const isSelected = selectedShip === shipId;

            const name = t[cfg.nameKey] || cfg.id;
            const title = t[cfg.titleKey] || '';
            const desc = t[cfg.descKey] || '';
            const startingWeaponName = t[cfg.startingWeapon + '_name'] || cfg.startingWeapon;

            const hpMult = cfg.statModifiers.maxHpMult ?? 1.0;
            const speedMult = cfg.statModifiers.speedMult ?? 1.0;
            const armorBonus = cfg.statModifiers.armorBonus ?? 0;
            const critBonus = cfg.statModifiers.critChanceBonus ?? 0;
            const atkSpdMult = cfg.statModifiers.attackSpeedMult ?? 1.0;

            return `
              <div class="ship-select-card ${isSelected ? 'selected' : ''} ${isUnlocked ? 'unlocked' : 'locked'}" data-ship="${shipId}">
                <div class="ship-card-header">
                  <div class="ship-card-title-group">
                    <h3 class="ship-name">${name}</h3>
                    <span class="ship-title-badge">${title}</span>
                  </div>
                  ${isSelected ? `<span class="active-badge">${t.hangarSelected}</span>` : ''}
                </div>

                <div class="ship-preview-viewport">
                  <canvas id="canvas-ship-${shipId}" class="ship-canvas-preview" width="90" height="90"></canvas>
                </div>

                <p class="ship-desc-text">${desc}</p>

                <div class="ship-loadout-badge">
                  <span class="loadout-label">${t.hangarStartsWeapon}:</span>
                  <strong class="weapon-name">${startingWeaponName}</strong>
                </div>

                <div class="ship-tactical-perk-badge">
                  <div class="perk-header">
                    <span class="perk-icon">⚡</span>
                    <span class="perk-label">${t.hangarSpecialPerk || 'Tactical Trait'}: <strong>${t[cfg.specialPerkKey] || ''}</strong></span>
                  </div>
                  <p class="perk-desc">${t[cfg.specialPerkDescKey] || ''}</p>
                </div>

                <div class="ship-stats-table">
                  <div class="ship-stat-row">
                    <span>${t.hangarStatsHp}</span>
                    <strong>${Math.round(100 * hpMult)} HP</strong>
                  </div>
                  <div class="ship-stat-row">
                    <span>${t.hangarStatsSpeed}</span>
                    <strong class="${speedMult > 1 ? 'pos' : (speedMult < 1 ? 'neg' : '')}">
                      ${Math.round(100 * speedMult)}%
                    </strong>
                  </div>
                  <div class="ship-stat-row">
                    <span>${t.hangarStatsArmor}</span>
                    <strong class="${armorBonus > 0 ? 'pos' : ''}">
                      ${armorBonus > 0 ? '+' + armorBonus : '0'}
                    </strong>
                  </div>
                  <div class="ship-stat-row">
                    <span>${t.hangarStatsCrit}</span>
                    <strong class="${critBonus > 0 ? 'pos' : (critBonus < 0 ? 'neg' : '')}">
                      ${critBonus >= 0 ? '+' : ''}${Math.round(critBonus * 100)}%
                    </strong>
                  </div>
                  <div class="ship-stat-row">
                    <span>${t.hangarStatsAtkSpd}</span>
                    <strong class="${atkSpdMult > 1 ? 'pos' : (atkSpdMult < 1 ? 'neg' : '')}">
                      ${Math.round(atkSpdMult * 100)}%
                    </strong>
                  </div>
                </div>

                <div class="ship-card-action">
                  ${
                    isSelected
                      ? `<button class="ship-action-btn btn-active" disabled>✓ ${t.hangarSelected}</button>`
                      : isUnlocked
                      ? `<button class="ship-action-btn btn-select" data-ship="${shipId}">🚀 ${t.hangarSelect}</button>`
                      : `<button class="ship-action-btn btn-unlock" data-ship="${shipId}" data-cost="${cfg.cost}">
                          🔓 ${t.hangarUnlock} (💎 ${cfg.cost})
                        </button>`
                  }
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;

    // Hook Close Button
    const closeBtn = document.getElementById('close-hangar-btn');
    if (closeBtn) closeBtn.onclick = () => this.close();

    // Draw Ship Pixel Art onto each Card Canvas
    (Object.keys(SHIP_CONFIGS) as ShipId[]).forEach((shipId) => {
      const c = document.getElementById(`canvas-ship-${shipId}`) as HTMLCanvasElement | null;
      if (c) {
        const ctx = c.getContext('2d');
        if (ctx) {
          ctx.imageSmoothingEnabled = false;
          ctx.clearRect(0, 0, c.width, c.height);

          const sprite = PixelArtRenderer.getPlayerSprite(0, false, false, shipId);
          const scale = 1.9;
          const drawW = sprite.width * scale;
          const drawH = sprite.height * scale;
          const ox = (c.width - drawW) / 2;
          const oy = (c.height - drawH) / 2;

          ctx.drawImage(sprite, ox, oy, drawW, drawH);
        }
      }
    });

    // Hook Select Buttons
    this.modal.querySelectorAll('.btn-select').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const shipId = (e.currentTarget as HTMLElement).getAttribute('data-ship') as ShipId;
        if (shipId && SHIP_CONFIGS[shipId]) {
          localStorage.setItem('survi_run_selected_ship', shipId);
          sounds.playFocus();
          sounds.triggerHaptic('light');
          this.render();
        }
      });
    });

    // Hook Unlock Buttons
    this.modal.querySelectorAll('.btn-unlock').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const target = e.currentTarget as HTMLElement;
        const shipId = target.getAttribute('data-ship') as ShipId;
        const cost = parseInt(target.getAttribute('data-cost') || '0', 10);

        if (shipId && SHIP_CONFIGS[shipId]) {
          if (skillTree.getShards() >= cost) {
            skillTree.spendShards(cost);
            const list = this.getUnlockedShips();
            if (!list.includes(shipId)) {
              list.push(shipId);
              localStorage.setItem('survi_run_unlocked_ships', JSON.stringify(list));
            }
            localStorage.setItem('survi_run_selected_ship', shipId);
            sounds.playLevelUp();
            sounds.triggerHaptic('heavy');
            this.render();
          } else {
            sounds.playHit();
            const badge = document.getElementById('hangar-shards-display');
            if (badge) {
              badge.classList.add('error-shake');
              setTimeout(() => badge.classList.remove('error-shake'), 600);
            }
          }
        }
      });
    });
  }
}
