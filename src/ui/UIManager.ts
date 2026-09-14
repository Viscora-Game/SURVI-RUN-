import { icon } from './Icons';
import type { Player } from '../entities/Player';
import type { Weapon } from '../weapons/Weapon';
import type { UpgradeCard, WeaponDamageStats } from '../types';
import { sounds } from '../audio/SoundManager';
import type { InputManager } from '../core/InputManager';
import type { Boss } from '../entities/Boss';
import { i18n } from '../i18n';
import { SkillCardRenderer } from '../rendering/SkillCardRenderer';
import type { SectorConfig } from '../core/MapManager';

export class UIManager {
  private container: HTMLElement;
  private announcementTimeout: number | null = null;
  public onLanguageChange?: () => void;
  public lastPlayer: Player | null = null;
  public lastActiveWeapons: Weapon[] = [];

  constructor() {
    let el = document.getElementById('ui-container');
    if (!el) {
      el = document.createElement('div');
      el.id = 'ui-container';
      document.body.appendChild(el);
    }
    this.container = el;
    this.buildBaseDOM();
    this.attachEvents();

    i18n.onChange(() => {
      this.refreshTexts();
      if (this.onLanguageChange) this.onLanguageChange();
    });

    // Start with HUD hidden (only visible once game starts)
    this.setHUDVisible(false);
  }

  public setHUDVisible(visible: boolean) {
    if (!this.container) return;
    const hudEls = [
      document.getElementById('xp-bar-container'),
      document.getElementById('top-hud'),
      document.getElementById('equipment-tray'),
      document.getElementById('bottom-hud'),
      document.getElementById('touch-dash-btn'),
    ];
    for (const el of hudEls) {
      if (el) {
        if (visible) {
          el.classList.remove('hud-hidden');
        } else {
          el.classList.add('hud-hidden');
        }
      }
    }
  }

