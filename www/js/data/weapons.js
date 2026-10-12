// Оружие. type: 'gun' (тратит энергию) или 'melee' (не тратит).
// cooldown в мс, range в пикселях.
const WEAPONS = {
  pistol: { id: 'pistol', name: 'Пистолет', type: 'gun', damage: 2, cooldown: 260, bulletSpeed: 640, range: 560, energy: 1 },
  sword:  { id: 'sword',  name: 'Меч',      type: 'melee', damage: 5, cooldown: 380, range: 120, energy: 0 }
};
