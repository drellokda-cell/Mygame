// Интерфейс поверх игры: статы, валюта, пауза, кнопки, мини-карта, полоса босса, меню смерти.
class HUDScene extends Phaser.Scene {
  constructor() { super('HUD'); }

  init(data) { this.target = data.target; }

  create() {
    this.input.addPointer(3);
    this.attackHeld = false;
    this.pauseUI = null; this.deathUI = null; this.lastMap = 0;
    this.joy = new Joystick(this, 250, 580, 90);
    this.buildStats();
    this.buildCurrency();
    this.buildButtons();
    this.buildMinimap();
    this.buildBoss();
    UI.button(this, 1545, 60, 90, 70, '', () => this.openPause(), 'wood', { icon: UI.iconPause }).setDepth(20);
    this.events.once('shutdown', () => { if (this.joy) { this.joy.destroy(); this.joy = null; } });
  }

  now() { return this.game.loop.time; }
  toast(text) { UI.toast(this, text); }

  banner(text) {
    const t = UI.text(this, DZ.W / 2, 250, text, 80, '#ffffff', 0, { strokeThickness: 12 }).setDepth(40).setScale(0.4).setAlpha(0);
    this.tweens.add({ targets: t, scale: 1, alpha: 1, duration: 300, ease: 'Back.easeOut' });
    this.tweens.add({ targets: t, alpha: 0, delay: 1500, duration: 500, onComplete: () => t.destroy() });
  }

  // ---------- построение ----------
  buildStats() {
    const g = this.add.graphics().setDepth(20);
    UI.box(g, 30, 10, 244, 124, 'wood');
    this.bars = [];
    [
      { y: 24, icon: 'ic_heart', color: 0xd23030 },
      { y: 58, icon: 'ic_shield', color: 0x8e97a5 },
      { y: 92, icon: 'ic_gem', color: 0x2f7fe0 }
    ].forEach(r => {
      this.add.image(60, r.y + 14, r.icon).setDepth(21);
      this.add.rectangle(88, r.y + 14, 174, 26, 0x1d1a18).setOrigin(0, 0.5).setDepth(21);
      const fill = this.add.rectangle(90, r.y + 14, 170, 22, r.color).setOrigin(0, 0.5).setDepth(22);
      const text = UI.text(this, 175, r.y + 14, '', 15, '#ffffff', 150).setDepth(23);
      this.bars.push({ fill, text, last: '' });
    });
  }

  setBar(i, cur, max) {
    const b = this.bars[i];
    const str = Math.floor(cur) + '/' + max;
    if (b.last === str) return;
    b.last = str;
    b.text.setText(str);
    if (cur <= 0) b.fill.setVisible(false);
    else b.fill.setVisible(true).setSize(Math.max(2, 170 * cur / max), 22);
  }

  buildCurrency() {
    const pill = (x, w, icon, scale) => {
      const g = this.add.graphics().setDepth(20);
      g.fillStyle(0x000000, 0.45).fillRoundedRect(x, 28, w, 56, 12);
      this.add.image(x + 30, 56, icon).setScale(scale).setDepth(21);
      return UI.text(this, x + 60 + (w - 70) / 2, 57, '', 22, '#ffffff', w - 76).setDepth(21);
    };
    this.gemTxt = pill(1180, 190, 'ic_gem', 1.1);
    this.coinTxt = pill(1384, 130, 'ic_coin', 1);
    this.lastGems = -1; this.lastCoins = -1;
  }