  private buildBaseDOM() {
    const t = i18n.t;
    this.container.innerHTML = `
      <!-- Top XP Bar -->
      <div id="xp-bar-container">
        <div id="xp-bar-fill"></div>
        <div id="xp-bar-text">${t.lvl} 1</div>
      </div>

      <!-- Top Stats Bar -->
      <div id="top-hud">
        <div class="hud-stat" id="timer-stat">${icon('timer', 14)} <span id="timer-val">00:00</span></div>
        <div class="hud-stat" id="kills-stat">${icon('skull', 14)} <span id="kills-val">0</span></div>
        <div class="hud-stat" id="coins-stat">${icon('coin', 14)} <span id="coins-val">0</span></div>
        
        <div class="hud-divider"></div>

        <!-- Quick Language Switcher -->
        <button id="lang-toggle-btn" class="hud-pill-btn" title="Toggle Language (EN / TR)">
          ${icon('globe', 13)} <span id="lang-label">${i18n.lang.toUpperCase()}</span>
        </button>

        <!-- Audio Mute -->
        <button id="audio-btn" class="hud-pill-btn" title="Mute/Unmute Audio">
          ${icon(sounds.isMuted ? 'vol-off' : 'vol-on', 14)}
        </button>

        <!-- Pause -->
        <button id="pause-btn" class="hud-pill-btn" title="Pause Game">
          ${icon('pause', 13)}
        </button>
      </div>

      <!-- Dedicated Cinematic Boss Health Bar -->
      <div id="boss-hud" class="boss-hud hidden">
        <div class="boss-info">
          <div class="boss-title-row">
            <span class="boss-skull">${icon('skull', 18)}</span>
            <span id="boss-name">TITAN MECH OVERLORD</span>
          </div>
          <span id="boss-title">IRON COLOSSUS • [PHASE 1]</span>
        </div>
        <div id="boss-hp-container">
          <div id="boss-hp-fill"></div>
          <div class="boss-phase-pip pip-70" title="Phase 2 (70%)"></div>
          <div class="boss-phase-pip pip-35" title="Enraged (35%)"></div>
          <div id="boss-hp-text">2400 / 2400</div>
        </div>
      </div>

      <!-- Equipment Inventory Tray (Top Left) -->
      <div id="equipment-tray">
        <div class="equip-section weapons-section">
          <div class="equip-header">
            <span class="equip-badge weapon-badge">${icon('sword', 13)}</span>
            <span class="equip-label" id="label-weapons">${t.weapons}</span>
          </div>
          <div id="weapon-slots" class="slots-container"></div>
        </div>
        <div class="equip-section passives-section">
          <div class="equip-header">
            <span class="equip-badge passive-badge">${icon('shield', 13)}</span>
            <span class="equip-label" id="label-passives">${t.passives}</span>
          </div>
          <div id="passive-slots" class="slots-container"></div>
        </div>
      </div>

      <!-- Bottom Player HUD -->
      <div id="bottom-hud">
        <div id="hp-container">
          <div id="hp-bar-fill"></div>
          <div id="hp-bar-text">100 / 100</div>
        </div>
        <div id="dash-indicator"><span id="dash-status" class="ready">${t.dashReady}</span></div>
      </div>

      <!-- Announcement Banner -->
      <div id="announcement-banner"></div>

      <!-- Holographic Sector Shift Banner -->
      <div id="sector-shift-banner" class="sector-shift-banner hidden">
        <div class="sector-shift-badge">${icon('warning', 13)} <span id="sector-shift-label">SEKTÖR DÖNÜŞÜMÜ</span> ${icon('warning', 13)}</div>
        <h2 id="sector-shift-name">MAGMA CORE</h2>
        <div id="sector-shift-detail" class="sector-shift-detail">${icon('bolt', 13)} Tehlike Seviyesi: TIER 3  •  ${icon('gem', 13)} Kristal: 1.75x</div>
      </div>

      <!-- Virtual Touch Dash Button (for mobile) -->
      <div id="touch-dash-btn" class="touch-control">DASH</div>

      <!-- Level Up / Card Modal -->
      <div id="modal-backdrop" class="hidden">
        <div id="upgrade-modal" class="modal-card">
          <div class="modal-header">
            <h2 id="modal-title">${t.levelUpTitle}</h2>
            <p id="modal-subtitle" class="modal-subtitle">${t.levelUpSubtitle}</p>
          </div>

          <!-- Collapsible Equipment Drawer (Shown on-demand during skill selection) -->
          <div id="modal-equip-drawer" class="modal-equip-drawer">
            <button id="modal-equip-toggle-btn" class="modal-equip-toggle-btn" type="button">
              <span class="modal-equip-toggle-main">
                <span class="modal-equip-toggle-icon">${icon('shield', 13)}</span>
                <span id="modal-equip-toggle-text">MEVCUT DONANIM</span>
              </span>
              <span class="modal-equip-toggle-arrow">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </span>
            </button>
            <div id="modal-equip-content" class="modal-equip-content collapsed">
              <div class="modal-equip-grid">
                <div class="modal-equip-col">
                  <div class="modal-equip-col-header">
                    <span class="equip-badge weapon-badge">${icon('sword', 12)}</span>
                    <span id="modal-weapons-count-label">${t.weapons}</span>
                  </div>
                  <div id="modal-weapon-slots" class="slots-container"></div>
                </div>
                <div class="modal-equip-col">
                  <div class="modal-equip-col-header">
                    <span class="equip-badge passive-badge">${icon('shield', 12)}</span>
                    <span id="modal-passives-count-label">${t.passives}</span>
                  </div>
                  <div id="modal-passive-slots" class="slots-container"></div>
                </div>
              </div>
            </div>
          </div>

          <div id="cards-container"></div>
        </div>
      </div>

      <!-- Game Over Modal with Tabs -->
      <div id="game-over-modal" class="modal-card hidden">
        <h1 class="game-over-title" id="go-title">${t.gameOverTitle}</h1>

        <div class="go-tabs">
          <button id="go-tab-summary" class="go-tab-btn active">${t.tabStats}</button>
          <button id="go-tab-damage" class="go-tab-btn">${icon('sword', 13)} ${t.tabDamage}</button>
        </div>

        <!-- 1. Summary Pane -->
        <div id="go-pane-summary" class="go-pane active">
          <div class="game-over-stats">
            <div class="stat-row">
              <span id="go-lbl-time">${t.timeSurvived}</span>
              <div class="stat-val-group">
                <strong id="go-time">00:00</strong>
                <span class="go-best-sub" id="go-best-wrap" title="${t.bestRecord}">${icon('trophy', 13)} <span id="go-best-prefix">${i18n.lang === 'tr' ? 'En İyi:' : 'Best:'}</span> <strong id="go-best-time">00:00</strong></span>
              </div>
            </div>
            <div class="stat-row"><span id="go-lbl-kills">${t.enemiesDefeated}</span> <strong id="go-kills">0</strong></div>
            <div class="stat-row"><span id="go-lbl-level">${t.finalLevel}</span> <strong id="go-level">1</strong></div>
            <div class="stat-row shard-row"><span id="go-lbl-shards">${t.shardsEarned}</span> <strong id="go-shards" class="shard-stat-val">+0</strong></div>
            <div class="stat-row"><span id="go-lbl-total-shards">${t.shardsLabel}</span> <strong id="go-total-shards" class="shard-stat-val">0</strong></div>
          </div>
        </div>

        <!-- 2. Combat Damage Analytics Pane -->
        <div id="go-pane-damage" class="go-pane">
          <div id="go-damage-list" class="damage-analytics-list"></div>
        </div>

        <div class="modal-btn-row">
          <button id="restart-btn" class="primary-btn">${t.btnPlayAgain}</button>
          <button id="go-menu-btn" class="secondary-btn">${t.btnMainMenu}</button>
        </div>
      </div>

      <!-- Pause & Settings Modal -->
      <div id="pause-modal" class="modal-card pause-modal-card hidden">
        <div class="pause-header">
          <div class="pause-badge">
            <span class="pause-badge-dot"></span>
            <span id="pause-override-text">${t.tacticalOverride}</span>
          </div>
          <h2 id="pause-title" class="pause-title">${t.pauseTitle}</h2>
          <p class="pause-subtitle" id="pause-subtitle">${t.systemSuspended}</p>
        </div>

        <div class="pause-quick-bar">
          <div class="pause-quick-pill lang-pill">
            <span class="pill-label" id="pause-lang-label">${icon('globe', 13)} ${t.langLabel}</span>
            <div class="lang-switch-container">
              <button id="set-lang-en" class="lang-btn ${i18n.lang === 'en' ? 'active' : ''}">EN</button>
              <button id="set-lang-tr" class="lang-btn ${i18n.lang === 'tr' ? 'active' : ''}">TR</button>
            </div>
          </div>
          <button id="pause-audio-btn" class="pause-quick-pill audio-pill">
            <span id="pause-audio-icon">${icon(sounds.isMuted ? 'vol-off' : 'vol-on', 14)}</span>
            <span id="pause-audio-text">${sounds.isMuted ? t.audioMuted : t.audioOn}</span>
          </button>
        </div>

        <div class="pause-controls">
          <button id="resume-btn" class="pause-action-btn pause-resume-btn">
            <span class="btn-icon">${icon('play', 14)}</span>
            <span id="pause-resume-text">${t.btnResume}</span>
          </button>
          <button id="pause-restart-btn" class="pause-action-btn pause-restart-btn">
            <span class="btn-icon">${icon('refresh', 14)}</span>
            <span id="pause-restart-text">${t.btnRestart}</span>
          </button>
          <button id="pause-menu-btn" class="pause-action-btn pause-menu-btn">
            <span class="btn-icon">${icon('home', 14)}</span>
            <span id="pause-menu-text">${t.btnMainMenu}</span>
          </button>
        </div>
      </div>
    `;
  }

