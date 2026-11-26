# 三国交易所 · story-stock

以《三国演义》为蓝本的实时炒股小游戏：带着 10,000 铜钱，在 18 家势力之间买卖，从黄巾起义一路走到三国归晋。行情由 20 个主线事件和 124 条过程驿报驱动。

直接用浏览器打开 `index.html` 即可游玩，没有构建步骤、后端或第三方依赖。

## 快速开始

```bash
# 方式一：直接打开
open index.html

# 方式二：本地静态服务
python3 -m http.server 4317 --bind 127.0.0.1
# 然后访问 http://127.0.0.1:4317/
```

点击「开盘」后市场每秒更新，每 24 秒揭晓一条主线军情，约 8 分钟收盘。

## 目录

```text
story-stock/
├── index.html       # 页面结构：行情、交易单、账本、剧情卡、事件快报、军情驿报
├── style.css        # 纸张账本主题、响应式布局、驿报与档案样式
├── story.js         # 全部静态事件数据：factions / prologue / story / briefs
├── market.js        # 行情模拟：报价、K 线、手续费、成交、退市、驿报排期
├── game.js          # 渲染与交互：行情台、交易、剧情卡、快报、档案、驿报流
├── quote-chart.js   # 多势力折线绘制（实时 / 历史区间）
├── PLAN.md          # 玩法规则、势力表、验收标准
├── README.md        # 本文件
└── han-river.jpg    # 首屏横幅底图
```

## 事件数据存在哪里

所有事件都是 [`story.js`](story.js) 里的普通 JS 常量，没有数据库或 localStorage。运行时由 [`market.js`](market.js) 的 `createMarket()` 在内存里生成行情状态，页面只读取这些数据做渲染。

### 三层结构

```js
// story.js

// 1. 势力表：界面、行情、持仓都用这个 id 关联
const factions = [
  { id: "wei", mark: "魏", name: "曹氏势力" },
  // ... 共 18 家
];

// 2. 开市前的剧情：没有 where / preview，briefs 会全部先展示
const prologue = [
  {
    year: 184,
    title: "黄巾起义",
    outcome: "黄巾起事，朝廷召募兵马……",
    quotes: { wei: 48, shu: 16, wu: 32 },
    briefs: [ /* 过程小事件 */ ]
  }
];

// 3. 20 个主线事件，每 24 秒揭晓一个
const story = [
  {
    year: 192,
    where: "长安 · 河北",
    preview: "长安宫门内外",
    lead: "董卓已迁都长安……",
    title: "董卓身死，吕布自立",
    outcome: "王允联手吕布诛杀董卓……",
    quotes: { dong: 0, bu: 63, shao: 125, zan: 51 },
    briefs: [ /* 过程小事件 */ ]
  }
];
```

### 主线字段

| 字段 | 用途 |
| --- | --- |
| `year` | 纪年，显示在剧情卡、快报和档案 |
| `where` | 地点，显示在剧情卡和快报 |
| `preview` | 事件未揭晓前的预告标题 |
| `lead` | 预告正文 |
| `title` | 揭晓后的正式标题 |
| `outcome` | 揭晓后的结果正文 |
| `quotes` | 原线对势力的绝对报价，见下文 |
| `briefs` | 该段 24 秒内的过程小事件 |
| `variants` | 可选：本条的几条史线，演义模式每局抽一条，见下文 |

### 主线 `variants`（史线分支）

```js
variants: [
  { label: "原线" },                       // 第一项必须是原线，史实模式固定走它
  {
    label: "东风未起",                      // 揭晓时显示在军情卡和档案上
    title: "赤壁对峙",                      // 可选：覆盖事件标题
    outcome: "冬至已过，江上仍刮北风……",     // 可选：覆盖结果正文
    quotes: { wei: 196, shu: 52, wu: 84 }, // 本史线的完整报价，覆盖原线的 quotes
    patches: { 5: { text: "……" } },        // 可选：按下标改驿报，只写要改的字段
    clues: [ { year: 208, where: "赤壁", text: "……", quotes: { wu: 118 } } ] // 可选：追加驿报
  }
]
```

`market.js` 的 `resolveRun(mode, seed)` 在开局时把每条主线解析成只属于这一局的副本（`market.story` / `market.prologue`），行情、档案、驿报都读这份副本，`story.js` 原文不变。演义模式还会给所有报价加 ±`jitter` 的浮动；史实模式原样照搬。随机数是 mulberry32，同一个 seed 必得同一条史线。

### brief（军情驿报）字段

```js
{
  year: 196,
  where: "宛城",
  tag: "人事",                 // 战报 / 朝局 / 人事 / 权谋 / 异闻
  chapter: "第十四回",         // 《三国演义》回目，可省略
  text: "张济攻穰城中箭身亡，部众由侄张绣接管，屯驻宛城。",
  faction: "xiu",              // 可选：只用于来源标签
  quotes: { xiu: 60 }          // 可选：送达这一秒对行情改价
}
```

| 字段 | 用途 |
| --- | --- |
| `year` / `where` | 时间地点 |
| `tag` | 分类标签，只影响颜色 |
| `chapter` | 回目，只用于展示 |
| `text` | 驿报正文 |
| `faction` | 消息归属，显示势力名，不参与改价 |
| `quotes` | 送达时的绝对报价，`0` 表示退市 |

### `quotes` 的规则

