/* ==========================================================
   应用主逻辑：路由 / 渲染 / 交互
   ========================================================== */
(function () {
  'use strict';

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = window.HL.esc;

  var view = $('#view');
  var navEl = $('#nav');

  /* ---------------- 数据 ---------------- */
  function allTags() {
    var custom = window.Store.all().map(function (t) {
      var c = {};
      for (var k in t) c[k] = t[k];
      c.custom = true;
      return c;
    });
    return window.TAG_DATA.concat(custom);
  }
  function findTag(name) {
    var list = allTags(), n = String(name || '').toLowerCase();
    for (var i = 0; i < list.length; i++) if (list[i].n.toLowerCase() === n) return list[i];
    return null;
  }
  /* 内置数据 + 本地自定义数据（三类） */
  function markCustom(o) { var c = {}; for (var k in o) c[k] = o[k]; c.custom = true; return c; }
  function allCssProps() { return window.CSS_PROPS.concat(window.Store.list('css').map(markCustom)); }
  function allJsEntries() { return (window.JS_EXAMPLES || []).concat(window.Store.list('js').map(markCustom)); }
  function allMine() { return window.Store.list('mine').map(markCustom); }

  function findProp(name) {
    var list = allCssProps(), n = String(name || '');
    for (var i = 0; i < list.length; i++) if (list[i].n === n) return list[i];
    return null;
  }
  function findJsEntry(name) {
    var list = allJsEntries(), n = String(name || '').toLowerCase();
    for (var i = 0; i < list.length; i++) if (String(list[i].n || list[i].t || '').toLowerCase() === n) return list[i];
    return null;
  }
  function findMine(name) {
    var list = allMine(), n = String(name || '').toLowerCase();
    for (var i = 0; i < list.length; i++) if (String(list[i].n || '').toLowerCase() === n) return list[i];
    return null;
  }
  /* 名称 slug：用于 URL，保留中文并做编码 */
  function slug(n) { return encodeURIComponent(String(n || '')); }
  function badge(status) {
    var m = window.STATUS_META[status] || window.STATUS_META.ok;
    return '<span class="badge ' + m.cls + '">' + m.icon + ' ' + m.label + '</span>';
  }
  // 根据内容判断用 HTML 还是 CSS 高亮
  function smartHL(code) {
    if (!code) return '';
    return /^\s*[\w.#:*\[][^{]*\{|^\s*@/.test(code) && !/^\s*</.test(code)
      ? window.HL.css(code) : window.HL.html(code);
  }

  /* ---------------- 通用 UI ---------------- */
  var toastTimer;
  function toast(msg) {
    var t = $('#toast');
    t.textContent = msg;
    t.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.hidden = true; }, 2400);
  }

  var modalState = { onOk: null };
  function openModal(title, bodyHTML, footHTML, onOk) {
    $('#modalTitle').textContent = title;
    $('#modalBody').innerHTML = bodyHTML;
    $('#modalFoot').innerHTML = footHTML || '';
    modalState.onOk = onOk || null;
    $('#modal').hidden = false;
    setTimeout(function () {
      var f = $('#modalBody').querySelector('input,textarea,select');
      if (f) f.focus();
    }, 30);
  }
  function closeModal() { $('#modal').hidden = true; modalState.onOk = null; }
  $('#modal').addEventListener('click', function (e) {
    if (e.target.hasAttribute('data-close')) closeModal();
  });

  function download(filename, text) {
    var blob = new Blob([text], { type: 'application/json;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(url); a.remove(); }, 500);
  }
  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { toast('已复制到剪贴板'); }, fallback);
    } else fallback();
    function fallback() {
      var ta = document.createElement('textarea');
      ta.value = text; ta.style.position = 'fixed'; ta.style.left = '-9999px';
      document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); toast('已复制到剪贴板'); }
      catch (e) { toast('复制失败，请手动选择复制'); }
      ta.remove();
    }
  }

  /* ---------------- 演示组件 ---------------- */
  var demoSeq = 0;

  /* 把当前主题的计算结果抽成 CSS 变量串注入 iframe，
     让「实时预览」与整站配色、编辑器底色保持一致（旧的预览固定白底，深色主题下极割裂）。 */
  function themeVarsForPreview() {
    var cs = getComputedStyle(document.documentElement);
    var keys = ['--canvas', '--bg-elev', '--bg-soft', '--bg-code', '--text', '--text-soft', '--text-dim',
      '--border', '--border-st', '--accent', '--accent-2', '--accent-soft',
      '--ok', '--warn', '--danger', '--custom', '--info', '--mono', '--sans'];
    return keys.map(function (k) {
      return k + ':' + (cs.getPropertyValue(k) || '').trim().replace(/;+$/, '');
    }).join(';');
  }

  /* ---------------- 可编辑演示组件（HTML / CSS / JavaScript + 实时预览） ---------------- */
  var PANE_LANG = { html: 'HTML', css: 'CSS', js: 'JavaScript' };

  function demoBlock(editors, opts) {
    opts = opts || {};
    var id = opts.id || ('demo' + (++demoSeq));
    var hasJS = editors.some(function (e) { return e.key === 'js'; });
    // 默认占 40vh 左右，且不低于 320px；面板越多给得越高，避免被压扁
    var base = Math.round(clampNum(window.innerHeight * 0.4, 320, 520));
    var height = opts.height || (base + (editors.length > 1 ? (hasJS ? 120 : 60) : 0));
    height = Math.max(height, 320);

    var cols = editors.map(function (ed) {
      var cls = 'demo-pane pane-' + ed.key + (ed.collapsed ? ' is-collapsed' : '');
      var dot = ed.key === 'js' ? ' amber' : (ed.key === 'css' ? ' blue' : '');
      return '<section class="' + cls + '" data-pane="' + esc(ed.key) + '">' +
        '<div class="pane-head">' +
        '<button class="pane-fold" data-act="fold" title="折叠 / 展开" aria-label="折叠或展开 ' + esc(ed.label) + '"></button>' +
        '<span class="pane-title"><i class="' + dot.trim() + '"></i>' + esc(ed.label) + '</span>' +
        '<span class="pane-lang">' + (PANE_LANG[ed.key] || ed.key) + '</span>' +
        '<span class="pane-meta" data-role="meta">' + (ed.collapsed ? '点击展开' : '') + '</span>' +
        '</div>' +
        // 高亮浮层在前、textarea 在后：textarea 文字透明，颜色由浮层提供（见 paintHighlight）
        '<div class="pane-body">' +
        '<div class="ln" data-role="ln" aria-hidden="true"></div>' +
        '<pre class="hl-layer" data-role="hl" aria-hidden="true"></pre>' +
        '<textarea class="editor" spellcheck="false" ' +
        'data-role="' + esc(ed.key) + '" aria-label="' + esc(ed.label) + '">' + esc(ed.code || '') + '</textarea></div>' +
        '</section>';
    }).join('');

    /* 顶部工具条：换行 / 行号 / 字号 / 全屏 / 运行 —— 各项设置会记进 localStorage */
    var langs = editors.map(function (e) { return PANE_LANG[e.key] || e.key; }).join(' · ');
    var bar = '<div class="demo-bar">' +
      '<span class="bar-title"><i></i>代码编辑区</span>' +
      '<span class="small dim">' + esc(langs) + ' · 右边实时预览</span>' +
      '<span class="bar-acts">' +
      '<button class="btn-tog" data-act="wrap" title="代码自动换行（开启后行号自动隐藏）">⇥ 换行</button>' +
      '<button class="btn-tog" data-act="ln" title="显示行号（自动换行时不可用）"># 行号</button>' +
      '<button class="btn-tog keep" data-act="hl" title="代码语法高亮（每套主题一套配色）">✧ 高亮</button>' +
      '<span class="fs-group">' +
      '<button data-act="fsdown" title="减小字号（最小 12px）" aria-label="减小字号">&minus;</button>' +
      '<span class="fs-val" data-role="fsVal">13</span>' +
      '<button data-act="fsup" title="增大字号（最大 18px）" aria-label="增大字号">+</button>' +
      '</span>' +
      '<span class="bar-sep"></span>' +
      '<button class="btn-tog keep" data-act="full" title="全屏编辑（Esc 退出）">&#10530; 全屏</button>' +
      (opts.noActs ? '' :
        '<button class="btn-icon" data-act="reset" title="还原示例代码" aria-label="还原示例代码">&#8634;</button>' +
        '<button class="btn-icon" data-act="copy" title="复制代码" aria-label="复制代码">&#9113;</button>') +
      '<button class="btn-icon" data-act="rerun" title="重新运行（含 JavaScript）" aria-label="重新运行">&#10227;</button>' +
      '<button class="btn-icon" data-act="console" title="显示 / 隐藏控制台" aria-label="显示或隐藏控制台">&#9000;</button>' +
      '</span></div>';

    return '<div class="demo' + (opts.compact ? ' compact' : '') + '" data-demo="' + id + '"' +
      (opts.manual ? ' data-manual="1"' : '') +
      (opts.maxH ? ' data-maxh="' + opts.maxH + '"' : '') +
      ' style="--demo-h:' + height + 'px">' +
      bar +
      '<div class="demo-body">' +
      '<div class="demo-col">' + cols + '</div>' +
      '<div class="demo-resizer" data-role="resizer" role="separator" tabindex="0" ' +
      'aria-orientation="vertical" aria-label="拖动调整编辑区与预览区的比例" ' +
      'title="拖动调整比例（方向键微调 · Home 复位 · 双击复位）"></div>' +
      '<section class="demo-pane pane-preview">' +
      '<div class="pane-head"><span class="pane-title"><i class="green"></i>实时预览</span></div>' +
      '<div class="pane-body"><iframe class="preview-frame" data-role="preview" title="实时预览" ' +
      'sandbox="allow-scripts allow-modals allow-popups allow-forms"></iframe></div>' +
      '</section>' +
      '</div>' +
      '<div class="demo-foot">' +
      '<span class="sync" data-role="sync"><i></i><span data-role="syncTxt">已同步</span></span>' +
      '<button class="log-chip" data-role="logs" hidden></button>' +
      '<span class="hint">拖动中间分隔条调占比 · 右下角 ⠿ 调高度 · Ctrl/⌘ + Enter 运行</span>' +
      '<button class="demo-grip" data-role="grip" title="拖动调整高度" aria-label="拖动调整高度"></button>' +
      '</div></div>';
  }

  /* ---------------- 演示区界面偏好：分栏比例 / 高度 / 换行 / 行号 / 字号（存 localStorage） ---------------- */
  var DUI = null;

  function clampNum(v, lo, hi, fb) {
    v = Number(v);
    if (!isFinite(v)) return fb;
    return Math.min(Math.max(v, lo), hi);
  }

  function loadDUI() {
    var u = (window.Store.settings().demoUI) || {};
    DUI = {
      split: clampNum(u.split, 18, 82, 50),      // 宽屏：编辑区占比 %
      splitV: clampNum(u.splitV, 20, 80, 56),    // 窄屏（上下堆叠）：编辑区占比 %
      fs: clampNum(u.fs, 12, 18, 13),            // 代码字号 px
      wrap: !!u.wrap,                            // 自动换行
      ln: !!u.ln,                                // 行号
      hl: u.hl !== false,                        // 语法高亮（默认开）
      h: Number(u.h) > 0 ? clampNum(u.h, 320, 1400, 0) : 0   // 手动拖过的高度（0 = 未设置）
    };
    return DUI;
  }

  var duiTimer;
  function saveDUI() {
    if (!DUI) return;
    clearTimeout(duiTimer);
    duiTimer = setTimeout(function () {
      window.Store.set('demoUI', {
        split: Math.round(DUI.split * 10) / 10,
        splitV: Math.round(DUI.splitV * 10) / 10,
        fs: Math.round(DUI.fs * 10) / 10,
        wrap: DUI.wrap, ln: DUI.ln, hl: DUI.hl, h: Math.round(DUI.h)
      });
    }, 240);
  }

  function applyDUI() {
    if (!DUI) loadDUI();
    var r = document.documentElement;
    r.style.setProperty('--demo-split', DUI.split + '%');
    r.style.setProperty('--demo-split-v', DUI.splitV + '%');
    r.style.setProperty('--code-fs', DUI.fs + 'px');
    r.classList.toggle('demo-wrap', DUI.wrap);
    r.classList.toggle('demo-ln', DUI.ln);
    r.classList.toggle('hl-off', !DUI.hl);
  }

  function demoSizes() {
    var s = window.Store.settings().demoSize;
    return s && typeof s === 'object' ? s : {};
  }
  function saveDemoSize(id, patch) {
    var all = demoSizes();
    var cur = all[id] || {};
    Object.keys(patch).forEach(function (k) { cur[k] = patch[k]; });
    all[id] = cur;
    window.Store.set('demoSize', all);
  }

  function isStackedLayout() { return window.matchMedia('(max-width: 768px)').matches; }

  function refreshDemoBars() {
    $$('[data-demo]').forEach(function (b) {
      if (typeof b.__syncBar === 'function') b.__syncBar();
    });
  }

  function metaOf(ed) {
    var head = ed.parentNode && ed.parentNode.previousElementSibling;
    return head ? head.querySelector('[data-role="meta"]') : null;
  }

  /* 行号槽：与 textarea 同字号同行高，滚动位置同步；开启换行时无法对齐，自动让位 */
  function paintLineNumbers(ed) {
    var body = ed.parentNode;
    var g = body ? body.querySelector('.ln') : null;
    if (!g) return;
    if (!DUI || !DUI.ln || DUI.wrap) {
      if (g.firstChild) { g.textContent = ''; g.removeAttribute('data-n'); }
      return;
    }
    var n = (ed.value || '').split('\n').length;
    if (g.getAttribute('data-n') !== String(n)) {
      var arr = new Array(n), i;
      for (i = 0; i < n; i++) arr[i] = i + 1;
      g.textContent = arr.join('\n');
      g.setAttribute('data-n', String(n));
    }
    g.scrollTop = ed.scrollTop;
  }

  /* ---------------- 编辑器语法高亮 ----------------
     做法：textarea 自身文字透明，下面铺一层 <pre class="hl-layer"> 渲染着色后的代码，
     一眼看去就是「编辑器自带高亮」。两者共享 CSS 里的同一组字体 / 行高 / 内边距变量，
     JS 只负责三件事：
       1. 内容变了 → 重新生成 token（按 rAF 合并，打字不掉帧）
       2. 编辑器滚动 → 浮层跟着滚
       3. 可视宽高变了（拖分隔条 / 改字号 / 折叠面板 / 窗口缩放）→ 同步尺寸
     滚动条会吃掉 textarea 的内容宽度，所以必须取 clientWidth / clientHeight，
     否则换行模式下浮层会和真身错行。颜色全部来自 --tk-* 主题变量，切主题即换配色。 */
  var HL_LANG = { html: 'html', css: 'css', js: 'js' };
  var hlRO = null;

  function hlLayerOf(ed) {
    var body = ed.parentNode;
    return body ? $('.hl-layer', body) : null;
  }

  function syncHighlightScroll(ed) {
    var layer = hlLayerOf(ed);
    if (!layer) return;
    layer.scrollTop = ed.scrollTop;
    layer.scrollLeft = ed.scrollLeft;
  }

  function syncHighlightSize(ed) {
    var layer = hlLayerOf(ed);
    if (!layer) return;
    // 面板折叠 / 尚未布局时 clientWidth 为 0，此时不动，等 ResizeObserver 唤醒
    if (!ed.clientWidth || !ed.clientHeight) return;
    layer.style.width = ed.clientWidth + 'px';
    layer.style.height = ed.clientHeight + 'px';
    syncHighlightScroll(ed);
  }

  function paintHighlight(ed) {
    if (!ed) return;
    var layer = hlLayerOf(ed);
    if (!layer) return;
    if (!window.HL) { layer.textContent = ''; return; }
    var lang = HL_LANG[ed.getAttribute('data-role')] || 'html';
    var v = ed.value || '';
    if (ed.__hlTxt !== v || ed.__hlLang !== lang) {
      ed.__hlTxt = v; ed.__hlLang = lang;
      // 末尾补一个换行，保证光标在最后一行的空行时也能对齐
      layer.innerHTML = window.HL.lang(lang, v) + '\n';
    }
    syncHighlightSize(ed);
  }

  function scheduleHighlight(ed) {
    if (ed.__hlTimer) return;
    function run() { ed.__hlTimer = 0; paintHighlight(ed); }
    ed.__hlTimer = window.requestAnimationFrame
      ? window.requestAnimationFrame(run) : setTimeout(run, 16);
  }

  function refreshHighlights(root) {
    $$('.editor', root || document).forEach(function (ed) { paintHighlight(ed); });
  }

  /* 编辑器尺寸一变（拖比例 / 全屏 / 折叠展开 / 窗口缩放）就要重新对齐浮层 */
  function observeHighlight(ed) {
    if (!window.ResizeObserver) return;
    if (!hlRO) {
      hlRO = new ResizeObserver(function (entries) {
        entries.forEach(function (en) {
          var el = en.target;
          if (el && el.tagName === 'TEXTAREA') { paintHighlight(el); }
        });
      });
    }
    hlRO.observe(ed);
  }

  /* 不支持 ResizeObserver 时的兜底：窗口尺寸变化后重排一次着色层 */
  var hlWinTimer;
  window.addEventListener('resize', function () {
    clearTimeout(hlWinTimer);
    hlWinTimer = setTimeout(function () { refreshHighlights(); }, 140);
  });

  function updateMeta(ed) {
    var meta = metaOf(ed);
    var v = ed.value || '';
    var lines = v ? v.split('\n').length : 0;
    if (meta) meta.textContent = lines + ' 行 · ' + v.length + ' 字';
    paintLineNumbers(ed);
    scheduleHighlight(ed);
  }

  function renderLogChip(box) {
    var chip = $('[data-role="logs"]', box);
    if (!chip) return;
    var st = box.__logs || { count: 0, errors: 0 };
    chip.hidden = !st.count;
    if (!st.count) return;
    chip.textContent = st.errors
      ? '⚠ ' + st.errors + ' 个错误' + (st.count > st.errors ? ' · ' + st.count + ' 条日志' : '')
      : '› ' + st.count + ' 条日志';
    chip.className = 'log-chip' + (st.errors ? ' bad' : '');
  }

  function bindDemos(root) {
    $$('[data-demo]', root).forEach(bindDemo);
  }

  function bindDemo(box) {
    if (box.dataset.bound === '1') return;
    box.dataset.bound = '1';

    var frame = $('[data-role="preview"]', box);
    if (!frame) return;
    var eds = $$('.editor', box);
    var id = box.getAttribute('data-demo');
    var syncTxt = $('[data-role="syncTxt"]', box);
    var seed = {};
    var debounce, statusTimer;

    eds.forEach(function (ed) {
      var key = ed.getAttribute('data-role');
      seed[key] = ed.value;
      ed.dataset.seed = ed.value;
      ed.addEventListener('scroll', function () {
        var g = ed.parentNode ? ed.parentNode.querySelector('.ln') : null;
        if (g) g.scrollTop = ed.scrollTop;
        syncHighlightScroll(ed);
      });
      if (!ed.closest('.demo-pane').classList.contains('is-collapsed')) updateMeta(ed);
      paintHighlight(ed);     // 首帧：先把着色层铺上
      observeHighlight(ed);   // 之后尺寸变化由 ResizeObserver 兜底
    });

    /* 恢复上次记录的尺寸：优先本演示自己的记录，其次用全局默认高度 */
    var dui = DUI || loadDUI();
    var own = demoSizes()[id] || {};
    if (own.h) { box.style.setProperty('--demo-h', own.h + 'px'); box.dataset.manual = '1'; }
    else if (dui.h) { box.style.setProperty('--demo-h', dui.h + 'px'); box.dataset.manual = '1'; }
    if (own.split) { box.style.setProperty('--demo-split', own.split + '%'); box.classList.add('is-split'); }
    if (own.splitV) { box.style.setProperty('--demo-split-v', own.splitV + '%'); box.classList.add('is-split'); }

    /* 按代码长度分配高度：短的面板不占太多空间，长的代码有足够可视区域 */
    if (eds.length > 1) {
      eds.forEach(function (ed) {
        var pane = ed.closest('.demo-pane');
        if (!pane) return;
        var lines = (ed.value || '').split('\n').length;
        pane.style.flexGrow = String(Math.min(Math.max(lines, 6), 26));
      });
    }

    function val(key) {
      var el = $('[data-role="' + key + '"]', box);
      return el ? el.value : '';
    }
    function toggleConsole(force) {
      var open = force === undefined ? box.dataset.consoleOpen !== '1' : !!force;
      box.dataset.consoleOpen = open ? '1' : '0';
      try { frame.contentWindow.postMessage({ demoCmd: 'console', open: open }, '*'); } catch (e) { }
    }

    function paint() {
      clearTimeout(statusTimer);
      box.classList.add('is-busy');
      if (syncTxt) syncTxt.textContent = '渲染中…';
      box.__logs = { count: 0, errors: 0 };
      renderLogChip(box);
      frame.srcdoc = window.HL.previewDoc({
        html: val('html'),
        css: val('css'),
        js: val('js'),
        id: id,
        vars: themeVarsForPreview(),
        mode: document.documentElement.getAttribute('data-mode') || 'light',
        storage: demoStore()[id] || {}
      });
      if (box.dataset.consoleOpen === '1') setTimeout(function () { toggleConsole(true); }, 60);
      statusTimer = setTimeout(function () {
        box.classList.remove('is-busy');
        if (syncTxt) syncTxt.textContent = '已同步';
      }, 300);
    }
    function schedule() {
      box.classList.add('is-busy');
      if (syncTxt) syncTxt.textContent = '编辑中…';
      clearTimeout(debounce);
      debounce = setTimeout(paint, 180);
    }

    eds.forEach(function (ed) {
      ed.addEventListener('input', function () { updateMeta(ed); schedule(); });
      ed.addEventListener('keydown', function (e) {
        if (e.key === 'Tab') {
          e.preventDefault();
          var s = this.selectionStart, en = this.selectionEnd;
          this.value = this.value.slice(0, s) + '  ' + this.value.slice(en);
          this.selectionStart = this.selectionEnd = s + 2;
          updateMeta(ed);
          schedule();
        } else if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'Enter')) {
          // Ctrl/⌘ + S 或 Ctrl/⌘ + Enter：立即运行（含 JavaScript）
          e.preventDefault();
          clearTimeout(debounce);
          paint();
          toast(e.key === 'Enter' ? '已运行' : '已刷新预览');
        }
      });
      // 失焦时立即同步，避免「我看完了但预览还是旧的」
      ed.addEventListener('blur', function () { clearTimeout(debounce); paint(); });
    });

    /* 编辑器折叠 / 展开：JS 面板默认收起，需要时再展开；点标题整行也能切换 */
    $$('[data-act="fold"]', box).forEach(function (btn) {
      var pane = btn.closest('.demo-pane');
      function toggle() {
        if (!pane) return;
        var collapsed = pane.classList.toggle('is-collapsed');
        var ed = $('.editor', pane);
        if (ed) {
          var m = metaOf(ed);
          if (m) m.textContent = collapsed ? '点击展开' : '';
          if (!collapsed) updateMeta(ed);
        }
      }
      btn.addEventListener('click', function (e) { e.stopPropagation(); toggle(); });
      if (pane && pane.querySelector('.pane-head')) {
        pane.querySelector('.pane-head').addEventListener('click', function (e) {
          if (e.target.closest('button')) return;   // 按钮自己处理
          if (e.target.closest('.pane-meta') && !pane.classList.contains('is-collapsed')) return;
          toggle();
        });
      }
    });

    var resetBtn = $('[data-act="reset"]', box);
    if (resetBtn) resetBtn.addEventListener('click', function () {
      eds.forEach(function (ed) {
        ed.value = seed[ed.getAttribute('data-role')];
        updateMeta(ed);
      });
      paint();
      toast('已还原为示例代码');
    });

    var copyBtn = $('[data-act="copy"]', box);
    if (copyBtn) copyBtn.addEventListener('click', function () {
      var parts = [];
      if (val('html')) parts.push(val('html'));
      if (val('css')) parts.push('/* ---- CSS ---- */\n' + val('css'));
      if (val('js')) parts.push('/* ---- JavaScript ---- */\n' + val('js'));
      copyText(parts.join('\n\n'));
    });

    var rerunBtn = $('[data-act="rerun"]', box);
    if (rerunBtn) rerunBtn.addEventListener('click', function () {
      // 重新装载文档：既能重跑 JS，也能打断意外的死循环
      try { frame.srcdoc = ''; } catch (e) { }
      setTimeout(paint, 30);
      toast('已重新运行');
    });

    var consoleBtn = $('[data-act="console"]', box);
    if (consoleBtn) consoleBtn.addEventListener('click', function () { toggleConsole(); });
    var logChip = $('[data-role="logs"]', box);
    if (logChip) logChip.addEventListener('click', function () { toggleConsole(); });

    /* ---- 顶部工具条：自动换行 / 行号 / 字号 / 全屏（全局偏好，写入 localStorage） ---- */
    function syncBar() {
      var w = $('[data-act="wrap"]', box), l = $('[data-act="ln"]', box), f = $('[data-act="full"]', box);
      var hBtn = $('[data-act="hl"]', box);
      if (hBtn) hBtn.classList.toggle('on', !!DUI.hl);
      if (w) w.classList.toggle('on', DUI.wrap);
      if (l) {
        l.classList.toggle('on', DUI.ln && !DUI.wrap);
        l.disabled = !!DUI.wrap;
      }
      var fv = $('[data-role="fsVal"]', box);
      if (fv) fv.textContent = String(Math.round(DUI.fs));
      if (f) {
        var on = box.classList.contains('is-full');
        f.classList.toggle('on', on);
        f.innerHTML = on ? '&#10531; 退出全屏' : '&#10530; 全屏';
      }
    }
    box.__syncBar = syncBar;
    syncBar();

    function repaintGutters() {
      $$('.editor', box).forEach(function (ed) {
        var g = ed.parentNode ? ed.parentNode.querySelector('.ln') : null;
        if (g) g.removeAttribute('data-n');
        paintLineNumbers(ed);
        syncHighlightSize(ed);   // 字号 / 换行 / 行号变化后重新对齐着色层
      });
    }

    var wrapBtn = $('[data-act="wrap"]', box);
    if (wrapBtn) wrapBtn.addEventListener('click', function () {
      DUI.wrap = !DUI.wrap;
      applyDUI(); saveDUI(); repaintGutters(); refreshDemoBars();
      toast(DUI.wrap ? '已开启自动换行（行号暂时隐藏）' : '已关闭自动换行');
    });

    var lnBtn = $('[data-act="ln"]', box);
    if (lnBtn) lnBtn.addEventListener('click', function () {
      if (DUI.wrap) { toast('自动换行时行号无法对齐，已暂时隐藏'); return; }
      DUI.ln = !DUI.ln;
      applyDUI(); saveDUI(); repaintGutters(); refreshDemoBars();
      toast(DUI.ln ? '已显示行号' : '已隐藏行号');
    });

    function stepFs(d) {
      var next = Math.round(clampNum(DUI.fs + d, 12, 18, DUI.fs) * 10) / 10;
      if (next === DUI.fs) { toast('字号范围 12–18px'); return; }
      DUI.fs = next;
      applyDUI(); saveDUI(); repaintGutters(); refreshDemoBars();
      toast('代码字号 ' + Math.round(DUI.fs) + 'px');
    }
    var hlBtn = $('[data-act="hl"]', box);
    if (hlBtn) hlBtn.addEventListener('click', function () {
      DUI.hl = !DUI.hl;
      applyDUI(); saveDUI(); repaintGutters(); refreshDemoBars();
      var ed = $$('.editor', box)[0];
      if (DUI.hl && ed) paintHighlight(ed);
      toast(DUI.hl ? '已开启语法高亮（配色跟随当前主题）' : '已关闭语法高亮');
    });

    var fsDown = $('[data-act="fsdown"]', box), fsUp = $('[data-act="fsup"]', box);
    if (fsDown) fsDown.addEventListener('click', function () { stepFs(-1); });
    if (fsUp) fsUp.addEventListener('click', function () { stepFs(1); });

    function setFull(on) {
      box.classList.toggle('is-full', on);
      document.documentElement.classList.toggle('demo-full-open', !!$('.demo.is-full'));
      syncBar();
      if (on) {
        var first = $$('.editor', box).filter(function (ed) {
          return !ed.closest('.demo-pane').classList.contains('is-collapsed');
        })[0];
        if (first) setTimeout(function () { try { first.focus(); } catch (e) { } }, 30);
      }
    }
    box.__setFull = setFull;
    var fullBtn = $('[data-act="full"]', box);
    if (fullBtn) fullBtn.addEventListener('click', function () {
      setFull(!box.classList.contains('is-full'));
    });

    /* ---- 中间分隔条：宽屏左右拖（col-resize），窄屏上下拖（row-resize） ---- */
    var resizer = $('[data-role="resizer"]', box);
    if (resizer) {
      resizer.setAttribute('aria-orientation', isStackedLayout() ? 'horizontal' : 'vertical');
      function setSplit(stacked, pct, size) {
        var lo = stacked ? 20 : 18, hi = stacked ? 80 : 82;
        if (size) {
          // 给预览区留出最小空间，避免拖到看不见
          var keep = stacked ? 150 : 170;
          hi = Math.min(hi, Math.max(lo + 1, (size - 8 - keep) / size * 100));
        }
        pct = Math.round(clampNum(pct, lo, hi, 50) * 10) / 10;
        if (stacked) { box.style.setProperty('--demo-split-v', pct + '%'); DUI.splitV = pct; }
        else { box.style.setProperty('--demo-split', pct + '%'); DUI.split = pct; }
        box.classList.add('is-split');
        resizer.setAttribute('aria-valuenow', String(Math.round(pct)));
        return pct;
      }
      function commit(stacked, pct) {
        saveDUI();
        var patch = {};
        if (stacked) patch.splitV = pct; else patch.split = pct;
        saveDemoSize(id, patch);
      }

      resizer.addEventListener('pointerdown', function (e) {
        if (e.button !== undefined && e.button !== 0) return;
        var body = $('.demo-body', box);
        if (!body) return;
        var rect = body.getBoundingClientRect();
        var stacked = isStackedLayout();
        var size = stacked ? rect.height : rect.width;
        var base = stacked ? rect.top : rect.left;
        if (!size) return;
        e.preventDefault();
        var last = 0;
        box.classList.add('is-resizing');
        document.documentElement.classList.add('demo-resizing');
        document.documentElement.classList.toggle('stacked', stacked);
        try { resizer.setPointerCapture(e.pointerId); } catch (err) { }

        function move(ev) {
          var pos = stacked ? ev.clientY : ev.clientX;
          last = setSplit(stacked, (pos - base) / size * 100, size);
        }
        function up(ev) {
          try { resizer.releasePointerCapture(ev.pointerId); } catch (err) { }
          document.removeEventListener('pointermove', move);
          document.removeEventListener('pointerup', up);
          document.removeEventListener('pointercancel', up);
          box.classList.remove('is-resizing');
          document.documentElement.classList.remove('demo-resizing', 'stacked');
          if (last) commit(stacked, last);
        }
        document.addEventListener('pointermove', move);
        document.addEventListener('pointerup', up);
        document.addEventListener('pointercancel', up);
      });

      function bodySize(stacked) {
        var b = $('.demo-body', box);
        if (!b) return 0;
        var r = b.getBoundingClientRect();
        return stacked ? r.height : r.width;
      }

      resizer.addEventListener('keydown', function (e) {
        var stacked = isStackedLayout();
        var cur = stacked ? DUI.splitV : DUI.split;
        var step = e.shiftKey ? 5 : 2;
        var next = null;
        if (stacked ? e.key === 'ArrowUp' : e.key === 'ArrowLeft') next = cur - step;
        else if (stacked ? e.key === 'ArrowDown' : e.key === 'ArrowRight') next = cur + step;
        else if (e.key === 'Home') next = 50;
        else if (e.key === 'End') next = stacked ? 80 : 82;
        else return;
        e.preventDefault();
        commit(stacked, setSplit(stacked, next, bodySize(stacked)));
      });

      resizer.addEventListener('dblclick', function () {
        var stacked = isStackedLayout();
        commit(stacked, setSplit(stacked, 50, bodySize(stacked)));
        toast('已恢复默认比例');
      });
    }

    /* 拖拽调整高度：编辑区与预览区共用同一个高度变量，永远对齐 */
    var grip = $('[data-role="grip"]', box);
    if (grip) {
      grip.addEventListener('pointerdown', function (e) {
        e.preventDefault();
        var startY = e.clientY;
        var bodyEl = $('.demo-body', box);
        var startH = parseFloat(box.style.getPropertyValue('--demo-h')) ||
          (bodyEl ? bodyEl.getBoundingClientRect().height : box.getBoundingClientRect().height);
        var minH = box.classList.contains('compact') ? 240 : 320;
        box.dataset.manual = '1';
        try { grip.setPointerCapture(e.pointerId); } catch (err) { }
        function move(ev) {
          var h = Math.min(Math.max(startH + ev.clientY - startY, minH), 1400);
          box.style.setProperty('--demo-h', h + 'px');
        }
        function up(ev) {
          try { grip.releasePointerCapture(ev.pointerId); } catch (err) { }
          document.removeEventListener('pointermove', move);
          document.removeEventListener('pointerup', up);
          var h = Math.round(parseFloat(box.style.getPropertyValue('--demo-h')) || 0);
          if (h) { DUI.h = clampNum(h, minH, 1400, 0); saveDUI(); saveDemoSize(id, { h: h }); }
        }
        document.addEventListener('pointermove', move);
        document.addEventListener('pointerup', up);
      });
    }

    box.addEventListener('demo:repaint', paint);
    paint();
  }

  /* 预览消息：高度上报 + 控制台日志计数 + 演示内的 localStorage 同步 */
  function demoStore() {
    var s = window.Store.settings();
    return s.demoStore && typeof s.demoStore === 'object' ? s.demoStore : {};
  }

  window.addEventListener('message', function (e) {
    var d = e.data;
    if (!d || !d.demoId) return;
    var box = document.querySelector('[data-demo="' + d.demoId + '"]');
    if (!box) return;

    if (d.storage) {
      var all = demoStore();
      all[d.demoId] = d.storage;
      window.Store.set('demoStore', all);
      return;
    }
    if (d.log) {
      var st = box.__logs || (box.__logs = { count: 0, errors: 0 });
      st.count = Math.max(st.count, d.log.count || 0);
      if (d.log.level === 'error') st.errors++;
      renderLogChip(box);
      return;
    }
    if (d.ready || typeof d.height !== 'number') return;
    if (box.dataset.manual === '1') return;
    var panes = box.querySelectorAll('.demo-col .demo-pane:not(.is-collapsed)').length || 1;
    var compact = box.classList.contains('compact');
    // 默认占 40vh 左右（且不低于 320px），面板越多给得越高，避免被压扁
    var minH = compact ? 280
      : Math.max(320, Math.round(clampNum(window.innerHeight * 0.4, 320, 520))) + (panes > 1 ? 60 : 0);
    var maxH = Number(box.getAttribute('data-maxh')) || 900;
    var h = Math.min(Math.max(Math.round(d.height), minH), maxH);
    var cur = parseFloat(box.style.getPropertyValue('--demo-h')) || 0;
    if (Math.abs(h - cur) > 6) box.style.setProperty('--demo-h', h + 'px');
  });


  /* ---------------- 内容入场动效 ----------------
     只给最外层、且不含演示区的卡片加，避免 transform 影响演示全屏定位。
     动画结束后一定把 .enter 摘掉：即便动画不推进，元素也会回到正常可见状态。 */
  var ENTER_SEL = '.hero, .page-head, .tile, .stat, .card';
  function initReveal() {
    if (reducedMotion || fxOff()) return;
    var set = $$(ENTER_SEL, view).filter(function (el) {
      if (el.querySelector('[data-demo]')) return false;
      for (var p = el.parentElement; p && p !== view; p = p.parentElement) {
        if (p.matches(ENTER_SEL)) return false;
      }
      return true;
    }).slice(0, 14);
    set.forEach(function (el, i) {
      var idx = Math.min(i, 8);
      el.style.setProperty('--i', idx);
      el.classList.add('enter');
      // 动画 460ms + 延迟 40ms×i，之后彻底摘掉类名
      setTimeout(function () { el.classList.remove('enter'); }, 520 + idx * 40);
    });
  }

  function afterRender() {
    bindDemos(view);
    initReveal();
    updateScrollUI();
  }

  function render(html) {
    // 离开页面时若还有全屏演示，先解锁页面滚动
    if ($('.demo.is-full')) document.documentElement.classList.remove('demo-full-open');
    view.innerHTML = html;
    afterRender();
    window.scrollTo(0, 0);
  }

  function crumbs(items) {
    var arr = [{ t: '首页', h: '#/' }].concat(items);
    return '<nav class="crumbs">' + arr.map(function (it, i) {
      var last = i === arr.length - 1;
      return (last ? '<span>' + esc(it.t) + '</span>'
        : '<a href="' + it.h + '">' + esc(it.t) + '</a>') + (last ? '' : '<span class="sep">›</span>');
    }).join('') + '</nav>';
  }

  /* ---------------- 页内大纲：严格 h1–h6 层级 ----------------
     nodes: [{ id, t, level(1..6), count, hay, mono }]（按文档顺序传入，扁平）

     严格规则（normOutline 保证）：
       ① 级别只允许 1–6（h1–h6）；
       ② 不允许跳级：子级最多比父级深一级，出现跳级会被拉平到 parent+1；
       ③ 最浅的一级统一当作 h1，大纲必定从 h1 起；
       ④ 同级自动编号：1 / 1.2 / 1.2.3；
       ⑤ 只展开当前阅读位置所在的分支（父级链 + 当前级），避免目录过长。
  ------------------------------------------------------------- */
  function normOutline(nodes) {
    var min = 6;
    nodes.forEach(function (n) { var lv = n.level || 1; if (lv < min) min = lv; });
    var shift = Math.max(0, min - 1);          // 把最浅的一层平移到 h1
    var out = [], stack = [], topN = 0;
    nodes.forEach(function (n) {
      var lv = Math.min(6, Math.max(1, (n.level || 1) - shift));
      if (lv > stack.length + 1) lv = stack.length + 1;   // ② 不允许跳级
      stack = stack.slice(0, lv - 1);
      var parent = stack.length ? stack[stack.length - 1] : null;
      var idx = parent ? (parent.nChild = (parent.nChild || 0) + 1) : (topN += 1);
      var node = {
        id: n.id, t: n.t, level: lv, count: n.count, hay: n.hay, mono: n.mono,
        parentId: parent ? parent.id : '',
        label: parent ? parent.label + '.' + idx : String(idx)
      };
      out.push(node);
      stack.push(node);
    });
    return out;
  }

  function outlineBlock(nodes, opts) {
    opts = opts || {};
    var list = normOutline(nodes || []);
    var items = list.map(function (n) {
      return '<button class="ol-item ol-l' + n.level + (n.mono ? ' ol-mono' : '') + '"' +
        ' data-jump="' + esc(n.id) + '" data-level="' + n.level + '"' +
        ' data-parent="' + esc(n.parentId) + '" data-hay="' + esc((n.hay || n.t).toLowerCase()) + '"' +
        ' title="h' + n.level + ' · ' + esc(n.t) + '"' +
        ' style="padding-left:' + (7 + (n.level - 1) * 13) + 'px">' +
        (n.level <= 2 ? '<span class="ol-n">' + esc(n.label) + '</span>' : '<span class="ol-dot"></span>') +
        '<span class="ol-t">' + esc(n.t) + '</span>' +
        (n.count !== undefined ? '<span class="ol-cnt" data-n="' + n.count + '">' + n.count + '</span>' : '') +
        '</button>';
    }).join('');
    var deep = 0, l1 = 0;
    list.forEach(function (n) { if (n.level > deep) deep = n.level; if (n.level === 1) l1++; });
    return '<aside class="outline" id="pageOutline" aria-label="页面大纲">' +
      '<div class="ol-head"><span class="ol-title">' + esc(opts.title || '本页大纲') + '</span>' +
      '<span class="ol-total">h1–h' + deep + ' · ' + list.length + (l1 > 1 ? ' 条' : ' 项') + '</span></div>' +
      '<div class="ol-body">' + items + '</div>' +
      '<div class="ol-foot"><button class="ol-top" id="olTop">↑ 回到顶部</button></div>' +
      '</aside>';
  }

  function outlinePage(outline, main) {
    return '<div class="page-with-outline">' + outline + '<div class="outline-main">' + main + '</div></div>';
  }

  var outlineSpy = null;
  function bindOutline() {
    var ol = $('#pageOutline');
    if (!ol) return;
    var items = $$('.ol-item', ol);
    var byId = {};
    items.forEach(function (b) { byId[b.getAttribute('data-jump')] = b; });

    function go(id) {
      var el = document.getElementById(id);
      if (!el) return;
      window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 76, behavior: 'smooth' });
      if (el.classList) {
        el.classList.remove('flash');
        void el.offsetWidth;
        el.classList.add('flash');
        setTimeout(function () { el.classList.remove('flash'); }, 1400);
      }
    }

    $$('[data-jump]', ol).forEach(function (b) {
      b.addEventListener('click', function () { go(b.getAttribute('data-jump')); });
    });
    var topBtn = $('#olTop', ol);
    if (topBtn) topBtn.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });

    /* 展开集合 = 当前节点的祖先链 + 当前节点自身；h1 恒显，作为目录骨架 */
    function paint(cur) {
      var open = {};
      if (cur) {
        open[cur.getAttribute('data-jump')] = 1;
        var p = cur.getAttribute('data-parent');
        var guard = 0;
        while (p && byId[p] && guard++ < 12) {
          open[p] = 1;
          p = byId[p].getAttribute('data-parent');
        }
      }
      items.forEach(function (b) {
        var id = b.getAttribute('data-jump');
        var lv = +b.getAttribute('data-level') || 1;
        var parent = b.getAttribute('data-parent');
        var vis = (lv === 1 || !parent || open[parent]) && b.getAttribute('data-nohit') !== '1';
        b.hidden = !vis;
        b.classList.toggle('on', b === cur);
        b.classList.toggle('anc', !!cur && b !== cur && open[id] === 1);
      });
    }

    function spy() {
      /* 路由切走之后自动摘掉监听，避免无意义的滚动计算 */
      if (!ol.isConnected) {
        window.removeEventListener('scroll', spy);
        if (outlineSpy === spy) outlineSpy = null;
        return;
      }
      var y = window.scrollY + 96;
      var cur = null;
      items.forEach(function (b) {
        var el = document.getElementById(b.getAttribute('data-jump'));
        if (!el || el.hidden || el.offsetParent === null) return;
        if (el.getBoundingClientRect().top + window.scrollY <= y) cur = b;
      });
      if (!cur) cur = items.filter(function (b) {
        var el = document.getElementById(b.getAttribute('data-jump'));
        return el && !el.hidden && el.offsetParent !== null;
      })[0];
      paint(cur);
    }
    if (outlineSpy) window.removeEventListener('scroll', outlineSpy);
    outlineSpy = spy;
    window.addEventListener('scroll', spy, { passive: true });
    spy();
  }

  /* 过滤时同步大纲：自底向上判断命中，父级没有任何命中后代时一并隐藏 */
  function syncOutlineFilter(q) {
    var ol = $('#pageOutline');
    if (!ol) return;
    var key = (q || '').trim().toLowerCase();
    var items = $$('.ol-item', ol);
    function lv(b) { return +b.getAttribute('data-level') || 1; }
    var hit = {};
    for (var i = items.length - 1; i >= 0; i--) {
      var b = items[i], id = b.getAttribute('data-jump');
      var self = !key || (b.getAttribute('data-hay') || '').indexOf(key) >= 0;
      var kid = false;
      for (var k = i + 1; k < items.length; k++) {
        var c = items[k];
        if (lv(c) <= lv(b)) break;                 // 遇到同级或更浅的，说明不是它的后代
        if (hit[c.getAttribute('data-jump')]) { kid = true; break; }
      }
      hit[id] = self || kid;
    }
    items.forEach(function (b, bi) {
      var id = b.getAttribute('data-jump');
      b.setAttribute('data-nohit', (key && !hit[id]) ? '1' : '0');
      var cnt = $('.ol-cnt', b);
      if (!cnt) return;
      var n = 0;
      if (key) {
        for (var k = bi + 1; k < items.length; k++) {
          var c = items[k];
          if (lv(c) <= lv(b)) break;
          if (lv(c) === lv(b) + 1 && hit[c.getAttribute('data-jump')]) n++;
        }
      }
      cnt.textContent = key ? n : (cnt.getAttribute('data-n') || cnt.textContent);
    });
    if (outlineSpy) outlineSpy();
  }

  /* ---------------- 导航 ---------------- */
  function buildNav(active) {
    var cats = window.TAG_CATS;
    var customCount = window.Store.all().length;
    var depCount = window.TAG_DATA.filter(function (t) { return t.s !== 'ok'; }).length;
    var jsCount = (window.JS_GROUPS || []).reduce(function (a, g) { return a + g.items.length; }, 0);

    function link(href, text, count, sub) {
      var on = decodeURIComponent(active || '') === decodeURIComponent(href);
      return '<a class="nav-link' + (on ? ' active' : '') + '" href="' + href + '"' +
        (sub ? ' style="padding-left:18px;font-size:13px"' : '') + '>' +
        '<span>' + esc(text) + '</span>' + (count !== undefined ? '<span class="cnt">' + count + '</span>' : '') + '</a>';
    }

    var html = '';
    html += '<div class="nav-section"><a class="nav-link' + (active === '#/' ? ' active' : '') + '" href="#/"><span>🏠 速查首页</span></a></div>';

    html += '<div class="nav-section"><div class="nav-title">HTML 标签</div>' +
      link('#/tags', '全部标签', allTags().length) +
      link('#/tags?status=deprecated', '已弃用 / 已废弃', depCount) +
      link('#/tags?custom=1', '自定义标签', customCount) +
      '<div class="nav-sub">' + cats.map(function (c) {
        var n = window.TAG_DATA.filter(function (t) { return t.c === c; }).length;
        return link('#/tags?cat=' + encodeURIComponent(c), c, n, true);
      }).join('') + '</div></div>';

    var propCats = window.CSS_PROP_CATS || [];
    var snipCats = window.CSS_SNIPPET_CATS || [];
    html += '<div class="nav-section"><div class="nav-title">CSS 速查</div>' +
      link('#/css', '总览') +
      link('#/css/selectors', '选择器') +
      link('#/css/box', '盒模型（可视化）') +
      link('#/css/flex', 'Flexbox 实验室') +
      link('#/css/grid', 'Grid 实验室') +
      link('#/css/position', '定位与层叠') +
      link('#/css/props', '属性速查表', allCssProps().length) +
      link('#/css/props?custom=1', '自定义属性', window.Store.count('css')) +
      '<div class="nav-sub">' + propCats.map(function (c) {
        var n = window.CSS_PROPS.filter(function (p) { return p.c === c; }).length;
        return link('#/css/props?cat=' + encodeURIComponent(c), c, n, true);
      }).join('') + '</div>' +
      link('#/css/snippets', '常用代码片段', window.CSS_SNIPPETS.length) +
      '<div class="nav-sub">' + snipCats.map(function (c) {
        var n = window.CSS_SNIPPETS.filter(function (s) { return s.c === c; }).length;
        return link('#/css/snippets?cat=' + encodeURIComponent(c), c, n, true);
      }).join('') + '</div>' +
      '</div>';

    var jsGroups = window.JS_GROUPS || [];
    html += '<div class="nav-section"><div class="nav-title">JavaScript</div>' +
      link('#/js', '语法 / DOM / 异步速查', jsCount) +
      '<div class="nav-sub">' + jsGroups.map(function (g, i) {
        return link('#/js?g=' + i, g.icon + ' ' + g.t, g.items.length, true);
      }).join('') + '</div>' +
      link('#/js?to=examples', '可运行实例', allJsEntries().length) +
      link('#/js?custom=1', '自定义 JS 条目', window.Store.count('js')) +
      '</div>';

    html += '<div class="nav-section"><div class="nav-title">我的内容</div>' +
      link('#/mine', '代码示例库', window.Store.count('mine')) +
      '</div>';

    html += '<div class="nav-section"><div class="nav-title">工具</div>' +
      link('#/play', '在线演练场') +
      link('#/manage', '数据管理') +
      link('#/help', '术语与快捷键') +
      '</div>';

    navEl.innerHTML = html;
  }

  /* ---------------- 首页 ---------------- */
  function viewHome() {
    var list = allTags();
    var dep = list.filter(function (t) { return t.s !== 'ok'; });
    var custom = list.filter(function (t) { return t.custom; });
    var popular = window.TAG_DATA.filter(function (t) { return t.p === 5; }).slice(0, 22);

    render(crumbs([]) + '<div class="hero">' +
      '<h1>HTML · CSS · JavaScript 速查表</h1>' +
      '<p>全量 HTML 标签 + ' + window.CSS_PROPS.length + ' 个常用 CSS 属性 + ' + window.JS_GROUPS.reduce(function (a, g) { return a + g.items.length; }, 0) +
      ' 条 JavaScript 写法速查。所有演示都支持 HTML / CSS / JavaScript 三栏编辑与实时预览，console 输出与报错可直接看到；' +
      '内置 ' + THEMES.length + ' 套配色主题（每套都带专属动态特效），也可以补充自己的 HTML 标签、CSS 属性、JS 条目与代码示例（数据保存在本地浏览器中）。</p>' +
      '<div class="chips">' +
      '<a class="chip on" href="#/tags">浏览全部标签</a>' +
      '<a class="chip" href="#/tags?status=deprecated">看看已弃用标签</a>' +
      '<a class="chip" href="#/css/props">CSS 属性表</a>' +
      '<a class="chip" href="#/js">JavaScript 速查</a>' +
      '<a class="chip" href="#/play">打开演练场</a>' +
      '</div>' +
      '<div class="stat-row">' +
      '<div class="stat"><div class="n">' + list.length + '</div><div class="l">标签总数</div></div>' +
      '<div class="stat"><div class="n">' + window.CSS_PROPS.length + '</div><div class="l">CSS 属性</div></div>' +
      '<div class="stat"><div class="n">' + window.JS_GROUPS.reduce(function (a, g) { return a + g.items.length; }, 0) + '</div><div class="l">JavaScript 写法</div></div>' +
      '<div class="stat"><div class="n">' + THEMES.length + '</div><div class="l">配色主题</div></div>' +
      '<div class="stat"><div class="n">' + custom.length + '</div><div class="l">自定义标签</div></div>' +
      '</div></div>' +

      '<div class="card-grid">' +
      '<a class="tile" href="#/tags"><div class="ic">🏷️</div><h3>HTML 标签速查</h3><p>表格化全量标签，按分类 / 状态 / 字母筛选，点击进详情页看属性与演示。</p></a>' +
      '<a class="tile" href="#/tags?status=deprecated"><div class="ic">⚠️</div><h3>已弃用标签专区</h3><p>标注弃用原因，给出推荐的现代替代方案与新旧写法对照。</p></a>' +
      '<a class="tile" href="#/css/box"><div class="ic">📦</div><h3>盒模型可视化</h3><p>拖动滑块观察 margin / border / padding / content 的变化。</p></a>' +
      '<a class="tile" href="#/css/flex"><div class="ic">🧩</div><h3>Flex / Grid 实验室</h3><p>点选参数即时查看布局效果，直观理解对齐与分配规则。</p></a>' +
      '<a class="tile" href="#/css/snippets"><div class="ic">⚡</div><h3>常用代码片段</h3><p>居中、截断、卡片网格、毛玻璃… 一键复制，每段都能直接跑出效果。</p></a>' +
      '<a class="tile" href="#/js"><div class="ic">🟨</div><h3>JavaScript 速查</h3><p>变量 / 数组 / DOM / 事件 / 异步常用写法，带侧边大纲、10 组配套示例与 8 个综合实例。</p></a>' +
      '<a class="tile" href="#/play"><div class="ic">🧪</div><h3>在线演练场</h3><p>HTML + CSS + JavaScript 混写，也可分栏编辑，左侧写右侧即时渲染。</p></a>' +
      '<a class="tile" href="#/manage"><div class="ic">💾</div><h3>自定义内容与数据</h3><p>补充自己的 HTML 标签、CSS 属性、JS 条目，支持编辑删除与 JSON 导入导出。</p></a>' +
      '<a class="tile" href="#/mine"><div class="ic">📦</div><h3>我的代码示例库</h3><p>把常用的 HTML / CSS / JS 片段存进来，打开即三栏编辑 + 实时预览。</p></a>' +
      '</div>' +

      '<div class="card" style="margin-top:16px"><div class="card-head"><h3>常用标签</h3>' +
      '<a class="small" href="#/tags">查看全部 →</a></div>' +
      '<div class="tag-cloud">' + popular.map(function (t) {
        return '<a class="tag-pill" href="#/tag/' + t.n + '">&lt;' + t.n + '&gt;</a>';
      }).join('') + '</div></div>');
  }

  /* ---------------- 标签列表 ---------------- */
  var tagState = { cat: '', status: 'all', q: '', sort: 'p', dir: 'desc' };

  function viewTags(params) {
    tagState.cat = params.cat || '';
    tagState.q = params.q || '';
    tagState.status = params.custom ? 'custom' : (params.status || 'all');

    var all = allTags();
    var list = filterTags(all, tagState);
    list = sortTags(list, tagState.sort, tagState.dir);

    var catOpts = ['<option value="">全部分类</option>'].concat(window.TAG_CATS.map(function (c) {
      return '<option value="' + esc(c) + '"' + (tagState.cat === c ? ' selected' : '') + '>' + esc(c) + '</option>';
    })).join('');

    var head = '<div class="page-head">' +
      '<h1 class="page-title">HTML 标签速查表' +
      (tagState.status === 'deprecated' ? ' <span class="badge dep">⚠️ 仅看弃用/废弃</span>' : '') +
      (tagState.status === 'custom' ? ' <span class="badge custom">✦ 仅看自定义</span>' : '') +
      (tagState.q ? ' <span class="badge plain">🔍 ' + esc(tagState.q) + '</span>' : '') +
      '</h1>' +
      '<p class="page-sub" id="tagsCount">共 ' + list.length + ' 个标签 · 点击标签名查看详细说明、属性表与实时演示</p></div>';

    var toolbar = '<div class="toolbar">' +
      '<div class="field"><input class="input" id="fQ" style="width:190px" placeholder="本页内过滤（名称/说明/属性）" value="' + esc(tagState.q) + '"></div>' +
      '<div class="field"><label>分类</label><select id="fCat">' + catOpts + '</select></div>' +
      '<div class="field"><label>状态</label><select id="fStatus">' +
      ['all:全部', 'ok:仅现行', 'deprecated:仅弃用/废弃', 'custom:仅自定义'].map(function (s) {
        var v = s.split(':')[0], t = s.split(':')[1];
        return '<option value="' + v + '"' + (tagState.status === v ? ' selected' : '') + '>' + t + '</option>';
      }).join('') + '</select></div>' +
      '<div class="field"><label>排序</label><select id="fSort">' +
      [['p', '按常用度'], ['n', '按字母'], ['c', '按分类'], ['s', '按状态']].map(function (o) {
        return '<option value="' + o[0] + '"' + (tagState.sort === o[0] ? ' selected' : '') + '>' + o[1] + '</option>';
      }).join('') + '</select></div>' +
      '<button class="btn sm" id="fDir">' + (tagState.dir === 'asc' ? '↑ 升序' : '↓ 降序') + '</button>' +
      '<span style="flex:1"></span>' +
      '<button class="btn sm" id="btnAdd">＋ 添加自定义标签</button>' +
      '</div>';

    var rows = list.map(tagRow).join('');

    var table = '<div class="table-wrap"><table class="grid wide"><thead><tr>' +
      '<th data-sort="n">标签名 <span class="arrow">↕</span></th>' +
      '<th class="nosort">中文说明</th>' +
      '<th data-sort="c">分类 <span class="arrow">↕</span></th>' +
      '<th data-sort="s">状态 <span class="arrow">↕</span></th>' +
      '<th class="nosort">显示 / 闭合</th>' +
      '<th data-sort="p">常用度 <span class="arrow">↕</span></th>' +
      '<th class="nosort">操作</th>' +
      '</tr></thead><tbody id="tagsBody">' +
      (rows || '<tr class="empty-row"><td colspan="7">没有匹配的标签，试试更换筛选条件或<a href="#/tags">重置</a>。</td></tr>') +
      '</tbody></table></div>';

    var note = tagState.status === 'deprecated'
      ? '<div class="callout warn"><div class="ttl">⚠️ 关于已弃用 / 已废弃标签</div>' +
        '<div class="small">已弃用（Deprecated）：规范不推荐但仍可使用；已废弃（Obsolete）：规范已移除，不应再使用；' +
        '非标准（Non-standard）：浏览器自行实现，行为不稳定。每个标签详情页都给出了推荐的现代替代方案。</div></div>'
      : '';

    render(head + note + toolbar + table);

    $('#fQ').addEventListener('input', function () { tagState.q = this.value; refreshTags(); });
    $('#fCat').addEventListener('change', function () { tagState.cat = this.value; refreshTags(); });
    $('#fStatus').addEventListener('change', function () { tagState.status = this.value; refreshTags(); });
    $('#fSort').addEventListener('change', function () { tagState.sort = this.value; refreshTags(); });
    $('#fDir').addEventListener('click', function () {
      tagState.dir = tagState.dir === 'asc' ? 'desc' : 'asc'; refreshTags();
    });
    $('#btnAdd').addEventListener('click', function () { openTagForm(null); });

    $$('#view [data-sort]').forEach(function (th) {
      th.addEventListener('click', function () {
        var k = th.getAttribute('data-sort');
        if (tagState.sort === k) tagState.dir = tagState.dir === 'asc' ? 'desc' : 'asc';
        else { tagState.sort = k; tagState.dir = 'asc'; }
        refreshTags();
      });
    });
    bindTagRowActions();
  }

  function tagRow(t) {
    var rowCls = t.custom ? 'row-custom' : (t.s === 'obs' ? 'row-obs' : (t.s !== 'ok' ? 'row-dep' : ''));
    return '<tr class="' + rowCls + '">' +
      '<td class="tag-cell"><span class="tag-brackets">&lt;</span>' +
      '<a href="#/tag/' + encodeURIComponent(t.n) + '">' + esc(t.n) + '</a>' +
      '<span class="tag-brackets">&gt;</span></td>' +
      '<td>' + esc(t.d) + (t.custom ? ' <span class="badge custom">✦ 自定义</span>' : '') + '</td>' +
      '<td><a class="small" href="#/tags?cat=' + encodeURIComponent(t.c) + '">' + esc(t.c) + '</a></td>' +
      '<td>' + badge(t.s) + '</td>' +
      '<td class="small">' + displayLabel(t.dp) + (isVoid(t) ? ' · 自闭合' : '') + '</td>' +
      '<td class="small dim">' + '★'.repeat(t.p || 1) + '</td>' +
      '<td><div class="cell-actions">' +
      '<a class="btn sm" href="#/tag/' + encodeURIComponent(t.n) + '">演示</a>' +
      (t.custom ? '<button class="btn sm" data-edit="' + esc(t.n) + '">编辑</button>' +
        '<button class="btn sm danger" data-del="' + esc(t.n) + '">删除</button>' : '') +
      '</div></td></tr>';
  }

  function refreshTags() {
    var tbody = $('#tagsBody');
    if (!tbody) return rerenderTags();
    var list = sortTags(filterTags(allTags(), tagState), tagState.sort, tagState.dir);
    tbody.innerHTML = list.map(tagRow).join('') ||
      '<tr class="empty-row"><td colspan="7">没有匹配的标签，试试更换筛选条件或<a href="#/tags">重置</a>。</td></tr>';
    $('#tagsCount').textContent = '共 ' + list.length + ' 个标签 · 点击标签名查看详细说明、属性表与实时演示';
    var dirBtn = $('#fDir'); if (dirBtn) dirBtn.textContent = tagState.dir === 'asc' ? '↑ 升序' : '↓ 降序';
    var sortSel = $('#fSort'); if (sortSel) sortSel.value = tagState.sort;
    bindTagRowActions();
  }

  function rerenderTags() { route(); }

  function bindTagRowActions() {
    $$('#view [data-edit]').forEach(function (b) {
      b.addEventListener('click', function () { openTagForm(window.Store.get('tag', b.getAttribute('data-edit'))); });
    });
    $$('#view [data-del]').forEach(function (b) {
      b.addEventListener('click', function () {
        var n = b.getAttribute('data-del');
        openModal('删除自定义标签', '<p>确定删除自定义标签 <code class="inline">&lt;' + esc(n) + '&gt;</code> 吗？此操作不可撤销。</p>',
          '<button class="btn" data-close>取消</button><button class="btn danger" id="okDel">删除</button>',
          function () {
            window.Store.remove('tag', n);
            toast('已删除 <' + n + '>');
            buildNav(location.hash);
            refreshTags();
          });
      });
    });
  }

  var VOID = ['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'];
  function isVoid(t) {
    if (t.custom) return !!t.void;
    return VOID.indexOf(t.n) >= 0 || ['frame', 'basefont', 'isindex', 'plaintext', 'keygen', 'menuitem'].indexOf(t.n) >= 0;
  }
  function displayLabel(dp) {
    return ({ block: '块级', inline: '行内', 'inline-block': '行内块', 'table': '表格', 'none': '不渲染', 'list-item': '列表项' })[dp] || dp || '—';
  }

  function filterTags(list, st) {
    var q = (st.q || '').trim().toLowerCase();
    return list.filter(function (t) {
      if (st.cat && t.c !== st.cat) return false;
      if (st.status === 'ok' && t.s !== 'ok') return false;
      if (st.status === 'deprecated' && t.s === 'ok') return false;
      if (st.status === 'custom' && !t.custom) return false;
      if (q) {
        var hay = (t.n + ' ' + t.d + ' ' + t.c + ' ' + (t.u || '') + ' ' +
          (t.a || []).map(function (a) { return a.n + ' ' + (a.d || ''); }).join(' ')).toLowerCase();
        if (hay.indexOf(q) < 0) return false;
      }
      return true;
    });
  }
  function sortTags(list, key, dir) {
    var statusOrder = { ok: 0, dep: 1, nostd: 2, obs: 3 };
    var arr = list.slice();
    arr.sort(function (a, b) {
      var r = 0;
      if (key === 'n') r = a.n.localeCompare(b.n);
      else if (key === 'c') r = a.c.localeCompare(b.c, 'zh') || a.n.localeCompare(b.n);
      else if (key === 's') r = (statusOrder[a.s] || 0) - (statusOrder[b.s] || 0);
      else r = (a.p || 0) - (b.p || 0) || a.n.localeCompare(b.n);
      return dir === 'asc' ? r : -r;
    });
    return arr;
  }

  /* ---------------- 标签详情 ---------------- */
  function viewTag(name) {
    var t = findTag(name);
    if (!t) {
      render('<div class="card"><h2>未找到标签 &lt;' + esc(name) + '&gt;</h2>' +
        '<p class="muted">它也许已被废弃，或者你可以<a href="#/manage">添加为自定义标签</a>。</p></div>');
      return;
    }
    var meta = window.STATUS_META[t.s] || window.STATUS_META.ok;

    var head = crumbs([{ t: 'HTML 标签', h: '#/tags' }, { t: t.c, h: '#/tags?cat=' + encodeURIComponent(t.c) }, { t: '<' + t.n + '>' }]) +
      '<div class="page-head"><h1 class="page-title detail-title">' +
      '<span class="tg">&lt;' + esc(t.n) + '&gt;</span>' + badge(t.s) +
      (t.custom ? ' <span class="badge custom">✦ 自定义</span>' : '') +
      '</h1><p class="page-sub">' + esc(t.d) + '</p></div>';

    var kv = '<div class="kv-list">' +
      '<div class="kv"><div class="k">分类</div><div class="v">' + esc(t.c) + '</div></div>' +
      '<div class="kv"><div class="k">显示类型</div><div class="v">' + displayLabel(t.dp) + '</div></div>' +
      '<div class="kv"><div class="k">闭合方式</div><div class="v">' + (isVoid(t) ? '空元素（自闭合）' : '需闭合标签') + '</div></div>' +
      '<div class="kv"><div class="k">常用度</div><div class="v">' + '★'.repeat(t.p || 1) + '☆'.repeat(5 - (t.p || 1)) + '</div></div>' +
      '<div class="kv"><div class="k">规范状态</div><div class="v">' + meta.icon + ' ' + meta.label + '</div></div>' +
      '</div>';

    var usage = '<div class="card"><div class="card-head"><h3>功能说明</h3></div>' +
      '<p style="margin:0">' + esc(t.u || t.d) + '</p>' +
      '<div style="margin-top:14px">' + kv + '</div></div>';

    /* 弃用提示 */
    var depBlock = '';
    if (t.s !== 'ok') {
      var d = t.dep || {};
      depBlock = '<div class="card" style="border-color:color-mix(in srgb, var(--warn) 45%, var(--border))">' +
        '<div class="card-head"><h3>⚠️ 为什么不建议使用 &lt;' + esc(t.n) + '&gt;</h3></div>' +
        '<div class="callout bad"><div class="ttl">弃用 / 废弃原因</div><div class="small">' + esc(d.r || '该标签已不在现行规范中，请改用替代方案。') + '</div></div>' +
        '<div class="callout good"><div class="ttl">✅ 推荐的现代替代方案</div><div class="small">' + esc(d.a || '请使用语义化标签或 CSS 实现相同效果。') + '</div></div>' +
        (d.o || d.n ? '<div class="compare">' +
          '<div class="col bad"><div class="ch">✗ 旧写法（不推荐）</div><pre class="code">' + window.HL.html(d.o || '') + '</pre></div>' +
          '<div class="col good"><div class="ch">✓ 推荐写法</div><pre class="code">' + smartHL(d.n || '') + '</pre></div>' +
          '</div>' : '') +
        '</div>';
    }

    /* 属性表 */
    var attrs = t.a || [];
    var attrRows = attrs.map(function (a) {
      return '<tr>' +
        '<td><span class="attr-name">' + esc(a.n) + '</span>' + (a.r ? ' <span class="badge plain">必填</span>' : '') + '</td>' +
        '<td class="small mono">' + esc(a.v || '—') + '</td>' +
        '<td class="small">' + esc(a.d || '') + '</td>' +
        '<td class="small mono">' + (a.e ? '<code class="inline">' + esc(a.e) + '</code>' : '—') + '</td>' +
        '<td>' + (a.s && a.s !== 'ok' ? badge(a.s) : '<span class="badge ok">✅ 现行</span>') + '</td>' +
        '</tr>';
    }).join('');
    var attrCard = '<div class="card"><div class="card-head"><h3>属性（参数）</h3>' +
      '<span class="small dim">共 ' + attrs.length + ' 项</span></div>' +
      (attrs.length ? '<div class="table-wrap"><table class="grid wide"><thead><tr>' +
        '<th class="nosort">属性名</th><th class="nosort">取值</th><th class="nosort">说明</th>' +
        '<th class="nosort">示例</th><th class="nosort">状态</th></tr></thead><tbody>' + attrRows + '</tbody></table></div>'
        : '<p class="muted small">该标签没有专属属性，使用全局属性即可（如 class、id、style、title、data-*、aria-*）。</p>') +
      '</div>';

    /* 演示 */
    /* 演示（HTML / CSS / JavaScript 三栏，右侧实时预览） */
    var jsSeed = (window.TAG_JS_DEMOS || {})[t.n] || t.js || '';
    var editors = [{ label: 'HTML 结构（可编辑）', key: 'html', code: t.demo || ('<' + t.n + '>示例内容</' + t.n + '>') }];
    if (t.css) editors.push({ label: 'CSS 样式（可编辑）', key: 'css', code: t.css });
    editors.push({ label: 'JavaScript（可编辑，可留空）', key: 'js', code: jsSeed, collapsed: !jsSeed });
    var demoCard = '<div class="card"><div class="card-head"><h3>实时演示</h3>' +
      '<span class="small dim">左边改代码右边即时生效；JavaScript 面板可写脚本，console 输出与报错看控制台</span></div>' +
      demoBlock(editors, { id: 'tag-' + t.n }) + '</div>';

    /* 导航 */
    var siblings = window.TAG_DATA.filter(function (x) { return x.c === t.c && x.n !== t.n; }).slice(0, 12);
    var navCard = '<div class="card"><div class="card-head"><h3>同分类标签</h3></div><div class="tag-cloud">' +
      siblings.map(function (x) { return '<a class="tag-pill" href="#/tag/' + x.n + '">&lt;' + x.n + '&gt;</a>'; }).join('') +
      '</div></div>';

    var actions = t.custom
      ? '<div class="card"><div class="card-head"><h3>自定义标签操作</h3></div>' +
        '<div class="chips"><button class="btn" id="editThis">编辑此标签</button>' +
        '<button class="btn danger" id="delThis">删除此标签</button></div></div>' : '';

    render(head + usage + depBlock + attrCard + demoCard + navCard + actions);

    if (t.custom) {
      $('#editThis').addEventListener('click', function () { openTagForm(t); });
      $('#delThis').addEventListener('click', function () {
        openModal('删除自定义标签', '<p>确定删除 <code class="inline">&lt;' + esc(t.n) + '&gt;</code>？</p>',
          '<button class="btn" data-close>取消</button><button class="btn danger" id="okDel">删除</button>',
          function () { window.Store.remove('tag', t.n); toast('已删除'); closeModal(); location.hash = '#/tags'; });
      });
    }
  }

  /* ---------------- 自定义标签表单 ---------------- */
  function openTagForm(existing) {
    var editing = !!existing;
    var t = existing || { n: '', c: '自定义', s: 'ok', dp: 'block', p: 3, d: '', u: '', a: [], demo: '', css: '', js: '' };
    var cats = window.TAG_CATS.concat(['自定义']).filter(function (v, i, a) { return a.indexOf(v) === i; });

    var body = '<div class="form-grid">' +
      '<div class="form-row"><label>标签名 *</label>' +
      '<input class="input" id="tfName" placeholder="例如：my-card" value="' + esc(t.n) + '"' + (editing ? ' readonly' : '') + '>' +
      '<span class="hint">字母开头，仅含字母 / 数字 / 连字符，不能与内置标签重名</span></div>' +
      '<div class="form-row"><label>分类</label><select id="tfCat">' +
      cats.map(function (c) { return '<option' + (t.c === c ? ' selected' : '') + '>' + esc(c) + '</option>'; }).join('') + '</select></div>' +
      '<div class="form-row full"><label>中文说明（一句话）*</label>' +
      '<input class="input" id="tfDesc" placeholder="例如：自定义卡片容器" value="' + esc(t.d) + '"></div>' +
      '<div class="form-row"><label>状态标记</label><select id="tfStatus">' +
      [['ok', '✅ 现行'], ['dep', '⚠️ 已弃用'], ['obs', '❌ 已废弃'], ['nostd', '🧪 非标准']].map(function (o) {
        return '<option value="' + o[0] + '"' + (t.s === o[0] ? ' selected' : '') + '>' + o[1] + '</option>';
      }).join('') + '</select></div>' +
      '<div class="form-row"><label>显示类型</label><select id="tfDp">' +
      ['block', 'inline', 'inline-block', 'table', 'list-item', 'none'].map(function (o) {
        return '<option value="' + o + '"' + (t.dp === o ? ' selected' : '') + '>' + displayLabel(o) + '</option>';
      }).join('') + '</select></div>' +
      '<div class="form-row"><label>常用度</label><select id="tfP">' +
      [1, 2, 3, 4, 5].map(function (o) {
        return '<option value="' + o + '"' + (t.p === o ? ' selected' : '') + '>' + '★'.repeat(o) + '</option>';
      }).join('') + '</select></div>' +
      '<div class="form-row"><label>是否空元素（自闭合）</label><select id="tfVoid">' +
      ['<option value="0"' + (!t.void ? ' selected' : '') + '>否</option>',
       '<option value="1"' + (t.void ? ' selected' : '') + '>是</option>'].join('') + '</select></div>' +
      '<div class="form-row full"><label>详细功能说明</label>' +
      '<textarea class="input" id="tfUsage" rows="3" placeholder="典型使用场景、注意事项…">' + esc(t.u || '') + '</textarea></div>' +
      '<div class="form-row full"><label>属性 / 参数</label>' +
      '<div class="attr-editor" id="tfAttrs"></div>' +
      '<button class="btn sm" id="tfAddAttr" style="justify-self:start">＋ 添加一条属性</button></div>' +
      '<div class="form-row full"><label>示例代码</label>' +
      '<textarea class="input mono" id="tfDemo" rows="6" placeholder="<my-card>内容</my-card>">' + esc(t.demo || '') + '</textarea></div>' +
      '<div class="form-row full"><label>示例样式（CSS，可留空）</label>' +
      '<textarea class="input mono" id="tfCss" rows="4" placeholder="my-card { display: block; }">' + esc(t.css || '') + '</textarea></div>' +
      '<div class="form-row full"><label>示例脚本（JavaScript，可留空）</label>' +
      '<textarea class="input mono" id="tfJs" rows="4" placeholder="document.querySelector(&#39;my-card&#39;).onclick = () =&gt; console.log(&#39;clicked&#39;)">' +
      esc(t.js || '') + '</textarea></div>' +
      '<div class="form-row full"><div class="err" id="tfErr"></div></div>' +
      '</div>';

    var foot = '<button class="btn" data-close>取消</button>' +
      '<button class="btn primary" id="tfSave">' + (editing ? '保存修改' : '添加标签') + '</button>';

    openModal((editing ? '编辑自定义标签 <' + t.n + '>' : '添加自定义标签'), body, foot, null);

    var attrWrap = $('#tfAttrs');
    function addAttrRow(a) {
      a = a || {};
      var row = document.createElement('div');
      row.className = 'attr-row';
      row.innerHTML = '<input class="input" placeholder="属性名" value="' + esc(a.n || '') + '">' +
        '<input class="input" placeholder="取值 / 类型" value="' + esc(a.v || '') + '">' +
        '<input class="input" placeholder="示例，如 href=&quot;…&quot;" value="' + esc(a.e || '') + '">' +
        '<button class="btn sm danger" type="button">删除</button>';
      row.querySelector('button').addEventListener('click', function () { row.remove(); });
      attrWrap.appendChild(row);
    }
    (t.a || []).forEach(addAttrRow);
    if (!(t.a || []).length) addAttrRow({});
    $('#tfAddAttr').addEventListener('click', function () { addAttrRow({}); });

    $('#tfSave').addEventListener('click', function () {
      var name = $('#tfName').value.trim().toLowerCase();
      var desc = $('#tfDesc').value.trim();
      var err = $('#tfErr');
      if (!editing) {
        var v = window.Store.validateName('tag', name);
        if (v) { err.textContent = v; return; }
      }
      if (!desc) { err.textContent = '请填写中文说明'; return; }

      var attrs = $$('.attr-row', attrWrap).map(function (row) {
        var ins = $$('input', row);
        return { n: ins[0].value.trim(), v: ins[1].value.trim(), e: ins[2].value.trim(), d: '' };
      }).filter(function (a) { return a.n; });

      var payload = {
        n: name,
        d: desc,
        c: $('#tfCat').value,
        s: $('#tfStatus').value,
        dp: $('#tfDp').value,
        p: Number($('#tfP').value),
        void: $('#tfVoid').value === '1',
        u: $('#tfUsage').value,
        a: attrs,
        demo: $('#tfDemo').value,
        css: $('#tfCss').value,
        js: $('#tfJs').value,
        dep: null,
        custom: true,
        updatedAt: new Date().toISOString()
      };
      var ok = editing ? window.Store.update('tag', t.n, payload) : window.Store.add('tag', payload);
      if (!ok) { err.textContent = '保存失败：浏览器存储不可用（可能是隐私模式）'; return; }
      toast(editing ? '已保存修改' : '已添加 <' + name + '>');
      closeModal();
      buildNav(location.hash);
      if (!editing) {
        location.hash = '#/tag/' + encodeURIComponent(name);
      } else if (location.hash.indexOf('#/tags') === 0 || location.hash.indexOf('#/manage') === 0) {
        route();
      } else {
        location.hash = '#/tag/' + encodeURIComponent(name);
      }
    });
  }

  /* ---------------- 通用：可增删的「键值对」行编辑器 ----------------
     cols: 每行输入框数；ph: 占位符数组；rows: 初始值数组
  ---------------------------------------------------- */
  function kvEditor(hostId, cols, ph, rows, addBtnId) {
    var wrap = document.getElementById(hostId);
    function addRow(a) {
      a = a || {};
      var row = document.createElement('div');
      row.className = 'attr-row c' + cols;
      var html = '';
      for (var i = 0; i < cols; i++) {
        var key = i === 0 ? 'v' : (i === 1 ? 'd' : 'e');
        html += '<input class="input" placeholder="' + esc(ph[i] || '') + '" value="' + esc(a[key] || '') + '">';
      }
      html += '<button class="btn sm danger" type="button">删除</button>';
      row.innerHTML = html;
      row.querySelector('button').addEventListener('click', function () { row.remove(); });
      wrap.appendChild(row);
    }
    (rows || []).forEach(addRow);
    if (!(rows || []).length) addRow({});
    if (addBtnId) document.getElementById(addBtnId).addEventListener('click', function () { addRow({}); });
    return function () {
      return $$('.attr-row', wrap).map(function (row) {
        var ins = $$('input', row);
        return { v: ins[0].value.trim(), d: ins[1] ? ins[1].value.trim() : '', e: ins[2] ? ins[2].value.trim() : '' };
      }).filter(function (o) { return o.v; });
    };
  }

  function uniqArr(arr) {
    return arr.filter(function (v, i, a) { return v && a.indexOf(v) === i; });
  }

  /* ---------------- 自定义 CSS 属性表单 ---------------- */
  function openCssForm(existing, presetName) {
    var editing = !!existing;
    var p = existing || {
      n: presetName || '', c: '自定义', d: '', v: '', def: '', inherit: '否',
      animatable: '否', syntax: '', note: '', vals: [], demo: '', css: '', js: ''
    };
    var cats = uniqArr((window.CSS_PROP_CATS || []).concat(['自定义', p.c]));

    var body = '<div class="form-grid">' +
      '<div class="form-row"><label>属性名 *</label>' +
      '<input class="input mono" id="cfName" placeholder="例如：my-gap" value="' + esc(p.n) + '"' + (editing ? ' readonly' : '') + '>' +
      '<span class="hint">只能包含字母 / 数字 / 连字符，不能与内置属性重名</span></div>' +
      '<div class="form-row"><label>分类</label><select id="cfCat">' +
      cats.map(function (c) { return '<option' + (p.c === c ? ' selected' : '') + '>' + esc(c) + '</option>'; }).join('') + '</select></div>' +
      '<div class="form-row full"><label>一句话说明 *</label>' +
      '<input class="input" id="cfDesc" placeholder="例如：栅格间距（行间距 列间距）" value="' + esc(p.d) + '"></div>' +
      '<div class="form-row"><label>常用取值</label>' +
      '<input class="input mono" id="cfVals" placeholder="例如：10px | 1rem 2rem" value="' + esc(p.v || '') + '"></div>' +
      '<div class="form-row"><label>默认值</label>' +
      '<input class="input mono" id="cfDef" placeholder="例如：normal" value="' + esc(p.def || '') + '"></div>' +
      '<div class="form-row"><label>是否继承</label><select id="cfInherit">' +
      ['否', '是'].map(function (o) { return '<option' + (p.inherit === o ? ' selected' : '') + '>' + o + '</option>'; }).join('') + '</select></div>' +
      '<div class="form-row"><label>是否可动画</label><select id="cfAnim">' +
      ['否', '是'].map(function (o) { return '<option' + (p.animatable === o ? ' selected' : '') + '>' + o + '</option>'; }).join('') + '</select></div>' +
      '<div class="form-row full"><label>语法</label>' +
      '<input class="input mono" id="cfSyntax" placeholder="例如：my-gap: &lt;长度&gt;;" value="' + esc(p.syntax || '') + '"></div>' +
      '<div class="form-row full"><label>注意事项（可留空）</label>' +
      '<textarea class="input" id="cfNote" rows="2" placeholder="兼容性、常见坑…">' + esc(p.note || '') + '</textarea></div>' +
      '<div class="form-row full"><label>取值说明（可留空）</label>' +
      '<div class="attr-editor" id="cfValsTable"></div>' +
      '<button class="btn sm" id="cfAddVal" style="justify-self:start">＋ 添加一条取值</button></div>' +
      '<div class="form-row full"><label>示例 HTML</label>' +
      '<textarea class="input mono" id="cfDemo" rows="4" placeholder="&lt;div class=&quot;box&quot;&gt;…&lt;/div&gt;">' + esc(p.demo || '') + '</textarea></div>' +
      '<div class="form-row full"><label>示例 CSS</label>' +
      '<textarea class="input mono" id="cfCss" rows="4" placeholder=".box { my-gap: 12px; }">' + esc(p.css || '') + '</textarea></div>' +
      '<div class="form-row full"><label>示例 JavaScript（可留空）</label>' +
      '<textarea class="input mono" id="cfJs" rows="3" placeholder="document.querySelector(&#39;.box&#39;).style.setProperty(&#39;my-gap&#39;, &#39;24px&#39;)">' +
      esc(p.js || '') + '</textarea></div>' +
      '<div class="form-row full"><div class="err" id="cfErr"></div></div>' +
      '</div>';

    var foot = '<button class="btn" data-close>取消</button>' +
      '<button class="btn primary" id="cfSave">' + (editing ? '保存修改' : '添加属性') + '</button>';

    openModal((editing ? '编辑自定义 CSS 属性 ' + p.n : '添加自定义 CSS 属性'), body, foot, null);
    var readVals = kvEditor('cfValsTable', 2, ['取值 / 写法，如 10px', '含义与使用场景'], p.vals, 'cfAddVal');

    $('#cfSave').addEventListener('click', function () {
      var name = $('#cfName').value.trim().toLowerCase();
      var desc = $('#cfDesc').value.trim();
      var err = $('#cfErr');
      if (!editing) {
        var v = window.Store.validateName('css', name);
        if (v) { err.textContent = v; return; }
      }
      if (!desc) { err.textContent = '请填写一句话说明'; return; }

      var payload = {
        n: name, d: desc, c: $('#cfCat').value,
        v: $('#cfVals').value.trim(), def: $('#cfDef').value.trim(),
        inherit: $('#cfInherit').value, animatable: $('#cfAnim').value,
        syntax: $('#cfSyntax').value.trim() || (name + ': <值>;'),
        note: $('#cfNote').value.trim(),
        vals: readVals(),
        demo: $('#cfDemo').value, css: $('#cfCss').value, js: $('#cfJs').value,
        updatedAt: new Date().toISOString()
      };
      var ok = editing ? window.Store.update('css', p.n, payload) : window.Store.add('css', payload);
      if (!ok) { err.textContent = '保存失败：浏览器存储不可用（可能是隐私模式）'; return; }
      toast(editing ? '已保存修改' : '已添加属性 ' + name);
      closeModal();
      buildNav(location.hash);
      var target = '#/css/prop/' + encodeURIComponent(name);
      if (location.hash === target) route(); else location.hash = target;
    });
  }

  /* ---------------- 自定义 JS 条目表单 ---------------- */
  function openJsForm(existing) {
    var editing = !!existing;
    var e = existing || { n: '', c: '自定义', d: '', u: '', snip: '', tags: [], html: '', css: '', js: '' };
    var cats = uniqArr((window.JS_EXAMPLE_CATS || []).concat(['自定义', e.c]));

    var body = '<div class="form-grid">' +
      '<div class="form-row"><label>条目名称 *</label>' +
      '<input class="input" id="jfName" placeholder="例如：防抖 debounce" value="' + esc(e.n) + '"' + (editing ? ' readonly' : '') + '>' +
      '<span class="hint">可用中文，不能与内置实例重名</span></div>' +
      '<div class="form-row"><label>分类</label><select id="jfCat">' +
      cats.map(function (c) { return '<option' + ((e.c || '自定义') === c ? ' selected' : '') + '>' + esc(c) + '</option>'; }).join('') + '</select></div>' +
      '<div class="form-row full"><label>一句话说明 *</label>' +
      '<input class="input" id="jfDesc" placeholder="例如：连续触发时只在最后一次调用" value="' + esc(e.d) + '"></div>' +
      '<div class="form-row full"><label>详细讲解（可留空）</label>' +
      '<textarea class="input" id="jfUsage" rows="3" placeholder="原理、注意事项、适用场景…">' + esc(e.u || '') + '</textarea></div>' +
      '<div class="form-row full"><label>核心写法（可留空，用于速查展示）</label>' +
      '<textarea class="input mono" id="jfSnip" rows="3" placeholder="const debounce = (fn, ms = 300) => { … }">' + esc(e.snip || '') + '</textarea></div>' +
      '<div class="form-row full"><label>标签（逗号分隔，可留空）</label>' +
      '<input class="input" id="jfTags" placeholder="函数, 性能, 闭包" value="' + esc((e.tags || []).join(', ')) + '"></div>' +
      '<div class="form-row full"><label>示例 HTML</label>' +
      '<textarea class="input mono" id="jfHtml" rows="4" placeholder="&lt;button id=&quot;btn&quot;&gt;点我&lt;/button&gt;">' + esc(e.html || '') + '</textarea></div>' +
      '<div class="form-row full"><label>示例 CSS（可留空）</label>' +
      '<textarea class="input mono" id="jfCss" rows="3" placeholder="button { padding: 8px 14px; }">' + esc(e.css || '') + '</textarea></div>' +
      '<div class="form-row full"><label>示例 JavaScript *</label>' +
      '<textarea class="input mono" id="jfJs" rows="6" placeholder="document.getElementById(&#39;btn&#39;).addEventListener(&#39;click&#39;, () =&gt; console.log(&#39;hi&#39;))">' +
      esc(e.js || '') + '</textarea></div>' +
      '<div class="form-row full"><div class="err" id="jfErr"></div></div>' +
      '</div>';

    var foot = '<button class="btn" data-close>取消</button>' +
      '<button class="btn primary" id="jfSave">' + (editing ? '保存修改' : '添加条目') + '</button>';

    openModal((editing ? '编辑自定义 JS 条目 ' + e.n : '添加自定义 JS 条目'), body, foot, null);

    $('#jfSave').addEventListener('click', function () {
      var name = $('#jfName').value.trim();
      var desc = $('#jfDesc').value.trim();
      var err = $('#jfErr');
      if (!editing) {
        var v = window.Store.validateName('js', name);
        if (v) { err.textContent = v; return; }
      }
      if (!desc) { err.textContent = '请填写一句话说明'; return; }

      var payload = {
        n: name, d: desc, c: $('#jfCat').value,
        u: $('#jfUsage').value.trim(),
        snip: $('#jfSnip').value,
        tags: $('#jfTags').value.split(/[,，]/).map(function (s) { return s.trim(); }).filter(Boolean),
        html: $('#jfHtml').value, css: $('#jfCss').value, js: $('#jfJs').value,
        updatedAt: new Date().toISOString()
      };
      var ok = editing ? window.Store.update('js', e.n, payload) : window.Store.add('js', payload);
      if (!ok) { err.textContent = '保存失败：浏览器存储不可用（可能是隐私模式）'; return; }
      toast(editing ? '已保存修改' : '已添加 JS 条目「' + name + '」');
      closeModal();
      buildNav(location.hash);
      var target = '#/js/ex/' + encodeURIComponent(name);
      if (location.hash === target) route(); else location.hash = target;
    });
  }

  /* ---------------- 我的示例（代码片段）表单 ---------------- */
  var MINE_CATS = ['布局', '组件', '动画', '表单', '特效', '工具函数', '练习', '未分类'];
  function openMineForm(existing) {
    var editing = !!existing;
    var s = existing || { n: '', c: '未分类', d: '', tags: [], html: '', css: '', js: '' };
    var cats = uniqArr(MINE_CATS.concat(window.Store.list('mine').map(function (x) { return x.c; })).concat([s.c]));

    var body = '<div class="form-grid">' +
      '<div class="form-row"><label>示例名称 *</label>' +
      '<input class="input" id="mfName" placeholder="例如：毛玻璃卡片" value="' + esc(s.n) + '"' + (editing ? ' readonly' : '') + '>' +
      '<span class="hint">可用中文，同一名称只能有一个</span></div>' +
      '<div class="form-row"><label>分类</label><select id="mfCat">' +
      cats.map(function (c) { return '<option' + (s.c === c ? ' selected' : '') + '>' + esc(c) + '</option>'; }).join('') + '</select></div>' +
      '<div class="form-row full"><label>说明（可留空）</label>' +
      '<input class="input" id="mfDesc" placeholder="例如：backdrop-filter 实现的半透明卡片" value="' + esc(s.d || '') + '"></div>' +
      '<div class="form-row full"><label>标签（逗号分隔，可留空）</label>' +
      '<input class="input" id="mfTags" placeholder="CSS, 玻璃拟态" value="' + esc((s.tags || []).join(', ')) + '"></div>' +
      '<div class="form-row full"><label>HTML</label>' +
      '<textarea class="input mono" id="mfHtml" rows="5" placeholder="&lt;div class=&quot;glass&quot;&gt;Hello&lt;/div&gt;">' + esc(s.html || '') + '</textarea></div>' +
      '<div class="form-row full"><label>CSS</label>' +
      '<textarea class="input mono" id="mfCss" rows="5" placeholder=".glass { backdrop-filter: blur(8px); }">' + esc(s.css || '') + '</textarea></div>' +
      '<div class="form-row full"><label>JavaScript（可留空）</label>' +
      '<textarea class="input mono" id="mfJs" rows="4" placeholder="console.log(&#39;run&#39;)">' + esc(s.js || '') + '</textarea></div>' +
      '<div class="form-row full"><div class="err" id="mfErr"></div></div>' +
      '</div>';

    var foot = '<button class="btn" data-close>取消</button>' +
      '<button class="btn primary" id="mfSave">' + (editing ? '保存修改' : '创建示例') + '</button>';

    openModal((editing ? '编辑示例 ' + s.n : '新建代码示例'), body, foot, null);

    $('#mfSave').addEventListener('click', function () {
      var name = $('#mfName').value.trim();
      var err = $('#mfErr');
      if (!editing) {
        var v = window.Store.validateName('mine', name);
        if (v) { err.textContent = v; return; }
      }
      if (!$('#mfHtml').value.trim() && !$('#mfCss').value.trim() && !$('#mfJs').value.trim()) {
        err.textContent = '至少填写 HTML / CSS / JavaScript 其中一项代码';
        return;
      }
      var payload = {
        n: name, d: $('#mfDesc').value.trim(), c: $('#mfCat').value,
        tags: $('#mfTags').value.split(/[,，]/).map(function (x) { return x.trim(); }).filter(Boolean),
        html: $('#mfHtml').value, css: $('#mfCss').value, js: $('#mfJs').value,
        updatedAt: new Date().toISOString()
      };
      var ok = editing ? window.Store.update('mine', s.n, payload) : window.Store.add('mine', payload);
      if (!ok) { err.textContent = '保存失败：浏览器存储不可用（可能是隐私模式）'; return; }
      toast(editing ? '已保存修改' : '已创建示例「' + name + '」');
      closeModal();
      buildNav(location.hash);
      var target = '#/mine/' + encodeURIComponent(name);
      if (location.hash === target) route(); else location.hash = target;
    });
  }

  /* ---------------- 添加菜单：四种自定义内容 ---------------- */
  function openAddMenu() {
    var c = window.Store.counts();
    var items = [
      ['tag', '🏷', 'HTML 标签', '补充团队内部的自定义标签 / 组件', c.tag],
      ['css', '🎨', 'CSS 属性', '往属性速查表里补一条属性与演示', c.css],
      ['js', '⚡', 'JS 条目', '补一条 JavaScript 写法 / 实例', c.js],
      ['mine', '📦', '代码示例', '存任意 HTML + CSS + JS 片段并实时预览', c.mine]
    ];
    openModal('添加自定义内容',
      '<p class="small dim" style="margin-top:0">选择要添加的类型，内容保存在本机浏览器（localStorage），可随时编辑、删除或导出备份。</p>' +
      '<div class="pick-grid">' + items.map(function (it) {
        return '<button class="pick" data-kind="' + it[0] + '">' +
          '<span class="pick-ic">' + it[1] + '</span>' +
          '<span class="pick-t">' + it[2] + '<i>' + it[4] + ' 条</i></span>' +
          '<span class="pick-d">' + esc(it[3]) + '</span></button>';
      }).join('') + '</div>',
      '<button class="btn" data-close>关闭</button>', null);

    $$('#modalBody .pick').forEach(function (b) {
      b.addEventListener('click', function () {
        var k = b.getAttribute('data-kind');
        closeModal();
        if (k === 'tag') openTagForm(null);
        else if (k === 'css') openCssForm(null);
        else if (k === 'js') openJsForm(null);
        else openMineForm(null);
      });
    });
  }

  /* ---------------- CSS 总览 ---------------- */
  function viewCssIndex() {
    var cats = window.CSS_PROP_CATS;
    var catCards = cats.map(function (c) {
      var list = window.CSS_PROPS.filter(function (p) { return p.c === c; });
      return '<div class="card"><div class="card-head"><h3>' + esc(c) + '</h3>' +
        '<span class="small dim">' + list.length + ' 项</span></div>' +
        '<div class="tag-cloud">' + list.map(function (p) {
          return '<a class="tag-pill" href="#/css/prop/' + encodeURIComponent(p.n) + '">' + esc(p.n) + '</a>';
        }).join('') + '</div></div>';
    }).join('');

    var modern = [
      [':has() 父级选择', '.card:has(> img) { padding-top: 0; }', '按子元素反向选中父级，很多 JS 逻辑可以删掉了'],
      ['容器查询', '.wrap { container-type: inline-size; }\n@container (min-width: 400px) { … }', '按父容器宽度而不是视口宽度做响应式'],
      ['原生嵌套', '.card { color: #333; & .title { color: #3b5bdb; } }', '不必再写 .card .title，作用域更清晰'],
      ['@layer 层叠层', '@layer reset, base, components;', '显式声明优先顺序，摆脱选择器权重军备竞赛'],
      ['color-mix()', 'color-mix(in srgb, var(--accent) 20%, transparent)', '直接在 CSS 里混合颜色，做浅色底最方便'],
      ['clamp() 流式尺寸', 'font-size: clamp(1rem, 0.8rem + 1vw, 1.6rem)', '一行实现随视口平滑变化的字号 / 间距'],
      ['aspect-ratio', 'aspect-ratio: 16 / 9;', '固定比例占位，图片加载前后不再跳动'],
      ['scroll-driven 动画', 'animation-timeline: scroll();', '随滚动进度驱动的动画，无需 JS 监听 scroll'],
      ['accent-color', 'accent-color: var(--accent);', '一行统一表单控件的主题色']
    ];

    render(crumbs([{ t: 'CSS 速查' }]) +
      '<div class="page-head"><h1 class="page-title">CSS 速查表</h1>' +
      '<p class="page-sub">' + window.CSS_PROPS.length + ' 个常用属性 · ' +
      window.CSS_SELECTORS.reduce(function (n, g) { return n + g.items.length; }, 0) + ' 种选择器 · ' +
      window.CSS_SNIPPETS.length + ' 段可复制片段，均带参数说明与可运行效果</p></div>' +

      '<div class="card-grid">' +
      '<a class="tile" href="#/css/selectors"><div class="ic">🎯</div><h3>选择器</h3><p>基础、组合、属性、伪类、伪元素，附特异性权重。</p></a>' +
      '<a class="tile" href="#/css/box"><div class="ic">📦</div><h3>盒模型</h3><p>拖动滑块观察四层结构与 box-sizing。</p></a>' +
      '<a class="tile" href="#/css/flex"><div class="ic">🧩</div><h3>Flexbox</h3><p>主轴 / 交叉轴对齐与伸缩规则实验室。</p></a>' +
      '<a class="tile" href="#/css/grid"><div class="ic">🔲</div><h3>Grid</h3><p>行列轨道、跨格与响应式列数。</p></a>' +
      '<a class="tile" href="#/css/position"><div class="ic">📌</div><h3>定位与层叠</h3><p>五种 position 与 z-index 实践。</p></a>' +
      '<a class="tile" href="#/css/props"><div class="ic">📋</div><h3>属性速查表</h3><p>' + window.CSS_PROPS.length + ' 个属性，含语法、取值、继承与演示。</p></a>' +
      '<a class="tile" href="#/css/snippets"><div class="ic">⚡</div><h3>常用代码片段</h3><p>居中、截断、网格、毛玻璃、动效… 复制即用，' +
      window.CSS_SNIPPETS.length + ' 段都带编辑器与实时效果。</p></a>' +
      '</div>' +

      '<div class="card" style="margin-top:16px"><div class="card-head"><h3>三个必须理解的概念</h3></div>' +
      '<div class="callout"><div class="ttl">1 · 层叠（Cascade）与优先级</div><div class="small">' +
      '同一属性被多条规则命中时，按此顺序决策：<b>来源与重要性</b>（!important）→ <b>层叠层</b>（@layer）→ <b>特异性</b>（ID &gt; 类/属性/伪类 &gt; 标签）→ <b>书写顺序</b>（后写者胜）。' +
      '</div></div>' +
      '<div class="callout"><div class="ttl">2 · 继承与初始值</div><div class="small">' +
      '文字类属性（color、font-*、line-height、text-align、letter-spacing）会向下继承；盒模型与布局属性（display、margin、padding、position）不继承，未声明时使用初始值。' +
      '可以用 <code class="inline">inherit</code> 显式继承、<code class="inline">initial</code> 还原初始值、<code class="inline">unset</code> 自动判断。' +
      '</div></div>' +
      '<div class="callout"><div class="ttl">3 · 格式化上下文（BFC / 包含块）</div><div class="small">' +
      '<code class="inline">overflow: hidden</code>、<code class="inline">display: flow-root</code>、<code class="inline">float</code> 等会创建独立的块格式化上下文，用来清除浮动、避免 margin 折叠；' +
      '而 <code class="inline">position: relative / absolute</code>、<code class="inline">transform</code>、<code class="inline">filter</code> 会改变后代元素的定位参照与层叠上下文。' +
      '</div></div>' +
      '<div class="table-wrap" style="margin-top:4px"><table class="grid"><thead><tr>' +
      '<th class="nosort">现代特性</th><th class="nosort">写法</th><th class="nosort">解决什么问题</th></tr></thead><tbody>' +
      modern.map(function (r) {
        return '<tr><td class="attr-name">' + esc(r[0]) + '</td>' +
          '<td><pre class="code" style="padding:5px 8px;margin:0;white-space:pre-wrap">' + window.HL.css(r[1]) + '</pre></td>' +
          '<td class="small">' + esc(r[2]) + '</td></tr>';
      }).join('') + '</tbody></table></div></div>' +

      '<div class="card"><div class="card-head"><h3>媒体查询 / 响应式</h3></div>' +
      '<div class="table-wrap"><table class="grid"><thead><tr><th class="nosort">写法</th><th class="nosort">说明</th></tr></thead><tbody>' +
      window.CSS_MEDIA.map(function (m) {
        return '<tr><td class="mono small">' + esc(m.s) + '</td><td class="small">' + esc(m.d) + '</td></tr>';
      }).join('') + '</tbody></table></div></div>' +
      '<div class="card"><div class="card-head"><h3>常用单位</h3></div>' +
      '<div class="table-wrap"><table class="grid"><thead><tr><th class="nosort">单位</th><th class="nosort">含义</th></tr></thead><tbody>' +
      window.CSS_UNITS.map(function (u) {
        return '<tr><td class="mono">' + esc(u.u) + '</td><td class="small">' + esc(u.d) + '</td></tr>';
      }).join('') + '</tbody></table></div></div>' +
      '<h2 style="margin:22px 0 12px">按分类浏览属性</h2>' + catCards);
  }

  /* 选择器特异性：返回 "a-b-c"（ID-类/属性/伪类-标签/伪元素） */
  function spec(sel) {
    var s = String(sel).split(',')[0].trim();
    var a = 0, b = 0, c = 0;
    s = s.replace(/"[^"]*"|'[^']*'/g, ' ');
    s = s.replace(/\[[^\]]*\]/g, ' \u0001 ');
    s = s.replace(/::[\w-]+(\([^)]*\))?/g, function () { c++; return ' '; });
    s = s.replace(/:([\w-]+)(\(([^)]*)\))?/g, function (m, name, p2, inner) {
      if (inner && /^(is|not|has|matches)$/.test(name)) {
        var sub = spec(inner).split('-');
        a += Number(sub[0]) || 0; b += Number(sub[1]) || 0; c += Number(sub[2]) || 0;
        return ' ';
      }
      if (name === 'where') return ' ';
      b++; return ' ';
    });
    s = s.replace(/#[\w-]+/g, function () { a++; return ' '; });
    s = s.replace(/\.[\w-]+/g, function () { b++; return ' '; });
    s = s.replace(/\u0001/g, function () { b++; return ' '; });
    s.replace(/[a-zA-Z][\w-]*/g, function (m) { if (m !== '*') c++; return ' '; });
    return a + '-' + b + '-' + c;
  }

  function viewSelectors() {
    var groups = window.CSS_SELECTORS.map(function (g) {
      return '<div class="card"><div class="card-head"><h3>' + esc(g.g) + '</h3>' +
        '<span class="small dim">' + g.items.length + ' 个</span></div>' +
        '<div class="table-wrap"><table class="grid wide"><thead><tr>' +
        '<th class="nosort">选择器</th><th class="nosort">说明</th><th class="nosort">权重</th>' +
        '<th class="nosort">示例</th></tr></thead><tbody>' +
        g.items.map(function (it) {
          return '<tr><td class="attr-name">' + esc(it.s) + '</td><td class="small">' + esc(it.d) + '</td>' +
            '<td><span class="badge plain mono" title="ID - 类/属性/伪类 - 标签">' + spec(it.s) + '</span></td>' +
            '<td><pre class="code" style="padding:6px 8px;margin:0">' + window.HL.css(it.e) + '</pre></td></tr>';
        }).join('') + '</tbody></table></div></div>';
    }).join('');

    render(crumbs([{ t: 'CSS 速查', h: '#/css' }, { t: '选择器' }]) +
      '<div class="page-head"><h1 class="page-title">CSS 选择器速查</h1>' +
      '<p class="page-sub">按用途分组，附特异性权重与可直接复制的示例</p></div>' +
      '<div class="callout"><div class="ttl">特异性（优先级）怎么算</div><div class="small">' +
      '权重记作 <code class="inline">(ID 数, 类/属性/伪类 数, 标签/伪元素 数)</code>，逐位比较，高位大者优先；' +
      '同权重时后写者胜。<code class="inline">!important</code> 会跳出比较，' +
      '<code class="inline">:where()</code> 的权重恒为 0，<code class="inline">:is()</code> 取括号内最高值。' +
      '<br>例：<code class="inline">#nav .item a:hover</code> = (1,2,1)，' +
      '<code class="inline">ul li a</code> = (0,0,3)。</div></div>' +
      groups +
      '<div class="card"><div class="card-head"><h3>自己试一试</h3>' +
      '<span class="small dim">JavaScript 面板默认收起，点 ▸ 展开就能用 querySelector 操作上面的元素</span></div>' +
      demoBlock([
        { label: 'HTML', key: 'html', code: '<ul class="list">\n  <li>第一项</li>\n  <li class="active">第二项（高亮）</li>\n  <li>第三项</li>\n</ul>\n<p class="tip">提示文字</p>' },
        { label: 'CSS', key: 'css', code: '.list > li:first-child { color: #3b5bdb; font-weight: 700; }\n.list li.active { background: #eef1fe; }\n.list li:nth-child(even) { background: #f7f8fc; }\n.tip::before { content: "💡 "; }' },
        { label: 'JavaScript（可编辑）', key: 'js', code: '// 用选择器找到元素并改造它们\nconst items = document.querySelectorAll(".list > li");\nitems.forEach((li, i) => {\n  li.style.padding = "4px 8px";\n  li.title = `第 ${i + 1} 项`;    // 鼠标悬停可看\n});\nconsole.log("共找到", items.length, "个元素");', collapsed: true }
      ], { id: 'css-selectors' }) + '</div>');
  }

  function viewBox() {
    render(crumbs([{ t: 'CSS 速查', h: '#/css' }, { t: '盒模型' }]) +
      '<div class="page-head"><h1 class="page-title">盒模型可视化</h1>' +
      '<p class="page-sub">拖动右侧滑块，观察 margin / border / padding / content 的实时变化</p></div>' +

      '<div class="card"><div class="boxviz" data-boxviz>' +
      '<div class="box-stage"><div class="box-band box-margin"><span class="lbl">margin</span>' +
      '<div class="box-band box-border"><span class="lbl">border</span>' +
      '<div class="box-band box-padding"><span class="lbl">padding</span>' +
      '<div class="box-content">content</div></div></div></div></div>' +
      '<div class="sliders">' +
      slider('margin', 0, 60, 24) + slider('border', 0, 30, 8) +
      slider('padding', 0, 60, 20) + slider('width', 80, 320, 160) +
      slider('height', 40, 200, 70) +
      '<div class="ctl"><span>box-sizing</span><div class="seg" data-seg="bs">' +
      '<button class="on" data-v="content-box">content-box</button>' +
      '<button data-v="border-box">border-box</button></div></div>' +
      '<div class="small dim" id="boxInfo"></div>' +
      '</div></div>' +
      '<div class="callout" style="margin-top:14px"><div class="ttl">要点</div><div class="small">' +
      window.CSS_LAYOUTS[0].tips.map(function (t) { return '· ' + esc(t); }).join('<br>') +
      '</div></div>' +
      '<div style="margin-top:14px"><pre class="code" id="boxCode"></pre></div>' +
      '</div>');

    var box = $('[data-boxviz]');
    var marginEl = $('.box-margin', box), borderEl = $('.box-border', box),
      padEl = $('.box-padding', box), content = $('.box-content', box);
    var vals = { margin: 24, border: 8, padding: 20, width: 160, height: 70, bs: 'content-box' };
    function apply() {
      marginEl.style.padding = vals.margin + 'px';
      borderEl.style.padding = vals.border + 'px';
      padEl.style.padding = vals.padding + 'px';
      content.style.width = vals.width + 'px';
      content.style.height = vals.height + 'px';
      content.style.boxSizing = vals.bs;
      var totalW = vals.width + vals.padding * 2 + vals.border * 2;
      $('#boxInfo').textContent = '总占宽 = content ' + vals.width + ' + padding ' + (vals.padding * 2) +
        ' + border ' + (vals.border * 2) + ' = ' + totalW + 'px（margin 不计入）';
      $('#boxCode').innerHTML = window.HL.css(
        '.box {\n  box-sizing: ' + vals.bs + ';\n  width: ' + vals.width + 'px;\n  height: ' + vals.height + 'px;\n  padding: ' + vals.padding + 'px;\n  border: ' + vals.border + 'px solid #2f8f4a;\n  margin: ' + vals.margin + 'px;\n}');
    }
    $$('input[type=range]', box).forEach(function (r) {
      r.addEventListener('input', function () {
        vals[r.getAttribute('data-k')] = Number(this.value);
        $('.val', r.parentNode).textContent = this.value + 'px';
        apply();
      });
    });
    $$('[data-seg="bs"] button', box).forEach(function (b) {
      b.addEventListener('click', function () {
        $$('[data-seg="bs"] button', box).forEach(function (x) { x.classList.remove('on'); });
        b.classList.add('on');
        vals.bs = b.getAttribute('data-v');
        apply();
      });
    });
    apply();
  }
  function slider(key, min, max, v) {
    return '<div class="slider-row"><span>' + key + '</span>' +
      '<input type="range" data-k="' + key + '" min="' + min + '" max="' + max + '" value="' + v + '">' +
      '<span class="val">' + v + 'px</span></div>';
  }

  function viewFlex() {
    render(crumbs([{ t: 'CSS 速查', h: '#/css' }, { t: 'Flexbox 实验室' }]) +
      '<div class="page-head"><h1 class="page-title">Flexbox 实验室</h1>' +
      '<p class="page-sub">点选参数，观察容器与子项的布局变化</p></div>' +
      '<div class="card"><div class="lab-grid" data-flex>' +
      '<div class="lab-stage"><div class="demo-boxes">' +
      '<div>1</div><div>2</div><div>3</div><div>4</div>' +
      '</div></div>' +
      '<div class="lab-controls">' +
      seg('direction', 'flex-direction', ['row', 'row-reverse', 'column', 'column-reverse'], 'row') +
      seg('justify', 'justify-content', ['flex-start', 'flex-end', 'center', 'space-between', 'space-around', 'space-evenly'], 'flex-start') +
      seg('align', 'align-items', ['stretch', 'flex-start', 'flex-end', 'center', 'baseline'], 'stretch') +
      seg('wrap', 'flex-wrap', ['nowrap', 'wrap', 'wrap-reverse'], 'nowrap') +
      '<div class="ctl"><span>gap</span><div class="slider-row"><span>&nbsp;</span>' +
      '<input type="range" data-gap min="0" max="40" value="8"><span class="val">8px</span></div></div>' +
      '<pre class="code" id="flexCode"></pre>' +
      '</div></div>' +
      '<div class="callout" style="margin-top:14px"><div class="ttl">要点</div><div class="small">' +
      window.CSS_LAYOUTS[1].tips.map(function (t) { return '· ' + esc(t); }).join('<br>') + '</div></div>' +
      '</div>');

    var box = $('[data-flex]');
    var stage = $('.demo-boxes', box);
    var st = { direction: 'row', justify: 'flex-start', align: 'stretch', wrap: 'nowrap', gap: 8 };
    function apply() {
      stage.style.display = 'flex';
      stage.style.flexDirection = st.direction;
      stage.style.justifyContent = st.justify;
      stage.style.alignItems = st.align;
      stage.style.flexWrap = st.wrap;
      stage.style.gap = st.gap + 'px';
      if (st.direction.indexOf('column') === 0) stage.style.minHeight = '280px'; else stage.style.minHeight = '200px';
      $('#flexCode').innerHTML = window.HL.css(
        '.container {\n  display: flex;\n  flex-direction: ' + st.direction + ';\n  justify-content: ' + st.justify +
        ';\n  align-items: ' + st.align + ';\n  flex-wrap: ' + st.wrap + ';\n  gap: ' + st.gap + 'px;\n}');
    }
    $$('.seg', box).forEach(function (s) {
      var key = s.getAttribute('data-seg');
      $$('button', s).forEach(function (b) {
        b.addEventListener('click', function () {
          $$('button', s).forEach(function (x) { x.classList.remove('on'); });
          b.classList.add('on');
          st[key] = b.getAttribute('data-v');
          apply();
        });
      });
    });
    $('[data-gap]', box).addEventListener('input', function () {
      st.gap = Number(this.value);
      $('.val', this.parentNode).textContent = this.value + 'px';
      apply();
    });
    apply();
  }
  function seg(key, label, values, cur) {
    return '<div class="ctl"><span>' + label + '</span><div class="seg" data-seg="' + key + '">' +
      values.map(function (v) {
        return '<button data-v="' + v + '"' + (v === cur ? ' class="on"' : '') + '>' + v + '</button>';
      }).join('') + '</div></div>';
  }

  function viewGrid() {
    render(crumbs([{ t: 'CSS 速查', h: '#/css' }, { t: 'Grid 实验室' }]) +
      '<div class="page-head"><h1 class="page-title">Grid 实验室</h1>' +
      '<p class="page-sub">切换列轨道定义与对齐方式，观察二维布局</p></div>' +
      '<div class="card"><div class="lab-grid" data-grid>' +
      '<div class="lab-stage"><div class="demo-gridbox">' +
      [1, 2, 3, 4, 5, 6].map(function (i) { return '<div>' + i + '</div>'; }).join('') +
      '</div></div>' +
      '<div class="lab-controls">' +
      seg('cols', 'grid-template-columns', ['1fr 1fr 1fr', 'repeat(2, 1fr)', '120px 1fr', 'repeat(auto-fill, minmax(90px, 1fr))', '2fr 1fr'], '1fr 1fr 1fr') +
      seg('justifyItems', 'justify-items', ['stretch', 'start', 'center', 'end'], 'stretch') +
      seg('alignItems', 'align-items', ['stretch', 'start', 'center', 'end'], 'stretch') +
      '<div class="ctl"><span>gap</span><div class="slider-row"><span>&nbsp;</span>' +
      '<input type="range" data-ggap min="0" max="40" value="8"><span class="val">8px</span></div></div>' +
      '<div class="ctl"><span>第一项跨列</span><div class="seg" data-seg="span">' +
      '<button data-v="1" class="on">1 列</button><button data-v="2">2 列</button><button data-v="3">3 列</button></div></div>' +
      '<pre class="code" id="gridCode"></pre>' +
      '</div></div>' +
      '<div class="callout" style="margin-top:14px"><div class="ttl">要点</div><div class="small">' +
      window.CSS_LAYOUTS[2].tips.map(function (t) { return '· ' + esc(t); }).join('<br>') + '</div></div>' +
      '</div>');

    var box = $('[data-grid]');
    var stage = $('.demo-gridbox', box);
    var st = { cols: '1fr 1fr 1fr', justifyItems: 'stretch', alignItems: 'stretch', gap: 8, span: 1 };
    function apply() {
      stage.style.gridTemplateColumns = st.cols;
      stage.style.justifyItems = st.justifyItems;
      stage.style.alignItems = st.alignItems;
      stage.style.gap = st.gap + 'px';
      var first = stage.children[0];
      if (first) first.style.gridColumn = st.span > 1 ? ('span ' + st.span) : '';
      $('#gridCode').innerHTML = window.HL.css(
        '.grid {\n  display: grid;\n  grid-template-columns: ' + st.cols + ';\n  justify-items: ' + st.justifyItems +
        ';\n  align-items: ' + st.alignItems + ';\n  gap: ' + st.gap + 'px;\n}\n' +
        (st.span > 1 ? '.grid > :first-child { grid-column: span ' + st.span + '; }' : ''));
    }
    $$('.seg', box).forEach(function (s) {
      var key = s.getAttribute('data-seg');
      $$('button', s).forEach(function (b) {
        b.addEventListener('click', function () {
          $$('button', s).forEach(function (x) { x.classList.remove('on'); });
          b.classList.add('on');
          st[key] = b.getAttribute('data-v');
          apply();
        });
      });
    });
    $('[data-ggap]', box).addEventListener('input', function () {
      st.gap = Number(this.value);
      $('.val', this.parentNode).textContent = this.value + 'px';
      apply();
    });
    apply();
  }

  function viewPosition() {
    render(crumbs([{ t: 'CSS 速查', h: '#/css' }, { t: '定位与层叠' }]) +
      '<div class="page-head"><h1 class="page-title">定位与层叠</h1>' +
      '<p class="page-sub">五种 position 取值与 z-index 的层叠规则</p></div>' +
      '<div class="card"><div class="card-head"><h3>取值对照</h3></div>' +
      '<div class="table-wrap"><table class="grid"><thead><tr>' +
      '<th class="nosort">取值</th><th class="nosort">参照物</th><th class="nosort">是否脱离文档流</th><th class="nosort">典型用途</th>' +
      '</tr></thead><tbody>' +
      [['static', '正常流位置', '否', '默认值，top/left 无效'],
       ['relative', '自身原位置', '否（保留占位）', '微调、作为 absolute 的参照父级'],
       ['absolute', '最近的已定位祖先', '是', '弹层、角标、图标覆盖'],
       ['fixed', '视口', '是', '吸顶导航、悬浮按钮'],
       ['sticky', '滚动容器 + 阈值', '否（滚动时吸附）', '表头吸顶、侧栏跟随']].map(function (r) {
        return '<tr><td class="attr-name">' + r[0] + '</td><td class="small">' + r[1] + '</td><td class="small">' + r[2] + '</td><td class="small">' + r[3] + '</td></tr>';
      }).join('') + '</tbody></table></div>' +
      '<div class="callout" style="margin-top:14px"><div class="ttl">要点</div><div class="small">' +
      window.CSS_LAYOUTS[3].tips.map(function (t) { return '· ' + esc(t); }).join('<br>') + '</div></div>' +
      '</div>' +
      '<div class="card"><div class="card-head"><h3>自己试一试（sticky + absolute）</h3></div>' +
      demoBlock([
        { label: 'HTML', key: 'html', code: '<div class="wrap">\n  <div class="sticky">📌 sticky 表头</div>\n  <div class="rel">\n    relative 容器\n    <div class="abs">absolute</div>\n  </div>\n  <p>继续向下滚动…</p>\n  <p style="height:200px">&nbsp;</p>\n</div>' },
        { label: 'CSS', key: 'css', code: '.wrap { height: 260px; overflow: auto; border: 1px solid #ddd; border-radius: 8px; }\n.sticky { position: sticky; top: 0; background: #3b5bdb; color: #fff; padding: 8px; }\n.rel { position: relative; height: 120px; background: #f7f8fc; margin: 10px; padding: 8px; }\n.abs { position: absolute; right: 8px; bottom: 8px; background: #a86404; color: #fff; padding: 4px 10px; border-radius: 6px; }' }
      ]) + '</div>');
  }

  function propHay(p) {
    return [p.n, p.d, p.v, p.def, p.c, (p.vals || []).map(function (x) { return x.v + ' ' + x.d; }).join(' ')]
      .join(' ').toLowerCase();
  }

  function viewProps(params) {
    params = params || {};
    var ALLP = allCssProps();                       // 内置 + 自定义
    var src = params.custom ? ALLP.filter(function (p) { return p.custom; }) : ALLP;
    var allCats = (window.CSS_PROP_CATS || []).slice();
    ALLP.forEach(function (p) { if (p.c && allCats.indexOf(p.c) < 0) allCats.push(p.c); });
    var srcCats = [];
    src.forEach(function (p) { if (p.c && srcCats.indexOf(p.c) < 0) srcCats.push(p.c); });

    var catParam = params.cat || '';
    var cats = catParam ? allCats.filter(function (c) { return c === catParam; })
      : (params.custom ? srcCats : allCats);
    if (!cats.length) cats = params.custom ? srcCats : allCats;
    var total = ALLP.length;
    var shownTotal = cats.reduce(function (n, c) {
      return n + src.filter(function (p) { return p.c === c; }).length;
    }, 0);

    var secs = [];
    var blocks = cats.map(function (c) {
      /* 属性名里可能有空格 / 冒号 / @，锚点统一用下标，避免非法 id */
      var list = ALLP.map(function (p, i) { return { p: p, i: i }; })
        .filter(function (o) { return o.p.c === c && (!params.custom || o.p.custom); });
      var cid = 'cat-' + allCats.indexOf(c);
      secs.push({ id: cid, t: c, level: 2, count: list.length });
      list.forEach(function (o) {
        secs.push({ id: 'p-' + o.i, t: o.p.n, level: 3, hay: propHay(o.p), mono: true });
      });
      return '<div class="card prop-cat" id="' + cid + '">' +
        '<div class="card-head"><h2>' + esc(c) + '</h2>' +
        '<span class="small dim">' + list.length + ' 项 · ' +
        '<a href="#/css/props?cat=' + encodeURIComponent(c) + '">只看本类</a></span></div>' +
        '<div class="table-wrap"><table class="grid props-grid"><thead><tr>' +
        '<th class="nosort">属性</th><th class="nosort">说明</th><th class="nosort">常用取值</th>' +
        '<th class="nosort">默认值</th><th class="nosort">继承</th><th class="nosort">可动画</th>' +
        '</tr></thead><tbody>' + list.map(function (o) {
          var p = o.p;
          return '<tr id="p-' + o.i + '" class="' + (p.custom ? 'row-custom' : '') + '" data-hay="' + esc(propHay(p)) + '">' +
            '<td class="attr-name"><a href="#/css/prop/' + encodeURIComponent(p.n) + '">' + esc(p.n) + '</a>' +
            (p.custom ? ' <span class="badge custom">✦ 自定义</span>' : '') + '</td>' +
            '<td class="small">' + esc(p.d) + '</td>' +
            '<td class="small mono dim">' + esc(p.v) + '</td>' +
            '<td class="small mono dim">' + esc(p.def) + '</td>' +
            '<td class="cell-mark">' + (p.inherit === '是' ? '<span class="yes">✓</span>' : '<span class="no">否</span>') + '</td>' +
            '<td class="cell-mark">' + (p.animatable === '是' ? '<span class="yes">✓</span>' : '<span class="no">否</span>') + '</td></tr>';
        }).join('') + '</tbody></table></div></div>';
    }).join('');

    var head = crumbs([{ t: 'CSS 速查', h: '#/css' }, { t: '属性速查表' }]) +
      '<div class="page-head"><h1 class="page-title" id="page-title">CSS 属性速查表' +
      (catParam ? ' <span class="badge plain">仅看：' + esc(catParam) + '</span>' : '') +
      (params.custom ? ' <span class="badge custom">✦ 仅看自定义</span>' : '') + '</h1>' +
      '<p class="page-sub">共 ' + total + ' 个属性' +
      (params.custom ? '（其中自定义 ' + window.Store.count('css') + ' 个，<a href="#/css/props">查看全部</a>）'
        : '，含自定义补充 ' + window.Store.count('css') + ' 个') +
      (catParam ? '（当前分类 ' + shownTotal + ' 个，<a href="#/css/props">查看全部</a>）' : '') +
      ' · 左侧大纲可按分类与属性名快速定位，点击属性名查看详解与实时演示</p></div>';

    var subnav = '<div class="subnav only-narrow"><span class="lbl">跳转到</span>' +
      cats.map(function (c) {
        return '<a href="#/css/props" data-jump="cat-' + allCats.indexOf(c) + '">' + esc(c) + '</a>';
      }).join('') +
      '<span class="count" id="propCount">' + shownTotal + ' 项</span></div>';

    var toolbar = '<div class="toolbar"><div class="inline-search"><span class="ic">🔍</span>' +
      '<input id="propSearch" type="search" placeholder="过滤属性 / 取值 / 说明" autocomplete="off" value="' + esc(params.q || '') + '"></div>' +
      '<div class="field"><label>分类</label><select id="propCat">' +
      '<option value="">全部分类</option>' + allCats.map(function (c) {
        return '<option value="' + esc(c) + '"' + (catParam === c ? ' selected' : '') + '>' + esc(c) + '</option>';
      }).join('') + '</select></div>' +
      '<span class="small dim">例如：flex、居中、渐变、overflow</span>' +
      '<div class="chips">' +
      '<button class="btn sm" id="propAdd">＋ 添加自定义属性</button>' +
      '<button class="btn sm' + (params.custom ? ' primary' : '') + '" id="propCustom">' +
      (params.custom ? '← 返回全部属性' : '✦ 只看自定义（' + window.Store.count('css') + '）') + '</button>' +
      '</div></div>';

    render(head +
      outlinePage(outlineBlock(
        [{ id: 'page-title', t: 'CSS 属性速查表', level: 1 }].concat(secs),
        { title: '属性大纲' }),
        subnav + toolbar +
        (params.custom && !window.Store.count('css')
          ? '<div class="card"><p class="muted" style="margin:0">还没有自定义 CSS 属性。' +
            '点击上方「添加自定义属性」，把团队内部约定或新特性补进来，它会和内置属性一样出现在速查表与搜索里。</p>' +
            '<div class="chips" style="margin-top:12px"><button class="btn primary sm" id="propAdd2">＋ 添加自定义属性</button></div></div>'
          : '') +
        '<div id="propEmpty" class="card" hidden><p class="muted" style="margin:0">没有匹配的属性，试试更短的关键词。</p></div>' +
        blocks));

    bindOutline();

    var input = $('#propSearch');
    function applyFilter() {
      var q = input.value.trim().toLowerCase();
      var shown = 0;
      $$('#view .prop-cat').forEach(function (card) {
        var any = 0;
        $$('tbody tr', card).forEach(function (tr) {
          var hit = !q || (tr.getAttribute('data-hay') || '').indexOf(q) >= 0;
          tr.hidden = !hit;
          if (hit) any++;
        });
        card.hidden = !any;
        shown += any;
      });
      var cnt = $('#propCount');
      if (cnt) cnt.textContent = shown + ' 项';
      $('#propEmpty').hidden = shown > 0;
      syncOutlineFilter(q);
    }
    input.addEventListener('input', applyFilter);
    if (input.value) applyFilter();

    var catSel = $('#propCat');
    catSel.addEventListener('change', function () {
      location.hash = this.value ? '#/css/props?cat=' + encodeURIComponent(this.value) : '#/css/props';
    });

    $('#propAdd').addEventListener('click', function () { openCssForm(null); });
    var propAdd2 = $('#propAdd2');
    if (propAdd2) propAdd2.addEventListener('click', function () { openCssForm(null); });
    $('#propCustom').addEventListener('click', function () {
      location.hash = params.custom ? '#/css/props' : '#/css/props?custom=1';
    });

    /* 窄屏时大纲隐藏，横向跳转条接管 */
    $$('#view .subnav [data-jump]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        var el = document.getElementById(a.getAttribute('data-jump'));
        if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 76, behavior: 'smooth' });
      });
    });
  }

  function viewProp(name) {
    var p = findProp(name);
    if (!p) {
      render('<div class="card"><h2>未找到属性 ' + esc(name) + '</h2>' +
        '<p class="muted small">它也许是内置数据里没有的属性，你可以<a href="#/manage">添加为自定义 CSS 属性</a>。</p>' +
        '<div class="chips" style="margin-top:12px"><a class="btn sm" href="#/css/props">← 返回属性表</a>' +
        '<button class="btn sm primary" id="addMissingProp">＋ 添加这个自定义属性</button></div></div>');
      $('#addMissingProp').addEventListener('click', function () { openCssForm(null, name); });
      return;
    }
    var related = allCssProps().filter(function (x) { return x.c === p.c && x.n !== p.n; });
    var vals = p.vals || [];
    var propJs = (window.PROP_JS_DEMOS || {})[p.n] || p.js || '';

    render(crumbs([{ t: 'CSS 速查', h: '#/css' }, { t: '属性表', h: '#/css/props' }, { t: p.n }]) +
      '<div class="page-head"><div class="prop-hd">' +
      '<h1 class="page-title" style="margin:0"><span class="name">' + esc(p.n) + '</span></h1>' +
      '<span class="badge plain">' + esc(p.c) + '</span>' +
      (p.custom ? '<span class="badge custom">✦ 自定义</span>' : '') +
      '<span class="meta-chip">继承 <b>' + esc(p.inherit) + '</b></span>' +
      '<span class="meta-chip">可动画 <b>' + esc(p.animatable) + '</b></span>' +
      '</div><p class="page-sub">' + esc(p.d) + '</p></div>' +

      '<div class="card"><div class="card-head"><h3>语法与属性值</h3>' +
      '<button class="btn sm" id="copySyntax">⧉ 复制语法</button></div>' +
      '<div class="syntax-box">' + esc(p.syntax) + '</div>' +
      '<div class="kv-list" style="margin-top:12px">' +
      '<div class="kv"><div class="k">默认值</div><div class="v mono small">' + esc(p.def) + '</div></div>' +
      '<div class="kv"><div class="k">是否继承</div><div class="v">' + esc(p.inherit) + '</div></div>' +
      '<div class="kv"><div class="k">是否可动画</div><div class="v">' + esc(p.animatable) + '</div></div>' +
      '<div class="kv"><div class="k">所属分类</div><div class="v small"><a href="#/css/props">' + esc(p.c) + '</a></div></div>' +
      '</div>' +
      (p.note ? '<div class="callout" style="margin-top:12px"><div class="ttl">注意事项</div>' +
        '<div class="small">' + esc(p.note) + '</div></div>' : '') +
      '</div>' +

      (vals.length ? '<div class="card"><div class="card-head"><h3>取值说明</h3>' +
        '<span class="small dim">' + vals.length + ' 种常见取值</span></div>' +
        '<div class="table-wrap"><table class="grid"><thead><tr>' +
        '<th class="nosort">取值 / 写法</th><th class="nosort">含义与使用场景</th></tr></thead><tbody>' +
        vals.map(function (v) {
          return '<tr><td class="attr-name">' + esc(v.v) + '</td><td class="small">' + esc(v.d || '—') + '</td></tr>';
        }).join('') + '</tbody></table></div></div>' : '') +

      '<div class="card"><div class="card-head"><h3>实时演示</h3>' +
      '<span class="small dim">左侧修改代码，右侧立即生效；展开 JavaScript 面板可用脚本控制样式</span></div>' +
      demoBlock([
        { label: 'HTML', key: 'html', code: p.demo },
        { label: 'CSS', key: 'css', code: p.css },
        { label: 'JavaScript（可编辑）', key: 'js', code: propJs, collapsed: !propJs }
      ], { id: 'prop-' + p.n }) + '</div>' +

      (p.custom ? '<div class="card"><div class="card-head"><h3>自定义属性操作</h3>' +
        '<span class="small dim">更新于 ' + esc((p.updatedAt || '').slice(0, 10)) + '</span></div>' +
        '<div class="chips"><button class="btn" id="editProp">编辑此属性</button>' +
        '<button class="btn danger" id="delProp">删除此属性</button></div></div>' : '') +

      '<div class="card"><div class="card-head"><h3>同分类属性</h3>' +
      '<span class="small dim">' + related.length + ' 个</span></div>' +
      '<div class="tag-cloud">' + related.map(function (x) {
        return '<a class="tag-pill" href="#/css/prop/' + encodeURIComponent(x.n) + '">' + esc(x.n) + '</a>';
      }).join('') + '</div>' +
      '<div class="chips" style="margin-top:14px">' +
      '<a class="btn sm" href="#/css/props">← 返回属性表</a>' +
      '<a class="btn sm" href="#/css/snippets">看看常用代码片段</a></div></div>');

    $('#copySyntax').addEventListener('click', function () { copyText(p.syntax); });

    if (p.custom) {
      $('#editProp').addEventListener('click', function () { openCssForm(p); });
      $('#delProp').addEventListener('click', function () {
        openModal('删除自定义 CSS 属性', '<p>确定删除 <code class="inline">' + esc(p.n) + '</code>？此操作不可撤销。</p>',
          '<button class="btn" data-close>取消</button><button class="btn danger" id="okDel">删除</button>',
          function () {
            window.Store.remove('css', p.n); toast('已删除'); closeModal();
            buildNav(location.hash); location.hash = '#/css/props';
          });
      });
    }
  }

  /* ---------------- CSS 代码片段 ---------------- */
  function viewSnips(params) {
    params = params || {};
    var catParam = params.cat || '';
    var cats = ['全部'].concat(window.CSS_SNIPPET_CATS);
    var withDemo = 0;

    var cards = window.CSS_SNIPPETS.map(function (s, i) {
      var dm = (window.CSS_SNIPPET_DEMOS || {})[s.t];
      var demo = '';
      if (dm) {
        withDemo++;
        var eds = [
          { label: 'HTML（演示结构）', key: 'html', code: dm.html, collapsed: true },
          { label: 'CSS（本片段，可编辑）', key: 'css', code: s.code }
        ];
        if (dm.js) eds.push({ label: 'JavaScript', key: 'js', code: dm.js });
        /* 和 JS「可运行实例」一致：直接铺开编辑器 + 实时预览，不需要点按钮 */
        demo = '<div class="snip-demo">' +
          demoBlock(eds, { id: 'snip' + i, height: 420, maxH: 560 }) + '</div>';
      }
      return '<div class="snip" data-cat="' + esc(s.c) + '">' +
        '<div class="snip-head"><h3>' + esc(s.t) + '</h3>' +
        '<span class="snip-badge">' + esc(s.c) + '</span>' +
        '<button class="btn-icon" data-copy="' + i + '" title="复制代码" aria-label="复制代码">&#9113;</button></div>' +
        '<p class="snip-desc">' + esc(s.d) + '</p>' +
        '<pre class="code">' + window.HL.css(s.code) + '</pre>' +
        demo +
        '<div class="snip-tags">' + s.tags.map(function (t) { return '<span>' + esc(t) + '</span>'; }).join('') + '</div>' +
        '</div>';
    }).join('');

    render(crumbs([{ t: 'CSS 速查', h: '#/css' }, { t: '常用代码片段' }]) +
      '<div class="page-head"><h1 class="page-title">常用代码片段</h1>' +
      '<p class="page-sub">' + window.CSS_SNIPPETS.length + ' 段可直接复制的实用代码，覆盖居中、截断、网格、玻璃拟态等高频场景；' +
      '其中 ' + withDemo + ' 段直接带「编辑器 + 实时效果」：左边改代码，右边立刻看到结果</p></div>' +
      '<div class="chips" id="snipFilter">' + cats.map(function (c) {
        return '<button class="chip' + (c === (catParam || '全部') ? ' on' : '') + '" data-cat="' + esc(c) + '">' + esc(c) + '</button>';
      }).join('') + '</div>' +
      '<div class="snips" id="snips" style="margin-top:14px">' + cards + '</div>');

    function filterTo(c) {
      $$('#snips .snip').forEach(function (s) {
        s.hidden = !(c === '全部' || s.getAttribute('data-cat') === c);
      });
    }
    if (catParam) filterTo(catParam);

    $$('#snipFilter .chip').forEach(function (b) {
      b.addEventListener('click', function () {
        $$('#snipFilter .chip').forEach(function (x) { x.classList.remove('on'); });
        b.classList.add('on');
        filterTo(b.getAttribute('data-cat'));
      });
    });
    $$('#view [data-copy]').forEach(function (b) {
      b.addEventListener('click', function () {
        copyText(window.CSS_SNIPPETS[Number(b.getAttribute('data-copy'))].code);
      });
    });

    /* 每个片段都是现成的「编辑器 + 实时预览」，直接全部挂载 */
    bindDemos($('#snips'));
  }

  function viewPlay() {
    /* 单文件模式：HTML 里可以写 <style> 和 <script>，适合快速验证一小段代码 */
    var singleSeed = [
      '<style>',
      '  .card {',
      '    max-width: 340px;',
      '    border: 1px solid var(--border);',
      '    border-radius: 14px;',
      '    padding: 18px;',
      '    background: var(--bg-elev);',
      '    box-shadow: 0 8px 24px rgba(20,28,50,.12);',
      '  }',
      '  .card h3 { margin: 0 0 8px; color: var(--accent); font-size: 17px; }',
      '  .tag { display: inline-block; background: var(--accent-soft); color: var(--accent);',
      '    border-radius: 999px; padding: 2px 10px; font-size: 12px; margin-right: 4px; }',
      '</style>',
      '',
      '<div class="card">',
      '  <h3>我是一张卡片</h3>',
      '  <p>随便改点什么，右边会立刻更新。</p>',
      '  <span class="tag">HTML</span> <span class="tag">CSS</span>',
      '</div>'
    ].join('\n');

    /* 分栏模式：HTML / CSS / JS 各一个面板，互不干扰，适合写带逻辑的小例子 */
    var htmlSeed = [
      '<div class="app">',
      '  <h3>心情投票</h3>',
      '  <div class="row">',
      '    <button data-mood="😀">😀</button>',
      '    <button data-mood="😐">😐</button>',
      '    <button data-mood="😢">😢</button>',
      '  </div>',
      '  <p class="result" id="result">还没有人投票</p>',
      '</div>'
    ].join('\n');
    var cssSeed = [
      '.app { max-width: 320px; }',
      '.app h3 { margin: 0 0 10px; font-size: 16px; }',
      '.row { display: flex; gap: 8px; margin-bottom: 12px; }',
      '.row button {',
      '  flex: 1; font-size: 20px; padding: 8px 0;',
      '  border: 1px solid var(--border-st); border-radius: 10px; background: var(--bg-elev);',
      '  transition: transform .15s, border-color .15s;',
      '}',
      '.row button:hover { transform: translateY(-3px); border-color: var(--accent); }',
      '.row button.on { border-color: var(--accent); background: var(--accent-soft); }',
      '.result { margin: 0; font-size: 13px; color: var(--text-soft); }',
      '.bar { height: 8px; border-radius: 999px; background: var(--accent); margin-top: 6px; transition: width .3s; }'
    ].join('\n');
    var jsSeed = [
      "// 一个完整的投票小组件：事件委托 + 状态 + 渲染",
      "const votes = { '😀': 3, '😐': 1, '😢': 0 };",
      "const result = document.getElementById('result');",
      "",
      "function render() {",
      "  const total = Object.values(votes).reduce((a, b) => a + b, 0) || 1;",
      "  result.innerHTML = Object.entries(votes).map(([k, v]) => {",
      "    const pct = Math.round((v / total) * 100);",
      "    return `<div>${k} ${v} 票<div class=\"bar\" style=\"width:${pct}%\"></div></div>`;",
      "  }).join('');",
      "  console.log('当前票数：', votes);",
      "}",
      "",
      "document.querySelector('.row').addEventListener('click', (e) => {",
      "  const btn = e.target.closest('button');",
      "  if (!btn) return;",
      "  votes[btn.dataset.mood]++;",
      "  document.querySelectorAll('.row button').forEach(b => b.classList.remove('on'));",
      "  btn.classList.add('on');",
      "  render();",
      "});",
      "",
      "render();"
    ].join('\n');

    var mode = window.Store.settings().playMode === 'split' ? 'split' : 'single';

    function body(m) {
      if (m === 'split') {
        return demoBlock([
          { label: 'HTML 结构', key: 'html', code: htmlSeed },
          { label: 'CSS 样式', key: 'css', code: cssSeed },
          { label: 'JavaScript 逻辑', key: 'js', code: jsSeed }
        ], { id: 'playground', height: 600, manual: true, noActs: true });
      }
      return demoBlock([{ label: 'HTML + CSS + JavaScript 编辑器', key: 'html', code: singleSeed }],
        { id: 'playground', height: 460, manual: true, noActs: true });
    }

    render(crumbs([{ t: '在线演练场' }]) +
      '<div class="page-head"><h1 class="page-title">在线演练场</h1>' +
      '<p class="page-sub">支持 HTML、CSS、JavaScript 三种代码：改完即时渲染，console 输出与报错会显示在控制台</p></div>' +
      '<div class="play-bar">' +
      '<div class="seg" id="playMode">' +
      '<button class="' + (mode === 'single' ? 'on' : '') + '" data-mode="single">单文件混写</button>' +
      '<button class="' + (mode === 'split' ? 'on' : '') + '" data-mode="split">HTML / CSS / JS 分栏</button>' +
      '</div>' +
      '<button class="btn sm" id="plReset">↺ 还原示例</button>' +
      '<button class="btn sm" id="plCopy">⧉ 复制全部</button>' +
      '<button class="btn sm danger" id="plClear">清空</button>' +
      '<span class="spacer"></span>' +
      '<span class="small dim">Tab 缩进 · Ctrl/⌘ + Enter 运行 · 拖动右下角调高度</span>' +
      '</div>' +
      body(mode));

    function currentBox() { return $('[data-demo="playground"]'); }
    function allEditors() { return $$('.editor', currentBox()); }
    function setAll(v) {
      allEditors().forEach(function (ed) { ed.value = v; updateMeta(ed); });
      currentBox().dispatchEvent(new Event('demo:repaint'));
    }
    function collect() {
      var box = currentBox();
      var parts = [];
      var get = function (k) { var el = $('[data-role="' + k + '"]', box); return el ? el.value : ''; };
      if (get('html')) parts.push(get('html'));
      if (get('css')) parts.push('/* ---- CSS ---- */\n' + get('css'));
      if (get('js')) parts.push('/* ---- JavaScript ---- */\n' + get('js'));
      return parts.join('\n\n');
    }

    $$('#playMode button').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var m = btn.getAttribute('data-mode');
        window.Store.set('playMode', m);
        $$('#playMode button').forEach(function (b) { b.classList.remove('on'); });
        btn.classList.add('on');
        viewPlay();                       // 重新渲染整页，编辑器数量不同
        toast(m === 'split' ? '已切到 HTML / CSS / JS 分栏' : '已切到单文件混写');
      });
    });

    $('#plReset').addEventListener('click', function () {
      var m = $$('#playMode .on')[0].getAttribute('data-mode');
      allEditors().forEach(function (ed) {
        var k = ed.getAttribute('data-role');
        ed.value = k === 'html' ? (m === 'split' ? htmlSeed : singleSeed) : (k === 'css' ? cssSeed : jsSeed);
        updateMeta(ed);
      });
      currentBox().dispatchEvent(new Event('demo:repaint'));
      toast('已还原示例');
    });
    $('#plCopy').addEventListener('click', function () { copyText(collect()); });
    $('#plClear').addEventListener('click', function () { setAll(''); toast('已清空'); });
  }

  /* ---------------- JavaScript 速查 ---------------- */
  function viewJsHome(params) {
    params = params || {};
    var groups = window.JS_GROUPS;
    /* 内置实例 + 自定义 JS 条目，统一成同一种结构再渲染 */
    var examples = (window.JS_EXAMPLES || []).map(function (e) {
      return { key: e.t, t: e.t, d: e.d, cat: e.cat, tags: e.tags || [], html: e.html, css: e.css, js: e.js, snip: '', custom: false };
    }).concat(window.Store.list('js').map(function (e) {
      return { key: e.n, t: e.n, d: e.d, cat: e.c, tags: e.tags || [], html: e.html, css: e.css, js: e.js, snip: e.snip || '', custom: true, raw: e };
    }));
    if (params.custom) examples = examples.filter(function (e) { return e.custom; });
    var exCats = uniqArr((window.JS_EXAMPLE_CATS || []).concat(examples.map(function (e) { return e.cat; }).filter(Boolean)));
    var gd = window.JS_GROUP_DEMOS || {};
    var count = groups.reduce(function (a, g) { return a + g.items.length; }, 0);

    var anchor = '<div class="anchor-bar only-narrow" id="jsAnchor">' +
      '<span class="ab-title">快速跳转</span>' +
      groups.map(function (g, i) {
        return '<button class="chip" data-jump="js-' + i + '">' + g.icon + ' ' + esc(g.t) + '</button>';
      }).join('') +
      '<button class="chip" data-jump="js-examples">🚀 可运行实例</button></div>';

    var cards = groups.map(function (g, i) {
      var d = gd[g.t];
      var run = d ? '<div class="snip-run">' +
        '<button class="stage-empty" data-grp="' + i + '">▶ 运行本组示例</button>' +
        '<div class="snip-stage" data-stage="g' + i + '"></div></div>' : '';
      return '<div class="card" id="js-' + i + '">' +
        '<div class="card-head"><h2>' + g.icon + ' ' + esc(g.t) + '</h2>' +
        '<span class="small dim">' + g.items.length + ' 条' + (d ? ' · 带可运行示例' : '') + '</span></div>' +
        '<p class="small dim" style="margin:0 0 10px">' + esc(g.intro) + '</p>' +
        run +
        '<div class="table-wrap"><table class="grid js-grid"><thead><tr>' +
        '<th class="nosort" style="width:52%">写法</th><th class="nosort">说明</th><th class="nosort" style="width:64px"></th>' +
        '</tr></thead><tbody>' +
        g.items.map(function (it, j) {
          return '<tr>' +
            '<td><pre class="code inline-code">' + window.HL.js(it.c) + '</pre></td>' +
            '<td class="small">' + esc(it.d) + '</td>' +
            '<td><button class="btn-icon" data-copy-js="' + i + '.' + j + '" title="复制" aria-label="复制代码">&#9113;</button></td>' +
            '</tr>';
        }).join('') + '</tbody></table></div></div>';
    }).join('');

    var exCards = examples.map(function (e, i) {
      return '<div class="card ex-card' + (e.custom ? ' ex-custom' : '') + '" id="ex-' + i + '" data-cat="' + esc(e.cat) + '">' +
        '<div class="card-head"><h3>' +
        (e.custom ? '<a href="#/js/ex/' + encodeURIComponent(e.key) + '">' + esc(e.t) + '</a>' : esc(e.t)) + '</h3>' +
        '<span class="badge plain">' + esc(e.cat) + '</span>' +
        (e.custom ? '<span class="badge custom">✦ 自定义</span>' : '') + '</div>' +
        '<p class="small dim" style="margin:0 0 10px">' + esc(e.d) + '</p>' +
        '<div class="tag-cloud" style="margin-bottom:10px">' +
        e.tags.map(function (t2) { return '<span class="tag-pill small">' + esc(t2) + '</span>'; }).join('') +
        '</div>' +
        (e.snip ? '<pre class="code inline-code">' + window.HL.js(e.snip) + '</pre>' : '') +
        demoBlock([
          { label: 'HTML', key: 'html', code: e.html },
          { label: 'CSS', key: 'css', code: e.css, collapsed: !e.css },
          { label: 'JavaScript', key: 'js', code: e.js }
        ], { id: 'jsex' + i, height: 520 }) +
        (e.custom ? '<div class="chips" style="margin-top:12px">' +
          '<a class="btn sm" href="#/js/ex/' + encodeURIComponent(e.key) + '">打开详情页</a>' +
          '<button class="btn sm" data-edit-js="' + esc(e.key) + '">编辑</button>' +
          '<button class="btn sm danger" data-del-js="' + esc(e.key) + '">删除</button></div>' : '') +
        '</div>';
    }).join('');

    /* 严格 h1–h6：h1 页面标题 → h2 分组 / 实例小节 → h3 各实例 */
    var secs = [{ id: 'page-title', t: 'JavaScript 速查', level: 1 }];
    groups.forEach(function (g, i) {
      secs.push({ id: 'js-' + i, t: g.t, level: 2, count: g.items.length });
    });
    secs.push({ id: 'js-examples', t: '\uD83D\uDE80 可运行实例', level: 2, count: examples.length });
    examples.forEach(function (e, i) {
      secs.push({
        id: 'ex-' + i, t: e.t, level: 3,
        hay: (e.t + ' ' + e.d + ' ' + e.cat + ' ' + (e.tags || []).join(' ')).toLowerCase()
      });
    });

    render(crumbs([{ t: 'JavaScript 速查' }]) +
      '<div class="page-head"><h1 class="page-title" id="page-title">JavaScript 速查</h1>' +
      '<p class="page-sub">' + count + ' 条常用写法 + 10 组配套示例 + ' + examples.length +
      ' 个综合实例（含自定义 ' + window.Store.count('js') + ' 个）；左侧大纲按分组跳转，示例都能在预览里跑起来，控制台会显示输出与报错</p></div>' +
      outlinePage(outlineBlock(secs, { title: 'JS 速查大纲' }),
        anchor + cards +
        '<h2 class="sec-title" id="js-examples">🚀 可运行实例</h2>' +
        '<div class="chips" id="exFilter">' +
        ['全部'].concat(exCats).map(function (c, i) {
          return '<button class="chip' + (i === 0 ? ' on' : '') + '" data-cat="' + esc(c) + '">' + esc(c) + '</button>';
        }).join('') + '</div>' +
        '<div class="chips" style="margin-bottom:12px">' +
        '<button class="btn sm primary" id="jsAddBtn">＋ 添加自定义 JS 条目</button>' +
        (params.custom ? '<a class="btn sm" href="#/js?to=examples">← 返回全部实例</a>'
          : '<a class="btn sm" href="#/js?custom=1">✦ 只看自定义（' + window.Store.count('js') + '）</a>') +
        '<a class="btn sm" href="#/mine">📦 我的代码示例库</a></div>' +
        (examples.length ? exCards
          : '<div class="card"><p class="muted" style="margin:0">还没有实例，点上方按钮添加一条吧。</p></div>')));

    bindOutline();

    /* 窄屏锚点条 */
    $$('#jsAnchor .chip').forEach(function (a) {
      a.addEventListener('click', function () {
        var target = document.getElementById(a.getAttribute('data-jump'));
        if (target) window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 76, behavior: 'smooth' });
      });
    });

    /* 复制单条写法 */
    $$('#view [data-copy-js]').forEach(function (b) {
      b.addEventListener('click', function () {
        var ref = b.getAttribute('data-copy-js').split('.');
        var item = window.JS_GROUPS[Number(ref[0])].items[Number(ref[1])];
        copyText(item.c);
      });
    });

    /* 分组示例：点开才加载沙盒 */
    $$('#view [data-grp]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var i = Number(btn.getAttribute('data-grp'));
        var g = groups[i];
        var d = gd[g.t];
        var host = btn.parentNode;
        var stage = $('[data-stage]', host);
        if (!d || !stage) return;
        if (stage.getAttribute('data-loaded') === '1') { btn.remove(); return; }
        stage.setAttribute('data-loaded', '1');
        stage.innerHTML = demoBlock([
          { label: 'HTML', key: 'html', code: d.html, collapsed: true },
          { label: 'CSS', key: 'css', code: d.css || '', collapsed: true },
          { label: 'JavaScript', key: 'js', code: d.js }
        ], { id: 'jsg' + i, height: 420, compact: true, maxH: 460 });
        bindDemos(stage);
        btn.remove();
      });
    });

    /* 实例分类筛选 */
    $$('#exFilter .chip').forEach(function (b) {
      b.addEventListener('click', function () {
        var c = b.getAttribute('data-cat');
        $$('#exFilter .chip').forEach(function (x) { x.classList.remove('on'); });
        b.classList.add('on');
        $$('#view .ex-card').forEach(function (s) {
          s.hidden = !(c === '全部' || s.getAttribute('data-cat') === c);
        });
      });
    });

    /* 自定义 JS 条目：添加 / 编辑 / 删除 */
    var jsAddBtn = $('#jsAddBtn');
    if (jsAddBtn) jsAddBtn.addEventListener('click', function () { openJsForm(null); });
    $$('#view [data-edit-js]').forEach(function (b) {
      b.addEventListener('click', function () {
        var it = window.Store.get('js', b.getAttribute('data-edit-js'));
        if (it) openJsForm(it);
      });
    });
    $$('#view [data-del-js]').forEach(function (b) {
      b.addEventListener('click', function () {
        var n = b.getAttribute('data-del-js');
        openModal('删除自定义 JS 条目', '<p>确定删除「' + esc(n) + '」？此操作不可撤销。</p>',
          '<button class="btn" data-close>取消</button><button class="btn danger" id="okDel">删除</button>',
          function () {
            window.Store.remove('js', n); toast('已删除'); closeModal();
            buildNav(location.hash); route();
          });
      });
    });

    /* 支持 #/js?g=3 与 #/js?to=examples 直达 */
    var jumpTo = params.g !== undefined ? 'js-' + Number(params.g) : (params.to === 'examples' ? 'js-examples' : '');
    if (jumpTo) {
      setTimeout(function () {
        var el = document.getElementById(jumpTo);
        if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 76, behavior: 'smooth' });
      }, 80);
    }
  }

  /* ---------------- 自定义 JS 条目详情 ---------------- */
  function viewJsEntry(name) {
    var e = findJsEntry(name);
    if (!e) {
      render('<div class="card"><h2>未找到 JS 条目「' + esc(name) + '」</h2>' +
        '<p class="muted small">它可能已被删除，或者你可以<a href="#/manage">添加为自定义 JS 条目</a>。</p>' +
        '<div class="chips" style="margin-top:12px"><a class="btn sm" href="#/js">← 返回 JS 速查</a></div></div>');
      return;
    }
    var isCustom = !!e.custom;
    var tags = e.tags || [];

    render(crumbs([{ t: 'JavaScript 速查', h: '#/js' }, { t: isCustom ? '自定义条目' : '可运行实例', h: '#/js?to=examples' }, { t: e.n || e.t }]) +
      '<div class="page-head"><h1 class="page-title">' + esc(e.n || e.t) +
      (isCustom ? ' <span class="badge custom">✦ 自定义</span>' : '') + '</h1>' +
      '<p class="page-sub">' + esc(e.d) + '</p></div>' +

      '<div class="card"><div class="card-head"><h3>说明</h3>' +
      '<span class="badge plain">' + esc(e.c || e.cat || '自定义') + '</span></div>' +
      (e.u ? '<p style="margin:0">' + esc(e.u) + '</p>' : '<p class="muted small" style="margin:0">（未填写详细讲解）</p>') +
      (tags.length ? '<div class="tag-cloud" style="margin-top:12px">' +
        tags.map(function (t) { return '<span class="tag-pill small">' + esc(t) + '</span>'; }).join('') + '</div>' : '') +
      '</div>' +

      (e.snip ? '<div class="card"><div class="card-head"><h3>核心写法</h3>' +
        '<button class="btn sm" id="copySnip">⧉ 复制</button></div>' +
        '<pre class="code">' + window.HL.js(e.snip) + '</pre></div>' : '') +

      '<div class="card"><div class="card-head"><h3>实时演示</h3>' +
      '<span class="small dim">改完代码点「重新运行」或按 Ctrl/⌘ + Enter，控制台会显示输出与报错</span></div>' +
      demoBlock([
        { label: 'HTML', key: 'html', code: e.html },
        { label: 'CSS', key: 'css', code: e.css, collapsed: !e.css },
        { label: 'JavaScript', key: 'js', code: e.js }
      ], { id: 'jse-' + (e.n || e.t), height: 520 }) + '</div>' +

      (isCustom ? '<div class="card"><div class="card-head"><h3>自定义条目操作</h3>' +
        '<span class="small dim">更新于 ' + esc((e.updatedAt || '').slice(0, 10)) + '</span></div>' +
        '<div class="chips"><button class="btn" id="editJs">编辑此条目</button>' +
        '<button class="btn danger" id="delJs">删除此条目</button>' +
        '<a class="btn sm" href="#/js">← 返回 JS 速查</a></div></div>' : ''));

    if (e.snip) $('#copySnip').addEventListener('click', function () { copyText(e.snip); });
    if (isCustom) {
      $('#editJs').addEventListener('click', function () { openJsForm(e); });
      $('#delJs').addEventListener('click', function () {
        openModal('删除自定义 JS 条目', '<p>确定删除「' + esc(e.n) + '」？此操作不可撤销。</p>',
          '<button class="btn" data-close>取消</button><button class="btn danger" id="okDel">删除</button>',
          function () {
            window.Store.remove('js', e.n); toast('已删除'); closeModal();
            buildNav(location.hash); location.hash = '#/js';
          });
      });
    }
  }

  /* ---------------- 我的示例（代码片段库） ---------------- */
  function viewMine(params) {
    params = params || {};
    var list = allMine();
    var cats = uniqArr(['全部'].concat(MINE_CATS).concat(list.map(function (s) { return s.c; }).filter(Boolean)));
    var catParam = params.cat || '全部';

    var cards = list.map(function (s) {
      return '<div class="card mine-card" data-cat="' + esc(s.c) + '" data-hay="' +
        esc((s.n + ' ' + (s.d || '') + ' ' + s.c + ' ' + (s.tags || []).join(' ') + ' ' + s.html + ' ' + s.css + ' ' + s.js).toLowerCase()) + '">' +
        '<div class="card-head"><h3><a href="#/mine/' + encodeURIComponent(s.n) + '">' + esc(s.n) + '</a></h3>' +
        '<span class="badge plain">' + esc(s.c) + '</span></div>' +
        '<p class="small dim" style="margin:0 0 10px">' + esc(s.d || '（无说明）') + '</p>' +
        ((s.tags || []).length ? '<div class="tag-cloud" style="margin-bottom:10px">' +
          s.tags.map(function (t) { return '<span class="tag-pill small">' + esc(t) + '</span>'; }).join('') + '</div>' : '') +
        '<div class="code-peek">' +
        (s.html ? '<span class="peek-tag">HTML</span>' : '') +
        (s.css ? '<span class="peek-tag">CSS</span>' : '') +
        (s.js ? '<span class="peek-tag">JS</span>' : '') +
        '<span class="small dim" style="margin-left:auto">' + esc((s.updatedAt || '').slice(0, 10)) + '</span>' +
        '</div>' +
        '<div class="chips" style="margin-top:12px">' +
        '<a class="btn sm primary" href="#/mine/' + encodeURIComponent(s.n) + '">▶ 打开演示</a>' +
        '<button class="btn sm" data-edit-mine="' + esc(s.n) + '">编辑</button>' +
        '<button class="btn sm danger" data-del-mine="' + esc(s.n) + '">删除</button></div></div>';
    }).join('');

    render(crumbs([{ t: '我的示例' }]) +
      '<div class="page-head"><h1 class="page-title">我的代码示例库</h1>' +
      '<p class="page-sub">存放任意 HTML + CSS + JavaScript 片段，打开即带三栏编辑与实时预览；' +
      '数据保存在本机 localStorage，可在「数据管理」里导出备份</p></div>' +

      '<div class="toolbar"><div class="inline-search"><span class="ic">🔍</span>' +
      '<input id="mineSearch" type="search" placeholder="搜索名称 / 说明 / 标签 / 代码内容" autocomplete="off"></div>' +
      '<div class="field"><label>分类</label><select id="mineCat">' +
      cats.map(function (c) {
        return '<option value="' + esc(c) + '"' + (catParam === c ? ' selected' : '') + '>' + esc(c) + '</option>';
      }).join('') + '</select></div>' +
      '<div class="chips"><button class="btn primary sm" id="mineAdd">＋ 新建示例</button>' +
      '<a class="btn sm" href="#/manage">⇅ 导入 / 导出</a></div></div>' +

      (list.length ? '<div class="mine-grid" id="mineGrid">' + cards + '</div>' +
        '<div class="card" id="mineEmpty" hidden><p class="muted" style="margin:0">没有匹配的示例。</p></div>'
        : '<div class="card"><p class="muted" style="margin:0">还没有任何示例。点击「新建示例」把常用的 HTML / CSS / JS 片段存进来，' +
        '以后打开就能直接跑与改。</p>' +
        '<div class="chips" style="margin-top:12px"><button class="btn primary sm" id="mineAdd2">＋ 新建第一个示例</button></div></div>'));

    var add1 = $('#mineAdd'), add2 = $('#mineAdd2');
    if (add1) add1.addEventListener('click', function () { openMineForm(null); });
    if (add2) add2.addEventListener('click', function () { openMineForm(null); });

    function applyFilter() {
      var input = $('#mineSearch');
      if (!input) return;
      var q = input.value.trim().toLowerCase();
      var c = ($('#mineCat') || {}).value || '全部';
      var shown = 0;
      $$('#view .mine-card').forEach(function (card) {
        var hit = (!q || (card.getAttribute('data-hay') || '').indexOf(q) >= 0) &&
          (c === '全部' || card.getAttribute('data-cat') === c);
        card.hidden = !hit;
        if (hit) shown++;
      });
      var empty = $('#mineEmpty');
      if (empty) empty.hidden = shown > 0;
    }
    var ms = $('#mineSearch');
    if (ms) ms.addEventListener('input', applyFilter);
    var mc = $('#mineCat');
    if (mc) mc.addEventListener('change', applyFilter);

    $$('#view [data-edit-mine]').forEach(function (b) {
      b.addEventListener('click', function () {
        var it = window.Store.get('mine', b.getAttribute('data-edit-mine'));
        if (it) openMineForm(it);
      });
    });
    $$('#view [data-del-mine]').forEach(function (b) {
      b.addEventListener('click', function () {
        var n = b.getAttribute('data-del-mine');
        openModal('删除示例', '<p>确定删除示例「' + esc(n) + '」？此操作不可撤销。</p>',
          '<button class="btn" data-close>取消</button><button class="btn danger" id="okDel">删除</button>',
          function () {
            window.Store.remove('mine', n); toast('已删除'); closeModal();
            buildNav(location.hash); route();
          });
      });
    });
  }

  /* ---------------- 我的示例详情 ---------------- */
  function viewMineItem(name) {
    var s = findMine(name);
    if (!s) {
      render('<div class="card"><h2>未找到示例「' + esc(name) + '」</h2>' +
        '<div class="chips" style="margin-top:12px"><a class="btn sm" href="#/mine">← 返回我的示例</a>' +
        '<button class="btn sm primary" id="mkNew">＋ 新建示例</button></div></div>');
      $('#mkNew').addEventListener('click', function () { openMineForm(null); });
      return;
    }
    render(crumbs([{ t: '我的示例', h: '#/mine' }, { t: s.n }]) +
      '<div class="page-head"><h1 class="page-title">' + esc(s.n) +
      ' <span class="badge custom">✦ 我的示例</span></h1>' +
      '<p class="page-sub">' + esc(s.d || '（无说明）') + '</p></div>' +

      '<div class="card"><div class="card-head"><h3>信息</h3>' +
      '<span class="badge plain">' + esc(s.c) + '</span></div>' +
      '<div class="kv-list">' +
      '<div class="kv"><div class="k">分类</div><div class="v small">' + esc(s.c) + '</div></div>' +
      '<div class="kv"><div class="k">更新时间</div><div class="v small">' + esc((s.updatedAt || '').slice(0, 10)) + '</div></div>' +
      '<div class="kv"><div class="k">代码组成</div><div class="v small">' +
      [s.html ? 'HTML' : '', s.css ? 'CSS' : '', s.js ? 'JavaScript' : ''].filter(Boolean).join(' + ') + '</div></div>' +
      '</div>' +
      ((s.tags || []).length ? '<div class="tag-cloud" style="margin-top:12px">' +
        s.tags.map(function (t) { return '<span class="tag-pill small">' + esc(t) + '</span>'; }).join('') + '</div>' : '') +
      '</div>' +

      '<div class="card"><div class="card-head"><h3>实时演示</h3>' +
      '<span class="small dim">三栏都可编辑，改动即时生效；JavaScript 的输出与报错看控制台</span></div>' +
      demoBlock([
        { label: 'HTML', key: 'html', code: s.html, collapsed: false },
        { label: 'CSS', key: 'css', code: s.css, collapsed: !s.css },
        { label: 'JavaScript', key: 'js', code: s.js, collapsed: !s.js }
      ], { id: 'mine-' + s.n, height: 520 }) + '</div>' +

      '<div class="card"><div class="card-head"><h3>操作</h3></div>' +
      '<div class="chips">' +
      '<button class="btn" id="editMine">编辑此示例</button>' +
      '<button class="btn" id="dupMine">⧧ 复刻一份</button>' +
      '<button class="btn danger" id="delMine">删除此示例</button>' +
      '<a class="btn sm" href="#/mine">← 返回我的示例</a></div></div>');

    $('#editMine').addEventListener('click', function () { openMineForm(s); });
    $('#dupMine').addEventListener('click', function () {
      var copy = {};
      for (var k in s) copy[k] = s[k];
      var base = s.n.replace(/\s*\((\d+)\)$/, '');
      var i = 2, name = base + ' (2)';
      while (window.Store.get('mine', name)) { i++; name = base + ' (' + i + ')'; }
      copy.n = name;
      window.Store.add('mine', copy);
      toast('已复刻为「' + name + '」');
      buildNav(location.hash);
      location.hash = '#/mine/' + encodeURIComponent(name);
    });
    $('#delMine').addEventListener('click', function () {
      openModal('删除示例', '<p>确定删除「' + esc(s.n) + '」？此操作不可撤销。</p>',
        '<button class="btn" data-close>取消</button><button class="btn danger" id="okDel">删除</button>',
        function () {
          window.Store.remove('mine', s.n); toast('已删除'); closeModal();
          buildNav(location.hash); location.hash = '#/mine';
        });
    });
  }

  /* ---------------- 数据管理 ---------------- */
  function viewManage() {
    var tags = window.Store.list('tag');
    var csss = window.Store.list('css');
    var jss = window.Store.list('js');
    var mines = window.Store.list('mine');

    /* 四类自定义数据共用一套表格：列定义 + 行渲染 */
    function table(kind, rows, cols, addId) {
      return '<div class="card"><div class="card-head"><h3>' +
        ({ tag: '我的自定义 HTML 标签', css: '我的自定义 CSS 属性', js: '我的自定义 JS 条目', mine: '我的代码示例' }[kind]) + '</h3>' +
        '<button class="btn primary sm" id="' + addId + '">＋ 添加</button></div>' +
        (rows.length ? '<div class="table-wrap"><table class="grid"><thead><tr>' +
          cols.map(function (c) { return '<th class="nosort">' + c + '</th>'; }).join('') +
          '</tr></thead><tbody>' + rows + '</tbody></table></div>'
          : '<p class="muted small">还没有内容，点击右上角「添加」补充你自己的条目。</p>') +
        '</div>';
    }
    function opCell(kind, name) {
      return '<td><div class="cell-actions">' +
        '<button class="btn sm" data-edit-kind="' + kind + '" data-edit="' + esc(name) + '">编辑</button>' +
        '<button class="btn sm danger" data-del-kind="' + kind + '" data-del="' + esc(name) + '">删除</button></div></td>';
    }
    function dateCell(x) { return '<td class="small dim">' + (x.updatedAt ? String(x.updatedAt).slice(0, 10) : '—') + '</td>'; }

    var tagRows = tags.map(function (t) {
      return '<tr class="row-custom"><td class="tag-cell"><span class="tag-brackets">&lt;</span>' +
        '<a href="#/tag/' + encodeURIComponent(t.n) + '">' + esc(t.n) + '</a><span class="tag-brackets">&gt;</span></td>' +
        '<td class="small">' + esc(t.d) + '</td><td class="small">' + esc(t.c) + '</td>' +
        '<td>' + badge(t.s) + '</td>' + dateCell(t) + opCell('tag', t.n) + '</tr>';
    }).join('');

    var cssRows = csss.map(function (p) {
      return '<tr class="row-custom"><td class="attr-name">' +
        '<a href="#/css/prop/' + encodeURIComponent(p.n) + '">' + esc(p.n) + '</a></td>' +
        '<td class="small">' + esc(p.d) + '</td><td class="small">' + esc(p.c) + '</td>' +
        '<td class="small mono dim">' + esc(p.v || '—') + '</td>' + dateCell(p) + opCell('css', p.n) + '</tr>';
    }).join('');

    var jsRows = jss.map(function (e) {
      return '<tr class="row-custom"><td class="attr-name">' +
        '<a href="#/js/ex/' + encodeURIComponent(e.n) + '">' + esc(e.n) + '</a></td>' +
        '<td class="small">' + esc(e.d) + '</td><td class="small">' + esc(e.c) + '</td>' +
        '<td class="small dim">' + esc((e.tags || []).join(' / ') || '—') + '</td>' + dateCell(e) + opCell('js', e.n) + '</tr>';
    }).join('');

    var mineRows = mines.map(function (s) {
      return '<tr class="row-custom"><td class="attr-name">' +
        '<a href="#/mine/' + encodeURIComponent(s.n) + '">' + esc(s.n) + '</a></td>' +
        '<td class="small">' + esc(s.d || '—') + '</td><td class="small">' + esc(s.c) + '</td>' +
        '<td class="small dim">' + [s.html ? 'HTML' : '', s.css ? 'CSS' : '', s.js ? 'JS' : ''].filter(Boolean).join(' + ') + '</td>' +
        dateCell(s) + opCell('mine', s.n) + '</tr>';
    }).join('');

    var total = tags.length + csss.length + jss.length + mines.length;

    render(crumbs([{ t: '数据管理' }]) +
      '<div class="page-head"><h1 class="page-title">数据管理</h1>' +
      '<p class="page-sub">自定义标签、CSS 属性、JS 条目与代码示例都保存在浏览器 localStorage 中，不会上传；' +
      '可导出 JSON 备份或迁移到其他设备</p></div>' +

      '<div class="card"><div class="card-head"><h3>添加自定义内容</h3>' +
      '<span class="small dim">当前共 ' + total + ' 条自定义数据</span></div>' +
      '<div class="chips">' +
      '<button class="btn" id="mgAddTag">🏷 添加 HTML 标签</button>' +
      '<button class="btn" id="mgAddCss">🎨 添加 CSS 属性</button>' +
      '<button class="btn" id="mgAddJs">⚡ 添加 JS 条目</button>' +
      '<button class="btn" id="mgAddMine">📦 新建代码示例</button>' +
      '</div></div>' +

      table('tag', tagRows, ['标签名', '说明', '分类', '状态', '更新时间', '操作'], 'mgAdd') +
      table('css', cssRows, ['属性名', '说明', '分类', '常用取值', '更新时间', '操作'], 'mgAddCss2') +
      table('js', jsRows, ['条目名称', '说明', '分类', '标签', '更新时间', '操作'], 'mgAddJs2') +
      table('mine', mineRows, ['示例名称', '说明', '分类', '代码组成', '更新时间', '操作'], 'mgAddMine2') +

      '<div class="card"><div class="card-head"><h3>导入 / 导出</h3></div>' +
      '<div class="chips">' +
      '<button class="btn" id="mgExport">⬇ 导出 JSON 备份</button>' +
      '<button class="btn" id="mgImport">⬆ 导入 JSON</button>' +
      '<button class="btn" id="mgSample">📄 载入示例数据</button>' +
      '<button class="btn danger" id="mgClear">🗑 清空全部自定义数据</button>' +
      '</div>' +
      '<input type="file" id="mgFile" accept=".json,application/json" hidden>' +
      '<p class="small dim" style="margin-top:10px">导入时可选合并（保留现有数据、同名覆盖）或替换（清空后写入）。' +
      '导出文件含 customTags / customCss / customJs / mySnippets 四类数据。</p>' +
      '</div>' +

      '<div class="card"><div class="card-head"><h3>存储信息</h3></div>' +
      '<div class="kv-list">' +
      '<div class="kv"><div class="k">自定义 HTML 标签</div><div class="v">' + tags.length + '</div></div>' +
      '<div class="kv"><div class="k">自定义 CSS 属性</div><div class="v">' + csss.length + '</div></div>' +
      '<div class="kv"><div class="k">自定义 JS 条目</div><div class="v">' + jss.length + '</div></div>' +
      '<div class="kv"><div class="k">我的代码示例</div><div class="v">' + mines.length + '</div></div>' +
      '<div class="kv"><div class="k">内置标签 / 属性</div><div class="v">' + window.TAG_DATA.length + ' / ' + window.CSS_PROPS.length + '</div></div>' +
      '<div class="kv"><div class="k">存储位置</div><div class="v small">localStorage · htmlcheat.custom* .v1</div></div>' +
      '</div></div>');

    $('#mgAdd').addEventListener('click', function () { openTagForm(null); });
    [['#mgAddTag', function () { openTagForm(null); }],
     ['#mgAddCss', function () { openCssForm(null); }],
     ['#mgAddCss2', function () { openCssForm(null); }],
     ['#mgAddJs', function () { openJsForm(null); }],
     ['#mgAddJs2', function () { openJsForm(null); }],
     ['#mgAddMine', function () { openMineForm(null); }],
     ['#mgAddMine2', function () { openMineForm(null); }]].forEach(function (pair) {
      var el = $(pair[0]);
      if (el) el.addEventListener('click', pair[1]);
    });
    $('#mgExport').addEventListener('click', function () {
      var txt = window.Store.exportJSON();
      download('html-cheatsheet-custom-' + new Date().toISOString().slice(0, 10) + '.json', txt);
      toast('已导出 JSON 备份');
    });
    $('#mgImport').addEventListener('click', function () { $('#mgFile').click(); });
    $('#mgFile').addEventListener('change', function () {
      var f = this.files && this.files[0];
      if (!f) return;
      var reader = new FileReader();
      reader.onload = function () {
        openModal('导入方式',
          '<p class="small">已读取文件 <b>' + esc(f.name) + '</b>，请选择导入方式：</p>' +
          '<div class="chips" style="margin-top:12px">' +
          '<button class="btn" id="imMerge">合并（同名覆盖）</button>' +
          '<button class="btn" id="imReplace">替换（清空后写入）</button></div>',
          '<button class="btn" data-close>取消</button>', null);
        $('#imMerge').addEventListener('click', function () { doImport(reader.result, 'merge'); });
        $('#imReplace').addEventListener('click', function () { doImport(reader.result, 'replace'); });
      };
      reader.readAsText(f, 'utf-8');
      this.value = '';
    });
    $('#mgSample').addEventListener('click', function () {
      var sample = JSON.stringify({
        app: 'html-cheatsheet', version: 2,
        customTags: [
          {
            n: 'my-card', d: '业务卡片容器（团队内部约定）', c: '自定义', s: 'ok', dp: 'block', p: 3,
            u: '用于统一卡片外观：圆角、内边距与浅灰背景，配合 data-tone 切换色调。',
            a: [{ n: 'data-tone', v: 'default | primary | warn', e: 'data-tone="primary"', d: '卡片色调' }],
            demo: '<my-card data-tone="primary">\n  <h4>主色卡片</h4>\n  <p>这是自定义标签的演示内容。</p>\n</my-card>\n<my-card>默认色调卡片</my-card>',
            css: 'my-card { display: block; border: 1px solid #e3e7f0; border-radius: 12px; padding: 14px; margin-bottom: 10px; background: #f7f8fc; }\nmy-card[data-tone="primary"] { background: #eef1fe; border-color: #3b5bdb; }\nmy-card[data-tone="warn"] { background: #fdf3e2; border-color: #a86404; }'
          },
          {
            n: 'status-dot', d: '状态圆点指示器', c: '自定义', s: 'ok', dp: 'inline-block', p: 2,
            u: '在表格或列表中显示状态小圆点，颜色由 status 属性决定。',
            a: [{ n: 'status', v: 'ok | warn | error', e: 'status="ok"', d: '状态类型' }],
            demo: '<p>运行中 <status-dot status="ok"></status-dot></p>\n<p>警告 <status-dot status="warn"></status-dot></p>\n<p>异常 <status-dot status="error"></status-dot></p>',
            css: 'status-dot { display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: #8a93a8; vertical-align: middle; }\nstatus-dot[status="ok"] { background: #0f7b52; }\nstatus-dot[status="warn"] { background: #a86404; }\nstatus-dot[status="error"] { background: #c02a2a; }'
          }
        ],
        customCss: [
          {
            n: 'text-balance', d: '多行文本末尾自动平衡每行长度', c: '字体', v: 'wrap | balance | pretty',
            def: 'wrap', inherit: '是', animatable: '否', syntax: 'text-wrap: balance;',
            note: 'Chromium 114+ / Firefox 121+ 支持，常用于标题换行更美观。',
            vals: [{ v: 'balance', d: '让各行长度尽量平均' }, { v: 'pretty', d: '避免最后一行只有一个词' }],
            demo: '<h3 class="ttl">这一行标题很长很长很长很长很长很长很长</h3>\n<p class="ttl">段落文本也会参与平衡，阅读体验更好一些。</p>',
            css: '.ttl { text-wrap: balance; max-width: 22ch; margin: 8px 0; }'
          }
        ],
        customJs: [
          {
            n: '防抖 debounce', d: '连续触发时只在最后一次调用', c: '实用函数',
            u: '常用于搜索框输入、窗口 resize 等高频事件，避免每次都执行耗时逻辑。',
            snip: 'const debounce = (fn, ms = 300) => {\n  let t;\n  return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); };\n};',
            tags: ['函数', '性能', '闭包'],
            html: '<input id="inp" placeholder="随便输入点什么…">\n<p id="out">调用次数：0</p>',
            css: 'input { padding: 8px 10px; width: 220px; }\n#out { color: #3b5bdb; font-weight: 600; }',
            js: "const debounce = (fn, ms = 300) => {\n  let t;\n  return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); };\n};\nlet n = 0;\nconst out = document.getElementById('out');\nconst run = debounce((v) => { n++; out.textContent = `调用次数：${n} · 输入：${v}`; }, 400);\ndocument.getElementById('inp').addEventListener('input', (e) => run(e.target.value));"
          }
        ],
        mySnippets: [
          {
            n: '毛玻璃卡片', d: 'backdrop-filter 实现的半透明卡片', c: '特效', tags: ['CSS', '玻璃拟态'],
            html: '<div class="glass">\n  <h4>Glass Card</h4>\n  <p>背景虚化 + 半透明白 + 细边框。</p>\n</div>',
            css: 'body { background: linear-gradient(120deg,#3b5bdb,#4ddba0); padding: 20px; font-family: sans-serif; }\n.glass { backdrop-filter: blur(10px); background: rgba(255,255,255,.25); border: 1px solid rgba(255,255,255,.4); border-radius: 14px; padding: 18px; color: #fff; max-width: 320px; }\n.glass h4 { margin: 0 0 6px; }',
            js: ''
          }
        ]
      });
      doImport(sample, 'merge');
    });
    $('#mgClear').addEventListener('click', function () {
      openModal('清空自定义数据', '<p>将删除全部自定义标签（' + tags.length + '）、CSS 属性（' + csss.length +
        '）、JS 条目（' + jss.length + '）与代码示例（' + mines.length + '），此操作不可撤销。建议先导出备份。</p>',
        '<button class="btn" data-close>取消</button><button class="btn danger" id="okDel">确认清空</button>',
        function () { window.Store.clearAll(); toast('已清空'); buildNav(location.hash); viewManage(); });
    });

    /* 按类型分发编辑 / 删除 */
    var FORM = { tag: openTagForm, css: openCssForm, js: openJsForm, mine: openMineForm };
    var TIP = { tag: '自定义标签', css: '自定义 CSS 属性', js: '自定义 JS 条目', mine: '代码示例' };
    $$('#view [data-edit]').forEach(function (b) {
      b.addEventListener('click', function () {
        var kind = b.getAttribute('data-edit-kind') || 'tag';
        var n = b.getAttribute('data-edit');
        var it = window.Store.get(kind, n);
        if (it) FORM[kind](it);
      });
    });
    $$('#view [data-del]').forEach(function (b) {
      b.addEventListener('click', function () {
        var kind = b.getAttribute('data-del-kind') || 'tag';
        var n = b.getAttribute('data-del');
        openModal('删除' + TIP[kind], '<p>确定删除「' + esc(n) + '」？此操作不可撤销。</p>',
          '<button class="btn" data-close>取消</button><button class="btn danger" id="okDel">删除</button>',
          function () { window.Store.remove(kind, n); toast('已删除'); buildNav(location.hash); viewManage(); });
      });
    });

    function doImport(text, mode) {
      var r = window.Store.importJSON(text, mode);
      toast(r.msg);
      closeModal();
      buildNav(location.hash);
      viewManage();
    }
  }

  /* ---------------- 帮助 ---------------- */
  function viewHelp() {
    render(crumbs([{ t: '术语与快捷键' }]) +
      '<div class="page-head"><h1 class="page-title">术语对照与快捷键</h1></div>' +
      '<div class="card"><div class="card-head"><h3>中英文术语对照</h3></div>' +
      '<div class="table-wrap"><table class="grid"><thead><tr><th class="nosort">术语</th><th class="nosort">含义</th></tr></thead><tbody>' +
      window.GLOSSARY.map(function (g) {
        return '<tr><td class="small"><b>' + esc(g.en) + '</b></td><td class="small">' + esc(g.cn) + '</td></tr>';
      }).join('') + '</tbody></table></div></div>' +
      '<div class="card"><div class="card-head"><h3>自定义内容：除了标签，还能补 CSS 与 JS</h3>' +
      '<button class="btn sm primary" id="helpAdd">＋ 添加自定义内容</button></div>' +
      '<div class="table-wrap"><table class="grid"><thead><tr>' +
      '<th class="nosort">类型</th><th class="nosort">能补什么</th><th class="nosort">出现在哪</th></tr></thead><tbody>' +
      [['🏷 自定义 HTML 标签', '标签名、属性表、HTML / CSS / JS 示例', '标签速查表 → 自定义标签'],
       ['🎨 自定义 CSS 属性', '属性说明、取值、继承 / 可动画、三栏示例', 'CSS 属性速查表 → 自定义属性'],
       ['⚡ 自定义 JS 条目', '名称、核心写法、讲解、三栏示例', 'JavaScript 速查 → 可运行实例'],
       ['📦 我的代码示例', '任意 HTML / CSS / JS 片段，随时跑与改', '侧边栏「代码示例库」']
      ].map(function (r) {
        return '<tr><td class="small"><b>' + esc(r[0]) + '</b></td>' +
          '<td class="small">' + esc(r[1]) + '</td><td class="small">' + esc(r[2]) + '</td></tr>';
      }).join('') + '</tbody></table></div>' +
      '<p class="small dim" style="margin:10px 0 0">四类内容都保存在浏览器 localStorage，带 ✦ 自定义 角标，' +
      '可随时编辑 / 删除，并在「数据管理」里导出为一份 JSON 备份（customTags / customCss / customJs / mySnippets）。</p></div>' +

      '<div class="card"><div class="card-head"><h3>快捷键</h3></div>' +
      '<div class="table-wrap"><table class="grid kbd-table"><thead><tr><th class="nosort">按键</th><th class="nosort">功能</th></tr></thead><tbody>' +
      window.SHORTCUTS.map(function (s) {
        return '<tr><td><kbd class="k">' + esc(s.k) + '</kbd></td><td class="small">' + esc(s.d) + '</td></tr>';
      }).join('') + '</tbody></table></div></div>' +

      '<div class="card"><div class="card-head"><h3>实时演示区怎么用</h3>' +
      '<span class="small dim">标签详情页 / 属性详情页 / JS 实例 / 演练场</span></div>' +
      '<div class="callout"><div class="ttl">三栏：HTML · CSS · JavaScript</div><div class="small">' +
      '演示区左边按 HTML / CSS / JavaScript 分段，右边是沙盒化的 iframe 预览，三段代码会合成一个完整页面运行。' +
      'JavaScript 面板默认收起时点标题前的 <b>▸</b> 展开；面板都能单独折叠，把空间留给正在写的那一段。</div></div>' +
      '<div class="callout"><div class="ttl">console 与报错都能看到</div><div class="small">' +
      '预览里的 <code class="inline">console.log / warn / error</code>、未捕获异常、Promise rejection 都会出现在底部控制台；' +
      '右上角 <b>⌨</b> 按钮或底部的日志徽章可以随时开关它。写错变量名？会直接告诉你出错的行号。</div></div>' +
      '<div class="callout"><div class="ttl">预览沙盒与安全限制</div><div class="small">' +
      'iframe 使用 <code class="inline">sandbox="allow-scripts allow-modals allow-popups allow-forms"</code> 且无同源权限，' +
      '所以脚本跑不了 <code class="inline">localStorage</code> 之外的跨源操作、也读不到宿主页面；' +
      '但 localStorage 与 alert / confirm 在演练里是可用的。</div></div>' +
      '<div class="callout"><div class="ttl">编辑与预览永远同步</div><div class="small">' +
      '左侧改代码，右侧约 0.2 秒后自动重新渲染；底部状态点会显示「编辑中 → 渲染中 → 已同步」。' +
      '想立刻重跑（尤其是改了 JS 之后），按 <kbd class="k">Ctrl / ⌘ + Enter</kbd> 或 <kbd class="k">Ctrl / ⌘ + S</kbd>，也可以点 <b>⟳</b>；' +
      '万一写出死循环，点 ⟳ 会重载文档把它打断。两侧高度始终一致。</div></div>' +
      '<div class="callout"><div class="ttl">分栏、拖拽与全屏</div><div class="small">' +
      '默认是<b>左代码 / 右预览</b>，中间的分隔条可以左右拖动调整占比；窗口宽度小于 768px 时自动变成<b>上下堆叠</b>，' +
      '分隔条同步变成横向拖拽（鼠标分别是 col-resize / row-resize）。双击分隔条恢复默认比例，' +
      '聚焦后用 <kbd class="k">←</kbd> <kbd class="k">→</kbd>（窄屏 <kbd class="k">↑</kbd> <kbd class="k">↓</kbd>）可微调，' +
      '按住 Shift 步长为 5%，<kbd class="k">Home</kbd> 复位。右下角圆点拖动调整整体高度（不小于 320px）。</div></div>' +
      '<div class="callout"><div class="ttl">编辑区舒适度设置</div><div class="small">' +
      '顶部工具条有<b>自动换行</b>（长行不再横向滚动，此时行号会自动隐藏）、<b>行号</b>、<b>字号 12–18px</b> 与 <b>&#10530; 全屏</b>（Esc 退出）。' +
      '这些偏好连同拖过的比例与高度都会记进 localStorage，下次打开自动沿用。' +
      '编辑器保持原生 textarea，不引入重型编辑器库，代码高亮沿用站内轻量高亮方案（展示区）。</div></div>' +
      '<div class="callout"><div class="ttl">预览会跟随主题</div><div class="small">' +
      '预览 iframe 里注入了当前主题的 CSS 变量（--accent、--bg-elev 等），所以在页面上写的代码在预览里看到的配色就是最终效果；' +
      '切换主题时所有演示会一起重绘。按钮 <b>↺</b> 还原示例代码，<b>⧉</b> 复制当前代码。</div></div>' +
      '<div class="callout"><div class="ttl">大纲与效果预览</div><div class="small">' +
      '<b>CSS 属性速查表</b>与<b>JavaScript 速查</b>页左侧都有「本页大纲」，它<b>严格按页面标题的 h1 → h2 → h3 …（最多 h6）层级生成</b>：' +
      'h1 是页面标题、h2 是分类 / 分组、h3 是具体条目，缩进与字号逐级递进，不会出现跳级；' +
      '滚动时自动高亮当前位置并展开所在分支，点一下即跳转（窗口变窄时会自动换成顶部的横向跳转条）；' +
      '在属性页搜索时，大纲会跟着一起筛选，父级右侧显示命中的子项数量。' +
      '<b>CSS 代码片段</b>每张卡片都直接铺开「编辑器 + 实时预览」（和 <b>JS 可运行实例</b>一样的版式，不用点按钮），' +
      'HTML 面板默认折叠、点标题即可展开；<b>JS 速查</b>每组仍保留「▶ 运行本组示例」，点开才加载沙盒，避免一页开十几个预览。</div></div></div>' +

      '<div class="card"><div class="card-head"><h3>侧边导航与页面动效</h3>' +
      '<span class="small dim">左上角 ☰ 按钮</span></div>' +
      '<div class="callout"><div class="ttl">☰ 按钮的两种形态</div><div class="small">' +
      '窗口宽度大于 860px 时，点它会<b>收起 / 展开整条侧边导航</b>，把宽度全部让给正文（状态会记进 localStorage）；' +
      '窄于 860px 时侧边导航变成<b>抽屉</b>，点 ☰ 滑出，再点一次、点遮罩或按 <kbd class="k">Esc</kbd> 关闭。' +
      '两种情况下按钮图标都会在「三条杠 ↔ 叉」之间动画切换，快捷键是 <kbd class="k">[</kbd>。</div></div>' +
      '<div class="callout"><div class="ttl">隐藏顶栏（沉浸模式）</div><div class="small">' +
      '点顶栏右侧的<b>▭⌃ 按钮</b>或按 <kbd class="k">H</kbd>，顶栏整条收起，侧边导航与页内大纲会自动贴顶、铺满整屏，' +
      '正文上移，适合长时间阅读；此时顶部中间会出现一枚很淡的<b>「⌄ 显示顶栏」</b>浮标，点它、按 <kbd class="k">H</kbd> 或 <kbd class="k">Esc</kbd> 即可恢复。' +
      '状态会被记住，下次打开仍是你上次的选择；窄屏（≤860px）下顶栏里有导航按钮，该功能会自动禁用。</div></div>' +
      '<div class="callout"><div class="ttl">滚动与入场动效</div><div class="small">' +
      '顶栏下方有一条随滚动前进的<b>进度条</b>，向下滚动后顶栏会浮起并加深投影；' +
      '滚动超过一屏会出现右下角的<b>回到顶部</b>按钮。' +
      '正文里的卡片、磁贴、统计块会在进入视口时依次浮现（错开 45ms），切换页面时内容整体淡入。</div></div>' +
      '<div class="callout"><div class="ttl">不想看动画？</div><div class="small">' +
      '在 🎨 主题面板最下方点<b>「动效开关」</b>即可一键关闭全部动画与主题特效（状态同样会被记住）；' +
      '如果系统开启了「减少动效」（prefers-reduced-motion），站点会自动遵循该系统设置。</div></div></div>' +

      '<div class="card"><div class="card-head"><h3>配色主题</h3>' +
      '<span class="small dim">点击右上角 🎨 切换，共 ' + THEMES.length + ' 套，每套都带动态特效</span></div>' +
      '<div class="table-wrap"><table class="grid"><thead><tr>' +
      '<th class="nosort">主题</th><th class="nosort">类型</th><th class="nosort">特效</th><th class="nosort">说明</th></tr></thead><tbody>' +
      THEMES.map(function (t) {
        return '<tr><td class="small"><b>' + esc(t.name) + '</b> <span class="dim">' + t.id + '</span></td>' +
          '<td class="small dim">' + (t.mode === 'dark' ? '深色' : '浅色') + '</td>' +
          '<td class="small">' + esc(t.fxName) + '</td>' +
          '<td class="small">' + esc(t.desc) + '</td></tr>';
      }).join('') + '</tbody></table></div>' +
      '<p class="small dim" style="margin:10px 0 0">主题偏好保存在浏览器本地；未手动选择前会自动跟随系统的深浅色设置。' +
      '每套主题除了配色，还带一层全屏氛围特效（花瓣、网格扫描、流云、横线纸、霓虹故障、星光、落叶、代码雨、柔光），' +
      '特效层 pointer-events:none，不干扰任何操作。</p></div>');

    $('#helpAdd').addEventListener('click', function () { openAddMenu(); });
  }

  /* ---------------- 路由 ---------------- */
  function parse() {
    var h = location.hash.replace(/^#\/?/, '');
    var qi = h.indexOf('?');
    var path = qi >= 0 ? h.slice(0, qi) : h;
    var params = {};
    if (qi >= 0) {
      h.slice(qi + 1).split('&').forEach(function (kv) {
        var p = kv.split('=');
        if (p[0]) params[decodeURIComponent(p[0])] = decodeURIComponent(p[1] || '');
      });
    }
    var segs = path.split('/').filter(Boolean).map(decodeURIComponent);
    return { segs: segs, params: params };
  }

  function route() {
    var r = parse();
    var s = r.segs;
    buildNav(location.hash || '#/');
    closeSidebar();

    if (!s.length) return viewHome();
    if (s[0] === 'tags') return viewTags(r.params);
    if (s[0] === 'tag' && s[1]) return viewTag(s[1]);
    if (s[0] === 'css') {
      if (s[1] === 'selectors') return viewSelectors();
      if (s[1] === 'box') return viewBox();
      if (s[1] === 'flex') return viewFlex();
      if (s[1] === 'grid') return viewGrid();
      if (s[1] === 'position') return viewPosition();
      if (s[1] === 'props') return viewProps(r.params);
      if (s[1] === 'snippets') return viewSnips(r.params);
      if (s[1] === 'prop' && s[2]) return viewProp(s[2]);
      return viewCssIndex();
    }
    if (s[0] === 'play') return viewPlay();
    if (s[0] === 'js') {
      if (s[1] === 'ex' && s[2]) return viewJsEntry(s[2]);
      return viewJsHome(r.params);
    }
    if (s[0] === 'mine') {
      if (s[1]) return viewMineItem(s[1]);
      return viewMine(r.params);
    }
    if (s[0] === 'manage') return viewManage();
    if (s[0] === 'help') return viewHelp();
    viewHome();
  }

  /* ---------------- 搜索 ---------------- */
  var searchIdx = -1, searchItems = [];
  function buildSearchIndex() {
    var idx = [];
    allTags().forEach(function (t) {
      idx.push({ type: 'tag', name: t.n, desc: t.d, href: '#/tag/' + encodeURIComponent(t.n), s: t.s, custom: !!t.custom });
    });
    allCssProps().forEach(function (p) {
      idx.push({ type: 'css', name: p.n, desc: p.d, href: '#/css/prop/' + encodeURIComponent(p.n), s: 'ok', custom: !!p.custom });
    });
    window.CSS_SELECTORS.forEach(function (g) {
      g.items.forEach(function (it) {
        idx.push({ type: 'sel', name: it.s, desc: it.d, href: '#/css/selectors', s: 'ok' });
      });
    });
    (window.CSS_SNIPPETS || []).forEach(function (s) {
      idx.push({ type: 'snip', name: s.t, desc: s.d, href: '#/css/snippets', s: 'ok' });
    });
    (window.JS_GROUPS || []).forEach(function (g, gi) {
      g.items.forEach(function (it) {
        idx.push({ type: 'js', name: it.c, desc: it.d, href: '#/js', s: 'ok' });
      });
      void gi;
    });
    (window.JS_EXAMPLES || []).forEach(function (e) {
      idx.push({ type: 'jsex', name: e.t, desc: e.d, href: '#/js?to=examples', s: 'ok' });
    });
    window.Store.list('js').forEach(function (e) {
      idx.push({ type: 'jsex', name: e.n, desc: e.d, href: '#/js/ex/' + encodeURIComponent(e.n), s: 'ok', custom: true });
    });
    window.Store.list('mine').forEach(function (s) {
      idx.push({ type: 'mine', name: s.n, desc: s.d || ('代码示例 · ' + s.c), href: '#/mine/' + encodeURIComponent(s.n), s: 'ok', custom: true });
    });
    return idx;
  }
  function runSearch(q) {
    var panel = $('#searchPanel');
    q = q.trim().toLowerCase();
    if (!q) { panel.hidden = true; return; }
    var idx = buildSearchIndex();
    var hit = idx.filter(function (it) {
      return it.name.toLowerCase().indexOf(q) >= 0 || (it.desc || '').toLowerCase().indexOf(q) >= 0;
    });
    hit.sort(function (a, b) {
      var an = a.name.toLowerCase().indexOf(q) === 0 ? 0 : 1;
      var bn = b.name.toLowerCase().indexOf(q) === 0 ? 0 : 1;
      return an - bn || a.name.length - b.name.length;
    });
    searchItems = hit.slice(0, 40);
    searchIdx = searchItems.length ? 0 : -1;
    if (!searchItems.length) {
      panel.innerHTML = '<div class="sp-empty">没有找到「' + esc(q) + '」相关内容</div>';
    } else {
      var groups = { tag: 'HTML 标签', css: 'CSS 属性', sel: 'CSS 选择器', snip: 'CSS 代码片段', js: 'JavaScript 写法', jsex: 'JavaScript 实例', mine: '我的代码示例' };
      var html = '';
      ['tag', 'css', 'sel', 'snip', 'js', 'jsex', 'mine'].forEach(function (k) {
        var sub = searchItems.filter(function (it) { return it.type === k; });
        if (!sub.length) return;
        html += '<div class="sp-group">' + groups[k] + '</div>';
        sub.forEach(function (it) {
          var i = searchItems.indexOf(it);
          html += '<div class="sp-item' + (i === searchIdx ? ' sel' : '') + '" data-href="' + it.href + '" data-i="' + i + '">' +
            '<span class="sp-name">' + esc(it.name) + '</span>' +
            '<span class="sp-desc">' + esc(it.desc) + '</span></div>';
        });
      });
      panel.innerHTML = html;
      $$('.sp-item', panel).forEach(function (el) {
        el.addEventListener('mousedown', function () { location.hash = el.getAttribute('data-href'); });
      });
    }
    panel.hidden = false;
  }

  /* ---------------- 全局事件 ---------------- */
  var searchEl = $('#globalSearch');
  searchEl.addEventListener('input', function () {
    $('#clearSearch').hidden = !this.value;
    runSearch(this.value);
  });
  searchEl.addEventListener('keydown', function (e) {
    var panel = $('#searchPanel');
    if (e.key === 'Escape') { panel.hidden = true; this.blur(); return; }
    if (panel.hidden || !searchItems.length) {
      if (e.key === 'Enter' && this.value.trim()) {
        panel.hidden = true;
        var target = '#/tags?q=' + encodeURIComponent(this.value.trim());
        if (location.hash === target) route(); else location.hash = target;
        setTimeout(function () { searchEl.blur(); }, 50);
      }
      return;
    }
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      searchIdx += (e.key === 'ArrowDown' ? 1 : -1);
      if (searchIdx < 0) searchIdx = searchItems.length - 1;
      if (searchIdx >= searchItems.length) searchIdx = 0;
      $$('.sp-item', panel).forEach(function (el, i) {
        el.classList.toggle('sel', Number(el.getAttribute('data-i')) === searchIdx);
      });
      var sel = $('.sp-item.sel', panel);
      if (sel) sel.scrollIntoView({ block: 'nearest' });
      return;
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      var cur = searchItems[searchIdx];
      if (cur) { panel.hidden = true; location.hash = cur.href; }
    }
  });
  searchEl.addEventListener('blur', function () {
    setTimeout(function () { $('#searchPanel').hidden = true; }, 150);
  });
  $('#clearSearch').addEventListener('click', function () {
    searchEl.value = ''; this.hidden = true; $('#searchPanel').hidden = true; searchEl.focus();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === '/' && document.activeElement !== searchEl &&
      !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) {
      e.preventDefault();
      if (headOff) setHeadOff(false, true);  // 顶栏隐藏时先还原，再聚焦搜索
      searchEl.focus(); searchEl.select();
    }
    if (e.key === 'Escape') {
      $('#searchPanel').hidden = true;
      if (!$('#modal').hidden) closeModal();
    }
    if (e.key === 'Enter' && !$('#modal').hidden && modalState.onOk) {
      // modal ok 由具体按钮处理
    }
  });

  // 弹窗确认按钮（统一委托）
  $('#modalFoot').addEventListener('click', function (e) {
    if (e.target.id === 'okDel') {
      var fn = modalState.onOk || null;
      if (fn) { fn(); closeModal(); return; }
    }
  });

  /* ---------------- 主题 ----------------
     g = 分组；fx = 该主题的特效类型（见 buildFx），fxName = 面板上的小标签 */
  var THEMES = [
    { id: 'anime', g: '风格主题', name: '二次元', desc: '樱粉 · 青空', mode: 'light', fx: 'petal', fxName: '花瓣', sw: ['#eef4ff', '#ee3b78', '#4aa3ff'] },
    { id: 'tech', g: '风格主题', name: '科技', desc: '藏青 · 电蓝', mode: 'dark', fx: 'grid', fxName: '网格', sw: ['#070d1a', '#3da9ff', '#00e0ff'] },
    { id: 'pastoral', g: '风格主题', name: '田园', desc: '麦黄 · 橄榄', mode: 'light', fx: 'cloud', fxName: '流云', sw: ['#faf3e3', '#b9762a', '#7a9a3c'] },
    { id: 'school', g: '风格主题', name: '学校', desc: '笔记 · 墨蓝', mode: 'light', fx: 'ruled', fxName: '横线', sw: ['#f7f5ef', '#1f4e79', '#c98a3c'] },
    { id: 'cyberpunk', g: '风格主题', name: '赛博朋克', desc: '霓虹 · 电光', mode: 'dark', fx: 'neon', fxName: '霓虹', sw: ['#0a0611', '#ff2e97', '#00f0ff'] },
    { id: 'moe', g: '风格主题', name: '萌系', desc: '奶油 · 薄荷', mode: 'light', fx: 'sparkle', fxName: '星光', sw: ['#fff6f8', '#e84c85', '#3fbf9f'] },
    { id: 'nature', g: '风格主题', name: '大自然', desc: '森林 · 溪水', mode: 'light', fx: 'leaf', fxName: '落叶', sw: ['#e9f4ea', '#1f8a4c', '#2e9bd6'] },
    { id: 'it', g: '风格主题', name: 'IT', desc: '终端 · 代码雨', mode: 'dark', fx: 'matrix', fxName: '代码雨', sw: ['#05080a', '#2ee08a', '#7dd3fc'] },

    { id: 'light', g: '经典配色', name: '靛蓝', desc: '清爽默认', mode: 'light', fx: 'aura', fxName: '柔光', sw: ['#f5f6fa', '#3b5bdb', '#0f7b52'] },
    { id: 'sepia', g: '经典配色', name: '暖纸', desc: '护眼纸黄', mode: 'light', fx: 'aura', fxName: '柔光', sw: ['#f4eee2', '#a9582a', '#3d7a4d'] },
    { id: 'forest', g: '经典配色', name: '松林', desc: '沉静自然', mode: 'light', fx: 'aura', fxName: '柔光', sw: ['#eef5f0', '#1e7a52', '#226f86'] },
    { id: 'sakura', g: '经典配色', name: '樱花', desc: '柔和粉调', mode: 'light', fx: 'petal', fxName: '花瓣', sw: ['#fdf5f7', '#c2255c', '#2b8a5f'] },
    { id: 'violet', g: '经典配色', name: '紫罗兰', desc: '优雅紫调', mode: 'light', fx: 'aura', fxName: '柔光', sw: ['#f6f3fe', '#6741d9', '#2f7d5b'] },
    { id: 'ocean', g: '经典配色', name: '深海', desc: '深色 · 青', mode: 'dark', fx: 'aura', fxName: '柔光', sw: ['#06191f', '#35c3d8', '#4ddba0'] },
    { id: 'midnight', g: '经典配色', name: '午夜', desc: '深色 · 靛', mode: 'dark', fx: 'aura', fxName: '柔光', sw: ['#0f1219', '#7b93ff', '#4ddba0'] },
    { id: 'carbon', g: '经典配色', name: '石墨', desc: '深色 · 中性', mode: 'dark', fx: 'aura', fxName: '柔光', sw: ['#121212', '#e2a33f', '#7fd39b'] }
  ];
  var THEME_GROUPS = ['风格主题', '经典配色'];

  function themeById(id) {
    if (id === 'dark') id = 'midnight';
    for (var i = 0; i < THEMES.length; i++) if (THEMES[i].id === id) return THEMES[i];
    return null;
  }

  /* ---------------- 主题特效层 ---------------- */
  var reducedMotion = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  function rnd(a, b) { return a + Math.random() * (b - a); }
  function n1(v) { return Number(v).toFixed(1); }

  /* 生成飘落 / 上浮粒子 */
  function fxParticles(glyphs, n, o) {
    var out = '';
    for (var i = 0; i < n; i++) {
      out += '<span class="fx-p' + (o.up ? ' up' : '') + '" style="' +
        'left:' + rnd(0, 100).toFixed(2) + '%;' +
        'font-size:' + rnd(o.fMin, o.fMax).toFixed(0) + 'px;' +
        '--dx:' + rnd(o.dxMin, o.dxMax).toFixed(0) + 'px;' +
        '--spin:' + rnd(200, 560).toFixed(0) + 'deg;' +
        'animation-duration:' + n1(rnd(o.dMin, o.dMax)) + 's;' +
        'animation-delay:-' + n1(rnd(0, o.dMax)) + 's">' +
        glyphs[i % glyphs.length] + '</span>';
    }
    return out;
  }

  /* 生成代码雨列 */
  function fxMatrix(n) {
    var chars = '01{}[]<>/=+-*#$;:%&|!?アカサタナハマヤラワ';
    var out = '';
    for (var i = 0; i < n; i++) {
      var col = '';
      for (var j = 0; j < 34; j++) col += chars.charAt(Math.floor(Math.random() * chars.length)) + '\n';
      out += '<span class="fx-col" style="' +
        'left:' + rnd(0, 100).toFixed(2) + '%;' +
        'font-size:' + rnd(11, 15).toFixed(0) + 'px;' +
        'opacity:' + n1(rnd(.14, .34)) + ';' +
        'animation-duration:' + n1(rnd(9, 22)) + 's;' +
        'animation-delay:-' + n1(rnd(0, 22)) + 's">' + col + '</span>';
    }
    return out;
  }

  /* 生成云朵 */
  function fxClouds(n) {
    var out = '';
    for (var i = 0; i < n; i++) {
      out += '<span class="fx-cloud" style="' +
        'top:' + rnd(3, 55).toFixed(1) + '%;' +
        'font-size:' + rnd(34, 64).toFixed(0) + 'px;' +
        'animation-duration:' + rnd(60, 115) + 's;' +
        'animation-delay:-' + rnd(0, 115).toFixed(0) + 's">☁</span>';
    }
    return out;
  }

  function buildFx(type) {
    var layer = $('#fxLayer');
    if (!layer) return;
    if (reducedMotion || fxOff() || !type) { layer.innerHTML = ''; return; }
    var html = '<div class="fx-ambient"></div><div class="fx-ambient b"></div>';
    if (type === 'grid') {
      html += '<div class="fx-grid"></div><div class="fx-scan"></div>';
    } else if (type === 'neon') {
      html += '<div class="fx-grid"></div><div class="fx-scan"></div>' +
        '<div class="fx-glitch"></div><div class="fx-glitch" style="animation-delay:2.2s"></div>';
    } else if (type === 'ruled') {
      html += '<div class="fx-ruled"></div>' +
        fxParticles(['✎', '✏', '📎', '📐'], 7, { up: true, fMin: 14, fMax: 22, dxMin: -40, dxMax: 40, dMin: 22, dMax: 38 });
    } else if (type === 'petal') {
      html += fxParticles(['🌸', '✿', '❀', '🌷'], 14, { fMin: 14, fMax: 24, dxMin: -70, dxMax: 90, dMin: 15, dMax: 28 });
    } else if (type === 'leaf') {
      html += fxParticles(['🍃', '🌿', '🍂'], 12, { fMin: 15, fMax: 24, dxMin: -80, dxMax: 90, dMin: 17, dMax: 30 });
    } else if (type === 'sparkle') {
      html += fxParticles(['✨', '💗', '⭐', '♡', '🌟'], 14, { up: true, fMin: 14, fMax: 24, dxMin: -45, dxMax: 45, dMin: 13, dMax: 24 });
    } else if (type === 'cloud') {
      html += fxClouds(6);
    } else if (type === 'matrix') {
      html += fxMatrix(15);
    }
    layer.innerHTML = html;
  }

  function fxOff() { return window.Store.settings().fx === 'off'; }

  function applyFxState() {
    document.documentElement.classList.toggle('no-fx', fxOff() || reducedMotion);
  }

  /* 按当前主题重建特效层（fx 关闭或系统要求减少动效时留空） */
  function refreshFx(t) {
    t = t || themeById(window.Store.settings().theme) || themeById('light');
    document.documentElement.setAttribute('data-fx', fxOff() || reducedMotion ? '' : t.fx);
    buildFx(t.fx);
  }

  function buildThemeMenu() {
    var html = THEME_GROUPS.map(function (g) {
      return '<div class="tm-group">' + esc(g) + '</div>' +
        THEMES.filter(function (t) { return t.g === g; }).map(function (t) {
          return '<button class="theme-item" data-theme-id="' + t.id + '" role="menuitem">' +
            '<span class="theme-sw">' + t.sw.map(function (c) {
              return '<i style="background:' + c + '"></i>';
            }).join('') + '</span>' +
            '<span><span class="nm">' + esc(t.name) + '</span><br><span class="ds">' + esc(t.desc) + '</span></span>' +
            '<span class="fx-tag">' + esc(t.fxName) + '</span>' +
            '</button>';
        }).join('');
    }).join('') +
      '<button class="theme-item" id="fxToggle" role="menuitem" style="grid-column:1/-1">' +
      '<span class="theme-sw"><i style="background:var(--accent)"></i>' +
      '<i style="background:var(--accent-2)"></i><i style="background:var(--bg-soft)"></i></span>' +
      '<span><span class="nm">动效开关</span><br><span class="ds" id="fxToggleDs">关闭全部动画与主题特效</span></span>' +
      '<span class="fx-tag" id="fxToggleTag">开</span></button>';
    $('#themeMenu').innerHTML = html;
    $$('#themeMenu [data-theme-id]').forEach(function (b) {
      b.addEventListener('click', function () {
        setTheme(b.getAttribute('data-theme-id'));
        closeThemeMenu();
        toast('已切换到「' + (themeById(b.getAttribute('data-theme-id')) || {}).name + '」主题');
      });
    });
    var tg = $('#fxToggle');
    if (tg) tg.addEventListener('click', function () {
      var off = !fxOff();
      window.Store.set('fx', off ? 'off' : 'on');
      applyFxState();
      refreshFx();
      syncFxToggle();
      toast(off ? '已关闭全部动画与特效' : '已开启动画与主题特效');
    });
    syncFxToggle();
  }

  function syncFxToggle() {
    var tag = $('#fxToggleTag'), ds = $('#fxToggleDs');
    var off = fxOff() || reducedMotion;
    if (tag) tag.textContent = off ? '关' : '开';
    if (ds) ds.textContent = off ? '当前：已关闭（省电 / 护眼）' : '关闭全部动画与主题特效';
  }

  function setTheme(id, silent) {
    var t = themeById(id) || themeById('light');
    var root = document.documentElement;
    root.setAttribute('data-theme', t.id);
    root.setAttribute('data-mode', t.mode);
    root.style.colorScheme = t.mode;
    if (!silent) window.Store.set('theme', t.id);
    $('#themeBtn').textContent = t.mode === 'dark' ? '🌙' : '🎨';
    $('#themeBtn').title = '当前主题：' + t.name + '（共 ' + THEMES.length + ' 套，点击切换）';
    $$('#themeMenu [data-theme-id]').forEach(function (b) {
      b.classList.toggle('on', b.getAttribute('data-theme-id') === t.id);
    });
    refreshFx(t);
    // 预览 iframe 里注入了主题变量，切换后需要重绘
    $$('[data-demo]').forEach(function (b) {
      b.dispatchEvent(new Event('demo:repaint'));
    });
  }

  function openThemeMenu() {
    $('#themeMenu').hidden = false;
    $('#themeBtn').setAttribute('aria-expanded', 'true');
  }
  function closeThemeMenu() {
    $('#themeMenu').hidden = true;
    $('#themeBtn').setAttribute('aria-expanded', 'false');
  }
  $('#themeBtn').addEventListener('click', function (e) {
    e.stopPropagation();
    if ($('#themeMenu').hidden) openThemeMenu(); else closeThemeMenu();
  });
  document.addEventListener('click', function (e) {
    if (!e.target.closest || !e.target.closest('.theme-wrap')) closeThemeMenu();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    var full = $('.demo.is-full');
    if (full) {
      // 全屏编辑：Esc 优先退出全屏
      $$('.demo.is-full').forEach(function (b) { if (b.__setFull) b.__setFull(false); });
      return;
    }
    if ($('#sidebar').classList.contains('open')) { closeSidebar(); return; }
    closeThemeMenu();
    if (headOff) { setHeadOff(false, true); toast('已显示顶栏'); }
  });

  /* 快捷键 [ 收起 / 展开侧边导航 */
  document.addEventListener('keydown', function (e) {
    if (e.key !== '[' || e.metaKey || e.ctrlKey || e.altKey) return;
    var el = document.activeElement;
    if (el && /INPUT|TEXTAREA|SELECT/.test(el.tagName)) return;
    e.preventDefault();
    toggleNav();
  });

  /* ---------------- 滚动效果：进度条 / 顶栏浮起 / 回到顶部 ---------------- */
  var scrollTick = false;
  function updateScrollUI() {
    var y = window.pageYOffset || document.documentElement.scrollTop || 0;
    var doc = document.documentElement;
    var max = doc.scrollHeight - window.innerHeight;
    var pct = max > 4 ? Math.min(Math.max(y / max, 0), 1) : 0;
    var bar = $('#scrollProgress');
    if (bar) bar.style.width = (pct * 100).toFixed(2) + '%';

    var tb = $('.topbar');
    if (tb) tb.classList.toggle('scrolled', y > 6);

    var tt = $('#toTop');
    if (tt) {
      var show = y > 420;
      if (show && tt.hidden) {
        tt.hidden = false;
        setTimeout(function () { tt.classList.add('show'); }, 20);
      } else if (!show && !tt.hidden) {
        tt.classList.remove('show');
        setTimeout(function () { if (!tt.classList.contains('show')) tt.hidden = true; }, 260);
      }
    }
  }
  window.addEventListener('scroll', function () {
    if (scrollTick) return;
    scrollTick = true;
    requestAnimationFrame(function () { scrollTick = false; updateScrollUI(); });
  }, { passive: true });
  window.addEventListener('resize', updateScrollUI);

  var toTopBtn = $('#toTop');
  if (toTopBtn) toTopBtn.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
  });

  /* 跨过 768px / 860px 断点时更新分隔条方向与导航形态 */
  window.addEventListener('resize', function () {
    var st = isStackedLayout();
    $$('[data-role="resizer"]').forEach(function (r) {
      r.setAttribute('aria-orientation', st ? 'horizontal' : 'vertical');
    });
    syncNavUI();
    // 窄屏顶栏里有导航按钮，不能停留在隐藏状态
    if (isNarrowNav() && document.body.classList.contains('head-off')) setHeadOff(false, true);
  });

  buildThemeMenu();
  applyFxState();
  (function initTheme() {
    var saved = window.Store.settings().theme;
    if (themeById(saved)) { setTheme(saved, true); return; }
    var dark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    setTheme(dark ? 'midnight' : 'light', true);
  })();
  if (window.matchMedia) {
    try {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (ev) {
        // 用户没手动选过主题时才跟随系统
        if (window.Store.settings().theme) return;
        setTheme(ev.matches ? 'midnight' : 'light');
      });
    } catch (e) { /* 老浏览器忽略 */ }
  }

  $('#printBtn').addEventListener('click', function () { window.print(); });
  $('#addTagBtn').addEventListener('click', function () { openAddMenu(); });
  $('#dataBtn').addEventListener('click', function () { location.hash = '#/manage'; });

  /* ---------------- 侧边导航：桌面可收起，窄屏变抽屉 ---------------- */
  function isNarrowNav() { return window.matchMedia('(max-width: 860px)').matches; }

  function syncNavUI() {
    var menuBtn = $('#menuBtn');
    if (!menuBtn) return;
    if (isNarrowNav()) {
      var open = $('#sidebar').classList.contains('open');
      menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
      menuBtn.title = open ? '关闭侧边导航' : '打开侧边导航';
      menuBtn.setAttribute('aria-label', menuBtn.title);
    } else {
      var off = document.body.classList.contains('nav-off');
      menuBtn.setAttribute('aria-expanded', off ? 'false' : 'true');
      menuBtn.title = (off ? '展开' : '收起') + '侧边导航（快捷键 [ ）';
      menuBtn.setAttribute('aria-label', menuBtn.title);
    }
  }

  function collapseNav(off) {
    if (isNarrowNav()) return false;
    document.body.classList.toggle('nav-off', off);
    syncNavUI();
    return true;
  }

  function toggleNav() {
    if (isNarrowNav()) {
      var open = $('#sidebar').classList.toggle('open');
      document.body.classList.toggle('nav-open', open);
      $('#scrim').hidden = !open;
      syncNavUI();
    } else {
      var off = !document.body.classList.contains('nav-off');
      if (collapseNav(off)) {
        window.Store.set('nav', off ? 'off' : 'on');
        toast(off ? '已收起侧边导航（按 [ 恢复）' : '已展开侧边导航');
      }
    }
  }

  $('#menuBtn').addEventListener('click', toggleNav);
  $('#scrim').addEventListener('click', closeSidebar);
  function closeSidebar() {
    $('#sidebar').classList.remove('open');
    document.body.classList.remove('nav-open');
    $('#scrim').hidden = true;
    syncNavUI();
  }

  // 恢复上次记住的收起状态
  if (window.Store.settings().nav === 'off') collapseNav(true);
  syncNavUI();

  /* ---------------- 沉浸模式：隐藏顶栏 ----------------
     顶栏高度归零后，侧栏与页内大纲会自动贴顶并铺满视口；
     宽屏时布局同时取消 1680px 居中限宽，侧栏直接贴住屏幕左边（见 main.css .head-off）。 */
  var headOff = false;
  var headbar = document.querySelector('.topbar');

  function setHeadOff(off, remember) {
    off = !!off && !isNarrowNav();
    headOff = off;
    document.body.classList.toggle('head-off', off);
    if (headbar) {
      if (off) headbar.setAttribute('inert', '');
      else headbar.removeAttribute('inert');
    }
    var btn = $('#headBtn');
    if (btn) {
      btn.setAttribute('aria-pressed', off ? 'true' : 'false');
      btn.title = off ? '显示顶栏（H）' : '隐藏顶栏，进入沉浸阅读（H）';
      btn.setAttribute('aria-label', btn.title);
    }
    var pill = $('#headRestore');
    if (pill) pill.hidden = !off;
    if (remember) window.Store.set('head', off ? 'off' : 'on');
    // 顶栏高度变化会影响演示区的可用宽度，通知一次布局重算
    window.dispatchEvent(new Event('resize'));
  }

  function toggleHead() {
    if (isNarrowNav()) { toast('窄屏下顶栏里有导航按钮，不隐藏顶栏'); return; }
    setHeadOff(!headOff, true);
    toast(headOff
      ? '已隐藏顶栏 · 沉浸模式（按 H / Esc，或点顶部「显示顶栏」恢复）'
      : '已显示顶栏');
  }

  if (window.Store.settings().head === 'off') setHeadOff(true, false);
  var headBtn = $('#headBtn');
  if (headBtn) headBtn.addEventListener('click', toggleHead);
  var headRestoreEl = $('#headRestore');
  if (headRestoreEl) headRestoreEl.addEventListener('click', function () {
    setHeadOff(false, true);
    toast('已显示顶栏');
  });

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'h' && e.key !== 'H') return;
    if (e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return;
    var el = document.activeElement;
    if (el && (/INPUT|TEXTAREA|SELECT/.test(el.tagName) || el.isContentEditable)) return;
    if (!$('#modal').hidden || $('.demo.is-full')) return;
    e.preventDefault();
    toggleHead();
  });

  loadDUI();
  applyDUI();
  updateScrollUI();

  window.addEventListener('hashchange', route);
  route();
})();