  private attachEvents() {
    // Quick Language toggle on HUD
    const langBtn = document.getElementById('lang-toggle-btn');
    if (langBtn) {
      langBtn.onclick = () => {
        i18n.toggleLanguage();
      };
    }

    // Audio Button on HUD
    const audioBtn = document.getElementById('audio-btn');
    if (audioBtn) {
      audioBtn.onclick = () => {
        const isMuted = sounds.toggleMute();
        audioBtn.innerHTML = icon(isMuted ? 'vol-off' : 'vol-on', 14);
        const pauseAudio = document.getElementById('pause-audio-btn');
        if (pauseAudio) {
          pauseAudio.textContent = isMuted ? i18n.t.audioMuted : i18n.t.audioOn;
        }
      };
    }

    // Language buttons in Settings/Pause
    const enBtn = document.getElementById('set-lang-en');
    const trBtn = document.getElementById('set-lang-tr');
    if (enBtn && trBtn) {
      enBtn.onclick = () => i18n.setLanguage('en');
      trBtn.onclick = () => i18n.setLanguage('tr');
    }
  }

  public refreshTexts() {
    const t = i18n.t;

    const langLabel = document.getElementById('lang-label');
    if (langLabel) langLabel.textContent = i18n.lang.toUpperCase();

    const enBtn = document.getElementById('set-lang-en');
    const trBtn = document.getElementById('set-lang-tr');
    if (enBtn && trBtn) {
      enBtn.className = `lang-btn ${i18n.lang === 'en' ? 'active' : ''}`;
      trBtn.className = `lang-btn ${i18n.lang === 'tr' ? 'active' : ''}`;
    }

    const labelWeapons = document.getElementById('label-weapons');
    if (labelWeapons) labelWeapons.textContent = t.weapons;

    const labelPassives = document.getElementById('label-passives');
    if (labelPassives) labelPassives.textContent = t.passives;

    const pauseTitle = document.getElementById('pause-title');
    if (pauseTitle) pauseTitle.textContent = t.pauseTitle;

    const pauseOverride = document.getElementById('pause-override-text');
    if (pauseOverride) pauseOverride.textContent = t.tacticalOverride;

    const pauseSubtitle = document.getElementById('pause-subtitle');
    if (pauseSubtitle) pauseSubtitle.textContent = t.systemSuspended;

    const pauseLang = document.getElementById('pause-lang-label');
    if (pauseLang) pauseLang.innerHTML = `${icon('globe', 13)} ${t.langLabel}`;

    const resumeBtn = document.getElementById('resume-btn');
    if (resumeBtn) resumeBtn.textContent = t.btnResume;
    const pauseResumeText = document.getElementById('pause-resume-text');
    if (pauseResumeText) pauseResumeText.textContent = t.btnResume;

    const pauseRestart = document.getElementById('pause-restart-btn');
    if (pauseRestart) pauseRestart.textContent = t.btnRestart;
    const pauseRestartText = document.getElementById('pause-restart-text');
    if (pauseRestartText) pauseRestartText.textContent = t.btnRestart;

    const pauseAudioText = document.getElementById('pause-audio-text');
    if (pauseAudioText) pauseAudioText.textContent = sounds.isMuted ? t.audioMuted : t.audioOn;
    const pauseAudioIcon = document.getElementById('pause-audio-icon');
    if (pauseAudioIcon) pauseAudioIcon.innerHTML = icon(sounds.isMuted ? 'vol-off' : 'vol-on', 14);

    const pauseMenuBtn = document.getElementById('pause-menu-btn');
    if (pauseMenuBtn) pauseMenuBtn.textContent = t.btnMainMenu;
    const pauseMenuText = document.getElementById('pause-menu-text');
    if (pauseMenuText) pauseMenuText.textContent = t.btnMainMenu;

    const goTitle = document.getElementById('go-title');
    if (goTitle) goTitle.textContent = t.gameOverTitle;

    const goTime = document.getElementById('go-lbl-time');
    if (goTime) goTime.textContent = t.timeSurvived;

    const goBestPrefix = document.getElementById('go-best-prefix');
    if (goBestPrefix) goBestPrefix.textContent = i18n.lang === 'tr' ? 'En İyi:' : 'Best:';
    const goBestWrap = document.getElementById('go-best-wrap');
    if (goBestWrap) goBestWrap.setAttribute('title', t.bestRecord);

    const goKills = document.getElementById('go-lbl-kills');
    if (goKills) goKills.textContent = t.enemiesDefeated;

    const goLevel = document.getElementById('go-lbl-level');
    if (goLevel) goLevel.textContent = t.finalLevel;

    const goShards = document.getElementById('go-lbl-shards');
    if (goShards) goShards.textContent = t.shardsEarned;

    const goTotalShards = document.getElementById('go-lbl-total-shards');
    if (goTotalShards) goTotalShards.textContent = t.shardsLabel;

    const restartBtn = document.getElementById('restart-btn');
    if (restartBtn) restartBtn.textContent = t.btnPlayAgain;

    const goMenuBtn = document.getElementById('go-menu-btn');
    if (goMenuBtn) goMenuBtn.textContent = t.btnMainMenu;
  }

