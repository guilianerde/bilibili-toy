(function () {
  function el(tag, props, children) {
    const node = document.createElement(tag);
    const attrs = props || {};
    Object.keys(attrs).forEach((key) => {
      const value = attrs[key];
      if (value === undefined || value === null || value === false) return;
      if (key === "class") node.className = value;
      else if (key === "dataset") Object.assign(node.dataset, value);
      else if (key === "text") node.textContent = value;
      else if (key === "on") {
        Object.keys(value).forEach((type) => {
          if (typeof value[type] === "function") node.addEventListener(type, value[type]);
        });
      }
      else node.setAttribute(key, value);
    });
    const list = children || [];
    (Array.isArray(list) ? list : [list]).forEach((child) => {
      if (child === undefined || child === null || child === false) return;
      node.append(child.nodeType ? child : document.createTextNode(String(child)));
    });
    return node;
  }

  function money(value) {
    return Number(value).toLocaleString("zh-CN", { maximumFractionDigits: 2 });
  }

  window.OD = { el, money };
})();
