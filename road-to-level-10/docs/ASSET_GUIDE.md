# Asset guide

## Delivered
- `assets/reference/concept-board.png`: art direction ONLY; not game sprites; contains illustrative placeholders and text.
- `assets/sprites/*.png`: **actual transparent, grid-aligned, playable starter sprite strips** generated as pixel primitives. Not yet polished portraits.
- `assets/sprites/atlas.json`: frames and animation ranges for each entity. Each frame is 64x64 pixels; strip is horizontal.
- `assets/sprites/terrain.png`: 8 columns x 2 rows of 16x16 placeholder tiles.

## Visual style
Warm, expressive 16-bit-inspired pixel art; limited palette, hard pixels, no anti-aliasing. Preserve long curly brown hair in older protagonist, blue outfit for early adventures, distinct blue/red toy bike, helmet and skateboard for later scenes as supported by photos/videos.

## Phaser example
```ts
const info = atlas.skater;
this.load.spritesheet('skater', '/assets/sprites/skater.png', {frameWidth:64,frameHeight:64});
// after loading:
for (const [name, a] of Object.entries(info.animations)) {
 this.anims.create({key:`skater-${name}`,frames:this.anims.generateFrameNumbers('skater',{start:a.start,end:a.end}),frameRate:a.frameRate,repeat:a.repeat});
}
```

## Important

Production-ready animation will need consistent per-frame silhouettes, transparent PNGs and collision-box tuning. Original starter sprites are simple placeholders; do not misrepresent generated artwork as a final hand-pixelled likeness.

## Moto: autumn reference update

`assets/race/` contains new transparent PNG sheets generated using the user-supplied motorcycle mockup as visual guidance. These are new illustrations, not crops from the concept board. `atlas.json` in that directory records the rear-rider poses and measured street-sheet regions. `src/race-art.ts` registers source frames, trimming transparent margins from scenery at load time. Original 64×64 starter strips remain untouched. See `docs/ART_GENERATION.md` for prompts, asset paths and limitations.

The street has autumn trees, parked cars, curbs, paving stones, lamps and houses. Coins and three optional generic cartoon memory cards supplement the existing stars and power-ups. Food enemies remain reserved for later ages; collisions do not consume lives.

## Full adventure campaign

`assets/adventure/` holds the new evolution, enemy and environment sheets used by all six platform chapters. See `docs/ADVENTURE_ART.md` for exact paths, generation prompts and limits. `src/adventure-art.ts` uses measured row boundaries and trimmed alpha margins; illustrations generated from a reference do not guarantee exact grid alignment. Physics proxies remain independent of pose geometry. The game consumes WebP delivery copies while keeping PNG sources. `scripts/optimize-art.mjs` reproduces the format conversion and `scripts/preview-worlds.mjs` captures every chapter for review.

`assets/adventure/mechanics-v1.png` and its WebP delivery copy add the baby pulling up and pushing, a generic mother and hug, snowboard riding and jumping, and explorer zipline/vine poses. See `docs/MECHANICS_UPDATE.md` for the exact prompt and interaction controls. The snowboard uses its own downhill scene; the baby has no jump action.
