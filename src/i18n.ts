export type Language = 'en' | 'tr';

export interface Translations {
  [key: string]: string;
  // Title & Start Screen
  gameTitle: string;
  gameSubtitle: string;
  gameDescription: string;
  ctrlMove: string;
  ctrlDash: string;
  ctrlFocus: string;
  ctrlSelect: string;
  btnStart: string;
  btnHowToPlay: string;
  btnSettings: string;
  btnSkillTree: string;
  btnClose: string;
  bestRecord: string;
  shardsLabel: string;
  deployHint: string;
  settingsTitle: string;
  langLabel: string;
  soundLabel: string;

  // Skill Tree
  skillTreeTitle: string;
  skillTreeSubtitle: string;
  branchCombat: string;
  branchDefense: string;
  branchUtility: string;
  respecBtn: string;
  respecConfirm: string;
  upgradeCost: string;
  maxRank: string;
  currentBonus: string;
  nextBonus: string;
  rerollBtn: string;
  shardsEarned: string;

  // Skill Tree Header & HUD
  stBrandTag: string;
  shardsUnit: string;
  nexusLabel: string;
  nexusCore: string;
  tierLabel: string;
  rankLabel: string;

  // Skill Node Tags
  tagMinor: string;
  tagNotable: string;
  tagKeystone: string;

  // Tooltip Statuses
  statusMaxed: string;
  statusMutex: string;
  statusPrereq: string;
  promptUpgrade: string;
  promptInsufficient: string;

  // Navigation tooltips
  tipWarfare: string;
  tipDefense: string;
  tipMobility: string;
  tipEconomy: string;
  tipNexus: string;
  tipShards: string;
  tipPoints: string;
  tipRespec: string;
  tipClose: string;
  tipZoomIn: string;
  tipZoomOut: string;
  tipRecenter: string;

  // Bottom Legend
  legendDrag: string;
  legendDragAction: string;
  legendScroll: string;
  legendScrollAction: string;
  legendClick: string;
  legendClickAction: string;

  // Upgrade Cards & HUD
  cardNew: string;
  cardLvl: string;

  // Pause & Modals
  tacticalOverride: string;
  systemSuspended: string;

  // Sectors
  sectorTag: string;
  activeSector: string;
  selectSector: string;
  hazardRating: string;

  // Settings & Policies (Google Play Store & Console Compliant)
  tabGeneral: string;
  tabPrivacy: string;
  tabTerms: string;
  tabDataSafety: string;
  resetDataLabel: string;
  resetDataDesc: string;
  btnResetData: string;
  resetDataConfirm: string;
  resetDataSuccess: string;

  // Privacy Policy
  privacyTitle: string;
  policyEffectiveDate: string;
  privacySection1Title: string;
  privacySection1Desc: string;
  privacySection2Title: string;
  privacySection2Desc: string;
  privacySection3Title: string;
  privacySection3Desc: string;
  privacySection4Title: string;
  privacySection4Desc: string;
  developerLabel: string;
  contactEmailLabel: string;

  // Terms of Service
  termsTitle: string;
  termsEffectiveDate: string;
  termsSection1Title: string;
  termsSection1Desc: string;
  termsSection2Title: string;
  termsSection2Desc: string;
  termsSection3Title: string;
  termsSection3Desc: string;
  termsSection4Title: string;
  termsSection4Desc: string;

  // Data Safety
  dataSafetyTitle: string;
  safetyEncryptedTitle: string;
  safetyEncryptedDesc: string;
  safetyNoSharingTitle: string;
  safetyNoSharingDesc: string;
  safetyChildrenTitle: string;
  safetyChildrenDesc: string;
  safetyDeletionTitle: string;
  safetyDeletionDesc: string;
  safetyFooterText: string;

  // Skills
  sk_kinetic_name: string;
  sk_kinetic_desc: string;
  sk_rapid_name: string;
  sk_rapid_desc: string;
  sk_optics_name: string;
  sk_optics_desc: string;
  sk_caliber_name: string;
  sk_caliber_desc: string;
  sk_split_name: string;
  sk_split_desc: string;

  sk_frame_name: string;
  sk_frame_desc: string;
  sk_armor_name: string;
  sk_armor_desc: string;
  sk_regen_name: string;
  sk_regen_desc: string;
  sk_thrusters_name: string;
  sk_thrusters_desc: string;
  sk_deflector_name: string;
  sk_deflector_desc: string;

  sk_magnet_name: string;
  sk_magnet_desc: string;
  sk_scavenger_name: string;
  sk_scavenger_desc: string;
  sk_overclock_name: string;
  sk_overclock_desc: string;
  sk_leech_name: string;
  sk_leech_desc: string;
  sk_reroll_name: string;
  sk_reroll_desc: string;

  // Guide
  guideTitle: string;
  guideMovementTitle: string;
  guideMovementDesc: string;
  guideDashTitle: string;
  guideDashDesc: string;
  guideFocusTitle: string;
  guideFocusDesc: string;
  guideSynergyTitle: string;
  guideSynergyDesc: string;

  // HUD
  lvl: string;
  weapons: string;
  passives: string;
  dashReady: string;
  dashCooling: string;
  focusBuff: string;

  // Announcements
  bossAlert: string;
  vacuumAlert: string;
  nukeAlert: string;
  shieldReviveAlert: string;

  // Modals
  levelUpTitle: string;
  levelUpSubtitle: string;
  cardHint: string;
  chestTitle: string;
  chestCollect: string;
  gameOverTitle: string;
  timeSurvived: string;
  enemiesDefeated: string;
  finalLevel: string;
  btnPlayAgain: string;
  btnMainMenu: string;
  pauseTitle: string;
  btnResume: string;
  btnRestart: string;
  audioOn: string;
  audioMuted: string;

  // Weapons
  w_plasma_blaster_name: string;
  w_plasma_blaster_desc: string;
  w_orbiting_blades_name: string;
  w_orbiting_blades_desc: string;
  w_lightning_coil_name: string;
  w_lightning_coil_desc: string;
  w_toxic_aura_name: string;
  w_toxic_aura_desc: string;
  w_seeker_missiles_name: string;
  w_seeker_missiles_desc: string;
  w_scatter_cannon_name: string;
  w_scatter_cannon_desc: string;
  w_piercing_laser_name: string;
  w_piercing_laser_desc: string;

  // Passives
  p_overclock_name: string;
  p_overclock_desc: string;
  p_titan_armor_name: string;
  p_titan_armor_desc: string;
  p_nano_magnet_name: string;
  p_nano_magnet_desc: string;
  p_vampire_chip_name: string;
  p_vampire_chip_desc: string;
  p_nitro_thruster_name: string;
  p_nitro_thruster_desc: string;
  p_targeting_cpu_name: string;
  p_targeting_cpu_desc: string;
  p_energy_core_name: string;
  p_energy_core_desc: string;
  p_multi_barrel_name: string;
  p_multi_barrel_desc: string;
  p_heal_name: string;
  p_heal_desc: string;
}

import { enSkillTranslations, trSkillTranslations } from './systems/skillTreeTranslations';

