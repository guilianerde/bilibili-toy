(function () {
  const el = window.OD.el;
  const money = window.OD.money;

  function row(label, value, extra) {
    return el("div", {}, [el("dt", { text: label }), el("dd", { text: value, class: extra || "" })]);
  }

  function HoldingsCard() {
    const equity = el("dd", { text: "—" });
    const cash = el("dd", { text: "—" });
    const returns = el("dd", { text: "—" });
    const fees = el("dd", { text: "—" });
    const body = el("tbody");

    const node = el("section", { class: "panel-card ledger" }, [
      el("div", { class: "section-line" }, [el("h2", { text: "我的账本" }), el("span", { text: "示例数据" })]),
      el("dl", { class: "ledger-grid" }, [
        el("div", {}, [el("dt", { text: "总资产" }), equity]),
        el("div", {}, [el("dt", { text: "可用现金" }), cash]),
        el("div", {}, [el("dt", { text: "总收益率" }), returns]),
        el("div", {}, [el("dt", { text: "已付手续费" }), fees]),
      ]),
      el("div", { class: "table-wrap" }, [
        el("table", {}, [
          el("thead", {}, [el("tr", {}, [
            el("th", { scope: "col", text: "势力" }),
            el("th", { scope: "col", text: "持仓" }),
            el("th", { scope: "col", text: "现价" }),
            el("th", { scope: "col", text: "浮盈" }),
          ])]),
          body,
        ]),
      ]),
      el("p", { class: "fact", text: "持仓按当前报价估值；买卖各收 0.5% 手续费，最低 1 铜钱。" }),
    ]);

    function update(view) {
      equity.textContent = money(view.equity) + " 铜钱";
      cash.textContent = money(view.cash) + " 铜钱";
      returns.textContent = (view.returnPct >= 0 ? "+" : "") + view.returnPct.toFixed(1) + "%";
      returns.className = view.returnPct >= 0 ? "up" : "down";
      fees.textContent = money(view.fees) + " 铜钱";

      body.replaceChildren(
        ...view.positions.map((position) => {
          const price = position.price === null ? 0 : position.price;
          const pl = (price - position.cost) * position.shares;
          return el("tr", {}, [
            el("td", {}, [
              el("span", { text: position.name }),
              el("span", { class: "cost", text: "成本 " + position.cost.toFixed(1) }),
            ]),
            el("td", { text: position.shares + " 股" }),
            el("td", { text: position.price === null ? "退市" : position.price.toFixed(1) }),
            el("td", { class: pl >= 0 ? "up" : "down", text: (pl >= 0 ? "+" : "−") + money(Math.abs(pl)) }),
          ]);
        })
      );
    }

    return { node, update };
  }

  window.HoldingsCard = HoldingsCard;
  window.ODKit = window.ODKit || {};
  window.ODKit.HoldingsCard = HoldingsCard;
})();
