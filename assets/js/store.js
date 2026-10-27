/* ==========================================================
   本地数据仓库：自定义标签 / CSS 属性 / JS 条目 / 我的示例 + 站点设置
   全部保存在 localStorage，无需登录、不上传。
   kind: 'tag' | 'css' | 'js' | 'mine'
   ========================================================== */
(function () {
  var KEY = {
    tag: 'htmlcheat.customTags.v1',
    css: 'htmlcheat.customCss.v1',
    js: 'htmlcheat.customJs.v1',
    mine: 'htmlcheat.mySnippets.v1'
  };
  var KEY_SET = 'htmlcheat.settings.v1';

  /* 名称规则：标签与 CSS 属性只允许英文标识，JS 条目与示例允许中文标题 */
  var NAME_RE = {
    tag: /^[A-Za-z][A-Za-z0-9-]{0,23}$/,
    css: /^-?[A-Za-z][A-Za-z0-9-]{0,39}$/
  };
  var BAD_CHARS = /[<>/\\"'=]/;
  var LABEL = { tag: '标签', css: 'CSS 属性', js: 'JS 条目', mine: '示例' };

  function builtinOf(kind) {
    if (kind === 'tag') return window.TAG_DATA || [];
    if (kind === 'css') return window.CSS_PROPS || [];
    if (kind === 'js') return window.JS_EXAMPLES || [];
    return [];
  }
  function nameOf(kind, it) {
    if (!it) return '';
    if (kind === 'js') return String(it.n || it.t || '');
    return String(it.n || '');
  }

  function read(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      if (!raw) return fallback;
      var v = JSON.parse(raw);
      return v === null || v === undefined ? fallback : v;
    } catch (e) {
      console.warn('读取本地数据失败：' + key, e);
      return fallback;
    }
  }
  function write(key, val) {
    try {
      localStorage.setItem(key, JSON.stringify(val));
      return true;
    } catch (e) {
      console.warn('写入本地数据失败：' + key, e);
      return false;
    }
  }
  function same(a, b) { return String(a || '').toLowerCase() === String(b || '').toLowerCase(); }

  /* ---------------- 各集合的字段清洗 ---------------- */
  var CLEAN = {
    tag: function (t) {
      return {
        n: String(t.n || '').trim().toLowerCase(),
        d: String(t.d || ''),
        c: String(t.c || '自定义'),
        s: ['ok', 'dep', 'obs', 'nostd'].indexOf(t.s) >= 0 ? t.s : 'ok',
        dp: String(t.dp || 'block'),
        p: Number(t.p) || 3,
        void: !!t.void,
        u: String(t.u || ''),
        a: Array.isArray(t.a) ? t.a.map(function (x) {
          return { n: String((x && x.n) || ''), v: String((x && x.v) || ''), e: String((x && x.e) || ''), d: String((x && x.d) || '') };
        }).filter(function (x) { return x.n; }) : [],
        demo: String(t.demo || ''),
        css: String(t.css || ''),
        js: String(t.js || ''),
        dep: t.dep || null,
        custom: true,
        updatedAt: t.updatedAt || new Date().toISOString()
      };
    },
    css: function (p) {
      return {
        n: String(p.n || '').trim().toLowerCase(),
        d: String(p.d || ''),
        c: String(p.c || '自定义'),
        v: String(p.v || ''),
        def: String(p.def || ''),
        inherit: p.inherit === '是' ? '是' : '否',
        animatable: p.animatable === '是' ? '是' : '否',
        syntax: String(p.syntax || (p.n + ': <值>;')),
        note: String(p.note || ''),
        vals: Array.isArray(p.vals) ? p.vals.map(function (x) {
          return { v: String((x && x.v) || ''), d: String((x && x.d) || '') };
        }).filter(function (x) { return x.v; }) : [],
        demo: String(p.demo || ''),
        css: String(p.css || ''),
        js: String(p.js || ''),
        custom: true,
        updatedAt: p.updatedAt || new Date().toISOString()
      };
    },
    js: function (e) {
      return {
        n: String(e.n || e.t || '').trim(),
        d: String(e.d || ''),
        c: String(e.c || e.cat || '自定义'),
        u: String(e.desc || e.u || ''),
        snip: String(e.snip || ''),
        tags: Array.isArray(e.tags) ? e.tags.map(String)
          : String(e.tags || '').split(/[,，\s]+/).filter(Boolean),
        html: String(e.html || ''),
        css: String(e.css || ''),
        js: String(e.js || ''),
        custom: true,
        updatedAt: e.updatedAt || new Date().toISOString()
      };
    },
    mine: function (s) {
      return {
        n: String(s.n || s.t || '').trim(),
        d: String(s.d || ''),
        c: String(s.c || '未分类'),
        tags: Array.isArray(s.tags) ? s.tags.map(String)
          : String(s.tags || '').split(/[,，\s]+/).filter(Boolean),
        html: String(s.html || ''),
        css: String(s.css || ''),
        js: String(s.js || ''),
        custom: true,
        updatedAt: s.updatedAt || new Date().toISOString()
      };
    }
  };

  var Store = {
    keys: KEY,

    /* ---- 通用集合操作 ---- */
    list: function (kind) {
      var l = read(KEY[kind], []);
      return Array.isArray(l) ? l : [];
    },
    saveList: function (kind, list) { return write(KEY[kind], list); },
    get: function (kind, name) {
      var l = this.list(kind);
      for (var i = 0; i < l.length; i++) if (same(nameOf(kind, l[i]), name)) return l[i];
      return null;
    },
    add: function (kind, item) {
      var l = this.list(kind);
      l.push(CLEAN[kind](item));
      return this.saveList(kind, l);
    },
    update: function (kind, oldName, item) {
      var l = this.list(kind), old = String(oldName || '').toLowerCase();
      for (var i = 0; i < l.length; i++) {
        if (nameOf(kind, l[i]).toLowerCase() === old) { l[i] = CLEAN[kind](item); return this.saveList(kind, l); }
      }
      return false;
    },
    remove: function (kind, name) {
      var n = String(name || '').toLowerCase();
      return this.saveList(kind, this.list(kind).filter(function (it) {
        return nameOf(kind, it).toLowerCase() !== n;
      }));
    },
    count: function (kind) { return this.list(kind).length; },
    counts: function () {
      return { tag: this.list('tag').length, css: this.list('css').length, js: this.list('js').length, mine: this.list('mine').length };
    },

    /* ---- 校验（editing 时传 exclude 跳过自身重名检查） ---- */
    validateName: function (kind, name, exclude) {
      name = String(name || '').trim();
      var label = (LABEL[kind] || '名称').trim();
      if (!name) return label + '名称不能为空';
      if (NAME_RE[kind] && !NAME_RE[kind].test(name)) {
        return kind === 'css'
          ? 'CSS 属性名只能是字母开头、含字母 / 数字 / 连字符（可带 -webkit- 前缀，1-40 位）'
          : '标签名只能是字母开头、含字母 / 数字 / 连字符（1-24 位）';
      }
      if (BAD_CHARS.test(name)) return '名称不能包含 < > / \\ " \' = 这些字符';
      if (name.length > 40) return '名称过长（最多 40 个字符）';
      if (!(exclude && same(exclude, name))) {
        if (this.get(kind, name)) return '已存在同名的自定义 ' + label + '：' + name;
        var bi = builtinOf(kind);
        for (var i = 0; i < bi.length; i++) {
          if (same(nameOf(kind, bi[i]), name)) return '内置 ' + label + '「' + name + '」已存在，不能重复添加';
        }
      }
      return '';
    },

    /* ---- 兼容旧接口：默认操作 customTags ---- */
    all: function () { return this.list('tag'); },
    saveAll: function (list) { return this.saveList('tag', list); },

    /* ---- 设置 ---- */
    settings: function () { return read(KEY_SET, { theme: 'light' }); },
    set: function (k, v) {
      var s = this.settings();
      s[k] = v;
      write(KEY_SET, s);
    },

    /* ---- 导入导出 ---- */
    exportJSON: function () {
      return JSON.stringify({
        app: 'html-cheatsheet',
        version: 2,
        exportedAt: new Date().toISOString(),
        customTags: this.list('tag'),
        customCss: this.list('css'),
        customJs: this.list('js'),
        mySnippets: this.list('mine')
      }, null, 2);
    },
    importJSON: function (text, mode) {
      // mode: 'merge' 合并（同名覆盖） | 'replace' 覆盖全部
      var data;
      try { data = JSON.parse(text); } catch (e) { return { ok: false, msg: 'JSON 解析失败：' + e.message }; }

      var pack = { tag: 'customTags', css: 'customCss', js: 'customJs', mine: 'mySnippets' };
      if (Array.isArray(data) && data.length && data[0] && data[0].n) pack = { tag: '', css: '', js: '', mine: '' };

      var self = this, total = 0, skipped = 0, detail = [];
      Object.keys(pack).forEach(function (kind) {
        var incoming = Array.isArray(data) ? (kind === 'tag' ? data : null) : data[pack[kind]];
        if (!Array.isArray(incoming) || !incoming.length) return;
        var clean = [];
        incoming.forEach(function (it) {
          var nm = nameOf(kind, it);
          if (!nm || !CLEAN[kind]) { skipped++; return; }
          if (NAME_RE[kind] && !NAME_RE[kind].test(String(nm).trim())) { skipped++; return; }
          if (BAD_CHARS.test(String(nm).trim())) { skipped++; return; }
          clean.push(CLEAN[kind](it));
        });
        if (!clean.length) return;

        var base = (mode === 'replace' && !Array.isArray(data)) ? [] : self.list(kind);
        var map = {};
        base.forEach(function (it) { map[nameOf(kind, it).toLowerCase()] = it; });
        clean.forEach(function (it) { map[nameOf(kind, it).toLowerCase()] = it; });
        self.saveList(kind, Object.keys(map).map(function (k) { return map[k]; }));
        total += clean.length;
        detail.push(LABEL[kind].trim() + ' ' + clean.length);
      });

      if (!total) return { ok: false, msg: '没有可导入的有效数据（已跳过 ' + skipped + ' 条）' };
      return {
        ok: true, count: total,
        msg: '导入成功：' + detail.join(' · ') + (skipped ? '，跳过 ' + skipped + ' 条无效数据' : '')
      };
    },

    clearAll: function () {
      Object.keys(KEY).forEach(function (k) { write(KEY[k], []); });
      return true;
    },
    clear: function (kind) { return write(KEY[kind], []); }
  };

  window.Store = Store;
})();
