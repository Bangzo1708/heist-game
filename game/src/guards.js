// guards.js — patrol AI. A guard walks its waypoints, pauses to look around,
// and reacts in three steps: suspicious (walks to the noise), alert (chases
// what it saw), and back to patrol when the trail goes cold. Cameras sweep
// a fixed arc and never move — read the arc, time the crossing.
import { canSee, dist, collideCircle } from './vision.js';
import { GUARD_VIEW_RANGE, GUARD_VIEW_HALF_ANGLE, CAMERA_VIEW_RANGE, CAMERA_VIEW_HALF_ANGLE } from './config.js';

export class Guard {
  constructor(def) {
    this.name = def.name;
    this.waypoints = def.waypoints;
    this.speed = def.speed;
    this.pause = def.pause;
    this.x = def.waypoints[0].x;
    this.y = def.waypoints[0].y;
    this.wpIndex = 1;
    this.angle = 0;
    this.wait = 0;
    this.state = 'patrol'; // patrol | suspicious | chase
    this.stateTime = 0;
    this.target = null;
    this.seesPlayer = false;
    this.suspicion = 0; // 0..1, grows while the player is half-seen
  }

  update(dt, player, solids, smokes, alarmHot, bounds) {
    this.stateTime += dt;
    this.seesPlayer = canSee(
      this.x, this.y, this.angle, GUARD_VIEW_HALF_ANGLE, GUARD_VIEW_RANGE,
      player.x, player.y, solids, player.sneaking, smokes,
    );
    const speed = this.state === 'chase' ? this.speed * 1.75 : this.speed;

    if (this.seesPlayer) {
      this.suspicion = Math.min(1, this.suspicion + dt * 2.2);
      if (this.suspicion > 0.55 || alarmHot) {
        this.state = 'chase';
        this.stateTime = 0;
        this.target = { x: player.x, y: player.y };
      }
    } else if (this.state === 'chase') {
      this.suspicion = Math.max(0, this.suspicion - dt * 0.4);
      if (this.stateTime > 3.5) {
        this.state = 'patrol';
        this.stateTime = 0;
        this.target = null;
      }
    } else {
      this.suspicion = Math.max(0, this.suspicion - dt * 0.5);
    }

    if (this.state === 'chase' && this.target) {
      this.target = { x: player.x, y: player.y };
      this.walkToward(this.target.x, this.target.y, speed, dt);
    } else if (this.state === 'suspicious' && this.target) {
      this.walkToward(this.target.x, this.target.y, speed, dt);
      if (dist(this.x, this.y, this.target.x, this.target.y) < 14) {
        this.state = 'patrol';
        this.stateTime = 0;
        this.target = null;
        this.wait = 1.2;
      }
    } else {
      if (this.wait > 0) {
        this.wait -= dt;
        this.angle += dt * 0.7; // look around while paused
      } else {
        const wp = this.waypoints[this.wpIndex];
        const arrived = this.walkToward(wp.x, wp.y, speed, dt);
        if (arrived) {
          this.wait = this.pause;
          this.wpIndex = (this.wpIndex + 1) % this.waypoints.length;
        }
      }
    }

    // Guards never clip through a wall or a display case, even if a
    // waypoint line cuts a corner: the room pushes them back out.
    if (bounds) collideCircle(this, 14, solids, bounds);
  }

  // Walk toward a point; returns true when arrived. Also sets facing.
  walkToward(tx, ty, speed, dt) {
    const d = dist(this.x, this.y, tx, ty);
    if (d < 6) return true;
    this.angle = Math.atan2(ty - this.y, tx - this.x);
    const step = Math.min(d, speed * dt);
    this.x += ((tx - this.x) / d) * step;
    this.y += ((ty - this.y) / d) * step;
    return d - step < 6;
  }

  investigate(x, y) {
    if (this.state === 'chase') return;
    this.state = 'suspicious';
    this.stateTime = 0;
    this.target = { x, y };
  }
}

export class Camera {
  constructor(def) {
    this.x = def.x;
    this.y = def.y;
    this.baseAngle = def.baseAngle;
    this.sweep = def.sweep;
    this.speed = def.speed;
    this.phase = 0;
    this.angle = def.baseAngle;
    this.seesPlayer = false;
  }

  update(dt, player, solids, smokes) {
    this.phase += dt * this.speed;
    this.angle = this.baseAngle + Math.sin(this.phase) * this.sweep;
    this.seesPlayer = canSee(
      this.x, this.y, this.angle, CAMERA_VIEW_HALF_ANGLE, CAMERA_VIEW_RANGE,
      player.x, player.y, solids, player.sneaking, smokes,
    );
  }
}
