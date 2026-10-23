export type Sound = 'collect' | 'jump' | 'hit' | 'push' | 'climb' | 'zip' | 'vine' | 'land' | 'checkpoint' | 'complete';
export const tunes = {
  menu: [72, 76, 79, 76, 74, 77, 81, 77, 76, 79, 84, 79, 74, 71, 67, null],
  baby: [72, null, 76, 79, 76, null, 74, 72, 69, null, 72, 76, 74, 71, 72, null],
  toddler: [72, 74, 76, 79, 81, 79, 76, 74, 77, 79, 81, 84, 79, 76, 74, 72],
  moto: [76, 76, 79, 81, 79, 76, 74, 72, 74, 74, 77, 79, 77, 74, 72, 71],
  school: [72, 79, 76, 79, 74, 81, 77, 81, 76, 84, 79, 84, 77, 81, 74, 71],
  snow: [84, 79, 76, 72, 81, 77, 74, 69, 79, 76, 72, 67, 77, 74, 71, 72],
  nature: [69, null, 72, 76, 79, 76, 72, null, 67, null, 71, 74, 77, 74, 71, null],
  skate: [72, 72, 79, 76, 81, 79, 84, 79, 77, 77, 81, 79, 74, 71, 72, 79],
  party: [72, 76, 79, 84, 81, 79, 76, 72, 77, 81, 84, 86, 84, 81, 79, 84],
} satisfies Record<string, (number | null)[]>;
export type Theme = keyof typeof tunes;
export const midiHz = (note: number) => 440 * 2 ** ((note - 69) / 12);
const tempo: Record<Theme, number> = { menu: 108, baby: 96, toddler: 112, moto: 128, school: 118, snow: 134, nature: 100, skate: 140, party: 124 };

/** Original three-voice chiptunes. No recordings, remote files or autoplay. */
export class AudioManager {
  private context?: AudioContext;
  private master?: GainNode;
  private music?: GainNode;
  private effects?: GainNode;
  private timer?: ReturnType<typeof setInterval>;
  private theme: Theme = 'menu';
  private nextNote = 0;
  private step = 0;
  private silent = true;
  private paused = false;
  get muted() { return this.silent; }
  set muted(value: boolean) { this.silent = value; this.applyLevels(); }
  unlock() {
    try {
      if (!this.context) {
        this.context = new AudioContext();
        this.master = this.context.createGain(); this.master.connect(this.context.destination);
        this.music = this.context.createGain(); this.music.connect(this.master);
        this.effects = this.context.createGain(); this.effects.gain.value = .65; this.effects.connect(this.master);
        this.nextNote = this.context.currentTime + .05; this.applyLevels();
        this.timer = setInterval(() => this.schedule(), 70);
      }
      void this.context.resume().catch(() => {});
    } catch { /* Sound stays optional if Web Audio is unavailable. */ }
  }
  playTheme(theme: string) {
    const next: Theme = theme in tunes ? theme as Theme : 'menu';
    if (this.theme !== next) { this.theme = next; this.step = 0; this.nextNote = (this.context?.currentTime || 0) + .04; }
    this.setPaused(false);
  }
  setPaused(paused: boolean) { this.paused = paused; this.applyLevels(); }
  private applyLevels() {
    if (!this.context || !this.master || !this.music) return;
    this.master.gain.setTargetAtTime(this.silent ? 0 : .48, this.context.currentTime, .025);
    this.music.gain.setTargetAtTime(this.paused ? 0 : .38, this.context.currentTime, .025);
    if (this.silent || this.paused) this.nextNote = this.context.currentTime + .06;
  }
  private voice(hz: number, when: number, duration: number, type: OscillatorType, volume: number, bus: GainNode, endHz?: number) {
    const context = this.context!;
    const osc = context.createOscillator(), envelope = context.createGain(); osc.type = type;
    osc.frequency.setValueAtTime(hz, when);
    if (endHz) osc.frequency.exponentialRampToValueAtTime(endHz, when + duration * .8);
    envelope.gain.setValueAtTime(.0001, when); envelope.gain.exponentialRampToValueAtTime(volume, when + .008);
    envelope.gain.exponentialRampToValueAtTime(.0001, when + duration);
    osc.connect(envelope); envelope.connect(bus); osc.start(when); osc.stop(when + duration + .01);
    osc.onended = () => { osc.disconnect(); envelope.disconnect(); };
  }
  private schedule() {
    const context = this.context;
    if (!context || context.state !== 'running') return;
    if (this.silent || this.paused) { this.nextNote = context.currentTime + .06; return; }
    this.nextNote = Math.max(this.nextNote, context.currentTime + .01);
    const beat = 60 / tempo[this.theme] / 2;
    while (this.nextNote < context.currentTime + .13) {
      const note = tunes[this.theme][this.step % 16];
      if (note !== null) this.voice(midiHz(note), this.nextNote, beat * .77, 'square', .07, this.music!);
      if (this.step % 2 === 0) this.voice(midiHz([48, 45, 53, 55][Math.floor(this.step / 4) % 4]), this.nextNote, beat * 1.35, 'triangle', .12, this.music!);
      if (this.step % 4 === 0) this.voice(100, this.nextNote, .065, 'triangle', .12, this.music!, 35);
      else if (this.step % 2 === 1) this.voice(1800, this.nextNote, .022, 'square', .014, this.music!, 700);
      this.nextNote += beat; this.step++;
    }
  }
  sfx(sound: Sound) {
    if (this.silent || !this.context || this.context.state !== 'running') return;
    const now = this.context.currentTime + .005, bus = this.effects!;
    const notes: Record<Exclude<Sound, 'complete' | 'checkpoint'>, [number, number, number, OscillatorType]> = {
      collect: [880, 1500, .10, 'square'], jump: [230, 650, .13, 'square'], hit: [220, 65, .20, 'sawtooth'],
      push: [100, 75, .07, 'triangle'], climb: [330, 470, .075, 'triangle'], zip: [1200, 350, .28, 'sawtooth'],
      vine: [400, 850, .16, 'triangle'], land: [160, 85, .08, 'triangle'],
    };
    if (sound === 'complete' || sound === 'checkpoint') {
      const melody = sound === 'complete' ? [72, 76, 79, 84, 88] : [72, 79];
      melody.forEach((note, i) => this.voice(midiHz(note), now + i * .09, .18, 'square', .10, bus)); return;
    }
    const [from, to, duration, type] = notes[sound]; this.voice(from, now, duration, type, .10, bus, to);
  }
  chime(frequency = 660) {
    if (!this.silent && this.context?.state === 'running') this.voice(frequency, this.context.currentTime + .005, .13, 'square', .09, this.effects!, frequency * 1.4);
  }
  destroy() { if (this.timer) clearInterval(this.timer); void this.context?.close(); }
}
