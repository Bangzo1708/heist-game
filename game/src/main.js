// main.js — bootstrap. Wires the canvas, the input and the game loop, and
// handles the title screen, pause and level keys. With ?shot=<name> the
// game renders one frozen frame for screenshots instead of playing.
import { HeistGame } from './game.js';
import { Input } from './input.js';
import { stageShot } from './shots.js';
import { VIEW_W, VIEW_H } from './config.js';

const canvas = document.getElementById('game');
canvas.width = VIEW_W;
canvas.height = VIEW_H;

const params = new URLSearchParams(location.search);
const shot = params.get('shot');
const levelParam = Number(params.get('level') ?? 0);

const game = new HeistGame(canvas);
const input = new Input(canvas);
let paused = false;
let last = performance.now();

if (shot) {
  // Frozen frame: stage the shot, draw once, never advance the clock.
  if (stageShot(game, shot)) {
    game.draw();
  } else {
    game.phase = 'title';
    game.draw();
  }
} else {
  if (levelParam >= 1 && levelParam <= 3) {
    game.levelIndex = levelParam - 1;
  }
  game.phase = 'title';
  game.loadLevel(game.levelIndex);
  game.phase = 'title';

  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (input.pressed('p')) paused = !paused;
    if (input.pressed('m')) game.sounds.toggleMute();
    if (game.phase === 'title') {
      if (input.pressed('enter')) game.startFromTitle();
      if (input.pressed('1')) { game.levelIndex = 0; game.loadLevel(0); game.phase = 'title'; }
      if (input.pressed('2')) { game.levelIndex = 1; game.loadLevel(1); game.phase = 'title'; }
      if (input.pressed('3')) { game.levelIndex = 2; game.loadLevel(2); game.phase = 'title'; }
    } else if (game.phase === 'playing') {
      if (!paused) game.update(dt, input);
    } else if (input.pressed('r')) {
      game.restart();
    } else if (input.pressed('n')) {
      game.nextLevel();
    }
    game.draw();
    input.endFrame();
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}