  public showAnnouncement(text: string) {
    const banner = document.getElementById('announcement-banner');
    if (!banner) return;

    if (this.announcementTimeout) {
      clearTimeout(this.announcementTimeout);
    }

    banner.textContent = text;
    banner.classList.add('visible');

    this.announcementTimeout = window.setTimeout(() => {
      banner.classList.remove('visible');
    }, 3500);
  }

  private sectorBannerTimeout: number | null = null;

  public showSectorBanner(sector: SectorConfig, sectorName: string) {
    const banner = document.getElementById('sector-shift-banner');
    if (!banner) return;

    const label = document.getElementById('sector-shift-label');
    const name = document.getElementById('sector-shift-name');
    const detail = document.getElementById('sector-shift-detail');

    if (label) label.textContent = i18n.lang === 'tr' ? 'SEKTÖR PROTOKOLÜ DÖNÜŞTÜ' : 'SECTOR PROTOCOL SHIFT';
    if (name) {
      name.textContent = sectorName.toUpperCase();
      name.style.color = sector.accentColor;
      name.style.textShadow = `0 0 24px ${sector.accentColor}`;
    }
    if (detail) {
      const diff = i18n.lang === 'tr' ? 'Tehlike' : 'Threat';
      const shard = i18n.lang === 'tr' ? 'Kristal Çarpanı' : 'Shard Multiplier';
      detail.innerHTML = `${icon('bolt', 13)} ${diff}: TIER ${sector.difficulty}  •  ${icon('gem', 13)} ${shard}: ${sector.shardMult}x`;
    }

    banner.classList.remove('hidden');
    banner.classList.add('visible');

    if (this.sectorBannerTimeout) {
      clearTimeout(this.sectorBannerTimeout);
    }
    this.sectorBannerTimeout = window.setTimeout(() => {
      banner.classList.remove('visible');
      setTimeout(() => banner.classList.add('hidden'), 500);
    }, 4000);
  }

  public updateHUD(player: Player, gameTime: number, activeWeapons: Weapon[]) {
    this.lastPlayer = player;
    this.lastActiveWeapons = activeWeapons;
    const t = i18n.t;

    // XP Bar
    const xpFill = document.getElementById('xp-bar-fill');
    const xpText = document.getElementById('xp-bar-text');
    if (xpFill && xpText) {
      const xpPct = Math.min(100, (player.currentXp / player.requiredXp) * 100);
      xpFill.style.width = `${xpPct}%`;
      xpText.textContent = `${t.lvl} ${player.level} (${Math.round(xpPct)}%)`;
    }

    // Timer
    const timerVal = document.getElementById('timer-val');
    if (timerVal) {
      const m = Math.floor(gameTime / 60).toString().padStart(2, '0');
      const s = Math.floor(gameTime % 60).toString().padStart(2, '0');
      timerVal.textContent = `${m}:${s}`;
    }

    // Kills & Coins
    const killsVal = document.getElementById('kills-val');
    if (killsVal) killsVal.textContent = `${player.totalKills}`;

    const coinsVal = document.getElementById('coins-val');
    if (coinsVal) coinsVal.textContent = `${player.coins}`;

    // HP Bar
    const hpFill = document.getElementById('hp-bar-fill');
    const hpText = document.getElementById('hp-bar-text');
    if (hpFill && hpText) {
      const currentHp = player.isAlive && player.stats.hp > 0 ? Math.ceil(player.stats.hp) : 0;
      const hpPct = Math.max(0, Math.min(100, (currentHp / player.stats.maxHp) * 100));
      hpFill.style.width = `${hpPct}%`;
      hpText.textContent = `${currentHp} / ${player.stats.maxHp}`;
    }

    // Dash status
    const dashStatus = document.getElementById('dash-status');
    if (dashStatus) {
      if (player.stats.dashTimer <= 0) {
        dashStatus.textContent = t.dashReady;
        dashStatus.className = 'ready';
      } else {
        dashStatus.textContent = `${t.dashCooling} (${player.stats.dashTimer.toFixed(1)}s)`;
        dashStatus.className = 'cooling';
      }
    }

    // Weapon slots
    const wSlots = document.getElementById('weapon-slots');
    if (wSlots) {
      let html = '';
      for (let i = 0; i < 6; i++) {
        const w = activeWeapons[i];
        if (w) {
          html += `
            <div class="slot-box weapon-slot filled" title="${w.name} (LV.${w.level})">
              <div class="slot-vector-icon">${SkillCardRenderer.getSkillSvg(w.id, 26)}</div>
              <span class="slot-lvl-badge weapon-lvl">LV.${w.level}</span>
            </div>`;
        } else {
          html += `<div class="slot-box weapon-slot empty"><span class="slot-empty-pip"></span></div>`;
        }
      }
      wSlots.innerHTML = html;
    }

    // Passive slots
    const pSlots = document.getElementById('passive-slots');
    if (pSlots) {
      let html = '';
      const passives = Array.from(player.equippedPassives.entries());
      for (let i = 0; i < 6; i++) {
        const p = passives[i];
        if (p) {
          html += `
            <div class="slot-box passive-slot filled" title="${p[0]} (LV.${p[1]})">
              <div class="slot-vector-icon">${SkillCardRenderer.getSkillSvg(p[0], 26)}</div>
              <span class="slot-lvl-badge passive-lvl">LV.${p[1]}</span>
            </div>`;
        } else {
          html += `<div class="slot-box passive-slot empty"><span class="slot-empty-pip"></span></div>`;
        }
      }
      pSlots.innerHTML = html;
    }
  }

