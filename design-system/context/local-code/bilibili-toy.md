# 源工程证据 · bilibili-toy

来源：本地文件夹 `/Users/rowansen/Documents/bilibili-toy`（源项目「将代码提交到github」，id `db72a8c0-418d-42f6-af3e-9f05e2ca7b5b`）。只读清点，未修改原工程。

清点结果（Snapshot files written: 11）：

## 工程结构

- `bilibili-toy/index.html` — 弹幕侦探「停电前的 10 秒」，单文件 16 KB，内联全部 CSS 与 JS。
- `bilibili-toy/bilibili-toy.zip` — 同一单文件的原始打包（16015 bytes）。
- `bilibili-toy/dub-it/index.html`（9.9 KB，内联样式）+ `game.js`（16 KB）+ `scene.js`（8.2 KB）+ `video.js`（4.3 KB）。
- `bilibili-toy/story-stock/index.html`（7.6 KB）+ `style.css`（13.3 KB）+ `game.js`（14.9 KB）+ `market.js`（3.6 KB）+ `story.js`（9.3 KB）+ `quote-chart.js`（3.1 KB）+ `PLAN.md` + `han-river.jpg`（1600×533）。

## 颜色（逐文件核对）

- `bilibili-toy/index.html:8–19`：`--ink #e9e8db`、`--dim #a9ad9c`、`--ground #101310`、`--panel #191e17`、`--line #353b2f`、`--amber #f4ce79`、`--green #b9d7ad`、`--red #ffac99`。
- `story-stock/style.css:1–14`：`--paper #f2efe9`、`--panel #fdfbf7`、`--ink #272018`、`--muted #63584b`、`--line #e1d9cd`、`--red #962f28`、`--green #22604e`、`--gold #94692d`；页眉 `#211b16`。
- `dub-it/index.html:10–21`：`--ink #241b31`、`--subtle #655b73`、`--paper #f4f1fa`、`--card #fffdff`、`--line #ded6e9`、`--purple #6334d3`、`--purple-dark #4d23b6`。
- 键帽六组（`dub-it/index.html:76–82`）：brake `#fff0c8/#edcd81/#684606`、boom `#ffded8/#f1b0a6/#8a2c32`、clap `#d8f0d4/#aed5a7/#325c2c`、sting `#ebe0ff/#cdb8f1/#543285`、ding `#d9eff9/#afd4e4/#2f5268`、meow `#f9e0f0/#e9b5d5/#77375f`。
- 势力徽记（`story-stock/style.css:76–80`）：魏 `#4c5762`、蜀 `#42624f`、吴 `#8f4634`、晋 `#755367`；印章 `#87332a`。

## 字体与字号

- 无任何字体文件；字体栈为 `"PingFang SC", "Microsoft YaHei", "Noto Sans CJK SC", system-ui, sans-serif`，宋体栈为 `"Songti SC", "Noto Serif CJK SC", "STSong", "SimSun", serif`，等宽为 `ui-monospace, "SFMono-Regular", Consolas, monospace`。
- 展示字号：`clamp(2rem, 5.7vw, 4.2rem)`（`bilibili-toy/index.html:37`）、`clamp(2.5rem, 8vw, 5.5rem)/1.04/-0.075em`（`dub-it/index.html:28`）、宋体 `clamp(2.7rem, 6vw, 4.35rem)/1.24/0.075em`（`story-stock/style.css:48`）。

## 版式

- 检查台：`grid-template-columns: minmax(0, 1.65fr) minmax(0, 1fr)`（`bilibili-toy/index.html:42`），断点 690px（`:119`）。
- 交易所：`minmax(0, 1.62fr) minmax(300px, 1fr)`（`story-stock/style.css:50`），粘性右栏（`:56`），760px 单列并按阅读顺序重排（`:221–238`）。
- 配音台：`minmax(0, 1.85fr) minmax(250px, 1fr)`（`dub-it/index.html:22`），740px 单列（`:84`）。
- 主框宽度：`min(100% - 32px, 1080px)`、`min(100% - 64px, 1200px)`、`min(1100px, 100% - 40px)`。

## 可复用组件清点

- **MonitorPanel / SceneArt**（`bilibili-toy/index.html:43–122`）：面板头 + 场景 + 细节 + 三段切换 + 推进按钮；布景为 `clip-path` 透视、扫描线 `repeating-linear-gradient`、暗角 `radial-gradient`。
- **VerdictForm / 结果横幅**（`:104–137`）：两 `fieldset` 各三选项，`aria-pressed` 分段按钮，结果用 `data-outcome` 切换 solved / missed。
- **TickerBoard**（`story-stock/style.css:65–84`）：四列印章按钮，选中 `inset 0 -2px` 描边。
- **K 线 / 分时**（`:113–145`；`quote-chart.js`）：蜡烛由 `--wick-top/--body-top/--candle` 等变量驱动；`market.js` 维护报价序列。
- **交易单与股数输入**（`style.css:170–205`）：买卖分段、股数输入与「最大」、0.5% 手续费（向上取整、最低 1 铜钱）、随方向换色的主按钮。
- **账本卡**（`:206–217`；`index.html:127–142`）：`dl` 资产读数 + 持仓表格，数字 tabular。
- **DubBoard 音效键**（`dub-it/index.html:62–78`）：每键三个 CSS 变量，kbd 角标，按下 `translateY(2px)` + 饱和提升；`game.js` 处理记录与回放。

## 交互与无障碍

- 三个玩具的按钮都设 `min-height: 44px`；`button:focus-visible` 统一 2px 描边。
- 只有 `dub-it/index.html:95` 显式写了 `@media (prefers-reduced-motion: reduce) { .pad { transition: none; } }`，其余玩具无长动效。
- 分段与选项全部用 `aria-pressed` / 原生 `input[type=radio]`，结果与状态用 `role="status"`、`aria-live`。

## Brand assets and icons

- 唯一照片：`story-stock/han-river.jpg`（1600×533 JPEG，用于 hero 底图），保存在 `assets/han-river.jpg`。
- 品牌标记为文字 + CSS：菱形（10px 旋转 45°、2px 琥珀描边）、印章「易」（29px、`#87332a` 底、宋体）、势力徽记（25px、4px 圆角、宋体粗字）。
- 没有 logo 位图、应用图标、托盘图标或字体文件，因此 `build/` 与 `fonts/` 留空。

## Binary Assets Preserved

- `assets/han-river.jpg` — 原样复制，未重编码。
- `assets/bilibili-toy-original.zip` — 原始单文件包。
- `context/local-code/bilibili-toy/files/` 下保留 11 个源文件副本，供逐行比对。

## 不确定项

- 三个文件都没有 `LICENSE`、作者署名或版本号；`han-river.jpg` 的来源与授权无法从工程内确认，按源项目自带素材处理并在 `context/provenance.md` 标注。
- `story-stock/PLAN.md` 提到 20 个剧情节点与 11 家势力，但开盘价、终局数字属于游戏内虚拟值，不作为设计系统的「真实指标」引用。
- 弹幕侦探的机位按钮顺序与 `records` 数组的顺序一致（门禁 / 配电日志 / 舞台），文案由 `showRecord()` 动态改写，未被复用到其他地方。
