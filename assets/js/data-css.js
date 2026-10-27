/* ==========================================================
   CSS 速查数据：选择器 / 布局 / 常用属性
   ========================================================== */
(function () {

  /* ---------- 选择器 ---------- */
  window.CSS_SELECTORS = [
    {
      g: '基础选择器', items: [
        { s: '*', d: '通配选择器，匹配所有元素', e: '* { margin: 0; }' },
        { s: 'element', d: '标签选择器，匹配指定标签', e: 'p { line-height: 1.8; }' },
        { s: '.class', d: '类选择器，匹配含指定 class 的元素', e: '.btn { color: #fff; }' },
        { s: '#id', d: 'ID 选择器，匹配唯一 id（同页应唯一）', e: '#header { height: 60px; }' },
        { s: 'a, b', d: '并集选择器，同时匹配多个选择器', e: 'h1, h2, h3 { font-weight: 700; }' }
      ]
    },
    {
      g: '组合选择器', items: [
        { s: 'a b', d: '后代选择器，匹配 a 内所有层级的 b', e: 'article p { margin: 0; }' },
        { s: 'a > b', d: '子元素选择器，仅匹配 a 的直接子级 b', e: 'ul > li { list-style: none; }' },
        { s: 'a + b', d: '相邻兄弟选择器，匹配紧接 a 之后的 b', e: 'h2 + p { margin-top: 0; }' },
        { s: 'a ~ b', d: '通用兄弟选择器，匹配 a 之后同级的所有 b', e: 'h2 ~ p { color: #555; }' }
      ]
    },
    {
      g: '属性选择器', items: [
        { s: '[attr]', d: '含有该属性', e: '[disabled] { opacity: .5; }' },
        { s: '[attr="v"]', d: '属性值恰好等于 v', e: '[type="submit"] { background: blue; }' },
        { s: '[attr^="v"]', d: '属性值以 v 开头', e: 'a[href^="https"] { color: green; }' },
        { s: '[attr$="v"]', d: '属性值以 v 结尾', e: 'a[href$=".pdf"]::after { content: " PDF"; }' },
        { s: '[attr*="v"]', d: '属性值包含 v', e: 'img[src*="logo"] { width: 80px; }' },
        { s: '[attr~="v"]', d: '属性值中以空格分隔的词之一为 v', e: '[class~="active"] { font-weight: 700; }' }
      ]
    },
    {
      g: '伪类', items: [
        { s: ':hover', d: '鼠标悬停时', e: 'a:hover { text-decoration: underline; }' },
        { s: ':active', d: '元素被激活（按下）时', e: 'button:active { transform: scale(.97); }' },
        { s: ':focus / :focus-visible', d: '获得焦点时，focus-visible 仅在键盘聚焦时生效', e: 'input:focus-visible { outline: 2px solid blue; }' },
        { s: ':first-child / :last-child', d: '作为父元素的第一个 / 最后一个子元素', e: 'li:first-child { border-top: 0; }' },
        { s: ':nth-child(n)', d: '第 n 个子元素，支持 2n、odd、even、公式 an+b', e: 'tr:nth-child(even) { background: #f5f6fa; }' },
        { s: ':nth-of-type(n)', d: '同类型标签中的第 n 个', e: 'p:nth-of-type(2) { color: red; }' },
        { s: ':not(sel)', d: '不匹配 sel 的元素', e: 'input:not([type="submit"]) { border: 1px solid #ccc; }' },
        { s: ':checked', d: '被选中的单选 / 复选框', e: 'input:checked + label { font-weight: 700; }' },
        { s: ':disabled / :enabled', d: '禁用 / 可用的表单控件', e: 'button:disabled { cursor: not-allowed; }' },
        { s: ':empty', d: '没有任何子节点（含文本）的元素', e: 'div:empty { display: none; }' },
        { s: ':root', d: '文档根元素（html），常用于定义全局变量', e: ':root { --brand: #3b5bdb; }' },
        { s: ':is() / :where()', d: '选择器列表匹配；:where() 特异性恒为 0', e: ':is(h1, h2, h3) { margin-top: 0; }' }
      ]
    },
    {
      g: '伪元素', items: [
        { s: '::before / ::after', d: '在元素内容前 / 后插入生成内容，需配合 content', e: '.tip::before { content: "💡"; margin-right: 4px; }' },
        { s: '::first-line', d: '块级元素的第一行', e: 'p::first-line { font-weight: 700; }' },
        { s: '::first-letter', d: '块级元素的第一个字母，可做首字下沉', e: 'p::first-letter { font-size: 2em; float: left; }' },
        { s: '::selection', d: '用户选中文本时的样式', e: '::selection { background: #ffe9a8; }' },
        { s: '::placeholder', d: '输入框占位文本', e: 'input::placeholder { color: #aaa; }' },
        { s: '::marker', d: '列表项标记或 summary 箭头', e: 'li::marker { color: #3b5bdb; }' },
        { s: '::backdrop', d: '全屏元素 / dialog 的遮罩层', e: 'dialog::backdrop { background: rgba(0,0,0,.5); }' }
      ]
    }
  ];

  /* ---------- 布局速查 ---------- */
  window.CSS_LAYOUTS = [
    {
      k: 'boxmodel', t: '盒模型 Box Model',
      d: '每个元素都被渲染为一个矩形盒子，由内到外依次为：content（内容）→ padding（内边距）→ border（边框）→ margin（外边距）。box-sizing 决定 width 计算方式：content-box（默认，宽高只含内容）、border-box（宽高含 padding 与 border，推荐全局设置）。',
      tips: [
        '全局推荐：* { box-sizing: border-box; }',
        '相邻块级元素的上下 margin 会发生折叠，取较大值而非相加',
        'margin 可为负值，padding 与 border 不可为负',
        '行内元素的上下 margin 不生效，垂直方向由 line-height 决定'
      ]
    },
    {
      k: 'flex', t: 'Flexbox 弹性布局',
      d: '一维布局模型，适合在单行或单列中分配空间与对齐。父容器设 display: flex 后，子元素成为 flex item。主轴由 flex-direction 决定，交叉轴垂直于主轴。',
      tips: [
        'justify-content 控制主轴对齐，align-items 控制交叉轴对齐',
        'flex: 1 是 flex-grow:1; flex-shrink:1; flex-basis:0% 的简写',
        'gap 同时设置行间距与列间距，无需再用 margin 负技巧',
        '默认 flex-shrink:1，空间不足时子项会被压缩，需固定尺寸要设 flex-shrink:0'
      ]
    },
    {
      k: 'grid', t: 'Grid 网格布局',
      d: '二维布局模型，同时控制行与列，适合整体页面骨架与卡片网格。grid-template-columns 定义列轨道，fr 单位表示剩余空间份数。',
      tips: [
        'repeat(auto-fill, minmax(200px, 1fr)) 是响应式卡片网格的经典写法',
        'grid-column: 1 / 3 表示从第 1 条线跨到第 3 条线（占 2 列）',
        'gap 只影响轨道间距，不影响容器边缘',
        'align-content 控制整个网格在容器中的位置，align-items 控制单元格内容'
      ]
    },
    {
      k: 'position', t: '定位 Position',
      d: 'position 决定元素的定位方式；配合 top / right / bottom / left 偏移。除 static 外，可用 z-index 控制层叠顺序（需创建层叠上下文）。',
      tips: [
        'relative：相对自身原位置偏移，仍占据原空间',
        'absolute：相对最近的已定位祖先定位，脱离文档流',
        'fixed：相对视口定位，常用于吸顶导航',
        'sticky：在阈值内相对滚动定位，需指定 top 等阈值且父级不能 overflow: hidden'
      ]
    }
  ];

  window.CSS_MEDIA = [
    { s: '@media (max-width: 768px) { }', d: '视口宽度小于等于 768px 时生效（移动优先常配 min-width）' },
    { s: '@media (min-width: 1024px) { }', d: '视口宽度大于等于 1024px 时生效' },
    { s: '@media (orientation: landscape) { }', d: '横屏时生效' },
    { s: '@media (prefers-color-scheme: dark) { }', d: '系统处于深色模式时生效' },
    { s: '@media (prefers-reduced-motion: reduce) { }', d: '用户要求减少动效时，应关闭动画' },
    { s: '@media print { }', d: '打印时生效' },
    { s: '@media (hover: hover) { }', d: '设备支持悬停时生效，用于区分触屏' },
    { s: '@container (min-width: 400px) { }', d: '容器查询：基于父容器宽度而非视口（需先设 container-type）' }
  ];

  window.CSS_UNITS = [
    { u: 'px', d: '绝对像素，最常用的固定单位' },
    { u: '%', d: '相对父元素的百分比' },
    { u: 'em', d: '相对当前元素 font-size，嵌套会累积' },
    { u: 'rem', d: '相对根元素（html）font-size，推荐用于全局尺寸' },
    { u: 'vw / vh', d: '相对视口宽度 / 高度的 1%' },
    { u: 'vmin / vmax', d: '视口较小 / 较大边的 1%' },
    { u: 'fr', d: 'Grid 专用，剩余空间的份数' },
    { u: 'ch', d: '字符 0 的宽度，常用于限制每行字数' },
    { u: 'calc()', d: '混合计算，如 calc(100% - 40px)' },
    { u: 'min() / max() / clamp()', d: '取值区间，clamp(最小, 理想, 最大) 常用于流式字号' }
  ];

  /* ---------- 常用属性 ---------- */
  function P(n, d, c, v, def, demo, css) {
    return { n: n, d: d, c: c, v: v, def: def, demo: demo, css: css || '' };
  }
  var IMG = 'data:image/svg+xml;charset=utf-8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22120%22 height=%2280%22%3E%3Crect width=%22120%22 height=%2280%22 fill=%22%233b5bdb%22/%3E%3Ccircle cx=%2260%22 cy=%2240%22 r=%2226%22 fill=%22%23f6d365%22/%3E%3C/svg%3E';
  var box = '<div class="a">盒子 A</div><div class="b">盒子 B</div>';

  window.CSS_PROPS = [
    /* 盒模型 */
    P('display', '设置元素的显示类型（内/外部显示模型）', '盒模型',
      'block | inline | inline-block | flex | grid | none | contents | table',
      'inline',
      '<span>行内</span><span>行内</span>\n<div class="d-block">块级（独占一行）</div>\n<div class="d-ib">inline-block 1</div><div class="d-ib">inline-block 2</div>',
      '.d-block { display: block; background: #eef1fe; padding: 6px; }\n.d-ib { display: inline-block; background: #e6f5ef; padding: 6px; margin-right: 6px; }'),
    P('box-sizing', '指定 width/height 的计算方式', '盒模型', 'content-box | border-box', 'content-box',
      '<div class="box a">content-box：宽 160 + padding 40 + border = 更宽</div>\n<div class="box b">border-box：总宽固定 200</div>',
      '.box { width: 200px; padding: 20px; border: 4px solid #3b5bdb; margin-bottom: 10px; background: #f7f8fc; }\n.box.a { box-sizing: content-box; }\n.box.b { box-sizing: border-box; background: #eef1fe; }'),
    P('width / height', '设置内容盒的宽高，受 box-sizing 影响', '盒模型', '长度 | 百分比 | auto | fit-content | min-content', 'auto',
      '<div class="w">width: 60%</div>\n<div class="w2">width: fit-content</div>\n<div class="h">height: 80px</div>',
      '.w { width: 60%; background: #eef1fe; padding: 6px; margin-bottom: 6px; }\n.w2 { width: fit-content; background: #e6f5ef; padding: 6px; margin-bottom: 6px; }\n.h { height: 80px; background: #fdf3e2; display: grid; place-items: center; }'),
    P('margin', '元素外部的间距，可为负值', '盒模型', '长度 | 百分比 | auto | 1~4 个值', '0',
      '<div class="m">margin: 20px</div>\n<div class="m2">margin: 0 auto（水平居中）</div>',
      '.m { margin: 20px; background: #eef1fe; padding: 6px; }\n.m2 { margin: 0 auto; width: 200px; background: #e6f5ef; padding: 6px; text-align: center; }'),
    P('padding', '元素内容与边框之间的内边距', '盒模型', '长度 | 百分比 | 1~4 个值', '0',
      '<div class="p">padding: 8px 24px</div>\n<div class="p2">padding: 30px 10px</div>',
      '.p { padding: 8px 24px; background: #eef1fe; margin-bottom: 8px; }\n.p2 { padding: 30px 10px; background: #fdf3e2; }'),
    P('overflow', '内容超出盒子时的处理方式', '盒模型', 'visible | hidden | scroll | auto | clip', 'visible',
      '<div class="o">overflow: auto —— 这是一段很长的文字，用来演示内容超出容器时的滚动条行为，继续写一些内容以确保溢出。</div>\n<div class="o2">overflow: hidden —— 超出部分被裁剪，同样写一些足够长的文字内容来观察裁剪效果。</div>',
      '.o, .o2 { width: 100%; height: 60px; background: #f7f8fc; margin-bottom: 8px; }\n.o { overflow: auto; }\n.o2 { overflow: hidden; }'),
    P('min-width / max-width', '限制元素的宽度区间，响应式布局常用', '盒模型', '长度 | 百分比 | none', 'none',
      '<div class="lim">宽度会被限制在 180px 到 320px 之间</div>',
      '.lim { min-width: 180px; max-width: 320px; background: #eef1fe; padding: 8px; }'),

    /* 边框与阴影 */
    P('border', '边框简写：宽度 样式 颜色', '边框', '<width> <style> <color>', 'medium none currentcolor',
      '<div class="bd">solid 实线</div>\n<div class="bd2">dashed 虚线</div>\n<div class="bd3">dotted 点线</div>',
      '.bd, .bd2, .bd3 { padding: 8px; margin-bottom: 6px; border-radius: 6px; }\n.bd { border: 2px solid #3b5bdb; }\n.bd2 { border: 2px dashed #0f7b52; }\n.bd3 { border: 2px dotted #a86404; }'),
    P('border-radius', '圆角半径，50% 可得到圆形 / 椭圆', '边框', '长度 | 百分比 | 1~4 个值 / 斜杠分隔', '0',
      '<div class="r1">圆角 12px</div>\n<div class="r2">圆角 50%</div>\n<div class="r3">单侧圆角</div>',
      '.r1, .r2, .r3 { background: #eef1fe; padding: 14px; margin-bottom: 8px; width: 120px; text-align: center; }\n.r1 { border-radius: 12px; }\n.r2 { border-radius: 50%; }\n.r3 { border-radius: 0 24px 24px 0; }'),
    P('box-shadow', '盒子阴影，可叠加多层，inset 为内阴影', '边框', 'offsetX offsetY blur spread color inset', 'none',
      '<div class="s1">柔和阴影</div>\n<div class="s2">inset 内阴影</div>',
      '.s1, .s2 { width: 160px; padding: 14px; text-align: center; border-radius: 10px; margin-bottom: 14px; }\n.s1 { box-shadow: 0 6px 16px rgba(20,28,50,.18); }\n.s2 { box-shadow: inset 0 2px 8px rgba(20,28,50,.25); background: #f7f8fc; }'),

    /* 颜色与背景 */
    P('color', '文本前景色', '颜色', '颜色关键字 | HEX | RGB | HSL | 变量', '画布默认（通常黑）',
      '<p class="c1">深蓝文字</p>\n<p class="c2">HSL 颜色</p>\n<p class="c3">带透明度 rgba</p>',
      '.c1 { color: #3b5bdb; }\n.c2 { color: hsl(150 60% 32%); }\n.c3 { color: rgba(192,42,42,.75); }'),
    P('background', '背景简写，可包含颜色、图片、位置、尺寸等', '颜色', 'color image position/size repeat attachment', 'transparent',
      '<div class="bg1">渐变背景</div>\n<div class="bg2">重复线性渐变</div>',
      '.bg1, .bg2 { padding: 20px; color: #fff; border-radius: 10px; margin-bottom: 10px; text-align: center; }\n.bg1 { background: linear-gradient(135deg, #3b5bdb, #5c7cfa); }\n.bg2 { background: repeating-linear-gradient(45deg, #0f7b52, #0f7b52 10px, #16a06c 10px, #16a06c 20px); }'),
    P('background-size', '背景图尺寸', '颜色', 'auto | cover | contain | 长度', 'auto',
      '<div class="bs1">cover：填满并裁剪</div>\n<div class="bs2">contain：完整显示</div>',
      '.bs1, .bs2 { height: 90px; border-radius: 10px; margin-bottom: 10px; color: #fff; display: grid; place-items: center;\n  background-image: linear-gradient(135deg, #8250df, #3b5bdb); background-repeat: no-repeat; }\n.bs1 { background-size: cover; }\n.bs2 { background-size: contain; background-color: #eef1fe; }'),
    P('opacity', '整体透明度，会影响整个元素及其子元素', '颜色', '0 ~ 1', '1',
      '<div class="op1">opacity: 1</div>\n<div class="op2">opacity: .5</div>\n<div class="op3">opacity: .15</div>',
      '.op1, .op2, .op3 { background: #3b5bdb; color: #fff; padding: 8px; margin-bottom: 6px; border-radius: 6px; }\n.op2 { opacity: .5; }\n.op3 { opacity: .15; }'),

    /* 字体与文本 */
    P('font-family', '字体系列，按顺序回退', '字体', '字体名列表，最后应给通用族', '浏览器默认',
      '<p class="f1">系统无衬线字体</p>\n<p class="f2">等宽字体 monospace</p>\n<p class="f3">衬线字体 serif</p>',
      '.f1 { font-family: system-ui, -apple-system, "PingFang SC", sans-serif; }\n.f2 { font-family: "Cascadia Code", Consolas, monospace; }\n.f3 { font-family: Georgia, "Songti SC", serif; }'),
    P('font-size', '字号大小', '字体', '长度 | 百分比 | 关键字', '16px',
      '<p class="fs1">12px</p>\n<p class="fs2">18px</p>\n<p class="fs3">clamp 流式字号</p>',
      '.fs1 { font-size: 12px; }\n.fs2 { font-size: 18px; }\n.fs3 { font-size: clamp(14px, 3vw, 26px); }'),
    P('font-weight', '字重（粗细）', '字体', 'normal | bold | 100~900', 'normal(400)',
      '<p class="fw1">300 细体</p>\n<p class="fw2">400 常规</p>\n<p class="fw3">700 粗体</p>',
      '.fw1 { font-weight: 300; }\n.fw2 { font-weight: 400; }\n.fw3 { font-weight: 700; }'),
    P('line-height', '行高，无单位数值表示字号的倍数', '字体', '数字 | 长度 | 百分比 | normal', 'normal',
      '<p class="lh1">line-height: 1.2 —— 这是一段用于演示行高差异的多行文本，换行后可以更直观地看到疏密变化。</p>\n<p class="lh2">line-height: 2 —— 这是一段用于演示行高差异的多行文本，换行后可以更直观地看到疏密变化。</p>',
      '.lh1 { line-height: 1.2; }\n.lh2 { line-height: 2; }'),
    P('text-align', '行内内容的水平对齐', '字体', 'left | center | right | justify | start | end', 'start',
      '<p class="ta1">左对齐</p>\n<p class="ta2">居中对齐</p>\n<p class="ta3">右对齐</p>',
      '.ta1 { text-align: left; }\n.ta2 { text-align: center; }\n.ta3 { text-align: right; }'),
    P('text-decoration', '文本装饰线（下划线、删除线等）', '字体', 'none | underline | line-through | overline + 样式颜色', 'none',
      '<p class="td1">下划线</p>\n<p class="td2">删除线</p>\n<p class="td3">波浪线</p>',
      '.td1 { text-decoration: underline; text-underline-offset: 3px; }\n.td2 { text-decoration: line-through; }\n.td3 { text-decoration: underline wavy #c02a2a; }'),
    P('letter-spacing', '字符间距', '字体', '长度 | normal', 'normal',
      '<p class="ls1">默认字间距</p>\n<p class="ls2">宽松字间距</p>',
      '.ls1 { letter-spacing: normal; }\n.ls2 { letter-spacing: 4px; }'),
    P('white-space', '空白符与换行的处理方式', '字体', 'normal | nowrap | pre | pre-wrap | pre-line', 'normal',
      '<p class="ws1">nowrap：这是一段很长的文字，它不会自动换行，会在一行内一直延伸下去直到超出容器。</p>\n<p class="ws2">pre-wrap：保留空格    与\n换行，同时也会自动折行。</p>',
      '.ws1 { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }\n.ws2 { white-space: pre-wrap; background: #f7f8fc; padding: 8px; border-radius: 6px; }'),

    /* Flex */
    P('display: flex', '将容器设为弹性布局，子元素沿主轴排列', 'Flex', 'flex | inline-flex', '—',
      '<div class="fx">\n  <div>1</div><div>2</div><div>3</div>\n</div>',
      '.fx { display: flex; gap: 8px; padding: 8px; background: #f7f8fc; border-radius: 8px; }\n.fx > div { background: #eef1fe; border: 1.5px solid #3b5bdb; border-radius: 8px; padding: 10px 18px; color: #3b5bdb; }'),
    P('flex-direction', '主轴方向', 'Flex', 'row | row-reverse | column | column-reverse', 'row',
      '<div class="fxd">\n  <div>1</div><div>2</div><div>3</div>\n</div>',
      '.fxd { display: flex; flex-direction: column; gap: 8px; padding: 8px; background: #f7f8fc; border-radius: 8px; }\n.fxd > div { background: #eef1fe; border: 1.5px solid #3b5bdb; border-radius: 8px; padding: 8px 14px; color: #3b5bdb; }'),
    P('justify-content', '主轴上的对齐与空间分配', 'Flex', 'flex-start | flex-end | center | space-between | space-around | space-evenly', 'flex-start',
      '<div class="jc">\n  <div>A</div><div>B</div><div>C</div>\n</div>',
      '.jc { display: flex; justify-content: space-between; gap: 8px; padding: 8px; background: #f7f8fc; border-radius: 8px; }\n.jc > div { background: #eef1fe; border: 1.5px solid #3b5bdb; border-radius: 8px; padding: 8px 18px; color: #3b5bdb; }'),
    P('align-items', '交叉轴上的对齐方式', 'Flex', 'stretch | flex-start | flex-end | center | baseline', 'stretch',
      '<div class="ai">\n  <div style="height:40px">矮</div>\n  <div style="height:80px">高</div>\n  <div style="height:60px">中</div>\n</div>',
      '.ai { display: flex; align-items: center; gap: 8px; padding: 8px; background: #f7f8fc; border-radius: 8px; min-height: 110px; }\n.ai > div { background: #eef1fe; border: 1.5px solid #3b5bdb; border-radius: 8px; padding: 6px 16px; color: #3b5bdb; }'),
    P('flex-wrap', '主轴空间不足时是否换行', 'Flex', 'nowrap | wrap | wrap-reverse', 'nowrap',
      '<div class="fw">\n  <div>1</div><div>2</div><div>3</div><div>4</div><div>5</div><div>6</div>\n</div>',
      '.fw { display: flex; flex-wrap: wrap; gap: 8px; padding: 8px; background: #f7f8fc; border-radius: 8px; }\n.fw > div { width: 70px; background: #eef1fe; border: 1.5px solid #3b5bdb; border-radius: 8px; padding: 8px; text-align: center; color: #3b5bdb; }'),
    P('gap', '弹性项 / 网格轨道之间的间距', 'Flex', '长度 | 百分比；两个值表示 行 列', 'normal(0)',
      '<div class="gp">\n  <div>A</div><div>B</div><div>C</div>\n</div>',
      '.gp { display: flex; gap: 24px; padding: 8px; background: #f7f8fc; border-radius: 8px; }\n.gp > div { background: #eef1fe; border: 1.5px solid #3b5bdb; border-radius: 8px; padding: 8px 16px; color: #3b5bdb; }'),
    P('flex', '子项的伸缩简写：grow shrink basis', 'Flex', '<grow> <shrink> <basis>', '0 1 auto',
      '<div class="fl">\n  <div class="i1">固定 80px</div>\n  <div class="i2">flex: 1 占满剩余</div>\n</div>',
      '.fl { display: flex; gap: 8px; padding: 8px; background: #f7f8fc; border-radius: 8px; }\n.fl > div { background: #eef1fe; border: 1.5px solid #3b5bdb; border-radius: 8px; padding: 8px; color: #3b5bdb; }\n.i1 { flex: 0 0 80px; }\n.i2 { flex: 1; }'),
    P('order', '子项的视觉排列顺序，可为负数', 'Flex', '整数', '0',
      '<div class="od">\n  <div style="order:3">A(order:3)</div>\n  <div style="order:1">B(order:1)</div>\n  <div style="order:2">C(order:2)</div>\n</div>',
      '.od { display: flex; gap: 8px; padding: 8px; background: #f7f8fc; border-radius: 8px; }\n.od > div { background: #eef1fe; border: 1.5px solid #3b5bdb; border-radius: 8px; padding: 8px 14px; color: #3b5bdb; }'),

    /* Grid */
    P('display: grid', '将容器设为网格布局', 'Grid', 'grid | inline-grid', '—',
      '<div class="gd">\n  <div>1</div><div>2</div><div>3</div><div>4</div>\n</div>',
      '.gd { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; padding: 8px; background: #f7f8fc; border-radius: 8px; }\n.gd > div { background: #f2ecfd; border: 1.5px solid #7048e8; border-radius: 8px; padding: 14px; text-align: center; color: #7048e8; }'),
    P('grid-template-columns', '定义列轨道', 'Grid', '轨道列表，可用 repeat()、fr、minmax()', 'none',
      '<div class="gtc">\n  <div>侧栏</div><div>主内容</div><div>右栏</div>\n</div>',
      '.gtc { display: grid; grid-template-columns: 90px 1fr 90px; gap: 8px; padding: 8px; background: #f7f8fc; border-radius: 8px; }\n.gtc > div { background: #f2ecfd; border: 1.5px solid #7048e8; border-radius: 8px; padding: 14px; text-align: center; color: #7048e8; }'),
    P('grid-template-areas', '用命名区域描述布局，直观易维护', 'Grid', '字符串行，每行对应一行轨道', 'none',
      '<div class="gta">\n  <div class="h">header</div>\n  <div class="s">aside</div>\n  <div class="m">main</div>\n  <div class="f">footer</div>\n</div>',
      '.gta { display: grid; grid-template-columns: 100px 1fr; grid-template-areas: "hd hd" "sb mn" "ft ft"; gap: 8px; padding: 8px; background: #f7f8fc; border-radius: 8px; }\n.gta > div { background: #f2ecfd; border: 1.5px solid #7048e8; border-radius: 8px; padding: 12px; text-align: center; color: #7048e8; }\n.h { grid-area: hd; }\n.s { grid-area: sb; }\n.m { grid-area: mn; }\n.f { grid-area: ft; }'),
    P('grid-column / grid-row', '子项占据的网格线范围', 'Grid', '起始线 / 结束线 或 span n', 'auto',
      '<div class="gc">\n  <div class="wide">跨两列</div>\n  <div>A</div><div>B</div>\n</div>',
      '.gc { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; padding: 8px; background: #f7f8fc; border-radius: 8px; }\n.gc > div { background: #f2ecfd; border: 1.5px solid #7048e8; border-radius: 8px; padding: 12px; text-align: center; color: #7048e8; }\n.wide { grid-column: 1 / 3; }'),
    P('auto-fill / auto-fit', '响应式列数，配合 minmax 使用', 'Grid', 'repeat(auto-fill|auto-fit, minmax(最小, 1fr))', '—',
      '<div class="af">\n  <div>卡片</div><div>卡片</div><div>卡片</div><div>卡片</div>\n</div>',
      '.af { display: grid; grid-template-columns: repeat(auto-fill, minmax(110px, 1fr)); gap: 8px; padding: 8px; background: #f7f8fc; border-radius: 8px; }\n.af > div { background: #f2ecfd; border: 1.5px solid #7048e8; border-radius: 8px; padding: 14px; text-align: center; color: #7048e8; }'),

    /* 定位 */
    P('position', '元素的定位方式', '定位', 'static | relative | absolute | fixed | sticky', 'static',
      '<div class="rel">\n  relative 容器\n  <div class="abs">absolute 相对容器定位</div>\n</div>',
      '.rel { position: relative; height: 120px; background: #f7f8fc; border-radius: 8px; padding: 10px; }\n.abs { position: absolute; right: 10px; bottom: 10px; background: #3b5bdb; color: #fff; padding: 6px 10px; border-radius: 6px; }'),
    P('z-index', '层叠顺序，数值越大越靠上，仅对已定位元素生效', '定位', '整数 | auto', 'auto',
      '<div class="zw">\n  <div class="z1">z-index: 1</div>\n  <div class="z2">z-index: 2</div>\n</div>',
      '.zw { position: relative; height: 110px; }\n.z1, .z2 { position: absolute; padding: 14px 18px; border-radius: 8px; color: #fff; }\n.z1 { z-index: 1; background: #a86404; left: 0; top: 0; }\n.z2 { z-index: 2; background: #3b5bdb; left: 40px; top: 34px; }'),
    P('float', '使元素浮动到容器左侧或右侧', '定位', 'left | right | none | inline-start | inline-end', 'none',
      '<div class="fl-c">\n  <div class="fl-box">浮动块</div>\n  文字会环绕在浮动元素周围，这是 float 最初的用途。继续写一些文字以便观察环绕效果。\n</div>',
      '.fl-c { background: #f7f8fc; border-radius: 8px; padding: 10px; }\n.fl-box { float: left; width: 90px; height: 70px; background: #3b5bdb; color: #fff; border-radius: 8px; margin: 0 10px 6px 0; display: grid; place-items: center; }'),
    P('top / right / bottom / left', '已定位元素的偏移量', '定位', '长度 | 百分比 | auto', 'auto',
      '<div class="po">\n  <div class="stk">sticky：滚动时吸附</div>\n</div>',
      '.po { position: relative; height: 150px; overflow: auto; background: #f7f8fc; border-radius: 8px; }\n.stk { position: sticky; top: 0; background: #3b5bdb; color: #fff; padding: 8px 12px; border-radius: 6px; }'),

    /* 动画与变换 */
    P('transition', '属性变化的过渡效果', '动画', 'property duration timing-function delay', 'all 0s ease 0s',
      '<div class="tr">悬停我</div>',
      '.tr { width: 140px; padding: 16px; text-align: center; background: #eef1fe; border-radius: 10px; transition: all .35s ease; cursor: pointer; }\n.tr:hover { background: #3b5bdb; color: #fff; transform: translateY(-4px); }'),
    P('transform', '二维/三维变换：位移、缩放、旋转、倾斜', '动画', 'translate() scale() rotate() skew() 等组合', 'none',
      '<div class="tf1">rotate</div>\n<div class="tf2">scale</div>\n<div class="tf3">translate</div>',
      '.tf1, .tf2, .tf3 { width: 110px; padding: 12px; text-align: center; background: #eef1fe; border-radius: 8px; margin-bottom: 10px; }\n.tf1 { transform: rotate(-6deg); }\n.tf2 { transform: scale(1.15); }\n.tf3 { transform: translateX(30px); }'),
    P('animation', '关键帧动画简写', '动画', 'name duration timing-function delay iteration-count direction fill-mode play-state', 'none',
      '<div class="an"></div>',
      '@keyframes move {\n  0%   { transform: translateX(0);   background: #3b5bdb; }\n  50%  { transform: translateX(180px); background: #7048e8; }\n  100% { transform: translateX(0);   background: #3b5bdb; }\n}\n.an { width: 60px; height: 60px; border-radius: 12px; animation: move 2.4s ease-in-out infinite; }'),
    P('@keyframes', '定义动画的关键帧序列', '动画', '@keyframes 名称 { 0%{} 100%{} }', '—',
      '<div class="pl"></div>',
      '@keyframes pulse {\n  0%, 100% { transform: scale(1); opacity: 1; }\n  50%      { transform: scale(1.25); opacity: .6; }\n}\n.pl { width: 56px; height: 56px; border-radius: 50%; background: #0f7b52; animation: pulse 1.4s ease-in-out infinite; }'),

    /* 其他 */
    P('cursor', '鼠标悬停时的指针样式', '其他', 'pointer | default | text | move | not-allowed | grab …', 'auto',
      '<div class="cu1">cursor: pointer</div>\n<div class="cu2">cursor: not-allowed</div>',
      '.cu1, .cu2 { padding: 10px; border: 1px solid #ddd; border-radius: 8px; margin-bottom: 8px; }\n.cu1 { cursor: pointer; }\n.cu2 { cursor: not-allowed; }'),
    P('visibility', '控制元素可见性，隐藏后仍占据空间', '其他', 'visible | hidden | collapse', 'visible',
      '<div class="vw">\n  <div>可见</div>\n  <div class="vh">visibility: hidden（仍占位）</div>\n  <div>可见</div>\n</div>',
      '.vw > div { padding: 8px; background: #eef1fe; border-radius: 6px; margin-bottom: 6px; }\n.vh { visibility: hidden; }'),
    P('filter', '图形滤镜效果：模糊、灰度、亮度等', '其他', 'blur() brightness() grayscale() contrast() drop-shadow() …', 'none',
      '<div class="fi1">blur(2px)</div>\n<div class="fi2">grayscale(1)</div>',
      '.fi1, .fi2 { padding: 14px; border-radius: 8px; background: #eef1fe; margin-bottom: 10px; text-align: center; }\n.fi1 { filter: blur(1.4px); }\n.fi2 { filter: grayscale(1); background: linear-gradient(135deg,#8250df,#3b5bdb); color: #fff; }'),
    P('变量 --var', '自定义属性，配合 var() 使用，便于主题化', '其他', '--名称: 值; 使用 var(--名称, 回退)', '—',
      '<div class="vv">使用 CSS 变量</div>',
      ':root { --brand: #7048e8; --radius: 12px; }\n.vv { background: var(--brand); color: #fff; padding: 14px; border-radius: var(--radius); text-align: center; }'),

    /* ---- 扩充：盒模型 ---- */
    P('aspect-ratio', '宽高比，常用于图片 / 视频 / 卡片占位，避免加载前后的布局抖动', '盒模型', 'auto | <ratio>（如 16 / 9）', 'auto',
      '<div class="ar ar1">16 / 9</div>\n<div class="ar ar2">1 / 1</div>',
      '.ar { background: #eef1fe; border: 1.5px solid #3b5bdb; border-radius: 10px;\n  display: grid; place-items: center; color: #3b5bdb; margin-bottom: 10px; }\n.ar1 { width: 220px; aspect-ratio: 16 / 9; }\n.ar2 { width: 120px; aspect-ratio: 1 / 1; }'),
    P('object-fit', '替换元素（img / video）的内容在盒子内如何填充', '盒模型',
      'fill | contain | cover | none | scale-down', 'fill',
      '<img class="oi cover" alt="cover" src="' + IMG + '">\n<img class="oi contain" alt="contain" src="' + IMG + '">',
      '.oi { width: 150px; height: 90px; border-radius: 8px; margin-right: 8px;\n  border: 1px solid #ccd3e2; background: #f7f8fc; }\n.cover { object-fit: cover; }\n.contain { object-fit: contain; }'),

    /* ---- 扩充：边框 ---- */
    P('outline', '轮廓线，绘制在边框外侧，不占空间、不影响布局', '边框',
      '<width> <style> <color> | none | 3px solid red', 'none（medium none）',
      '<div class="ol1">outline 2px 实线</div>\n<div class="ol2">outline 2px dashed（不占位）</div>',
      '.ol1, .ol2 { padding: 8px; margin: 0 0 12px; background: #f7f8fc; border-radius: 6px; }\n.ol1 { outline: 2px solid #3b5bdb; outline-offset: 3px; }\n.ol2 { outline: 2px dashed #c02a2a; outline-offset: -2px; }'),

    /* ---- 扩充：颜色与背景 ---- */
    P('background-image', '设置一个或多个背景图层（渐变、图片、SVG）', '颜色',
      'none | url() | linear-gradient() | radial-gradient() | 多层用逗号分隔', 'none',
      '<div class="bgi1">线性渐变</div>\n<div class="bgi2">径向渐变</div>\n<div class="bgi3">多层叠加</div>',
      '.bgi1, .bgi2, .bgi3 { height: 64px; border-radius: 10px; margin-bottom: 8px;\n  color: #fff; display: grid; place-items: center; font-size: 13px; }\n.bgi1 { background-image: linear-gradient(135deg, #3b5bdb, #7048e8); }\n.bgi2 { background-image: radial-gradient(circle at 30% 30%, #f6d365, #a86404); }\n.bgi3 { background-image: linear-gradient(90deg, rgba(59,91,219,.85), rgba(112,72,232,.2)), repeating-linear-gradient(45deg, #0f7b52 0 10px, #16a06c 10px 20px); }'),
    P('background-position', '背景图在容器中的起始位置，语法 x y', '颜色',
      'left | center | right | top | bottom | 长度 | 百分比 | 关键字组合', '0% 0%（左上）',
      '<div class="bp bp1">left top</div>\n<div class="bp bp2">center center</div>\n<div class="bp bp3">right bottom</div>',
      '.bp { height: 60px; border-radius: 8px; margin-bottom: 8px; background-color: #eef1fe;\n  background-image: radial-gradient(circle, #3b5bdb 0 16px, transparent 17px);\n  background-repeat: no-repeat; }\n.bp1 { background-position: left top; }\n.bp2 { background-position: center center; }\n.bp3 { background-position: right bottom; }'),
    P('background-clip', '背景（颜色或图片）绘制的裁剪范围', '颜色',
      'border-box | padding-box | content-box | text', 'border-box',
      '<div class="bc1">padding-box：不铺到边框下</div>\n<div class="bc2">text：文字渐变</div>',
      '.bc1 { padding: 14px; border: 8px solid rgba(59,91,219,.25); border-radius: 8px;\n  background: #3b5bdb; background-clip: padding-box; color: #fff; margin-bottom: 12px; }\n.bc2 { font-size: 26px; font-weight: 800;\n  background: linear-gradient(90deg, #3b5bdb, #0f7b52);\n  -webkit-background-clip: text; background-clip: text; color: transparent; }'),
    P('accent-color', '统一设置复选框、单选框、进度条的主题色', '颜色', '<color> | auto', 'auto',
      '<label><input type="checkbox" checked> 已开启</label><br>\n<label><input type="radio" name="r" checked> 选项 A</label>',
      ':root { accent-color: #3b5bdb; }\ninput { transform: scale(1.15); margin-right: 6px; }'),
    P('color-scheme', '声明页面支持的配色方案，让滚动条、表单控件跟随深浅色', '颜色',
      'normal | light | dark | light dark', 'normal',
      '<p class="cs">当前区块声明 color-scheme: dark</p>\n<input value="表单控件会变深色">',
      '.cs { background: #0f1219; color: #e6e9f2; padding: 10px; border-radius: 8px; color-scheme: dark; }\n.cs + input { color-scheme: dark; margin-top: 8px; }'),
    P('mix-blend-mode', '元素与下层内容的混合模式', '颜色',
      'normal | multiply | screen | overlay | difference | luminosity …', 'normal',
      '<div class="mb"><span class="mb-c"></span><b class="mb-t">BLEND</b></div>',
      '.mb { position: relative; height: 90px; border-radius: 10px; overflow: hidden;\n  background: linear-gradient(90deg, #3b5bdb, #0f7b52); display: grid; place-items: center; }\n.mb-t { font-size: 34px; font-weight: 800; color: #f6d365; mix-blend-mode: difference; }\n.mb-c { position: absolute; inset: 0; background: radial-gradient(circle at 70% 30%, #ff6b6b, transparent 60%); mix-blend-mode: screen; }'),

    /* ---- 扩充：字体与文本 ---- */
    P('font-style', '字体风格：正常 / 斜体', '字体', 'normal | italic | oblique', 'normal',
      '<p class="fs-a">normal 正常</p>\n<p class="fs-b">italic 斜体</p>',
      '.fs-a { font-style: normal; }\n.fs-b { font-style: italic; }'),
    P('text-transform', '控制英文字母的大小写转换（中文无效）', '字体',
      'none | uppercase | lowercase | capitalize | full-width', 'none',
      '<p class="tt1">Make It Uppercase</p>\n<p class="tt2">make it lowercase</p>\n<p class="tt3">capitalize each word</p>',
      '.tt1 { text-transform: uppercase; }\n.tt2 { text-transform: lowercase; }\n.tt3 { text-transform: capitalize; }'),
    P('text-indent', '段落首行缩进，中文排版常用 2em', '字体', '长度 | 百分比 | each-line | hanging', '0',
      '<p class="ti">首行缩进 2em。这是中文排版里最常见的段落样式，后续行不会缩进，只有第一行会向内移动两个字的宽度。</p>',
      '.ti { text-indent: 2em; background: #f7f8fc; padding: 8px 10px; border-radius: 6px; }'),
    P('text-overflow', '文本溢出时的省略方式，需配合 overflow 与 white-space', '字体',
      'clip | ellipsis | 自定义字符串', 'clip',
      '<p class="te1">这是一段很长很长很长的文字，超出后会显示省略号</p>\n<p class="te2">多行截断：这是一段很长很长很长很长的文字，超出两行后会被裁掉</p>',
      '.te1 { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; width: 100%; }\n.te2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;\n  overflow: hidden; margin-bottom: 0; }'),
    P('word-break', '单词 / 连续字符的换行规则', '字体',
      'normal | break-all | keep-all | break-word', 'normal',
      '<p class="wb">这里有一段超长英文 Supercalifragilisticexpialidocious 与一长串数字 12345678901234567890</p>',
      '.wb { width: 100%; background: #f7f8fc; padding: 10px; border-radius: 6px; word-break: break-word; overflow-wrap: anywhere; }'),
    P('vertical-align', '行内元素 / 表格单元格在垂直方向的对齐', '字体',
      'baseline | top | middle | bottom | sub | super | 长度', 'baseline',
      '<p class="va">文字 <span class="va-a">基线 baseline</span> 与 <span class="va-b">middle</span></p>\n<table class="va-t"><tr><td class="top">top</td><td class="mid">middle</td></tr></table>',
      '.va-a { vertical-align: baseline; background: #eef1fe; padding: 0 4px; }\n.va-b { vertical-align: middle; background: #e6f5ef; padding: 0 4px; }\n.va-t { margin-top: 8px; }\n.va-t td { height: 60px; border: 1px solid #ccd3e2; padding: 4px 10px; }\n.top { vertical-align: top; }\n.mid { vertical-align: middle; }'),
    P('text-shadow', '文字阴影，可叠加多层，做出描边 / 发光效果', '字体',
      'offsetX offsetY blur color', 'none',
      '<p class="ts1">柔和阴影</p>\n<p class="ts2">霓虹发光</p>',
      '.ts1 { font-size: 22px; font-weight: 700; text-shadow: 0 2px 4px rgba(20,28,50,.35); }\n.ts2 { font-size: 22px; font-weight: 700; color: #f7f8fc;\n  text-shadow: 0 0 6px #3b5bdb, 0 0 16px #7048e8; background: #1b2030; padding: 6px 10px; border-radius: 8px; }'),

    /* ---- 扩充：Flex ---- */
    P('align-self', '单个子项在交叉轴上的对齐，覆盖父级 align-items', 'Flex',
      'auto | flex-start | flex-end | center | baseline | stretch', 'auto',
      '<div class="as"><div class="as1">1</div><div class="as2">2（align-self: flex-end）</div><div>3</div></div>',
      '.as { display: flex; gap: 8px; align-items: flex-start; min-height: 100px;\n  background: #f7f8fc; border-radius: 8px; padding: 8px; }\n.as > div { background: #eef1fe; border: 1.5px solid #3b5bdb; border-radius: 8px; padding: 8px 12px; color: #3b5bdb; }\n.as2 { align-self: flex-end; }'),
    P('align-content', '多行（多轴）时，行与行之间的分布方式', 'Flex',
      'stretch | flex-start | center | space-between | space-around | space-evenly', 'stretch',
      '<div class="ac"><div>1</div><div>2</div><div>3</div><div>4</div><div>5</div><div>6</div></div>',
      '.ac { display: flex; flex-wrap: wrap; align-content: space-between; gap: 6px; height: 130px;\n  background: #f7f8fc; border-radius: 8px; padding: 8px; }\n.ac > div { width: 60px; background: #eef1fe; border: 1.5px solid #3b5bdb; border-radius: 8px; padding: 4px; text-align: center; color: #3b5bdb; }'),
    P('flex-grow', '放大系数：剩余空间按比例分配给子项', 'Flex', '数字（0 不放大）', '0',
      '<div class="fg"><div class="fg1">flex-grow: 1</div><div class="fg2">flex-grow: 3</div></div>',
      '.fg { display: flex; gap: 8px; background: #f7f8fc; border-radius: 8px; padding: 8px; }\n.fg > div { background: #eef1fe; border: 1.5px solid #3b5bdb; border-radius: 8px; padding: 8px; color: #3b5bdb; text-align: center; }\n.fg1 { flex-grow: 1; }\n.fg2 { flex-grow: 3; }'),

    /* ---- 扩充：Grid ---- */
    P('grid-template-rows', '定义行轨道', 'Grid', '轨道列表，可用 repeat()、fr、minmax()', 'none',
      '<div class="gtr"><div>header</div><div>content</div><div>footer</div></div>',
      '.gtr { display: grid; grid-template-columns: 1fr; grid-template-rows: 40px 1fr 40px;\n  height: 180px; gap: 6px; background: #f7f8fc; border-radius: 8px; padding: 8px; }\n.gtr > div { background: #f2ecfd; border: 1.5px solid #7048e8; border-radius: 8px;\n  display: grid; place-items: center; color: #7048e8; }'),
    P('grid-auto-flow', '项目自动排布的方向与是否需要填满空洞', 'Grid',
      'row | column | dense', 'row',
      '<div class="gaf"><div class="w2">A（跨 2 列）</div><div>B</div><div>C</div></div>',
      '.gaf { display: grid; grid-template-columns: repeat(3, 1fr); grid-auto-flow: dense; gap: 6px;\n  background: #f7f8fc; border-radius: 8px; padding: 8px; }\n.gaf > div { background: #f2ecfd; border: 1.5px solid #7048e8; border-radius: 8px; padding: 12px; text-align: center; color: #7048e8; }\n.w2 { grid-column: span 2; }'),
    P('place-items', '同时设置 align-items 与 justify-items 的简写', 'Grid',
      'align-items justify-items', '—',
      '<div class="pi"><div>居中</div></div>',
      '.pi { display: grid; place-items: center; height: 110px;\n  background: #f7f8fc; border-radius: 8px; }\n.pi > div { width: 80px; height: 44px; display: grid; place-items: center;\n  background: #f2ecfd; border: 1.5px solid #7048e8; border-radius: 8px; color: #7048e8; }'),

    /* ---- 扩充：其他 ---- */
    P('backdrop-filter', '对元素背后的区域做滤镜（毛玻璃效果）', '其他',
      'blur() saturate() brightness() contrast() …', 'none',
      '<div class="bf-wrap"><div class="bf">毛玻璃</div></div>',
      '.bf-wrap { height: 120px; border-radius: 10px; background: linear-gradient(135deg, #3b5bdb, #0f7b52, #7048e8);\n  display: grid; place-items: center; }\n.bf { padding: 14px 22px; border-radius: 12px; color: #fff; font-weight: 600;\n  background: rgba(255,255,255,.22); backdrop-filter: blur(8px) saturate(1.4);\n  border: 1px solid rgba(255,255,255,.4); }'),
    P('clip-path', '按形状裁剪元素可见区域', '其他',
      'circle() | ellipse() | polygon() | inset() | path()', 'none',
      '<div class="cp1">circle</div>\n<div class="cp2">polygon 箭头</div>',
      '.cp1, .cp2 { height: 80px; margin-bottom: 10px; display: grid; place-items: center;\n  color: #fff; font-size: 13px; }\n.cp1 { background: #3b5bdb; clip-path: circle(40% at 50% 50%); }\n.cp2 { background: #0f7b52; clip-path: polygon(0 0, 70% 0, 100% 50%, 70% 100%, 0 100%); }'),
    P('pointer-events', '控制元素是否响应鼠标 / 触摸事件', '其他', 'auto | none', 'auto',
      '<div class="pe-out"><button class="pe-btn">被禁用的按钮</button></div>\n<p class="pe-tip">上面按钮 pointer-events: none，点击会穿透到外层</p>',
      '.pe-out { padding: 10px; background: #f7f8fc; border-radius: 8px; }\n.pe-btn { pointer-events: none; opacity: .5; padding: 6px 14px; border-radius: 6px; border: 1px solid #ccd3e2; }\n.pe-tip { font-size: 12px; color: #59637a; margin: 8px 0 0; }'),
    P('user-select', '是否允许用户选中文本', '其他', 'auto | none | text | all', 'auto',
      '<p class="us1">这段文字可以选中</p>\n<p class="us2">这段文字 user-select: none，选不中</p>',
      '.us1 { background: #eef1fe; padding: 6px 10px; border-radius: 6px; }\n.us2 { background: #fdecec; padding: 6px 10px; border-radius: 6px; user-select: none; }'),
    P('scroll-behavior', '滚动容器在锚点跳转时是否平滑滚动', '其他', 'auto | smooth', 'auto',
      '<div class="sb"><a href="#sb-target">跳到下方</a><div class="sb-fill"></div><p id="sb-target">目标位置</p></div>',
      '.sb { height: 120px; overflow: auto; scroll-behavior: smooth; background: #f7f8fc;\n  border-radius: 8px; padding: 8px; }\n.sb-fill { height: 220px; }'),
    P('list-style', '列表项标记的简写：类型 位置 图片', '其他',
      'list-style-type | position | image', 'disc outside none',
      '<ul class="ls1"><li>圆点（默认）</li><li>第二项</li></ul>\n<ul class="ls2"><li>方形标记</li><li>第二项</li></ul>',
      '.ls1 { list-style: disc outside; }\n.ls2 { list-style: square inside; }'),
    P('table-layout', '表格列宽的算法：auto 按内容，fixed 按第一行平均分配', '其他',
      'auto | fixed', 'auto',
      '<table class="tl"><tr><th>姓名</th><th>说明</th></tr><tr><td>张三</td><td>这是一段比较长的说明文字，用来观察列宽变化</td></tr></table>',
      '.tl { width: 100%; table-layout: fixed; }\n.tl th, .tl td { border: 1px solid #ccd3e2; padding: 6px 8px; }\n.tl th:first-child { width: 90px; }')
  ];

  window.CSS_PROP_CATS = ['盒模型', '边框', '颜色', '字体', 'Flex', 'Grid', '定位', '动画', '其他'];

  /* ==========================================================
     属性详解元数据：语法 / 是否继承 / 是否可动画 / 常用取值
     —— 单独维护，避免 P() 的参数列表过长
     ========================================================== */
  window.CSS_PROP_META = {
    'display': {
      s: 'display: block | inline | inline-block | flex | grid | none | contents …', i: '否', a: '否',
      n: 'display 决定"外部显示类型 + 内部布局方式"，现代语法可写 display: block flex;',
      v: [
        { v: 'block', d: '块级盒子，独占一行，可设宽高（div / p / h1）' },
        { v: 'inline', d: '行内盒子，随文字流排列，宽高无效（span / a）' },
        { v: 'inline-block', d: '像行内一样排列，但内部是块级，可以设宽高' },
        { v: 'flex', d: '弹性容器，子元素沿主轴排列' },
        { v: 'grid', d: '网格容器，同时控制行与列' },
        { v: 'none', d: '不生成盒子，彻底移出渲染树（不占位）' },
        { v: 'contents', d: '自身不生成盒子，子元素直接参与父级布局' }
      ]
    },
    'box-sizing': {
      s: 'box-sizing: content-box | border-box', i: '否', a: '否',
      n: '全局推荐 * { box-sizing: border-box; }，让 width 表示"最终宽度"。',
      v: [
        { v: 'content-box', d: '默认值，width 只含内容，padding + border 会额外撑大' },
        { v: 'border-box', d: 'width 含 padding 与 border，算尺寸更直观' }
      ]
    },
    'width / height': {
      s: 'width: <length-percentage> | auto | min-content | max-content | fit-content(…)', i: '否', a: '是',
      n: '行内元素设 width 无效，需要改成 inline-block / block / flex 子项。',
      v: [
        { v: 'auto', d: '由内容与父容器决定（块级元素默认撑满可用宽度）' },
        { v: '100%', d: '相对包含块的宽度' },
        { v: 'fit-content', d: '收缩到内容宽度，但不超过可用宽度' },
        { v: 'min-content', d: '收缩到最窄（最长的不可断词）' },
        { v: 'max-content', d: '不换行时的完整内容宽度' }
      ]
    },
    'margin': {
      s: 'margin: <length-percentage> | auto | 1~4 个值', i: '否', a: '是',
      n: '相邻块级元素的上下 margin 会折叠，取较大值；行内元素上下 margin 不生效。',
      v: [
        { v: '1 个值', d: '四边相同：margin: 12px' },
        { v: '2 个值', d: '上下 / 左右：margin: 8px 16px' },
        { v: '3 个值', d: '上 / 左右 / 下：margin: 8px 16px 4px' },
        { v: '4 个值', d: '上 / 右 / 下 / 左（顺时针）' },
        { v: 'auto', d: '水平方向自动分配剩余空间 → 块级元素水平居中' },
        { v: '负值', d: '允许，可让元素上移或与相邻元素重叠' }
      ]
    },
    'padding': {
      s: 'padding: <length-percentage> | 1~4 个值', i: '否', a: '是',
      n: '百分比 padding 始终相对"包含块的宽度"计算，上下 padding 也一样。',
      v: [
        { v: '长度', d: '如 padding: 8px 16px' },
        { v: '百分比', d: '相对包含块宽度，可做等比占位' },
        { v: '不支持负值', d: '需要负间距用 margin 或 transform' }
      ]
    },
    'overflow': {
      s: 'overflow: visible | hidden | scroll | auto | clip', i: '否', a: '否',
      n: 'overflow 不为 visible 会形成 BFC；同时会裁剪 position: sticky 子元素的吸附效果。',
      v: [
        { v: 'visible', d: '默认，内容溢出可见' },
        { v: 'hidden', d: '裁剪溢出内容，无滚动条' },
        { v: 'auto', d: '需要时才出现滚动条' },
        { v: 'scroll', d: '总是显示滚动条（占位）' },
        { v: 'clip', d: '直接裁剪，不产生滚动容器' }
      ]
    },
    'min-width / max-width': {
      s: 'min-width: <length-percentage> | none；max-width: <length-percentage> | none', i: '否', a: '是',
      n: 'max-width 优先级高于 width，min-width 优先级高于 max-width。',
      v: [
        { v: 'min-width', d: '尺寸下限，flex 子项默认 min-width: auto 可能阻止收缩' },
        { v: 'max-width', d: '尺寸上限，常写 max-width: 100% 防止图片溢出' }
      ]
    },
    'border': {
      s: 'border: <width> <style> <color>', i: '否', a: '是',
      n: 'border 会增加盒子尺寸（content-box 下），可用 border-box 或 outline 规避。',
      v: [
        { v: 'solid', d: '实线' },
        { v: 'dashed', d: '虚线' },
        { v: 'dotted', d: '点线' },
        { v: 'double', d: '双线（宽度至少 3px 才看得出）' },
        { v: 'none', d: '无边框（等价 0）' }
      ]
    },
    'border-radius': {
      s: 'border-radius: <length-percentage>{1,4} [/ <length-percentage>{1,4}]', i: '否', a: '是',
      n: '斜杠写法可分别指定水平 / 垂直半径，做出椭圆角。',
      v: [
        { v: '12px', d: '四角统一圆角' },
        { v: '50%', d: '正方形 → 圆；长方形 → 椭圆' },
        { v: '999px', d: '胶囊形状（pill）' },
        { v: '0 12px 12px 0', d: '只圆右侧两角' },
        { v: '12px / 6px', d: '水平半径 12px，垂直半径 6px' }
      ]
    },
    'box-shadow': {
      s: 'box-shadow: <x> <y> <blur> <spread> <color> [inset]，可多层逗号分隔', i: '否', a: '是',
      n: '多层阴影可以做出非常柔和的层次感，比单层大模糊更自然。',
      v: [
        { v: '0 1px 3px rgba(0,0,0,.12)', d: '卡片默认阴影' },
        { v: '0 12px 32px rgba(0,0,0,.18)', d: '浮层 / 弹窗' },
        { v: 'inset 0 2px 6px #0002', d: '内阴影，凹陷感' },
        { v: '0 0 0 3px #3b5bdb33', d: '无模糊 → 焦点光圈' }
      ]
    },
    'color': {
      s: 'color: <color>', i: '是', a: '是',
      n: 'color 会继承给所有子元素，除非子元素自己声明。',
      v: [
        { v: '#3b5bdb', d: '十六进制，最常用' },
        { v: 'rgb(59 91 219 / .6)', d: '带透明度的现代写法' },
        { v: 'hsl(228 68% 55%)', d: '按色相 / 饱和度 / 亮度调色更直观' },
        { v: 'currentColor', d: '跟随当前 color，用于边框 / 图标' },
        { v: 'var(--accent)', d: '使用主题变量' }
      ]
    },
    'background': {
      s: 'background: <color> <image> <position> / <size> <repeat> <attachment>', i: '否', a: '是',
      n: '简写会把未写的子属性重置为初始值，只想改一项时请用 background-color 等长写。',
      v: [
        { v: 'background-color', d: '纯色背景' },
        { v: 'linear-gradient(…)', d: '线性渐变' },
        { v: 'radial-gradient(…)', d: '径向渐变' },
        { v: 'conic-gradient(…)', d: '锥形渐变，可做饼图 / 色轮' }
      ]
    },
    'background-size': {
      s: 'background-size: auto | cover | contain | <length-percentage>{1,2}', i: '否', a: '是',
      n: '通常与 background-repeat: no-repeat 搭配使用。',
      v: [
        { v: 'cover', d: '等比放大填满容器，可能裁掉一部分' },
        { v: 'contain', d: '等比缩放到完整显示，可能留白' },
        { v: '100% 100%', d: '拉伸变形填满' }
      ]
    },
    'opacity': {
      s: 'opacity: <number 0~1>', i: '否', a: '是',
      n: 'opacity 作用于整个元素（含子元素与阴影）；只想让背景透明请用 rgba / color-mix。',
      v: [
        { v: '1', d: '完全不透明（默认）' },
        { v: '.5', d: '半透明' },
        { v: '0', d: '完全透明，仍响应鼠标事件（与 visibility / display 不同）' }
      ]
    },
    'font-family': {
      s: 'font-family: <family-name>, <generic-family>', i: '是', a: '否',
      n: '含空格的字体名要加引号，最后一定给一个通用族做兜底。',
      v: [
        { v: 'system-ui', d: '系统默认 UI 字体，跨平台最自然' },
        { v: 'sans-serif', d: '无衬线通用族' },
        { v: 'serif', d: '衬线通用族' },
        { v: 'monospace', d: '等宽，用于代码' }
      ]
    },
    'font-size': {
      s: 'font-size: <length-percentage> | 关键字', i: '是', a: '是',
      n: 'em 相对父元素字号会逐层累积，rem 相对根元素更可控。',
      v: [
        { v: '16px', d: '绝对尺寸，最直观' },
        { v: '1rem', d: '相对根字号（默认 16px）' },
        { v: '1.2em', d: '相对父元素字号，嵌套会叠加' },
        { v: 'clamp(14px, 2.5vw, 20px)', d: '流式字号，随视口平滑变化' }
      ]
    },
    'font-weight': {
      s: 'font-weight: normal | bold | 100~900', i: '是', a: '是',
      n: '能否显示出细/粗取决于字体本身提供的字重，中文字体常常只有 400 与 700。',
      v: [
        { v: '400', d: '常规（normal）' },
        { v: '700', d: '粗体（bold）' },
        { v: '300 / 500', d: '细体 / 中等，需要字体支持' }
      ]
    },
    'line-height': {
      s: 'line-height: <number> | <length> | <percentage> | normal', i: '是', a: '是',
      n: '推荐无单位数值（如 1.6）：它按各自字号计算，子元素不会被父级字号"污染"。',
      v: [
        { v: '1.6', d: '正文常用，行距舒适' },
        { v: '1.2', d: '标题常用，紧凑' },
        { v: '24px', d: '固定行高，可能导致不同字号错位' },
        { v: 'normal', d: '约 1.2 倍字体自身设定' }
      ]
    },
    'text-align': {
      s: 'text-align: left | right | center | justify | start | end', i: '是', a: '否',
      n: '只影响行内内容，不会让块级盒子本身居中（盒子居中用 margin: 0 auto）。',
      v: [
        { v: 'left / start', d: '左对齐（LTR 下等价）' },
        { v: 'center', d: '居中对齐行内内容' },
        { v: 'justify', d: '两端对齐（最后一行除外）' }
      ]
    },
    'text-decoration': {
      s: 'text-decoration: <line> <style> <color> <thickness>', i: '否', a: '否',
      n: '无法继承，但绘制会穿过子元素；想取消链接下划线常用于 a { text-decoration: none }。',
      v: [
        { v: 'none', d: '去掉装饰线' },
        { v: 'underline', d: '下划线' },
        { v: 'line-through', d: '删除线' },
        { v: 'underline wavy red', d: '波浪形红色下划线' }
      ]
    },
    'letter-spacing': {
      s: 'letter-spacing: <length> | normal', i: '是', a: '是',
      n: '在最后一个字后面也会加间距，居中标题容易看起来偏左，可配合 padding 微调。',
      v: [
        { v: 'normal', d: '默认（0）' },
        { v: '.02em', d: '轻微加宽，标题常用' },
        { v: '-.01em', d: '收紧，大字号标题更紧凑' }
      ]
    },
    'white-space': {
      s: 'white-space: normal | nowrap | pre | pre-wrap | pre-line | break-spaces', i: '是', a: '否',
      n: '单行省略的三件套：white-space: nowrap + overflow: hidden + text-overflow: ellipsis。',
      v: [
        { v: 'normal', d: '合并空白并自动换行' },
        { v: 'nowrap', d: '合并空白且强制不换行' },
        { v: 'pre', d: '保留空格与换行，不自动换行' },
        { v: 'pre-wrap', d: '保留空格与换行，同时自动换行' },
        { v: 'pre-line', d: '保留换行，合并多余空格' }
      ]
    },
    'display: flex': {
      s: 'display: flex | inline-flex', i: '否', a: '否',
      n: 'flex 容器的直接子元素成为 flex item；text 节点会被包成匿名 flex item。',
      v: [
        { v: 'flex', d: '块级弹性容器' },
        { v: 'inline-flex', d: '行内级弹性容器，宽度由内容决定' }
      ]
    },
    'flex-direction': {
      s: 'flex-direction: row | row-reverse | column | column-reverse', i: '否', a: '否',
      n: '它决定"主轴"方向，进而决定 justify-content 作用于哪个方向。',
      v: [
        { v: 'row', d: '水平从左到右（默认）' },
        { v: 'column', d: '垂直从上到下' },
        { v: 'row-reverse', d: '水平从右到左，视觉顺序反转' }
      ]
    },
    'justify-content': {
      s: 'justify-content: flex-start | flex-end | center | space-between | space-around | space-evenly', i: '否', a: '否',
      n: '作用于主轴；单行时它负责"剩余空间怎么分"。',
      v: [
        { v: 'flex-start', d: '靠主轴起点' },
        { v: 'center', d: '居中' },
        { v: 'space-between', d: '两端贴边，中间均分（导航栏最常用）' },
        { v: 'space-around', d: '每项左右各留一份间距' },
        { v: 'space-evenly', d: '所有间隙完全相等' }
      ]
    },
    'align-items': {
      s: 'align-items: stretch | flex-start | flex-end | center | baseline', i: '否', a: '否',
      n: '作用于交叉轴；默认 stretch 会让子项等高，所以常看到"卡片自动等高"。',
      v: [
        { v: 'stretch', d: '未设尺寸时拉满交叉轴（默认）' },
        { v: 'center', d: '交叉轴居中（垂直居中神器）' },
        { v: 'flex-start', d: '贴交叉轴起点' },
        { v: 'baseline', d: '按文字基线对齐' }
      ]
    },
    'flex-wrap': {
      s: 'flex-wrap: nowrap | wrap | wrap-reverse', i: '否', a: '否',
      n: '设为 wrap 后，子项会换行，此时 align-content 才生效。',
      v: [
        { v: 'nowrap', d: '不换行，空间不足时压缩子项（默认）' },
        { v: 'wrap', d: '换行，第一行在上' },
        { v: 'wrap-reverse', d: '换行，第一行在下' }
      ]
    },
    'gap': {
      s: 'gap: <row-gap> <column-gap>', i: '否', a: '是',
      n: '只作用于容器内部间隙，不会在首尾额外加空隙。',
      v: [
        { v: '8px', d: '行列间距都是 8px' },
        { v: '8px 16px', d: '行间距 8px，列间距 16px' },
        { v: '1rem', d: '跟随根字号' }
      ]
    },
    'flex': {
      s: 'flex: <grow> <shrink> <basis>', i: '否', a: '是',
      n: 'flex: 1 等于 1 1 0%：先忽略内容宽度，再按比例分配剩余空间。',
      v: [
        { v: 'flex: 1', d: '占满剩余空间（等分时最常用）' },
        { v: 'flex: 0 0 200px', d: '固定 200px，不放大不收缩' },
        { v: 'flex: 1 1 auto', d: '按内容基准伸缩' },
        { v: 'flex: none', d: '等价 0 0 auto，尺寸完全由内容决定' }
      ]
    },
    'order': {
      s: 'order: <integer>', i: '否', a: '否',
      n: '只改变视觉顺序，不影响 DOM 顺序与无障碍阅读顺序。',
      v: [
        { v: '0', d: '默认，按 DOM 顺序' },
        { v: '-1', d: '排到最前' },
        { v: '2', d: '数值越大越靠后' }
      ]
    },
    'display: grid': {
      s: 'display: grid | inline-grid', i: '否', a: '否',
      n: 'Grid 适合"先定骨架再放内容"，Flex 适合"按内容排布"。',
      v: [
        { v: 'grid', d: '块级网格容器' },
        { v: 'inline-grid', d: '行内级网格容器' }
      ]
    },
    'grid-template-columns': {
      s: 'grid-template-columns: <track-list> | none', i: '否', a: '是',
      n: 'fr 表示"剩余空间的份数"，minmax() 可设定轨道的最小/最大尺寸。',
      v: [
        { v: '1fr 1fr 1fr', d: '三等分' },
        { v: '200px 1fr', d: '固定侧栏 + 自适应主区' },
        { v: 'repeat(3, 1fr)', d: '三等分简写' },
        { v: 'repeat(auto-fit, minmax(220px, 1fr))', d: '响应式卡片网格' }
      ]
    },
    'grid-template-areas': {
      s: 'grid-template-areas: "a b" "c d";', i: '否', a: '否',
      n: '每个字符串是一行，同一区域名出现在多格即跨格；用点号 . 表示空单元格。',
      v: [
        { v: '"hd hd" "sb mn"', d: '两行两列，头部跨两列' },
        { v: '. 表示空格', d: '占位但不放内容' }
      ]
    },
    'grid-column / grid-row': {
      s: 'grid-column: <start> / <end> | span <n>', i: '否', a: '是',
      n: '数字指的是"网格线"编号，从 1 开始；负值从末尾数。',
      v: [
        { v: '1 / 3', d: '从第 1 条线到第 3 条线（占 2 列）' },
        { v: 'span 2', d: '跨 2 列，起点自动' },
        { v: '2 / -1', d: '从第 2 条线到倒数第 1 条线' }
      ]
    },
    'auto-fill / auto-fit': {
      s: 'repeat(auto-fill | auto-fit, minmax(min, 1fr))', i: '否', a: '否',
      n: '项目较少时 auto-fit 会把空轨道折叠、让卡片变宽；auto-fill 保留空轨道。',
      v: [
        { v: 'auto-fill', d: '尽可能多地放置轨道，空轨道保留' },
        { v: 'auto-fit', d: '空轨道折叠，现有项目拉伸填满' }
      ]
    },
    'position': {
      s: 'position: static | relative | absolute | fixed | sticky', i: '否', a: '否',
      n: 'absolute 相对"最近的已定位祖先"定位；都不满足时相对初始包含块。',
      v: [
        { v: 'static', d: '默认，top/left 无效' },
        { v: 'relative', d: '相对自身原位置偏移，仍占位' },
        { v: 'absolute', d: '脱离文档流，相对已定位祖先' },
        { v: 'fixed', d: '相对视口固定，滚动不动' },
        { v: 'sticky', d: '滚动到阈值后吸附，需设 top/bottom' }
      ]
    },
    'z-index': {
      s: 'z-index: <integer> | auto', i: '否', a: '否',
      n: '只在"已定位元素"或 flex/grid 子项上生效，且受层叠上下文限制。',
      v: [
        { v: 'auto', d: '默认，按 DOM 顺序参与层叠' },
        { v: '1 / 10 / 100', d: '数值越大越靠上' },
        { v: '-1', d: '沉到父级背景之上、内容之下' }
      ]
    },
    'float': {
      s: 'float: left | right | none | inline-start | inline-end', i: '否', a: '否',
      n: '现代布局优先用 flex / grid；float 主要用于文字环绕图片。',
      v: [
        { v: 'left', d: '浮动到左侧，文字环绕' },
        { v: 'right', d: '浮动到右侧' },
        { v: 'none', d: '不浮动' }
      ]
    },
    'top / right / bottom / left': {
      s: 'inset: <length> (简写) 或分别写 top/right/bottom/left', i: '否', a: '是',
      n: '只对非 static 元素生效；同时设 left 与 right 且 width:auto 时元素会被拉伸。',
      v: [
        { v: '0', d: '贴到对应边' },
        { v: '50%', d: '配合 translate(-50%) 做居中' },
        { v: 'auto', d: '不参与定位' }
      ]
    },
    'transition': {
      s: 'transition: <property> <duration> <timing-function> <delay>，可逗号分隔多组', i: '否', a: '否',
      n: 'transition 不能作用于 display 的切换；要做"收起/展开"建议用 grid-template-rows 或 height + overflow。',
      v: [
        { v: '.2s', d: '时长（必填，否则无动画）' },
        { v: 'ease-out', d: '先快后慢，交互反馈最自然' },
        { v: 'cubic-bezier(.4,0,.2,1)', d: '自定义缓动曲线' },
        { v: 'all', d: '监听所有可动画属性（不推荐，容易误伤）' }
      ]
    },
    'transform': {
      s: 'transform: translate() rotate() scale() skew() matrix()', i: '否', a: '是',
      n: 'transform 不改变布局（不触发重排），适合做动画；多个函数顺序不同结果不同。',
      v: [
        { v: 'translate(x, y)', d: '位移，百分比相对自身尺寸' },
        { v: 'scale(1.2)', d: '缩放' },
        { v: 'rotate(45deg)', d: '旋转' },
        { v: 'translate(-50%, -50%)', d: '配合 top/left 50% 做绝对居中' }
      ]
    },
    'animation': {
      s: 'animation: <name> <duration> <timing-function> <delay> <iteration-count> <direction> <fill-mode>', i: '否', a: '否',
      n: 'infinite 无限循环；用户偏好减少动效时可用 prefers-reduced-motion 关闭。',
      v: [
        { v: '2s ease-in-out infinite', d: '循环往复的动画' },
        { v: 'alternate', d: '奇偶次反向播放' },
        { v: 'both', d: '保留首尾帧的样式（fill-mode）' }
      ]
    },
    '@keyframes': {
      s: '@keyframes 名称 { from {} to {} } 或 { 0% {} 50% {} 100% {} }', i: '—', a: '—',
      n: '关键帧里的属性会插值；只有可动画属性（如 transform / opacity）才能流畅过渡。',
      v: [
        { v: 'from / to', d: '等价于 0% 与 100%' },
        { v: '百分比', d: '任意中间状态' },
        { v: '同名动画', d: '后定义者覆盖先定义者' }
      ]
    },
    'cursor': {
      s: 'cursor: <keyword> | url(…) <x> <y>, <fallback>', i: '是', a: '否',
      n: '可点击元素用 pointer；禁用态用 not-allowed；拖拽中可用 grabbing。',
      v: [
        { v: 'pointer', d: '手型，表示可点击' },
        { v: 'text', d: '文本选择光标' },
        { v: 'not-allowed', d: '禁用' },
        { v: 'grab / grabbing', d: '可拖拽 / 拖拽中' }
      ]
    },
    'visibility': {
      s: 'visibility: visible | hidden | collapse', i: '是', a: '否',
      n: 'hidden 仍占位且不响应事件；需要过渡动画时可配合 transition: visibility。',
      v: [
        { v: 'visible', d: '可见' },
        { v: 'hidden', d: '不可见，但保留布局位置' },
        { v: 'collapse', d: '表格行/列折叠（其他元素等同 hidden）' }
      ]
    },
    'filter': {
      s: 'filter: blur() | brightness() | contrast() | grayscale() | saturate() | drop-shadow()', i: '否', a: '是',
      n: 'filter 会创建新的层叠上下文，可能影响 position: fixed 子元素的参照。',
      v: [
        { v: 'blur(4px)', d: '高斯模糊' },
        { v: 'grayscale(1)', d: '完全灰度' },
        { v: 'brightness(.8)', d: '压暗（hover 反馈常用）' },
        { v: 'drop-shadow(0 4px 8px #0003)', d: '贴合图形轮廓的阴影' }
      ]
    },
    '变量 --var': {
      s: '--name: <value>;  使用：var(--name, <fallback>)', i: '是', a: '是',
      n: '自定义属性会被继承，因此在 :root 定义的变量全局可用，也是做主题切换的基础。',
      v: [
        { v: ':root { --brand: #3b5bdb; }', d: '定义全局变量' },
        { v: 'var(--brand)', d: '使用变量' },
        { v: 'var(--brand, #333)', d: '带兜底值' },
        { v: 'calc(var(--gap) * 2)', d: '变量可参与计算' }
      ]
    },
    'aspect-ratio': {
      s: 'aspect-ratio: <ratio> | auto', i: '否', a: '否',
      n: '只设 width 时高度按比例自动算出，是图片/视频占位防抖动的标准做法。',
      v: [
        { v: '16 / 9', d: '宽屏视频比例' },
        { v: '1 / 1', d: '正方形' },
        { v: '4 / 3', d: '传统显示器比例' },
        { v: 'auto', d: '由内容决定' }
      ]
    },
    'object-fit': {
      s: 'object-fit: fill | contain | cover | none | scale-down', i: '否', a: '否',
      n: '只对 img / video 等替换元素生效，配合 object-position 控制裁剪中心。',
      v: [
        { v: 'cover', d: '等比填满，可能裁掉一部分（头像最常用）' },
        { v: 'contain', d: '完整显示，可能留白' },
        { v: 'fill', d: '拉伸变形填满（默认）' },
        { v: 'scale-down', d: '取 none 与 contain 中更小的效果' }
      ]
    },
    'outline': {
      s: 'outline: <width> <style> <color>; outline-offset: <length>', i: '否', a: '是',
      n: 'outline 不占布局空间、不一定是矩形（Chrome 会跟随 border-radius），常用来做焦点环。',
      v: [
        { v: '2px solid #3b5bdb', d: '清晰焦点环' },
        { v: 'none', d: '去掉默认焦点框（请务必自己补一个）' },
        { v: 'outline-offset: 2px', d: '让轮廓与元素之间留缝' }
      ]
    },
    'background-image': {
      s: 'background-image: none | <image>#', i: '否', a: '是',
      n: '多层背景用逗号分隔，先写的在上层；渐变可以当遮罩叠在图片上。',
      v: [
        { v: 'linear-gradient()', d: '线性渐变' },
        { v: 'radial-gradient()', d: '径向渐变' },
        { v: 'url("a.png")', d: '图片' },
        { v: '多层', d: 'background-image: linear-gradient(…), url(…);' }
      ]
    },
    'background-position': {
      s: 'background-position: <position>（x y）', i: '否', a: '是',
      n: '百分比含义是"图片的 x% 位置对齐容器的 x% 位置"，不是简单偏移。',
      v: [
        { v: 'center', d: '居中' },
        { v: 'left top', d: '左上角' },
        { v: 'right 10px bottom 6px', d: '距离右下角分别 10px / 6px' }
      ]
    },
    'background-clip': {
      s: 'background-clip: border-box | padding-box | content-box | text', i: '否', a: '否',
      n: 'background-clip: text 需要文字颜色透明，才能看到渐变文字。',
      v: [
        { v: 'border-box', d: '铺到边框外沿（默认）' },
        { v: 'padding-box', d: '不铺到边框下' },
        { v: 'content-box', d: '只铺内容区' },
        { v: 'text', d: '裁剪成文字形状（渐变文字）' }
      ]
    },
    'accent-color': {
      s: 'accent-color: <color> | auto', i: '是', a: '否',
      n: '一行代码统一复选框、单选框、range、progress 的主题色。',
      v: [
        { v: '#3b5bdb', d: '指定主题色' },
        { v: 'auto', d: '跟随浏览器 / 系统' }
      ]
    },
    'color-scheme': {
      s: 'color-scheme: normal | light | dark | light dark', i: '是', a: '否',
      n: '声明后浏览器会给表单控件、滚动条、默认背景套用对应配色。',
      v: [
        { v: 'light dark', d: '两者都支持，跟随系统' },
        { v: 'dark', d: '强制深色控件' }
      ]
    },
    'mix-blend-mode': {
      s: 'mix-blend-mode: normal | multiply | screen | overlay | difference | …', i: '否', a: '否',
      n: '混合的是"元素与其背后内容"，需要元素本身有非透明像素才看得出效果。',
      v: [
        { v: 'multiply', d: '正片叠底，压暗' },
        { v: 'screen', d: '滤色，提亮' },
        { v: 'difference', d: '差值，可做反色文字' },
        { v: 'overlay', d: '叠加，增强对比' }
      ]
    },
    'font-style': {
      s: 'font-style: normal | italic | oblique <angle>', i: '是', a: '否',
      n: 'italic 使用字体自带的斜体字形，没有时会合成倾斜；oblique 是强制倾斜。',
      v: [
        { v: 'normal', d: '正常' },
        { v: 'italic', d: '斜体（推荐用于英文强调）' }
      ]
    },
    'text-transform': {
      s: 'text-transform: none | uppercase | lowercase | capitalize | full-width', i: '是', a: '否',
      n: '只改变显示，不改变 DOM 中的真实文本，因此不影响搜索与复制。',
      v: [
        { v: 'uppercase', d: '全部大写' },
        { v: 'lowercase', d: '全部小写' },
        { v: 'capitalize', d: '每个单词首字母大写' }
      ]
    },
    'text-indent': {
      s: 'text-indent: <length-percentage> | each-line | hanging', i: '是', a: '是',
      n: '中文段落首行缩进 2em 即可，不必敲空格。',
      v: [
        { v: '2em', d: '首行缩进两个汉字' },
        { v: '-9999px', d: '隐藏首行文本（旧式图片替换技巧）' }
      ]
    },
    'text-overflow': {
      s: 'text-overflow: clip | ellipsis | <string>', i: '否', a: '否',
      n: '必须同时有 overflow: hidden 与 white-space: nowrap 才会出现省略号。',
      v: [
        { v: 'ellipsis', d: '显示 …' },
        { v: 'clip', d: '直接裁掉' }
      ]
    },
    'word-break': {
      s: 'word-break: normal | break-all | keep-all | break-word', i: '是', a: '否',
      n: '长英文 / URL 溢出容器时，overflow-wrap: anywhere 往往比 break-all 更合适。',
      v: [
        { v: 'normal', d: '按语言规则断词' },
        { v: 'break-all', d: '任意字符处都可断行（适合纯数字/URL）' },
        { v: 'keep-all', d: '中文不断词（配合 overflow-wrap 使用）' },
        { v: 'break-word', d: '必要时打断长单词' }
      ]
    },
    'vertical-align': {
      s: 'vertical-align: baseline | top | middle | bottom | <length>', i: '否', a: '是',
      n: '只对行内元素、表格单元格有效，块级元素垂直居中请用 flex / grid。',
      v: [
        { v: 'baseline', d: '按文字基线对齐（默认）' },
        { v: 'middle', d: '按中线对齐，常用于图标与文字' },
        { v: 'top / bottom', d: '按行盒的顶 / 底对齐' }
      ]
    },
    'text-shadow': {
      s: 'text-shadow: <x> <y> <blur> <color>#', i: '是', a: '是',
      n: '多层叠加可做发光、描边；描边也可以用 -webkit-text-stroke。',
      v: [
        { v: '0 1px 2px #0003', d: '轻微投影，提升可读性' },
        { v: '0 0 8px #3b5bdb', d: '发光' },
        { v: '多层', d: '用逗号分隔多组阴影' }
      ]
    },
    'align-self': {
      s: 'align-self: auto | stretch | flex-start | flex-end | center | baseline', i: '否', a: '否',
      n: '只作用于单个 flex / grid 子项，用来覆盖父级的 align-items。',
      v: [
        { v: 'auto', d: '继承父级 align-items' },
        { v: 'flex-end', d: '单独贴到底部' },
        { v: 'center', d: '单独居中' }
      ]
    },
    'align-content': {
      s: 'align-content: stretch | flex-start | center | space-between | space-around', i: '否', a: '否',
      n: '只在"多行"（flex-wrap: wrap 或 grid 多行）时生效。',
      v: [
        { v: 'stretch', d: '行之间拉伸填满（默认）' },
        { v: 'space-between', d: '首行贴顶、末行贴底' },
        { v: 'center', d: '整体居中' }
      ]
    },
    'flex-grow': {
      s: 'flex-grow: <number>', i: '否', a: '是',
      n: '按比例分配"剩余空间"，不是按比例分配总宽度。',
      v: [
        { v: '0', d: '不放大（默认）' },
        { v: '1', d: '均分剩余空间' },
        { v: '3', d: '拿到 3 份剩余空间' }
      ]
    },
    'grid-template-rows': {
      s: 'grid-template-rows: <track-list> | none', i: '否', a: '是',
      n: '配合 grid-template-columns 定义完整骨架；隐式行由 grid-auto-rows 控制。',
      v: [
        { v: '40px 1fr 40px', d: '头 / 主体 / 尾三行' },
        { v: 'repeat(3, minmax(60px, auto))', d: '三行最小 60px' }
      ]
    },
    'grid-auto-flow': {
      s: 'grid-auto-flow: row | column | dense', i: '否', a: '否',
      n: 'dense 会让后面的小项目回填前面的空洞，但可能改变视觉顺序。',
      v: [
        { v: 'row', d: '按行填充（默认）' },
        { v: 'column', d: '按列填充' },
        { v: 'dense', d: '紧凑回填空洞' }
      ]
    },
    'place-items': {
      s: 'place-items: <align-items> <justify-items>', i: '否', a: '否',
      n: 'place-items: center 是 grid 居中的最短写法。',
      v: [
        { v: 'center', d: '两个方向都居中' },
        { v: 'start', d: '都靠起边' },
        { v: 'stretch', d: '都拉伸（默认）' }
      ]
    },
    'backdrop-filter': {
      s: 'backdrop-filter: <filter-function>#', i: '否', a: '是',
      n: '元素自身背景必须半透明才能看到背后的模糊效果。',
      v: [
        { v: 'blur(8px)', d: '毛玻璃' },
        { v: 'saturate(1.4)', d: '提高色彩饱和度' },
        { v: 'blur(8px) saturate(1.4)', d: '组合使用，最常见的玻璃拟态' }
      ]
    },
    'clip-path': {
      s: 'clip-path: circle() | ellipse() | polygon() | inset() | path()', i: '否', a: '是',
      n: '裁剪掉的部分不响应鼠标事件，也参与点击测试。',
      v: [
        { v: 'circle(50%)', d: '圆形裁剪' },
        { v: 'polygon(…)', d: '任意多边形' },
        { v: 'inset(10px round 8px)', d: '矩形内缩并带圆角' }
      ]
    },
    'pointer-events': {
      s: 'pointer-events: auto | none', i: '是', a: '否',
      n: 'none 会让元素"穿透"鼠标事件，但键盘仍可聚焦，注意可访问性。',
      v: [
        { v: 'auto', d: '正常响应' },
        { v: 'none', d: '不响应，事件交给下层元素' }
      ]
    },
    'user-select': {
      s: 'user-select: auto | none | text | all', i: '否', a: '否',
      n: '按钮、标签等交互元素常设 none，避免双击时选中文字。',
      v: [
        { v: 'auto', d: '默认' },
        { v: 'none', d: '不可选中' },
        { v: 'all', d: '一键全选整块内容' }
      ]
    },
    'scroll-behavior': {
      s: 'scroll-behavior: auto | smooth', i: '否', a: '否',
      n: '写在滚动容器或 :root 上；设置了 prefers-reduced-motion 的用户应回退为 auto。',
      v: [
        { v: 'smooth', d: '锚点跳转平滑滚动' },
        { v: 'auto', d: '立即跳转（默认）' }
      ]
    },
    'list-style': {
      s: 'list-style: <type> <position> <image>', i: '是', a: '否',
      n: '设 list-style: none 后，Safari 仍可能保留缩进，需要同时 padding-left: 0。',
      v: [
        { v: 'disc outside', d: '圆点，标记在内容外（默认）' },
        { v: 'square inside', d: '方块，标记在内容内' },
        { v: 'none', d: '去掉标记' }
      ]
    },
    'table-layout': {
      s: 'table-layout: auto | fixed', i: '否', a: '否',
      n: 'fixed 会按第一行（或显式列宽）分配，渲染更快、列宽更稳定。',
      v: [
        { v: 'auto', d: '按内容自动计算列宽' },
        { v: 'fixed', d: '固定算法，超出内容会换行/溢出' }
      ]
    }
  };

  /* 合并进属性对象，缺失的用兜底值 */
  window.CSS_PROPS.forEach(function (p) {
    var m = window.CSS_PROP_META[p.n];
    p.syntax = (m && m.s) || (p.n + ': ' + String(p.v || '').split(' | ')[0] + ';');
    p.inherit = (m && m.i) || '—';
    p.animatable = (m && m.a) || '—';
    p.vals = (m && m.v) || null;
    p.note = (m && m.n) || '';
  });
  window.CSS_PROPS.forEach(function (p) {
    if (p.vals && p.vals.length) return;
    p.vals = String(p.v || '').split('|').map(function (x) { return x.trim(); })
      .filter(Boolean).slice(0, 12).map(function (x) { return { v: x, d: '' }; });
  });

  /* ==========================================================
     常用代码片段
     ========================================================== */
  window.CSS_SNIPPETS = [
    {
      t: '水平垂直居中（Flex）', c: '布局', tags: ['flex', '居中'],
      d: '最通用的一行式居中，容器尺寸变化时依然有效。',
      code: '.center {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  min-height: 200px;\n}'
    },
    {
      t: '水平垂直居中（Grid）', c: '布局', tags: ['grid', '居中'],
      d: '代码最短的写法，place-items 同时控制两个轴。',
      code: '.center {\n  display: grid;\n  place-items: center;\n  min-height: 200px;\n}'
    },
    {
      t: '绝对定位居中', c: '布局', tags: ['position', 'transform'],
      d: '不知道自身尺寸时的经典写法，需父级 position: relative。',
      code: '.parent { position: relative; }\n.child {\n  position: absolute;\n  top: 50%;\n  left: 50%;\n  transform: translate(-50%, -50%);\n}'
    },
    {
      t: '等宽等分 + 固定侧栏', c: '布局', tags: ['flex', 'grid'],
      d: 'flex 用 flex: 1 均分剩余空间；grid 用 200px 1fr 更直观。',
      code: '/* Flex */\n.row { display: flex; gap: 12px; }\n.row > .main { flex: 1; min-width: 0; }\n.row > .side { flex: 0 0 200px; }\n\n/* Grid */\n.layout {\n  display: grid;\n  grid-template-columns: 200px minmax(0, 1fr);\n  gap: 12px;\n}'
    },
    {
      t: '响应式卡片网格', c: '布局', tags: ['grid', '响应式'],
      d: '不用写一行媒体查询，列数随容器宽度自动变化。',
      code: '.cards {\n  display: grid;\n  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));\n  gap: 16px;\n}'
    },
    {
      t: '单行文本截断', c: '排版', tags: ['overflow', '省略号'],
      d: '三件套缺一不可；容器还需要明确的宽度约束。',
      code: '.ellipsis {\n  overflow: hidden;\n  white-space: nowrap;\n  text-overflow: ellipsis;\n  min-width: 0;\n}'
    },
    {
      t: '多行文本截断', c: '排版', tags: ['line-clamp', '省略号'],
      d: '-webkit-line-clamp 已是事实标准，只在需要固定行数时使用。',
      code: '.clamp-3 {\n  display: -webkit-box;\n  -webkit-line-clamp: 3;\n  -webkit-box-orient: vertical;\n  overflow: hidden;\n}'
    },
    {
      t: '流式字号', c: '排版', tags: ['clamp', '响应式'],
      d: '标题在大屏变大、小屏变小，中间连续变化，不会突变。',
      code: 'h1 {\n  font-size: clamp(1.5rem, 1rem + 2vw, 2.6rem);\n  line-height: 1.2;\n}'
    },
    {
      t: '粘性表头 / 侧栏', c: '布局', tags: ['sticky'],
      d: '父级不能有 overflow: hidden，且必须给 top 等阈值。',
      code: '.table thead th {\n  position: sticky;\n  top: 0;\n  z-index: 1;\n  background: var(--bg-soft);\n}'
    },
    {
      t: '隐藏滚动条但保留滚动', c: '交互', tags: ['scrollbar'],
      d: '弹层、横向标签栏常用；注意仍要保留键盘与触控滚动能力。',
      code: '.no-bar {\n  overflow: auto;\n  scrollbar-width: none;\n}\n.no-bar::-webkit-scrollbar { display: none; }'
    },
    {
      t: '自定义滚动条', c: '视觉', tags: ['scrollbar'],
      d: '浅色主题下用半透明拇指更耐看，注意同时给出 hover 反馈。',
      code: '::-webkit-scrollbar { width: 10px; height: 10px; }\n::-webkit-scrollbar-thumb {\n  background: rgba(120,130,150,.45);\n  border-radius: 8px;\n  border: 2px solid transparent;\n  background-clip: padding-box;\n}\n::-webkit-scrollbar-thumb:hover { background: rgba(120,130,150,.7); }'
    },
    {
      t: '清除浮动 / 建立 BFC', c: '布局', tags: ['float', 'bfc'],
      d: '现代写法用 display: flow-root，一行解决高度塌陷。',
      code: '.clearfix { display: flow-root; }\n\n/* 兼容老项目 */\n.clearfix::after {\n  content: "";\n  display: block;\n  clear: both;\n}'
    },
    {
      t: '毛玻璃卡片', c: '视觉', tags: ['backdrop-filter'],
      d: '背景必须半透明，模糊才有"玻璃"质感。',
      code: '.glass {\n  background: rgba(255, 255, 255, .18);\n  backdrop-filter: blur(10px) saturate(1.4);\n  border: 1px solid rgba(255, 255, 255, .35);\n  border-radius: 14px;\n}'
    },
    {
      t: 'CSS 三角形', c: '视觉', tags: ['border', '技巧'],
      d: '用透明边框拼出三角形，不需要图片。',
      code: '.triangle {\n  width: 0;\n  height: 0;\n  border-left: 8px solid transparent;\n  border-right: 8px solid transparent;\n  border-bottom: 12px solid currentColor;\n}'
    },
    {
      t: '骨架屏微光动画', c: '视觉', tags: ['animation', 'loading'],
      d: '渐变背景 + background-position 位移，比整体闪烁更细腻。',
      code: '@keyframes shimmer {\n  from { background-position: 200% 0; }\n  to   { background-position: -200% 0; }\n}\n.skeleton {\n  height: 14px;\n  border-radius: 6px;\n  background: linear-gradient(90deg, #eceff5 25%, #f7f8fc 37%, #eceff5 63%);\n  background-size: 400% 100%;\n  animation: shimmer 1.4s ease-in-out infinite;\n}'
    },
    {
      t: '深浅色主题变量', c: '视觉', tags: ['变量', 'prefers-color-scheme'],
      d: '把颜色收敛成变量，主题切换只需要换一组值。',
      code: ':root {\n  color-scheme: light dark;\n  --bg: #ffffff;\n  --text: #1b2130;\n  --accent: #3b5bdb;\n}\n@media (prefers-color-scheme: dark) {\n  :root {\n    --bg: #0f1219;\n    --text: #e6e9f2;\n    --accent: #7b93ff;\n  }\n}\nbody { background: var(--bg); color: var(--text); }'
    },
    {
      t: '图片等比且不变形', c: '视觉', tags: ['object-fit', 'aspect-ratio'],
      d: '固定比例 + cover 裁切，是列表缩略图的标准做法。',
      code: '.thumb {\n  width: 100%;\n  aspect-ratio: 4 / 3;\n  object-fit: cover;\n  border-radius: 10px;\n  display: block;\n}'
    },
    {
      t: '只给含图片的卡片加样式', c: '技巧', tags: [':has'],
      d: ':has() 让父级可以按子元素状态选择，无需 JS。',
      code: '.card:has(img) {\n  padding-top: 0;\n}\n.card:has(> .badge) .title {\n  color: var(--warn);\n}'
    },

    /* ---------- 第二批：布局 / 排版 ---------- */
    {
      t: '页脚贴底（Sticky Footer）', c: '布局', tags: ['grid', 'dvh'],
      d: 'auto 1fr auto 三行：主区吃掉全部剩余高度，内容再少页脚也贴底。用 dvh 避开移动端地址栏抖动。',
      code: '.page {\n  min-height: 100dvh;\n  display: grid;\n  grid-template-rows: auto 1fr auto;\n}'
    },
    {
      t: '自适应居中容器', c: '布局', tags: ['min()', 'margin-inline'],
      d: '取「上限宽度」与「两侧留白」中的较小值，一行搞定，不需要写媒体查询。',
      code: '.wrap {\n  width: min(1100px, 100% - 32px);\n  margin-inline: auto;\n}'
    },
    {
      t: '横向滚动吸附', c: '布局', tags: ['scroll-snap', 'overflow'],
      d: '轮播 / 横滑卡片必备：mandatory 强制停靠，proximity 只在接近时吸附。',
      code: '.slider {\n  display: flex;\n  gap: 12px;\n  overflow-x: auto;\n  scroll-snap-type: x mandatory;\n}\n.slider > * {\n  flex: none;\n  scroll-snap-align: start;\n}'
    },
    {
      t: '标题平衡换行', c: '排版', tags: ['text-wrap', 'balance'],
      d: '让标题各行长度尽量均匀，不会出现末行只剩一个词的尴尬；只建议用在短标题上。',
      code: '.title {\n  text-wrap: balance;\n  max-width: 30ch;\n}'
    },
    {
      t: '等宽数字对齐', c: '排版', tags: ['font-variant-numeric', 'tabular-nums'],
      d: '价格表、倒计时、数据列表必开：让 1 和 8 占同样宽度，逐行才对得齐。',
      code: '.num {\n  font-variant-numeric: tabular-nums;\n  font-feature-settings: "tnum";\n}'
    },
    {
      t: '首字下沉', c: '排版', tags: ['::first-letter', 'float'],
      d: '杂志感排版：只对第一段生效，用 em 让字号随正文字号缩放。',
      code: '.article > p:first-of-type::first-letter {\n  float: left;\n  font-size: 3.1em;\n  line-height: .86;\n  margin: 3px 8px 0 0;\n  font-weight: 700;\n  color: var(--accent);\n}'
    },

    /* ---------- 第二批：视觉 ---------- */
    {
      t: '渐变文字', c: '视觉', tags: ['background-clip', 'gradient'],
      d: '背景裁到文字上，再把文字设为透明；记得同时写 -webkit- 前缀版本。',
      code: '.grad {\n  background: linear-gradient(90deg, #5c7cfa, #f06595 55%, #f59f00);\n  -webkit-background-clip: text;\n  background-clip: text;\n  color: transparent;\n}'
    },
    {
      t: '渐变描边卡片', c: '视觉', tags: ['mask', 'gradient', 'border-radius'],
      d: '用 mask 把伪元素的「内部」挖掉，只留一圈 padding 当边框，比 border-image 更好控圆角。',
      code: '.ring {\n  position: relative;\n  border-radius: 14px;\n  background: var(--bg-elev);\n}\n.ring::before {\n  content: "";\n  position: absolute;\n  inset: 0;\n  border-radius: inherit;\n  padding: 2px;\n  background: linear-gradient(135deg, #5c7cfa, #22b8cf 50%, #f06595);\n  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);\n  -webkit-mask-composite: xor;\n  mask-composite: exclude;\n  pointer-events: none;\n}'
    },
    {
      t: '分层柔和投影', c: '视觉', tags: ['box-shadow'],
      d: '三层叠加比一层大阴影更自然：近处锐、远处柔，透明度随距离递减。',
      code: '.soft {\n  box-shadow:\n    0 1px 2px rgba(20, 28, 50, .06),\n    0 4px 10px rgba(20, 28, 50, .06),\n    0 12px 28px rgba(20, 28, 50, .08);\n}'
    },
    {
      t: '斑马纹表格', c: '视觉', tags: ['nth-child', 'hover'],
      d: 'odd / even 隔行换色，再叠一条 hover 高亮；注意 hover 规则要写在后面。',
      code: 'tbody tr:nth-child(odd) {\n  background: var(--bg-soft);\n}\ntbody tr:hover {\n  background: var(--accent-soft);\n}'
    },

    /* ---------- 第二批：交互 ---------- */
    {
      t: '悬停上浮卡片', c: '交互', tags: ['transition', 'hover', 'focus-within'],
      d: '位移 + 阴影一起过渡最有质感；带上 :focus-within，键盘用户也能看到反馈。',
      code: '.lift {\n  transition: transform .22s ease, box-shadow .22s ease;\n}\n.lift:hover,\n.lift:focus-within {\n  transform: translateY(-4px);\n  box-shadow: 0 14px 28px rgba(20, 28, 50, .16);\n}'
    },
    {
      t: '表单控件强调色', c: '交互', tags: ['accent-color', '表单'],
      d: '一行 accent-color 让复选框、单选、滑块、进度条统一配色，不用再重画控件。',
      code: ':root {\n  accent-color: #3b5bdb;\n}\ninput[type="range"],\nprogress {\n  accent-color: var(--accent);\n}'
    },
    {
      t: '只在键盘操作时显示焦点环', c: '交互', tags: ['focus-visible', '无障碍'],
      d: '鼠标点击不出现焦点环，Tab 键才出现 —— 兼顾美观与键盘可达性。',
      code: '.focusable:focus-visible {\n  outline: 2px solid var(--accent);\n  outline-offset: 2px;\n}\n.focusable:focus:not(:focus-visible) {\n  outline: none;\n}'
    },

    /* ---------- 第二批：技巧 ---------- */
    {
      t: '容器查询', c: '技巧', tags: ['@container', '响应式'],
      d: '组件按「自己所在容器」的宽度响应，而不是屏幕宽度 —— 同一组件放侧栏和主区能各自变形。',
      code: '.host {\n  container-type: inline-size;\n}\n.card-cq {\n  display: grid;\n  gap: 8px;\n}\n@container (min-width: 340px) {\n  .card-cq {\n    grid-template-columns: 84px 1fr;\n    align-items: center;\n  }\n}'
    },
    {
      t: '原生 CSS 嵌套', c: '技巧', tags: ['nesting', '&'],
      d: '现代浏览器已原生支持 & 嵌套，少写无数重复前缀；别嵌套超过三层。',
      code: '.menu {\n  padding: 8px;\n\n  & ul { margin: 0; padding: 0; }\n\n  & li { list-style: none; }\n\n  & .item {\n    padding: 6px 10px;\n    border-radius: 6px;\n    color: var(--text-soft);\n  }\n\n  & .item:hover {\n    background: var(--accent-soft);\n    color: var(--accent);\n  }\n}'
    },
    {
      t: 'counter 自动编号', c: '技巧', tags: ['counter', '::before'],
      d: '不写死序号也能自动编号，插入 / 删除条目后序号自动重排。',
      code: '.toc {\n  counter-reset: sec;\n}\n.toc .sec {\n  counter-increment: sec;\n}\n.toc .sec::before {\n  content: counter(sec, decimal-leading-zero) " · ";\n  color: var(--accent);\n  font-weight: 700;\n}'
    },
    {
      t: '尊重「减少动效」偏好', c: '技巧', tags: ['prefers-reduced-motion', '无障碍'],
      d: '系统开启「减少动效」时把所有动画降到近乎瞬时；对前庭敏感的用户是必需的。',
      code: '@media (prefers-reduced-motion: reduce) {\n  *, *::before, *::after {\n    animation-duration: .01ms !important;\n    animation-iteration-count: 1 !important;\n    transition-duration: .01ms !important;\n    scroll-behavior: auto !important;\n  }\n}'
    },

    /* ---------- 第二批：动效 ---------- */
    {
      t: '加载环 Spinner', c: '动效', tags: ['animation', 'keyframes', 'loading'],
      d: '只给一条边框上色再旋转，就是最经典的加载指示器；aspect-ratio 保证正圆。',
      code: '@keyframes spin {\n  to { transform: rotate(360deg); }\n}\n.spinner {\n  width: 34px;\n  aspect-ratio: 1;\n  border-radius: 50%;\n  border: 3px solid var(--bg-soft);\n  border-top-color: var(--accent);\n  animation: spin .8s linear infinite;\n}'
    },
    {
      t: '打字机效果', c: '动效', tags: ['steps()', 'animation'],
      d: 'steps() 把宽度动画切成一格一格，配合等宽字体就有打字感；右侧竖线当光标。',
      code: '@keyframes typing {\n  from { width: 0; }\n  to   { width: 100%; }\n}\n@keyframes caret {\n  50% { border-color: transparent; }\n}\n.type {\n  display: inline-block;\n  overflow: hidden;\n  white-space: nowrap;\n  border-right: 2px solid var(--accent);\n  font-family: var(--mono);\n  animation: typing 2.6s steps(26) infinite alternate,\n             caret .6s step-end infinite;\n}'
    },
    {
      t: '呼吸脉冲圆点', c: '动效', tags: ['animation', 'scale', 'delay'],
      d: '「在线」状态指示器的常见做法；多个点错开 animation-delay 就成波浪。',
      code: '@keyframes pulse {\n  0%, 100% { transform: scale(1); opacity: .9; }\n  50%      { transform: scale(1.16); opacity: .4; }\n}\n.dot {\n  width: 12px;\n  aspect-ratio: 1;\n  border-radius: 50%;\n  background: var(--accent);\n  animation: pulse 1.4s ease-in-out infinite;\n}'
    },

    /* ---------- 第三批：布局 / 排版 ---------- */
    {
      t: '圣杯三栏布局', c: '布局', tags: ['grid', '响应式'],
      d: '左右固定、中间自适应；窄屏用媒体查询退回单列。minmax(0, 1fr) 防止长内容撑破列。',
      code: '.holy {\n  display: grid;\n  grid-template-columns: 140px minmax(0, 1fr) 140px;\n  gap: 12px;\n}\n@media (max-width: 460px) {\n  .holy { grid-template-columns: 1fr; }\n}'
    },
    {
      t: '移动端安全区适配', c: '布局', tags: ['env()', 'safe-area', 'max()'],
      d: '刘海屏 / 手势条区域要留白：env() 在普通浏览器里取到 0，用 max() 兜一个最小值。',
      code: '.tabbar {\n  padding: 10px 16px;\n  padding-bottom: calc(10px + env(safe-area-inset-bottom, 0px));\n}\n.safe-x {\n  padding-left: max(16px, env(safe-area-inset-left, 0px));\n  padding-right: max(16px, env(safe-area-inset-right, 0px));\n}'
    },
    {
      t: '等分九宫格', c: '布局', tags: ['grid', 'aspect-ratio'],
      d: 'repeat(3, 1fr) 等分列，再用 aspect-ratio: 1 让每个格子保持正方形。',
      code: '.grid9 {\n  display: grid;\n  grid-template-columns: repeat(3, 1fr);\n  gap: 8px;\n}\n.grid9 > div {\n  aspect-ratio: 1;\n  display: grid;\n  place-items: center;\n}'
    },
    {
      t: '竖排文字', c: '排版', tags: ['writing-mode'],
      d: '日文 / 古诗竖排、侧边书脊标题常用；数字与拉丁字母用 text-orientation 控制方向。',
      code: '.vertical {\n  writing-mode: vertical-rl;\n  text-orientation: mixed;\n  letter-spacing: .12em;\n  height: 150px;\n}'
    },
    {
      t: '长单词 / URL 断行', c: '排版', tags: ['overflow-wrap', 'hyphens'],
      d: '长串英文或链接会撑破容器；anywhere 允许任意处断行，hyphens 在支持的语言里加连字符。',
      code: '.break {\n  overflow-wrap: anywhere;\n  hyphens: auto;\n}'
    },

    /* ---------- 第三批：视觉 ---------- */
    {
      t: '文字描边', c: '视觉', tags: ['-webkit-text-stroke'],
      d: '镂空字：把填充设为透明只留描边。注意是 -webkit- 前缀属性，但各浏览器都支持。',
      code: '.stroke {\n  color: transparent;\n  -webkit-text-stroke: 1.5px var(--accent);\n}'
    },
    {
      t: '斜切 / 多边形色块', c: '视觉', tags: ['clip-path', 'polygon'],
      d: '用 polygon 裁出斜边，做 Banner、价格标签比背景图省事；坐标用百分比才能自适应。',
      code: '.slanted {\n  clip-path: polygon(0 0, 100% 0, 100% 82%, 0 100%);\n  background: linear-gradient(135deg, #5c7cfa, #22b8cf);\n}'
    },
    {
      t: '点阵 / 网格背景', c: '视觉', tags: ['background-image', 'radial-gradient'],
      d: '一个 radial-gradient + background-size 就能铺出点阵；改成 linear-gradient 就是网格纸。',
      code: '.dots {\n  background-image: radial-gradient(var(--border-st) 1px, transparent 1px);\n  background-size: 14px 14px;\n}'
    },
    {
      t: '头像堆叠', c: '视觉', tags: ['margin', 'border-radius'],
      d: '负 margin 让头像叠起来，再用与背景同色的 border 压出分隔线；第一个不偏移。',
      code: '.avatars { display: flex; }\n.avatars > * {\n  width: 34px;\n  height: 34px;\n  border-radius: 50%;\n  border: 2px solid var(--bg-elev);\n  margin-left: -10px;\n}\n.avatars > :first-child { margin-left: 0; }'
    },
    {
      t: '图片灰度 → 彩色', c: '视觉', tags: ['filter', 'transition'],
      d: '列表默认灰、悬停还原：一层 filter 搞定，不用准备两张图。',
      code: '.photo img {\n  filter: grayscale(1) contrast(1.05);\n  transition: filter .3s ease;\n}\n.photo img:hover,\n.photo img:focus-visible {\n  filter: none;\n}'
    },

    /* ---------- 第三批：交互 ---------- */
    {
      t: '纯 CSS 提示气泡', c: '交互', tags: ['attr()', '::after', 'hover'],
      d: '内容取自 data-tip 属性，改文案不用动 CSS；记得加 pointer-events: none 避免挡住点击。',
      code: '.tip2 { position: relative; }\n.tip2::after {\n  content: attr(data-tip);\n  position: absolute;\n  left: 50%;\n  bottom: calc(100% + 8px);\n  transform: translateX(-50%);\n  padding: 5px 9px;\n  border-radius: 6px;\n  background: var(--text);\n  color: var(--bg-elev);\n  font-size: 12px;\n  white-space: nowrap;\n  opacity: 0;\n  pointer-events: none;\n  transition: opacity .18s;\n}\n.tip2:hover::after,\n.tip2:focus-visible::after { opacity: 1; }'
    },
    {
      t: '自定义复选框', c: '交互', tags: ['appearance', ':checked', '::after'],
      d: 'appearance: none 抹掉原生样式后用 ::after 画勾；:checked 与 :focus-visible 都要照顾。',
      code: '.cbx {\n  appearance: none;\n  width: 18px;\n  height: 18px;\n  border: 2px solid var(--border-st);\n  border-radius: 5px;\n  display: grid;\n  place-content: center;\n  cursor: pointer;\n}\n.cbx:checked {\n  background: var(--accent);\n  border-color: var(--accent);\n}\n.cbx:checked::after {\n  content: "";\n  width: 5px;\n  height: 9px;\n  border: solid #fff;\n  border-width: 0 2px 2px 0;\n  transform: rotate(45deg) translate(-1px, -1px);\n}'
    },
    {
      t: '浮动标签输入框', c: '交互', tags: [':placeholder-shown', '表单'],
      d: '靠 :placeholder-shown 判断有无内容；placeholder 必须写成一个空格，否则选择器不生效。',
      code: '.field { position: relative; }\n.field input { padding: 17px 10px 7px; }\n.field label {\n  position: absolute;\n  left: 11px;\n  top: 15px;\n  font-size: 12.5px;\n  color: var(--text-dim);\n  transition: top .18s, font-size .18s, color .18s;\n  pointer-events: none;\n}\n.field input:focus + label,\n.field input:not(:placeholder-shown) + label {\n  top: 4px;\n  font-size: 10.5px;\n  color: var(--accent);\n}'
    },
    {
      t: '平滑滚动与锚点避让', c: '交互', tags: ['scroll-behavior', 'scroll-margin-top'],
      d: '锚点跳转默认会被固定顶栏遮住，给目标加 scroll-margin-top 留出空间；别忘了 reduced-motion 回退。',
      code: 'html {\n  scroll-behavior: smooth;\n}\n[id] {\n  scroll-margin-top: 72px;\n}\n@media (prefers-reduced-motion: reduce) {\n  html { scroll-behavior: auto; }\n}'
    },

    /* ---------- 第三批：技巧 ---------- */
    {
      t: ':is() 与 :where() 简写', c: '技巧', tags: [':is', ':where', '特异性'],
      d: '两者都能把一长串选择器收成一组；区别是 :is 取组内最高权重，:where 权重恒为 0（好覆盖）。',
      code: ':is(h1, h2, h3) {\n  line-height: 1.25;\n}\n/* 权重为 0，随时能被后面的普通规则覆盖 */\n:where(ul, ol) :where(ul, ol) {\n  margin-block: 0;\n}'
    },
    {
      t: '@layer 分层管理', c: '技巧', tags: ['@layer', '层叠'],
      d: '先声明层的顺序，之后怎么写都不怕被覆盖：层顺序优先于书写顺序，比堆 !important 干净得多。',
      code: '@layer base, components, utilities;\n\n@layer base {\n  .btnx { display: inline-block; font: inherit; border: 0; }\n}\n@layer components {\n  .btnx { padding: 8px 16px; border-radius: 8px; background: var(--bg-soft); }\n}\n@layer utilities {\n  .btnx { background: var(--accent); color: #fff; }\n}'
    },
    {
      t: 'sr-only 无障碍隐藏', c: '技巧', tags: ['clip-path', '无障碍', 'sr-only'],
      d: '视觉上隐藏、读屏仍能朗读 —— 图标按钮必须有它。不要用 display: none，那会连读屏一起藏掉。',
      code: '.sr-only {\n  position: absolute;\n  width: 1px;\n  height: 1px;\n  padding: 0;\n  margin: -1px;\n  overflow: hidden;\n  clip-path: inset(50%);\n  white-space: nowrap;\n  border: 0;\n}'
    },

    /* ---------- 第三批：动效 ---------- */
    {
      t: '渐变背景流动', c: '动效', tags: ['animation', 'background-position'],
      d: '渐变宽度设为 200%，靠 background-position 平移做出流光；首尾同色才看不出接缝。',
      code: '@keyframes flow {\n  to { background-position: 200% 50%; }\n}\n.flow {\n  background: linear-gradient(90deg, #5c7cfa, #22b8cf, #f06595, #5c7cfa);\n  background-size: 200% 100%;\n  animation: flow 6s linear infinite;\n}'
    },
    {
      t: '卡片翻转', c: '动效', tags: ['transform', 'preserve-3d', 'backface-visibility'],
      d: '3D 翻转三件套：父级 perspective、内层 preserve-3d、两面 backface-visibility: hidden。',
      code: '.flip { perspective: 800px; }\n.flip-inner {\n  transition: transform .6s ease;\n  transform-style: preserve-3d;\n}\n.flip:hover .flip-inner,\n.flip:focus-within .flip-inner {\n  transform: rotateY(180deg);\n}\n.flip-face { backface-visibility: hidden; }\n.flip-back { transform: rotateY(180deg); }'
    },
    {
      t: '不确定进度条', c: '动效', tags: ['animation', '::after', 'overflow'],
      d: '不知道还要多久时的加载条：一条 34% 宽的光块在容器里来回跑，父级记得裁掉溢出。',
      code: '@keyframes slide {\n  from { transform: translateX(-100%); }\n  to   { transform: translateX(300%); }\n}\n.bar {\n  position: relative;\n  overflow: hidden;\n  height: 6px;\n  border-radius: 999px;\n  background: var(--bg-soft);\n}\n.bar::after {\n  content: "";\n  position: absolute;\n  inset: 0;\n  width: 34%;\n  border-radius: inherit;\n  background: var(--accent);\n  animation: slide 1.1s ease-in-out infinite;\n}'
    }
  ];
  /* ------------------------------------------------------------
     代码片段的「效果」演示
     key = CSS_SNIPPETS 里的标题；css 直接复用片段本身，
     html 里用 <style> 写辅助样式（只为让效果看得见），
     需要交互时再补 js。
     ------------------------------------------------------------ */
  var IMG_TALL = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='480' height='720'>" +
    "<defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>" +
    "<stop offset='0' stop-color='%233b5bdb'/><stop offset='1' stop-color='%2322b8cf'/></linearGradient></defs>" +
    "<rect width='480' height='720' fill='url(%23g)'/>" +
    "<circle cx='240' cy='250' r='110' fill='%23ffffff' opacity='.9'/>" +
    "<path d='M0 560 L160 430 L300 540 L480 440 L480 720 L0 720 Z' fill='%23ffffff' opacity='.62'/></svg>";
  var IMG_WIDE = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='160'>" +
    "<rect width='400' height='160' fill='%233b5bdb'/>" +
    "<circle cx='80' cy='80' r='34' fill='%23ffffff' opacity='.9'/>" +
    "<rect x='140' y='62' width='200' height='14' rx='7' fill='%23ffffff' opacity='.85'/>" +
    "<rect x='140' y='90' width='140' height='12' rx='6' fill='%23ffffff' opacity='.55'/></svg>";

  window.CSS_SNIPPET_DEMOS = {
    '水平垂直居中（Flex）': {
      html: [
        '<style>',
        '  /* 辅助样式：只为让效果看得见 */',
        '  .box { padding: 14px 20px; border-radius: 10px; background: var(--accent-soft);',
        '         color: var(--accent); font-weight: 600; }',
        '</style>',
        '<div class="center">',
        '  <div class="box">我被水平垂直居中了</div>',
        '</div>'
      ].join('\n')
    },
    '水平垂直居中（Grid）': {
      html: [
        '<style>',
        '  .box { padding: 14px 20px; border-radius: 10px; background: var(--accent-soft);',
        '         color: var(--accent); font-weight: 600; }',
        '</style>',
        '<div class="center">',
        '  <div class="box">place-items: center 一行搞定</div>',
        '</div>'
      ].join('\n')
    },
    '绝对定位居中': {
      html: [
        '<style>',
        '  .parent { height: 190px; border: 1px dashed var(--border-st); border-radius: 10px;',
        '            background: var(--bg-soft); }',
        '  .box { padding: 12px 18px; border-radius: 8px; background: var(--accent);',
        '         color: #fff; font-weight: 600; }',
        '</style>',
        '<div class="parent">',
        '  <div class="child box">不需要知道自身尺寸</div>',
        '</div>'
      ].join('\n')
    },
    '等宽等分 + 固定侧栏': {
      html: [
        '<style>',
        '  .bar { padding: 12px 10px; border-radius: 8px; text-align: center; font-size: 12.5px;',
        '         background: var(--accent-soft); color: var(--accent); font-weight: 600; }',
        '  .bar.soft { background: var(--bg-soft); color: var(--text-soft); font-weight: 400; }',
        '  .gap { height: 14px; }',
        '</style>',
        '<div class="row">',
        '  <div class="side bar">侧栏 200px</div>',
        '  <div class="main bar soft">主内容 flex: 1</div>',
        '</div>',
        '<div class="gap"></div>',
        '<div class="layout">',
        '  <div class="bar">侧栏 200px</div>',
        '  <div class="bar soft">主内容 minmax(0, 1fr)</div>',
        '</div>'
      ].join('\n')
    },
    '响应式卡片网格': {
      html: [
        '<style>',
        '  .c { padding: 16px; border-radius: 10px; background: var(--bg-soft);',
        '      border: 1px solid var(--border); font-size: 12.5px; text-align: center; }',
        '</style>',
        '<div class="cards">',
        '  <div class="c">卡片 1</div>',
        '  <div class="c">卡片 2</div>',
        '  <div class="c">卡片 3</div>',
        '  <div class="c">卡片 4</div>',
        '  <div class="c">卡片 5</div>',
        '  <div class="c">卡片 6</div>',
        '</div>'
      ].join('\n')
    },
    '单行文本截断': {
      html: [
        '<style>',
        '  .wrap { padding: 9px 11px; border: 1px dashed var(--border-st); border-radius: 8px;',
        '          background: var(--bg-soft); }',
        '</style>',
        '<div class="wrap">',
        '  <div class="ellipsis">这是一段非常长的标题文本，用来演示单行截断：超出容器的部分会被省略号代替，而不会换行撑高容器</div>',
        '</div>'
      ].join('\n')
    },
    '多行文本截断': {
      html: [
        '<style>',
        '  .wrap { padding: 9px 11px; border: 1px dashed var(--border-st); border-radius: 8px;',
        '          background: var(--bg-soft); }',
        '</style>',
        '<div class="wrap">',
        '  <div class="clamp-3">多行截断常用于列表摘要：这段文字故意写得很长很长，',
        '    超过三行之后就会被裁剪并补上省略号，卡片高度因此保持一致。',
        '    注意 -webkit-line-clamp 必须配合 display: -webkit-box 与 -webkit-box-orient: vertical 使用，',
        '    否则在部分浏览器里不会生效。再多写几句，确认第四行确实被裁掉了。</div>',
        '</div>'
      ].join('\n')
    },
    '流式字号': {
      html: [
        '<h1>流式字号标题</h1>',
        '<p style="font-size:12.5px;color:var(--text-dim)">clamp(最小值, 理想值, 最大值)：缩放窗口或拖动预览区边缘，',
        '字号会在 1.5rem ~ 2.6rem 之间连续变化，不会突变。</p>'
      ].join('\n')
    },
    '粘性表头 / 侧栏': {
      html: [
        '<style>',
        '  .scroll { max-height: 170px; overflow: auto; border: 1px solid var(--border); border-radius: 8px; }',
        '  .table { width: 100%; border-collapse: separate; border-spacing: 0; font-size: 12.5px; }',
        '  .table th, .table td { padding: 7px 10px; text-align: left; }',
        '  .table td { border-bottom: 1px solid var(--border); }',
        '</style>',
        '<div class="scroll">',
        '  <table class="table">',
        '    <thead><tr><th>属性</th><th>分类</th></tr></thead>',
        '    <tbody>',
        '      <tr><td>display</td><td>盒模型</td></tr>',
        '      <tr><td>margin</td><td>盒模型</td></tr>',
        '      <tr><td>padding</td><td>盒模型</td></tr>',
        '      <tr><td>border-radius</td><td>边框</td></tr>',
        '      <tr><td>gap</td><td>Flex</td></tr>',
        '      <tr><td>justify-content</td><td>Flex</td></tr>',
        '      <tr><td>grid-template-columns</td><td>Grid</td></tr>',
        '      <tr><td>position</td><td>定位</td></tr>',
        '      <tr><td>transition</td><td>动画</td></tr>',
        '      <tr><td>animation</td><td>动画</td></tr>',
        '    </tbody>',
        '  </table>',
        '</div>',
        '<p style="font-size:11.5px;color:var(--text-dim);margin:8px 0 0">向下滚动：表头会吸附在容器顶部。</p>'
      ].join('\n')
    },
    '隐藏滚动条但保留滚动': {
      html: [
        '<style>',
        '  .tags { display: flex; gap: 8px; padding: 2px 0 6px; }',
        '  .tags > span { flex: none; padding: 5px 12px; border-radius: 999px; font-size: 12px;',
        '                 background: var(--accent-soft); color: var(--accent); }',
        '</style>',
        '<div class="no-bar tags">',
        '  <span>HTML</span><span>CSS</span><span>JavaScript</span><span>Flexbox</span>',
        '  <span>Grid</span><span>动画</span><span>响应式</span><span>无障碍</span><span>性能</span>',
        '</div>',
        '<p style="font-size:11.5px;color:var(--text-dim);margin:0">横向滑动：可以滚动（鼠标滚轮 / 触控板 / 触摸），但看不到滚动条。</p>'
      ].join('\n')
    },
    '自定义滚动条': {
      html: [
        '<style>',
        '  .box { height: 158px; overflow: auto; padding: 10px 12px; font-size: 12.5px;',
        '        border: 1px solid var(--border); border-radius: 8px; background: var(--bg-elev); }',
        '  .box p { margin: 0 0 10px; }',
        '</style>',
        '<div class="box">',
        '  <p>滚动条样式来自片段里的 ::-webkit-scrollbar 系列规则。</p>',
        '  <p>它只在 Chromium 与 Safari 生效；Firefox 请用 scrollbar-width / scrollbar-color。</p>',
        '  <p>把鼠标移到滚动条上，透明度会加深，这是 :hover 规则的作用。</p>',
        '  <p>border: 2px solid transparent + background-clip: padding-box 的组合，',
        '     能让拇指与轨道之间留出空隙，视觉上更精致。</p>',
        '  <p>再往下滚一点，确认到底部时滚动条依然正常。</p>',
        '  <p>最后一行：自定义滚动条不应该牺牲可见性，颜色对比度要够。</p>',
        '</div>'
      ].join('\n')
    },
    '清除浮动 / 建立 BFC': {
      html: [
        '<style>',
        '  .fl { float: left; width: 88px; height: 60px; margin: 0 10px 10px 0; border-radius: 8px;',
        '        background: var(--accent-soft); color: var(--accent); font-size: 12px;',
        '        display: grid; place-items: center; }',
        '  .after { padding: 8px 10px; border-radius: 8px; background: var(--bg-soft); font-size: 12.5px; }',
        '</style>',
        '<div class="clearfix">',
        '  <div class="fl">浮动 A</div>',
        '  <div class="fl">浮动 B</div>',
        '  <div class="fl">浮动 C</div>',
        '</div>',
        '<div class="after">这段文字在浮动元素之后：父级用了 display: flow-root 建立 BFC，',
        '高度没有塌陷，也就不会被浮动元素盖住。</div>'
      ].join('\n')
    },
    '毛玻璃卡片': {
      html: [
        '<style>',
        '  .scene { position: relative; padding: 26px 20px; border-radius: 16px; overflow: hidden;',
        '           background: linear-gradient(135deg, #5c7cfa, #22b8cf 48%, #f06595); }',
        '  .scene::before, .scene::after { content: ""; position: absolute; border-radius: 50%; }',
        '  .scene::before { width: 120px; height: 120px; left: -18px; top: -28px; background: rgba(255,255,255,.55); }',
        '  .scene::after { width: 150px; height: 150px; right: -26px; bottom: -46px; background: rgba(255,214,102,.75); }',
        '  .glass { position: relative; padding: 16px 18px; color: #fff; }',
        '  .glass b { font-size: 14px; }',
        '  .glass p { margin: 6px 0 0; font-size: 12.3px; opacity: .92; line-height: 1.55; }',
        '</style>',
        '<div class="scene">',
        '  <div class="glass">',
        '    <b>毛玻璃卡片</b>',
        '    <p>backdrop-filter 会模糊卡片背后的渐变与色块，常用于顶部导航、浮层与侧边栏。',
        '       注意父级不能有 overflow: hidden 之外的裁剪，且需要备好半透明底色。</p>',
        '  </div>',
        '</div>'
      ].join('\n')
    },
    'CSS 三角形': {
      html: [
        '<style>',
        '  .tip { position: relative; display: inline-block; margin: 4px 0 20px; padding: 9px 13px;',
        '         border-radius: 8px; background: var(--text); color: var(--bg-elev); font-size: 12.5px; }',
        '  .tip .triangle { position: absolute; left: 50%; bottom: -12px; margin-left: -8px;',
        '                   color: var(--text); }',
        '</style>',
        '<div class="tip">提示气泡<span class="triangle"></span></div>',
        '<p style="font-size:11.5px;color:var(--text-dim);margin:0">三角形其实是一个宽高为 0 的元素，',
        '靠左右透明边框 + 底部实色边框“挤”出来；颜色用 currentColor，跟随文字色变化。</p>'
      ].join('\n')
    },
    '骨架屏微光动画': {
      html: [
        '<style>',
        '  .sk { display: grid; gap: 9px; }',
        '  .sk-row { display: flex; gap: 10px; align-items: center; }',
        '  .avatar { width: 38px; height: 38px; border-radius: 50%; flex: none;',
        '            background: linear-gradient(90deg, #eceff5 25%, #f7f8fc 37%, #eceff5 63%);',
        '            background-size: 400% 100%; animation: shimmer 1.4s ease-in-out infinite; }',
        '</style>',
        '<div class="sk">',
        '  <div class="sk-row"><div class="avatar"></div><div class="skeleton" style="flex:1"></div></div>',
        '  <div class="skeleton" style="width: 88%"></div>',
        '  <div class="skeleton" style="width: 96%"></div>',
        '  <div class="skeleton" style="width: 62%"></div>',
        '</div>',
        '<p style="font-size:11.5px;color:var(--text-dim);margin:10px 0 0">真实列表加载时的占位：',
        '背景是 400% 宽的渐变，靠 background-position 平移做出微光掠过的效果。</p>'
      ].join('\n')
    },
    '深浅色主题变量': {
      html: [
        '<style>',
        '  .theme-card { padding: 14px 16px; border-radius: 10px; border: 1px solid var(--accent);',
        '                background: var(--bg); color: var(--text); }',
        '  .theme-card b { color: var(--accent); }',
        '  .theme-card .tip { font-size: 12.3px; margin-top: 6px; opacity: .9; }',
        '</style>',
        '<div class="theme-card">',
        '  <b>卡片颜色全部来自 CSS 变量</b>',
        '  <div class="tip">当前系统配色：<span id="scheme">检测中…</span></div>',
        '</div>'
      ].join('\n'),
      js: [
        'var el = document.getElementById("scheme");',
        'var mq = window.matchMedia("(prefers-color-scheme: dark)");',
        'function show() {',
        '  var dark = mq.matches;',
        '  el.textContent = dark ? "深色 dark" : "浅色 light";',
        '  console.log("prefers-color-scheme =", dark ? "dark" : "light",',
        '    "| --bg =", getComputedStyle(document.documentElement).getPropertyValue("--bg").trim());',
        '}',
        'show();',
        'if (mq.addEventListener) mq.addEventListener("change", show);',
        'console.log("切换操作系统的深浅色，这段 CSS 会自动生效");'
      ].join('\n')
    },
    '图片等比且不变形': {
      html: [
        '<style>',
        '  .flex { display: flex; gap: 12px; }',
        '  .shot { flex: 1 1 0; min-width: 0; }',
        '  .cap { font-size: 11.5px; color: var(--text-dim); margin-top: 6px; line-height: 1.5; }',
        '  .thumb.stretched { object-fit: fill; }',
        '</style>',
        '<div class="flex">',
        '  <div class="shot">',
        '    <img class="thumb" alt="示例图" src="' + IMG_TALL + '">',
        '    <div class="cap">object-fit: cover —— 按比例裁切，不变形</div>',
        '  </div>',
        '  <div class="shot">',
        '    <img class="thumb stretched" alt="示例图" src="' + IMG_TALL + '">',
        '    <div class="cap">对照：object-fit: fill —— 图片被拉伸变形</div>',
        '  </div>',
        '</div>'
      ].join('\n')
    },
    '只给含图片的卡片加样式': {
      html: [
        '<style>',
        '  .cardview { display: grid; gap: 10px; }',
        '  .card { border: 1px solid var(--border); border-radius: 10px; background: var(--bg-elev);',
        '          padding: 14px; }',
        '  .card img { display: block; width: 100%; border-radius: 8px; margin-bottom: 8px; }',
        '  .title { font-size: 13px; font-weight: 600; }',
        '  .badge { display: inline-block; font-size: 10.5px; padding: 1px 8px; border-radius: 999px;',
        '           background: var(--warn-soft); color: var(--warn); margin-bottom: 6px; }',
        '</style>',
        '<div class="cardview">',
        '  <div class="card">',
        '    <img alt="" src="' + IMG_WIDE + '">',
        '    <div class="title">含图片 → padding-top 被归零</div>',
        '  </div>',
        '  <div class="card">',
        '    <span class="badge">NEW</span>',
        '    <div class="title">含 .badge → 标题变成警告色</div>',
        '  </div>',
        '  <div class="card">',
        '    <div class="title">普通卡片 → 两条规则都不命中</div>',
        '  </div>',
        '</div>'
      ].join('\n')
    },

    /* ---------- 第二批：布局 / 排版 ---------- */
    '页脚贴底（Sticky Footer）': {
      html: [
        '<style>',
        '  body { padding: 0; }',
        '  .page > header { padding: 9px 16px; background: var(--accent); color: #fff; font-size: 12.5px; }',
        '  .page > main { padding: 14px 16px; font-size: 12.5px; color: var(--text-soft); line-height: 1.6; }',
        '  .page > footer { padding: 9px 16px; background: var(--bg-soft); font-size: 12.5px;',
        '                   color: var(--text-dim); border-top: 1px solid var(--border); }',
        '</style>',
        '<div class="page">',
        '  <header>页头（auto 行）</header>',
        '  <main>主内容只有这一句话，高度远不够撑满屏幕，但 1fr 会把剩余空间全吃掉，',
        '        所以页脚依然贴在底部，而不是吊在文字下面。</main>',
        '  <footer>页脚（auto 行，始终贴底）</footer>',
        '</div>'
      ].join('\n')
    },
    '自适应居中容器': {
      html: [
        '<style>',
        '  body { padding: 0; }',
        '  .track { padding: 14px 0; border-radius: 10px;',
        '           background: repeating-linear-gradient(45deg, var(--bg-soft) 0 10px, var(--bg-elev) 10px 20px); }',
        '  .wrap { padding: 12px 14px; border: 1px dashed var(--accent); border-radius: 8px;',
        '         background: var(--accent-soft); color: var(--accent); font-size: 12.5px; }',
        '</style>',
        '<div class="track">',
        '  <div class="wrap">无论外面多宽，两侧都留 16px；超过 1100px 后宽度封顶并居中。',
        '      拖动预览区左右边缘就能看到它先变宽、再封顶的过程。</div>',
        '</div>'
      ].join('\n')
    },
    '横向滚动吸附': {
      html: [
        '<style>',
        '  .slider { padding: 4px 4px 10px; }',
        '  .slide { width: 168px; height: 92px; border-radius: 10px; display: grid; place-items: center;',
        '           font-size: 13px; font-weight: 700; color: #fff; }',
        '  .slide:nth-child(3n+1) { background: linear-gradient(135deg, #5c7cfa, #22b8cf); }',
        '  .slide:nth-child(3n+2) { background: linear-gradient(135deg, #f06595, #f59f00); }',
        '  .slide:nth-child(3n)   { background: linear-gradient(135deg, #20c997, #5c7cfa); }',
        '</style>',
        '<div class="slider">',
        '  <div class="slide">01</div>',
        '  <div class="slide">02</div>',
        '  <div class="slide">03</div>',
        '  <div class="slide">04</div>',
        '  <div class="slide">05</div>',
        '  <div class="slide">06</div>',
        '</div>',
        '<p style="font-size:11.5px;color:var(--text-dim);margin:0">横向滚动（滚轮 / 触控板 / 触摸拖动）：',
        '松手后会自动停靠到最近的卡片起始边。</p>'
      ].join('\n')
    },
    '标题平衡换行': {
      html: [
        '<style>',
        '  .cmp { display: grid; gap: 14px; }',
        '  .cmp .hd { font-size: 11.5px; color: var(--text-dim); margin-bottom: 4px; }',
        '  .cmp h3 { font-size: 17px; margin: 0; line-height: 1.35; }',
        '  .cmp h3.off { text-wrap: wrap; }',
        '</style>',
        '<div class="cmp">',
        '  <div>',
        '    <div class="hd">默认 wrap —— 末行常常只剩一两个词</div>',
        '    <h3 class="title off">用一行 CSS 让长标题的每一行长度尽量均衡</h3>',
        '  </div>',
        '  <div>',
        '    <div class="hd">text-wrap: balance —— 浏览器自动重排行长</div>',
        '    <h3 class="title">用一行 CSS 让长标题的每一行长度尽量均衡</h3>',
        '  </div>',
        '</div>'
      ].join('\n')
    },
    '等宽数字对齐': {
      html: [
        '<style>',
        '  .cmp { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; font-size: 13px; }',
        '  .cmp .hd { font-size: 11.5px; color: var(--text-dim); margin-bottom: 6px; }',
        '  .cmp div.row { line-height: 1.9; }',
        '  .cmp b { font-weight: 700; color: var(--accent); }',
        '</style>',
        '<div class="cmp">',
        '  <div>',
        '    <div class="hd">默认：1 和 8 宽度不同，后面的字对不齐</div>',
        '    <div class="row"><b>111</b> 件</div>',
        '    <div class="row"><b>888</b> 件</div>',
        '    <div class="row"><b>000</b> 件</div>',
        '  </div>',
        '  <div class="num">',
        '    <div class="hd">tabular-nums：每个数字占同样宽度</div>',
        '    <div class="row"><b>111</b> 件</div>',
        '    <div class="row"><b>888</b> 件</div>',
        '    <div class="row"><b>000</b> 件</div>',
        '  </div>',
        '</div>',
        '<p style="font-size:11.5px;color:var(--text-dim);margin:10px 0 0">价格表、倒计时、统计列表建议整块开启；',
        '标题和大字号正文一般不需要。</p>'
      ].join('\n')
    },
    '首字下沉': {
      html: [
        '<style>',
        '  .article { font-size: 12.6px; line-height: 1.75; color: var(--text-soft); }',
        '  .article p { margin: 0 0 8px; }',
        '</style>',
        '<div class="article">',
        '  <p>首字下沉是杂志排版的经典手法，用 ::first-letter 选中第一个字，',
        '     再用 float 让后续文字环绕它。字号用 em，这样正文字号变化时首字母会同步缩放。</p>',
        '  <p>第二段不会受影响 —— 选择器里写了 :first-of-type，只对第一段生效。',
        '     如果想给每一段都加，把 :first-of-type 去掉即可。</p>',
        '</div>'
      ].join('\n')
    },

    /* ---------- 第二批：视觉 ---------- */
    '渐变文字': {
      html: [
        '<style>',
        '  .stage { padding: 18px 4px; text-align: center; }',
        '  .grad { font-size: 28px; font-weight: 800; letter-spacing: .5px; }',
        '</style>',
        '<div class="stage"><span class="grad">渐变文字 Gradient</span></div>',
        '<p style="font-size:11.5px;color:var(--text-dim);margin:0">文字必须设为 transparent，',
        '否则会盖住背景；不支持 background-clip: text 的浏览器会看到「透明的字」，',
        '正式项目里可以用 @supports 做回退。</p>'
      ].join('\n')
    },
    '渐变描边卡片': {
      html: [
        '<style>',
        '  .ring { padding: 14px 16px; font-size: 12.5px; color: var(--text-soft); line-height: 1.6; }',
        '  .ring b { display: block; color: var(--text); font-size: 13px; margin-bottom: 5px; }',
        '</style>',
        '<div class="ring">',
        '  <b>渐变描边卡片</b>',
        '  伪元素铺满整块并铺上渐变，再用 mask 把 content-box 区域挖掉，',
        '  剩下的那一圈 padding 就是「边框」。圆角用 border-radius: inherit 跟着父级走。',
        '</div>',
        '<p style="font-size:11.5px;color:var(--text-dim);margin:10px 0 0">要点：padding 决定边框粗细；',
        'pointer-events: none 保证不挡住里面的点击。</p>'
      ].join('\n')
    },
    '分层柔和投影': {
      html: [
        '<style>',
        '  .row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }',
        '  .sh { padding: 14px; border-radius: 12px; background: var(--bg-elev); font-size: 12.2px;',
        '        color: var(--text-soft); }',
        '  .sh b { display: block; color: var(--text); font-size: 12.5px; margin-bottom: 5px; }',
        '  .one { box-shadow: 0 12px 28px rgba(20, 28, 50, .18); }',
        '</style>',
        '<div class="row">',
        '  <div class="sh one"><b>单层大阴影</b>边缘偏硬，像贴纸浮在纸上，距离感不真实。</div>',
        '  <div class="sh soft"><b>三层叠加</b>近处 1px、中距 4px、远处 12px，透明度递减，',
        '看起来更像是被柔光托起来。</div>',
        '</div>'
      ].join('\n')
    },
    '斑马纹表格': {
      html: [
        '<style>',
        '  .tbl { width: 100%; border-collapse: collapse; font-size: 12.5px; }',
        '  .tbl th, .tbl td { padding: 6px 10px; text-align: left; }',
        '  .tbl thead th { color: var(--text-dim); font-size: 11.5px; font-weight: 600;',
        '                  border-bottom: 1px solid var(--border-st); }',
        '</style>',
        '<table class="tbl">',
        '  <thead><tr><th>属性</th><th>分类</th><th>可动画</th></tr></thead>',
        '  <tbody>',
        '    <tr><td>display</td><td>盒模型</td><td>否</td></tr>',
        '    <tr><td>gap</td><td>Flex / Grid</td><td>是</td></tr>',
        '    <tr><td>transform</td><td>动画</td><td>是</td></tr>',
        '    <tr><td>opacity</td><td>视觉</td><td>是</td></tr>',
        '    <tr><td>position</td><td>定位</td><td>否</td></tr>',
        '  </tbody>',
        '</table>',
        '<p style="font-size:11.5px;color:var(--text-dim);margin:8px 0 0">把鼠标移到任意一行：',
        'hover 背景会盖掉斑马纹（因为写在后面且同权重）。</p>'
      ].join('\n')
    },

    /* ---------- 第二批：交互 ---------- */
    '悬停上浮卡片': {
      html: [
        '<style>',
        '  .row3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }',
        '  .lift { padding: 13px; border-radius: 12px; background: var(--bg-elev);',
        '         border: 1px solid var(--border); font-size: 12.3px; color: var(--text-soft); }',
        '  .lift b { display: block; color: var(--text); font-size: 12.6px; margin-bottom: 4px; }',
        '  .lift a { color: var(--accent); }',
        '</style>',
        '<div class="row3">',
        '  <div class="lift" tabindex="0"><b>把鼠标移上来</b>整块会抬起 4px，阴影同时加深。</div>',
        '  <div class="lift" tabindex="0"><b>也可以 Tab 聚焦</b>:focus-within 让键盘用户看到同样反馈。</div>',
        '  <div class="lift" tabindex="0"><b>只过渡两个属性</b>transform 与 box-shadow 都是合成属性，',
        '不会触发重排。</div>',
        '</div>'
      ].join('\n')
    },
    '表单控件强调色': {
      html: [
        '<style>',
        '  .form { display: grid; gap: 9px; font-size: 12.5px; color: var(--text-soft); }',
        '  .form label { display: flex; align-items: center; gap: 8px; }',
        '  .form input[type="range"] { width: 190px; }',
        '</style>',
        '<div class="form">',
        '  <label><input type="checkbox" checked> 复选框</label>',
        '  <label><input type="radio" name="r" checked> 单选 A',
        '        <input type="radio" name="r"> 单选 B</label>',
        '  <label>滑块 <input type="range" value="62"></label>',
        '  <label>进度 <progress value="0.62"></progress></label>',
        '</div>',
        '<p style="font-size:11.5px;color:var(--text-dim);margin:10px 0 0">一行 accent-color 就能统一原生控件配色，',
        '不必再用伪元素重画；深色主题下记得换成亮一点的强调色。</p>'
      ].join('\n')
    },
    '只在键盘操作时显示焦点环': {
      html: [
        '<style>',
        '  .row2 { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; }',
        '  .focusable { padding: 7px 14px; border-radius: 8px; border: 1px solid var(--border-st);',
        '               background: var(--bg-elev); color: var(--text); font: inherit; font-size: 12.5px;',
        '               cursor: pointer; }',
        '  .focusable[type="text"] { cursor: text; }',
        '</style>',
        '<div class="row2">',
        '  <button class="focusable">按钮一</button>',
        '  <button class="focusable">按钮二</button>',
        '  <input class="focusable" type="text" placeholder="输入框" value="">',
        '</div>',
        '<p style="font-size:11.5px;color:var(--text-dim);margin:10px 0 0">用鼠标点：不会出现焦点环；',
        '按 Tab 键切换：出现 2px 强调色描边。这就是 :focus-visible 与 :focus 的区别。</p>'
      ].join('\n')
    },

    /* ---------- 第二批：技巧 ---------- */
    '容器查询': {
      html: [
        '<style>',
        '  .host { border: 1px dashed var(--border-st); border-radius: 10px; padding: 10px; margin-bottom: 12px; }',
        '  .host.narrow { width: 250px; }',
        '  .host .lab { font-size: 11px; color: var(--text-dim); margin-bottom: 6px; }',
        '  .card-cq .thumb { height: 100%; min-height: 56px; border-radius: 8px;',
        '                    background: linear-gradient(135deg, #5c7cfa, #22b8cf); }',
        '  .card-cq .txt { font-size: 12.3px; color: var(--text-soft); line-height: 1.55; }',
        '</style>',
        '<div class="host narrow">',
        '  <div class="lab">窄容器 250px（未触发 @container）</div>',
        '  <div class="card-cq">',
        '    <div class="thumb"></div>',
        '    <div class="txt">单列堆叠：图在上、文字在下。</div>',
        '  </div>',
        '</div>',
        '<div class="host">',
        '  <div class="lab">宽容器（≥340px 触发规则）</div>',
        '  <div class="card-cq">',
        '    <div class="thumb"></div>',
        '    <div class="txt">变成 84px 图 + 文字的两列布局 —— 同一份组件，放在侧栏和主区各自适配。</div>',
        '  </div>',
        '</div>'
      ].join('\n')
    },
    '原生 CSS 嵌套': {
      html: [
        '<style>',
        '  .menu { max-width: 210px; border: 1px solid var(--border); border-radius: 10px;',
        '         background: var(--bg-elev); }',
        '  .menu a.item { display: block; text-decoration: none; font-size: 12.5px; }',
        '</style>',
        '<nav class="menu">',
        '  <ul>',
        '    <li><a class="item" href="#">首页</a></li>',
        '    <li><a class="item" href="#">标签速查</a></li>',
        '    <li><a class="item" href="#">CSS 属性</a></li>',
        '    <li><a class="item" href="#">代码片段</a></li>',
        '  </ul>',
        '</nav>',
        '<p style="font-size:11.5px;color:var(--text-dim);margin:10px 0 0">鼠标悬停任意一项：',
        '&amp; .item:hover 这条嵌套规则会生效（现代浏览器原生支持，无需预处理器）。</p>'
      ].join('\n')
    },
    'counter 自动编号': {
      html: [
        '<style>',
        '  .toc { display: grid; gap: 6px; font-size: 12.5px; color: var(--text-soft); }',
        '  .toc .sec { padding: 5px 9px; border-radius: 7px; background: var(--bg-soft); }',
        '</style>',
        '<div class="toc">',
        '  <div class="sec">HTML 标签速查</div>',
        '  <div class="sec">CSS 选择器</div>',
        '  <div class="sec">常用代码片段</div>',
        '  <div class="sec">JavaScript 速查</div>',
        '</div>',
        '<p style="font-size:11.5px;color:var(--text-dim);margin:10px 0 0">序号由 counter 生成：',
        '试着在编辑器里增删一个 .sec，序号会自动重排，不用手改。</p>'
      ].join('\n')
    },
    '尊重「减少动效」偏好': {
      html: [
        '<style>',
        '  @keyframes demo-spin { to { transform: rotate(360deg); } }',
        '  .row2 { display: flex; align-items: center; gap: 14px; }',
        '  .spin { width: 36px; height: 36px; border-radius: 10px; flex: none;',
        '          background: linear-gradient(135deg, #5c7cfa, #22b8cf);',
        '          animation: demo-spin 1.6s linear infinite; }',
        '  .rm { font-size: 12.3px; color: var(--text-soft); line-height: 1.6; }',
        '  .rm b { display: block; color: var(--text); font-size: 12.6px; margin-bottom: 3px; }',
        '</style>',
        '<div class="row2">',
        '  <div class="spin"></div>',
        '  <div class="rm"><b>当前系统偏好</b><span id="rm">检测中…</span></div>',
        '</div>',
        '<p style="font-size:11.5px;color:var(--text-dim);margin:10px 0 0">在系统设置里开启「减少动效」',
        '（Windows：设置 → 辅助功能 → 视觉效果；macOS：辅助功能 → 显示），这个方块会立刻停下。</p>'
      ].join('\n'),
      js: [
        'var mq = window.matchMedia("(prefers-reduced-motion: reduce)");',
        'var el = document.getElementById("rm");',
        'function show() {',
        '  el.textContent = mq.matches',
        '    ? "已开启「减少动效」→ 上面这段动画被降到 0.01ms，几乎是静止的"',
        '    : "未开启 → 动画正常播放";',
        '  var d = getComputedStyle(document.querySelector(".spin")).animationDuration;',
        '  console.log("prefers-reduced-motion =", mq.matches, "| 实际 animation-duration =", d);',
        '}',
        'show();',
        'if (mq.addEventListener) mq.addEventListener("change", show);',
        'console.log("这条规则是全站兜底写法：放进 reset.css 就行");'
      ].join('\n')
    },

    /* ---------- 第二批：动效 ---------- */
    '加载环 Spinner': {
      html: [
        '<style>',
        '  .row2 { display: flex; align-items: center; gap: 12px; font-size: 12.5px;',
        '         color: var(--text-soft); }',
        '</style>',
        '<div class="row2">',
        '  <div class="spinner"></div>',
        '  <span>加载中…（border 三边浅、一边深，旋转即有方向感）</span>',
        '</div>',
        '<p style="font-size:11.5px;color:var(--text-dim);margin:10px 0 0">真实项目里记得加 ',
        'role="status" 与 aria-live，让读屏软件知道正在加载。</p>'
      ].join('\n')
    },
    '打字机效果': {
      html: [
        '<style>',
        '  .stage { padding: 16px 4px; font-size: 14px; }',
        '</style>',
        '<div class="stage"><span class="type">Hello CSS，这是一段打字机效果的文字</span></div>',
        '<p style="font-size:11.5px;color:var(--text-dim);margin:0">steps(26) 要与字数匹配才自然；',
        '文字长度变化时需要同步调整步数，或改用 ch 单位定宽。</p>'
      ].join('\n')
    },
    '呼吸脉冲圆点': {
      html: [
        '<style>',
        '  .row2 { display: flex; align-items: center; gap: 8px; font-size: 12.5px;',
        '         color: var(--text-soft); }',
        '  .dot.b2 { animation-delay: .18s; }',
        '  .dot.b3 { animation-delay: .36s; }',
        '</style>',
        '<div class="row2">',
        '  <span class="dot"></span><span class="dot b2"></span><span class="dot b3"></span>',
        '  <span>在线 —— 三个点靠 animation-delay 错开，形成波浪</span>',
        '</div>',
        '<p style="font-size:11.5px;color:var(--text-dim);margin:10px 0 0">只动 transform 与 opacity，',
        '两个属性都走合成层，不会引起重排，长时间播放也不掉帧。</p>'
      ].join('\n')
    },

    /* ---------- 第三批：布局 / 排版 ---------- */
    '圣杯三栏布局': {
      html: [
        '<style>',
        '  .holy > div { padding: 12px; border-radius: 8px; font-size: 12.3px; text-align: center;',
        '               background: var(--bg-soft); color: var(--text-soft); }',
        '  .holy > .mid { background: var(--accent-soft); color: var(--accent); }',
        '</style>',
        '<div class="holy">',
        '  <div>左栏 140px</div>',
        '  <div class="mid">中间 minmax(0, 1fr) —— 自适应，且不会被长内容撑破</div>',
        '  <div>右栏 140px</div>',
        '</div>',
        '<p style="font-size:11.5px;color:var(--text-dim);margin:10px 0 0">把预览区拖窄到 460px 以下：',
        '媒体查询会把三栏退回单列。</p>'
      ].join('\n')
    },
    '移动端安全区适配': {
      html: [
        '<style>',
        '  .phone { position: relative; width: 220px; border: 6px solid #2b3245; border-radius: 22px;',
        '          overflow: hidden; background: var(--bg-elev); }',
        '  .phone .screen { padding: 14px 12px; font-size: 12.3px; color: var(--text-soft);',
        '                   min-height: 118px; }',
        '  .phone .home { height: 12px; background: #2b3245; }',
        '  .tabbar { font-size: 12px; color: #fff; background: var(--accent); text-align: center; }',
        '  .safe-x { font-size: 11.5px; color: var(--text-dim); }',
        '</style>',
        '<div class="phone">',
        '  <div class="screen">',
        '    <div class="safe-x">左右内边距 = max(16px, safe-area-inset-*)</div>',
        '    <p style="margin:6px 0 0">普通浏览器里 env() 取到 0，所以 max() 兜住 16px；',
        '       到了刘海屏会自动让开。</p>',
        '  </div>',
        '  <div class="tabbar">底部工具栏</div>',
        '  <div class="home"></div>',
        '</div>',
        '<p style="font-size:11.5px;color:var(--text-dim);margin:10px 0 0">底部黑条模拟手势条区域：',
        'padding-bottom 用 calc() 加上 env(safe-area-inset-bottom)，按钮才不会被手势条盖住。</p>'
      ].join('\n')
    },
    '等分九宫格': {
      html: [
        '<style>',
        '  .grid9 > div { border-radius: 8px; font-size: 12px; font-weight: 600; color: #fff;',
        '                background: linear-gradient(135deg, #5c7cfa, #22b8cf); }',
        '  .grid9 > div:nth-child(2n) { background: linear-gradient(135deg, #f06595, #f59f00); }',
        '  .grid9 > div:nth-child(3n) { background: linear-gradient(135deg, #20c997, #5c7cfa); }',
        '</style>',
        '<div class="grid9">',
        '  <div>1</div><div>2</div><div>3</div>',
        '  <div>4</div><div>5</div><div>6</div>',
        '  <div>7</div><div>8</div><div>9</div>',
        '</div>',
        '<p style="font-size:11.5px;color:var(--text-dim);margin:10px 0 0">每格都是正方形：',
        'aspect-ratio: 1 让高度跟着列宽走，改 gap 或列数都不用重算高度。</p>'
      ].join('\n')
    },
    '竖排文字': {
      html: [
        '<style>',
        '  .frame { display: flex; gap: 16px; align-items: flex-start; }',
        '  .vertical { padding: 10px 12px; border: 1px dashed var(--border-st); border-radius: 8px;',
        '             font-size: 14px; color: var(--text); }',
        '  .note { font-size: 11.5px; color: var(--text-dim); line-height: 1.6; }',
        '</style>',
        '<div class="frame">',
        '  <div class="vertical">两个黄鹂鸣翠柳，一行白鹭上青天</div>',
        '  <div class="note">writing-mode: vertical-rl 表示从右向左竖排；',
        '  text-orientation: mixed 让英文与数字保持横躺，不别扭。</div>',
        '</div>'
      ].join('\n')
    },
    '长单词 / URL 断行': {
      html: [
        '<style>',
        '  .cmp { display: grid; gap: 12px; }',
        '  .box { padding: 9px 11px; border: 1px dashed var(--border-st); border-radius: 8px;',
        '         background: var(--bg-soft); font-size: 12.3px; }',
        '  .hd { font-size: 11.5px; color: var(--text-dim); margin-bottom: 5px; }',
        '</style>',
        '<div class="cmp">',
        '  <div class="box"><div class="hd">默认：长串撑破容器（右侧溢出）</div>',
        '    https://example.com/very/long/path/that/never/breaks/anywhere/at/all/index.html</div>',
        '  <div class="box"><div class="hd">overflow-wrap: anywhere —— 容器里自动断行</div>',
        '    <span class="break">https://example.com/very/long/path/that/never/breaks/anywhere/at/all/index.html</span></div>',
        '</div>'
      ].join('\n')
    },

    /* ---------- 第三批：视觉 ---------- */
    '文字描边': {
      html: [
        '<style>',
        '  .stage { padding: 14px 2px; text-align: center; }',
        '  .stroke { font-size: 34px; font-weight: 800; letter-spacing: 1px; }',
        '</style>',
        '<div class="stage"><span class="stroke">OUTLINE</span></div>',
        '<p style="font-size:11.5px;color:var(--text-dim);margin:0">填充设为 transparent 只留描边；',
        '描边颜色写 currentColor 就能跟随文字色变化。</p>'
      ].join('\n')
    },
    '斜切 / 多边形色块': {
      html: [
        '<style>',
        '  .slanted { padding: 26px 20px 34px; color: #fff; }',
        '  .slanted b { display: block; font-size: 16px; margin-bottom: 5px; }',
        '  .slanted span { font-size: 12.3px; opacity: .92; }',
        '</style>',
        '<div class="slanted">',
        '  <b>斜切 Banner</b>',
        '  <span>clip-path: polygon() 用百分比坐标，容器变宽变窄时斜边角度会自动跟随。</span>',
        '</div>',
        '<p style="font-size:11.5px;color:var(--text-dim);margin:10px 0 0">试试改 polygon 里的 82% → 60%，',
        '看看斜度怎么变。</p>'
      ].join('\n')
    },
    '点阵 / 网格背景': {
      html: [
        '<style>',
        '  .cmp { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }',
        '  .pat { height: 96px; border-radius: 10px; border: 1px solid var(--border);',
        '        display: grid; place-items: center; font-size: 11.5px; color: var(--text-dim); }',
        '  .grid-pat {',
        '    background-image: linear-gradient(var(--border-st) 1px, transparent 1px),',
        '                      linear-gradient(90deg, var(--border-st) 1px, transparent 1px);',
        '    background-size: 18px 18px;',
        '  }',
        '</style>',
        '<div class="cmp">',
        '  <div class="pat dots">点阵 · 14px</div>',
        '  <div class="pat grid-pat">网格 · 18px（双层 linear-gradient）</div>',
        '</div>',
        '<p style="font-size:11.5px;color:var(--text-dim);margin:10px 0 0">只改 background-size 就能调密度；',
        '把颜色换成 rgba 可以更淡。</p>'
      ].join('\n')
    },
    '头像堆叠': {
      html: [
        '<style>',
        '  .avatars > span { display: grid; place-items: center; font-size: 12px; font-weight: 600;',
        '                    color: #fff; background: linear-gradient(135deg, #5c7cfa, #22b8cf); }',
        '  .avatars > span:nth-child(2) { background: linear-gradient(135deg, #f06595, #f59f00); }',
        '  .avatars > span:nth-child(3) { background: linear-gradient(135deg, #20c997, #5c7cfa); }',
        '  .avatars > span.more { background: var(--bg-soft); color: var(--text-dim); }',
        '</style>',
        '<div class="avatars">',
        '  <span>A</span><span>B</span><span>C</span><span class="more">+3</span>',
        '</div>',
        '<p style="font-size:11.5px;color:var(--text-dim);margin:10px 0 0">负 margin 让头像重叠，',
        'border 用背景色就能压出间隙；border 换成父级背景色才不会露馅。</p>'
      ].join('\n')
    },
    '图片灰度 → 彩色': {
      html: [
        '<style>',
        '  .photo { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }',
        '  .photo img { width: 100%; border-radius: 10px; display: block; }',
        '  .cap { font-size: 11.5px; color: var(--text-dim); margin-top: 6px; }',
        '</style>',
        '<div class="photo">',
        '  <div>',
        '    <img alt="示例图" src="' + IMG_WIDE + '">',
        '    <div class="cap">默认 grayscale(1)，悬停还原彩色</div>',
        '  </div>',
        '  <div>',
        '    <img alt="示例图" src="' + IMG_WIDE + '">',
        '    <div class="cap">同一份规则，鼠标移上来试试</div>',
        '  </div>',
        '</div>'
      ].join('\n')
    },

    /* ---------- 第三批：交互 ---------- */
    '纯 CSS 提示气泡': {
      html: [
        '<style>',
        '  .row2 { display: flex; gap: 12px; padding-top: 34px; }',
        '  .tip2 { padding: 7px 14px; border-radius: 8px; border: 1px solid var(--border-st);',
        '         background: var(--bg-elev); color: var(--text); font: inherit; font-size: 12.5px;',
        '         cursor: pointer; }',
        '</style>',
        '<div class="row2">',
        '  <button class="tip2" data-tip="复制成功">⧉ 复制</button>',
        '  <button class="tip2" data-tip="删除后不可恢复">🗑 删除</button>',
        '  <span class="tip2" tabindex="0" data-tip="键盘聚焦也会显示">⌨ 键盘也能触发</span>',
        '</div>',
        '<p style="font-size:11.5px;color:var(--text-dim);margin:10px 0 0">气泡文案写在 data-tip 里，',
        'CSS 用 attr(data-tip) 读取 —— 改文案不用碰样式。</p>'
      ].join('\n')
    },
    '自定义复选框': {
      html: [
        '<style>',
        '  .form2 { display: grid; gap: 9px; font-size: 12.5px; color: var(--text-soft); }',
        '  .form2 label { display: flex; align-items: center; gap: 8px; }',
        '</style>',
        '<div class="form2">',
        '  <label><input class="cbx" type="checkbox" checked> 已勾选</label>',
        '  <label><input class="cbx" type="checkbox"> 未勾选</label>',
        '  <label><input class="cbx" type="checkbox" checked disabled> 勾选且禁用</label>',
        '</div>',
        '<p style="font-size:11.5px;color:var(--text-dim);margin:10px 0 0">appearance: none 之后，',
        '勾选标记是 ::after 用一个带两边边框的小方块旋转 45° 画出来的。</p>'
      ].join('\n')
    },
    '浮动标签输入框': {
      html: [
        '<style>',
        '  .field input { width: 220px; border: 1px solid var(--border-st); border-radius: 8px;',
        '                background: var(--bg-elev); color: var(--text); font: inherit;',
        '                font-size: 12.5px; }',
        '  .field input:focus { outline: 2px solid var(--accent); outline-offset: 1px; }',
        '  .wrap2 { display: flex; gap: 14px; flex-wrap: wrap; }',
        '</style>',
        '<div class="wrap2">',
        '  <div class="field"><input id="m1" type="text" placeholder=" "><label for="m1">邮箱</label></div>',
        '  <div class="field"><input id="m2" type="text" placeholder=" " value="zhang@example.com">',
        '    <label for="m2">有值时标签保持上浮</label></div>',
        '</div>',
        '<p style="font-size:11.5px;color:var(--text-dim);margin:10px 0 0">点第一个输入框：',
        'placeholder 写成一个空格，:not(:placeholder-shown) 才判断得出有没有内容。</p>'
      ].join('\n')
    },
    '平滑滚动与锚点避让': {
      html: [
        '<style>',
        '  .nav { display: flex; gap: 10px; margin-bottom: 10px; }',
        '  .nav a { font-size: 12px; color: var(--accent); }',
        '  .fixed-top { position: sticky; top: 0; z-index: 2; padding: 6px 10px;',
        '              background: var(--bg-soft); border-bottom: 1px solid var(--border);',
        '              font-size: 11.5px; color: var(--text-dim); }',
        '  .sec { min-height: 108px; padding: 8px 2px; font-size: 12.3px; color: var(--text-soft); }',
        '  .sec b { display: block; color: var(--text); font-size: 12.6px; }',
        '</style>',
        '<div class="fixed-top">我是固定顶栏（会遮住跳转目标）</div>',
        '<div class="nav">',
        '  <a href="#sec-a">跳到第一节</a>',
        '  <a href="#sec-b">跳到第二节</a>',
        '  <a href="#sec-c">跳到第三节</a>',
        '</div>',
        '<div class="sec" id="sec-a"><b>第一节</b>scroll-margin-top: 72px 让标题停在顶栏下方，而不是被盖住。</div>',
        '<div class="sec" id="sec-b"><b>第二节</b>scroll-behavior: smooth 让跳转带过渡；',
        '放在 html 上就对整页生效。</div>',
        '<div class="sec" id="sec-c"><b>第三节</b>系统开启「减少动效」时，媒体查询把 smooth 退回 auto。</div>'
      ].join('\n')
    },

    /* ---------- 第三批：技巧 ---------- */
    ':is() 与 :where() 简写': {
      html: [
        '<style>',
        '  .demo :is(.t1, .t2) { color: var(--accent); }',
        '  .demo :where(.t1) { color: var(--danger); }',
        '  .demo p { font-size: 12.5px; margin: 0 0 6px; }',
        '</style>',
        '<div class="demo">',
        '  <p class="t1">第一条：两条规则都想改我的颜色</p>',
        '  <p class="t2">第二条：只有 :is() 那条命中我</p>',
        '</div>',
        '<p style="font-size:11.5px;color:var(--text-dim);margin:10px 0 0">结果是两条都是<strong>强调色</strong>：',
        ':where(.t1) 权重为 0，即使写在后面也输给了 :is()。把上面的 :where 换成 :is 再看看。</p>'
      ].join('\n')
    },
    '@layer 分层管理': {
      html: [
        '<style>',
        '  .row2 { display: flex; align-items: center; gap: 12px; }',
        '  .note2 { font-size: 11.5px; color: var(--text-dim); line-height: 1.6; }',
        '</style>',
        '<div class="row2">',
        '  <span class="btnx">分层按钮</span>',
        '  <span class="note2">base 层定字体边框、components 层定形状底色、utilities 层最后改成强调色 —— ',
        '  层顺序优先于书写顺序。</span>',
        '</div>',
        '<p style="font-size:11.5px;color:var(--text-dim);margin:10px 0 0">试试把三段 @layer 的声明顺序调换：',
        '外观会跟着变，因为层与层之间的胜负只由声明顺序决定。',
        '（补充：没有写进任何 @layer 的普通规则反而会赢过所有层 —— 所以整站样式最好全部入层。）</p>'
      ].join('\n')
    },
    'sr-only 无障碍隐藏': {
      html: [
        '<style>',
        '  .row2 { display: flex; align-items: center; gap: 10px; }',
        '  .icon-btn { width: 34px; height: 34px; border-radius: 8px; border: 1px solid var(--border-st);',
        '             background: var(--bg-elev); cursor: pointer; font-size: 15px; }',
        '  #srBtn { padding: 6px 12px; border-radius: 8px; border: 1px solid var(--border-st);',
        '           background: var(--bg-elev); color: var(--text); font: inherit; font-size: 12px; cursor: pointer; }',
        '</style>',
        '<div class="row2">',
        '  <button class="icon-btn" type="button">🔍<span class="sr-only" id="srText">搜索</span></button>',
        '  <button class="icon-btn" type="button">⚙<span class="sr-only">设置</span></button>',
        '  <button id="srBtn" type="button">显示隐藏文本</button>',
        '</div>',
        '<p style="font-size:11.5px;color:var(--text-dim);margin:10px 0 0">两个图标按钮里各有一段「看不见的说明」：',
        '页面上只有图标，读屏软件会朗读「搜索」「设置」。</p>'
      ].join('\n'),
      js: [
        'var btn = document.getElementById("srBtn");',
        'var txt = document.getElementById("srText");',
        'btn.addEventListener("click", function () {',
        '  var hidden = txt.classList.toggle("sr-only");',
        '  btn.textContent = hidden ? "显示隐藏文本" : "重新隐藏";',
        '  console.log("sr-only =", hidden, hidden',
        '    ? "→ 视觉上不可见，但仍在无障碍树中（读屏会读）"',
        '    : "→ 现在页面上也看得见了");',
        '});',
        'console.log("点一下按钮，对比：display:none 会连读屏一起藏掉，sr-only 不会");'
      ].join('\n')
    },

    /* ---------- 第三批：动效 ---------- */
    '渐变背景流动': {
      html: [
        '<style>',
        '  .flow { padding: 16px 18px; border-radius: 12px; color: #fff; text-align: center;',
        '         font-size: 13px; font-weight: 600; }',
        '</style>',
        '<div class="flow">渐变正在流动…</div>',
        '<p style="font-size:11.5px;color:var(--text-dim);margin:10px 0 0">渐变首尾都是 #5c7cfa，',
        '所以平移到尽头时也看不出接缝；background-size 越大，流动越慢。</p>'
      ].join('\n')
    },
    '卡片翻转': {
      html: [
        '<style>',
        '  .flip { width: 190px; height: 112px; }',
        '  .flip-inner { position: relative; width: 100%; height: 100%; }',
        '  .flip-face { position: absolute; inset: 0; display: grid; place-items: center;',
        '              border-radius: 12px; font-size: 12.5px; text-align: center; padding: 10px; }',
        '  .flip-front { background: linear-gradient(135deg, #5c7cfa, #22b8cf); color: #fff; }',
        '  .flip-back { background: var(--bg-soft); color: var(--text-soft);',
        '               border: 1px solid var(--border); }',
        '</style>',
        '<div class="flip" tabindex="0">',
        '  <div class="flip-inner">',
        '    <div class="flip-face flip-front">正面：把鼠标移上来</div>',
        '    <div class="flip-face flip-back">背面：rotateY(180deg)</div>',
        '  </div>',
        '</div>',
        '<p style="font-size:11.5px;color:var(--text-dim);margin:10px 0 0">父级 perspective 提供透视，',
        '内层 preserve-3d 让两面处于 3D 空间，backface-visibility 藏住背对观众的那面。</p>'
      ].join('\n')
    },
    '不确定进度条': {
      html: [
        '<style>',
        '  .row3 { display: grid; gap: 8px; font-size: 12.3px; color: var(--text-soft); }',
        '</style>',
        '<div class="row3">',
        '  <div>正在处理，请稍候…</div>',
        '  <div class="bar"></div>',
        '</div>',
        '<p style="font-size:11.5px;color:var(--text-dim);margin:10px 0 0">已知进度请用 &lt;progress&gt; 元素；',
        '这种光块来回跑的写法只用于「不知道还要多久」。</p>'
      ].join('\n')
    }
  };

  window.CSS_SNIPPET_CATS = ['布局', '排版', '视觉', '交互', '技巧', '动效'];

  /* ---------- 中英文术语对照 ---------- */
  window.GLOSSARY = [
    { en: 'Element / 元素', cn: '标签与其内容构成的整体' },
    { en: 'Tag / 标签', cn: '尖括号包裹的标记，如 <p>' },
    { en: 'Attribute / 属性', cn: '写在起始标签内的名值对' },
    { en: 'Void element / 空元素', cn: '无闭合标签的元素，如 <img> <br>' },
    { en: 'Block-level / 块级', cn: '独占一行、可设宽高的元素' },
    { en: 'Inline / 行内', cn: '随文字流排列，不可设宽高' },
    { en: 'Deprecated / 已弃用', cn: '规范不推荐使用，但仍可用' },
    { en: 'Obsolete / 已废弃', cn: '规范已移除，不应使用' },
    { en: 'Semantics / 语义化', cn: '用正确的标签表达正确的含义' },
    { en: 'Selector / 选择器', cn: '用于选中目标元素的模式' },
    { en: 'Specificity / 特异性', cn: '选择器优先级权重（ID > 类 > 标签）' },
    { en: 'Box model / 盒模型', cn: 'content + padding + border + margin' },
    { en: 'Reflow / 重排', cn: '布局发生改变，代价较高' },
    { en: 'Repaint / 重绘', cn: '外观改变但布局不变' },
    { en: 'Viewport / 视口', cn: '浏览器可见区域' },
    { en: 'Fallback / 回退', cn: '不支持时的降级方案' }
  ];

  /* ---------- 快捷键 ---------- */
  window.SHORTCUTS = [
    { k: '/', d: '聚焦搜索框' },
    { k: '[', d: '收起 / 展开侧边导航（窄屏时为抽屉）' },
    { k: 'H', d: '隐藏 / 显示顶栏（沉浸模式，窄屏不生效）' },
    { k: 'Esc', d: '退出全屏编辑 / 恢复顶栏 / 关闭导航抽屉、搜索结果与弹窗' },
    { k: '双击分隔条', d: '恢复演示区默认 5:5 比例' },
    { k: 'Enter', d: '在搜索结果中打开第一项' },
    { k: '↑ ↓', d: '在搜索结果中上下移动' },
    { k: '← →', d: '聚焦演示区分隔条时微调编辑区与预览区的比例' },
    { k: 'Ctrl / ⌘ + S', d: '在演示编辑框内立即刷新预览（重跑 JS）' },
    { k: 'Ctrl / ⌘ + Enter', d: '在演示编辑框内立即运行代码' },
    { k: 'Tab', d: '在演示编辑框内插入两个空格缩进' },
    { k: 'Ctrl / ⌘ + P', d: '打印当前速查表' }
  ];
})();
