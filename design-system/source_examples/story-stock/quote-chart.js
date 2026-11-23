function quoteTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  return minutes + ":" + String(seconds % 60).padStart(2, "0");
}

function drawQuoteLine(canvas, quotes) {
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  if (!width || !height || !quotes.length) return;
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
  const left = 16;
  const right = width - 32;
  const top = 9;
  const bottom = height - 24;
  const start = quotes[0].tick;
  const last = quotes.at(-1);
  const duration = Math.max(15, last.tick - start);
  const prices = quotes.map(({ price }) => price);
  const low = Math.min(...prices);
  const high = Math.max(...prices);
  const step = Math.max(1, Math.ceil((high - low) / 3));
  const floor = Math.max(0, low - step);
  const intervals = Math.max(3, Math.ceil((high + step - floor) / step));
  const x = (tick) => left + (tick - start) / duration * (right - left);
  const y = (price) => bottom - (price - floor) / (intervals * step) * (bottom - top);

  context.strokeStyle = color("--line");
  context.fillStyle = color("--muted");
  context.font = "12px system-ui, sans-serif";
  context.textAlign = "left";
  context.textBaseline = "middle";
  context.lineWidth = 1;
  for (let index = 0; index <= intervals; index += 1) {
    const price = floor + index * step;
    const position = y(price);
    context.beginPath();
    context.moveTo(left, position);
    context.lineTo(right, position);
    context.stroke();
    context.fillText(price, right + 7, position);
  }
  context.textAlign = "center";
  const timeIntervals = width < 360 ? 3 : 4;
  for (let index = 0; index <= timeIntervals; index += 1) {
    const tick = start + Math.round(duration * index / timeIntervals);
    context.fillText(quoteTime(tick), x(tick), height - 9);
  }

  const line = new Path2D();
  line.moveTo(x(start), y(quotes[0].price));
  for (const { tick, price } of quotes.slice(1)) line.lineTo(x(tick), y(price));
  const area = new Path2D(line);
  area.lineTo(x(last.tick), bottom);
  area.lineTo(x(start), bottom);
  area.closePath();
  const gradient = context.createLinearGradient(0, top, 0, bottom);
  gradient.addColorStop(0, color("--quote-fill"));
  gradient.addColorStop(1, "transparent");
  context.fillStyle = gradient;
  context.fill(area);

  context.strokeStyle = color("--quote-line");
  context.lineWidth = 2;
  context.lineJoin = "round";
  context.stroke(line);
  context.beginPath();
  context.arc(x(last.tick), y(last.price), 3, 0, Math.PI * 2);
  context.fillStyle = context.strokeStyle;
  context.fill();
}