  buildButtons() {
    const hit = (obj, r) => obj.setInteractive(new Phaser.Geom.Circle(r, r, r), Phaser.Geom.Circle.Contains);

    // Атака (она же «взаимодействие» у сундука)
    const atk = this.add.circle(1418, 580, 88, 0x9aa3b0, 0.28).setStrokeStyle(5, 0xcfd6e0, 0.55).setDepth(20);
    const ch = this.add.graphics({ x: 1418, y: 580 }).setDepth(21);
    ch.lineStyle(5, 0xe6ebf2, 0.8).strokeCircle(0, 0, 34);
    ch.fillStyle(0xe6ebf2, 0.8).fillCircle(0, 0, 5);
    ch.fillRect(-3, -52, 6, 18).fillRect(-3, 34, 6, 18).fillRect(-52, -3, 18, 6).fillRect(34, -3, 18, 6);
    hit(atk, 88);
    atk.on('pointerdown', () => { this.attackHeld = true; atk.setAlpha(0.7); });
    atk.on('pointerup', () => { this.attackHeld = false; atk.setAlpha(1); });
    atk.on('pointerout', () => { this.attackHeld = false; atk.setAlpha(1); });

    // Умение x2
    const sk = this.add.circle(1243, 610, 60, 0x2a2d34, 0.92).setStrokeStyle(5, 0x9aa3b0, 1).setDepth(20);
    const sg = this.add.graphics({ x: 1243, y: 610 }).setDepth(21).setRotation(Math.PI / 4);
    UI.dagger(sg, 1);
    this.add.text(1243, 610, 'x2', { fontFamily: DZ.FONT, fontSize: '18px', color: '#ffe08a', stroke: '#1a1210', strokeThickness: 4 }).setOrigin(0.5).setDepth(23);
    this.skillG = this.add.graphics({ x: 1243, y: 610 }).setDepth(22);
    hit(sk, 60);
    sk.on('pointerdown', () => {
      const p = this.target.player;
      if (p && p.useSkill(this.now())) this.toast('Умение: оружие x2');
    });

    // Смена оружия
    const sw = this.add.circle(1418, 412, 58, 0x9aa3b0, 0.22).setStrokeStyle(4, 0xcfd6e0, 0.45).setDepth(20);
    const swg = this.add.graphics({ x: 1418, y: 412 }).setDepth(21);
    swg.lineStyle(5, 0xcfd6e0, 0.75);
    swg.beginPath(); swg.arc(0, 0, 48, Phaser.Math.DegToRad(200), Phaser.Math.DegToRad(330), false); swg.strokePath();
    swg.beginPath(); swg.arc(0, 0, 48, Phaser.Math.DegToRad(20), Phaser.Math.DegToRad(150), false); swg.strokePath();
    swg.fillStyle(0xcfd6e0, 0.75).fillTriangle(40, -34, 52, -22, 28, -20).fillTriangle(-40, 34, -52, 22, -28, 20);
    this.swapGun = this.add.image(1418, 412, 'wp_pistol').setDepth(22);
    this.swapSword = this.add.image(1418, 412, 'wp_sword').setDepth(22).setScale(0.7).setAngle(-30).setVisible(false);
    hit(sw, 58);
    sw.on('pointerdown', () => {
      const p = this.target.player;
      if (!p) return;
      if (p.weapons.length < 2) this.toast('Нет второго оружия. Найди его в сундуке');
      else p.swap();
    });
    const badge = this.add.graphics().setDepth(22);
    badge.fillStyle(0x2f7fe0, 1).fillPoints([{ x: 1372, y: 366 }, { x: 1394, y: 388 }, { x: 1372, y: 410 }, { x: 1350, y: 388 }], true);
    this.costTxt = this.add.text(1372, 388, '0', { fontFamily: DZ.FONT, fontSize: '14px', color: '#ffffff', stroke: '#0b2a4a', strokeThickness: 3 }).setOrigin(0.5).setDepth(23);

    // Эмоция
    const em = this.add.circle(1153, 430, 32, 0xcfd6e0, 0.35).setStrokeStyle(4, 0xe6ebf2, 0.55).setDepth(20);
    const eg = this.add.graphics({ x: 1153, y: 430 }).setDepth(21);
    eg.fillStyle(0xe6ebf2, 0.9).fillRect(-12, -10, 6, 8).fillRect(6, -10, 6, 8);
    eg.lineStyle(4, 0xe6ebf2, 0.9);
    eg.beginPath(); eg.arc(0, 2, 12, 0.3, Math.PI - 0.3, false); eg.strokePath();
    hit(em, 32);
    em.on('pointerdown', () => this.toast('Эмоции появятся позже'));
  }

  buildMinimap() {
    this.hasMap = typeof this.target.getMapData === 'function';
    this.mm = this.add.graphics().setDepth(20);
    if (!this.hasMap) return;
    this.stageTxt = UI.text(this, 1485, 300, this.target.stageLabel || '', 22, '#ffffff', 120).setDepth(21);
  }

  buildBoss() {
    this.bossG = this.add.graphics().setDepth(20).setVisible(false);
    this.bossTxt = UI.text(this, 800, 30, 'Босс', 16, '#ffffff', 200).setDepth(22).setVisible(false);
  }

  // ---------- обновление ----------
  update(time) {
    if (!this.joy) return;
    this.joy.update();
    const p = this.target.player;
    if (!p) return;
    const now = this.now();

    this.setBar(0, p.hp, p.hpMax);
    this.setBar(1, p.armor, p.armorMax);
    this.setBar(2, p.energy, p.energyMax);

    const gems = Save.get('gems', 0), coins = Save.get('coins', 0);
    if (gems !== this.lastGems) { this.lastGems = gems; this.gemTxt.setText(String(gems)); }
    if (coins !== this.lastCoins) { this.lastCoins = coins; this.coinTxt.setText(String(coins)); }

    const w = p.weapon();
    this.swapGun.setVisible(w.type === 'gun');
    this.swapSword.setVisible(w.type !== 'gun');
    this.costTxt.setText(String(this.target.freeAmmo ? 0 : w.energy * (p.ultActive(now) ? 2 : 1)));

    // кнопка умения: перезарядка или активное состояние
    const st = p.skillState(now), g = this.skillG;
    g.clear();
    if (st.active) {
      g.lineStyle(6, 0xffd24a, 1).strokeCircle(0, 0, 60);
    } else if (st.frac > 0) {
      g.fillStyle(0x000000, 0.6);
      g.slice(0, 0, 56, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * st.frac, false);
      g.fillPath();
    }

    if (this.hasMap && now - this.lastMap > 100) { this.lastMap = now; this.drawMap(); }

    const boss = this.target.boss;
    if (boss && boss.active) {
      const g2 = this.bossG;
      g2.setVisible(true).clear();
      g2.fillStyle(0x1a1210, 1).fillRect(498, 16, 604, 26);
      g2.fillStyle(0xb02828, 1).fillRect(502, 20, 596 * Math.max(0, boss.hp) / boss.hpMax, 18);
      this.bossTxt.setVisible(true).setPosition(800, 56);
    } else if (this.bossG.visible) {
      this.bossG.setVisible(false);
      this.bossTxt.setVisible(false);
    }
  }

