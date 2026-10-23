# Mare i gos: revisió de la fotografia

S’ha utilitzat l’eina integrada `image_gen`, amb la fotografia familiar com a referència visual. Els nous sprites substitueixen la versió anterior que no s’assemblava prou a la mare. La foto original no s’ha copiat al repositori.

- Original generat: `assets/adventure/family-nel-v2.png`.
- Recurs carregat pel joc: `assets/adventure/family-nel-v2.webp`.
- Mare: cabells foscos ondulats, ulleres grans, jersei gris amb punys blancs i pantalons negres; asseguda de genolls, amb els braços oberts o abraçant en Nel.
- Gos: pelatge marró, musell fosc, pit blanc, collar gris i xapa rosa; estirat amb el cap alt o descansant.
- El gos continua al camí del primer capítol, entre la primera plataforma i el segon conjunt de blocs. Cal grimpar-hi i travessar-lo per poder arribar fins a la mare.
- El nom versionat del recurs evita reutilitzar la imatge anterior de la memòria cau. Les regions dels quatre sprites es registren a `src/adventure-art.ts`.

## Prompt exacte

```text
Use case: stylized-concept. Create replacement game pixel art sprite sheet based faithfully on the USER'S REAL FAMILY PHOTO visible in conversation: smiling seated woman with shoulder-length almost black wavy hair, prominent large translucent brown/tortoiseshell rounded-square eyeglasses, charcoal gray oversized knit sweater over white cuffs, black pants; beside her a medium brown short-haired dog with floppy folded ears, black muzzle, white chest patch, gray reflective collar with small pink tag. The reference is the actual indoor PHOTO of woman and dog, not any existing game screenshots or mockups. Preserve these identifying visual characteristics strongly. The mother should look like this adult woman, not a generic younger girl. Production 16-bit SNES pixel art, crisp square pixel clusters, dark outlines, limited palette, no smooth vector gradients, matches cute child game sprites. Transparent sprite sheet exactly 2 columns and 2 rows with broad transparent gutters; each pose centered wholly inside its equal quadrant and no overlap. TOP LEFT: mother crouching/seated on knees on floor in three-quarter view facing left, warm smile, open arms welcoming crawling toddler (no toddler in this cell), adult proportions. TOP RIGHT: same mother crouching hugging small brown curly-haired toddler wearing white shirt and blue overalls, both visible whole. BOTTOM LEFT: same dog lying on belly SIDE VIEW facing right, head raised and alert, full body, all paws/tail visible, readable reflective collar, black muzzle, white chest. BOTTOM RIGHT: identical side-view lying dog relaxed with head down but eyes open; maintain body silhouette and scale. Dog must clearly resemble the photographed brown mixed-breed, not a fluffy golden retriever. No floor, no scenery, no lettering, no labels, no shadows beyond pixel contour, no grid lines. Actual transparent alpha background. All four isolated sprites fully visible.
```
