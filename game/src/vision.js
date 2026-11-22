// vision.js — seeing and being seen. Everything a guard or a camera can
// spot is decided here: angle, range, and a clear line of sight past walls
// and cover. Smoke clouds block sight the same way a wall does.
export function dist(ax, ay, bx, by) {
  return Math.hypot(bx - ax, by - ay);
}

// True when the segment (x1,y1)-(x2,y2) touches any rectangle in `solids`.
export function segmentBlocked(x1, y1, x2, y2, solids) {
  for (const r of solids) {
    if (segmentHitsRect(x1, y1, x2, y2, r)) return true;
  }
  return false;
}

export function segmentHitsRect(x1, y1, x2, y2, r) {
  // Liang-Barsky clip of the segment against the rectangle.
  const dx = x2 - x1;
  const dy = y2 - y1;
  let t0 = 0;
  let t1 = 1;
  const p = [-dx, dx, -dy, dy];
  const q = [x1 - r.x, r.x + r.w - x1, y1 - r.y, r.y + r.h - y1];
  for (let i = 0; i < 4; i++) {
    if (p[i] === 0) {
      if (q[i] < 0) return false;
    } else {
      const t = q[i] / p[i];
      if (p[i] < 0) {
        if (t > t1) return false;
        if (t > t0) t0 = t;
      } else {
        if (t < t0) return false;
        if (t < t1) t1 = t;
      }
    }
  }
  return true;
}

// Distance from (ox,oy) along `angle` to the nearest solid, capped at `max`.
export function rayDistance(ox, oy, angle, max, solids) {
  let best = max;
  const dx = Math.cos(angle);
  const dy = Math.sin(angle);
  for (const r of solids) {
    const hit = rayRect(ox, oy, dx, dy, r);
    if (hit !== null && hit < best) best = hit;
  }
  return best;
}

function rayRect(ox, oy, dx, dy, r) {
  let tmin = 0;
  let tmax = Infinity;
  if (dx === 0) {
    if (ox < r.x || ox > r.x + r.w) return null;
  } else {
    const inv = 1 / dx;
    let t1 = (r.x - ox) * inv;
    let t2 = (r.x + r.w - ox) * inv;
    if (t1 > t2) [t1, t2] = [t2, t1];
    tmin = Math.max(tmin, t1);
    tmax = Math.min(tmax, t2);
    if (tmin > tmax) return null;
  }
  if (dy === 0) {
    if (oy < r.y || oy > r.y + r.h) return null;
  } else {
    const inv = 1 / dy;
    let t1 = (r.y - oy) * inv;
    let t2 = (r.y + r.h - oy) * inv;
    if (t1 > t2) [t1, t2] = [t2, t1];
    tmin = Math.max(tmin, t1);
    tmax = Math.min(tmax, t2);
    if (tmin > tmax) return null;
  }
  return tmin;
}

// Vision-cone polygon for drawing: sample rays across the cone, each clipped
// by walls, so the cone hugs the room instead of painting through it.
export function conePolygon(x, y, angle, halfAngle, range, solids, steps = 26) {
  const pts = [{ x, y }];
  for (let i = 0; i <= steps; i++) {
    const a = angle - halfAngle + (2 * halfAngle * i) / steps;
    const d = rayDistance(x, y, a, range, solids);
    pts.push({ x: x + Math.cos(a) * d, y: y + Math.sin(a) * d });
  }
  return pts;
}

// Is the thief (px,py) visible from (ox,oy) facing `angle`?
// Sneaking halves the visible range; smoke and cover block the line.
export function canSee(ox, oy, angle, halfAngle, range, px, py, solids, sneaking, smokes) {
  const d = dist(ox, oy, px, py);
  const effective = sneaking ? range * 0.55 : range;
  if (d > effective) return false;
  let da = Math.atan2(py - oy, px - ox) - angle;
  while (da > Math.PI) da -= Math.PI * 2;
  while (da < -Math.PI) da += Math.PI * 2;
  if (Math.abs(da) > halfAngle) return false;
  if (segmentBlocked(ox, oy, px, py, solids)) return false;
  for (const s of smokes) {
    if (segmentBlocked(ox, oy, px, py, [{ x: s.x - s.r, y: s.y - s.r, w: s.r * 2, h: s.r * 2 }])) {
      return false;
    }
  }
  return true;
}

// Keep a circle of radius r inside the room and out of solid rectangles.
export function collideCircle(pos, r, solids, bounds) {
  pos.x = Math.max(bounds.x + r, Math.min(bounds.x + bounds.w - r, pos.x));
  pos.y = Math.max(bounds.y + r, Math.min(bounds.y + bounds.h - r, pos.y));
  for (const s of solids) {
    const cx = Math.max(s.x, Math.min(pos.x, s.x + s.w));
    const cy = Math.max(s.y, Math.min(pos.y, s.y + s.h));
    const dx = pos.x - cx;
    const dy = pos.y - cy;
    const d2 = dx * dx + dy * dy;
    if (d2 < r * r) {
      if (d2 === 0) {
        pos.y = s.y - r;
      } else {
        const d = Math.sqrt(d2);
        pos.x = cx + (dx / d) * r;
        pos.y = cy + (dy / d) * r;
      }
    }
  }
}
