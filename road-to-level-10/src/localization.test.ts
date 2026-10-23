import { describe, expect, it } from 'vitest';
import { levels, validateLevels, whatsAppUrl } from './model';
import invitation from './data/invitation.json';
import { canMantle } from './baby-puzzle';

describe('personalització d’en Nel', () => {
  it('fa servir Nel i textos en català en la configuració i la confirmació', () => {
    expect(invitation.childDisplayName).toBe('Nel');
    expect(decodeURIComponent(whatsAppUrl('34600000000')!)).toContain('la festa d’en Nel');
    for (const level of levels) expect(`${level.title} ${level.subtitle} ${level.hint}`).not.toMatch(/¡|¿|años|recuerdos|ESPACIO|trepar|izquierda|derecha/);
  });
  it('posa un gos baix que es pot travessar grimpant, sense saltar', () => {
    const level = levels[0], dog = level.dog!;
    expect(canMantle(230, 230 - dog.height, 0)).toBe(true);
    expect(dog.x).toBeGreaterThan(level.platforms[1].x);
    expect(dog.x).toBeLessThan(level.blocks![1].x);
    expect(() => validateLevels([{ ...level, dog: { ...dog, height: 60 } }])).toThrow();
  });
});
