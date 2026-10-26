import Phaser from 'phaser';
import { silhouetteBounds } from './sprite-bounds';
import actorsUrl from '../assets/adventure/evolution-v2.webp';
import enemiesUrl from '../assets/adventure/enemies-v1.webp';
import worldsUrl from '../assets/adventure/worlds-v1.webp';
import mechanicsUrl from '../assets/adventure/mechanics-v1.webp';
import familyUrl from '../assets/adventure/family-nel-v2.webp';
import babyUrl from '../assets/adventure/baby-nel-v1.webp';
import babyHugUrl from '../assets/adventure/baby-nel-hug-v1.webp';
import { babyFrameNames } from './baby-animation';
import { toddlerFrameNames } from './toddler-animation';
import toddlerUrl from '../assets/adventure/toddler-nel-v1.webp';
import parkedMotoUrl from '../assets/adventure/toy-moto-parked-v1.webp';
import hospitalUrl from '../assets/adventure/hospital-family-v1.webp';
import corridorUrl from '../assets/adventure/hospital-corridor-v1.webp';
import homeUrl from '../assets/adventure/home-bedroom-v1.webp';
import toddlerWalkUrl from '../assets/adventure/toddler-walk-v2.webp';
import hospitalWalkUrl from '../assets/adventure/hospital-walk-v2.webp';

export const actorRows = ['baby', 'toddler', 'child', 'snow', 'explorer', 'skater'] as const;
export const propFrames = ['bookshelf', 'cushions', 'tree', 'school', 'fir', 'cabin', 'boulder', 'bridge', 'ladder', 'lookout', 'ramp', 'bench', 'grass-tile', 'snow-tile', 'city-tile', 'party'];
export const enemyFrames = ['yogurt-0', 'yogurt-1', 'yogurt-2', 'yogurt-3', 'tomato-0', 'tomato-1', 'tomato-2', 'tomato-3', 'pepper-0', 'pepper-1', 'pepper-2', 'pepper-3', 'ball', 'bear', 'snowball', 'cake'];

export function loadAdventureArt(scene: Phaser.Scene) {
  scene.load.image('heroes', actorsUrl); scene.load.image('foods', enemiesUrl); scene.load.image('worlds', worldsUrl);
  scene.load.image('mechanics', mechanicsUrl);
  scene.load.image('family', familyUrl);
  scene.load.image('baby-nel', babyUrl);
  scene.load.image('baby-hug', babyHugUrl);
  scene.load.image('toddler-nel', toddlerUrl);
  scene.load.image('toy-moto', parkedMotoUrl);
  scene.load.image('hospital', hospitalUrl);
  scene.load.image('hospital-corridor', corridorUrl);
  scene.load.image('home', homeUrl);
  scene.load.image('toddler-walk', toddlerWalkUrl);
  scene.load.image('hospital-walk', hospitalWalkUrl);
}

