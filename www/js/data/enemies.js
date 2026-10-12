// Враги. bw/bh - размер тела, r - радиус для ближнего боя, sy - сдвиг тени.
const ENEMIES = {
  melee:   { tex: 'enemy_slime',  hp: 6,   speed: 105, touch: 2, touchCd: 800, bw: 34, bh: 22, r: 24, sy: 14 },
  shooter: { tex: 'enemy_gunner', hp: 5,   speed: 75,  touch: 0, touchCd: 0,   bw: 26, bh: 30, r: 22, sy: 24, bulletSpeed: 250, dmg: 1, cd: 1700, range: 520 },
  boss:    { tex: 'enemy_boss',   hp: 140, speed: 60,  touch: 2, touchCd: 900, bw: 70, bh: 80, r: 54, sy: 56, dmg: 2 }
};
