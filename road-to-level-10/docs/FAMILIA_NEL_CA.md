# La família d’en Nel i el joc en català

La mare i el gos s’han revisat després de la correcció de l’usuari. El joc carrega ara `family-nel-v2.webp`; vegeu els recursos actuals i el prompt a `FAMILIA_NEL_V2.md`. Les referències v1 següents es conserven com a historial.

Tots els textos de la interfície, les instruccions, els nivells, els avisos dins del llenç, l’accessibilitat, la invitació i el missatge de confirmació són en català. La pàgina declara `lang="ca"` i el nom configurat és Nel.

## Recursos

- `assets/adventure/family-nel-v1.png`: full font de quatre il·lustracions generades amb l’eina integrada `image_gen` a partir de la fotografia aportada per l’usuari.
- `assets/adventure/family-nel-v1.webp`: còpia optimitzada que carrega el joc.
- Poses: mare esperant, abraçada amb en Nel, gos estirat despert i gos descansant.
- La mare conserva els cabells molt foscos i ondulats, les ulleres, el somriure i el jersei gris. El gos conserva el pelatge marró, el musell fosc, la petita taca blanca al pit i el collar.
- `src/adventure-art.ts` registra les regions del full; no es modifica la foto ni s’utilitza com a fons.

La fotografia original no s’ha copiat al repositori. S’hi desen les il·lustracions derivades sol·licitades; són una interpretació pixelada i no una reproducció fotogràfica exacta.

## Interacció amb el gos

El gos descansa al camí del primer capítol. El seu cos té una superfície de col·lisió baixa i independent del dibuix. En Nel ha de grimpar-hi i passar per damunt seu, sense saltar ni atacar. El capítol només es pot completar després d’haver travessat el gos. Hi ha espai abans del bloc següent perquè sigui fàcil tornar a empènyer.

## Prompt de generació

El prompt següent es conserva literalment per poder reproduir el recurs; no és text que aparegui al joc.

Use case: identity-preserve / stylized-concept. Create NEW production pixel-art game sprites from the user's attached reference PHOTO of the mother and dog. Preserve recognizable visual features, with kind expressive 16-bit pixel art consistent with our warm game. True transparent PNG, SQUARE sheet with exactly TWO columns by TWO rows of equal cells. Four fully isolated assets, confined to central76% of each cell, clear transparent margins, no text or labels or borders, no background, no floor, no furniture, no bowl, no candle, no photo recreation. TOP LEFT: the reference mother, kneeling, turned toward LEFT with arms open to welcome her toddler. Her likeness: long very dark brown / black wavy hair, side swept fringe, large rounded rectangular dark/tortoiseshell glasses, warm smile, charcoal gray sweater, black pants, a little white cuff and wristwatch. TOP RIGHT: the same mother gently hugging a curly brown-haired toddler Nel in white diaper and blue bib. Same hair/glasses/clothing. BOTTOM LEFT: the reference medium-sized BROWN DOG with darker black muzzle and shading around eyes, soft floppy ears, warm brown eyes, small white chest patch, wide gray collar, lying comfortably in SIDE VIEW facing RIGHT with head raised, friendly and calm, a low horizontal silhouette with back almost level so a crawling baby can climb over him in the game. BOTTOM RIGHT: the SAME dog in the SAME lying silhouette, head resting lower, eyes half closed, subtle resting animation. Dog is healthy and happy, no baby stepping on him in the sprite, no injury. All sprites have their bottom at85% of their cell height. The mother is a gentle pixel-art likeness of the supplied person, not a generic brown-haired mother: glasses and dark wavy hair are essential. Crisp pixel clusters and rich shading, not photorealistic, not blurry painted illustration, no ground shadows outside sprite. Exact equal 2x2 grid is essential for slicing.
