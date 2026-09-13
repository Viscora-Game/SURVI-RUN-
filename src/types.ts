export interface Vector2D {
  x: number;
  y: number;
}

export type WeaponId =
  | 'plasma_blaster'
  | 'scatter_cannon'
  | 'orbiting_blades'
  | 'lightning_coil'
  | 'seeker_missiles'
  | 'toxic_aura'
  | 'piercing_laser';

export type EvolvedWeaponId =
  | 'quantum_obliterator'
  | 'tachyon_vortex'
  | 'judgement_tempest'
  | 'nanite_plague'
  | 'doomsday_icbm'
  | 'flak_fortress'
  | 'orbital_death_ray';

export type AnyWeaponId = WeaponId | EvolvedWeaponId;

export type PassiveId =
  | 'overclock'      // Attack Speed + Cooldown reduction
  | 'titan_armor'    // Armor & Max HP
  | 'nano_magnet'    // Pickup range
  | 'vampire_chip'   // Lifesteal chance
  | 'nitro_thruster' // Movement speed & Dash cd
  | 'targeting_cpu'  // Crit chance & Crit damage
  | 'energy_core'    // Base damage %
  | 'multi_barrel';  // Extra projectiles

export type CardRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface UpgradeCard {
  id: string;
  type: 'weapon_new' | 'weapon_upgrade' | 'weapon_evolution' | 'passive_new' | 'passive_upgrade' | 'heal';
  targetId?: AnyWeaponId | PassiveId;
  title: string;
  description: string;
  level: number;
  rarity: CardRarity;
  icon: string;
}

export type ShipId =
  | 'vanguard'
  | 'interceptor'
  | 'dreadnought'
  | 'technomancer'
  | 'pyroclast'
  | 'valkyrie'
  | 'chronos'
  | 'phantom';

export interface ShipConfig {
  id: ShipId;
  nameKey: string;
  titleKey: string;
  descKey: string;
  specialPerkKey: string;
  specialPerkDescKey: string;
  startingWeapon: WeaponId;
  cost: number;
  unlockedByDefault: boolean;
  statModifiers: {
    maxHpMult?: number;
    armorBonus?: number;
    speedMult?: number;
    critChanceBonus?: number;
    attackSpeedMult?: number;
    pickupRadiusMult?: number;
  };
  color: string;
  glowColor: string;
  hullAccent: string;
}

export interface Achievement {
  id: string;
  titleKey: string;
  descKey: string;
  icon: string;
  targetValue: number;
  currentValue: number;
  unlocked: boolean;
  claimed: boolean;
  rewardShards: number;
}

export type RunEventType = 'meteor_shower' | 'gold_drone_swarm' | 'emp_storm';

export interface ActiveRunEvent {
  type: RunEventType;
  name: string;
  duration: number;
  elapsed: number;
  intervalTimer: number;
}

export interface WeaponDamageStats {
  id: AnyWeaponId;
  name: string;
  totalDamage: number;
  hits: number;
  kills: number;
}

export interface PlayerStats {
  maxHp: number;
  hp: number;
  speed: number;
  damageMult: number;
  attackSpeedMult: number;
  critChance: number;      // 0.0 - 1.0
  critDamageMult: number;  // e.g. 2.0
  armor: number;           // Flat damage reduction
  lifeSteal: number;       // 0.0 - 1.0 chance to heal 1-2 hp on kill
  pickupRadius: number;    // Distance for magnet
  extraProjectiles: number;// +1, +2 etc.
  dashCooldown: number;    // seconds
  dashTimer: number;       // current cooldown remaining
  isDashing: boolean;
  dashDuration: number;
  dashSpeedMult: number;
  focusTime: number;       // Duration player stayed still
  isFocused: boolean;      // Archero-style Stutter-step focus buff
}

export type EnemyType = 'swarmer' | 'runner' | 'spitter' | 'brute' | 'phantom' | 'kamikaze' | 'shielded' | 'sniper' | 'tesla' | 'boss';

export interface EnemyConfig {
  type: EnemyType;
  name: string;
  radius: number;
  speed: number;
  maxHp: number;
  damage: number;
  color: string;
  glowColor: string;
  xpValue: number;
  isRanged?: boolean;
  shootCooldown?: number;
  isBoss?: boolean;
  isElite?: boolean;
}

export type DropType = 'xp_small' | 'xp_medium' | 'xp_large' | 'health_pack' | 'magnet' | 'nuke' | 'chest';

export interface DropItem {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  type: DropType;
  value: number;
  isAttracted: boolean;
  isAlive: boolean;
  pulseTime: number;
}
