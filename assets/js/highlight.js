/* ==========================================================
   轻量语法高亮：HTML / CSS / JavaScript
   ========================================================== */
(function () {
  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function sp(cls, text) {
    return '<span class="tk-' + cls + '">' + esc(text) + '</span>';
  }

  /* ---------- HTML ---------- */
  /* token 类型：
     com 注释 · at DOCTYPE · tag 标签名 · attr 属性名 · str 字符串
     punc 标点 · val 数字/单位/颜色 · prop CSS 属性 · sel CSS 选择器
     kw 关键字 · fn 函数名 —— 每类颜色都在主题变量 --tk-* 里，随主题变化 */
  function highlightHTML(src) {
    src = String(src);
    var out = '', last = 0;
    var re = /(<!--[\s\S]*?-->)|(<!DOCTYPE[^>]*>)|(<\/?)([A-Za-z][\w:-]*)((?:[^>"']|"[^"]*"|'[^']*')*)(\/?>)/gi;
    var m;
    while ((m = re.exec(src)) !== null) {
      if (m.index > last) out += esc(src.slice(last, m.index));
      last = m.index + m[0].length;
      if (m[1]) { out += sp('com', m[1]); continue; }
      if (m[2]) { out += sp('at', m[2]); continue; }
      out += sp('punc', m[3]) + sp('tag', m[4]);
      if (m[5]) out += attrSpan(m[5]);
      out += sp('punc', m[6]);
    }
    if (last < src.length) out += esc(src.slice(last));
    return out;
  }

  function attrSpan(s) {
    var out = '', re = /([\s\/]*)([A-Za-z_:][\w:.-]*)(\s*=\s*)?("[^"]*"|'[^']*')?|([\s]+)/g, m;
    var i = 0;
    while ((m = re.exec(s)) !== null) {
      if (m.index > i) out += esc(s.slice(i, m.index));
      i = m.index + m[0].length;
      if (m[5]) { out += esc(m[5]); continue; }
      out += esc(m[1] || '') + sp('attr', m[2]);
      if (m[3]) out += sp('punc', m[3]);
      if (m[4]) out += sp('str', m[4]);
    }
    if (i < s.length) out += esc(s.slice(i));
    return out;
  }

  /* ---------- CSS ---------- */
  function highlightCSS(src) {
    src = String(src);
    var out = '', i = 0, n = src.length, inBlock = false;
    function readUntil(stops) {
      var start = i;
      while (i < n && stops.indexOf(src[i]) < 0) {
        if (src.substr(i, 2) === '/*') {
          var e = src.indexOf('*/', i + 2);
          i = (e < 0 ? n : e + 2);
          continue;
        }
        if (src[i] === '"' || src[i] === "'") {
          var q = src[i], j = i + 1;
          while (j < n && src[j] !== q) j++;
          i = Math.min(j + 1, n);
          continue;
        }
        i++;
      }
      return src.slice(start, i);
    }
    /* 单趟扫描，避免「先把数字染色 → 色值里的数字又被再包一层」导致标签嵌套错乱。
       入参 v 已经过 esc()，这里只拼标签、不再转义。 */
    function w(cls, t) { return '<span class="tk-' + cls + '">' + t + '</span>'; }
    var VALUE_RE = /(#[0-9a-fA-F]{3,8})|([a-zA-Z-]+)(?=\()|(-?\d*\.?\d+)(px|em|rem|%|vw|vh|vmin|vmax|fr|ch|s|ms|deg|turn|rad)?/g;
    function valueSpan(v) {
      return esc(v).replace(VALUE_RE, function (m0, hex, fn, num, unit) {
        if (hex) return w('val', hex);
        if (fn) return w('fn', fn);
        return w('val', num + (unit || ''));
      });
    }

    while (i < n) {
      if (src.substr(i, 2) === '/*') {
        var e2 = src.indexOf('*/', i + 2);
        var end = (e2 < 0 ? n : e2 + 2);
        out += sp('com', src.slice(i, end));
        i = end;
        continue;
      }
      var c = src[i];
      if (c === '{') { out += sp('punc', '{'); i++; inBlock = true; continue; }
      if (c === '}') { out += sp('punc', '}'); i++; inBlock = false; continue; }
      if (c === ';') { out += sp('punc', ';'); i++; continue; }

      if (inBlock) {
        var prop = readUntil(':;{}');
        if (prop) out += sp('prop', prop);
        if (src[i] === ':') { out += sp('punc', ':'); i++; }
        var val = readUntil(';{}');
        if (val) out += valueSpan(val);
        continue;
      }

      var sel = readUntil('{}');
      if (sel) {
        if (/^\s*@/.test(sel)) out += sp('at', sel);
        else out += sp('sel', sel);
      } else if (i >= n) break;
      else { out += esc(src[i]); i++; }
    }
    return out;
  }

  /* ---------- JavaScript ---------- */
  var JS_KW = ('const let var function return if else for while do switch case break continue ' +
    'new delete typeof instanceof in of this super class extends static get set async await ' +
    'try catch finally throw yield void import export default with debugger arguments eval').split(' ');
  var JS_LIT = 'true false null undefined NaN Infinity'.split(' ');
  var JS_GL = ('console document window location history navigator localStorage sessionStorage ' +
    'Math JSON Object Array String Number Boolean Date Promise Map Set WeakMap WeakSet Symbol Proxy Reflect ' +
    'fetch alert confirm prompt setTimeout setInterval clearTimeout clearInterval requestAnimationFrame ' +
    'cancelAnimationFrame structuredClone Event CustomEvent MutationObserver AbortController').split(' ');
  var JS_KWS = {}; JS_KW.forEach(function (w) { JS_KWS[w] = 1; });
  var JS_LITS = {}; JS_LIT.forEach(function (w) { JS_LITS[w] = 1; });
  var JS_GLS = {}; JS_GL.forEach(function (w) { JS_GLS[w] = 1; });

  function highlightJS(src) {
    src = String(src);
    var out = '', last = 0, i;
    var re = /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|('(?:\\.|[^'\\\n])*'|"(?:\\.|[^"\\\n])*"|`(?:\\.|[^`\\])*`)|(\b\d[\w.]*|\.\d+)|([A-Za-z_$][\w$]*)|([{}()[\]])|([;,.]|=>|\.\.\.)|([+\-*/%=<>!&|^~?:]+)/g;
    var m;
    var lastMeaningful = '';   // 前一个非空白字符，用于判断 obj.prop
    while ((m = re.exec(src)) !== null) {
      if (m.index > last) out += esc(src.slice(last, m.index));
      last = m.index + m[0].length;
      if (m[1]) { out += sp('com', m[1]); continue; }
      if (m[2]) { out += sp('str', m[2]); lastMeaningful = 'str'; continue; }
      if (m[3]) { out += sp('val', m[3]); lastMeaningful = 'num'; continue; }
      if (m[4]) {
        var word = m[4];
        var rest = src.slice(last);
        var isProp = lastMeaningful === '.';
        if (isProp) out += sp('attr', word);
        else if (JS_KWS[word]) out += sp('kw', word);
        else if (JS_LITS[word]) out += sp('val', word);
        else if (JS_GLS[word]) out += sp('attr', word);
        else if (/^\s*\(/.test(rest)) out += sp('fn', word);
        else out += esc(word);
        lastMeaningful = 'id';
        continue;
      }
      if (m[5]) { out += sp('punc', m[5]); lastMeaningful = m[5]; continue; }
      if (m[6]) { out += sp('punc', m[6]); lastMeaningful = m[6] === '.' ? '.' : 'op'; continue; }
      if (m[7]) { out += sp('punc', m[7]); lastMeaningful = 'op'; continue; }
      out += esc(m[0]);
    }
    if (last < src.length) out += esc(src.slice(last));
    void i;
    return out;
  }

  /* ---------- 预览文档 ----------
     BASE_CSS 只提供"像浏览器默认样式但更整齐"的基础排版，
     颜色全部走 CSS 变量，由宿主页面把当前主题的变量注入进来，
     这样预览和编辑器、整站配色保持一致。 */
  var BASE_CSS = [
    '*,*::before,*::after{box-sizing:border-box}',
    'html{color-scheme:__MODE__}',
    'body{margin:0;padding:18px 20px;background:var(--canvas,#fff);color:var(--text,#1b2130);',
    'font-family:var(--sans,system-ui,-apple-system,"PingFang SC","Microsoft YaHei",sans-serif);',
    'font-size:14px;line-height:1.65;-webkit-font-smoothing:antialiased;overflow-wrap:break-word}',
    'h1,h2,h3,h4,h5,h6{margin:0 0 .55em;line-height:1.3;font-weight:650}',
    'h1{font-size:1.65em}h2{font-size:1.38em}h3{font-size:1.16em}h4{font-size:1em}',
    'h5,h6{font-size:.94em;color:var(--text-soft,#59637a)}',
    'p{margin:0 0 .85em}',
    'a{color:var(--accent,#3b5bdb);text-decoration:underline;text-underline-offset:2px}',
    'ul,ol{margin:0 0 .85em;padding-left:1.5em}li{margin:.15em 0}',
    'dl{margin:0 0 .85em}dt{font-weight:650}dd{margin:0 0 .4em 1.5em}',
    'table{border-collapse:collapse;margin:0 0 .85em}',
    'th,td{border:1px solid var(--border-st,#ccd3e2);padding:6px 10px;text-align:left;vertical-align:top}',
    'th{background:var(--bg-soft,#eff1f7);font-weight:650}',
    'img,svg,video,canvas{max-width:100%;height:auto}',
    'input,select,textarea,button{font:inherit;color:inherit}',
    'input,select,textarea{border:1px solid var(--border-st,#ccd3e2);border-radius:6px;padding:4px 8px;background:var(--bg-elev,#fff)}',
    'button{cursor:pointer;border:1px solid var(--border-st,#ccd3e2);border-radius:6px;padding:5px 12px;background:var(--bg-soft,#eff1f7)}',
    'pre{margin:0 0 .85em;padding:10px 12px;background:var(--bg-soft,#eff1f7);border-radius:8px;overflow:auto;font-size:.9em}',
    'code,kbd,pre{font-family:var(--mono,ui-monospace,monospace)}',
    'kbd{border:1px solid var(--border-st,#ccd3e2);border-radius:4px;padding:0 5px;font-size:.9em;background:var(--bg-soft,#eff1f7)}',
    'blockquote{margin:0 0 .85em;padding:2px 0 2px 12px;border-left:3px solid var(--border-st,#ccd3e2);color:var(--text-soft,#59637a)}',
    'hr{border:0;border-top:1px solid var(--border,#e3e7f0);margin:1em 0}',
    'fieldset{border:1px solid var(--border-st,#ccd3e2);border-radius:8px;padding:10px 12px;margin:0 0 .85em}',
    'legend{padding:0 6px}summary{cursor:pointer}details{margin:0 0 .85em}',
    'figure{margin:0 0 .85em}small{font-size:.88em}',
    'mark{background:color-mix(in srgb,var(--warn,#a86404) 30%,transparent);color:inherit;padding:0 2px}',
    '::selection{background:color-mix(in srgb,var(--accent,#3b5bdb) 26%,transparent)}'
  ].join('');

  /* 高度上报：用 body 的内容盒高度，而不是 documentElement.scrollHeight。
     scrollHeight 至少等于视口高度，会把 iframe 撑高后自己"锁死"在最大高度，
     这是旧版演示区越用越高的根因。 */
  var HEIGHT_SCRIPT = [
    '(function(){',
    'var ID=' + '"__DEMO_ID__"' + ';',
    'function measure(){var b=document.body;if(!b)return 0;',
    'var r=b.getBoundingClientRect();var cs=getComputedStyle(b);',
    'return Math.ceil(r.height+(parseFloat(cs.marginTop)||0)+(parseFloat(cs.marginBottom)||0));}',
    'var last=-1;',
    'function send(){var h=measure();if(h===last)return;last=h;',
    'try{parent.postMessage({demoId:ID,height:h},"*")}catch(e){}}',
    'window.addEventListener("load",send);window.addEventListener("resize",send);',
    'if(window.ResizeObserver){try{new ResizeObserver(send).observe(document.body);}catch(e){}}',
    'document.addEventListener("input",send,true);document.addEventListener("click",send,true);',
    'document.addEventListener("transitionend",send,true);',
    'setTimeout(send,40);setTimeout(send,260);setTimeout(send,700);',
    '})();'
  ].join('');

  /* 控制台面板：接管 console.* 与运行时错误，
     - 在 iframe 内部渲染一个可折叠的日志面板（固定在视口底部，不参与高度测量）
     - 同时把日志 postMessage 给宿主页面，用于显示错误数量角标 */
  var CONSOLE_SCRIPT = [
    '(function(){',
    'var ID="__DEMO_ID__";',
    'var logs=[],MAX=80,open=true;',
    'function fmt(v){try{',
    'if(v instanceof Error)return (v.name||"Error")+": "+(v.message||"");',
    'if(typeof v==="undefined")return "undefined";',
    'if(v===null)return "null";',
    'if(typeof v==="object"){try{var s=JSON.stringify(v);return s===undefined?String(v):s}catch(e){return Object.prototype.toString.call(v)}}',
    'if(typeof v==="function")return "ƒ "+ (v.name||"anonymous") +"()";',
    'return String(v);}catch(e){return "[无法显示]"}}',
    'var panel=null,listEl=null,cntEl=null;',
    'function ensure(){if(panel)return;',
    'panel=document.createElement("div");panel.id="__console";',
    'panel.style.cssText="position:fixed;left:0;right:0;bottom:0;z-index:99999;display:flex;flex-direction:column;' +
      'max-height:46%;font:12px/1.55 var(--mono,ui-monospace,monospace);' +
      'background:var(--bg-elev,#fff);border-top:1px solid var(--border-st,#ccd3e2);box-shadow:0 -6px 18px rgba(0,0,0,.10)";',
    'var bar=document.createElement("div");',
    'bar.style.cssText="display:flex;align-items:center;gap:8px;padding:4px 10px;cursor:pointer;' +
      'background:var(--bg-soft,#eff1f7);color:var(--text-soft,#59637a);user-select:none;flex:0 0 auto";',
    'cntEl=document.createElement("b");cntEl.style.cssText="color:var(--text,#1b2130);font-weight:700";',
    'var title=document.createElement("span");title.textContent="控制台";',
    'var clear=document.createElement("span");clear.textContent="清空";clear.id="__console_clear";',
    'clear.style.cssText="margin-left:auto;padding:0 6px;border-radius:4px;background:var(--border,#e3e7f0);color:var(--text,#1b2130)";',
    'clear.addEventListener("click",function(e){e.stopPropagation();logs.length=0;render();});',
    'bar.appendChild(title);bar.appendChild(cntEl);bar.appendChild(clear);',
    'bar.addEventListener("click",function(){open=!open;listEl.style.display=open?"block":"none";});',
    'listEl=document.createElement("div");',
    'listEl.style.cssText="flex:1 1 auto;overflow:auto;padding:4px 10px";',
    'panel.appendChild(bar);panel.appendChild(listEl);',
    'document.body.appendChild(panel);}',
    'function render(){if(!panel)return;cntEl.textContent=logs.length+" 条";',
    'listEl.innerHTML=logs.map(function(it){',
    'var c=it.l==="error"?"var(--danger,#c02a2a)":(it.l==="warn"?"var(--warn,#a86404)":(it.l==="info"?"var(--info,#0b6d99)":"var(--text-soft,#59637a)"));',
    'var bg=it.l==="error"?"color-mix(in srgb,var(--danger,#c02a2a) 9%,transparent)":"transparent";',
    'return "<div style=\\"padding:2px 0;border-bottom:1px solid var(--border,#e3e7f0);white-space:pre-wrap;word-break:break-word;color:"+c+";background:"+bg+"\\">"+(it.l==="error"?"✖ ":it.l==="warn"?"⚠ ":"› ")+it.m+"</div>";',
    '}).join("") || "<div style=\\"color:var(--text-dim,#8a93a8)\\">（暂无输出，试试 console.log()）</div>";}',
    'function push(level,args){',
    'var msg=Array.prototype.slice.call(args).map(fmt).join(" ");',
    'if(msg.indexOf("__console")>-1)return;',
    'logs.push({l:level,m:msg});if(logs.length>MAX)logs.shift();',
    'ensure();render();',
    'try{parent.postMessage({demoId:ID,log:{level:level,message:msg,count:logs.length}},"*")}catch(e){}}',
    '["log","info","warn","error","debug","table","trace","dir"].forEach(function(k){',
    'var orig=console[k]||function(){};',
    'console[k]=function(){var a=arguments;push(k==="debug"?"log":k,a);try{orig.apply(console,a)}catch(e){}};});',
    'window.addEventListener("error",function(e){',
    'if(e.target&&e.target!==window&&e.target.tagName){push("error",["资源加载失败: "+(e.target.src||e.target.href||e.target.tagName)]);return;}',
    'push("error",[(e.message||"脚本错误")+"  (行 "+(e.lineno||"?")+")"]);},true);',
    'window.addEventListener("unhandledrejection",function(e){',
    'push("error",["Unhandled Promise rejection:",fmt(e.reason)]);});',
    'window.addEventListener("message",function(e){',
    'var d=e.data;if(!d||d.demoCmd!=="console")return;',
    'if(d.open===true){open=true;ensure();panel.style.display="flex";listEl.style.display="block";render();}',
    'else if(d.open===false){open=false;if(panel)panel.style.display="none";}});',
    'try{parent.postMessage({demoId:ID,ready:true},"*")}catch(e){}',
    '})();'
  ].join('');

  /* 存储模拟：沙盒 iframe 没有 allow-same-origin，直接访问 localStorage 会抛
     SecurityError。这里注入一个内存实现，并把变更同步回宿主页面（宿主再存到自己的
     localStorage），于是「重新运行 / 刷新页面」都还能读到之前写的值。 */
  var STORAGE_SHIM = [
    '(function(){',
    'var ID="__DEMO_ID__";',
    'var SEED=__SEED__;',
    'var data={};',
    'try{Object.keys(SEED||{}).forEach(function(k){data[k]=String(SEED[k]);});}catch(e){}',
    'var t=null;',
    'function sync(){if(t)clearTimeout(t);t=setTimeout(function(){',
    'try{parent.postMessage({demoId:ID,storage:data},"*")}catch(e){}},80);}',
    'function mk(){return{',
    'getItem:function(k){k=String(k);return Object.prototype.hasOwnProperty.call(data,k)?data[k]:null;},',
    'setItem:function(k,v){data[String(k)]=String(v);sync();},',
    'removeItem:function(k){delete data[String(k)];sync();},',
    'clear:function(){data={};sync();},',
    'key:function(i){var ks=Object.keys(data);return i>=0&&i<ks.length?ks[i]:null;},',
    'get length(){return Object.keys(data).length;}};}',
    'try{Object.defineProperty(window,"localStorage",{value:mk(),configurable:true});}catch(e){}',
    'try{Object.defineProperty(window,"sessionStorage",{value:mk(),configurable:true});}catch(e){}',
    '})();'
  ].join('');

  /**
   * 生成预览文档。支持 html / css / js 三段代码。
   * 控制台桥接 + 存储模拟放在 head，用户 JS 放在 body 末尾（保证 DOM 已就绪），
   * 高度上报脚本同样放在 body 末尾。
   */
  function previewDoc(opt) {
    if (typeof opt === 'string') {           // 兼容旧签名 previewDoc(html, css, id, vars, mode)
      opt = { html: opt, css: arguments[1], id: arguments[2], vars: arguments[3], mode: arguments[4] };
    }
    opt = opt || {};
    var id = opt.id || 'preview';
    var mode = opt.mode === 'dark' ? 'dark' : 'light';
    var idLit = JSON.stringify(id);
    var bridge = CONSOLE_SCRIPT.replace('"__DEMO_ID__"', idLit);
    var store = STORAGE_SHIM
      .replace('"__DEMO_ID__"', idLit)
      .replace('__SEED__', JSON.stringify(opt.storage || {}));
    var height = HEIGHT_SCRIPT.replace('"__DEMO_ID__"', idLit);
    var themeVars = opt.vars ? '<style>:root{' + opt.vars + '}</style>' : '';
    var userJS = opt.js && String(opt.js).trim() ? '<script>' + opt.js + '</' + 'script>' : '';
    return '<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8">' +
      '<meta name="viewport" content="width=device-width,initial-scale=1">' +
      '<style>' + BASE_CSS.replace('__MODE__', mode) + '</style>' +
      themeVars +
      '<script>' + bridge + '</' + 'script>' +
      '<script>' + store + '</' + 'script>' +
      (opt.css ? '<style>' + opt.css + '</style>' : '') +
      '</head><body>' + (opt.html || '') +
      userJS +
      '<script>' + height + '</' + 'script>' +
      '</body></html>';
  }

  window.HL = {
    esc: esc,
    html: highlightHTML,
    css: highlightCSS,
    js: highlightJS,
    lang: function (l, src) {
      return l === 'css' ? highlightCSS(src) : (l === 'js' ? highlightJS(src) : highlightHTML(src));
    },
    previewDoc: previewDoc
  };
})();