  public updateBossHUD(boss: Boss | null) {
    const bossHud = document.getElementById('boss-hud');
    if (!bossHud) return;

    if (boss && boss.isAlive) {
      bossHud.classList.remove('hidden');
      const nameEl = document.getElementById('boss-name');
      const titleEl = document.getElementById('boss-title');
      const fillEl = document.getElementById('boss-hp-fill');
      const textEl = document.getElementById('boss-hp-text');

      if (boss.bossPhase === 3) {
        bossHud.classList.add('enraged');
      } else {
        bossHud.classList.remove('enraged');
      }

      if (nameEl) nameEl.textContent = boss.config.name;
      if (titleEl) {
        const phaseName = boss.bossPhase === 3 ? (i18n.lang === 'tr' ? 'ÖFKE MODU' : 'ENRAGED') : `PHASE ${boss.bossPhase}`;
        titleEl.textContent = `${boss.bossTitle} • [${phaseName}]`;
      }
      if (fillEl && textEl) {
        const pct = Math.max(0, Math.min(100, (boss.hp / boss.maxHp) * 100));
        fillEl.style.width = `${pct}%`;
        textEl.textContent = `${Math.ceil(boss.hp).toLocaleString()} / ${boss.maxHp.toLocaleString()}`;
      }
    } else {
      bossHud.classList.add('hidden');
      bossHud.classList.remove('enraged');
    }
  }

  public renderModalEquipment(player: Player | null, activeWeapons: Weapon[]) {
    const drawer = document.getElementById('modal-equip-drawer');
    if (!drawer) return;

    if (!player) {
      drawer.style.display = 'none';
      return;
    }
    drawer.style.display = 'flex';

    const toggleBtn = document.getElementById('modal-equip-toggle-btn');
    const content = document.getElementById('modal-equip-content');
    const toggleText = document.getElementById('modal-equip-toggle-text');
    const wCountLabel = document.getElementById('modal-weapons-count-label');
    const pCountLabel = document.getElementById('modal-passives-count-label');
    const wSlots = document.getElementById('modal-weapon-slots');
    const pSlots = document.getElementById('modal-passive-slots');

    const t = i18n.t;
    const filledWeapons = activeWeapons ? activeWeapons.filter(Boolean) : [];
    const passives = player.equippedPassives ? Array.from(player.equippedPassives.entries()) : [];

    const wCount = filledWeapons.length;
    const pCount = passives.length;

    if (toggleText) {
      const equipText = i18n.lang === 'tr' ? 'MEVCUT DONANIM' : 'EQUIPPED ARSENAL';
      const wWord = i18n.lang === 'tr' ? 'Silah' : 'Weapons';
      const pWord = i18n.lang === 'tr' ? 'Pasif' : 'Passives';
      toggleText.textContent = `${equipText} (${wCount}/6 ${wWord} • ${pCount}/6 ${pWord})`;
    }

    if (wCountLabel) {
      wCountLabel.textContent = `${t.weapons} (${wCount}/6)`;
    }
    if (pCountLabel) {
      pCountLabel.textContent = `${t.passives} (${pCount}/6)`;
    }

    // Render weapon slots
    if (wSlots) {
      let html = '';
      for (let i = 0; i < 6; i++) {
        const w = activeWeapons[i];
        if (w) {
          html += `
            <div class="slot-box weapon-slot filled" title="${w.name} (LV.${w.level})">
              <div class="slot-vector-icon">${SkillCardRenderer.getSkillSvg(w.id, 28)}</div>
              <span class="slot-lvl-badge weapon-lvl">LV.${w.level}</span>
            </div>`;
        } else {
          html += `<div class="slot-box weapon-slot empty"><span class="slot-empty-pip"></span></div>`;
        }
      }
      wSlots.innerHTML = html;
    }

    // Render passive slots
    if (pSlots) {
      let html = '';
      for (let i = 0; i < 6; i++) {
        const p = passives[i];
        if (p) {
          html += `
            <div class="slot-box passive-slot filled" title="${p[0]} (LV.${p[1]})">
              <div class="slot-vector-icon">${SkillCardRenderer.getSkillSvg(p[0], 28)}</div>
              <span class="slot-lvl-badge passive-lvl">LV.${p[1]}</span>
            </div>`;
        } else {
          html += `<div class="slot-box passive-slot empty"><span class="slot-empty-pip"></span></div>`;
        }
      }
      pSlots.innerHTML = html;
    }

    // Setup toggle behavior
    if (toggleBtn && content) {
      content.classList.add('collapsed');
      toggleBtn.classList.remove('expanded');

      toggleBtn.onclick = (e) => {
        e.stopPropagation();
        const isCollapsed = content.classList.contains('collapsed');
        if (isCollapsed) {
          content.classList.remove('collapsed');
          toggleBtn.classList.add('expanded');
          sounds.playGem();
        } else {
          content.classList.add('collapsed');
          toggleBtn.classList.remove('expanded');
        }
      };
    }
  }

