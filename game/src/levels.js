// levels.js — the three heist rooms. Each room is one self-contained plan:
// walls, cover, patrols, cameras, loot, the one big prize and the way out.
// The rooms share the engine; they differ in layout, pressure and mood.
// Room 1 is the cover room: the clearest read of thief + guards + cameras +
// loot + alarm in a single frame.
export const LEVELS = [
  {
    id: 'gallery',
    name: 'The Meridian Gallery',
    sub: 'Heist 1 of 3 — steal the Star of Meridian',
    // Room shell (outer walls are implicit at the room bounds).
    bounds: { x: 90, y: 110, w: 1100, h: 560 },
    walls: [
      // Central vitrine block below the diamond: a ring you must circle.
      { x: 560, y: 390, w: 160, h: 90 },
      // Two side pillars that split the room into lanes.
      { x: 300, y: 190, w: 46, h: 150 },
      { x: 934, y: 420, w: 46, h: 150 },
    ],
    cover: [
      // Display cases: crouch behind them, cones cannot see through.
      { x: 210, y: 180, w: 90, h: 44, label: 'VASES' },
      { x: 210, y: 540, w: 90, h: 44, label: 'MASKS' },
      { x: 980, y: 180, w: 90, h: 44, label: 'COINS' },
      { x: 980, y: 540, w: 90, h: 44, label: 'SCROLLS' },
      { x: 560, y: 180, w: 160, h: 44, label: 'RELICS' },
      { x: 560, y: 540, w: 160, h: 44, label: 'JEWELS' },
    ],
    carpet: { x: 440, y: 300, w: 400, h: 180 },
    guards: [
      {
        name: 'Mara',
        waypoints: [
          { x: 220, y: 160 },
          { x: 480, y: 160 },
          { x: 480, y: 480 },
          { x: 220, y: 480 },
        ],
        speed: 62,
        pause: 1.4,
      },
      {
        name: 'Odo',
        waypoints: [
          { x: 1060, y: 160 },
          { x: 800, y: 160 },
          { x: 800, y: 600 },
          { x: 1060, y: 600 },
        ],
        speed: 58,
        pause: 1.1,
      },
    ],
    cameras: [
      { x: 640, y: 118, baseAngle: Math.PI / 2, sweep: 0.9, speed: 0.55 },
      { x: 640, y: 662, baseAngle: -Math.PI / 2, sweep: 0.9, speed: 0.45 },
    ],
    loot: [
      { x: 255, y: 250, value: 400, kind: 'vase' },
      { x: 255, y: 515, value: 350, kind: 'mask' },
      { x: 1025, y: 250, value: 400, kind: 'coin' },
      { x: 1025, y: 515, value: 350, kind: 'scroll' },
      { x: 640, y: 250, value: 500, kind: 'relic' },
      { x: 640, y: 515, value: 500, kind: 'jewel' },
    ],
    target: { x: 640, y: 315, value: 5000, kind: 'star', label: 'STAR OF MERIDIAN' },
    exit: { x: 90, y: 330, w: 26, h: 120, label: 'SERVICE DOOR' },
    playerStart: { x: 140, y: 390 },
  },
  {
    id: 'vault',
    name: 'The Vault Floor',
    sub: 'Heist 2 of 3 — crack the Meridian vault',
    bounds: { x: 90, y: 110, w: 1100, h: 560 },
    walls: [
      // Vault block in the middle: a ring you must circle.
      { x: 520, y: 260, w: 240, h: 260 },
      { x: 300, y: 150, w: 46, h: 200 },
      { x: 934, y: 420, w: 46, h: 200 },
    ],
    cover: [
      { x: 130, y: 300, w: 60, h: 120, label: 'DESKS' },
      { x: 1120, y: 300, w: 50, h: 120, label: 'DESKS' },
      { x: 700, y: 600, w: 120, h: 40, label: 'CARTS' },
      { x: 740, y: 130, w: 120, h: 40, label: 'CARTS' },
    ],
    carpet: { x: 520, y: 530, w: 240, h: 50 },
    guards: [
      {
        name: 'Ivo',
        waypoints: [
          { x: 200, y: 200 },
          { x: 460, y: 200 },
          { x: 460, y: 620 },
          { x: 200, y: 620 },
        ],
        speed: 66,
        pause: 0.9,
      },
      {
        name: 'Petra',
        waypoints: [
          { x: 1080, y: 200 },
          { x: 820, y: 200 },
          { x: 820, y: 620 },
          { x: 1080, y: 620 },
        ],
        speed: 66,
        pause: 0.9,
      },
      {
        name: 'Bram',
        waypoints: [
          { x: 640, y: 140 },
          { x: 640, y: 230 },
          { x: 1080, y: 140 },
          { x: 200, y: 140 },
        ],
        speed: 74,
        pause: 0.6,
      },
    ],
    cameras: [
      { x: 520, y: 118, baseAngle: Math.PI / 2, sweep: 1.1, speed: 0.7 },
      { x: 760, y: 662, baseAngle: -Math.PI / 2, sweep: 1.1, speed: 0.6 },
    ],
    loot: [
      { x: 215, y: 360, value: 600, kind: 'bars' },
      { x: 1065, y: 360, value: 600, kind: 'bars' },
      { x: 480, y: 620, value: 450, kind: 'cash' },
      { x: 800, y: 200, value: 450, kind: 'cash' },
    ],
    target: { x: 640, y: 555, value: 8000, kind: 'vault', label: 'MERIDIAN VAULT' },
    exit: { x: 1090, y: 330, w: 26, h: 120, label: 'STAIRWELL' },
    playerStart: { x: 140, y: 390 },
  },
  {
    id: 'penthouse',
    name: 'The Penthouse',
    sub: 'Heist 3 of 3 — lift the Meridian crown',
    bounds: { x: 90, y: 110, w: 1100, h: 560 },
    walls: [
      // Open plan: a long bar and a lounge block, little to hide behind.
      { x: 380, y: 300, w: 240, h: 60 },
      { x: 660, y: 440, w: 240, h: 60 },
      { x: 900, y: 180, w: 46, h: 160 },
    ],
    cover: [
      { x: 180, y: 180, w: 110, h: 50, label: 'SOFA' },
      { x: 180, y: 540, w: 110, h: 50, label: 'SOFA' },
      { x: 980, y: 480, w: 110, h: 50, label: 'PIANO' },
      { x: 480, y: 180, w: 140, h: 44, label: 'BAR' },
    ],
    carpet: { x: 380, y: 380, w: 520, h: 140 },
    guards: [
      {
        name: 'Sable',
        waypoints: [
          { x: 300, y: 250 },
          { x: 860, y: 250 },
          { x: 860, y: 560 },
          { x: 300, y: 560 },
        ],
        speed: 70,
        pause: 0.8,
      },
      {
        name: 'Rook',
        waypoints: [
          { x: 1000, y: 620 },
          { x: 1000, y: 160 },
          { x: 420, y: 160 },
          { x: 420, y: 620 },
        ],
        speed: 70,
        pause: 0.8,
      },
    ],
    cameras: [
      { x: 640, y: 118, baseAngle: Math.PI / 2, sweep: 1.2, speed: 0.8 },
      { x: 220, y: 118, baseAngle: Math.PI / 2, sweep: 0.8, speed: 0.6 },
      { x: 1060, y: 662, baseAngle: -Math.PI / 2, sweep: 0.8, speed: 0.6 },
    ],
    loot: [
      { x: 235, y: 255, value: 700, kind: 'watch' },
      { x: 235, y: 505, value: 700, kind: 'watch' },
      { x: 1035, y: 555, value: 900, kind: 'piano' },
      { x: 550, y: 250, value: 800, kind: 'bottle' },
    ],
    target: { x: 640, y: 450, value: 10000, kind: 'crown', label: 'MERIDIAN CROWN' },
    exit: { x: 90, y: 140, w: 26, h: 120, label: 'ROOF DOOR' },
    playerStart: { x: 140, y: 600 },
  },
];
