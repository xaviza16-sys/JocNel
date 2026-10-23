import Phaser from 'phaser';

type Action = 'left' | 'right' | 'jump' | 'climb';
export class InputManager {
  private pointers = new Map<number, Action>();
  private keys: Record<string, Phaser.Input.Keyboard.Key>;
  private queuedJump = false;
  private cleanup: (() => void)[] = [];
  constructor(scene: Phaser.Scene) {
    this.keys = scene.input.keyboard!.addKeys('LEFT,RIGHT,A,D,SPACE,UP,W') as typeof this.keys;
    const queueJump = () => { this.queuedJump = true; };
    for (const key of [this.keys.SPACE]) {
      key.on('down', queueJump);
      this.cleanup.push(() => key.off('down', queueJump));
    }
    document.querySelectorAll<HTMLButtonElement>('[data-action]').forEach(button => {
      const down = (event: PointerEvent) => {
        event.preventDefault();
        try { button.setPointerCapture(event.pointerId); } catch { /* Synthetic or cancelled pointer. */ }
        const action = button.dataset.action as Action;
        if (action === 'jump') this.queuedJump = true;
        this.pointers.set(event.pointerId, action); button.classList.add('pressed');
      };
      const up = (event: PointerEvent) => {
        this.pointers.delete(event.pointerId);
        if (![...this.pointers.values()].includes(button.dataset.action as Action)) button.classList.remove('pressed');
      };
      button.addEventListener('pointerdown', down);
      button.addEventListener('pointerup', up);
      button.addEventListener('pointercancel', up);
      button.addEventListener('lostpointercapture', up);
      this.cleanup.push(() => {
        button.removeEventListener('pointerdown', down); button.removeEventListener('pointerup', up);
        button.removeEventListener('pointercancel', up); button.removeEventListener('lostpointercapture', up);
      });
    });
    scene.events.once('shutdown', () => this.destroy());
  }
  axis() {
    const held = [...this.pointers.values()];
    return Number(this.keys.RIGHT.isDown || this.keys.D.isDown || held.includes('right')) - Number(this.keys.LEFT.isDown || this.keys.A.isDown || held.includes('left'));
  }
  jumpPressed() {
    const jump = this.queuedJump;
    this.queuedJump = false; return jump;
  }
  climbHeld() { return this.keys.UP.isDown || this.keys.W.isDown || [...this.pointers.values()].includes('climb'); }
  actionHeld() { return this.keys.SPACE.isDown || [...this.pointers.values()].includes('jump'); }
  reset() {
    this.pointers.clear(); this.queuedJump = false;
    Object.values(this.keys).forEach(key => key.reset());
    document.querySelectorAll('.pressed').forEach(button => button.classList.remove('pressed'));
  }
  destroy() { this.reset(); this.cleanup.forEach(fn => fn()); }
}

export { AudioManager } from './audio';