  public showUpgradeModal(
    cards: UpgradeCard[],
    onSelect: (card: UpgradeCard) => void,
    onReroll?: () => void,
    rerollsLeft?: number,
    player?: Player,
    activeWeapons?: Weapon[]
  ) {
    const backdrop = document.getElementById('modal-backdrop');
    const container = document.getElementById('cards-container');
    const modalTitle = document.getElementById('modal-title');
    const modalSubtitle = document.getElementById('modal-subtitle');
    if (!backdrop || !container) return;

    const p = player || this.lastPlayer;
    const w = activeWeapons || this.lastActiveWeapons;
    this.renderModalEquipment(p, w);

    const t = i18n.t;
    if (modalTitle) modalTitle.textContent = t.levelUpTitle;
    if (modalSubtitle) modalSubtitle.textContent = t.levelUpSubtitle;

    container.innerHTML = '';
    backdrop.classList.remove('hidden');

    const selectCard = (card: UpgradeCard) => {
      window.removeEventListener('keydown', keyHandler);
      backdrop.classList.add('hidden');
      onSelect(card);
    };

    cards.forEach((card, idx) => {
      const cardEl = document.createElement('div');
      cardEl.className = `upgrade-card rarity-${card.rarity}`;
      const isW = card.type.startsWith('weapon');
      const isP = card.type.startsWith('passive');
      const catText = isW ? `${icon('sword', 13)} ${i18n.lang === 'tr' ? 'SİLAH' : 'WEAPON'}`
                         : (isP ? `${icon('shield', 13)} ${i18n.lang === 'tr' ? 'PASİF' : 'PASSIVE'}`
                                : `${icon('heart', 13)} ${i18n.lang === 'tr' ? 'ONARIM' : 'REPAIR'}`);
      const catClass = isW ? 'cat-weapon' : (isP ? 'cat-passive' : 'cat-heal');

      cardEl.innerHTML = `
        <div class="card-top">
          <div class="card-vector-wrap">
            ${SkillCardRenderer.getSkillSvg(card.targetId || 'heal', 48)}
          </div>
          <div class="card-badge-col">
            <span class="card-cat-badge ${catClass}">${catText}</span>
            <span class="card-rarity">${card.rarity.toUpperCase()}</span>
          </div>
        </div>
        <div class="card-title">${card.title}</div>
        <div class="card-desc">${card.description}</div>
        <div class="card-hint">[${idx + 1}] ${t.cardHint}</div>
      `;

      cardEl.onclick = () => selectCard(card);
      container.appendChild(cardEl);
    });

    if (onReroll && rerollsLeft !== undefined && rerollsLeft > 0) {
      const rerollContainer = document.createElement('div');
      rerollContainer.className = 'modal-reroll-wrapper';
      rerollContainer.innerHTML = `
        <button id="upgrade-reroll-btn" class="reroll-action-btn">
          <span class="reroll-icon">${icon('dice', 14)}</span>
          <span class="reroll-text">${t.rerollBtn} (${rerollsLeft})</span>
        </button>
      `;
      const rerollBtn = rerollContainer.querySelector('#upgrade-reroll-btn') as HTMLButtonElement;
      if (rerollBtn) {
        rerollBtn.onclick = (e) => {
          e.stopPropagation();
          window.removeEventListener('keydown', keyHandler);
          onReroll();
        };
      }
      container.appendChild(rerollContainer);
    }

    // Keyboard shortcuts (1, 2, 3, R, E, Tab)
    const keyHandler = (e: KeyboardEvent) => {
      if (['Digit1', 'Digit2', 'Digit3', 'Numpad1', 'Numpad2', 'Numpad3'].includes(e.code)) {
        let index = -1;
        if (e.code.includes('1')) index = 0;
        else if (e.code.includes('2')) index = 1;
        else if (e.code.includes('3')) index = 2;

        if (index >= 0 && index < cards.length) {
          selectCard(cards[index]);
        }
      } else if (e.code === 'KeyR' && onReroll && rerollsLeft && rerollsLeft > 0) {
        window.removeEventListener('keydown', keyHandler);
        onReroll();
      } else if (e.code === 'KeyE' || e.code === 'Tab') {
        e.preventDefault();
        const toggleBtn = document.getElementById('modal-equip-toggle-btn');
        if (toggleBtn) toggleBtn.click();
      }
    };
    window.addEventListener('keydown', keyHandler);
  }

