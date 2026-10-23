# AGENTS.md — Road to Level 10

## Mission
Build a polished, mobile-first, static-hosted HTML5 2D pixel-art birthday invitation game about Nel growing from baby to ten-year-old skateboarder. Language of all player-facing text: Catalan, as explicitly requested by the user. UI, canvas, controls, accessibility labels, invitation and RSVP copy must all be Catalan.

## Stack
- Phaser 3, TypeScript, Vite. No server, database, analytics, ads or third-party tracking.
- GitHub Pages deployment using GitHub Actions; Vite `base` configurable.
- 16:9 logical resolution 480x270, pixelArt true, nearest-neighbor scaling, FIT and CENTER_BOTH; mobile landscape preferred, with portrait rotate hint and always accessible invitation.
- Keyboard arrows/A-D, Space and mobile touch left/right/jump. Mute toggle; user gesture before audio.

## Asset contract
`assets/sprites/atlas.json` indexes real transparent PNG sprite strips (64x64 frames, one row per entity), with start/end frame indices and animation names. Load using Phaser `load.spritesheet`; animations via `anims.create`. Images are ORIGINAL starter placeholders, not extracted from concept boards. Do not treat concept-board images as production sprites.
Keep hitboxes independent of sprite artwork and age-specific. Moto and rider are separate entities where feasible.

## Game structure
Scenes: Boot, Preload, Menu, LevelSelect, PlatformLevel, Invitation, Pause.
Systems: InputManager, PlayerController, VehicleController, EnemyAI, Collectibles, Checkpoints, LevelLoader, AudioManager, SaveManager.
Levels defined in `src/data/levels.json`; schemas validated with TypeScript. Store progression in localStorage only.

## Narrative and mechanics
- Ages 0–3: no food enemies. Baby crawls; toddler learns walking and jumping.
- Moto unlocks in 'Camino a la guarde' (roughly age 2–4). The exact real toy bike has a blue body, red circular center, gray T handlebar with red grips, black wheels with pale gray hubs. Recreate its familiar neighborhood street without publishing an exact address.
- From age 4: enemies are **Yogur Mutante**, **Tomate Furioso**, **Pimiento Rojo Ninja**. Avoiding them is the win condition; no violent attacks. Yogurt hops/splats, tomato rolls, pepper jumps/dashes. Introduce progressively.
- Snow/sled, nature/climbing and skate stages introduce mechanics incrementally. Skate unlocks at 9–10: roll, push, ollie, land; a final food boss rush can be optional and easy.
- Final screen reveals party invitation, RSVP button with configurable WhatsApp deep link; invitation always reachable from menu. Never hardcode real event data or personal identifying details.

## Engineering requirements
- Mobile touch controls with multi-touch support; pause on blur; respect reduced motion and mute.
- No softlocks; checkpoints, infinite retries, skip level option; full playthrough target 3–5 minutes.
- Use clear asset credits, semantic overlay buttons, accessible contrast, alt text for non-game images.
- Vitest unit tests for config, level transitions and enemy behaviors; Playwright smoke test for load, controls, invite link.
- Run npm install, npm run build and tests before claiming completion.
- Commit in small logical increments, do not overwrite assets manually curated by user.

## Implementation order
1. Scaffold Vite + Phaser + TS, preload and menu.
2. Load sprite strips and JSON, playable baby movement and Moto level prototype.
3. Add food enemies and skate level; test mobile controls.
4. Add remaining worlds, audio, transitions and final invitation.
5. QA, optimization, deploy to GitHub Pages.

See `docs/GAME_DESIGN.md` and `docs/ASSET_GUIDE.md` before coding.
