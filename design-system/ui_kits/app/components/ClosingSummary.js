(function () {
  const el = window.OD.el;
  const money = window.OD.money;

  function ClosingSummary(config = {}) {
    const onRestart = config.onRestart || function () {};
    const onExit = config.onExit || function () {};

    const kicker = el("p", { class: "eyebrow", text: "收盘 · 示例对局" });
    const title = el("h2", { text: "三国归晋" });
    const lede = el("p", { class: "closing-lede" });
    const equity = el("dd", { text: "—" });
    const returns = el("dd", { text: "—" });
    const peak = el("dd", { text: "—" });
    const trades = el("dd", { text: "—" });
    const fees = el("dd", { text: "—" });

    const node = el("section", { class: "panel-card closing", hidden: true }, [
      kicker,
      title,
      lede,
      el("dl", { class: "closing-grid" }, [
        el("div", {}, [el("dt", { text: "期末总资产" }), equity]),
        el("div", {}, [el("dt", { text: "本局收益率" }), returns]),
        el("div", {}, [el("dt", { text: "最高资产" }), peak]),
        el("div", {}, [el("dt", { text: "成交次数" }), trades]),
        el("div", {}, [el("dt", { text: "累计手续费" }), fees]),
      ]),
      el("div", { class: "closing-actions" }, [
        el("button", { class: "primary", type: "button", text: "再开一局", on: { click: onRestart } }),
      ].concat(config.onExit ? [
        el("button", { class: "secondary", type: "button", text: "回到案件", on: { click: onExit } }),
      ] : [])),
      el("p", { class: "fact", text: "示例对局：9 节剧情、10,000 铜钱本金、0.5% 手续费。" }),
    ]);

    function show(view) {
      kicker.textContent = "收盘 · 公元 " + view.year + " 年";
      title.textContent = view.title;
      lede.textContent =
        view.returnPct >= 0
          ? "交易所鸣钟收盘。这一局，你的铜钱比开局更多。"
          : "交易所鸣钟收盘。这一局，你的铜钱比开局更少。";
      equity.textContent = money(view.equity) + " 铜钱";
      returns.textContent = (view.returnPct >= 0 ? "+" : "") + view.returnPct.toFixed(1) + "%";
      returns.className = view.returnPct >= 0 ? "up" : "down";
      peak.textContent = money(view.maxEquity) + " 铜钱";
      trades.textContent = view.trades + " 次";
      fees.textContent = money(view.fees) + " 铜钱";
      node.hidden = false;
    }

    function hide() {
      node.hidden = true;
    }

    return { node, show, hide };
  }

  window.ClosingSummary = ClosingSummary;
  window.ODKit = window.ODKit || {};
  window.ODKit.ClosingSummary = ClosingSummary;
})();
