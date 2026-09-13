import type { UpgradeCard, WeaponId, EvolvedWeaponId, PassiveId, CardRarity } from '../types';
import type { Player } from '../entities/Player';
import type { Weapon } from '../weapons/Weapon';
import { createWeapon, createEvolvedWeapon, EVOLUTION_RECIPES } from '../weapons/Weapon';
import { i18n } from '../i18n';

export class UpgradeManager {
  private getWeaponInfo(id: WeaponId): { name: string; icon: string; desc: string } {
    const t = i18n.t;
    switch (id) {
      case 'plasma_blaster':
        return { name: t.w_plasma_blaster_name, icon: '⚡', desc: t.w_plasma_blaster_desc };
      case 'orbiting_blades':
        return { name: t.w_orbiting_blades_name, icon: '⚔️', desc: t.w_orbiting_blades_desc };
      case 'lightning_coil':
        return { name: t.w_lightning_coil_name, icon: '⚡', desc: t.w_lightning_coil_desc };
      case 'toxic_aura':
        return { name: t.w_toxic_aura_name, icon: '☣️', desc: t.w_toxic_aura_desc };
      case 'seeker_missiles':
        return { name: t.w_seeker_missiles_name, icon: '🚀', desc: t.w_seeker_missiles_desc };
      case 'scatter_cannon':
        return { name: t.w_scatter_cannon_name, icon: '💥', desc: t.w_scatter_cannon_desc };
      case 'piercing_laser':
        return { name: t.w_piercing_laser_name, icon: '🔮', desc: t.w_piercing_laser_desc };
      default:
        return { name: id, icon: '⚡', desc: '' };
    }
  }

  private getEvolutionInfo(id: EvolvedWeaponId): { name: string; icon: string; desc: string } {
    const t = i18n.t;
    switch (id) {
      case 'quantum_obliterator':
        return { name: t.evo_quantum_obliterator_name, icon: '⚡', desc: t.evo_quantum_obliterator_desc };
      case 'tachyon_vortex':
        return { name: t.evo_tachyon_vortex_name, icon: '🌀', desc: t.evo_tachyon_vortex_desc };
      case 'judgement_tempest':
        return { name: t.evo_judgement_tempest_name, icon: '⚡', desc: t.evo_judgement_tempest_desc };
      case 'nanite_plague':
        return { name: t.evo_nanite_plague_name, icon: '☣️', desc: t.evo_nanite_plague_desc };
      case 'doomsday_icbm':
        return { name: t.evo_doomsday_icbm_name, icon: '🚀', desc: t.evo_doomsday_icbm_desc };
      case 'flak_fortress':
        return { name: t.evo_flak_fortress_name, icon: '💥', desc: t.evo_flak_fortress_desc };
      case 'orbital_death_ray':
        return { name: t.evo_orbital_death_ray_name, icon: '🔮', desc: t.evo_orbital_death_ray_desc };
      default:
        return { name: id, icon: '⚡', desc: '' };
    }
  }

  private getPassiveInfo(id: PassiveId): { name: string; icon: string; desc: string } {
    const t = i18n.t;
    switch (id) {
      case 'overclock':
        return { name: t.p_overclock_name, icon: '⚙️', desc: t.p_overclock_desc };
      case 'titan_armor':
        return { name: t.p_titan_armor_name, icon: '🛡️', desc: t.p_titan_armor_desc };
      case 'nano_magnet':
        return { name: t.p_nano_magnet_name, icon: '🧲', desc: t.p_nano_magnet_desc };
      case 'vampire_chip':
        return { name: t.p_vampire_chip_name, icon: '🩸', desc: t.p_vampire_chip_desc };
      case 'nitro_thruster':
        return { name: t.p_nitro_thruster_name, icon: '👟', desc: t.p_nitro_thruster_desc };
      case 'targeting_cpu':
        return { name: t.p_targeting_cpu_name, icon: '🎯', desc: t.p_targeting_cpu_desc };
      case 'energy_core':
        return { name: t.p_energy_core_name, icon: '🔋', desc: t.p_energy_core_desc };
      case 'multi_barrel':
        return { name: t.p_multi_barrel_name, icon: '🌀', desc: t.p_multi_barrel_desc };
      default:
        return { name: id, icon: '🛡️', desc: '' };
    }
  }

