# Les primeres passes: en Nel i la moto

Recursos creats amb l’eina integrada `image_gen`. La fotografia del nen amb granota turquesa és la referència del protagonista; els sprites existents de la moto són la referència del vehicle. La fotografia original no es copia al repositori.

## Fitxers finals

- `assets/adventure/toddler-nel-v1.png`: original del full de 24 poses.
- `assets/adventure/toddler-nel-v1.webp`: còpia optimitzada que carrega el joc.
- `assets/adventure/toy-moto-parked-v1.png`: nova vista lateral de la mateixa moto de joguina, aparcada i sense conductor.
- `assets/adventure/toy-moto-parked-v1.webp`: còpia optimitzada que carrega el joc.

El protagonista conserva els cabells castanys amb serrell lateral, la samarreta clara de màniga curta i la granota curta turquesa de ratlles fines. El calçat clar és una adaptació per completar el cos del sprite; la foto no en mostra els peus. La moto conserva el cos blau, el cercle vermell, el manillar gris amb punys vermells i les rodes negres amb centres grisos dels recursos anteriors.

## Animacions i transició

Vuit fotogrames de caminar sincronitzats amb la distància, vuit poses de salt i aterratge, quatre de repòs i quatre de descoberta. El salt segueix la velocitat vertical i la fase de caiguda, amb una breu recuperació en aterrar. Totes les poses comparteixen escala i línia de terra; els controls i les col·lisions continuen independents del dibuix.

Al final del segon capítol, la moto substitueix l’osset. En Nel s’atura al seu costat i la descobreix amb sorpresa, assenyalant-la i aplaudint. La seqüència es veu sense panells durant 2,5 segons. Després apareix «Següent: Cap a l’escola bressol!», que inicia la cursa del tercer nivell. Amb moviment reduït es manté una posa fixa de descoberta.

Les regions mesurades del full es registren a `src/adventure-art.ts`; `src/toddler-animation.ts` tria les poses i `src/platform-scene.ts` les mostra.

## Prompt del protagonista

```text
Use case: stylized-concept. Production 16-bit pixel art animation sheet for a side-scrolling toddler game. The MOST RECENT USER PHOTO of the little boy with turquoise dungarees is the exact IDENTITY AND CLOTHING reference. Draw ONLY this toddler Nel, around 1-2 years: round fair face, large dark eyes, straight soft light brown hair with longer wispy side-swept fringe (not curls), WHITE SHORT-SLEEVE shirt with tiny pale gray line drawings, bright TURQUOISE/TEAL short dungarees with fine vertical white pinstripes, wide shoulder straps and silver buttons, front bib pocket, shorts ending above knees, bare lower legs, small cream toddler shoes. Preserve these clothing details and recognizable hairstyle throughout. Crisp pixel clusters, dark outlines, warm shaded expressive 16-bit SNES game style, no vector smoothing. STRICT 4 COLUMNS by 6 ROWS =24 isolated full-body frames. Portrait 2:3 canvas. All frames same square cell size with substantial transparent gutters, baseline 90% cell height; identical head diameter, body scale, camera, costume and lighting. Every sprite SIDE VIEW facing RIGHT. No props, chair, sofa, ball or scenery. Rows1 and2: EIGHT sequential in-place natural toddler WALK frames in reading order, gentle unsteady first steps, alternating heel/toe contact, bent knees, short stride, arms out slightly for balance, subtle head and torso bob, seamless last-to-first. Rows3 and4: EIGHT sequential jump poses in reading order: crouch anticipation, push off, rising with bent knees, extending upward, apex with lifted arms, descending with legs prepared, soft bent-knee landing, recovery upright. Keep the feet at baseline in each local pose; the game supplies world translation. Row5: FOUR upright idle breathing / blink poses with slight head and hand movement, no walking. Row6: FOUR discovery gestures: notices toy motorcycle at right, turns gaze and raises hand, delighted pointing right, happy little clap with hands together at chest. No motorcycle drawn in these cells. Whole body within every cell, no overlap. Transparent alpha background. No ground, no shadows outside silhouette, no words, labels, cell lines, hats, helmets, curly hair, long trousers or blue jeans. The TURQUOISE PINSTRIPED SHORT OVERALLS and short sleeves must stay consistent.
```

## Prompt de la moto aparcada

```text
Use case: stylized-concept. ONE isolated pixel-art sprite of the SAME BLUE AND RED TOY RIDE-ON MOTORCYCLE shown in the supplied two game sprite references. First reference rear rider sprite sheet establishes the richly shaded 16-bit style, plastic blue body, red body/handle accents and thick black toy wheels. Second reference is the existing simple side-view toy motorcycle, establishing the key side silhouette and red circular center. Render the motorcycle ALONE PARKED, no child or rider, precise SIDE VIEW facing RIGHT, whole toy visible. Recognizable chunky blue molded plastic curved saddle and body, large red circular central side detail, gray T-shaped steering stem with RED cylindrical handgrips, very wide low black plastic tires with pale gray wheel hubs, gray small fork, front wheel to right. Toddler foot-powered ride-on toy, not a motorbike with engine, not bicycle, not tricycle. Match warm detailed SNES pixel art sprite shading and dark outline, crisp square pixel clusters. Compact low proportions sized for 1-3 year old child. Actual transparent background, generous transparent margins, no ground, no shadows outside silhouette, no text, no kickstand, no people, no scenery, no labels. This is a new parked side-view variant of the existing toy, preserve blue/red/gray/black identity.
```
