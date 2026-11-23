---
name: one-screen-toys
description: 中文单屏互动玩具设计系统：三个世界（夜色监测屏 / 纸张账本 / 淡紫配音台）、仪表式面板、等宽读数与 44px 触控底线。用于为案件回放、行情柜台、音效键盘一类小玩具生成界面。
user-invocable: true
---

# 单屏玩具 · Design System Skill

**What's inside:** 一套可直接取用的设计系统包：`colors_and_type.css` 与 `tokens.css` 令牌、11 张聚焦 `preview` 卡片、`ui_kits/app/` 组合界面与组件、`assets/` 中的真实图片、`source_examples/` 中三个源玩具的原样实现，以及 `DESIGN.md` / `README.md` 规范文档。

**Source context:** 本包从本地文件夹 `/Users/rowansen/Documents/bilibili-toy` 的三个玩具反推而来（源项目「将代码提交到github」，证据见 `context/local-code/bilibili-toy.md`，出处见 `context/provenance.md`）：弹幕侦探是单文件案件游戏，三国交易所是宋体标题的行情台，给这段乱配音是淡紫键帽的音效板。所有色值、字号、间距、组件结构都有源文件依据；证据缺失处已在文档中说明。

**When to use this skill:** 当你要为中文小游戏、案件/推理回放、轻量行情或交易界面、音效键板、单页互动原型做界面、mockup 或设计稿时使用。也适用于任何「一屏完成、状态显式、数字即证据」的小型产品界面。不适用于多页营销站、企业后台大表格或需要品牌摄影的落地页。

**How to use:** 先读 `README.md` 了解包结构与审阅顺序，再读 `DESIGN.md` 确认世界、语义色、间距与反模式。加载 `colors_and_type.css` + `tokens.css`，在容器写 `data-world`；需要组件时打开 `ui_kits/app/index.html` 审查组合，复制 `ui_kits/app/components/` 与 `kit.css`；比对原始结构用 `source_examples/`，图片直接引用 `assets/` 内文件。

**Design-system highlights:**
- 颜色 colors：三套世界各成一色系——夜色 `#101310 / #191e17 / #f4ce79`，纸张 `#f2efe9 / #fdfbf7 / #94692d`，淡紫 `#f4f1fa / #fffdff / #6334d3`；结果语义与行情涨跌分开。
- 排版 typography：系统中文无衬线 + 宋体展示字 + 等宽读数；展示字号 `clamp()`、负字距块面、tabular-nums 对齐。
- 间距 spacing：4px 基数 / 8px 节奏，13 级刻度，面板内边距 16px，卡片间距 16px。
- 圆角与投影 radius / shadows：4 / 6 / 8 / 12 / 17px 五级，默认无投影、靠 1px 描边分层；淡紫板才用柔投影。
- 图标与图形 icons：菱形品牌标记、印章与势力徽记、CSS 绘制的布景与键帽；不用 emoji、不用位图 logo。
- 布局 layout：1.65fr / 1fr 检查台、1.62fr / 1fr 交易所、1.85fr / 1fr 配音台，760px 以下重排为单列。
- 交互 interaction：可点元素 ≥44px、2px 焦点环、120ms 按压反馈、`prefers-reduced-motion` 归零动效。

## Quick checks

1. 是否只保留一个主按钮，且推进动作写明了下一步（「下一条线索：配电日志」）？
2. 数字是否同列对齐、单位是否紧跟数值？
3. 颜色是否只在正确的世界里使用，且不单靠颜色表意？
4. 场景是否由 CSS 构成、图片是否来自 `assets/` 且保留了出处？
5. 换世界是否只改 `data-world`，没有散落的硬编码色值？
