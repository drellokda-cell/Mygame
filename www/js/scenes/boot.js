// Загрузка: ждём шрифт, рисуем текстуры, идём на заставку.
class BootScene extends Phaser.Scene {
  constructor() { super('Boot'); }

  create() {
    let started = false;
    const go = () => {
      if (started) return;
      started = true;
      Art.build(this);
      ArtDungeon.build(this);
      this.scene.start('Title');
    };
    const f = document.fonts;
    if (!f || !f.load) { go(); return; }
    Promise.race([
      Promise.all([f.load('20px PixelFont', 'Abc'), f.load('20px PixelFont', 'Абв')]),
      new Promise(r => setTimeout(r, 2000))
    ]).then(go).catch(go);
  }
}
