// Заставка: логотип, иллюстрация, три кнопки слева, "Нажми, чтобы начать".
class TitleScene extends Phaser.Scene {
  constructor() { super('Title'); }

  create() {
    const W = DZ.W, H = DZ.H;
    this.cameras.main.setBackgroundColor('#000000');
    this.cameras.main.fadeIn(400);

    // Свечение и лучи за героем
    const glow = this.add.graphics();
    for (let i = 6; i >= 1; i--) {
      glow.fillStyle(0xff9a30, 0.05 + (6 - i) * 0.02).fillCircle(1000, 430, 70 + i * 55);
    }
    glow.fillStyle(0xffc060, 0.10);
    glow.fillTriangle(1000, 720, 760, 720, 960, 500);
    glow.fillTriangle(1000, 720, 1240, 720, 1040, 500);

    // Красная лента вокруг героя
    const ribbon = this.add.graphics({ x: 1000, y: 430 });
    ribbon.lineStyle(26, 0xd23b3b, 1);
    ribbon.beginPath();
    ribbon.arc(0, 0, 230, Phaser.Math.DegToRad(200), Phaser.Math.DegToRad(500), false);
    ribbon.strokePath();
    ribbon.lineStyle(8, 0xff7a5a, 1);
    ribbon.beginPath();
    ribbon.arc(0, 0, 238, Phaser.Math.DegToRad(210), Phaser.Math.DegToRad(420), false);
    ribbon.strokePath();
    this.tweens.add({ targets: ribbon, angle: 360, duration: 24000, repeat: -1 });

    const hero = this.add.image(1000, 520, 'hero_knight').setScale(9);
    this.tweens.add({ targets: hero, y: 508, duration: 1400, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

    // Логотип
    const logo = this.add.container(110, 130).setAngle(-4);
    const a = UI.text(this, 0, 0, 'Dager', 66, '#ffffff', 0, { strokeThickness: 10, stroke: '#000000' }).setOrigin(0, 0.5);
    const b = UI.text(this, a.width + 6, 0, ':ZERO', 66, '#e23a3a', 0, { strokeThickness: 10, stroke: '#000000' }).setOrigin(0, 0.5);
    logo.add([a, b]);

    // Предупреждение справа сверху
    this.add.text(1080, 24, 'Внимание: сохранения хранятся на устройстве. Если удалить игру, они пропадут.', {
      fontFamily: DZ.FONT, fontSize: '13px', color: '#cfd3dc', wordWrap: { width: 480 }, lineSpacing: 6
    });

    // Кнопки слева
    UI.button(this, 162, 470, 84, 84, '', () => UI.toast(this, 'Новости появятся позже'), 'steel', { icon: UI.iconMegaphone, dot: true });
    UI.button(this, 162, 563, 84, 84, '', () => UI.toast(this, 'Облачные сохранения появятся позже'), 'blue', { icon: UI.iconCloud });
    UI.button(this, 162, 656, 84, 84, '', () => UI.toast(this, 'Настройки появятся позже'), 'wood', { icon: UI.iconGear, dot: true });

    // Нажми, чтобы начать
    const hint = UI.text(this, W / 2, 610, 'Нажми, чтобы начать', 22, '#c8c8d0', 0, { strokeThickness: 4 });
    this.tweens.add({ targets: hint, alpha: 0.25, duration: 800, yoyo: true, repeat: -1 });

    this.add.text(W - 16, H - 14, 'v' + DZ.VERSION, { fontFamily: DZ.FONT, fontSize: '12px', color: '#777a85' }).setOrigin(1, 1);

    this.starting = false;
    this.input.on('pointerdown', (p, over) => {
      if (this.starting || over.length > 0) return;
      this.starting = true;
      this.cameras.main.fadeOut(300);
      this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('Lobby'));
    });
  }
}
