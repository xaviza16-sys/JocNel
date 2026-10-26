import Phaser from 'phaser';

type Action = 'left' | 'right' | 'jump' | 'climb';
export class InputManager {
  private pointers = new Map<number, Action>();
  private keys: Record<string, Phaser.Input.Keyboard.Key>;
  private queuedJump = false;
  private stickAxis = 0;
  private stickPointer?: number;
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
    const stick = document.getElementById('direction-stick');
    if (stick) {
      const move = (event: PointerEvent) => {
        if (this.stickPointer !== event.pointerId) return;
        const rect = stick.getBoundingClientRect(), radius = rect.width * .32;
        const x = Math.max(-radius, Math.min(radius, event.clientX - rect.left - rect.width / 2));
        const y = Math.max(-radius, Math.min(radius, event.clientY - rect.top - rect.height / 2));
        this.stickAxis = Math.abs(x) < radius * .2 ? 0 : x / radius;
        stick.style.setProperty('--stick-x', `${x}px`); stick.style.setProperty('--stick-y', `${y}px`);
      };
      const down = (event: PointerEvent) => {
        // Synthetic button events keep their digital direction for accessibility tests.
        if (!event.clientX && !event.clientY || this.stickPointer !== undefined) return;
        event.preventDefault(); this.pointers.delete(event.pointerId); this.stickPointer = event.pointerId;
        try { stick.setPointerCapture(event.pointerId); } catch { /* Cancelled pointer. */ }
        stick.classList.add('active'); move(event);
      };
      const up = (event: PointerEvent) => {
        if (event.type === 'lostpointercapture' && event.target !== stick) return;
        if (this.stickPointer !== event.pointerId) return;
        this.stickPointer = undefined; this.stickAxis = 0; stick.classList.remove('active');
        stick.style.setProperty('--stick-x', '0px'); stick.style.setProperty('--stick-y', '0px');
        stick.querySelectorAll('.pressed').forEach(button => button.classList.remove('pressed'));
      };
      stick.addEventListener('pointerdown', down); stick.addEventListener('pointermove', move);
      for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) stick.addEventListener(type, up as EventListener);
      this.cleanup.push(() => {
        stick.removeEventListener('pointerdown', down); stick.removeEventListener('pointermove', move);
        for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) stick.removeEventListener(type, up as EventListener);
      });
    }
    scene.events.once('shutdown', () => this.destroy());
  }
  axis() {
    const held = [...this.pointers.values()];
    const digital = Number(this.keys.RIGHT.isDown || this.keys.D.isDown || held.includes('right')) - Number(this.keys.LEFT.isDown || this.keys.A.isDown || held.includes('left'));
    return digital || this.stickAxis;
  }
  jumpPressed() {
    const jump = this.queuedJump;
    this.queuedJump = false; return jump;
  }
  climbHeld() { return this.keys.UP.isDown || this.keys.W.isDown || [...this.pointers.values()].includes('climb'); }
  actionHeld() { return this.keys.SPACE.isDown || [...this.pointers.values()].includes('jump'); }
  reset() {
    this.pointers.clear(); this.queuedJump = false;
    this.stickAxis = 0; this.stickPointer = undefined;
    const stick = document.getElementById('direction-stick'); stick?.classList.remove('active');
    stick?.style.setProperty('--stick-x', '0px'); stick?.style.setProperty('--stick-y', '0px');
    Object.values(this.keys).forEach(key => key.reset());
    document.querySelectorAll('.pressed').forEach(button => button.classList.remove('pressed'));
  }
  destroy() { this.reset(); this.cleanup.forEach(fn => fn()); }
}

export { AudioManager } from './audio';
