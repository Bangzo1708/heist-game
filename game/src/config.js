// config.js — shared constants and the visual identity of Velvet Fox.
// One palette, one set of numbers: every other module reads from here so the
// whole game stays in the same midnight-museum mood.
export const VIEW_W = 1280;
export const VIEW_H = 800;

export const PALETTE = {
  floor: '#1c1a26',
  floorTile: '#232030',
  floorTrim: '#2e2a3d',
  wall: '#4a4360',
  wallTop: '#6b6390',
  wallEdge: '#8d84b5',
  cover: '#3a3350', // display cases, crates, planters: safe cover
  coverTop: '#574d78',
  carpet: '#5d2438',
  carpetEdge: '#7a2f49',
  gold: '#f2c14e',
  goldDim: '#b98a2e',
  jewel: '#59d6ff',
  jewelGlow: '#9beaff',
  guardBody: '#c94f4f',
  guardDark: '#8f2f2f',
  cameraBody: '#d8d8e0',
  cone: 'rgba(255, 214, 90, 0.20)',
  coneHot: 'rgba(255, 70, 70, 0.30)',
  player: '#2f6df6',
  playerDark: '#1c46a8',
  alarm: '#ff4d4d',
  safe: '#7ee081',
  text: '#f4eedd',
  textDim: '#b9b2c8',
  panel: 'rgba(12, 10, 20, 0.82)',
  panelEdge: '#6b6390',
};

// Player movement (pixels per second).
export const PLAYER_SPEED = 175;
export const PLAYER_SNEAK_SPEED = 95;
export const PLAYER_RADIUS = 13;

// Alarm: 0..100. Seen by a guard or a camera fills it, hiding drains it.
export const ALARM_FILL_GUARD = 55; // per second while fully seen
export const ALARM_FILL_CAMERA = 40;
export const ALARM_DRAIN = 9; // per second while unseen
export const ALARM_SUSPECT = 35; // above this, guards hurry and cones turn hot

// Tools.
export const SMOKE_START = 3;
export const COIN_START = 5;
export const SMOKE_RADIUS = 95;
export const SMOKE_SECONDS = 4.5;

// Guard senses.
export const GUARD_VIEW_RANGE = 235;
export const GUARD_VIEW_HALF_ANGLE = 0.62; // radians, ~35 degrees each side
export const CAMERA_VIEW_RANGE = 250;
export const CAMERA_VIEW_HALF_ANGLE = 0.5;

// The heist clock: 3 minutes per room.
export const HEIST_SECONDS = 180;
