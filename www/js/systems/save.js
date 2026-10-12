// Сохранения в памяти телефона (localStorage внутри APK работает офлайн).
const Save = {
  KEY: 'dagerzero_save_v1',
  data: {},
  load() {
    try { this.data = JSON.parse(localStorage.getItem(this.KEY)) || {}; }
    catch (e) { this.data = {}; }
    if (this.data.gems === undefined) this.data.gems = 1000;
    if (this.data.coins === undefined) this.data.coins = 0;
    if (!this.data.hero) this.data.hero = 'knight';
    return this.data;
  },
  write() {
    try { localStorage.setItem(this.KEY, JSON.stringify(this.data)); } catch (e) {}
  },
  get(k, def) { return this.data[k] === undefined ? def : this.data[k]; },
  set(k, v) { this.data[k] = v; this.write(); },
  // добавить без записи на диск (запись делаем в безопасные моменты)
  add(k, n) { this.data[k] = (this.data[k] || 0) + n; }
};
