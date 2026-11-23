(function () {
  const el = window.OD.el;

  const PADS = [
    { key: "brake", label: "刹车", code: "B" },
    { key: "boom", label: "爆炸", code: "X" },
    { key: "clap", label: "场记", code: "C" },
    { key: "sting", label: "叮", code: "S" },
    { key: "ding", label: "水声", code: "D" },
    { key: "meow", label: "喵", code: "M" },
  ];

  function DubBoard() {
    let mode = "idle";
    let marks = 0;

    const status = el("span", { text: "循环预览 · 0.0 秒" });
    const rail = el("div", { class: "rail" });
    const fill = el("div", { class: "fill" });
    const layer = el("div", { class: "marker-layer" });
    const hint = el("p", { class: "hint", role: "status", text: "按键的时机会被记下，配完就能回放。" });
    const primary = el("button", { class: "primary", type: "button", text: "开始录制" });
    const replay = el("button", { class: "secondary", type: "button", text: "回放" });

    const pads = PADS.map((pad) =>
      el("button", {
        class: "pad " + pad.key,
        type: "button",
        on: { click: () => strike(pad) },
      }, [el("span", { class: "icon", text: pad.label }), el("kbd", { text: pad.code })])
    );

    function strike(pad) {
      pads.forEach((node) => node.classList.remove("hit"));
      const button = pads.find((node) => node.classList.contains(pad.key));
      if (button) button.classList.add("hit");
      marks = Math.min(marks + 1, 8);
      const marker = el("span", { class: "marker " + pad.key, style: "--at:" + (12 + marks * 9) + "%" });
      layer.append(marker);
      status.textContent = (mode === "recording" ? "录制中" : "预览中") + " · " + marks + " 个音效";
      fill.style.transform = "scaleX(" + Math.min(1, marks / 8) + ")";
      hint.textContent = "记下第 " + marks + " 个音效：" + pad.label + "。";
    }

    primary.addEventListener("click", () => {
      if (mode === "recording") {
        mode = "idle";
        primary.textContent = "开始录制";
        status.textContent = "预览中 · " + marks + " 个音效";
        return;
      }
      mode = "recording";
      marks = 0;
      layer.replaceChildren();
      fill.style.transform = "scaleX(0)";
      primary.textContent = "结束录制";
      status.textContent = "录制中 · 0.0 秒";
      hint.textContent = "录制已开始，敲一个键试试。";
    });

    replay.addEventListener("click", () => {
      if (marks === 0) {
        hint.textContent = "还没有录下任何音效。";
        return;
      }
      hint.textContent = "回放 " + marks + " 个音效：按顺序重播一次。";
      pads.forEach((node) => node.classList.remove("hit"));
      let step = 0;
      const timer = setInterval(() => {
        const marker = layer.children[step];
        const pad = PADS.find((item) => marker && marker.classList.contains(item.key));
        pads.forEach((node) => node.classList.remove("hit"));
        if (pad) {
          const button = pads.find((node) => node.classList.contains(pad.key));
          if (button) button.classList.add("hit");
        }
        step += 1;
        if (step >= marks) {
          clearInterval(timer);
          setTimeout(() => pads.forEach((node) => node.classList.remove("hit")), 200);
        }
      }, 260);
    });

    const board = el("section", { class: "panel-card dub" }, [
      el("div", { class: "frame-head" }, [el("span", { text: "猫和杯子" }), status]),
      el("div", { class: "track", "aria-hidden": "true" }, [rail, fill, layer]),
      el("h2", { text: "给这段乱配音" }),
      el("p", { class: "fact", text: "导入视频自动配出音效键；示例里先拿猫猫短片练手。" }),
      el("div", { class: "pads", role: "group", "aria-label": "音效键" }, pads),
      el("div", { class: "transport" }, [primary, replay]),
      hint,
    ]);

    board.addEventListener("keydown", (event) => {
      if (event.target && /input|textarea/.test(event.target.tagName.toLowerCase())) return;
      const pad = PADS.find((item) => item.code === event.key.toUpperCase());
      if (!pad) return;
      event.preventDefault();
      strike(pad);
    });

    return board;
  }

  window.DubBoard = DubBoard;
  window.ODKit = window.ODKit || {};
  window.ODKit.DubBoard = DubBoard;
})();
