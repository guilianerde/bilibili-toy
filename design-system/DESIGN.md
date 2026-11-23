# 单屏玩具 · One-Screen Toys

> Category: Project Design System · Surface: web
> 由 OpenDesign 项目「将代码提交到github」的三个可玩网页玩具（弹幕侦探、三国交易所、给这段乱配音）反推而来。源工程为单文件 / 少文件的中文互动小游戏，全部可离线打开。

这是一套给「一屏就能玩完的中文小玩具」用的设计系统：一个案件回放、一间股票柜台、一块音效键盘。它们共享同一套骨架——仪表式面板、等宽读数、44px 触控底线、克制的中文文案——但每个玩具各自拥有一个独立世界（夜色监测屏 / 纸张账本 / 淡紫配音台）。

---

## 1. 产品与来源 · Product Context

**产品类型**：面向中文互联网用户的一次性互动玩具（toy），单页、无登录、无后端，浏览器直接打开即玩。来源工程 `/Users/rowansen/Documents/bilibili-toy` 包含三个独立玩具，共享作者、共享工程习惯，但各自换了一套世界：

| 玩具 | 源文件 | 玩法 | 世界 |
| --- | --- | --- | --- |
| 弹幕侦探「停电前的 10 秒」 | `index.html`（单文件，16 KB） | 看 3 条监控线索 → 提交两条推理 → 给出结论 | 深夜监控室，橄榄绿 + 琥珀 |
| 三国交易所 | `story-stock/index.html` + `style.css` + 4 个脚本 | 用 10,000 铜钱在 20 个剧情节点间交易，看分时线与 K 线 | 纸张账本 + 深棕页眉，宋体大标题 |
| 给这段乱配音 | `dub-it/index.html` + 3 个脚本 | 导入视频 → 按时机敲音效键 → 回放 | 淡紫纸面 + 紫色主色 + 彩色键帽 |

**共同能力与共同约束**

- 单屏完成：一个主面板（画面 / 行情 / 键位）+ 一个副面板（名单 / 账本 / 控制），不跨页。
- 全部状态显式可见：当前线索、当前报价、当前录制模式都用文字或 `aria-pressed` 标出。
- 数字即证据：时钟、报价、股数、得分一律等宽数字（`font-variant-numeric: tabular-nums`），不用装饰性数字。
- 只用系统字体：三个玩具都没有字体文件，依靠 `PingFang SC / Microsoft YaHei / Songti SC` 栈。
- 场景用手写 CSS 画：`index.html:38–118` 的走廊、配电柜、舞台布景全部由 div + 渐变 + `clip-path` 组成，不引入照片。唯一的照片资源是 `story-stock/han-river.jpg`（1600×533，作为三国交易所的横幅底图）。

**来源证据位置**：`context/local-code/bilibili-toy.md`（清点与推断），`context/local-code/bilibili-toy/files/`（快照），`source_examples/`（可运行的原样实现）。

## 2. 视觉基调 · Visual Theme

仪表感优先于装饰感。三个玩具都把「界面」做成一台看得到读数的机器：

- **边框画结构**：卡片靠 1px 边框和不同底色区分层次，不靠投影。经典卡片 = `border: 1px solid var(--line)` + `border-radius: 12px` + 面板底色（`index.html:44`、`style.css:63`）。
- **一个世界一种底色**：世界底色一次定死，子面板只做一级抬升（夜色世界的 `#101310 → #191e17`，纸张世界的 `#f2efe9 → #fdfbf7`，淡紫世界的 `#f4f1fa → #fffdff`）。
- **标题与读数分离**：大标题用展示字体（宋体或紧排无衬线），所有可核对的信息用等宽字体。
- **手绘质感来自 CSS**：扫描线、暗角、发光灯管、印章方块都由 CSS 生成，保持可缩放、可离线、可改色。

## 3. 颜色 · Color

