// Procedural Web Audio API Sound Synthesizer + Dual-Track Background Music
export class SoundManager {
  private ctx: AudioContext | null = null;
  public isMuted: boolean = false;
  private comboStreak: number = 0;
  private comboResetTimer: number = 0;

  // Background Music (BGM)
  private menuBgm: HTMLAudioElement | null = null;
  private gameBgm: HTMLAudioElement | null = null;
  private bossBgm: HTMLAudioElement | null = null;
  private currentTrack: 'menu' | 'game' | 'boss' | null = null;
  public isHapticsEnabled: boolean = true;

  constructor() {
    // Load saved mute and haptics state
    this.isMuted = localStorage.getItem('survi_run_muted') === 'true';
    this.isHapticsEnabled = localStorage.getItem('survi_run_haptics') !== 'false';

    try {
      this.menuBgm = new Audio('/assets/audio/menu_theme.wav');
      this.menuBgm.loop = true;
      this.menuBgm.volume = this.isMuted ? 0 : 0.30;

      this.gameBgm = new Audio('/assets/audio/game_theme.wav');
      this.gameBgm.loop = true;
      this.gameBgm.volume = this.isMuted ? 0 : 0.35;

      this.bossBgm = new Audio('/assets/audio/boss_theme.wav');
      this.bossBgm.loop = true;
      this.bossBgm.volume = this.isMuted ? 0 : 0.38;
    } catch (e) {
      console.warn('BGM creation notice:', e);
    }

    // Auto-unlock BGM on first user interaction for strict browser autoplay policies
    const unlockAudio = () => {
      this.initContext();
      if (!this.isMuted) {
        if (this.currentTrack === 'menu' && this.menuBgm) {
          this.menuBgm.play().catch(() => {});
        } else if (this.currentTrack === 'game' && this.gameBgm) {
          this.gameBgm.play().catch(() => {});
        } else if (this.currentTrack === 'boss' && this.bossBgm) {
          this.bossBgm.play().catch(() => {});
        }
      }
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('touchstart', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
    };
    window.addEventListener('click', unlockAudio, { passive: true });
    window.addEventListener('touchstart', unlockAudio, { passive: true });
    window.addEventListener('keydown', unlockAudio, { passive: true });
  }

  private initContext() {
    try {
      if (!this.ctx) {
        const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        this.ctx = new AudioCtxClass();
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
    } catch {
      // Silently handle if audio context is blocked
    }
  }

  public playMenuMusic() {
    this.currentTrack = 'menu';
    if (this.gameBgm) {
      this.gameBgm.pause();
      this.gameBgm.currentTime = 0;
    }
    if (this.bossBgm) {
      this.bossBgm.pause();
      this.bossBgm.currentTime = 0;
    }
    if (this.menuBgm && !this.isMuted) {
      this.menuBgm.volume = 0.28;
      this.menuBgm.play().catch(() => {});
    }
  }

  public playGameMusic() {
    this.currentTrack = 'game';
    if (this.menuBgm) {
      this.menuBgm.pause();
      this.menuBgm.currentTime = 0;
    }
    if (this.bossBgm) {
      this.bossBgm.pause();
      this.bossBgm.currentTime = 0;
    }
    if (this.gameBgm && !this.isMuted) {
      this.gameBgm.volume = 0.32;
      this.gameBgm.play().catch(() => {});
    }
  }

  public playBossMusic() {
    this.currentTrack = 'boss';
    if (this.gameBgm) this.gameBgm.pause();
    if (this.menuBgm) this.menuBgm.pause();
    if (this.bossBgm && !this.isMuted) {
      this.bossBgm.volume = 0.38;
      this.bossBgm.play().catch(() => {});
    }
  }

  public stopMusic() {
    if (this.menuBgm) this.menuBgm.pause();
    if (this.gameBgm) this.gameBgm.pause();
    if (this.bossBgm) this.bossBgm.pause();
  }

  public pauseMusic() {
    if (this.currentTrack === 'game' && this.gameBgm) {
      this.gameBgm.pause();
    } else if (this.currentTrack === 'boss' && this.bossBgm) {
      this.bossBgm.pause();
    } else if (this.currentTrack === 'menu' && this.menuBgm) {
      this.menuBgm.pause();
    }
  }

  public resumeMusic() {
    if (this.isMuted) return;
    if (this.currentTrack === 'game' && this.gameBgm) {
      this.gameBgm.play().catch(() => {});
    } else if (this.currentTrack === 'boss' && this.bossBgm) {
      this.bossBgm.play().catch(() => {});
    } else if (this.currentTrack === 'menu' && this.menuBgm) {
      this.menuBgm.play().catch(() => {});
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    localStorage.setItem('survi_run_muted', String(this.isMuted));

    if (this.menuBgm) {
      this.menuBgm.volume = this.isMuted ? 0 : 0.28;
      if (this.isMuted) this.menuBgm.pause();
      else if (this.currentTrack === 'menu') this.menuBgm.play().catch(() => {});
    }
    if (this.gameBgm) {
      this.gameBgm.volume = this.isMuted ? 0 : 0.32;
      if (this.isMuted) this.gameBgm.pause();
      else if (this.currentTrack === 'game') this.gameBgm.play().catch(() => {});
    }
    if (this.bossBgm) {
      this.bossBgm.volume = this.isMuted ? 0 : 0.38;
      if (this.isMuted) this.bossBgm.pause();
      else if (this.currentTrack === 'boss') this.bossBgm.play().catch(() => {});
    }

    return this.isMuted;
  }

  public playPickup() {
    this.playGem();
  }

  public update(dt: number) {
    if (this.comboResetTimer > 0) {
      this.comboResetTimer -= dt;
      if (this.comboResetTimer <= 0) {
        this.comboStreak = 0;
      }
    }
  }

  // Laser shoot sound
  public playShoot() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(680, now);
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.12);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.12);
  }

