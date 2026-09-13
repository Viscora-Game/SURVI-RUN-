import type { SkillNode, SkillTreeCategory } from '../systems/SkillTree';

/**
 * SkillGlyphRenderer
 * Renders high-contrast, solid-silhouette vector symbols for all 104 Celestial Constellation nodes.
 * Features a dark contrast backing pedestal, solid geometric fills, vibrant neon accents,
 * and 100% exact semantic alignment with skill names and descriptions.
 */
export class SkillGlyphRenderer {
  private static images: Map<string, HTMLImageElement | HTMLCanvasElement> = new Map();
  private static initialized: boolean = false;

  private static ensureInitialized() {
    if (this.initialized) return;
    this.initialized = true;

    // Pure procedural vector medallions for all 5 branches (Zero AI prompt artifacts)
    this.images.set('warfare', this.createProceduralMedallion('warfare'));
    this.images.set('defense', this.createProceduralMedallion('defense'));
    this.images.set('mobility', this.createProceduralMedallion('mobility'));
    this.images.set('economy', this.createProceduralMedallion('economy'));
    this.images.set('nexus', this.createProceduralMedallion('nexus'));
  }

  private static createProceduralMedallion(type: 'warfare' | 'defense' | 'mobility' | 'economy' | 'nexus'): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (!ctx) return canvas;

    const cx = 256;
    const cy = 256;
    const r = 240;

    ctx.fillStyle = '#02040a';
    ctx.fillRect(0, 0, 512, 512);

    ctx.save();
    ctx.translate(cx, cy);

    // Dynamic Bezel styling per category
    const bezelGrad = ctx.createLinearGradient(-r, -r, r, r);
    let runeColor = '#38bdf8';

    if (type === 'warfare') {
      bezelGrad.addColorStop(0, '#7f1d1d');
      bezelGrad.addColorStop(0.5, '#1c0404');
      bezelGrad.addColorStop(1, '#3b0707');
      runeColor = '#ef4444';
    } else if (type === 'defense') {
      bezelGrad.addColorStop(0, '#0c4a6e');
      bezelGrad.addColorStop(0.5, '#082f49');
      bezelGrad.addColorStop(1, '#031926');
      runeColor = '#06b6d4';
    } else if (type === 'mobility') {
      bezelGrad.addColorStop(0, '#064e3b');
      bezelGrad.addColorStop(0.5, '#022c22');
      bezelGrad.addColorStop(1, '#011712');
      runeColor = '#10b981';
    } else if (type === 'economy') {
      bezelGrad.addColorStop(0, '#581c87');
      bezelGrad.addColorStop(0.5, '#3b0764');
      bezelGrad.addColorStop(1, '#1b0330');
      runeColor = '#c084fc';
    } else {
      bezelGrad.addColorStop(0, '#334155');
      bezelGrad.addColorStop(0.5, '#0f172a');
      bezelGrad.addColorStop(1, '#1e293b');
      runeColor = '#38bdf8';
    }

    ctx.strokeStyle = bezelGrad;
    ctx.lineWidth = 36;
    ctx.beginPath();
    ctx.arc(0, 0, r - 18, 0, Math.PI * 2);
    ctx.stroke();

    // Inner rim
    ctx.strokeStyle = '#020617';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(0, 0, r - 36, 0, Math.PI * 2);
    ctx.stroke();

    // Glowing Runes on Bezel
    ctx.fillStyle = runeColor;
    ctx.shadowColor = runeColor;
    ctx.shadowBlur = 12;
    ctx.font = 'bold 16px Orbitron, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const runes = ['ᚠ', 'ᚢ', 'ᚦ', 'ᚨ', 'ᚱ', 'ᚲ', 'ᚷ', 'ᚹ', 'ᚺ', 'ᚾ', 'ᛁ', 'ᛃ', 'ᛈ', 'ᛇ', 'ᛉ', 'ᛊ'];
    for (let i = 0; i < 16; i++) {
      const angle = (i * Math.PI * 2) / 16;
      const rx = Math.cos(angle) * (r - 18);
      const ry = Math.sin(angle) * (r - 18);
      ctx.save();
      ctx.translate(rx, ry);
      ctx.rotate(angle + Math.PI / 2);
      ctx.fillText(runes[i], 0, 0);
      ctx.restore();
    }
    ctx.shadowBlur = 0;

    // Inner Disk
    const innerR = r - 38;
    const diskGrad = ctx.createRadialGradient(0, -30, 20, 0, 0, innerR);
    if (type === 'warfare') {
      diskGrad.addColorStop(0, '#b91c1c');
      diskGrad.addColorStop(0.6, '#450a0a');
      diskGrad.addColorStop(1, '#140202');
    } else if (type === 'defense') {
      diskGrad.addColorStop(0, '#0284c7');
      diskGrad.addColorStop(0.6, '#075985');
      diskGrad.addColorStop(1, '#021627');
    } else if (type === 'mobility') {
      diskGrad.addColorStop(0, '#059669');
      diskGrad.addColorStop(0.6, '#064e3b');
      diskGrad.addColorStop(1, '#012117');
    } else if (type === 'economy') {
      diskGrad.addColorStop(0, '#7e22ce');
      diskGrad.addColorStop(0.6, '#3b0764');
      diskGrad.addColorStop(1, '#0f051d');
    } else {
      diskGrad.addColorStop(0, '#0284c7');
      diskGrad.addColorStop(0.6, '#082f49');
      diskGrad.addColorStop(1, '#020617');
    }

    ctx.fillStyle = diskGrad;
    ctx.beginPath();
    ctx.arc(0, 0, innerR, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
    return canvas;
  }

