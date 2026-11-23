// 多势力走势图：坐标与标签由 game.js 按「实时 / 近5年 / 近10年 / 全部」算好。
function niceScale(low, high) {
  const span = high - low || 1;
  const rough = span / 4;
  const power = 10 ** Math.floor(Math.log10(rough));
  const fraction = rough / power;
  const step = (fraction <= 1 ? 1 : fraction <= 2 ? 2 : fraction <= 5 ? 5 : 10) * power;
  return { step, floor: Math.floor(low / step) * step, ceiling: Math.ceil(high / step) * step };
}

function drawSeriesChart(canvas, chart, highlight = null) {
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  if (!width || !height || !chart?.series.length) return;
  const context = canvas.getContext("2d");
  if (!context) return;

  const scale = window.devicePixelRatio || 1;
  const pixelWidth = Math.round(width * scale);
  const pixelHeight = Math.round(height * scale);
  if (canvas.width !== pixelWidth) canvas.width = pixelWidth;
  if (canvas.height !== pixelHeight) canvas.height = pixelHeight;
  context.setTransform(pixelWidth / width, 0, 0, pixelHeight / height, 0, 0);
  context.clearRect(0, 0, width, height);

  const styles = getComputedStyle(canvas);
  const color = (name) => styles.getPropertyValue(name).trim();
  const left = 14;
  const right = width - 36;
  const top = 10;
  const bottom = height - 24;
  const xMin = chart.xMin;
  const xMax = Math.max(chart.xMax, xMin + 0.0001);
  const x = (value) => left + (value - xMin) / (xMax - xMin) * (right - left);

  const values = chart.series.flatMap((series) => series.points.map((point) => point.y));
  if (!values.length) return;
  let low = Math.min(...values);
  let high = Math.max(...values);
  if (low === high) {
    const padding = Math.max(1, Math.abs(low) * 0.1);
    low = Math.max(0, low - padding);
    high += padding;
  }
  const { step, floor, ceiling } = niceScale(low, high);
  const y = (value) => bottom - (value - floor) / (ceiling - floor) * (bottom - top);

  context.strokeStyle = color("--line");
  context.fillStyle = color("--muted");
  context.font = "12px system-ui, sans-serif";
  context.textAlign = "left";
  context.textBaseline = "middle";
  context.lineWidth = 1;
  for (let value = floor; value <= ceiling + step / 2; value += step) {
    const position = y(value);
    context.beginPath();
    context.moveTo(left, position);
    context.lineTo(right, position);
    context.stroke();
    context.fillText(chart.yLabel(Math.round(value)), right + 7, position);
  }

  const labels = chart.xLabels ?? [];
  labels.forEach((item, index) => {
    context.textAlign = index === 0 ? "left" : index === labels.length - 1 ? "right" : "center";
    context.fillText(item.label, x(item.x), height - 9);
  });
  context.textAlign = "left";

  // 选中的交易势力画在最上层；悬停的那一家再叠上去；多线时不填色，避免互相遮挡。
  // 高亮的势力可能在这一屏没有线（区间内无报价），此时不要误把其他线全部调暗。
  const activeHighlight = chart.series.some((series) => series.index === highlight) ? highlight : null;
  const order = (series) => Number(series.active) + (series.index === activeHighlight ? 2 : 0);
  const ordered = chart.series.slice().sort((a, b) => order(a) - order(b));
  const fill = chart.series.length === 1;
  for (const series of ordered) {
    const points = series.points;
    if (!points.length) continue;
    const dimmed = activeHighlight !== null && series.index !== activeHighlight;
    const line = new Path2D();
    line.moveTo(x(points[0].x), y(points[0].y));
    for (const point of points.slice(1)) line.lineTo(x(point.x), y(point.y));
    if (fill) {
      const area = new Path2D(line);
      area.lineTo(x(points.at(-1).x), bottom);
      area.lineTo(x(points[0].x), bottom);
      area.closePath();
      context.globalAlpha = 0.14;
      context.fillStyle = series.color;
      context.fill(area);
      context.globalAlpha = 1;
    }
    context.globalAlpha = dimmed ? 0.18 : 1;
    context.strokeStyle = series.color;
    context.lineWidth = series.index === activeHighlight ? 2.8 :
      series.active ? 2.6 : chart.series.length > 1 ? 1.6 : 2.2;
    context.lineJoin = "round";
    context.stroke(line);
    if (!dimmed) {
      const last = points.at(-1);
      context.beginPath();
      context.arc(x(last.x), y(last.y), series.active || series.index === activeHighlight ? 3.2 : 2.2, 0, Math.PI * 2);
      context.fillStyle = series.color;
      context.fill();
    }
  }
  context.globalAlpha = 1;
}
