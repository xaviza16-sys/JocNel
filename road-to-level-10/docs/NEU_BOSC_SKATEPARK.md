# Neu, bosc i skatepark: art i recorreguts

Nous recursos generats amb l’eina integrada `image_gen` en mode predeterminat. Les fotos aportades serveixen de guia visual: casc blau/groc, jaqueta blava i taula groga per a la neu; arnès multicolor i roba blau-grisa del parc d’aventura; casc vermell, proteccions i sabates turquesa al skatepark. El prompt de neu descriu els detalls observats a les fotos; els fulls de bosc i skate utilitzen les últimes cinc fotografies com a referència. Les fotografies originals no s’incorporen al repositori.

## Mecàniques i coherència

- Primer nivell: coixins verd sàlvia i crema, a joc amb els mobles blancs i la fusta clara. Mateixes dimensions i puzles.
- Segon nivell: fons nou del jardí i enemics iogurt i tomàquet. Aquesta petició explícita substitueix la restricció inicial d’edat per a aquest capítol; el nadó continua sense enemics.
- Neu: vuit poses noves amb taula groga i casc blau/groc, muntanyes i pins; persones adultes, infants i trineus es mouen lleugerament per la pista. Cal saltar per esquivar-los. Els xocs retornen a un punt proper segur amb protecció breu, evitant bucles de reintents des d’un punt massa llunyà.
- Bosc: caminar, quatre poses de grimpar amb braços i genolls alternats, dues de tirolina i dues de liana. Cap corda pintada en els sprites de grimpar; el joc dibuixa els cables i les lianes separadament. El riu entre x=390 i x=720 no té terra de col·lisió. La separació entre vores és superior a l’abast del salt normal: cal pujar a l’arbre i travessar amb la tirolina. Els punts desats són en terra ferma. Una caiguda permet tornar-ho a provar i mostra una pista.
- Skatepark: escena pròpia amb quatre quarters corbats, casc vermell i proteccions de les fotos. La superfície visible i el moviment comparteixen la funció `skateGround`. Frenada, impuls, ollies, sortida aèria dels quarters, aterratge i reintents. Es manté l’accés a la invitació en acabar.
- Jardí, bosc i skatepark repeteixen els fons alternant l’orientació per fer coincidir les vores. L’hospital i la moto conserven els seus recursos actuals.

## Recursos finals

Es conserven els PNG originals generats i el joc carrega les còpies WebP optimitzades:

- `assets/adventure/nel-snow-v2.png` i `assets/adventure/nel-snow-v2.webp`.
- `assets/adventure/nel-nature-v2.png` i `assets/adventure/nel-nature-v2.webp`.
- `assets/adventure/nel-skate-v2.png` i `assets/adventure/nel-skate-v2.webp`.
- `assets/adventure/garden-v2.png` i `assets/adventure/garden-v2.webp`.
- `assets/adventure/forest-v2.png` i `assets/adventure/forest-v2.webp`.
- `assets/adventure/mountain-v2.png` i `assets/adventure/mountain-v2.webp`.
- `assets/adventure/skatepark-v2.png` i `assets/adventure/skatepark-v2.webp`.
- `assets/adventure/home-cushions-v2.png` i `assets/adventure/home-cushions-v2.webp`.
- `assets/adventure/forest-trunk-v2.png` i `assets/adventure/forest-trunk-v2.webp`.

La càrrega i els retalls són a `src/outdoor-art.ts`. Els límits mesurats del full de neu eviten incloure fragments dels vianants en les poses de la taula. Els sprites anteriors es conserven.

## Prompts exactes

### nel-snow-v2

```text
Use case: stylized-concept. Production transparent pixel-art sprite sheet for a warm crisp 16-bit family game. Character visual specification observed from family photos: young child Nel with shoulder-length wavy brown hair under DARK NAVY snow helmet with YELLOW side panels, large gray strap goggles with amber yellow lenses resting over helmet/front forehead, vivid COBALT BLUE hooded ski jacket, charcoal gray snow trousers, dark gloves and boots, YELLOW snowboard with black bindings. Exactly FOUR columns by THREE rows = TWELVE isolated equal cells, generous transparent gutters, consistent character scale, full board and full body. Row 1: four flowing side-view riding/carving poses facing right with knees slightly bent and arms balancing. Row 2: takeoff crouch, compact aerial with board beneath boots, soft bent-knee landing, relaxed ride. Row 3: bundled adult pedestrian in orange winter coat and hat, smaller child pedestrian in purple snowsuit and helmet, person seated on RED wooden sled facing right, empty red sled facing right. Friendly obstacle figures, no collisions or injury. Genuine transparent alpha background, no matte, no mountain scenery, no floor, no lettering or brands, no labels or grids, no glow. Match hand-pixelled outlined 16-bit look, limited palette.
```

### nel-nature-v2

