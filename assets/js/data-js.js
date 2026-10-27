/* ==========================================================
   JavaScript 数据：标签联动示例 + 语法 / DOM / 异步速查 + 综合实例
   代码一律用「数组 + join('\n')」书写，避免转义地狱，也方便阅读。
   ========================================================== */
(function () {

  /* ---------- 一、各 HTML 标签配套的 JavaScript 示例 ---------- */
  window.TAG_JS_DEMOS = {

    canvas: [
      "const cv = document.getElementById('cv');",
      "const ctx = cv.getContext('2d');",
      "",
      "// 1. 画一个渐变矩形",
      "const g = ctx.createLinearGradient(0, 0, 280, 0);",
      "g.addColorStop(0, '#3b5bdb');",
      "g.addColorStop(1, '#4ddba0');",
      "ctx.fillStyle = g;",
      "ctx.fillRect(10, 10, 180, 60);",
      "",
      "// 2. 画圆 + 描边",
      "ctx.beginPath();",
      "ctx.arc(210, 100, 30, 0, Math.PI * 2);",
      "ctx.fillStyle = '#e3a94b';",
      "ctx.fill();",
      "ctx.lineWidth = 3;",
      "ctx.strokeStyle = '#1b2130';",
      "ctx.stroke();",
      "",
      "// 3. 写字",
      "ctx.fillStyle = '#ffffff';",
      "ctx.font = 'bold 16px sans-serif';",
      "ctx.fillText('Canvas + JS', 22, 44);",
      "",
      "// 4. 点击画布：在鼠标位置画一个随机色小圆",
      "cv.addEventListener('click', (e) => {",
      "  const r = cv.getBoundingClientRect();",
      "  const x = e.clientX - r.left, y = e.clientY - r.top;",
      "  ctx.beginPath();",
      "  ctx.arc(x, y, 8, 0, Math.PI * 2);",
      "  ctx.fillStyle = `hsl(${Math.random() * 360} 70% 55%)`;",
      "  ctx.fill();",
      "  console.log('画了一笔：', Math.round(x), Math.round(y));",
      "});",
      ""
    ].join('\n'),

    dialog: [
      "const dlg = document.getElementById('dlg');",
      "const openBtn = document.getElementById('openDlg');",
      "",
      "openBtn.addEventListener('click', () => {",
      "  dlg.showModal();            // 模态：背景自动不可交互",
      "  console.log('对话框已打开');",
      "});",
      "",
      "// <dialog> 内部 method=\"dialog\" 的按钮会自动关闭并返回 returnValue",
      "dlg.addEventListener('close', () => {",
      "  console.log('关闭，返回值 =', dlg.returnValue);",
      "});",
      "",
      "// 点击遮罩（dialog 元素本身）关闭",
      "dlg.addEventListener('click', (e) => {",
      "  if (e.target === dlg) dlg.close('cancel');",
      "});",
      ""
    ].join('\n'),

    details: [
      "// 一键展开 / 收起所有 <details>",
      "const btn = document.getElementById('toggleAll');",
      "if (btn) {",
      "  btn.addEventListener('click', () => {",
      "    const all = document.querySelectorAll('details');",
      "    const openAll = [...all].some(d => !d.open);",
      "    all.forEach(d => { d.open = openAll; });",
      "    btn.textContent = openAll ? '全部收起' : '全部展开';",
      "  });",
      "}",
      "",
      "// toggle 事件：在展开瞬间加载内容（懒加载演示）",
      "document.querySelectorAll('details').forEach((d, i) => {",
      "  d.addEventListener('toggle', () => {",
      "    console.log(`第 ${i + 1} 个 details：${d.open ? '展开' : '收起'}`);",
      "  });",
      "});",
      ""
    ].join('\n'),

    output: [
      "// <output> 天生用来放「计算结果」",
      "const a = document.getElementById('a');",
      "const b = document.getElementById('b');",
      "const out = document.querySelector('output');",
      "",
      "function calc() {",
      "  out.value = Number(a.value) + Number(b.value);",
      "}",
      "a.addEventListener('input', calc);",
      "b.addEventListener('input', calc);",
      "calc();",
      ""
    ].join('\n'),

    progress: [
      "// 模拟下载进度：<progress> 只是显示层，值由 JS 推进",
      "const bar = document.querySelector('progress');",
      "const tip = document.querySelector('#pgTip');",
      "let pct = 0;",
      "",
      "const timer = setInterval(() => {",
      "  pct = Math.min(pct + Math.random() * 12, 100);",
      "  bar.value = Math.round(pct);",
      "  if (tip) tip.textContent = `已完成 ${Math.round(pct)}%`;",
      "  if (pct >= 100) {",
      "    clearInterval(timer);",
      "    console.log('下载完成');",
      "  }",
      "}, 400);",
      ""
    ].join('\n'),

    meter: [
      "// 用滑块驱动 <meter>，直观看到 low / high / optimum 的颜色变化",
      "const range = document.getElementById('score');",
      "const meter = document.querySelector('meter');",
      "if (range && meter) {",
      "  range.addEventListener('input', () => {",
      "    meter.value = range.value;",
      "    meter.textContent = range.value + ' 分';",
      "  });",
      "}",
      ""
    ].join('\n'),

    input: [
      "// 一次性读取表单里所有 input 的值",
      "const form = document.querySelector('form');",
      "const boxes = form.querySelectorAll('input');",
      "",
      "function snapshot() {",
      "  const data = {};",
      "  boxes.forEach((el, i) => {",
      "    data[el.type + '_' + i] = el.type === 'checkbox' ? el.checked : el.value;",
      "  });",
      "  console.log('当前表单数据：', data);",
      "  return data;",
      "}",
      "",
      "// input 事件：每次输入立即触发；change 事件：失焦后才触发",
      "form.addEventListener('input', () => {",
      "  console.log('值变了（立刻）');",
      "});",
      "form.addEventListener('change', () => {",
      "  console.log('确认修改（失焦后）');",
      "  snapshot();",
      "});",
      ""
    ].join('\n'),

    select: [
      "const sel = document.querySelector('select');",
      "sel.addEventListener('change', () => {",
      "  const opt = sel.options[sel.selectedIndex];",
      "  console.log('选中 value =', sel.value, '，文字 =', opt.textContent.trim());",
      "});",
      "",
      "// 用 JS 追加一个选项",
      "sel.add(new Option('深圳', 'sz'));",
      ""
    ].join('\n'),

    datalist: [
      "const input = document.querySelector('input[list]');",
      "input.addEventListener('input', () => {",
      "  const list = document.getElementById(input.getAttribute('list'));",
      "  const hit = [...list.options].some(o => o.value === input.value);",
      "  console.log(input.value, hit ? '← 来自建议列表' : '← 用户自己输入');",
      "});",
      ""
    ].join('\n'),

    button: [
      "// 最经典的计数：state → DOM 单向更新",
      "let count = 0;",
      "const btn = document.querySelector('button');",
      "const tip = document.createElement('p');",
      "tip.textContent = '还没点过';",
      "btn.after(tip);",
      "",
      "btn.addEventListener('click', () => {",
      "  count += 1;",
      "  tip.textContent = `你点了 ${count} 次`;",
      "  console.warn('count =', count);",
      "});",
      ""
    ].join('\n'),

    form: [
      "const form = document.querySelector('form');",
      "",
      "form.addEventListener('submit', (e) => {",
      "  e.preventDefault();                       // 阻止页面跳转",
      "  const data = Object.fromEntries(new FormData(form));",
      "  console.log('提交的数据：', data);",
      "",
      "  const tip = document.createElement('p');",
      "  tip.style.color = '#0f7b52';",
      "  tip.textContent = '已提交：' + JSON.stringify(data);",
      "  form.appendChild(tip);",
      "});",
      "",
      "// 输入时做即时校验",
      "form.querySelector('[name=user]').addEventListener('input', (e) => {",
      "  const el = e.target;",
      "  el.setCustomValidity(el.value.length < 2 ? '至少 2 个字符' : '');",
      "  el.reportValidity();",
      "});",
      ""
    ].join('\n'),

    ul: [
      "const list = document.querySelector('ul');",
      "let n = list.children.length;",
      "",
      "const btn = document.createElement('button');",
      "btn.textContent = '＋ 添加一项';",
      "btn.addEventListener('click', () => {",
      "  const li = document.createElement('li');",
      "  li.textContent = '新增项 ' + (++n);",
      "  list.appendChild(li);",
      "});",
      "list.after(btn);",
      "",
      "// 事件委托：只在父元素上挂一次监听",
      "list.addEventListener('click', (e) => {",
      "  if (e.target.tagName === 'LI') e.target.remove();",
      "});",
      "console.log('试试点列表项，会把它删掉');",
      ""
    ].join('\n'),

    ol: [
      "const ol = document.querySelector('ol');",
      "ol.addEventListener('click', (e) => {",
      "  if (e.target.tagName !== 'LI') return;",
      "  e.target.dataset.done = e.target.dataset.done === '1' ? '0' : '1';",
      "  console.log(`${ol.children.length} 项已完成`);",
      "});",
      ""
    ].join('\n'),

    table: [
      "// 动态往 <table> 里加一行",
      "const tb = document.querySelector('table tbody');",
      "const data = [['form', '表单容器'], ['canvas', '画布'], ['dialog', '对话框']];",
      "",
      "data.forEach(([tag, desc]) => {",
      "  const tr = document.createElement('tr');",
      "  tr.innerHTML = `<td>${tag}</td><td>${desc}</td>`;",
      "  tb.appendChild(tr);",
      "});",
      "",
      "console.log('现在共', tb.rows.length, '行');",
      ""
    ].join('\n'),

    template: [
      "// <template> 里的内容不会被渲染，正适合当「零件」重复使用",
      "const tpl = document.getElementById('cardTpl');",
      "const users = [",
      "  { name: '张三', role: '前端' },",
      "  { name: '李四', role: '设计' },",
      "  { name: '王五', role: '产品' }",
      "];",
      "",
      "users.forEach(u => {",
      "  const node = tpl.content.cloneNode(true);   // 重点：克隆内容",
      "  node.querySelector('.name').textContent = u.name;",
      "  node.querySelector('.role').textContent = u.role;",
      "  document.body.appendChild(node);",
      "});",
      "console.log('渲染了', users.length, '张卡片');",
      ""
    ].join('\n'),

    video: [
      "const v = document.querySelector('video');",
      "if (v) {",
      "  v.addEventListener('play', () => console.log('开始播放'));",
      "  v.addEventListener('timeupdate', () => {",
      "    console.clear();",
      "    console.log(`进度 ${v.currentTime.toFixed(1)}s / ${v.duration || '?'}s`);",
      "  });",
      "  v.addEventListener('ended', () => console.warn('播放结束'));",
      "",
      "  // 3 秒后自动暂停，演示 API 控制",
      "  v.play().catch(() => console.log('浏览器拦截了自动播放，需要用户先交互'));",
      "  setTimeout(() => v.pause(), 3000);",
      "}",
      ""
    ].join('\n'),

    audio: [
      "const a = document.querySelector('audio');",
      "if (a) {",
      "  a.volume = 0.5;",
      "  document.body.insertAdjacentHTML('beforeend',",
      "    '<p><button id=\"play\">▶ 播放</button><button id=\"pause\">⏸ 暂停</button></p>');",
      "  document.getElementById('play').onclick = () => a.play();",
      "  document.getElementById('pause').onclick = () => a.pause();",
      "  console.log('音量设为', a.volume);",
      "}",
      ""
    ].join('\n'),

    picture: [
      "// 用 matchMedia 观察断点变化（和 <picture> 的 media 条件同步）",
      "const mq = window.matchMedia('(min-width: 500px)');",
      "function report(e) {",
      "  console.log('当前视口', document.documentElement.clientWidth, 'px，是否宽屏：', e.matches);",
      "}",
      "report(mq);",
      "mq.addEventListener('change', report);",
      ""
    ].join('\n'),

    img: [
      "const img = document.querySelector('img');",
      "img.addEventListener('load', () => {",
      "  console.log('加载完成，原始尺寸：', img.naturalWidth + '×' + img.naturalHeight);",
      "});",
      "img.addEventListener('error', () => {",
      "  console.error('图片挂了，换备用图');",
      "  img.src = 'data:image/svg+xml;charset=utf-8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22240%22 height=%22120%22%3E%3Crect width=%22240%22 height=%22120%22 fill=%22%23ccd3e2%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 fill=%22%2359637a%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22%3E%E5%9B%BE%E7%89%87%E5%8A%A0%E8%BD%BD%E5%A4%B1%E8%B4%A5%3C/text%3E%3C/svg%3E';",
      "});",
      ""
    ].join('\n'),

    svg: [
      "const circle = document.querySelector('circle');",
      "const colors = ['#4ddba0', '#e3a94b', '#f06565', '#7b93ff'];",
      "let i = 0;",
      "circle.style.cursor = 'pointer';",
      "circle.addEventListener('click', () => {",
      "  i = (i + 1) % colors.length;",
      "  circle.setAttribute('fill', colors[i]);",
      "  console.log('换成', colors[i]);",
      "});",
      ""
    ].join('\n'),

    time: [
      "// 把 datetime 读出来，按中文习惯格式化",
      "const t = document.querySelector('time');",
      "if (t) {",
      "  const date = new Date(t.dateTime || t.textContent);",
      "  console.log('ISO：', t.dateTime);",
      "  console.log('中文：', date.toLocaleString('zh-CN', {",
      "    year: 'numeric', month: 'long', day: 'numeric', weekday: 'long'",
      "  }));",
      "  console.log('距今：', Math.round((Date.now() - date) / 86400000), '天');",
      "}",
      ""
    ].join('\n'),

  };

  /* ---------- 二、JavaScript 速查表 ---------- */
  window.JS_GROUPS = [
    {
      t: '变量与类型', icon: '🔤',
      intro: '现代 JS 优先用 const / let，忘掉 var。对象是引用类型，比较的是地址。',
      items: [
        { c: "const PI = 3.14;                 // 常量，不可重新赋值", d: '声明常量' },
        { c: "let count = 0; count += 1;", d: '声明可变变量' },
        { c: "typeof 42            // 'number'", d: '类型判断' },
        { c: "Number.isNaN(x)      // 比全局 isNaN 更可靠", d: '判断 NaN' },
        { c: "`你好，${name}！今天是第 ${day} 天`", d: '模板字符串（反引号）' },
        { c: "const [a, b] = [1, 2];           // a=1 b=2", d: '数组解构' },
        { c: "const { name, age = 18 } = user;", d: '对象解构 + 默认值' },
        { c: "const merged = { ...a, ...b };   // 后者覆盖前者", d: '展开运算符' },
        { c: "let x; const y = x ?? '默认值';  // 仅 null/undefined 时兜底", d: '空值合并 ??' },
        { c: "const city = user?.address?.city; // 可选链，避免层层判空", d: '可选链 ?.' }
      ]
    },
    {
      t: '字符串与数组', icon: '📚',
      intro: '数组的高阶函数是日常写得最多的部分：map 变换、filter 筛选、reduce 聚合。',
      items: [
        { c: "str.trim().toLowerCase().replace('a', 'b')", d: '去空格 / 大小写 / 替换' },
        { c: "str.split(',').map(s => s.trim())", d: '拆分并清洗' },
        { c: "str.includes('html') || str.startsWith('a')", d: '包含 / 前缀判断' },
        { c: "str.padStart(2, '0')      // '7' → '07'", d: '补位（时间格式化常用）' },
        { c: "arr.map(x => x * 2)       // 返回新数组", d: 'map 映射' },
        { c: "arr.filter(x => x > 10)   // 保留满足条件的", d: 'filter 过滤' },
        { c: "arr.reduce((sum, x) => sum + x, 0)", d: 'reduce 累加' },
        { c: "arr.find(x => x.id === 3) // 找不到返回 undefined", d: 'find 查找单个' },
        { c: "arr.some(...)/arr.every(...)  // 任一 / 全部满足", d: 'some / every' },
        { c: "[...new Set(arr)]        // 去重", d: 'Set 去重' },
        { c: "arr.sort((a, b) => a.age - b.age)", d: '排序（对象数组）' },
        { c: "arr.flat(Infinity).join(' / ')", d: '拍平 + 拼接' },
        { c: "arr.splice(i, 1)         // 从下标 i 删除 1 个（会改原数组）", d: 'splice 原地修改' },
        { c: "arr.slice(0, 3)          // 截取前 3 个（不改原数组）", d: 'slice 截取' }
      ]
    },
    {
      t: '函数与对象', icon: '⚙️',
      intro: '箭头函数没有自己的 this，写回调时更省心；对象里的方法可以直接写简写形式。',
      items: [
        { c: "const add = (a, b = 0) => a + b;", d: '箭头函数 + 默认参数' },
        { c: "const sum = (...nums) => nums.reduce((a, b) => a + b, 0);", d: '剩余参数' },
        { c: "function debounce(fn, ms = 300) { /* 见下方演示 */ }", d: '防抖：停止操作后再执行' },
        { c: "const throttle = (fn, ms) => { /* 节流：固定频率执行 */ };", d: '节流：限制执行频率' },
        { c: "Object.keys(obj) / Object.values(obj) / Object.entries(obj)", d: '遍历对象三件套' },
        { c: "JSON.parse(JSON.stringify(obj))  // 简易深拷贝", d: '深拷贝（不支持函数/循环引用）' },
        { c: "structuredClone(obj)             // 现代深拷贝 API", d: '原生深拷贝' },
        { c: "class Todo extends Item { constructor(){ super(); } }", d: '类与继承' },
        { c: "obj.hasOwnProperty('name') 或 'name' in obj", d: '属性存在判断' }
      ]
    },
    {
      t: 'DOM 查询', icon: '🔍',
      intro: 'querySelector 一把梭：CSS 选择器怎么写，这里就怎么写。',
      items: [
        { c: "document.querySelector('#app .item')", d: '取第一个匹配元素' },
        { c: "document.querySelectorAll('li')  // 返回 NodeList", d: '取全部匹配元素' },
        { c: "[...document.querySelectorAll('li')]  // 转成数组才能用 map", d: 'NodeList → Array' },
        { c: "document.getElementById('header')", d: '按 id 取（最快）' },
        { c: "el.closest('.card')       // 向上找最近的祖先", d: '向上查找' },
        { c: "el.matches('a[href]')     // 判断自身是否匹配选择器", d: '自身匹配判断' },
        { c: "el.parentElement / el.children / el.nextElementSibling", d: '亲戚节点' },
        { c: "el.querySelector('.title') // 在子树里继续找", d: '范围内查找' }
      ]
    },
    {
      t: 'DOM 操作', icon: '🛠️',
      intro: '改样式优先用 classList，改内容优先用 textContent（防 XSS），结构才用 innerHTML。',
      items: [
        { c: "el.classList.add('active') / .remove() / .toggle() / .contains()", d: '类名操作' },
        { c: "el.textContent = '纯文本，安全'", d: '写文本（推荐）' },
        { c: "el.innerHTML = '<b>会被解析成 HTML</b>'", d: '写 HTML（注意 XSS）' },
        { c: "el.setAttribute('aria-expanded', 'true') / el.dataset.id", d: '属性与 data-*' },
        { c: "el.style.transform = 'scale(1.1)'   // 注意用驼峰，别写 -", d: '内联样式' },
        { c: "el.getBoundingClientRect()          // 位置与尺寸", d: '几何信息' },
        { c: "const li = document.createElement('li'); parent.appendChild(li);", d: '创建并插入' },
        { c: "parent.append(a, b) / parent.prepend(x)  // 支持多个", d: '批量插入' },
        { c: "el.insertAdjacentHTML('beforeend', '<p>hi</p>')", d: '按位置插入 HTML' },
        { c: "el.remove()  /  el.replaceWith(newEl)", d: '删除 / 替换' },
        { c: "const frag = new DocumentFragment()  // 批量插入减少重排", d: '文档片段' }
      ]
    },
    {
      t: '事件', icon: '⚡',
      intro: 'addEventListener 可以叠加多个监听器；配合事件委托，列表再长也只要一个监听器。',
      items: [
        { c: "el.addEventListener('click', handler)", d: '绑定事件' },
        { c: "el.addEventListener('click', fn, { once: true })", d: '只执行一次' },
        { c: "el.addEventListener('scroll', fn, { passive: true })", d: '提升滚动性能' },
        { c: "e.target       // 真正被点的那个元素", d: '事件目标' },
        { c: "e.currentTarget // 监听器所在的那个元素", d: '绑定元素' },
        { c: "e.preventDefault() / e.stopPropagation()", d: '阻止默认 / 阻止冒泡' },
        { c: "list.addEventListener('click', e => { if (e.target.matches('li')) ... })", d: '事件委托（推荐）' },
        { c: "el.dispatchEvent(new CustomEvent('refresh', { detail: { id: 1 } }))", d: '派发自定义事件' },
        { c: "window.addEventListener('resize', fn)", d: '窗口尺寸变化' },
        { c: "document.addEventListener('DOMContentLoaded', fn)", d: 'DOM 就绪' },
        { c: "window.addEventListener('keydown', e => e.key === 'Escape' && close())", d: '键盘 Esc' }
      ]
    },
    {
      t: '表单与输入', icon: '📝',
      intro: 'input 事件实时触发，change 事件在失焦后触发；提交记得 preventDefault。',
      items: [
        { c: "el.value        // input / select / textarea 的当前值", d: '读取值' },
        { c: "el.checked      // 复选框 / 单选框是否选中", d: '勾选状态' },
        { c: "new FormData(form)                     // 收集整张表单", d: 'FormData' },
        { c: "Object.fromEntries(new FormData(form)) // 转成普通对象", d: '表单转对象' },
        { c: "form.addEventListener('submit', e => e.preventDefault())", d: '阻止刷新跳转' },
        { c: "el.focus() / el.blur() / el.select()", d: '焦点控制' },
        { c: "el.checkValidity() / el.setCustomValidity('提示')", d: '原生校验 API' },
        { c: "navigator.clipboard.writeText(text)   // 复制到剪贴板", d: '剪贴板' }
      ]
    },
    {
      t: '异步：Promise / fetch / async', icon: '🔄',
      intro: 'async / await 只是 Promise 的语法糖，错误处理一定记得 try...catch。',
      items: [
        { c: "const p = new Promise((resolve, reject) => setTimeout(resolve, 1000))", d: '创建 Promise' },
        { c: "async function load() { const r = await fetch(url); return r.json(); }", d: 'async / await' },
        { c: "const res = await fetch(url); if (!res.ok) throw new Error(res.status)", d: 'fetch 注意判断 ok' },
        { c: "await fetch(url, { method: 'POST', body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' } })", d: 'POST JSON' },
        { c: "const [a, b] = await Promise.all([f1(), f2()])", d: '并发等待' },
        { c: "try { await load() } catch (e) { console.error(e) } finally { hide() }", d: '错误兜底' },
        { c: "await new Promise(r => setTimeout(r, 300))    // 睡 300ms", d: '延时' },
        { c: "Promise.allSettled([...])   // 不因某一个失败而中断", d: '全部完成' }
      ]
    },
    {
      t: '定时器与动画', icon: '⏱️',
      intro: '动画优先 requestAnimationFrame；setInterval 记得在合适时机 clear，否则内存泄漏。',
      items: [
        { c: "const id = setTimeout(fn, 1000);  clearTimeout(id)", d: '延时一次' },
        { c: "const id = setInterval(fn, 1000); clearInterval(id)", d: '周期执行' },
        { c: "requestAnimationFrame(step)       // 跟随屏幕刷新率", d: '逐帧动画' },
        { c: "el.animate([{opacity:0},{opacity:1}], { duration: 300 })", d: 'Web Animations API' },
        { c: "new IntersectionObserver(cb).observe(el)  // 进入视口才触发", d: '懒加载 / 曝光埋点' },
        { c: "new MutationObserver(cb).observe(el, { childList: true })", d: '监听 DOM 变化' },
        { c: "new ResizeObserver(cb).observe(el)        // 元素尺寸变化", d: '尺寸监听' }
      ]
    },
    {
      t: '存储与实用 API', icon: '💾',
      intro: 'localStorage 只能存字符串，对象记得先 JSON.stringify。',
      items: [
        { c: "localStorage.setItem('k', JSON.stringify(obj))", d: '存对象' },
        { c: "JSON.parse(localStorage.getItem('k') || '{}')", d: '取对象（带兜底）' },
        { c: "sessionStorage.clear()   // 关标签页即失效", d: '会话存储清空' },
        { c: "new URLSearchParams(location.search).get('id')", d: '解析查询串' },
        { c: "date.toLocaleDateString('zh-CN')", d: '本地化日期' },
        { c: "Math.round / Math.max(...arr) / Math.random()", d: '常用数学' },
        { c: "crypto.randomUUID()      // 生成唯一 id", d: '生成 id' },
        { c: "console.table(list) / console.time('t') … console.timeEnd('t')", d: '调试小技巧' }
      ]
    }
  ];

  /* ---------- 一（续）、每组速查配套的可运行示例 ---------- */
  var G_CSS = [
    'body { font-size: 13px; }',
    '.box { border: 1px solid var(--border); border-radius: 9px; background: var(--bg-elev); padding: 10px 12px; }',
    '.row { display: flex; justify-content: space-between; gap: 10px; padding: 6px 2px;',
    '      border-bottom: 1px dashed var(--border); font-size: 12.3px; }',
    '.row:last-child { border-bottom: 0; }',
    '.row span { color: var(--text-soft); }',
    '.row b { font-family: var(--mono); color: var(--accent); font-weight: 600; text-align: right; word-break: break-all; }',
    '.log { margin: 8px 0 0; font-size: 11.8px; color: var(--text-dim); line-height: 1.6; }',
    '.btn { border: 1px solid var(--border-st); background: var(--bg-soft); color: var(--text);',
    '       border-radius: 7px; padding: 5px 11px; font-size: 12.3px; cursor: pointer; font-family: var(--sans); }',
    '.btn:hover { border-color: var(--accent); color: var(--accent); }',
    '.btn.pri { background: var(--accent); border-color: var(--accent); color: #fff; }',
    '.grid { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 8px; }'
  ].join('\n');

  window.JS_GROUP_DEMOS = {

    '变量与类型': {
      css: G_CSS,
      html: [
        '<div class="box" id="list"></div>',
        '<p class="log">结果同时打印到控制台：点演示底栏的「日志」徽章或 ⌨ 按钮查看。</p>'
      ].join('\n'),
      js: [
        "const PI = 3.14159;            // const：绑定之后不能再赋值",
        "let count = 0;                 // let：可以重新赋值",
        "count += 1;",
        "",
        "const a = [1, 2];",
        "const b = a;                   // 引用类型：复制的是地址，不是内容",
        "b.push(3);",
        "",
        "const rows = [",
        "  ['typeof 42', typeof 42],",
        "  ['typeof \"42\"', typeof '42'],",
        "  ['typeof null（历史遗留）', typeof null],",
        "  ['Array.isArray(a)', Array.isArray(a)],",
        "  ['a === b（同一个地址）', a === b],",
        "  ['a 现在的内容', JSON.stringify(a)],",
        "  ['Number(\"12\") + 1', Number('12') + 1],",
        "  ['\"5\" + 1（字符串拼接）', '5' + 1],",
        "  ['\"5\" - 1（转成数字）', '5' - 1],",
        "  ['Boolean(\"\") / Boolean(\"0\")', Boolean('') + ' / ' + Boolean('0')]",
        "];",
        "",
        "const list = document.getElementById('list');",
        "rows.forEach(function (r) {",
        "  const row = document.createElement('div');",
        "  row.className = 'row';",
        "  row.innerHTML = '<span></span><b></b>';",
        "  row.firstChild.textContent = r[0];",
        "  row.lastChild.textContent = String(r[1]);",
        "  list.appendChild(row);",
        "  console.log(r[0], '=>', r[1]);",
        "});",
        "console.log('PI =', PI, '| count =', count);"
      ].join('\n')
    },

    '字符串与数组': {
      css: G_CSS,
      html: [
        '<div class="box" id="list"></div>',
        '<p class="log">数组的高阶函数不会改变原数组（sort 除外），需要结果请接收返回值。</p>'
      ].join('\n'),
      js: [
        "const arr = [3, 1, 4, 1, 5, 9, 2, 6];",
        "const text = '  Hello, JavaScript  ';",
        "",
        "const rows = [",
        "  ['原数组', arr.join(', ')],",
        "  ['map(x => x * 2)', arr.map(function (x) { return x * 2; }).join(', ')],",
        "  ['filter(x => x > 3)', arr.filter(function (x) { return x > 3; }).join(', ')],",
        "  ['reduce((a, b) => a + b, 0)', arr.reduce(function (a, b) { return a + b; }, 0)],",
        "  ['sort((a, b) => a - b)', arr.slice().sort(function (a, b) { return a - b; }).join(', ')],",
        "  ['find(x => x > 4)', arr.find(function (x) { return x > 4; })],",
        "  ['includes(5) / indexOf(5)', arr.includes(5) + ' / ' + arr.indexOf(5)],",
        "  ['slice(1, 4)（不改原数组）', arr.slice(1, 4).join(', ')],",
        "  ['去重 [...new Set(arr)]', Array.from(new Set(arr)).join(', ')],",
        "  ['flatMap / flat(Infinity)', [[1, 2], [3, [4]]].flat(Infinity).join(', ')],",
        "  ['text.trim()', JSON.stringify(text.trim())],",
        "  ['text.replace(\"Java\", \"Type\")', text.trim().replace('Java', 'Type')],",
        "  ['text.split(\", \")', JSON.stringify(text.trim().split(', '))],",
        "  ['模板字符串 `1 + 1 = ${1 + 1}`', `1 + 1 = ${1 + 1}`],",
        "  ['\"ab\".repeat(3)', 'ab'.repeat(3)],",
        "  ['\"2026-10-26\".startsWith(\"2026\")', '2026-10-26'.startsWith('2026')]",
        "];",
        "",
        "const list = document.getElementById('list');",
        "rows.forEach(function (r) {",
        "  const row = document.createElement('div');",
        "  row.className = 'row';",
        "  row.innerHTML = '<span></span><b></b>';",
        "  row.firstChild.textContent = r[0];",
        "  row.lastChild.textContent = String(r[1]);",
        "  list.appendChild(row);",
        "  console.log(r[0], '=>', r[1]);",
        "});",
        "console.log('原数组没被改变：', arr.join(', '));"
      ].join('\n')
    },

    '函数与对象': {
      css: G_CSS,
      html: [
        '<div class="box" id="list"></div>',
        '<p class="log">箭头函数没有自己的 this，写回调很省心；当对象方法时反而会踩坑。</p>'
      ].join('\n'),
      js: [
        "const double = (n) => n * 2;",
        "function greet(name = '同学') { return '你好，' + name; }",
        "",
        "const box = {",
        "  n: 1,",
        "  normal() { return this.n; },        // 方法简写，this 指向 box",
        "  arrow: () => '拿不到 this.n'         // 箭头函数的 this 来自外层",
        "};",
        "",
        "const user = { name: '小明', age: 18, city: '上海' };",
        "const { name, city, ...others } = user;",
        "const copy = { ...user, age: 19 };",
        "",
        "const rows = [",
        "  ['double(21)', double(21)],",
        "  ['greet()（默认参数）', greet()],",
        "  ['box.normal()', box.normal()],",
        "  ['box.arrow()', box.arrow()],",
        "  ['解构 name / city', name + ' / ' + city],",
        "  ['剩余属性 ...others', JSON.stringify(others)],",
        "  ['展开副本 copy.age', copy.age],",
        "  ['原对象 user.age（没被改）', user.age],",
        "  ['Object.keys(user)', Object.keys(user).join(', ')],",
        "  ['user.hasOwnProperty(\"age\")', user.hasOwnProperty('age')]",
        "];",
        "",
        "const list = document.getElementById('list');",
        "rows.forEach(function (r) {",
        "  const row = document.createElement('div');",
        "  row.className = 'row';",
        "  row.innerHTML = '<span></span><b></b>';",
        "  row.firstChild.textContent = r[0];",
        "  row.lastChild.textContent = String(r[1]);",
        "  list.appendChild(row);",
        "  console.log(r[0], '=>', r[1]);",
        "});"
      ].join('\n')
    },

    'DOM 查询': {
      css: G_CSS + '\n' + [
        '.menu { display: flex; gap: 8px; margin: 0 0 10px; padding: 0; list-style: none; }',
        '.menu .item { padding: 5px 12px; border-radius: 999px; background: var(--bg-soft); font-size: 12.3px; }',
        '.menu .item.on { background: var(--accent); color: #fff; }'
      ].join('\n'),
      html: [
        '<ul id="menu" class="menu">',
        '  <li class="item on" data-id="1">首页</li>',
        '  <li class="item" data-id="2">文档</li>',
        '  <li class="item" data-id="3">关于</li>',
        '</ul>',
        '<div class="box" id="list"></div>'
      ].join('\n'),
      js: [
        "const menu = document.querySelector('#menu');",
        "const items = document.querySelectorAll('#menu .item');",
        "",
        "const rows = [",
        "  ['querySelector(\"#menu\")', menu.tagName + '#' + menu.id],",
        "  ['querySelectorAll(\"#menu .item\").length', items.length],",
        "  ['items[0].textContent', items[0].textContent.trim()],",
        "  ['items[0].dataset.id', items[0].dataset.id],",
        "  ['items[0].parentElement', items[0].parentElement.id],",
        "  ['items[0].nextElementSibling', items[0].nextElementSibling.textContent.trim()],",
        "  ['querySelector(\".item.on\")', document.querySelector('.item.on').textContent.trim()],",
        "  ['items[1].closest(\"#menu\")', items[1].closest('#menu').id],",
        "  ['属性选择器 [data-id=\"3\"]', document.querySelector('[data-id=\"3\"]').textContent.trim()],",
        "  ['items[2].matches(\".item\")', items[2].matches('.item')]",
        "];",
        "",
        "const list = document.getElementById('list');",
        "rows.forEach(function (r) {",
        "  const row = document.createElement('div');",
        "  row.className = 'row';",
        "  row.innerHTML = '<span></span><b></b>';",
        "  row.firstChild.textContent = r[0];",
        "  row.lastChild.textContent = String(r[1]);",
        "  list.appendChild(row);",
        "  console.log(r[0], '=>', r[1]);",
        "});",
        "",
        "items.forEach(function (el, i) { console.log('forEach 遍历 item ' + i + '：', el.textContent.trim()); });",
        "console.log('NodeList 转数组再 map：', Array.from(items).map(function (el) { return el.textContent.trim(); }));"
      ].join('\n')
    },

    'DOM 操作': {
      css: G_CSS + '\n' + [
        '.card-demo { border: 1px solid var(--border); border-radius: 9px; background: var(--bg-elev);',
        '             padding: 12px 14px; transition: background .25s, border-color .25s; }',
        '.card-demo.hl { background: var(--accent-soft); border-color: var(--accent); }',
        '.card-demo .pill { display: inline-block; margin-right: 6px; padding: 1px 8px;',
        '                   border-radius: 999px; background: var(--accent); color: #fff; font-size: 11px; }'
      ].join('\n'),
      html: [
        '<div class="card-demo" id="card" data-count="0">',
        '  <b id="title">原标题</b>',
        '  <p class="log">点下面的按钮，看同一个元素被怎么改</p>',
        '</div>',
        '<div class="grid">',
        '  <button class="btn pri" id="b1">改文本</button>',
        '  <button class="btn" id="b2">切 class</button>',
        '  <button class="btn" id="b3">插入元素</button>',
        '  <button class="btn" id="b4">改 data-*</button>',
        '</div>'
      ].join('\n'),
      js: [
        "const card = document.getElementById('card');",
        "const title = document.getElementById('title');",
        "let i = 0;",
        "",
        "document.getElementById('b1').addEventListener('click', function () {",
        "  title.textContent = '用 textContent 改过 ' + (++i) + ' 次（不会被当成 HTML 解析）';",
        "  console.log('title.textContent =', title.textContent);",
        "});",
        "",
        "document.getElementById('b2').addEventListener('click', function () {",
        "  const on = card.classList.toggle('hl');",
        "  console.log('classList.toggle(\"hl\") =>', on, '| class =', card.className);",
        "});",
        "",
        "document.getElementById('b3').addEventListener('click', function () {",
        "  const tag = document.createElement('span');",
        "  tag.className = 'pill';",
        "  tag.textContent = '新元素' + (card.querySelectorAll('.pill').length + 1);",
        "  card.insertBefore(tag, card.firstChild);",
        "  console.log('插入后 children.length =', card.children.length);",
        "});",
        "",
        "document.getElementById('b4').addEventListener('click', function () {",
        "  const n = Number(card.dataset.count || 0) + 1;",
        "  card.dataset.count = String(n);",
        "  card.setAttribute('title', '已点击 ' + n + ' 次');",
        "  console.log('data-count =', card.dataset.count, '| title 属性 =', card.getAttribute('title'));",
        "});",
        "",
        "console.log('结构用 innerHTML，内容一律用 textContent（防 XSS）');"
      ].join('\n')
    },

    '事件': {
      css: G_CSS,
      html: [
        '<div class="box">',
        '  <div class="grid" id="list">',
        '    <button class="btn" data-name="新增">新增</button>',
        '    <button class="btn" data-name="编辑">编辑</button>',
        '    <button class="btn" data-name="删除">删除</button>',
        '  </div>',
        '  <p class="log" id="out">事件委托：父级只绑了一个监听器，新增的按钮也自动生效</p>',
        '  <p class="log" id="out2">把鼠标移到按钮上，或按任意键</p>',
        '</div>'
      ].join('\n'),
      js: [
        "const list = document.getElementById('list');",
        "const out = document.getElementById('out');",
        "const out2 = document.getElementById('out2');",
        "",
        "list.addEventListener('click', function (e) {",
        "  const btn = e.target.closest('button');",
        "  if (!btn) return;",
        "  out.textContent = '点击了「' + btn.dataset.name + '」· e.target = ' + e.target.tagName +",
        "    ' · e.currentTarget = #' + e.currentTarget.id;",
        "  console.log('click：', btn.dataset.name, '| target =', e.target, '| currentTarget =', e.currentTarget);",
        "});",
        "",
        "list.addEventListener('mouseover', function () {",
        "  out2.textContent = 'mouseover 只触发一次（第三个参数 { once: true }）';",
        "  console.log('mouseover 触发一次后，监听器已被自动移除');",
        "}, { once: true });",
        "",
        "document.addEventListener('keydown', function (e) {",
        "  out2.textContent = 'keydown：key = ' + e.key + ' · code = ' + e.code;",
        "  console.log('keydown：', e.key, e.code);",
        "});",
        "",
        "console.log('addEventListener 可以叠加多个监听器，执行顺序 = 绑定顺序');"
      ].join('\n')
    },

    '表单与输入': {
      css: G_CSS + '\n' + [
        '.lab { display: block; margin-bottom: 8px; font-size: 12.5px; color: var(--text-soft); }',
        '.lab input, .lab select { margin-left: 6px; padding: 5px 8px; border: 1px solid var(--border-st);',
        '                          border-radius: 6px; background: var(--bg-elev); color: var(--text); font-size: 12.5px; }'
      ].join('\n'),
      html: [
        '<form id="f" autocomplete="off">',
        '  <label class="lab">姓名 <input id="name" name="name" placeholder="边输入边看"></label>',
        '  <label class="lab">方向 <select name="track"><option>前端</option><option>后端</option><option>设计</option></select></label>',
        '  <label class="lab"><input type="checkbox" name="agree"> 同意条款</label>',
        '  <div class="grid">',
        '    <button class="btn pri" type="submit">提交</button>',
        '    <button class="btn" type="reset">重置</button>',
        '  </div>',
        '</form>',
        '<p class="log" id="live">input 事件：等待输入…</p>',
        '<p class="log" id="res">submit 会被 preventDefault 拦下，内容打印到控制台</p>'
      ].join('\n'),
      js: [
        "const form = document.getElementById('f');",
        "const nameEl = document.getElementById('name');",
        "const live = document.getElementById('live');",
        "const res = document.getElementById('res');",
        "",
        "nameEl.addEventListener('input', function (e) {",
        "  live.textContent = 'input（实时）：' + e.target.value + '（长度 ' + e.target.value.length + '）';",
        "});",
        "nameEl.addEventListener('change', function (e) {",
        "  console.log('change（失焦后才触发）：', e.target.value);",
        "});",
        "",
        "form.addEventListener('submit', function (e) {",
        "  e.preventDefault();                 // 拦住默认提交，页面不会刷新",
        "  const fd = new FormData(form);",
        "  const data = Object.fromEntries(fd.entries());",
        "  data.agree = fd.has('agree');       // 没勾选的 checkbox 不会进 FormData",
        "  res.textContent = '已拦截提交：' + JSON.stringify(data);",
        "  console.log('提交内容：', data);",
        "  console.log('form.checkValidity() =', form.checkValidity());",
        "});",
        "",
        "form.addEventListener('reset', function () {",
        "  setTimeout(function () {",
        "    live.textContent = 'input 事件：表单已重置';",
        "    console.log('表单已重置');",
        "  }, 0);",
        "});",
        "",
        "console.log('input 实时触发，change 失焦后触发，提交记得 preventDefault');"
      ].join('\n')
    },

    '异步：Promise / fetch / async': {
      css: G_CSS + '\n' + [
        '.bar { height: 6px; border-radius: 999px; background: var(--bg-soft); overflow: hidden; margin-top: 8px; }',
        '.bar i { display: block; height: 100%; width: 0; background: var(--accent); transition: width .35s; }',
        '.bar i.on { width: 100%; }'
      ].join('\n'),
      html: [
        '<div class="box">',
        '  <div class="grid">',
        '    <button class="btn pri" id="load">发起请求（await）</button>',
        '    <button class="btn" id="both">Promise.all 并发</button>',
        '  </div>',
        '  <p class="log" id="status">状态：空闲</p>',
        '  <div class="bar"><i id="bar"></i></div>',
        '</div>',
        '<p class="log">这里用延时模拟网络请求，真实项目把 delay 换成 fetch(url).then(r => r.json()) 即可。</p>'
      ].join('\n'),
      js: [
        "function delay(ms, value) {",
        "  return new Promise(function (resolve) {",
        "    setTimeout(function () { resolve(value); }, ms);",
        "  });",
        "}",
        "",
        "const status = document.getElementById('status');",
        "const bar = document.getElementById('bar');",
        "",
        "document.getElementById('load').addEventListener('click', async function () {",
        "  status.textContent = '状态：加载中…';",
        "  bar.classList.add('on');",
        "  console.log('请求开始', new Date().toLocaleTimeString('zh-CN'));",
        "  try {",
        "    const data = await delay(900, { name: '小明', score: 92 });",
        "    status.textContent = '状态：完成 → ' + JSON.stringify(data);",
        "    console.log('await 拿到数据：', data);",
        "  } catch (err) {",
        "    console.error('出错了：', err);",
        "  } finally {",
        "    bar.classList.remove('on');",
        "    console.log('finally：成功失败都会执行');",
        "  }",
        "});",
        "",
        "document.getElementById('both').addEventListener('click', function () {",
        "  status.textContent = '状态：并发两个请求…';",
        "  const t0 = performance.now();",
        "  Promise.all([delay(400, 'A'), delay(700, 'B')]).then(function (list) {",
        "    const cost = Math.round(performance.now() - t0);",
        "    status.textContent = '状态：Promise.all 完成 ' + list.join(' + ') + '，耗时 ' + cost + 'ms（并发而非串行）';",
        "    console.log('Promise.all =>', list, '| 耗时', cost + 'ms');",
        "  });",
        "});",
        "",
        "console.log('async / await 只是 Promise 的语法糖，错误处理靠 try...catch');"
      ].join('\n')
    },

    '定时器与动画': {
      css: G_CSS + '\n' + [
        '.track { position: relative; height: 36px; border-radius: 8px; background: var(--bg-soft); overflow: hidden; }',
        '.track i { position: absolute; top: 7px; left: 6px; width: 22px; height: 22px;',
        '           border-radius: 50%; background: var(--accent); }'
      ].join('\n'),
      html: [
        '<div class="box">',
        '  <div class="track"><i id="dot"></i></div>',
        '  <p class="log" id="fps">requestAnimationFrame：等待首帧…</p>',
        '  <p class="log" id="cnt">setInterval：等待 1 秒…</p>',
        '</div>'
      ].join('\n'),
      js: [
        "const dot = document.getElementById('dot');",
        "const fpsEl = document.getElementById('fps');",
        "const cntEl = document.getElementById('cnt');",
        "",
        "let frames = 0, start = 0;",
        "function tick(now) {",
        "  if (!start) start = now;",
        "  frames++;",
        "  const t = (now - start) / 1000;",
        "  dot.style.transform = 'translateX(' + (Math.sin(t * 2) * 58 + 58).toFixed(1) + 'px)';",
        "  if (frames % 20 === 0) {",
        "    fpsEl.textContent = 'requestAnimationFrame：' + frames + ' 帧 · ' + t.toFixed(1) +",
        "      's · 约 ' + (frames / t).toFixed(0) + ' FPS（跟随屏幕刷新率）';",
        "  }",
        "  requestAnimationFrame(tick);",
        "}",
        "requestAnimationFrame(tick);",
        "",
        "let n = 0;",
        "const timer = setInterval(function () {",
        "  n++;",
        "  cntEl.textContent = 'setInterval：已触发 ' + n + ' 次';",
        "  console.log('setInterval 第 ' + n + ' 次');",
        "  if (n === 5) {",
        "    clearInterval(timer);           // 不用了一定要清掉",
        "    cntEl.textContent = 'setInterval：触发 5 次后已 clearInterval';",
        "    console.log('已 clearInterval，避免一直占着内存');",
        "  }",
        "}, 1000);",
        "",
        "setTimeout(function () { console.log('setTimeout：1.5 秒后只执行一次'); }, 1500);"
      ].join('\n')
    },

    '存储与实用 API': {
      css: G_CSS,
      html: [
        '<div class="box" id="list"></div>',
        '<p class="log">点演示的 ⟳ 重新运行，访问次数会继续累加（预览沙盒里内置了 localStorage 模拟，刷新页面也不丢）。</p>'
      ].join('\n'),
      js: [
        "const KEY = 'demo:visits';",
        "const visits = Number(localStorage.getItem(KEY) || 0) + 1;",
        "localStorage.setItem(KEY, String(visits));",
        "",
        "const user = { name: '小明', tags: ['前端', '速查'] };",
        "localStorage.setItem('demo:user', JSON.stringify(user));   // 只能存字符串",
        "const back = JSON.parse(localStorage.getItem('demo:user'));",
        "",
        "const rows = [",
        "  ['本次运行后的访问次数', visits],",
        "  ['localStorage.getItem(KEY)', localStorage.getItem(KEY)],",
        "  ['存对象（先 stringify）', localStorage.getItem('demo:user')],",
        "  ['取回来（JSON.parse）', JSON.stringify(back)],",
        "  ['Object.keys(localStorage).length', Object.keys(localStorage).length],",
        "  ['new Date().toLocaleString(\"zh-CN\")', new Date().toLocaleString('zh-CN')],",
        "  ['Intl.NumberFormat 千分位', new Intl.NumberFormat('zh-CN').format(1234567)],",
        "  ['Math.random().toFixed(3)', Math.random().toFixed(3)],",
        "  ['crypto.randomUUID 前 8 位', (crypto.randomUUID ? crypto.randomUUID() : '不支持').slice(0, 8)],",
        "  ['new URLSearchParams(\"?a=1&b=2\").get(\"b\")', new URLSearchParams('?a=1&b=2').get('b')]",
        "];",
        "",
        "const list = document.getElementById('list');",
        "rows.forEach(function (r) {",
        "  const row = document.createElement('div');",
        "  row.className = 'row';",
        "  row.innerHTML = '<span></span><b></b>';",
        "  row.firstChild.textContent = r[0];",
        "  row.lastChild.textContent = String(r[1]);",
        "  list.appendChild(row);",
        "  console.log(r[0], '=>', r[1]);",
        "});",
        "",
        "localStorage.removeItem('demo:user');",
        "console.log('removeItem 之后 demo:user =', localStorage.getItem('demo:user'));"
      ].join('\n')
    }
  };

  /* ---------- 二（续）、部分 CSS 属性的 JS 联动示例 ---------- */
  window.PROP_JS_DEMOS = {

    transition: [
      "// 用 JS 切换 class 来触发 transition（比直接改内联样式更好维护）",
      "const el = document.querySelector('.tr');",
      "let on = false;",
      "el.style.cursor = 'pointer';",
      "el.addEventListener('click', () => {",
      "  on = !on;",
      "  el.classList.toggle('on', on);",
      "  el.style.background = on ? '#0f7b52' : '';",
      "  console.log(on ? '已切换' : '已复位');",
      "});",
      "",
      "// transitionrun / transitionend：过渡开始与结束都能监听",
      "el.addEventListener('transitionend', (e) => {",
      "  console.log('过渡结束的属性：', e.propertyName);",
      "});"
    ].join('\n'),

    animation: [
      "// 用 JS 控制动画播放状态",
      "const box = document.querySelector('.an');",
      "box.style.animationPlayState = 'paused';",
      "",
      "const btn = document.createElement('button');",
      "btn.textContent = '▶ 播放 / ⏸ 暂停';",
      "btn.addEventListener('click', () => {",
      "  const paused = box.style.animationPlayState === 'paused';",
      "  box.style.animationPlayState = paused ? 'running' : 'paused';",
      "  console.log(paused ? '继续播放' : '已暂停');",
      "});",
      "document.body.appendChild(btn);",
      "",
      "// 动画每一步都能监听",
      "box.addEventListener('animationstart', () => console.log('动画开始'));",
      "box.addEventListener('animationiteration', () => console.log('又循环了一圈'));",
      "void 0;"
    ].join('\n'),

    transform: [
      "// 跟随鼠标做倾斜，演示 transform 的运行期修改",
      "const boxes = document.querySelectorAll('.tf1, .tf2, .tf3');",
      "boxes.forEach((el) => {",
      "  el.style.transition = 'transform .12s linear';",
      "});",
      "",
      "document.addEventListener('mousemove', (e) => {",
      "  const x = (e.clientX / window.innerWidth - .5) * 20;   // -10 ~ 10deg",
      "  const y = (e.clientY / window.innerHeight - .5) * -20;",
      "  boxes[0].style.transform = `rotate(${x}deg) skewY(${y / 3}deg)`;",
      "});",
      "",
      "console.log('移动鼠标试试');"
    ].join('\n'),

    opacity: [
      "// 淡入淡出：用定时器逐步改变 opacity",
      "const el = document.querySelector('.op2');",
      "let v = 0.5, dir = 0.04;",
      "",
      "setInterval(() => {",
      "  v += dir;",
      "  if (v > 1 || v < .1) dir *= -1;",
      "  el.style.opacity = v.toFixed(2);",
      "  el.textContent = 'opacity: ' + v.toFixed(2);",
      "}, 90);"
    ].join('\n'),

    visibility: [
      "// 对比 visibility 与 display：前者保留占位，后者彻底移除",
      "const hidden = document.querySelector('.vh');",
      "const btn = document.createElement('button');",
      "btn.textContent = '切换 visibility / display';",
      "btn.addEventListener('click', () => {",
      "  const isHidden = getComputedStyle(hidden).visibility === 'hidden';",
      "  if (isHidden) { hidden.style.visibility = 'visible'; }",
      "  else {",
      "    const useDisplay = confirm('点「确定」用 display:none（不占位），点「取消」用 visibility:hidden（留坑）');",
      "    hidden.style.display = useDisplay ? 'none' : '';",
      "    hidden.style.visibility = useDisplay ? '' : 'hidden';",
      "    console.log(useDisplay ? 'display:none，位置塌陷了' : 'visibility:hidden，位置还在');",
      "  }",
      "});",
      "document.body.appendChild(btn);"
    ].join('\n'),

    filter: [
      "// 实时调整模糊强度",
      "const el = document.querySelector('.fi1');",
      "const slider = document.createElement('input');",
      "slider.type = 'range'; slider.min = 0; slider.max = 8; slider.step = .2; slider.value = 1.4;",
      "slider.style.width = '100%';",
      "slider.addEventListener('input', () => {",
      "  el.style.filter = `blur(${slider.value}px)`;",
      "  el.textContent = `blur(${slider.value}px)`;",
      "});",
      "document.body.appendChild(slider);"
    ].join('\n')
  };

  /* ---------- 三、可直接运行的综合实例 ---------- */
  window.JS_EXAMPLES = [
    {
      t: '计数器 + 本地存储', cat: 'DOM 入门', tags: ['事件', 'localStorage', '状态更新'],
      d: '最经典的三板斧：读 DOM → 改状态 → 写回 DOM，并把计数存到 localStorage，刷新页面不清零。',
      html: [
        '<div class="counter">',
        '  <button id="minus">−</button>',
        '  <strong id="num">0</strong>',
        '  <button id="plus">＋</button>',
        '</div>',
        '<p class="tip" id="tip">点按钮试试，再刷新页面看看</p>',
        '<button class="link" id="reset">清零</button>'
      ].join('\n'),
      css: [
        '.counter { display: flex; align-items: center; gap: 14px; justify-content: center; }',
        '.counter button {',
        '  width: 42px; height: 42px; font-size: 20px; border-radius: 10px;',
        '  border: 1px solid var(--accent); background: var(--accent-soft); color: var(--accent);',
        '}',
        '.counter button:active { transform: scale(.94); }',
        '#num { font-size: 30px; min-width: 60px; text-align: center; font-family: var(--mono); }',
        '.tip { text-align: center; color: var(--text-soft); font-size: 12.5px; }',
        'button.link { border: 0; background: none; color: var(--text-dim); text-decoration: underline; }'
      ].join('\n'),
      js: [
        "const KEY = 'demo.counter';",
        "const numEl = document.getElementById('num');",
        "const tipEl = document.getElementById('tip');",
        "",
        "// 从 localStorage 恢复，读不到就用 0",
        "let count = Number(localStorage.getItem(KEY) || 0);",
        "",
        "function render() {",
        "  numEl.textContent = count;",
        "  localStorage.setItem(KEY, count);",
        "  tipEl.textContent = count === 0 ? '还没点过' : `已点击 ${count} 次，刷新也不会丢`;",
        "  console.log('count =', count);",
        "}",
        "",
        "document.getElementById('plus').onclick  = () => { count++; render(); };",
        "document.getElementById('minus').onclick = () => { count--; render(); };",
        "document.getElementById('reset').onclick = () => { count = 0; render(); };",
        "",
        "// 顺手支持键盘：← 减、→ 加",
        "document.addEventListener('keydown', (e) => {",
        "  if (e.key === 'ArrowRight') { count++; render(); }",
        "  if (e.key === 'ArrowLeft')  { count--; render(); }",
        "});",
        "",
        "render();"
      ].join('\n')
    },
    {
      t: '待办清单（增删改 + 事件委托）', cat: 'DOM 入门', tags: ['createElement', '事件委托', 'classList'],
      d: '只在 ul 上挂一个监听器处理所有删除动作 —— 这就是事件委托，列表动态增删也不用重复绑定。',
      html: [
        '<form id="todoForm" autocomplete="off">',
        '  <input id="todoInput" placeholder="输入一件事，回车添加">',
        '  <button type="submit">添加</button>',
        '</form>',
        '<ul id="todoList">',
        '  <li>读一遍速查表</li>',
        '  <li class="done">喝口水</li>',
        '</ul>',
        '<p class="tip" id="stat"></p>'
      ].join('\n'),
      css: [
        'form { display: flex; gap: 8px; margin-bottom: 12px; }',
        'form input { flex: 1; }',
        'ul { list-style: none; padding: 0; margin: 0; }',
        'li {',
        '  display: flex; align-items: center; gap: 8px; padding: 7px 10px; margin-bottom: 6px;',
        '  border: 1px solid var(--border); border-radius: 8px; background: var(--bg-elev);',
        '}',
        'li span { flex: 1; }',
        'li.done span { text-decoration: line-through; color: var(--text-dim); }',
        'li button { border: 0; background: none; color: var(--danger); font-size: 12px; }',
        '.tip { font-size: 12px; color: var(--text-soft); }'
      ].join('\n'),
      js: [
        "const form = document.getElementById('todoForm');",
        "const input = document.getElementById('todoInput');",
        "const list = document.getElementById('todoList');",
        "const stat = document.getElementById('stat');",
        "",
        "function addItem(text, done) {",
        "  const li = document.createElement('li');",
        "  if (done) li.classList.add('done');",
        "  li.innerHTML = '<span></span><button type=\"button\">删除</button>';",
        "  li.querySelector('span').textContent = text;   // 用 textContent 防 XSS",
        "  list.prepend(li);",
        "  updateStat();",
        "}",
        "",
        "function updateStat() {",
        "  const total = list.children.length;",
        "  const done = list.querySelectorAll('.done').length;",
        "  stat.textContent = `共 ${total} 项，已完成 ${done} 项`;",
        "}",
        "",
        "form.addEventListener('submit', (e) => {",
        "  e.preventDefault();",
        "  const text = input.value.trim();",
        "  if (!text) return;",
        "  addItem(text);",
        "  input.value = '';",
        "  input.focus();",
        "});",
        "",
        "// 事件委托：一个监听器搞定「勾选」和「删除」两种操作",
        "list.addEventListener('click', (e) => {",
        "  if (e.target.tagName === 'BUTTON') {",
        "    e.target.closest('li').remove();",
        "    updateStat();",
        "    console.warn('删了一条');",
        "  } else {",
        "    const li = e.target.closest('li');",
        "    if (li) li.classList.toggle('done');",
        "    updateStat();",
        "  }",
        "});",
        "",
        "updateStat();"
      ].join('\n')
    },
    {
      t: 'Tabs 切换（classList + data-*）', cat: '交互组件', tags: ['dataset', 'classList', 'querySelectorAll'],
      d: '把「当前是第几个」存在 data-index 里，点击时统一清一遍 active 再给目标加上 —— 组件类写法通用套路。',
      html: [
        '<div class="tabs">',
        '  <button class="tab active" data-index="0">HTML</button>',
        '  <button class="tab" data-index="1">CSS</button>',
        '  <button class="tab" data-index="2">JavaScript</button>',
        '</div>',
        '<div class="panels">',
        '  <section class="panel active">超文本标记语言，负责结构。</section>',
        '  <section class="panel">层叠样式表，负责外观。</section>',
        '  <section class="panel">脚本语言，负责行为与交互。</section>',
        '</div>'
      ].join('\n'),
      css: [
        '.tabs { display: flex; gap: 6px; border-bottom: 1px solid var(--border); margin-bottom: 10px; }',
        '.tab {',
        '  border: 0; background: none; padding: 6px 12px; border-radius: 8px 8px 0 0;',
        '  color: var(--text-soft); border-bottom: 2px solid transparent;',
        '}',
        '.tab.active { color: var(--accent); border-bottom-color: var(--accent); background: var(--accent-soft); }',
        '.panel { display: none; padding: 10px 12px; border: 1px solid var(--border); border-radius: 8px; }',
        '.panel.active { display: block; }'
      ].join('\n'),
      js: [
        "const tabs = document.querySelectorAll('.tab');",
        "const panels = document.querySelectorAll('.panel');",
        "",
        "tabs.forEach((tab) => {",
        "  tab.addEventListener('click', () => {",
        "    const i = Number(tab.dataset.index);",
        "",
        "    tabs.forEach(t => t.classList.remove('active'));",
        "    panels.forEach(p => p.classList.remove('active'));",
        "",
        "    tab.classList.add('active');",
        "    panels[i].classList.add('active');",
        "    console.log('切到第', i, '页');",
        "  });",
        "});"
      ].join('\n')
    },
    {
      t: '表单实时校验', cat: '交互组件', tags: ['表单', '正则', 'setCustomValidity'],
      d: '每一步都给即时反馈：密码强度、确认一致、邮箱格式，最后统一判断是否放行提交。',
      html: [
        '<form id="signup" novalidate>',
        '  <label>邮箱 <input id="email" type="email" placeholder="you@example.com"></label>',
        '  <p class="msg" id="m1"></p>',
        '  <label>密码 <input id="pwd" type="password" placeholder="至少 8 位，含字母和数字"></label>',
        '  <p class="msg" id="m2"></p>',
        '  <label>确认密码 <input id="pwd2" type="password"></label>',
        '  <p class="msg" id="m3"></p>',
        '  <button type="submit">注册</button>',
        '</form>',
        '<p class="tip" id="result"></p>'
      ].join('\n'),
      css: [
        'form label { display: block; margin-bottom: 2px; font-size: 12.5px; color: var(--text-soft); }',
        'form input { width: 100%; margin-bottom: 2px; }',
        '.msg { margin: 0 0 8px; font-size: 11.5px; min-height: 16px; }',
        '.msg.ok { color: var(--ok); }',
        '.msg.bad { color: var(--danger); }',
        'input.invalid { border-color: var(--danger); }',
        'input.valid { border-color: var(--ok); }'
      ].join('\n'),
      js: [
        "const $ = (id) => document.getElementById(id);",
        "const rules = [",
        "  { el: $('email'), msg: $('m1'), test: v => /^\\S+@\\S+\\.\\S+$/.test(v), tip: '邮箱格式不对' },",
        "  { el: $('pwd'),  msg: $('m2'), test: v => /^(?=.*[A-Za-z])(?=.*\\d)\\S{8,}$/.test(v), tip: '至少 8 位，且含字母和数字' },",
        "  { el: $('pwd2'), msg: $('m3'), test: v => v && v === $('pwd').value, tip: '两次密码不一致' }",
        "];",
        "",
        "function checkOne(r) {",
        "  const ok = r.test(r.el.value.trim());",
        "  r.el.classList.toggle('valid', ok);",
        "  r.el.classList.toggle('invalid', !ok);",
        "  r.msg.textContent = r.el.value ? (ok ? '✓ 通过' : r.tip) : '';",
        "  r.msg.className = 'msg ' + (r.el.value ? (ok ? 'ok' : 'bad') : '');",
        "  return ok;",
        "}",
        "",
        "rules.forEach(r => r.el.addEventListener('input', () => checkOne(r)));",
        "",
        "$('signup').addEventListener('submit', (e) => {",
        "  e.preventDefault();",
        "  const allOk = rules.map(checkOne).every(Boolean);",
        "  const res = $('result');",
        "  res.textContent = allOk ? '✓ 校验通过，可以提交了' : '✗ 还有地方没填好';",
        "  res.style.color = allOk ? 'var(--ok)' : 'var(--danger)';",
        "  console.log(allOk ? 'submit!' : 'blocked');",
        "});"
      ].join('\n')
    },
    {
      t: '异步：模拟请求 + 加载态', cat: '异步编程', tags: ['async/await', 'Promise', '定时器'],
      d: '没有后端照样练异步：用 Promise 包一个定时器当作接口，完整跑一遍「加载中 → 成功 → 失败重试」。',
      html: [
        '<button id="load">加载用户数据</button>',
        '<button id="fail">加载（模拟失败）</button>',
        '<div id="box" class="box">点上面的按钮试试</div>'
      ].join('\n'),
      css: [
        '.box {',
        '  margin-top: 12px; padding: 14px; border: 1px dashed var(--border-st);',
        '  border-radius: 10px; background: var(--bg-soft); min-height: 74px;',
        '}',
        '.box.loading { color: var(--text-soft); }',
        '.box.err { border-color: var(--danger); color: var(--danger); }',
        '.box ul { margin: 0; padding-left: 18px; }'
      ].join('\n'),
      js: [
        "const box = document.getElementById('box');",
        "",
        "// 假接口：延时 800ms 返回数据，shouldFail 时抛错",
        "function fetchUsers(shouldFail) {",
        "  return new Promise((resolve, reject) => {",
        "    setTimeout(() => {",
        "      if (shouldFail) return reject(new Error('网络开小差了（HTTP 500）'));",
        "      resolve([{ name: '张三', age: 28 }, { name: '李四', age: 33 }, { name: '王五', age: 24 }]);",
        "    }, 800);",
        "  });",
        "}",
        "",
        "async function load(shouldFail) {",
        "  box.className = 'box loading';",
        "  box.textContent = '加载中…';",
        "  try {",
        "    const users = await fetchUsers(shouldFail);",
        "    box.className = 'box';",
        "    box.innerHTML = '<ul>' + users",
        "      .map(u => `<li>${u.name} — ${u.age} 岁</li>`).join('') + '</ul>';",
        "    console.log('拿到数据', users);",
        "  } catch (err) {",
        "    box.className = 'box err';",
        "    box.textContent = '加载失败：' + err.message;",
        "    console.error(err);",
        "  }",
        "}",
        "",
        "document.getElementById('load').onclick = () => load(false);",
        "document.getElementById('fail').onclick = () => load(true);"
      ].join('\n')
    },
    {
      t: '防抖 vs 节流', cat: '性能', tags: ['闭包', '定时器', '输入事件'],
      d: '同一个 input 事件，左边是防抖、右边是节流，观察触发次数的差别 —— 搜索框常用防抖，滚动用节流。',
      html: [
        '<p>在两个框里连续打字，看下面的计数变化</p>',
        '<input id="a" placeholder="防抖 debounce（停止输入 500ms 后才执行）">',
        '<p class="tip">防抖触发：<b id="cn1">0</b> 次</p>',
        '<input id="b" placeholder="节流 throttle（每 500ms 最多执行一次）">',
        '<p class="tip">节流触发：<b id="cn2">0</b> 次</p>'
      ].join('\n'),
      css: [
        'input { width: 100%; margin-bottom: 4px; }',
        '.tip { margin: 0 0 10px; font-size: 12px; color: var(--text-soft); }',
        'b { color: var(--accent); font-family: var(--mono); }'
      ].join('\n'),
      js: [
        "// 防抖：每次触发都重置计时器，最后一次才算数",
        "function debounce(fn, ms) {",
        "  let timer;",
        "  return function (...args) {",
        "    clearTimeout(timer);",
        "    timer = setTimeout(() => fn.apply(this, args), ms);",
        "  };",
        "}",
        "",
        "// 节流：单位时间内只放行第一次",
        "function throttle(fn, ms) {",
        "  let last = 0;",
        "  return function (...args) {",
        "    const now = Date.now();",
        "    if (now - last >= ms) { last = now; fn.apply(this, args); }",
        "  };",
        "}",
        "",
        "let n1 = 0, n2 = 0;",
        "const c1 = document.getElementById('cn1');",
        "const c2 = document.getElementById('cn2');",
        "",
        "document.getElementById('a').addEventListener('input', debounce((e) => {",
        "  c1.textContent = ++n1;",
        "  console.log('防抖执行，输入内容：', e.target.value);",
        "}, 500));",
        "",
        "document.getElementById('b').addEventListener('input', throttle((e) => {",
        "  c2.textContent = ++n2;",
        "  console.log('节流执行，输入内容：', e.target.value);",
        "}, 500));"
      ].join('\n')
    },
    {
      t: 'Canvas 逐帧动画', cat: '动画', tags: ['canvas', 'requestAnimationFrame'],
      d: 'requestAnimationFrame 提供时间戳作为参数，用它算位移就是标准的逐帧动画循环。',
      html: [
        '<canvas id="cv" width="320" height="180"></canvas>',
        '<p class="tip">FPS：<b id="fps">0</b></p>'
      ].join('\n'),
      css: [
        'canvas {',
        '  border: 1px solid var(--border-st); border-radius: 10px;',
        '  background: var(--bg-elev); display: block;',
        '}',
        '.tip { font-size: 12px; color: var(--text-soft); }'
      ].join('\n'),
      js: [
        "const cv = document.getElementById('cv');",
        "const ctx = cv.getContext('2d');",
        "const fpsEl = document.getElementById('fps');",
        "let balls = Array.from({ length: 6 }, (_, i) => ({",
        "  x: 30 + i * 45, y: 90, r: 10 + i * 2,",
        "  vy: 1 + i * 0.4, color: `hsl(${i * 55} 72% 55%)`",
        "}));",
        "let lastT = 0;",
        "",
        "function frame(t) {",
        "  if (lastT) {",
        "    const dt = t - lastT;",
        "    fpsEl.textContent = Math.round(1000 / dt);",
        "  }",
        "  lastT = t;",
        "",
        "  ctx.clearRect(0, 0, cv.width, cv.height);",
        "",
        "  balls.forEach((b) => {",
        "    // 上下弹跳：碰到边界就反向",
        "    b.y += b.vy;",
        "    if (b.y + b.r > cv.height || b.y - b.r < 0) b.vy *= -1;",
        "    ctx.beginPath();",
        "    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);",
        "    ctx.fillStyle = b.color;",
        "    ctx.fill();",
        "  });",
        "",
        "  requestAnimationFrame(frame);",
        "}",
        "requestAnimationFrame(frame);",
        "",
        "console.log('动画已启动，共', balls.length, '个小球');"
      ].join('\n')
    },
    {
      t: '深浅色跟随时间（matchMedia）', cat: '交互组件', tags: ['classList', 'matchMedia', 'localStorage'],
      d: '读取系统偏好 + 手动切换 + 记忆选择，这是站点主题功能的迷你版，演示所述主题逻辑正是这么实现的。',
      html: [
        '<p>当前模式：<b id="mode">—</b></p>',
        '<button id="toggle">切换模式</button>',
        '<p class="tip">改一下系统的深色/浅色设置，页面会跟着变</p>'
      ].join('\n'),
      css: [
        'body { transition: background .3s, color .3s; }',
        'b { color: var(--accent); }',
        '.tip { font-size: 12px; color: var(--text-soft); }'
      ].join('\n'),
      js: [
        "const KEY = 'demo.theme';",
        "const mq = window.matchMedia('(prefers-color-scheme: dark)');",
        "const modeEl = document.getElementById('mode');",
        "let manual = localStorage.getItem(KEY);   // null = 跟随系统",
        "",
        "function apply(mode) {",
        "  document.documentElement.dataset.mode = mode;",
        "  modeEl.textContent = mode === 'dark' ? '🌙 深色' : '☀️ 浅色';",
        "}",
        "",
        "function current() {",
        "  return manual || (mq.matches ? 'dark' : 'light');",
        "}",
        "",
        "apply(current());",
        "",
        "// 系统偏好变化时，若没手动指定就跟着切",
        "mq.addEventListener('change', (e) => {",
        "  if (!manual) apply(e.matches ? 'dark' : 'light');",
        "});",
        "",
        "document.getElementById('toggle').onclick = () => {",
        "  manual = current() === 'dark' ? 'light' : 'dark';",
        "  localStorage.setItem(KEY, manual);",
        "  apply(manual);",
        "  console.log('手动切换到', manual);",
        "};"
      ].join('\n')
    }
  ];

  window.JS_EXAMPLE_CATS = (function () {
    var seen = {}, out = [];
    window.JS_EXAMPLES.forEach(function (e) {
      if (!seen[e.cat]) { seen[e.cat] = 1; out.push(e.cat); }
    });
    return out;
  })();

})();
