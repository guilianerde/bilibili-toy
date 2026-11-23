# 出处与授权记录 · Provenance

本设计系统由 OpenDesign 项目「将代码提交到github」生成，源工程为本地文件夹 `/Users/rowansen/Documents/bilibili-toy`。生成时间：2026-11-23。除明确列出的素材外，本包内所有内容都是根据源文件重建的令牌、样式、组件与文案结构。

## 源文件

| 文件 | 大小 | 角色 | 在本包中的位置 |
| --- | --- | --- | --- |
| `bilibili-toy/index.html` | 16015 bytes | 弹幕侦探单文件玩具 | `source_examples/bilibili-toy/index.html`、快照 `context/local-code/bilibili-toy/files/bilibili-toy/index.html` |
| `bilibili-toy/bilibili-toy.zip` | 5575 bytes | 单文件原始打包 | `assets/bilibili-toy-original.zip` |
| `dub-it/index.html` | 9952 bytes | 配音台页面与内联样式 | `source_examples/dub-it/index.html` |
| `dub-it/game.js` | 16038 bytes | 录音、回放与键位状态 | `source_examples/dub-it/game.js` |
| `dub-it/scene.js` | 8182 bytes | Canvas 猫猫短片 | `source_examples/dub-it/scene.js` |
| `dub-it/video.js` | 4335 bytes | 视频导入与时间轴 | `source_examples/dub-it/video.js` |
| `story-stock/index.html` | 7650 bytes | 交易所页面结构 | `source_examples/story-stock/index.html` |
| `story-stock/style.css` | 13316 bytes | 交易所全部样式与令牌 | `source_examples/story-stock/style.css` |
| `story-stock/game.js` | 14933 bytes | 交易规则与账本 | `source_examples/story-stock/game.js` |
| `story-stock/market.js` | 3609 bytes | 报价与波动 | `source_examples/story-stock/market.js` |
| `story-stock/story.js` | 9336 bytes | 20 个剧情节点 | `source_examples/story-stock/story.js` |
| `story-stock/quote-chart.js` | 3100 bytes | 分时折线绘制 | `source_examples/story-stock/quote-chart.js` |
| `story-stock/PLAN.md` | — | 玩法与验收说明 | `source_examples/story-stock/PLAN.md` |

## 图片与二进制资源

| 文件 | 尺寸 / 类型 | 来源 | 授权状态 |
| --- | --- | --- | --- |
| `assets/han-river.jpg` | 1600 × 533 JPEG（211912 bytes） | 源工程 `story-stock/han-river.jpg`，原样复制未重编码；用作三国交易所 hero 底图 | **未知**。源工程未包含 LICENSE 或署名信息，无法确认原始作者与许可；按「源项目自带素材」使用。对外分发前应替换为可确认授权的素材，或在获得授权前不上线。 |
| `assets/bilibili-toy-original.zip` | ZIP（5575 bytes） | 源工程根目录同名文件 | 与源工程一致，未知。 |
| `context/local-code/bilibili-toy/files/story-stock/han-river.jpg` | 同上 | 证据快照副本 | 仅用于证据比对。 |

## 字体

三个源文件都没有附带字体文件，界面完全依赖操作系统字体：`PingFang SC`、`Microsoft YaHei`、`Noto Sans CJK SC`、`Songti SC`、`Noto Serif CJK SC`、`STSong`、`SimSun`。因此本包没有 `fonts/` 目录，`colors_and_type.css` 只声明字体栈，不绑定任何字体 URL。若目标环境没有这些字体，请替换为同风格的可授权字体，不要在包里伪造字体文件。

## 未保留或未复现的内容

- 源工程的 `.git` 目录、编辑器缓存未被复制。
- `story-stock` 的行情数值、玩家初始资产与终局数字属于游戏内虚拟值，未作为「真实指标」写入文档；预览与组件库中的报价均标注为「示例行情」。
- 弹幕侦探的完整判分逻辑与 `VerdictForm` 一致（两题各 1 分，满分 2），但重玩与焦点管理的少量实现细节已被重写为可复用组件，行为等价而非逐行复制。

## 生成物说明

`DESIGN.md`、`README.md`、`SKILL.md`、`colors_and_type.css`、`tokens.css`、`preview/`、`ui_kits/app/` 均为本次根据证据生成的产物，不含第三方依赖。`source_examples/` 与 `assets/` 保留原始字节，便于后续核对。