  // Heavy blast / Shotgun
  public playBlast() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.18);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.18);
  }

  // Lightning zap
  public playLightning() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = 'square';
    osc.frequency.setValueAtTime(950, now);
    osc.frequency.linearRampToValueAtTime(300, now + 0.08);

    gain.gain.setValueAtTime(0.07, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.09);
  }

  // Slicing blade sound
  public playSlice() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.05);

    gain.gain.setValueAtTime(0.05, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.07);
  }

  // Enemy hit impact
  public playHit() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.exponentialRampToValueAtTime(50, now + 0.06);

    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.06);
  }

  // Enemy death explosion / pop
  public playEnemyDeath() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + 0.15);

    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.15);
  }

  // XP Gem pickup with ascending pitch combo
  public playGem() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    this.comboStreak = (this.comboStreak + 1) % 15;
    this.comboResetTimer = 0.8;

    const baseFreq = 520;
    const pitchOffset = this.comboStreak * 35;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(baseFreq + pitchOffset, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq + pitchOffset + 120, now + 0.08);

    gain.gain.setValueAtTime(0.05, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.08);
  }

  // Dash whoosh sound
  public playDash() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.exponentialRampToValueAtTime(600, now + 0.12);

    gain.gain.setValueAtTime(0.09, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.12);
  }

  // Focus Mode triggered (Archero standing still)
  public playFocus() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.2);

    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.2);
  }

  // Player hurt alarm
  public playHurt() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.linearRampToValueAtTime(90, now + 0.18);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.18);
    } catch {
      // Audio playback safely ignored if context blocked
    }
  }

  // Level up fanfare (chord arpeggio)
  public playLevelUp() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    const now = this.ctx.currentTime;

    notes.forEach((freq, index) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const startTime = now + index * 0.08;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.12, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.25);
    });
  }

  // Chest / Boss defeated reward fanfare
  public playChest() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const notes = [440, 554.37, 659.25, 880, 1108.73];
    const now = this.ctx.currentTime;

    notes.forEach((freq, index) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const startTime = now + index * 0.07;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.15, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.35);
    });
  }

  // Nuke bomb detonation
  public playNuke() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(120, now);
      osc.frequency.exponentialRampToValueAtTime(20, now + 0.6);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.6);
    } catch {
      // Audio playback safely ignored if context blocked
    }
  }

  // Game over slow descent
  public playGameOver() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(280, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.8);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.8);
    } catch {
      // Audio playback safely ignored if context blocked
    }
  }

  public toggleHaptics(): boolean {
    this.isHapticsEnabled = !this.isHapticsEnabled;
    localStorage.setItem('survi_run_haptics', String(this.isHapticsEnabled));
    if (this.isHapticsEnabled) {
      this.triggerHaptic('light');
    }
    return this.isHapticsEnabled;
  }

  public triggerHaptic(type: 'light' | 'dash' | 'hit' | 'heavy' | 'boss' = 'light') {
    if (!this.isHapticsEnabled || typeof navigator === 'undefined' || !navigator.vibrate) return;
    try {
      switch (type) {
        case 'light':
          navigator.vibrate(15);
          break;
        case 'dash':
          navigator.vibrate([25, 30, 25]);
          break;
        case 'hit':
          navigator.vibrate(40);
          break;
        case 'heavy':
          navigator.vibrate([60, 40, 60]);
          break;
        case 'boss':
          navigator.vibrate([100, 60, 120, 60, 150]);
          break;
      }
    } catch {
      // Audio playback safely ignored if restricted
    }
  }
}

export const sounds = new SoundManager();
