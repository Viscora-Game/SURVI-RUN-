import type { Player } from '../entities/Player';
import { sounds } from '../audio/SoundManager';

export type SkillTreeCategory = 'warfare' | 'defense' | 'mobility' | 'economy';
export type SkillTier = 1 | 2 | 3 | 4;
export type NodeType = 'minor' | 'notable' | 'keystone';

export interface SkillNode {
  id: string;
  category: SkillTreeCategory;
  tier: SkillTier;
  nodeType: NodeType;
  nameKey: string;
  descKey: string;
  icon: string;
  maxRank: number;
  baseCost: number;
  costMult: number;
  currentRank: number;
  parents?: string[];
  mutexGroup?: string;
  mutexBranch?: 'A' | 'B';
  x: number;
  y: number;
}

export class SkillTreeManager {
  private shards: number = 0;
  private nodes: Map<string, SkillNode> = new Map();

  constructor() {
    this.initDefaultNodes();
    this.loadState();
  }

  private initDefaultNodes() {
    const rawNodes: Omit<SkillNode, 'currentRank' | 'nodeType' | 'x' | 'y'>[] = [
      // =======================================================================
      // 1. WARFARE TREE (26 NODES)
      // =======================================================================
      // Tier 1 (2 Gateway Starters + 4 Foundation Branches)
      { id: 'wf_kinetics', category: 'warfare', tier: 1, nameKey: 'wf_kinetics_name', descKey: 'wf_kinetics_desc', icon: 'burst', maxRank: 5, baseCost: 50, costMult: 1.4 },
      { id: 'wf_cadence', category: 'warfare', tier: 1, nameKey: 'wf_cadence_name', descKey: 'wf_cadence_desc', icon: 'bolt', maxRank: 5, baseCost: 60, costMult: 1.4 },
      { id: 'wf_optics', category: 'warfare', tier: 1, nameKey: 'wf_optics_name', descKey: 'wf_optics_desc', icon: 'target', maxRank: 5, baseCost: 70, costMult: 1.4, parents: ['wf_kinetics'] },
      { id: 'wf_caliber', category: 'warfare', tier: 1, nameKey: 'wf_caliber_name', descKey: 'wf_caliber_desc', icon: 'fire', maxRank: 3, baseCost: 90, costMult: 1.5, parents: ['wf_kinetics'] },
      { id: 'wf_velocity', category: 'warfare', tier: 1, nameKey: 'wf_velocity_name', descKey: 'wf_velocity_desc', icon: 'wind', maxRank: 3, baseCost: 60, costMult: 1.4, parents: ['wf_cadence'] },
      { id: 'wf_penetration', category: 'warfare', tier: 1, nameKey: 'wf_penetration_name', descKey: 'wf_penetration_desc', icon: 'blade', maxRank: 2, baseCost: 110, costMult: 1.6, parents: ['wf_cadence'] },

      // Tier 2 (Advanced Sub-branches)
      { id: 'wf_recoil_brake', category: 'warfare', tier: 2, nameKey: 'wf_recoil_brake_name', descKey: 'wf_recoil_brake_desc', icon: 'recoil', maxRank: 3, baseCost: 140, costMult: 1.5, parents: ['wf_optics'] },
      { id: 'wf_multishot', category: 'warfare', tier: 2, nameKey: 'wf_multishot_name', descKey: 'wf_multishot_desc', icon: 'vortex', maxRank: 2, baseCost: 240, costMult: 1.8, parents: ['wf_cadence'] },
      { id: 'wf_shrapnel', category: 'warfare', tier: 2, nameKey: 'wf_shrapnel_name', descKey: 'wf_shrapnel_desc', icon: 'bomb', maxRank: 3, baseCost: 160, costMult: 1.5, parents: ['wf_caliber'] },
      { id: 'wf_overdrive', category: 'warfare', tier: 2, nameKey: 'wf_overdrive_name', descKey: 'wf_overdrive_desc', icon: 'gear', maxRank: 3, baseCost: 150, costMult: 1.5, parents: ['wf_optics'] },
      { id: 'wf_plasma_infusion', category: 'warfare', tier: 2, nameKey: 'wf_plasma_infusion_name', descKey: 'wf_plasma_infusion_desc', icon: 'chem', maxRank: 3, baseCost: 180, costMult: 1.6, parents: ['wf_penetration'] },
      { id: 'wf_ballistic_mass', category: 'warfare', tier: 2, nameKey: 'wf_ballistic_mass_name', descKey: 'wf_ballistic_mass_desc', icon: 'mass', maxRank: 3, baseCost: 160, costMult: 1.5, parents: ['wf_velocity'] },

      // Tier 3: Path A (Plasma Singularity) - MUTEX A
      { id: 'wf_pl_core', category: 'warfare', tier: 3, nameKey: 'wf_pl_core_name', descKey: 'wf_pl_core_desc', icon: 'atom', maxRank: 3, baseCost: 350, costMult: 1.6, parents: ['wf_plasma_infusion'], mutexGroup: 'wf_spec', mutexBranch: 'A' },
      { id: 'wf_pl_burn', category: 'warfare', tier: 3, nameKey: 'wf_pl_burn_name', descKey: 'wf_pl_burn_desc', icon: 'fire', maxRank: 3, baseCost: 400, costMult: 1.6, parents: ['wf_pl_core'], mutexGroup: 'wf_spec', mutexBranch: 'A' },
      { id: 'wf_pl_chain', category: 'warfare', tier: 3, nameKey: 'wf_pl_chain_name', descKey: 'wf_pl_chain_desc', icon: 'bolt', maxRank: 3, baseCost: 450, costMult: 1.7, parents: ['wf_pl_burn'], mutexGroup: 'wf_spec', mutexBranch: 'A' },
      { id: 'wf_pl_melt', category: 'warfare', tier: 3, nameKey: 'wf_pl_melt_name', descKey: 'wf_pl_melt_desc', icon: 'heat', maxRank: 2, baseCost: 550, costMult: 1.8, parents: ['wf_pl_chain'], mutexGroup: 'wf_spec', mutexBranch: 'A' },
      { id: 'wf_pl_supercharge', category: 'warfare', tier: 3, nameKey: 'wf_pl_supercharge_name', descKey: 'wf_pl_supercharge_desc', icon: 'flux', maxRank: 2, baseCost: 650, costMult: 1.8, parents: ['wf_pl_melt'], mutexGroup: 'wf_spec', mutexBranch: 'A' },
      { id: 'wf_pl_singularity', category: 'warfare', tier: 3, nameKey: 'wf_pl_singularity_name', descKey: 'wf_pl_singularity_desc', icon: 'void', maxRank: 1, baseCost: 950, costMult: 1.0, parents: ['wf_pl_supercharge'], mutexGroup: 'wf_spec', mutexBranch: 'A' },

      // Tier 3: Path B (Ballistic Overkill) - MUTEX B
      { id: 'wf_ba_slugs', category: 'warfare', tier: 3, nameKey: 'wf_ba_slugs_name', descKey: 'wf_ba_slugs_desc', icon: 'burst', maxRank: 3, baseCost: 350, costMult: 1.6, parents: ['wf_ballistic_mass'], mutexGroup: 'wf_spec', mutexBranch: 'B' },
      { id: 'wf_ba_flak', category: 'warfare', tier: 3, nameKey: 'wf_ba_flak_name', descKey: 'wf_ba_flak_desc', icon: 'bomb', maxRank: 3, baseCost: 400, costMult: 1.6, parents: ['wf_ba_slugs'], mutexGroup: 'wf_spec', mutexBranch: 'B' },
      { id: 'wf_ba_concussion', category: 'warfare', tier: 3, nameKey: 'wf_ba_concussion_name', descKey: 'wf_ba_concussion_desc', icon: 'flux', maxRank: 3, baseCost: 450, costMult: 1.7, parents: ['wf_ba_flak'], mutexGroup: 'wf_spec', mutexBranch: 'B' },
      { id: 'wf_ba_bleed', category: 'warfare', tier: 3, nameKey: 'wf_ba_bleed_name', descKey: 'wf_ba_bleed_desc', icon: 'bleed', maxRank: 2, baseCost: 550, costMult: 1.8, parents: ['wf_ba_concussion'], mutexGroup: 'wf_spec', mutexBranch: 'B' },
      { id: 'wf_ba_ricochet', category: 'warfare', tier: 3, nameKey: 'wf_ba_ricochet_name', descKey: 'wf_ba_ricochet_desc', icon: 'ricochet', maxRank: 2, baseCost: 650, costMult: 1.8, parents: ['wf_ba_bleed'], mutexGroup: 'wf_spec', mutexBranch: 'B' },
      { id: 'wf_ba_devastator', category: 'warfare', tier: 3, nameKey: 'wf_ba_devastator_name', descKey: 'wf_ba_devastator_desc', icon: 'rocket', maxRank: 1, baseCost: 950, costMult: 1.0, parents: ['wf_ba_ricochet'], mutexGroup: 'wf_spec', mutexBranch: 'B' },

      // Tier 4 (Capstones)
      { id: 'wf_omni_arsenal', category: 'warfare', tier: 4, nameKey: 'wf_omni_arsenal_name', descKey: 'wf_omni_arsenal_desc', icon: 'crown', maxRank: 1, baseCost: 1500, costMult: 1.0, parents: ['wf_pl_singularity', 'wf_ba_devastator'] },
      { id: 'wf_god_slayer', category: 'warfare', tier: 4, nameKey: 'wf_god_slayer_name', descKey: 'wf_god_slayer_desc', icon: 'bolt', maxRank: 1, baseCost: 1800, costMult: 1.0, parents: ['wf_omni_arsenal'] },

      // =======================================================================
      // 2. DEFENSE TREE (26 NODES)
      // =======================================================================
      // Tier 1 (2 Gateway Starters + 4 Foundation Branches)
      { id: 'df_frame', category: 'defense', tier: 1, nameKey: 'df_frame_name', descKey: 'df_frame_desc', icon: 'shield', maxRank: 5, baseCost: 50, costMult: 1.4 },
      { id: 'df_plating', category: 'defense', tier: 1, nameKey: 'df_plating_name', descKey: 'df_plating_desc', icon: 'recoil', maxRank: 5, baseCost: 60, costMult: 1.4 },
      { id: 'df_regen', category: 'defense', tier: 1, nameKey: 'df_regen_name', descKey: 'df_regen_desc', icon: 'chem', maxRank: 4, baseCost: 80, costMult: 1.5, parents: ['df_frame'] },
      { id: 'df_battery', category: 'defense', tier: 1, nameKey: 'df_battery_name', descKey: 'df_battery_desc', icon: 'battery', maxRank: 3, baseCost: 70, costMult: 1.4, parents: ['df_frame'] },
      { id: 'df_tenacity', category: 'defense', tier: 1, nameKey: 'df_tenacity_name', descKey: 'df_tenacity_desc', icon: 'barrier', maxRank: 3, baseCost: 60, costMult: 1.4, parents: ['df_plating'] },
      { id: 'df_resilience', category: 'defense', tier: 1, nameKey: 'df_resilience_name', descKey: 'df_resilience_desc', icon: '🩹', maxRank: 3, baseCost: 75, costMult: 1.5, parents: ['df_plating'] },

      // Tier 2 (Advanced Sub-branches)
      { id: 'df_barrier', category: 'defense', tier: 2, nameKey: 'df_barrier_name', descKey: 'df_barrier_desc', icon: 'spark', maxRank: 3, baseCost: 140, costMult: 1.5, parents: ['df_frame'] },
      { id: 'df_thorns', category: 'defense', tier: 2, nameKey: 'df_thorns_name', descKey: 'df_thorns_desc', icon: '🌵', maxRank: 3, baseCost: 150, costMult: 1.5, parents: ['df_plating'] },
      { id: 'df_second_wind', category: 'defense', tier: 2, nameKey: 'df_second_wind_name', descKey: 'df_second_wind_desc', icon: 'wind', maxRank: 3, baseCost: 160, costMult: 1.5, parents: ['df_regen'] },
      { id: 'df_hardened_hull', category: 'defense', tier: 2, nameKey: 'df_hardened_hull_name', descKey: 'df_hardened_hull_desc', icon: 'cyber', maxRank: 3, baseCost: 180, costMult: 1.6, parents: ['df_tenacity'] },
      { id: 'df_shield_pulse', category: 'defense', tier: 2, nameKey: 'df_shield_pulse_name', descKey: 'df_shield_pulse_desc', icon: 'flux', maxRank: 2, baseCost: 200, costMult: 1.7, parents: ['df_battery'] },
      { id: 'df_overcharge_shield', category: 'defense', tier: 2, nameKey: 'df_overcharge_shield_name', descKey: 'df_overcharge_shield_desc', icon: 'shield', maxRank: 3, baseCost: 170, costMult: 1.6, parents: ['df_resilience'] },

      // Tier 3: Path A (Iron Colossus) - MUTEX A
      { id: 'df_co_bastion', category: 'defense', tier: 3, nameKey: 'df_co_bastion_name', descKey: 'df_co_bastion_desc', icon: '🏰', maxRank: 3, baseCost: 350, costMult: 1.6, parents: ['df_hardened_hull'], mutexGroup: 'df_spec', mutexBranch: 'A' },
      { id: 'df_co_anchor', category: 'defense', tier: 3, nameKey: 'df_co_anchor_name', descKey: 'df_co_anchor_desc', icon: '⚓', maxRank: 2, baseCost: 400, costMult: 1.6, parents: ['df_co_bastion'], mutexGroup: 'df_spec', mutexBranch: 'A' },
      { id: 'df_co_reactive', category: 'defense', tier: 3, nameKey: 'df_co_reactive_name', descKey: 'df_co_reactive_desc', icon: 'burst', maxRank: 3, baseCost: 450, costMult: 1.7, parents: ['df_co_anchor'], mutexGroup: 'df_spec', mutexBranch: 'A' },
      { id: 'df_co_adamant', category: 'defense', tier: 3, nameKey: 'df_co_adamant_name', descKey: 'df_co_adamant_desc', icon: 'gem', maxRank: 2, baseCost: 550, costMult: 1.8, parents: ['df_co_reactive'], mutexGroup: 'df_spec', mutexBranch: 'A' },
      { id: 'df_co_titan', category: 'defense', tier: 3, nameKey: 'df_co_titan_name', descKey: 'df_co_titan_desc', icon: '🗿', maxRank: 2, baseCost: 650, costMult: 1.8, parents: ['df_co_adamant'], mutexGroup: 'df_spec', mutexBranch: 'A' },
      { id: 'df_co_invincible', category: 'defense', tier: 3, nameKey: 'df_co_invincible_name', descKey: 'df_co_invincible_desc', icon: 'shield', maxRank: 1, baseCost: 950, costMult: 1.0, parents: ['df_co_titan'], mutexGroup: 'df_spec', mutexBranch: 'A' },

      // Tier 3: Path B (Phase Ghost) - MUTEX B
      { id: 'df_gh_phase', category: 'defense', tier: 3, nameKey: 'df_gh_phase_name', descKey: 'df_gh_phase_desc', icon: '👻', maxRank: 3, baseCost: 350, costMult: 1.6, parents: ['df_barrier'], mutexGroup: 'df_spec', mutexBranch: 'B' },
      { id: 'df_gh_afterimage', category: 'defense', tier: 3, nameKey: 'df_gh_afterimage_name', descKey: 'df_gh_afterimage_desc', icon: '👤', maxRank: 3, baseCost: 400, costMult: 1.6, parents: ['df_gh_phase'], mutexGroup: 'df_spec', mutexBranch: 'B' },
      { id: 'df_gh_speed', category: 'defense', tier: 3, nameKey: 'df_gh_speed_name', descKey: 'df_gh_speed_desc', icon: 'dash', maxRank: 3, baseCost: 450, costMult: 1.7, parents: ['df_gh_afterimage'], mutexGroup: 'df_spec', mutexBranch: 'B' },
      { id: 'df_gh_stealth', category: 'defense', tier: 3, nameKey: 'df_gh_stealth_name', descKey: 'df_gh_stealth_desc', icon: 'fog', maxRank: 2, baseCost: 550, costMult: 1.8, parents: ['df_gh_speed'], mutexGroup: 'df_spec', mutexBranch: 'B' },
      { id: 'df_gh_chrono', category: 'defense', tier: 3, nameKey: 'df_gh_chrono_name', descKey: 'df_gh_chrono_desc', icon: '⏳', maxRank: 2, baseCost: 650, costMult: 1.8, parents: ['df_gh_stealth'], mutexGroup: 'df_spec', mutexBranch: 'B' },
      { id: 'df_gh_untouchable', category: 'defense', tier: 3, nameKey: 'df_gh_untouchable_name', descKey: 'df_gh_untouchable_desc', icon: 'spark', maxRank: 1, baseCost: 950, costMult: 1.0, parents: ['df_gh_chrono'], mutexGroup: 'df_spec', mutexBranch: 'B' },

      // Tier 4 (Capstones)
      { id: 'df_phoenix_reactor', category: 'defense', tier: 4, nameKey: 'df_phoenix_reactor_name', descKey: 'df_phoenix_reactor_desc', icon: 'fire', maxRank: 1, baseCost: 1500, costMult: 1.0, parents: ['df_co_invincible', 'df_gh_untouchable'] },
      { id: 'df_nanite_hive', category: 'defense', tier: 4, nameKey: 'df_nanite_hive_name', descKey: 'df_nanite_hive_desc', icon: '🐝', maxRank: 1, baseCost: 1800, costMult: 1.0, parents: ['df_phoenix_reactor'] },

      // =======================================================================
      // 3. MOBILITY TREE (26 NODES)
      // =======================================================================
      // Tier 1 (2 Gateway Starters + 4 Foundation Branches)
      { id: 'mb_thrusters', category: 'mobility', tier: 1, nameKey: 'mb_thrusters_name', descKey: 'mb_thrusters_desc', icon: 'dash', maxRank: 5, baseCost: 50, costMult: 1.4 },
      { id: 'mb_jump_jet', category: 'mobility', tier: 1, nameKey: 'mb_jump_jet_name', descKey: 'mb_jump_jet_desc', icon: 'bolt', maxRank: 5, baseCost: 60, costMult: 1.4 },
      { id: 'mb_drift', category: 'mobility', tier: 1, nameKey: 'mb_drift_name', descKey: 'mb_drift_desc', icon: '🛹', maxRank: 3, baseCost: 60, costMult: 1.4, parents: ['mb_thrusters'] },
      { id: 'mb_stance', category: 'mobility', tier: 1, nameKey: 'mb_stance_name', descKey: 'mb_stance_desc', icon: 'target', maxRank: 3, baseCost: 70, costMult: 1.4, parents: ['mb_thrusters'] },
      { id: 'mb_strafe', category: 'mobility', tier: 1, nameKey: 'mb_strafe_name', descKey: 'mb_strafe_desc', icon: 'ricochet', maxRank: 3, baseCost: 65, costMult: 1.4, parents: ['mb_jump_jet'] },
      { id: 'mb_boost', category: 'mobility', tier: 1, nameKey: 'mb_boost_name', descKey: 'mb_boost_desc', icon: 'rocket', maxRank: 3, baseCost: 80, costMult: 1.5, parents: ['mb_jump_jet'] },

      // Tier 2 (Advanced Sub-branches)
      { id: 'mb_dash_trail', category: 'mobility', tier: 2, nameKey: 'mb_dash_trail_name', descKey: 'mb_dash_trail_desc', icon: 'fire', maxRank: 3, baseCost: 140, costMult: 1.5, parents: ['mb_thrusters'] },
      { id: 'mb_dash_stun', category: 'mobility', tier: 2, nameKey: 'mb_dash_stun_name', descKey: 'mb_dash_stun_desc', icon: 'bolt', maxRank: 2, baseCost: 180, costMult: 1.6, parents: ['mb_jump_jet'] },
      { id: 'mb_focus_haste', category: 'mobility', tier: 2, nameKey: 'mb_focus_haste_name', descKey: 'mb_focus_haste_desc', icon: 'gear', maxRank: 3, baseCost: 160, costMult: 1.5, parents: ['mb_stance'] },
      { id: 'mb_focus_crit', category: 'mobility', tier: 2, nameKey: 'mb_focus_crit_name', descKey: 'mb_focus_crit_desc', icon: 'target', maxRank: 3, baseCost: 170, costMult: 1.5, parents: ['mb_stance'] },
      { id: 'mb_sprint_shield', category: 'mobility', tier: 2, nameKey: 'mb_sprint_shield_name', descKey: 'mb_sprint_shield_desc', icon: 'shield', maxRank: 3, baseCost: 150, costMult: 1.5, parents: ['mb_drift'] },
      { id: 'mb_warp', category: 'mobility', tier: 2, nameKey: 'mb_warp_name', descKey: 'mb_warp_desc', icon: 'vortex', maxRank: 2, baseCost: 200, costMult: 1.7, parents: ['mb_boost'] },

      // Tier 3: Path A (Archero Sniper Focus) - MUTEX A
      { id: 'mb_sn_nest', category: 'mobility', tier: 3, nameKey: 'mb_sn_nest_name', descKey: 'mb_sn_nest_desc', icon: 'falcon', maxRank: 3, baseCost: 350, costMult: 1.6, parents: ['mb_focus_haste'], mutexGroup: 'mb_spec', mutexBranch: 'A' },
      { id: 'mb_sn_calm', category: 'mobility', tier: 3, nameKey: 'mb_sn_calm_name', descKey: 'mb_sn_calm_desc', icon: '🧘', maxRank: 3, baseCost: 400, costMult: 1.6, parents: ['mb_sn_nest'], mutexGroup: 'mb_spec', mutexBranch: 'A' },
      { id: 'mb_sn_pierce', category: 'mobility', tier: 3, nameKey: 'mb_sn_pierce_name', descKey: 'mb_sn_pierce_desc', icon: '🏹', maxRank: 3, baseCost: 450, costMult: 1.7, parents: ['mb_sn_calm'], mutexGroup: 'mb_spec', mutexBranch: 'A' },
      { id: 'mb_sn_homing', category: 'mobility', tier: 3, nameKey: 'mb_sn_homing_name', descKey: 'mb_sn_homing_desc', icon: 'target', maxRank: 2, baseCost: 550, costMult: 1.8, parents: ['mb_sn_pierce'], mutexGroup: 'mb_spec', mutexBranch: 'A' },
      { id: 'mb_sn_overcharge', category: 'mobility', tier: 3, nameKey: 'mb_sn_overcharge_name', descKey: 'mb_sn_overcharge_desc', icon: 'bolt', maxRank: 2, baseCost: 650, costMult: 1.8, parents: ['mb_sn_homing'], mutexGroup: 'mb_spec', mutexBranch: 'A' },
      { id: 'mb_sn_zenith', category: 'mobility', tier: 3, nameKey: 'mb_sn_zenith_name', descKey: 'mb_sn_zenith_desc', icon: 'crown', maxRank: 1, baseCost: 950, costMult: 1.0, parents: ['mb_sn_overcharge'], mutexGroup: 'mb_spec', mutexBranch: 'A' },

      // Tier 3: Path B (Mobile Blitzkrieg) - MUTEX B
      { id: 'mb_bl_momentum', category: 'mobility', tier: 3, nameKey: 'mb_bl_momentum_name', descKey: 'mb_bl_momentum_desc', icon: 'sprint', maxRank: 3, baseCost: 350, costMult: 1.6, parents: ['mb_sprint_shield'], mutexGroup: 'mb_spec', mutexBranch: 'B' },
      { id: 'mb_bl_drift_fire', category: 'mobility', tier: 3, nameKey: 'mb_bl_drift_fire_name', descKey: 'mb_bl_drift_fire_desc', icon: '🔫', maxRank: 3, baseCost: 400, costMult: 1.6, parents: ['mb_bl_momentum'], mutexGroup: 'mb_spec', mutexBranch: 'B' },
      { id: 'mb_bl_static', category: 'mobility', tier: 3, nameKey: 'mb_bl_static_name', descKey: 'mb_bl_static_desc', icon: 'bolt', maxRank: 3, baseCost: 450, costMult: 1.7, parents: ['mb_bl_drift_fire'], mutexGroup: 'mb_spec', mutexBranch: 'B' },
      { id: 'mb_bl_overclock', category: 'mobility', tier: 3, nameKey: 'mb_bl_overclock_name', descKey: 'mb_bl_overclock_desc', icon: 'rocket', maxRank: 2, baseCost: 550, costMult: 1.8, parents: ['mb_bl_static'], mutexGroup: 'mb_spec', mutexBranch: 'B' },
      { id: 'mb_bl_shockwave', category: 'mobility', tier: 3, nameKey: 'mb_bl_shockwave_name', descKey: 'mb_bl_shockwave_desc', icon: 'burst', maxRank: 2, baseCost: 650, costMult: 1.8, parents: ['mb_bl_overclock'], mutexGroup: 'mb_spec', mutexBranch: 'B' },
      { id: 'mb_bl_perpetual', category: 'mobility', tier: 3, nameKey: 'mb_bl_perpetual_name', descKey: 'mb_bl_perpetual_desc', icon: 'infinity', maxRank: 1, baseCost: 950, costMult: 1.0, parents: ['mb_bl_shockwave'], mutexGroup: 'mb_spec', mutexBranch: 'B' },

      // Tier 4 (Capstones)
      { id: 'mb_time_freeze', category: 'mobility', tier: 4, nameKey: 'mb_time_freeze_name', descKey: 'mb_time_freeze_desc', icon: '⏳', maxRank: 1, baseCost: 1500, costMult: 1.0, parents: ['mb_sn_zenith', 'mb_bl_perpetual'] },
      { id: 'mb_tachyon_rift', category: 'mobility', tier: 4, nameKey: 'mb_tachyon_rift_name', descKey: 'mb_tachyon_rift_desc', icon: 'void', maxRank: 1, baseCost: 1800, costMult: 1.0, parents: ['mb_time_freeze'] },

      // =======================================================================
      // 4. ECONOMY & UTILITY TREE (26 NODES)
      // =======================================================================
      // Tier 1 (2 Gateway Starters + 4 Foundation Branches)
      { id: 'ec_magnet', category: 'economy', tier: 1, nameKey: 'ec_magnet_name', descKey: 'ec_magnet_desc', icon: 'magnet', maxRank: 5, baseCost: 50, costMult: 1.4 },
      { id: 'ec_scavenger', category: 'economy', tier: 1, nameKey: 'ec_scavenger_name', descKey: 'ec_scavenger_desc', icon: 'gem', maxRank: 5, baseCost: 60, costMult: 1.4 },
      { id: 'ec_xp_booster', category: 'economy', tier: 1, nameKey: 'ec_xp_booster_name', descKey: 'ec_xp_booster_desc', icon: '🧠', maxRank: 4, baseCost: 70, costMult: 1.4, parents: ['ec_magnet'] },
      { id: 'ec_crate_sensor', category: 'economy', tier: 1, nameKey: 'ec_crate_sensor_name', descKey: 'ec_crate_sensor_desc', icon: 'box', maxRank: 3, baseCost: 60, costMult: 1.4, parents: ['ec_magnet'] },
      { id: 'ec_coin_multiplier', category: 'economy', tier: 1, nameKey: 'ec_coin_multiplier_name', descKey: 'ec_coin_multiplier_desc', icon: 'coin', maxRank: 3, baseCost: 65, costMult: 1.4, parents: ['ec_scavenger'] },
      { id: 'ec_gem_magnet', category: 'economy', tier: 1, nameKey: 'ec_gem_magnet_name', descKey: 'ec_gem_magnet_desc', icon: 'spark', maxRank: 3, baseCost: 75, costMult: 1.5, parents: ['ec_scavenger'] },

      // Tier 2 (Advanced Sub-branches)
      { id: 'ec_reroll', category: 'economy', tier: 2, nameKey: 'ec_reroll_name', descKey: 'ec_reroll_desc', icon: 'dice', maxRank: 3, baseCost: 160, costMult: 1.6, parents: ['ec_scavenger'] },
      { id: 'ec_lifesteal', category: 'economy', tier: 2, nameKey: 'ec_lifesteal_name', descKey: 'ec_lifesteal_desc', icon: 'bleed', maxRank: 4, baseCost: 180, costMult: 1.6, parents: ['ec_xp_booster'] },
      { id: 'ec_chest_overdrive', category: 'economy', tier: 2, nameKey: 'ec_chest_overdrive_name', descKey: 'ec_chest_overdrive_desc', icon: 'star', maxRank: 2, baseCost: 220, costMult: 1.7, parents: ['ec_crate_sensor'] },
      { id: 'ec_drop_purity', category: 'economy', tier: 2, nameKey: 'ec_drop_purity_name', descKey: 'ec_drop_purity_desc', icon: 'gem', maxRank: 3, baseCost: 170, costMult: 1.5, parents: ['ec_gem_magnet'] },
      { id: 'ec_nuke_radius', category: 'economy', tier: 2, nameKey: 'ec_nuke_radius_name', descKey: 'ec_nuke_radius_desc', icon: 'burst', maxRank: 2, baseCost: 190, costMult: 1.6, parents: ['ec_magnet'] },
      { id: 'ec_vacuum_pulse', category: 'economy', tier: 2, nameKey: 'ec_vacuum_pulse_name', descKey: 'ec_vacuum_pulse_desc', icon: 'magnet', maxRank: 2, baseCost: 210, costMult: 1.7, parents: ['ec_coin_multiplier'] },

      // Tier 3: Path A (Shard Tycoon) - MUTEX A
      { id: 'ec_ty_interest', category: 'economy', tier: 3, nameKey: 'ec_ty_interest_name', descKey: 'ec_ty_interest_desc', icon: 'growth', maxRank: 3, baseCost: 350, costMult: 1.6, parents: ['ec_drop_purity'], mutexGroup: 'ec_spec', mutexBranch: 'A' },
      { id: 'ec_ty_bounty', category: 'economy', tier: 3, nameKey: 'ec_ty_bounty_name', descKey: 'ec_ty_bounty_desc', icon: 'target', maxRank: 3, baseCost: 400, costMult: 1.6, parents: ['ec_ty_interest'], mutexGroup: 'ec_spec', mutexBranch: 'A' },
      { id: 'ec_ty_crate_loot', category: 'economy', tier: 3, nameKey: 'ec_ty_crate_loot_name', descKey: 'ec_ty_crate_loot_desc', icon: 'box', maxRank: 3, baseCost: 450, costMult: 1.7, parents: ['ec_ty_bounty'], mutexGroup: 'ec_spec', mutexBranch: 'A' },
      { id: 'ec_ty_duplicator', category: 'economy', tier: 3, nameKey: 'ec_ty_duplicator_name', descKey: 'ec_ty_duplicator_desc', icon: 'spark', maxRank: 2, baseCost: 550, costMult: 1.8, parents: ['ec_ty_crate_loot'], mutexGroup: 'ec_spec', mutexBranch: 'A' },
      { id: 'ec_ty_respec_master', category: 'economy', tier: 3, nameKey: 'ec_ty_respec_master_name', descKey: 'ec_ty_respec_master_desc', icon: 'ricochet', maxRank: 2, baseCost: 650, costMult: 1.8, parents: ['ec_ty_duplicator'], mutexGroup: 'ec_spec', mutexBranch: 'A' },
      { id: 'ec_ty_limitless', category: 'economy', tier: 3, nameKey: 'ec_ty_limitless_name', descKey: 'ec_ty_limitless_desc', icon: 'crown', maxRank: 1, baseCost: 950, costMult: 1.0, parents: ['ec_ty_respec_master'], mutexGroup: 'ec_spec', mutexBranch: 'A' },

      // Tier 3: Path B (Armory Prodigy) - MUTEX B
      { id: 'ec_ar_rarity', category: 'economy', tier: 3, nameKey: 'ec_ar_rarity_name', descKey: 'ec_ar_rarity_desc', icon: '🃏', maxRank: 3, baseCost: 350, costMult: 1.6, parents: ['ec_chest_overdrive'], mutexGroup: 'ec_spec', mutexBranch: 'B' },
      { id: 'ec_ar_banish', category: 'economy', tier: 3, nameKey: 'ec_ar_banish_name', descKey: 'ec_ar_banish_desc', icon: '🚫', maxRank: 2, baseCost: 400, costMult: 1.6, parents: ['ec_ar_rarity'], mutexGroup: 'ec_spec', mutexBranch: 'B' },
      { id: 'ec_ar_duplicate', category: 'economy', tier: 3, nameKey: 'ec_ar_duplicate_name', descKey: 'ec_ar_duplicate_desc', icon: '♊', maxRank: 2, baseCost: 450, costMult: 1.7, parents: ['ec_ar_banish'], mutexGroup: 'ec_spec', mutexBranch: 'B' },
      { id: 'ec_ar_weapon_slots', category: 'economy', tier: 3, nameKey: 'ec_ar_weapon_slots_name', descKey: 'ec_ar_weapon_slots_desc', icon: 'sword', maxRank: 2, baseCost: 550, costMult: 1.8, parents: ['ec_ar_duplicate'], mutexGroup: 'ec_spec', mutexBranch: 'B' },
      { id: 'ec_ar_master_smith', category: 'economy', tier: 3, nameKey: 'ec_ar_master_smith_name', descKey: 'ec_ar_master_smith_desc', icon: '🔨', maxRank: 2, baseCost: 650, costMult: 1.8, parents: ['ec_ar_weapon_slots'], mutexGroup: 'ec_spec', mutexBranch: 'B' },
      { id: 'ec_ar_evolution', category: 'economy', tier: 3, nameKey: 'ec_ar_evolution_name', descKey: 'ec_ar_evolution_desc', icon: 'star', maxRank: 1, baseCost: 950, costMult: 1.0, parents: ['ec_ar_master_smith'], mutexGroup: 'ec_spec', mutexBranch: 'B' },

      // Tier 4 (Capstones)
      { id: 'ec_ascension', category: 'economy', tier: 4, nameKey: 'ec_ascension_name', descKey: 'ec_ascension_desc', icon: 'crown', maxRank: 1, baseCost: 1500, costMult: 1.0, parents: ['ec_ty_limitless', 'ec_ar_evolution'] },
      { id: 'ec_cosmic_magnet', category: 'economy', tier: 4, nameKey: 'ec_cosmic_magnet_name', descKey: 'ec_cosmic_magnet_desc', icon: 'void', maxRank: 1, baseCost: 1800, costMult: 1.0, parents: ['ec_ascension'] },
    ];

    rawNodes.forEach((n) => {
      this.nodes.set(n.id, {
        ...n,
        currentRank: 0,
        nodeType: 'minor',
        x: 0,
        y: 0,
      });
    });

    this.assignNodePositions();
  }

