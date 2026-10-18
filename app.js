/* ============================================================
   星梦课程表 · 核心逻辑（原生 JavaScript，零依赖）
   - 周次 / 节次 / 单双周 / 午休晚休推导
   - 课表渲染 + 增删改查 + 冲突检测
   - 行业标准导入导出：iCalendar(.ics, RFC 5545) / CSV / JSON
   ============================================================ */
(function () {
  'use strict';

  /* ============ 常量 ============ */
  var STORE_KEY = 'sakura-timetable-v1';
  var DAY_NAMES = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
  var DAY_CODES = ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'];
  var TZ_ID = 'Asia/Shanghai';
  var MS_DAY = 86400000;
  var WEEK_MIN = 1;      // 学期最少周数
  var WEEK_MAX = 60;     // 学期最多周数（默认 18，可在周次弹层或设置里随时自定义）

  var PALETTE = {
    sakura: { name: '樱花粉', a: '#ffe1ee', b: '#ffa3cd', t: '#7b2b52' },
    lilac:  { name: '薰衣草', a: '#e6ddff', b: '#b79cff', t: '#3d2a78' },
    sky:    { name: '晴空蓝', a: '#d8ecff', b: '#8fc7ff', t: '#1d4d7a' },
    mint:   { name: '薄荷绿', a: '#d5f8ed', b: '#8ee4cd', t: '#1c5f52' },
    lemon:  { name: '柠檬黄', a: '#fff4cf', b: '#ffd875', t: '#775015' },
    peach:  { name: '蜜桃橙', a: '#ffe6d6', b: '#ffb185', t: '#7c3a16' },
    star:   { name: '星空紫', a: '#dfe2ff', b: '#9aa6ff', t: '#2b2f7a' },
    grape:  { name: '葡萄紫', a: '#f0d9ff', b: '#c98bff', t: '#5a2378' }
  };
  var PALETTE_KEYS = Object.keys(PALETTE);

  var THEMES = {
    sakura:   { name: '樱花祭', dots: ['#ff7fb3', '#b58bff', '#7ec8ff'] },
    night:    { name: '星夜祭', dots: ['#241c3d', '#9bb6ff', '#c9a8ff'] },
    mint:     { name: '薄荷糖', dots: ['#40c8b8', '#7ec8ff', '#ffb3d9'] },
    ocean:    { name: '深海',   dots: ['#3aa7e8', '#6f8cff', '#6fe0d8'] },
    lavender: { name: '梦紫',   dots: ['#a97bff', '#ff8fd4', '#8fb8ff'] },
    sunset:   { name: '黄昏',   dots: ['#ff8f5e', '#ff6f91', '#ffc46b'] },
    forest:   { name: '森野',   dots: ['#4fb47a', '#8dd05f', '#5fc7c0'] }
  };

  var DEFAULT_SETTINGS = {
    semesterName: '2026 秋季学期',
    semesterStart: '2026-09-07',   // 第 1 周周一
    totalWeeks: 18,
    firstStart: '08:30',
    duration: 45,
    breakMin: 5,
    periodCount: 11,
    noonAfter: 4, noonMin: 135,    // 第 4 节后午休
    eveningAfter: 8, eveningMin: 15, // 第 8 节后晚休
    theme: 'sakura',
    lastLight: 'sakura',           // 退出深色模式时恢复的浅色主题
    dayOverrides: {},              // { [1..7]: { firstStart, duration, breakMin } }
    remindOn: true,                // 上课闹铃提醒
    remindLead: 10,                // 提前多少分钟提醒
    view: 'auto'
  };

  function cloneSettings(base) {
    var s = Object.assign({}, base || DEFAULT_SETTINGS);
    s.dayOverrides = Object.assign({}, (base && base.dayOverrides) || {});
    return s;
  }

  /* ============ 工具函数 ============ */
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function uid() {
    return 'c' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }
  function pad2(n) { return n < 10 ? '0' + n : '' + n; }
  function clamp(n, min, max) { return Math.min(max, Math.max(min, n)); }
  function range(a, b) { var out = []; for (var i = a; i <= b; i++) out.push(i); return out; }
  function toMin(hhmm) {
    var p = String(hhmm || '00:00').split(':');
    return (parseInt(p[0], 10) || 0) * 60 + (parseInt(p[1], 10) || 0);
  }
  function fmtMin(m) {
    m = ((m % 1440) + 1440) % 1440;
    return pad2(Math.floor(m / 60)) + ':' + pad2(m % 60);
  }
  function parseDate(str) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(str || ''));
    if (m) return new Date(+m[1], +m[2] - 1, +m[3]);
    var d = new Date(str);
    return isNaN(d.getTime()) ? new Date() : new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }
  function fmtDate(d) { return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()); }
  function addDays(d, n) { return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n); }
  function mondayOf(d) { return addDays(d, -((d.getDay() + 6) % 7)); }
  function sameDay(a, b) {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  }
  function startOfDay(d) { return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }
  function nowMin() { var n = new Date(); return n.getHours() * 60 + n.getMinutes(); }
  function todayIndex() { return ((new Date().getDay() + 6) % 7) + 1; }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function svg(id, cls) {
    return '<svg class="icon ' + (cls || '') + '" aria-hidden="true"><use href="#' + id + '"/></svg>';
  }
  /* 「活动」条目在名称后追加一枚小标记 */
  function kindTag(c) {
    return c && c.kind === 'activity' ? '<i class="kind-tag">活动</i>' : '';
  }

  /* 彩蛋：连点 3 次 Logo 时的庆祝动画 */
  var eggT1 = 0, eggT2 = 0;
  function playEgg() {
    var egg = $('#egg');
    if (!egg) return;
    clearTimeout(eggT1); clearTimeout(eggT2);
    egg.classList.remove('is-out');
    egg.hidden = false;
    eggT1 = setTimeout(function () {
      egg.classList.add('is-out');
      eggT2 = setTimeout(function () {
        egg.hidden = true;
        egg.classList.remove('is-out');
      }, 340);
    }, 3000);
  }

  /* 数字变化时弹跳一下（值没变就不抖） */
  function setStat(sel, value) {
    var node = $(sel);
    if (!node) return;
    var txt = String(value);
    if (node.textContent === txt) return;
    node.textContent = txt;
    node.classList.remove('is-bump');
    void node.offsetWidth;
    node.classList.add('is-bump');
  }

  /* 视图切换的滑动指示块：位置与宽度交给 CSS 变量 */
  function syncSegPill() {
    var seg = document.querySelector('.seg');
    var act = document.querySelector('.seg [data-view].active');
    if (!seg || !act || !act.offsetWidth) return;
    seg.style.setProperty('--pill-x', act.offsetLeft + 'px');
    seg.style.setProperty('--pill-w', act.offsetWidth + 'px');
    seg.classList.add('has-pill');
  }

  /* 切换主题时的一次光晕 */
  var flashTimer = 0;
  function flashTheme() {
    var b = document.body;
    if (!b) return;
    clearTimeout(flashTimer);
    b.classList.remove('is-flash');
    void b.offsetWidth;
    b.classList.add('is-flash');
    flashTimer = setTimeout(function () { b.classList.remove('is-flash'); }, 620);
  }

  /* 颜色：支持主题色 key 或 #hex */
  function hex2rgb(h) {
    h = String(h).replace('#', '');
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
  }
  function rgb2hex(r) {
    return '#' + r.map(function (v) { return pad2(clamp(Math.round(v), 0, 255).toString(16)); }).join('');
  }
  function mixColor(c1, c2, ratio) {
    var a = hex2rgb(c1), b = hex2rgb(c2);
    return rgb2hex(a.map(function (v, i) { return v * (1 - ratio) + b[i] * ratio; }));
  }
  function resolveColor(c) {
    if (PALETTE[c]) return PALETTE[c];
    if (/^#[0-9a-f]{3,6}$/i.test(String(c || ''))) {
      return { name: '自定义', a: mixColor(c, '#ffffff', 0.62), b: c, t: mixColor(c, '#000000', 0.58) };
    }
    return PALETTE.sakura;
    }

  /* ============ 数据层 ============ */
  var state = {
    settings: Object.assign({}, DEFAULT_SETTINGS),
    courses: [],
    week: 1,
    activeDay: 1,
    monthCursor: 0,   // 月视图锚点（时间戳，0 = 当前月）
    view: 'week',
    query: '',
    importMode: 'append',
    dupMode: 'skip'
  };

  function storageOK() {
    try { localStorage.setItem('__t', '1'); localStorage.removeItem('__t'); return true; }
    catch (e) { return false; }
  }
  var HAS_STORE = storageOK();

  function save() {
    if (!HAS_STORE) return;
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify({
        version: 1, settings: state.settings, courses: state.courses
      }));
    } catch (e) { /* 忽略写入异常 */ }
  }
  /* 早期版本内置的示例课表；若本地存的就是这一套，则视为「还没用自己的数据」，
     直接换成新版默认课表，避免老示例一直留着 */
  var LEGACY_DEMO_NAMES = [
    '高等数学A', '大学英语(三)', '概率论与数理统计', '数据结构', '体育(篮球)',
    '线性代数', '数据结构实验', '中国近现代史纲要', '操作系统', '大学物理',
    '英语角讨论', '编程实践(选修)', '社团例会', '自习'
  ];
  function isLegacyDemo(courses) {
    if (!courses || courses.length !== LEGACY_DEMO_NAMES.length) return false;
    var names = courses.map(function (c) { return c.name; }).sort();
    var want = LEGACY_DEMO_NAMES.slice().sort();
    for (var i = 0; i < names.length; i++) { if (names[i] !== want[i]) return false; }
    return true;
  }

  function load() {
    if (!HAS_STORE) return false;
    try {
      var raw = localStorage.getItem(STORE_KEY);
      if (!raw) return false;
      var data = JSON.parse(raw);
      if (!data || !Array.isArray(data.courses)) return false;
      if (isLegacyDemo(data.courses)) return false;
      state.settings = cloneSettings(Object.assign({}, DEFAULT_SETTINGS, data.settings || {}));
      state.courses = data.courses.map(normalizeCourse).filter(Boolean);
      return true;
    } catch (e) { return false; }
  }

  function normalizeCourse(c) {
    if (!c || !c.name) return null;
    var weeks = Array.isArray(c.weeks) ? c.weeks.map(Number).filter(function (w) { return w >= 1 && w <= 60; }) : [];
    weeks = weeks.filter(function (w, i, arr) { return arr.indexOf(w) === i; }).sort(function (a, b) { return a - b; });
    return {
      id: c.id || uid(),
      kind: c.kind === 'activity' ? 'activity' : 'course',
      name: String(c.name).slice(0, 40),
      teacher: String(c.teacher || '').slice(0, 30),
      room: String(c.room || '').slice(0, 40),
      day: clamp(parseInt(c.day, 10) || 1, 1, 7),
      startPeriod: clamp(parseInt(c.startPeriod, 10) || 1, 1, 60),
      endPeriod: clamp(parseInt(c.endPeriod, 10) || parseInt(c.startPeriod, 10) || 1, 1, 60),
      weeks: weeks.length ? weeks : range(1, 18),
      color: c.color || PALETTE_KEYS[Math.floor(Math.random() * PALETTE_KEYS.length)],
      note: String(c.note || '').slice(0, 200),
      createdAt: c.createdAt || Date.now()
    };
  }

  /* 示例数据：由「学生课表.ics」转换而来，作为首次打开时的默认课表 */
  function demoCourses() {
    var raw = [
      { name: "大学生心理健康教育（1）", teacher: "杨凯烽", room: "日新楼南606", day: 1, startPeriod: 1, endPeriod: 2, weeks: [].concat(range(6, 8)), color: 'sakura' },
      { name: "人工智能引论", teacher: "张立", room: "日新楼北604", day: 1, startPeriod: 1, endPeriod: 2, weeks: [].concat(range(13, 18)), color: 'lilac' },
      { name: "Web前端编程技术", teacher: "陈健", room: "信息楼105（云计算技术）", day: 1, startPeriod: 3, endPeriod: 4, weeks: [].concat(range(3, 4), range(6, 18)), color: 'sky' },
      { name: "军事理论", teacher: "薛领", room: "日新楼阶102", day: 1, startPeriod: 5, endPeriod: 6, weeks: [].concat(range(1, 2)), color: 'mint' },
      { name: "公共外语I（英语综合）", teacher: "代天善", room: "日新楼北601", day: 1, startPeriod: 5, endPeriod: 6, weeks: [].concat(range(3, 4), range(6, 18)), color: 'lemon' },
      { name: "公共外语I（英语听说）", teacher: "OXLEY MARK ANDREW", room: "日新楼北603", day: 1, startPeriod: 7, endPeriod: 8, weeks: [].concat(3, 7, 9, 11, 13, 15, 17), color: 'peach' },
      { name: "大学生安全教育与应急处理训练", teacher: "赵方诗怡", room: "", day: 1, startPeriod: 11, endPeriod: 11, weeks: [].concat(3, 16), color: 'star' },
      { name: "思想道德与法治", teacher: "穆燕", room: "日新楼北602", day: 2, startPeriod: 1, endPeriod: 2, weeks: [].concat(range(3, 4), range(6, 12)), color: 'grape' },
      { name: "走在前列的广东实践", teacher: "穆燕", room: "日新楼北602", day: 2, startPeriod: 1, endPeriod: 2, weeks: [].concat(range(13, 14)), color: 'sakura' },
      { name: "形势与政策1", teacher: "江梓豪", room: "日新楼阶202", day: 2, startPeriod: 1, endPeriod: 2, weeks: [].concat(range(15, 18)), color: 'lilac' },
      { name: "程序设计基础", teacher: "薛海燕", room: "信息楼102（大数据技术实训室）", day: 2, startPeriod: 3, endPeriod: 4, weeks: [].concat(range(3, 4), range(6, 16)), color: 'sky' },
      { name: "走在前列的广东实践", teacher: "穆燕", room: "校外实训基地", day: 2, startPeriod: 5, endPeriod: 10, weeks: [13], color: 'mint' },
      { name: "军事理论", teacher: "薛领", room: "日新楼阶202", day: 3, startPeriod: 1, endPeriod: 2, weeks: [].concat(range(6, 10)), color: 'lemon' },
      { name: "大学生职业规划与就业指导（1）", teacher: "周婷", room: "日新楼阶202", day: 3, startPeriod: 1, endPeriod: 2, weeks: [].concat(range(11, 13)), color: 'peach' },
      { name: "Web前端编程技术", teacher: "陈健", room: "信息楼105（云计算技术）", day: 3, startPeriod: 5, endPeriod: 6, weeks: [17], color: 'star' },
      { name: "程序设计基础", teacher: "薛海燕", room: "信息楼102（大数据技术实训室）", day: 4, startPeriod: 1, endPeriod: 2, weeks: [].concat(3, range(5, 16)), color: 'grape' },
      { name: "Web前端编程技术", teacher: "陈健", room: "信息楼105（云计算技术）", day: 4, startPeriod: 3, endPeriod: 4, weeks: [].concat(3, range(5, 18)), color: 'sakura' },
      { name: "军事理论", teacher: "薛领", room: "日新楼阶102", day: 4, startPeriod: 5, endPeriod: 6, weeks: [].concat(range(1, 2)), color: 'lilac' },
      { name: "人工智能引论", teacher: "张立", room: "日新楼北604", day: 4, startPeriod: 5, endPeriod: 6, weeks: [].concat(range(6, 7), 9, range(13, 18)), color: 'sky' },
      { name: "程序设计基础", teacher: "薛海燕", room: "信息楼102（大数据技术实训室）", day: 4, startPeriod: 7, endPeriod: 8, weeks: [].concat(3, range(6, 7), range(9, 10)), color: 'mint' },
      { name: "思想道德与法治", teacher: "穆燕", room: "日新楼北602", day: 5, startPeriod: 3, endPeriod: 4, weeks: [].concat(range(5, 11)), color: 'lemon' },
      { name: "走在前列的广东实践", teacher: "穆燕", room: "日新楼北602", day: 5, startPeriod: 3, endPeriod: 4, weeks: [].concat(range(12, 14)), color: 'peach' },
      { name: "体育与健康1（足球）", teacher: "肖国锋", room: "D17足球场2", day: 5, startPeriod: 5, endPeriod: 6, weeks: [].concat(range(5, 16), 18), color: 'star' },
      { name: "体测（1）（体质测试（课表时间不上课））", teacher: "王浩峰", room: "D15田径场", day: 6, startPeriod: 9, endPeriod: 10, weeks: [].concat(range(11, 12)), color: 'grape' }
    ];
    return raw.map(normalizeCourse);
  }

  /* ============ 时间与节次推导 ============ */
  /* day 为周几（1-7）。若该天存在 dayOverrides，则仅覆盖首节时间 / 每节时长 / 课间休息 */
  function computeLayout(s, day) {
    var ov = (s.dayOverrides && day && s.dayOverrides[day]) || null;
    var periods = [], layout = [], t = toMin((ov && ov.firstStart) || s.firstStart);
    var n = clamp(parseInt(s.periodCount, 10) || 10, 1, 16);
    var dur = clamp(parseInt(ov ? ov.duration : s.duration, 10) || 45, 5, 300);
    var brk = clamp(parseInt(ov ? ov.breakMin : s.breakMin, 10) || 0, 0, 120);
    for (var i = 1; i <= n; i++) {
      var st = t, en = st + dur;
      periods.push({ index: i, label: '第' + i + '节', start: fmtMin(st), end: fmtMin(en), startMin: st, endMin: en });
      layout.push({ type: 'period', index: i });
      t = en;
      if (i === n) continue;
      if (parseInt(s.noonAfter, 10) === i && parseInt(s.noonMin, 10) > 0) {
        t += parseInt(s.noonMin, 10);
        layout.push({ type: 'break', label: '午休', minutes: parseInt(s.noonMin, 10) });
      } else if (parseInt(s.eveningAfter, 10) === i && parseInt(s.eveningMin, 10) > 0) {
        t += parseInt(s.eveningMin, 10);
        layout.push({ type: 'break', label: '晚休', minutes: parseInt(s.eveningMin, 10) });
      } else {
        t += brk;
      }
    }
    var rowOf = {};
    layout.forEach(function (slot, i) { if (slot.type === 'period') rowOf[slot.index] = i + 2; });
    return { periods: periods, layout: layout, rowOf: rowOf };
  }

  function week1Monday() { return mondayOf(parseDate(state.settings.semesterStart)); }
  function dateOf(week, dayIdx) { return addDays(week1Monday(), (week - 1) * 7 + (dayIdx - 1)); }
  function weekNoOf(date) { return Math.round((mondayOf(date) - week1Monday()) / MS_DAY / 7) + 1; }
  function currentWeek() { return clamp(weekNoOf(new Date()), 1, state.settings.totalWeeks); }
  function dateLabel(d) { return pad2(d.getMonth() + 1) + '/' + pad2(d.getDate()); }

  /* ============ 周次展示 ============ */
  function compressWeeks(list) {
    var weeks = list.slice().sort(function (a, b) { return a - b; });
    if (!weeks.length) return '—';
    if (weeks.length === state.settings.totalWeeks && weeks[0] === 1) return '全周';
    var odd = weeks.every(function (w) { return w % 2 === 1; });
    var even = weeks.every(function (w) { return w % 2 === 0; });
    if (weeks.length >= 2 && (odd || even)) {
      var step2 = true;
      for (var s = 1; s < weeks.length; s++) if (weeks[s] !== weeks[s - 1] + 2) step2 = false;
      if (step2) return weeks[0] + '-' + weeks[weeks.length - 1] + (odd ? ' 单周' : ' 双周');
    }
    var parts = [], i = 0;
    while (i < weeks.length) {
      var j = i;
      while (j + 1 < weeks.length && weeks[j + 1] === weeks[j] + 1) j++;
      if (j - i >= 2) parts.push(weeks[i] + '-' + weeks[j]);
      else for (var k = i; k <= j; k++) parts.push(String(weeks[k]));
      i = j + 1;
    }
    return parts.join(',') + ' 周';
  }
  function parseWeeks(str) {
    var s = String(str || '').trim();
    if (!s) return [];
    if (/全部|全周|每周|all/i.test(s)) return range(1, state.settings.totalWeeks);
    var odd = /单周|odd/i.test(s), even = /双周|even/i.test(s);
    var out = [];
    s.replace(/第|周/g, '').replace(/[，、;]/g, ',').split(',').forEach(function (seg) {
      seg = seg.replace(/[^0-9\-,~～]/g, '');
      if (!seg) return;
      var mm = /^(\d+)\s*[-~～至]\s*(\d+)$/.exec(seg);
      if (mm) out = out.concat(range(parseInt(mm[1], 10), parseInt(mm[2], 10)));
      else {
        var v = parseInt(seg, 10);
        if (!isNaN(v)) out.push(v);
      }
    });
    out = out.filter(function (w) { return w >= 1; });
    if (odd) out = out.filter(function (w) { return w % 2 === 1; });
    if (even) out = out.filter(function (w) { return w % 2 === 0; });
    return out.filter(function (w, i, a) { return a.indexOf(w) === i; }).sort(function (a, b) { return a - b; });
  }

  /* ============ Toast ============ */
  function toast(msg, type) {
    var root = $('#toastRoot');
    var t = el('div', 'toast' + (type === 'error' ? ' is-error' : ''));
    t.innerHTML = svg(type === 'error' ? 'i-warning' : 'i-check') + '<span>' + esc(msg) + '</span>';
    root.appendChild(t);
    setTimeout(function () {
      t.classList.add('is-out');
      setTimeout(function () { t.remove(); }, 260);
    }, 2600);
  }

  /* ============ 弹层控制 ============ */
  var openStack = [];
  function openModal(id) {
    var m = typeof id === 'string' ? $(id) : id;
    if (!m || !m.hidden) return;
    m.hidden = false;
    m.__openedAt = Date.now();
    openStack.push(m);
    document.body.style.overflow = 'hidden';
    var focusable = m.querySelector('input:not([type=hidden]), select, textarea, button.primary-btn');
    if (focusable) setTimeout(function () { focusable.focus(); }, 30);
  }
  function closeModal(m) {
    if (!m) m = openStack[openStack.length - 1];
    if (!m) return;
    m.hidden = true;
    openStack = openStack.filter(function (x) { return x !== m; });
    if (!openStack.length) document.body.style.overflow = '';
  }

  var confirmHandler = null;
  function askConfirm(text, onOk) {
    $('#confirmText').textContent = text;
    confirmHandler = onOk;
    openModal('#confirmModal');
  }

  /* 首次打开时的导入 / 导出引导：只在没有任何本地数据时出现一次 */
  function showIntro() {
    openModal('#introModal');
  }

  /* ============ 上课闹铃 ============ */
  /* 铃音用 Web Audio 现场合成，不依赖任何音频文件，离线也能响 */
  var audioCtx = null, alarmTimer = 0, alarmRound = 0, alarmCourseId = null, lastFireKey = '';
  var ALARM_GROUPS = 3;      // 一轮响铃重复几组三音
  var ALARM_EVERY = 9000;    // 一轮结束后等待多久再响
  var ALARM_ROUNDS = 4;      // 未手动停止时最多重复几轮

  function ensureAudio() {
    if (audioCtx) return audioCtx;
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    try { audioCtx = new AC(); } catch (e) { audioCtx = null; }
    return audioCtx;
  }
  /* 浏览器要求先有用户交互才允许发声：在首次交互时静默解锁 */
  function unlockAudio() {
    var ac = ensureAudio();
    if (ac && ac.state === 'suspended') { try { ac.resume(); } catch (e) { /* 忽略 */ } }
  }
  /* 合成单声铃音：基频 + 两个泛音，指数衰减 */
  function chime(at, freq, vol) {
    var ac = audioCtx;
    if (!ac) return;
    [[freq, 1], [freq * 2.01, .3], [freq * 3.02, .12]].forEach(function (pair) {
      var osc = ac.createOscillator(), g = ac.createGain();
      osc.type = 'sine';
      osc.frequency.value = pair[0];
      g.gain.setValueAtTime(.0001, at);
      g.gain.linearRampToValueAtTime(.26 * vol * pair[1], at + .014);
      g.gain.exponentialRampToValueAtTime(.0001, at + 1.05);
      osc.connect(g);
      g.connect(ac.destination);
      osc.start(at);
      osc.stop(at + 1.1);
    });
  }
  /* 一段上课铃：三音上行，重复 groups 组 */
  function ringAlarm(groups) {
    var ac = ensureAudio();
    if (!ac) return false;
    if (ac.state === 'suspended') { try { ac.resume(); } catch (e) { /* 忽略 */ } }
    if (ac.state !== 'running') return false;   // 还没解锁，静默失败
    var t0 = ac.currentTime + .08;
    for (var g = 0; g < groups; g++) {
      var b = t0 + g * 1.45;
      chime(b, 784, 1);
      chime(b + .24, 1046.5, .92);
      chime(b + .48, 1318.5, .85);
    }
    return true;
  }
  function stopAlarm() {
    clearTimeout(alarmTimer);
    alarmTimer = 0;
    alarmRound = 0;
    var box = $('#alarm');
    if (box && !box.hidden) {
      box.classList.add('is-out');
      setTimeout(function () { box.hidden = true; box.classList.remove('is-out'); }, 260);
    }
  }
  function requestNotify() {
    if (!('Notification' in window)) return;
    if (Notification.permission === 'default') { try { Notification.requestPermission(); } catch (e) { /* 忽略 */ } }
  }
  function fireRemind(course, period, leftMin) {
    var box = $('#alarm');
    if (!box) return;
    alarmCourseId = course.id;
    $('#alarmName').textContent = course.name + (course.kind === 'activity' ? '（活动）' : '');
    $('#alarmMeta').textContent = period.start + ' 开始 · ' + (leftMin > 0 ? '还有 ' + leftMin + ' 分钟' : '马上开始') +
      ' · ' + (course.room || '未填写地点');
    box.hidden = false;
    box.classList.remove('is-out');
    /* 系统通知：仅在已授权时发送，失败不影响页面内提醒 */
    try {
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('上课提醒 · ' + course.name, {
          body: period.start + ' 开始' + (course.room ? ' · ' + course.room : '') +
            (leftMin > 0 ? '（还有 ' + leftMin + ' 分钟）' : ''),
          tag: 'sakura-remind-' + course.id
        });
      }
    } catch (e) { /* 忽略 */ }
    /* 响铃：一轮结束按间隔重复，最多 ALARM_ROUNDS 轮，除非手动停止 */
    alarmRound = 0;
    (function loop() {
      if (!alarmRound) {
        alarmRound++;
        if (!ringAlarm(ALARM_GROUPS)) {
          toast('浏览器暂不允许自动播放，请点一下页面后再试听铃声', 'error');
          return;   // 卡片仍在，可点「停止响铃」关闭
        }
      } else if (alarmRound >= ALARM_ROUNDS) {
        stopAlarm();
        return;
      } else {
        alarmRound++;
        ringAlarm(ALARM_GROUPS);
      }
      alarmTimer = setTimeout(loop, ALARM_EVERY);
    })();
  }
  /* 每 20 秒检查一次：是否有课即将开始 */
  function tickRemind() {
    if (!state.settings.remindOn) return;
    if (state.week !== currentWeek()) return;
    var periods = computeLayout(state.settings, todayIndex()).periods;
    var now = nowMin();
    var lead = clamp(parseInt(state.settings.remindLead, 10) || 10, 1, 60);
    var list = todayCourses();
    for (var i = 0; i < list.length; i++) {
      var c = list[i], p = periods[c.startPeriod - 1];
      if (!p) continue;
      var diff = p.startMin - now;
      if (diff >= 0 && diff <= lead && diff > lead - 3) {
        var key = c.id + '|' + new Date().toDateString() + '|' + p.startMin;
        if (key !== lastFireKey) {
          lastFireKey = key;
          fireRemind(c, p, diff);
        }
        return;
      }
    }
  }

  /* ============ 渲染：顶栏 ============ */
  function applyTheme() {
    var theme = state.settings.theme || 'sakura';
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme === 'night' ? 'dark' : 'light';
    var c = THEMES[theme] || THEMES.sakura;
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', c.dots[0]);
    var btn = $('#themeBtn');
    if (btn) {
      var night = theme === 'night';
      btn.setAttribute('aria-pressed', night ? 'true' : 'false');
      btn.title = night ? '切换到浅色模式' : '切换到深色模式';
      btn.innerHTML = '<svg class="icon" aria-hidden="true"><use href="#' + (night ? 'i-sun' : 'i-moon') + '"/></svg>';
    }
  }
  function resolveView() {
    var v = state.settings.view || 'auto';
    if (v === 'month') { state.view = 'month'; return; }
    if (v === 'auto') v = window.innerWidth <= 700 ? 'day' : 'week';
    state.view = v;
  }
  function applyView() {
    document.documentElement.dataset.view = state.view;
    $$('.seg [data-view]').forEach(function (b) { b.classList.toggle('active', b.dataset.view === state.view); });
    syncSegPill();
    var mp = $('#monthPanel');
    if (mp) mp.hidden = state.view !== 'month';
  }

  function renderTopbar() {
    var s = state.settings;
    $('#brandSub').textContent = s.semesterName + ' · 共 ' + s.totalWeeks + ' 周';
    var cw = currentWeek();
    var label = $('#weekPickerLabel');
    if (label) label.textContent = '第 ' + state.week + ' 周';
    /* 周次弹层里的「总周数」快捷设置（正在输入时不覆盖） */
    var tot = $('#weekPopTotal');
    if (tot && document.activeElement !== tot) tot.value = s.totalWeeks;
    var popRange = $('#weekPopRange');
    if (popRange) popRange.textContent = '共 ' + s.totalWeeks + ' 周';
    var grid = $('#weekPopGrid');
    if (grid) {
      if (grid.childElementCount !== s.totalWeeks) {
        grid.innerHTML = '';
        for (var i = 1; i <= s.totalWeeks; i++) {
          var b = el('button', 'week-btn', i);
          b.type = 'button';
          b.dataset.week = i;
          b.setAttribute('role', 'option');
          grid.appendChild(b);
        }
      }
      $$('.week-btn', grid).forEach(function (b) {
        var w = parseInt(b.dataset.week, 10);
        var cur = w === state.week;
        b.classList.toggle('active', cur);
        b.classList.toggle('is-cw', w === cw);
        b.setAttribute('aria-selected', cur ? 'true' : 'false');
        b.title = '第 ' + w + ' 周' + (w === cw ? '（本周）' : '');
      });
    }
    var mon = dateOf(state.week, 1), sun = dateOf(state.week, 7);
    var rangeText = dateLabel(mon) + ' - ' + dateLabel(sun) + (state.week === cw ? ' · 本周' : '');
    $('#weekRange').textContent = rangeText;
    var pr = $('#weekPopRange');
    if (pr) pr.textContent = rangeText;
  }

  /* ============ 渲染：今日概览 ============ */
  function todayCourses() {
    var d = todayIndex();
    return state.courses.filter(function (c) {
      return c.day === d && c.weeks.indexOf(currentWeek()) >= 0;
    }).sort(function (a, b) { return a.startPeriod - b.startPeriod; });
  }
  function nextClassInfo(periods) {
    if (state.week !== currentWeek()) return null;
    var now = nowMin(), d = todayIndex();
    var list = todayCourses();
    for (var i = 0; i < list.length; i++) {
      var p = periods[list[i].startPeriod - 1];
      if (p && p.startMin > now) return { course: list[i], period: p, inMin: p.startMin - now };
    }
    return null;
  }
  function renderTodayBar() {
    var d = todayIndex();
    var layout = computeLayout(state.settings, d);
    var periods = layout.periods;
    var title = $('#todayTitle');
    var date = new Date();
    title.textContent = '今天 · ' + DAY_NAMES[d - 1] + ' ' + dateLabel(date) +
      (state.week === currentWeek() ? '' : '（当前查看第 ' + state.week + ' 周，今日为第 ' + currentWeek() + ' 周）');

    var list = $('#todayList');
    list.innerHTML = '';
    var todays = todayCourses();
    var now = nowMin();
    if (!todays.length) {
      list.innerHTML = '<li class="today-empty">' +
        '<img class="today-chibi" src="empty-bear.jpg" alt="" aria-hidden="true">' +
        '<span>今天没有课程，' +
        (state.week === currentWeek() ? '好好休息一下吧' : '看看这周其他安排吧') + '。</span></li>';
    } else {
      todays.forEach(function (c) {
        var p1 = periods[c.startPeriod - 1], p2 = periods[c.endPeriod - 1];
        var past = p2 && p2.endMin < now;
        var pal = resolveColor(c.color);
        var li = el('li', 'today-chip' + (past ? ' is-past' : ''));
        li.innerHTML = '<span class="bar" style="background:' + pal.b + '"></span>' +
          '<span class="tc-text"><b>' + esc(c.name) + kindTag(c) + '</b><small>' +
          (p1 ? p1.start : '') + '-' + (p2 ? p2.end : '') + ' · ' +
          esc(c.room || '未填写地点') + '</small></span>';
        li.addEventListener('click', function () { showDetail(c.id); });
        list.appendChild(li);
      });
    }

    var weekCourses = coursesInWeek(state.week);
    var periodCount = weekCourses.reduce(function (n, c) { return n + (c.endPeriod - c.startPeriod + 1); }, 0);
    setStat('#statWeek', periodCount);
    setStat('#statToday', todays.length);

    var next = nextClassInfo(periods);
    if (next) {
      setStat('#statNext', next.period.start);
      $('#statNextLabel').textContent = (next.inMin <= 120 ? next.inMin + ' 分钟后 · ' : '') + next.course.name;
    } else {
      setStat('#statNext', '--');
      $('#statNextLabel').textContent = state.week === currentWeek() ? '下节课（今日已结束）' : '下节课';
    }
    var sn = $('#statNext');
    if (sn) sn.classList.toggle('is-soon', !!(next && next.inMin <= 15));

    var bubble = $('#mascotBubble');
    if (bubble) {
      var msg;
      if (!todays.length) msg = '今天没有安排，好好休息哦～';
      else if (next) msg = next.inMin <= 120
        ? '还有 ' + next.inMin + ' 分钟就要开始「' + next.course.name + '」啦'
        : '今天有 ' + todays.length + ' 项安排，一起加油吧～';
      else msg = '今天的 ' + todays.length + ' 项安排都完成啦，辛苦咯～';
      bubble.textContent = msg;
    }
  }

  /* ============ 渲染：课表网格 ============ */
  function coursesInWeek(week) {
    return state.courses.filter(function (c) {
      return c.weeks.indexOf(week) >= 0 && week >= 1 && week <= state.settings.totalWeeks;
    });
  }

  function assignLanes(list) {
    var sorted = list.slice().sort(function (a, b) {
      return (a.startPeriod - b.startPeriod) || (a.endPeriod - b.endPeriod);
    });
    var clusters = [], cur = [], curEnd = -1;
    sorted.forEach(function (c) {
      if (cur.length && c.startPeriod <= curEnd) {
        cur.push(c); curEnd = Math.max(curEnd, c.endPeriod);
      } else {
        if (cur.length) clusters.push(cur);
        cur = [c]; curEnd = c.endPeriod;
      }
    });
    if (cur.length) clusters.push(cur);
    clusters.forEach(function (cl) {
      var laneEnds = [];
      cl.forEach(function (c) {
        var placed = false;
        for (var i = 0; i < laneEnds.length; i++) {
          if (laneEnds[i] < c.startPeriod) { laneEnds[i] = c.endPeriod; c._lane = i; placed = true; break; }
        }
        if (!placed) { c._lane = laneEnds.length; laneEnds.push(c.endPeriod); }
      });
      cl.forEach(function (c) { c._lanes = Math.max(laneEnds.length, 1); });
    });
  }

  function renderDayTabs() {
    var tabs = $('#dayTabs');
    tabs.innerHTML = '';
    var today = todayIndex();
    for (var d = 1; d <= 7; d++) {
      var b = el('button', 'day-tab' + (d === state.activeDay ? ' active' : '') + (d === today && state.week === currentWeek() ? ' is-today' : ''));
      b.type = 'button';
      b.setAttribute('role', 'tab');
      b.innerHTML = '<b>' + DAY_NAMES[d - 1] + '</b><small>' + dateLabel(dateOf(state.week, d)) + '</small>';
      (function (day) {
        b.addEventListener('click', function () { state.activeDay = day; renderGrid(); });
      })(d);
      tabs.appendChild(b);
    }
  }

  function renderGrid() {
    var layout = computeLayout(state.settings);
    var periods = layout.periods, rowOf = layout.rowOf, slots = layout.layout;
    var grid = $('#ttGrid');
    var dayMode = state.view === 'day';
    var days = dayMode ? [state.activeDay] : [1, 2, 3, 4, 5, 6, 7];
    var today = todayIndex();

    grid.innerHTML = '';
    grid.style.gridTemplateRows = 'auto ' + slots.map(function (s) {
      return s.type === 'break' ? 'var(--break-h)' : 'var(--row-h)';
    }).join(' ');

    var cols = dayMode ? 3 : 8;
    var corner = el('div', 'tt-corner', dayMode ? DAY_NAMES[state.activeDay - 1] : '节次');
    corner.style.gridArea = '1 / 1 / 2 / 2';
    grid.appendChild(corner);

    days.forEach(function (d) {
      var col = dayMode ? 2 : d + 1;
      var ov = state.settings.dayOverrides && state.settings.dayOverrides[d];
      var h = el('div', 'tt-head' + (d === today && state.week === currentWeek() ? ' is-today' : '') +
        (d >= 6 ? ' is-weekend' : '') + (ov ? ' is-custom' : ''));
      h.style.gridArea = '1 / ' + col + ' / 2 / ' + (col + 1);
      h.innerHTML = '<div class="dh-day">' + DAY_NAMES[d - 1] + '</div><div class="dh-date">' +
        dateLabel(dateOf(state.week, d)) + (ov ? ' · ' + ((ov.firstStart) || state.settings.firstStart) + ' 起' : '') + '</div>';
      grid.appendChild(h);
    });

    slots.forEach(function (slot, i) {
      var row = i + 2;
      if (slot.type === 'break') {
        var band = el('div', 'break-band', slot.label + ' · ' + slot.minutes + ' 分钟');
        band.style.gridArea = row + ' / 1 / ' + (row + 1) + ' / ' + (cols + 1);
        grid.appendChild(band);
        return;
      }
      var p = periods[slot.index - 1];
      var tc = el('div', 'time-cell');
      tc.style.gridArea = row + ' / 1 / ' + (row + 1) + ' / 2';
      tc.innerHTML = '<span class="tc-index">' + slot.index + '</span><span class="tc-time">' + p.start + '<br>' + p.end + '</span>';
      grid.appendChild(tc);

      days.forEach(function (d) {
        var col = dayMode ? 2 : d + 1;
        var s = el('div', 'slot' + (d >= 6 ? ' col-weekend' : ''));
        s.style.gridArea = row + ' / ' + col + ' / ' + (row + 1) + ' / ' + (col + 1);
        s.dataset.day = d;
        s.dataset.period = slot.index;
        s.title = DAY_NAMES[d - 1] + ' 第 ' + slot.index + ' 节（点击添加课程）';
        grid.appendChild(s);
      });
    });

    /* 课程卡片 */
    var visible = coursesInWeek(state.week).filter(function (c) {
      return c.day >= 1 && c.day <= 7 && (!dayMode || c.day === state.activeDay);
    });
    var byDay = {};
    visible.forEach(function (c) { (byDay[c.day] = byDay[c.day] || []).push(c); });
    var lanesDone = [];
    Object.keys(byDay).forEach(function (d) {
      assignLanes(byDay[d]);
      lanesDone = lanesDone.concat(byDay[d]);
    });

    var enterI = 0;
    lanesDone.forEach(function (c) {
      var r1 = rowOf[c.startPeriod], r2 = rowOf[c.endPeriod];
      if (!r1) return;
      if (!r2 || r2 < r1) r2 = r1;
      var card = el('button', 'course');
      card.type = 'button';
      var pal = resolveColor(c.color);
      card.style.setProperty('--c-a', pal.a);
      card.style.setProperty('--c-b', pal.b);
      card.style.setProperty('--c-ink', pal.t);
      card.style.gridRow = r1 + ' / ' + (r2 + 1);
      card.style.gridColumn = dayMode ? '2' : String(c.day + 1);
      var lanes = c._lanes || 1, lane = c._lane || 0;
      if (lanes > 1) {
        card.style.justifySelf = 'start';
        card.style.width = 'calc(' + (100 / lanes).toFixed(3) + '% - 5px)';
        card.style.marginLeft = lane ? 'calc(' + (100 / lanes).toFixed(3) + '% )' : '0';
      }
      if (r2 === r1) card.classList.add('is-compact');
      if (c.kind === 'activity') card.classList.add('is-activity');
      card.dataset.day = c.day;
      card.dataset.end = c.endPeriod;
      card.dataset.id = c.id;
      /* 错落入场：延迟由 --i 决定 */
      card.classList.add('is-enter');
      card.style.setProperty('--i', Math.min(enterI++, 20));
      card.addEventListener('animationend', function () { card.classList.remove('is-enter'); }, { once: true });
      var meta = [];
      if (c.room) meta.push('<span class="c-meta">' + svg('i-pin') + esc(c.room) + '</span>');
      if (c.teacher) meta.push('<span class="c-meta">' + svg('i-user') + esc(c.teacher) + '</span>');
      card.innerHTML = '<span class="c-name">' + esc(c.name) + kindTag(c) + '</span>' + meta.join('') +
        '<span class="c-weeks">' + esc(compressWeeks(c.weeks)) + '</span>';
      card.addEventListener('click', function (e) {
        e.stopPropagation();
        card.classList.add('is-pop');
        card.addEventListener('animationend', function () { card.classList.remove('is-pop'); }, { once: true });
        setTimeout(function () { showDetail(c.id); }, 170);
      });
      grid.appendChild(card);
    });

    $('#ttWrap').classList.toggle('is-empty', visible.length === 0);
    if (!visible.length) {
      var hint = $('#emptyText');
      if (hint) {
        hint.innerHTML = svg('i-file') + (dayMode
          ? '本周' + DAY_NAMES[state.activeDay - 1] + '还没有课程，点击表格中的空格即可添加。'
          : '第 ' + state.week + ' 周还没有课程，点击任意空格或右上角「添加课程」开始安排吧。');
      }
    }
    applySearch();
    refreshPastStates();
    renderDayTabs();
  }

  function refreshPastStates() {
    var now = nowMin(), today = todayIndex(), cw = currentWeek();
    $$('#ttGrid .course').forEach(function (card) {
      var d = parseInt(card.dataset.day, 10);
      var ep = parseInt(card.dataset.end, 10);
      var p = computeLayout(state.settings, d).periods[ep - 1];
      var past = false;
      if (state.week < cw) past = true;
      else if (state.week === cw) {
        if (d < today) past = true;
        else if (d === today && p && p.endMin < now) past = true;
      }
      card.classList.toggle('is-past', past);
    });
  }

  function applySearch() {
    var q = state.query.trim().toLowerCase();
    $$('#ttGrid .course').forEach(function (card) {
      if (!q) { card.classList.remove('is-hit', 'is-dim'); return; }
      var hit = card.textContent.toLowerCase().indexOf(q) >= 0;
      card.classList.toggle('is-hit', hit);
      card.classList.toggle('is-dim', !hit);
    });
  }

  function renderAll() {
    applyTheme();
    applyView();
    renderTopbar();
    renderTodayBar();
    if (state.view === 'month') renderMonth(); else renderGrid();
  }

  /* ============ 渲染：月视图 ============ */
  function renderMonth() {
    var grid = $('#monthGrid');
    if (!grid) return;
    var anchor = state.monthCursor
      ? new Date(state.monthCursor)
      : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    if (!state.monthCursor) state.monthCursor = anchor.getTime();
    var y = anchor.getFullYear(), m = anchor.getMonth();
    $('#monthTitle').textContent = y + ' 年 ' + (m + 1) + ' 月';

    if (!$('#monthWeekdays').childElementCount) {
      $('#monthWeekdays').innerHTML = DAY_NAMES.map(function (n, i) {
        return '<span class="' + (i >= 5 ? 'wk-end' : '') + '">' + n + '</span>';
      }).join('');
    }
    $('#monthLegend').textContent = '点击日期可跳转到当天的日视图 · 每格最多显示 3 项安排';

    /* 课程索引：按实际日期归集本学期的所有上课日 */
    var map = {}, total = 0;
    state.courses.forEach(function (c) {
      c.weeks.forEach(function (w) {
        if (w < 1 || w > state.settings.totalWeeks) return;
        var key = fmtDate(dateOf(w, c.day));
        (map[key] = map[key] || []).push(c);
      });
    });

    var first = new Date(y, m, 1);
    var offset = (first.getDay() + 6) % 7;
    var daysInMonth = new Date(y, m + 1, 0).getDate();
    var cellCount = Math.ceil((offset + daysInMonth) / 7) * 7;
    var start = addDays(first, -offset);
    var today = new Date();

    grid.innerHTML = '';
    for (var i = 0; i < cellCount; i++) {
      (function (date) {
        var other = date.getMonth() !== m;
        var isToday = sameDay(date, today);
        var item = el('button', 'month-cell' + (other ? ' is-other' : '') + (isToday ? ' is-today' : ''));
        item.type = 'button';
        item.dataset.date = fmtDate(date);
        if (!other) total += (map[fmtDate(date)] || []).length;

        var list = (map[fmtDate(date)] || []).slice().sort(function (a, b) { return a.startPeriod - b.startPeriod; });
        var inner = '<span class="mc-day">' + date.getDate() + (isToday ? '<i class="mc-dot"></i>' : '') + '</span>';
        if (list.length) {
          inner += '<span class="mc-list">';
          list.slice(0, 3).forEach(function (c) {
            var pal = resolveColor(c.color);
            inner += '<span class="mc-course' + (c.kind === 'activity' ? ' is-activity' : '') +
              '" style="--c-a:' + pal.a + ';--c-b:' + pal.b + ';--c-ink:' + pal.t + '">' + esc(c.name) + '</span>';
          });
          if (list.length > 3) inner += '<span class="mc-more">+' + (list.length - 3) + ' 项</span>';
          inner += '</span>';
        }
        item.innerHTML = inner;
        /* 按行列做波浪入场 */
        item.classList.add('is-enter');
        item.style.setProperty('--i', Math.min(Math.floor(i / 7) + (i % 7), 12));
        item.title = fmtDate(date) + ' · ' + DAY_NAMES[(date.getDay() + 6) % 7] +
          (list.length ? '（' + list.length + ' 项安排）' : '（无安排，点击添加）');
        item.addEventListener('click', function () { jumpToDay(date); });
        grid.appendChild(item);
      })(addDays(start, i));
    }

    var w1 = weekNoOf(first), w2 = weekNoOf(new Date(y, m, daysInMonth));
    $('#monthSub').textContent = w1 >= 1 && w2 <= state.settings.totalWeeks
      ? '第 ' + w1 + ' - ' + w2 + ' 周 · 共 ' + total + ' 项'
      : '本学期外 · 共 ' + total + ' 项';
  }

  /* 点击月历格子 → 跳到该周的日视图 */
  function jumpToDay(date) {
    state.week = clamp(weekNoOf(date), 1, state.settings.totalWeeks);
    state.activeDay = ((date.getDay() + 6) % 7) + 1;
    state.settings.view = 'day';
    resolveView(); save(); renderAll();
  }

  /* ============ 课程详情 / 编辑 ============ */
  var formState = { kind: 'course', mode: 'range', parity: 'all', custom: [], color: 'sakura' };

  function showDetail(id) {
    var c = state.courses.find(function (x) { return x.id === id; });
    if (!c) return;
    var periods = computeLayout(state.settings, c.day).periods;
    var p1 = periods[c.startPeriod - 1], p2 = periods[c.endPeriod - 1];
    var pal = resolveColor(c.color);
    var body = $('#detailBody');
    $('#detailTitle').textContent = c.kind === 'activity' ? '活动详情' : '课程详情';
    body.innerHTML = '';
    var hero = el('div', 'detail-hero');
    hero.style.setProperty('--c-a', pal.a);
    hero.style.setProperty('--c-b', pal.b);
    hero.style.setProperty('--c-ink', pal.t);
    hero.innerHTML = '<h4>' + esc(c.name) + '</h4><small>' +
      DAY_NAMES[c.day - 1] + ' 第 ' + c.startPeriod + (c.endPeriod > c.startPeriod ? '-' + c.endPeriod : '') + ' 节 · ' + esc(compressWeeks(c.weeks)) + '</small>';
    body.appendChild(hero);

    var rows = el('div', 'detail-rows');
    function row(icon, label, value) {
      if (!value) return;
      var r = el('div', 'detail-row');
      r.innerHTML = svg(icon) + '<span class="label">' + label + '</span><span>' + esc(value) + '</span>';
      rows.appendChild(r);
    }
    if (c.kind === 'activity') row('i-sparkle', '类型', '活动（非课程安排）');
    row('i-clock', '时间', p1 ? p1.start + ' - ' + (p2 ? p2.end : p1.end) : '');
    row('i-calendar', '星期', DAY_NAMES[c.day - 1] + '（第 ' + c.startPeriod + (c.endPeriod > c.startPeriod ? '-' + c.endPeriod : '') + ' 节）');
    row('i-pin', '地点', c.room);
    row('i-user', '教师', c.teacher);
    body.appendChild(rows);

    var wk = el('div', 'detail-weeks');
    c.weeks.forEach(function (w) {
      var i = el('i', null, w);
      if (w === state.week) i.style.background = pal.b;
      wk.appendChild(i);
    });
    var wkWrap = el('div', 'field');
    wkWrap.appendChild(el('span', 'chip-label', '上课周次（共 ' + c.weeks.length + ' 周）'));
    wkWrap.appendChild(wk);
    body.appendChild(wkWrap);

    if (c.note) {
      var note = el('div', 'detail-note');
      note.innerHTML = '<strong>备注：</strong>' + esc(c.note).replace(/\n/g, '<br>');
      body.appendChild(note);
    }

    $('#detailDelete').onclick = function () {
      closeModal($('#detailModal'));
      askConfirm('确定要删除「' + c.name + '」吗？此操作不可撤销。', function () {
        state.courses = state.courses.filter(function (x) { return x.id !== c.id; });
        save(); renderAll();
        toast('已删除「' + c.name + '」');
      });
    };
    $('#detailEdit').onclick = function () {
      closeModal($('#detailModal'));
      openCourseForm(c);
    };
    openModal('#detailModal');
  }

  function buildSelects() {
    var daySel = $('#fDay');
    daySel.innerHTML = DAY_NAMES.map(function (n, i) {
      return '<option value="' + (i + 1) + '">' + n + '</option>';
    }).join('');
    ['#fStart', '#fEnd'].forEach(function (sel) {
      var node = $(sel);
      node.innerHTML = '';
      var n = state.settings.periodCount;
      for (var i = 1; i <= n; i++) {
        var o = document.createElement('option');
        o.value = i;
        o.textContent = '第 ' + i + ' 节';
        node.appendChild(o);
      }
    });
  }

  function buildWeekGrid() {
    var wrap = $('#weekGrid');
    wrap.innerHTML = '';
    var n = state.settings.totalWeeks;
    for (var i = 1; i <= n; i++) {
      var b = el('button', 'week-btn', i);
      b.type = 'button';
      b.dataset.week = i;
      b.classList.toggle('active', formState.custom.indexOf(i) >= 0);
      b.addEventListener('click', function () {
        var w = +this.dataset.week;
        var idx = formState.custom.indexOf(w);
        if (idx >= 0) formState.custom.splice(idx, 1); else formState.custom.push(w);
        this.classList.toggle('active');
        updateWeekSummary();
      });
      wrap.appendChild(b);
    }
  }

  function buildSwatches() {
    var wrap = $('#swatchRow');
    wrap.innerHTML = '';
    PALETTE_KEYS.forEach(function (k) {
      var pal = PALETTE[k];
      var b = el('button', 'swatch' + (formState.color === k ? ' active' : ''));
      b.type = 'button';
      b.title = pal.name;
      b.dataset.key = k;
      b.style.background = 'linear-gradient(145deg,' + pal.a + ',' + pal.b + ')';
      b.addEventListener('click', function () {
        formState.color = k;
        $('#fColor').value = pal.b;
        $$('#swatchRow .swatch').forEach(function (x) { x.classList.remove('active'); });
        b.classList.add('active');
      });
      wrap.appendChild(b);
    });
    $$('#swatchRow .swatch').forEach(function (x) { x.classList.toggle('active', x.dataset.key === formState.color); });
  }

  function updateWeekSummary() {
    var list = collectWeeks();
    $('#weekSummary').innerHTML = '已选 <b>' + list.length + '</b> 周：' + esc(compressWeeks(list.length ? list : []));
  }

  function collectWeeks() {
    var total = state.settings.totalWeeks, list = [];
    if (formState.mode === 'all') list = range(1, total);
    else if (formState.mode === 'range') {
      var a = clamp(parseInt($('#fWeekFrom').value, 10) || 1, 1, total);
      var b = clamp(parseInt($('#fWeekTo').value, 10) || total, 1, total);
      if (a > b) { var t = a; a = b; b = t; }
      list = range(a, b);
    } else {
      list = formState.custom.slice().sort(function (x, y) { return x - y; });
    }
    if (formState.parity === 'odd') list = list.filter(function (w) { return w % 2 === 1; });
    else if (formState.parity === 'even') list = list.filter(function (w) { return w % 2 === 0; });
    return list;
  }

  function setChipRow(root, attr, value) {
    $$('[' + attr + ']', root).forEach(function (b) { b.classList.toggle('active', b.getAttribute(attr) === value); });
  }

  function openCourseForm(course, preset) {
    buildSelects();
    formState.kind = course ? (course.kind || 'course') : ((preset && preset.kind) || 'course');
    $('#fId').value = course ? course.id : '';
    $('#fName').value = course ? course.name : '';
    $('#fTeacher').value = course ? course.teacher : '';
    $('#fRoom').value = course ? course.room : '';
    $('#fNote').value = course ? course.note : '';
    $('#fDay').value = course ? course.day : (preset && preset.day) || todayIndex();
    $('#fStart').value = course ? course.startPeriod : (preset && preset.period) || 1;
    $('#fEnd').value = course ? course.endPeriod : (preset && preset.period) || ($('#fStart').value);
    $('#courseDeleteBtn').hidden = !course;

    if (course) {
      formState.color = course.color;
      var weeks = course.weeks.slice();
      var total = state.settings.totalWeeks;
      var isAll = weeks.length === total && weeks.every(function (w, i) { return w === i + 1; });
      if (isAll) { formState.mode = 'all'; }
      else if (isContiguous(weeks)) {
        formState.mode = 'range';
        $('#fWeekFrom').value = weeks[0];
        $('#fWeekTo').value = weeks[weeks.length - 1];
      } else { formState.mode = 'custom'; formState.custom = weeks; }
      formState.parity = isOddOnly(weeks) ? 'odd' : (isEvenOnly(weeks) ? 'even' : 'all');
    } else {
      formState.color = PALETTE_KEYS[Math.floor(Math.random() * PALETTE_KEYS.length)];
      formState.mode = 'range';
      formState.parity = 'all';
      formState.custom = [];
      $('#fWeekFrom').value = 1;
      $('#fWeekTo').value = Math.min(16, state.settings.totalWeeks);
    }
    if (course) $('#fColor').value = resolveColor(formState.color).b;
    else $('#fColor').value = resolveColor(formState.color).b;

    setChipRow($('#kindRow'), 'data-kind', formState.kind);
    setChipRow($('#weekModeRow'), 'data-wmode', formState.mode);
    setChipRow($('#parityRow'), 'data-parity', formState.parity);
    $$('#weekModeRow .chip').forEach(function (b) {
      b.classList.toggle('active', b.dataset.wmode === formState.mode);
    });
    $$('#parityRow .chip').forEach(function (b) {
      b.classList.toggle('active', b.dataset.parity === formState.parity);
    });
    $('#rangeRow').hidden = formState.mode !== 'range';
    $('#weekGrid').hidden = formState.mode !== 'custom';
    buildWeekGrid();
    buildSwatches();
    updateWeekSummary();
    syncKindUI();
    $('#conflictBox').hidden = true;
    openModal('#courseModal');
  }

  /* 依据「课程 / 活动」切换表单文案 */
  function syncKindUI() {
    var act = formState.kind === 'activity';
    var editing = !!$('#fId').value;
    $('#courseModalTitle').textContent = (editing ? '编辑' : '添加') + (act ? '活动' : '课程');
    $('#fNameLabel').innerHTML = (act ? '活动名称' : '课程名称') + ' <i>*</i>';
    $('#fTeacherLabel').textContent = act ? '负责教师 / 组织者' : '授课教师';
    $('#fRoomLabel').textContent = act ? '活动地点' : '上课地点';
    $('#fWeeksLegend').textContent = act ? '进行周次' : '上课周次';
    $('#fName').placeholder = act ? '例如：社团例会 / 自习 / 期中考试' : '例如：高等数学A';
    $('#fTeacher').placeholder = act ? '王老师 / 学生会' : '张明远';
    $('#fRoom').placeholder = act ? '图书馆 3 楼 / 线上' : '理科楼 A203';
    $('#fNote').placeholder = act ? '需要携带的物品 / 集合方式 …' : '考试重点 / 需带物品 / 作业截止 …';
  }
  function isContiguous(w) {
    for (var i = 1; i < w.length; i++) if (w[i] !== w[i - 1] + 1) return false;
    return w.length > 0;
  }
  function isOddOnly(w) { return w.length >= 2 && w.every(function (x) { return x % 2 === 1; }); }
  function isEvenOnly(w) { return w.length >= 2 && w.every(function (x) { return x % 2 === 0; }); }

  function overlapsWeeks(a, b) { return a.some(function (w) { return b.indexOf(w) >= 0; }); }

  function findConflicts(course) {
    return state.courses.filter(function (c) {
      if (c.id === course.id) return false;
      if (c.day !== course.day) return false;
      if (c.endPeriod < course.startPeriod || c.startPeriod > course.endPeriod) return false;
      return overlapsWeeks(c.weeks, course.weeks);
    });
  }

  function saveCourseFromForm() {
    var label = formState.kind === 'activity' ? '活动' : '课程';
    var name = $('#fName').value.trim();
    if (!name) { toast('请填写' + label + '名称', 'error'); $('#fName').focus(); return; }
    var start = parseInt($('#fStart').value, 10);
    var end = parseInt($('#fEnd').value, 10);
    if (end < start) { var t = start; start = end; end = t; }
    var weeks = collectWeeks();
    if (!weeks.length) { toast('请至少选择一周时间', 'error'); return; }

    var id = $('#fId').value;
    var course = normalizeCourse({
      id: id || undefined,
      kind: formState.kind,
      name: name,
      teacher: $('#fTeacher').value.trim(),
      room: $('#fRoom').value.trim(),
      note: $('#fNote').value.trim(),
      day: +$('#fDay').value,
      startPeriod: start,
      endPeriod: end,
      weeks: weeks,
      color: formState.color,
      createdAt: (state.courses.find(function (x) { return x.id === id; }) || {}).createdAt
    });

    var conflicts = findConflicts(course);
    if (conflicts.length && !$('#conflictBox').dataset.acked) {
      var box = $('#conflictBox');
      box.hidden = false;
      $('#conflictList').innerHTML = conflicts.map(function (c) {
        return '<li>' + esc(c.name) + '（' + DAY_NAMES[c.day - 1] + ' 第 ' + c.startPeriod + '-' + c.endPeriod + ' 节，' +
          esc(compressWeeks(c.weeks)) + '）</li>';
      }).join('');
      box.dataset.acked = '1';
      toast('存在时间冲突，再次点击保存即可强制保存', 'error');
      box.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      return;
    }

    if (id) {
      var idx = state.courses.findIndex(function (x) { return x.id === id; });
      state.courses[idx] = course;
    } else {
      state.courses.push(course);
    }
    save();
    closeModal($('#courseModal'));
    delete $('#conflictBox').dataset.acked;
    renderAll();
    toast(id ? '已更新「' + course.name + '」' : '已添加「' + course.name + '」');
  }

  /* ============ 设置 ============ */
  function openSettings() {
    var s = state.settings;
    $('#sName').value = s.semesterName;
    $('#sStart').value = s.semesterStart;
    $('#sTotal').value = s.totalWeeks;
    $('#sFirst').value = s.firstStart;
    $('#sCount').value = s.periodCount;
    $('#sDuration').value = s.duration;
    $('#sBreak').value = s.breakMin;
    $('#sNoonAfter').value = s.noonAfter;
    $('#sNoonMin').value = s.noonMin;
    $('#sEveAfter').value = s.eveningAfter;
    $('#sEveMin').value = s.eveningMin;
    $('#sRemindOn').checked = s.remindOn !== false;
    $('#sRemindLead').value = clamp(parseInt(s.remindLead, 10) || 10, 1, 60);
    renderDaySched();
    renderThemeRow();
    renderPeriodPreview();
    $('#storageHint').textContent = HAS_STORE
      ? '当前数据已保存在本机浏览器缓存中，刷新后依然保留。'
      : '当前浏览器不允许本地存储，刷新后数据会恢复为示例课表，建议使用「导出 JSON」备份。';
    openModal('#settingsModal');
  }
  /* 每日时长与休息：7 行独立开关，开启后覆盖首节时间 / 每节时长 / 课间 */
  function renderDaySched() {
    var wrap = $('#daySched');
    if (!wrap) return;
    var s = state.settings;
    wrap.innerHTML = '';
    for (var d = 1; d <= 7; d++) {
      var ov = s.dayOverrides && s.dayOverrides[d];
      var row = el('div', 'ds-row' + (ov ? ' on' : ''));
      row.dataset.day = d;
      row.innerHTML =
        '<span class="ds-day">' + DAY_NAMES[d - 1] + '</span>' +
        '<label class="ds-toggle"><input type="checkbox" data-ds-on' + (ov ? ' checked' : '') + '>单独设置</label>' +
        '<div class="ds-fields">' +
          '<label class="ds-field"><span>第一节</span><input type="time" data-ds="firstStart" value="' +
            ((ov && ov.firstStart) || s.firstStart) + '"></label>' +
          '<label class="ds-field"><span>每节时长</span><input type="number" min="5" max="300" step="5" data-ds="duration" value="' +
            ((ov && ov.duration) || s.duration) + '"></label>' +
          '<label class="ds-field"><span>课间休息</span><input type="number" min="0" max="120" step="5" data-ds="breakMin" value="' +
            ((ov && ov.breakMin != null ? ov.breakMin : s.breakMin)) + '"></label>' +
        '</div>';
      wrap.appendChild(row);
    }
  }
  function readDaySched() {
    var out = {};
    $$('#daySched .ds-row').forEach(function (row) {
      var on = row.querySelector('[data-ds-on]');
      if (!on || !on.checked) return;
      var get = function (k) {
        var n = row.querySelector('[data-ds="' + k + '"]');
        return n ? n.value : '';
      };
      out[parseInt(row.dataset.day, 10)] = {
        firstStart: get('firstStart') || state.settings.firstStart,
        duration: clamp(parseInt(get('duration'), 10) || state.settings.duration, 5, 300),
        breakMin: clamp(parseInt(get('breakMin'), 10) || 0, 0, 120)
      };
    });
    return out;
  }
  /* 主题风格：设置弹层与独立「主题风格」弹层共用同一份渲染 */
  function renderThemeRow() {
    ['#themeRow', '#themeRowModal'].forEach(function (sel) {
      var row = $(sel);
      if (!row) return;
      row.innerHTML = '';
      Object.keys(THEMES).forEach(function (k) {
        var t = THEMES[k];
        var b = el('button', 'theme-btn' + (state.settings.theme === k ? ' active' : ''));
        b.type = 'button';
        b.dataset.theme = k;
        b.innerHTML = '<span class="theme-dots">' + t.dots.map(function (c) {
          return '<i style="background:' + c + '"></i>';
        }).join('') + '</span>' + t.name;
        b.addEventListener('click', function () {
          state.settings.theme = k;
          if (k !== 'night') state.settings.lastLight = k;
          renderThemeRow();
          applyTheme();
          flashTheme();
          save();
        });
        row.appendChild(b);
      });
    });
  }
  function readSettingsForm() {
    return {
      semesterName: $('#sName').value.trim() || '新学期',
      semesterStart: fmtDate(mondayOf(parseDate($('#sStart').value))),
      totalWeeks: clamp(parseInt($('#sTotal').value, 10) || 18, WEEK_MIN, WEEK_MAX),
      firstStart: $('#sFirst').value || '08:00',
      periodCount: clamp(parseInt($('#sCount').value, 10) || 10, 1, 16),
      duration: clamp(parseInt($('#sDuration').value, 10) || 45, 5, 300),
      breakMin: clamp(parseInt($('#sBreak').value, 10) || 0, 0, 120),
      noonAfter: clamp(parseInt($('#sNoonAfter').value, 10) || 0, 0, 16),
      noonMin: clamp(parseInt($('#sNoonMin').value, 10) || 0, 0, 240),
      eveningAfter: clamp(parseInt($('#sEveAfter').value, 10) || 0, 0, 16),
      eveningMin: clamp(parseInt($('#sEveMin').value, 10) || 0, 0, 240),
      remindOn: !!$('#sRemindOn').checked,
      remindLead: clamp(parseInt($('#sRemindLead').value, 10) || 10, 1, 60),
      dayOverrides: readDaySched()
    };
  }
  function renderPeriodPreview() {
    var s = Object.assign({}, state.settings, readSettingsForm());
    var layout = computeLayout(s);
    var wrap = $('#periodPreview');
    wrap.innerHTML = '';
    layout.layout.forEach(function (slot) {
      if (slot.type === 'break') {
        var d = el('div', 'pp-sep', '— ' + slot.label + ' ' + slot.minutes + ' 分钟 —');
        wrap.appendChild(d);
        return;
      }
      var p = layout.periods[slot.index - 1];
      var it = el('div', 'pp-item');
      it.innerHTML = '<span class="pp-index">' + slot.index + '</span><span>' + p.start + ' - ' + p.end + '</span>';
      wrap.appendChild(it);
    });
  }

  /* ============ iCalendar（RFC 5545）============ */
  function foldLine(str) {
    var out = '', buf = '', len = 0, i, ch, n;
    var hasEnc = typeof TextEncoder !== 'undefined';
    var enc = hasEnc ? new TextEncoder() : null;
    for (i = 0; i < str.length; i++) {
      ch = str.charAt(i);
      n = enc ? enc.encode(ch).length : 1;
      if (len + n > 73) { out += buf + '\r\n '; buf = ''; len = 1; }
      buf += ch; len += n;
    }
    return out + buf;
  }
  function icsEsc(str) {
    return String(str == null ? '' : str)
      .replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
    }
  function icsUnesc(v) {
    return String(v).replace(/\\([\\;,nN])/g, function (m, c) { return (c === 'n' || c === 'N') ? '\n' : c; });
  }
  function icsStamp(d) {
    return d.getUTCFullYear() + pad2(d.getUTCMonth() + 1) + pad2(d.getUTCDate()) + 'T' +
      pad2(d.getUTCHours()) + pad2(d.getUTCMinutes()) + pad2(d.getUTCSeconds()) + 'Z';
  }
  function icsLocal(d, hhmm) {
    var t = toMin(hhmm);
    return d.getFullYear() + pad2(d.getMonth() + 1) + pad2(d.getDate()) + 'T' +
      pad2(Math.floor(t / 60)) + pad2(t % 60) + '00';
  }
  function dayOfWeekCode(d) { return DAY_CODES[(d.getDay() + 6) % 7]; }

  function buildIcsText() {
    var s = state.settings;
    var L = [];
    function p(line) { L.push(foldLine(line)); }

    p('BEGIN:VCALENDAR');
    p('VERSION:2.0');
    p('PRODID:-//Sakura Timetable//CN');
    p('CALSCALE:GREGORIAN');
    p('METHOD:PUBLISH');
    p('X-WR-CALNAME:' + icsEsc(s.semesterName + ' · 星梦课程表'));
    p('X-WR-TIMEZONE:' + TZ_ID);
    p('BEGIN:VTIMEZONE');
    p('TZID:' + TZ_ID);
    p('BEGIN:STANDARD');
    p('DTSTART:19910915T000000');
    p('TZOFFSETFROM:+0800');
    p('TZOFFSETTO:+0800');
    p('TZNAME:CST');
    p('END:STANDARD');
    p('END:VTIMEZONE');

    var stamp = icsStamp(new Date());
    state.courses.forEach(function (c, i) {
      var weeks = c.weeks.slice().sort(function (a, b) { return a - b; });
      if (!weeks.length) return;
      var periods = computeLayout(s, c.day).periods;
      var p1 = periods[c.startPeriod - 1] || periods[0];
      var p2 = periods[c.endPeriod - 1] || periods[periods.length - 1];
      var first = dateOf(weeks[0], c.day);
      var last = dateOf(weeks[weeks.length - 1], c.day);
      var desc = [];
      if (c.teacher) desc.push('教师：' + c.teacher);
      desc.push('第 ' + c.startPeriod + (c.endPeriod > c.startPeriod ? '-' + c.endPeriod : '') + ' 节 ' + p1.start + '-' + p2.end);
      if (c.note) desc.push('备注：' + c.note);

      p('BEGIN:VEVENT');
      p('UID:' + (c.id || ('sakura-' + i)) + '@sakura-timetable');
      p('DTSTAMP:' + stamp);
      p('SUMMARY:' + icsEsc(c.name));
      if (c.room) p('LOCATION:' + icsEsc(c.room));
      p('DESCRIPTION:' + icsEsc(desc.join('\n')));
      p('DTSTART;TZID=' + TZ_ID + ':' + icsLocal(first, p1.start));
      p('DTEND;TZID=' + TZ_ID + ':' + icsLocal(first, p2.end));

      var step = (weeks.length >= 2 && isOddOnly(weeks)) ? 2 : (weeks.length >= 2 && isEvenOnly(weeks)) ? 2 : 1;
      var rrule = 'FREQ=WEEKLY;BYDAY=' + dayOfWeekCode(first);
      if (step === 2) {
        rrule += ';INTERVAL=2;COUNT=' + weeks.length;
      } else if (isContiguous(weeks)) {
        rrule += ';COUNT=' + weeks.length;
      } else {
        rrule += ';COUNT=' + (weeks[weeks.length - 1] - weeks[0] + 1);
      }
      p('RRULE:' + rrule);

      if (step === 1 && !isContiguous(weeks)) {
        var set = {};
        weeks.forEach(function (w) { set[w] = 1; });
        var ex = [];
        for (var w = weeks[0]; w <= weeks[weeks.length - 1]; w++) {
          if (!set[w]) ex.push('EXDATE;TZID=' + TZ_ID + ':' + icsLocal(dateOf(w, c.day), p1.start));
        }
        ex.forEach(function (line) { p(line); });
      }
      p('END:VEVENT');
    });

    p('END:VCALENDAR');
    return L.join('\r\n') + '\r\n';
  }

  function unfoldIcs(text) {
    var lines = String(text).replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
    var out = [];
    lines.forEach(function (line) {
      if (/^[ \t]/.test(line) && out.length) out[out.length - 1] += line.slice(1);
      else out.push(line);
    });
    return out;
  }
  function splitProp(line) {
    var i = line.indexOf(':');
    if (i < 0) return null;
    var left = line.slice(0, i), value = line.slice(i + 1);
    var segs = left.split(';');
    var name = segs.shift().toUpperCase();
    var params = {};
    segs.forEach(function (sg) {
      var k = sg.indexOf('=');
      if (k > 0) params[sg.slice(0, k).toUpperCase()] = sg.slice(k + 1).replace(/^"|"$/g, '');
    });
    return { name: name, params: params, value: icsUnesc(value) };
    }
  function parseIcsEvents(text) {
    var lines = unfoldIcs(text), events = [], cur = null;
    lines.forEach(function (line) {
      var trimmed = line.trim();
      var up = trimmed.toUpperCase();
      if (up === 'BEGIN:VEVENT') { cur = {}; return; }
      if (up === 'END:VEVENT') { if (cur) events.push(cur); cur = null; return; }
      if (!cur) return;
      var p = splitProp(line);
      if (!p) return;
      (cur[p.name] = cur[p.name] || []).push(p);
    });
    return events;
  }
  function getProp(ev, name) { return ev[name] && ev[name][0] ? ev[name][0] : null; }
  function getPropAll(ev, name) { return ev[name] || []; }
  function parseIcsDateValue(value) {
    var m = /^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})(Z)?)?$/.exec(String(value).trim());
    if (!m) return null;
    if (m[4]) {
      if (m[7]) return new Date(Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], +m[6]));
      return new Date(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], +m[6]);
    }
    return new Date(+m[1], +m[2] - 1, +m[3]);
  }
  function parseRRule(value) {
    var out = {}, segs = String(value).split(';');
    segs.forEach(function (sg) {
      var i = sg.indexOf('=');
      if (i > 0) out[sg.slice(0, i).toUpperCase()] = sg.slice(i + 1).trim();
    });
    return out;
  }
  function expandOccurrences(dtstart, rrule, exdates, cap) {
    var WD = { MO: 0, TU: 1, WE: 2, TH: 3, FR: 4, SA: 5, SU: 6 };
    var interval = Math.max(1, parseInt(rrule.INTERVAL || '1', 10) || 1);
    var bydays = String(rrule.BYDAY || '').split(',')
      .map(function (x) { return WD[x.replace(/[^A-Za-z]/g, '').toUpperCase()]; })
      .filter(function (v) { return v !== undefined; });
    if (!bydays.length) bydays = [(dtstart.getDay() + 6) % 7];
    bydays.sort(function (a, b) { return a - b; });
    var until = rrule.UNTIL ? parseIcsDateValue(rrule.UNTIL) : null;
    var count = rrule.COUNT ? parseInt(rrule.COUNT, 10) : null;
    var anchor = mondayOf(dtstart);
    var startDay = startOfDay(dtstart);
    var untilEnd = until ? new Date(until.getFullYear(), until.getMonth(), until.getDate(), 23, 59, 59) : null;
    var res = [], produced = 0, w = 0;
    while (res.length < (cap || 200) && w < 300) {
      for (var bi = 0; bi < bydays.length; bi++) {
        var d = addDays(anchor, w * 7 * interval + bydays[bi]);
        if (d.getTime() < startDay.getTime()) continue;
        if (untilEnd && d.getTime() > untilEnd.getTime()) return filterEx(res, exdates);
        res.push(d);
        produced++;
        if (count && produced >= count) return filterEx(res, exdates);
      }
      w++;
    }
    return filterEx(res, exdates);
  }
  function filterEx(list, exdates) {
    if (!exdates || !exdates.length) return list;
    return list.filter(function (d) {
      return !exdates.some(function (e) { return sameDay(e, d); });
    });
  }

  /* 从文本中提取节次（很多教务系统把「第 x-y 节」写进标题/描述） */
  function extractPeriods(text) {
    var m = /第?\s*(\d{1,2})\s*[-~～至]\s*(\d{1,2})\s*节/.exec(text);
    if (m) return { start: parseInt(m[1], 10), end: parseInt(m[2], 10) };
    m = /第?\s*(\d{1,2})\s*节/.exec(text);
    if (m) return { start: parseInt(m[1], 10), end: parseInt(m[1], 10) };
    return null;
  }

  /* 时间 → 节次匹配 */
  function matchPeriod(periods, hhmm) {
    var t = toMin(hhmm), best = null, bestDiff = 1e9;
    periods.forEach(function (p) {
      var diff = Math.abs(p.startMin - t);
      if (diff < bestDiff) { bestDiff = diff; best = p; }
      var diffEnd = Math.abs(p.endMin - t);
      if (diffEnd < bestDiff) { bestDiff = diffEnd; best = p; }
    });
    return { period: best, diff: bestDiff };
  }

  function importIcs(text, report) {
    var events = parseIcsEvents(text);
    if (!events.length) throw new Error('未在文本中找到任何 VEVENT 事件');

    var parsed = [];
    events.forEach(function (ev) {
      var summary = getProp(ev, 'SUMMARY');
      if (!summary || !summary.value.trim()) return;
      var name = summary.value.trim();
      var loc = getProp(ev, 'LOCATION');
      var desc = getProp(ev, 'DESCRIPTION');
      var descText = desc ? desc.value : '';
      var dtstartProp = getProp(ev, 'DTSTART');
      if (!dtstartProp) return;
      var dtstart = parseIcsDateValue(dtstartProp.value);
      if (!dtstart) return;
      var dtendProp = getProp(ev, 'DTEND');
      var dtend = dtendProp ? parseIcsDateValue(dtendProp.value) : null;

      var rruleProp = getProp(ev, 'RRULE');
      var rrule = rruleProp ? parseRRule(rruleProp.value) : {};
      var exdates = getPropAll(ev, 'EXDATE').reduce(function (acc, prop) {
        prop.value.split(',').forEach(function (v) {
          var d = parseIcsDateValue(v);
          if (d) acc.push(d);
        });
        return acc;
      }, []);

      var dates = rruleProp ? expandOccurrences(dtstart, rrule, exdates, 120) : [dtstart];

      /* 周次：优先用描述里的「x-y 周」 */
      var weeksInfo = /第?\s*(\d{1,2})\s*[-~～至]\s*(\d{1,2})\s*周/.exec(descText);
      var weekHint = null;
      if (weeksInfo) {
        var a = parseInt(weeksInfo[1], 10), b = parseInt(weeksInfo[2], 10);
        weekHint = range(Math.min(a, b), Math.max(a, b));
        if (/单周/.test(descText)) weekHint = weekHint.filter(function (w) { return w % 2 === 1; });
        if (/双周/.test(descText)) weekHint = weekHint.filter(function (w) { return w % 2 === 0; });
      }

      var startTime = pad2(dtstart.getHours()) + ':' + pad2(dtstart.getMinutes());
      var endTime = dtend ? pad2(dtend.getHours()) + ':' + pad2(dtend.getMinutes()) : null;
      var pInfo = extractPeriods(summary.value + ' ' + descText);
      var sp, ep, matched = true;
      if (pInfo) {
        sp = pInfo.start;
        ep = pInfo.end || pInfo.start;
      } else {
        var dPeriods = computeLayout(state.settings, ((dtstart.getDay() + 6) % 7) + 1).periods;
        var m1 = matchPeriod(dPeriods, startTime);
        var m2 = endTime ? matchPeriod(dPeriods, endTime) : m1;
        sp = m1.period.index;
        ep = Math.max(sp, m2.period.index);
        matched = m1.diff <= 25 && (!endTime || m2.diff <= 25);
      }

      var teacher = '';
      var tm = /(?:教师|老师|授课教师)\s*[:：]\s*([^,，;；\n]+)/.exec(descText);
      if (tm) teacher = tm[1].replace(/\s*第\s*\d.*$/, '').replace(/[（(].*$/, '').trim();
      else if (descText && !/周|节/.test(descText) && descText.length <= 16) teacher = descText.trim();

      /* 备注：剔除已经结构化保存的「第 x 周 / 星期周X 第 a-b 节 / 教师」信息，只留额外说明 */
      var noteText = descText.split(/\n+/).map(function (s) { return s.trim(); })
        .filter(function (s) { return s && !/^(教师|老师|授课教师)\s*[:：]/.test(s); })
        .map(function (s) {
          return s.replace(/第\s*\d+\s*(?:[-~～至]\s*\d+\s*)?周/g, '')
                  .replace(/星期\s*周?\s*[一二三四五六日]\s*第\s*\d+\s*(?:[-~～至]\s*\d+\s*)?节/g, '')
                  .trim();
        })
        .filter(Boolean).join(' · ').slice(0, 120);

      parsed.push({
        name: name,
        teacher: teacher,
        room: loc ? loc.value.trim() : '',
        note: noteText,
        dates: dates,
        weeksHint: weekHint,
        sp: sp, ep: ep,
        matched: matched,
        dtstart: dtstart
      });
    });

    if (!parsed.length) throw new Error('VEVENT 中没有可识别的课程信息');

    /* 对齐学期：如果所有上课日期都落在当前学期之外，则以最早日期所在周为第 1 周 */
    var inRange = 0;
    parsed.forEach(function (e) {
      (e.weeksHint || e.dates.map(weekNoOf)).forEach(function (w) {
        if (w >= 1 && w <= state.settings.totalWeeks) inRange++;
      });
    });
    var anchorShifted = false;
    if (inRange === 0) {
      var earliest = null;
      parsed.forEach(function (e) {
        e.dates.forEach(function (d) { if (!earliest || d < earliest) earliest = d; });
      });
      if (earliest) {
        state.settings.semesterStart = fmtDate(mondayOf(earliest));
        var maxWeek = 1;
        parsed.forEach(function (e) {
          (e.weeksHint || e.dates.map(weekNoOf)).forEach(function (w) { maxWeek = Math.max(maxWeek, w); });
        });
        state.settings.totalWeeks = clamp(maxWeek, WEEK_MIN, WEEK_MAX);
        anchorShifted = true;
        report.notes.push('检测到导入数据不属于当前学期，已自动把学期第 1 周对齐到 ' +
          state.settings.semesterStart + '（共 ' + state.settings.totalWeeks + ' 周）。');
      }
    }

    /* 合并：同一门课（名称/教师/教室/星期/节次完全一致）按周次并成一条，
       否则「一周一个 VEVENT」的课表会导入成一堆重复条目 */
    var added = [], merged = {}, mergedCount = 0;
    parsed.forEach(function (e) {
      var weeks = e.weeksHint ? e.weeksHint : e.dates.map(weekNoOf);
      weeks = weeks.filter(function (w) { return w >= 1 && w <= state.settings.totalWeeks; })
        .filter(function (w, i, a) { return a.indexOf(w) === i; })
        .sort(function (x, y) { return x - y; });
      if (!weeks.length) { report.skipped.push(e.name + '（上课周次不在本学期范围内）'); return; }
      var day = ((e.dtstart.getDay() + 6) % 7) + 1;
      var sp = clamp(e.sp, 1, state.settings.periodCount);
      var ep = clamp(e.ep, sp, state.settings.periodCount);
      if (!e.matched) report.partial++;
      var key = [e.name, e.teacher, e.room, day, sp, ep].join('\u0001');
      if (merged[key]) {
        merged[key].weeks = merged[key].weeks.concat(weeks)
          .filter(function (w, i, a) { return a.indexOf(w) === i; })
          .sort(function (x, y) { return x - y; });
        mergedCount++;
        return;
      }
      var c = normalizeCourse({
        name: e.name, teacher: e.teacher, room: e.room, note: e.note,
        day: day, startPeriod: sp, endPeriod: ep, weeks: weeks,
        color: PALETTE_KEYS[added.length % PALETTE_KEYS.length]
      });
      merged[key] = c;
      added.push(c);
    });
    if (mergedCount) report.notes.push('已把 ' + mergedCount + ' 条重复的周次记录合并到对应课程。');
    return { courses: added, anchorShifted: anchorShifted };
  }

  /* ============ CSV ============ */
  function csvQuote(v) {
    var s = String(v == null ? '' : v);
    return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  }
  function splitCsvLine(line, delim) {
    var out = [], cur = '', inQ = false;
    for (var i = 0; i < line.length; i++) {
      var ch = line.charAt(i);
      if (inQ) {
        if (ch === '"') {
          if (line.charAt(i + 1) === '"') { cur += '"'; i++; }
          else inQ = false;
        } else cur += ch;
      } else if (ch === '"') inQ = true;
      else if (ch === delim) { out.push(cur); cur = ''; }
      else cur += ch;
    }
    out.push(cur);
    return out.map(function (s) { return s.trim(); });
  }
  function buildCsvText() {
    var rows = [['课程名称', '教师', '教室', '星期', '开始节次', '结束节次', '周次', '备注']];
    state.courses.slice().sort(function (a, b) {
      return (a.day - b.day) || (a.startPeriod - b.startPeriod);
    }).forEach(function (c) {
      rows.push([c.name, c.teacher, c.room, DAY_NAMES[c.day - 1], c.startPeriod, c.endPeriod, compressWeeks(c.weeks), c.note]);
    });
    return '\ufeff' + rows.map(function (r) { return r.map(csvQuote).join(','); }).join('\r\n') + '\r\n';
  }
  function parseCsvText(text) {
    var lines = String(text).replace(/^\ufeff/, '').split(/\r?\n/).filter(function (l) { return l.trim(); });
    if (!lines.length) throw new Error('CSV 内容为空');
    var delim = (lines[0].indexOf('\t') >= 0) ? '\t' : (lines[0].indexOf(';') >= 0 && lines[0].indexOf(',') < 0 ? ';' : ',');
    var header = splitCsvLine(lines[0], delim).map(function (h) { return h.toLowerCase(); });
    var map = {
      name: find(['课程名称', '课程', '名称', 'name', 'course', 'subject', 'title']),
      teacher: find(['教师', '老师', '授课教师', 'teacher', 'instructor']),
      room: find(['教室', '地点', '上课地点', 'room', 'location', 'place']),
      day: find(['星期', '周几', 'day', 'weekday']),
      start: find(['开始节次', '起始节次', '开始', 'start', 'startperiod', 'start_period', 'from']),
      end: find(['结束节次', '结束', 'end', 'endperiod', 'end_period', 'to']),
      weeks: find(['周次', '上课周次', 'weeks', 'week']),
      note: find(['备注', '说明', 'note', 'remark', 'comment'])
    };
    if (map.name < 0) throw new Error('CSV 缺少「课程名称」列，请检查表头');
    var out = [], warnings = [];
    for (var i = 1; i < lines.length; i++) {
      var cells = splitCsvLine(lines[i], delim);
      if (!cells.length || !cells[map.name]) continue;
      var dayRaw = map.day >= 0 ? cells[map.day] : '';
      var day = parseDay(dayRaw);
      if (!day) {
        day = ((i - 1) % 7) + 1;
        warnings.push('第 ' + i + ' 行星期无法识别（' + (dayRaw || '空') + '），已按周一至周日顺序推算为' + DAY_NAMES[day - 1]);
      }
      var sp = map.start >= 0 ? (parseInt(cells[map.start], 10) || 1) : 1;
      var ep = map.end >= 0 ? (parseInt(cells[map.end], 10) || sp) : sp;
      out.push({
        name: cells[map.name], teacher: map.teacher >= 0 ? cells[map.teacher] : '',
        room: map.room >= 0 ? cells[map.room] : '', note: map.note >= 0 ? cells[map.note] : '',
        day: day, startPeriod: Math.min(sp, ep), endPeriod: Math.max(sp, ep),
        weeks: parseWeeks(map.weeks >= 0 ? cells[map.weeks] : '')
      });
    }
    return { rows: out, warnings: warnings };

    function find(names) {
      for (var i = 0; i < header.length; i++) {
        var h = header[i].replace(/[\s_*()（）]/g, '');
        for (var j = 0; j < names.length; j++) {
          var target = names[j].replace(/[\s_]/g, '');
          if (h === target || h.indexOf(target) >= 0) return i;
        }
      }
      return -1;
    }
  }
  function parseDay(raw) {
    var s = String(raw || '').trim();
    if (!s) return 0;
    var cn = ['一', '二', '三', '四', '五', '六', '日', '天'];
    var m = /星期|周|礼拜/.exec(s);
    if (m) {
      var ch = /([一二三四五六日天])/.exec(s);
      if (ch) return cn.indexOf(ch[1]) + 1;
    }
    var en = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
    for (var i = 0; i < en.length; i++) if (s.toLowerCase().indexOf(en[i]) === 0) return i + 1;
    var n = parseInt(s, 10);
    if (!isNaN(n) && n >= 1 && n <= 7) return n;
    if (/日|天/.test(s)) return 7;
    if (/六/.test(s)) return 6;
    var map2 = { '一': 1, '二': 2, '三': 3, '四': 4, '五': 5 };
    for (var k in map2) if (s.indexOf(k) >= 0) return map2[k];
    return 0;
  }

  /* ============ 导入调度 ============ */
  function detectFormat(text, filename) {
    var name = String(filename || '').toLowerCase();
    var t = text.trim();
    if (/\.ics$|\.ical$|\.ifb$/.test(name)) return 'ics';
    if (/\.csv$|\.txt$/.test(name)) return 'csv';
    if (/\.json$/.test(name)) return 'json';
    if (/^BEGIN:VCALENDAR|BEGIN:VEVENT/i.test(t)) return 'ics';
    if (/^[\[{]/.test(t)) return 'json';
    if (/^[^,\t\n]*(,|\t)[^\n]*\n/.test(t)) return 'csv';
    return 'unknown';
  }

  function applyImport(newCourses, report, mode) {
    var dupMode = state.dupMode;
    var target = (mode === 'replace') ? [] : state.courses.slice();
    var addedCount = 0, mergedCount = 0;
    newCourses.forEach(function (c) {
      var dup = target.find(function (x) {
        return x.name === c.name && x.day === c.day &&
          x.startPeriod === c.startPeriod && x.endPeriod === c.endPeriod;
      });
      if (dup) {
        if (dupMode === 'merge') {
          var union = dup.weeks.concat(c.weeks).filter(function (w, i, a) { return a.indexOf(w) === i; })
            .sort(function (a, b) { return a - b; });
          dup.weeks = union;
          if (!dup.room && c.room) dup.room = c.room;
          if (!dup.teacher && c.teacher) dup.teacher = c.teacher;
          mergedCount++;
        } else {
          report.skipped.push(c.name + '（与已有课程重复，已跳过）');
        }
        return;
      }
      target.push(c);
      addedCount++;
    });
    state.courses = target;
    report.added = addedCount;
    report.merged = mergedCount;
    return report;
  }

  function handleImportText(text, filename) {
    if (!text || !text.trim()) { renderImportResult(null, '导入内容为空'); return; }
    var fmt = detectFormat(text, filename);
    var report = { format: fmt, added: 0, merged: 0, skipped: [], notes: [], partial: 0 };
    var courses = [];
    try {
      if (fmt === 'ics') {
        var r = importIcs(text, report);
        courses = r.courses;
      } else if (fmt === 'csv') {
        var csv = parseCsvText(text);
        report.notes = report.notes.concat(csv.warnings);
        courses = csv.rows.map(function (r, i) {
          return normalizeCourse({
            name: r.name, teacher: r.teacher, room: r.room, note: r.note,
            day: r.day, startPeriod: r.startPeriod, endPeriod: r.endPeriod,
            weeks: r.weeks.length ? r.weeks : range(1, state.settings.totalWeeks),
            color: PALETTE_KEYS[i % PALETTE_KEYS.length]
          });
        }).filter(Boolean);
        report.notes.push('已解析 ' + courses.length + ' 条课程记录');
      } else if (fmt === 'json') {
        var data = JSON.parse(text);
        if (Array.isArray(data)) {
          courses = data.map(normalizeCourse).filter(Boolean);
        } else if (data && Array.isArray(data.courses)) {
          if (data.settings) {
            state.settings = Object.assign({}, DEFAULT_SETTINGS, data.settings);
            applyTheme();
          }
          courses = data.courses.map(normalizeCourse).filter(Boolean);
          report.notes.push('已同时恢复课表设置（学期、节次、主题）');
        } else {
          throw new Error('JSON 结构不受支持，应为课程数组或含 courses 字段的对象');
        }
      } else {
        throw new Error('无法识别文件格式，请使用 .ics / .csv / .json，或粘贴标准 ICS 文本');
      }
    } catch (e) {
      renderImportResult(null, e.message || '解析失败');
      toast('导入失败：' + (e.message || '格式无法识别'), 'error');
      return;
    }

    if (!courses.length) {
      renderImportResult(report, '没有解析出可用的课程记录');
      return;
    }
    var mode = fmt === 'json' ? 'replace' : state.importMode;
    applyImport(courses, report, mode);
    save();
    renderAll();
    renderImportResult(report, null);
    toast('导入完成：新增 ' + report.added + ' 门课程' + (report.merged ? '，合并 ' + report.merged + ' 门' : ''));
  }

  function renderImportResult(report, errorMsg) {
    var box = $('#importResult');
    box.hidden = false;
    if (errorMsg && !report) {
      box.className = 'import-result is-error';
      box.innerHTML = '<h4>' + svg('i-warning') + '导入未完成</h4><p>' + esc(errorMsg) + '</p>';
      return;
    }
    var fmtName = { ics: 'iCalendar (.ics)', csv: 'CSV 表格', json: 'JSON 备份' }[report.format] || '未知格式';
    box.className = 'import-result';
    var html = '<h4>' + svg('i-check') + '导入完成 · ' + fmtName + '</h4>';
    html += '<div class="ir-stats">' +
      '<span class="ir-pill">新增 ' + report.added + ' 门</span>' +
      (report.merged ? '<span class="ir-pill">合并 ' + report.merged + ' 门</span>' : '') +
      (report.skipped.length ? '<span class="ir-pill">跳过 ' + report.skipped.length + ' 条</span>' : '') +
      (report.partial ? '<span class="ir-pill">按时间匹配节次 ' + report.partial + ' 条</span>' : '') +
      '</div>';
    if (errorMsg) html += '<p>' + esc(errorMsg) + '</p>';
    if (report.notes.length) html += '<ul>' + report.notes.map(function (n) { return '<li>' + esc(n) + '</li>'; }).join('') + '</ul>';
    if (report.skipped.length) {
      html += '<ul>' + report.skipped.slice(0, 8).map(function (n) { return '<li>已跳过：' + esc(n) + '</li>'; }).join('') +
        (report.skipped.length > 8 ? '<li>…另有 ' + (report.skipped.length - 8) + ' 条</li>' : '') + '</ul>';
    }
    box.innerHTML = html;
  }

  function readFiles(fileList) {
    var files = Array.prototype.slice.call(fileList || []);
    if (!files.length) return;
    var pending = files.length;
    files.forEach(function (f) {
      var reader = new FileReader();
      reader.onload = function () {
        handleImportText(String(reader.result), f.name);
        if (--pending === 0) closeModal($('#ioModal'));
      };
      reader.onerror = function () {
        toast('读取文件失败：' + f.name, 'error');
        if (--pending === 0) closeModal($('#ioModal'));
      };
      reader.readAsText(f, 'UTF-8');
    });
  }

  /* ============ 下载 ============ */
  function download(filename, content, mime) {
    var blob = new Blob([content], { type: (mime || 'text/plain') + ';charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { URL.revokeObjectURL(url); a.remove(); }, 500);
  }
  function slug() {
    return (state.settings.semesterName || '课程表').replace(/[\\/:*?"<>|\s]/g, '_');
  }

  /* ============ Tab 切换 ============ */
  function switchIoTab(name) {
    $$('#ioModal .tab').forEach(function (b) { b.classList.toggle('active', b.dataset.tab === name); });
    $$('#ioModal .tab-panel').forEach(function (p) { p.hidden = p.dataset.panel !== name; });
  }

  /* ============ 事件绑定 ============ */
  function bind() {
    /* 周切换 */
    $('#prevWeek').addEventListener('click', function () {
      state.week = clamp(state.week - 1, 1, state.settings.totalWeeks);
      renderAll();
    });
    $('#nextWeek').addEventListener('click', function () {
      state.week = clamp(state.week + 1, 1, state.settings.totalWeeks);
      renderAll();
    });
    /* 彩蛋：连点 3 次 Logo */
    var logoBtn = $('#logoBtn'), logoHits = 0, logoTimer = 0;
    if (logoBtn) logoBtn.addEventListener('click', function () {
      logoHits++;
      clearTimeout(logoTimer);
      logoTimer = setTimeout(function () { logoHits = 0; }, 900);
      if (logoHits >= 3) { logoHits = 0; playEgg(); }
    });
    /* 周次：自定义下拉弹层 */
    var weekPickerBtn = $('#weekPickerBtn'), weekPop = $('#weekPop');
    function setWeekPop(open) {
      if (!weekPop || !weekPickerBtn) return;
      weekPop.hidden = !open;
      weekPickerBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    }
    if (weekPickerBtn) weekPickerBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      setWeekPop(weekPop.hidden);
    });
    if (weekPop) weekPop.addEventListener('click', function (e) {
      var b = e.target.closest('.week-btn');
      if (!b) return;
      state.week = clamp(parseInt(b.dataset.week, 10) || 1, WEEK_MIN, state.settings.totalWeeks);
      setWeekPop(false);
      renderAll();
    });
    /* 自定义学期总周数：在周次弹层里直接改，立即生效（默认 18 周，上限 60 周） */
    function applyTotalWeeks(raw) {
      var n = clamp(parseInt(raw, 10) || 0, WEEK_MIN, WEEK_MAX);
      var changed = n !== state.settings.totalWeeks;
      state.settings.totalWeeks = n;
      state.week = clamp(state.week, WEEK_MIN, n);
      save(); renderAll();
      var ti = $('#weekPopTotal');
      if (ti) ti.value = n;
      if (changed) toast('学期总周数已设为 ' + n + ' 周');
    }
    var wpTotal = $('#weekPopTotal'), wpApply = $('#weekPopApply');
    if (wpTotal) wpTotal.addEventListener('click', function (e) { e.stopPropagation(); });
    if (wpApply) wpApply.addEventListener('click', function (e) {
      e.stopPropagation();
      applyTotalWeeks(wpTotal && wpTotal.value);
    });
    if (wpTotal) wpTotal.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter') return;
      e.preventDefault(); e.stopPropagation();
      applyTotalWeeks(wpTotal.value);
    });
    document.addEventListener('click', function (e) {
      if (!weekPop || weekPop.hidden) return;
      if (e.target.closest('#weekPicker')) return;
      setWeekPop(false);
    });
    $('#todayBtn').addEventListener('click', function () {
      state.week = currentWeek();
      state.activeDay = todayIndex();
      renderAll();
      toast('已回到第 ' + state.week + ' 周');
    });

    /* 视图切换 */
    $$('.seg [data-view]').forEach(function (b) {
      b.addEventListener('click', function () {
        state.settings.view = b.dataset.view;
        resolveView();
        save();
        renderAll();
      });
    });

    /* 搜索 */
    var searchTimer = null;
    $('#searchInput').addEventListener('input', function () {
      var v = this.value;
      clearTimeout(searchTimer);
      searchTimer = setTimeout(function () { state.query = v; applySearch(); }, 120);
    });

    /* 视口变化时重新校准视图指示块 */
    window.addEventListener('resize', syncSegPill);

    /* 顶栏按钮 */
    $('#addBtn').addEventListener('click', function () { openCourseForm(null); });
    $('#settingsBtn').addEventListener('click', openSettings);
    /* 独立主题入口：主题风格弹层 */
    $('#themePanelBtn').addEventListener('click', function () {
      renderThemeRow();
      openModal('#themeModal');
    });
    $('#themeBtn').addEventListener('click', function () {
      var s = state.settings;
      if (s.theme === 'night') {
        s.theme = (s.lastLight && THEMES[s.lastLight]) ? s.lastLight : 'sakura';
      } else {
        s.lastLight = s.theme;
        s.theme = 'night';
      }
      applyTheme();
      renderThemeRow();
      flashTheme();
      save();
    });

    /* 月视图导航 */
    function shiftMonth(delta) {
      var base = state.monthCursor ? new Date(state.monthCursor) : new Date();
      state.monthCursor = new Date(base.getFullYear(), base.getMonth() + delta, 1).getTime();
      renderMonth();
    }
    $('#monthPrev').addEventListener('click', function () { shiftMonth(-1); });
    $('#monthNext').addEventListener('click', function () { shiftMonth(1); });
    $('#monthToday').addEventListener('click', function () {
      state.monthCursor = new Date(new Date().getFullYear(), new Date().getMonth(), 1).getTime();
      renderMonth();
    });
    $('#ioBtn').addEventListener('click', function () {
      $('#importResult').hidden = true;
      switchIoTab('in');
      openModal('#ioModal');
    });
    /* 首次引导里的「去导入我的课表」：关掉引导并直接打开导入面板 */
    var introImport = $('#introImportBtn');
    if (introImport) introImport.addEventListener('click', function () {
      closeModal($('#introModal'));
      $('#importResult').hidden = true;
      switchIoTab('in');
      openModal('#ioModal');
    });

    /* 上课闹铃：试听 / 开关 / 停止 / 详情 */
    var remindTest = $('#remindTestBtn');
    if (remindTest) remindTest.addEventListener('click', function () {
      requestNotify();
      if (ringAlarm(1)) toast('铃声试听完成，正式提醒会连响得更久');
      else toast('当前浏览器暂不允许播放声音，请稍后再试', 'error');
    });
    var remindSw = $('#sRemindOn');
    if (remindSw) remindSw.addEventListener('change', function () {
      if (remindSw.checked) requestNotify();
    });
    $('#alarmStopBtn').addEventListener('click', stopAlarm);
    $('#alarmDetailBtn').addEventListener('click', function () {
      var id = alarmCourseId;
      stopAlarm();
      if (id) showDetail(id);
    });
    /* 首次用户交互时静默解锁音频（绕开浏览器自动播放限制） */
    ['pointerdown', 'keydown', 'touchstart'].forEach(function (ev) {
      document.addEventListener(ev, function once() {
        unlockAudio();
        document.removeEventListener(ev, once);
      });
    });

    /* 网格空白 → 添加 */
    $('#ttGrid').addEventListener('click', function (e) {
      var slot = e.target.closest('.slot');
      if (!slot) return;
      openCourseForm(null, { day: +slot.dataset.day, period: +slot.dataset.period });
    });

    /* 关闭按钮：任意 [data-close]。刚打开的 260ms 内忽略点击，避免双击误关 */
    document.addEventListener('click', function (e) {
      var closer = e.target.closest('[data-close]');
      if (!closer) return;
      var m = closer.closest('.modal');
      if (!m) return;
      if (Date.now() - (m.__openedAt || 0) < 260) return;
      closeModal(m);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && openStack.length) { closeModal(); return; }
      if (e.key === 'Escape' && weekPop && !weekPop.hidden) { setWeekPop(false); return; }
      if (openStack.length) return;
      if (e.key === 'n' || e.key === 'N') { if (!/input|textarea|select/i.test(document.activeElement.tagName)) openCourseForm(null); }
      if (e.key === 'ArrowLeft' && document.activeElement === document.body) { $('#prevWeek').click(); }
      if (e.key === 'ArrowRight' && document.activeElement === document.body) { $('#nextWeek').click(); }
    });

    /* 确认弹层 */
    $('#confirmOk').addEventListener('click', function () {
      closeModal($('#confirmModal'));
      var fn = confirmHandler;
      confirmHandler = null;
      if (fn) fn();
    });

    /* 课程表单 */
    $('#kindRow').addEventListener('click', function (e) {
      var b = e.target.closest('[data-kind]');
      if (!b) return;
      formState.kind = b.dataset.kind;
      $$('#kindRow .chip').forEach(function (x) { x.classList.toggle('active', x === b); });
      syncKindUI();
    });
    $('#weekModeRow').addEventListener('click', function (e) {
      var b = e.target.closest('[data-wmode]');
      if (!b) return;
      formState.mode = b.dataset.wmode;
      $$('#weekModeRow .chip').forEach(function (x) { x.classList.toggle('active', x === b); });
      $('#rangeRow').hidden = formState.mode !== 'range';
      $('#weekGrid').hidden = formState.mode !== 'custom';
      if (formState.mode === 'custom' && !formState.custom.length) {
        /* 默认带入当前范围，避免一片空白 */
        var a = clamp(parseInt($('#fWeekFrom').value, 10) || 1, 1, state.settings.totalWeeks);
        var b = clamp(parseInt($('#fWeekTo').value, 10) || state.settings.totalWeeks, 1, state.settings.totalWeeks);
        formState.custom = range(Math.min(a, b), Math.max(a, b));
        buildWeekGrid();
      }
      updateWeekSummary();
    });
    $('#parityRow').addEventListener('click', function (e) {
      var b = e.target.closest('[data-parity]');
      if (!b) return;
      formState.parity = b.dataset.parity;
      $$('#parityRow .chip').forEach(function (x) { x.classList.toggle('active', x === b); });
      updateWeekSummary();
    });
    ['#fWeekFrom', '#fWeekTo'].forEach(function (sel) {
      $(sel).addEventListener('input', updateWeekSummary);
    });
    $('#fColor').addEventListener('input', function () {
      formState.color = this.value;
      $$('#swatchRow .swatch').forEach(function (x) { x.classList.remove('active'); });
    });
    $('#courseForm').addEventListener('submit', function (e) {
      e.preventDefault();
      saveCourseFromForm();
    });
    $('#courseDeleteBtn').addEventListener('click', function () {
      var id = $('#fId').value;
      var c = state.courses.find(function (x) { return x.id === id; });
      if (!c) return;
      askConfirm('确定要删除「' + c.name + '」吗？', function () {
        state.courses = state.courses.filter(function (x) { return x.id !== id; });
        save(); renderAll();
        toast('已删除「' + c.name + '」');
      });
    });
    $('#fStart').addEventListener('change', function () {
      if (+$('#fEnd').value < +this.value) $('#fEnd').value = this.value;
    });

    /* 设置表单 */
    var settingsInputs = ['#sStart', '#sTotal', '#sFirst', '#sCount', '#sDuration', '#sBreak', '#sNoonAfter', '#sNoonMin', '#sEveAfter', '#sEveMin'];
    settingsInputs.forEach(function (sel) {
      $(sel).addEventListener('input', renderPeriodPreview);
      $(sel).addEventListener('change', renderPeriodPreview);
    });
    $('#daySched').addEventListener('change', function (e) {
      var row = e.target.closest('.ds-row');
      if (!row) return;
      var on = row.querySelector('[data-ds-on]');
      row.classList.toggle('on', !!(on && on.checked));
      renderPeriodPreview();
    });
    $('#daySchedAllBtn').addEventListener('click', function () {
      $$('#daySched .ds-row').forEach(function (row) {
        var on = row.querySelector('[data-ds-on]');
        if (on) on.checked = false;
        row.classList.remove('on');
      });
      renderPeriodPreview();
      toast('已取消全部单独设置，点击「保存设置」后生效');
    });
    $('#settingsForm').addEventListener('submit', function (e) {
      e.preventDefault();
      var s = Object.assign({}, state.settings, readSettingsForm());
      if (s.noonAfter === s.eveningAfter) {
        toast('午休与晚休不能插在同一位置，已自动调整晚休位置', 'error');
        s.eveningAfter = Math.min(state.settings.periodCount, s.noonAfter + 1);
      }
      state.settings = s;
      state.week = clamp(state.week, 1, s.totalWeeks);
      save(); renderAll();
      closeModal($('#settingsModal'));
      toast('设置已保存');
    });
    $('#resetDemoBtn').addEventListener('click', function () {
      askConfirm('将用示例课表覆盖当前课程与设置，确定继续吗？', function () {
        state.settings = cloneSettings(DEFAULT_SETTINGS);
        state.courses = demoCourses();
        state.week = currentWeek();
        save(); renderAll();
        closeModal($('#settingsModal'));
        toast('已恢复示例课表');
      });
    });
    $('#clearAllBtn').addEventListener('click', function () {
      askConfirm('确定清空全部课程吗？此操作不可撤销。', function () {
        state.courses = [];
        save(); renderAll();
        closeModal($('#settingsModal'));
        toast('已清空全部课程');
      });
    });

    /* 导入导出 */
    $$('#ioModal .tab').forEach(function (b) {
      b.addEventListener('click', function () { switchIoTab(b.dataset.tab); });
    });
    var dropZone = $('#dropZone');
    dropZone.addEventListener('click', function () { $('#fileInput').click(); });
    dropZone.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') $('#fileInput').click(); });
    dropZone.addEventListener('dragover', function (e) { e.preventDefault(); dropZone.classList.add('is-over'); });
    dropZone.addEventListener('dragleave', function () { dropZone.classList.remove('is-over'); });
    dropZone.addEventListener('drop', function (e) {
      e.preventDefault();
      dropZone.classList.remove('is-over');
      readFiles(e.dataTransfer.files);
    });
    $('#fileInput').addEventListener('change', function () { readFiles(this.files); this.value = ''; });
    $('#pasteBtn').addEventListener('click', function () {
      handleImportText($('#pasteArea').value, '');
    });
    $$('#ioModal [data-imode]').forEach(function (b) {
      b.addEventListener('click', function () {
        state.importMode = b.dataset.imode;
        $$('#ioModal [data-imode]').forEach(function (x) { x.classList.toggle('active', x === b); });
      });
    });
    $$('#ioModal [data-idup]').forEach(function (b) {
      b.addEventListener('click', function () {
        state.dupMode = b.dataset.idup;
        $$('#ioModal [data-idup]').forEach(function (x) { x.classList.toggle('active', x === b); });
      });
    });
    $$('#ioModal [data-export]').forEach(function (b) {
      b.addEventListener('click', function () {
        var k = b.dataset.export;
        if (k === 'ics') { download(slug() + '.ics', buildIcsText(), 'text/calendar'); toast('已导出 iCalendar 文件'); }
        if (k === 'csv') { download(slug() + '.csv', buildCsvText(), 'text/csv'); toast('已导出 CSV 文件'); }
        if (k === 'json') {
          download(slug() + '.json', JSON.stringify({ app: 'sakura-timetable', version: 1, exportedAt: new Date().toISOString(), settings: state.settings, courses: state.courses }, null, 2), 'application/json');
          toast('已导出 JSON 备份');
        }
      });
    });
    $('#copyIcsBtn').addEventListener('click', function () {
      var text = buildIcsText();
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () { toast('ICS 文本已复制到剪贴板'); },
          function () { fallbackCopy(text); });
      } else fallbackCopy(text);

      function fallbackCopy(t) {
        var ta = document.createElement('textarea');
        ta.value = t;
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); toast('ICS 文本已复制'); }
        catch (e) { toast('复制失败，请改用导出文件', 'error'); }
        ta.remove();
      }
    });
    $('#sampleCsvBtn').addEventListener('click', function () {
      var sample = '\ufeff课程名称,教师,教室,星期,开始节次,结束节次,周次,备注\r\n' +
        '高等数学A,张明远,理科楼A203,周一,1,2,1-16,\r\n' +
        '数据结构,李思远,计算机楼C301,周二,1,2,1-18,期中考试第9周\r\n' +
        '数据结构实验,李思远,机房C402,周三,7,8,3-15单周,\r\n';
      download('课程表导入模板.csv', sample, 'text/csv');
      toast('已下载 CSV 模板');
    });
    $('#printBtn').addEventListener('click', function () { closeModal($('#ioModal')); setTimeout(function () { window.print(); }, 200); });

    /* 全局拖拽导入 */
    var dragDepth = 0;
    window.addEventListener('dragenter', function (e) {
      if (!e.dataTransfer || Array.prototype.indexOf.call(e.dataTransfer.types || [], 'Files') < 0) return;
      dragDepth++;
      $('#dropMask').classList.add('is-on');
    });
    window.addEventListener('dragover', function (e) { e.preventDefault(); });
    window.addEventListener('dragleave', function () {
      dragDepth = Math.max(0, dragDepth - 1);
      if (!dragDepth) $('#dropMask').classList.remove('is-on');
    });
    window.addEventListener('drop', function (e) {
      dragDepth = 0;
      $('#dropMask').classList.remove('is-on');
      if (e.target.closest('#dropZone')) return;
      e.preventDefault();
      readFiles(e.dataTransfer.files);
    });

    /* 尺寸变化：自动视图 */
    var rt = null;
    window.addEventListener('resize', function () {
      clearTimeout(rt);
      rt = setTimeout(function () {
        var before = state.view;
        resolveView();
        if (before !== state.view) { applyView(); renderGrid(); }
      }, 180);
    });

    /* 每分钟刷新「已上完 / 下节课」 */
    setInterval(function () {
      refreshPastStates();
      renderTodayBar();
    }, 60000);

    /* 每 20 秒检查一次上课闹铃 */
    setInterval(tickRemind, 20000);
  }

  /* ============ 初始化 ============ */
  function generatePetals() {
    var wrap = $('#petals');
    if (!wrap || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var count = window.innerWidth <= 700 ? 10 : 16;
    for (var i = 0; i < count; i++) {
      var p = el('span', 'petal');
      var size = 8 + Math.random() * 10;
      p.style.left = (Math.random() * 100) + '%';
      p.style.width = size + 'px';
      p.style.height = size + 'px';
      p.style.animationDuration = (11 + Math.random() * 12) + 's';
      p.style.animationDelay = (-Math.random() * 18) + 's';
      p.style.opacity = (0.35 + Math.random() * 0.45).toFixed(2);
      wrap.appendChild(p);
    }
  }

  function init() {
    var firstRun = !load();
    if (firstRun) {
      state.settings = cloneSettings(DEFAULT_SETTINGS);
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        state.settings.lastLight = 'sakura';
        state.settings.theme = 'night';
      }
      state.courses = demoCourses();
      save();
    }
    resolveView();
    state.week = currentWeek();
    state.activeDay = todayIndex();
    buildSelects();
    generatePetals();
    bind();
    renderAll();
    /* 首次打开：稍等布局稳定后再弹出导入 / 导出引导 */
    if (firstRun) setTimeout(showIntro, 650);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