所有色值直接取自源文件的 `:root` 变量（`index.html:8–19`、`style.css:1–14`、`dub-it/index.html:10–21`）。令牌名定义见 `colors_and_type.css`。

### 世界一：夜色监测屏（`[data-world="night"]`）

| 角色 | 值 | 对比度 | 用途 |
| --- | --- | --- | --- |
| 地面 `--bg` | `#101310` | — | 页面底色 |
| 面板 `--surface` | `#191e17` | — | 监控面板、线索卡 |
| 分隔 `--line` | `#353b2f` | — | 卡片与控件分隔 |
| 正文 `--ink` | `#e9e8db` | 15.2:1 on bg | 标题、线索引文 |
| 次要 `--ink-muted` | `#a9ad9c` | 8.2:1 on bg | 事实说明、机位来源 |
| 强调 `--accent` | `#f4ce79` | 11.3:1 on surface | 眉标、时间码、主按钮底 |
| 结果 · 好 `--state-good` | `#b9d7ad` | 10.8:1 on surface | 「案件告破」 |
| 结果 · 坏 `--state-bad` | `#ffac99` | 9.4:1 on surface | 「推理复盘」 |

场景专用色 `--scene-*`（`#555d41 / #46503a / #394431 / #333c2a / #23291e / #e4dfa0`，以及地面 `#202719`、暗部 `#242b20`、柜体 `#656954`、开关 `#9c9e77`、舞台框 `#5f6758`、暗角 `#080b08b0`）只用于 CSS 布景，不用于文字；`ui_kits/app/kit.css` 已全部改为引用这些令牌。

### 世界二：纸张账本（默认 `:root`，`[data-world="paper"]`）

| 角色 | 值 | 对比度 | 用途 |
| --- | --- | --- | --- |
| 纸 `--bg` | `#f2efe9` | — | 页面底色 |
| 卡 `--surface` | `#fdfbf7` | — | 行情卡、交易单、账本 |
| 凹槽 `--surface-sunken` | `#f5f1e9` | — | 图表详情、K 线选中区 |
| 页眉 `--surface-strong` | `#211b16` | — | 顶部工具条 |
| 正文 `--ink` | `#272018` | 14.0:1 on bg | 标题、数值 |
| 次要 `--ink-muted` | `#63584b` | 6.0:1 on bg | 说明、单位 |
| 强调 `--accent` | `#94692d` | 4.7:1 on surface | 章节线、选中糖果色 |
| 涨 `--market-up` | `#962f28` | 7.4:1 on surface | 涨、买入（中式红涨绿跌） |
| 跌 `--market-down` | `#22604e` | 7.1:1 on surface | 跌、卖出 |

### 世界三：淡紫配音台（`[data-world="lilac"]`）

| 角色 | 值 | 对比度 | 用途 |
| --- | --- | --- | --- |
| 纸 `--bg` | `#f4f1fa` | — | 页面底色 |
| 卡 `--surface` | `#fffdff` | — | 键位板、控制区 |
| 舞台 `--surface-strong` | `#251b32` | — | 播放器外壳 |
| 正文 `--ink` | `#241b31` | 14.7:1 on bg | 标题 |
| 次要 `--ink-muted` | `#655b73` | 5.7:1 on bg | 副标题、提示 |
| 强调 `--accent` | `#6334d3` | 7.0:1 on surface | 主按钮、焦点环、标题高亮词 |

键帽色阶（`--key-bg / --key-border / --key-ink`）成组出现，每组三值同调：`#fff0c8/#edcd81/#684606`、`#ffded8/#f1b0a6/#8a2c32`、`#d8f0d4/#aed5a7/#325c2c`、`#ebe0ff/#cdb8f1/#543285`、`#d9eff9/#afd4e9/#2f5268`、`#f9e0f0/#e9b5d5/#77375f`。

### 颜色规则

