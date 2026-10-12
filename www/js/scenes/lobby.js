// Лобби (дом): жители, ковёр со столом, портал в подземелье, герой с управлением.
class LobbyScene extends Phaser.Scene {
  constructor() { super('Lobby'); }

  create() {
    const W = 1792, H = 1024;
    Run.reset();
    this.paused = false; this.leaving = false;
    this.freeAmmo = true; // в лобби энергия не тратится
    this.cameras.main.setBounds(0, 0, W, H);
    this.cameras.main.fadeIn(300);
    this.bounds = new Phaser.Geom.Rectangle(64, 128, W - 128, H - 192);
    this.physics.world.setBounds(this.bounds.x, this.bounds.y, this.bounds.width, this.bounds.height);

    // Пол и стены
    this.add.tileSprite(0, 0, W, H, 'floor_lobby').setOrigin(0).setDepth(0);
    this.add.tileSprite(0, 0, W, 128, 'wall').setOrigin(0).setDepth(1);
    this.add.tileSprite(0, 0, 64, H, 'wall').setOrigin(0).setDepth(1).setTint(0x8899aa);
    this.add.tileSprite(W - 64, 0, 64, H, 'wall').setOrigin(0).setDepth(1).setTint(0x8899aa);
    this.add.tileSprite(0, H - 64, W, 64, 'wall').setOrigin(0).setDepth(1).setTint(0x8899aa);

    // Портал в подземелье
    this.add.image(W / 2, 64, 'gate').setDepth(2);
    UI.text(this, W / 2, 150, 'Подземелье', 16, '#9fe8ff', 180).setDepth(3);
    this.gateZone = this.add.zone(W / 2, 100, 150, 70);
    this.physics.add.existing(this.gateZone);
    this.gateZone.body.setAllowGravity(false);

    // Ковёр и стол
    const cx = W / 2, cy = 620;
    this.add.image(cx, cy, 'rug').setDepth(3);
    this.solids = this.physics.add.staticGroup();
    const table = this.solids.create(cx, cy, 'table').setDepth(cy + 40);
    table.refreshBody();

    // Жители
    const lines = ['Привет!', 'Ворота ведут в подземелье.', 'Скоро тут будет магазин.', 'Не забудь про оружие.', 'Хорошая сегодня погода.'];
    const npcs = [
      ['npc_a', cx - 130, cy - 10], ['npc_b', cx + 130, cy - 10], ['npc_c', cx, cy + 80], ['npc_d', cx, cy - 78],
      ['npc_e', 260, 520], ['npc_a', 380, 760], ['npc_c', 220, 880], ['npc_b', 1480, 420]
    ];
    npcs.forEach(([key, x, y], i) => {
      const n = this.add.image(x, y, key).setOrigin(0.5, 0.9).setDepth(y + 1);
      this.tweens.add({ targets: n, scaleY: 1.04, duration: 900 + i * 80, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
      n.setInteractive({ useHandCursor: true });
      n.on('pointerdown', () => this.say(n, lines[i % lines.length]));
      const z = this.add.zone(x, y - 6, 30, 16);
      this.physics.add.existing(z, true);
      this.solids.add(z);
    });

    // Герой
    this.player = new Player(this, cx + 380, 820, Save.get('hero', 'knight'));
    this.cameras.main.startFollow(this.player, true, 0.12, 0.12);
    this.pBullets = this.physics.add.group();
    this.physics.add.collider(this.player, this.solids);
    this.physics.add.collider(this.pBullets, this.solids, (b) => b.destroy());
    this.physics.add.overlap(this.player, this.gateZone, () => {
      if (this.leaving) return;
      this.leaving = true;
      Run.reset();
      this.cameras.main.fadeOut(300);
      this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('Dungeon', { stage: 1 }));
    });

    this.scene.launch('HUD', { target: this });
  }

  hud() { return this.scene.get('HUD'); }

  say(npc, text) {
    if (this.bubble) this.bubble.destroy();
    const t = UI.text(this, 0, 0, text, 16, '#2a2a2a', 360, { strokeThickness: 0, align: 'center' });
    const w = t.width + 28, h = t.height + 20;
    const g = this.add.graphics();
    g.fillStyle(0xffffff, 0.96).fillRoundedRect(-w / 2, -h / 2, w, h, 10);
    this.bubble = this.add.container(npc.x, npc.y - 80, [g, t]).setDepth(9999);
    const mine = this.bubble;
    this.time.delayedCall(1800, () => { if (this.bubble === mine) { mine.destroy(); this.bubble = null; } });
  }

  setPaused(v) {
    this.paused = v;
    if (v) { this.physics.pause(); this.player.setVelocity(0, 0); }
    else this.physics.resume();
  }

  update(time) {
    if (this.paused || this.leaving) return;
    const hud = this.hud();
    if (!hud || !hud.joy) return;
    this.player.move(hud.joy.vec);
    if (hud.attackHeld) this.player.attack(time);
    this.pBullets.getChildren().slice().forEach(b => {
      if (!Phaser.Geom.Rectangle.Contains(this.bounds, b.x, b.y)) b.destroy();
    });
  }
        }
