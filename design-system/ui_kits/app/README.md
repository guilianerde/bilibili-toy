# 应用组件库 · 单屏玩具

这是 `ui_kits/app/` 的应用实现：用 `colors_and_type.css` 与 `tokens.css` 的令牌，把三国交易所与配音台组合成一块可切换的玩具工作台。弹幕侦探已从应用入口移除，源实现与预览仍保留在设计系统中作证据。没有构建步骤、没有 React/Babel 依赖，浏览器直接打开 `index.html` 即可运行。

## Structure

- `index.html` — 浏览器审查入口：加载令牌与 `kit.css`，按序引入 `components/` 下的组件脚本，挂载 `App`。
- `components/App.js` — 应用外壳：品牌栏、两个玩具的切换、舞台与说明条；切换时只改根节点的 `data-world`。
- `components/TickerBoard.js` + `components/PriceBoard.js` — 11 家势力的行情按钮（含已退市与未挂牌状态）、逐秒抖动分时线（60 点、价格刻度、最新值）与逐节收盘 K 线；报价每秒随实盘时钟更新。
- `components/HoldingsCard.js` — 资产读数与持仓表：持仓、现价、浮盈；退市按 0 估值。
- `components/Composer.js` + `components/InputBar.js` — 交易单（买卖切换、0.5% 手续费估算、股数输入、超出现金/持仓时拒绝并提示）。
- `components/StoryBeat.js` + `components/RoundStrip.js` — 剧情节拍与顶部状态条（回合、纪年、下一事件、倒计时、总资产、收益率）；每 24 秒由时钟自动推进，不使用手动按钮。
- `components/TradeReceipt.js` + `components/ClosingSummary.js` — 成交回执与收盘结算（含「再开一局」）。
- `components/MarketTabs.js` — 券商式栏目标签：四等分、`aria-selected` + `hidden` 面板、鼠标/触控/左右键切换；资讯栏的未读点只在打开资讯时清除。
- `components/EventTape.js` — 顶部事件快报：当前阶段、纪年地点、事件标题、下一节与倒计时，点击进入资讯栏。
- `components/MarketBoard.js` — 行情台：状态条 + 事件快报 + 四栏（市场 / 交易 / 持仓 / 资讯）；9 节示例剧情按实盘时钟自动推进，交易栏宽屏双列，收盘时整块换成结算单。
- `components/DubBoard.js` — 音效键板、时间轴轨、录制与回放入口。
- `components/dom.js` — 共享的 `el()` DOM 构造与 `money()` 数字格式化，避免每个组件各写一套。
- `kit.css` — 组件布局与状态样式，只引用令牌，不写死色值（键帽与布景色除外，它们来自源实现）。

## Usage

1. 先读 `../../DESIGN.md` 确认世界、语义色与组件职责；再看 `../../preview/` 的聚焦卡片比对视觉。
2. 复制 copy `kit.css` 与需要的 `components/*.js` 到目标工程（compose 组件于页面），保留 `components/dom.js`，并在页面加载 `colors_and_type.css`、`tokens.css`。
3. 用 import 或直接引用加载组件：组件都由 `window` 上的工厂函数暴露（`App`、`Composer`、`MarketTabs`、`EventTape`、`DubBoard`……），返回 DOM 节点；组合方式照 `App.js`，用 `replaceChildren` 换舞台，不重建页面。
4. 换世界只改容器上的 `data-world`（`night` / `paper` / `lilac`），不要逐个改颜色；换商品替换 `TickerBoard` 的 `FACTIONS` 与 `MarketBoard` 的 `BEATS` 与 `EVENT_MS`（节次、文案、影响 chips、该节报价、每节时长）。

## Design Notes

- 版式 layout：行情默认停在「市场」栏；宽屏仅「交易」栏为交易单 + 回执双列（0.92fr / 1.08fr），其余栏目单列，980px 起交易栏也转单列；栏目标签四等分且 ≥44px，收盘时标签栏与快报一起收起。
- 颜色 colors：三种世界各自成套，`--state-good/bad` 与 `--market-up/down` 分开使用；键帽三值成组。
- 字体 typography：正文系统无衬线，宋体只做纸张世界展示标题，时间码与报价一律等宽。
- 组件 components：所有可点元素 ≥44px，焦点环 2px + 3px 间距，悬停只调同调底色。
- 来源 source：`source_examples/bilibili-toy/index.html`（监控面板）、`source_examples/story-stock/style.css`（行情与交易）、`source_examples/dub-it/index.html`（键板）。
- 演示数据标注为「示例」，不伪装成真实统计。
