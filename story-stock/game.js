const $ = (id) => document.getElementById(id);
const number = new Intl.NumberFormat("zh-CN");
const format = (value) => number.format(value);
const coins = (value) => format(value) + " 铜钱";
const percent = (value) => {
  const rounded = Math.round(value * 1000) / 10;
  return (rounded > 0 ? "+" : "") + rounded.toFixed(1) + "%";
};
const tone = (value) => value > 0 ? "positive" : value < 0 ? "negative" : "neutral";
const priceStatus = (price) => price === null ? "待挂牌" : "已退市";

let market;
let selected;
let candleIndex;
let side;
let openedAt = null;
let timer;
let displayedPrice;

const tickers = factions.map((faction, index) => {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "ticker";
  button.innerHTML = `<span class="faction"><span class="emblem ${faction.id}" aria-hidden="true">${faction.mark}</span>${faction.name}</span>
    <span class="ticker-quote"><b></b><span class="change"></span></span>`;
  button.addEventListener("click", () => {
    if (selected === index) return;
    selected = index;
    candleIndex = null;
    candleGrid.replaceChildren();
    $("trade-status").textContent = "";
    renderTickers();
    renderQuoteChart();
    renderChart();
    renderOrder();
  });
  $("tickers").append(button);
  return button;
});

const plot = $("plot");
const quoteLine = $("quote-line");
const candleGrid = plot.querySelector(".candle-grid");
const chartAxis = plot.querySelector(".chart-axis");
const ticks = [0, 1, 2, 3, 4];
plot.querySelector(".chart-grid").innerHTML = ticks.map((tick) =>
  `<i class="grid-line" style="--tick:${tick * 25}%"></i>`).join("");
chartAxis.innerHTML = ticks.map((tick) =>
  `<span class="axis-price" style="--tick:${tick * 25}%"></span>`).join("");

function finished() {
  return market.tick === totalTicks;
}

function renderTickers() {
  let active = 0;
  market.stocks.forEach((stock, index) => {
    const candle = stock.candles.at(-1);
    const price = currentPrice(stock);
    if (price > 0) active += 1;
    const button = tickers[index];
    button.setAttribute("aria-pressed", String(index === selected));
    button.dataset.status = price > 0 ? "listed" : price === 0 ? "delisted" : "pending";
    button.querySelector("b").textContent = price === null ? "—" : format(price);
    const change = price > 0 ? (price - candle.open) / candle.open : 0;
    const badge = button.querySelector(".change");
    badge.className = "change " + tone(change);
    badge.textContent = price > 0 ? percent(change) : priceStatus(price);
  });
  $("market-status").textContent = "铜钱 / 股 · " + (finished() ? "已收盘" : active + " 家已挂牌");
}

function renderLedger() {
  const total = assetValue(market);
  const roi = (total - startingCash) / startingCash;
  $("equity").textContent = format(total);
  $("cash").textContent = format(market.cash);
  $("return").textContent = percent(roi);
  $("return").className = tone(roi);
  $("fees-paid").textContent = format(market.fees);

  const rows = market.stocks.filter((stock) => stock.shares > 0).map((stock) =>
    `<tr><th scope="row">${stock.faction.name}</th><td>${format(stock.shares)} 股</td><td>${format(currentPrice(stock) * stock.shares)}</td></tr>`);
  const positions = rows.join("") || '<tr><td colspan="3" class="empty-position">当前空仓</td></tr>';
  if ($("positions").innerHTML !== positions) $("positions").innerHTML = positions;
}

function renderQuoteChart() {
  const { faction, quoteHistory } = market.stocks[selected];
  const last = quoteHistory.at(-1);
  $("quote-chart-title").textContent = faction.name + " · 实时走势";
  $("quote-chart-empty").hidden = Boolean(last);
  $("quote-readout").hidden = !last;
  quoteLine.hidden = !last;
  if (!last) {
    $("quote-chart-status").textContent = "待挂牌";
    return;
  }

  const status = last.price === 0 ? "已退市" : finished() ? "已收盘" : openedAt === null ? "待开盘" : "每秒更新";
  $("quote-chart-status").textContent = "近 " + quoteWindow + " 秒 · " + status;
  $("quote-chart-price").textContent = format(last.price);
  const from = quoteTime(quoteHistory[0].tick);
  const to = quoteTime(last.tick);
  quoteLine.setAttribute("aria-label", faction.name + "报价折线，本局 " + from + " 至 " + to +
    "，最新报价 " + coins(last.price));
  drawQuoteLine(quoteLine, quoteHistory);
}

function renderChartDetail() {
  const candles = market.stocks[selected].candles;
  const index = candleIndex ?? candles.length - 1;
  const candle = candles[index];
  Array.from(candleGrid.children).forEach((button, position) => {
    button.setAttribute("aria-pressed", String(position === index));
  });
  $("candle-year").dateTime = candle.event ? String(candle.event.year) : "";
  $("candle-year").textContent = candle.event ? candle.event.year + " 年" : "实时";
  $("candle-title").textContent = candle.event?.title ?? "当前 K 线";
  $("ohlc").innerHTML = [
    ["开", candle.open], ["高", candle.high], ["低", candle.low], [candle.event ? "收" : "现价", candle.close]
  ].map(([label, price]) => `<div><dt>${label}</dt><dd>${format(price)}</dd></div>`).join("");
  $("candle-note").textContent = candle.event?.outcome ?? "本段行情持续更新，军情公布后收成一根 K 线。";
}

