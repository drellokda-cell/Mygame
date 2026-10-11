// Игрок: движение, направление взгляда, стрельба.
class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, charId) {
    const def = CHARACTERS[charId] || CHARACTERS.knight;
    super(scene, x, y, def.texture);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.def = def;
    this.weapon = WEAPONS[def.weapon];
    this.facing = new Phaser.Math.Vector2(1, 0);
    this.nextShot = 0;
    this.setOrigin(0.5, 0.9);
    this.body.setSize(26, 16).setOffset(11, 40);
    this.setCollideWorldBounds(true);
    this.shadow = scene.add.ellipse(x, y, 36, 12, 0x000000, 0.35);
  }

  move(v) {
    this.setVelocity(v.x * this.def.speed, v.y * this.def.speed);
    if (v.length() > 0.1) {
      this.facing.copy(v).normalize();
      if (Math.abs(v.x) > 0.1) this.setFlipX(v.x < 0);
    }
  }

  shoot(group, now) {
    if (now < this.nextShot) return;
    const w = this.weapon;
    this.nextShot = now + w.cooldown;
    const f = this.facing;
    const b = this.scene.physics.add.image(this.x + f.x * 30, this.y - 20 + f.y * 30, 'bullet');
    group.add(b);
    b.setRotation(Math.atan2(f.y, f.x));
    b.setVelocity(f.x * w.bulletSpeed, f.y * w.bulletSpeed);
    b.setDepth(9000);
    this.scene.time.delayedCall(w.range / w.bulletSpeed * 1000, () => { if (b.active) b.destroy(); });
  }

  preUpdate(t, d) {
    super.preUpdate(t, d);
    const moving = this.body.velocity.length() > 10;
    this.scaleY = moving ? 1 + Math.sin(t / 80) * 0.04 : 1;
    this.shadow.setPosition(this.x, this.y + 2);
    this.shadow.setDepth(this.y - 1);
    this.setDepth(this.y);
  }

  destroy(fromScene) {
    if (this.shadow) this.shadow.destroy();
    super.destroy(fromScene);
  }
}