export function register(scene: Phaser.Scene, key: string, frames: string[], columns: number, rows: number, rowEdges?: number[], columnEdges?: number[], aligned = false) {
  const texture = scene.textures.get(key), source = texture.getSourceImage() as HTMLImageElement;
  const canvas = document.createElement('canvas'); canvas.width = source.width; canvas.height = source.height;
  const context = canvas.getContext('2d', { willReadFrequently: true })!; context.drawImage(source, 0, 0);
  const data = context.getImageData(0, 0, canvas.width, canvas.height).data;
  // Only transparent margins are trimmed. The supplied mockup is never sliced.
  const bounds = frames.map((name, i) => {
    const col = i % columns, row = Math.floor(i / columns);
    const x0 = Math.round((columnEdges?.[col] ?? col / columns) * source.width);
    // The house foliage almost touches the tree in the source sheet.
    const rightEdge = key === 'worlds' && name === 'tree' ? .717 : columnEdges?.[col + 1] ?? (col + 1) / columns;
    const x1 = Math.round(rightEdge * source.width);
    const y0 = Math.round((rowEdges?.[row] ?? row / rows) * source.height), y1 = Math.round((rowEdges?.[row + 1] ?? (row + 1) / rows) * source.height);
    if (['baby-nel', 'toddler-nel', 'toddler-walk', 'hospital-walk', 'hospital', 'home'].includes(key)) {
      return { name, ...silhouetteBounds(data, canvas.width, { x: x0, y: y0, width: x1 - x0, height: y1 - y0 }) };
    }
    let l = x1, r = x0, t = y1, b = y0;
    for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) {
      if (data[(y * source.width + x) * 4 + 3] < 150) continue;
      l = Math.min(l, x); r = Math.max(r, x); t = Math.min(t, y); b = Math.max(b, y);
    }
    if (l > r) throw new Error(`Sprite buit: ${key}/${name}`);
    return { name, x: l, y: t, width: r - l + 1, height: b - t + 1 };
  });
  const width = Math.max(...bounds.map(b => b.width)), height = Math.max(...bounds.map(b => b.height));
  bounds.forEach(b => {
    const frame = texture.add(b.name, 0, b.x, b.y, b.width, b.height)!;
    // A shared untrimmed canvas preserves body scale and the floor baseline
    // through low crawl poses and taller climbing poses.
    if (aligned) frame.setTrim(width, height, Math.round((width - b.width) / 2), height - b.height, b.width, b.height);
  });
}
export function createAdventureFrames(scene: Phaser.Scene) {
  register(scene, 'heroes', actorRows.flatMap(row => [0, 1, 2, 3].map(i => `${row}-${i}`)), 4, 6, [0, .16, .32, .49, .66, .829, 1]);
  register(scene, 'foods', enemyFrames, 4, 4);
  register(scene, 'worlds', propFrames, 4, 4, [0, .29, .55, .79, 1], [0, .25, .5, .73, 1]);
  register(scene, 'mechanics', ['baby-climb', 'baby-push', 'snowboard-ride', 'snowboard-air', 'mother', 'hug', 'zip', 'vine'], 4, 2);
  // Version 2 keeps the photographed glasses, clothes and dog markings.
  // The seated mother takes the upper 63% of the generated source sheet.
  register(scene, 'family', ['mother', 'hug'], 2, 1, [0, .63]);
  register(scene, 'family', ['dog-awake', 'dog-rest'], 2, 1, [.63, 1]);
  register(scene, 'baby-nel', babyFrameNames, 4, 6, [0, .17, .33, .50, .67, .83, 1], [0, .269, .5, .75, 1], true);
  register(scene, 'baby-hug', ['hug'], 1, 1);
  register(scene, 'toddler-nel', toddlerFrameNames, 4, 6, [0, .174, .342, .51, .678, .848, 1], undefined, true);
  register(scene, 'toy-moto', ['parked'], 1, 1);
  register(scene, 'hospital', ['walk-0', 'walk-1', 'walk-2', 'walk-3', 'idle', 'jump', 'land', 'wave'], 4, 2, [0, .25, .5], undefined, true);
  register(scene, 'hospital', ['doctor-0', 'doctor-1', 'nurse-0', 'nurse-1'], 4, 1, [.5, .75], undefined, true);
  register(scene, 'hospital', ['bed', 'bed-smile', 'door', 'trolley'], 4, 1, [.75, 1]);
  register(scene, 'home', ['bed-wait', 'bed-hug'], 2, 1, [0, .537], [0, .531, 1]);
  register(scene, 'home', ['shelf', 'sofa'], 2, 1, [.537, 1], [0, .455, 1]);
  const walkFrames = Array.from({ length: 8 }, (_, i) => `walk-${i}`);
  register(scene, 'toddler-walk', walkFrames, 4, 2, undefined, undefined, true);
  register(scene, 'hospital-walk', walkFrames, 4, 2, undefined, undefined, true);
}

export function prop(scene: Phaser.Scene, frame: string, x: number, bottom: number, width: number, depth = 1) {
  const image = scene.add.image(x, bottom, 'worlds', frame).setOrigin(.5, 1).setDepth(depth);
  image.setDisplaySize(width, width * image.frame.height / image.frame.width); return image;
}