- 值是**绝对价格**，不是百分比。
- `0` 触发退市：持仓清零，成本计入已实现亏损，并给出提示。
- 只写需要变化的势力，其他势力继续按原价和随机波动走。
- 主线 `quotes` 在第 24 秒生效；brief 的 `quotes` 在该条驿报送达的秒生效。
- 开市价来自 `prologue[2].quotes`；目前 18 家都给了初始价，`fallbackOpening = 40` 是兜底。
- 当前数据里 `0` 按永久退市使用，后续不会再用正价格重新挂牌。

## 时间与投放

[`market.js`](market.js) 里：

```js
const tickMs = 1_000;
const ticksPerEvent = 24;
const totalTicks = story.length * ticksPerEvent; // 20 × 24 = 480 秒
```

- 每段主线固定 24 秒；第 24 秒揭晓主线，随后进入下一段。
- `briefTicks(count)` 把一段里的 brief 均匀排到第 1–23 秒。例如 4 条排在第 6、12、17、23 秒，7 条排在第 3、7、10、13、16、20、23 秒。
- 因此**增删 briefs 不需要改计时代码**，数组长度变了，排期会自动重排。
- `briefAt(market, tick)` 把当前秒解析成 `{ eventIndex, briefIndex, event, brief, key }`，再取该条 brief 的 `quotes` 改价。
- 驿报造成的涨跌记录在 `market.briefImpacts`，键是 `"eventIndex:briefIndex"`，驿报卡片据此显示涨跌。
- `prologue` 的 briefs 在开市前全部展示，不参与行情（`briefAt` 只查 `story`）。
- `createMarket(mode, seed)` 先调 `resolveRun()` 定下本局史线，`advanceMarket()` 之后一律读 `market.story`，价格噪声走 `market.random`，所以同一 seed 一定能复现整局。

[`game.js`](game.js) 里：

- `revealedDispatches()` 生成资讯流：`prologue` 全量 + 已完成段落的全部 brief + 当前段已到点的 brief；未来段不出现。
- `renderDispatches()` 新条目插到列表顶部，并更新 `n / 124 条` 计数。
- `renderArchive()` 只渲染 `index < revealed` 的主线，也就是**已经揭晓**的事件；当前段和未来段都不会提前露出标题。
- 事件快报的 `tape-wire` 显示最近一条驿报的年份和地点。

## 当前数据体量

| 项目 | 数量 |
| --- | --- |
| 势力 | 18 家 |
| 开市前剧情 | 3 段 / 15 条 brief |
| 主线事件 | 20 段 / 109 条 brief |
| brief 合计 | **124 条** |
| 每段主线 brief | 4–8 条 |
| 史线分支 | 8 条主线各有 1 条支线（原线 + 1），共 8 个分支点 |
| 一局时长 | 20 × 24 秒 = 8 分钟 |

## 如何扩容

### 加一条过程小事件

在对应主线的 `briefs` 数组里加一个对象即可，不用改 `market.js` 或 `game.js`：

```js
{
  year: 197,
  where: "小沛",
  tag: "人事",
  chapter: "第十六回",
  text: "袁术遣纪灵攻小沛，吕布辕门射戟，一箭正中戟上小枝，两家只得罢兵。",
  quotes: { bu: 124, shu: 24 }
}
```

### 加一个主线事件

往 `story` 里加一个完整对象，并在 `quotes` 里写受影响势力。总时长会自动增加 24 秒：

```js
{
  year: 220,
  where: "洛阳",
  preview: "魏王继位",
  lead: "……",
  title: "曹丕称帝",
  outcome: "……",
  quotes: { wei: 160, shu: 80, wu: 150 },
  briefs: [ /* ... */ ]
}
```

### 加一家势力

1. 在 `factions` 里加 `{ id, mark, name }`。
2. 在任意 `quotes` 里给它第一次报价；`prologue[2].quotes` 是开市价。
3. 用 `0` 让它退市。

## 界面与信息流

- **事件快报**：页面顶部，显示最新主线、下一节预告和倒计时；点击跳到剧情卡并展开事件档案。
- **事件档案**：剧情卡底部，按选中势力列出已揭晓主线的收盘价。
- **军情驿报**：主线之间的过程小事件流，只显示已经到点的条目；带 `quotes` 的条目标出涨跌。
- **剧情卡**：当前段预告 + 最新主线结果 + 势力影响。
- **势力走势**：可选实时（最近 60 秒）、近 5 年、近 10 年或全部，横轴按剧情年月标注；勾选多家势力可叠在同一张图上，多线时按各区间起点 100 归一。
- **K 线**：每段主线的开高低收；分时线保留最近 60 秒。

## 交易规则速览

- 起始资金 10,000 铜钱。
- 买卖各收成交额 0.5%，向上取整，最低 1 铜钱。
- 成本按含手续费均价计算；卖出按均价结转成本，并记录已实现盈亏。
- 退市持仓清零，损失计入已实现盈亏。
- 收盘时存续持仓按最后报价计入总资产。
- 完整规则与验收项见 [`PLAN.md`](PLAN.md)。

## 已知行为与注意点

- **档案只列已揭晓主线**：`renderArchive()` 目前用 `index < revealed` 过滤，当前正在进行的段不会出现在档案里，但帮助文案写的是「已揭晓和进行中」。如果希望进行中也显示，需要在 `renderArchive()` 里增加 `current` 状态。
- **驿报只显示已送达条目**：当前段未到点的、未来段的 brief 都不会提前出现。
- **开市价已覆盖全部势力**：`prologue[2].quotes` 给 18 家都写了初始价，`fallbackOpening = 40` 只是兜底；如果新增势力没有写开市价，会以 40 开盘。
- **`faction` 与 `quotes` 分工不同**：`faction` 只做来源标签，真正改价的是 `quotes` 的 key。