1. **红绿不跨世界复用**。`--state-good/bad` 是「结果好坏」，`--market-up/down` 是「行情涨跌」；同一世界里两者含义可能相反（三国交易所里红=涨=好，配音台里红=错误）。
2. 强调色只承担一种职责：琥珀=注意力，金色=章节/选中，紫色=主操作。不要在同一屏里让强调色兼任装饰。
3. 永远不靠颜色单独表意：涨跌同时给箭头或正负号，结案同时给「案件告破 / 推理复盘」文案。
4. 深色世界单独校验对比度，不假定浅色世界的令牌可平移。

## 4. 字体 · Typography

令牌在 `colors_and_type.css`，字体栈与源文件一致（无自带字体文件）：

- `--font-sans`: `"PingFang SC", "Microsoft YaHei", "Noto Sans CJK SC", system-ui, sans-serif` — 全部正文与控件。
- `--font-serif`: `"Songti SC", "Noto Serif CJK SC", "STSong", "SimSun", serif` — 仅纸张世界的展示标题（`style.css:13,48,161`）。
- `--font-mono`: `ui-monospace, "SFMono-Regular", Consolas, monospace` — 时间码、机位、kbd、读数（`index.html:32`）。
- `--font-display` 随世界切换：纸张世界 = 宋体；夜色与淡紫世界 = 无衬线。

**层级与字号**（`--text-*`）

| 令牌 | 值 | 典型用途 |
| --- | --- | --- |
| `--text-hero` | `clamp(2.5rem, 8vw, 5.5rem)` | 淡紫世界主标题（`dub-it/index.html:28`，900 字重，-0.075em） |
| `--text-h1` | `clamp(2rem, 5.7vw, 4.2rem)` | 案件标题（`index.html:37`，-0.065em） |
| `--text-display` | `clamp(1.45rem, 3vw, 1.85rem)` | 章节卡标题，宋体 800 + 0.075em |
| `--text-title` | `1.22rem` | 面板内 h2 |
| `--text-body` | `1rem` | 正文 / 引文（1.55 行高） |
| `--text-small` | `0.875rem` | 表格、选项、说明 |
| `--text-caption` | `0.84rem` | 面板头、眉标 |
| `--text-micro` | `0.78rem` | 时间码、kbd 角标 |

**规则**

- 展示字号一律用 `clamp()`，移动端不低于 2rem，桌面端不超过 5.5rem。
- 大标题用负字距（-0.065 ~ -0.075em）压缩块面；宋体标题改用正字距（0.075em）保持活字感。
- 正文行高 1.55，长文 1.7；正文宽度 65–75 字符（`max-width: 65ch`）。
- 中文不假斜体、不假粗体嵌套；文案里的引号用「」。
- 所有数字对齐到同一列时启用 tabular-nums，避免跳动。

## 5. 间距与版式 · Spacing & Layout

令牌在 `tokens.css`（4px 基数，8px 节奏）。

- **间距**：`--space-1: 4px` 起，`--space-2: 8px`、`--space-3: 12px`、`--space-4: 16px`、`--space-5: 20px`、`--space-6: 24px`、`--space-8: 32px`、`--space-9: 36px`、`--space-13: 52px`、`--space-16: 64px`。源文件里的 6/10/14 归并为 `--space-1-5 / 2-5 / 3-5`，只用于控件内边距。
- **卡片内边距**：`--panel-pad: 16px`；紧凑条 `--panel-pad-tight: 12px`；面板头 `--strip-pad: 10px 14px`（`index.html:45`、`style.css:150`）。
- **圆角**：4px（印章、kbd）→ 6px（选项行）→ 8px（fieldset、ticker）→ 12px（面板）→ 17px（玩家外壳）。同屏最多三级圆角。
- **投影**：默认 `none`，靠边框分层；淡紫世界的控制板允许 `--shadow-panel / --shadow-float`；夜色世界只有灯光用辉光。
- **版式骨架**（全部在 1080–1200px 主框内）：
  - 检查台 `--grid-main: 1.65fr / 1fr`，主面板 + 名单侧栏（`index.html:42`）。
  - 交易所改为券商式四栏：顶部「状态条 → 事件快报 → 栏目标签（市场 / 交易 / 持仓 / 资讯）→ 栏目内容」。默认停在「市场」；宽屏下仅「交易」为交易单 + 回执双列，其余栏目单列（资讯的剧情节拍在上、事件档案在下）；收盘时标签栏与快报收起，结算单整块居中。剧情节拍按 24 秒/节由实盘时钟自动推进，末节后再走 24 秒收盘，不设手动推进按钮。
  - 配音台 `--grid-player: 1.85fr / minmax(250px,1fr)`，16:9 画面 + 键位板。
