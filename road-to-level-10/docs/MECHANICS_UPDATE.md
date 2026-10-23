# Actualización: música, mamá, snowboard y copas de los árboles

## Jugabilidad

- Bebé: buscar a mamá. No hay salto: flechas/A-D para gatear, ↑/W o TREPAR para subir bordes bajos, mantener ESPACIO/EMPUJAR y una dirección para arrimar bloques. El primer bloque completa un escalón; los dos siguientes se empujan en cadena para construir una escalera de tres alturas. Los bloques tienen límites y se pueden recolocar desde la pausa. Mamá es una ilustración genérica, no un retrato familiar.
- Capítulo 5: snowboard de pie sobre una única tabla roja. La altura del terreno aumenta con la distancia, de modo que la pista es una bajada física y visible, con cámara que acompaña ambos ejes. Izquierda frena, derecha acelera, espacio salta. Reintentos ilimitados desde los puntos de control.
- Bosque: trepar un árbol, cruzar una tirolina y balancearse y saltar entre dos lianas. ↑/W/TREPAR agarra o trepa, derecha mueve el balanceo, espacio suelta una liana conservando impulso. Para completar el capítulo se debe haber trepado y cruzado la tirolina y ambas lianas. Las copas y los puntos de control permiten reintentar; también se puede reiniciar desde la pausa.

## Audio

`src/audio.ts` contiene melodías originales de 16 pasos por capítulo, con voz de onda cuadrada, bajo triangular y percusión sintetizada. Efectos diferentes para recoger, saltar, golpear, empujar, trepar, tirolina, liana, aterrizar, puntos de control y celebración. No hay grabaciones comerciales ni peticiones de red. El audio se desbloquea con un gesto y el botón Sonido conserva la preferencia de silencio. La música se pausa con la partida y al perder el foco; se reanuda al continuar.

## Recursos nuevos

- `assets/adventure/mechanics-v1.png`: hoja fuente creada con la herramienta integrada `image_gen`, cuatro columnas y dos filas.
- `assets/adventure/mechanics-v1.webp`: copia de distribución optimizada, con transparencia y dimensiones conservadas.
- Poses: bebé trepando, bebé empujando, snowboard, snowboard en salto, mamá esperando, abrazo, tirolina, liana.
- `src/adventure-art.ts` registra los frames sin modificar los PNG originales del proyecto.

Son ilustraciones generadas con IA para esta versión jugable, pendientes de revisión artística.

## Prompt utilizado (herramienta integrada)

Use case: stylized-concept. NEW 16-bit pixel art game sprite sheet, use the attached existing evolution sheet only as a STYLE / CHARACTER reference. Produce 8 isolated sprites in STRICT FOUR columns by TWO rows on a 2:1 transparent PNG canvas. Genuine TRANSPARENT ALPHA, no painted background or floor. Same warm richly shaded crisp pixel style, side view characters facing RIGHT, each entire sprite confined to central72% of its equal square cell with clear transparent margins and baseline at85% cell height. ALL cells EQUAL SIZE. Row1: (1) curly brown-haired diaper baby with blue bib pulling up onto a low ledge, hands reaching above head, no ledge drawn; (2) same baby crawling pushing with arms straight in front, no box drawn; (3) older curly-haired child in blue winter jacket blue knit cap and goggles STANDING SIDEWAYS ON A SINGLE RED SNOWBOARD, knees bent riding downhill to right, absolutely NO sled or ski poles; (4) same snowboard child jumping with single snowboard fixed under both feet. Row2: (1) friendly generic mother with wavy brown hair, teal sweater cream pants, kneeling with arms open toward LEFT, no child; (2) same mother kneeling hugging diaper baby tenderly, (3) explorer child green jacket brown boots small backpack hanging below a zipline handle with arms above, bent knees, no cable or background; (4) same explorer gripping a vertical vine above head, legs swinging forward ready to jump, no background. No labels, no shadows outside sprites, no ground, no dust, no grids, no text. These are new illustrative sprites, not a portrait of any actual family member. Keep the snowboard unambiguously one flat board under both feet.
