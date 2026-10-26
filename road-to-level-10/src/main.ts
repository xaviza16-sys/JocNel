import Phaser from 'phaser';
import atlas from '../assets/sprites/atlas.json';
import invitation from './data/invitation.json';
import { levels, nextLevel, SaveManager, whatsAppUrl, type Level } from './model';
import { AudioManager } from './systems';
import { drawWorld } from './scenery';
import { MotoRace } from './race-scene';
import { loadRaceArt, createRaceFrames } from './race-art';
import { loadAdventureArt, createAdventureFrames } from './adventure-art';
import { PlatformLevel } from './platform-scene';
import { Snowboard } from './snowboard-scene';
import { Skatepark } from './skate-scene';
import { loadOutdoorArt, createOutdoorFrames } from './outdoor-art';
import './style.css';
import { ScoreManager, runPoints, type ScoreStats } from './scores';
import { controlCaption } from './control-ui';

const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T;
const overlay = $('overlay');
let completionTimer: number | undefined;
let storage: Storage | undefined;
try { storage = window.localStorage; } catch { /* Storage can be unavailable. */ }
const saves = new SaveManager(storage);
const scores = new ScoreManager(storage);
let lastStats: ScoreStats = { progress: 0 };
function recordScore(level: Level, stats: ScoreStats) {
  lastStats = stats;
  if (scores.active && !scores.active.endedAt) scores.update(level.id, stats);
  $('score').textContent = `${scores.total.toLocaleString('ca')} PTS`;
}
const progress = saves.read();
const audio = new AudioManager(); audio.muted = progress.muted;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const spriteUrls = import.meta.glob('../assets/sprites/*.png', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;
let activeLevel = levels[0];
let game: Phaser.Game;

function button(label: string, action: () => void, secondary = false) {
  const node = document.createElement('button'); node.className = secondary ? 'secondary' : 'primary';
  node.textContent = label; node.onclick = () => { audio.unlock(); action(); }; return node;
}
function panel(eyebrow: string, title: string, copy: string, compact = false) {
  window.clearTimeout(completionTimer); completionTimer = undefined;
  overlay.replaceChildren();
  const root = document.createElement('div'); root.className = `panel${compact ? ' compact' : ''}`;
  const kicker = document.createElement('span'); kicker.className = 'eyebrow'; kicker.textContent = eyebrow;
  const heading = document.createElement('h2'); heading.textContent = title;
  const text = document.createElement('p'); text.textContent = copy;
  const actions = document.createElement('div'); actions.className = 'actions';
  root.append(kicker, heading, text, actions); overlay.append(root);
  requestAnimationFrame(() => root.querySelector<HTMLButtonElement>('button')?.focus({ preventScroll: true }));
  return { root, actions };
}
function playingUI(playing: boolean) {
  $('pause').hidden = !playing; $('touch-controls').hidden = !playing;
  document.querySelector<HTMLButtonElement>('[data-action="jump"]')!.hidden = activeLevel.mode === 'moto';
  const action = document.querySelector<HTMLButtonElement>('[data-action="jump"]')!;
  controlCaption(action, activeLevel.mode === 'baby' ? 'Empènyer' : activeLevel.mode === 'nature' ? 'Saltar / deixar-se anar' : activeLevel.mode === 'skate' ? 'Ollie' : 'Saltar');
  action.setAttribute('aria-label', activeLevel.mode === 'baby' ? 'Empènyer' : 'Saltar');
  document.querySelector<HTMLButtonElement>('[data-action="climb"]')!.hidden = !['nature', 'baby'].includes(activeLevel.mode);
}
function gameplayKey() { return activeLevel.mode === 'moto' ? 'MotoRace' : activeLevel.mode === 'snow' ? 'Snowboard' : activeLevel.mode === 'skate' ? 'Skatepark' : 'PlatformLevel'; }
function gameplay() { return game.scene.getScene(gameplayKey()) as PlatformLevel | MotoRace | Snowboard | Skatepark; }
function startLevel(level: Level) {
  scores.ensure(); lastStats = { progress: 0 };
  activeLevel = level;
  for (const key of ['Menu', 'Scores', 'LevelSelect', 'Pause', 'Invitation', 'PlatformLevel', 'MotoRace', 'Snowboard', 'Skatepark']) game.scene.stop(key);
  audio.playTheme(level.mode);
  game.scene.start(gameplayKey(), { level });
}
function returnMenu() {
  for (const key of ['PlatformLevel', 'MotoRace', 'Snowboard', 'Skatepark', 'Scores', 'Pause', 'Invitation', 'LevelSelect']) game.scene.stop(key);
  game.scene.start('Menu');
}

class Boot extends Phaser.Scene {
  constructor() { super('Boot'); }
  create() { this.scene.start('Preload'); }
}
class Preload extends Phaser.Scene {
  constructor() { super('Preload'); }
  preload() {
    const label = this.add.text(240, 135, 'Preparant records…', { fontFamily: 'monospace', fontSize: '12px', color: '#234d45' }).setOrigin(.5);
    this.load.on('progress', (value: number) => label.setText(`Preparant records… ${Math.round(value * 100)}%`));
    this.load.on('loaderror', () => { $('status').textContent = 'No s’ha pogut carregar un recurs. Torna a carregar la pàgina per provar-ho de nou.'; });
    for (const [key, info] of Object.entries(atlas)) {
      this.load.spritesheet(key, spriteUrls[`../${info.image}`], { frameWidth: info.frameWidth, frameHeight: info.frameHeight });
    }
    loadRaceArt(this);
    loadAdventureArt(this); loadOutdoorArt(this);
  }
  create() {
    createRaceFrames(this);
    createAdventureFrames(this); createOutdoorFrames(this);
    for (const [key, info] of Object.entries(atlas)) for (const [name, anim] of Object.entries(info.animations)) {
      this.anims.create({ key: `${key}-${name}`, frames: this.anims.generateFrameNumbers(key, { start: anim.start, end: anim.end }), frameRate: reducedMotion ? 1 : anim.frameRate, repeat: anim.repeat });
    }
    const g = this.make.graphics({ x: 0, y: 0 });
    g.fillStyle(0xffd36d); g.fillPoints([new Phaser.Geom.Point(6, 0), new Phaser.Geom.Point(8, 4), new Phaser.Geom.Point(12, 5), new Phaser.Geom.Point(9, 8), new Phaser.Geom.Point(10, 12), new Phaser.Geom.Point(6, 10), new Phaser.Geom.Point(2, 12), new Phaser.Geom.Point(3, 8), new Phaser.Geom.Point(0, 5), new Phaser.Geom.Point(4, 4)], true);
    g.generateTexture('star', 12, 12); g.destroy(); this.scene.start('Menu');
  }
}
class Menu extends Phaser.Scene {
  constructor() { super('Menu'); }
  create() {
    playingUI(false); $('chapter').textContent = 'L’INICI DE L’AVENTURA D’EN NEL';
    $('score').textContent = `${scores.total.toLocaleString('ca')} PTS`;
    audio.playTheme('menu');
    $('status').textContent = '✦ Al teu ritme, amb intents il·limitats'; drawWorld(this, 'moto', 960);
    const hero = this.add.image(380, 238, 'heroes', 'skater-0').setOrigin(.5, 1);
    hero.setDisplaySize(85 * hero.frame.width / hero.frame.height, 85);
    const { root, actions } = panel('PREM COMENÇAR I TORNA AL PRINCIPI', 'L’aventura d’en Nel', 'Acompanya en Nel: de gatejar per casa a descobrir el món. Recull records i descobreix la seva festa.');
    const resume = levels.find(l => !scores.active?.chapters[l.id]?.stats.complete) || levels[0];
    const label = document.createElement('label'); label.className = 'player-field'; label.textContent = 'Nom del jugador';
    const name = document.createElement('input'); name.id = 'player-name'; name.maxLength = 24; name.value = scores.player; name.autocomplete = 'off'; name.addEventListener('keydown', event => event.stopPropagation()); label.append(name); root.insertBefore(label, actions);
    actions.append(button(progress.completed.length ? 'Continuar l’aventura →' : 'Començar l’aventura! →', () => {
      const continuing = scores.active && !scores.active.endedAt && name.value.trim() === scores.player;
      if (!continuing) scores.begin(name.value);
      startLevel(continuing ? resume : levels[0]);
    }), button('Triar capítol', () => { if (!scores.active || scores.active.endedAt || name.value.trim() !== scores.player) scores.begin(name.value); this.scene.start('LevelSelect'); }, true), button('Puntuacions', () => this.scene.start('Scores'), true));
    const small = document.createElement('small'); small.textContent = '7 capítols · Dels primers descobriments al nivell 10'; root.append(small);
  }
}
class LevelSelect extends Phaser.Scene {
  constructor() { super('LevelSelect'); }
  create() {
    playingUI(false);
    const { root, actions } = panel('L’ÀLBUM DE RECORDS', 'Cada pas compta', 'Set etapes per créixer jugant. Pots triar qualsevol record.', true);
    const list = document.createElement('div'); list.className = 'level-list';
    levels.forEach((level, index) => {
      const card = button('', () => startLevel(level)); card.className = 'level-card';
      const age = document.createElement('span'); age.textContent = `${String(index + 1).padStart(2, '0')} / ${level.subtitle}`;
      const title = document.createElement('strong'); title.textContent = level.title;
      const state = document.createElement('span'); state.textContent = progress.completed.includes(level.id) ? '✦ Record completat · Tornar-hi →' : 'Descobrir el record →';
      card.append(age, title, state); list.append(card);
    });
    root.insertBefore(list, actions); actions.append(button('Tornar a l’inici', returnMenu, true));
  }
}


function finishLevel(level: Level, copy: string) {
  if (scores.active && !scores.active.endedAt) {
    recordScore(level, { ...lastStats, progress: 100, complete: true });
    if (!nextLevel(level.id)) scores.finish();
  }
  if (!progress.completed.includes(level.id)) progress.completed.push(level.id);
  saves.write(progress); audio.sfx('complete'); playingUI(false);
  const next = nextLevel(level.id);
  const heading = next ? level.id === 'baby' ? 'La teva primera aventura!' : 'Un pas més!' : 'Has arribat al nivell 10, Nel!';
  if (!next) { celebrate(); audio.playTheme('party'); }
  const showResult = () => {
    const { actions } = panel(next ? 'UN RECORD MÉS A L’ÀLBUM' : 'LA PROPERA AVENTURA ÉS JUNTS', heading, `${copy} Puntuació de la partida: ${scores.total.toLocaleString('ca')} punts.`, true);
    actions.append(button(next ? `Següent: ${next.title} →` : 'Descobrir la invitació →', () => next ? startLevel(next) : showInvitation()), button('Triar capítol', () => { game.scene.stop(gameplayKey()); game.scene.start('LevelSelect'); }, true));
  };
  window.clearTimeout(completionTimer); completionTimer = undefined;
  if (level.mode === 'baby' || level.mode === 'toddler' || level.mode === 'hospital') {
    // Leave the hug or motorcycle discovery unobscured before the results
    // panel appears. Other panels cancel this browser timer.
    overlay.replaceChildren();
    completionTimer = window.setTimeout(showResult, 2500);
  } else showResult();
}
function celebrate() {
  const shell = document.querySelector('.game-shell')!;
  shell.querySelector('.confetti')?.remove();
  if (reducedMotion) return;
  const confetti = document.createElement('div'); confetti.className = 'confetti'; confetti.setAttribute('aria-hidden', 'true');
  for (let i = 0; i < 45; i++) {
    const piece = document.createElement('i'); piece.style.left = `${i * 37 % 100}%`; piece.style.animationDelay = `${i % 7 * .15}s`; piece.style.background = ['#e9b74b', '#8cb7a0', '#da815a', '#7aa9ce'][i % 4]; confetti.append(piece);
  }
  shell.append(confetti); window.setTimeout(() => confetti.remove(), 4800);
}
function pauseGame() {
  if (!game.scene.isActive(gameplayKey())) return;
  const scene = gameplay();
  audio.setPaused(true);
  scene.controls.reset(); scene.scene.pause(); game.scene.start('Pause');
}
function resumeGame() {
  game.scene.stop('Pause'); overlay.replaceChildren(); playingUI(true); audio.playTheme(activeLevel.mode); game.scene.resume(gameplayKey());
}
class Pause extends Phaser.Scene {
  constructor() { super('Pause'); }
  create() {
    playingUI(false);
    audio.setPaused(true);
    const { root, actions } = panel('UN PETIT DESCANS', 'Al teu ritme', 'La teva aventura t’espera just on l’has deixada.', true);
    actions.append(button('Continuar jugant →', resumeGame), button('Tornar a l’inici', returnMenu, true));
    actions.append(button('Desar i acabar partida', () => { scores.finish(); game.scene.stop(gameplayKey()); this.scene.start('Scores'); }, true));
    const restart = button(activeLevel.mode === 'baby' ? 'Recol·locar els blocs i tornar a començar' : 'Reiniciar el capítol', () => startLevel(activeLevel), true);
    restart.className = 'link-button'; root.append(restart);
    const skip = button('Ometre aquest capítol →', () => {
      const next = nextLevel(activeLevel.id); next ? startLevel(next) : showInvitation();
    }, true); skip.className = 'link-button'; root.append(skip);
  }
}
let invitationReturn: 'menu' | 'pause' | 'complete' = 'menu';
class Scores extends Phaser.Scene {
  constructor() { super('Scores'); }
  create() {
    playingUI(false);
    const { root, actions } = panel('EL MARCADOR D’EN NEL', 'Puntuacions', 'Partides dels jugadors d’aquest dispositiu. Cada capítol puntua una vegada; repetir-lo permet millorar la marca.', true);
    root.classList.add('score-panel');
    const list = document.createElement('ol'); list.className = 'score-list';
    for (const run of scores.runs) {
      const row = document.createElement('li');
      const name = document.createElement('strong'); name.textContent = run.player;
      const points = document.createElement('b'); points.textContent = `${runPoints(run).toLocaleString('ca')} PTS`;
      const detail = document.createElement('small'); detail.textContent = `${new Date(run.startedAt).toLocaleDateString('ca')} · ${Object.values(run.chapters).filter(c => c.stats.complete).length}/7 capítols · ${run.endedAt ? 'Acabada' : 'En curs'}`;
      row.append(name, points, detail); list.append(row);
    }
    if (!scores.runs.length) { const empty = document.createElement('p'); empty.textContent = 'Encara no hi ha partides. Comença la teva aventura!'; root.insertBefore(empty, actions); }
    root.insertBefore(list, actions);
    const rules = document.createElement('small'); rules.textContent = 'Estrella: +100 · turbo: +50 · obstacle esquivat: +25 · quarter: +200 · tirolina: +150 · liana: +100 · escala o gos: +100 · avançar: +25 cada 10% · capítol: +500 · ensopegada: −25.'; root.insertBefore(rules, actions);
    actions.append(button('Descarregar puntuacions (.json)', () => {
      const url = URL.createObjectURL(new Blob([scores.exportFile()], { type: 'application/json' }));
      const link = document.createElement('a'); link.href = url; link.download = 'puntuacions-nel.json'; document.body.append(link); link.click(); link.remove(); window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    }), button('Tornar a l’inici', returnMenu, true));
    if (!scores.persistent) { const notice = document.createElement('p'); notice.textContent = 'Aquest navegador no permet desar les puntuacions. Descarrega el fitxer abans de tancar la pàgina.'; root.append(notice); }
  }
}
function showInvitation() {
  if (game.scene.isActive('Invitation')) return;
  if (game.scene.isActive(gameplayKey())) pauseGame();
  const platform = gameplay();
  invitationReturn = game.scene.isActive('Pause') ? 'pause' : platform.finished && game.scene.isPaused(gameplayKey()) ? 'complete' : 'menu';
  game.scene.stop('Pause'); game.scene.start('Invitation');
}
class Invitation extends Phaser.Scene {
  constructor() { super('Invitation'); }
  create() {
    playingUI(false);
    audio.playTheme('party');
    const { root, actions } = panel('LA PROPERA GRAN AVENTURA ÉS JUNTS', invitation.childDisplayName ? `En ${invitation.childDisplayName} arriba al nivell 10!` : 'Ens espera una gran festa!', 'Deu anys de records es mereixen una altra aventura. I la volem viure amb tu.', true);
    const details = document.createElement('dl'); details.className = 'invitation-details';
    for (const [label, value] of [['DIA', invitation.date], ['HORA', invitation.time], ['LLOC', invitation.venue]]) {
      const group = document.createElement('div'); const dt = document.createElement('dt'); dt.textContent = label;
      const dd = document.createElement('dd'); dd.textContent = value || 'Per confirmar'; group.append(dt, dd); details.append(group);
    }
    root.insertBefore(details, actions);
    const url = whatsAppUrl(invitation.rsvpWhatsApp);
    if (url) {
      const link = document.createElement('a'); link.className = 'primary'; link.textContent = 'Confirmar per WhatsApp ↗'; link.href = url; link.target = '_blank'; link.rel = 'noopener noreferrer'; actions.append(link);
    } else {
      const notice = document.createElement('small'); notice.textContent = 'Aviat hi trobaràs tots els detalls i la confirmació.'; root.append(notice);
    }
    actions.append(button(invitationReturn === 'menu' ? 'Tornar a l’inici' : 'Tornar al joc', () => {
      this.scene.stop();
      if (invitationReturn === 'pause') this.scene.launch('Pause');
      else if (invitationReturn === 'complete') gameplay().complete();
      else returnMenu();
    }, true));
  }
}

game = new Phaser.Game({
  type: Phaser.AUTO, parent: 'game', width: 480, height: 270, backgroundColor: '#bed2b5', pixelArt: true,
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  physics: { default: 'arcade', arcade: { gravity: { x: 0, y: 650 }, debug: false } },
  input: { activePointers: 4, keyboard: { capture: [32, 37, 38, 39, 40] } },
  audio: { noAudio: true }, scene: [Boot, Preload, Menu, LevelSelect, new PlatformLevel({
    audio, reducedMotion, pause: pauseGame, complete: finishLevel, score: recordScore,
    begin: level => { overlay.replaceChildren(); playingUI(true); $('chapter').textContent = level.subtitle.toUpperCase(); $('status').textContent = level.hint; },
  }), new Skatepark({
    audio, reducedMotion, pause: pauseGame, complete: finishLevel, score: recordScore,
    begin: level => { overlay.replaceChildren(); playingUI(true); $('chapter').textContent = level.subtitle.toUpperCase(); $('status').textContent = level.hint; },
  }), new Snowboard({
    audio, reducedMotion, pause: pauseGame, complete: finishLevel, score: recordScore,
    begin: level => { overlay.replaceChildren(); playingUI(true); $('chapter').textContent = level.subtitle.toUpperCase(); $('status').textContent = level.hint; },
  }), new MotoRace({
    audio, reducedMotion, pause: pauseGame, complete: finishLevel, score: recordScore,
    begin: level => {
      overlay.replaceChildren(); playingUI(true); $('chapter').textContent = level.subtitle.toUpperCase(); $('status').textContent = level.hint;
    },
  }), Invitation, Pause, Scores],
});
$('pause').onclick = pauseGame;
$('invite-shortcut').onclick = showInvitation;
function updateSound() {
  $('sound').textContent = `So: ${audio.muted ? 'no' : 'sí'}`;
  $('sound').setAttribute('aria-pressed', String(!audio.muted)); $('sound').setAttribute('aria-label', audio.muted ? 'Activar el so' : 'Silenciar el so');
}
$('sound').onclick = () => { audio.unlock(); audio.muted = !audio.muted; progress.muted = audio.muted; saves.write(progress); updateSound(); audio.chime(); };
updateSound();
window.addEventListener('blur', () => { audio.setPaused(true); pauseGame(); });
window.addEventListener('focus', () => { if (!game.scene.isActive('Pause') && !document.hidden) audio.setPaused(false); });
document.addEventListener('visibilitychange', () => { if (document.hidden) { audio.setPaused(true); pauseGame(); } });
window.addEventListener('pagehide', () => audio.setPaused(true));