- **安全区**：主框 `width: min(100% - 32px, 1080px)`；底部预留 `max(36px, env(safe-area-inset-bottom))`；关键按钮避开边缘 50px。
- **响应式断点**：690px（检查台单列，`index.html:119`）、740px（配音台单列，`dub-it/index.html:84`）。交易所不再依赖固定宽度侧栏：980px 起交易双列转单列，760px 起行情缩为两列，全部栏目与标签仍保持单列堆叠；断点后换布局而不是缩小字号。
- 触摸目标全线 ≥44px（`--control-min`），密集行降到 34px 仅限表格内的非主操作。

## 6. 组件 · Components

组件一律「容器 + 读数 + 动作」三段式。原样实现见 `source_examples/`，可复用实现见 `ui_kits/app/components/`。

| 组件 | 结构要点 | 源实现 |
| --- | --- | --- |
| **监控面板 `MonitorPanel`** | 面板头（机位 + 时间码）→ 场景（CSS 布景 + 扫描线暗角）→ 细节区（眉标 + 引文 + 事实）→ 分段切换 → 推进按钮 | `index.html:43–90`；`source_examples/bilibili-toy/index.html` |
| **场景布景 `SceneArt`** | 三层：走廊 `hall-art`、配电柜 `log-art`、舞台 `stage-art`；用 `clip-path` 造透视，`repeating-linear-gradient` 造扫描线，`radial-gradient` 造暗角 | `index.html:38–118,43–75` |
| **分段切换（标签页）** | 三等分按钮排，`aria-pressed` 驱动选中态，选中 = 暖底 + `inset 0 -2px` 强调下划线 | `index.html:79,84–88` |
| **结论表单 `VerdictForm`** | 两个 `fieldset` 并列，`legend` 用强调色；选项行 44px 高；两题都选才解禁提交 | `index.html:104–121` |
| **结果横幅** | 结果态写在容器 `data-outcome` 上，`solved` 绿标题 / `missed` 红标题，配「重玩案件」主按钮 | `index.html:131–137` |
| **行情 ticker** | 4 列网格按钮；印章方块（曹 `#4c5762`、刘 `#42624f`、孙 `#8f4634`、晋 `#755367`）+ 报价 + 涨跌；选中 = 强调描边 + 内阴影 | `style.css:65–84` |
| **K 线 / 分时** | 蜡烛用 CSS 变量驱动（`--wick-top/height`、`--body-top/height`、`--candle`）；分时线保留最近 60 秒、每秒抖动，纵轴给价格刻度与最新值；年份标签只在选中/悬停/聚焦时出现；轴刻度由 `--tick` 定位 | `style.css:113–145`；`story-stock/quote-chart.js` |
| **交易单** | 买卖分段（买红卖绿）→ 股数输入 + 「最大」→ 手续费与预计支出右对齐 → 主按钮随方向换色 | `style.css:170–205`；`story-stock/game.js` |
| **状态条 `RoundStrip`** | 六格：回合 / 纪年 / 下一事件 / 倒计时 / 总资产 / 收益率；等宽数字，收益率红涨绿跌；`auto-fit` 换行 | 组合自 `style.css:60–64`；`ui_kits/app/components/RoundStrip.js` |
| **剧情节拍 `StoryBeat`** | 顶部 3px 账本压线（`--story-rule`）；阶段章 + 节次 → 纪年地点眉标 → 宋体标题 → 剧情一句 → 势力影响 chips → 进度条 + 实盘倒计时；每节 24 秒自动揭晓，末节显示收盘倒计时 | `style.css:149–165`；`story.js` |
| **行情台 `PriceBoard`** | `TickerBoard`（11 家势力，退市与未挂牌保留按钮但显示「—」）+ 逐节收盘 K 线；每揭晓一节补一根蜡烛（红涨绿跌），未来节次留白，报价随剧情改写 | `style.css:113–145`；`quote-chart.js` |
| **账本 `HoldingsCard`** | `dl` 两列资产读数（总资产 / 现金 / 收益率 / 手续费）+ 持仓表（持仓 / 现价 / 浮盈，名称下注成本）；退市显示「退市」并按 0 估值 | `style.css:206–217`；`story-stock/index.html:127–142` |
| **成交回执 `TradeReceipt`** | 最近成交在前，最多 8 条；每行「节次 · 方向 · 势力 · 股数」+ 成交价与手续费 + 净收支；空态写明下一步 | `story-stock/game.js`；`ui_kits/app/components/TradeReceipt.js` |
| **栏目标签 `MarketTabs`** | 四等分按钮（市场 / 交易 / 持仓 / 资讯），`aria-selected` 驱动选中 = 暖底 + `inset 0 -2px` 强调线；面板用原生 `hidden` 显隐，左右方向键与 Home/End 切换并移动焦点；资讯标签可带未读点，打开即清除 | `story-stock/style.css` 分段结构；`ui_kits/app/components/MarketTabs.js` |
| **事件快报 `EventTape`** | 44px 可点条：阶段章 + 纪年地点 + 当前事件 + 节次倒计时 + 下一节 + 「看资讯 ›」；点击只切栏目，不打断交易 | `story-stock/story.js`；`ui_kits/app/components/EventTape.js` |
| **事件档案** | 九节清单：年份、标题、地点、状态（待揭晓 / 进行中 / 已揭晓 / 已收盘）与收盘价；已揭晓价格留在行内 | `story-stock/story.js`；`ui_kits/app/components/MarketBoard.js` |
| **收盘结算 `ClosingSummary`** | 收盘时标签栏与快报收起，结算单整块居中；期末总资产 / 收益率 / 最高资产 / 成交次数 / 累计手续费 + 「再开一局」主按钮 | `story-stock/game.js`；`ui_kits/app/components/ClosingSummary.js` |
| **音效键 `SoundPad`** | 每键三个 CSS 变量（`--key-bg/--key-border/--key-ink`），kbd 角标定位右上，按下 = `translateY(2px)` + 饱和提升 + 内描边 | `dub-it/index.html:62–78` |
| **时间轴轨** | 轨道 + 进度填充（`scaleX`）+ 打点标记（`--at` 定位、`--key-bg` 复键色） | `dub-it/index.html:50–58` |
| **印章 / 徽记** | 4px 圆角方块，宋体粗字；品牌菱形 = 10px 方块旋转 45°、2px 琥珀描边 | `style.css:32–36`；`index.html:31` |
| **眉标 + 等宽读数** | 小号等宽大写感标签 + tabular 数字，成对出现在面板头 | `index.html:32,34` |