  private assignNodePositions() {
    const categoryAngles: Record<SkillTreeCategory, number> = {
      warfare: (-135 * Math.PI) / 180, // Top-Left (225 deg)
      defense: (-45 * Math.PI) / 180,  // Top-Right (315 deg)
      mobility: (135 * Math.PI) / 180, // Bottom-Left (135 deg)
      economy: (45 * Math.PI) / 180,   // Bottom-Right (45 deg)
    };

    const categories: SkillTreeCategory[] = ['warfare', 'defense', 'mobility', 'economy'];

    for (const cat of categories) {
      const baseAngle = categoryAngles[cat];
      const catNodes = Array.from(this.nodes.values()).filter((n) => n.category === cat);

      const t1 = catNodes.filter((n) => n.tier === 1);
      const t2 = catNodes.filter((n) => n.tier === 2);
      const t3A = catNodes.filter((n) => n.tier === 3 && n.mutexBranch === 'A');
      const t3B = catNodes.filter((n) => n.tier === 3 && n.mutexBranch === 'B');
      const t4 = catNodes.filter((n) => n.tier === 4);

      // Tier 1: 2 Gateway Starters (R = 190px) + 4 Foundation Branches (R = 300px)
      // Gateway 1 (Index 0) and Gateway 2 (Index 1) connect directly to Nexus (0, 0)
      if (t1[0]) {
        const angle = baseAngle - (12 * Math.PI) / 180;
        t1[0].x = Math.round(Math.cos(angle) * 190);
        t1[0].y = Math.round(Math.sin(angle) * 190);
        t1[0].nodeType = 'notable'; // Distinct gateway hub
      }
      if (t1[1]) {
        const angle = baseAngle + (12 * Math.PI) / 180;
        t1[1].x = Math.round(Math.cos(angle) * 190);
        t1[1].y = Math.round(Math.sin(angle) * 190);
        t1[1].nodeType = 'notable'; // Distinct gateway hub
      }
      // Sub-branches extending outward from Gateways
      const t1Secondary = [
        { idx: 2, deg: -22 },
        { idx: 3, deg: -7 },
        { idx: 4, deg: 7 },
        { idx: 5, deg: 22 },
      ];
      for (const item of t1Secondary) {
        if (t1[item.idx]) {
          const angle = baseAngle + (item.deg * Math.PI) / 180;
          t1[item.idx].x = Math.round(Math.cos(angle) * 300);
          t1[item.idx].y = Math.round(Math.sin(angle) * 300);
          t1[item.idx].nodeType = 'minor';
        }
      }

      // Tier 2 (6 nodes) - Mid Ring (R = 490px)
      const t2Offsets = [-30, -18, -6, 6, 18, 30];
      t2.forEach((node, i) => {
        const angle = baseAngle + (t2Offsets[i] * Math.PI) / 180;
        node.x = Math.round(Math.cos(angle) * 490);
        node.y = Math.round(Math.sin(angle) * 490);
        node.nodeType = 'notable';
      });

      // Tier 3 Path A Cluster (6 nodes) - Flank A (R = 790px, angle offset -20 deg)
      const angleA = baseAngle - (20 * Math.PI) / 180;
      const cxA = Math.cos(angleA) * 790;
      const cyA = Math.sin(angleA) * 790;
      const rA = 135;
      t3A.forEach((node, i) => {
        if (i < 5) {
          const subAngle = baseAngle + Math.PI + (i * 2 * Math.PI) / 5;
          node.x = Math.round(cxA + Math.cos(subAngle) * rA);
          node.y = Math.round(cyA + Math.sin(subAngle) * rA);
          node.nodeType = (i === 0 || i === 2) ? 'notable' : 'minor';
        } else {
          // 6th node is the Keystone in cluster apex/center!
          node.x = Math.round(cxA);
          node.y = Math.round(cyA);
          node.nodeType = 'keystone';
        }
      });

      // Tier 3 Path B Cluster (6 nodes) - Flank B (R = 790px, angle offset +20 deg)
      const angleB = baseAngle + (20 * Math.PI) / 180;
      const cxB = Math.cos(angleB) * 790;
      const cyB = Math.sin(angleB) * 790;
      const rB = 135;
      t3B.forEach((node, i) => {
        if (i < 5) {
          const subAngle = baseAngle + Math.PI + (i * 2 * Math.PI) / 5;
          node.x = Math.round(cxB + Math.cos(subAngle) * rB);
          node.y = Math.round(cyB + Math.sin(subAngle) * rB);
          node.nodeType = (i === 0 || i === 2) ? 'notable' : 'minor';
        } else {
          // 6th node is the Keystone in cluster apex/center!
          node.x = Math.round(cxB);
          node.y = Math.round(cyB);
          node.nodeType = 'keystone';
        }
      });

      // Tier 4 Capstones (2 nodes) - Apex (R = 1140px)
      const t4Offsets = [-9, 9];
      t4.forEach((node, i) => {
        const angle = baseAngle + (t4Offsets[i] * Math.PI) / 180;
        node.x = Math.round(Math.cos(angle) * 1140);
        node.y = Math.round(Math.sin(angle) * 1140);
        node.nodeType = 'keystone';
      });
    }
  }

