// render.js — every pixel the player sees. Top-down midnight museum:
// checkerboard marble floor, a red carpet to the prize, display cases as
// cover, sweeping vision cones, and a HUD that always shows loot, the clock
// and the alarm meter. Nothing here loads a file — all art is drawn.
import { PALETTE, VIEW_W, VIEW_H } from './config.js';
import { conePolygon } from './vision.js';
import { GUARD_VIEW_RANGE, GUARD_VIEW_HALF_ANGLE, CAMERA_VIEW_RANGE, CAMERA_VIEW_HALF_ANGLE } from './config.js';

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export function drawFloor(ctx, level) {
  const b = level.bounds;
  ctx.fillStyle = '#0e0c16';
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  // Marble checkerboard inside the room.
  const tile = 40;
  for (let y = b.y; y < b.y + b.h; y += tile) {
    for (let x = b.x; x < b.x + b.w; x += tile) {
      const odd = ((x - b.x) / tile + (y - b.y) / tile) % 2 === 0;
      ctx.fillStyle = odd ? PALETTE.floor : PALETTE.floorTile;
      ctx.fillRect(x, y, tile, tile);
    }
  }
  ctx.strokeStyle = PALETTE.floorTrim;
  ctx.lineWidth = 2;
  ctx.strokeRect(b.x, b.y, b.w, b.h);
  // Red carpet to the prize.
  const c = level.carpet;
  ctx.fillStyle = PALETTE.carpet;
  ctx.fillRect(c.x, c.y, c.w, c.h);
  ctx.strokeStyle = PALETTE.carpetEdge;
  ctx.lineWidth = 3;
  ctx.strokeRect(c.x + 4, c.y + 4, c.w - 8, c.h - 8);
  ctx.strokeStyle = 'rgba(242, 193, 78, 0.5)';
  ctx.lineWidth = 1;
  ctx.strokeRect(c.x + 10, c.y + 10, c.w - 20, c.h - 20);
}

export function drawWalls(ctx, level) {
  const b = level.bounds;
  ctx.fillStyle = PALETTE.wall;
  ctx.fillRect(b.x - 14, b.y - 14, b.w + 28, 14);
  ctx.fillRect(b.x - 14, b.y + b.h, b.w + 28, 14);
  ctx.fillRect(b.x - 14, b.y, 14, b.h);
  ctx.fillRect(b.x + b.w, b.y, 14, b.h);
  ctx.fillStyle = PALETTE.wallTop;
  ctx.fillRect(b.x - 14, b.y - 14, b.w + 28, 5);
  ctx.fillRect(b.x - 14, b.y - 14, 5, b.h + 28);
  for (const w of level.walls) {
    ctx.fillStyle = PALETTE.wall;
    ctx.fillRect(w.x, w.y, w.w, w.h);
    ctx.fillStyle = PALETTE.wallTop;
    ctx.fillRect(w.x, w.y, w.w, 6);
    ctx.strokeStyle = PALETTE.wallEdge;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(w.x, w.y, w.w, w.h);
  }
}

export function drawCover(ctx, level) {
  for (const c of level.cover) {
    ctx.fillStyle = PALETTE.cover;
    roundRect(ctx, c.x, c.y, c.w, c.h, 6);
    ctx.fill();
    ctx.fillStyle = PALETTE.coverTop;
    roundRect(ctx, c.x + 4, c.y + 4, c.w - 8, c.h - 8, 4);
    ctx.fill();
    ctx.fillStyle = PALETTE.textDim;
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(c.label, c.x + c.w / 2, c.y + c.h / 2);
  }
}

function drawCone(ctx, x, y, angle, halfAngle, range, solids, hot) {
  const pts = conePolygon(x, y, angle, halfAngle, range, solids);
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
  ctx.closePath();
  ctx.fillStyle = hot ? 'rgba(255, 70, 70, 0.30)' : 'rgba(255, 214, 90, 0.20)';
  ctx.fill();
  ctx.strokeStyle = hot ? 'rgba(255, 90, 90, 0.55)' : 'rgba(255, 214, 90, 0.4)';
  ctx.lineWidth = 1;
  ctx.stroke();
}

