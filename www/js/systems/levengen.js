// Генератор уровня: цепочка комнат, соединённых коридорами. Все размеры в тайлах.
const LevelGen = {
  SIZES: { start: [9, 7], battle: [13, 9], boss: [17, 11], portal: [9, 7] },
  GAP: 7,
  MARGIN: 4,

  shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  },

  make(stage) {
    const nb = stage >= 3 && stage < 5 ? 3 : 2;
    const types = ['start'];
    for (let i = 0; i < nb; i++) types.push('battle');
    types.push(stage === 5 ? 'boss' : 'portal');
    for (let n = 0; n < 200; n++) {
      const r = this.tryMake(types);
      if (r) return r;
    }
    return this.tryMake(types, true);
  },

  hit(a, b, pad) {
    return a.x < b.x + b.w + pad && a.x + a.w + pad > b.x && a.y < b.y + b.h + pad && a.y + a.h + pad > b.y;
  },

  tryMake(types, straight) {
    const G = this.GAP;
    const rooms = [], links = [];
    const s0 = this.SIZES[types[0]];
    rooms.push({ type: types[0], x: 0, y: 0, w: s0[0], h: s0[1], doors: [] });
    for (let i = 1; i < types.length; i++) {
      const cur = rooms[i - 1];
      const sz = this.SIZES[types[i]], w = sz[0], h = sz[1];
      let dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
      dirs = straight ? [[1, 0]] : this.shuffle(dirs);
      let placed = null;
      for (const [dx, dy] of dirs) {
        let x, y, link;
        if (dx !== 0) {
          const cy = cur.y + (cur.h >> 1);
          y = cy - (h >> 1);
          if (dx > 0) { x = cur.x + cur.w + G; link = { x: cur.x + cur.w, y: cy - 1, w: G, h: 2, axis: 'h' }; }
          else { x = cur.x - G - w; link = { x: x + w, y: cy - 1, w: G, h: 2, axis: 'h' }; }
        } else {
          const cx = cur.x + (cur.w >> 1);
          x = cx - (w >> 1);
          if (dy > 0) { y = cur.y + cur.h + G; link = { x: cx - 1, y: cur.y + cur.h, w: 2, h: G, axis: 'v' }; }
          else { y = cur.y - G - h; link = { x: cx - 1, y: y + h, w: 2, h: G, axis: 'v' }; }
        }
        const r = { type: types[i], x, y, w, h, doors: [] };
        let bad = false;
        for (let k = 0; k < rooms.length; k++) {
          if (this.hit(r, rooms[k], 3)) { bad = true; break; }
          if (k !== i - 1 && this.hit(link, rooms[k], 1)) { bad = true; break; }
        }
        if (bad) continue;
        placed = { r, link, dx, dy };
        break;
      }
      if (!placed) return null;
      const { r, link, dx, dy } = placed;
      link.a = i - 1; link.b = i;
      // двери только у боевых комнат; первая дверь у левой/верхней комнаты
      const doorFirst = { x: link.x, y: link.y, w: link.axis === 'h' ? 1 : 2, h: link.axis === 'h' ? 2 : 1 };
      const doorLast = link.axis === 'h'
        ? { x: link.x + G - 1, y: link.y, w: 1, h: 2 }
        : { x: link.x, y: link.y + G - 1, w: 2, h: 1 };
      const firstIsCur = dx > 0 || dy > 0;
      const roomA = firstIsCur ? cur : r, roomB = firstIsCur ? r : cur;
      if (roomA.type === 'battle' || roomA.type === 'boss') roomA.doors.push(doorFirst);
      if (roomB.type === 'battle' || roomB.type === 'boss') roomB.doors.push(doorLast);
      rooms.push(r);
      links.push(link);
    }
    // сдвиг, чтобы всё лежало в положительных координатах с полями
    let minX = 1e9, minY = 1e9, maxX = -1e9, maxY = -1e9;
    rooms.concat(links).forEach(o => {
      minX = Math.min(minX, o.x); minY = Math.min(minY, o.y);
      maxX = Math.max(maxX, o.x + o.w); maxY = Math.max(maxY, o.y + o.h);
    });
    const ox = this.MARGIN - minX, oy = this.MARGIN - minY;
    rooms.forEach(r => {
      r.x += ox; r.y += oy;
      r.doors.forEach(d => { d.x += ox; d.y += oy; });
    });
    links.forEach(l => { l.x += ox; l.y += oy; });
    return { rooms, links, gw: maxX - minX + this.MARGIN * 2, gh: maxY - minY + this.MARGIN * 2 };
  }
};
