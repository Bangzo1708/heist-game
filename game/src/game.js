// game.js — the heist itself: state machine, movement, grabbing, alarm,
// win and lose. One class owns the whole round; render.js only draws it.
import {
  PLAYER_SPEED, PLAYER_SNEAK_SPEED, PLAYER_RADIUS,
  ALARM_FILL_GUARD, ALARM_FILL_CAMERA, ALARM_DRAIN, ALARM_SUSPECT,
  SMOKE_START, COIN_START, SMOKE_RADIUS, SMOKE_SECONDS, HEIST_SECONDS,
} from './config.js';
import { LEVELS } from './levels.js';
import { Guard, Camera } from './guards.js';
import { collideCircle, segmentBlocked } from './vision.js';
import { SoundBank } from './audio.js';
import * as render from './render.js';

export class HeistGame {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.sounds = new SoundBank();
    this.levelIndex = 0;
    this.phase = 'title'; // title | playing | caught | escaped | timeout
    this.time = 0;
    this.loadLevel(0);
  }

  get level() {
    return LEVELS[this.levelIndex];
  }

  get solids() {
    // Walls + cover block sight and movement; the room bounds are separate.
    return [...this.level.walls, ...this.level.cover];
  }

  loadLevel(index) {
    this.levelIndex = index;
    const level = LEVELS[index];
    this.player = {
      x: level.playerStart.x,
      y: level.playerStart.y,
      angle: 0,
      sneaking: false,
    };
    this.guards = level.guards.map((g) => new Guard(g));
    this.cameras = level.cameras.map((c) => new Camera(c));
    this.lootTaken = new Set();
    this.lootValue = 0;
    this.hasTarget = false;
    this.alarm = 0;
    this.timeLeft = HEIST_SECONDS;
    this.smokeLeft = SMOKE_START;
    this.coinsLeft = COIN_START;
    this.smokes = [];
    this.tossedCoins = [];
    this.lastAlarmTick = 0;
    this.time = 0;
    this.phase = 'playing';
  }

  startFromTitle() {
    this.loadLevel(this.levelIndex);
  }

  nextLevel() {
    this.loadLevel((this.levelIndex + 1) % LEVELS.length);
  }

  restart() {
    this.loadLevel(this.levelIndex);
  }

  update(dt, input) {
    if (this.phase !== 'playing') return;
    this.time += dt;
    this.timeLeft -= dt;
    if (this.timeLeft <= 0) {
      this.timeLeft = 0;
      this.phase = 'timeout';
      this.sounds.caught();
      return;
    }

    // Movement.
    const mv = input.moveVector();
    const speed = input.sneaking ? PLAYER_SNEAK_SPEED : PLAYER_SPEED;
    this.player.sneaking = input.sneaking;
    if (mv.x !== 0 || mv.y !== 0) {
      this.player.x += mv.x * speed * dt;
      this.player.y += mv.y * speed * dt;
      this.player.angle = Math.atan2(mv.y, mv.x);
    }
    collideCircle(this.player, PLAYER_RADIUS, this.solids, this.level.bounds);

    // Grab loot and the big prize with E (or automatically when close).
    if (input.pressed('e') || input.pressed(' ')) this.tryGrab();
    this.tryGrab(true);

    // Smoke bomb on Q.
    if (input.pressed('q') && this.smokeLeft > 0) {
      this.smokeLeft -= 1;
      this.smokes.push({ x: this.player.x, y: this.player.y, r: SMOKE_RADIUS, left: SMOKE_SECONDS });
      this.sounds.smoke();
    }

    // Coin toss: click anywhere to throw a coin there; guards go look.
    if (input.mouse.clicked && this.coinsLeft > 0) {
      this.coinsLeft -= 1;
      const at = { x: input.mouse.x, y: input.mouse.y, age: 0 };
      this.tossedCoins.push(at);
      for (const g of this.guards) g.investigate(at.x, at.y);
      this.sounds.coin();
    }

    // Smoke fades; coins age out.
    for (const s of this.smokes) s.left -= dt;
    this.smokes = this.smokes.filter((s) => s.left > 0);
    for (const c of this.tossedCoins) c.age += dt;
    this.tossedCoins = this.tossedCoins.filter((c) => c.age < 6);

    // Senses.
    const alarmHot = this.alarm > ALARM_SUSPECT;
    let seenByGuard = false;
    let seenByCamera = false;
    for (const g of this.guards) {
      g.update(dt, this.player, this.solids, this.smokes, alarmHot, this.level.bounds);
      if (g.seesPlayer) seenByGuard = true;
    }
    for (const c of this.cameras) {
      c.update(dt, this.player, this.solids, this.smokes);
      if (c.seesPlayer) seenByCamera = true;
    }

    if (seenByGuard || seenByCamera) {
      this.alarm += (seenByGuard ? ALARM_FILL_GUARD : 0) * dt;
      this.alarm += (seenByCamera ? ALARM_FILL_CAMERA : 0) * dt;
      if (this.time - this.lastAlarmTick > 0.5) {
        this.lastAlarmTick = this.time;
        this.sounds.alarmTick();
      }
    } else {
      this.alarm = Math.max(0, this.alarm - ALARM_DRAIN * dt);
    }
    if (this.alarm >= 100) {
      this.alarm = 100;
      this.phase = 'caught';
      this.sounds.caught();
      return;
    }

    // Caught by touch: a guard that reaches the thief ends the run.
    for (const g of this.guards) {
      if (Math.hypot(g.x - this.player.x, g.y - this.player.y) < 24) {
        this.phase = 'caught';
        this.sounds.caught();
        return;
      }
    }

    // Escape: reach the exit with the prize.
    const e = this.level.exit;
    if (
      this.hasTarget &&
      this.player.x > e.x - 6 && this.player.x < e.x + e.w + 6 &&
      this.player.y > e.y && this.player.y < e.y + e.h
    ) {
      this.phase = 'escaped';
      this.sounds.win();
    }
  }

  // Grab anything within reach. `quiet` runs every frame so walking over
  // small loot collects it; the big prize needs the E key (or a walk-over
  // too, but only when the player is right on it).
  tryGrab(quiet = false) {
    const p = this.player;
    for (const item of this.level.loot) {
      if (this.lootTaken.has(item)) continue;
      if (Math.hypot(item.x - p.x, item.y - p.y) < 30) {
        this.lootTaken.add(item);
        this.lootValue += item.value;
        if (!quiet) this.sounds.grab();
      }
    }
    const t = this.level.target;
    if (!this.hasTarget && Math.hypot(t.x - p.x, t.y - p.y) < 46) {
      this.hasTarget = true;
      this.lootValue += t.value;
      this.sounds.grab();
    }
  }

  hudState() {
    return {
      level: this.level,
      lootValue: this.lootValue,
      hasTarget: this.hasTarget,
      timeLeft: Math.max(0, this.timeLeft),
      alarm: this.alarm,
      smoke: this.smokeLeft,
      coins: this.coinsLeft,
    };
  }

  draw() {
    const ctx = this.ctx;
    const level = this.level;
    render.drawFloor(ctx, level);
    render.drawLoot(ctx, level, this.lootTaken, this.time);
    render.drawExit(ctx, level, this.hasTarget, this.time);
    render.drawCover(ctx, level);
    render.drawWalls(ctx, level);
    render.drawGuards(ctx, this.guards, this.solids);
    render.drawCameras(ctx, this.cameras, this.solids);
    render.drawSmokes(ctx, this.smokes);
    render.drawCoins(ctx, this.tossedCoins);
    render.drawPlayer(ctx, this.player, this.time);
    render.drawHud(ctx, this.hudState());

    if (this.phase === 'title') {
      render.drawOverlay(ctx, 'VELVET FOX', [
        'A midnight heist in three rooms. Cross the floor, dodge the cones,',
        'lift the STAR, and slip out the exit before the alarm fills.',
        '',
        'WASD / arrows — move      Shift — sneak (harder to spot)',
        'E — grab      Q — smoke bomb      Click — toss a coin to distract',
        '',
        'Choose a heist:  1 Gallery    2 Vault Floor    3 Penthouse',
        'Press ENTER to begin the gallery heist.',
      ], '#f2c14e');
    } else if (this.phase === 'caught') {
      render.drawOverlay(ctx, 'CAUGHT!', [
        'A guard closed in — or the alarm hit the roof.',
        `You kept $${this.lootValue.toLocaleString('en-US')} of loot… but the Fox never pays bail.`,
      ], '#ff4d4d');
    } else if (this.phase === 'timeout') {
      render.drawOverlay(ctx, 'TOO SLOW!', [
        'Dawn broke and the police swept the building.',
        `You kept $${this.lootValue.toLocaleString('en-US')} of loot.`,
      ], '#ff8a3c');
    } else if (this.phase === 'escaped') {
      render.drawOverlay(ctx, 'CLEAN GETAWAY!', [
        `${level.name} — the ${level.target.label} is yours.`,
        `Loot: $${this.lootValue.toLocaleString('en-US')}   Alarm peaked and fell. The Fox vanishes.`,
      ], '#7ee081');
    }
  }
}
