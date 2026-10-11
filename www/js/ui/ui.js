// Общие элементы интерфейса: деревянные панели и кнопки, текст, подсказки.
const UI = {
  STYLES: {
    wood:     { o: 0x241508, m: 0x8c5a34, l: 0xb97d4b, d: 0x5e3920 },
    woodDark: { o: 0x1a0f08, m: 0x6a4125, l: 0x8c5a34, d: 0x432813 },
    steel:    { o: 0x10141c, m: 0x3a4560, l: 0x58668a, d: 0x262e42 },
    blue:     { o: 0x0b2a4a, m: 0x2a78c8, l: 0x55a6f0, d: 0x1a5290 },
    panel:    { o: 0x0b0f18, m: 0x182235, l: 0x22304a, d: 0x101828 }
  },

  // Рамка в пиксельном стиле со скошенными углами и фаской
  box(g, x, y, w, h, style) {
    const s = UI.STYLES[style || 'wood'], b = 4;
    g.fillStyle(s.o, 1).fillRect(x + b, y, w - 2 * b, h).fillRect(x, y + b, w, h - 2 * b);
    g.fillStyle(s.m, 1).fillRect(x + b, y + b, w - 2 * b, h - 2 * b);
    g.fillStyle(s.l, 1).fillRect(x + b, y + b, w - 2 * b, b).fillRect(x + b, y + b, b, h - 2 * b);
    g.fillStyle(s.d, 1).fillRect(x + b, y + h - 2 * b, w - 2 * b, b).fillRect(x + w - 2 * b, y + b, b, h - 2 * b);
  },

  // Текст, который сам уменьшается, чтобы не вылезать за maxW
  text(scene, x, y, str, size, color, maxW, extra) {
    size = size || 20;
    const t = scene.add.text(x, y, str, Object.assign({
      fontFamily: DZ.FONT,
      fontSize: size + 'px',
      color: color || '#ffffff',
      stroke: '#1a1210',
      strokeThickness: Math.max(2, Math.floor(size / 6))
    }, extra || {})).setOrigin(0.5);
    if (maxW) {
      let s = size;
      while (t.width > maxW && s > 8) { s--; t.setFontSize(s + 'px'); }
    }
    return t;
  },

  // Кнопка. label - текст, opts.icon(g) - рисование иконки, opts.dot - красная точка
  button(scene, x, y, w, h, label, cb, style, opts) {
    opts = opts || {};
    const c = scene.add.container(x, y);
    const g = scene.add.graphics();
    UI.box(g, -w / 2, -h / 2, w, h, style || 'wood');
    c.add(g);
    if (label) c.add(UI.text(scene, 0, -2, label, opts.size || 22, '#ffffff', w - 28));
    if (opts.icon) {
      const ig = scene.add.graphics();
      opts.icon(ig);
      c.add(ig);
    }
    if (opts.dot) {
      c.add(scene.add.circle(w / 2 - 6, -h / 2 + 6, 8, 0xe03030).setStrokeStyle(3, 0x3a0a0a));
    }
    c.setSize(w, h).setInteractive({ useHandCursor: true });
    c.on('pointerdown', () => { c.y = y + 3; });
    c.on('pointerup', () => { c.y = y; if (cb) cb(); });
    c.on('pointerout', () => { c.y = y; });
    return c;
  },

  // Белая подсказка-облачко
  toast(scene, str, x, y, ms) {
    x = x === undefined ? DZ.W / 2 : x;
    y = y === undefined ? 130 : y;
    const t = UI.text(scene, 0, 0, str, 18, '#2a2a2a', 560, { strokeThickness: 0, align: 'center' });
    const w = t.width + 48, h = t.height + 28;
    const g = scene.add.graphics();
    g.fillStyle(0xffffff, 0.95).fillRoundedRect(-w / 2, -h / 2, w, h, 12);
    const c = scene.add.container(x, y, [g, t]).setDepth(5000);
    scene.tweens.add({ targets: c, alpha: 0, delay: ms || 1800, duration: 400, onComplete: () => c.destroy() });
    return c;
  },

  // Иконки, нарисованные примитивами (центр в 0,0)
  iconGear(g) {
    g.fillStyle(0xf0e6d0, 1);
    for (let i = 0; i < 8; i++) {
      const a = i * Math.PI / 4;
      g.fillRect(Math.cos(a) * 18 - 5, Math.sin(a) * 18 - 5, 10, 10);
    }
    g.fillCircle(0, 0, 15);
    g.fillStyle(0x6a4125, 1).fillCircle(0, 0, 7);
  },
  iconCloud(g) {
    g.fillStyle(0xe8f2ff, 1).fillCircle(-10, 4, 10).fillCircle(4, -2, 14).fillCircle(14, 6, 9).fillRect(-12, 4, 28, 10);
    g.fillStyle(0x2a78c8, 1).fillTriangle(0, -6, -8, 4, 8, 4).fillRect(-3, 4, 6, 8);
  },
  iconMegaphone(g) {
    g.fillStyle(0xe8ecf4, 1).fillRect(-18, -6, 10, 12);
    g.fillPoints([{ x: -8, y: -7 }, { x: 16, y: -18 }, { x: 16, y: 18 }, { x: -8, y: 7 }], true);
    g.fillStyle(0xe8ecf4, 1).fillRect(-14, 6, 8, 12);
  },
  iconPause(g) {
    g.fillStyle(0xf0e6d0, 1).fillRect(-14, -18, 10, 36).fillRect(4, -18, 10, 36);
  },
  dagger(g, s) {
    s = s || 1;
    g.fillStyle(0xdde3ec, 1).fillTriangle(0, -30 * s, 8 * s, 0, -8 * s, 0);
    g.fillStyle(0xe0b050, 1).fillRect(-14 * s, 0, 28 * s, 6 * s);
    g.fillStyle(0x6a4125, 1).fillRect(-4 * s, 6 * s, 8 * s, 18 * s);
  }
};
