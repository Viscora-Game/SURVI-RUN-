/**
 * SkillCardRenderer
 * Generates crisp, high-resolution procedural vector SVG emblems
 * for all 7 Active Weapons and 9 Passives.
 * Zero external images, zero AI prompt artifacts, 100% sharp rendering.
 */

export class SkillCardRenderer {
  public static getSkillSvg(id: string, size: number = 44): string {
    const s = size;

    switch (id) {
      // =====================================================================
      // ACTIVE WEAPONS (7)
      // =====================================================================
      case 'plasma_blaster':
        return `
          <svg width="${s}" height="${s}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="64" height="64" rx="14" fill="#030d1e" stroke="#00e5ff" stroke-width="2.5" stroke-opacity="0.6"/>
            <!-- Dual Plasma Emitter Barrels -->
            <rect x="22" y="24" width="8" height="26" rx="2" fill="#0f2b48" stroke="#00e5ff" stroke-width="1.5"/>
            <rect x="34" y="24" width="8" height="26" rx="2" fill="#0f2b48" stroke="#00e5ff" stroke-width="1.5"/>
            <!-- Magnetic Accelerator Coils -->
            <rect x="20" y="32" width="24" height="4" rx="1" fill="#38bdf8"/>
            <rect x="20" y="40" width="24" height="4" rx="1" fill="#0284c7"/>
            <!-- Plasma Energy Blast Flares -->
            <circle cx="26" cy="18" r="5" fill="#00f0ff" filter="drop-shadow(0 0 6px #00f0ff)"/>
            <circle cx="38" cy="18" r="5" fill="#00f0ff" filter="drop-shadow(0 0 6px #00f0ff)"/>
            <polygon points="32,6 28,15 36,15" fill="#ffffff"/>
          </svg>
        `;

      case 'orbiting_blades':
        return `
          <svg width="${s}" height="${s}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="64" height="64" rx="14" fill="#031622" stroke="#06b6d4" stroke-width="2.5" stroke-opacity="0.6"/>
            <!-- Orbital Energy Track -->
            <circle cx="32" cy="32" r="20" stroke="#06b6d4" stroke-width="1.5" stroke-dasharray="4 3" opacity="0.6"/>
            <!-- Central Core Hub -->
            <circle cx="32" cy="32" r="6" fill="#083344" stroke="#22d3ee" stroke-width="2"/>
            <circle cx="32" cy="32" r="3" fill="#67e8f9"/>
            <!-- 4 Spinning Kinetic Laser Blades -->
            <path d="M32 12 L35 24 L29 24 Z" fill="#22d3ee" filter="drop-shadow(0 0 4px #06b6d4)"/>
            <path d="M32 52 L35 40 L29 40 Z" fill="#22d3ee" filter="drop-shadow(0 0 4px #06b6d4)"/>
            <path d="M12 32 L24 35 L24 29 Z" fill="#22d3ee" filter="drop-shadow(0 0 4px #06b6d4)"/>
            <path d="M52 32 L40 35 L40 29 Z" fill="#22d3ee" filter="drop-shadow(0 0 4px #06b6d4)"/>
          </svg>
        `;

      case 'lightning_coil':
        return `
          <svg width="${s}" height="${s}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="64" height="64" rx="14" fill="#0d0a24" stroke="#a855f7" stroke-width="2.5" stroke-opacity="0.6"/>
            <!-- Tesla Base Platform -->
            <rect x="22" y="46" width="20" height="8" rx="2" fill="#1e1b4b" stroke="#818cf8" stroke-width="1.5"/>
            <!-- Central Conductive Spire -->
            <rect x="30" y="22" width="4" height="24" fill="#818cf8"/>
            <circle cx="32" cy="18" r="8" fill="#4338ca" stroke="#c084fc" stroke-width="2"/>
            <circle cx="32" cy="18" r="4" fill="#ffffff"/>
            <!-- Branching High-Voltage Electrical Bolts -->
            <path d="M32 10 L28 14 L34 16 L30 22" stroke="#c084fc" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M38 16 L48 12 L44 20 L52 24" stroke="#38bdf8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M26 16 L16 14 L20 22 L12 26" stroke="#38bdf8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        `;

      case 'toxic_aura':
        return `
          <svg width="${s}" height="${s}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="64" height="64" rx="14" fill="#021a10" stroke="#10b981" stroke-width="2.5" stroke-opacity="0.6"/>
            <!-- Radiating Toxic Gas Ring -->
            <circle cx="32" cy="32" r="22" stroke="#10b981" stroke-width="1.5" stroke-opacity="0.4" stroke-dasharray="3 3"/>
            <circle cx="32" cy="32" r="16" fill="#064e3b" fill-opacity="0.5"/>
            <!-- Biohazard Crest Emblem -->
            <circle cx="32" cy="32" r="4" fill="#34d399"/>
            <path d="M32 20 C30 24, 30 28, 32 30" stroke="#34d399" stroke-width="2.5" stroke-linecap="round"/>
            <path d="M22 38 C25 36, 29 36, 31 34" stroke="#34d399" stroke-width="2.5" stroke-linecap="round"/>
            <path d="M42 38 C39 36, 35 36, 33 34" stroke="#34d399" stroke-width="2.5" stroke-linecap="round"/>
            <!-- Acid Droplets -->
            <circle cx="20" cy="18" r="2" fill="#a3e635"/>
            <circle cx="46" cy="20" r="2.5" fill="#a3e635"/>
            <circle cx="44" cy="46" r="2" fill="#a3e635"/>
          </svg>
        `;

      case 'seeker_missiles':
        return `
          <svg width="${s}" height="${s}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="64" height="64" rx="14" fill="#1f0904" stroke="#f97316" stroke-width="2.5" stroke-opacity="0.6"/>
            <!-- Targeting Reticle Crosshair -->
            <circle cx="32" cy="32" r="20" stroke="#ea580c" stroke-width="1" stroke-opacity="0.4"/>
            <!-- Missile 1 (Angled Left) -->
            <g transform="rotate(-20 24 32)">
              <rect x="21" y="18" width="6" height="20" rx="3" fill="#ea580c" stroke="#fed7aa" stroke-width="1"/>
              <polygon points="24,12 20,18 28,18" fill="#ef4444"/>
              <polygon points="24,38 21,44 27,44" fill="#fbbf24"/>
            </g>
            <!-- Missile 2 (Angled Right) -->
            <g transform="rotate(20 40 32)">
              <rect x="37" y="18" width="6" height="20" rx="3" fill="#ea580c" stroke="#fed7aa" stroke-width="1"/>
              <polygon points="40,12 36,18 44,18" fill="#ef4444"/>
              <polygon points="40,38 37,44 43,44" fill="#fbbf24"/>
            </g>
          </svg>
        `;

      case 'scatter_cannon':
        return `
          <svg width="${s}" height="${s}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="64" height="64" rx="14" fill="#1c0f04" stroke="#f59e0b" stroke-width="2.5" stroke-opacity="0.6"/>
            <!-- Heavy Cannon Breech -->
            <rect x="22" y="34" width="20" height="18" rx="3" fill="#292524" stroke="#78716c" stroke-width="2"/>
            <!-- Wide Flak Muzzle -->
            <polygon points="18,34 46,34 40,24 24,24" fill="#44403c" stroke="#f59e0b" stroke-width="1.5"/>
            <!-- Conical Pellets Spread -->
            <circle cx="32" cy="14" r="3" fill="#fbbf24" filter="drop-shadow(0 0 4px #fbbf24)"/>
            <circle cx="22" cy="18" r="2.5" fill="#f97316"/>
            <circle cx="42" cy="18" r="2.5" fill="#f97316"/>
            <circle cx="15" cy="12" r="2" fill="#ef4444"/>
            <circle cx="49" cy="12" r="2" fill="#ef4444"/>
          </svg>
        `;

      case 'piercing_laser':
        return `
          <svg width="${s}" height="${s}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="64" height="64" rx="14" fill="#1f0414" stroke="#f43f5e" stroke-width="2.5" stroke-opacity="0.6"/>
            <!-- Optical Prism Lens Matrix -->
            <rect x="24" y="44" width="16" height="8" rx="2" fill="#4c0519" stroke="#fb7185" stroke-width="1.5"/>
            <polygon points="32,24 20,44 44,44" fill="#881337" stroke="#f43f5e" stroke-width="1.5"/>
            <!-- Solid Penetrating Laser Beam -->
            <rect x="29" y="8" width="6" height="24" rx="3" fill="#ffffff" filter="drop-shadow(0 0 6px #f43f5e)"/>
            <rect x="30.5" y="6" width="3" height="28" rx="1.5" fill="#ffffff"/>
            <!-- Radial Beam Flares -->
            <line x1="18" y1="18" x2="46" y2="18" stroke="#fb7185" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        `;

      // =====================================================================
      // SUPER WEAPONS / EVOLUTIONS (7)
      // =====================================================================
      case 'quantum_obliterator':
        return `
          <svg width="${s}" height="${s}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="64" height="64" rx="14" fill="#021c2e" stroke="#38bdf8" stroke-width="2.8"/>
            <circle cx="32" cy="32" r="22" stroke="#e0f2fe" stroke-width="1.5" stroke-dasharray="3 3"/>
            <!-- Rotating Quantum Ion Core -->
            <circle cx="32" cy="32" r="10" fill="#0369a1" stroke="#38bdf8" stroke-width="2"/>
            <circle cx="32" cy="32" r="5" fill="#ffffff" filter="drop-shadow(0 0 8px #38bdf8)"/>
            <!-- 4 Continuous Sweeping Ion Beams -->
            <path d="M32 6 L35 22 L29 22 Z" fill="#38bdf8"/>
            <path d="M32 58 L35 42 L29 42 Z" fill="#38bdf8"/>
            <path d="M6 32 L22 35 L22 29 Z" fill="#38bdf8"/>
            <path d="M58 32 L42 35 L42 29 Z" fill="#38bdf8"/>
          </svg>
        `;

      case 'tachyon_vortex':
        return `
          <svg width="${s}" height="${s}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="64" height="64" rx="14" fill="#20041d" stroke="#f472b6" stroke-width="2.8"/>
            <circle cx="32" cy="32" r="23" stroke="#f472b6" stroke-width="1.5" stroke-dasharray="2 4"/>
            <!-- Vortex Center -->
            <circle cx="32" cy="32" r="7" fill="#831843" stroke="#f472b6" stroke-width="2"/>
            <circle cx="32" cy="32" r="3" fill="#ffffff"/>
            <!-- 8 Curved Tachyon Blade Wings -->
            <path d="M32 10 Q40 20 32 25 Q24 20 32 10 Z" fill="#f472b6" filter="drop-shadow(0 0 6px #ec4899)"/>
            <path d="M32 54 Q40 44 32 39 Q24 44 32 54 Z" fill="#f472b6" filter="drop-shadow(0 0 6px #ec4899)"/>
            <path d="M10 32 Q20 40 25 32 Q20 24 10 32 Z" fill="#f472b6" filter="drop-shadow(0 0 6px #ec4899)"/>
            <path d="M54 32 Q44 40 39 32 Q44 24 54 32 Z" fill="#f472b6" filter="drop-shadow(0 0 6px #ec4899)"/>
          </svg>
        `;

      case 'judgement_tempest':
        return `
          <svg width="${s}" height="${s}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="64" height="64" rx="14" fill="#1e1802" stroke="#facc15" stroke-width="2.8"/>
            <!-- Cascading Heavenly Bolts -->
            <polygon points="32,6 20,28 30,28 24,54 44,24 34,24" fill="#fef08a" stroke="#eab308" stroke-width="1.5" filter="drop-shadow(0 0 8px #facc15)"/>
            <polygon points="16,16 10,30 16,30 12,46 24,28 18,28" fill="#fef9c3" opacity="0.8"/>
            <polygon points="48,16 42,30 48,30 44,46 56,28 50,28" fill="#fef9c3" opacity="0.8"/>
          </svg>
        `;

      case 'nanite_plague':
        return `
          <svg width="${s}" height="${s}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="64" height="64" rx="14" fill="#022114" stroke="#34d399" stroke-width="2.8"/>
            <!-- Bio-Nanite Swarm Cloud -->
            <circle cx="32" cy="32" r="18" fill="none" stroke="#10b981" stroke-width="2" stroke-dasharray="3 3"/>
            <!-- Nanite Hive Cluster -->
            <polygon points="32,16 42,22 42,34 32,40 22,34 22,22" fill="#065f46" stroke="#34d399" stroke-width="2"/>
            <circle cx="32" cy="28" r="4" fill="#6ee7b7" filter="drop-shadow(0 0 6px #10b981)"/>
            <circle cx="18" cy="18" r="2.5" fill="#a7f3d0"/>
            <circle cx="46" cy="18" r="2.5" fill="#a7f3d0"/>
            <circle cx="46" cy="44" r="2.5" fill="#a7f3d0"/>
            <circle cx="18" cy="44" r="2.5" fill="#a7f3d0"/>
          </svg>
        `;

      case 'doomsday_icbm':
        return `
          <svg width="${s}" height="${s}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="64" height="64" rx="14" fill="#2b0808" stroke="#f87171" stroke-width="2.8"/>
            <!-- Heavy ICBM Missile -->
            <rect x="28" y="20" width="8" height="26" rx="2" fill="#991b1b" stroke="#fca5a5" stroke-width="1.5"/>
            <polygon points="32,8 26,20 38,20" fill="#dc2626"/>
            <!-- Nuclear Radiation Trefoil -->
            <circle cx="32" cy="30" r="2.5" fill="#fef08a"/>
            <!-- Rocket Exhaust Flame -->
            <polygon points="32,56 26,46 38,46" fill="#fbbf24" filter="drop-shadow(0 0 6px #ef4444)"/>
            <polygon points="32,52 29,46 35,46" fill="#ffffff"/>
          </svg>
        `;

      case 'flak_fortress':
        return `
          <svg width="${s}" height="${s}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="64" height="64" rx="14" fill="#291804" stroke="#fbbf24" stroke-width="2.8"/>
            <!-- Heavy Fortress Turret Hub -->
            <circle cx="32" cy="32" r="12" fill="#451a03" stroke="#f59e0b" stroke-width="2.5"/>
            <circle cx="32" cy="32" r="5" fill="#fde68a"/>
            <!-- 8 Radial Tungsten Flak Cannons -->
            <rect x="30" y="8" width="4" height="12" rx="1" fill="#f59e0b"/>
            <rect x="30" y="44" width="4" height="12" rx="1" fill="#f59e0b"/>
            <rect x="8" y="30" width="12" height="4" rx="1" fill="#f59e0b"/>
            <rect x="44" y="30" width="12" height="4" rx="1" fill="#f59e0b"/>
            <polygon points="46,18 42,14 34,22 38,26" fill="#d97706"/>
            <polygon points="18,46 14,42 22,34 26,38" fill="#d97706"/>
          </svg>
        `;

      case 'orbital_death_ray':
        return `
          <svg width="${s}" height="${s}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="64" height="64" rx="14" fill="#24052e" stroke="#c084fc" stroke-width="2.8"/>
            <!-- Full Cross Orbital Lasers -->
            <rect x="28" y="4" width="8" height="56" rx="2" fill="#d8b4fe" filter="drop-shadow(0 0 8px #a855f7)"/>
            <rect x="4" y="28" width="56" height="8" rx="2" fill="#d8b4fe" filter="drop-shadow(0 0 8px #a855f7)"/>
            <!-- Laser Core Singularity -->
            <circle cx="32" cy="32" r="9" fill="#ffffff" filter="drop-shadow(0 0 10px #ffffff)"/>
          </svg>
        `;

      // =====================================================================
      // PASSIVE MODULES (8 + HEAL)
      // =====================================================================
      case 'overclock':
        return `
          <svg width="${s}" height="${s}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="64" height="64" rx="14" fill="#181102" stroke="#eab308" stroke-width="2.5" stroke-opacity="0.6"/>
            <!-- Silicon Microchip Substrate -->
            <rect x="18" y="18" width="28" height="28" rx="4" fill="#1c1917" stroke="#ca8a04" stroke-width="2"/>
            <!-- Chip Connector Pins -->
            <line x1="24" y1="12" x2="24" y2="18" stroke="#facc15" stroke-width="2"/>
            <line x1="32" y1="12" x2="32" y2="18" stroke="#facc15" stroke-width="2"/>
            <line x1="40" y1="12" x2="40" y2="18" stroke="#facc15" stroke-width="2"/>
            <line x1="24" y1="46" x2="24" y2="52" stroke="#facc15" stroke-width="2"/>
            <line x1="32" y1="46" x2="32" y2="52" stroke="#facc15" stroke-width="2"/>
            <line x1="40" y1="46" x2="40" y2="52" stroke="#facc15" stroke-width="2"/>
            <!-- Speed Boost Frequency Wave -->
            <polyline points="22,32 28,32 30,24 34,40 36,32 42,32" stroke="#fef08a" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        `;

      case 'titan_armor':
        return `
          <svg width="${s}" height="${s}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="64" height="64" rx="14" fill="#04121f" stroke="#0284c7" stroke-width="2.5" stroke-opacity="0.6"/>
            <!-- Heavy Angular Crest Shield -->
            <path d="M32 10 L48 16 V32 C48 42 32 54 32 54 C32 54 16 42 16 32 V16 Z" fill="#0c4a6e" stroke="#38bdf8" stroke-width="2.5"/>
            <!-- Inner Armor Plate Reinforcement -->
            <path d="M32 18 L42 22 V31 C42 38 32 46 32 46 C32 46 22 38 22 31 V22 Z" fill="#075985"/>
            <circle cx="32" cy="30" r="4" fill="#7dd3fc"/>
          </svg>
        `;

      case 'nano_magnet':
        return `
          <svg width="${s}" height="${s}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="64" height="64" rx="14" fill="#051224" stroke="#3b82f6" stroke-width="2.5" stroke-opacity="0.6"/>
            <!-- High-Power Horseshoe Core -->
            <path d="M20 16 V32 C20 38.6 25.4 44 32 44 C38.6 44 44 38.6 44 32 V16 H36 V32 C36 34.2 34.2 36 32 36 C29.8 36 28 34.2 28 32 V16 Z" fill="#1e3a8a" stroke="#60a5fa" stroke-width="2"/>
            <!-- North & South Pole Contact Plates -->
            <rect x="18" y="14" width="10" height="8" rx="1" fill="#ef4444"/>
            <rect x="36" y="14" width="10" height="8" rx="1" fill="#0284c7"/>
            <!-- Magnetic Induction Flux Arcs -->
            <path d="M23 8 C28 4, 36 4, 41 8" stroke="#93c5fd" stroke-width="2" stroke-linecap="round" stroke-dasharray="2 3"/>
          </svg>
        `;

      case 'vampire_chip':
        return `
          <svg width="${s}" height="${s}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="64" height="64" rx="14" fill="#20040a" stroke="#ef4444" stroke-width="2.5" stroke-opacity="0.6"/>
            <!-- Bio-Nanite Blood Infusion Capsule -->
            <rect x="24" y="14" width="16" height="34" rx="8" fill="#450a0a" stroke="#f87171" stroke-width="2"/>
            <!-- Glowing Red Lifesteal Fluid -->
            <rect x="26" y="26" width="12" height="20" rx="5" fill="#dc2626"/>
            <circle cx="32" cy="34" r="3" fill="#fecaca"/>
            <!-- Nanite DNA Synthesis Nodes -->
            <circle cx="32" cy="18" r="2" fill="#ffffff"/>
            <path d="M20 32 L16 32 M44 32 L48 32" stroke="#f87171" stroke-width="2" stroke-linecap="round"/>
          </svg>
        `;

      case 'nitro_thruster':
        return `
          <svg width="${s}" height="${s}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="64" height="64" rx="14" fill="#03161c" stroke="#06b6d4" stroke-width="2.5" stroke-opacity="0.6"/>
            <!-- Dual Jet Thruster Nozzles -->
            <polygon points="20,18 28,18 26,36 22,36" fill="#164e63" stroke="#22d3ee" stroke-width="1.5"/>
            <polygon points="36,18 44,18 42,36 38,36" fill="#164e63" stroke="#22d3ee" stroke-width="1.5"/>
            <!-- Turbo Afterburner Exhaust -->
            <polygon points="21,36 27,36 24,50" fill="#00f0ff"/>
            <polygon points="37,36 43,36 40,50" fill="#00f0ff"/>
            <line x1="12" y1="28" x2="16" y2="28" stroke="#67e8f9" stroke-width="2" stroke-linecap="round"/>
            <line x1="48" y1="28" x2="52" y2="28" stroke="#67e8f9" stroke-width="2" stroke-linecap="round"/>
          </svg>
        `;

      case 'targeting_cpu':
        return `
          <svg width="${s}" height="${s}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="64" height="64" rx="14" fill="#1f1003" stroke="#f59e0b" stroke-width="2.5" stroke-opacity="0.6"/>
            <!-- HUD Targeting Corner Brackets -->
            <path d="M18 24 V18 H24 M46 24 V18 H40 M18 40 V46 H24 M46 40 V46 H40" stroke="#f59e0b" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
            <!-- High-Precision Reticle Circle -->
            <circle cx="32" cy="32" r="10" stroke="#ef4444" stroke-width="1.5"/>
            <line x1="32" y1="18" x2="32" y2="46" stroke="#ef4444" stroke-width="1.5"/>
            <line x1="18" y1="32" x2="46" y2="32" stroke="#ef4444" stroke-width="1.5"/>
            <circle cx="32" cy="32" r="2.5" fill="#fef08a"/>
          </svg>
        `;

      case 'energy_core':
        return `
          <svg width="${s}" height="${s}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="64" height="64" rx="14" fill="#041b24" stroke="#00e5ff" stroke-width="2.5" stroke-opacity="0.6"/>
            <!-- Outer Core Containment Ring -->
            <circle cx="32" cy="32" r="18" stroke="#00e5ff" stroke-width="2" stroke-dasharray="6 3"/>
            <!-- Radiant Arc-Reactor Core -->
            <polygon points="32,18 44,25 44,39 32,46 20,39 20,25" fill="#083344" stroke="#38bdf8" stroke-width="2"/>
            <circle cx="32" cy="32" r="6" fill="#00f0ff" filter="drop-shadow(0 0 6px #00f0ff)"/>
            <circle cx="32" cy="32" r="2.5" fill="#ffffff"/>
          </svg>
        `;

      case 'multi_barrel':
        return `
          <svg width="${s}" height="${s}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="64" height="64" rx="14" fill="#130824" stroke="#a855f7" stroke-width="2.5" stroke-opacity="0.6"/>
            <!-- Revolving Heavy Chamber Mount -->
            <circle cx="32" cy="32" r="18" fill="#1e1b4b" stroke="#818cf8" stroke-width="2"/>
            <!-- Triple Rotary Barrel Cluster -->
            <circle cx="32" cy="22" r="6" fill="#0f172a" stroke="#c084fc" stroke-width="2"/>
            <circle cx="32" cy="22" r="2.5" fill="#e9d5ff"/>
            <circle cx="23" cy="38" r="6" fill="#0f172a" stroke="#c084fc" stroke-width="2"/>
            <circle cx="23" cy="38" r="2.5" fill="#e9d5ff"/>
            <circle cx="41" cy="38" r="6" fill="#0f172a" stroke="#c084fc" stroke-width="2"/>
            <circle cx="41" cy="38" r="2.5" fill="#e9d5ff"/>
          </svg>
        `;

      case 'heal':
      default:
        return `
          <svg width="${s}" height="${s}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="64" height="64" rx="14" fill="#021c12" stroke="#10b981" stroke-width="2.5" stroke-opacity="0.6"/>
            <!-- Medical Nano-Shield Ring -->
            <circle cx="32" cy="32" r="20" stroke="#34d399" stroke-width="1.5" stroke-dasharray="4 3"/>
            <!-- Emergency Health Cross -->
            <path d="M28 16 H36 V28 H48 V36 H36 V48 H28 V36 H16 V28 H28 Z" fill="#10b981" stroke="#a7f3d0" stroke-width="2" filter="drop-shadow(0 0 5px #10b981)"/>
            <circle cx="32" cy="32" r="2.5" fill="#ffffff"/>
          </svg>
        `;
    }
  }
}
