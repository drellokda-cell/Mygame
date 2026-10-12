// Состояние текущего забега (между уровнями 1-1 ... 1-5).
const Run = {
  stage: 1,
  state: null, // здоровье, броня, энергия и оружие, которые переходят на следующий уровень
  reset() { this.stage = 1; this.state = null; },
  keep(player) { this.state = player.snapshot(); }
};