const en: Translations = {
  ...enSkillTranslations,
  gameTitle: 'SURVI RUN',
  gameSubtitle: 'CYBER HORDE ROGUELITE',
  gameDescription: 'An intense bullet-heaven roguelite. Outmaneuver cybernetic legions, harvest energy crystals, and synthesize an unstoppable arsenal.',
  ctrlMove: 'Move & Kite',
  ctrlDash: 'Phase Dash',
  ctrlFocus: 'Focus Mode',
  ctrlSelect: 'Choose Upgrade',
  btnStart: 'DEPLOY MISSION',
  btnHowToPlay: 'HOW TO PLAY',
  btnSettings: 'SETTINGS',
  btnSkillTree: 'SKILL TREE',
  btnClose: 'CLOSE',
  bestRecord: 'BEST RECORD',
  shardsLabel: 'NANO SHARDS',
  deployHint: 'Press [SPACE] or Click to Deploy',
  settingsTitle: 'SYSTEM SETTINGS',
  langLabel: 'Language',
  soundLabel: 'Audio Synthesizer',

  // Skill Tree
  skillTreeTitle: 'SKILL TREE',
  skillTreeSubtitle: 'Permanent passive upgrades unlocked with Nano Shards earned from missions.',
  branchCombat: 'COMBAT CORE',
  branchDefense: 'NANOTECH CHASSIS',
  branchUtility: 'CYBER UTILITY',
  respecBtn: 'RESET ALL NODES (100% REFUND)',
  respecConfirm: 'Reset all skills and refund all Nano Shards?',
  upgradeCost: 'Cost',
  maxRank: 'MAX RANK',
  currentBonus: 'Current',
  nextBonus: 'Next Rank',
  rerollBtn: 'REROLL CARDS',
  shardsEarned: 'Nano Shards Earned:',

  // Skill Tree Header & HUD
  stBrandTag: 'PASSIVE SKILL MATRIX',
  shardsUnit: 'SHARDS',
  nexusLabel: 'NEXUS',
  nexusCore: 'NEXUS CORE',
  tierLabel: 'TIER',
  rankLabel: 'RANK:',

  // Skill Node Tags
  tagMinor: '[MINOR] BASIC SKILL',
  tagNotable: '[NOTABLE] ADVANCED SKILL',
  tagKeystone: '[KEYSTONE] MASTERY',

  // Tooltip Statuses
  statusMaxed: 'MAX RANK',
  statusMutex: 'LOCKED: Opposite specialization chosen!',
  statusPrereq: 'LOCKED: Prerequisite skill required',
  promptUpgrade: 'CLICK TO UPGRADE',
  promptInsufficient: '(Insufficient Shards)',

  // Navigation tooltips
  tipWarfare: 'Go to Warfare Tree',
  tipDefense: 'Go to Defense Tree',
  tipMobility: 'Go to Mobility Tree',
  tipEconomy: 'Go to Economy Tree',
  tipNexus: 'Center on Nexus',
  tipShards: 'Available Nano Shards',
  tipPoints: 'Allocated Skill Points',
  tipRespec: 'Reset all points (100% refund)',
  tipClose: 'Close',
  tipZoomIn: 'Zoom In',
  tipZoomOut: 'Zoom Out',
  tipRecenter: 'Recenter View',

  // Bottom Legend
  legendDrag: 'Drag',
  legendDragAction: 'to Pan',
  legendScroll: 'Scroll',
  legendScrollAction: 'to Zoom',
  legendClick: 'Click',
  legendClickAction: 'to Upgrade',

  // Upgrade Cards & HUD
  cardNew: 'NEW:',
  cardLvl: 'LV.',

  // Pause & Modals
  tacticalOverride: 'TACTICAL PAUSE',
  systemSuspended: 'SYSTEM SUSPENDED // STANDBY',

  // Sectors
  sectorTag: 'OPERATIONAL ZONES',
  activeSector: 'ACTIVE SECTOR',
  selectSector: 'SELECT SECTOR',
  hazardRating: 'Hazard Rating',

  // Settings & Policies (Google Play Store & Console Compliant)
  tabGeneral: 'General',
  tabPrivacy: 'Privacy Policy',
  tabTerms: 'Terms of Service',
  tabDataSafety: 'Data Safety',
  resetDataLabel: 'Reset All Saved Data',
  resetDataDesc: 'Permanently wipes all local progress including records, Nano Shards, and skill tree unlocks.',
  btnResetData: 'WIPE DATA',
  resetDataConfirm: 'WARNING: All game progress, best records, and shards will be permanently wiped. Are you sure?',
  resetDataSuccess: 'All game data has been successfully reset.',

  // Privacy Policy
  privacyTitle: 'Survi Run Privacy Policy',
  policyEffectiveDate: 'Effective Date: 2026 | Google Play Console Compliant',
  privacySection1Title: '1. Data Collection & Processing',
  privacySection1Desc: 'Survi Run does not collect, store, or transmit any personally identifiable information (PII) such as name, email, phone number, device identifiers, contacts, camera, or microphone data. The game is architected entirely offline-first.',
  privacySection2Title: '2. Local Device Storage',
  privacySection2Desc: 'Gameplay progress (earned Nano Shards, high score records, unlocked skill tree nodes, and sound/language preferences) is stored exclusively in your local device storage (localStorage). None of this data is ever sent to external servers or third parties.',
  privacySection3Title: '3. Third-Party Services & Advertising',
  privacySection3Desc: 'Survi Run contains zero third-party tracking libraries, advertising networks, or analytics SDKs that track users or sell personal data.',
  privacySection4Title: "4. Children's Privacy (COPPA & Families Policy)",
  privacySection4Desc: "Survi Run complies with the Google Play Families Policy and the Children's Online Privacy Protection Act (COPPA). We do not knowingly collect any data from children under the age of 13.",
  developerLabel: 'Developer / Publisher',
  contactEmailLabel: 'Contact & Inquiries',

  // Terms of Service
  termsTitle: 'Terms of Service',
  termsEffectiveDate: 'Last Updated: 2026 | CyberCore Interactive',
  termsSection1Title: '1. License & Permitted Use',
  termsSection1Desc: 'CyberCore Interactive grants you a personal, non-exclusive, non-transferable, revocable license to install and play Survi Run for non-commercial personal entertainment.',
  termsSection2Title: '2. Intellectual Property',
  termsSection2Desc: 'All graphics, original artworks, audio tracks, sound effects, characters, logos, and source code are the proprietary intellectual property of CyberCore Interactive.',
  termsSection3Title: '3. Fair Use & Prohibitions',
  termsSection3Desc: 'Reverse engineering, decompiling, distributing unauthorized modifications, or injecting cheats into the game is strictly prohibited.',
  termsSection4Title: '4. Disclaimer of Warranty',
  termsSection4Desc: 'The game is provided "AS IS" without warranty of any kind. CyberCore Interactive shall not be liable for any damages or local device storage anomalies.',

  // Data Safety
  dataSafetyTitle: 'Google Play Data Safety Declaration',
  safetyEncryptedTitle: 'Zero External Transmission',
  safetyEncryptedDesc: 'All gameplay data is processed locally; no data travels over external networks.',
  safetyNoSharingTitle: 'No Third-Party Sharing',
  safetyNoSharingDesc: 'User data is never shared with, sold to, or monetized by third parties.',
  safetyChildrenTitle: 'Families & Children Compliant',
  safetyChildrenDesc: 'Fully compliant with Google Play Families Policy and COPPA regulations.',
  safetyDeletionTitle: 'User Data Deletion Mechanism',
  safetyDeletionDesc: 'Users can delete all local gameplay records anytime via the Wipe Data button or OS app storage settings.',
  safetyFooterText: 'This disclosure is prepared in strict compliance with Google Play Store Data Safety and Developer Policy requirements.',

  // Skill definitions
  sk_kinetic_name: 'Kinetic Overdrive',
  sk_kinetic_desc: '+5% Base Damage multiplier per rank.',
  sk_rapid_name: 'Rapid Capacitor',
  sk_rapid_desc: '+4% Attack Speed & Firing Rate per rank.',
  sk_optics_name: 'Precision Optics',
  sk_optics_desc: '+3% Critical Strike Chance per rank.',
  sk_caliber_name: 'Deadly Caliber',
  sk_caliber_desc: '+25% Critical Damage multiplier per rank.',
  sk_split_name: 'Split Chamber',
  sk_split_desc: 'Rank 1: +1 extra projectile. Rank 2: +15% double shot chance.',

  sk_frame_name: 'Reinforced Frame',
  sk_frame_desc: '+10 Maximum Health per rank (Base: 70 HP).',
  sk_armor_name: 'Composite Armor',
  sk_armor_desc: '+1 Flat Damage Reduction per rank.',
  sk_regen_name: 'Nanite Regenerator',
  sk_regen_desc: 'Passive Health Regen: Heals 1 HP every 8s / 6s / 4s / 3s.',
  sk_thrusters_name: 'Adrenaline Thrusters',
  sk_thrusters_desc: 'Dash cooldown reduced by 0.3s per rank (Base: 3.2s).',
  sk_deflector_name: 'Emergency Deflector',
  sk_deflector_desc: 'Once per run, survive fatal damage with 1 HP and 3s invulnerability!',

  sk_magnet_name: 'Magnetic Attractor',
  sk_magnet_desc: '+15% XP & Item Pickup Radius per rank.',
  sk_scavenger_name: 'Cyber Scavenger',
  sk_scavenger_desc: '+10% Nano Shards earned from missions per rank.',
  sk_overclock_name: 'Neural Overclock',
  sk_overclock_desc: 'Focus Mode activates faster (0.4s -> 0.25s) and grants +15% bonus dmg.',
  sk_leech_name: 'Alchemical Leech',
  sk_leech_desc: '+1.5% Life Steal chance on enemy kill per rank.',
  sk_reroll_name: 'Tactical Reroll',
  sk_reroll_desc: '+1 Card Reroll per run during Level Up card selections.',

  // Guide
  guideTitle: 'TACTICAL MANUAL',
  guideMovementTitle: 'Movement & Kiting',
  guideMovementDesc: 'Use [W, A, S, D] or Touch Joystick to navigate. Keep moving to avoid encirclement by aggressive swarms.',
  guideDashTitle: 'Phase Dash (Invulnerability)',
  guideDashDesc: 'Press [SPACE] or Mobile Dash to burst forward with temporary immunity, slipping through enemy rings.',
  guideFocusTitle: 'Archero Stutter Focus',
  guideFocusDesc: 'Stop moving for >0.4s to trigger Focus Mode. Grants +30% Fire Rate & +15% Critical Chance with a glowing aura.',
  guideSynergyTitle: 'Arsenal & Field Objects',
  guideSynergyDesc: 'Equip up to 6 weapons and 6 passives. Shoot breakable supply crates and explosive barrels to turn the tide.',

  lvl: 'LVL',
  weapons: 'WEAPONS',
  passives: 'PASSIVES',
  dashReady: 'READY [SPACE]',
  dashCooling: 'RECHARGING',
  focusBuff: 'FOCUS +30% SPD',

  bossAlert: 'ALERT: TITAN MECH HAS ENTERED THE SECTOR!',
  vacuumAlert: 'VACUUM PULSE ACTIVATED!',
  nukeAlert: 'TACTICAL NUKE DETONATED!',
  shieldReviveAlert: 'EMERGENCY DEFLECTOR ACTIVATED! (3s IMMUNITY)',

  levelUpTitle: 'SYSTEM UPGRADE',
  levelUpSubtitle: 'Select module enhancement:',
  cardHint: 'Press key or click',
  chestTitle: 'GOLDEN CACHE SECURED!',
  chestCollect: 'CLAIM UPGRADES',
  gameOverTitle: 'MISSION TERMINATED',
  timeSurvived: 'Time Survived:',
  enemiesDefeated: 'Enemies Defeated:',
  finalLevel: 'Final Level:',
  btnPlayAgain: 'DEPLOY AGAIN',
  btnMainMenu: 'MAIN MENU',
  pauseTitle: 'SYSTEM PAUSED',
  btnResume: 'RESUME',
  btnRestart: 'RESTART MISSION',
  audioOn: 'AUDIO: ON',
  audioMuted: 'AUDIO: MUTED',

  w_plasma_blaster_name: 'Plasma Blaster',
  w_plasma_blaster_desc: 'Fires piercing high-speed energy bolts at nearest targets.',
  w_orbiting_blades_name: 'Orbiting Blades',
  w_orbiting_blades_desc: 'Spinning plasma blades rotate around you, slicing swarms.',
  w_lightning_coil_name: 'Lightning Coil',
  w_lightning_coil_desc: 'Strikes random enemies with electric arcs that chain to neighbors.',
  w_toxic_aura_name: 'Toxic Aura',
  w_toxic_aura_desc: 'Deals continuous damage and slows encroaching enemies.',
  w_seeker_missiles_name: 'Seeker Missiles',
  w_seeker_missiles_desc: 'Homing micro-rockets that track targets and deal AoE damage.',
  w_scatter_cannon_name: 'Scatter Cannon',
  w_scatter_cannon_desc: 'Heavy shotgun blast with high knockback power.',
  w_piercing_laser_name: 'Piercing Laser',
  w_piercing_laser_desc: 'Pierces through all enemies in a straight line with high damage.',

  p_overclock_name: 'Overclock Chip',
  p_overclock_desc: '+15% Attack Speed & Firing Rate.',
  p_titan_armor_name: 'Titan Plating',
  p_titan_armor_desc: '+2 Armor & +25 Max Health.',
  p_nano_magnet_name: 'Nano Magnet',
  p_nano_magnet_desc: '+45% Item & XP Pickup Radius.',
  p_vampire_chip_name: 'Vampiric Leech',
  p_vampire_chip_desc: '+3% Chance on enemy kill to restore Health.',
  p_nitro_thruster_name: 'Nitro Thrusters',
  p_nitro_thruster_desc: '+15% Movement Speed & faster Dash recharge.',
  p_targeting_cpu_name: 'Targeting CPU',
  p_targeting_cpu_desc: '+8% Critical Chance & +30% Critical Damage.',
  p_energy_core_name: 'Energy Core',
  p_energy_core_desc: '+20% Base Damage for all weapons.',
  p_multi_barrel_name: 'Multi-Chamber',
  p_multi_barrel_desc: '+1 Projectile to all multi-shot weapons.',
  p_heal_name: 'Emergency Repair',
  p_heal_desc: 'Instantly restores 50 Health.',

  // Ships & Hangar
  hangarBtn: 'HANGAR',
  hangarTitle: 'FLEET HANGAR',
  hangarSubtitle: 'SHIP DOCK & VESSEL SELECTION',
  hangarSelect: 'DEPLOY SHIP',
  hangarSelected: 'ACTIVE VESSEL',
  hangarUnlock: 'UNLOCK VESSEL',
  hangarStatsSpeed: 'Speed',
  hangarStatsHp: 'Durability',
  hangarStatsArmor: 'Armor',
  hangarStatsCrit: 'Crit Chance',
  hangarStatsAtkSpd: 'Fire Rate',
  hangarStartsWeapon: 'Initial Weapon',
  hangarSpecialPerk: 'Tactical Trait',

  ship_vanguard_name: 'Aegis-01 Vanguard',
  ship_vanguard_title: 'Patrol Cruiser',
  ship_vanguard_desc: 'Balanced cybernetic fighter equipped with twin Plasma Blasters. Reliable in all combat theaters.',
  ship_vanguard_perk: 'Tactical Core',
  ship_vanguard_perk_desc: '+10% Damage, +15% XP pickup range, and solid baseline defense.',

  ship_interceptor_name: 'Phantom-X Interceptor',
  ship_interceptor_title: 'High-Velocity Stalker',
  ship_interceptor_desc: '+25% Speed, +18% Crit Chance, -20% Max HP. High risk, high reward scout equipped with Piercing Laser.',
  ship_interceptor_perk: 'Shadow Dash',
  ship_interceptor_perk_desc: 'Extended dash distance. Dashing grants 2s of +30% Damage bonus.',

  ship_dreadnought_name: 'Colossus-IV Dreadnought',
  ship_dreadnought_title: 'Armored Juggernaut',
  ship_dreadnought_desc: '+60% Max HP, +4 Armor, -15% Speed. Heavy siege battlecruiser equipped with Scatter Cannon.',
  ship_dreadnought_perk: 'Reactive Hull',
  ship_dreadnought_perk_desc: 'Taking damage triggers a kinetic shockwave that knocks back and damages nearby foes.',

  ship_technomancer_name: 'Tempest-7 Technomancer',
  ship_technomancer_title: 'Arc Resonator',
  ship_technomancer_desc: '+25% Fire Rate, +40% Pickup Radius. Arc technology vessel equipped with Lightning Coil.',
  ship_technomancer_perk: 'Overload Reactor',
  ship_technomancer_perk_desc: 'Every 15 enemies slain triggers an EMP storm across the combat sector.',

  ship_pyroclast_name: 'Solaris-V Pyroclast',
  ship_pyroclast_title: 'Thermal Siege Vessel',
  ship_pyroclast_desc: '+20% Max HP, +2 Armor. Heavy molten vessel equipped with continuous Toxic Aura.',
  ship_pyroclast_perk: 'Thermonuclear Core',
  ship_pyroclast_perk_desc: 'Immune to hazard fire/acid pools; aura is 50% larger and inflicts lingering burn damage.',

  ship_valkyrie_name: 'Valkyrie-9 Gunship',
  ship_valkyrie_title: 'Missile Corvette',
  ship_valkyrie_desc: '+10% Speed, +8% Crit. Heavy ordnance platform equipped with Seeker Missiles.',
  ship_valkyrie_perk: 'Swarm Ordnance',
  ship_valkyrie_perk_desc: '+1 extra projectile to all weapons; explosions deal +20% damage with +25% radius.',

  ship_chronos_name: 'Chronos-Zero',
  ship_chronos_title: 'Chrono Weaver',
  ship_chronos_desc: '+15% Speed, +10% Crit. Experimental temporal vessel equipped with Orbiting Blades.',
  ship_chronos_perk: 'Temporal Warp',
  ship_chronos_perk_desc: '-35% Dash cooldown. Standing still creates a time-dilation field that slows nearby enemies by 25%.',

  ship_phantom_name: 'Eclipse Void-Specter',
  ship_phantom_title: 'Dimensional Phantom',
  ship_phantom_desc: '+30% Speed, +20% Crit, -15% HP. Elusive dimensional prototype equipped with Piercing Laser.',
  ship_phantom_perk: 'Quantum Phasing',
  ship_phantom_perk_desc: '20% chance to completely phase-dodge incoming damage; all shots pierce obstacles.',

  // Achievements UI Extra
  achievementsSummary: 'Achievements Completed',
  achievementsClaimAll: 'CLAIM ALL REWARDS',
  achievementsAllClaimed: 'ALL REWARDS CLAIMED',

  // Evolutions
  evo_badge: 'EVOLUTION',
  evo_quantum_obliterator_name: 'Quantum Obliterator',
  evo_quantum_obliterator_desc: 'Plasma Blaster + Overclock: Emits a continuous, high-damage rotating beam that disintegrates all foes.',
  evo_tachyon_vortex_name: 'Tachyon Vortex',
  evo_tachyon_vortex_desc: 'Orbiting Blades + Multi-Barrel: An 8-blade vortex pulsing outwards and shredding surrounding hordes.',
  evo_judgement_tempest_name: 'Judgement Tempest',
  evo_judgement_tempest_desc: 'Lightning Coil + Targeting CPU: Simultaneously strikes 6 targets across the screen with thunderous shockwaves.',
  evo_nanite_plague_name: 'Nanite Plague',
  evo_nanite_plague_desc: 'Toxic Aura + Vampire Chip: Massive bio-hazard field that leeches life and crystals from slain enemies.',
  evo_doomsday_icbm_name: 'Doomsday ICBM',
  evo_doomsday_icbm_desc: 'Seeker Missiles + Energy Core: Launches nuclear-tipped guided missiles triggering devastating mini-nukes.',
  evo_flak_fortress_name: 'Flak Fortress',
  evo_flak_fortress_desc: 'Scatter Cannon + Titan Armor: 360-degree omni-directional flak explosive bursts that shred armored targets.',
  evo_orbital_death_ray_name: 'Orbital Death Ray',
  evo_orbital_death_ray_desc: 'Piercing Laser + Nitro Thruster: Pierces the battlefield with devastating cross-axis orbital laser columns.',

  // Achievements
  achievementsBtn: 'ACHIEVEMENTS',
  achievementsTitle: 'ACHIEVEMENTS & REWARDS',
  claimReward: 'CLAIM',
  rewardClaimed: 'CLAIMED',
  achUnlockedNotification: 'ACHIEVEMENT UNLOCKED!',
  ach_first_blood_name: 'First Blood',
  ach_first_blood_desc: 'Neutralize 100 cyber enemies in total.',
  ach_elite_hunter_name: 'Elite Hunter',
  ach_elite_hunter_desc: 'Destroy an Elite Champion enemy drone.',
  ach_titan_slayer_name: 'Titan Slayer',
  ach_titan_slayer_desc: 'Defeat the Titan Mech Overlord boss.',
  ach_evolution_master_name: 'Superweapon Genesis',
  ach_evolution_master_desc: 'Synthesize your first weapon evolution.',
  ach_survivor_name: 'Seasoned Operative',
  ach_survivor_desc: 'Survive 10 minutes in a single mission.',
  ach_full_arsenal_name: 'Walking Fortress',
  ach_full_arsenal_desc: 'Fill all 6 active weapon slots simultaneously.',
  ach_treasure_hunter_name: 'Salvage Expert',
  ach_treasure_hunter_desc: 'Crack open 5 tactical loot chests.',
  ach_magma_explorer_name: 'Magma Pioneer',
  ach_magma_explorer_desc: 'Reach Sector 3: Magma Core.',
  ach_void_traveler_name: 'Abyssal Navigator',
  ach_void_traveler_desc: 'Reach Sector 4: Orbital Void.',
  ach_impenetrable_name: 'Steel Wall',
  ach_impenetrable_desc: 'Reach 5 or more Armor in a single run.',
  ach_light_speed_name: 'Phantom Shift',
  ach_light_speed_desc: 'Perform 25 Phase Dashes in a single run.',
  ach_shard_tycoon_name: 'Crystal Tycoon',
  ach_shard_tycoon_desc: 'Accumulate a balance of 2,000 Shards.',

  // Events
  eventAlertTitle: 'EMERGENCY DISPATCH',
  event_meteor_shower_title: 'ORBITAL BOMBARDMENT',
  event_meteor_shower_desc: 'Incoming orbital kinetic strikes! Evade the red hazard telegraph zones!',
  event_gold_drone_swarm_title: 'GOLD DRONE SWARM',
  event_gold_drone_swarm_desc: 'High-value resource drones detected! Hunt them down for massive Crystals!',
  event_emp_storm_title: 'EMP OVERLOAD',
  event_emp_storm_desc: 'Weapons supercharged! +40% Fire Rate & Damage, but visibility is hindered!',

  // Damage Analytics
  damageBreakdownTitle: 'WEAPON COMBAT ANALYTICS',
  damageTotal: 'Total Damage',
  damageDps: 'DPS',
  damageShare: 'Share',
  tabStats: 'SUMMARY',
  tabDamage: 'COMBAT DPS',

  // Settings additions
  vibrationLabel: 'Haptic Feedback',
  vibrationOn: 'ON',
  vibrationOff: 'OFF',
};

