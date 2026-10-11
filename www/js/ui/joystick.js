// Виртуальный джойстик (мультитач). Для проверки на компьютере работают WASD и стрелки.
class Joystick {
  constructor(scene, x, y, r) {
    this.scene = scene;
    this.x = x; this.y = y; this.r = r;
    this.id = null;
    this.vec = new Phaser.Math.Vector2(0, 0);
    this.base = scene.add.circle(x, y, r, 0xffffff, 0.16).setStrokeStyle(4, 0xffffff, 0.3).setDepth(10);
    this.thumb = scene.add.circle(x, y, r * 0.4, 0xffffff, 0.5).setDepth(11);
    this.keys = scene.input.keyboard ? scene.input.keyboard.addKeys('W,A,S,D,UP,DOWN,LEFT,RIGHT') : null;
    scene.input.on('pointerdown', this.onDown, this);
    scene.input.on('pointermove', this.onMove, this);
    scene.input.on('pointerup', this.onUp, this);
  }

  onDown(p) {
    if (this.id !== null) return;
    if (Phaser.Math.Distance.Between(p.x, p.y, this.x, this.y) < this.r * 1.7) {
      this.id = p.id;
      this.onMove(p);
    }
  }

  onMove(p) {
    if (p.id !== this.id) return;
    const d = new Phaser.Math.Vector2(p.x - this.x, p.y - this.y);
    const len = Math.min(d.length(), this.r);
    if (d.length() > 0) d.normalize();
    this.vec.copy(d).scale(len / this.r);
    if (this.vec.length() < 0.15) this.vec.set(0, 0);
    this.thumb.setPosition(this.x + d.x * len, this.y + d.y * len);
  }

  onUp(p) {
    if (p.id !== this.id) return;
    this.id = null;
    this.vec.set(0, 0);
    this.thumb.setPosition(this.x, this.y);
  }

  update() {
    if (this.id === null && this.keys) {
      const k = this.keys;
      const x = ((k.D.isDown || k.RIGHT.isDown) ? 1 : 0) - ((k.A.isDown || k.LEFT.isDown) ? 1 : 0);
      const y = ((k.S.isDown || k.DOWN.isDown) ? 1 : 0) - ((k.W.isDown || k.UP.isDown) ? 1 : 0);
      this.vec.set(x, y);
      if (x || y) this.vec.normalize();
    }
  }

  destroy() {
    this.scene.input.off('pointerdown', this.onDown, this);
    this.scene.input.off('pointermove', this.onMove, this);
    this.scene.input.off('pointerup', this.onUp, this);
  }
}
