// Враги: melee (бежит и бьёт), shooter (держит дистанцию и стреляет), boss.
class Enemy extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, kind, mult) {
    const d = ENEMIES[kind];
    super(scene, x, y, d.tex);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    scene.enemies.add(this);
    this.kind = kind; this.def = d;
    this.hp = Math.round(d.hp * (mult || 1)); this.hpMax = this.hp;
    this.hitR = d.r;
    this.body.setSize(d.bw, d.bh, true);
    const now = scene.game.loop.time;
    this.activeAt = now + 700;
    this.nextShot = now + 1200 + Math.random() * 800;
    this.touchAt = 0; this.knockUntil = 0; this.pat = 0; this.dying = false;
    this.shadow = scene.add.ellipse(x, y, d.bw + 12, 12, 0x000000, 0.35);
    this.setAlpha(0);
    scene.tweens.add({ targets: this, alpha: 1, duration: 500 });
  }

  canTouch(now) {
    if (!this.def.touch || now < this.activeAt || now < this.touchAt) return false;
    this.touchAt = now + this.def.touchCd;
    return true;
  }

  hit(dmg, now, ang) {
    if (!this.active || this.dying) return;
    this.hp -= dmg;
    this.setTintFill(0xffffff);
    this.scene.time.delayedCall(70, () => { if (this.active) this.clearTint(); });
    if (this.kind !== 'boss' && ang !== undefined) {
      this.knockUntil = now + 110;
      this.setVelocity(Math.cos(ang) * 240, Math.sin(ang) * 240);
    }
    if (this.hp <= 0) {
      this.dying = true;
      this.scene.onEnemyDeath(this);
    }
  }

  shoot(ang, speed, dmg) {
    const sc = this.scene;
    const b = sc.physics.add.image(this.x, this.y, 'ebullet');
    sc.eBullets.add(b);
    b.setVelocity(Math.cos(ang) * speed, Math.sin(ang) * speed);
    b.setDepth(9000);
    b.dmg = dmg;
    sc.time.delayedCall(2600, () => { if (b.active) b.destroy(); });
  }

  tick(now, p) {
    if (!this.active || this.dying) return;
    this.shadow.setPosition(this.x, this.y + this.def.sy).setDepth(this.y - 1);
    this.setDepth(this.y);
    if (now < this.knockUntil) return;
    if (now < this.activeAt || p.dead) { this.setVelocity(0, 0); return; }
    const dx = p.x - this.x, dy = (p.y - 14) - this.y;
    const dist = Math.hypot(dx, dy) || 1, ang = Math.atan2(dy, dx), sp = this.def.speed;
    this.setFlipX(dx < 0);
    if (this.kind === 'melee') {
      this.setVelocity(dx / dist * sp, dy / dist * sp);
    } else if (this.kind === 'shooter') {
      if (dist > 340) this.setVelocity(dx / dist * sp, dy / dist * sp);
      else if (dist < 210) this.setVelocity(-dx / dist * sp, -dy / dist * sp);
      else this.setVelocity(-dy / dist * sp * 0.6, dx / dist * sp * 0.6);
      if (now >= this.nextShot && dist < this.def.range) {
        this.shoot(ang + (Math.random() - 0.5) * 0.15, this.def.bulletSpeed, this.def.dmg);
        this.nextShot = now + this.def.cd;
      }
    } else {
      if (dist > 230) this.setVelocity(dx / dist * sp, dy / dist * sp); else this.setVelocity(0, 0);
      if (now >= this.nextShot) {
        this.pat++;
        if (this.pat % 2) {
          const rot = Math.random() * 6.28;
          for (let i = 0; i < 16; i++) this.shoot(rot + i * Math.PI / 8, 200, this.def.dmg);
        } else {
          for (let k = -1; k <= 1; k++) this.shoot(ang + k * 0.28, 270, this.def.dmg);
        }
        this.nextShot = now + 1900;
      }
    }
  }

  destroy(fromScene) {
    if (this.shadow) this.shadow.destroy();
    super.destroy(fromScene);
  }
        }
