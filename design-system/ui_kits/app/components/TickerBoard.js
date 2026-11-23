(function () {
  const el = window.OD.el;

  const FACTIONS = [
    { id: "wei", name: "曹氏", glyph: "曹", price: 132.5, change: -1.2, series: [138, 136, 137, 134, 133, 135, 131, 133, 130, 132.5] },
    { id: "shu", name: "刘氏", glyph: "刘", price: 118.0, change: 3.1, series: [106, 108, 107, 110, 112, 111, 114, 116, 115, 118] },
    { id: "wu", name: "孙氏", glyph: "孙", price: 97.3, change: 1.4, series: [92, 93, 92.5, 94, 95, 94.5, 96, 96.8, 97, 97.3] },
    { id: "dong", name: "董卓", glyph: "董", price: null, change: null, series: [], retired: true },
    { id: "tao", name: "陶谦", glyph: "陶", price: null, change: null, series: [], retired: true },
    { id: "zan", name: "公孙瓒", glyph: "瓒", price: null, change: null, series: [], retired: true },
    { id: "shao", name: "袁绍", glyph: "绍", price: 120.4, change: -3.6, series: [131, 129, 130, 127, 126, 128, 124, 125, 122, 120.4] },
    { id: "shu-yuan", name: "袁术", glyph: "术", price: null, change: null, series: [], retired: true },
    { id: "biao", name: "刘表", glyph: "表", price: 78.6, change: 0.6, series: [75, 76, 75.8, 77, 76.5, 77.4, 78, 77.6, 78.2, 78.6] },
    { id: "bu", name: "吕布", glyph: "吕", price: null, change: null, series: [], retired: true },
    { id: "jin", name: "司马氏", glyph: "晋", price: null, change: null, series: [] },
  ];

  function clone(rows) {
    return rows.map((row) => Object.assign({}, row, { series: row.series.slice() }));
  }

  function statusOf(faction) {
    if (faction.price !== null) return "listed";
    return faction.retired ? "retired" : "unlisted";
  }

  const SVG_NS = "http://www.w3.org/2000/svg";
  const MAX_POINTS = 60;

  function svgNode(tag, attrs, text) {
    const node = document.createElementNS(SVG_NS, tag);
    Object.keys(attrs).forEach((key) => node.setAttribute(key, String(attrs[key])));
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function sparkline(series, faction) {
    if (series.length < 2) {
      return el("p", { class: "empty", text: "挂牌后开始记录分时行情。" });
    }

    const points = series.slice(-MAX_POINTS);
    const rawLow = Math.min.apply(null, points);
    const rawHigh = Math.max.apply(null, points);
    const range = Math.max(0.4, rawHigh - rawLow);
    const low = rawLow - range * 0.14;
    const high = rawHigh + range * 0.14;
    const span = high - low;
    const stepX = points.length > 1 ? 100 / (points.length - 1) : 100;

    function yOf(value) {
      return (1 - (value - low) / span) * 100;
    }

    const coords = points.map((value, index) => [index * stepX, yOf(value)]);
    const linePath = coords.map(([x, y], index) => (index === 0 ? "M" : "L") + x.toFixed(2) + " " + y.toFixed(2)).join(" ");
    const areaPath = linePath + " L100 100 L0 100 Z";
    const lastX = coords[coords.length - 1][0];
    const lastY = coords[coords.length - 1][1];
    const lastLabelY = Math.min(96, Math.max(4, lastY));

    const svg = svgNode("svg", {
      viewBox: "0 0 100 100",
      preserveAspectRatio: "none",
      class: "spark-svg",
      role: "img",
      "aria-label": faction.name + " 最近 60 秒分时，现价 " + faction.price.toFixed(1) + " 铜钱",
    });

    [0, 50, 100].forEach((y) => {
      svg.append(svgNode("line", { x1: 0, x2: 100, y1: y, y2: y, class: "spark-grid" }));
    });
    svg.append(svgNode("path", { d: areaPath, class: "spark-area" }));
    svg.append(svgNode("path", { d: linePath, class: "spark-line" }));

    const plot = el("div", { class: "spark-plot" }, [
      svg,
      el("span", { class: "spark-dot", style: "left:" + lastX.toFixed(2) + "%;top:" + lastY.toFixed(2) + "%" }),
      el("span", {
        class: "spark-last",
        style: "top:" + lastLabelY.toFixed(2) + "%",
        text: faction.price.toFixed(1),
      }),
      el("span", { class: "spark-y", style: "top:0%", text: high.toFixed(1) }),
      el("span", { class: "spark-y", style: "top:50%", text: ((high + low) / 2).toFixed(1) }),
      el("span", { class: "spark-y", style: "top:100%", text: low.toFixed(1) }),
    ]);

    return el("div", { class: "spark-wrap" }, [
      plot,
      el("div", { class: "spark-x" }, [
        el("span", { text: "60 秒前" }),
        el("span", { text: "现在" }),
      ]),
    ]);
  }

  function TickerBoard() {
    let selected = 1;
    let quotes = clone(FACTIONS);

    const readout = el("div", { class: "quote-readout" }, [
      el("strong", { text: "" }),
      el("span", { text: "铜钱 / 股" }),
    ]);
    const status = el("p", { class: "chart-status" });
    const chartHost = el("div", { class: "chart-host" });

    const quoteSlots = [];
    const buttons = quotes.map((faction, index) => {
      const quote = el("span", { class: "ticker-quote" });
      quoteSlots.push(quote);
      return el("button", {
        class: "ticker",
        type: "button",
        "aria-pressed": "false",
        dataset: { status: statusOf(faction) },
        on: { click: () => select(index) },
      }, [
        el("span", { class: "faction" }, [el("i", { class: "emblem " + faction.id, "aria-hidden": "true", text: faction.glyph }), faction.name]),
        quote,
      ]);
    });

    function paintQuotes() {
      quotes.forEach((faction, index) => {
        buttons[index].dataset.status = statusOf(faction);
        quoteSlots[index].replaceChildren(
          faction.price === null
            ? el("b", { text: "—" })
            : el("b", { text: faction.price.toFixed(1) }),
          el("span", {
            class: faction.price === null ? "change" : "change " + (faction.change >= 0 ? "up" : "down"),
            text:
              faction.price === null
                ? (faction.retired ? "退市" : "未挂牌")
                : (faction.change >= 0 ? "+" : "") + faction.change.toFixed(1) + "%",
          })
        );
      });
    }

    function paintReadout() {
      const faction = quotes[selected];
      readout.firstChild.textContent = faction.price === null ? "—" : faction.price.toFixed(1);
      status.textContent = faction.price === null
        ? faction.name + (faction.retired ? " 已退市，行情停止" : " 尚未挂牌")
        : faction.name + " · 最近 60 秒逐秒报价 · 示例行情";
      chartHost.replaceChildren(
        faction.price === null
          ? el("p", {
              class: "empty",
              text: faction.retired ? faction.name + " 已退市，行情停止。" : "挂牌后开始记录分时行情。",
            })
          : sparkline(faction.series, faction)
      );
    }

    function select(index) {
      selected = index;
      buttons.forEach((button, position) => button.setAttribute("aria-pressed", String(position === index)));
      paintReadout();
    }

    function setQuote(price) {
      setQuotes({ shu: price });
    }

    function setQuotes(next) {
      const touched = [];
      Object.keys(next).forEach((id) => {
        const index = quotes.findIndex((faction) => faction.id === id);
        if (index < 0) return;
        const faction = quotes[index];
        const value = next[id];
        if (value === null) {
          faction.retired = Boolean(faction.retired) || faction.price !== null;
          faction.price = null;
          faction.change = null;
          faction.series = [];
        } else if (value !== faction.price) {
          const previous = faction.price;
          faction.price = value;
          faction.change = previous === null ? 0 : ((value - previous) / previous) * 100;
          if (faction.series[faction.series.length - 1] !== value) {
            faction.series = faction.series.concat(value);
            if (faction.series.length > MAX_POINTS) faction.series = faction.series.slice(-MAX_POINTS);
          }
        }
        touched.push(index);
      });
      paintQuotes();
      if (touched.indexOf(selected) >= 0) paintReadout();
    }

    function reset() {
      quotes = clone(FACTIONS);
      paintQuotes();
      paintReadout();
    }

    const node = el("section", { class: "panel-card market" }, [
      el("div", { class: "chart-head" }, [
        el("div", {}, [el("p", { class: "eyebrow", text: "势力行情 · 11 家" }), el("h2", { text: "三国交易所" })]),
        readout,
      ]),
      status,
      el("div", { class: "tickers", role: "group", "aria-label": "选择势力" }, buttons),
      chartHost,
    ]);

    node.setQuote = setQuote;
    node.setQuotes = setQuotes;
    node.reset = reset;
    paintQuotes();
    select(1);
    return node;
  }

  window.TickerBoard = TickerBoard;
  window.ODKit = window.ODKit || {};
  window.ODKit.TickerBoard = TickerBoard;
})();