  public showChestModal(
    cards: UpgradeCard[],
    onDone: () => void,
    player?: Player,
    activeWeapons?: Weapon[]
  ) {
    const backdrop = document.getElementById('modal-backdrop');
    const container = document.getElementById('cards-container');
    const modalTitle = document.getElementById('modal-title');
    const modalSubtitle = document.getElementById('modal-subtitle');
    if (!backdrop || !container) return;

    sounds.playChest();
    const p = player || this.lastPlayer;
    const w = activeWeapons || this.lastActiveWeapons;
    this.renderModalEquipment(p, w);

    const t = i18n.t;
    if (modalTitle) modalTitle.textContent = t.chestTitle;
    if (modalSubtitle) modalSubtitle.textContent = '';
    container.innerHTML = '';
    backdrop.classList.remove('hidden');

    cards.forEach((card) => {
      const cardEl = document.createElement('div');
      cardEl.className = `upgrade-card rarity-${card.rarity}`;
      const isEvo = card.type === 'weapon_evolution';
      const isW = card.type.startsWith('weapon');
      const isP = card.type.startsWith('passive');
      const catText = isEvo ? `${icon('zap', 13)} ${i18n.lang === 'tr' ? 'EVRİM' : 'EVOLUTION'}`
                            : (isW ? `${icon('sword', 13)} ${i18n.lang === 'tr' ? 'SİLAH' : 'WEAPON'}`
                            : (isP ? `${icon('shield', 13)} ${i18n.lang === 'tr' ? 'PASİF' : 'PASSIVE'}`
                                   : `${icon('heart', 13)} ${i18n.lang === 'tr' ? 'ONARIM' : 'REPAIR'}`));
      const catClass = isEvo ? 'cat-evo' : (isW ? 'cat-weapon' : (isP ? 'cat-passive' : 'cat-heal'));

      cardEl.innerHTML = `
        <div class="card-top">
          <div class="card-vector-wrap">
            ${SkillCardRenderer.getSkillSvg(card.targetId || 'heal', 48)}
          </div>
          <div class="card-badge-col">
            <span class="card-cat-badge ${catClass}">${catText}</span>
            <span class="card-rarity">${card.rarity.toUpperCase()}</span>
          </div>
        </div>
        <div class="card-title">${card.title}</div>
        <div class="card-desc">${card.description}</div>
      `;
      container.appendChild(cardEl);
    });

    const keyHandler = (e: KeyboardEvent) => {
      if (e.code === 'KeyE' || e.code === 'Tab') {
        e.preventDefault();
        const toggleBtn = document.getElementById('modal-equip-toggle-btn');
        if (toggleBtn) toggleBtn.click();
      } else if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        window.removeEventListener('keydown', keyHandler);
        backdrop.classList.add('hidden');
        onDone();
      }
    };
    window.addEventListener('keydown', keyHandler);

