/* Carrel 座位預約 — interactive prototype.
   All data is demo data stored in localStorage. */
(() => {
  'use strict';

  // ---------------------------------------------------------------- Constants
  const STORE_KEY = 'carrel.v1';
  const DEMO_USER = { id: 's1120001', password: 'demo1234', name: '示範學生' };
  const RULES = { checkInMin: 15, cancelBeforeMin: 30, perDay: 2, maxActive: 6, maxPoints: 3, suspendDays: 7, days: 7 };
  const SLOTS = [
    { id: 'am', name: '上午', start: '08:00', end: '12:00' },
    { id: 'pm', name: '下午', start: '13:00', end: '17:00' },
    { id: 'ev', name: '晚上', start: '18:00', end: '22:00' },
  ];
  const DOW = ['日', '一', '二', '三', '四', '五', '六'];
  const ZONE_NAME = { quiet: '安靜區', discussion: '討論區' };

  // ---------------------------------------------------------------- Icons (Lucide paths, ISC)
  const ICONS = {
    calendar: '<rect width="18" height="18" x="3" y="4" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
    calendarCheck: '<rect width="18" height="18" x="3" y="4" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/><path d="m9 16 2 2 4-4"/>',
    clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
    layers: '<path d="m12 2 10 5-10 5L2 7z"/><path d="m2 17 10 5 10-5"/><path d="m2 12 10 5 10-5"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 0 0-16 0"/>',
    plug: '<path d="M12 22v-5"/><path d="M9 8V2M15 8V2"/><path d="M18 8v5a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V8z"/>',
    access: '<circle cx="16" cy="4" r="1"/><path d="m18 19 1-7-6 1"/><path d="m5 8 3-3 5.5 3-2.36 3.5"/><path d="M4.24 14.5a5 5 0 0 0 6.88 6"/><path d="M13.76 17.5a5 5 0 0 0-6.88-6"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
    back: '<path d="m12 19-7-7 7-7M19 12H5"/>',
    right: '<path d="m9 18 6-6-6-6"/>',
    alert: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4M12 17h.01"/>',
    info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
    logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5M21 12H9"/>',
    quiet: '<path d="M11 4.7a.7.7 0 0 0-1.2-.5L6.4 7.6A1.4 1.4 0 0 1 5.4 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.4a1.4 1.4 0 0 1 1 .4l3.4 3.4a.7.7 0 0 0 1.2-.5z"/><path d="m22 9-6 6M16 9l6 6"/>',
    talk: '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22z"/>',
    pin: '<path d="M20 10c0 4.99-5.53 10.19-7.4 11.8a1 1 0 0 1-1.2 0C9.53 20.19 4 14.99 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/>',
    swipe: '<path d="M18 8l4 4-4 4M6 8l-4 4 4 4M2 12h20"/>',
    timer: '<path d="M10 2h4M12 14l3-3"/><circle cx="12" cy="14" r="8"/>',
    rotate: '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>',
  };
  const icon = (name, cls = '') => `<svg class="icon ${cls}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${ICONS[name]}</svg>`;
  const BRAND_MARK = `<svg class="brand-mark" viewBox="0 0 32 32" aria-hidden="true"><rect x="1" y="1" width="30" height="30" rx="6" fill="none" stroke="currentColor" stroke-opacity=".35"/><rect x="7" y="8" width="18" height="11" rx="1.5" fill="none" stroke="currentColor" stroke-width="2"/><rect x="11" y="22" width="10" height="4.5" rx="2.25" fill="#50B48A"/></svg>`;

  // ---------------------------------------------------------------- Floor plans
  // Coordinates are in an 880 × 560 drawing; walls run 40–840 × 40–520.
  function tableSeats(x, y, cols, zone, opts = {}) {
    const seats = [];
    for (let i = 0; i < cols; i++) seats.push({ x: x + i * 58, y, w: 56, h: 34, chair: 'up', zone, power: (opts.power || []).includes(i) });
    for (let i = 0; i < cols; i++) seats.push({ x: x + i * 58, y: y + 34, w: 56, h: 34, chair: 'down', zone, power: (opts.power || []).includes(i), accessible: (opts.accessibleBottom || []).includes(i) });
    return seats;
  }
  function rowSeats(x, y, n, step, axis, chair, zone, extra = {}) {
    return Array.from({ length: n }, (_, i) => ({
      x: axis === 'x' ? x + i * step : x,
      y: axis === 'y' ? y + i * step : y,
      w: axis === 'x' ? 56 : 44, h: axis === 'x' ? 34 : 40, chair, zone, ...extra,
    }));
  }

  const FLOORS = [
    {
      id: '4F', name: '討論閱覽區', zones: '討論區', door: 380,
      windows: [['top', 100, 330], ['top', 450, 700], ['right', 80, 330]],
      stacks: [[540, 438, 130, 22], [540, 474, 130, 22]],
      stairs: [700, 430, 110, 70],
      labels: [{ x: 100, y: 476, t: '討論區・可小聲交談' }],
      groups: [
        ...tableSeats(100, 100, 2, 'discussion', { power: [0] }),
        ...tableSeats(290, 100, 2, 'discussion', { power: [1] }),
        ...tableSeats(480, 100, 2, 'discussion'),
        ...tableSeats(100, 300, 2, 'discussion', { accessibleBottom: [0, 1], power: [0] }),
        ...tableSeats(290, 300, 2, 'discussion'),
        ...tableSeats(480, 300, 2, 'discussion', { power: [1] }),
        ...rowSeats(788, 80, 4, 58, 'y', 'left', 'discussion', { power: true }),
      ],
    },
    {
      id: '3F', name: '綜合閱覽區', zones: '安靜區＋討論區', door: 250,
      windows: [['top', 80, 420], ['top', 480, 800], ['left', 380, 480]],
      partition: [452, 40, 452, 400],
      stairs: [700, 430, 110, 70],
      labels: [{ x: 170, y: 478, t: '安靜區・請勿交談' }, { x: 500, y: 478, t: '討論區・可小聲交談' }],
      groups: [
        ...rowSeats(48, 64, 6, 50, 'y', 'right', 'quiet', { power: true }),
        ...tableSeats(170, 150, 4, 'quiet', { power: [0, 3] }),
        { x: 180, y: 336, w: 64, h: 38, chair: 'up', zone: 'quiet', accessible: true, power: true },
        { x: 268, y: 336, w: 64, h: 38, chair: 'up', zone: 'quiet', accessible: true, power: true },
        ...tableSeats(500, 90, 2, 'discussion', { power: [0] }),
        ...tableSeats(660, 90, 2, 'discussion', { power: [1] }),
        ...tableSeats(500, 280, 2, 'discussion'),
        ...tableSeats(660, 280, 2, 'discussion', { power: [0, 1] }),
      ],
      closed: ['A05'],
    },
    {
      id: '2F', name: '安靜閱覽區', zones: '安靜區', door: 116,
      windows: [['top', 90, 300], ['top', 350, 560], ['top', 610, 800]],
      stacks: [[700, 110, 104, 56], [700, 210, 104, 56], [700, 310, 104, 56]],
      stairs: [700, 430, 110, 70],
      labels: [{ x: 96, y: 166, t: '安靜區・請勿交談' }],
      groups: [
        ...rowSeats(96, 52, 8, 70, 'x', 'down', 'quiet', { power: true }),
        ...tableSeats(150, 220, 4, 'quiet', { power: [0, 3] }),
        ...tableSeats(430, 220, 4, 'quiet', { power: [0] }),
        { x: 230, y: 410, w: 64, h: 38, chair: 'up', zone: 'quiet', accessible: true, power: true },
        { x: 318, y: 410, w: 64, h: 38, chair: 'up', zone: 'quiet', accessible: true, power: true },
      ],
    },
  ];
  // Number seats per zone: A = quiet, B = discussion
  const SEATS = {};
  FLOORS.forEach(f => {
    const n = { quiet: 0, discussion: 0 };
    f.seats = f.groups.map(s => {
      const letter = s.zone === 'quiet' ? 'A' : 'B';
      const code = letter + String(++n[s.zone]).padStart(2, '0');
      const seat = { ...s, floor: f.id, code, id: `${f.id}-${code}`, power: !!s.power, accessible: !!s.accessible, closed: (f.closed || []).includes(code) };
      SEATS[seat.id] = seat;
      return seat;
    });
  });
  const floorById = id => FLOORS.find(f => f.id === id);

  // ---------------------------------------------------------------- Time
  let state = null; // loaded once helpers below are defined
  const now = () => new Date(Date.now() + (state.offset || 0));
  const pad = n => String(n).padStart(2, '0');
  const ymd = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const parseYmd = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
  const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
  const slotById = id => SLOTS.find(s => s.id === id);
  const at = (date, hm) => { const [h, m] = hm.split(':').map(Number); const d = parseYmd(date); d.setHours(h, m, 0, 0); return d; };
  const slotStart = (date, slot) => at(date, slotById(slot).start);
  const slotEnd = (date, slot) => at(date, slotById(slot).end);
  const hm = d => `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  const minutes = n => n * 60000;
  function dateLabel(date, withRel = true) {
    const d = parseYmd(date);
    const today = ymd(now());
    const rel = date === today ? '今天' : date === ymd(addDays(now(), 1)) ? '明天' : '';
    const base = `${d.getMonth() + 1}月${d.getDate()}日（週${DOW[d.getDay()]}）`;
    return withRel && rel ? `${rel}・${base}` : base;
  }
  const slotLabel = id => { const s = slotById(id); return `${s.name} ${s.start}–${s.end}`; };
  const dateRange = () => Array.from({ length: RULES.days }, (_, i) => ymd(addDays(now(), i)));

  // ---------------------------------------------------------------- Demo occupancy
  function hash(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    h ^= h >>> 16; h = Math.imul(h, 0x85ebca6b); h ^= h >>> 13; h = Math.imul(h, 0xc2b2ae35); h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  }
  function occupancyRate(date, slot) {
    const idx = dateRange().indexOf(date);
    if (idx === 2 && slot === 'ev') return 1; // a fully booked slot to demonstrate the "full" state
    const base = { am: 0.42, pm: 0.68, ev: 0.55 }[slot];
    const dow = parseYmd(date).getDay();
    return dow === 0 || dow === 6 ? base - 0.2 : base;
  }
  function seatStatus(seat, date, slot) {
    if (seat.closed) return 'closed';
    if (state.bookings.some(b => b.seatId === seat.id && b.date === date && b.slot === slot && (b.status === 'upcoming' || b.status === 'checkedin'))) return 'booked';
    if ((state.taken || []).includes(`${date}|${slot}|${seat.id}`)) return 'booked';
    return hash(`${date}|${slot}|${seat.id}`) < occupancyRate(date, slot) ? 'booked' : 'available';
  }
  // A seat that looks free but is taken by someone else at the moment of confirming (demonstrates the race state)
  const isContested = (seat, date, slot) => hash(`race|${date}|${slot}|${seat.id}`) < 0.06;
  function freeCount(date, slot, floorId) {
    const list = floorId ? floorById(floorId).seats : Object.values(SEATS);
    return list.filter(s => seatStatus(s, date, slot) === 'available').length;
  }

  // ---------------------------------------------------------------- Store
  function seedState() {
    const today = new Date();
    const d = n => ymd(addDays(today, n));
    const nowMin = today.getHours() * 60 + today.getMinutes();
    const nextDate = nowMin < 17 * 60 ? d(0) : d(1);
    const nextSlot = nowMin < 17 * 60 ? 'ev' : 'am';
    return {
      loggedIn: false,
      offset: 0,
      points: 1,
      suspendedUntil: null,
      taken: [],
      notices: [],
      bookings: [
        { id: 'b1', date: nextDate, slot: nextSlot, seatId: '3F-A02', status: 'upcoming', created: Date.now() },
        { id: 'b2', date: d(-3), slot: 'pm', seatId: '2F-A03', status: 'completed', checkedInAt: null, created: Date.now() },
        { id: 'b3', date: d(-5), slot: 'am', seatId: '3F-A09', status: 'noshow', created: Date.now() },
      ],
    };
  }
  function load() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) { /* storage unavailable: fall back to memory */ }
    return seedState();
  }
  function save() { try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) { /* ignore */ } }

  state = load();

  // ---------------------------------------------------------------- Rules
  const isActive = b => (b.status === 'upcoming' || b.status === 'checkedin') && slotEnd(b.date, b.slot) > now();
  const activeBookings = () => state.bookings.filter(isActive);
  const isSuspended = () => !!state.suspendedUntil && new Date(state.suspendedUntil) > now();

  function processTime() {
    const t = now();
    let changed = false;
    state.bookings.forEach(b => {
      const start = slotStart(b.date, b.slot), end = slotEnd(b.date, b.slot);
      if (b.status === 'upcoming' && t > new Date(start.getTime() + minutes(RULES.checkInMin))) {
        b.status = 'noshow';
        state.points += 1;
        state.notices.push({ id: 'n' + Date.now() + b.id, type: 'danger', title: '未在時限內報到，已記 1 點', text: `${dateLabel(b.date, false)} ${slotLabel(b.slot)}・${b.seatId} 已自動取消，座位已釋出。` });
        changed = true;
      } else if (b.status === 'checkedin' && t >= end) {
        b.status = 'completed'; changed = true;
      }
    });
    if (state.points >= RULES.maxPoints && !state.suspendedUntil) {
      state.suspendedUntil = addDays(t, RULES.suspendDays).toISOString();
      state.bookings.forEach(b => { if (b.status === 'upcoming') b.status = 'cancelled'; });
      state.notices.push({ id: 'ns' + Date.now(), type: 'danger', title: '預約權已暫停 7 天', text: '累計 3 點違規。暫停期間無法預約，原有預約已取消。' });
      changed = true;
    }
    if (state.suspendedUntil && new Date(state.suspendedUntil) <= t) {
      state.suspendedUntil = null; state.points = 0; changed = true;
    }
    if (changed) save();
    return changed;
  }

  function slotAvailability(date, slot) {
    const start = slotStart(date, slot), end = slotEnd(date, slot), t = now();
    if (t >= end) return { ok: false, label: '已結束', reason: '這個時段已經結束' };
    if (t >= start) return { ok: false, label: '進行中', reason: '時段開始後無法新增預約' };
    if (state.bookings.some(b => b.date === date && b.slot === slot && isActive(b))) return { ok: false, label: '已預約', reason: '你已預約這個時段', mine: true };
    if (isSuspended()) return { ok: false, label: '停權中', reason: '預約權暫停中' };
    const sameDay = state.bookings.filter(b => b.date === date && isActive(b)).length;
    if (sameDay >= RULES.perDay) return { ok: false, label: '已達上限', reason: `每天最多預約 ${RULES.perDay} 個時段` };
    if (activeBookings().length >= RULES.maxActive) return { ok: false, label: '已達上限', reason: `最多同時持有 ${RULES.maxActive} 筆預約` };
    const free = freeCount(date, slot);
    if (free === 0) return { ok: false, label: '已額滿', reason: '所有樓層都已額滿', full: true };
    return { ok: true, free };
  }
  function dayAvailability(date) {
    const results = SLOTS.map(s => slotAvailability(date, s.id));
    return { any: results.some(r => r.ok), results };
  }
  function nextOpenSlot() {
    for (const date of dateRange()) for (const s of SLOTS) { const a = slotAvailability(date, s.id); if (a.ok) return { date, slot: s.id, free: a.free }; }
    return null;
  }

  function bookingPhase(b) {
    const t = now().getTime();
    const start = slotStart(b.date, b.slot).getTime(), end = slotEnd(b.date, b.slot).getTime();
    const checkDeadline = start + minutes(RULES.checkInMin);
    const cancelDeadline = start - minutes(RULES.cancelBeforeMin);
    if (b.status === 'cancelled') return { key: 'cancelled', badge: ['badge-muted', '已取消'] };
    if (b.status === 'noshow') return { key: 'noshow', badge: ['badge-danger', '未報到・記 1 點'] };
    if (b.status === 'completed') return { key: 'completed', badge: ['badge-muted', '已完成'] };
    if (b.status === 'checkedin') return { key: 'checkedin', badge: ['badge-green', '已報到'], end };
    if (t < cancelDeadline) return { key: 'early', badge: ['', '已預約'], canCancel: true, cancelDeadline, start, checkDeadline };
    if (t < start) return { key: 'soon', badge: ['badge-warn', '即將開始'], start, checkDeadline, cancelDeadline };
    if (t <= checkDeadline) return { key: 'checkin', badge: ['badge-warn', '請報到'], canCheckIn: true, checkDeadline, left: Math.max(0, Math.ceil((checkDeadline - t) / 60000)) };
    return { key: 'late', badge: ['badge-danger', '逾時'] };
  }
  const isUpcomingList = b => b.status === 'upcoming' || (b.status === 'checkedin' && slotEnd(b.date, b.slot) > now());
  const sortByTime = (a, b) => slotStart(a.date, a.slot) - slotStart(b.date, b.slot);

  // ---------------------------------------------------------------- Plan drawing
  function chairRect(s) {
    const cx = s.x + s.w / 2, cy = s.y + s.h / 2;
    switch (s.chair) {
      case 'up': return [cx - 13, s.y - 16, 26, 12];
      case 'down': return [cx - 13, s.y + s.h + 4, 26, 12];
      case 'left': return [s.x - 16, cy - 13, 12, 26];
      default: return [s.x + s.w + 4, cy - 13, 12, 26];
    }
  }
  const markSvg = (name, x, y, size = 11) => `<svg class="mark" x="${x}" y="${y}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name]}</svg>`;

  function drawFixtures(f) {
    const out = [];
    const d = f.door;
    // Windows (double line across the wall)
    f.windows.forEach(([side, a, b]) => {
      if (side === 'top') out.push(`<rect class="window" x="${a}" y="36" width="${b - a}" height="8"/><line class="window" x1="${a}" y1="40" x2="${b}" y2="40"/>`);
      if (side === 'left') out.push(`<rect class="window" x="36" y="${a}" width="8" height="${b - a}"/><line class="window" x1="40" y1="${a}" x2="40" y2="${b}"/>`);
      if (side === 'right') out.push(`<rect class="window" x="836" y="${a}" width="8" height="${b - a}"/><line class="window" x1="840" y1="${a}" x2="840" y2="${b}"/>`);
    });
    // Outer walls with a door opening on the bottom wall, and the door swing
    out.unshift(`<path class="wall" d="M${d} 520 H40 V40 H840 V520 H${d + 64}"/>`);
    out.push(`<path class="door" d="M${d} 520 L${d} 456 A64 64 0 0 1 ${d + 64} 520"/>`);
    out.push(`<text class="fixture-label" x="${d + 32}" y="546" text-anchor="middle">入口</text>`);
    if (f.partition) {
      const [x1, y1, x2, y2] = f.partition;
      out.push(`<rect class="glass" x="${x1 - 3}" y="${y1}" width="6" height="${y2 - y1}"/><line class="partition" x1="${x1}" y1="${y2 - 2}" x2="${x2}" y2="${y2 + 2}"/>`);
    }
    (f.stacks || []).forEach(([x, y, w, h]) => out.push(`<rect class="stack" x="${x}" y="${y}" width="${w}" height="${h}"/>`));
    if (f.stacks && f.stacks.length) {
      const [x, y, w] = f.stacks[0];
      out.push(`<text class="fixture-label" x="${x + w / 2}" y="${y - 8}" text-anchor="middle">書架</text>`);
    }
    if (f.stairs) {
      const [x, y, w, h] = f.stairs;
      let steps = '';
      for (let i = 1; i < 8; i++) steps += `<line class="door" x1="${x + (w / 8) * i}" y1="${y}" x2="${x + (w / 8) * i}" y2="${y + h}"/>`;
      out.push(`<rect class="stairs" x="${x}" y="${y}" width="${w}" height="${h}"/>${steps}<path class="door" d="M${x + 8} ${y + h / 2} H${x + w - 14} m-8 -6 l8 6 -8 6"/>`);
      out.push(`<text class="fixture-label" x="${x + w / 2}" y="${y - 8}" text-anchor="middle">樓梯</text>`);
    }
    f.labels.forEach(l => out.push(`<text class="room-label" x="${l.x}" y="${l.y}">${l.t}</text>`));
    return out.join('');
  }

  function seatSvg(s, status, opts) {
    const [cx, cy, cw, ch] = chairRect(s);
    const minX = Math.min(s.x, cx) - 4, minY = Math.min(s.y, cy) - 4;
    const maxX = Math.max(s.x + s.w, cx + cw) + 4, maxY = Math.max(s.y + s.h, cy + ch) + 4;
    const marks = [];
    const hasMarks = s.power || s.accessible;
    if (s.power) marks.push(markSvg('plug', s.x + 5, s.y + s.h - 15));
    if (s.accessible) marks.push(markSvg('access', s.x + s.w - 16, s.y + s.h - 15));
    const numY = hasMarks ? s.y + 15 : s.y + s.h / 2 + 4;
    const cross = status === 'closed' ? `<path class="x" d="M${s.x + 6} ${s.y + 6} L${s.x + s.w - 6} ${s.y + s.h - 6} M${s.x + s.w - 6} ${s.y + 6} L${s.x + 6} ${s.y + s.h - 6}"/>` : '';
    const selected = opts.selected === s.id;
    const cls = ['seat', selected ? 'selected' : status, opts.dim ? 'dim' : ''].join(' ');
    const statusText = selected ? '已選擇' : { available: '可預約', booked: '已被預約', closed: '暫停使用' }[status];
    const attrs = [ZONE_NAME[s.zone], s.power ? '有插座' : '', s.accessible ? '無障礙座位' : ''].filter(Boolean).join('，');
    const interactive = opts.mode === 'interactive';
    const a11y = interactive
      ? `role="button" tabindex="${opts.tabStop === s.id ? 0 : -1}" aria-label="${s.code} 座位，${attrs}，${statusText}" aria-pressed="${selected}" aria-disabled="${status !== 'available' && !selected}" data-seat="${s.id}"`
      : 'aria-hidden="true"';
    return `<g class="${cls}" ${a11y}>
      <rect class="hit" x="${minX}" y="${minY}" width="${maxX - minX}" height="${maxY - minY}"/>
      <rect class="chair" x="${cx}" y="${cy}" width="${cw}" height="${ch}" rx="5"/>
      <rect class="desk" x="${s.x}" y="${s.y}" width="${s.w}" height="${s.h}" rx="2"/>
      ${cross}
      <text class="seat-no" x="${s.x + s.w / 2}" y="${numY}">${s.code}</text>
      ${marks.join('')}
      <g class="check-badge"><circle cx="${s.x + s.w}" cy="${s.y}" r="8"/><path d="M${s.x + s.w - 4} ${s.y} l3 3 5 -6"/></g>
      <rect class="focus-ring" x="${minX}" y="${minY}" width="${maxX - minX}" height="${maxY - minY}" rx="4"/>
    </g>`;
  }

  function planSvg(floorId, opts = {}) {
    const f = floorById(floorId);
    const mode = opts.mode || 'interactive';
    if (mode === 'mini' || mode === 'decor') {
      const seats = f.seats.map(s => {
        const [cx, cy, cw, ch] = chairRect(s);
        const here = opts.highlight === s.id;
        const ring = here ? `<circle class="here-ring" cx="${s.x + s.w / 2}" cy="${s.y + s.h / 2}" r="34"/>` : '';
        return `<g class="${here ? 'here' : ''}"><rect class="chair" x="${cx}" y="${cy}" width="${cw}" height="${ch}" rx="5"/><rect class="desk" x="${s.x}" y="${s.y}" width="${s.w}" height="${s.h}" rx="2"/>${ring}</g>`;
      }).join('');
      return `<svg class="plan ${mode}" viewBox="0 0 880 560" ${opts.label ? `role="img" aria-label="${opts.label}"` : 'aria-hidden="true"'}>${drawFixtures(f)}${seats}</svg>`;
    }
    const seats = f.seats.map(s => seatSvg(s, seatStatus(s, opts.date, opts.slot), {
      mode, selected: opts.selected, tabStop: opts.tabStop, dim: opts.filter && !opts.filter(s),
    })).join('');
    return `<svg class="plan" viewBox="0 0 880 560" role="group" aria-label="${f.id} ${f.name}平面圖，用方向鍵移動、Enter 選擇座位">${drawFixtures(f)}${seats}</svg>`;
  }

  const legendItem = (cls, label, extra = '') => `<li><svg viewBox="0 0 26 18" aria-hidden="true"><g class="seat ${cls}"><rect class="desk" x="2" y="2" width="22" height="14" rx="2"/>${extra}</g></svg>${label}</li>`;
  const LEGEND = `<ul class="legend plan" aria-label="圖例">
    ${legendItem('available', '可預約')}
    ${legendItem('booked', '已被預約')}
    ${legendItem('selected', '你選的座位')}
    ${legendItem('closed', '暫停使用', '<path class="x" d="M7 5 L19 13 M19 5 L7 13"/>')}
    <li>${icon('plug', 'icon-sm')}有插座</li>
    <li>${icon('access', 'icon-sm')}無障礙座位</li>
  </ul>`;

  // ---------------------------------------------------------------- Booking draft
  const draft = { date: null, slot: null, floor: '3F', seatId: null, zone: 'all', power: false, accessible: false, ack: false, error: null };
  const seatMatches = s => (draft.zone === 'all' || s.zone === draft.zone) && (!draft.power || s.power) && (!draft.accessible || s.accessible);
  function resetDraft() { Object.assign(draft, { date: null, slot: null, floor: '3F', seatId: null, zone: 'all', power: false, accessible: false, ack: false, error: null }); }

  // ---------------------------------------------------------------- Rendering helpers
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const route = () => (location.hash.replace(/^#\/?/, '') || 'home');
  const go = r => { if (location.hash === '#/' + r) render(); else location.hash = '#/' + r; };

  function toast(text, kind = 'info') {
    const region = document.getElementById('toasts');
    const el = document.createElement('div');
    el.className = 'toast';
    el.innerHTML = `${icon(kind === 'ok' ? 'check' : 'info')}<span>${esc(text)}</span>`;
    region.appendChild(el);
    setTimeout(() => el.remove(), 3800);
  }

  function pips(cls = '') {
    return `<span class="pips ${cls}" aria-hidden="true">${Array.from({ length: RULES.maxPoints }, (_, i) => `<span class="pip ${i < state.points ? 'on' : ''}"></span>`).join('')}</span>`;
  }

  const NAV = [
    { r: 'book', label: '預約座位', short: '預約', icon: 'calendar' },
    { r: 'bookings', label: '我的預約', short: '我的預約', icon: 'calendarCheck' },
    { r: 'me', label: '帳戶與規則', short: '我的', icon: 'user' },
  ];
  function shell(content, current) {
    const navItems = NAV.map(n => `<li><a class="nav-link" href="#/${n.r}" ${current === n.r ? 'aria-current="page"' : ''}>${icon(n.icon)}${n.label}</a></li>`).join('');
    const tabs = NAV.map(n => `<a class="tab" href="#/${n.r}" ${current === n.r ? 'aria-current="page"' : ''}>${icon(n.icon)}${n.short}</a>`).join('');
    const demo = state.offset ? `<div class="demo-strip" role="note">${icon('timer', 'icon-sm')}<span>示範時間：<span class="num">${dateLabel(ymd(now()), false)} ${hm(now())}</span></span><button type="button" data-action="time-reset">回到現在時間</button></div>` : '';
    return `<div class="layout">
      <aside class="rail shell" aria-label="主要導覽">
        <a class="brand" href="#/home">${BRAND_MARK}<span><span class="brand-name">Carrel</span><span class="brand-sub">總圖書館座位預約</span></span></a>
        <nav><ul class="nav-list">
          <li><a class="nav-link" href="#/home" ${current === 'home' ? 'aria-current="page"' : ''}>${icon('pin')}總覽</a></li>
          ${navItems}
        </ul></nav>
        <div class="rail-user">
          <span class="rail-user-name">${DEMO_USER.name}</span>
          <span class="rail-user-id num">學號 ${DEMO_USER.id}</span>
          <span class="points-inline">違規點數 ${pips()} <span class="num">${state.points}/${RULES.maxPoints}</span></span>
        </div>
      </aside>
      <header class="topbar shell">
        <a class="brand" href="#/home">${BRAND_MARK}<span><span class="brand-name">Carrel</span><span class="brand-sub">總圖書館座位預約</span></span></a>
        <a class="points-inline" href="#/me" style="text-decoration:none">違規 ${pips()}<span class="visually-hidden">${state.points} / ${RULES.maxPoints} 點</span></a>
      </header>
      <main class="main" id="main" tabindex="-1">${demo}${content}</main>
      <nav class="tabbar" aria-label="主要導覽">${tabs}</nav>
    </div>`;
  }

  // ---------------------------------------------------------------- Views
  function viewLogin(err = {}, values = {}) {
    return `<div class="login">
      <section class="login-art shell">
        <a class="brand" href="#/login">${BRAND_MARK}<span><span class="brand-name">Carrel</span><span class="brand-sub">總圖書館座位預約</span></span></a>
        ${planSvg('3F', { mode: 'decor' })}
        <div>
          <h1>先選好座位，再去圖書館。</h1>
          <p style="margin-top:10px">每天三個時段、可預約未來 7 天。時段開始後 15 分鐘內報到，座位就是你的。</p>
        </div>
      </section>
      <section class="login-form-wrap">
        <form class="login-form" data-form="login" novalidate>
          <div>
            <h2 class="page-title">登入</h2>
            <p class="page-lede">使用學號與校務系統密碼登入。</p>
          </div>
          <div class="field">
            <label for="sid">學號</label>
            <input id="sid" name="sid" autocomplete="username" inputmode="text" value="${esc(values.sid || '')}" ${err.sid ? 'aria-invalid="true" aria-describedby="sid-err"' : ''}>
            ${err.sid ? `<p class="field-error" id="sid-err">${icon('alert', 'icon-sm')}${err.sid}</p>` : ''}
          </div>
          <div class="field">
            <label for="pw">密碼</label>
            <input id="pw" name="pw" type="password" autocomplete="current-password" ${err.pw ? 'aria-invalid="true" aria-describedby="pw-err"' : ''}>
            ${err.pw ? `<p class="field-error" id="pw-err">${icon('alert', 'icon-sm')}${err.pw}</p>` : ''}
          </div>
          <button class="btn btn-primary btn-block" type="submit">登入</button>
          <div class="demo-account">
            <span>這是 Prototype，請使用示範帳號：學號 <strong class="num">${DEMO_USER.id}</strong>，密碼 <strong class="num">${DEMO_USER.password}</strong></span>
            <button class="btn btn-secondary" type="button" data-action="fill-demo">填入示範帳號</button>
          </div>
        </form>
      </section>
    </div>`;
  }

  function noticesHtml() {
    return state.notices.map(n => `<div class="notice notice-${n.type}" role="alert">${icon('alert')}<div><strong>${esc(n.title)}</strong><p>${esc(n.text)}</p></div><div class="notice-actions"><button class="btn btn-ghost" data-action="dismiss" data-id="${n.id}">知道了</button></div></div>`).join('');
  }

  function bookingActions(b, ph, { compact = false } = {}) {
    if (ph.canCheckIn) return `<button class="btn btn-primary" data-action="checkin" data-id="${b.id}">${icon('check')}我已到座位，報到</button>`;
    if (ph.key === 'early') return `<button class="btn btn-danger" data-action="ask-cancel" data-id="${b.id}">取消預約</button>`;
    if (ph.key === 'soon') return compact ? '' : `<span class="reason">已超過取消期限；${hm(new Date(ph.start))} 開放報到</span>`;
    return '';
  }

  function viewHome() {
    const upcoming = state.bookings.filter(isUpcomingList).sort(sortByTime);
    const next = upcoming[0];
    let nextHtml;
    if (next) {
      const ph = bookingPhase(next);
      const seat = SEATS[next.seatId];
      const start = slotStart(next.date, next.slot);
      const checkBy = new Date(start.getTime() + minutes(RULES.checkInMin));
      const lead = ph.canCheckIn
        ? `<div class="notice notice-warn" style="margin-top:14px">${icon('timer')}<div><strong>現在可以報到，還剩 <span class="num">${ph.left}</span> 分鐘</strong><p>請在 <span class="num">${hm(checkBy)}</span> 前完成，逾時將自動取消並記 1 點。</p></div></div>`
        : ph.key === 'checkedin' ? `<div class="notice notice-green" style="margin-top:14px">${icon('check')}<div><strong>已報到</strong><p>使用到 <span class="num">${slotById(next.slot).end}</span>，離開時記得帶走個人物品。</p></div></div>` : '';
      nextHtml = `<section class="sheet" aria-labelledby="next-h">
        <div class="next-booking">
          <div>
            <h2 class="section-title" id="next-h">下一筆預約</h2>
            <p class="booking-when"><span>${dateLabel(next.date)}</span><br><span class="num">${slotLabel(next.slot)}</span></p>
            <p class="booking-where"><span>${icon('layers', 'icon-sm')}${seat.floor} ${floorById(seat.floor).name}</span><span>${icon('pin', 'icon-sm')}座位 <strong class="num">${seat.code}</strong></span><span class="badge ${ph.badge[0]}">${ph.badge[1]}</span></p>
            ${lead}
            ${ph.key === 'early' || ph.key === 'soon' ? `<dl class="kv"><dt>報到時間</dt><dd class="num">${hm(start)}–${hm(checkBy)}</dd><dt>可取消至</dt><dd class="num">${ph.key === 'early' ? hm(new Date(ph.cancelDeadline)) : '已超過期限'}</dd></dl>` : ''}
            <div class="actions">${bookingActions(next, ph, { compact: true })}<a class="btn btn-secondary" href="#/bookings">全部預約</a></div>
          </div>
          <figure class="mini-plan" style="margin:0">${planSvg(seat.floor, { mode: 'mini', highlight: seat.id, label: `${seat.floor} 平面圖，標出座位 ${seat.code} 的位置` })}<figcaption><span>${seat.floor} 平面圖</span><span>綠色為你的座位</span></figcaption></figure>
        </div>
      </section>`;
    } else {
      nextHtml = `<section class="sheet empty" aria-labelledby="next-h">
        <h2 class="section-title" id="next-h">還沒有預約</h2>
        <p class="muted">選一個時段和座位，到館後 15 分鐘內報到就可以使用。</p>
        <a class="btn btn-primary" href="#/book" ${isSuspended() ? 'aria-disabled="true" tabindex="-1" style="pointer-events:none;opacity:.5"' : ''}>預約第一個座位</a>
      </section>`;
    }

    const open = nextOpenSlot();
    let quick;
    if (isSuspended()) {
      quick = `<section class="sheet"><h2 class="section-title">預約權暫停中</h2><p class="muted">累計 ${RULES.maxPoints} 點違規，<span class="num">${dateLabel(ymd(new Date(state.suspendedUntil)), false)}</span> 起恢復預約。</p></section>`;
    } else if (open) {
      quick = `<section class="sheet quick" aria-labelledby="quick-h">
        <h2 class="section-title" id="quick-h" style="margin:0">快速預約</h2>
        <div class="quick-slot"><span><strong>${dateLabel(open.date).split('・')[0]}・${slotById(open.slot).name}</strong><br><span class="muted num">${slotById(open.slot).start}–${slotById(open.slot).end}</span></span><span class="slot-left num">剩 ${open.free} 位</span></div>
        <button class="btn btn-primary" data-action="quick" data-date="${open.date}" data-slot="${open.slot}">直接選座位 ${icon('right')}</button>
        <a class="btn btn-ghost" href="#/book">選其他日期或時段</a>
      </section>`;
    } else {
      quick = `<section class="sheet"><h2 class="section-title">目前沒有可預約的時段</h2><p class="muted">可能已達預約上限，或未來 7 天都已額滿。</p><a class="btn btn-secondary" href="#/bookings" style="margin-top:12px">查看我的預約</a></section>`;
    }

    const pts = state.points > 0 ? `<section class="sheet" aria-labelledby="pts-h">
        <h2 class="section-title" id="pts-h" style="margin-bottom:4px">違規點數 <span class="num">${state.points} / ${RULES.maxPoints}</span></h2>
        <div class="points-meter" aria-hidden="true">${Array.from({ length: RULES.maxPoints }, (_, i) => `<span class="${i < state.points ? 'on' : ''}"></span>`).join('')}</div>
        <p class="muted small">${state.points >= RULES.maxPoints - 1 && !isSuspended() ? '<strong style="color:var(--danger)">再 1 次未報到將暫停預約 7 天。</strong>' : '未報到會記 1 點，累計 3 點暫停預約 7 天。'}</p>
        <a href="#/me" class="small">查看規則</a>
      </section>` : '';

    const h = now().getHours();
    const greet = h < 11 ? '早安' : h < 18 ? '午安' : '晚安';
    return shell(`<div class="page">
      <div class="page-head"><div><h1 class="page-title">${greet}，${DEMO_USER.name}</h1><p class="page-lede num">${dateLabel(ymd(now()), false)}・總圖書館開放 08:00–22:00</p></div></div>
      ${state.notices.length ? `<div style="display:grid;gap:10px;margin-bottom:16px">${noticesHtml()}</div>` : ''}
      <div class="home-grid">${nextHtml}<div class="home-side">${quick}${pts}</div></div>
    </div>`, 'home');
  }

  function stepper(n) {
    const names = ['日期與時段', '座位', '確認'];
    return `<ol class="steps" aria-label="預約步驟">${names.map((s, i) => `<li class="${i < n ? 'done' : ''}" ${i === n ? 'aria-current="step"' : ''}>${s}</li>`).join('')}</ol>`;
  }

  function viewBookDate() {
    if (isSuspended()) {
      return shell(`<div class="page"><div class="page-head"><div><h1 class="page-title">預約座位</h1></div></div>
        <div class="notice notice-danger">${icon('alert')}<div><strong>預約權暫停中</strong><p>累計 ${RULES.maxPoints} 點違規，${dateLabel(ymd(new Date(state.suspendedUntil)), false)} 起可以再預約。</p></div></div></div>`, 'book');
    }
    const dates = dateRange();
    if (!draft.date) draft.date = dates.find(d => dayAvailability(d).any) || dates[0];
    const dateBtns = dates.map(d => {
      const dd = parseYmd(d);
      const rel = d === dates[0] ? '今天' : d === dates[1] ? '明天' : '';
      const avail = dayAvailability(d);
      return `<button type="button" class="date-btn" aria-pressed="${draft.date === d}" data-action="pick-date" data-date="${d}" aria-label="${dateLabel(d, false)}${avail.any ? '' : '，無可預約時段'}">
        <span class="dow">週${DOW[dd.getDay()]}</span><span class="day num">${dd.getDate()}</span><span class="rel">${rel || (avail.any ? `${dd.getMonth() + 1}月` : '無空位')}</span></button>`;
    }).join('');
    const slotBtns = SLOTS.map(s => {
      const a = slotAvailability(draft.date, s.id);
      const pressed = draft.slot === s.id && a.ok;
      return `<button type="button" class="slot" data-action="pick-slot" data-slot="${s.id}" aria-pressed="${pressed}" ${a.ok ? '' : 'disabled'} aria-describedby="slot-${s.id}-st">
        <span class="slot-name">${s.name}${a.ok ? '' : `<span class="badge ${a.mine ? 'badge-green' : 'badge-muted'}">${a.label}</span>`}</span>
        <span class="slot-time num">${s.start}–${s.end}</span>
        <span class="slot-left num" id="slot-${s.id}-st">${a.ok ? `剩 ${a.free} 位` : a.reason}</span>
      </button>`;
    }).join('');
    const fullSuggestion = SLOTS.every(s => !slotAvailability(draft.date, s.id).ok) ? '' : '';
    const ready = draft.slot && slotAvailability(draft.date, draft.slot).ok;
    const sameDay = state.bookings.filter(b => b.date === draft.date && isActive(b)).length;
    return shell(`<div class="page">
      <div class="page-head"><div><h1 class="page-title">預約座位</h1><p class="page-lede">可預約未來 7 天，每天最多 ${RULES.perDay} 個時段。</p></div></div>
      ${stepper(0)}
      <section class="sheet" aria-labelledby="d-h">
        <h2 class="section-title" id="d-h">選擇日期</h2>
        <div class="date-strip" role="group" aria-label="日期">${dateBtns}</div>
        <h2 class="section-title" style="margin-top:20px" id="s-h">選擇時段・<span class="num">${dateLabel(draft.date, false)}</span></h2>
        <div class="slot-list" role="group" aria-labelledby="s-h">${slotBtns}</div>
        ${sameDay ? `<p class="hint" style="margin-top:12px">這天你已預約 ${sameDay} 個時段（上限 ${RULES.perDay}）。</p>` : ''}
        ${fullSuggestion}
      </section>
      <div class="footer-bar">
        <span class="hint" aria-live="polite">${ready ? `已選 <span class="num">${dateLabel(draft.date, false)} ${slotLabel(draft.slot)}</span>` : '請先選擇一個時段'}</span>
        <button class="btn btn-primary" data-action="to-seat" ${ready ? '' : 'disabled'}>下一步：選座位 ${icon('right')}</button>
      </div>
    </div>`, 'book');
  }

  function viewBookSeat() {
    if (!draft.date || !draft.slot || !slotAvailability(draft.date, draft.slot).ok) { draft.slot = null; return viewBookDate(); }
    const f = floorById(draft.floor);
    const visibleFree = f.seats.filter(s => seatMatches(s) && seatStatus(s, draft.date, draft.slot) === 'available');
    const seat = draft.seatId ? SEATS[draft.seatId] : null;
    const tabStop = (seat && seat.floor === f.id ? seat.id : null) || (visibleFree[0] || f.seats[0]).id;
    const filtersOn = draft.zone !== 'all' || draft.power || draft.accessible;
    const altFloor = filtersOn && !visibleFree.length ? FLOORS.find(o => o.id !== f.id && o.seats.some(s => seatMatches(s) && seatStatus(s, draft.date, draft.slot) === 'available')) : null;

    const directory = FLOORS.map(fl => {
      const free = freeCount(draft.date, draft.slot, fl.id);
      return `<button type="button" class="floor-btn" data-action="pick-floor" data-floor="${fl.id}" aria-pressed="${fl.id === f.id}">
        <span class="floor-no">${fl.id}</span><span class="floor-name">${fl.name}</span><span class="floor-left num">${free ? `剩 ${free} / ${fl.seats.length} 位` : '已額滿'}</span></button>`;
    }).join('');

    let sel;
    if (seat) {
      sel = `<div class="selection">
        <div class="selection-compact"><div><p class="muted small">你選的座位</p><p class="seat-title">${seat.floor}・${seat.code}</p></div></div>
        <ul class="attr-list">
          <li>${icon(seat.zone === 'quiet' ? 'quiet' : 'talk')}${ZONE_NAME[seat.zone]}${seat.zone === 'quiet' ? '・請勿交談' : '・可小聲交談'}</li>
          <li>${icon('plug')}${seat.power ? '有插座' : '沒有插座'}</li>
          ${seat.accessible ? `<li>${icon('access')}無障礙座位</li>` : ''}
        </ul>
        ${seat.accessible ? `<label class="check-row"><input type="checkbox" data-action="ack" ${draft.ack ? 'checked' : ''}><span>此座位保留給行動不便的同學。我確認自己需要使用無障礙座位。</span></label>` : ''}
        <button class="btn btn-primary btn-block" data-action="to-confirm" ${seat.accessible && !draft.ack ? 'disabled' : ''}>確認這個座位 ${icon('right')}</button>
        <button class="btn btn-ghost btn-block" data-action="clear-seat">重新選擇</button>
      </div>`;
    } else {
      sel = `<div class="selection"><p class="section-title" style="margin:0">還沒選座位</p><p class="selection-empty small">在平面圖上點選空心座位；斜線表示已被預約，再點一次可取消選取。</p></div>`;
    }
    const err = draft.error ? `<div class="notice notice-danger" role="alert" style="margin-bottom:16px">${icon('alert')}<div><strong>${esc(draft.error.title)}</strong><p>${esc(draft.error.text)}</p></div></div>` : '';

    const emptyOverlay = filtersOn && !visibleFree.length ? `<div class="plan-empty" role="status">
        <p class="section-title" style="margin:0">這層沒有符合條件的空位</p>
        <p class="muted small">${altFloor ? `${altFloor.id} ${altFloor.name}還有符合條件的座位。` : '試著放寬篩選條件。'}</p>
        <div class="actions" style="margin:0;justify-content:center">${altFloor ? `<button class="btn btn-primary" data-action="pick-floor" data-floor="${altFloor.id}">改看 ${altFloor.id}</button>` : ''}<button class="btn btn-secondary" data-action="clear-filters">清除篩選</button></div>
      </div>` : '';

    return shell(`<div class="page has-sheet">
      <div class="page-head"><div><h1 class="page-title">選擇座位</h1></div></div>
      ${stepper(1)}
      <div class="context-bar">${icon('calendar', 'icon-sm')}<strong class="num">${dateLabel(draft.date, false)}</strong><span class="num">${slotLabel(draft.slot)}</span><button class="btn btn-ghost" style="margin-left:auto;min-height:36px" data-action="back-date">修改日期時段</button></div>
      ${err}
      <div class="seat-layout">
        <nav aria-label="樓層"><p class="directory-title">樓層指引</p><div class="directory">${directory}</div></nav>
        <section class="sheet plan-card" aria-labelledby="plan-h">
          <div class="filters" role="group" aria-label="篩選座位">
            <div class="seg" role="group" aria-label="區域">
              ${[['all', '全部'], ['quiet', '安靜區'], ['discussion', '討論區']].map(([v, l]) => `<button type="button" data-action="zone" data-zone="${v}" aria-pressed="${draft.zone === v}">${l}</button>`).join('')}
            </div>
            <button type="button" class="chip" data-action="toggle-power" aria-pressed="${draft.power}">${icon('plug', 'icon-sm')}有插座</button>
            <button type="button" class="chip" data-action="toggle-access" aria-pressed="${draft.accessible}">${icon('access', 'icon-sm')}無障礙</button>
          </div>
          <div class="plan-head"><h2 id="plan-h">${f.id} ${f.name}</h2><span class="muted small num">符合條件的空位 ${visibleFree.length}</span></div>
          <div class="plan-scroll">${planSvg(f.id, { date: draft.date, slot: draft.slot, selected: draft.seatId, tabStop, filter: filtersOn ? seatMatches : null })}${emptyOverlay}</div>
          <p class="scroll-hint">${icon('swipe', 'icon-sm')}左右滑動查看整層</p>
          ${LEGEND}
        </section>
        <aside class="sheet seat-side" aria-label="選取的座位" aria-live="polite">${sel}</aside>
      </div>
    </div>`, 'book');
  }

  function viewBookConfirm() {
    const seat = draft.seatId && SEATS[draft.seatId];
    if (!seat || !draft.slot) return viewBookSeat();
    const start = slotStart(draft.date, draft.slot);
    const checkBy = new Date(start.getTime() + minutes(RULES.checkInMin));
    const cancelBy = new Date(start.getTime() - minutes(RULES.cancelBeforeMin));
    const warn = state.points >= RULES.maxPoints - 1;
    return shell(`<div class="page">
      <div class="page-head"><div><h1 class="page-title">確認預約</h1></div></div>
      ${stepper(2)}
      <div class="confirm-grid">
        <section class="sheet" aria-labelledby="sum-h">
          <h2 class="section-title" id="sum-h">預約內容</h2>
          <dl class="summary-list">
            <dt>日期</dt><dd class="num">${dateLabel(draft.date)}</dd>
            <dt>時段</dt><dd class="num">${slotLabel(draft.slot)}</dd>
            <dt>樓層</dt><dd>${seat.floor} ${floorById(seat.floor).name}</dd>
            <dt>座位</dt><dd class="num">${seat.code}</dd>
            <dt>座位特性</dt><dd>${[ZONE_NAME[seat.zone], seat.power ? '有插座' : '', seat.accessible ? '無障礙座位' : ''].filter(Boolean).join('・')}</dd>
          </dl>
          <figure class="mini-plan" style="margin:20px 0 0">${planSvg(seat.floor, { mode: 'mini', highlight: seat.id, label: `座位 ${seat.code} 在 ${seat.floor} 的位置` })}</figure>
        </section>
        <section class="sheet" aria-labelledby="rule-h">
          <h2 class="section-title" id="rule-h">預約前請確認</h2>
          <ul class="rules">
            <li>${icon('timer')}<div><strong class="num">${hm(start)}–${hm(checkBy)} 之間報到</strong><span class="muted small">逾時未報到，預約會自動取消並記 1 點。</span></div></li>
            <li>${icon('x')}<div><strong class="num">${hm(cancelBy)} 前可以取消</strong><span class="muted small">時段開始前 30 分鐘內無法取消。</span></div></li>
            <li>${icon('alert')}<div><strong>目前違規點數 <span class="num">${state.points} / ${RULES.maxPoints}</span></strong><span class="muted small">累計 3 點暫停預約 7 天。</span></div></li>
          </ul>
          ${warn ? `<div class="notice notice-danger" style="margin-top:16px">${icon('alert')}<div><strong>再 1 次未報到將暫停預約 7 天</strong><p>如果不確定能不能到，建議先不要預約。</p></div></div>` : ''}
          <div class="actions" style="margin-top:20px">
            <button class="btn btn-primary" data-action="confirm">${icon('check')}確認預約</button>
            <button class="btn btn-secondary" data-action="back-seat">${icon('back')}修改座位</button>
          </div>
        </section>
      </div>
    </div>`, 'book');
  }

  function viewBookDone() {
    const b = state.bookings.find(x => x.id === state.lastBooked);
    if (!b) return viewHome();
    const seat = SEATS[b.seatId];
    const start = slotStart(b.date, b.slot);
    const checkBy = new Date(start.getTime() + minutes(RULES.checkInMin));
    return shell(`<div class="page">
      <div class="done">
        <section>
          <div class="done-head"><span class="done-check"><svg class="icon" viewBox="0 0 24 24" aria-hidden="true">${ICONS.check}</svg></span><h1 class="page-title">預約完成</h1></div>
          <p class="booking-when" style="margin-top:12px"><span>${dateLabel(b.date)}</span><br><span class="num">${slotLabel(b.slot)}</span></p>
          <p class="booking-where"><span>${icon('layers', 'icon-sm')}${seat.floor} ${floorById(seat.floor).name}</span><span>${icon('pin', 'icon-sm')}座位 <strong class="num">${seat.code}</strong></span></p>
          <div class="notice notice-warn" style="margin-top:20px">${icon('timer')}<div><strong>請在 <span class="num">${hm(checkBy)}</span> 前到座位報到</strong><p>報到時間為 <span class="num">${hm(start)}–${hm(checkBy)}</span>。</p></div></div>
          <div class="actions"><a class="btn btn-primary" href="#/bookings">查看我的預約</a><a class="btn btn-secondary" href="#/home">回到總覽</a></div>
        </section>
        <figure class="mini-plan" style="margin:0">${planSvg(seat.floor, { mode: 'mini', highlight: seat.id, label: `座位 ${seat.code} 在 ${seat.floor} 的位置` })}<figcaption><span>${seat.floor} 平面圖・從入口進入後找綠色座位</span></figcaption></figure>
      </div>
    </div>`, 'book');
  }

  let bookingsTab = 'upcoming';
  let askCancel = null;
  function viewBookings() {
    const upcoming = state.bookings.filter(isUpcomingList).sort(sortByTime);
    const past = state.bookings.filter(b => !isUpcomingList(b)).sort((a, b) => sortByTime(b, a));
    const list = bookingsTab === 'upcoming' ? upcoming : past;
    const cards = list.map(b => {
      const seat = SEATS[b.seatId];
      const ph = bookingPhase(b);
      const meta = [];
      if (ph.key === 'early') meta.push(`<span class="muted num">可取消至 ${hm(new Date(ph.cancelDeadline))}</span>`);
      if (ph.key === 'soon') meta.push(`<span class="muted num">${hm(new Date(ph.start))} 開放報到，已超過取消期限</span>`);
      if (ph.canCheckIn) meta.push(`<span class="num" style="color:var(--warn);font-weight:600">剩 ${ph.left} 分鐘可報到（${hm(new Date(ph.checkDeadline))} 截止）</span>`);
      if (ph.key === 'checkedin') meta.push(`<span class="muted num">使用到 ${slotById(b.slot).end}</span>`);
      const confirm = askCancel === b.id ? `<div class="confirm-inline" role="alert"><p>確定取消 <span class="num">${dateLabel(b.date, false)} ${slotById(b.slot).name}・${seat.code}</span>？取消後座位會開放給其他人。</p><div class="card-actions"><button class="btn btn-secondary" data-action="keep">保留預約</button><button class="btn btn-danger-solid" data-action="cancel" data-id="${b.id}">確定取消</button></div></div>` : '';
      return `<article class="sheet booking-card" aria-label="${dateLabel(b.date, false)} ${slotLabel(b.slot)} ${seat.id}">
        <div>
          <p class="when num">${dateLabel(b.date)}・${slotLabel(b.slot)}</p>
          <p class="where">${seat.floor} ${floorById(seat.floor).name}・座位 <span class="num">${seat.code}</span>・${ZONE_NAME[seat.zone]}${seat.power ? '・有插座' : ''}</p>
          <div class="meta"><span class="badge ${ph.badge[0]}">${ph.badge[1]}</span>${meta.join('')}</div>
        </div>
        <div class="card-actions">${askCancel === b.id ? '' : bookingActions(b, ph, { compact: true })}</div>
        ${confirm}
      </article>`;
    }).join('');
    const empty = bookingsTab === 'upcoming'
      ? `<div class="sheet empty"><p class="section-title" style="margin:0">沒有即將到來的預約</p><p class="muted">預約後會出現在這裡，也可以在這裡報到或取消。</p>${isSuspended() ? '' : '<a class="btn btn-primary" href="#/book">預約座位</a>'}</div>`
      : `<div class="sheet empty"><p class="section-title" style="margin:0">還沒有過去的紀錄</p><p class="muted">完成、取消或未報到的預約會保留在這裡。</p></div>`;
    return shell(`<div class="page">
      <div class="page-head"><div><h1 class="page-title">我的預約</h1><p class="page-lede num">有效預約 ${activeBookings().length} / ${RULES.maxActive} 筆</p></div>${isSuspended() ? '' : `<a class="btn btn-primary" href="#/book">${icon('calendar')}新增預約</a>`}</div>
      <div class="tabs" role="tablist">
        <button role="tab" aria-selected="${bookingsTab === 'upcoming'}" data-action="tab" data-tab="upcoming">即將到來 <span class="num">(${upcoming.length})</span></button>
        <button role="tab" aria-selected="${bookingsTab === 'past'}" data-action="tab" data-tab="past">過去紀錄 <span class="num">(${past.length})</span></button>
      </div>
      <div class="booking-list" role="tabpanel">${cards || empty}</div>
    </div>`, 'bookings');
  }

  function viewMe() {
    const nextB = state.bookings.filter(b => b.status === 'upcoming').sort(sortByTime)[0];
    return shell(`<div class="page">
      <div class="page-head"><div><h1 class="page-title">帳戶與規則</h1></div></div>
      <div class="me-grid">
        <div style="display:grid;gap:16px">
          <section class="sheet" aria-labelledby="acc-h">
            <h2 class="section-title" id="acc-h">${DEMO_USER.name}</h2>
            <dl class="summary-list"><dt>學號</dt><dd class="num">${DEMO_USER.id}</dd><dt>有效預約</dt><dd class="num">${activeBookings().length} / ${RULES.maxActive} 筆</dd><dt>違規點數</dt><dd><span class="num">${state.points} / ${RULES.maxPoints}</span> ${pips('light')}</dd>
            ${isSuspended() ? `<dt>停權至</dt><dd style="color:var(--danger)">${dateLabel(ymd(new Date(state.suspendedUntil)), false)}</dd>` : ''}</dl>
            <div class="actions"><button class="btn btn-secondary" data-action="logout">${icon('logout')}登出</button></div>
          </section>
          <section class="sheet" aria-labelledby="rules-h">
            <h2 class="section-title" id="rules-h">預約規則</h2>
            <ul class="rules">
              <li>${icon('calendar')}<div><strong>每天三個時段</strong><span class="muted small num">上午 08:00–12:00、下午 13:00–17:00、晚上 18:00–22:00，可預約未來 7 天。</span></div></li>
              <li>${icon('layers')}<div><strong>預約上限</strong><span class="muted small">每天最多 ${RULES.perDay} 個時段，同時最多持有 ${RULES.maxActive} 筆有效預約。</span></div></li>
              <li>${icon('timer')}<div><strong>15 分鐘內報到</strong><span class="muted small">時段開始後 15 分鐘內未報到，預約自動取消並記 1 點。</span></div></li>
              <li>${icon('x')}<div><strong>開始前 30 分鐘可取消</strong><span class="muted small">之後就無法取消，只能報到。</span></div></li>
              <li>${icon('alert')}<div><strong>3 點暫停預約 7 天</strong><span class="muted small">停權結束後點數歸零。</span></div></li>
              <li>${icon('access')}<div><strong>無障礙座位</strong><span class="muted small">保留給行動不便的同學，預約時需要確認。</span></div></li>
            </ul>
          </section>
        </div>
        <section class="sheet demo-tools" aria-labelledby="demo-h">
          <h2 class="section-title" id="demo-h" style="margin:0">示範工具</h2>
          <p class="muted small">Prototype 專用：調整「現在時間」來展示報到、逾時與停權等狀態。所有資料都是示範資料，存在這台瀏覽器中。</p>
          <p class="clock">${dateLabel(ymd(now()), false)} ${hm(now())}</p>
          ${nextB ? `<button class="btn btn-secondary" data-action="time-checkin">${icon('timer')}跳到下一筆預約的報到時間</button>
          <button class="btn btn-secondary" data-action="time-late">${icon('alert')}跳到報到截止後（模擬未報到）</button>` : '<p class="muted small">目前沒有待報到的預約。</p>'}
          <button class="btn btn-secondary" data-action="force-race" aria-pressed="${!!state.forceRace}">${icon('alert')}${state.forceRace ? '已設定：下一次確認會遇到座位被搶' : '模擬「座位剛被別人預約」'}</button>
          <button class="btn btn-secondary" data-action="time-reset" ${state.offset ? '' : 'disabled'}>${icon('clock')}回到現在時間</button>
          <button class="btn btn-danger" data-action="reset-all">${icon('rotate')}重設所有示範資料</button>
        </section>
      </div>
    </div>`, 'me');
  }

  // ---------------------------------------------------------------- Render / router
  const app = document.getElementById('app');
  let lastRoute = null;
  function render() {
    processTime();
    let r = route();
    if (!state.loggedIn && r !== 'login') { history.replaceState(null, '', '#/login'); r = 'login'; }
    if (state.loggedIn && r === 'login') { history.replaceState(null, '', '#/home'); r = 'home'; }
    const views = { login: viewLogin, home: viewHome, book: viewBookDate, 'book/seat': viewBookSeat, 'book/confirm': viewBookConfirm, 'book/done': viewBookDone, bookings: viewBookings, me: viewMe };
    const view = views[r] || viewHome;
    const active = document.activeElement;
    const keep = active && (active.dataset.action || active.dataset.seat) ? { action: active.dataset.action, seat: active.dataset.seat, key: active.dataset.date || active.dataset.slot || active.dataset.floor || active.dataset.zone || active.dataset.tab } : null;
    app.innerHTML = view();
    const titles = { login: '登入', home: '總覽', book: '預約座位', 'book/seat': '選擇座位', 'book/confirm': '確認預約', 'book/done': '預約完成', bookings: '我的預約', me: '帳戶與規則' };
    document.title = `${titles[r] || '總覽'}｜Carrel 座位預約`;
    if (r !== lastRoute) {
      window.scrollTo(0, 0);
      const h1 = app.querySelector('h1, .page-title');
      if (lastRoute !== null && h1) { h1.setAttribute('tabindex', '-1'); h1.focus({ preventScroll: true }); }
      lastRoute = r;
    } else if (keep) {
      const sel = keep.seat ? `[data-seat="${keep.seat}"]` : `[data-action="${keep.action}"]${keep.key ? `[data-date="${keep.key}"],[data-action="${keep.action}"][data-slot="${keep.key}"],[data-action="${keep.action}"][data-floor="${keep.key}"],[data-action="${keep.action}"][data-zone="${keep.key}"],[data-action="${keep.action}"][data-tab="${keep.key}"]` : ''}`;
      const el = app.querySelector(sel);
      if (el) el.focus({ preventScroll: true });
    }
  }

  // ---------------------------------------------------------------- Actions
  function selectSeat(id) {
    const s = SEATS[id];
    if (!s || seatStatus(s, draft.date, draft.slot) !== 'available') {
      if (s) toast(s.closed ? `${s.code} 暫停使用` : `${s.code} 已被預約，請選其他座位`);
      return;
    }
    draft.seatId = draft.seatId === id ? null : id;
    draft.ack = false;
    draft.error = null;
    render();
    const el = app.querySelector(`[data-seat="${id}"]`);
    if (el) el.focus({ preventScroll: true });
  }

  function handleAction(el) {
    const a = el.dataset.action;
    switch (a) {
      case 'fill-demo': {
        document.getElementById('sid').value = DEMO_USER.id;
        document.getElementById('pw').value = DEMO_USER.password;
        document.getElementById('pw').focus();
        break;
      }
      case 'dismiss': state.notices = state.notices.filter(n => n.id !== el.dataset.id); save(); render(); break;
      case 'quick': resetDraft(); draft.date = el.dataset.date; draft.slot = el.dataset.slot; draft.floor = bestFloor(); go('book/seat'); break;
      case 'pick-date': draft.date = el.dataset.date; if (draft.slot && !slotAvailability(draft.date, draft.slot).ok) draft.slot = null; render(); break;
      case 'pick-slot': draft.slot = el.dataset.slot; render(); break;
      case 'to-seat': draft.seatId = null; draft.error = null; draft.floor = bestFloor(); go('book/seat'); break;
      case 'back-date': go('book'); break;
      case 'pick-floor': draft.floor = el.dataset.floor; render(); break;
      case 'zone': draft.zone = el.dataset.zone; render(); break;
      case 'toggle-power': draft.power = !draft.power; render(); break;
      case 'toggle-access': draft.accessible = !draft.accessible; render(); break;
      case 'clear-filters': draft.zone = 'all'; draft.power = false; draft.accessible = false; render(); break;
      case 'clear-seat': draft.seatId = null; draft.ack = false; render(); break;
      case 'to-confirm': draft.error = null; go('book/confirm'); break;
      case 'back-seat': go('book/seat'); break;
      case 'confirm': confirmBooking(); break;
      case 'checkin': {
        const b = state.bookings.find(x => x.id === el.dataset.id);
        if (b && bookingPhase(b).canCheckIn) { b.status = 'checkedin'; b.checkedInAt = now().toISOString(); save(); toast(`已報到：${b.seatId}，祝讀書順利`, 'ok'); }
        render(); break;
      }
      case 'ask-cancel': askCancel = el.dataset.id; if (route() !== 'bookings') { bookingsTab = 'upcoming'; go('bookings'); } else render(); break;
      case 'keep': askCancel = null; render(); break;
      case 'cancel': {
        const b = state.bookings.find(x => x.id === el.dataset.id);
        if (b && bookingPhase(b).canCancel) { b.status = 'cancelled'; save(); toast('已取消預約，座位已開放給其他人', 'ok'); }
        else toast('已超過取消期限，無法取消');
        askCancel = null; render(); break;
      }
      case 'tab': bookingsTab = el.dataset.tab; askCancel = null; render(); break;
      case 'logout': state.loggedIn = false; save(); go('login'); break;
      case 'time-checkin': case 'time-late': {
        const b = state.bookings.filter(x => x.status === 'upcoming').sort(sortByTime)[0];
        if (!b) break;
        const target = slotStart(b.date, b.slot).getTime() + (a === 'time-checkin' ? minutes(2) : minutes(RULES.checkInMin + 1));
        state.offset = target - Date.now(); save();
        toast(a === 'time-checkin' ? '已跳到報到時間' : '已跳到報到截止後');
        go(a === 'time-checkin' ? 'home' : 'home');
        break;
      }
      case 'force-race': state.forceRace = !state.forceRace; save(); render(); break;
      case 'time-reset': state.offset = 0; save(); toast('已回到現在時間'); render(); break;
      case 'reset-all': state = { ...seedState(), loggedIn: true }; save(); resetDraft(); toast('示範資料已重設'); go('home'); break;
      default: break;
    }
  }

  function bestFloor() {
    if (draft.date && draft.slot) {
      const ranked = FLOORS.map(f => ({ id: f.id, free: freeCount(draft.date, draft.slot, f.id) })).sort((a, b) => b.free - a.free);
      if (ranked[0].free) return ranked[0].id;
    }
    return '3F';
  }

  function confirmBooking() {
    const seat = SEATS[draft.seatId];
    const avail = slotAvailability(draft.date, draft.slot);
    if (!avail.ok) { toast(avail.reason); go('book'); return; }
    if (seatStatus(seat, draft.date, draft.slot) !== 'available' || isContested(seat, draft.date, draft.slot) || state.forceRace) {
      state.forceRace = false;
      state.taken = [...(state.taken || []), `${draft.date}|${draft.slot}|${seat.id}`];
      save();
      draft.error = { title: `${seat.code} 剛剛被其他同學預約了`, text: '日期、時段和篩選條件都保留著，請在平面圖上選另一個座位。' };
      draft.seatId = null;
      go('book/seat');
      return;
    }
    const b = { id: 'b' + Date.now(), date: draft.date, slot: draft.slot, seatId: seat.id, status: 'upcoming', created: Date.now() };
    state.bookings.push(b);
    state.lastBooked = b.id;
    save();
    resetDraft();
    go('book/done');
  }

  // Click delegation
  app.addEventListener('click', e => {
    const seatEl = e.target.closest('[data-seat]');
    if (seatEl) { selectSeat(seatEl.dataset.seat); return; }
    const el = e.target.closest('[data-action]');
    if (el && !el.disabled && el.type !== 'checkbox') handleAction(el);
  });
  app.addEventListener('change', e => {
    if (e.target.dataset.action === 'ack') { draft.ack = e.target.checked; render(); app.querySelector('[data-action="ack"]')?.focus(); }
  });
  app.addEventListener('submit', e => {
    if (e.target.dataset.form !== 'login') return;
    e.preventDefault();
    const sid = e.target.sid.value.trim(), pw = e.target.pw.value;
    const err = {};
    if (!sid) err.sid = '請輸入學號';
    if (!pw) err.pw = '請輸入密碼';
    if (!err.sid && !err.pw && (sid.toLowerCase() !== DEMO_USER.id || pw !== DEMO_USER.password)) err.pw = '學號或密碼不正確，請再試一次';
    if (err.sid || err.pw) {
      app.innerHTML = viewLogin(err, { sid });
      app.querySelector('[aria-invalid="true"]')?.focus();
      return;
    }
    state.loggedIn = true; save(); go('home');
  });

  // Keyboard: arrow keys move between seats on the plan; Enter/Space selects
  app.addEventListener('keydown', e => {
    const seatEl = e.target.closest && e.target.closest('[data-seat]');
    if (!seatEl) return;
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectSeat(seatEl.dataset.seat); return; }
    const dirs = { ArrowRight: [1, 0], ArrowLeft: [-1, 0], ArrowDown: [0, 1], ArrowUp: [0, -1] };
    const d = dirs[e.key];
    if (!d) return;
    e.preventDefault();
    const cur = SEATS[seatEl.dataset.seat];
    const c = s => [s.x + s.w / 2, s.y + s.h / 2];
    const [x0, y0] = c(cur);
    let best = null, bestScore = Infinity;
    floorById(cur.floor).seats.forEach(s => {
      if (s.id === cur.id) return;
      const [x, y] = c(s);
      const dx = x - x0, dy = y - y0;
      const along = dx * d[0] + dy * d[1];
      if (along <= 4) return;
      const across = Math.abs(dx * d[1]) + Math.abs(dy * d[0]);
      const score = along + across * 2.5;
      if (score < bestScore) { bestScore = score; best = s; }
    });
    if (best) {
      const next = app.querySelector(`[data-seat="${best.id}"]`);
      seatEl.setAttribute('tabindex', '-1');
      next.setAttribute('tabindex', '0');
      next.focus();
      next.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    }
  });

  window.addEventListener('hashchange', render);
  setInterval(() => {
    const r = route();
    const changed = processTime();
    if (changed || r === 'home' || r === 'bookings') {
      if (!app.contains(document.activeElement) || document.activeElement === document.body || changed) render();
    }
  }, 30000);
  render();
})();
