// shots.js — deterministic screenshot staging. A URL like ?shot=cover
// freezes the game at one fixed moment so the same frame renders every
// time: the cover shows the thief mid-room, both guards with their cones,
// both cameras, the glowing prize, small loot, and the alarm half full.
import { LEVELS } from './levels.js';

function placeGuard(game, index, x, y, angle) {
  const g = game.guards[index];
  g.x = x;
  g.y = y;
  g.angle = angle;
  g.state = 'patrol';
  g.wait = 0;
  g.seesPlayer = false;
}

function placeCamera(game, index, phase) {
  const c = game.cameras[index];
  c.phase = phase;
  c.angle = c.baseAngle + Math.sin(phase) * c.sweep;
  c.seesPlayer = false;
}

// Stage one fixed frame per shot name. Returns true when a shot was staged.
export function stageShot(game, name) {
  const level = game.level;
  if (name === 'cover') {
    // Gallery, thief crossing the carpet toward the Star, guards sweeping
    // in from both sides, alarm already warm.
    game.levelIndex = 0;
    game.loadLevel(0);
    game.player.x = 470;
    game.player.y = 470;
    game.player.angle = Math.PI / 4;
    game.player.sneaking = true;
    placeGuard(game, 0, 280, 300, Math.PI / 2.6);
    placeGuard(game, 1, 1000, 420, -Math.PI / 1.4);
    placeCamera(game, 0, 0.9);
    placeCamera(game, 1, -0.7);
    game.alarm = 42;
    game.timeLeft = 132;
    game.lootValue = 1250;
    game.lootTaken.add(level.loot[0]);
    game.lootTaken.add(level.loot[5]);
    game.time = 4.2;
    return true;
  }
  if (name === 'alarm') {
    // Alarm nearly full, a guard has spotted the Fox mid-dash.
    game.levelIndex = 0;
    game.loadLevel(0);
    game.player.x = 600;
    game.player.y = 300;
    game.player.angle = -Math.PI / 3;
    game.player.sneaking = false;
    placeGuard(game, 0, 480, 300, 0);
    placeGuard(game, 1, 900, 480, Math.PI);
    game.guards[0].state = 'chase';
    game.guards[0].seesPlayer = true;
    placeCamera(game, 0, 0.2);
    placeCamera(game, 1, 0.4);
    game.cameras[0].seesPlayer = true;
    game.alarm = 88;
    game.timeLeft = 74;
    game.lootValue = 2100;
    game.lootTaken.add(level.loot[0]);
    game.lootTaken.add(level.loot[4]);
    game.smokes.push({ x: 540, y: 330, r: 95, left: 3.2 });
    game.smokeLeft = 2;
    game.time = 9.6;
    return true;
  }
  if (name === 'escape') {
    // Star secured, the Fox slips out the service door.
    game.levelIndex = 0;
    game.loadLevel(0);
    game.hasTarget = true;
    game.lootValue = 7250;
    for (const item of level.loot) game.lootTaken.add(item);
    game.player.x = 150;
    game.player.y = 390;
    game.player.angle = Math.PI;
    game.player.sneaking = false;
    placeGuard(game, 0, 420, 480, Math.PI / 2);
    placeGuard(game, 1, 800, 300, -Math.PI / 2);
    placeCamera(game, 0, -0.5);
    placeCamera(game, 1, 0.6);
    game.alarm = 18;
    game.timeLeft = 96;
    game.time = 14.8;
    return true;
  }
  if (name === 'vault') {
    // The second heist: the vault floor, three guards, tighter lanes.
    game.levelIndex = 1;
    game.loadLevel(1);
    game.player.x = 430;
    game.player.y = 560;
    game.player.angle = -Math.PI / 4;
    game.player.sneaking = true;
    placeGuard(game, 0, 280, 320, Math.PI / 3);
    placeGuard(game, 1, 960, 320, Math.PI * 0.8);
    placeGuard(game, 2, 640, 200, Math.PI / 2);
    placeCamera(game, 0, 0.5);
    placeCamera(game, 1, -0.9);
    game.alarm = 26;
    game.timeLeft = 151;
    game.lootValue = 600;
    game.lootTaken.add(game.level.loot[0]);
    game.time = 6.1;
    return true;
  }
  return false;
}