  private loadState() {
    try {
      const savedShards = localStorage.getItem('survi_run_shards');
      if (savedShards) {
        this.shards = parseInt(savedShards, 10) || 0;
      }

      const savedSkills = localStorage.getItem('survi_run_skills_v2');
      if (savedSkills) {
        const parsed = JSON.parse(savedSkills);
        for (const [id, rank] of Object.entries(parsed)) {
          const node = this.nodes.get(id);
          if (node) {
            node.currentRank = Math.min(node.maxRank, Number(rank) || 0);
          }
        }
      }
    } catch {
      // Fallback
    }
  }

  private saveState() {
    try {
      localStorage.setItem('survi_run_shards', this.shards.toString());
      const skillsObj: Record<string, number> = {};
      this.nodes.forEach((node, id) => {
        skillsObj[id] = node.currentRank;
      });
      localStorage.setItem('survi_run_skills_v2', JSON.stringify(skillsObj));
    } catch {
      // Ignore
    }
  }

  public getShards(): number {
    return this.shards;
  }

  public addShards(amount: number) {
    this.shards += Math.max(0, amount);
    this.saveState();
  }

  public spendShards(amount: number): boolean {
    if (this.shards >= amount) {
      this.shards -= amount;
      this.saveState();
      return true;
    }
    return false;
  }

