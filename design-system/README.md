# 单屏玩具 · One-Screen Toys

一套从三个中文互动网页玩具反推出的设计系统：一个案件回放（弹幕侦探）、一间股票柜台（三国交易所）、一块音效键盘（给这段乱配音）。它们共享同一副骨架——仪表式面板、等宽读数、44px 触控底线、克制的中文文案——各自拥有独立的世界（夜色监测屏 / 纸张账本 / 淡紫配音台）。

## Product Overview

The source product is a set of three single-page toy apps maintained by one author. 源产品是一个由同一作者维护的小型「玩具集」：每个玩具都是可离线打开的单页应用，浏览器直接运行，不需要登录或后端。弹幕侦探让玩家在三条监控线索之间切换、提交两条推理并得到结案评分；三国交易所把《三国演义》的二十个剧情节点做成实时行情，玩家用 10,000 铜钱买卖十一家势力并查看分时线与 K 线；给这段乱配音则让用户导入或使用示例短片，按时机敲击六个音效键并回放录音。三者的共同能力是：一屏完成、状态显式可见、数字等宽对齐、场景用 CSS 绘制、全程键盘与触控双可用。The package provides tokens, components and layout rules extracted from those apps. 这套设计系统把这些实现归纳成可复用的令牌、组件与版式规则，方便继续扩充新的小玩具。The package is a self-contained web design system: it provides tokens, components, and layout rules for one-screen interactive tools, and includes an applied UI kit plus reviewable preview cards, so a new toy can be built without re-deriving its visual language.

## Source Context

- 源工程：本地文件夹 `/Users/rowansen/Documents/bilibili-toy`（源项目「将代码提交到github」，id `db72a8c0-418d-42f6-af3e-9f05e2ca7b5b`）。
- 证据清点：`context/local-code/bilibili-toy.md`；文件快照：`context/local-code/bilibili-toy/files/`（三个玩具的 HTML / CSS / JS 原样副本）。
- 来源与出处记录：`context/provenance.md`（资源来源、许可证状态、未知项）。
- 可运行原样实现：`source_examples/`（`bilibili-toy/index.html`、`story-stock/*`、`dub-it/*`），用来比对结构而不是当作生成的产物。
- 唯一真实图片资源：`assets/han-river.jpg`（1600×533，三国交易所横幅）；原始单文件包保留为 `assets/bilibili-toy-original.zip`。

## Package Contents

| 路径 | 内容 |
| --- | --- |
| `DESIGN.md` | 规范主文档：产品上下文、三个世界、颜色、字体、间距版式、组件、动效、语气、反模式、令牌速查 |
| `colors_and_type.css` | 三套世界色与语义色、字体栈、字号/行高/字距/字重、基础排版类 |
| `tokens.css` | 间距、内边距、圆角、投影、边框、控件尺寸、版式宽度与网格、动效、z-index |
| `preview/` | 逐张聚焦的审阅卡片，直接加载真实令牌 |
| `ui_kits/app/` | 可运行的组合界面：`index.html` + `components/` + `kit.css` |
| `assets/` | 保留的真实资源：横幅照片与原始单文件包 |
| `source_examples/` | 高信号源码示例（三个玩具的原样实现） |
| `context/` | 源清单、快照、出处记录 |

## Preview Manifest

- `preview/index.html` — 预览目录与建议审阅顺序。
- `preview/colors-worlds.html` — 三个世界的底色、正文、次要文本与强调色。
- `preview/colors-semantic.html` — 结果语义、行情涨跌、键帽色阶、CSS 布景色。
- `preview/typography-specimens.html` — 字号、字体栈、字距、等宽数字与字重。
- `preview/spacing-tokens.html` — 13 级间距、三种内边距、版式骨架与断点。
- `preview/radius-shadows.html` — 五级圆角、三档投影、印章与菱形标记。
- `preview/components-panels.html` — 监控面板、分段切换、推理表单、结果两态。
- `preview/components-controls.html` — 势力 ticker、交易单、音效键板、时间轴。
- `preview/components-charts.html` — 状态条、栏目标签、事件快报、K 线、剧情卡与实盘倒计时、带数值刻度的逐秒抖动分时线、成交回执与收盘结算。
- `preview/brand-assets.html` — 加载真实横幅照片，并说明为何没有 logo 位图。
- `preview/applied-surfaces.html` — 三个玩具并排的落地界面（交易所卡展示栏目标签、节拍、报价、总资产与下一事件）。

## Reuse Workflow

1. 先打开 `preview/colors-worlds.html` 与 `preview/typography-specimens.html`，确认世界与层级是否符合目标玩具；再读 `DESIGN.md` 的组件与反模式两节。
2. 在新工程里加载 `colors_and_type.css` 和 `tokens.css`，在容器上写 `data-world="night" | "paper" | "lilac"`；不要逐条复制色值。
3. 打开 `ui_kits/app/index.html` 审查真实组合；需要组件时复制 `ui_kits/app/components/` 里对应文件与 `kit.css`，保留 `dom.js`。
4. 需要核对原始结构时对照 `source_examples/`；照片类资源直接引用 `assets/han-river.jpg`，不要热链接，也不要为已有真实素材重画占位图。
5. 新增内容保持三条硬约束：世界底色整屏一致、数字等宽对齐、所有可点元素 ≥44px 且有可见焦点环。

## Files at a Glance

- 规范：`DESIGN.md`、`README.md`（本文件）、`SKILL.md`
- 令牌：`colors_and_type.css`、`tokens.css`
- 审阅：`preview/`（11 张卡片，含目录页）
- 实现：`ui_kits/app/`（入口 `index.html`，组件 `components/`）
- 证据：`context/source-context.md`、`context/local-code/bilibili-toy.md`、`context/provenance.md`
