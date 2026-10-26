import Phaser from 'phaser';
import { register } from './adventure-art';
import natureUrl from '../assets/adventure/nel-nature-v2.webp';
import skateUrl from '../assets/adventure/nel-skate-v2.webp';
import snowUrl from '../assets/adventure/nel-snow-v2.webp';
import gardenUrl from '../assets/adventure/garden-v2.webp';
import forestUrl from '../assets/adventure/forest-v2.webp';
import mountainUrl from '../assets/adventure/mountain-v2.webp';
import parkUrl from '../assets/adventure/skatepark-v2.webp';
import cushionsUrl from '../assets/adventure/home-cushions-v2.webp';
import trunkUrl from '../assets/adventure/forest-trunk-v2.webp';
import { loadGardenTerrain, createGardenTerrain } from './garden-terrain';

export function loadOutdoorArt(scene: Phaser.Scene) {
  loadGardenTerrain(scene);
  for (const [key, url] of Object.entries({ 'nel-nature': natureUrl, 'nel-skate': skateUrl, 'nel-snow': snowUrl, 'garden-bg': gardenUrl, 'forest-bg': forestUrl, 'mountain-bg': mountainUrl, 'skatepark-bg': parkUrl, 'home-cushions': cushionsUrl, 'forest-trunk': trunkUrl })) scene.load.image(key, url);
}
export function createOutdoorFrames(scene: Phaser.Scene) {
  createGardenTerrain(scene);
  register(scene, 'nel-nature', ['walk-0', 'walk-1', 'walk-2', 'walk-3', 'climb-0', 'climb-1', 'climb-2', 'climb-3', 'zip-0', 'zip-1', 'vine-0', 'vine-1'], 4, 3, undefined, undefined, true);
  register(scene, 'nel-skate', ['ride', 'push', 'pump', 'quarter', 'ollie', 'air', 'land', 'balance'], 4, 2, undefined, undefined, true, { push: [.235, 0, .5, .5] });
  register(scene, 'nel-snow', ['ride-0', 'ride-1', 'ride-2', 'ride-3', 'takeoff', 'air', 'land', 'relax'], 4, 2, [0, .337, .64], undefined, true);
  register(scene, 'nel-snow', ['person'], 1, 1, [.627, 1], [0, .25]);
  register(scene, 'nel-snow', ['child', 'sled-rider', 'sled'], 3, 1, [.64, 1], [.25, .5, .75, 1]);
  register(scene, 'home-cushions', ['low', 'tall'], 2, 1);
  register(scene, 'forest-trunk', ['trunk'], 1, 1);
}

export function outdoorBackdrop(scene: Phaser.Scene, key: string, width: number) {
  for (let x = 0; x < width; x += 480) scene.add.image(x, 0, key).setOrigin(0).setDisplaySize(480, 270).setFlipX((x / 480) % 2 === 1).setDepth(-4);
}
