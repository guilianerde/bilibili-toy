(function () {
  const el = window.OD.el;
  const money = window.OD.money;

  function RoundStrip(config = {}) {
    const total = config.total || 9;
    const cells = [];

    function cell(label, initial) {
      const value = el("strong", { text: initial });
      const node = el("div", { class: "cell" }, [el("span", { class: "label", text: label }), value]);
      cells.push({ node, value });
      return node;
    }

    const node = el("div", { class: "round-strip", role: "group", "aria-label": "对局状态" }, [
      cell("回合", "第 1 / " + total + " 节"),
      cell("纪年", "公元 200 年"),
      cell("下一事件", "—"),
      cell("倒计时", "24 秒"),
      cell("总资产", "—"),
      cell("收益率", "—"),
    ]);

    function update(view) {
      cells[0].value.textContent = "第 " + view.step + " / " + total + " 节";
      cells[1].value.textContent = view.year;
      cells[2].value.textContent = view.next;
      cells[4].value.textContent = money(view.equity) + " 铜钱";
      const pct = view.returnPct;
      cells[5].value.textContent = (pct >= 0 ? "+" : "") + pct.toFixed(1) + "%";
      cells[5].value.className = pct >= 0 ? "up" : "down";
      setClock(view.seconds, view.closed, view.last);
    }

    function setClock(seconds, closed, closing) {
      cells[3].value.textContent = closed ? "已收盘" : (closing ? "收盘 " + Math.max(0, seconds) + " 秒" : Math.max(0, seconds) + " 秒");
      cells[3].value.dataset.state = closed ? "closed" : "live";
    }

    return { node, update, setClock };
  }

  window.RoundStrip = RoundStrip;
  window.ODKit = window.ODKit || {};
  window.ODKit.RoundStrip = RoundStrip;
})();