  drawMap() {
    const d = this.target.getMapData();
    const g = this.mm;
    g.clear();
    g.fillStyle(0x000000, 0.45).fillRoundedRect(1385, 118, 200, 170, 10);
    const s = Math.min(184 / d.w, 154 / d.h);
    const ox = 1485 - d.w * s / 2, oy = 203 - d.h * s / 2;
    d.links.forEach(l => {
      if (!l.show) return;
      g.fillStyle(0x6a7488, 1).fillRect(ox + l.x * s, oy + l.y * s, Math.max(3, l.w * s), Math.max(3, l.h * s));
    });
    d.rooms.forEach(r => {
      if (!r.seen) return;
      let c = r.visited ? 0x55627a : 0x2c3446;
      if (r.type === 'portal') c = 0x6a3fd0;
      else if (r.type === 'boss') c = r.state === 'cleared' ? 0x55627a : 0x8a2a2a;
      else if (r.state === 'combat') c = 0x8a4a2a;
      g.fillStyle(c, 1).fillRect(ox + r.x * s, oy + r.y * s, r.w * s, r.h * s);
      if (r.cur) g.lineStyle(2, 0xffffff, 1).strokeRect(ox + r.x * s, oy + r.y * s, r.w * s, r.h * s);
    });
    g.fillStyle(0x4cff6a, 1).fillCircle(ox + d.px * s, oy + d.py * s, 4);
  }

  // ---------- меню ----------
  openPause() {
    if (this.pauseUI || this.deathUI) return;
    this.attackHeld = false;
    this.target.setPaused(true);
    const c = this.add.container(0, 0).setDepth(3000);
    const dim = this.add.rectangle(DZ.W / 2, DZ.H / 2, DZ.W, DZ.H, 0x000000, 0.6).setInteractive();
    const g = this.add.graphics();
    UI.box(g, 560, 150, 480, 400, 'panel');
    const title = UI.text(this, 800, 215, 'Пауза', 34, '#ffffff', 400);
    const close = () => { c.destroy(); this.pauseUI = null; this.target.setPaused(false); };
    const b1 = UI.button(this, 800, 330, 360, 80, 'Продолжить', close, 'wood', { size: 24 });
    const b2 = UI.button(this, 800, 440, 360, 80, 'В меню', () => this.toMenu(), 'woodDark', { size: 24 });
    c.add([dim, g, title, b1, b2]);
    this.pauseUI = c;
  }

  openDeath() {
    if (this.deathUI) return;
    this.attackHeld = false;
    if (this.pauseUI) { this.pauseUI.destroy(); this.pauseUI = null; }
    const c = this.add.container(0, 0).setDepth(3000);
    const dim = this.add.rectangle(DZ.W / 2, DZ.H / 2, DZ.W, DZ.H, 0x000000, 0.7).setInteractive();
    const g = this.add.graphics();
    UI.box(g, 540, 130, 520, 440, 'panel');
    const title = UI.text(this, 800, 205, 'Вы погибли', 36, '#e24a4a', 460);
    const sub = UI.text(this, 800, 262, 'Воскреснуть и продолжить?', 16, '#cfd3dc', 440);
    const b1 = UI.button(this, 800, 350, 400, 84, 'Воскреснуть: 500', () => {
      if (Save.get('gems', 0) < 500) { this.toast('Не хватает кристаллов'); return; }
      Save.add('gems', -500);
      Save.write();
      c.destroy();
      this.deathUI = null;
      this.target.revive();
    }, 'blue', { size: 24 });
    const b2 = UI.button(this, 800, 460, 400, 84, 'Главное меню', () => this.toMenu(), 'woodDark', { size: 24 });
    c.add([dim, g, title, sub, b1, b2]);
    this.deathUI = c;
  }

  toMenu() {
    Run.reset();
    Save.write();
    const t = this.target;
    t.scene.stop('HUD');
    t.scene.start('Title');
  }
}