  private weaponIds: WeaponId[] = [
    'plasma_blaster',
    'orbiting_blades',
    'lightning_coil',
    'toxic_aura',
    'seeker_missiles',
    'scatter_cannon',
    'piercing_laser',
  ];

  private passiveIds: PassiveId[] = [
    'overclock',
    'titan_armor',
    'nano_magnet',
    'vampire_chip',
    'nitro_thruster',
    'targeting_cpu',
    'energy_core',
    'multi_barrel',
  ];

  public generateOptions(player: Player, activeWeapons: Weapon[], count: number = 3): UpgradeCard[] {
    const candidates: UpgradeCard[] = [];
    const t = i18n.t;

    // 0. Weapon Evolution Options (Top Priority if unlocked)
    for (const active of activeWeapons) {
      const requiredLvl = Math.max(3, active.maxLevel - player.weaponMaxRankDiscount);
      if (active.level >= requiredLvl && !active.isEvolved) {
        const recipe = EVOLUTION_RECIPES[active.id as WeaponId];
        const canEvolve = recipe && (player.equippedPassives.has(recipe.requiredPassive) || (player.earlyEvolutionUnlocked && player.level >= 15));
        if (canEvolve) {
          const info = this.getEvolutionInfo(recipe.evolvedId);
          candidates.push({
            id: `evo_${recipe.evolvedId}`,
            type: 'weapon_evolution',
            targetId: recipe.evolvedId,
            title: `${t.evo_badge}: ${info.name}`,
            description: info.desc,
            level: 5,
            rarity: 'legendary',
            icon: info.icon,
          });
        }
      }
    }

    // 1. Weapon upgrades & new weapons
    const canAddWeapon = activeWeapons.length < 6;
    for (const wid of this.weaponIds) {
      const info = this.getWeaponInfo(wid);
      const active = activeWeapons.find((x) => x.id === wid);

      if (active) {
        if (active.level < active.maxLevel) {
          candidates.push({
            id: `w_up_${wid}_${active.level + 1}`,
            type: 'weapon_upgrade',
            targetId: wid,
            title: `${info.name} [${t.cardLvl}${active.level + 1}]`,
            description: info.desc,
            level: active.level + 1,
            rarity: this.pickRarity(active.level + 1, player),
            icon: info.icon,
          });
        }
      } else if (canAddWeapon) {
        candidates.push({
          id: `w_new_${wid}`,
          type: 'weapon_new',
          targetId: wid,
          title: `${t.cardNew} ${info.name}`,
          description: info.desc,
          level: 1,
          rarity: 'rare',
          icon: info.icon,
        });
      }
    }

    // 2. Passive upgrades & new passives
    const canAddPassive = player.equippedPassives.size < 6;
    for (const pid of this.passiveIds) {
      const info = this.getPassiveInfo(pid);
      const curLvl = player.equippedPassives.get(pid) || 0;

      if (curLvl > 0) {
        if (curLvl < 5) {
          candidates.push({
            id: `p_up_${pid}_${curLvl + 1}`,
            type: 'passive_upgrade',
            targetId: pid,
            title: `${info.name} [${t.cardLvl}${curLvl + 1}]`,
            description: info.desc,
            level: curLvl + 1,
            rarity: this.pickRarity(curLvl + 1, player),
            icon: info.icon,
          });
        }
      } else if (canAddPassive) {
        candidates.push({
          id: `p_new_${pid}`,
          type: 'passive_new',
          targetId: pid,
          title: `${t.cardNew} ${info.name}`,
          description: info.desc,
          level: 1,
          rarity: 'common',
          icon: info.icon,
        });
      }
    }

    // Emergency Heal if pool empty
    if (candidates.length === 0) {
      return [
        {
          id: 'emergency_heal',
          type: 'heal',
          title: t.p_heal_name,
          description: t.p_heal_desc,
          level: 1,
          rarity: 'epic',
          icon: '❤️',
        },
      ];
    }

    // Shuffle & slice
    const shuffled = [...candidates].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  private pickRarity(level: number, player?: Player): CardRarity {
    const bonus = player?.rareCardBonusChance ?? 0;
    if (level >= 5) return 'legendary';
    if (level >= 4 || (level >= 3 && Math.random() < bonus)) return 'epic';
    if (level >= 2 || Math.random() < bonus) return 'rare';
    return 'common';
  }

  public applyUpgrade(card: UpgradeCard, player: Player, activeWeapons: Weapon[]): Weapon | null {
    if (card.type === 'weapon_new' && card.targetId) {
      const newW = createWeapon(card.targetId as WeaponId);
      activeWeapons.push(newW);
      player.equippedWeapons.set(newW.id, 1);
      return newW;
    }

    if (card.type === 'weapon_evolution' && card.targetId) {
      const evoId = card.targetId as EvolvedWeaponId;
      for (const [baseWid, recipe] of Object.entries(EVOLUTION_RECIPES)) {
        if (recipe.evolvedId === evoId) {
          const idx = activeWeapons.findIndex((w) => w.id === baseWid);
          if (idx !== -1) {
            const oldW = activeWeapons[idx];
            const evolvedW = createEvolvedWeapon(evoId);
            evolvedW.level = 5;
            evolvedW.totalDamageDealt = oldW.totalDamageDealt;
            evolvedW.totalKills = oldW.totalKills;
            activeWeapons[idx] = evolvedW;
            player.equippedWeapons.delete(baseWid as WeaponId);
            player.equippedWeapons.set(evoId, 5);
            return evolvedW;
          }
        }
      }
      return null;
    }

    if (card.type === 'weapon_upgrade' && card.targetId) {
      const existing = activeWeapons.find((w) => w.id === card.targetId);
      if (existing) {
        existing.upgrade();
        player.equippedWeapons.set(existing.id, existing.level);
      }
      return null;
    }

    if (card.type === 'passive_new' || card.type === 'passive_upgrade') {
      const pid = card.targetId as PassiveId;
      const curLvl = (player.equippedPassives.get(pid) || 0) + 1;
      player.equippedPassives.set(pid, curLvl);
      this.applyPassiveEffect(pid, player);
      return null;
    }

    if (card.type === 'heal') {
      player.heal(50);
      return null;
    }

    return null;
  }

  private applyPassiveEffect(id: PassiveId, player: Player) {
    const m = player.upgradePowerMult;
    switch (id) {
      case 'overclock':
        player.stats.attackSpeedMult += 0.15 * m;
        break;
      case 'titan_armor':
        player.stats.armor += Math.round(2 * m);
        player.stats.maxHp += Math.round(25 * m);
        player.heal(Math.round(25 * m));
        break;
      case 'nano_magnet':
        player.stats.pickupRadius += Math.round(55 * m);
        break;
      case 'vampire_chip':
        player.stats.lifeSteal += 0.03 * m;
        break;
      case 'nitro_thruster':
        player.stats.speed += Math.round(28 * m);
        player.stats.dashCooldown = Math.max(1.0, player.stats.dashCooldown - 0.25 * m);
        break;
      case 'targeting_cpu':
        player.stats.critChance += 0.08 * m;
        player.stats.critDamageMult += 0.3 * m;
        break;
      case 'energy_core':
        player.stats.damageMult += 0.20 * m;
        break;
      case 'multi_barrel':
        player.stats.extraProjectiles += 1;
        break;
    }
  }
}
