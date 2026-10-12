// Подземелье: комнаты и коридоры, бои по 3 волны, сундуки, порталы, босс на уровне 1-5.
class DungeonScene extends Phaser.Scene {
  constructor() { super('Dungeon'); }

  init(data) { this.stage = (data && data.stage) || Run.stage || 1; }

  hud() { return this.scene.get('HUD'); }
  now() { return this.game.loop.time; }

  create() {
    const T = 64;
    this.T = T;
    Run.stage = this.stage;
    this.stageLabel = '1-' + this.stage;
    this.paused = false; this.leaving = false;
    this.pickups = []; this.portals = []; this.boss = null; this.chest = null; this.noEnergyAt = 0;

    const lv = LevelGen.make(this.stage);
    this.rooms = lv.rooms; this.links = lv.links;
    this.worldW = lv.gw * T; this.worldH = lv.gh * T;
    const cam = this.cameras.main;
    cam.setBounds(0, 0, this.worldW, this.worldH);
    cam.setBackgroundColor('#07090d');
    cam.fadeIn(300);
    this.physics.world.setBounds(0, 0, this.worldW, this.worldH);

    this.buildMap(lv);

    // двери
    this.doors = this.physics.add.staticGroup();
    this.rooms.forEach((r, i) => {
      r.px = { x: r.x * T, y: r.y * T, w: r.w * T, h: r.h * T };
      r.cx = r.px.x + r.px.w / 2; r.cy = r.px.y + r.px.h / 2;
      r.state = (r.type === 'battle' || r.type === 'boss') ? 'idle' : 'none';
      r.wave = 0; r.waves = 0; r.waveAt = 0;
      r.visited = i === 0; r.seen = i === 0;
      r.doorObjs = r.doors.map(d => {
        const img = this.doors.create((d.x + d.w / 2) * T, (d.y + d.h / 2) * T, d.w === 1 ? 'door_v' : 'door_h').setDepth(5);
        img.setVisible(false); img.body.enable = false;
        return img;
      });
    });
    this.curRoom = this.rooms[0];

    // игрок и группы
    const s = this.rooms[0];
    this.player = new Player(this, s.cx, s.cy, Save.get('hero', 'knight'));
    this.enemies = this.physics.add.group();
    this.pBullets = this.physics.add.group();
    this.eBullets = this.physics.add.group();
    cam.startFollow(this.player, true, 0.12, 0.12);

    // столкновения
    const kill = (b) => { if (b.active) b.destroy(); };
    this.physics.add.collider(this.player, this.layer);
    this.physics.add.collider(this.player, this.doors);
    this.physics.add.collider(this.enemies, this.layer);
    this.physics.add.collider(this.enemies, this.doors);
    this.physics.add.collider(this.enemies, this.enemies);
    this.physics.add.collider(this.pBullets, this.layer, kill);
    this.physics.add.collider(this.pBullets, this.doors, kill);
    this.physics.add.collider(this.eBullets, this.layer, kill);
    this.physics.add.collider(this.eBullets, this.doors, kill);
    this.physics.add.overlap(this.pBullets, this.enemies, (b, e) => {
      if (!b.active || !e.active || e.dying) return;
      e.hit(b.dmg, this.now(), b.rotation);
      b.destroy();
    });
    this.physics.add.overlap(this.player, this.eBullets, (pl, b) => {
      if (!b.active) return;
      pl.hurt(b.dmg, this.now());
      b.destroy();
    });
    this.physics.add.overlap(this.player, this.enemies, (pl, e) => {
      if (e.dying) return;
      const n = this.now();
      if (e.canTouch(n)) pl.hurt(e.def.touch, n);
    });

    // портал в последней комнате (кроме босса)
    const last = this.rooms[this.rooms.length - 1];
    if (last.type === 'portal') this.makePortal(last.cx, last.cy, 'next');

    this.scene.launch('HUD', { target: this });
    this.time.delayedCall(500, () => { const h = this.hud(); if (h && h.banner) h.banner(this.stageLabel); });
  }