const tr: Translations = {
  ...trSkillTranslations,
  gameTitle: 'SURVI RUN',
  gameSubtitle: 'SİBER SÜRÜ ROGUELITE',
  gameDescription: 'Yüksek tempolu bir hayatta kalma deneyimi. Sibernetik lejyonları zekanızla alt edin, enerji kristallerini toplayın ve durdurulamaz bir cephanelik kurun.',
  ctrlMove: 'Hareket & Manevra',
  ctrlDash: 'Atılma (Hasarsızlık)',
  ctrlFocus: 'Odaklanma Modu',
  ctrlSelect: 'Yükseltme Seçimi',
  btnStart: 'GÖREVE BAŞLA',
  btnHowToPlay: 'NASIL OYNANIR',
  btnSettings: 'AYARLAR',
  btnSkillTree: 'YETENEK AĞACI',
  btnClose: 'KAPAT',
  bestRecord: 'EN İYİ SKOR',
  shardsLabel: 'NANO KRİSTAL',
  deployHint: 'Başlamak için [SPACE] veya Tıklayın',
  settingsTitle: 'SİSTEM AYARLARI',
  langLabel: 'Dil / Language',
  soundLabel: 'Ses Sentezleyici',

  // Skill Tree
  skillTreeTitle: 'YETENEK AĞACI',
  skillTreeSubtitle: 'Görevlerden kazanılan kristallerle kalıcı güçlendirmeler açın.',
  branchCombat: 'SALDIRI ÇEKİRDEĞİ',
  branchDefense: 'NANOTEK ŞASİ',
  branchUtility: 'SİBER FAYDA',
  respecBtn: 'TÜMÜNÜ SIFIRLA (%100 İADE)',
  respecConfirm: 'Tüm yetenekler sıfırlanıp harcanan kristaller iade edilsin mi?',
  upgradeCost: 'Maliyet',
  maxRank: 'SON SEVİYE',
  currentBonus: 'Mevcut',
  nextBonus: 'Sonraki Seviye',
  rerollBtn: 'KARTLARI YENİLE',
  shardsEarned: 'Kazanılan Nano Kristal:',

  // Skill Tree Header & HUD
  stBrandTag: 'PASİF GELİŞİM AĞACI',
  shardsUnit: 'KRİSTAL',
  nexusLabel: 'MERKEZ',
  nexusCore: 'MERKEZ ÇEKİRDEK',
  tierLabel: 'KADEME',
  rankLabel: 'SEVİYE:',

  // Skill Node Tags
  tagMinor: '[TEMEL] STANDART YETENEK',
  tagNotable: '[ÖNEMLİ] GELİŞMİŞ YETENEK',
  tagKeystone: '[KİLİTTAŞI] UZMANLIK',

  // Tooltip Statuses
  statusMaxed: 'MAKSİMUM SEVİYE',
  statusMutex: 'KİLİTLİ: Zıt uzmanlaşma yolu seçildi!',
  statusPrereq: 'KİLİTLİ: Önceki bağlı yeteneği açmalısınız',
  promptUpgrade: 'TIKLAYIP GELİŞTİR',
  promptInsufficient: '(Yetersiz Kristal)',

  // Navigation tooltips
  tipWarfare: 'Savaş Ağacına Git',
  tipDefense: 'Savunma Ağacına Git',
  tipMobility: 'Hareket Ağacına Git',
  tipEconomy: 'Ekonomi Ağacına Git',
  tipNexus: 'Merkeze Odaklan',
  tipShards: 'Mevcut Nano Kristal',
  tipPoints: 'Kullanılan Yetenek Puanları',
  tipRespec: 'Tüm puanları sıfırla (%100 iade)',
  tipClose: 'Kapat',
  tipZoomIn: 'Yakınlaştır',
  tipZoomOut: 'Uzaklaştır',
  tipRecenter: 'Görünümü Ortala',

  // Bottom Legend
  legendDrag: 'Sürükle',
  legendDragAction: ': Kaydır',
  legendScroll: 'Tekerlek',
  legendScrollAction: ': Yakınlaştır',
  legendClick: 'Tıkla',
  legendClickAction: ': Geliştir',

  // Upgrade Cards & HUD
  cardNew: 'YENİ:',
  cardLvl: 'SVY.',

  // Pause & Modals
  tacticalOverride: 'OYUN DURAKLATILDI',
  systemSuspended: 'SİSTEM BEKLEMEDE',

  // Sectors
  sectorTag: 'GÖREV ALANLARI',
  activeSector: 'AKTİF BÖLGE',
  selectSector: 'BÖLGEYİ SEÇ',
  hazardRating: 'Tehlike Seviyesi',

  // Settings & Policies (Google Play Store & Console Compliant)
  tabGeneral: 'Genel',
  tabPrivacy: 'Gizlilik Politikası',
  tabTerms: 'Kullanım Şartları',
  tabDataSafety: 'Veri Güvenliği',
  resetDataLabel: 'Tüm Kayıtlı Verileri Sıfırla',
  resetDataDesc: 'Skorlar, Nano Kristaller ve yetenek ağacı ilerlemesi dahil tüm yerel verileri kalıcı olarak siler.',
  btnResetData: 'VERİLERİ SİL',
  resetDataConfirm: 'DİKKAT: Tüm oyun ilerlemeniz, en iyi skorunuz ve kristalleriniz kalıcı olarak silinecek. Emin misiniz?',
  resetDataSuccess: 'Tüm oyun verileri başarıyla sıfırlandı.',

  // Privacy Policy
  privacyTitle: 'Survi Run Gizlilik Politikası',
  policyEffectiveDate: 'Yürürlük Tarihi: 2026 | Google Play Console Uyumlu',
  privacySection1Title: '1. Veri Toplama ve İşleme',
  privacySection1Desc: 'Survi Run, oyuncularından hiçbir kişisel tanımlayıcı veri (isim, e-posta, telefon numarası, cihaz kimliği, rehber, kamera veya mikrofon erişimi) toplamaz ve saklamaz. Oyunumuz tamamen çevrimdışı öncelikli çalışacak şekilde tasarlanmıştır.',
  privacySection2Title: '2. Yerel Cihaz Depolaması',
  privacySection2Desc: 'Oyun ilerlemeniz (kazanılan kristaller, en iyi hayatta kalma süresi, yetenek ağacı kilitleri ve ses tercihleri) yalnızca cihazınızın yerel depolama alanında (localStorage) tutulur. Bu veriler herhangi bir harici sunucuya veya üçüncü şahıslara aktarılmaz.',
  privacySection3Title: '3. Üçüncü Taraf Hizmetleri ve Reklamlar',
  privacySection3Desc: 'Survi Run, kullanıcı takibi yapan, profil çıkaran veya kullanıcı verilerini toplayıp satan hiçbir üçüncü taraf reklam ağı veya analitik SDK barındırmaz.',
  privacySection4Title: '4. Çocukların Gizliliği (COPPA & Aile Politikası)',
  privacySection4Desc: 'Oyunumuz Google Play Aile Politikaları ve COPPA (Çocukların Çevrimiçi Gizliliğini Koruma Yasası) ile tam uyumludur. 13 yaşın altındaki çocuklardan bilerek herhangi bir veri toplanmaz.',
  developerLabel: 'Geliştirici / Yayıncı',
  contactEmailLabel: 'İletişim & Gizlilik Talepleri',

  // Terms of Service
  termsTitle: 'Kullanım Şartları ve Koşulları',
  termsEffectiveDate: 'Son Güncelleme: 2026 | CyberCore Interactive',
  termsSection1Title: '1. Lisans ve Kullanım Hakkı',
  termsSection1Desc: 'CyberCore Interactive, Survi Run oyununu kişisel, ticari olmayan ve devredilemez olarak oynamanız için sınırlı bir lisans verir.',
  termsSection2Title: '2. Fikri Mülkiyet Hakları',
  termsSection2Desc: 'Oyun içindeki tüm grafikler, logolar, karakter tasarımları, ses efektleri, müzikler ve kod tabanı CyberCore Interactive mülkiyetindedir. İzinsiz kopyalanması veya dağıtılması yasaktır.',
  termsSection3Title: '3. Kullanıcı Davranışları ve Güvenlik',
  termsSection3Desc: 'Oyunu tersine mühendislik işlemlerine tabi tutmak, hile yazılımları kullanmak veya oyun kodunu yetkisiz olarak değiştirmek yasaktır.',
  termsSection4Title: '4. Sorumluluk Sınırı',
  termsSection4Desc: 'Oyun "olduğu gibi" sunulmaktadır. CyberCore Interactive, oyunun kullanımından kaynaklanabilecek veri kayıplarından sorumlu tutulamaz.',

  // Data Safety
  dataSafetyTitle: 'Google Play Veri Güvenliği Beyanı',
  safetyEncryptedTitle: 'Sıfır Harici Veri İletimi',
  safetyEncryptedDesc: 'Tüm oyun verileri yerel cihazda işlenir, harici sunuculara veri aktarılmaz.',
  safetyNoSharingTitle: 'Veri Paylaşımı Yok',
  safetyNoSharingDesc: 'Kullanıcı verileri üçüncü şahıslarla asla paylaşılmaz ve satılmaz.',
  safetyChildrenTitle: 'Aile ve Çocuk Uyumlu',
  safetyChildrenDesc: 'Google Play Aile Politikaları ve COPPA standartlarına uygundur.',
  safetyDeletionTitle: 'Kullanıcı Kontrollü Veri Silme',
  safetyDeletionDesc: 'Ayarlar üzerinden dilediğiniz an tek tuşla tüm yerel oyun verilerinizi silebilirsiniz.',
  safetyFooterText: 'Bu beyan, Google Play Store Veri Güvenliği gereksinimleri ve geliştirici politikalarına uygun olarak hazırlanmıştır.',

  // Skill definitions
  sk_kinetic_name: 'Kinetik Yükleme',
  sk_kinetic_desc: 'Seviye başına +%5 Temel Hasar artışı.',
  sk_rapid_name: 'Seri Ateş Kapasitörü',
  sk_rapid_desc: 'Seviye başına +%4 Atış Hızı & Mermi seriliği.',
  sk_optics_name: 'Hassas Optik',
  sk_optics_desc: 'Seviye başına +%3 Kritik Vuruş Şansı.',
  sk_caliber_name: 'Ölümcül Kalibre',
  sk_caliber_desc: 'Seviye başına +%25 Kritik Hasar çarpanı.',
  sk_split_name: 'Çift Namlu Modülü',
  sk_split_desc: 'Seviye 1: +1 ek mermi. Seviye 2: +%15 çift mermi tetikleme.',

  sk_frame_name: 'Güçlendirilmiş Şasi',
  sk_frame_desc: 'Seviye başına +10 Maksimum Can (Taban: 70 HP).',
  sk_armor_name: 'Kompozit Zırh',
  sk_armor_desc: 'Seviye başına +1 Sabit Hasar Azaltma (Zırh).',
  sk_regen_name: 'Nanit Yenileyici',
  sk_regen_desc: 'Pasif Can Yenilenmesi: Her 8s / 6s / 4s / 3s\'de 1 HP yeniler.',
  sk_thrusters_name: 'Adrenalin İticileri',
  sk_thrusters_desc: 'Atılma bekleme süresini seviye başına 0.3s kısaltır (Taban: 3.2s).',
  sk_deflector_name: 'Acil Durum Kalkanı',
  sk_deflector_desc: 'Koşu başına 1 kez ölümcül hasarda 1 HP ile hayatta tutar ve 3s tam dokunulmazlık verir!',

  sk_magnet_name: 'Manyetik Çekici',
  sk_magnet_desc: 'Seviye başına +%15 XP & Eşya Çekim Alanı.',
  sk_scavenger_name: 'Siber Toplayıcı',
  sk_scavenger_desc: 'Seviye başına görevlerden kazanılan Nano Kristal miktarını +%10 artırır.',
  sk_overclock_name: 'Nöral Odaklanma',
  sk_overclock_desc: 'Odak Modu daha hızlı açılır (0.4s -> 0.25s) ve ek +%15 hasar verir.',
  sk_leech_name: 'Vampirik Leech',
  sk_leech_desc: 'Düşman öldürüldüğünde seviye başına +%1.5 Can Çalma şansı.',
  sk_reroll_name: 'Taktiksel Yenileme',
  sk_reroll_desc: 'Seviye atlama kart seçimlerinde koşu başına +1 kart yenileme hakkı.',

  // Guide
  guideTitle: 'TAKTİKSEL KILAVUZ',
  guideMovementTitle: 'Hareket & Uçurtma (Kiting)',
  guideMovementDesc: '[W, A, S, D] veya Dokunmatik Çubuk ile hareket edin. Sürülerin etrafınızı sarmasını engellemek için sürekli manevra yapın.',
  guideDashTitle: 'Faz Atılması (Hasarsızlık)',
  guideDashDesc: '[SPACE] tuşuna basarak tam hasar bağışıklığı ile düşman çemberlerinin arasından sıyrılıp geçin.',
  guideFocusTitle: 'Archero Odaklanma Modu',
  guideFocusDesc: '0.4 saniye durup beklediğinizde karakter Odak Moduna geçer: +%30 Atış Hızı & +%15 Kritik Şansı kazanır.',
  guideSynergyTitle: 'Cephanelik & Harita Objeleri',
  guideSynergyDesc: '6 adede kadar silah ve 6 pasif çipi harmanlayın. İkmal sandıklarını ve patlayıcı varilleri vurarak avantaj kazanın.',

  lvl: 'SVY',
  weapons: 'SİLAHLAR',
  passives: 'PASİFLER',
  dashReady: 'HAZIR [SPACE]',
  dashCooling: 'DOLUYOR',
  focusBuff: 'ODAK +%30 HIZ',

  bossAlert: 'DİKKAT: TİTAN MECH BÖLGEYE GİRİŞ YAPTI!',
  vacuumAlert: 'VAKUM DARBESİ AKTİF!',
  nukeAlert: 'TAKTİK NÜKLEER PATLAMA!',
  shieldReviveAlert: 'ACİL DURUM KALKANI DEVREDE! (3s DOKUNULMAZLIK)',

  levelUpTitle: 'SİSTEM GELİŞTİRMESİ',
  levelUpSubtitle: 'Bir modül geliştirmesi seçin:',
  cardHint: 'Tuşa bas veya tıkla',
  chestTitle: 'ALTIN SANDIK KAZANILDI!',
  chestCollect: 'ÖDÜLLERİ AL',
  gameOverTitle: 'GÖREV BAŞARISIZ',
  timeSurvived: 'Hayatta Kalınan Süre:',
  enemiesDefeated: 'Yok Edilen Düşmanlar:',
  finalLevel: 'Ulaşılan Seviye:',
  btnPlayAgain: 'TEKRAR DENE',
  btnMainMenu: 'ANA MENÜ',
  pauseTitle: 'SİSTEM DURDURULDU',
  btnResume: 'DEVAM ET',
  btnRestart: 'GÖREVİ YENİDEN BAŞLAT',
  audioOn: 'SES: AÇIK',
  audioMuted: 'SES: KAPALI',

  w_plasma_blaster_name: 'Plazma Tabancası',
  w_plasma_blaster_desc: 'En yakın hedeflere yüksek hızlı, delen plazma mermileri fırlatır.',
  w_orbiting_blades_name: 'Dönen Bıçaklar',
  w_orbiting_blades_desc: 'Etrafınızda dönerek yaklaşan düşman sürülerini dilimler.',
  w_lightning_coil_name: 'Yıldırım Bobini',
  w_lightning_coil_desc: 'Rastgele düşmanları çarpan ve yakındakilere sıçrayan elektrik arkları.',
  w_toxic_aura_name: 'Toksik Aura',
  w_toxic_aura_desc: 'Çevredeki düşmanları sürekli eritir ve %35 yavaşlatır.',
  w_seeker_missiles_name: 'Güdümlü Füzeler',
  w_seeker_missiles_desc: 'Düşmanları takip eden ve patlayarak alan hasarı veren mikro roketler.',
  w_scatter_cannon_name: 'Saçma Pompalı',
  w_scatter_cannon_desc: 'Düşmanları geriye savuran yüksek hasarlı konik saçma atışı.',
  w_piercing_laser_name: 'Delici Lazer',
  w_piercing_laser_desc: 'Bir hatta bulunan tüm düşmanları delen yüksek enerjili ışın.',

  p_overclock_name: 'Hız Aşırtma Çipi',
  p_overclock_desc: '+%15 Saldırı Hızı ve Ateşleme Sıklığı.',
  p_titan_armor_name: 'Titan Kaplama',
  p_titan_armor_desc: '+2 Zırh & +25 Maksimum Can.',
  p_nano_magnet_name: 'Nano Mıknatıs',
  p_nano_magnet_desc: '+%45 Eşya & XP Çekim Alanı.',
  p_vampire_chip_name: 'Vampirik Çip',
  p_vampire_chip_desc: 'Düşman öldürüldüğünde %3 ihtimalle Can yeniler.',
  p_nitro_thruster_name: 'Nitro İticiler',
  p_nitro_thruster_desc: '+%15 Hareket Hızı & daha hızlı Atılma şarjı.',
  p_targeting_cpu_name: 'Hedefleme İşlemcisi',
  p_targeting_cpu_desc: '+%8 Kritik Şansı & +%30 Kritik Hasarı.',
  p_energy_core_name: 'Enerji Çekirdeği',
  p_energy_core_desc: 'Tüm silahlara +%20 Temel Hasar artışı.',
  p_multi_barrel_name: 'Çoklu Namlu',
  p_multi_barrel_desc: 'Tüm çoklu mermi atan silahlara +1 ilave mermi.',
  p_heal_name: 'Acil Onarım',
  p_heal_desc: 'Anında 50 Can yeniler.',

  // Ships & Hangar
  hangarBtn: 'HANGAR',
  hangarTitle: 'GEMİ HANGARI',
  hangarSubtitle: 'FİLO TERSANESİ & SAVAŞ GEMİSİ SEÇİMİ',
  hangarSelect: 'GEMİYİ SEÇ',
  hangarSelected: 'GÖREVE HAZIR',
  hangarUnlock: 'KİLİDİ AÇ',
  hangarStatsSpeed: 'Hız',
  hangarStatsHp: 'Dayanıklılık',
  hangarStatsArmor: 'Zırh',
  hangarStatsCrit: 'Kritik Şans',
  hangarStatsAtkSpd: 'Atış Hızı',
  hangarStartsWeapon: 'Başlangıç Silahı',
  hangarSpecialPerk: 'Taktiksel Nitelik',

  ship_vanguard_name: 'Aegis-01 Vanguard',
  ship_vanguard_title: 'Standart Devriye Kruvazörü',
  ship_vanguard_desc: 'Çift Plazma Blaster ile donatılmış dengeli ve çevik siber avcı gemisi. Tüm savaş bölgelerinde güvenilir.',
  ship_vanguard_perk: 'Taktiksel Çekirdek',
  ship_vanguard_perk_desc: '+%10 Hasar, +%15 XP toplama menzili ve sağlam temel savunma.',

  ship_interceptor_name: 'Phantom-X Interceptor',
  ship_interceptor_title: 'Yüksek Hızlı Avcı',
  ship_interceptor_desc: '+%25 Hız, +%18 Kritik Şans, -%20 Can. Delici Lazer ile donatılmış yüksek risk/ödül gözcüsü.',
  ship_interceptor_perk: 'Gölge Atılması',
  ship_interceptor_perk_desc: 'Daha uzun atılma mesafesi. Atılma yapmak 2 saniye boyunca +%30 Hasar bonusu sağlar.',

  ship_dreadnought_name: 'Colossus-IV Dreadnought',
  ship_dreadnought_title: 'Zırhlı Kuşatma Devi',
  ship_dreadnought_desc: '+%60 Can, +4 Zırh, -%15 Hız. Saçılmalı Top ile donatılmış ağır savaş zırhlısı.',
  ship_dreadnought_perk: 'Reaktif Gövde',
  ship_dreadnought_perk_desc: 'Hasar aldığında yakındaki düşmanları savuran ve hasar veren kinetik şok dalgası yayar.',

  ship_technomancer_name: 'Tempest-7 Technomancer',
  ship_technomancer_title: 'Rezonans Ark Gemisi',
  ship_technomancer_desc: '+%25 Atış Hızı, +%40 Toplama Alanı. Yıldırım Bobini ile donatılmış enerji rezonatörü.',
  ship_technomancer_perk: 'Aşırı Yük Reaktörü',
  ship_technomancer_perk_desc: 'Yok edilen her 15 düşmanda savaş alanında güçlü bir EMP fırtınası patlatır.',

  ship_pyroclast_name: 'Solaris-V Pyroclast',
  ship_pyroclast_title: 'Termal Kuşatma Gemisi',
  ship_pyroclast_desc: '+%20 Can, +2 Zırh. Sürekli Toksik Aura ile donatılmış ağır eriyik zırhlısı.',
  ship_pyroclast_perk: 'Termonükleer Çekirdek',
  ship_pyroclast_perk_desc: 'Zemin yangın ve asit havuzlarından hasar almaz; aura %50 daha geniştir ve yakma hasarı verir.',

  ship_valkyrie_name: 'Valkyrie-9 Silah Gemisi',
  ship_valkyrie_title: 'Güdümlü Roket Korveti',
  ship_valkyrie_desc: '+%10 Hız, +%8 Kritik. Ağır mühimmat platformu, Güdümlü Füzeler ile donatılmıştır.',
  ship_valkyrie_perk: 'Sürü Mühimmatı',
  ship_valkyrie_perk_desc: 'Tüm silahlara +1 ekstra mermi; patlamalar +%25 daha geniş alanda +%20 fazla hasar verir.',

  ship_chronos_name: 'Chronos-Zero',
  ship_chronos_title: 'Zaman Dokuyucu',
  ship_chronos_desc: '+%15 Hız, +%10 Kritik. Dönen Bıçaklar ile donatılmış deneysel zamansal gemi.',
  ship_chronos_perk: 'Zamansal Bükülme',
  ship_chronos_perk_desc: '-%35 Atılma bekleme süresi. Hareketsiz durmak düşmanları %25 yavaşlatan zaman bükme alanı yayar.',

  ship_phantom_name: 'Eclipse Hiçlik Hayaleti',
  ship_phantom_title: 'Boyutsal Hayalet',
  ship_phantom_desc: '+%30 Hız, +%20 Kritik, -%15 Can. Delici Lazer ile donatılmış boyutsal prototip.',
  ship_phantom_perk: 'Kuantum Fazlanması',
  ship_phantom_perk_desc: 'Gelen hasarlardan %20 ihtimalle tamamen kaçınır; tüm atışları engelleri delip geçer.',

  // Achievements UI Extra
  achievementsSummary: 'Tamamlanan Başarımlar',
  achievementsClaimAll: 'TÜM ÖDÜLLERİ AL',
  achievementsAllClaimed: 'TÜM ÖDÜLLER ALINDI',

  // Evolutions
  evo_badge: 'EVRİM',
  evo_quantum_obliterator_name: 'Kuantum İmha Işını',
  evo_quantum_obliterator_desc: 'Plazma Blaster + Overclock: Karşılaştığı tüm düşmanları buharlaştıran devasa dönen kesintisiz lazer ışını.',
  evo_tachyon_vortex_name: 'Takyon Bıçak Girdabı',
  evo_tachyon_vortex_desc: 'Dönen Bıçaklar + Çoklu Namlu: Genişleyip daralarak etraftaki sürüleri kıyma makinesi gibi doğrayan 8 bıçaklı girdap.',
  evo_judgement_tempest_name: 'Kıyamet Fırtınası',
  evo_judgement_tempest_desc: 'Yıldırım Bobini + Hedefleme CPU: Tüm ekrana aynı anda 6 gök gürültüsü indirerek düşmanları şok dalgasıyla infaz eder.',
  evo_nanite_plague_name: 'Nanit Veba Alanı',
  evo_nanite_plague_desc: 'Zehirli Halka + Vampir Çipi: Ölen her düşmandan can ve kristal çeken devasa biyolojik kara delik.',
  evo_doomsday_icbm_name: 'Kıyamet Füzeleri',
  evo_doomsday_icbm_desc: 'Güdümlü Füzeler + Enerji Çekirdeği: Çarptığı yerde minyatür nükleer patlama ve yangın alanı açan ağır balistik füzeler.',
  evo_flak_fortress_name: 'Uçaksavar Kalesi',
  evo_flak_fortress_desc: 'Saçılmalı Top + Titan Zırhı: 360 derece tüm yönlere zırh delici ağır şarapnel saçarak düşman hatlarını parçalar.',
  evo_orbital_death_ray_name: 'Yörünge Ölüm Işını',
  evo_orbital_death_ray_desc: 'Delici Lazer + Nitro İtici: Tüm savaş alanını yatay ve dikey eksende ikiye bölen devasa yörünge lazer sütunları.',

  // Achievements
  achievementsBtn: 'BAŞARIMLAR',
  achievementsTitle: 'BAŞARIMLAR & ÖDÜLLER',
  claimReward: 'ÖDÜLÜ AL',
  rewardClaimed: 'ALINDI',
  achUnlockedNotification: 'BAŞARIM KAZANILDI!',
  ach_first_blood_name: 'İlk Kan',
  ach_first_blood_desc: 'Toplam 100 siber düşmanı imha edin.',
  ach_elite_hunter_name: 'Elit Avcısı',
  ach_elite_hunter_desc: 'Bir Elit Şampiyon düşman dronunu yok edin.',
  ach_titan_slayer_name: 'Titan Katili',
  ach_titan_slayer_desc: 'Titan Mech Overlord bossunu alt edin.',
  ach_evolution_master_name: 'Süper Silah Doğuşu',
  ach_evolution_master_desc: 'İlk silah evriminizi gerçekleştirin.',
  ach_survivor_name: 'Kıdemli Operatör',
  ach_survivor_desc: 'Tek bir görevde 10 dakika boyunca hayatta kalın.',
  ach_full_arsenal_name: 'Yürüyen Cephanelik',
  ach_full_arsenal_desc: '6 aktif silah yuvasının tamamını aynı anda doldurun.',
  ach_treasure_hunter_name: 'Hazine Avcısı',
  ach_treasure_hunter_desc: '5 adet taktiksel ganimet sandığı açın.',
  ach_magma_explorer_name: 'Magma Kaşifi',
  ach_magma_explorer_desc: '3. Bölge: Magma Çekirdeği\'ne ulaşın.',
  ach_void_traveler_name: 'Hiçlik Gezgini',
  ach_void_traveler_desc: '4. Bölge: Yörünge Boşluğu\'na ulaşın.',
  ach_impenetrable_name: 'Çelik Duvar',
  ach_impenetrable_desc: 'Tek bir koşuda 5 veya daha fazla Zırh değerine ulaşın.',
  ach_light_speed_name: 'Işık Hızı',
  ach_light_speed_desc: 'Tek bir koşuda 25 kez Faz Atılması gerçekleştirin.',
  ach_shard_tycoon_name: 'Kristal Baronu',
  ach_shard_tycoon_desc: 'Toplam 2.000 Kristal bakiyesine ulaşın.',

  // Events
  eventAlertTitle: 'ACİL DURUM UYARISI',
  event_meteor_shower_title: 'YÖRÜNGE BOMBARDIMANI',
  event_meteor_shower_desc: 'Yörüngesel kinetik saldırı başladı! Kırmızı tehlike halkalarından kaçının!',
  event_gold_drone_swarm_title: 'ALTIN DRON SÜRÜSÜ',
  event_gold_drone_swarm_desc: 'Yüksek değerli kaynak dronları saptandı! Bol Kristal için avlayın!',
  event_emp_storm_title: 'EMP AŞIRI YÜKLEME',
  event_emp_storm_desc: 'Silahlar aşırı yüklendi! +%40 Atış Hızı & Hasar, görüş alanı kısıtlandı!',

  // Damage Analytics
  damageBreakdownTitle: 'SAVAŞ HASAR ANALİZİ',
  damageTotal: 'Toplam Hasar',
  damageDps: 'DPS',
  damageShare: 'Oran',
  tabStats: 'ÖZET',
  tabDamage: 'HASAR DAĞILIMI',

  // Settings additions
  vibrationLabel: 'Dokunsal Titreşim',
  vibrationOn: 'AÇIK',
  vibrationOff: 'KAPALI',
};

class I18nManager {
  private currentLang: Language = 'en';
  private listeners: (() => void)[] = [];

  constructor() {
    const saved = localStorage.getItem('survi_run_lang') as Language;
    if (saved === 'en' || saved === 'tr') {
      this.currentLang = saved;
    } else {
      this.currentLang = 'en';
    }
  }

  public get lang(): Language {
    return this.currentLang;
  }

  public setLanguage(lang: Language) {
    if (this.currentLang === lang) return;
    this.currentLang = lang;
    localStorage.setItem('survi_run_lang', lang);
    this.notify();
  }

  public toggleLanguage(): Language {
    const next = this.currentLang === 'en' ? 'tr' : 'en';
    this.setLanguage(next);
    return next;
  }

  public get t(): Translations {
    return this.currentLang === 'tr' ? tr : en;
  }

  public onChange(callback: () => void) {
    this.listeners.push(callback);
  }

  private notify() {
    for (const cb of this.listeners) {
      cb();
    }
  }
}

export const i18n = new I18nManager();
