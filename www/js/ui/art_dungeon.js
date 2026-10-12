// Текстуры подземелья, врагов и предметов (временные, рисуются кодом).
const ArtDungeon = {
  SLIME: [
    '....dddd....',
    '..dddggddd..',
    '.dggggggggd.',
    '.dgwkggwkgd.',
    '.dggggggggd.',
    'dgggggggggdd',
    'dgggdggdgggd',
    '.dddd..dddd.'
  ],

  build(scene) {
    // Тайлы: 0 пол, 1 пол-вариант, 2 стена
    Pixel.draw(scene, 'tiles_dz', 192, 64, g => {
      g.fillStyle(0x4f7a42, 1).fillRect(0, 0, 64, 64);
      g.fillStyle(0x42693a, 1).fillRect(0, 0, 64, 4).fillRect(0, 0, 4, 64);
      g.fillStyle(0x628f52, 1).fillRect(10, 10, 22, 6).fillRect(40, 36, 16, 6);
      g.fillStyle(0x3a5e30, 1).fillRect(34, 22, 6, 6).fillRect(12, 46, 6, 6);
      g.fillStyle(0x4a7440, 1).fillRect(64, 0, 64, 64);
      g.fillStyle(0x3e6335, 1).fillRect(64, 0, 64, 4).fillRect(64, 0, 4, 64);
      g.fillStyle(0xc9a74a, 1).fillRect(88, 28, 8, 8).fillRect(84, 32, 16, 0);
      g.fillStyle(0x5a8749, 1).fillRect(76, 12, 14, 6).fillRect(104, 44, 14, 6);
      g.fillStyle(0x232d27, 1).fillRect(128, 0, 64, 64);
      g.fillStyle(0x3b4a40, 1).fillRect(128, 0, 64, 8);
      g.fillStyle(0x161d19, 1).fillRect(128, 30, 64, 4).fillRect(128, 60, 64, 4).fillRect(158, 8, 4, 22).fillRect(144, 34, 4, 26).fillRect(176, 34, 4, 26);
      g.fillStyle(0x30403a, 1).fillRect(134, 12, 18, 6).fillRect(166, 38, 18, 6);
    });

    // Двери
    Pixel.draw(scene, 'door_v', 64, 128, g => {
      g.fillStyle(0x15171c, 1).fillRect(0, 0, 64, 128);
      g.fillStyle(0x3b414c, 1).fillRect(6, 0, 52, 128);
      g.fillStyle(0x6a7384, 1).fillRect(12, 0, 6, 128).fillRect(30, 0, 6, 128).fillRect(48, 0, 6, 128);
      g.fillStyle(0xc89b3c, 1).fillRect(6, 60, 52, 8);
    });
    Pixel.draw(scene, 'door_h', 128, 64, g => {
      g.fillStyle(0x15171c, 1).fillRect(0, 0, 128, 64);
      g.fillStyle(0x3b414c, 1).fillRect(0, 6, 128, 52);
      g.fillStyle(0x6a7384, 1).fillRect(0, 12, 128, 6).fillRect(0, 30, 128, 6).fillRect(0, 48, 128, 6);
      g.fillStyle(0xc89b3c, 1).fillRect(60, 6, 8, 52);
    });

    // Враги
    Pixel.sprite(scene, 'enemy_slime', ArtDungeon.SLIME, { g: 0x58c458, d: 0x2f7a2f, k: 0x10201a, w: 0xffffff }, 4);
    Pixel.sprite(scene, 'enemy_gunner', Art.HERO_ROWS, Art.heroPal({ h: 0x8a2f2f, H: 0xc45a5a, g: 0x3a3a44, r: 0xe8c040, b: 0x4a2a2a, s: 0xc89a7a }), 4);
    Pixel.sprite(scene, 'enemy_boss', Art.HERO_ROWS, Art.heroPal({ h: 0x4a2a6a, H: 0x7a4aa8, g: 0xd8b030, r: 0xb02020, b: 0x2a1a3a, s: 0xb8a090, e: 0xff3030 }), 9);

    // Пули врагов, предметы
    Pixel.draw(scene, 'ebullet', 16, 16, g => {
      g.fillStyle(0xff4a7a, 1).fillCircle(8, 8, 8);
      g.fillStyle(0xffffff, 1).fillCircle(8, 8, 4);
    });
    Pixel.draw(scene, 'orb_mp', 18, 18, g => {
      g.fillStyle(0x2f7fe0, 1).fillPoints([{ x: 9, y: 0 }, { x: 18, y: 9 }, { x: 9, y: 18 }, { x: 0, y: 9 }], true);
      g.fillStyle(0x9fd0ff, 1).fillPoints([{ x: 9, y: 4 }, { x: 14, y: 9 }, { x: 9, y: 14 }, { x: 4, y: 9 }], true);
    });
    const potion = (key, c1, c2) => Pixel.draw(scene, key, 24, 32, g => {
      g.fillStyle(0x8a6a3a, 1).fillRect(8, 0, 8, 4);
      g.fillStyle(0xcfd6e0, 1).fillRect(8, 4, 8, 6);
      g.fillStyle(0x1a1210, 1).fillRect(0, 10, 24, 22);
      g.fillStyle(c1, 1).fillRect(2, 12, 20, 18);
      g.fillStyle(c2, 1).fillRect(5, 15, 4, 10);
    });
    potion('potion_hp', 0xd23b3b, 0xff9a9a);
    potion('potion_mp', 0x2f7fe0, 0x9fd0ff);

    // Сундук и портал
    Pixel.draw(scene, 'chest', 80, 64, g => {
      g.fillStyle(0x1a1210, 1).fillRect(0, 8, 80, 56);
      g.fillStyle(0x8c5a34, 1).fillRect(4, 12, 72, 48);
      g.fillStyle(0xb97d4b, 1).fillRect(4, 12, 72, 10);
      g.fillStyle(0xc89b3c, 1).fillRect(34, 8, 12, 56).fillRect(4, 30, 72, 6);
      g.fillStyle(0xffe08a, 1).fillRect(36, 28, 8, 12);
    });
    Pixel.draw(scene, 'chest_open', 80, 64, g => {
      g.fillStyle(0x1a1210, 1).fillRect(0, 0, 80, 22);
      g.fillStyle(0xb97d4b, 1).fillRect(4, 3, 72, 15);
      g.fillStyle(0x1a1210, 1).fillRect(0, 26, 80, 38);
      g.fillStyle(0x3a2412, 1).fillRect(4, 30, 72, 30);
      g.fillStyle(0xc89b3c, 1).fillRect(4, 26, 72, 5);
    });
    Pixel.draw(scene, 'portal', 112, 112, g => {
      g.fillStyle(0x2a1060, 1).fillCircle(56, 56, 56);
      g.fillStyle(0x6a3fd0, 1).fillCircle(56, 56, 46);
      g.fillStyle(0x9a6aff, 1).fillCircle(56, 56, 32);
      g.fillStyle(0xd8c4ff, 1).fillCircle(56, 56, 16);
      g.lineStyle(6, 0xffffff, 0.8).lineBetween(56, 14, 56, 40).lineBetween(98, 56, 72, 56).lineBetween(56, 98, 56, 72).lineBetween(14, 56, 40, 56);
    });

    // Оружие в руках
    Pixel.draw(scene, 'wp_pistol', 28, 14, g => {
      g.fillStyle(0x1a1a22, 1).fillRect(0, 0, 28, 10);
      g.fillStyle(0x5a6070, 1).fillRect(2, 2, 24, 6);
      g.fillStyle(0x8a5a2a, 1).fillRect(2, 8, 8, 6);
      g.fillStyle(0xf0a020, 1).fillRect(24, 3, 4, 4);
    });
    Pixel.draw(scene, 'wp_sword', 48, 12, g => {
      g.fillStyle(0x6a4125, 1).fillRect(0, 4, 8, 4);
      g.fillStyle(0xc89b3c, 1).fillRect(8, 0, 4, 12);
      g.fillStyle(0xdde3ec, 1).fillRect(12, 3, 30, 6).fillTriangle(42, 3, 48, 6, 42, 9);
      g.fillStyle(0xffffff, 1).fillRect(12, 4, 30, 2);
    });
  }
};
