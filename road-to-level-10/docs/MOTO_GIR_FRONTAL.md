# Gir de la moto: referència frontal

La nova fotografia frontal aportada per l’usuari s’utilitza per corregir la cara, els cabells, el vestuari i la geometria de la moto de les vistes de patinada. La foto original no s’ha copiat al repositori.

## Recursos finals

- `assets/race/nel-moto-spin-v2.png`: full original de vuit direccions, generat amb l’eina integrada `image_gen`.
- `assets/race/nel-moto-spin-v2.webp`: còpia optimitzada que carrega el joc.
- `src/race-art.ts`: selecciona la versió nova i registra les vuit poses alineades.

S’han ajustat el serrell curt, la samarreta fosca sota la jaqueta turquesa, els pantalons grisos, el calçat clar, el manillar gris, el frontal blau, les peces circulars vermelles i els discos grisos de les rodes. Les vistes continuen ordenades de darrere cap a davant i novament darrere. La mecànica de patinar i recuperar el control conserva la durada de 1,6 segons i les dues voltes. És una interpretació pixelada de la referència, no una reproducció fotogràfica exacta.

La versió v1 es conserva com a historial. No es modifiquen les fotografies ni els sprites originals del projecte.

## Prompt exacte

```text
Use case: identity-preserve. Replace the existing EIGHT-DIRECTION motorcycle spin sprite sheet using the NEWEST REAL USER PHOTO of Nel viewed from the front on his toy motorcycle as the PRIMARY reference for face, hair, clothes and VEHICLE GEOMETRY. The other reference is the previous 4x2 turnaround sheet, use it ONLY for pixel-art style, eight-frame order and game composition, not its inaccurate generic motorcycle. Essential corrections from real photo: Nel is a very young toddler with round face, small natural brown eyes, SHORT STRAIGHT DARK BROWN HAIR with short uneven central fringe (not long swept cartoon hair), teal/turquoise open cardigan over a DARK NAVY SHIRT, taupe-gray trousers, mint/aqua sneakers. Expression gentle curious/surprised, not enormous anime grin. The TOY BIKE is foot-powered plastic ride-on, small narrow blue saddle and BLUE pointed/sloping FRONT FAIRING, big smooth flat PALE GRAY SOLID DISK wheel hubs enclosed by BLACK tires, broad gray/silver handlebar and pale gray steering stem. Large RED CIRCULAR SIDE PANELS at knee height, extremely recognizable in the photograph. Not a generic motorbike, no engine, no yellow lights, no mudguards covering the wheel disks. Reference photo outranks old sprite whenever they differ. Keep current game's warmly shaded crisp 16-bit pixel clusters and dark outline, limited palette, whole bodies. Exactly FOUR equal columns by TWO equal rows = EIGHT views of SAME Nel and SAME bike rotating together around vertical axis, wheels remain on ground. Reading order: 1 directly rear facing away; 2 rear three-quarter toward right; 3 TRUE side profile facing right, RED CIRCULAR SIDE PANEL and GRAY DISK WHEELS CLEAR; 4 front three-quarter toward camera/right like the PHOTO; 5 exact front view with photo-accurate face, gray bar, blue front fairing and big gray front wheel disk; 6 front three-quarter toward camera/left; 7 true side profile left; 8 rear three-quarter left. Same head diameter/body/vehicle scale in every cell, identical wheel baseline at 90% cell height, generous clear transparent gutters and no overlap. All eight are seated upright holding gray handlebar, feet near ground, no tumbling or getting up. Actual transparent alpha background. No street, dog, floor, shadow outside sprite, text, logos, labels, grid lines, motion effects. This is a corrected game sprite asset based on the provided family photo, not a photorealistic portrait.
```