  public getNodesByCategory(category: SkillTreeCategory): SkillNode[] {
    const list: SkillNode[] = [];
    this.nodes.forEach((n) => {
      if (n.category === category) list.push(n);
    });
    return list;
  }

  public getNode(id: string): SkillNode | undefined {
    return this.nodes.get(id);
  }

  public getNodeCost(node: SkillNode): number {
    if (node.currentRank >= node.maxRank) return 0;
    return Math.round(node.baseCost * Math.pow(node.costMult, node.currentRank));
  }

  /**
   * Checks if this node is locked out due to a mutually exclusive choice
   */
  public isMutexLocked(node: SkillNode): boolean {
    if (!node.mutexGroup || !node.mutexBranch) return false;

    // Check all other nodes in the same mutexGroup
    for (const other of this.nodes.values()) {
      if (
        other.mutexGroup === node.mutexGroup &&
        other.mutexBranch !== node.mutexBranch &&
        other.currentRank > 0
      ) {
        return true; // Conflicting branch already has points!
      }
    }
    return false;
  }

  /**
   * Checks if prerequisite parent nodes are satisfied
   */
  public areParentsSatisfied(node: SkillNode): boolean {
    if (!node.parents || node.parents.length === 0) return true;
    if (node.tier === 4 && node.parents.length > 1) {
      // For capstones branching from opposing mutex paths, unlocking either path suffices
      return node.parents.some((parentId) => {
        const parent = this.nodes.get(parentId);
        return parent && parent.currentRank >= 1;
      });
    }
    for (const parentId of node.parents) {
      const parent = this.nodes.get(parentId);
      if (!parent || parent.currentRank < 1) {
        return false;
      }
    }
    return true;
  }

