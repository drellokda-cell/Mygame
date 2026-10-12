// Игрок: движение, автоприцел, стрельба, ближний бой, щит/здоровье/энергия, умение x2.
class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, charId) {
    const def = CHARACTERS[charId] || CHARACTERS.knight;
    super(scene, x, y, def.texture);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.def = def;
    const st = Run.state;
    this.hpMax = def.hp; this.armorMax = def.armor; this.energyMax = def.energy;
    this.hp = st ? st.hp : def.hp;
    this.armor = st ? st.armor : def.armor;
    this.energy = st ? st.energy : def.energy;
    this.weapons = st ? st.weapons.slice() : [def.weapon];
    this.idx = st ? st.idx : 0;
    this.facing = new Phaser.Math.Vector2(1, 0);
    this.nextAttack = 0; this.lastHit = -99999; this.nextRegen = 0;
    this.invulUntil = 0; this.ultUntil = 0; this.ultReadyAt = 0;
    this.dead = false; this.swing = 0;
    this.setOrigin(0.5, 0.9);
    this.body.setSize(26, 16).setOffset(11, 40);
    this.setCollideWorldBounds(true);
    this.shadow = scene.add.ellipse(x, y, 36, 12, 0x000000, 0.35);
    this.hand = scene.add.image(x, y, 'wp_pistol');
    this.hand2 = scene.add.image(x, y, 'wp_pistol').setVisible(false);
  }

  snapshot() { return { hp: this.hp, armor: this.armor, energy: this.energy, weapons: this.weapons.slice(), idx: this.idx }; }
  weapon() { return WEAPONS[this.weapons[this.idx]]; }
  swap() { if (this.weapons.length > 1) this.idx = (this.idx + 1) % this.weapons.length; }
  addWeapon(id) {
    if (this.weapons.indexOf(id) !== -1) { this.idx = this.weapons.indexOf(id); return; }
    if (this.weapons.length >= 2) this.weapons[this.idx] = id; else { this.weapons.push(id); this.idx = this.weapons.length - 1; }
  }
  heal(n) { this.hp = Math.min(this.hpMax, this.hp + n); }
  addEnergy(n) { this.energy = Math.min(this.energyMax, this.energy + n); }
  ultActive(now) { return now < this.ultUntil; }

  // для кнопки умения: {active, frac} frac 0..1 (сколько осталось)
  skillState(now) {
    if (this.ultActive(now)) return { active: true, frac: (this.ultUntil - now) / 6000 };
    return { active: false, frac: Math.max(0, (this.ultReadyAt - now) / 10000) };
  }

  useSkill(now) {
    if (this.dead || now < this.ultReadyAt) return false;
    this.ultUntil = now + 6000;
    this.ultReadyAt = now + 16000;
    return true;
  }

  move(v) {
    if (this.dead) { this.setVelocity(0, 0); return; }
    this.setVelocity(v.x * this.def.speed, v.y * this.def.speed);
    if (v.length() > 0.1) {
      this.facing.copy(v).normalize();
      if (Math.abs(v.x) > 0.1) this.setFlipX(v.x < 0);
    }
  }

  attack(now) {
    if (this.dead || now < this.nextAttack) return false;
    const w = this.weapon(), sc = this.scene, ult = this.ultActive(now);
    const tgt = sc.nearestEnemy ? sc.nearestEnemy(this.x, this.y, w.type === 'melee' ? 180 : 560) : null;
    if (tgt) {
      this.facing.set(tgt.x - this.x, tgt.y - (this.y - 20)).normalize();
      this.setFlipX(this.facing.x < 0);
    }
    const ang = Math.atan2(this.facing.y, this.facing.x);
    if (w.type === 'gun') {
      const mult = ult ? 2 : 1;
      const cost = sc.freeAmmo ? 0 : w.energy * mult;
      if (this.energy < cost) {
        this.nextAttack = now + 300;
        if (sc.noEnergy) sc.noEnergy(now);
        return false;
      }
      this.energy -= cost;
      this.nextAttack = now + w.cooldown;
      for (let i = 0; i < mult; i++) {
        const off = mult === 1 ? 0 : (i === 0 ? -9 : 9);
        this.fire(ang, -Math.sin(ang) * off, Math.cos(ang) * off, w);
      }
    } else {
      this.nextAttack = now + w.cooldown;
      this.slash(ang, w, ult, now);
    }
    return true;
  }

  fire(ang, ox, oy, w) {
    const sc = this.scene;
    const b = sc.physics.add.image(this.x + Math.cos(ang) * 30 + ox, this.y - 22 + Math.sin(ang) * 30 + oy, 'bullet');
    sc.pBullets.add(b);
    b.setRotation(ang);
    b.setVelocity(Math.cos(ang) * w.bulletSpeed, Math.sin(ang) * w.bulletSpeed);
    b.setDepth(9000);
    b.dmg = w.damage;
    sc.time.delayedCall(w.range / w.bulletSpeed * 1000, () => { if (b.active) b.destroy(); });
  }

  slash(ang, w, ult, now) {
    const sc = this.scene, n = ult ? 2 : 1;
    for (let k = 0; k < n; k++) {
      const a = ang + (n === 2 ? (k === 0 ? -0.35 : 0.35) : 0);
      const g = sc.add.graphics({ x: this.x, y: this.y - 20 }).setDepth(9000);
      g.fillStyle(0xffffff, 0.75);
      g.slice(0, 0, w.range, a - 0.9, a + 0.9, false);
      g.fillPath();
      sc.tweens.add({ targets: g, alpha: 0, duration: 160, onComplete: () => g.destroy() });
    }
    this.swing = 1.3;
    if (!sc.enemies) return;
    sc.enemies.getChildren().slice().forEach(e => {
      if (!e.active || e.dying) return;
      const dx = e.x - this.x, dy = e.y - (this.y - 20);
      if (Math.hypot(dx, dy) > w.range + e.hitR) return;
      if (Math.abs(Phaser.Math.Angle.Wrap(Math.atan2(dy, dx) - ang)) < 1.1) e.hit(w.damage * n, now, ang);
    });
  }

  // урон: сначала щит, потом здоровье
  hurt(dmg, now) {
    if (this.dead || now < this.invulUntil) return;
    this.lastHit = now;
    this.invulUntil = now + 350;
    const ab = Math.min(this.armor, dmg);
    this.armor -= ab;
    dmg -= ab;
    if (dmg > 0) this.hp = Math.max(0, this.hp - dmg);
    this.setTintFill(0xffffff);
    this.scene.time.delayedCall(80, () => { if (this.active) this.clearTint(); });
    this.scene.cameras.main.shake(100, 0.004);
    if (this.hp <= 0) {
      this.dead = true;
      this.setVelocity(0, 0);
      if (this.scene.onPlayerDead) this.scene.onPlayerDead();
    }
  }

  preUpdate(t, d) {
    super.preUpdate(t, d);
    if (this.scene.paused) return;
    // щит восстанавливается, если 3 секунды не получали урон
    if (!this.dead && this.armor < this.armorMax && t - this.lastHit > 3000 && t >= this.nextRegen) {
      this.armor++;
      this.nextRegen = t + 900;
    }
    this.setAlpha(t < this.invulUntil ? (Math.floor(t / 60) % 2 ? 0.5 : 1) : 1);
    const moving = this.body.velocity.length() > 10;
    this.scaleY = moving ? 1 + Math.sin(t / 80) * 0.04 : 1;
    this.shadow.setPosition(this.x, this.y + 2).setDepth(this.y - 1);
    this.setDepth(this.y);

    // оружие в руках
    const w = this.weapon();
    const tex = w.type === 'gun' ? 'wp_pistol' : 'wp_sword';
    if (this.hand.texture.key !== tex) {
      this.hand.setTexture(tex); this.hand2.setTexture(tex);
      const o = w.type === 'gun' ? 0.3 : 0.15;
      this.hand.setOrigin(o, 0.5); this.hand2.setOrigin(o, 0.5);
    }
    const ang = Math.atan2(this.facing.y, this.facing.x);
    const sw = this.swing; this.swing = sw < 0.02 ? 0 : sw * 0.8;
    const ult = this.ultActive(t);
    const place = (h, off, sgn) => {
      h.setPosition(this.x + Math.cos(ang) * 22 - Math.sin(ang) * off, this.y - 20 + Math.sin(ang) * 22 + Math.cos(ang) * off);
      h.setRotation(ang + sw * sgn);
      h.setFlipY(Math.cos(ang) < 0);
      h.setDepth(this.y + 2);
      h.setAlpha(this.dead ? 0 : 1);
    };
    place(this.hand, ult ? -9 : 0, -1);
    this.hand2.setVisible(ult);
    if (ult) place(this.hand2, 9, 1);
  }

  destroy(fromScene) {
    if (this.shadow) this.shadow.destroy();
    if (this.hand) this.hand.destroy();
    if (this.hand2) this.hand2.destroy();
    super.destroy(fromScene);
  }
            }
