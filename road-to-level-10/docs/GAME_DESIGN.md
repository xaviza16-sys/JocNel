# Road to Level 10 — Game Design Document

Current implementation: the child is Nel and all player-facing text is Catalan. The first chapter uses personalized mother and dog pixel art derived from the supplied photograph; Nel must climb over the resting dog without jumping before reaching his mother. See `FAMILIA_NEL_CA.md`. This supersedes the earlier generic mother description below.

## Purpose
A shareable WhatsApp birthday invitation disguised as a short nostalgic pixel-art platform game. Target: 3–5 minutes; children and adults on mobile.

## Level outline (provisional; user approves each scene)
1. Habitación (0–1): find mother by crawling, pulling up onto low ledges and pushing soft blocks into staircase formations. Baby cannot jump. Space plus direction pushes; up/W pulls onto a ledge. Two push puzzles introduce a single movable step and a chain of two different-height blocks. The destination uses a generic mother illustration and a hug pose. Pause can reset the puzzle.
2. Casa y jardín (1–2): first steps, low platforms, collect stars.
3. Camino a la guarde (2–4): rear-view retro racing with automatic forward motion and continuous left/right steering. The blue/red toy motorcycle travels through a stylized neighborhood toward the school. Avoid cones, puddles and toy blocks; collect stars, shield, magnet and turbo power-ups. Collisions briefly slow the rider, with no game over. This perspective and mechanic were requested by the user in place of the side-scrolling prototype.
4. Cole y amigos (4–6): first Yogur Mutante and Tomate Furioso; jump and avoid.
5. Nieve y montaña (6–7): snowboard descent on a real height profile, with downhill acceleration, braking, jumps and obstacles; a separate scene follows both horizontal and vertical progress. Collisions return to a nearby checkpoint with temporary protection.
6. Naturaleza y escalada (7–9): climb a tree to its canopy, cross a zipline, then swing and jump between two vines. Up/W attaches or climbs; direction controls the swing and Space releases with momentum. Reaching the marked exit completes the chapter, including after ground recovery; traversal counters record optional achievements and never lock the exit. A lookout and recovery trees offer ways back up after falling. Wooden decks share their coordinates with collision surfaces; foreground trees and anchors remain fixed in world space.
7. Skate City (9–10): unlock skateboard, push, roll, ollie and ramps; avoid food enemies.
8. Level 10 — Fiesta: completion of the skate chapter triggers confetti and reveals access to the invitation, with configurable party details and RSVP. All seven chapters can also be selected or skipped; collectible stars are optional.

Ages are narrative ranges, not verified timestamps. Reorder once family approves actual memories.

## Enemy patterns
- Yogurt: patrol and occasional hop; mild projectile only after tutorial.
- Tomato: rolls toward player on flat ground and slopes.
- Red pepper: jumps across short gaps and dashes after telegraph.
All enemies are funny, not frightening. Collision returns player to nearby checkpoint; never game over.

## Player states
Baby: idle/crawl. Toddler: idle/walk/jump. Child: idle/run/jump/climb. Moto: idle/ride. Skater: idle/roll/push/ollie/land.

## Invitation data
Store in `src/data/invitation.json`: `{ "childDisplayName": "", "date": "", "time": "", "venue": "", "rsvpWhatsApp": "" }`. Do not commit actual phone number until user chooses publication. Include menu shortcut to invitation.

## Privacy
Do not commit original family photos or videos to a public repo. Derived stylized sprites may be published with family approval. Do not expose birthdate, full name, school or exact home route.