  public getAllNodes(): SkillNode[] {
    return Array.from(this.nodes.values());
  }

  public getTotalAllocatedPoints(): number {
    let count = 0;
    for (const node of this.nodes.values()) {
      count += node.currentRank;
    }
    return count;
  }

  public canUpgrade(id: string): boolean {
    const node = this.nodes.get(id);
    if (!node) return false;
    if (node.currentRank >= node.maxRank) return false;
    if (this.isMutexLocked(node)) return false;
    if (!this.areParentsSatisfied(node)) return false;
    return this.shards >= this.getNodeCost(node);
  }

  public upgrade(id: string): boolean {
    const node = this.nodes.get(id);
    if (!node) return false;
    if (!this.canUpgrade(id)) return false;

    const cost = this.getNodeCost(node);
    this.shards -= cost;
    node.currentRank++;
    sounds.playLevelUp();
    this.saveState();
    return true;
  }

  public respecAll(): number {
    let refunded = 0;
    this.nodes.forEach((node) => {
      for (let r = 0; r < node.currentRank; r++) {
        refunded += Math.round(node.baseCost * Math.pow(node.costMult, r));
      }
      node.currentRank = 0;
    });

    this.shards += refunded;
    sounds.playChest();
    this.saveState();
    return refunded;
  }

