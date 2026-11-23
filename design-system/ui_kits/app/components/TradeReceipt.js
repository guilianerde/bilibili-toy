(function () {
  const el = window.OD.el;
  const money = window.OD.money;

  function TradeReceipt(config = {}) {
    const limit = config.limit || 8;
    const count = el("span", { text: "0 笔" });
    const list = el("ol", { class: "receipts" });
    const empty = el("p", { class: "empty", text: "还没有成交。选好方向、填好股数，按下确认。" });

    const node = el("section", { class: "panel-card receipts-card" }, [
      el("div", { class: "section-line" }, [el("h2", { text: "成交回执" }), count]),
      empty,
      list,
    ]);

    function push(entry) {
      const net = entry.side === "buy" ? -(Math.round(entry.gross) + entry.charge) : Math.round(entry.gross) - entry.charge;
      list.prepend(
        el("li", { class: "receipt" }, [
          el("div", { class: "receipt-meta" }, [
            el("strong", { text: "第 " + entry.step + " 节 · " + (entry.side === "buy" ? "买入 " : "卖出 ") + entry.name + " " + entry.shares + " 股" }),
            el("span", { text: "成交价 " + entry.price.toFixed(1) + " · 手续费 " + entry.charge + " 铜钱" }),
          ]),
          el("span", { class: "receipt-amount", text: (net >= 0 ? "+" : "−") + money(Math.abs(net)) + " 铜钱" }),
        ])
      );
      while (list.children.length > limit) list.lastChild.remove();
      count.textContent = String(list.children.length) + " 笔 · 最近在前";
      empty.hidden = true;
    }

    function reset() {
      list.replaceChildren();
      count.textContent = "0 笔";
      empty.hidden = false;
    }

    return { node, push, reset };
  }

  window.TradeReceipt = TradeReceipt;
  window.ODKit = window.ODKit || {};
  window.ODKit.TradeReceipt = TradeReceipt;
})();
