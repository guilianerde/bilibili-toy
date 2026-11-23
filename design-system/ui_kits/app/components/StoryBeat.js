(function () {
  const el = window.OD.el;

  function StoryBeat(config = {}) {
    const total = config.total || 9;

    const phase = el("span", { class: "phase", text: "盘中", dataset: { phase: "live" } });
    const round = el("span", { class: "story-round", text: "节 1 / " + total });
    const location = el("p", { class: "story-location" });
    const title = el("h2", { class: "story-title" });
    const copy = el("p", { class: "story-copy" });
    const impacts = el("div", { class: "story-impacts" });
    const progress = el("progress", { class: "progress", max: total, value: 1, "aria-label": "故事进度" });
    const clock = el("span", { class: "story-clock", text: "下一事件 24 秒" });
    const clockWrap = el("div", { class: "story-clock-row" }, [clock]);

    const node = el("section", { class: "panel-card story-beat" }, [
      el("div", { class: "story-head" }, [phase, round]),
      location,
      title,
      copy,
      impacts,
      el("div", { class: "story-foot" }, [progress, clockWrap]),
      el("p", { class: "fact", text: "示例剧情节选 · 共 " + total + " 节，按实盘时钟自动推进；以上数字不构成投资建议。" }),
    ]);

    function setClock(seconds, closed, closing) {
      clock.textContent = closed
        ? "已收盘 · 见结算单"
        : (closing ? "收盘倒计时 " : "下一事件 ") + Math.max(0, seconds) + " 秒";
      clockWrap.dataset.state = closed ? "closed" : "live";
    }

    function update(view) {
      phase.textContent = view.phase;
      phase.dataset.phase = view.phase === "盘中" ? "live" : "open";
      round.textContent = "节 " + view.step + " / " + total;
      location.textContent = "公元 " + view.year + " 年 · " + view.location;
      title.textContent = view.title;
      copy.textContent = view.copy;
      progress.value = view.step;
      impacts.replaceChildren(
        el("span", { class: "impact-label", text: "势力影响" }),
        ...view.impacts.map((impact) =>
          el("span", { class: "impact" }, [
            el("span", { text: impact.name }),
            el("b", { class: impact.tone === "up" ? "up" : impact.tone === "down" ? "down" : "", text: impact.value }),
          ])
        )
      );
      setClock(view.seconds, view.closed, view.last);
    }

    return { node, update, setClock };
  }

  window.StoryBeat = StoryBeat;
  window.ODKit = window.ODKit || {};
  window.ODKit.StoryBeat = StoryBeat;
})();