  buildMap(lv) {
    const T = this.T, gw = lv.gw, gh = lv.gh;
    const floor = [];
    for (let j = 0; j < gh; j++) floor.push(new Array(gw).fill(false));
    const mark = (o) => { for (let j = o.y; j < o.y + o.h; j++) for (let i = o.x; i < o.x + o.w; i++) floor[j][i] = true; };
    lv.rooms.forEach(mark); lv.links.forEach(mark);
    const map = this.make.tilemap({ tileWidth: T, tileHeight: T, width: gw, height: gh });
    const ts = map.addTilesetImage('tiles_dz', 'tiles_dz', T, T, 0, 0);
    this.layer = map.createBlankLayer('main', ts, 0, 0, gw, gh).setDepth(0);
    for (let j = 0; j < gh; j++) {
      for (let i = 0; i < gw; i++) {
        if (floor[j][i]) { this.layer.putTileAt(((i * 7 + j * 13) % 5 === 0) ? 1 : 0, i, j); continue; }
        let near = false;
        for (let dj = -1; dj <= 1 && !near; dj++) {
          for (let di = -1; di <= 1; di++) {
            const y = j + dj, x = i + di;
            if (y >= 0 && x >= 0 && y < gh && x < gw && floor[y][x]) { near = true; break; }
          }
        }
        if (near) this.layer.putTileAt(2, i, j);
      }
    }
    this.layer.setCollision(2);
  }

  // ---------- управление и обновление ----------
  setPaused(v) {
    this.paused = v;
    if (v) { this.physics.pause(); this.time.paused = true; this.tweens.pauseAll(); this.player.setVelocity(0, 0); }
    else { this.physics.resume(); this.time.paused = false; this.tweens.resumeAll(); }
  }

  noEnergy(now) {
    if (now < this.noEnergyAt) return;
    this.noEnergyAt = now + 1500;
    this.hud().toast('Нет энергии. Возьми синие кристаллы или смени оружие');
  }

  nearestEnemy(x, y, maxD) {
    let best = null, bd = maxD;
    this.enemies.getChildren().forEach(e => {
      if (!e.active || e.dying) return;
      const d = Math.hypot(e.x - x, e.y - y);
      if (d < bd) { bd = d; best = e; }
    });
    return best;
  }

  update(time, delta) {
    if (this.paused || this.leaving) return;
    const hud = this.hud();
    if (!hud || !hud.joy) return;
    const p = this.player;
    p.move(hud.joy.vec);
    if (!p.dead && hud.attackHeld) {
      if (this.chestNear()) this.openChest(time);
      else p.attack(time);
    }
    this.enemies.getChildren().slice().forEach(e => e.tick(time, p));
    this.updateRooms(time);
    this.updatePickups(time, delta);
    if (this.chest && !this.chest.opened) this.chest.t.setVisible(this.chestNear());
    for (const pt of this.portals) {
      if (Math.hypot(p.x - pt.x, p.y - 10 - pt.y) < 55) { this.usePortal(pt.kind); break; }
    }
  }

  // ---------- комнаты и волны ----------
  updateRooms(now) {
    const p = this.player, m = this.T * 0.8;
    this.rooms.forEach((r, i) => {
      const inside = p.x > r.px.x + m && p.x < r.px.x + r.px.w - m && p.y > r.px.y + m && p.y < r.px.y + r.px.h - m;
      if (inside) {
        r.visited = true; r.seen = true;
        if (this.rooms[i + 1]) this.rooms[i + 1].seen = true;
        if (this.rooms[i - 1]) this.rooms[i - 1].seen = true;
        this.curRoom = r;
        if (r.state === 'idle') this.startCombat(r, now);
      }
      if (r.state === 'combat') this.runCombat(r, now);
    });
  }

  setDoors(r, closed) {
    r.doorObjs.forEach(d => { d.setVisible(closed); d.body.enable = closed; });
  }

  startCombat(r, now) {
    r.state = 'combat'; r.wave = 0; r.waves = r.type === 'boss' ? 1 : 3; r.waveAt = now + 800;
    this.setDoors(r, true);
    this.hud().toast(r.type === 'boss' ? 'Босс!' : 'Бой! Двери закрыты');
  }