  /**
   * Main render method for drawing a circular glyph inside a node.
   */
  public static renderNodeGlyph(
    ctx: CanvasRenderingContext2D,
    node: SkillNode,
    radius: number,
    isAllocated: boolean,
    canUpgrade: boolean,
    isMaxed: boolean,
    isMutex: boolean,
    pulseTimer: number
  ) {
    this.ensureInitialized();
    ctx.save();

    // 1. Strict Circular Clipping Mask
    const innerRadius = Math.max(4, radius - 2.0);
    ctx.beginPath();
    ctx.arc(0, 0, innerRadius, 0, Math.PI * 2);
    ctx.clip();

    // 2. Draw Medallion Asset
    this.renderMedallion(ctx, node.category, innerRadius, isAllocated, canUpgrade, isMaxed, isMutex);

    // 3. Render Solid High-Contrast Emblem
    const symbolScale = node.nodeType === 'keystone'
      ? innerRadius * 0.76
      : (node.nodeType === 'notable' ? innerRadius * 0.70 : innerRadius * 0.64);
    this.renderSymbol(ctx, node, symbolScale, isAllocated, canUpgrade, isMaxed, pulseTimer);

    // 4. Lens Specular Sheen (Curved Glass Highlight)
    this.renderGlassSheen(ctx, innerRadius);

    // 5. Inner Vignette / Inset Shadow Rim
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.arc(0, 0, innerRadius, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
  }

  public static renderGlyphToCanvas(canvas: HTMLCanvasElement, node: SkillNode) {
    this.ensureInitialized();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    const r = (Math.min(w, h) / 2) - 3;

    ctx.clearRect(0, 0, w, h);
    ctx.save();
    ctx.translate(w / 2, h / 2);

    ctx.strokeStyle = node.nodeType === 'keystone' ? '#ec4899' : (node.nodeType === 'notable' ? '#fbbf24' : '#00e5ff');
    ctx.lineWidth = 2.8;
    ctx.beginPath();
    ctx.arc(0, 0, r + 1, 0, Math.PI * 2);
    ctx.stroke();

    this.renderNodeGlyph(ctx, node, r, node.currentRank > 0, true, node.currentRank >= node.maxRank, false, 0);
    ctx.restore();
  }

  private static renderMedallion(
    ctx: CanvasRenderingContext2D,
    cat: SkillTreeCategory,
    r: number,
    isAllocated: boolean,
    canUpgrade: boolean,
    isMaxed: boolean,
    isMutex: boolean
  ) {
    const img = this.images.get(cat);
    const isLoaded = img && (img instanceof HTMLCanvasElement || (img instanceof HTMLImageElement && img.complete && img.naturalWidth > 0));

    if (isLoaded) {
      ctx.save();
      if (isMutex) {
        ctx.globalAlpha = 0.25;
      } else if (isMaxed) {
        ctx.globalAlpha = 0.95;
      } else if (isAllocated) {
        ctx.globalAlpha = 0.88;
      } else if (canUpgrade) {
        ctx.globalAlpha = 0.80;
      } else {
        ctx.globalAlpha = 0.50;
      }

      const scale = 1.08;
      ctx.drawImage(img, -r * scale, -r * scale, r * 2 * scale, r * 2 * scale);

      if (isMutex) {
        ctx.fillStyle = 'rgba(40, 5, 10, 0.5)';
        ctx.fillRect(-r, -r, r * 2, r * 2);
      }
      ctx.restore();
    } else {
      ctx.save();
      ctx.fillStyle = cat === 'warfare' ? '#450a0a' : (cat === 'defense' ? '#082f49' : (cat === 'mobility' ? '#064e3b' : '#3b0764'));
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  private static renderGlassSheen(ctx: CanvasRenderingContext2D, r: number) {
    ctx.save();
    const sheenGrad = ctx.createLinearGradient(-r * 0.7, -r * 0.9, r * 0.4, r * 0.4);
    sheenGrad.addColorStop(0, 'rgba(255, 255, 255, 0.40)');
    sheenGrad.addColorStop(0.35, 'rgba(255, 255, 255, 0.12)');
    sheenGrad.addColorStop(0.65, 'rgba(255, 255, 255, 0.0)');
    sheenGrad.addColorStop(1, 'rgba(255, 255, 255, 0.0)');

    ctx.fillStyle = sheenGrad;
    ctx.beginPath();
    ctx.ellipse(0, -r * 0.38, r * 0.78, r * 0.48, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // =========================================================================
  // HIGH-CONTRAST VECTOR SYMBOLS ROUTER
  // =========================================================================
  private static renderSymbol(
    ctx: CanvasRenderingContext2D,
    node: SkillNode,
    s: number,
    isAllocated: boolean,
    canUpgrade: boolean,
    isMaxed: boolean,
    pulseTimer: number
  ) {
    ctx.save();

    // 1. BACKING CONTRAST PLAQUE (Dark Vignette Disc)
    // Separates the icon from the busy background so it's 100% crisp and clear
    const badgeR = s * 1.15;
    const plaqueGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, badgeR);
    plaqueGrad.addColorStop(0, 'rgba(3, 7, 18, 0.92)');
    plaqueGrad.addColorStop(0.7, 'rgba(3, 7, 18, 0.85)');
    plaqueGrad.addColorStop(1, 'rgba(3, 7, 18, 0.45)');
    ctx.fillStyle = plaqueGrad;
    ctx.beginPath();
    ctx.arc(0, 0, badgeR, 0, Math.PI * 2);
    ctx.fill();

    // Plaque rim highlight
    let rimColor = 'rgba(148, 163, 184, 0.35)';
    if (isMaxed) rimColor = 'rgba(251, 191, 36, 0.65)';
    else if (isAllocated) rimColor = 'rgba(249, 115, 22, 0.55)';
    else if (canUpgrade) rimColor = 'rgba(0, 240, 255, 0.55)';
    ctx.strokeStyle = rimColor;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(0, 0, badgeR - 1, 0, Math.PI * 2);
    ctx.stroke();

    // 2. Determine Theme Color Palette
    let fgFill = '#ffffff';
    let fgStroke = '#e2e8f0';
    let glow = 'transparent';

    if (isMaxed) {
      fgFill = '#fef08a'; // Golden sun
      fgStroke = '#f59e0b';
      glow = '#fbbf24';
    } else if (isAllocated) {
      fgFill = '#fed7aa'; // Amber glow
      fgStroke = '#f97316';
      glow = '#f97316';
    } else if (canUpgrade) {
      fgFill = '#e0f2fe'; // Neon cyan
      fgStroke = '#00f0ff';
      glow = '#00e5ff';
    } else {
      // Inactive nodes: high-contrast silver with category tint
      if (node.category === 'warfare') {
        fgFill = '#fed7aa';
        fgStroke = '#fb923c';
      } else if (node.category === 'defense') {
        fgFill = '#bae6fd';
        fgStroke = '#38bdf8';
      } else if (node.category === 'mobility') {
        fgFill = '#a7f3d0';
        fgStroke = '#34d399';
      } else {
        fgFill = '#e9d5ff';
        fgStroke = '#c084fc';
      }
    }

    // Pass 1: Solid Dark Silhouette / Shadow Backing
    ctx.save();
    ctx.fillStyle = '#020617';
    ctx.strokeStyle = '#020617';
    ctx.lineWidth = Math.max(3.2, s * 0.24);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    this.drawIconById(ctx, node.id, s, pulseTimer, true);
    ctx.restore();

    // Pass 2: Foreground Solid & Glowing Vector Art
    ctx.save();
    if (isAllocated || canUpgrade) {
      ctx.shadowColor = glow;
      ctx.shadowBlur = isMaxed ? 14 : (isAllocated ? 10 : 8);
    }
    ctx.fillStyle = fgFill;
    ctx.strokeStyle = fgStroke;
    ctx.lineWidth = Math.max(2.0, s * 0.14);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    this.drawIconById(ctx, node.id, s, pulseTimer, false);
    ctx.restore();

    ctx.restore();
  }

  // =========================================================================
  // PRECISE SEMANTIC DISPATCHER (100% MATCHING SKILL NAMES & ROLES)
  // =========================================================================
  private static drawIconById(
    ctx: CanvasRenderingContext2D,
    id: string,
    s: number,
    time: number,
    _isShadow?: boolean
  ) {
    // -----------------------------------------------------------------------
    // 1. WARFARE (26 Nodes)
    // -----------------------------------------------------------------------
    if (id === 'wf_kinetics') this.drawKineticBullet(ctx, s);
    else if (id === 'wf_cadence') this.drawRapidFire(ctx, s);
    else if (id === 'wf_optics') this.drawSniperScope(ctx, s);
    else if (id === 'wf_caliber') this.drawHeavyCaliber(ctx, s);
    else if (id === 'wf_velocity') this.drawSpeedBullet(ctx, s);
    else if (id === 'wf_penetration') this.drawArmorPiercingSpear(ctx, s);
    else if (id === 'wf_recoil_brake') this.drawDualBarrels(ctx, s);
    else if (id === 'wf_multishot') this.drawTriSpreadShot(ctx, s);
    else if (id === 'wf_shrapnel') this.drawClusterFragBomb(ctx, s);
    else if (id === 'wf_overdrive') this.drawOverclockGauge(ctx, s);
    else if (id === 'wf_plasma_infusion') this.drawPlasmaNovaOrb(ctx, s);
    else if (id === 'wf_ballistic_mass') this.drawWarhammerFist(ctx, s);
    else if (id === 'wf_pl_core') this.drawPlasmaReactor(ctx, s, time);
    else if (id === 'wf_pl_burn') this.drawBlazingFlame(ctx, s);
    else if (id === 'wf_pl_chain') this.drawChainLightningBolt(ctx, s);
    else if (id === 'wf_pl_melt') this.drawArmorMeltAcid(ctx, s);
    else if (id === 'wf_pl_supercharge') this.drawSuperchargeBurst(ctx, s);
    else if (id === 'wf_pl_singularity') this.drawBlackHoleVortex(ctx, s, time);
    else if (id === 'wf_ba_slugs') this.drawUraniumSabot(ctx, s);
    else if (id === 'wf_ba_flak') this.drawFlakScatter(ctx, s);
    else if (id === 'wf_ba_concussion') this.drawStunShockwave(ctx, s);
    else if (id === 'wf_ba_bleed') this.drawSerratedBleedBlade(ctx, s);
    else if (id === 'wf_ba_ricochet') this.drawRicochetReflect(ctx, s);
    else if (id === 'wf_ba_devastator') this.drawSiegeCannon(ctx, s);
    else if (id === 'wf_omni_arsenal') this.drawOmniCrossedBlades(ctx, s);
    else if (id === 'wf_god_slayer') this.drawGodSlayerBlade(ctx, s);

    // -----------------------------------------------------------------------
    // 2. DEFENSE (26 Nodes)
    // -----------------------------------------------------------------------
    else if (id === 'df_frame') this.drawCyberHeartCore(ctx, s);
    else if (id === 'df_plating') this.drawCompositePlates(ctx, s);
    else if (id === 'df_regen') this.drawMedicalNanoCross(ctx, s);
    else if (id === 'df_battery') this.drawCyberBatteryCell(ctx, s);
    else if (id === 'df_tenacity') this.drawHazardShield(ctx, s);
    else if (id === 'df_resilience') this.drawCellularDnaMitosis(ctx, s);
    else if (id === 'df_barrier') this.drawHexEnergyBarrier(ctx, s);
    else if (id === 'df_thorns') this.drawSpikedPlating(ctx, s);
    else if (id === 'df_second_wind') this.drawImmortalAngelWings(ctx, s);
    else if (id === 'df_hardened_hull') this.drawReinforcedBulkhead(ctx, s);
    else if (id === 'df_shield_pulse') this.drawShieldPulseWave(ctx, s);
    else if (id === 'df_overcharge_shield') this.drawHighVoltageCapacitor(ctx, s);
    else if (id === 'df_co_bastion') this.drawFortressBastion(ctx, s);
    else if (id === 'df_co_anchor') this.drawHeavyAnchor(ctx, s);
    else if (id === 'df_co_reactive') this.drawReactiveReflectShield(ctx, s);
    else if (id === 'df_co_adamant') this.drawAdamantDiamondShield(ctx, s);
    else if (id === 'df_co_titan') this.drawTitanCrushFoot(ctx, s);
    else if (id === 'df_co_invincible') this.drawAegisOfImmortality(ctx, s);
    else if (id === 'df_gh_phase') this.drawPhaseSpecterGhost(ctx, s);
    else if (id === 'df_gh_afterimage') this.drawHologramDecoyTwin(ctx, s);
    else if (id === 'df_gh_speed') this.drawWingedDriftBoots(ctx, s);
    else if (id === 'df_gh_stealth') this.drawStealthCloakEye(ctx, s);
    else if (id === 'df_gh_chrono') this.drawChronoPortalDash(ctx, s);
    else if (id === 'df_gh_untouchable') this.drawUntouchableGleamStar(ctx, s);
    else if (id === 'df_phoenix_reactor') this.drawPhoenixRebirth(ctx, s);
    else if (id === 'df_nanite_hive') this.drawNaniteDroneHive(ctx, s);

    // -----------------------------------------------------------------------
    // 3. MOBILITY (26 Nodes)
    // -----------------------------------------------------------------------
    else if (id === 'mb_thrusters') this.drawTwinRocketThruster(ctx, s);
    else if (id === 'mb_jump_jet') this.drawDashLightningChevrons(ctx, s);
    else if (id === 'mb_drift') this.drawDriftArcTreads(ctx, s);
    else if (id === 'mb_stance') this.drawTacticalStanceTarget(ctx, s);
    else if (id === 'mb_strafe') this.drawLateralStrafeArrows(ctx, s);
    else if (id === 'mb_boost') this.drawSupersonicWingBoost(ctx, s);
    else if (id === 'mb_dash_trail') this.drawFireDashFootprints(ctx, s);
    else if (id === 'mb_dash_stun') this.drawEmpStunBurst(ctx, s);
    else if (id === 'mb_focus_haste') this.drawFocusRapidEye(ctx, s);
    else if (id === 'mb_focus_crit') this.drawFocusSniperCross(ctx, s);
    else if (id === 'mb_sprint_shield') this.drawSprintBarrier(ctx, s);
    else if (id === 'mb_warp') this.drawPhasePassArrow(ctx, s);
    else if (id === 'mb_sn_nest') this.drawBunkerBipod(ctx, s);
    else if (id === 'mb_sn_calm') this.drawZenithLotusRune(ctx, s);
    else if (id === 'mb_sn_pierce') this.drawRailgunPierceBeam(ctx, s);
    else if (id === 'mb_sn_homing') this.drawHomingMissileLock(ctx, s);
    else if (id === 'mb_sn_overcharge') this.drawHeavyIonPulse3X(ctx, s);
    else if (id === 'mb_sn_zenith') this.drawZenithSlowAura(ctx, s);
    else if (id === 'mb_bl_momentum') this.drawMomentumSpeedTriple(ctx, s);
    else if (id === 'mb_bl_drift_fire') this.drawRunAndGunSMG(ctx, s);
    else if (id === 'mb_bl_static') this.drawStaticChargeFoot(ctx, s);
    else if (id === 'mb_bl_overclock') this.drawNitroBoostFlask(ctx, s);
    else if (id === 'mb_bl_shockwave') this.drawSonicBoomCone(ctx, s);
    else if (id === 'mb_bl_perpetual') this.drawPerpetualInfinity(ctx, s);
    else if (id === 'mb_time_freeze') this.drawFrozenHourglass(ctx, s);
    else if (id === 'mb_tachyon_rift') this.drawTachyonWarpPortal(ctx, s);

    // -----------------------------------------------------------------------
    // 4. ECONOMY (26 Nodes)
    // -----------------------------------------------------------------------
    else if (id === 'ec_magnet') this.drawHorseshoeMagnet(ctx, s);
    else if (id === 'ec_scavenger') this.drawNanoCrystalShard(ctx, s);
    else if (id === 'ec_xp_booster') this.drawNeuralCyberBrain(ctx, s);
    else if (id === 'ec_crate_sensor') this.drawCrateRadarSweep(ctx, s);
    else if (id === 'ec_coin_multiplier') this.drawStackedCyberCredits(ctx, s);
    else if (id === 'ec_gem_magnet') this.drawGravitonFunnel(ctx, s);
    else if (id === 'ec_reroll') this.drawTacticalTwinDice(ctx, s);
    else if (id === 'ec_lifesteal') this.drawVampiricBloodDrop(ctx, s);
    else if (id === 'ec_chest_overdrive') this.drawRadiantTreasureChest(ctx, s);
    else if (id === 'ec_drop_purity') this.drawFlawlessPrismGem(ctx, s);
    else if (id === 'ec_nuke_radius') this.drawNukeRadiationTrefoil(ctx, s);
    else if (id === 'ec_vacuum_pulse') this.drawInwardVacuumVortex(ctx, s);
    else if (id === 'ec_ty_interest') this.drawUpwardInterestGraph(ctx, s);
    else if (id === 'ec_ty_bounty') this.drawTargetedBountySkull(ctx, s);
    else if (id === 'ec_ty_crate_loot') this.drawLootContainerBurst(ctx, s);
    else if (id === 'ec_ty_duplicator') this.drawCrystalDuplicator2X(ctx, s);
    else if (id === 'ec_ty_respec_master') this.drawTransmutationCircle(ctx, s);
    else if (id === 'ec_ty_limitless') this.drawSyndicateImperialCrown(ctx, s);
    else if (id === 'ec_ar_rarity') this.drawHoloTarotStar(ctx, s);
    else if (id === 'ec_ar_banish') this.drawBanishLaserSlash(ctx, s);
    else if (id === 'ec_ar_duplicate') this.drawDualCardSynthesis(ctx, s);
    else if (id === 'ec_ar_weapon_slots') this.drawWeaponRackSwords(ctx, s);
    else if (id === 'ec_ar_master_smith') this.drawAnvilAndHammerSparks(ctx, s);
    else if (id === 'ec_ar_evolution') this.drawEvolutionHyperStar(ctx, s);
    else if (id === 'ec_ascension') this.drawAscensionPyramidSun(ctx, s);
    else if (id === 'ec_cosmic_magnet') this.drawCosmicMagnetarVortex(ctx, s);
    else {
      this.drawKineticBullet(ctx, s);
    }
  }

  // =========================================================================
  // SOLID VECTOR DRAWING IMPLEMENTATIONS
  // =========================================================================

  // --- WARFARE ICONS ---

  private static drawKineticBullet(ctx: CanvasRenderingContext2D, s: number) {
    ctx.beginPath();
    ctx.moveTo(-s * 0.22, s * 0.65);
    ctx.lineTo(s * 0.22, s * 0.65);
    ctx.lineTo(s * 0.22, -s * 0.15);
    ctx.quadraticCurveTo(s * 0.20, -s * 0.75, 0, -s * 0.85);
    ctx.quadraticCurveTo(-s * 0.20, -s * 0.75, -s * 0.22, -s * 0.15);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(-s * 0.22, s * 0.35);
    ctx.lineTo(s * 0.22, s * 0.35);
    ctx.stroke();
  }

  private static drawRapidFire(ctx: CanvasRenderingContext2D, s: number) {
    const offsets = [
      { x: -s * 0.35, y: s * 0.20, scale: 0.7 },
      { x: 0, y: -s * 0.20, scale: 0.95 },
      { x: s * 0.35, y: s * 0.05, scale: 0.8 }
    ];
    for (const off of offsets) {
      ctx.save();
      ctx.translate(off.x, off.y);
      ctx.scale(off.scale, off.scale);
      ctx.beginPath();
      ctx.moveTo(-s * 0.12, s * 0.4);
      ctx.lineTo(s * 0.12, s * 0.4);
      ctx.lineTo(s * 0.12, -s * 0.1);
      ctx.lineTo(0, -s * 0.5);
      ctx.lineTo(-s * 0.12, -s * 0.1);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
  }

  private static drawSniperScope(ctx: CanvasRenderingContext2D, s: number) {
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.55, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, -s * 0.82); ctx.lineTo(0, -s * 0.28);
    ctx.moveTo(0, s * 0.28); ctx.lineTo(0, s * 0.82);
    ctx.moveTo(-s * 0.82, 0); ctx.lineTo(-s * 0.28, 0);
    ctx.moveTo(s * 0.28, 0); ctx.lineTo(s * 0.82, 0);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, 0, s * 0.14, 0, Math.PI * 2);
    ctx.fill();
  }

  private static drawHeavyCaliber(ctx: CanvasRenderingContext2D, s: number) {
    ctx.beginPath();
    ctx.moveTo(-s * 0.30, s * 0.65);
    ctx.lineTo(s * 0.30, s * 0.65);
    ctx.lineTo(s * 0.30, -s * 0.05);
    ctx.lineTo(0, -s * 0.65);
    ctx.lineTo(-s * 0.30, -s * 0.05);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, -s * 0.05, s * 0.15, 0, Math.PI * 2);
    ctx.fill();
  }

  private static drawSpeedBullet(ctx: CanvasRenderingContext2D, s: number) {
    ctx.save();
    ctx.rotate(Math.PI / 4);
    ctx.beginPath();
    ctx.moveTo(-s * 0.15, s * 0.6);
    ctx.lineTo(s * 0.15, s * 0.6);
    ctx.lineTo(s * 0.15, -s * 0.2);
    ctx.lineTo(0, -s * 0.8);
    ctx.lineTo(-s * 0.15, -s * 0.2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(-s * 0.3, s * 0.8); ctx.lineTo(-s * 0.1, s * 0.6);
    ctx.moveTo(0, s * 0.9); ctx.lineTo(0, s * 0.7);
    ctx.moveTo(s * 0.3, s * 0.8); ctx.lineTo(s * 0.1, s * 0.6);
    ctx.stroke();
    ctx.restore();
  }

  private static drawArmorPiercingSpear(ctx: CanvasRenderingContext2D, s: number) {
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.85);
    ctx.lineTo(s * 0.32, -s * 0.25);
    ctx.lineTo(s * 0.12, -s * 0.25);
    ctx.lineTo(s * 0.12, s * 0.75);
    ctx.lineTo(-s * 0.12, s * 0.75);
    ctx.lineTo(-s * 0.12, -s * 0.25);
    ctx.lineTo(-s * 0.32, -s * 0.25);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(-s * 0.6, s * 0.15);
    ctx.lineTo(-s * 0.18, s * 0.15);
    ctx.moveTo(s * 0.18, s * 0.15);
    ctx.lineTo(s * 0.6, s * 0.15);
    ctx.stroke();
  }

  private static drawDualBarrels(ctx: CanvasRenderingContext2D, s: number) {
    ctx.beginPath();
    ctx.rect(-s * 0.42, -s * 0.65, s * 0.32, s * 1.3);
    ctx.rect(s * 0.10, -s * 0.65, s * 0.32, s * 1.3);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(-s * 0.26, -s * 0.4, s * 0.08, 0, Math.PI * 2);
    ctx.arc(s * 0.26, -s * 0.4, s * 0.08, 0, Math.PI * 2);
    ctx.fill();
  }

  private static drawTriSpreadShot(ctx: CanvasRenderingContext2D, s: number) {
    const angles = [-0.35, 0, 0.35];
    for (const a of angles) {
      ctx.save();
      ctx.rotate(a);
      ctx.beginPath();
      ctx.moveTo(-s * 0.14, s * 0.4);
      ctx.lineTo(s * 0.14, s * 0.4);
      ctx.lineTo(s * 0.14, -s * 0.3);
      ctx.lineTo(0, -s * 0.7);
      ctx.lineTo(-s * 0.14, -s * 0.3);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
  }

  private static drawClusterFragBomb(ctx: CanvasRenderingContext2D, s: number) {
    ctx.beginPath();
    ctx.arc(0, s * 0.05, s * 0.36, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, -s * 0.31);
    ctx.quadraticCurveTo(s * 0.25, -s * 0.55, s * 0.35, -s * 0.45);
    ctx.stroke();

    for (let i = 0; i < 6; i++) {
      const a = (i * Math.PI) / 3;
      const r = s * 0.65;
      ctx.beginPath();
      ctx.arc(Math.cos(a) * r, Math.sin(a) * r, s * 0.10, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private static drawOverclockGauge(ctx: CanvasRenderingContext2D, s: number) {
    ctx.beginPath();
    ctx.arc(0, s * 0.15, s * 0.55, Math.PI * 0.8, Math.PI * 2.2);
    ctx.stroke();

    ctx.save();
    ctx.translate(0, s * 0.15);
    ctx.rotate(Math.PI * 0.4);
    ctx.beginPath();
    ctx.moveTo(-s * 0.08, 0);
    ctx.lineTo(s * 0.08, 0);
    ctx.lineTo(0, -s * 0.65);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    ctx.beginPath();
    ctx.arc(0, s * 0.15, s * 0.14, 0, Math.PI * 2);
    ctx.fill();
  }

  private static drawPlasmaNovaOrb(ctx: CanvasRenderingContext2D, s: number) {
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.32, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, 0, s * 0.65, 0, Math.PI * 2);
    ctx.stroke();

    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * (s * 0.38), Math.sin(a) * (s * 0.38));
      ctx.lineTo(Math.cos(a) * (s * 0.78), Math.sin(a) * (s * 0.78));
      ctx.stroke();
    }
  }

  private static drawWarhammerFist(ctx: CanvasRenderingContext2D, s: number) {
    ctx.save();
    ctx.rotate(-Math.PI / 6);
    ctx.beginPath();
    ctx.rect(-s * 0.45, -s * 0.55, s * 0.9, s * 0.4);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.rect(-s * 0.1, -s * 0.15, s * 0.2, s * 0.85);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  private static drawPlasmaReactor(ctx: CanvasRenderingContext2D, s: number, time: number) {
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.28, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    for (let i = 0; i < 3; i++) {
      const a = (i * Math.PI) / 3 + time * 0.5;
      ctx.save();
      ctx.rotate(a);
      ctx.beginPath();
      ctx.ellipse(0, 0, s * 0.72, s * 0.25, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }

  private static drawBlazingFlame(ctx: CanvasRenderingContext2D, s: number) {
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.85);
    ctx.quadraticCurveTo(s * 0.55, -s * 0.2, s * 0.45, s * 0.35);
    ctx.quadraticCurveTo(s * 0.35, s * 0.75, 0, s * 0.75);
    ctx.quadraticCurveTo(-s * 0.35, s * 0.75, -s * 0.45, s * 0.35);
    ctx.quadraticCurveTo(-s * 0.55, -s * 0.2, 0, -s * 0.85);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, -s * 0.4);
    ctx.quadraticCurveTo(s * 0.25, -s * 0.05, s * 0.2, s * 0.35);
    ctx.quadraticCurveTo(s * 0.15, s * 0.55, 0, s * 0.55);
    ctx.quadraticCurveTo(-s * 0.15, s * 0.55, -s * 0.2, s * 0.35);
    ctx.quadraticCurveTo(-s * 0.25, -s * 0.05, 0, -s * 0.4);
    ctx.closePath();
    ctx.stroke();
  }

  private static drawChainLightningBolt(ctx: CanvasRenderingContext2D, s: number) {
    ctx.beginPath();
    ctx.moveTo(s * 0.1, -s * 0.85);
    ctx.lineTo(-s * 0.4, -s * 0.05);
    ctx.lineTo(-s * 0.05, -s * 0.05);
    ctx.lineTo(-s * 0.25, s * 0.85);
    ctx.lineTo(s * 0.4, s * 0.05);
    ctx.lineTo(s * 0.05, s * 0.05);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  private static drawArmorMeltAcid(ctx: CanvasRenderingContext2D, s: number) {
    ctx.beginPath();
    ctx.rect(-s * 0.55, -s * 0.55, s * 1.1, s * 0.35);
    ctx.fill();
    ctx.stroke();

    for (let d = -1; d <= 1; d++) {
      ctx.beginPath();
      ctx.arc(d * (s * 0.32), s * 0.15 + Math.abs(d) * (s * 0.2), s * 0.14, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private static drawSuperchargeBurst(ctx: CanvasRenderingContext2D, s: number) {
    ctx.beginPath();
    for (let i = 0; i < 16; i++) {
      const a = (i * Math.PI) / 8;
      const r = i % 2 === 0 ? s * 0.85 : s * 0.35;
      const x = Math.cos(a) * r;
      const y = Math.sin(a) * r;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  private static drawBlackHoleVortex(ctx: CanvasRenderingContext2D, s: number, time: number) {
    ctx.save();
    ctx.rotate(-time * 1.5);
    for (let arm = 0; arm < 3; arm++) {
      ctx.save();
      ctx.rotate((arm * Math.PI * 2) / 3);
      ctx.beginPath();
      ctx.arc(s * 0.3, 0, s * 0.35, 0, Math.PI);
      ctx.stroke();
      ctx.restore();
    }
    ctx.restore();

    ctx.beginPath();
    ctx.arc(0, 0, s * 0.25, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  private static drawUraniumSabot(ctx: CanvasRenderingContext2D, s: number) {
    ctx.beginPath();
    ctx.moveTo(-s * 0.25, s * 0.7);
    ctx.lineTo(s * 0.25, s * 0.7);
    ctx.lineTo(s * 0.25, -s * 0.3);
    ctx.lineTo(0, -s * 0.85);
    ctx.lineTo(-s * 0.25, -s * 0.3);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, s * 0.1, s * 0.12, 0, Math.PI * 2);
    ctx.fill();
  }

  private static drawFlakScatter(ctx: CanvasRenderingContext2D, s: number) {
    const pos = [
      { x: -s * 0.32, y: -s * 0.32 },
      { x: s * 0.32, y: -s * 0.32 },
      { x: -s * 0.32, y: s * 0.32 },
      { x: s * 0.32, y: s * 0.32 }
    ];
    for (const p of pos) {
      ctx.beginPath();
      ctx.moveTo(p.x, p.y - s * 0.22);
      ctx.lineTo(p.x + s * 0.22, p.y);
      ctx.lineTo(p.x, p.y + s * 0.22);
      ctx.lineTo(p.x - s * 0.22, p.y);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
  }

  private static drawStunShockwave(ctx: CanvasRenderingContext2D, s: number) {
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.32, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, 0, s * 0.68, Math.PI * 0.2, Math.PI * 1.8);
    ctx.stroke();
  }

  private static drawSerratedBleedBlade(ctx: CanvasRenderingContext2D, s: number) {
    ctx.save();
    ctx.rotate(Math.PI / 4);
    ctx.beginPath();
    ctx.moveTo(-s * 0.15, s * 0.7);
    ctx.lineTo(s * 0.15, s * 0.7);
    ctx.lineTo(s * 0.15, -s * 0.2);
    ctx.lineTo(s * 0.3, -s * 0.35);
    ctx.lineTo(s * 0.15, -s * 0.5);
    ctx.lineTo(0, -s * 0.85);
    ctx.lineTo(-s * 0.15, -s * 0.2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  private static drawRicochetReflect(ctx: CanvasRenderingContext2D, s: number) {
    ctx.beginPath();
    ctx.moveTo(s * 0.5, -s * 0.65);
    ctx.lineTo(s * 0.5, s * 0.65);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(-s * 0.6, -s * 0.5);
    ctx.lineTo(s * 0.5, 0);
    ctx.lineTo(-s * 0.6, s * 0.5);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(-s * 0.35, s * 0.5);
    ctx.lineTo(-s * 0.6, s * 0.5);
    ctx.lineTo(-s * 0.45, s * 0.25);
    ctx.fill();
  }

  private static drawSiegeCannon(ctx: CanvasRenderingContext2D, s: number) {
    ctx.beginPath();
    ctx.rect(-s * 0.35, -s * 0.75, s * 0.7, s * 1.2);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, -s * 0.75, s * 0.35, Math.PI, 0);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, 0, s * 0.16, 0, Math.PI * 2);
    ctx.fill();
  }

  private static drawOmniCrossedBlades(ctx: CanvasRenderingContext2D, s: number) {
    for (const a of [-Math.PI / 4, Math.PI / 4]) {
      ctx.save();
      ctx.rotate(a);
      ctx.beginPath();
      ctx.rect(-s * 0.1, -s * 0.75, s * 0.2, s * 1.5);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.rect(-s * 0.3, s * 0.4, s * 0.6, s * 0.12);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
  }

  private static drawGodSlayerBlade(ctx: CanvasRenderingContext2D, s: number) {
    ctx.beginPath();
    ctx.moveTo(-s * 0.16, s * 0.85);
    ctx.lineTo(s * 0.16, s * 0.85);
    ctx.lineTo(s * 0.22, -s * 0.4);
    ctx.lineTo(0, -s * 0.95);
    ctx.lineTo(-s * 0.22, -s * 0.4);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.rect(-s * 0.45, s * 0.45, s * 0.9, s * 0.14);
    ctx.fill();
    ctx.stroke();
  }

  // --- DEFENSE ICONS ---

  private static drawCyberHeartCore(ctx: CanvasRenderingContext2D, s: number) {
    ctx.beginPath();
    ctx.moveTo(0, s * 0.7);
    ctx.bezierCurveTo(-s * 0.75, s * 0.2, -s * 0.75, -s * 0.55, 0, -s * 0.25);
    ctx.bezierCurveTo(s * 0.75, -s * 0.55, s * 0.75, s * 0.2, 0, s * 0.7);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(-s * 0.4, 0);
    ctx.lineTo(-s * 0.15, 0);
    ctx.lineTo(0, -s * 0.3);
    ctx.lineTo(s * 0.15, s * 0.2);
    ctx.lineTo(s * 0.4, 0);
    ctx.stroke();
  }

  private static drawCompositePlates(ctx: CanvasRenderingContext2D, s: number) {
    for (let i = -1; i <= 1; i++) {
      const y = i * (s * 0.38);
      ctx.beginPath();
      ctx.rect(-s * 0.55, y - s * 0.15, s * 1.1, s * 0.3);
      ctx.fill();
      ctx.stroke();
    }
  }

  private static drawMedicalNanoCross(ctx: CanvasRenderingContext2D, s: number) {
    const w = s * 0.3;
    const l = s * 0.8;
    ctx.beginPath();
    ctx.rect(-w / 2, -l / 2, w, l);
    ctx.rect(-l / 2, -w / 2, l, w);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, 0, s * 0.14, 0, Math.PI * 2);
    ctx.fill();
  }

  private static drawCyberBatteryCell(ctx: CanvasRenderingContext2D, s: number) {
    ctx.beginPath();
    ctx.rect(-s * 0.32, -s * 0.55, s * 0.64, s * 1.15);
    ctx.rect(-s * 0.14, -s * 0.75, s * 0.28, s * 0.2);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, -s * 0.25); ctx.lineTo(0, s * 0.05);
    ctx.moveTo(-s * 0.15, -s * 0.1); ctx.lineTo(s * 0.15, -s * 0.1);
    ctx.stroke();
  }

  private static drawHazardShield(ctx: CanvasRenderingContext2D, s: number) {
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.8);
    ctx.lineTo(s * 0.65, s * 0.55);
    ctx.lineTo(-s * 0.65, s * 0.55);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, -s * 0.35); ctx.lineTo(0, s * 0.15);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, s * 0.35, s * 0.08, 0, Math.PI * 2);
    ctx.fill();
  }

  private static drawCellularDnaMitosis(ctx: CanvasRenderingContext2D, s: number) {
    ctx.beginPath();
    ctx.arc(-s * 0.22, 0, s * 0.38, 0, Math.PI * 2);
    ctx.arc(s * 0.22, 0, s * 0.38, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  private static drawHexEnergyBarrier(ctx: CanvasRenderingContext2D, s: number) {
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const a = (i * Math.PI) / 3;
      const x = Math.cos(a) * s * 0.75;
      const y = Math.sin(a) * s * 0.75;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const a = (i * Math.PI) / 3;
      const x = Math.cos(a) * s * 0.4;
      const y = Math.sin(a) * s * 0.4;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();
  }

  private static drawSpikedPlating(ctx: CanvasRenderingContext2D, s: number) {
    ctx.beginPath();
    ctx.rect(-s * 0.6, -s * 0.2, s * 1.2, s * 0.7);
    ctx.fill();
    ctx.stroke();

    const spikeX = [-s * 0.35, 0, s * 0.35];
    for (const x of spikeX) {
      ctx.beginPath();
      ctx.moveTo(x - s * 0.15, -s * 0.2);
      ctx.lineTo(x, -s * 0.75);
      ctx.lineTo(x + s * 0.15, -s * 0.2);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
  }

  private static drawImmortalAngelWings(ctx: CanvasRenderingContext2D, s: number) {
    ctx.beginPath();
    ctx.moveTo(-s * 0.1, s * 0.3);
    ctx.quadraticCurveTo(-s * 0.85, -s * 0.2, -s * 0.8, -s * 0.7);
    ctx.quadraticCurveTo(-s * 0.4, -s * 0.4, -s * 0.1, 0);
    ctx.moveTo(s * 0.1, s * 0.3);
    ctx.quadraticCurveTo(s * 0.85, -s * 0.2, s * 0.8, -s * 0.7);
    ctx.quadraticCurveTo(s * 0.4, -s * 0.4, s * 0.1, 0);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, 0, s * 0.22, 0, Math.PI * 2);
    ctx.fill();
  }

  private static drawReinforcedBulkhead(ctx: CanvasRenderingContext2D, s: number) {
    ctx.beginPath();
    ctx.rect(-s * 0.55, -s * 0.65, s * 1.1, s * 1.3);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, 0, s * 0.28, 0, Math.PI * 2);
    ctx.stroke();

    const corners = [
      { x: -s * 0.38, y: -s * 0.48 },
      { x: s * 0.38, y: -s * 0.48 },
      { x: -s * 0.38, y: s * 0.48 },
      { x: s * 0.38, y: s * 0.48 }
    ];
    for (const c of corners) {
      ctx.beginPath();
      ctx.arc(c.x, c.y, s * 0.08, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private static drawShieldPulseWave(ctx: CanvasRenderingContext2D, s: number) {
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, 0, s * 0.55, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, 0, s * 0.8, 0, Math.PI * 2);
    ctx.stroke();
  }

  private static drawHighVoltageCapacitor(ctx: CanvasRenderingContext2D, s: number) {
    ctx.beginPath();
    ctx.rect(-s * 0.45, -s * 0.65, s * 0.22, s * 1.3);
    ctx.rect(s * 0.23, -s * 0.65, s * 0.22, s * 1.3);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(-s * 0.15, -s * 0.3);
    ctx.lineTo(s * 0.1, 0);
    ctx.lineTo(-s * 0.05, s * 0.1);
    ctx.lineTo(s * 0.15, s * 0.35);
    ctx.stroke();
  }

  private static drawFortressBastion(ctx: CanvasRenderingContext2D, s: number) {
    ctx.beginPath();
    ctx.moveTo(-s * 0.55, s * 0.65);
    ctx.lineTo(s * 0.55, s * 0.65);
    ctx.lineTo(s * 0.45, -s * 0.4);
    ctx.lineTo(s * 0.45, -s * 0.7);
    ctx.lineTo(s * 0.2, -s * 0.7);
    ctx.lineTo(s * 0.2, -s * 0.45);
    ctx.lineTo(-s * 0.2, -s * 0.45);
    ctx.lineTo(-s * 0.2, -s * 0.7);
    ctx.lineTo(-s * 0.45, -s * 0.7);
    ctx.lineTo(-s * 0.45, -s * 0.4);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  private static drawHeavyAnchor(ctx: CanvasRenderingContext2D, s: number) {
    ctx.beginPath();
    ctx.arc(0, -s * 0.5, s * 0.18, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, -s * 0.32); ctx.lineTo(0, s * 0.6);
    ctx.moveTo(-s * 0.35, -s * 0.1); ctx.lineTo(s * 0.35, -s * 0.1);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, s * 0.2, s * 0.5, 0.15, Math.PI - 0.15);
    ctx.stroke();
  }

  private static drawReactiveReflectShield(ctx: CanvasRenderingContext2D, s: number) {
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.75);
    ctx.lineTo(s * 0.55, -s * 0.45);
    ctx.lineTo(s * 0.45, s * 0.35);
    ctx.lineTo(0, s * 0.75);
    ctx.lineTo(-s * 0.45, s * 0.35);
    ctx.lineTo(-s * 0.55, -s * 0.45);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, s * 0.25);
    ctx.lineTo(0, -s * 0.35);
    ctx.lineTo(-s * 0.2, -s * 0.15);
    ctx.moveTo(0, -s * 0.35);
    ctx.lineTo(s * 0.2, -s * 0.15);
    ctx.stroke();
  }

  private static drawAdamantDiamondShield(ctx: CanvasRenderingContext2D, s: number) {
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.75);
    ctx.lineTo(s * 0.6, -s * 0.2);
    ctx.lineTo(0, s * 0.75);
    ctx.lineTo(-s * 0.6, -s * 0.2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(-s * 0.6, -s * 0.2); ctx.lineTo(s * 0.6, -s * 0.2);
    ctx.moveTo(0, -s * 0.75); ctx.lineTo(0, s * 0.75);
    ctx.stroke();
  }

  private static drawTitanCrushFoot(ctx: CanvasRenderingContext2D, s: number) {
    ctx.beginPath();
    ctx.moveTo(-s * 0.5, -s * 0.4);
    ctx.lineTo(s * 0.25, -s * 0.4);
    ctx.lineTo(s * 0.55, s * 0.45);
    ctx.lineTo(-s * 0.5, s * 0.45);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(-s * 0.65, s * 0.65); ctx.lineTo(-s * 0.25, s * 0.45);
    ctx.moveTo(s * 0.65, s * 0.65); ctx.lineTo(s * 0.25, s * 0.45);
    ctx.stroke();
  }

  private static drawAegisOfImmortality(ctx: CanvasRenderingContext2D, s: number) {
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.85);
    ctx.lineTo(s * 0.65, -s * 0.45);
    ctx.lineTo(s * 0.55, s * 0.35);
    ctx.lineTo(0, s * 0.85);
    ctx.lineTo(-s * 0.55, s * 0.35);
    ctx.lineTo(-s * 0.65, -s * 0.45);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, -s * 0.05, s * 0.24, 0, Math.PI * 2);
    ctx.fill();
  }

  private static drawPhaseSpecterGhost(ctx: CanvasRenderingContext2D, s: number) {
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.75);
    ctx.quadraticCurveTo(s * 0.55, -s * 0.75, s * 0.55, s * 0.15);
    ctx.lineTo(s * 0.55, s * 0.65);
    ctx.lineTo(s * 0.28, s * 0.45);
    ctx.lineTo(0, s * 0.65);
    ctx.lineTo(-s * 0.28, s * 0.45);
    ctx.lineTo(-s * 0.55, s * 0.65);
    ctx.lineTo(-s * 0.55, s * 0.15);
    ctx.quadraticCurveTo(-s * 0.55, -s * 0.75, 0, -s * 0.75);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  private static drawHologramDecoyTwin(ctx: CanvasRenderingContext2D, s: number) {
    for (const d of [-s * 0.22, s * 0.22]) {
      ctx.beginPath();
      ctx.arc(d, -s * 0.3, s * 0.18, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(d, s * 0.35, s * 0.32, Math.PI, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
  }

  private static drawWingedDriftBoots(ctx: CanvasRenderingContext2D, s: number) {
    ctx.beginPath();
    ctx.moveTo(-s * 0.35, -s * 0.5);
    ctx.lineTo(s * 0.05, -s * 0.5);
    ctx.lineTo(s * 0.05, s * 0.15);
    ctx.lineTo(s * 0.55, s * 0.15);
    ctx.lineTo(s * 0.55, s * 0.5);
    ctx.lineTo(-s * 0.35, s * 0.5);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(-s * 0.25, -s * 0.1);
    ctx.lineTo(-s * 0.7, -s * 0.6);
    ctx.lineTo(-s * 0.3, -s * 0.3);
    ctx.stroke();
  }

  private static drawStealthCloakEye(ctx: CanvasRenderingContext2D, s: number) {
    ctx.beginPath();
    ctx.moveTo(-s * 0.75, 0);
    ctx.quadraticCurveTo(0, -s * 0.55, s * 0.75, 0);
    ctx.quadraticCurveTo(0, s * 0.55, -s * 0.75, 0);
    ctx.closePath();
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, 0, s * 0.24, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(-s * 0.6, s * 0.5); ctx.lineTo(s * 0.6, -s * 0.5);
    ctx.stroke();
  }

  private static drawChronoPortalDash(ctx: CanvasRenderingContext2D, s: number) {
    ctx.beginPath();
    ctx.ellipse(0, 0, s * 0.65, s * 0.32, Math.PI / 4, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(-s * 0.45, s * 0.45);
    ctx.lineTo(s * 0.45, -s * 0.45);
    ctx.lineTo(s * 0.15, -s * 0.45);
    ctx.moveTo(s * 0.45, -s * 0.45);
    ctx.lineTo(s * 0.45, -s * 0.15);
    ctx.stroke();
  }

  private static drawUntouchableGleamStar(ctx: CanvasRenderingContext2D, s: number) {
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.85);
    ctx.lineTo(s * 0.25, -s * 0.25);
    ctx.lineTo(s * 0.85, 0);
    ctx.lineTo(s * 0.25, s * 0.25);
    ctx.lineTo(0, s * 0.85);
    ctx.lineTo(-s * 0.25, s * 0.25);
    ctx.lineTo(-s * 0.85, 0);
    ctx.lineTo(-s * 0.25, -s * 0.25);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  private static drawPhoenixRebirth(ctx: CanvasRenderingContext2D, s: number) {
    ctx.beginPath();
    ctx.moveTo(0, s * 0.65);
    ctx.quadraticCurveTo(-s * 0.75, s * 0.1, -s * 0.85, -s * 0.65);
    ctx.quadraticCurveTo(-s * 0.35, -s * 0.35, 0, -s * 0.1);
    ctx.quadraticCurveTo(s * 0.35, -s * 0.35, 0.85, -s * 0.65);
    ctx.quadraticCurveTo(s * 0.75, s * 0.1, 0, s * 0.65);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, -s * 0.4, s * 0.15, 0, Math.PI * 2);
    ctx.fill();
  }

  private static drawNaniteDroneHive(ctx: CanvasRenderingContext2D, s: number) {
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const a = (i * Math.PI) / 3;
      const x = Math.cos(a) * (s * 0.38);
      const y = Math.sin(a) * (s * 0.38);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    for (let i = 0; i < 3; i++) {
      const a = (i * Math.PI * 2) / 3 + Math.PI / 6;
      ctx.beginPath();
      ctx.arc(Math.cos(a) * (s * 0.72), Math.sin(a) * (s * 0.72), s * 0.12, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // --- MOBILITY ICONS ---

  private static drawTwinRocketThruster(ctx: CanvasRenderingContext2D, s: number) {
    for (const x of [-s * 0.28, s * 0.28]) {
      ctx.beginPath();
      ctx.moveTo(x - s * 0.18, -s * 0.6);
      ctx.lineTo(x + s * 0.18, -s * 0.6);
      ctx.lineTo(x + x * 0.1 + 0.05, s * 0.15);
      ctx.lineTo(x - x * 0.1 - 0.05, s * 0.15);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(x - s * 0.15, s * 0.15);
      ctx.lineTo(x, s * 0.7);
      ctx.lineTo(x + s * 0.15, s * 0.15);
      ctx.fill();
    }
  }

  private static drawDashLightningChevrons(ctx: CanvasRenderingContext2D, s: number) {
    for (const y of [-s * 0.22, s * 0.22]) {
      ctx.beginPath();
      ctx.moveTo(-s * 0.55, y + s * 0.25);
      ctx.lineTo(0, y - s * 0.25);
      ctx.lineTo(s * 0.55, y + s * 0.25);
      ctx.lineTo(s * 0.38, y + s * 0.25);
      ctx.lineTo(0, y - s * 0.08);
      ctx.lineTo(-s * 0.38, y + s * 0.25);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
  }

  private static drawDriftArcTreads(ctx: CanvasRenderingContext2D, s: number) {
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.65, Math.PI * 0.6, Math.PI * 1.4);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.4, Math.PI * 0.6, Math.PI * 1.4);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(s * 0.2, -s * 0.55);
    ctx.lineTo(s * 0.6, 0);
    ctx.lineTo(s * 0.2, s * 0.55);
    ctx.stroke();
  }

  private static drawTacticalStanceTarget(ctx: CanvasRenderingContext2D, s: number) {
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.65, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, 0, s * 0.35, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  private static drawLateralStrafeArrows(ctx: CanvasRenderingContext2D, s: number) {
    ctx.beginPath();
    ctx.moveTo(-s * 0.75, 0); ctx.lineTo(-s * 0.25, -s * 0.4); ctx.lineTo(-s * 0.25, s * 0.4);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(s * 0.75, 0); ctx.lineTo(s * 0.25, -s * 0.4); ctx.lineTo(s * 0.25, s * 0.4);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  private static drawSupersonicWingBoost(ctx: CanvasRenderingContext2D, s: number) {
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.85);
    ctx.lineTo(s * 0.65, s * 0.5);
    ctx.lineTo(0, s * 0.2);
    ctx.lineTo(-s * 0.65, s * 0.5);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  private static drawFireDashFootprints(ctx: CanvasRenderingContext2D, s: number) {
    ctx.beginPath();
    ctx.moveTo(-s * 0.6, s * 0.6);
    ctx.quadraticCurveTo(0, -s * 0.4, s * 0.6, -s * 0.6);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, 0, s * 0.25, 0, Math.PI * 2);
    ctx.fill();
  }

  private static drawEmpStunBurst(ctx: CanvasRenderingContext2D, s: number) {
    this.drawChainLightningBolt(ctx, s * 0.85);
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.6, 0, Math.PI * 2);
    ctx.stroke();
  }

  private static drawFocusRapidEye(ctx: CanvasRenderingContext2D, s: number) {
    this.drawSniperScope(ctx, s * 0.9);
  }

  private static drawFocusSniperCross(ctx: CanvasRenderingContext2D, s: number) {
    this.drawSniperScope(ctx, s);
  }

  private static drawSprintBarrier(ctx: CanvasRenderingContext2D, s: number) {
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.65, -Math.PI * 0.6, Math.PI * 0.6);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(-s * 0.15, 0, s * 0.25, 0, Math.PI * 2);
    ctx.fill();
  }

  private static drawPhasePassArrow(ctx: CanvasRenderingContext2D, s: number) {
    ctx.beginPath();
    ctx.rect(-s * 0.12, -s * 0.65, s * 0.24, s * 1.3);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(-s * 0.65, 0); ctx.lineTo(s * 0.65, 0);
    ctx.lineTo(s * 0.35, -s * 0.25);
    ctx.moveTo(s * 0.65, 0); ctx.lineTo(s * 0.35, s * 0.25);
    ctx.stroke();
  }

  private static drawBunkerBipod(ctx: CanvasRenderingContext2D, s: number) {
    ctx.beginPath();
    ctx.moveTo(-s * 0.65, -s * 0.2); ctx.lineTo(s * 0.65, -s * 0.2);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, -s * 0.2); ctx.lineTo(-s * 0.45, s * 0.65);
    ctx.moveTo(0, -s * 0.2); ctx.lineTo(s * 0.45, s * 0.65);
    ctx.stroke();
  }

  private static drawZenithLotusRune(ctx: CanvasRenderingContext2D, s: number) {
    for (let i = 0; i < 4; i++) {
      const a = (i * Math.PI) / 2;
      ctx.save();
      ctx.rotate(a);
      ctx.beginPath();
      ctx.ellipse(0, -s * 0.4, s * 0.18, s * 0.35, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
  }

  private static drawRailgunPierceBeam(ctx: CanvasRenderingContext2D, s: number) {
    ctx.beginPath();
    ctx.moveTo(-s * 0.75, 0); ctx.lineTo(s * 0.75, 0);
    ctx.stroke();

    for (let x = -s * 0.4; x <= s * 0.4; x += s * 0.4) {
      ctx.beginPath();
      ctx.arc(x, 0, s * 0.16, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private static drawHomingMissileLock(ctx: CanvasRenderingContext2D, s: number) {
    ctx.beginPath();
    ctx.moveTo(-s * 0.5, s * 0.5);
    ctx.quadraticCurveTo(0, s * 0.3, s * 0.5, -s * 0.5);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(s * 0.5, -s * 0.5, s * 0.2, 0, Math.PI * 2);
    ctx.fill();
  }

  private static drawHeavyIonPulse3X(ctx: CanvasRenderingContext2D, s: number) {
    ctx.font = `bold ${Math.round(s * 0.85)}px Orbitron, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('3X', 0, 0);
  }

  private static drawZenithSlowAura(ctx: CanvasRenderingContext2D, s: number) {
    for (let i = 0; i < 6; i++) {
      const a = (i * Math.PI) / 3;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(a) * s * 0.75, Math.sin(a) * s * 0.75);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.2, 0, Math.PI * 2);
    ctx.fill();
  }

  private static drawMomentumSpeedTriple(ctx: CanvasRenderingContext2D, s: number) {
    const xs = [-s * 0.35, 0, s * 0.35];
    for (const x of xs) {
      ctx.beginPath();
      ctx.moveTo(x - s * 0.18, -s * 0.4);
      ctx.lineTo(x + s * 0.18, 0);
      ctx.lineTo(x - s * 0.18, s * 0.4);
      ctx.stroke();
    }
  }

  private static drawRunAndGunSMG(ctx: CanvasRenderingContext2D, s: number) {
    ctx.beginPath();
    ctx.rect(-s * 0.45, -s * 0.2, s * 0.8, s * 0.35);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.rect(-s * 0.15, s * 0.15, s * 0.22, s * 0.45);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(s * 0.35, -s * 0.05); ctx.lineTo(s * 0.75, -s * 0.05);
    ctx.stroke();
  }

  private static drawStaticChargeFoot(ctx: CanvasRenderingContext2D, s: number) {
    this.drawChainLightningBolt(ctx, s * 0.9);
  }

  private static drawNitroBoostFlask(ctx: CanvasRenderingContext2D, s: number) {
    ctx.beginPath();
    ctx.rect(-s * 0.25, -s * 0.35, s * 0.5, s * 0.95);
    ctx.rect(-s * 0.12, -s * 0.65, s * 0.24, s * 0.3);
    ctx.fill();
    ctx.stroke();
  }

  private static drawSonicBoomCone(ctx: CanvasRenderingContext2D, s: number) {
    ctx.beginPath();
    ctx.moveTo(s * 0.5, 0);
    ctx.lineTo(-s * 0.5, -s * 0.65);
    ctx.lineTo(-s * 0.5, s * 0.65);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  private static drawPerpetualInfinity(ctx: CanvasRenderingContext2D, s: number) {
    ctx.beginPath();
    ctx.arc(-s * 0.35, 0, s * 0.32, 0, Math.PI * 2);
    ctx.arc(s * 0.35, 0, s * 0.32, 0, Math.PI * 2);
    ctx.stroke();
  }

  private static drawFrozenHourglass(ctx: CanvasRenderingContext2D, s: number) {
    ctx.beginPath();
    ctx.moveTo(-s * 0.45, -s * 0.65);
    ctx.lineTo(s * 0.45, -s * 0.65);
    ctx.lineTo(0, 0);
    ctx.lineTo(s * 0.45, s * 0.65);
    ctx.lineTo(-s * 0.45, s * 0.65);
    ctx.lineTo(0, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  private static drawTachyonWarpPortal(ctx: CanvasRenderingContext2D, s: number) {
    this.drawBlackHoleVortex(ctx, s, 1.0);
  }

  // --- ECONOMY ICONS ---

  private static drawHorseshoeMagnet(ctx: CanvasRenderingContext2D, s: number) {
    ctx.beginPath();
    ctx.arc(0, -s * 0.1, s * 0.5, Math.PI, 0);
    ctx.lineTo(s * 0.5, s * 0.55);
    ctx.lineTo(s * 0.22, s * 0.55);
    ctx.lineTo(s * 0.22, -s * 0.1);
    ctx.arc(0, -s * 0.1, s * 0.22, 0, Math.PI, true);
    ctx.lineTo(-s * 0.22, s * 0.55);
    ctx.lineTo(-s * 0.5, s * 0.55);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.rect(-s * 0.5, s * 0.3, s * 0.28, s * 0.25);
    ctx.rect(s * 0.22, s * 0.3, s * 0.28, s * 0.25);
    ctx.fill();
  }

  private static drawNanoCrystalShard(ctx: CanvasRenderingContext2D, s: number) {
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.85);
    ctx.lineTo(s * 0.6, -s * 0.25);
    ctx.lineTo(0, s * 0.85);
    ctx.lineTo(-s * 0.6, -s * 0.25);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(-s * 0.6, -s * 0.25); ctx.lineTo(s * 0.6, -s * 0.25);
    ctx.moveTo(0, -s * 0.85); ctx.lineTo(0, s * 0.85);
    ctx.stroke();
  }

  private static drawNeuralCyberBrain(ctx: CanvasRenderingContext2D, s: number) {
    ctx.beginPath();
    ctx.arc(-s * 0.24, -s * 0.15, s * 0.32, 0, Math.PI * 2);
    ctx.arc(s * 0.24, -s * 0.15, s * 0.32, 0, Math.PI * 2);
    ctx.arc(-s * 0.20, s * 0.25, s * 0.26, 0, Math.PI * 2);
    ctx.arc(s * 0.20, s * 0.25, s * 0.26, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(-s * 0.15, 0); ctx.lineTo(s * 0.15, 0);
    ctx.stroke();
  }

  private static drawCrateRadarSweep(ctx: CanvasRenderingContext2D, s: number) {
    ctx.beginPath();
    ctx.rect(-s * 0.45, -s * 0.45, s * 0.9, s * 0.9);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(-s * 0.45, -s * 0.45); ctx.lineTo(s * 0.45, s * 0.45);
    ctx.moveTo(s * 0.45, -s * 0.45); ctx.lineTo(-s * 0.45, s * 0.45);
    ctx.stroke();
  }

  private static drawStackedCyberCredits(ctx: CanvasRenderingContext2D, s: number) {
    for (let i = 0; i < 3; i++) {
      const y = s * 0.28 - i * (s * 0.28);
      ctx.beginPath();
      ctx.ellipse(0, y, s * 0.55, s * 0.22, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
  }

  private static drawGravitonFunnel(ctx: CanvasRenderingContext2D, s: number) {
    this.drawBlackHoleVortex(ctx, s * 0.85, 0.5);
  }

  private static drawTacticalTwinDice(ctx: CanvasRenderingContext2D, s: number) {
    ctx.beginPath();
    ctx.rect(-s * 0.45, -s * 0.45, s * 0.9, s * 0.9);
    ctx.fill();
    ctx.stroke();

    const dots = [
      { x: 0, y: 0 },
      { x: -s * 0.25, y: -s * 0.25 },
      { x: s * 0.25, y: -s * 0.25 },
      { x: -s * 0.25, y: s * 0.25 },
      { x: s * 0.25, y: s * 0.25 }
    ];
    for (const d of dots) {
      ctx.beginPath();
      ctx.arc(d.x, d.y, s * 0.08, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private static drawVampiricBloodDrop(ctx: CanvasRenderingContext2D, s: number) {
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.8);
    ctx.quadraticCurveTo(s * 0.5, s * 0.1, 0, s * 0.75);
    ctx.quadraticCurveTo(-s * 0.5, s * 0.1, 0, -s * 0.8);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  private static drawRadiantTreasureChest(ctx: CanvasRenderingContext2D, s: number) {
    ctx.beginPath();
    ctx.rect(-s * 0.55, -s * 0.05, s * 1.1, s * 0.65);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(-s * 0.55, -s * 0.05);
    ctx.lineTo(-s * 0.45, -s * 0.55);
    ctx.lineTo(s * 0.45, -s * 0.55);
    ctx.lineTo(s * 0.55, -s * 0.05);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, s * 0.2, s * 0.09, 0, Math.PI * 2);
    ctx.fill();
  }

  private static drawFlawlessPrismGem(ctx: CanvasRenderingContext2D, s: number) {
    this.drawNanoCrystalShard(ctx, s);
  }

  private static drawNukeRadiationTrefoil(ctx: CanvasRenderingContext2D, s: number) {
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.16, 0, Math.PI * 2);
    ctx.fill();

    for (let i = 0; i < 3; i++) {
      const a = (i * Math.PI * 2) / 3 - Math.PI / 2;
      ctx.beginPath();
      ctx.arc(0, 0, s * 0.68, a - 0.5, a + 0.5);
      ctx.lineTo(0, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
  }

  private static drawInwardVacuumVortex(ctx: CanvasRenderingContext2D, s: number) {
    for (let i = 0; i < 4; i++) {
      const a = (i * Math.PI) / 2;
      ctx.save();
      ctx.rotate(a);
      ctx.beginPath();
      ctx.moveTo(0, s * 0.8);
      ctx.lineTo(0, s * 0.28);
      ctx.lineTo(-s * 0.15, s * 0.45);
      ctx.moveTo(0, s * 0.28);
      ctx.lineTo(s * 0.15, s * 0.45);
      ctx.stroke();
      ctx.restore();
    }
  }

  private static drawUpwardInterestGraph(ctx: CanvasRenderingContext2D, s: number) {
    const bars = [-s * 0.35, 0, s * 0.35];
    const heights = [s * 0.3, s * 0.55, s * 0.8];
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.rect(bars[i] - s * 0.1, s * 0.5 - heights[i], s * 0.2, heights[i]);
      ctx.fill();
      ctx.stroke();
    }
  }

  private static drawTargetedBountySkull(ctx: CanvasRenderingContext2D, s: number) {
    ctx.beginPath();
    ctx.arc(0, -s * 0.15, s * 0.45, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.rect(-s * 0.25, s * 0.2, s * 0.5, s * 0.3);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(-s * 0.18, -s * 0.15, s * 0.12, 0, Math.PI * 2);
    ctx.arc(s * 0.18, -s * 0.15, s * 0.12, 0, Math.PI * 2);
    ctx.fill();
  }

  private static drawLootContainerBurst(ctx: CanvasRenderingContext2D, s: number) {
    this.drawCrateRadarSweep(ctx, s);
  }

  private static drawCrystalDuplicator2X(ctx: CanvasRenderingContext2D, s: number) {
    ctx.save();
    ctx.translate(-s * 0.22, 0);
    ctx.scale(0.7, 0.7);
    this.drawNanoCrystalShard(ctx, s);
    ctx.restore();

    ctx.save();
    ctx.translate(s * 0.22, 0);
    ctx.scale(0.7, 0.7);
    this.drawNanoCrystalShard(ctx, s);
    ctx.restore();
  }

  private static drawTransmutationCircle(ctx: CanvasRenderingContext2D, s: number) {
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.65, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, -s * 0.65);
    ctx.lineTo(s * 0.56, s * 0.32);
    ctx.lineTo(-s * 0.56, s * 0.32);
    ctx.closePath();
    ctx.stroke();
  }

  private static drawSyndicateImperialCrown(ctx: CanvasRenderingContext2D, s: number) {
    ctx.beginPath();
    ctx.moveTo(-s * 0.65, s * 0.45);
    ctx.lineTo(s * 0.65, s * 0.45);
    ctx.lineTo(s * 0.55, -s * 0.35);
    ctx.lineTo(s * 0.25, 0);
    ctx.lineTo(0, -s * 0.65);
    ctx.lineTo(-s * 0.25, 0);
    ctx.lineTo(-s * 0.55, -s * 0.35);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  private static drawHoloTarotStar(ctx: CanvasRenderingContext2D, s: number) {
    ctx.beginPath();
    ctx.rect(-s * 0.42, -s * 0.65, s * 0.84, s * 1.3);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, 0, s * 0.22, 0, Math.PI * 2);
    ctx.fill();
  }

  private static drawBanishLaserSlash(ctx: CanvasRenderingContext2D, s: number) {
    this.drawHoloTarotStar(ctx, s * 0.85);

    ctx.beginPath();
    ctx.moveTo(-s * 0.7, s * 0.7);
    ctx.lineTo(s * 0.7, -s * 0.7);
    ctx.stroke();
  }

  private static drawDualCardSynthesis(ctx: CanvasRenderingContext2D, s: number) {
    ctx.save();
    ctx.translate(-s * 0.15, -s * 0.1);
    ctx.beginPath();
    ctx.rect(-s * 0.35, -s * 0.5, s * 0.7, s * 1.0);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    ctx.save();
    ctx.translate(s * 0.15, s * 0.1);
    ctx.beginPath();
    ctx.rect(-s * 0.35, -s * 0.5, s * 0.7, s * 1.0);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  private static drawWeaponRackSwords(ctx: CanvasRenderingContext2D, s: number) {
    this.drawOmniCrossedBlades(ctx, s);
  }

  private static drawAnvilAndHammerSparks(ctx: CanvasRenderingContext2D, s: number) {
    ctx.beginPath();
    ctx.moveTo(-s * 0.6, -s * 0.15);
    ctx.lineTo(s * 0.6, -s * 0.15);
    ctx.lineTo(s * 0.35, s * 0.45);
    ctx.lineTo(-s * 0.35, s * 0.45);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.save();
    ctx.translate(0, -s * 0.4);
    ctx.rotate(Math.PI / 4);
    ctx.beginPath();
    ctx.rect(-s * 0.25, -s * 0.15, s * 0.5, s * 0.3);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  private static drawEvolutionHyperStar(ctx: CanvasRenderingContext2D, s: number) {
    this.drawSuperchargeBurst(ctx, s);
  }

  private static drawAscensionPyramidSun(ctx: CanvasRenderingContext2D, s: number) {
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.75);
    ctx.lineTo(s * 0.65, s * 0.55);
    ctx.lineTo(-s * 0.65, s * 0.55);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, -s * 0.15, s * 0.16, 0, Math.PI * 2);
    ctx.fill();
  }

  private static drawCosmicMagnetarVortex(ctx: CanvasRenderingContext2D, s: number) {
    this.drawHorseshoeMagnet(ctx, s);
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.75, 0, Math.PI * 2);
    ctx.stroke();
  }
}
