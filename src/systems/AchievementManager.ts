import type { Achievement } from '../types';
import { sounds } from '../audio/SoundManager';

export class AchievementManager {
  private achievements: Map<string, Achievement> = new Map();
  public onAchievementUnlocked?: (ach: Achievement) => void;

  constructor() {
    this.initDefaultAchievements();
    this.loadState();
  }

  private initDefaultAchievements() {
    const defs: Omit<Achievement, 'currentValue' | 'unlocked' | 'claimed'>[] = [
      {
        id: 'first_blood',
        titleKey: 'ach_first_blood_name',
        descKey: 'ach_first_blood_desc',
        icon: 'sword',
        targetValue: 100,
        rewardShards: 60,
      },
      {
        id: 'elite_hunter',
        titleKey: 'ach_elite_hunter_name',
        descKey: 'ach_elite_hunter_desc',
        icon: 'star',
        targetValue: 1,
        rewardShards: 120,
      },
      {
        id: 'titan_slayer',
        titleKey: 'ach_titan_slayer_name',
        descKey: 'ach_titan_slayer_desc',
        icon: 'crown',
        targetValue: 1,
        rewardShards: 300,
      },
      {
        id: 'evolution_master',
        titleKey: 'ach_evolution_master_name',
        descKey: 'ach_evolution_master_desc',
        icon: 'bolt',
        targetValue: 1,
        rewardShards: 200,
      },
      {
        id: 'survivor',
        titleKey: 'ach_survivor_name',
        descKey: 'ach_survivor_desc',
        icon: 'timer',
        targetValue: 600, // 10 minutes in seconds
        rewardShards: 250,
      },
      {
        id: 'full_arsenal',
        titleKey: 'ach_full_arsenal_name',
        descKey: 'ach_full_arsenal_desc',
        icon: 'layers',
        targetValue: 6,
        rewardShards: 150,
      },
      {
        id: 'treasure_hunter',
        titleKey: 'ach_treasure_hunter_name',
        descKey: 'ach_treasure_hunter_desc',
        icon: 'package',
        targetValue: 5,
        rewardShards: 90,
      },
      {
        id: 'magma_explorer',
        titleKey: 'ach_magma_explorer_name',
        descKey: 'ach_magma_explorer_desc',
        icon: 'fire',
        targetValue: 3, // Sector 3
        rewardShards: 180,
      },
      {
        id: 'void_traveler',
        titleKey: 'ach_void_traveler_name',
        descKey: 'ach_void_traveler_desc',
        icon: 'atom',
        targetValue: 4, // Sector 4
        rewardShards: 350,
      },
      {
        id: 'impenetrable',
        titleKey: 'ach_impenetrable_name',
        descKey: 'ach_impenetrable_desc',
        icon: 'shield',
        targetValue: 5, // 5 Armor
        rewardShards: 100,
      },
      {
        id: 'light_speed',
        titleKey: 'ach_light_speed_name',
        descKey: 'ach_light_speed_desc',
        icon: 'zap',
        targetValue: 25, // 25 dashes
        rewardShards: 80,
      },
      {
        id: 'shard_tycoon',
        titleKey: 'ach_shard_tycoon_name',
        descKey: 'ach_shard_tycoon_desc',
        icon: 'gem',
        targetValue: 2000,
        rewardShards: 500,
      },
    ];

    for (const def of defs) {
      this.achievements.set(def.id, {
        ...def,
        currentValue: 0,
        unlocked: false,
        claimed: false,
      });
    }
  }

  private loadState() {
    try {
      const raw = localStorage.getItem('survi_run_achievements');
      if (!raw) return;
      const data = JSON.parse(raw);
      if (Array.isArray(data)) {
        for (const item of data) {
          const ach = this.achievements.get(item.id);
          if (ach) {
            ach.currentValue = Math.max(ach.currentValue, item.currentValue || 0);
            ach.unlocked = item.unlocked ?? ach.currentValue >= ach.targetValue;
            ach.claimed = item.claimed ?? false;
          }
        }
      }
    } catch {
      // Storage parsing fallback
    }
  }

  public saveState() {
    try {
      const data = Array.from(this.achievements.values()).map(a => ({
        id: a.id,
        currentValue: a.currentValue,
        unlocked: a.unlocked,
        claimed: a.claimed,
      }));
      localStorage.setItem('survi_run_achievements', JSON.stringify(data));
    } catch {
      // Ignore quota error
    }
  }

  private checkProgress(id: string, value: number, isAbsolute: boolean = false) {
    const ach = this.achievements.get(id);
    if (!ach || ach.unlocked) return;

    if (isAbsolute) {
      ach.currentValue = Math.max(ach.currentValue, value);
    } else {
      ach.currentValue += value;
    }

    if (ach.currentValue >= ach.targetValue && !ach.unlocked) {
      ach.unlocked = true;
      this.saveState();
      sounds.playLevelUp();
      if (this.onAchievementUnlocked) {
        this.onAchievementUnlocked(ach);
      }
    } else {
      this.saveState();
    }
  }

  // Action listeners
  public reportKill(isElite: boolean = false, isBoss: boolean = false) {
    this.checkProgress('first_blood', 1);
    if (isElite) this.checkProgress('elite_hunter', 1);
    if (isBoss) this.checkProgress('titan_slayer', 1);
  }

  public reportEvolution() {
    this.checkProgress('evolution_master', 1);
  }

  public reportSurvivalTime(seconds: number) {
    this.checkProgress('survivor', Math.floor(seconds), true);
  }

  public reportWeaponCount(count: number) {
    this.checkProgress('full_arsenal', count, true);
  }

  public reportChestOpen() {
    this.checkProgress('treasure_hunter', 1);
  }

  public reportSector(sectorIndex: number) {
    if (sectorIndex >= 3) this.checkProgress('magma_explorer', 3, true);
    if (sectorIndex >= 4) this.checkProgress('void_traveler', 4, true);
  }

  public reportArmor(armor: number) {
    this.checkProgress('impenetrable', armor, true);
  }

  public reportDash() {
    this.checkProgress('light_speed', 1);
  }

  public reportTotalShards(total: number) {
    this.checkProgress('shard_tycoon', total, true);
  }

  public reportShards(total: number) {
    this.reportTotalShards(total);
  }

  public claim(id: string): number {
    const ach = this.achievements.get(id);
    if (!ach || !ach.unlocked || ach.claimed) return 0;
    ach.claimed = true;
    this.saveState();
    sounds.playChest();
    return ach.rewardShards;
  }

  public claimAll(): number {
    let total = 0;
    for (const ach of this.achievements.values()) {
      if (ach.unlocked && !ach.claimed) {
        ach.claimed = true;
        total += ach.rewardShards;
      }
    }
    if (total > 0) {
      this.saveState();
      sounds.playChest();
    }
    return total;
  }

  public getUnclaimedShards(): number {
    let total = 0;
    for (const ach of this.achievements.values()) {
      if (ach.unlocked && !ach.claimed) {
        total += ach.rewardShards;
      }
    }
    return total;
  }

  public getAll(): Achievement[] {
    return Array.from(this.achievements.values());
  }

  public getUnclaimedCount(): number {
    let c = 0;
    for (const ach of this.achievements.values()) {
      if (ach.unlocked && !ach.claimed) c++;
    }
    return c;
  }
}

export const achievementManager = new AchievementManager();
