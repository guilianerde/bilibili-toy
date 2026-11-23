(function () {
  const el = window.OD.el;

  function InputBar(config) {
    const input = el("input", {
      type: "number",
      id: config.id || "od-quantity",
      inputmode: "numeric",
      min: "1",
      max: String(config.max || 999),
      step: "1",
      value: String(config.value || 1),
    });
    let maxValue = Math.max(1, Math.floor(Number(config.max) || 999));
    const max = el("button", { class: "max", type: "button", text: "最大" });

    function read() {
      const raw = Math.max(1, Math.floor(Number(input.value) || 1));
      input.value = String(raw);
      if (config.onChange) config.onChange(raw);
      return raw;
    }

    input.addEventListener("input", read);
    max.addEventListener("click", () => {
      input.value = String(maxValue);
      read();
    });

    return {
      node: el("div", { class: "quantity-row" }, [input, max]),
      get value() { return Math.max(1, Math.floor(Number(input.value) || 1)); },
      read,
      setMax(value) {
        maxValue = Math.max(1, Math.floor(Number(value) || 1));
        input.setAttribute("max", String(maxValue));
      },
      focus() { input.focus(); },
    };
  }

  window.InputBar = InputBar;
  window.ODKit = window.ODKit || {};
  window.ODKit.InputBar = InputBar;
})();
