// Инструменты для рисования пиксель-арта кодом (пока нет своих PNG).
const Pixel = {
  // rows: массив строк, pal: символ -> цвет 0xRRGGBB, scale: во сколько раз увеличить
  sprite(scene, key, rows, pal, scale) {
    if (scene.textures.exists(key)) return;
    scale = scale || 4;
    const h = rows.length, w = rows[0].length;
    const tex = scene.textures.createCanvas(key, w * scale, h * scale);
    const ctx = tex.context;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const c = pal[rows[y][x]];
        if (c === undefined) continue;
        ctx.fillStyle = '#' + c.toString(16).padStart(6, '0');
        ctx.fillRect(x * scale, y * scale, scale, scale);
      }
    }
    tex.refresh();
  },
  // Нарисовать текстуру через Graphics
  draw(scene, key, w, h, fn) {
    if (scene.textures.exists(key)) return;
    const g = scene.make.graphics({ x: 0, y: 0, add: false });
    fn(g);
    g.generateTexture(key, w, h);
    g.destroy();
  }
};
