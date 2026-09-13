import { icon } from './Icons';
import { SECTORS, type SectorId } from '../core/MapManager';
import { i18n } from '../i18n';
import { sounds } from '../audio/SoundManager';

export class SectorSelectUI {
  private container: HTMLElement;
  public selectedSector: SectorId = 'neo_kyoto';
  public onSectorSelect?: (sectorId: SectorId) => void;

  constructor() {
    let el = document.getElementById('sector-modal');
    if (!el) {
      el = document.createElement('div');
      el.id = 'sector-modal';
      el.className = 'drawer-modal hidden';
      document.body.appendChild(el);
    }
    this.container = el;

    const saved = localStorage.getItem('survi_run_sector') as SectorId;
    if (saved && SECTORS[saved]) {
      this.selectedSector = saved;
    }

    i18n.onChange(() => {
      if (!this.container.classList.contains('hidden')) {
        this.render();
      }
    });
  }

  public open() {
    this.render();
    this.container.classList.remove('hidden');
    sounds.playFocus();
  }

  public close() {
    this.container.classList.add('hidden');
  }

  public render() {
    const t = i18n.t as unknown as Record<string, string>;

    const sectorCards = Object.values(SECTORS).map((sec) => {
      const isSelected = sec.id === this.selectedSector;
      const skulls = Array(sec.difficulty).fill(icon('skull', 13)).join(' ');
      const name = t[sec.nameKey] || sec.id;
      const desc = t[sec.descKey] || '';

      return `
        <div class="sector-card ${isSelected ? 'selected' : ''}" data-sector-id="${sec.id}">
          <div class="sector-header">
            <span class="sector-icon">${icon(sec.icon, 22) || sec.icon}</span>
            <div class="sector-meta">
              <h3 class="sector-title">${name}</h3>
              <div class="sector-danger" title="${t.hazardRating || 'Hazard Rating'}">${skulls}</div>
            </div>
          </div>

          <p class="sector-desc">${desc}</p>

          <div class="sector-badges">
            <span class="sec-badge xp-badge">XP: x${sec.xpMult.toFixed(2)}</span>
            <span class="sec-badge shard-badge-pill">${icon('gem', 13)} x${sec.shardMult.toFixed(2)}</span>
          </div>

          <button class="sector-deploy-btn ${isSelected ? 'active' : ''}">
            ${isSelected ? `${icon('check', 13)} ${t.activeSector || 'ACTIVE SECTOR'}` : (t.selectSector || 'SELECT SECTOR')}
          </button>
        </div>
      `;
    }).join('');

    this.container.innerHTML = `
      <div class="drawer-content sector-content">
        <div class="drawer-header">
          <div>
            <span class="st-tag">${t.sectorTag || 'OPERATIONAL ZONES'}</span>
            <h2>${t.sectorTitle || 'MISSION SECTORS'}</h2>
          </div>
          <button id="close-sector-btn" class="drawer-close-btn" aria-label="Close">${icon('close', 14)}</button>
        </div>

        <div class="sector-grid">
          ${sectorCards}
        </div>
      </div>
    `;

    this.bindEvents();
  }

  private bindEvents() {
    const closeBtn = document.getElementById('close-sector-btn');
    if (closeBtn) {
      closeBtn.onclick = () => this.close();
    }

    const cards = this.container.querySelectorAll('.sector-card');
    cards.forEach((card) => {
      card.addEventListener('click', (e) => {
        const id = (e.currentTarget as HTMLElement).getAttribute('data-sector-id') as SectorId;
        if (id && SECTORS[id]) {
          this.selectedSector = id;
          localStorage.setItem('survi_run_sector', id);
          sounds.playChest();
          if (this.onSectorSelect) {
            this.onSectorSelect(id);
          }
          this.render();
        }
      });
    });
  }
}
