# Road to Level 10 — Game Design Document

Current implementation: the child is Nel and all player-facing text is Catalan. The first chapter uses personalized mother and dog pixel art derived from the supplied photograph; Nel must climb over the resting dog without jumping before reaching his mother. See `FAMILIA_NEL_CA.md`. This supersedes the earlier generic mother description below.

## Purpose
A shareable WhatsApp birthday invitation disguised as a short nostalgic pixel-art platform game. Target: 3–5 minutes; children and adults on mobile.

## Level outline (provisional; user approves each scene)
1. Casa (0–1): crawl through a white-walled home with Scandinavian white/oak furniture, push blocks into steps and climb over the dog. After the two push puzzles, climb three fixed steps to the bedroom landing, then climb the bed to reach mother. Photo-inspired mother sprites wait and hug Nel in the same bed, with a 2.5-second pause before results. Baby cannot jump. Space plus direction pushes; up/W pulls onto a ledge. See `CASA_I_ANIMACIONS.md`.
2. Casa i jardí (1–2): first steps and jumps in a detailed garden, avoiding yogurt and tomato enemies per the latest user request, then finding the toy motorcycle.
3. Cap a l’escola bressol (2–4): rear-view riding based on the supplied promenade photograph. Nel wears a teal jacket and gray trousers; pale plane trees, grates, stone walls and hedges surround gray paving. Road arrows are the only power-ups (1.8-second turbo). Leaves slow the bike; pedestrians with children cause a fall and require Space/touch to stand up; dog poop causes a 1.6-second spin with automatic recovery and preserved progress. See `MOTO_PASSEIG.md` for asset prompts and state transitions.
4. Hospital (4–6): Nel visits his newborn brother, avoiding masked doctors and nurses in a Covid-era maternity corridor. Photo-derived sprites show his aqua penguin T-shirt and turquoise shorts. The final meeting with mother and baby remains visible for 2.5 seconds before results. See `HOSPITAL_NEL.md`.
5. Neu (6–7): photo-inspired blue jacket, navy/yellow helmet and yellow snowboard; downhill acceleration, braking and jumps to avoid moving pedestrians and sleds. Detailed mountain panorama. Collisions retry near the obstacle with temporary protection.
6. Bosc (7–9): photo-inspired harness and blue-gray jacket; animated tree climbing without a painted rope, zipline across a river with no ground underneath, then swing and jump between vines. Falling returns to dry banks. The river makes the zipline necessary; later ground recovery still permits reaching the exit. Foreground trunks, cables and platforms share world-space anchors.
7. Skatepark (9–10): red helmet, pads and teal shoes from the photos. Four curved quarter pipes share the exact visible and physical surface; roll, push, brake, ollie, take off from the lips and land, avoiding food enemies. See `NEU_BOSC_SKATEPARK.md` for assets and prompts.
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
