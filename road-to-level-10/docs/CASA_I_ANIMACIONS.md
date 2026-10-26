# Casa, continuïtat i passes

## Canvis

- Hospital: els trams alternen l’orientació perquè les vores comparteixin els mateixos píxels, incloses les línies de paret i terra. La decoració continua fixada a les coordenades del món.
- Casa: parets blanques, parquet clar, sofà blanc i prestatgeria de cubs amb fusta clara. Es conserven els dos puzles d’empènyer i el gos. Després hi ha tres graons fixos de 8 píxels, un replà a y=146 i el llit a y=116, que cal grimpar. La mare espera al llit i abraça en Nel en completar el recorregut, amb la pausa final de 2,5 segons.
- Sprites: el registre selecciona la silueta connectada principal de cada cel·la, de manera que una punta de sabata o de cabell del fotograma veí no n’ampliï el retall. Les textures originals es conserven.
- Passes: dos fulls nous de vuit fases inclouen contacte, suport i pas del peu sota el cos. El segon nivell avança un fotograma cada 16 píxels caminats; el quart, cada 17. La distància a l’aire i els salts de posició per reintents no fan avançar el cicle. Les passes del personal sanitari segueixen la distància recorreguda i s’han alentit. Es respecta la preferència de moviment reduït.

## Recursos finals

Creats amb l’eina integrada `image_gen` (mode predeterminat). Es conserven els PNG i es publiquen còpies WebP optimitzades. Els sprites anteriors es fan servir com a referència visual; no es publiquen fotografies familiars originals.

- `assets/adventure/home-bedroom-v1.png` i `assets/adventure/home-bedroom-v1.webp`: llit amb la mare esperant, abraçada, prestatgeria i sofà.
- `assets/adventure/toddler-walk-v2.png` i `assets/adventure/toddler-walk-v2.webp`: vuit fases de caminar amb granota turquesa.
- `assets/adventure/hospital-walk-v2.png` i `assets/adventure/hospital-walk-v2.webp`: vuit fases de caminar amb samarreta clara de pingüí i pinya.

## Prompts exactes

### Casa i llit

```text
Use case: identity-preserve. New production pixel-art game atlas based on the TWO provided existing sprite reference images, NOT a mockup. Preserve the mother's dark shoulder-length hair, large tortoiseshell glasses and charcoal gray sweater, and Nel baby with sparse hair, cream outfit and striped sleeves. Exactly TWO columns by TWO rows, FOUR isolated sprites, actual transparent alpha background, generous margins and gutters. Upper left: side view of a low Scandinavian white bed with light oak legs, white duvet and pillows, mother reclined comfortably against pillows on RIGHT end, smiling and reaching LEFT inviting her baby to climb onto the mattress. Upper right: IDENTICAL bed, identical mother's scale and position, mother sitting against pillows hugging baby Nel in his cream striped outfit on her lap. Both upper cells contain whole bed, same dimensions, mattress top about 70% down the sprite, bed feet baseline same, headboard right, no overlap with neighbors. Bottom left: white cube-storage shelf with pale oak top, a few muted sage toys and books in cubbies, Scandinavian flat-pack minimalist furniture, side-on. Bottom right: low off-white sofa with oak feet, soft sage cushions, side-on. Warm crisp 16-bit pixel clusters, thin dark outlines and restrained shading matching existing sprite references. No wall, no floor, no background, no lettering, no logos, no grids. Full furniture silhouettes and all bed legs visible. No hospital, no medical equipment.
```

### Correcció del llit d’espera

```text
Use case: precise-object-edit. Edit ONLY the upper-left cell of this 2x2 transparent pixel-art atlas: REMOVE THE BABY who is crawling on the left side of the duvet in the upper-left bed scene. Reconstruct the empty white duvet seamlessly where the baby was. Leave the mother smiling and reaching left, waiting for her baby, alone in the upper-left bed. Preserve all other pixels, furniture, cell layout, bed positions, exact sizes, mother's identity and style. Upper-right mother hugging baby MUST remain unchanged. Bottom two furniture cells unchanged. Keep actual transparent alpha background. No extra character in upper-left, no text or artifacts.
```

### Passes del segon nivell

```text
Use case: identity-preserve. Production transparent pixel-art WALK CYCLE sprite sheet. Use the provided sprite reference ONLY for the character identity, clothes, proportions and crisp shaded 16-bit style. Exactly FOUR columns by TWO rows, EIGHT equal cells with very generous transparent gutters and no touching. Eight sequential phases of ONE natural relaxed side-view walking cycle facing RIGHT: 1 left foot forward heel contact, 2 left weight-bearing lowered body, 3 right foot passing under hip with narrow stance, 4 right heel rising forward, 5 right foot forward contact, 6 right weight-bearing lowered body, 7 left foot passing under hip narrow stance, 8 left heel rising forward. Arms counter-swing with opposite leg. Make BOTH the narrow passing poses and opposite-foot forward poses clearly distinct. NOT eight variations of the same wide running pose. No jumping or running. Same face/hair/clothes and head diameter, hip anchor horizontally centred in every cell, same ground baseline and nearly identical height with only 1-2 pixel body bob. Whole child, full shoes, no clipping. Actual transparent alpha background, NO colored glow, NO background matte, NO shadows, NO particles, NO labels or grid. Character: toddler Nel with short swept light brown hair, white patterned short-sleeve T-shirt, turquoise short overalls with straps and pale beige shoes. Maintain photo-inspired original appearance.
```

### Passes del quart nivell

```text
Use case: identity-preserve. Production transparent pixel-art WALK CYCLE sprite sheet. Use the provided sprite reference ONLY for the character identity, clothes, proportions and crisp shaded 16-bit style. Exactly FOUR columns by TWO rows, EIGHT equal cells with very generous transparent gutters and no touching. Eight sequential phases of ONE natural relaxed side-view walking cycle facing RIGHT: 1 left foot forward heel contact, 2 left weight-bearing lowered body, 3 right foot passing under hip with narrow stance, 4 right heel rising forward, 5 right foot forward contact, 6 right weight-bearing lowered body, 7 left foot passing under hip narrow stance, 8 left heel rising forward. Arms counter-swing with opposite leg. Make BOTH the narrow passing poses and opposite-foot forward poses clearly distinct. NOT eight variations of the same wide running pose. No jumping or running. Same face/hair/clothes and head diameter, hip anchor horizontally centred in every cell, same ground baseline and nearly identical height with only 1-2 pixel body bob. Whole child, full shoes, no clipping. Actual transparent alpha background, NO colored glow, NO background matte, NO shadows, NO particles, NO labels or grid. Character: preschool Nel with medium wavy brown hair and curled fringe, light aqua T-shirt with small penguin and pineapple motif, turquoise shorts, dark navy sneakers with pale soles. Only Nel, no hospital staff or furniture.
```

