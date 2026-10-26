# Hospital i mida de la moto

El tercer nivell dibuixa el conjunt d’en Nel i la moto al 60% de la mida anterior (52,8 píxels en lloc de 88), també durant caigudes i patinades. La lògica dels carrils no canvia.

El quart nivell és «Coneixem el germanet!»: un hospital en època covid. En Nel, amb els cabells ondulats, samarreta clara amb pingüí i pinya i pantalons turquesa de la fotografia, esquiva metges i infermeres amb mascareta. Les col·lisions tornen al punt desat amb protecció temporal i intents il·limitats. Al final troba la mama amb el nounat; la trobada queda visible 2,5 segons abans dels resultats. L’identificador intern `school` es conserva per mantenir compatibles els progressos desats, però el mode i tots els textos són d’hospital.

## Recursos finals

Generats amb l’eina integrada `image_gen`, en mode predeterminat, a partir de les fotos familiars com a referència. Les fotografies originals no es publiquen.

- `assets/adventure/hospital-family-v1.png`: full de setze sprites transparent; vuit poses d’en Nel, quatre de personal sanitari i quatre elements de l’hospital, inclosa la mama amb el nadó.
- `assets/adventure/hospital-family-v1.webp`: còpia optimitzada consumida pel joc.
- `assets/adventure/hospital-corridor-v1.png`: decorat lateral del passadís.
- `assets/adventure/hospital-corridor-v1.webp`: còpia optimitzada consumida pel joc.

## Prompt dels sprites

```text
Use case: stylized-concept. Production transparent pixel-art sprite atlas for a warm 16-bit family platform game. Use the TWO NEW USER PHOTOGRAPHS as references: second photo for Nel, a preschool boy with medium wavy brown hair and central curl, light aqua T-shirt with a small penguin/pineapple motif, turquoise shorts and dark sneakers. First photo for mother with dark hair and large tortoiseshell glasses, black sleeveless top, and tiny newborn in white pastel-pattern pajamas. Exactly FOUR columns by FOUR rows, sixteen separated equal cells. Row 1: four full-body side-view Nel walking poses facing right. Row 2: Nel idle, Nel jumping, Nel landing, Nel joyful waving, all same size. Row 3: two side-view walking doctor poses wearing white coats, trousers, blue surgical masks, then two walking nurse poses teal scrubs and blue surgical masks. Healthcare workers calm and friendly, Covid-era PPE, no threatening features. Row 4: standalone hospital bed with mother seated holding newborn (photo likeness, small baby), second mother-and-newborn bed pose mother smiling, then a hospital door with small window, then medical trolley with supplies. Characters full body and clean silhouettes; all feet aligned, generous transparent gutters, NO overlap between cells, no text or letters anywhere. Crisp pixel clusters dark thin outline and carefully shaded limited warm palette. Actual transparent alpha background; no grid lines, no labels, no photo, no surrounding scene. The mother-and-baby should remain recognisable with glasses, dark hair and pastel baby clothes.
```

## Prompt del decorat

```text
Use case: stylized-concept. Game background asset, warm detailed crisp 16-bit pixel-art hospital maternity corridor during Covid era. Wide side-view orthographic platform game scene, straight flat horizontal floor at bottom 20%, pale cream and mint walls, blue doors with small glass windows, wall handrails, disinfectant dispensers and mask pictogram signs with NO LETTERS, ceiling rectangular soft lights, a window with daylight, a bench and a potted plant at edges. NO people, no characters, no medical drama, no text, no logos. Welcoming calm maternity hospital interior. Side-on flat wall perspective, not a vanishing-point corridor, seamless left and right edges so corridor can be repeated horizontally. Floor continuous, uncluttered playable foreground. Limited pastel palette with warm outlined pixel clusters and fine decorative detail. Landscape ratio 16:9, opaque background.
```

