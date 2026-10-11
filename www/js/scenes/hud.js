// Интерфейс поверх игры (отдельная сцена, камера не двигается): статы, валюта, пауза, кнопки управления.
class HUDScene extends Phaser.Scene {
  constructor() { super('HUD'); }

  init(data) { this.target = data.target; }

  create() {
    this.input.addPointer(3);
    this.attackHeld = false;
    this.pauseUI = null;
    this.joy = new Joystick(this, 250, 580, 90);
    this.buildStats();
    this.buildCurrency();
    this.buildButtons();
    UI.button(this, 1545, 60, 90, 70, '', () => this.openPause(), 'wood', { icon: UI.iconPause }).setDepth(20);
    this.events.once('shutdown', () => { this.joy.destroy(); this.joy = null; });
  }

  update() { if (this.joy) this.joy.update(); }

  toast(text) { UI.toast(this, text); }

  buildStats() {
    const def = CHARACTERS[Save.get('hero', 'knight')] || CHARACTERS.knight;
    const g = this.add.graphics().setDepth(20);
    UI.box(g, 30, 10, 244, 124, 'wood');
    const rows = [
      { y: 24, icon: 'ic_heart', color: 0xd23030, text: def.hp + '/' + def.hp },
      { y: 58, icon: 'ic_shield', color: 0x8e97a5, text: def.armor + '/' + def.armor },
      { y: 92, icon: 'ic_gem', color: 0x2f7fe0, text: def.energy + '/' + def.energy }
    ];
    rows.forEach(r => {
      this.add.image(60, r.y + 14, r.icon).setDepth(21);
      this.add.rectangle(88, r.y + 14, 174, 26, 0x1d1a18).setOrigin(0, 0.5).setDepth(21);
      this.add.rectangle(90, r.y + 14, 170, 22, r.color).setOrigin(0, 0.5).setDepth(22);
      UI.text(this, 175, r.y + 14, r.text, 15, '#ffffff', 150).setDepth(23);
    });
  }

  buildCurrency() {
    const pill = (x, w, icon, str, scale) => {
      const g = this.add.graphics().setDepth(20);
      g.fillStyle(0x000000, 0.45).fillRoundedRect(x, 28, w, 56, 12);
      this.add.image(x + 30, 56, icon).setScale(scale || 1).setDepth(21);
      UI.text(this, x + 60 + (w - 70) / 2, 57, str, 22, '#ffffff', w - 76).setDepth(21);
    };
    pill(1180, 190, 'ic_gem', String(Save.get('gems', 0)), 1.1);
    pill(1384, 130, 'ic_coin', String(Save.get('coins', 0)), 1);
  }

  buildButtons() {
    const hit = (obj, r) => obj.setInteractive(new Phaser.Geom.Circle(r, r, r), Phaser.Geom.Circle.Contains);

    // Атака
    const atk = this.add.circle(1418, 580, 88, 0x9aa3b0, 0.28).setStrokeStyle(5, 0xcfd6e0, 0.55).setDepth(20);
    const ch = this.add.graphics({ x: 1418, y: 580 }).setDepth(21);
    ch.lineStyle(5, 0xe6ebf2, 0.8).strokeCircle(0, 0, 34);
    ch.fillStyle(0xe6ebf2, 0.8).fillCircle(0, 0, 5);
    ch.fillRect(-3, -52, 6, 18).fillRect(-3, 34, 6, 18).fillRect(-52, -3, 18, 6).fillRect(34, -3, 18, 6);
    hit(atk, 88);
    atk.on('pointerdown', () => { this.attackHeld = true; atk.setAlpha(0.7); });
    atk.on('pointerup', () => { this.attackHeld = false; atk.setAlpha(1); });
    atk.on('pointerout', () => { this.attackHeld = false; atk.setAlpha(1); });

    // Умение
    const sk = this.add.circle(1243, 610, 60, 0x2a2d34, 0.92).setStrokeStyle(5, 0x9aa3b0, 1).setDepth(20);
    const sg = this.add.graphics({ x: 1243, y: 610 }).setDepth(21).setRotation(Math.PI / 4);
    UI.dagger(sg, 1);
    hit(sk, 60);
    sk.on('pointerdown', () => this.toast('Умение героя появится позже'));

    // Смена оружия
    const sw = this.add.circle(1418, 412, 58, 0x9aa3b0, 0.22).setStrokeStyle(4, 0xcfd6e0, 0.45).setDepth(20);
    const swg = this.add.graphics({ x: 1418, y: 412 }).setDepth(21);
    swg.lineStyle(5, 0xcfd6e0, 0.75);
    swg.beginPath(); swg.arc(0, 0, 48, Phaser.Math.DegToRad(200), Phaser.Math.DegToRad(330), false); swg.strokePath();
    swg.beginPath(); swg.arc(0, 0, 48, Phaser.Math.DegToRad(20), Phaser.Math.DegToRad(150), false); swg.strokePath();
    swg.fillStyle(0xcfd6e0, 0.75).fillTriangle(40, -34, 52, -22, 28, -20).fillTriangle(-40, 34, -52, 22, -28, 20);
    swg.fillStyle(0x6a7080, 1).fillRect(-14, -4, 24, 10).fillRect(-14, 4, 8, 12);
    hit(sw, 58);
    sw.on('pointerdown', () => this.toast('Второе оружие появится позже'));

    // Эмоция
    const em = this.add.circle(1153, 430, 32, 0xcfd6e0, 0.35).setStrokeStyle(4, 0xe6ebf2, 0.55).setDepth(20);
    const eg = this.add.graphics({ x: 1153, y: 430 }).setDepth(21);
    eg.fillStyle(0xe6ebf2, 0.9).fillRect(-12, -10, 6, 8).fillRect(6, -10, 6, 8);
    eg.lineStyle(4, 0xe6ebf2, 0.9);
    eg.beginPath(); eg.arc(0, 2, 12, 0.3, Math.PI - 0.3, false); eg.strokePath();
    hit(em, 32);
    em.on('pointerdown', () => this.toast('Эмоции появятся позже'));
  }

  openPause() {
    if (this.pauseUI) return;
    this.target.setPaused(true);
    const c = this.add.container(0, 0).setDepth(3000);
    const dim = this.add.rectangle(DZ.W / 2, DZ.H / 2, DZ.W, DZ.H, 0x000000, 0.6).setInteractive();
    const g = this.add.graphics();
    UI.box(g, 560, 150, 480, 400, 'panel');
    const title = UI.text(this, 800, 215, 'Пауза', 34, '#ffffff', 400);
    const close = () => { c.destroy(); this.pauseUI = null; this.target.setPaused(false); };
    const b1 = UI.button(this, 800, 330, 360, 80, 'Продолжить', close, 'wood', { size: 24 });
    const b2 = UI.button(this, 800, 440, 360, 80, 'В меню', () => {
      c.destroy();
      this.pauseUI = null;
      const t = this.target;
      t.scene.stop('HUD');
      t.scene.start('Title');
    }, 'woodDark', { size: 24 });
    c.add([dim, g, title, b1, b2]);
    this.pauseUI = c;
  }
}
