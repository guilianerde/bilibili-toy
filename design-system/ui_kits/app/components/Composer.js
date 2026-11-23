(function () {
  const el = window.OD.el;

  function Composer(config) {
    let quote = config.quote || 112.6;
    const fallbackCapacity = config.capacity || 88;
    let side = "buy";

    const buy = el("button", { type: "button", "aria-pressed": "true", text: "买入" });
    const sell = el("button", { type: "button", "aria-pressed": "false", text: "卖出" });
    const fee = el("span", { text: "—" });
    const total = el("strong", { text: "—" });
    const totalLabel = el("span", { text: "预计支出" });
    const submit = el("button", { class: "primary", type: "submit", text: "确认买入" });
    const status = el("p", { class: "trade-status", role: "status" });
    const capacityLabel = el("span", { text: "" });

    function capacityFor(direction) {
      const value = config.capacityFor ? config.capacityFor(direction) : fallbackCapacity;
      return Math.max(0, Math.floor(Number(value) || 0));
    }

    const input = window.InputBar({
      id: "od-quantity",
      max: capacityFor("buy"),
      value: 10,
      onChange: () => compute(),
    });

    function syncCapacity() {
      const capacity = capacityFor(side);
      capacityLabel.textContent = capacity === 0 ? "暂无可交易股数" : "最多 " + capacity + " 股";
      input.setMax(capacity === 0 ? 1 : capacity);
    }

    function compute() {
      const shares = input.value;
      const gross = shares * quote;
      const charge = Math.max(1, Math.ceil(gross * 0.005));
      fee.textContent = charge + " 铜钱";
      total.textContent =
        (side === "buy" ? Math.round(gross + charge) : Math.round(gross - charge)).toLocaleString("zh-CN") + " 铜钱";
      totalLabel.textContent = side === "buy" ? "预计支出" : "预计收入";
      submit.textContent = side === "buy" ? "确认买入" : "确认卖出";
      submit.classList.toggle("sell", side === "sell");
      return { shares, gross, charge };
    }

    function setSide(next) {
      side = next;
      buy.setAttribute("aria-pressed", String(side === "buy"));
      sell.setAttribute("aria-pressed", String(side === "sell"));
      syncCapacity();
      compute();
    }

    buy.addEventListener("click", () => setSide("buy"));
    sell.addEventListener("click", () => setSide("sell"));

    const form = el("form", { class: "trade", novalidate: "novalidate" }, [
      el("div", { class: "sides", role: "group", "aria-label": "交易方向" }, [buy, sell]),
      el("div", { class: "quantity-head" }, [
        el("label", { for: "od-quantity", text: "股数" }),
        capacityLabel,
      ]),
      input.node,
      el("div", { class: "order-total" }, [el("span", { text: "手续费 · 0.5%，最低 1 铜钱" }), fee]),
      el("div", { class: "order-total" }, [totalLabel, total]),
      submit,
      status,
    ]);

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const result = compute();
      const trade = { side: side, quote: quote, shares: result.shares, gross: result.gross, charge: result.charge };
      const outcome = config.onTrade ? config.onTrade(trade) : null;
      if (outcome && outcome.message) {
        status.textContent = outcome.message;
        return;
      }
      status.textContent =
        (side === "buy" ? "已买入 " : "已卖出 ") + result.shares + " 股，成交额 " + Math.round(result.gross).toLocaleString("zh-CN") + " 铜钱。";
    });

    syncCapacity();
    compute();
    return {
      node: form,
      get side() { return side; },
      compute,
      setQuote(next) { quote = next; syncCapacity(); compute(); },
      setStatus(text) { status.textContent = text; },
    };
  }

  window.Composer = Composer;
  window.ODKit = window.ODKit || {};
  window.ODKit.Composer = Composer;
})();