```text
Use case: stylized-concept. Production transparent pixel-art sprite sheet, warm crisp 16-bit family game. Use the three forest adventure PHOTOGRAPHS among the supplied references for Nel: shoulder-length wavy brown hair tied loosely back, blue-gray dinosaur/camouflage jacket, dark trousers with pale line pattern, gray/red boots, colorful yellow/red climbing harness and turquoise carabiner. Exactly FOUR columns by THREE rows, TWELVE isolated equal cells, full body, generous clear gutters, consistent head size and feet baseline. Row 1 four side-view walking poses right. Row 2 four TREE CLIMBING poses facing right, alternating arms and knees gripping an imagined broad tree trunk: open hands held close to body and knees bent, NO rope, NO cable, NO tree painted into sprite, no floating rope tips. Row 3: two zipline hanging poses with hands together overhead holding ONLY a small pulley handle, two vine-hanging swing poses with hands together above head holding ONLY a short handle. Do not paint any long ropes, the game draws cables separately. Preserve harness across all poses. NO background, no scenery, no writing, no labels, no shadows. Genuine transparent alpha, not a colored matte.
```

### nel-skate-v2

```text
Use case: stylized-concept. Production transparent pixel-art sprite sheet for a warm crisp 16-bit game, use the SKATEPARK PHOTOGRAPHS among supplied references to represent Nel: long wavy dark brown hair, RED vented skate helmet, muted green/teal T-shirt, blue-gray shorts, black elbow pads and knee pads, mint teal trainers, dark skateboard with pale wheels. Exactly FOUR columns by TWO rows = EIGHT distinct isolated full-body poses, generous transparent gutters, identical proportions. Row 1: neutral rolling crouch facing right, pushing off with rear foot, compressed knees pumping a ramp, riding up a quarter-pipe with board angled 45 degrees upward. Row 2: airborne ollie compact with board attached under shoes, quarter-pipe aerial with board diagonally underneath, landing bent knees with board flat, happy balanced rolling arms open. These must all be SAME child and equipment, no adult, no inline skates, no snowboard. No quarter-pipe inside sprite, game draws terrain. Genuine alpha transparent background, no colored glow, no shadows, no grid, no labels, no writing.
```

### garden-v2

```text
Use case: stylized-concept. Welcoming white-walled Scandinavian family house and garden, pale oak fence, white-framed glazed back door, fruit trees, terracotta pots, flowers, hedges and sunlit grass, calm warm afternoon, detailed crisp 16-bit pixel art. Side-view orthographic platform-game backdrop, flat floor line at 85% image height, no perspective vanishing point. Foreground open for gameplay, no people or enemies. Consistent left and right wall/grass colors and heights for horizontal repetition, no cut-off major objects at edges. No writing, brands or logos.
```

### forest-v2

```text
Use case: stylized-concept. Woodland adventure park with tall textured pine and oak trunks, dappled light through dense green canopy, distant wooden tree platforms and faint safety structures only in background, lush ferns, moss and a turquoise stream along bottom edge. Warm detailed crisp 16-bit pixel art. Side-view orthographic platform-game backdrop with layers of trunks and foliage, open clear central gameplay space, no people, no painted rope crossing the foreground, no huge opaque trunk at image edges. Consistent left and right ground and canopy for horizontal repetition. No writing or logos.
```

### mountain-v2

```text
Use case: stylized-concept. Alpine snow resort inspired by family photos: dense dark evergreen pine woods on both sides of a snowy ski slope, distant layered blue Pyrenees mountains and soft wintry clouds, bright white snow with pale blue shadows, a few distant muted red safety fences. Rich crisp outlined 16-bit pixel art, warm family game style. Landscape side-view mountain panorama for a horizontally moving downhill snowboard game, wide open central sky and distant snowfield, no people, no snowboarders, no text or brands.
```

### skatepark-v2

```text
Use case: stylized-concept. Outdoor municipal skatepark inspired by family photos: sunlit pale concrete, faded turquoise paint, low rear graffiti wall with ABSTRACT colored shapes (no letters), black metal safety railing, leafy green trees, distant warm apartment buildings, blue sky. Detailed crisp outlined 16-bit pixel art, warm family game style. Strict SIDE-VIEW orthographic platform-game backdrop, no vanishing-point bowl. Quarter pipes and bowls only as small distant silhouettes behind rear fence, keep foreground completely clear for a game-drawn curved riding surface. No people, no writing, no brands or logos. Consistent edges for horizontal repetition.
```

### home-cushions-v2

```text
Use case: stylized-concept. Production game sprite atlas, exactly TWO isolated cells side by side, generous transparent gutters. Left one low soft square floor cushion in muted sage green and warm cream, subtle stitched piping and fabric shading. Right a taller narrow stack of TWO matching soft floor cushions, one sage and one off-white, with soft square corners, naturally stacked vertically. Scandinavian cozy white/oak home style, beautifully shaded crisp 16-bit pixel art with thin subdued dark outlines, no bright blue or yellow. Strict side view, flat baseline. Actual transparent alpha, NO shadows beyond the cushions, no room, no floor, no text, no labels or grid.
```

### forest-trunk-v2

```text
Use case: stylized-concept. Production foreground sprite for a crisp detailed 16-bit forest climbing game. ONE tall straight mature pine/oak tree TRUNK with richly shaded brown-gray bark, moss patches, a few short knotted side branches and a SMALL fringe of green foliage only at the very top. Wide gripping trunk center, roots at baseline, no gigantic round canopy. Inspired by a woodland tree adventure park with natural bark. Full tree trunk isolated, portrait composition, clearly readable climbable bark, warm woodland sunlight and fine pixel clusters matching richly textured forest game background. Genuine transparent alpha background, generous margin, no rope, no ladder, no harness, no people, no cables, no text, no forest backdrop, no cast shadow.
```

