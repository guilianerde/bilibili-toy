(function () {
  const el = window.OD.el;

  function MarketTabs(config = {}) {
    const items = config.items || [];
    const byId = {};
    let active = "";

    const bar = el("div", {
      class: "market-tabs",
      role: "tablist",
      "aria-label": config.label || "交易所栏目",
    });
    const host = el("div", { class: "market-panels" });
    const buttons = [];
    const panels = [];
    let initialized = false;

    items.forEach((item) => {
      const tabId = "od-market-tab-" + item.id;
      const panelId = "od-market-panel-" + item.id;
      const badge = el("span", { class: "tab-badge", hidden: true, "aria-hidden": "true" });
      const label = el("span", { class: "tab-label", text: item.label });
      const button = el("button", {
        class: "market-tab",
        type: "button",
        id: tabId,
        role: "tab",
        "aria-selected": "false",
        "aria-controls": panelId,
        tabindex: "-1",
        on: { click: () => select(item.id) },
      }, [label, badge]);
      const content = Array.isArray(item.content) ? item.content : [item.content];
      const panel = el("div", {
        class: "market-panel " + (item.className || ""),
        role: "tabpanel",
        id: panelId,
        "aria-labelledby": tabId,
        tabindex: "0",
        hidden: true,
      }, content);

      byId[item.id] = { item, button, panel, badge, label };
      buttons.push(button);
      panels.push(panel);
      bar.append(button);
      host.append(panel);
    });

    function select(id, options = {}) {
      const entry = byId[id];
      if (!entry || active === id) {
        if (entry && options.focus) entry.button.focus();
        return;
      }
      active = id;
      Object.keys(byId).forEach((key) => {
        const current = byId[key];
        const selected = key === id;
        current.button.setAttribute("aria-selected", String(selected));
        current.button.tabIndex = selected ? 0 : -1;
        current.panel.hidden = !selected;
      });
      if (options.focus) entry.button.focus();
      if (initialized && config.onSelect) config.onSelect(id);
    }

    function setBadge(id, visible) {
      const entry = byId[id];
      if (!entry) return;
      entry.badge.hidden = !visible;
      entry.button.setAttribute("aria-label", visible ? entry.item.label + "，有新事件" : entry.item.label);
    }

    bar.addEventListener("keydown", (event) => {
      if (!["ArrowRight", "ArrowLeft", "Home", "End"].includes(event.key)) return;
      event.preventDefault();
      const order = items.map((item) => item.id);
      const currentIndex = order.indexOf(active);
      let nextIndex = currentIndex;
      if (event.key === "ArrowRight") nextIndex = (currentIndex + 1) % order.length;
      else if (event.key === "ArrowLeft") nextIndex = (currentIndex - 1 + order.length) % order.length;
      else if (event.key === "Home") nextIndex = 0;
      else if (event.key === "End") nextIndex = order.length - 1;
      select(order[nextIndex], { focus: true });
    });

    if (items.length) {
      select(items[0].id);
      initialized = true;
    }

    return {
      node: el("div", { class: "market-tabs-shell" }, [bar, host]),
      select,
      setBadge,
      get active() {
        return active;
      },
    };
  }

  window.MarketTabs = MarketTabs;
  window.ODKit = window.ODKit || {};
  window.ODKit.MarketTabs = MarketTabs;
})();
