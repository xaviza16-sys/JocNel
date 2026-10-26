# En Nel · Nivell 10

Un joc d’invitació d’aniversari en català amb Phaser 3, TypeScript i Vite. Set capítols jugables, música retro original i una invitació configurable al final.

## Jugar en local

Cal Node.js 22.12 o posterior, o Node.js 24. Des d’aquesta carpeta:

```sh
npm install
npm run dev
```

A PowerShell, fes servir `npm.cmd` si es bloqueja `npm.ps1`. Obre l’adreça que mostra Vite.

## Els set records

1. **On és la mama? (0–1):** en Nel gateja i grimpa; no salta. Empeny blocs per formar escales i passa per damunt del gos estirat abans d’arribar a la mama.
2. **Les primeres passes (1–2):** caminar i saltar per les plataformes de casa i del jardí.
3. **Cap a l’escola bressol (2–4):** moto amb vista posterior pel passeig de la foto. Les fletxes acceleren, les fulles alenteixen, les famílies fan caure i cal aixecar-se; les caques aturen la moto i obliguen a reiniciar.
4. **Un pati ple de sorpreses (4–6):** esquivar el Iogurt Mutant i el Tomàquet Furiós, sense atacs.
5. **Surf de neu (6–7):** una baixada amb pendent, acceleració, frenada i salts.
6. **Aventura entre les capçades (7–9):** grimpar arbres, travessar una tirolina i saltar entre dues lianes.
7. **Amb el monopatí fins al nivell 10 (9–10):** impulsar-se, fer ollies i arribar a la festa.

## Controls

- Fletxes o A/D: moure’s, conduir o controlar la velocitat.
- Amb en Nel nadó, mantén **espai + direcció** per empènyer; deixa l’espai i mantén **↑/W + direcció** per grimpar.
- Als altres capítols, **espai** salta o et deixa anar d’una liana; **↑/W** permet grimpar i agafar-se.
- En una liana, **→** et gronxa; **espai** et deixa anar amb impuls cap a la següent.
- En mòbil hi ha botons de moviment, empènyer/saltar i grimpar.
- Esc o **Pausa**: continuar, reiniciar, recol·locar els blocs o ometre el capítol.
- **So** activa les melodies chiptune originals i els efectes. El silenci es recorda; la música es pausa en sortir de la pestanya.

Els intents són il·limitats, les estrelles són opcionals i la invitació sempre és a l’abast. El progrés només es desa al dispositiu. Es pot triar qualsevol capítol des de l’àlbum.

## Configuració i art

- `src/data/levels.json`: recorreguts, obstacles i textos en català.
- `src/data/invitation.json`: nom d’en Nel, dia, hora, lloc i confirmació per WhatsApp. Les dades de la festa encara buides mostren «Per confirmar».
- `assets/adventure/family-nel-v2.png` i `.webp`: mare i gos en pixel art, revisats a partir de la foto aportada. No es desa la fotografia original al repositori. Recursos i prompt a `docs/FAMILIA_NEL_V2.md`.
- `assets/adventure/baby-nel-v1.png` i `.webp`: 24 poses d’en Nel nadó amb el vestuari de la foto. L’abraçada actualitzada és a `baby-nel-hug-v1.png` i `.webp`. Recursos i prompts a `docs/NEL_NADO_ANIMACIONS.md`.
- `assets/adventure/toddler-nel-v1.png` i `.webp`: 24 poses del segon nivell amb la granota turquesa de la foto. `toy-moto-parked-v1.png` i `.webp` mostren la moto que troba al final, abans de començar la cursa. Recursos i prompts a `docs/NEL_PRIMERES_PASSES.md`.
- `assets/race/nel-promenade-rider-v1.png` i `.webp`, `assets/race/promenade-v1.png` i `.webp`: pilot, passeig i nous obstacles de la moto. Recursos, mecàniques i prompts a `docs/MOTO_PASSEIG.md`.
- `docs/FAMILIA_NEL_CA.md`: recursos nous i prompt utilitzat amb l’eina integrada d’imatges.
- `docs/ADVENTURE_ART.md` i `docs/MECHANICS_UPDATE.md`: documentació tècnica i prompts de les versions anteriors.
- `docs/CREDITS.md`: crèdits.

Les il·lustracions són recursos generats per a aquesta versió jugable i es poden continuar polint. Els PNG originals es conserven; el joc carrega còpies WebP més lleugeres.

## Comprovacions

```sh
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

Les proves cobreixen la configuració, els enemics, els salts, les escales de blocs, la baixada, les lianes, la música, el català i la invitació. La prova completa recorre els set capítols amb controls reals i comprova que en Nel passa per damunt del gos sense saltar.

`npm run art:optimize` prepara les còpies WebP. `npm run art:preview` captura els set escenaris si el servidor local està engegat.

## Publicació

El joc està disponible a https://xaviza16-sys.github.io/JocNel/ amb GitHub Pages. Cada pujada a `main` executa les comprovacions i publica la versió nova si passen. `npm run build` genera `dist/`; el flux configura automàticament `VITE_BASE_PATH=/JocNel/`.