function renderChart() {
  const { faction, candles } = market.stocks[selected];
  $("chart-title").textContent = faction.name + " K 线";
  $("chart-empty").hidden = Boolean(candles.length);
  plot.hidden = !candles.length;
  $("chart-detail").hidden = !candles.length;
  if (!candles.length) {
    $("chart-range").textContent = "等待挂牌";
    return;
  }

  const last = candles.at(-1);
  const from = candles[0].event.year;
  const to = (last.event ?? candles.at(-2).event).year;
  const years = from === to ? String(from) : from + "–" + to;
  $("chart-range").textContent = years + " 年 · " + (last.close === 0 ? "完整走势 · 已退市" :
    finished() ? "完整走势 · 已收盘" : last.event ? "每根对应一段行情" : "盘中 · 每秒更新");

  const step = Math.ceil(Math.max(...candles.map((candle) => candle.high)) / 40) * 10;
  const ceiling = step * 4;
  const scale = (price) => (100 * price / ceiling).toFixed(3) + "%";
  ticks.forEach((tick) => { chartAxis.children[tick].textContent = format(ceiling - tick * step); });
  candleGrid.style.setProperty("--count", candles.length);
  candleGrid.dataset.dense = String(candles.length > 6);

  const labelInterval = Math.ceil(candles.length / 5);
  candles.forEach((candle, index) => {
    let button = candleGrid.children[index];
    if (!button) {
      button = document.createElement("button");
      button.type = "button";
      button.className = "candle-button";
      button.dataset.index = index;
      button.innerHTML = '<span class="candle-stick" aria-hidden="true"></span><span class="candle-year" aria-hidden="true"></span>';
      candleGrid.append(button);
    }
    const lastIndex = candles.length - 1;
    const axisYear = index === lastIndex || (index % labelInterval === 0 && index < lastIndex - 1) || candles.length <= 6;
    button.classList.toggle("axis-year", axisYear);
    const label = candle.event ? candle.event.year + " 年，" + candle.event.title + "，收盘 " : "盘中，现价 ";
    button.setAttribute("aria-label", label + coins(candle.close));
    button.lastElementChild.textContent = candle.event?.year ?? "盘中";
    const color = candle.close > candle.open ? "var(--red)" : candle.close < candle.open ? "var(--green)" : "var(--muted)";
    button.style.setProperty("--candle", color);
    button.style.setProperty("--wick-top", scale(ceiling - candle.high));
    button.style.setProperty("--wick-height", scale(candle.high - candle.low));
    button.style.setProperty("--body-top", scale(ceiling - Math.max(candle.open, candle.close)));
    button.style.setProperty("--body-height", scale(Math.abs(candle.close - candle.open)));
  });
  renderChartDetail();
}

function renderClock() {
  $("round-progress").max = totalTicks;
  $("round-progress").value = market.tick;
  const revealed = Math.floor(market.tick / ticksPerEvent);
  if (finished()) {
    $("round-label").textContent = revealed + " / " + story.length + " 条军情";
  } else if (openedAt === null) {
    $("round-label").textContent = story.length + " 条军情";
  } else {
    const remaining = ticksPerEvent - market.tick % ticksPerEvent;
    $("round-label").textContent = "下条军情 " + remaining + " 秒 · " + revealed + "/" + story.length;
  }
}

function renderStory() {
  const revealed = Math.floor(market.tick / ticksPerEvent);
  const latest = story[revealed - 1] ?? prologue.at(-1);
  const event = story[revealed] ?? latest;
  const isOpen = openedAt !== null && !finished();
  $("phase").textContent = finished() ? "已收盘" : isOpen ? "连续交易" : "待开盘";
  $("phase").dataset.phase = isOpen ? "live" : "closed";
  $("story-location").textContent = event.year + " 年 · " + event.where;
  $("story-title").textContent = finished() ? "本局结算" : event.preview;
  $("story-copy").textContent = finished() ? latest.outcome : event.lead;

  $("news").hidden = !revealed || finished();
  if (revealed && !finished()) {
    $("news-date").textContent = "最新军情 · " + latest.year + " 年";
    $("news-title").textContent = latest.title;
    $("news-copy").textContent = latest.outcome;
    $("impact").innerHTML = market.news.map(({ faction, before, after }) => {
      const change = before ? (after - before) / before : 0;
      const label = after === 0 ? "退市" : before === null ? "挂牌 " + format(after) : percent(change);
      return `<span class="impact-item">${faction.name} <strong class="${tone(change)}">${label}</strong></span>`;
    }).join("");
  }

  $("order").hidden = finished();
  $("preopen").hidden = isOpen;
  $("trade").hidden = !isOpen;
  $("summary").hidden = !finished();
  if (finished()) {
    const total = assetValue(market);
    const roi = (total - startingCash) / startingCash;
    $("summary-stats").innerHTML = [
      ["期末资产", format(total), ""], ["总收益率", percent(roi), tone(roi)],
      ["最高资产", format(market.peak), ""], ["成交次数", format(market.trades), ""],
      ["已付手续费", format(market.fees), ""]
    ].map(([label, value, style]) => `<div><dt>${label}</dt><dd class="${style}">${value}</dd></div>`).join("");
  }
}