export function drawLoot(ctx, level, taken, time) {
  const bob = Math.sin(time * 3) * 3;
  for (const item of level.loot) {
    if (taken.has(item)) continue;
    ctx.save();
    ctx.translate(item.x, item.y + bob);
    ctx.fillStyle = PALETTE.gold;
    ctx.beginPath();
    ctx.arc(0, 0, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff3c4';
    ctx.beginPath();
    ctx.arc(-2.5, -2.5, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    ctx.fillStyle = PALETTE.goldDim;
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`$${item.value}`, item.x, item.y + 26);
  }
  // The big prize, glowing on its plinth.
  const t = level.target;
  const pulse = 0.5 + 0.5 * Math.sin(time * 2.4);
  const glow = ctx.createRadialGradient(t.x, t.y, 4, t.x, t.y, 70 + pulse * 20);
  glow.addColorStop(0, 'rgba(89, 214, 255, 0.55)');
  glow.addColorStop(1, 'rgba(89, 214, 255, 0)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(t.x, t.y, 90, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#20202e';
  ctx.fillRect(t.x - 26, t.y - 16, 52, 32);
  ctx.strokeStyle = PALETTE.jewel;
  ctx.lineWidth = 2;
  ctx.strokeRect(t.x - 26, t.y - 16, 52, 32);
  ctx.save();
  ctx.translate(t.x, t.y - 2);
  ctx.rotate(Math.PI / 4);
  ctx.fillStyle = PALETTE.jewelGlow;
  ctx.fillRect(-11, -11, 22, 22);
  ctx.fillStyle = PALETTE.jewel;
  ctx.fillRect(-7, -7, 14, 14);
  ctx.restore();
  ctx.fillStyle = PALETTE.jewelGlow;
  ctx.font = 'bold 12px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(t.label, t.x, t.y + 42);
}

export function drawExit(ctx, level, hasTarget, time) {
  const e = level.exit;
  const open = hasTarget;
  ctx.fillStyle = open ? PALETTE.safe : '#3a2f4d';
  ctx.fillRect(e.x, e.y, e.w, e.h);
  ctx.strokeStyle = open ? '#b8ffbe' : PALETTE.panelEdge;
  ctx.lineWidth = 3;
  ctx.strokeRect(e.x, e.y, e.w, e.h);
  if (open) {
    const a = 0.4 + 0.6 * Math.abs(Math.sin(time * 4));
    ctx.fillStyle = `rgba(126, 224, 129, ${a})`;
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'center';
    ctx.save();
    ctx.translate(e.x + e.w / 2, e.y + e.h / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('EXIT — GO!', 0, 5);
    ctx.restore();
  } else {
    ctx.fillStyle = PALETTE.textDim;
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.save();
    ctx.translate(e.x + e.w / 2, e.y + e.h / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(e.label, 0, 4);
    ctx.restore();
  }
}

export function drawGuards(ctx, guards, solids) {
  for (const g of guards) {
    drawCone(ctx, g.x, g.y, g.angle, GUARD_VIEW_HALF_ANGLE, GUARD_VIEW_RANGE, solids, g.seesPlayer || g.state === 'chase');
    // Guard body: red coat, brass buttons, a flashlight dot.
    ctx.save();
    ctx.translate(g.x, g.y);
    ctx.rotate(g.angle);
    ctx.fillStyle = g.state === 'chase' ? '#ff2e2e' : PALETTE.guardBody;
    ctx.beginPath();
    ctx.arc(0, 0, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffd76a';
    ctx.fillRect(6, -3, 10, 6);
    ctx.fillStyle = PALETTE.guardDark;
    ctx.beginPath();
    ctx.arc(-4, 0, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    // Name tag + state.
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    const tag = g.state === 'chase' ? `${g.name} — AFTER YOU!` : g.state === 'suspicious' ? `${g.name} — ?` : g.name;
    ctx.fillText(tag, g.x, g.y - 22);
    if (g.suspicion > 0.05 && g.state !== 'chase') {
      ctx.fillStyle = '#ffd76a';
      ctx.fillRect(g.x - 16, g.y - 32, 32 * g.suspicion, 3);
    }
  }
}

export function drawCameras(ctx, cameras, solids) {
  for (const cam of cameras) {
    drawCone(ctx, cam.x, cam.y, cam.angle, CAMERA_VIEW_HALF_ANGLE, CAMERA_VIEW_RANGE, solids, cam.seesPlayer);
    ctx.save();
    ctx.translate(cam.x, cam.y);
    ctx.rotate(cam.angle);
    ctx.fillStyle = PALETTE.cameraBody;
    roundRect(ctx, -4, -8, 22, 16, 4);
    ctx.fill();
    ctx.fillStyle = cam.seesPlayer ? '#ff2e2e' : '#20202e';
    ctx.beginPath();
    ctx.arc(18, 0, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    ctx.fillStyle = cam.seesPlayer ? '#ff6b6b' : PALETTE.textDim;
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(cam.seesPlayer ? 'SPOTTED!' : 'CAM', cam.x, cam.y + 26);
  }
}

export function drawPlayer(ctx, player, time) {
  // Sneak = smaller, lower profile.
  const r = player.sneaking ? 10 : 13;
  ctx.save();
  ctx.translate(player.x, player.y);
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.beginPath();
  ctx.ellipse(0, 6, r + 2, r * 0.55, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.rotate(player.angle);
  ctx.fillStyle = PALETTE.player;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();
  // Fox mask: two ears and a snout.
  ctx.fillStyle = PALETTE.playerDark;
  ctx.beginPath();
  ctx.moveTo(4, -r + 2);
  ctx.lineTo(10, -r - 6);
  ctx.lineTo(12, -r + 6);
  ctx.closePath();
  ctx.moveTo(4, r - 2);
  ctx.lineTo(10, r + 6);
  ctx.lineTo(12, r - 6);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#dbe7ff';
  ctx.beginPath();
  ctx.arc(r - 2, 0, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 11px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(player.sneaking ? 'VELVET FOX (sneaking)' : 'VELVET FOX', player.x, player.y - r - 10);
}

export function drawSmokes(ctx, smokes) {
  for (const s of smokes) {
    const a = Math.min(1, s.left / 1.2);
    ctx.fillStyle = `rgba(180, 180, 200, ${0.55 * a})`;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = `rgba(220, 220, 240, ${0.4 * a})`;
    ctx.beginPath();
    ctx.arc(s.x - 20, s.y - 12, s.r * 0.55, 0, Math.PI * 2);
    ctx.arc(s.x + 24, s.y + 10, s.r * 0.5, 0, Math.PI * 2);
    ctx.fill();
  }
}

export function drawCoins(ctx, coins) {
  for (const c of coins) {
    ctx.fillStyle = PALETTE.gold;
    ctx.beginPath();
    ctx.arc(c.x, c.y, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#fff3c4';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(c.x, c.y, 8 + Math.sin(c.age * 6) * 2, 0, Math.PI * 2);
    ctx.stroke();
  }
}

// The HUD: title, loot, clock, tools, and the alarm meter. Always on top.
export function drawHud(ctx, state) {
  ctx.fillStyle = PALETTE.panel;
  ctx.fillRect(0, 0, VIEW_W, 72);
  ctx.strokeStyle = PALETTE.panelEdge;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, 72);
  ctx.lineTo(VIEW_W, 72);
  ctx.stroke();

  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';
  ctx.fillStyle = PALETTE.gold;
  ctx.font = 'bold 24px sans-serif';
  ctx.fillText('VELVET FOX', 20, 26);
  ctx.fillStyle = PALETTE.textDim;
  ctx.font = '14px sans-serif';
  ctx.fillText(state.level.name, 20, 52);

  ctx.fillStyle = PALETTE.text;
  ctx.font = 'bold 20px sans-serif';
  ctx.fillText(`LOOT  $${state.lootValue.toLocaleString('en-US')}`, 330, 26);
  ctx.font = '14px sans-serif';
  ctx.fillStyle = state.hasTarget ? PALETTE.safe : PALETTE.textDim;
  ctx.fillText(state.hasTarget ? '★ STAR secured — get to the EXIT!' : '☆ Grab the STAR, then reach the EXIT', 330, 52);

  const mm = Math.floor(state.timeLeft / 60);
  const ss = Math.floor(state.timeLeft % 60).toString().padStart(2, '0');
  ctx.fillStyle = state.timeLeft < 30 ? PALETTE.alarm : PALETTE.text;
  ctx.font = 'bold 22px sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText(`${mm}:${ss}`, 700, 26);
  ctx.fillStyle = PALETTE.textDim;
  ctx.font = '13px sans-serif';
  ctx.fillText('time left', 700, 52);

  // Alarm meter.
  const ax = 740;
  const aw = 300;
  ctx.textAlign = 'left';
  ctx.fillStyle = state.alarm > 70 ? PALETTE.alarm : PALETTE.text;
  ctx.font = 'bold 15px sans-serif';
  ctx.fillText('ALARM', ax, 20);
  ctx.fillStyle = '#241f33';
  roundRect(ctx, ax, 32, aw, 18, 9);
  ctx.fill();
  const frac = Math.max(0, Math.min(1, state.alarm / 100));
  const grad = ctx.createLinearGradient(ax, 0, ax + aw, 0);
  grad.addColorStop(0, '#ffd76a');
  grad.addColorStop(0.6, '#ff8a3c');
  grad.addColorStop(1, '#ff2e2e');
  ctx.fillStyle = grad;
  if (frac > 0.01) {
    roundRect(ctx, ax, 32, aw * frac, 18, 9);
    ctx.fill();
  }
  ctx.strokeStyle = PALETTE.panelEdge;
  ctx.lineWidth = 1.5;
  roundRect(ctx, ax, 32, aw, 18, 9);
  ctx.stroke();
  ctx.fillStyle = PALETTE.textDim;
  ctx.font = '12px sans-serif';
  ctx.fillText(state.alarm > 70 ? 'HIDE!' : state.alarm > 35 ? 'Suspicious…' : 'Unseen', ax, 62);

  // Tools. (The full key list lives in the page footer under the canvas.)
  ctx.textAlign = 'right';
  ctx.fillStyle = PALETTE.text;
  ctx.font = 'bold 15px sans-serif';
  ctx.fillText(`SMOKE [Q] ×${state.smoke}    COINS [click] ×${state.coins}`, VIEW_W - 20, 26);
}

export function drawOverlay(ctx, title, lines, accent) {
  ctx.fillStyle = 'rgba(8, 6, 14, 0.78)';
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = accent;
  ctx.font = 'bold 54px sans-serif';
  ctx.fillText(title, VIEW_W / 2, 300);
  ctx.fillStyle = PALETTE.text;
  ctx.font = '20px sans-serif';
  lines.forEach((line, i) => ctx.fillText(line, VIEW_W / 2, 370 + i * 34));
  ctx.fillStyle = PALETTE.textDim;
  ctx.font = '16px sans-serif';
  ctx.fillText('Press R to play again · N for the next heist', VIEW_W / 2, 370 + lines.length * 34 + 26);
}
