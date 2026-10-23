# En Nel nadó: referència familiar i animacions

Recursos generats amb l’eina integrada `image_gen`, utilitzant la fotografia del nadó amb el gos al sofà com a referència d’identitat i vestuari. La fotografia original no es copia al repositori.

## Fitxers

- `assets/adventure/baby-nel-v1.png`: original de 24 poses en quatre columnes i sis files.
- `assets/adventure/baby-nel-v1.webp`: versió optimitzada que carrega el joc.
- `assets/adventure/baby-nel-hug-v1.png`: abraçada amb la mare i el mateix nadó.
- `assets/adventure/baby-nel-hug-v1.webp`: versió optimitzada de l’abraçada.

El nadó té els cabells molt curts, la cara rodona, un conjunt clar amb peus coberts i mànigues ratllades. Les il·lustracions són una interpretació pixelada de la fotografia.

## Moviment

- Vuit fotogrames de gateig, sincronitzats amb la distància real recorreguda. Si un obstacle el frena, torna al repòs.
- Vuit poses de grimpada, sincronitzades amb el progrés de la interacció i sense repetir el cicle a mig obstacle.
- Quatre poses d’empènyer i quatre de repòs, amb respiració i parpelleig.
- La mateixa escala i línia de terra per a totes les poses, mitjançant els marges d’un atlas de Phaser. No s’estira cada postura a una alçada diferent.
- La direcció es conserva quan deixa de moure’s. Amb moviment reduït s’utilitzen poses fixes.
- Les col·lisions, els controls, la durada de la grimpada i els puzles mantenen el funcionament anterior.

Les regions del full s’han mesurat perquè els fulls generats no garanteixen una graella exacta. Les poses es retallen i s’alineen durant la càrrega a `src/adventure-art.ts`. `src/baby-animation.ts` controla els fotogrames i `src/platform-scene.ts` els mostra.

## Prompt del full de 24 poses

```text
Use case: stylized-concept. Production animation sprite sheet for a side scrolling 16-bit pixel art game. Use ONLY the newest USER PHOTO of an infant sitting beside a brown dog on a gray sofa as the IDENTITY AND CLOTHING reference. Subject ONLY the infant Nel: a very young baby, round face, large dark eyes, sparse VERY SHORT dark brown hair close to scalp (NOT curly hair, NOT a toddler), cream/light oatmeal sleeveless footed romper over a long sleeved white shirt with thin dark horizontal stripes on sleeves, cream covered feet. Subtle pale gray chest motif without legible text. Preserve this baby's proportions and recognizable clothing. Dog and sofa excluded. Warm detailed crisp pixel art with dark outlines, square pixel clusters, limited palette, no photographic shading. STRICTLY 4 EQUAL COLUMNS by 6 EQUAL ROWS = 24 frames in reading order. Portrait 2:3 canvas. Each cell same square size, transparent gutters, no labels or lines. All frames side view FACING RIGHT. Consistent head diameter, body scale, anatomy, clothing, camera and light across ALL frames. Ground baseline at 90% cell height in EVERY cell; do NOT enlarge the crawling baby to fill cell. Crawl body low, climbing upright naturally taller while head retains identical size. Leave clear empty margins. Rows 1 and 2: EIGHT sequential frames of one seamless realistic hands-and-knees crawling cycle, alternate right hand / left knee then left hand / right knee, gradual reach, planted palm weight transfer, knees tuck and extend, head with gentle bob, small torso/hip shifts, last pose leads naturally to first. Rows 3 and 4: EIGHT sequential frames of a baby climbing a LOW ledge by pulling up, not jumping: 1 crouched reach forward/up; 2 both palms brace above; 3 pull chest toward hands; 4 bend elbows and lift torso; 5 lift near knee; 6 knee planted and weight shifting forward; 7 bring trailing leg; 8 low crawl stance recovered. NO ledge or prop drawn, hands interact with imaginary ledge to right. These are local in-place anatomical poses; game handles world translation. Row 5: FOUR frames of baby pushing a block on hands/knees, palms braced forward, shifting shoulders and knees, no block drawn. Row 6: FOUR low resting crawl-ready poses with small breathing and head/blink changes, same baby and baseline. Transparent alpha background, NO ground, NO cast shadow, NO dust, NO text, NO extra people, NO standing walking baby, NO blue clothes, NO long or curly hair. Keep 24 clearly separated full-body sprites wholly inside their uniform cells.
```

## Prompt de l’abraçada

```text
Use case: identity-preserve. Create ONE isolated transparent 16-bit pixel-art sprite for the game's final mother-and-baby hug. Reference roles: the MOST RECENT mother/dog sprite sheet is the mother appearance and drawing style reference; its top-right hugging pose is the pose reference. The latest real PHOTO of a baby beside a dog and the 24-frame cream-clothed infant sprite sheet are the BABY identity/clothing references. Preserve the mother exactly: adult woman with almost-black shoulder-length wavy hair, large tortoiseshell rounded-square glasses, gray charcoal knit sweater, white cuffs and black pants, kneeling in a warm hug facing LEFT. Replace ONLY the curly-haired older blue-overall toddler with infant Nel from the new reference: round face, very short sparse close-cropped dark-brown hair, white/cream footed romper over white long sleeved shirt with thin dark horizontal stripes, small infant body. Mother holds baby safely against chest, both smiling, her arm supports the baby's back and bottom, infant's hand touches her shoulder. Crisp pixel clusters and dark outlines, match supplied mother's sprite proportions and palette, cute expressive 16-bit game art. One full-body mother plus baby together centered, no dog, no extra characters, no additional poses, no words, no floor, no background, no shadows outside outline. Actual transparent alpha. Baby must wear cream striped-sleeve clothing, NOT blue overalls, and have VERY SHORT HAIR, NOT curls.
```