**通用状态**

- 悬停：只调底色或描边，不把文字变灰（源文件所有 hover 都走向更深或更亮的同调色）。
- 焦点：`outline: 2px solid var(--focus); outline-offset: 3–4px`，全部可点元素可见。
- 禁用：透明度 0.46–0.67，光标 `default`，不仅是变色。
- 空态：直接写明下一步（「挂牌后开始记录分时行情。」），不留灰块。

## 7. 动效与交互 · Motion & Interaction

- 键帽按压 120ms（`transform` + `filter` + `outline-color`，`dub-it/index.html:62`），抬起即回弹；退出快于进入。
- 标签/选项状态切换 180ms 以内，用底色与下划线表达，不做位移动画。
- 结果面板淡入 ≤300ms；一次只出现一个新区域，不叠加多个动画。
- 只有状态变化才动：分时线、进度条、时间码由数据驱动，不加装饰性脉冲。
- 全部过渡包在 `@media (prefers-reduced-motion: reduce)` 里归零（`dub-it/index.html:95`）——这是源文件唯一显式写的无障碍动效规则，作为系统默认。
- 键盘即一等公民：`kbd` 角标常驻显示快捷键（`dub-it/index.html:68`），`e.code` 触发，录制/回放模式用 `body[data-mode]` 表达。

