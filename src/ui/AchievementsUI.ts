import { icon } from './Icons';
import { achievementManager } from '../systems/AchievementManager';
import { skillTree } from '../systems/SkillTree';
import { i18n } from '../i18n';
import { sounds } from '../audio/SoundManager';

export class AchievementsUI {
  private modal: HTMLElement;
  public onCloseCallback?: () => void;
  private currentFilter: 'all' | 'unclaimed' | 'completed' = 'all';

  constructor() {
    let el = document.getElementById('achievements-modal');
    if (!el) {
      el = document.createElement('div');
      el.id = 'achievements-modal';
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
    const list = achievementManager.getAll();
    const shards = skillTree.getShards();

    const totalCount = list.length;
    const unlockedCount = list.filter((a) => a.unlocked).length;
    const claimedCount = list.filter((a) => a.claimed).length;
    const unclaimedCount = achievementManager.getUnclaimedCount();
    const unclaimedShards = achievementManager.getUnclaimedShards();
    const overallProgressPercent = Math.round((unlockedCount / totalCount) * 100);

    let filteredList = list;
    if (this.currentFilter === 'unclaimed') {
      filteredList = list.filter((a) => a.unlocked && !a.claimed);
    } else if (this.currentFilter === 'completed') {
      filteredList = list.filter((a) => a.claimed);
    }

    this.modal.innerHTML = `
      <div class="drawer-content achievements-drawer-content">
        <div class="drawer-header">
          <div class="header-left">
            <h2>${icon('trophy', 22)} ${t.achievementsTitle}</h2>
            <span class="sub-label">${t.achievementsSummary || 'Achievements Progress'}: ${unlockedCount}/${totalCount} (${overallProgressPercent}%)</span>
          </div>
          <div class="header-right">
            <span class="shard-badge">${icon('gem', 14)} <strong id="ach-shards-display">${shards.toLocaleString()}</strong></span>
            <button id="close-ach-btn" class="drawer-close-btn" aria-label="Close">${icon('close', 14)}</button>
          </div>
        </div>

        <!-- High-Tech Summary & Claim All Ribbon -->
        <div class="ach-summary-banner">
          <div class="ach-summary-stats">
            <div class="ach-progress-ring-label">
              <span class="label-muted">${t.achievementsSummary || 'Completed'}</span>
              <strong class="stats-counter">${unlockedCount} / ${totalCount}</strong>
            </div>
            <div class="ach-overall-progress-bar">
              <div class="ach-overall-progress-fill" style="width: ${overallProgressPercent}%;"></div>
            </div>
          </div>

          <div class="ach-summary-actions">
            ${
              unclaimedShards > 0
                ? `<button id="btn-claim-all-ach" class="ach-claim-all-btn active-pulse">
                    ${icon('sparkle', 14)} ${t.achievementsClaimAll || 'CLAIM ALL'} (+${unclaimedShards.toLocaleString()} ${icon('gem', 12)})
                   </button>`
                : `<button class="ach-claim-all-btn disabled" disabled>
                    ${icon('check', 14)} ${t.achievementsAllClaimed || 'ALL REWARDS CLAIMED'}
                   </button>`
            }
          </div>
        </div>

        <!-- Filter Tabs -->
        <div class="ach-filter-bar">
          <button class="ach-filter-tab ${this.currentFilter === 'all' ? 'active' : ''}" data-filter="all">
            ${i18n.lang === 'tr' ? 'TÜMÜ' : 'ALL'} (${totalCount})
          </button>
          <button class="ach-filter-tab ${this.currentFilter === 'unclaimed' ? 'active' : ''}" data-filter="unclaimed">
            ${i18n.lang === 'tr' ? 'ALINABİLİR' : 'UNCLAIMED'} (${unclaimedCount})
          </button>
          <button class="ach-filter-tab ${this.currentFilter === 'completed' ? 'active' : ''}" data-filter="completed">
            ${i18n.lang === 'tr' ? 'TAMAMLANDI' : 'COMPLETED'} (${claimedCount})
          </button>
        </div>

        <!-- Scrollable Cards Grid Container -->
        <div class="achievements-scroll-viewport">
          <div class="achievements-list">
            ${
              filteredList.length === 0
                ? `<div class="ach-empty-state">${i18n.lang === 'tr' ? 'Bu filtrede başarım bulunamadı.' : 'No achievements found for this filter.'}</div>`
                : filteredList.map((ach) => {
                    const name = t[ach.titleKey] || ach.id;
                    const desc = t[ach.descKey] || '';
                    const progressRatio = Math.min(1, ach.currentValue / ach.targetValue);
                    const progressPercent = Math.round(progressRatio * 100);

                    return `
                      <div class="ach-card ${ach.claimed ? 'claimed' : (ach.unlocked ? 'unlocked' : 'locked')}">
                        <div class="ach-icon-col">
                          <div class="ach-icon-circle ${ach.unlocked ? 'unlocked-glow' : ''}">${icon(ach.icon, 20) || ach.icon}</div>
                        </div>

                        <div class="ach-info-col">
                          <div class="ach-top-row">
                            <h4 class="ach-name">${name}</h4>
                            <span class="ach-reward-tag">+${ach.rewardShards} ${icon('gem', 12)}</span>
                          </div>
                          <p class="ach-desc">${desc}</p>
                          <div class="ach-progress-wrapper">
                            <div class="ach-progress-bar">
                              <div class="ach-progress-fill" style="width: ${progressPercent}%"></div>
                            </div>
                            <span class="ach-progress-num">
                              ${Math.min(ach.currentValue, ach.targetValue).toLocaleString()} / ${ach.targetValue.toLocaleString()}
                            </span>
                          </div>
                        </div>

                        <div class="ach-action-col">
                          ${
                            ach.claimed
                              ? `<span class="ach-badge-claimed">${icon('check', 13)} ${t.rewardClaimed}</span>`
                              : ach.unlocked
                              ? `<button class="ach-claim-btn" data-id="${ach.id}">${icon('gift', 14)} ${t.claimReward}</button>`
                              : `<span class="ach-badge-locked">${icon('lock', 12)} ${progressPercent}%</span>`
                          }
                        </div>
                      </div>
                    `;
                  }).join('')
            }
          </div>
        </div>
      </div>
    `;

    // Hook Close Button
    const closeBtn = document.getElementById('close-ach-btn');
    if (closeBtn) closeBtn.onclick = () => this.close();

    // Hook Filter Tabs
    this.modal.querySelectorAll('.ach-filter-tab').forEach((tab) => {
      tab.addEventListener('click', (e) => {
        const filter = (e.currentTarget as HTMLElement).getAttribute('data-filter') as 'all' | 'unclaimed' | 'completed';
        if (filter) {
          this.currentFilter = filter;
          sounds.playFocus();
          this.render();
        }
      });
    });

    // Hook Claim All Button
    const claimAllBtn = document.getElementById('btn-claim-all-ach');
    if (claimAllBtn) {
      claimAllBtn.onclick = () => {
        const gained = achievementManager.claimAll();
        if (gained > 0) {
          skillTree.addShards(gained);
          sounds.playLevelUp();
          sounds.triggerHaptic('heavy');
          this.render();
        }
      };
    }

    // Hook Individual Claim Buttons
    this.modal.querySelectorAll('.ach-claim-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const id = (e.currentTarget as HTMLElement).getAttribute('data-id');
        if (id) {
          const reward = achievementManager.claim(id);
          if (reward > 0) {
            skillTree.addShards(reward);
            sounds.playLevelUp();
            sounds.triggerHaptic('heavy');
            this.render();
          }
        }
      });
    });
  }
}
