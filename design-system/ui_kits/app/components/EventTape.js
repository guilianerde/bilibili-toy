(function () {
  const el = window.OD.el;

  function EventTape(config = {}) {
    const phase = el("span", { class: "tape-phase", text: "盘中", dataset: { phase: "live" } });
    const meta = el("span", { class: "tape-meta" });
    const title = el("strong", { class: "tape-title" });
    const next = el("span", { class: "tape-next" });
    const clock = el("span", { class: "tape-clock", text: "24 秒" });
    const jump = el("span", { class: "tape-jump", text: "看资讯 ›" });

    const node = el("button", {
      class: "event-tape",
      type: "button",
      "aria-label": "打开资讯栏目",
      on: { click: () => config.onOpen && config.onOpen() },
    }, [phase, meta, title, clock, next, jump]);

    function setClock(seconds, closed, closing) {
      clock.textContent = closed ? "已收盘" : (closing ? "收盘 " : "下一节 ") + Math.max(0, seconds) + " 秒";
      clock.dataset.state = closed ? "closed" : "live";
    }

    function update(view) {
      phase.textContent = view.phase;
      phase.dataset.phase = view.phase === "盘中" ? "live" : "open";
      meta.textContent = view.date + " · " + view.location;
      title.textContent = view.title;
      next.textContent = view.next;
      setClock(view.seconds, view.closed, view.last);
      node.setAttribute("aria-label", "打开资讯栏目：" + view.date + " · " + view.title);
    }

    return { node, update, setClock };
  }

  window.EventTape = EventTape;
  window.ODKit = window.ODKit || {};
  window.ODKit.EventTape = EventTape;
})();