  public applyToPlayer(player: Player) {
    const getRank = (id: string) => this.nodes.get(id)?.currentRank ?? 0;

    // =========================================================================
    // 1. WARFARE TREE BONUSES (All 26 Nodes)
    // =========================================================================
    // Tier 1
    player.stats.damageMult += getRank('wf_kinetics') * 0.04;
    player.stats.attackSpeedMult += getRank('wf_cadence') * 0.035;
    player.stats.critChance += getRank('wf_optics') * 0.025;
    player.stats.critDamageMult += getRank('wf_caliber') * 0.20;
    player.projectileSpeedMult += getRank('wf_velocity') * 0.10;
    player.extraPierce += getRank('wf_penetration') * 1;

    // Tier 2
    player.doubleShotChance += getRank('wf_recoil_brake') * 0.08;
    player.stats.extraProjectiles += getRank('wf_multishot');
    player.shrapnelChance += getRank('wf_shrapnel') * 0.15;
    player.overdriveRank += getRank('wf_overdrive');
    player.projectileAoEMult += getRank('wf_plasma_infusion') * 0.15;
    player.knockbackMult += getRank('wf_ballistic_mass') * 0.30;

    // Tier 3: Path A (Plasma Singularity)
    player.stats.damageMult += getRank('wf_pl_core') * 0.06;
    player.burnChance += getRank('wf_pl_burn') * 0.35;
    player.chainLightningChance += getRank('wf_pl_chain') * 0.25;
    player.armorPenetrationRatio += getRank('wf_pl_melt') * 0.25;
    if (getRank('wf_pl_supercharge') > 0) player.superchargeOnCrit = true;
    if (getRank('wf_pl_singularity') > 0) player.singularityChance = 0.12;

    // Tier 3: Path B (Ballistic Overkill)
    player.stats.damageMult += getRank('wf_ba_slugs') * 0.07;
    player.flakSplinterChance += getRank('wf_ba_flak') * 0.20;
    player.concussionChance += getRank('wf_ba_concussion') * 0.10;
    player.bleedChance += getRank('wf_ba_bleed') * 0.20;
    player.ricochetBounces += getRank('wf_ba_ricochet') * 1;
    if (getRank('wf_ba_devastator') > 0) player.bossCritDamageBonus += 0.40;

    // Tier 4: Capstones
    if (getRank('wf_omni_arsenal') > 0) player.stats.damageMult += 0.15;
    if (getRank('wf_god_slayer') > 0) player.godSlayerExecute = true;

    // =========================================================================
    // 2. DEFENSE TREE BONUSES (All 26 Nodes)
    // =========================================================================
    // Tier 1
    player.stats.maxHp += getRank('df_frame') * 10;
    player.stats.armor += getRank('df_plating') * 1;
    const regen = getRank('df_regen');
    if (regen === 1) player.passiveRegenInterval = 7;
    else if (regen === 2) player.passiveRegenInterval = 5;
    else if (regen === 3) player.passiveRegenInterval = 4;
    else if (regen >= 4) player.passiveRegenInterval = 3;
    player.healEffectivenessMult += getRank('df_battery') * 0.25;
    player.hazardDamageReduction += getRank('df_tenacity') * 0.20;
    if (getRank('df_resilience') > 0) player.lowHpDoubleRegen = true;

    // Tier 2
    player.deflectChance += getRank('df_barrier') * 0.05;
    player.thornsDamage += getRank('df_thorns') * 25;
    if (getRank('df_second_wind') > 0) player.hasSecondWind = true;
    if (getRank('df_hardened_hull') > 0) player.maxDamageTakenCap = 35;
    if (getRank('df_shield_pulse') > 0) player.hasShieldPulse = true;
    player.stats.maxHp += getRank('df_overcharge_shield') * 15;

    // Tier 3: Path A (Iron Colossus)
    player.stats.armor += getRank('df_co_bastion') * 1.5;
    player.stats.maxHp += getRank('df_co_bastion') * 12;
    if (getRank('df_co_anchor') > 0) player.knockbackImmune = true;
    if (getRank('df_co_reactive') > 0) player.hasReactiveWave = true;
    player.bossDamageReduction += getRank('df_co_adamant') * 0.25;
    if (getRank('df_co_titan') > 0) player.swarmerCrushDamage = 80;
    if (getRank('df_co_invincible') > 0) player.hasInvincibleWill = true;

    // Tier 3: Path B (Phase Ghost)
    player.dodgeChance += getRank('df_gh_phase') * 0.12;
    if (getRank('df_gh_afterimage') > 0) player.dashDecoy = true;
    player.stats.speed += getRank('df_gh_speed') * 8;
    player.stats.dashCooldown = Math.max(1.4, player.stats.dashCooldown - getRank('df_gh_speed') * 0.2);
    if (getRank('df_gh_stealth') > 0) player.dashStealth = true;
    if (getRank('df_gh_chrono') > 0) player.stats.dashSpeedMult *= 1.4;
    if (getRank('df_gh_untouchable') > 0) player.dodgeHealsHp = 5;

    // Tier 4: Capstones
    if (getRank('df_phoenix_reactor') > 0) {
      player.hasEmergencyShield = true;
      player.emergencyShieldUsed = false;
      player.phoenixFullRevive = true;
    }
    if (getRank('df_nanite_hive') > 0) player.hasNaniteHive = true;

    // =========================================================================
    // 3. MOBILITY TREE BONUSES (All 26 Nodes)
    // =========================================================================
    // Tier 1
    player.stats.speed += getRank('mb_thrusters') * 6;
    player.stats.dashCooldown = Math.max(1.4, player.stats.dashCooldown - getRank('mb_jump_jet') * 0.25);
    player.driftResponsiveness += getRank('mb_drift') * 0.20;
    player.focusThreshold = Math.max(0.12, 0.40 - getRank('mb_stance') * 0.05);
    if (getRank('mb_strafe') > 0) player.speedPenaltyFree = true;
    player.stats.dashDuration += getRank('mb_boost') * 0.05;

    // Tier 2
    if (getRank('mb_dash_trail') > 0) player.dashFireTrail = true;
    if (getRank('mb_dash_stun') > 0) player.dashStunEnemies = true;
    player.focusAttackSpeedBonus += getRank('mb_focus_haste') * 0.15;
    player.focusCritBonus += getRank('mb_focus_crit') * 0.15;
    if (getRank('mb_sprint_shield') > 0) player.sprintShieldMax = getRank('mb_sprint_shield') * 15;
    if (getRank('mb_warp') > 0) player.dashWarp = true;

    // Tier 3: Path A (Archero Sniper)
    if (getRank('mb_sn_nest') > 0) {
      player.focusThreshold = 0.20;
      player.focusDamageBonus += 0.15;
    }
    if (getRank('mb_sn_calm') > 0) {
      player.focusFireRateBonus += 0.40;
      player.focusVelocityBonus += 0.25;
    }
    player.focusExtraPierce += getRank('mb_sn_pierce') * 1;
    if (getRank('mb_sn_homing') > 0) player.focusHoming = true;
    if (getRank('mb_sn_overcharge') > 0) player.focusOverchargeShot = true;
    if (getRank('mb_sn_zenith') > 0) player.focusAuraSlow = true;

    // Tier 3: Path B (Mobile Blitzkrieg)
    player.sprintSpeedBonus += getRank('mb_bl_momentum') * 8;
    if (getRank('mb_bl_drift_fire') > 0) player.movingFireRateBonus = 0.15;
    if (getRank('mb_bl_static') > 0) player.sprintStaticDischarge = true;
    if (getRank('mb_bl_overclock') > 0) player.sprintDashRechargeMult = 1.5;
    if (getRank('mb_bl_shockwave') > 0) player.dashSonicBoom = true;
    if (getRank('mb_bl_perpetual') > 0) player.sprintKillResetDash = true;

    // Tier 4: Capstones
    if (getRank('mb_time_freeze') > 0) player.dashProjectileFreeze = true;
    if (getRank('mb_tachyon_rift') > 0) player.eliteKillUnlimitedDash = true;

    // =========================================================================
    // 4. ECONOMY TREE BONUSES (All 26 Nodes)
    // =========================================================================
    // Tier 1
    player.stats.pickupRadius += getRank('ec_magnet') * 10;
    player.shardMultiplier += getRank('ec_scavenger') * 0.10;
    player.xpMultiplier += getRank('ec_xp_booster') * 0.08;
    if (getRank('ec_crate_sensor') > 0) player.crateRadarSensor = true;
    player.coinMultiplier += getRank('ec_coin_multiplier') * 0.15;
    player.gemAttractSpeedMult += getRank('ec_gem_magnet') * 0.20;

    // Tier 2
    player.availableRerolls += getRank('ec_reroll');
    player.stats.lifeSteal += getRank('ec_lifesteal') * 0.015;
    if (getRank('ec_chest_overdrive') > 0) player.chestExtraCard = true;
    player.doubleShardChance += getRank('ec_drop_purity') * 0.10;
    if (getRank('ec_nuke_radius') > 0) player.nukeExtraXp = true;
    if (getRank('ec_vacuum_pulse') > 0) player.autoVacuumInterval = 120;

    // Tier 3: Path A (Shard Tycoon)
    player.shardMultiplier += getRank('ec_ty_interest') * 0.15;
    player.eliteBonusShards += getRank('ec_ty_bounty') * 25;
    if (getRank('ec_ty_crate_loot') > 0) player.crateBonusShardChance = 0.40;
    if (getRank('ec_ty_duplicator') > 0) player.shardDuplicationChance = 0.20;
    if (getRank('ec_ty_respec_master') > 0) player.convertCoinsToShards = true;
    if (getRank('ec_ty_limitless') > 0) player.shardMultiplier += 0.50;

    // Tier 3: Path B (Armory Prodigy)
    player.rareCardBonusChance += getRank('ec_ar_rarity') * 0.25;
    player.banishCharges += getRank('ec_ar_banish') * 1;
    if (getRank('ec_ar_duplicate') > 0) player.dualUpgradeChance = 0.15;
    player.weaponMaxRankDiscount += getRank('ec_ar_weapon_slots') * 1;
    if (getRank('ec_ar_master_smith') > 0) player.upgradePowerMult = 1.10;
    if (getRank('ec_ar_evolution') > 0) player.earlyEvolutionUnlocked = true;

    // Tier 4: Capstones
    if (getRank('ec_ascension') > 0) player.infiniteAscension = true;
    if (getRank('ec_cosmic_magnet') > 0) player.stats.pickupRadius += 220;

    // Update HP to new max HP
    player.stats.hp = player.stats.maxHp;
  }
}

export const skillTree = new SkillTreeManager();