    const collectBtn = document.createElement('button');
    collectBtn.className = 'primary-btn collect-btn';
    collectBtn.textContent = t.chestCollect;
    collectBtn.onclick = () => {
      window.removeEventListener('keydown', keyHandler);
      backdrop.classList.add('hidden');
      onDone();
    };
    container.appendChild(collectBtn);
  }

  public showGameOver(
    timeStr: string,
    kills: number,
    level: number,
    shardsEarned: number,
    totalShards: number,
    onRestart: () => void,
    onMainMenu?: () => void,
    damageStats?: WeaponDamageStats[],
    gameDurationSec?: number
  ) {
    const modal = document.getElementById('game-over-modal');
    if (!modal) return;

    sounds.playGameOver();

    // Ensure HUD HP bar is visually forced to 0
    const hpFill = document.getElementById('hp-bar-fill');
    const hpText = document.getElementById('hp-bar-text');
    if (hpFill) hpFill.style.width = '0%';
    if (hpText) {
      const parts = hpText.textContent?.split('/') || [];
      const maxHp = parts[1]?.trim() || '100';
      hpText.textContent = `0 / ${maxHp}`;
    }

    const timeEl = document.getElementById('go-time');
    const killsEl = document.getElementById('go-kills');
    const levelEl = document.getElementById('go-level');
    const shardsEl = document.getElementById('go-shards');
    const totalShardsEl = document.getElementById('go-total-shards');

    if (timeEl) timeEl.textContent = timeStr;

    const bestEl = document.getElementById('go-best-time');
    if (bestEl) {
      const bestSecStr = localStorage.getItem('survi_run_best_time');
      if (bestSecStr) {
        const sec = parseInt(bestSecStr, 10);
        const m = Math.floor(sec / 60).toString().padStart(2, '0');
        const s = (sec % 60).toString().padStart(2, '0');
        bestEl.textContent = `${m}:${s}`;
      } else {
        bestEl.textContent = timeStr;
      }
    }
    if (killsEl) killsEl.textContent = `${kills}`;
    if (levelEl) levelEl.textContent = `${level}`;
    if (shardsEl) shardsEl.textContent = `+${shardsEarned}`;
    if (totalShardsEl) totalShardsEl.textContent = `${totalShards}`;

    // Setup Tabs switching
    const tabSummary = document.getElementById('go-tab-summary');
    const tabDamage = document.getElementById('go-tab-damage');
    const paneSummary = document.getElementById('go-pane-summary');
    const paneDamage = document.getElementById('go-pane-damage');

    if (tabSummary && tabDamage && paneSummary && paneDamage) {
      tabSummary.classList.add('active');
      tabDamage.classList.remove('active');
      paneSummary.classList.add('active');
      paneDamage.classList.remove('active');

      tabSummary.onclick = () => {
        tabSummary.classList.add('active');
        tabDamage.classList.remove('active');
        paneSummary.classList.add('active');
        paneDamage.classList.remove('active');
      };

      tabDamage.onclick = () => {
        tabDamage.classList.add('active');
        tabSummary.classList.remove('active');
        paneDamage.classList.add('active');
        paneSummary.classList.remove('active');
      };
    }

    // Populate Damage Breakdown list
    const damageList = document.getElementById('go-damage-list');
    if (damageList) {
      if (damageStats && damageStats.length > 0) {
        const totalCombatDamage = damageStats.reduce((sum, s) => sum + s.totalDamage, 0) || 1;
        const dur = Math.max(1, gameDurationSec || 1);
        const sorted = [...damageStats].sort((a, b) => b.totalDamage - a.totalDamage);

        damageList.innerHTML = sorted
          .map((stat) => {
            const pct = Math.min(100, Math.max(0, (stat.totalDamage / totalCombatDamage) * 100));
            const dps = stat.totalDamage / dur;
            return `
            <div class="damage-stat-card">
              <div class="dmg-card-head">
                <div class="dmg-card-left">
                  <div class="dmg-vector-icon">${SkillCardRenderer.getSkillSvg(stat.id, 26)}</div>
                  <span class="dmg-card-title">${stat.name}</span>
                </div>
                <div class="dmg-card-right">
                  <strong class="dmg-total-val">${stat.totalDamage.toLocaleString()}</strong>
                  <span class="dmg-pct-badge">${pct.toFixed(1)}%</span>
                </div>
              </div>
              <div class="dmg-bar-track">
                <div class="dmg-bar-fill" style="width: ${pct}%;"></div>
              </div>
              <div class="dmg-card-footer">
                <span>DPS: <strong>${Math.round(dps).toLocaleString()}</strong></span>
                <span>•</span>
                <span>${stat.hits.toLocaleString()} ${i18n.lang === 'tr' ? 'vuruş' : 'hits'}</span>
                <span>•</span>
                <span>${stat.kills.toLocaleString()} ${i18n.lang === 'tr' ? 'leş' : 'kills'}</span>
              </div>
            </div>
          `;
          })
          .join('');
      } else {
        damageList.innerHTML = `<div class="no-damage-msg">${i18n.lang === 'tr' ? 'Kayıtlı savaş hasarı bulunamadı.' : 'No recorded combat damage.'}</div>`;
      }
    }

    modal.classList.remove('hidden');

    const restartBtn = document.getElementById('restart-btn');
    if (restartBtn) {
      restartBtn.onclick = () => {
        modal.classList.add('hidden');
        onRestart();
      };
    }

    const menuBtn = document.getElementById('go-menu-btn');
    if (menuBtn) {
      menuBtn.onclick = () => {
        modal.classList.add('hidden');
        if (onMainMenu) onMainMenu();
      };
    }
  }

  public showAchievementToast(achIcon: string, title: string) {
    let toast = document.getElementById('achievement-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'achievement-toast';
      document.body.appendChild(toast);
    }
    toast.innerHTML = `
      <div class="ach-toast-box">
        <span class="ach-toast-icon">${achIcon}</span>
        <div class="ach-toast-body">
          <span class="ach-toast-badge">${icon('trophy', 14)} ${i18n.t.achUnlockedNotification}</span>
          <span class="ach-toast-title">${title}</span>
        </div>
      </div>
    `;
    toast.classList.remove('hidden');
    toast.classList.add('show');

    setTimeout(() => {
      toast?.classList.remove('show');
      setTimeout(() => toast?.classList.add('hidden'), 400);
    }, 3500);
  }

  public showPause(
    isPaused: boolean,
    onResume: () => void,
    onRestart: () => void,
    onMainMenu?: () => void
  ) {
    const pauseModal = document.getElementById('pause-modal');
    if (!pauseModal) return;

    if (isPaused) {
      this.refreshTexts();
      pauseModal.classList.remove('hidden');
      const resumeBtn = document.getElementById('resume-btn');
      if (resumeBtn) resumeBtn.onclick = onResume;

      const restartBtn = document.getElementById('pause-restart-btn');
      if (restartBtn) {
        restartBtn.onclick = () => {
          pauseModal.classList.add('hidden');
          onRestart();
        };
      }

      const menuBtn = document.getElementById('pause-menu-btn');
      if (menuBtn) {
        menuBtn.onclick = () => {
          pauseModal.classList.add('hidden');
          if (onMainMenu) onMainMenu();
        };
      }

      const audioBtn = document.getElementById('pause-audio-btn');
      const audioText = document.getElementById('pause-audio-text');
      const audioIcon = document.getElementById('pause-audio-icon');
      if (audioBtn) {
        if (audioText) audioText.textContent = sounds.isMuted ? i18n.t.audioMuted : i18n.t.audioOn;
        if (audioIcon) audioIcon.innerHTML = icon(sounds.isMuted ? 'vol-off' : 'vol-on', 14);
        audioBtn.onclick = () => {
          const isMuted = sounds.toggleMute();
          if (audioText) audioText.textContent = isMuted ? i18n.t.audioMuted : i18n.t.audioOn;
          if (audioIcon) audioIcon.innerHTML = icon(isMuted ? 'vol-off' : 'vol-on', 14);
          const hudAudio = document.getElementById('audio-btn');
          if (hudAudio) hudAudio.innerHTML = icon(isMuted ? 'vol-off' : 'vol-on', 14);
        };
      }
    } else {
      pauseModal.classList.add('hidden');
    }
  }

  public renderVirtualJoystick(ctx: CanvasRenderingContext2D, input: InputManager) {
    if (!input.touchJoystickActive) return;

    ctx.save();
    // Base ring
    ctx.strokeStyle = 'rgba(0, 229, 255, 0.4)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(input.touchOrigin.x, input.touchOrigin.y, 50, 0, Math.PI * 2);
    ctx.stroke();

    // Knob
    ctx.fillStyle = 'rgba(0, 229, 255, 0.7)';
    ctx.shadowColor = '#00e5ff';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(input.touchCurrent.x, input.touchCurrent.y, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}