## 8. 文案与语气 · Voice & Brand

- 中文简体，第二人称行动句：「先看 3 条线索，再选出关电的人和证据。」「导入视频自动配出音效键。」
- 句子短，一句一个动作；不用感叹号，不用「一键」「极致」「震撼」这类营销词。
- 事实与推测分开写：引文用「」，事实另起一行；案件结论点名时间、工牌、动作，不抒情。
- 自嘲式轻幽默标题可接受：「给这段乱配音」；严肃世界（案件）保持冷面。
- 数字照抄现实约定：铜钱、股数、手续费 0.5%、得分 x / 2；不编造成功率或性能指标。
- 品牌标记克制：一个菱形 + 四个字（「弹幕侦探」），一个印章加产品名（「易」+ 故事炒股模拟器）。
- 页脚只放必要的规则说明（「剧情改编自《三国演义》 · 行情使用虚拟铜钱」），不放版权长文。

## 9. 反模式 · Anti-patterns

不要让生成结果看起来像通用 SaaS 模板：

1. 不要用紫色渐变铺满背景、或用米色/奶油色作为默认底色来「假装温暖」。世界底色只从三套来源色里取。
2. 不要把 Inter / Roboto / Arial 当展示字体。展示字体只有宋体和系统中文无衬线两种。
3. 不要用「圆角卡片 + 左侧色条」做提示框；提示用边框 + 眉标 + 缩进，或直接用行内事实。
4. 不要给每个标题配图标，不要同一屏放两个同义主按钮。
5. 不要用 emoji 当功能图标；印章、菱形、键帽色块才是这套系统的图形语言。
6. 不要热链接图片，也不要用随机图片服务充数；场景自己用 CSS 画，照片只用来源里真实存在的资源并保留出处（`context/provenance.md`）。
7. 不要编造数据（「10× 更爽」「99.9% 命中」）；需要占位就写「示例」「待填入」。
8. 不要把涨跌色跨世界复用，也不要用颜色单独表达输赢。
9. 不要混用浅色与深色世界的令牌；深色世界必须单独校对比度。
10. 不要用绝对定位堆叠正文区域、不要用负 margin 拼卡片；只有场景装饰与角标允许绝对定位。
11. 不要把「案件」写成英文侦探腔，也不要把「交易所」写成投资建议——语气保持玩具感。
12. 不要为了好看牺牲 44px 触控目标、焦点环或 `prefers-reduced-motion`。

## 10. 令牌速查 · Token Map

| 文件 | 内容 |
| --- | --- |
| `colors_and_type.css` | 三套世界色、语义色、字体栈、字号/行高/字距/字重、`.eyebrow/.mono/.lede/.hero-title` 基础类 |
| `tokens.css` | 间距、组件内边距、圆角、投影、边框、控件尺寸、版式宽度与网格、动效时长与缓动、z-index |
| `preview/` | 逐张可审阅的卡片（颜色、字体、间距、圆角投影、组件、品牌资源、落地界面） |
| `ui_kits/app/` | 用上述令牌实现的组合界面与可复用组件 |
| `source_examples/` | 三个玩具的原样 HTML/CSS/JS，用于比对真实结构 |
