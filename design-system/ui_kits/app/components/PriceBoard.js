(function () {
  const el = window.OD.el;

  function PriceBoard(config = {}) {
    const beats = config.beats || [];
    const ticker = window.TickerBoard();

    const values = beats.map((beat) => beat.price);
    const low = Math.min.apply(null, values);
    const high = Math.max.apply(null, values);
    const span = Math.max(1, high - low);
    const pad = 0.1;

    function top(value) {
      const ratio = (value - low) / span;
      return ((1 - ratio) * (1 - pad * 2) + pad) * 100;
    }

    const slots = beats.map((beat, index) => {
      const open = index === 0 ? beat.price * 0.972 : beats[index - 1].price;
      const close = beat.price;
      const wickHigh = Math.max(open, close) * 1.012;
      const wickLow = Math.min(open, close) * 0.988;
      const bodyTop = top(Math.max(open, close));
      const bodyHeight = Math.max(2, Math.abs(top(open) - top(close)));
      const trend = close >= open ? "up" : "down";
      const candle = el("span", {
        class: "candle",
        dataset: { trend },
        style:
          "--wick-top:" + top(wickHigh).toFixed(1) + "%;" +
          "--wick-height:" + (top(wickLow) - top(wickHigh)).toFixed(1) + "%;" +
          "--body-top:" + bodyTop.toFixed(1) + "%;" +
          "--body-height:" + bodyHeight.toFixed(1) + "%;",
      });
      return el("div", {
        class: "candle-slot",
        dataset: { future: "true" },
        "aria-label": "第 " + (index + 1) + " 节 · " + beat.title + " · 收盘 " + close.toFixed(1),
      }, [candle, el("span", { class: "candle-year", text: beat.year })]);
    });

    const kline = el("div", {
      class: "kline",
      role: "group",
      "aria-label": "已揭晓事件的收盘价走势",
    }, slots);

    const node = el("div", { class: "price-board" }, [
      ticker,
      el("section", { class: "panel-card kline-card" }, [
        el("div", { class: "section-line" }, [
          el("h2", { text: "剧情价格走势" }),
          el("span", { text: "示例 · 收盘价" }),
        ]),
        kline,
        el("p", { class: "fact", text: "每揭晓一节补一根 K 线；红为涨、绿为跌，未来节次留白。" }),
      ]),
    ]);

    function update(view) {
      if (view.quotes) ticker.setQuotes(view.quotes);
      else ticker.setQuote(view.quote);
      slots.forEach((slot, index) => {
        slot.dataset.future = String(index > view.step - 1);
      });
    }

    function reset() {
      ticker.reset();
    }

    return { node, update, reset };
  }

  window.PriceBoard = PriceBoard;
  window.ODKit = window.ODKit || {};
  window.ODKit.PriceBoard = PriceBoard;
})();
