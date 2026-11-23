(function () {
  const el = window.OD.el;

  const TOYS = [
    { id: "market", label: "三国交易所", glyph: "市", world: "paper", eyebrow: "故事炒股模拟器 · 示例行情", title: "三国交易所", lede: "从诸侯会盟到三国归晋，买卖十一家势力。" },
    { id: "dub", label: "给这段乱配音", glyph: "声", world: "lilac", eyebrow: "猫和杯子 · 循环预览", title: "给这段乱配音", lede: "导入视频自动配出音效键，也可以先拿猫猫短片练手。" },
  ];

  function App() {
    let current = 0;
    const switchRow = el("div", { class: "kit-switch", role: "group", "aria-label": "切换玩具" });
    const stage = el("div", { class: "kit-stage" });
    const eyebrow = el("p", { class: "eyebrow" });
    const title = el("h1", { class: "kit-title" });
    const lede = el("p", { class: "kit-lede" });

    const buttons = TOYS.map((toy, index) =>
      el("button", {
        type: "button",
        "aria-pressed": "false",
        text: toy.label,
        on: { click: () => select(index) },
      })
    );
    buttons.forEach((button) => switchRow.append(button));

    function select(index) {
      current = index;
      const toy = TOYS[index];
      shell.dataset.world = toy.world;
      eyebrow.textContent = toy.eyebrow;
      title.textContent = toy.title;
      lede.textContent = toy.lede;
      buttons.forEach((button, position) => button.setAttribute("aria-pressed", String(position === index)));
      if (toy.id === "market") stage.replaceChildren(window.MarketBoard());
      else stage.replaceChildren(window.DubBoard());
    }

    const bar = el("header", { class: "kit-bar" }, [
      el("div", { class: "brand" }, [el("span", { class: "brand-mark", "aria-hidden": "true" }), el("span", { text: "单屏玩具" })]),
      switchRow,
      el("span", { class: "kit-meta mono", text: "design system · v1" }),
    ]);

    const shell = el("div", { class: "kit-shell", dataset: { world: "paper" } }, [
      bar,
      el("main", { class: "kit-main" }, [
        el("div", { class: "kit-intro" }, [eyebrow, title, lede]),
        stage,
        el("p", { class: "kit-note", text: "同一套骨架，不同玩具世界：底色、展示字体与强调色由 data-world 切换，结构、控件高度与文案节奏不变。" }),
      ]),
    ]);

    select(current);
    return shell;
  }

  window.App = App;
  window.ODKit = window.ODKit || {};
  window.ODKit.App = App;
})();
