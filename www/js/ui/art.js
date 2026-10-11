// Временные пиксельные текстуры, нарисованные кодом.
// Позже каждую можно заменить своим PNG из assets/.
const Art = {
  HERO_ROWS: [
    '....kkkk....',
    '..kkhhHHkk..',
    '.khhhHHhhhk.',
    '.khhhhhhhhk.',
    '.kggggggggk.',
    '.kgssssssgk.',
    '.kgsessesgk.',
    '..kssssssk..',
    '..krrrrrrk..',
    '.kbbbbbbbbk.',
    '.kbbwwwwbbk.',
    '.kbbbbbbbbk.',
    '..kbbkkbbk..',
    '..kkk..kkk..'
  ],

  heroPal(o) {
    return Object.assign({
      k: 0x1b1b24, h: 0x8a93a6, H: 0xc3cad8, g: 0xf0b429,
      s: 0xf2b79a, e: 0x1b1b24, r: 0xd9482b, b: 0x4a5568, w: 0xdfe5ee
    }, o || {});
  },

  build(scene) {
    // Герои и жители лобби
    Pixel.sprite(scene, 'hero_knight', Art.HERO_ROWS, Art.heroPal(), 4);
    Pixel.sprite(scene, 'npc_a', Art.HERO_ROWS, Art.heroPal({ h: 0x5b8a5b, H: 0x8fc08f, g: 0xc9c9c9, r: 0x3b6ea8, b: 0x3a4a3a }), 4);
    Pixel.sprite(scene, 'npc_b', Art.HERO_ROWS, Art.heroPal({ h: 0x7a4a8a, H: 0xb184c4, g: 0xe07070, r: 0xe0b030, b: 0x3a2a4a }), 4);
    Pixel.sprite(scene, 'npc_c', Art.HERO_ROWS, Art.heroPal({ h: 0x30343c, H: 0x5a606c, g: 0x30343c, r: 0xc83030, b: 0x20242a }), 4);
    Pixel.sprite(scene, 'npc_d', Art.HERO_ROWS, Art.heroPal({ h: 0xb08a50, H: 0xe0c080, g: 0x8a5a2a, r: 0x2a9a9a, b: 0x6a5a3a }), 4);
    Pixel.sprite(scene, 'npc_e', Art.HERO_ROWS, Art.heroPal({ h: 0xc0c8d8, H: 0xffffff, g: 0x70a0e0, r: 0xe08aa0, b: 0x7a8aa8 }), 4);

    // Иконки HUD
    Pixel.sprite(scene, 'ic_heart', [
      '.rrr.rrr.', 'rrwrrrrrr', 'rrrrrrrrr', '.rrrrrrr.', '..rrrrr..', '...rrr...', '....r....'
    ], { r: 0xe03a3a, w: 0xff9a9a }, 3);
    Pixel.sprite(scene, 'ic_shield', [
      'gggggggg', 'gwggggsg', 'gwggggsg', 'gwggggsg', '.gggggs.', '..gggs..', '...gs...'
    ], { g: 0xc8ced8, w: 0xffffff, s: 0x8b93a1 }, 3);
    Pixel.sprite(scene, 'ic_gem', [
      '..bbbbb..', '.bwbbbbb.', 'bwbbbbbbb', '.bbbbbbb.', '..bbbbb..', '...bbb...', '....b....'
    ], { b: 0x4fa8ff, w: 0xc9e6ff }, 3);

    // Монета
    Pixel.draw(scene, 'ic_coin', 24, 30, g => {
      g.fillStyle(0x8a6a10, 1).fillRect(4, 0, 16, 30).fillRect(0, 4, 24, 22);
      g.fillStyle(0xf5c518, 1).fillRect(6, 2, 12, 26).fillRect(2, 6, 20, 18);
      g.fillStyle(0xfff0a0, 1).fillRect(6, 6, 4, 14);
    });

    // Пол и стены лобби
    Pixel.draw(scene, 'floor_lobby', 64, 64, g => {
      g.fillStyle(0x7a4a2a, 1).fillRect(0, 0, 64, 64);
      g.fillStyle(0x66401f, 1).fillRect(0, 0, 64, 4).fillRect(0, 0, 4, 64);
      g.fillStyle(0x8a5732, 1).fillRect(8, 8, 52, 4).fillRect(8, 8, 4, 52);
      g.fillStyle(0x6e4326, 1).fillRect(20, 30, 8, 4).fillRect(40, 44, 8, 4).fillRect(44, 20, 4, 4);
    });
    Pixel.draw(scene, 'wall', 64, 64, g => {
      g.fillStyle(0x1f2d3f, 1).fillRect(0, 0, 64, 64);
      g.fillStyle(0x131c28, 1).fillRect(0, 0, 64, 4).fillRect(0, 32, 64, 4);
      g.fillRect(0, 0, 4, 32).fillRect(32, 32, 4, 32);
      g.fillStyle(0x2d4159, 1).fillRect(6, 6, 24, 4).fillRect(38, 38, 24, 4);
    });

    // Ковёр, стол, ворота, пуля
    Pixel.draw(scene, 'rug', 320, 224, g => {
      g.fillStyle(0x1a4050, 1).fillRect(0, 0, 320, 224);
      g.fillStyle(0xc89b3c, 1).fillRect(12, 12, 296, 8).fillRect(12, 204, 296, 8).fillRect(12, 12, 8, 200).fillRect(300, 12, 8, 200);
      g.fillStyle(0x2b6577, 1).fillRect(28, 28, 264, 168);
      g.fillStyle(0xc89b3c, 1).fillRect(28, 28, 20, 20).fillRect(272, 28, 20, 20).fillRect(28, 176, 20, 20).fillRect(272, 176, 20, 20);
    });
    Pixel.draw(scene, 'table', 192, 104, g => {
      g.fillStyle(0x16303c, 1).fillRect(0, 8, 192, 96);
      g.fillStyle(0x2f5f73, 1).fillRect(4, 12, 184, 84);
      g.fillStyle(0x3d7690, 1).fillRect(4, 12, 184, 6);
      g.fillStyle(0x1a1210, 1).fillRect(24, 36, 40, 28);
      g.fillStyle(0xd9d2c0, 1).fillRect(28, 40, 32, 20);
      g.fillStyle(0x4cd26b, 1).fillRect(20, 0, 10, 24);
      g.fillStyle(0xe04a4a, 1).fillRect(36, 0, 10, 24);
      g.fillStyle(0x4a8fe0, 1).fillRect(52, 0, 10, 24);
      g.fillStyle(0xe8a050, 1).fillRect(110, 40, 28, 14);
      g.fillStyle(0xe8e8e8, 1).fillRect(150, 36, 20, 20);
    });
    Pixel.draw(scene, 'gate', 192, 128, g => {
      g.fillStyle(0x0a0f17, 1).fillRect(0, 0, 192, 128);
      g.fillStyle(0x2c3f55, 1).fillRect(0, 0, 192, 12).fillRect(0, 0, 12, 128).fillRect(180, 0, 12, 128);
      g.fillStyle(0x03060a, 1).fillRect(24, 24, 144, 104);
      g.lineStyle(8, 0x58d6ff, 1);
      g.lineBetween(72, 40, 120, 100);
      g.lineBetween(120, 40, 72, 100);
      g.fillStyle(0xbdf0ff, 1).fillRect(88, 28, 16, 16);
    });
    Pixel.draw(scene, 'bullet', 20, 8, g => {
      g.fillStyle(0xf0a020, 1).fillRect(0, 0, 20, 8);
      g.fillStyle(0xfff2b0, 1).fillRect(4, 2, 14, 4);
    });
  }
};
