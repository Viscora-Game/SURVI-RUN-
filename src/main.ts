import './style.css';
import { Game } from './core/Game';
import { i18n } from './i18n';
import { sounds } from './audio/SoundManager';
import { SkillTreeUI } from './ui/SkillTreeUI';
import { HangarUI } from './ui/HangarUI';
import { AchievementsUI } from './ui/AchievementsUI';
import { skillTree } from './systems/SkillTree';

const app = document.getElementById('app');
if (!app) throw new Error('Root app element not found');

function renderUI() {
  const t = i18n.t as unknown as Record<string, string>;

  app!.innerHTML = `
    <canvas id="game-canvas"></canvas>
    <div id="ui-container"></div>

    <!-- Elegant Full-Screen Main Menu -->
    <div id="main-menu" class="menu-overlay">
      <!-- Minimalist Top Navigation Bar -->
      <header class="menu-top-bar">
        <div class="menu-quick-tools">
          <span id="nav-shards-badge" class="shard-badge" title="${t.shardsLabel}">💎 <strong>${skillTree.getShards().toLocaleString()}</strong></span>
          <div class="lang-switch-pill">
            <button id="nav-lang-en" class="lang-pill-btn ${i18n.lang === 'en' ? 'active' : ''}">EN</button>
            <button id="nav-lang-tr" class="lang-pill-btn ${i18n.lang === 'tr' ? 'active' : ''}">TR</button>
          </div>
          <button id="nav-audio-btn" class="icon-tool-btn" title="Audio Toggle">
            ${sounds.isMuted ? '🔇' : '🔊'}
          </button>
        </div>
      </header>

      <!-- Center Brand & Clean Actions -->
      <main class="menu-center">
        <h1 class="hero-title">${t.gameTitle}</h1>

        <!-- Clean Action Menu List -->
        <div class="menu-actions">
          <button id="start-btn" class="btn-primary-deploy">
            <span class="btn-shine"></span>
            <span class="btn-icon">▶</span>
            <span class="btn-label">${t.btnStart}</span>
          </button>

          <div class="menu-sub-actions menu-grid-actions">
            <button id="hangar-btn" class="btn-secondary-action">
              <span class="sub-icon">🚀</span> ${t.hangarBtn || t.hangarTitle}
            </button>
            <button id="skill-tree-btn" class="btn-secondary-action">
              <span class="sub-icon">🧬</span> ${t.btnSkillTree}
            </button>
            <button id="achievements-btn" class="btn-secondary-action">
              <span class="sub-icon">🏆</span> ${t.achievementsBtn || t.achievementsTitle}
            </button>
            <button id="settings-btn" class="btn-secondary-action">
              <span class="sub-icon">⚙️</span> ${t.btnSettings}
            </button>
          </div>
        </div>
      </main>

      <!-- Settings & Legal Policies Modal Drawer (Google Play Store & Console Compliant) -->
      <div id="settings-modal" class="drawer-modal hidden">
        <div class="drawer-content settings-drawer-content">
          <div class="drawer-header">
            <h2>${t.settingsTitle}</h2>
            <button id="close-settings-btn" class="drawer-close-btn">✕</button>
          </div>

          <!-- Policy & Settings Navigation Tabs -->
          <div class="settings-nav-tabs">
            <button id="tab-btn-general" class="settings-tab-btn active">
              <span>⚙️</span> ${t.tabGeneral}
            </button>
            <button id="tab-btn-privacy" class="settings-tab-btn">
              <span>🛡️</span> ${t.tabPrivacy}
            </button>
            <button id="tab-btn-terms" class="settings-tab-btn">
              <span>📜</span> ${t.tabTerms}
            </button>
            <button id="tab-btn-safety" class="settings-tab-btn">
              <span>🔒</span> ${t.tabDataSafety}
            </button>
          </div>

          <div class="settings-panes-wrapper">
            <!-- 1. General Settings Pane -->
            <div id="pane-general" class="settings-pane active">
              <div class="settings-list">
                <div class="setting-row">
                  <span>${t.langLabel}</span>
                  <div class="lang-switch-pill">
                    <button id="modal-lang-en" class="lang-pill-btn ${i18n.lang === 'en' ? 'active' : ''}">English</button>
                    <button id="modal-lang-tr" class="lang-pill-btn ${i18n.lang === 'tr' ? 'active' : ''}">Türkçe</button>
                  </div>
                </div>
                <div class="setting-row">
                  <span>${t.soundLabel}</span>
                  <button id="modal-audio-btn" class="drawer-action-btn">
                    ${sounds.isMuted ? t.audioMuted : t.audioOn}
                  </button>
                </div>
                <div class="setting-row">
                  <span>${t.vibrationLabel || 'Haptic Vibration'}</span>
                  <button id="modal-haptics-btn" class="drawer-action-btn">
                    ${sounds.isHapticsEnabled ? (t.vibrationOn || 'ON') : (t.vibrationOff || 'OFF')}
                  </button>
                </div>
                <div class="setting-row danger-row">
                  <div class="setting-desc-box">
                    <span class="danger-title">${t.resetDataLabel}</span>
                    <p class="setting-subtext">${t.resetDataDesc}</p>
                  </div>
                  <button id="modal-reset-data-btn" class="drawer-action-btn btn-danger-action">
                    ${t.btnResetData}
                  </button>
                </div>
              </div>
            </div>

            <!-- 2. Privacy Policy Pane (Google Play Required) -->
            <div id="pane-privacy" class="settings-pane hidden">
              <div class="policy-scroll-box">
                <div class="policy-header-badge">
                  <h3>${t.privacyTitle}</h3>
                  <span class="policy-badge-pill">${t.policyEffectiveDate}</span>
                </div>
                <div class="policy-section">
                  <h4>${t.privacySection1Title}</h4>
                  <p>${t.privacySection1Desc}</p>
                </div>
                <div class="policy-section">
                  <h4>${t.privacySection2Title}</h4>
                  <p>${t.privacySection2Desc}</p>
                </div>
                <div class="policy-section">
                  <h4>${t.privacySection3Title}</h4>
                  <p>${t.privacySection3Desc}</p>
                </div>
                <div class="policy-section">
                  <h4>${t.privacySection4Title}</h4>
                  <p>${t.privacySection4Desc}</p>
                </div>
                <div class="policy-contact-card">
                  <div><strong>${t.developerLabel}:</strong> CyberCore Interactive</div>
                  <div><strong>${t.contactEmailLabel}:</strong> <a href="mailto:viscoragames@gmail.com" class="policy-email-link">viscoragames@gmail.com</a></div>
                </div>
              </div>
            </div>

            <!-- 3. Terms of Service Pane -->
            <div id="pane-terms" class="settings-pane hidden">
              <div class="policy-scroll-box">
                <div class="policy-header-badge">
                  <h3>${t.termsTitle}</h3>
                  <span class="policy-badge-pill">${t.termsEffectiveDate}</span>
                </div>
                <div class="policy-section">
                  <h4>${t.termsSection1Title}</h4>
                  <p>${t.termsSection1Desc}</p>
                </div>
                <div class="policy-section">
                  <h4>${t.termsSection2Title}</h4>
                  <p>${t.termsSection2Desc}</p>
                </div>
                <div class="policy-section">
                  <h4>${t.termsSection3Title}</h4>
                  <p>${t.termsSection3Desc}</p>
                </div>
                <div class="policy-section">
                  <h4>${t.termsSection4Title}</h4>
                  <p>${t.termsSection4Desc}</p>
                </div>
              </div>
            </div>

            <!-- 4. Data Safety Pane (Google Play Store Console Compliant) -->
            <div id="pane-safety" class="settings-pane hidden">
              <div class="policy-scroll-box">
                <div class="policy-header-badge">
                  <h3>${t.dataSafetyTitle}</h3>
                </div>
                <div class="safety-grid">
                  <div class="safety-card">
                    <span class="safety-icon">🔒</span>
                    <div>
                      <strong>${t.safetyEncryptedTitle}</strong>
                      <p>${t.safetyEncryptedDesc}</p>
                    </div>
                  </div>
                  <div class="safety-card">
                    <span class="safety-icon">🚫</span>
                    <div>
                      <strong>${t.safetyNoSharingTitle}</strong>
                      <p>${t.safetyNoSharingDesc}</p>
                    </div>
                  </div>
                  <div class="safety-card">
                    <span class="safety-icon">👶</span>
                    <div>
                      <strong>${t.safetyChildrenTitle}</strong>
                      <p>${t.safetyChildrenDesc}</p>
                    </div>
                  </div>
                  <div class="safety-card">
                    <span class="safety-icon">🗑️</span>
                    <div>
                      <strong>${t.safetyDeletionTitle}</strong>
                      <p>${t.safetyDeletionDesc}</p>
                    </div>
                  </div>
                </div>
                <p class="safety-footer-text">${t.safetyFooterText}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
  const game = new Game(canvas);

  // Hook game completion to update high score
  const originalTriggerGameOver = game['triggerGameOver'].bind(game);
  game['triggerGameOver'] = function() {
    const curTime = Math.floor(game.waveManager.gameTime);
    const prevBest = parseInt(localStorage.getItem('survi_run_best_time') || '0', 10);
    if (curTime > prevBest) {
      localStorage.setItem('survi_run_best_time', curTime.toString());
    }
    originalTriggerGameOver();
  };

  const menu = document.getElementById('main-menu');
  const startBtn = document.getElementById('start-btn');
  const skillTreeBtn = document.getElementById('skill-tree-btn');
  const settingsBtn = document.getElementById('settings-btn');
  const settingsModal = document.getElementById('settings-modal');
  const closeSettingsBtn = document.getElementById('close-settings-btn');

  // Skill Tree UI
  const skillTreeUI = new SkillTreeUI();
  skillTreeUI.onCloseCallback = () => {
    const badge = document.getElementById('nav-shards-badge');
    if (badge) badge.innerHTML = `💎 <strong>${skillTree.getShards().toLocaleString()}</strong>`;
  };

  if (skillTreeBtn) {
    skillTreeBtn.onclick = () => {
      skillTreeUI.open();
    };
  }

  // Hangar UI
  const hangarUI = new HangarUI();
  hangarUI.onCloseCallback = () => {
    const badge = document.getElementById('nav-shards-badge');
    if (badge) badge.innerHTML = `💎 <strong>${skillTree.getShards().toLocaleString()}</strong>`;
  };

  const hangarBtn = document.getElementById('hangar-btn');
  if (hangarBtn) {
    hangarBtn.onclick = () => {
      hangarUI.open();
    };
  }

  // Achievements UI
  const achievementsUI = new AchievementsUI();
  achievementsUI.onCloseCallback = () => {
    const badge = document.getElementById('nav-shards-badge');
    if (badge) badge.innerHTML = `💎 <strong>${skillTree.getShards().toLocaleString()}</strong>`;
  };

  const achievementsBtn = document.getElementById('achievements-btn');
  if (achievementsBtn) {
    achievementsBtn.onclick = () => {
      achievementsUI.open();
    };
  }

  // Hook game returning to main menu
  game.onReturnToMenu = () => {
    sounds.playMenuMusic();
    if (menu) {
      menu.classList.remove('hidden');
    }
    const badge = document.getElementById('nav-shards-badge');
    if (badge) badge.innerHTML = `💎 <strong>${skillTree.getShards().toLocaleString()}</strong>`;
  };

  // Start Action
  const launchGame = () => {
    if (menu && !menu.classList.contains('hidden')) {
      menu.classList.add('hidden');
      sounds.playFocus();
      sounds.playGameMusic();
      game.start();
    }
  };

  if (startBtn) {
    startBtn.onclick = launchGame;
  }

  // Keyboard shortcut: Space to launch if menu visible
  const keyHandler = (e: KeyboardEvent) => {
    if (e.code === 'Space' && menu && !menu.classList.contains('hidden')) {
      const stModal = document.getElementById('skill-tree-modal');
      const hModal = document.getElementById('hangar-modal');
      const achModal = document.getElementById('achievements-modal');
      const isSubModalOpen =
        (settingsModal && !settingsModal.classList.contains('hidden')) ||
        (stModal && !stModal.classList.contains('hidden')) ||
        (hModal && !hModal.classList.contains('hidden')) ||
        (achModal && !achModal.classList.contains('hidden'));

      if (!isSubModalOpen) {
        window.removeEventListener('keydown', keyHandler);
        launchGame();
      }
    }
  };
  window.addEventListener('keydown', keyHandler);

  // Settings & Policy Drawer Toggle
  if (settingsBtn && settingsModal) {
    settingsBtn.onclick = () => {
      sounds.playGem();
      settingsModal.classList.remove('hidden');
    };
  }
  if (closeSettingsBtn && settingsModal) {
    closeSettingsBtn.onclick = () => settingsModal.classList.add('hidden');
  }

  // Haptics setting button
  const modalHapticsBtn = document.getElementById('modal-haptics-btn');
  if (modalHapticsBtn) {
    modalHapticsBtn.onclick = () => {
      const isEnabled = sounds.toggleHaptics();
      modalHapticsBtn.textContent = isEnabled ? (t.vibrationOn || 'ON') : (t.vibrationOff || 'OFF');
    };
  }

  // Settings Policy Tabs Switcher
  const settingsTabs = [
    { btn: document.getElementById('tab-btn-general'), pane: document.getElementById('pane-general') },
    { btn: document.getElementById('tab-btn-privacy'), pane: document.getElementById('pane-privacy') },
    { btn: document.getElementById('tab-btn-terms'), pane: document.getElementById('pane-terms') },
    { btn: document.getElementById('tab-btn-safety'), pane: document.getElementById('pane-safety') },
  ];

  settingsTabs.forEach((tab) => {
    if (tab.btn && tab.pane) {
      tab.btn.onclick = () => {
        sounds.playFocus();
        settingsTabs.forEach((t) => {
          t.btn?.classList.remove('active');
          t.pane?.classList.add('hidden');
          t.pane?.classList.remove('active');
        });
        tab.btn?.classList.add('active');
        tab.pane?.classList.remove('hidden');
        tab.pane?.classList.add('active');
      };
    }
  });

  // Wipe / Reset All Game Data (Google Play Data Deletion Compliance)
  const resetDataBtn = document.getElementById('modal-reset-data-btn');
  if (resetDataBtn) {
    resetDataBtn.onclick = () => {
      if (confirm(i18n.t.resetDataConfirm)) {
        localStorage.clear();
        alert(i18n.t.resetDataSuccess);
        window.location.reload();
      }
    };
  }

  // Language Toggles
  const setLang = (lang: 'en' | 'tr') => {
    sounds.playHit();
    i18n.setLanguage(lang);
    renderUI();
  };

  document.getElementById('nav-lang-en')!.onclick = () => setLang('en');
  document.getElementById('nav-lang-tr')!.onclick = () => setLang('tr');
  const modalEn = document.getElementById('modal-lang-en');
  const modalTr = document.getElementById('modal-lang-tr');
  if (modalEn) modalEn.onclick = () => setLang('en');
  if (modalTr) modalTr.onclick = () => setLang('tr');

  // Audio Toggles
  const toggleAudio = () => {
    const isMuted = sounds.toggleMute();
    const navAudio = document.getElementById('nav-audio-btn');
    const modalAudio = document.getElementById('modal-audio-btn');
    if (navAudio) navAudio.textContent = isMuted ? '🔇' : '🔊';
    if (modalAudio) modalAudio.textContent = isMuted ? i18n.t.audioMuted : i18n.t.audioOn;
  };

  const navAudio = document.getElementById('nav-audio-btn');
  if (navAudio) navAudio.onclick = toggleAudio;
  const modalAudio = document.getElementById('modal-audio-btn');
  if (modalAudio) modalAudio.onclick = toggleAudio;
}

function setupStudioIntro() {
  const introStage = document.getElementById('cybercore-intro-stage');
  if (!introStage) {
    sounds.playMenuMusic();
    return;
  }

  let audioPlayed = false;
  const playChime = () => {
    if (audioPlayed) return;
    audioPlayed = true;
    try {
      const base = import.meta.env.BASE_URL;
      const audioEl = document.getElementById('cybercore-intro-audio') as HTMLAudioElement | null;
      if (audioEl) {
        audioEl.src = `${base}assets/audio/cybercore_sound_2_hollywood.wav`;
        audioEl.currentTime = 0;
        audioEl.volume = 1.0;
        audioEl.play().catch(() => {
          const fallback = new Audio(`${base}assets/audio/cybercore_sound_2_hollywood.wav`);
          fallback.volume = 1.0;
          fallback.play().catch(() => {});
        });
      } else {
        const fallback = new Audio(`${base}assets/audio/cybercore_sound_2_hollywood.wav`);
        fallback.volume = 1.0;
        fallback.play().catch(() => {});
      }
    } catch (e) {
      console.warn('Intro audio notice:', e);
    }
  };

  // Play Hollywood intro chime on exact visual paint of intro stage
  requestAnimationFrame(() => {
    playChime();
  });

  // User interaction backup for strict browser autoplay policies
  const onFirstGesture = () => {
    playChime();
    window.removeEventListener('click', onFirstGesture);
    window.removeEventListener('touchstart', onFirstGesture);
    window.removeEventListener('pointerdown', onFirstGesture);
  };
  window.addEventListener('click', onFirstGesture, { passive: true });
  window.addEventListener('touchstart', onFirstGesture, { passive: true });
  window.addEventListener('pointerdown', onFirstGesture, { passive: true });

  // Smooth cinematic presentation (2.2s display, 0.6s cubic-bezier fade)
  setTimeout(() => {
    introStage.classList.add('intro-hidden');
    setTimeout(() => {
      introStage.style.display = 'none';
      introStage.remove();
      sounds.playMenuMusic();
    }, 600);
  }, 2200);
}

renderUI();
setupStudioIntro();
