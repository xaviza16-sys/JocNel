# Puntuacions i controls tàctils

El menú permet indicar un àlies. Les partides es desen automàticament al navegador amb la clau `nel-scores-v1`, separades del progrés antic. Canviar de jugador inicia una altra partida; «Desar i acabar partida», a la pausa, tanca la partida actual sense exigir completar els set capítols. Una partida encara oberta es pot continuar després de recarregar.

El marcador suma punts per avançar, recollir estrelles, esquivar obstacles, travessar tirolines i lianes, completar escales, passar el gos i fer quarters. Cada capítol completat dona 500 punts; les ensopegades resten 25, amb un mínim de zero per capítol. Repetir un capítol completat només substitueix la marca si es millora; no se suma una segona vegada. Ometre un nivell no dona la bonificació de completar-lo.

«Puntuacions» mostra l’historial ordenat per punts i permet descarregar `puntuacions-nel.json`, que inclou l’àlies, les dates, el detall per capítol i els punts totals de totes les partides d’aquest navegador. No hi ha una classificació compartida entre dispositius. Esborrar les dades del navegador elimina l’historial local; conserva el fitxer descarregat si vols guardar-lo. Si el navegador impedeix el desament, el marcador avisa i encara permet exportar la sessió.

Els controls tenen botons direccionals i botons A/B amb resposta visual, multitàctil i cancel·lació independent de cada dit. Les etiquetes canvien segons l’acció del nivell; la moto només mostra A quan cal aixecar-se. En horitzontal, el joc s’ajusta a l’alçada disponible i els botons respecten els marges segurs del dispositiu.