  runCombat(r, now) {
    if (this.enemies.countActive(true) > 0) { r.waveAt = 0; return; }
    if (r.wave >= r.waves) { this.finishRoom(r); return; }
    if (!r.waveAt) r.waveAt = now + 1000;
    else if (now >= r.waveAt) { r.waveAt = 0; this.spawnWave(r); }
  }

  spawnWave(r) {
    r.wave++;
    const mult = 1 + (this.stage - 1) * 0.25;
    if (r.type === 'boss') {
      this.boss = new Enemy(this, r.cx, r.cy - 80, 'boss', mult);
      this.cameras.main.shake(300, 0.006);
      return;
    }
    const m = this.T * 2, p = this.player;
    for (let i = 0; i < 5; i++) {
      let x = r.cx, y = r.cy;
      for (let tries = 0; tries < 12; tries++) {
        x = Phaser.Math.Between(r.px.x + m, r.px.x + r.px.w - m);
        y = Phaser.Math.Between(r.px.y + m, r.px.y + r.px.h - m);
        if (Math.hypot(x - p.x, y - p.y) > 260) break;
      }
      new Enemy(this, x, y, Math.random() < 0.4 ? 'shooter' : 'melee', mult);
    }
    this.hud().toast('Волна ' + r.wave + '/' + r.waves);
  }

  finishRoom(r) {
    r.state = 'cleared';
    this.setDoors(r, false);
    Save.write();
    this.hud().toast(r.type === 'boss' ? 'Босс повержен!' : 'Комната зачищена');
    this.makeChest(r.cx, r.cy, r.type === 'boss' ? 'boss' : 'loot');
  }

  // ---------- враги, дроп, предметы ----------
  onEnemyDeath(e) {
    const x = e.x, y = e.y, boss = e.kind === 'boss';
    const coins = boss ? 20 : Phaser.Math.Between(1, 3);
    for (let i = 0; i < coins; i++) this.drop('coin', x, y, 1);
    const orbs = boss ? 10 : (Math.random() < 0.85 ? Phaser.Math.Between(1, 2) : 0);
    for (let i = 0; i < orbs; i++) this.drop('energy', x, y, 7);
    if (!boss && Math.random() < 0.04) this.drop('hp', x, y, 3);
    if (boss) this.boss = null;
    e.destroy();
  }

  drop(type, x, y, v) {
    const key = { coin: 'ic_coin', energy: 'orb_mp', hp: 'potion_hp', mp: 'potion_mp', sword: 'wp_sword' }[type];
    const s = this.add.image(x, y, key).setDepth(y);
    if (type === 'coin') s.setScale(0.7);
    if (type === 'energy') s.setScale(0.9);
    if (type === 'sword') s.setAngle(-30);
    const a = Math.random() * 6.28, sp = 80 + Math.random() * 120;
    this.pickups.push({ s, type, v, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, readyAt: this.now() + 450 });
  }

  updatePickups(now, dt) {
    const p = this.player, f = dt / 1000;
    this.pickups = this.pickups.filter(k => {
      const s = k.s;
      if (!s.active) return false;
      k.vx *= 0.92; k.vy *= 0.92;
      s.x += k.vx * f; s.y += k.vy * f;
      s.setDepth(s.y);
      if (now < k.readyAt || p.dead) return true;
      const d = Math.hypot(p.x - s.x, p.y - 10 - s.y);
      if (d < 32) { this.collect(k); s.destroy(); return false; }
      if (d < 170) {
        const a = Math.atan2(p.y - 10 - s.y, p.x - s.x);
        s.x += Math.cos(a) * 460 * f; s.y += Math.sin(a) * 460 * f;
      }
      return true;
    });
  }

  collect(k) {
    const p = this.player;
    if (k.type === 'coin') Save.add('coins', k.v);
    else if (k.type === 'energy') p.addEnergy(k.v);
    else if (k.type === 'hp') { p.heal(k.v); this.hud().toast('Зелье здоровья: +' + k.v); }
    else if (k.type === 'mp') { p.addEnergy(k.v); this.hud().toast('Зелье энергии: +' + k.v); }
    else if (k.type === 'sword') { p.addWeapon('sword'); this.hud().toast('Получен меч. Ближний бой не тратит энергию'); }
  }

