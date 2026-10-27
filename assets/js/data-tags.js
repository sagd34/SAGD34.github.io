/* ==========================================================
   内置 HTML 标签数据
   字段：n 名称 / d 说明 / c 分类 / s 状态 / dp 显示类型 / p 常用度(1-5)
        u 详细说明 / a 属性数组 / demo 示例代码 / css 示例样式 / dep 弃用信息
   状态：ok 现行 | dep 已弃用 | obs 已废弃删除 | nostd 非标准
   ========================================================== */
(function () {
  function T(n, d, c, s, dp, p, u, a, demo, css, dep) {
    return {
      n: n, d: d, c: c, s: s, dp: dp, p: p,
      u: u || '', a: a || [], demo: demo || '', css: css || '', dep: dep || null
    };
  }

  var L = [];

  /* ---------- 文档与元数据 ---------- */
  L.push(T('html', '文档根元素，所有其他元素的容器', '文档结构', 'ok', 'block', 5,
    '整个 HTML 页面的最外层元素。lang 属性用于声明页面语言，对无障碍与搜索引擎都很重要。',
    [{ n: 'lang', v: '语言代码', r: false, e: 'lang="zh-CN"', d: '声明文档主语言' },
     { n: 'dir', v: 'ltr | rtl | auto', r: false, e: 'dir="ltr"', d: '文本方向' }],
    '<!DOCTYPE html>\n<html lang="zh-CN">\n<head>\n  <meta charset="UTF-8">\n  <title>页面标题</title>\n</head>\n<body>\n  <p>Hello HTML</p>\n</body>\n</html>',
    'body { font-family: system-ui, sans-serif; }'));

  L.push(T('head', '文档元数据容器，包含标题、脚本、样式等', '文档结构', 'ok', 'none', 5,
    '不直接显示内容，用于放置 title、meta、link、style、script 等对文档的描述与资源引用。',
    [], '<head>\n  <meta charset="UTF-8">\n  <title>示例</title>\n  <link rel="stylesheet" href="style.css">\n</head>', ''));

  L.push(T('body', '文档主体，包含所有可见内容', '文档结构', 'ok', 'block', 5,
    '一个文档只能有一个 body。所有用户可见的内容都应放在其中。',
    [{ n: 'class', v: '类名', r: false, e: 'class="page"', d: '供 CSS 选择器使用' }],
    '<body>\n  <h1>标题</h1>\n  <p>段落内容</p>\n</body>', ''));

  L.push(T('title', '定义浏览器标签页与搜索结果中显示的文档标题', '文档结构', 'ok', 'none', 5,
    '必须放在 head 内，每个文档只能有一个。它是 SEO 与可访问性的关键元素。',
    [], '<title>HTML 速查表 · 标签查询与演示</title>', ''));

  L.push(T('meta', '提供文档元数据，如字符集、视口、描述信息', '文档结构', 'ok', 'none', 5,
    '通过 name/property + content 或 http-equiv 提供元数据。charset 必须在文档前 1024 字节内声明。',
    [{ n: 'charset', v: '字符集', r: false, e: 'charset="UTF-8"', d: '声明字符编码' },
     { n: 'name', v: 'description | keywords | viewport …', r: false, e: 'name="viewport"', d: '元数据名称' },
     { n: 'content', v: '文本', r: false, e: 'content="width=device-width, initial-scale=1"', d: '元数据取值' },
     { n: 'http-equiv', v: 'refresh | X-UA-Compatible …', r: false, e: 'http-equiv="refresh"', d: '模拟 HTTP 响应头' }],
    '<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n<meta name="description" content="一个 HTML 速查表">', ''));

  L.push(T('link', '引入外部资源，最常用于加载 CSS 样式表', '文档结构', 'ok', 'none', 5,
    '空元素（自闭合写法可选）。rel 决定资源关系，stylesheet 为样式表，icon 为站点图标，preload 用于预加载。',
    [{ n: 'rel', v: 'stylesheet | icon | preload | canonical', r: true, e: 'rel="stylesheet"', d: '当前文档与目标的关系' },
     { n: 'href', v: 'URL', r: true, e: 'href="style.css"', d: '资源地址' },
     { n: 'media', v: '媒体查询', r: false, e: 'media="print"', d: '限定生效的媒体条件' },
     { n: 'as', v: 'style | script | font | image', r: false, e: 'as="style"', d: '配合 rel=preload 声明资源类型' }],
    '<link rel="stylesheet" href="style.css">\n<link rel="icon" href="favicon.ico">\n<link rel="preload" href="hero.woff2" as="font">', ''));

  L.push(T('style', '在文档内嵌 CSS 样式规则', '文档结构', 'ok', 'none', 5,
    '可放在 head 或 body 中，通常放 head。scoped 属性已被移除，请使用类名或 CSS Modules 控制作用域。',
    [{ n: 'media', v: '媒体查询', r: false, e: 'media="screen and (max-width:600px)"', d: '限定样式生效条件' },
     { n: 'type', v: 'text/css', r: false, e: 'type="text/css"', d: 'MIME 类型，HTML5 中可省略', s: 'dep' }],
    '<style>\n  body { background: #f5f6fa; }\n  h1 { color: #3b5bdb; }\n</style>\n<h1>内嵌样式生效</h1>', ''));

  L.push(T('base', '为页面内所有相对 URL 指定基准地址', '文档结构', 'ok', 'none', 2,
    '放于 head 内，影响全站相对链接与 target 默认值。谨慎使用，容易导致链接跳转异常。',
    [{ n: 'href', v: 'URL', r: false, e: 'href="https://example.com/assets/"', d: '基准 URL' },
     { n: 'target', v: '_self | _blank …', r: false, e: 'target="_blank"', d: '默认打开方式' }],
    '<base href="https://example.com/" target="_blank">\n<a href="page.html">相对链接将基于 base 解析</a>', ''));

  L.push(T('script', '嵌入或引用可执行 JavaScript 代码', '脚本', 'ok', 'none', 5,
    'type="module" 启用 ES Module。defer 在文档解析后按顺序执行，async 下载完成即执行，二者都不阻塞解析。',
    [{ n: 'src', v: 'URL', r: false, e: 'src="app.js"', d: '外部脚本地址' },
     { n: 'type', v: 'text/javascript | module | importmap', r: false, e: 'type="module"', d: '脚本类型' },
     { n: 'defer', v: '布尔属性', r: false, e: 'defer', d: '文档解析完成后再执行' },
     { n: 'async', v: '布尔属性', r: false, e: 'async', d: '异步加载并立即执行' },
     { n: 'nomodule', v: '布尔属性', r: false, e: 'nomodule', d: '不支持模块时降级执行' }],
    '<button id="btn">点我</button>\n<script>\n  document.getElementById("btn").onclick = () => alert("Hello");\n</script>', ''));

  L.push(T('noscript', '当浏览器禁用脚本时显示的替代内容', '脚本', 'ok', 'block', 2,
    '常用于提示用户开启 JavaScript，或为无脚本环境提供降级内容。',
    [], '<noscript>\n  <p>你的浏览器已禁用 JavaScript，部分功能不可用。</p>\n</noscript>', ''));

  /* ---------- 分区与语义化 ---------- */
  L.push(T('header', '页面或区块的页眉，通常含标题与导航', '语义化', 'ok', 'block', 5,
    '可出现在页面顶部，也可嵌套在 article / section 内部作为该区块的头部。',
    [], '<header>\n  <h1>站点标题</h1>\n  <nav><a href="#a">首页</a> · <a href="#b">文档</a></nav>\n</header>',
    'header { border-bottom: 1px solid #ddd; padding-bottom: 8px; }'));

  L.push(T('nav', '导航链接区域', '语义化', 'ok', 'block', 5,
    '用于主要导航块，如主菜单、面包屑、翻页。并非所有链接组都需要 nav。',
    [], '<nav>\n  <a href="#html">HTML</a> |\n  <a href="#css">CSS</a> |\n  <a href="#js">JS</a>\n</nav>',
    'nav a { margin-right: 10px; }'));

  L.push(T('main', '文档的主体内容区域，每页仅一个', '语义化', 'ok', 'block', 5,
    '不应包含侧边栏、导航、页脚等重复内容。屏幕阅读器可借此快速跳到主体。',
    [], '<main>\n  <h1>文章标题</h1>\n  <p>正文…</p>\n</main>', ''));

  L.push(T('article', '可独立分发的内容单元，如文章、评论、卡片', '语义化', 'ok', 'block', 4,
    '判断标准：这段内容单独拿出来是否仍有意义。是则用 article，否则用 section。',
    [], '<article>\n  <h2>博客标题</h2>\n  <p>正文…</p>\n  <footer>作者：小明</footer>\n</article>',
    'article { border-left: 3px solid #3b5bdb; padding-left: 12px; }'));

  L.push(T('section', '文档中的通用分区，通常带标题', '语义化', 'ok', 'block', 5,
    '用于按主题切分内容。若无标题或仅为样式容器，应改用 div。',
    [], '<section>\n  <h2>第一章</h2>\n  <p>内容…</p>\n</section>', ''));

  L.push(T('aside', '与主体内容间接相关的侧栏内容', '语义化', 'ok', 'block', 3,
    '例如侧边栏、广告、引用框、相关链接。放在 article 内时表示文章的补充说明。',
    [], '<aside>\n  <h3>相关阅读</h3>\n  <ul><li>盒子模型</li><li>Flex 布局</li></ul>\n</aside>',
    'aside { background: #f1f3f9; padding: 10px 14px; border-radius: 8px; }'));

  L.push(T('footer', '页面或区块的页脚', '语义化', 'ok', 'block', 5,
    '可包含版权、作者、相关链接等。嵌套在 article 内时表示该内容的页脚。',
    [], '<footer>\n  <p>© 2026 HTML 速查表</p>\n</footer>', 'footer { color: #777; font-size: 13px; }'));

  L.push(T('address', '标记联系信息（作者、所有者）', '语义化', 'ok', 'block', 2,
    '语义为“联系方式”，不只用于物理地址。浏览器默认以斜体呈现。',
    [], '<address>\n  联系：<a href="mailto:hi@example.com">hi@example.com</a><br>\n  GitHub：@example\n</address>', ''));

  L.push(T('hgroup', '将标题与副标题组合为一个标题组', '语义化', 'ok', 'block', 2,
    'HTML5.1 曾移除后又恢复，用于把主标题与副标题/标语归组，避免副标题影响大纲层级。',
    [], '<hgroup>\n  <h1>HTML 速查表</h1>\n  <p>标签 · 属性 · 演示</p>\n</hgroup>', ''));

  L.push(T('h1', '一级标题，页面最重要的标题', '语义化', 'ok', 'block', 5,
    '建议每页只有一个 h1。标题层级应逐级递减，不要跳级使用。',
    [], '<h1>一级标题</h1>\n<h2>二级标题</h2>\n<h3>三级标题</h3>',
    'h1 { font-size: 28px; }\nh2 { font-size: 22px; }'));
  L.push(T('h2', '二级标题', '语义化', 'ok', 'block', 5, '用于章节标题，层级次于 h1。', [], '<h2>章节标题</h2>', 'h2 { border-bottom: 1px solid #eee; }'));
  L.push(T('h3', '三级标题', '语义化', 'ok', 'block', 4, '用于小节标题。', [], '<h3>小节标题</h3>', ''));
  L.push(T('h4', '四级标题', '语义化', 'ok', 'block', 3, '更深层级的小节标题。', [], '<h4>小节标题</h4>', ''));
  L.push(T('h5', '五级标题', '语义化', 'ok', 'block', 2, '更深层级的小节标题。', [], '<h5>小节标题</h5>', ''));
  L.push(T('h6', '六级标题，层级最低', '语义化', 'ok', 'block', 2, 'HTML 标题共六级，h6 为最低层。', [], '<h6>小节标题</h6>', ''));

  /* ---------- 文本内容 ---------- */
  L.push(T('p', '段落，文本的基本容器', '文本', 'ok', 'block', 5,
    '块级元素，浏览器会在前后自动留出间距。不要在 p 内嵌套块级元素。',
    [], '<p>这是一个段落。</p>\n<p>这是另一个段落。</p>', 'p { line-height: 1.8; }'));

  L.push(T('br', '强制换行', '文本', 'ok', 'inline', 5,
    '空元素，不需要闭合标签。仅用于诗句、地址等确实需要换行的场景，布局间距请用 CSS。',
    [], '<p>第一行<br>第二行<br>第三行</p>', ''));

  L.push(T('hr', '主题分隔线，表示内容主题的切换', '文本', 'ok', 'block', 4,
    '具有语义（主题的段落级转换），不只是装饰线，样式用 CSS 控制。',
    [], '<p>上文</p>\n<hr>\n<p>下文</p>', 'hr { border: 0; border-top: 1px solid #ddd; }'));

  L.push(T('div', '通用块级容器，无任何语义', '文本', 'ok', 'block', 5,
    '仅在找不到更合适的语义元素时使用。默认 block，常用于布局分组。',
    [], '<div class="card">\n  <div class="card-title">标题</div>\n  <div>内容</div>\n</div>',
    '.card { border: 1px solid #ddd; border-radius: 8px; padding: 12px; }'));

  L.push(T('span', '通用行内容器，无任何语义', '文本', 'ok', 'inline', 5,
    '用于对行内的一小段文本单独设置样式或绑定事件。',
    [], '<p>价格：<span class="price">¥99</span></p>', '.price { color: #c02a2a; font-weight: 700; }'));

  L.push(T('strong', '表示内容重要性高（语义强调）', '文本', 'ok', 'inline', 5,
    '与 b 的区别：strong 表达“重要”，b 仅视觉加粗。屏幕阅读器会用更重的语气朗读 strong。',
    [], '<p><strong>警告：</strong>请先备份数据。</p>', ''));

  L.push(T('b', '视觉上加粗，但不表达额外重要性', '文本', 'ok', 'inline', 4,
    '适用于关键词、产品名等需要醒目但不强调重要性的场合。语义强调请用 strong。',
    [], '<p>本段包含 <b>关键词</b> 与普通文字。</p>', ''));

  L.push(T('em', '强调文本，改变语句含义的重点', '文本', 'ok', 'inline', 5,
    'strong 表示内容重要，em 表示语气重音：“我<em>今天</em>要去”。',
    [], '<p>我<em>真的</em>喜欢这个标签。</p>', 'em { color: #a86404; }'));

  L.push(T('i', '表示不同于正文的语气或技术术语、外文', '文本', 'ok', 'inline', 4,
    '常见用途：技术术语、外文短语、图标（配合 iconfont）。',
    [], '<p>这个术语 <i>Homo sapiens</i> 来自拉丁语。</p>', ''));

  L.push(T('mark', '高亮标记文本，表示与上下文相关或被引用', '文本', 'ok', 'inline', 3,
    '典型场景：搜索结果中高亮关键词。默认黄色背景。',
    [], '<p>搜索结果：HTML <mark>标签</mark> 速查表</p>', 'mark { background: #ffe9a8; }'));

  L.push(T('small', '表示旁注、版权、法律声明等次要文字', '文本', 'ok', 'inline', 3,
    '语义为“小字注释”，默认字号变小。不要仅为了缩小字体而使用。',
    [], '<p>售价 ¥99 <small>不含税</small></p>', ''));

  L.push(T('sub', '下标文本', '文本', 'ok', 'inline', 3, '常用于化学分子式、数学下标。',
    [], '<p>水的化学式：H<sub>2</sub>O</p>', ''));

  L.push(T('sup', '上标文本', '文本', 'ok', 'inline', 3, '常用于脚注编号、幂次。',
    [], '<p>E = mc<sup>2</sup></p>', ''));

  L.push(T('del', '表示已从文档中删除的内容', '文本', 'ok', 'inline', 3,
    '浏览器渲染为删除线。datetime 属性可记录删除时间。',
    [{ n: 'datetime', v: '日期时间', r: false, e: 'datetime="2026-01-01"', d: '删除发生的时间' }],
    '<p>原价 <del>¥199</del> 现价 ¥99</p>', 'del { color: #999; }'));

  L.push(T('ins', '表示新增（插入）的内容', '文本', 'ok', 'inline', 3,
    '常与 del 配合展示文档修订记录。默认下划线。',
    [{ n: 'datetime', v: '日期时间', r: false, e: 'datetime="2026-01-01"', d: '插入时间' }],
    '<p>本次修改：<del>旧文案</del> <ins>新文案</ins></p>', 'ins { color: #0f7b52; }'));

  L.push(T('s', '表示不再准确或不再相关的内容', '文本', 'ok', 'inline', 2,
    '注意：s 表示“已过时”，del 表示“已删除”，二者语义不同。',
    [], '<p><s>限时 ¥299</s> 现价 ¥99</p>', ''));

  L.push(T('q', '短的行内引用', '文本', 'ok', 'inline', 2,
    '浏览器自动添加引号。长段落引用请用 blockquote。cite 属性指向来源 URL。',
    [{ n: 'cite', v: 'URL', r: false, e: 'cite="https://example.com"', d: '引用来源地址' }],
    '<p>他说：<q>简洁胜于复杂。</q></p>', ''));

  L.push(T('blockquote', '整段的块级引用', '文本', 'ok', 'block', 4,
    '用于引用他人内容，常配合 cite 属性与 footer 标注来源。',
    [{ n: 'cite', v: 'URL', r: false, e: 'cite="https://example.com/post"', d: '引用来源' }],
    '<blockquote cite="https://example.com">\n  <p>任何傻瓜都能写出计算机能懂的代码，好的程序员写出人能懂的代码。</p>\n</blockquote>',
    'blockquote { border-left: 4px solid #3b5bdb; margin: 0; padding-left: 14px; color: #555; }'));

  L.push(T('cite', '标记作品标题或引用出处', '文本', 'ok', 'inline', 2,
    '语义为作品名（书名、歌曲名等），而非“引用”动作。默认斜体。',
    [], '<p>参考自 <cite>HTML 标准</cite>。</p>', 'cite { font-style: italic; }'));

  L.push(T('code', '标记一小段计算机代码', '文本', 'ok', 'inline', 4,
    '行内代码用 code，多行代码块用 pre 包裹 code。',
    [], '<p>用 <code>display: flex</code> 即可开启弹性布局。</p>',
    'code { background: #f1f3f9; padding: 2px 5px; border-radius: 4px; }'));

  L.push(T('kbd', '表示用户键盘输入', '文本', 'ok', 'inline', 3,
    '用于文档中描述快捷键或用户应输入的按键。',
    [], '<p>按 <kbd>Ctrl</kbd> + <kbd>S</kbd> 保存。</p>',
    'kbd { border: 1px solid #ccc; border-bottom-width: 2px; border-radius: 4px; padding: 1px 6px; }'));

  L.push(T('samp', '表示程序或系统的示例输出', '文本', 'ok', 'inline', 2,
    '用于展示程序运行结果、终端回显。',
    [], '<p>终端输出：<samp>Hello, World!</samp></p>', 'samp { font-family: monospace; color: #0f7b52; }'));

  L.push(T('var', '表示变量名或数学变量', '文本', 'ok', 'inline', 2,
    '默认斜体，用于标记代码或公式中的变量。',
    [], '<p>变量 <var>count</var> 的初始值为 0。</p>', 'var { font-style: italic; }'));

  L.push(T('pre', '预格式化文本，保留空格与换行', '文本', 'ok', 'block', 4,
    '内部空格与换行会被原样保留，常用来展示代码块。',
    [], '<pre><code>function hello() {\n  console.log("hi");\n}</code></pre>',
    'pre { background: #f7f8fc; padding: 12px; border-radius: 8px; overflow: auto; }'));

  L.push(T('abbr', '标注缩写词，可配合 title 给出全称', '文本', 'ok', 'inline', 3,
    'title 属性提供完整解释，鼠标悬停可查看。默认带虚下划线。',
    [{ n: 'title', v: '文本', r: false, e: 'title="HyperText Markup Language"', d: '缩写全称' }],
    '<p><abbr title="HyperText Markup Language">HTML</abbr> 是网页的骨架。</p>',
    'abbr { border-bottom: 1px dotted #888; cursor: help; }'));

  L.push(T('dfn', '标记术语的定义之处', '文本', 'ok', 'inline', 2,
    '用于首次定义某个术语的位置，其最近的父元素即为被定义对象。',
    [], '<p><dfn>语义化标签</dfn> 指具有明确含义的 HTML 元素。</p>', 'dfn { font-weight: 700; }'));

  L.push(T('time', '机器可读的日期与时间', '文本', 'ok', 'inline', 3,
    'datetime 属性提供标准格式，便于搜索引擎与脚本解析。',
    [{ n: 'datetime', v: '日期时间', r: false, e: 'datetime="2026-10-26T17:00"', d: '机器可读的时间值' }],
    '<p>发布于 <time datetime="2026-10-26">2026 年 10 月 26 日</time></p>', ''));

  L.push(T('ruby', '包裹需要注音或注释的文本', '文本', 'ok', 'inline', 2, '常与 rt（注音）和 rp（兼容括号）搭配，用于东亚文字注音。',
    [], '<ruby>汉 <rp>(</rp><rt>hàn</rt><rp>)</rp></ruby>', 'ruby rt { font-size: 11px; color: #888; }'));

  L.push(T('rt', 'ruby 注音文本', '文本', 'ok', 'inline', 2, '定义 ruby 中字符的发音或解释。',
    [], '<ruby>东京 <rt>tōkyō</rt></ruby>', ''));

  L.push(T('rp', '不支持 ruby 的浏览器显示的括号', '文本', 'ok', 'inline', 1, '为不支持 ruby 的环境提供降级括号显示。',
    [], '<ruby>字 <rp>(</rp><rt>zì</rt><rp>)</rp></ruby>', ''));

  L.push(T('bdi', '隔离文本方向，避免影响周围排版', '文本', 'ok', 'inline', 1,
    'Bi-directional Isolation，用于嵌入方向未知的文本（如用户名）。',
    [{ n: 'dir', v: 'ltr | rtl', r: false, e: 'dir="rtl"', d: '文本方向' }],
    '<p>用户：<bdi>علي</bdi> 已上线</p>', ''));

  L.push(T('bdo', '强制覆盖文本方向', '文本', 'ok', 'inline', 1,
    'Bi-directional Override，dir 为必填属性。',
    [{ n: 'dir', v: 'ltr | rtl', r: true, e: 'dir="rtl"', d: '强制文本方向' }],
    '<bdo dir="rtl">这段文字从右向左显示</bdo>', ''));

  L.push(T('wbr', '在长单词中指定可换行的位置', '文本', 'ok', 'inline', 2,
    'Word Break Opportunity。空元素，浏览器可在此处断行。',
    [], '<p>super<wbr>califragilistic<wbr>expialidocious</p>', ''));

  L.push(T('data', '将内容与机器可读的值关联', '文本', 'ok', 'inline', 2,
    '类似微数据，value 属性提供程序可读取的值。',
    [{ n: 'value', v: '文本', r: true, e: 'value="398"', d: '机器可读的值' }],
    '<ul>\n  <li><data value="1">第一章</data></li>\n  <li><data value="2">第二章</data></li>\n</ul>', ''));

  /* ---------- 列表 ---------- */
  L.push(T('ul', '无序列表', '列表', 'ok', 'block', 5,
    '每项前默认显示项目符号。列表项必须是 li。',
    [], '<ul>\n  <li>HTML</li>\n  <li>CSS</li>\n  <li>JavaScript</li>\n</ul>', ''));

  L.push(T('ol', '有序列表', '列表', 'ok', 'block', 5,
    '每项前显示编号。可用 type / start / reversed 控制编号形式。',
    [{ n: 'start', v: '数字', r: false, e: 'start="3"', d: '起始编号' },
     { n: 'type', v: '1 | a | A | i | I', r: false, e: 'type="A"', d: '编号类型' },
     { n: 'reversed', v: '布尔属性', r: false, e: 'reversed', d: '倒序编号' }],
    '<ol start="1" type="1">\n  <li>打开编辑器</li>\n  <li>编写代码</li>\n  <li>保存运行</li>\n</ol>', ''));

  L.push(T('li', '列表项', '列表', 'ok', 'list-item', 5,
    '必须作为 ul / ol / menu 的直接子元素。value 属性仅在 ol 中有效。',
    [{ n: 'value', v: '数字', r: false, e: 'value="5"', d: '当前项编号（仅 ol）' }],
    '<ol>\n  <li value="10">从 10 开始</li>\n  <li>第二项</li>\n</ol>', ''));

  L.push(T('dl', '描述列表，一组名值对', '列表', 'ok', 'block', 3,
    '由 dt（术语）与 dd（描述）组成，适合做术语表、属性说明。',
    [], '<dl>\n  <dt>HTML</dt>\n  <dd>超文本标记语言</dd>\n  <dt>CSS</dt>\n  <dd>层叠样式表</dd>\n</dl>',
    'dt { font-weight: 700; }\ndd { margin: 0 0 8px 20px; color: #555; }'));

  L.push(T('dt', '描述列表中的术语名', '列表', 'ok', 'block', 3, '必须与 dl 和 dd 搭配使用。', [], '<dt>术语</dt>', ''));

  L.push(T('dd', '描述列表中的术语描述', '列表', 'ok', 'block', 3, '默认缩进显示，可包含任意流内容。', [], '<dd>描述内容</dd>', ''));

  L.push(T('menu', '语义为工具栏的无序列表', '列表', 'ok', 'block', 1,
    'HTML5 中重新定义为类似 ul 的语义列表，常用于工具栏按钮组。浏览器兼容性与 ul 基本一致。',
    [], '<menu>\n  <li><button>新建</button></li>\n  <li><button>打开</button></li>\n</menu>', ''));

  /* ---------- 链接 ---------- */
  L.push(T('a', '定义超链接，跳转到其他页面、文件或页面内锚点', '链接', 'ok', 'inline', 5,
    'href 缺省时它不是链接而是占位锚点。下载属性可触发下载，mailto: 可打开邮件客户端。配合 rel="noopener" 提升新窗口安全性。',
    [{ n: 'href', v: 'URL', r: false, e: 'href="https://example.com"', d: '链接目标地址' },
     { n: 'target', v: '_self | _blank | _parent | _top', r: false, e: 'target="_blank"', d: '在何处打开' },
     { n: 'rel', v: 'noopener | nofollow | noreferrer', r: false, e: 'rel="noopener"', d: '与目标的关系，影响安全与 SEO' },
     { n: 'download', v: '文件名', r: false, e: 'download="file.pdf"', d: '触发下载而非跳转' },
     { n: 'hreflang', v: '语言代码', r: false, e: 'hreflang="en"', d: '目标页面语言' },
     { n: 'type', v: 'MIME 类型', r: false, e: 'type="application/pdf"', d: '目标资源的类型' }],
    '<a href="https://example.com" target="_blank" rel="noopener">访问示例网站</a><br>\n<a href="#section-2">跳到页面内第二节</a><br>\n<a href="mailto:hi@example.com">发邮件</a>',
    'a { color: #3b5bdb; }'));

  /* ---------- 表格 ---------- */
  L.push(T('table', '定义表格，用于展示二维数据', '表格', 'ok', 'table', 5,
    '仅用于展示数据，不要用于页面布局。可配合 thead / tbody / tfoot 分区。',
    [{ n: 'border', v: '数字（像素）', r: false, e: 'border="1"', d: '边框宽度，建议改用 CSS', s: 'dep' }],
    '<table>\n  <thead><tr><th>标签</th><th>说明</th></tr></thead>\n  <tbody>\n    <tr><td>a</td><td>超链接</td></tr>\n    <tr><td>p</td><td>段落</td></tr>\n  </tbody>\n</table>',
    'table { border-collapse: collapse; width: 100%; }\nth, td { border: 1px solid #ddd; padding: 6px 10px; }\nth { background: #f1f3f9; }'));

  L.push(T('thead', '表格的表头分组', '表格', 'ok', 'table-header-group', 4, '包含列标题行，打印时可跨页重复。', [], '<thead><tr><th>姓名</th><th>分数</th></tr></thead>', ''));
  L.push(T('tbody', '表格的主体数据分组', '表格', 'ok', 'table-row-group', 4, '一个 table 可有多个 tbody，便于按逻辑分组。', [], '<tbody><tr><td>小明</td><td>95</td></tr></tbody>', ''));
  L.push(T('tfoot', '表格的表尾分组（汇总行）', '表格', 'ok', 'table-footer-group', 3, '常放合计行，HTML5 中可写在 tbody 之前或之后。', [], '<tfoot><tr><td>合计</td><td>180</td></tr></tfoot>', ''));
  L.push(T('tr', '表格中的一行', '表格', 'ok', 'table-row', 5, '必须位于 table / thead / tbody / tfoot 内，包含 td 或 th。', [], '<tr><td>单元格</td></tr>', ''));

  L.push(T('th', '表头单元格，语义为列/行标题', '表格', 'ok', 'table-cell', 5,
    '默认加粗居中。scope 属性声明它是行还是列的标题，利于无障碍。',
    [{ n: 'scope', v: 'row | col | rowgroup | colgroup', r: false, e: 'scope="col"', d: '声明标题作用范围' },
     { n: 'colspan', v: '数字', r: false, e: 'colspan="2"', d: '横向合并列数' },
     { n: 'rowspan', v: '数字', r: false, e: 'rowspan="2"', d: '纵向合并行数' }],
    '<table>\n  <tr><th scope="col">科目</th><th scope="col">分数</th></tr>\n  <tr><td>语文</td><td>90</td></tr>\n</table>',
    'th { background: #eef1fe; }'));

  L.push(T('td', '表格的数据单元格', '表格', 'ok', 'table-cell', 5,
    '表格中的标准单元格，可用 colspan / rowspan 合并。',
    [{ n: 'colspan', v: '数字', r: false, e: 'colspan="2"', d: '横向合并列数' },
     { n: 'rowspan', v: '数字', r: false, e: 'rowspan="2"', d: '纵向合并行数' },
     { n: 'headers', v: 'id 列表', r: false, e: 'headers="name score"', d: '关联的 th 的 id' }],
    '<table>\n  <tr><td>普通</td><td colspan="2">横跨两列</td></tr>\n  <tr><td rowspan="2">纵跨两行</td><td>A</td><td>B</td></tr>\n  <tr><td>C</td><td>D</td></tr>\n</table>',
    'td { border: 1px solid #ddd; padding: 6px; }'));

  L.push(T('col', '为表格中的一列统一设置属性', '表格', 'ok', 'table-column', 2,
    '空元素，位于 colgroup 内，可批量控制列宽与背景。可用 CSS 属性有限。',
    [{ n: 'span', v: '数字', r: false, e: 'span="2"', d: '跨越的列数' }],
    '<table>\n  <colgroup><col span="1" style="background:#eef1fe"><col span="2"></colgroup>\n  <tr><th>A</th><th>B</th><th>C</th></tr>\n  <tr><td>1</td><td>2</td><td>3</td></tr>\n</table>', ''));

  L.push(T('colgroup', '表格列组，用于统一设置列样式', '表格', 'ok', 'table-column-group', 2,
    '包裹一组 col 元素，便于批量设置列属性。',
    [{ n: 'span', v: '数字', r: false, e: 'span="2"', d: '跨越的列数' }],
    '<colgroup span="2" style="background:#f7f8fc"></colgroup>', ''));

  L.push(T('caption', '表格的标题', '表格', 'ok', 'table-caption', 3,
    '必须是 table 的第一个子元素，用于说明表格内容，利于无障碍。',
    [], '<table>\n  <caption>成绩表</caption>\n  <tr><th>姓名</th><th>分数</th></tr>\n  <tr><td>小明</td><td>95</td></tr>\n</table>',
    'caption { caption-side: top; font-weight: 700; padding: 6px; }'));

  /* ---------- 表单 ---------- */
  L.push(T('form', '收集用户输入的表单容器', '表单', 'ok', 'block', 5,
    '可包含各类控件。action 指定提交地址，method 指定请求方式。现代应用常用 JS 拦截 submit 事件。',
    [{ n: 'action', v: 'URL', r: false, e: 'action="/login"', d: '表单提交的服务器地址' },
     { n: 'method', v: 'get | post | dialog', r: false, e: 'method="post"', d: '提交方式' },
     { n: 'enctype', v: 'multipart/form-data | application/x-www-form-urlencoded | text/plain', r: false, e: 'enctype="multipart/form-data"', d: '编码类型，上传文件必填' },
     { n: 'novalidate', v: '布尔属性', r: false, e: 'novalidate', d: '关闭浏览器原生校验' },
     { n: 'autocomplete', v: 'on | off', r: false, e: 'autocomplete="off"', d: '是否允许自动填充' },
     { n: 'target', v: '_self | _blank', r: false, e: 'target="_blank"', d: '响应的打开位置' }],
    '<form action="#" method="post">\n  <label>用户名 <input name="user" required></label>\n  <button type="submit">提交</button>\n</form>', ''));

  L.push(T('input', '表单输入控件，通过 type 变化出多种形态', '表单', 'ok', 'inline-block', 5,
    '空元素。type 决定控件类型；value 为当前值；placeholder 为占位提示。务必配套 label 以保证可访问性。',
    [{ n: 'type', v: 'text | password | checkbox | radio | file | number | date | email | range | color …', r: false, e: 'type="email"', d: '控件类型，缺省为 text' },
     { n: 'name', v: '文本', r: false, e: 'name="email"', d: '提交时的字段名' },
     { n: 'value', v: '文本', r: false, e: 'value="默认值"', d: '控件当前值' },
     { n: 'placeholder', v: '文本', r: false, e: 'placeholder="请输入邮箱"', d: '未输入时的提示' },
     { n: 'required', v: '布尔属性', r: false, e: 'required', d: '必填校验' },
     { n: 'disabled', v: '布尔属性', r: false, e: 'disabled', d: '禁用控件（不提交）' },
     { n: 'readonly', v: '布尔属性', r: false, e: 'readonly', d: '只读（仍会提交）' },
     { n: 'min / max', v: '数字或日期', r: false, e: 'min="0" max="100"', d: '取值范围' },
     { n: 'pattern', v: '正则表达式', r: false, e: 'pattern="[0-9]{6}"', d: '格式校验规则' },
     { n: 'accept', v: 'MIME 或扩展名', r: false, e: 'accept="image/*"', d: '文件上传可接受类型' },
     { n: 'multiple', v: '布尔属性', r: false, e: 'multiple', d: '允许多选/多文件' },
     { n: 'checked', v: '布尔属性', r: false, e: 'checked', d: '默认选中（复选/单选）' }],
    '<form>\n  <p><input type="text" placeholder="文本框"></p>\n  <p><input type="email" placeholder="邮箱" required></p>\n  <p><input type="range" min="0" max="100" value="40"></p>\n  <p><input type="date"></p>\n  <p><label><input type="checkbox" checked> 同意协议</label></p>\n  <p><input type="color" value="#3b5bdb"></p>\n  <p><input type="file" accept="image/*"></p>\n</form>',
    'input { margin: 3px 0; padding: 5px 8px; }'));

  L.push(T('textarea', '多行文本输入框', '表单', 'ok', 'inline-block', 5,
    '非自闭合元素，起始标签之间的内容即默认值。rows/cols 控制初始尺寸。',
    [{ n: 'rows', v: '数字', r: false, e: 'rows="4"', d: '可见行数' },
     { n: 'cols', v: '数字', r: false, e: 'cols="40"', d: '可见列宽' },
     { n: 'placeholder', v: '文本', r: false, e: 'placeholder="说点什么…"', d: '占位提示' },
     { n: 'maxlength', v: '数字', r: false, e: 'maxlength="200"', d: '最大字符数' },
     { n: 'resize', v: '—', r: false, e: '', d: '拉伸行为由 CSS resize 控制', s: 'dep' }],
    '<textarea rows="4" cols="40" placeholder="请输入留言…">默认内容</textarea>',
    'textarea { width: 100%; border: 1px solid #ccc; border-radius: 6px; padding: 8px; }'));

  L.push(T('button', '可点击的按钮', '表单', 'ok', 'inline-block', 5,
    'type 默认为 submit，在表单内点击会提交表单——非提交按钮务必显式写 type="button"。',
    [{ n: 'type', v: 'submit | reset | button', r: false, e: 'type="button"', d: '按钮行为，缺省为 submit' },
     { n: 'disabled', v: '布尔属性', r: false, e: 'disabled', d: '禁用按钮' },
     { n: 'form', v: 'form 元素的 id', r: false, e: 'form="loginForm"', d: '关联的表单（可在表单外）' },
     { n: 'name / value', v: '文本', r: false, e: 'name="ok" value="1"', d: '提交时携带的键值' }],
    '<button type="button">普通按钮</button>\n<button type="submit">提交</button>\n<button type="reset">重置</button>\n<button disabled>禁用</button>',
    'button { margin: 3px; padding: 6px 14px; border-radius: 6px; border: 1px solid #3b5bdb; background: #3b5bdb; color: #fff; }'));

  L.push(T('select', '下拉选择框', '表单', 'ok', 'inline-block', 5,
    '选项由 option 构成，可用 optgroup 分组。multiple 开启多选，size 控制可见行数。',
    [{ n: 'name', v: '文本', r: false, e: 'name="city"', d: '提交字段名' },
     { n: 'multiple', v: '布尔属性', r: false, e: 'multiple', d: '允许多选' },
     { n: 'size', v: '数字', r: false, e: 'size="3"', d: '可见选项数，>1 时显示为列表' },
     { n: 'required', v: '布尔属性', r: false, e: 'required', d: '必选' }],
    '<select name="city">\n  <option value="">请选择城市</option>\n  <option value="bj">北京</option>\n  <option value="sh" selected>上海</option>\n  <option value="gz">广州</option>\n</select>',
    'select { padding: 5px 8px; border-radius: 6px; }'));

  L.push(T('option', '下拉列表中的选项', '表单', 'ok', 'block', 5,
    'value 为提交值，标签内文本为显示值。selected 指定默认选中。',
    [{ n: 'value', v: '文本', r: false, e: 'value="bj"', d: '提交的值' },
     { n: 'selected', v: '布尔属性', r: false, e: 'selected', d: '默认选中' },
     { n: 'disabled', v: '布尔属性', r: false, e: 'disabled', d: '禁用该选项' }],
    '<select>\n  <option value="1" selected>选项一</option>\n  <option value="2" disabled>选项二（禁用）</option>\n</select>', ''));

  L.push(T('optgroup', '为下拉选项分组', '表单', 'ok', 'block', 2,
    'label 为组名，组本身不可被选中。',
    [{ n: 'label', v: '文本', r: true, e: 'label="华东"', d: '分组名称' },
     { n: 'disabled', v: '布尔属性', r: false, e: 'disabled', d: '禁用整组' }],
    '<select>\n  <optgroup label="华东">\n    <option>上海</option><option>杭州</option>\n  </optgroup>\n  <optgroup label="华南">\n    <option>广州</option><option>深圳</option>\n  </optgroup>\n</select>', ''));

  L.push(T('label', '表单控件的文字标签', '表单', 'ok', 'inline', 5,
    'for 指向控件 id，或把控件包在 label 内。点击标签会聚焦控件，是无障碍的基础。',
    [{ n: 'for', v: '控件 id', r: false, e: 'for="username"', d: '关联的控件 id' }],
    '<p><label for="username">用户名：</label>\n<input id="username" type="text"></p>\n<p><label><input type="checkbox"> 记住我</label></p>', ''));

  L.push(T('fieldset', '将表单内的相关控件分组', '表单', 'ok', 'block', 3,
    '常与 legend 搭配，disabled 可一次性禁用整组控件。',
    [{ n: 'disabled', v: '布尔属性', r: false, e: 'disabled', d: '禁用整组控件' },
     { n: 'form', v: 'form id', r: false, e: 'form="f1"', d: '关联的表单 id' }],
    '<fieldset>\n  <legend>收货信息</legend>\n  <label>姓名 <input name="name"></label>\n  <label>电话 <input name="tel"></label>\n</fieldset>',
    'fieldset { border: 1px solid #ccc; border-radius: 8px; padding: 10px 14px; }'));

  L.push(T('legend', 'fieldset 分组的标题', '表单', 'ok', 'block', 3, '必须是 fieldset 的第一个子元素。', [], '<legend>分组标题</legend>', 'legend { font-weight: 700; padding: 0 6px; }'));

  L.push(T('datalist', '为输入框提供候选值列表', '表单', 'ok', 'none', 3,
    '通过 input 的 list 属性关联，用户输入时给出建议但不受限。',
    [{ n: 'id', v: 'id', r: true, e: 'id="browsers"', d: '供 input list 引用' }],
    '<input list="browsers" placeholder="输入或选择浏览器">\n<datalist id="browsers">\n  <option value="Chrome">\n  <option value="Firefox">\n  <option value="Safari">\n  <option value="Edge">\n</datalist>', ''));

  L.push(T('output', '显示计算结果或脚本输出', '表单', 'ok', 'inline', 2,
    '语义上表示计算结果，常配合 form 的 oninput 使用。',
    [{ n: 'for', v: 'id 列表', r: false, e: 'for="a b"', d: '参与的控件 id' },
     { n: 'name', v: '文本', r: false, e: 'name="sum"', d: '提交时的字段名' }],
    '<form>\n  <input type="number" id="a" value="2"> +\n  <input type="number" id="b" value="3"> =\n  <output name="result" for="a b">5</output>\n</form>', ''));

  L.push(T('progress', '显示任务的完成进度', '表单', 'ok', 'inline-block', 3,
    'value 为当前进度，缺省时显示为不确定状态的动画条。',
    [{ n: 'value', v: '数字', r: false, e: 'value="70"', d: '当前进度值' },
     { n: 'max', v: '数字', r: false, e: 'max="100"', d: '进度最大值' }],
    '<p>下载进度</p>\n<progress value="70" max="100"></progress>\n<p>不确定状态</p>\n<progress></progress>', ''));

  L.push(T('meter', '显示已知范围内的标量测量值', '表单', 'ok', 'inline-block', 2,
    '表示磁盘用量、评分等静态测量值，不要用于任务进度（用 progress）。',
    [{ n: 'value', v: '数字', r: true, e: 'value="6"', d: '当前值' },
     { n: 'min / max', v: '数字', r: false, e: 'min="0" max="10"', d: '取值范围' },
     { n: 'low / high', v: '数字', r: false, e: 'low="3" high="8"', d: '低/高阈值，影响配色' },
     { n: 'optimum', v: '数字', r: false, e: 'optimum="9"', d: '最优值' }],
    '<meter value="6" min="0" max="10" low="3" high="8" optimum="9"></meter>\n<meter value="2" min="0" max="10"></meter>', ''));

  /* ---------- 多媒体与嵌入 ---------- */
  L.push(T('img', '嵌入图片', '多媒体', 'ok', 'inline-block', 5,
    '空元素。alt 是必需的无障碍属性；loading="lazy" 可延迟加载；width/height 可避免布局跳动。',
    [{ n: 'src', v: 'URL', r: true, e: 'src="photo.jpg"', d: '图片地址' },
     { n: 'alt', v: '文本', r: true, e: 'alt="一只猫"', d: '替代文本，图片无法显示时呈现' },
     { n: 'width / height', v: '像素', r: false, e: 'width="200"', d: '尺寸，用于预留空间' },
     { n: 'loading', v: 'lazy | eager', r: false, e: 'loading="lazy"', d: '懒加载策略' },
     { n: 'srcset', v: 'URL 与宽度描述', r: false, e: 'srcset="a.jpg 400w, b.jpg 800w"', d: '响应式图源候选' },
     { n: 'sizes', v: '媒体条件与尺寸', r: false, e: 'sizes="(max-width:600px) 100vw, 50vw"', d: '配合 srcset 描述显示尺寸' },
     { n: 'decoding', v: 'sync | async | auto', r: false, e: 'decoding="async"', d: '解码方式提示' }],
    '<img src="https://placehold.co/240x120/3b5bdb/ffffff?text=HTML" alt="占位图" width="240" height="120" loading="lazy">',
    'img { border-radius: 10px; }'));

  L.push(T('picture', '为图片提供多源选择，实现响应式图片', '多媒体', 'ok', 'inline', 3,
    '内含多个 source 与一个 img。浏览器按顺序选择第一个匹配的 source，img 为降级兜底。',
    [], '<picture>\n  <source media="(min-width:800px)" srcset="https://placehold.co/400x120/0f7b52/fff?text=Wide">\n  <source media="(min-width:400px)" srcset="https://placehold.co/300x120/a86404/fff?text=Medium">\n  <img src="https://placehold.co/240x120/3b5bdb/fff?text=Small" alt="响应式图片">\n</picture>', ''));

  L.push(T('source', '为 picture / audio / video 指定媒体资源', '多媒体', 'ok', 'none', 3,
    '空元素。srcset 或 src 指定地址，type 声明 MIME，浏览器据此挑选可用源。',
    [{ n: 'src', v: 'URL', r: false, e: 'src="video.mp4"', d: '资源地址（音视频用）' },
     { n: 'srcset', v: 'URL 列表', r: false, e: 'srcset="a.webp"', d: '资源候选（picture 用）' },
     { n: 'type', v: 'MIME 类型', r: false, e: 'type="video/mp4"', d: '资源类型，用于快速判断是否支持' },
     { n: 'media', v: '媒体查询', r: false, e: 'media="(min-width:800px)"', d: '生效条件' }],
    '<video controls width="260">\n  <source src="demo.webm" type="video/webm">\n  <source src="demo.mp4" type="video/mp4">\n  你的浏览器不支持 video。\n</video>', ''));

  L.push(T('audio', '嵌入音频播放器', '多媒体', 'ok', 'inline-block', 4,
    'controls 显示播放控件；autoplay 多数浏览器需配合 muted 才生效。',
    [{ n: 'src', v: 'URL', r: false, e: 'src="music.mp3"', d: '音频地址' },
     { n: 'controls', v: '布尔属性', r: false, e: 'controls', d: '显示播放控件' },
     { n: 'autoplay', v: '布尔属性', r: false, e: 'autoplay', d: '自动播放（常被浏览器限制）' },
     { n: 'loop', v: '布尔属性', r: false, e: 'loop', d: '循环播放' },
     { n: 'muted', v: '布尔属性', r: false, e: 'muted', d: '静音' },
     { n: 'preload', v: 'none | metadata | auto', r: false, e: 'preload="metadata"', d: '预加载策略' }],
    '<audio controls src="https://www.w3schools.com/html/horse.mp3">\n  你的浏览器不支持 audio 元素。\n</audio>', ''));

  L.push(T('video', '嵌入视频播放器', '多媒体', 'ok', 'inline-block', 4,
    'poster 指定封面图；playsinline 在移动端内联播放。字幕用 track 提供。',
    [{ n: 'src', v: 'URL', r: false, e: 'src="movie.mp4"', d: '视频地址' },
     { n: 'controls', v: '布尔属性', r: false, e: 'controls', d: '显示控件' },
     { n: 'poster', v: 'URL', r: false, e: 'poster="cover.jpg"', d: '封面图' },
     { n: 'width / height', v: '像素', r: false, e: 'width="480"', d: '播放器尺寸' },
     { n: 'loop', v: '布尔属性', r: false, e: 'loop', d: '循环播放' },
     { n: 'muted', v: '布尔属性', r: false, e: 'muted', d: '静音' },
     { n: 'playsinline', v: '布尔属性', r: false, e: 'playsinline', d: '移动端内联播放' }],
    '<video controls width="300" poster="https://placehold.co/300x170/3b5bdb/fff?text=Cover">\n  <source src="demo.mp4" type="video/mp4">\n  你的浏览器不支持 video。\n</video>', ''));

  L.push(T('track', '为音视频提供字幕、章节等文本轨道', '多媒体', 'ok', 'none', 2,
    '空元素。kind 决定轨道类型（字幕/说明/章节/元数据）。',
    [{ n: 'src', v: 'URL', r: true, e: 'src="sub.vtt"', d: 'WebVTT 文件地址' },
     { n: 'kind', v: 'subtitles | captions | descriptions | chapters | metadata', r: false, e: 'kind="subtitles"', d: '轨道类型' },
     { n: 'srclang', v: '语言代码', r: false, e: 'srclang="zh"', d: '轨道语言' },
     { n: 'label', v: '文本', r: false, e: 'label="中文字幕"', d: '显示在菜单中的名称' },
     { n: 'default', v: '布尔属性', r: false, e: 'default', d: '默认启用该轨道' }],
    '<video controls width="300" src="demo.mp4">\n  <track kind="subtitles" src="sub-zh.vtt" srclang="zh" label="中文" default>\n</video>', ''));

  L.push(T('canvas', '位图画布，通过 JavaScript 绘制图形', '多媒体', 'ok', 'inline-block', 4,
    '必须用 JS 获取 2d 或 webgl 上下文后绘制。width/height 是画布像素尺寸，不要用 CSS 拉伸。',
    [{ n: 'width', v: '像素', r: false, e: 'width="300"', d: '画布宽度，默认 300' },
     { n: 'height', v: '像素', r: false, e: 'height="150"', d: '画布高度，默认 150' }],
    '<canvas id="cv" width="280" height="140"></canvas>\n<p class="small dim">画面由下方 JavaScript 面板绘制（点击画布会留下彩色圆点）</p>', ''));

  L.push(T('svg', '嵌入可缩放矢量图形', '多媒体', 'ok', 'inline', 4,
    '矢量图形，放大不失真。viewBox 定义坐标系，内部元素可用 CSS 与 JS 控制。',
    [{ n: 'width / height', v: '长度', r: false, e: 'width="200"', d: '显示尺寸' },
     { n: 'viewBox', v: 'min-x min-y width height', r: false, e: 'viewBox="0 0 100 100"', d: '内部坐标系统' },
     { n: 'fill', v: '颜色', r: false, e: 'fill="#3b5bdb"', d: '默认填充色' },
     { n: 'xmlns', v: '命名空间', r: false, e: 'xmlns="http://www.w3.org/2000/svg"', d: '独立 .svg 文件必需' }],
    '<svg width="220" height="120" viewBox="0 0 220 120">\n  <rect x="10" y="10" width="90" height="100" rx="10" fill="#3b5bdb"></rect>\n  <circle cx="160" cy="60" r="46" fill="#4ddba0"></circle>\n  <text x="16" y="66" fill="#fff" font-size="14">SVG</text>\n</svg>', ''));

  L.push(T('math', '嵌入 MathML 数学公式', '多媒体', 'ok', 'inline', 1,
    '用于展示结构化数学记号。现代浏览器已逐步支持 MathML Core。',
    [], '<math display="inline">\n  <mfrac><mn>1</mn><mn>2</mn></mfrac>\n</math>', ''));

  L.push(T('iframe', '在当前页面嵌入另一个文档', '多媒体', 'ok', 'inline', 4,
    'sandbox 限制子页面权限是安全最佳实践；allow 控制摄像头等能力。',
    [{ n: 'src', v: 'URL', r: false, e: 'src="https://example.com"', d: '嵌入文档地址' },
     { n: 'srcdoc', v: 'HTML 源码', r: false, e: 'srcdoc="<p>内联内容</p>"', d: '直接以内联 HTML 作为内容' },
     { n: 'sandbox', v: 'allow-scripts | allow-same-origin | allow-forms …', r: false, e: 'sandbox="allow-scripts"', d: '安全沙箱限制' },
     { n: 'loading', v: 'lazy | eager', r: false, e: 'loading="lazy"', d: '懒加载' },
     { n: 'allow', v: '权限列表', r: false, e: 'allow="camera; microphone"', d: '授予的能力' },
     { n: 'title', v: '文本', r: false, e: 'title="嵌入演示"', d: '无障碍名称' }],
    '<iframe srcdoc="<h3 style=\'font-family:sans-serif\'>内联 iframe 内容</h3><p style=\'font-family:sans-serif\'>可直接写 HTML 源码</p>" width="320" height="140" title="示例"></iframe>', ''));

  L.push(T('embed', '嵌入外部内容或插件', '多媒体', 'ok', 'inline', 2,
    '早期用于 Flash 等插件，现在多用于嵌入 PDF 等。已非首选，可用 iframe 或 object 替代。',
    [{ n: 'src', v: 'URL', r: true, e: 'src="doc.pdf"', d: '资源地址' },
     { n: 'type', v: 'MIME 类型', r: false, e: 'type="application/pdf"', d: '资源类型' },
     { n: 'width / height', v: '像素', r: false, e: 'width="400"', d: '尺寸' }],
    '<embed src="doc.pdf" type="application/pdf" width="320" height="200">', ''));

  L.push(T('object', '嵌入外部资源（图片、音频、视频、PDF 等）', '多媒体', 'ok', 'inline', 1,
    '通用嵌入容器，标签内的内容为降级显示。现代开发中较少使用。',
    [{ n: 'data', v: 'URL', r: true, e: 'data="demo.svg"', d: '资源地址' },
     { n: 'type', v: 'MIME 类型', r: false, e: 'type="image/svg+xml"', d: '资源类型' },
     { n: 'width / height', v: '像素', r: false, e: 'width="300"', d: '尺寸' }],
    '<object data="demo.svg" type="image/svg+xml" width="240" height="120">\n  <p>无法显示时的降级文本</p>\n</object>', ''));

  L.push(T('param', '为 object 元素传递参数', '多媒体', 'ok', 'none', 1,
    '空元素，已基本被现代 API 取代。',
    [{ n: 'name', v: '文本', r: true, e: 'name="autoplay"', d: '参数名' },
     { n: 'value', v: '文本', r: false, e: 'value="true"', d: '参数值' }],
    '<object data="demo.swf">\n  <param name="quality" value="high">\n</object>', ''));

  L.push(T('map', '定义图像映射（可点击区域）', '多媒体', 'ok', 'inline', 2,
    '通过 name 与 img 的 usemap 关联；内部由 area 定义热区坐标。',
    [{ n: 'name', v: '文本', r: true, e: 'name="mymap"', d: '映射名称，供 usemap 引用' }],
    '<img src="https://placehold.co/240x120/3b5bdb/fff?text=Map" usemap="#mymap" alt="映射图" width="240" height="120">\n<map name="mymap">\n  <area shape="rect" coords="0,0,120,120" href="#a" alt="左半区">\n  <area shape="rect" coords="120,0,240,120" href="#b" alt="右半区">\n</map>', ''));

  L.push(T('area', '定义图像映射中的可点击区域', '多媒体', 'ok', 'none', 2,
    '空元素。shape 决定形状，coords 给出坐标。',
    [{ n: 'shape', v: 'rect | circle | poly | default', r: false, e: 'shape="circle"', d: '热区形状' },
     { n: 'coords', v: '坐标串', r: false, e: 'coords="60,60,40"', d: '坐标值，含义随 shape 变化' },
     { n: 'href', v: 'URL', r: false, e: 'href="#top"', d: '点击后跳转' },
     { n: 'alt', v: '文本', r: false, e: 'alt="区域说明"', d: '替代文本' }],
    '<map name="m">\n  <area shape="circle" coords="60,60,50" href="#" alt="圆形热区">\n</map>', ''));

  L.push(T('figure', '独立的图文内容单元，常含图片、代码、图表', '多媒体', 'ok', 'block', 4,
    '语义为“可独立引用的一段流内容”，通常配合 figcaption 添加说明。',
    [], '<figure>\n  <img src="https://placehold.co/220x110/3b5bdb/fff?text=Chart" alt="图表">\n  <figcaption>图 1：月度增长趋势</figcaption>\n</figure>',
    'figure { margin: 0; }\nfigcaption { font-size: 12.5px; color: #777; text-align: center; }'));

  L.push(T('figcaption', 'figure 的标题或说明文字', '多媒体', 'ok', 'block', 4, '必须是 figure 的第一个或最后一个子元素。', [], '<figcaption>图 1 说明</figcaption>', ''));

  /* ---------- 交互元素 ---------- */
  L.push(T('details', '可展开/折叠的内容块，无需 JavaScript', '交互', 'ok', 'block', 4,
    '原生折叠面板，summary 作为可见标题。open 属性控制默认展开，toggle 事件可监听状态。',
    [{ n: 'open', v: '布尔属性', r: false, e: 'open', d: '默认展开' },
     { n: 'name', v: '文本', r: false, e: 'name="faq"', d: '互斥展开组名（相同 name 只能展开一个）' }],
    '<button id="toggleAll">全部收起</button>\n<details open>\n  <summary>什么是 HTML？</summary>\n  <p>HTML 是用于创建网页的标准标记语言。</p>\n</details>\n<details>\n  <summary>什么是 CSS？</summary>\n  <p>CSS 用于描述 HTML 的呈现样式。</p>\n</details>',
    'summary { cursor: pointer; font-weight: 600; }'));

  L.push(T('summary', 'details 元素的可见标题', '交互', 'ok', 'list-item', 4,
    '必须是 details 的第一个子元素。可自定义 ::marker 箭头样式。',
    [], '<details>\n  <summary>点击展开</summary>\n  <p>隐藏的内容</p>\n</details>',
    'summary::marker { color: #3b5bdb; }'));

  L.push(T('dialog', '原生模态 / 非模态对话框', '交互', 'ok', 'none', 3,
    '配合 showModal() / show() / close() 使用。::backdrop 可定制遮罩，ESC 自动关闭。',
    [{ n: 'open', v: '布尔属性', r: false, e: 'open', d: '显示对话框（非模态）' }],
    '<dialog id="dlg">\n  <p>这是一个原生对话框</p>\n  <form method="dialog">\n    <button value="cancel">关闭</button>\n  </form>\n</dialog>\n<button id="openDlg">打开对话框</button>',
    'dialog::backdrop { background: rgba(0,0,0,.45); }'));

  L.push(T('slot', 'Web Components 中的内容分发插槽', '交互', 'ok', 'none', 1,
    '用于 Shadow DOM 模板，把宿主元素的内容投射到指定位置。name 定义具名插槽。',
    [{ n: 'name', v: '文本', r: false, e: 'name="title"', d: '插槽名称' }],
    '<template id="card-tpl">\n  <div><slot name="title">默认标题</slot></div>\n  <div><slot></slot></div>\n</template>', ''));

  L.push(T('template', '声明不立即渲染的 HTML 片段模板', '交互', 'ok', 'none', 2,
    '内容在解析时不会被渲染也不会请求资源，需通过 JS 克隆后插入文档。',
    [], '<template id="cardTpl">\n  <div class="ucard"><b class="name"></b> · <span class="role"></span></div>\n</template>', ''));

  /* ---------- 已弃用 / 已废弃 ---------- */
  L.push(T('acronym', '标注首字母缩写词', '已弃用', 'dep', 'inline', 1,
    '与 abbr 功能重复，W3C 明确推荐改用 abbr。',
    [{ n: 'title', v: '文本', r: false, e: 'title="As Soon As Possible"', d: '缩写全称', s: 'dep' }],
    '<acronym title="HyperText Markup Language">HTML</acronym>', '',
    { r: '与 abbr 语义重复，HTML5 中已被移除规范，仅保留向前兼容。',
      a: '使用 <abbr> 替代，功能完全一致。',
      o: '<acronym title="HyperText Markup Language">HTML</acronym>',
      n: '<abbr title="HyperText Markup Language">HTML</abbr>' }));

  L.push(T('applet', '嵌入 Java 小程序', '已弃用', 'obs', 'inline', 1,
    '依赖 Java 插件，已被彻底移除。',
    [{ n: 'code', v: '类名', r: false, e: 'code="Demo.class"', d: '小程序类文件', s: 'obs' },
     { n: 'width / height', v: '像素', r: false, e: 'width="300"', d: '尺寸', s: 'obs' }],
    '<applet code="Demo.class" width="300" height="200"></applet>', '',
    { r: '依赖 NPAPI 插件（Java），现代浏览器已全部移除插件支持，存在严重安全隐患。',
      a: '改用 <object>、<embed> 或完全重写的 Web 技术（HTML/CSS/JS、WebAssembly）。',
      o: '<applet code="Demo.class" width="300" height="200"></applet>',
      n: '<object type="application/x-java-applet" width="300" height="200">\n  <p>请升级为现代 Web 实现</p>\n</object>' }));

  L.push(T('basefont', '为文档设置默认字体', '已弃用', 'dep', 'none', 1,
    '表现层属性应由 CSS 承担。',
    [{ n: 'size', v: '1-7', r: false, e: 'size="3"', d: '字体大小', s: 'dep' },
     { n: 'face', v: '字体名', r: false, e: 'face="Arial"', d: '字体系列', s: 'dep' },
     { n: 'color', v: '颜色', r: false, e: 'color="#333"', d: '字体颜色', s: 'dep' }],
    '<basefont face="Arial" size="3" color="#333">\n<p>这段文字受 basefont 影响</p>', '',
    { r: '纯表现型元素，违反“结构与样式分离”原则，CSS 可完全替代且更灵活。',
      a: '在 CSS 中为 body 或具体选择器设置 font-family / font-size / color。',
      o: '<basefont face="Arial" size="3" color="#333">',
      n: 'body {\n  font-family: Arial, sans-serif;\n  font-size: 16px;\n  color: #333;\n}' }));

  L.push(T('big', '把字号放大一级', '已弃用', 'dep', 'inline', 1,
    '仅改变外观，无语义。',
    [], '普通文字 <big>放大的文字</big>', '',
    { r: '纯表现型元素，无语义，且只能放大固定一级，无法精确控制。',
      a: '使用 CSS font-size，或需要强调语义时用 <strong> / <em>。',
      o: '<big>放大文字</big>',
      n: '<span style="font-size: 1.2em">放大文字</span>' }));

  L.push(T('center', '将内容水平居中', '已弃用', 'dep', 'block', 1,
    '表现型容器，应使用 CSS 布局。',
    [], '<center>\n  <p>居中的段落</p>\n</center>', '',
    { r: '纯表现型元素，语义应为“居中显示”这一视觉需求，属于样式职责。',
      a: '文本用 text-align: center；块级盒子用 margin: 0 auto；复杂布局用 Flex / Grid。',
      o: '<center>\n  <p>居中内容</p>\n</center>',
      n: '<div style="text-align: center">\n  <p>居中内容</p>\n</div>' }));

  L.push(T('dir', '目录式列表', '已弃用', 'dep', 'block', 1,
    '与 ul 功能重复，规范已移除。',
    [], '<dir>\n  <li>文件一</li>\n  <li>文件二</li>\n</dir>', '',
    { r: '与 <ul> 功能完全重复，规范判定为冗余元素。',
      a: '直接使用 <ul>。',
      o: '<dir>\n  <li>文件一</li>\n</dir>',
      n: '<ul>\n  <li>文件一</li>\n</ul>' }));

  L.push(T('font', '设置文字的字体、大小与颜色', '已弃用', 'dep', 'inline', 1,
    '最典型的被 CSS 取代的标签。',
    [{ n: 'color', v: '颜色', r: false, e: 'color="red"', d: '文字颜色', s: 'dep' },
     { n: 'size', v: '1-7', r: false, e: 'size="4"', d: '字号', s: 'dep' },
     { n: 'face', v: '字体名', r: false, e: 'face="Verdana"', d: '字体', s: 'dep' }],
    '<font color="red" size="4" face="Verdana">红色大号文字</font>', '',
    { r: '结构与样式混淆，维护成本高，无法响应式、无法复用，是 CSS 诞生的直接动因之一。',
      a: '改用 CSS 的 font-* / color 属性，推荐用类名统一管理。',
      o: '<font color="red" size="4" face="Verdana">红色文字</font>',
      n: '<style>\n  .danger-text {\n    color: #c02a2a;\n    font-size: 18px;\n    font-family: Verdana, sans-serif;\n  }\n</style>\n<span class="danger-text">红色文字</span>' }));

  L.push(T('frame', '定义框架窗口中的一个子窗口', '已弃用', 'obs', 'none', 1,
    '只能用于 frameset 中。',
    [{ n: 'src', v: 'URL', r: false, e: 'src="left.html"', d: '子窗口文档', s: 'obs' },
     { n: 'name', v: '文本', r: false, e: 'name="left"', d: '窗口名', s: 'obs' }],
    '<frameset cols="30%,70%">\n  <frame src="left.html" name="left">\n  <frame src="main.html" name="main">\n</frameset>', '',
    { r: '框架集导致 URL 无法分享、SEO 不可见、打印与无障碍支持极差，已被标准移除。',
      a: '改用 <iframe> 嵌入局部内容，或用前端路由 + 组件构建单页应用。',
      o: '<frameset cols="30%,70%">\n  <frame src="left.html">\n  <frame src="main.html">\n</frameset>',
      n: '<div class="layout">\n  <aside>…</aside>\n  <main>\n    <iframe src="left.html" title="侧栏"></iframe>\n  </main>\n</div>' }));

  L.push(T('frameset', '定义框架集布局', '已弃用', 'obs', 'none', 1,
    '替代 body 使用，已彻底废弃。',
    [{ n: 'rows / cols', v: '尺寸列表', r: false, e: 'cols="30%,70%"', d: '行/列划分', s: 'obs' }],
    '<frameset cols="25%,75%">\n  <frame src="nav.html">\n  <frame src="content.html">\n</frameset>', '',
    { r: '框架集破坏文档结构与可访问性，HTML5 已完全移除该元素。',
      a: '使用 CSS 布局（Flex / Grid）划分页面区域。',
      o: '<frameset cols="25%,75%">\n  <frame src="nav.html">\n</frameset>',
      n: '<div style="display: grid; grid-template-columns: 25% 75%">\n  <nav>…</nav>\n  <main>…</main>\n</div>' }));

  L.push(T('isindex', '在页面中生成一个搜索输入框', '已弃用', 'obs', 'none', 1,
    '早期用于让浏览器自动生成查询输入，功能被 form 完全取代。',
    [{ n: 'prompt', v: '文本', r: false, e: 'prompt="请输入关键词"', d: '提示文字', s: 'obs' }],
    '<isindex prompt="搜索：">', '',
    { r: '功能单一且由浏览器实现，标准早已移除。',
      a: '使用标准表单：<form> + <input type="search">。',
      o: '<isindex prompt="搜索：">',
      n: '<form action="/search">\n  <input type="search" name="q" placeholder="搜索：">\n  <button>搜索</button>\n</form>' }));

  L.push(T('noframes', '为不支持框架的浏览器提供替代内容', '已弃用', 'obs', 'block', 1,
    '随 frameset 一起被移除。',
    [], '<noframes><p>请使用支持框架的浏览器</p></noframes>', '',
    { r: '随框架集一同废弃；现代浏览器均不支持 frame，该元素失去意义。',
      a: '无需使用，直接书写正常内容即可。',
      o: '<noframes><p>请使用支持框架的浏览器</p></noframes>',
      n: '<p>所有现代浏览器均可正常浏览本页内容</p>' }));

  L.push(T('strike', '为文字添加删除线', '已弃用', 'dep', 'inline', 1,
    '表现型元素，被语义化的 del / s 取代。',
    [], '<strike>带删除线的文字</strike>', '',
    { r: '只表达视觉效果，无法说明“删除”还是“过时”，不利于语义与无障碍。',
      a: '表示已删除用 <del>；表示已过时/不再准确用 <s>；纯装饰用 CSS text-decoration。',
      o: '<strike>原价 199</strike>',
      n: '<del>原价 199</del>  <!-- 或 -->\n<span style="text-decoration: line-through">原价 199</span>' }));

  L.push(T('tt', '等宽字体（打字机风格）文本', '已弃用', 'dep', 'inline', 1,
    '表现型元素。',
    [], '<tt>等宽文字</tt>', '',
    { r: '仅描述外观，未表达“这是代码”的语义。',
      a: '表示代码用 <code>；键盘输入用 <kbd>；程序输出用 <samp>；纯等宽用 font-family: monospace。',
      o: '<tt>console.log()</tt>',
      n: '<code>console.log()</code>' }));

  L.push(T('u', '为文字添加下划线', '已弃用', 'dep', 'inline', 2,
    'HTML5 中曾被重新定义为“标注拼写错误或专有名词”，但兼容性差，仍建议用 CSS。',
    [], '<u>带下划线的文字</u>', '',
    { r: '下划线在 Web 中已被默认为“链接”的视觉约定，滥用会误导用户；作为纯表现元素应交给 CSS。',
      a: '需要强调语义用 <em> / <strong>；仅需下划线用 CSS text-decoration: underline；标注拼写错误可用 <u>（HTML5 语义）。',
      o: '<u>下划线文字</u>',
      n: '<span style="text-decoration: underline; text-underline-offset: 3px">下划线文字</span>' }));

  L.push(T('xmp', '原样显示内容而不解析 HTML', '已弃用', 'obs', 'block', 1,
    '早期用于展示代码示例，被 pre 取代。',
    [], '<xmp>\n<p>这段标签会被当作纯文本</p>\n</xmp>', '',
    { r: '与 <pre> 功能重复，且会造成解析歧义，已完全移除。',
      a: '使用 <pre> 并对 < > & 做 HTML 转义，或 <pre><code> 组合。',
      o: '<xmp>\n<p>示例代码</p>\n</xmp>',
      n: '<pre><code>&lt;p&gt;示例代码&lt;/p&gt;</code></pre>' }));

  L.push(T('marquee', '滚动字幕（跑马灯）效果', '已弃用', 'nostd', 'block', 1,
    '非标准元素，虽然部分浏览器仍支持，但强烈不建议使用。',
    [{ n: 'behavior', v: 'scroll | slide | alternate', r: false, e: 'behavior="alternate"', d: '滚动方式', s: 'nostd' },
     { n: 'direction', v: 'left | right | up | down', r: false, e: 'direction="left"', d: '滚动方向', s: 'nostd' },
     { n: 'scrollamount', v: '数字', r: false, e: 'scrollamount="6"', d: '滚动速度', s: 'nostd' }],
    '<marquee behavior="alternate" scrollamount="6">这段文字会来回滚动</marquee>', '',
    { r: '从未进入 W3C 标准；会造成可访问性问题、无法暂停、消耗性能，且行为在各浏览器不一致。',
      a: '使用 CSS 动画（@keyframes + transform）实现滚动，并提供 prefers-reduced-motion 降级。',
      o: '<marquee behavior="scroll" scrollamount="6">滚动文字</marquee>',
      n: '<style>\n  .marquee { overflow: hidden; white-space: nowrap; }\n  .marquee span {\n    display: inline-block;\n    animation: slide 8s linear infinite;\n  }\n  @keyframes slide {\n    from { transform: translateX(100%); }\n    to   { transform: translateX(-100%); }\n  }\n  @media (prefers-reduced-motion: reduce) {\n    .marquee span { animation: none; }\n  }\n</style>\n<div class="marquee"><span>滚动文字</span></div>' }));

  L.push(T('blink', '让文字闪烁', '已弃用', 'nostd', 'inline', 1,
    '从未标准化，且对光敏感人群不友好，浏览器已基本停止支持。',
    [], '<blink>闪烁的文字</blink>', '',
    { r: '非标准元素；闪烁内容会引发不适甚至诱发光敏性癫痫，可访问性极差。',
      a: '用 CSS animation 控制透明度，并务必尊重 prefers-reduced-motion；多数情况下不应该使用闪烁效果。',
      o: '<blink>闪烁文字</blink>',
      n: '<style>\n  .blink { animation: blink 1s steps(2, start) infinite; }\n  @keyframes blink { 50% { opacity: 0 } }\n  @media (prefers-reduced-motion: reduce) { .blink { animation: none } }\n</style>\n<span class="blink">闪烁文字</span>' }));

  L.push(T('plaintext', '将其后所有内容视为纯文本', '已弃用', 'obs', 'none', 1,
    '没有闭合标签，会吞掉后续所有内容，极其危险。',
    [], '<plaintext>\n<p>之后的全部内容都是纯文本</p>', '',
    { r: '无闭合标签、会造成整页解析异常，早已从标准中彻底移除。',
      a: '使用 <pre> 并转义特殊字符。',
      o: '<plaintext>\n<p>纯文本</p>',
      n: '<pre>&lt;p&gt;纯文本&lt;/p&gt;</pre>' }));

  L.push(T('listing', '原样显示预格式化文本', '已弃用', 'obs', 'block', 1,
    '与 pre 功能重复，已移除。',
    [], '<listing>\n示例代码\n</listing>', '',
    { r: '与 <pre> 重复，且解析规则怪异（内部换行会被特殊处理），已被移除。',
      a: '使用 <pre>。',
      o: '<listing>\n示例代码\n</listing>',
      n: '<pre>示例代码</pre>' }));

  L.push(T('keygen', '生成密钥对的表单控件', '已弃用', 'obs', 'inline-block', 1,
    '曾用于证书申请，因安全问题与兼容性差被移除。',
    [{ n: 'name', v: '文本', r: false, e: 'name="key"', d: '字段名', s: 'obs' },
     { n: 'keytype', v: 'RSA | DSA | EC', r: false, e: 'keytype="RSA"', d: '密钥类型', s: 'obs' }],
    '<keygen name="key" keytype="RSA">', '',
    { r: '规范定义模糊、浏览器实现差异大，且存在安全与交互问题，已从标准移除。',
      a: '使用 Web Crypto API 在 JS 中生成密钥。',
      o: '<keygen name="key" keytype="RSA">',
      n: 'const keys = await crypto.subtle.generateKey(\n  { name: "RSA-OAEP", modulusLength: 2048,\n    publicExponent: new Uint8Array([1, 0, 1]),\n    hash: "SHA-256" },\n  true, ["encrypt", "decrypt"]\n);' }));

  L.push(T('menuitem', '定义菜单项命令', '已弃用', 'obs', 'none', 1,
    '仅 Firefox 曾实现，标准已移除。',
    [{ n: 'label', v: '文本', r: false, e: 'label="刷新"', d: '显示文字', s: 'obs' },
     { n: 'icon', v: 'URL', r: false, e: 'icon="i.png"', d: '图标', s: 'obs' }],
    '<menu type="context">\n  <menuitem label="刷新"></menuitem>\n</menu>', '',
    { r: '仅 Firefox 实现过，缺乏跨浏览器支持，已从 HTML 标准中删除。',
      a: '自行用 <button> / <li> 配合 JavaScript 构建右键菜单或下拉菜单。',
      o: '<menu type="context">\n  <menuitem label="刷新"></menuitem>\n</menu>',
      n: '<ul class="context-menu" hidden>\n  <li><button type="button" onclick="location.reload()">刷新</button></li>\n</ul>' }));

  window.TAG_DATA = L;

  window.TAG_CATS = ['文档结构', '语义化', '文本', '列表', '链接', '表格', '表单', '多媒体', '脚本', '交互', '已弃用'];

  window.STATUS_META = {
    ok: { label: '现行', cls: 'ok', icon: '✅' },
    dep: { label: '已弃用', cls: 'dep', icon: '⚠️' },
    obs: { label: '已废弃', cls: 'obs', icon: '❌' },
    nostd: { label: '非标准', cls: 'nostd', icon: '🧪' }
  };
})();