function renderOrder() {
  const stock = market.stocks[selected];
  const price = currentPrice(stock);
  displayedPrice = price;
  const quote = price ? coins(price) + " / 股" : priceStatus(price);
  $("quote").textContent = stock.faction.name + " · " + quote;

  if (openedAt === null || finished()) return;
  const limit = tradeLimit(market, stock, side);
  const quantity = $("quantity").valueAsNumber;
  const buying = side === "buy";
  const valid = Number.isSafeInteger(quantity) && quantity > 0 && Number.isSafeInteger(price * quantity);
  const gross = valid && price ? price * quantity : 0;
  const fee = tradeFee(gross);

  $("buy").setAttribute("aria-pressed", String(buying));
  $("sell").setAttribute("aria-pressed", String(!buying));
  $("capacity").textContent = price ? (buying ? "可买 " : "可卖 ") + format(limit) + " 股" :
    price === null ? "等待挂牌" : "退市后停止交易";
  $("quantity").disabled = !price;
  $("quantity").max = Math.max(limit, 1);
  $("max").disabled = !limit;
  $("estimate-label").textContent = buying ? "预计支出" : "预计实收";
  $("estimate-fee").textContent = gross ? coins(fee) : "—";
  $("estimate").textContent = gross ? coins(buying ? gross + fee : gross - fee) : "—";
  $("submit").disabled = !valid || quantity > limit;
  $("submit").dataset.side = side;
  $("submit").textContent = buying ? "确认买入" : "确认卖出";
}

function renderMarket() {
  renderTickers();
  renderQuoteChart();
  renderChart();
  renderLedger();
  renderOrder();
  renderClock();
}

function syncClock() {
  if (openedAt === null || finished()) return;
  const tick = Math.min(totalTicks, Math.floor((performance.now() - openedAt) / tickMs));
  if (tick <= market.tick) return;
  const lastEvent = Math.floor(market.tick / ticksPerEvent);
  advanceMarket(market, tick);
  if (lastEvent !== Math.floor(market.tick / ticksPerEvent)) renderStory();
  renderMarket();
  if (finished()) clearInterval(timer);
}

function reset() {
  clearInterval(timer);
  openedAt = null;
  market = createMarket();
  selected = 0;
  candleIndex = null;
  side = "buy";
  candleGrid.replaceChildren();
  $("quantity").value = "1";
  $("trade-status").textContent = "";
  renderStory();
  renderMarket();
}

plot.addEventListener("click", (event) => {
  const button = event.target.closest(".candle-button");
  if (!button) return;
  const index = Number(button.dataset.index);
  candleIndex = index === candleGrid.childElementCount - 1 ? null : index;
  renderChartDetail();
});

for (const direction of ["buy", "sell"]) {
  $(direction).addEventListener("click", () => {
    side = direction;
    renderOrder();
  });
}

$("max").addEventListener("click", () => {
  const limit = tradeLimit(market, market.stocks[selected], side);
  if (limit) $("quantity").value = String(limit);
  renderOrder();
});
$("quantity").addEventListener("input", renderOrder);
$("trade").addEventListener("submit", (event) => {
  event.preventDefault();
  const previousQuote = displayedPrice;
  syncClock();
  if (openedAt === null || finished()) return;

  const stock = market.stocks[selected];
  const quantity = $("quantity").valueAsNumber;
  const price = currentPrice(stock);
  const status = $("trade-status");
  if (price !== previousQuote) {
    status.textContent = price ? "报价已更新，请按新报价确认。" : "该势力已停止交易。";
    return;
  }
  const order = executeTrade(market, stock, side, quantity);
  if (!order) {
    status.textContent = "当前可交易股数不足，请调整股数。";
    return;
  }
  const buying = side === "buy";
  status.textContent = (buying ? "买入 " : "卖出 ") + stock.faction.name + " " + format(quantity) +
    " 股，成交价 " + format(order.price) + "，手续费 " + format(order.fee) + "，" +
    (buying ? "实付 " : "实收 ") + coins(order.net) + "。";
  renderLedger();
  renderOrder();
});

$("open-market").addEventListener("click", () => {
  if (openedAt !== null) return;
  openedAt = performance.now();
  timer = setInterval(syncClock, 200);
  renderStory();
  renderMarket();
  $("buy").focus({ preventScroll: true });
});

$("restart").addEventListener("click", () => {
  reset();
  $("open-market").focus();
});
document.addEventListener("visibilitychange", syncClock);
$("help-open").addEventListener("click", () => $("help-dialog").showModal());
reset();
new ResizeObserver(() => drawQuoteLine(quoteLine, market.stocks[selected].quoteHistory)).observe(quoteLine);