  // ---------- сундук и порталы ----------
  makeChest(x, y, kind) {
    const s = this.add.image(x, y, 'chest').setDepth(y);
    const t = UI.text(this, x, y - 58, 'Открыть: атака', 14, '#ffffff', 220).setDepth(9999).setVisible(false);
    this.chest = { s, t, kind, opened: false, x, y };
    s.setScale(0.2);
    this.tweens.add({ targets: s, scale: 1, duration: 350, ease: 'Back.easeOut' });
  }

  chestNear() {
    const c = this.chest;
    return !!c && !c.opened && Math.hypot(this.player.x - c.x, this.player.y - c.y) < 95;
  }

  openChest(now) {
    const c = this.chest;
    c.opened = true;
    c.s.setTexture('chest_open');
    c.t.destroy();
    if (c.kind === 'boss') {
      Save.add('gems', 1000);
      Save.write();
      this.hud().toast('Сундук босса: +1000 кристаллов');
      this.makePortal(c.x, c.y - 170, 'lobby');
      return;
    }
    const r = Math.random();
    const hasSword = this.player.weapons.indexOf('sword') !== -1;
    if (r < 0.3) this.drop('hp', c.x, c.y + 20, 3);
    else if (r < 0.6) this.drop('mp', c.x, c.y + 20, 90);
    else if (r < 0.85 && !hasSword) this.drop('sword', c.x, c.y + 20, 1);
    else if (r < 0.85) this.drop('mp', c.x, c.y + 20, 90);
    else for (let i = 0; i < 6; i++) this.drop('coin', c.x, c.y + 20, 2);
    // немного энергии в довесок
    for (let i = 0; i < 3; i++) this.drop('energy', c.x, c.y + 20, 7);
  }

  makePortal(x, y, kind) {
    const s = this.add.image(x, y, 'portal').setDepth(y - 30);
    this.tweens.add({ targets: s, angle: 360, duration: 6000, repeat: -1 });
    this.tweens.add({ targets: s, scale: 1.1, duration: 900, yoyo: true, repeat: -1 });
    const label = kind === 'next' ? ('1-' + (this.stage + 1)) : 'Лобби';
    UI.text(this, x, y - 82, label, 20, '#d8c4ff', 160).setDepth(9999);
    this.portals.push({ x, y, kind });
  }

  usePortal(kind) {
    if (this.leaving) return;
    this.leaving = true;
    this.player.setVelocity(0, 0);
    Save.write();
    const cam = this.cameras.main;
    cam.fadeOut(400);
    cam.once('camerafadeoutcomplete', () => {
      if (kind === 'next') {
        Run.keep(this.player);
        Run.stage = this.stage + 1;
        this.scene.restart({ stage: Run.stage });
      } else {
        Run.reset();
        this.scene.start('Lobby');
      }
    });
  }

  // ---------- смерть ----------
  onPlayerDead() {
    this.setPaused(true);
    Save.write();
    this.hud().openDeath();
  }

  revive() {
    const p = this.player;
    p.dead = false;
    p.hp = p.hpMax; p.armor = p.armorMax; p.energy = p.energyMax;
    p.invulUntil = this.now() + 3000;
    p.clearTint();
    this.eBullets.clear(true, true);
    this.setPaused(false);
  }

  // ---------- данные для мини-карты ----------
  getMapData() {
    const T = this.T;
    return {
      w: this.worldW, h: this.worldH, px: this.player.x, py: this.player.y,
      rooms: this.rooms.map(r => ({
        x: r.px.x, y: r.px.y, w: r.px.w, h: r.px.h, type: r.type,
        seen: r.seen, visited: r.visited, state: r.state, cur: r === this.curRoom
      })),
      links: this.links.map(l => ({
        x: l.x * T, y: l.y * T, w: l.w * T, h: l.h * T,
        show: this.rooms[l.a].visited || this.rooms[l.b].visited
      }))
    };
  }
      }
