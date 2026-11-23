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
let revealedCount = 0;
let renderedDispatches = -1;
let dispatchFreshTimer;

const tickers = factions.map((faction, index) => {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "ticker";
  button.innerHTML = `<span class="faction"><span class="emblem ${faction.id}" aria-hidden="true">${faction.mark}</span>${faction.name}</span>
    <span class="ticker-quote"><b></b><span class="change"></span></span>`;
  button.addEventListener("click", () => selectFaction(index));
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

const factionSelect = $("faction-select");
factionSelect.innerHTML = factions.map((faction, index) =>
  `<option value="${index}">${faction.name}</option>`).join("");
factionSelect.value = "0";

function selectFaction(index) {
  if (index === selected) return;
  selected = index;
  candleIndex = null;
  candleGrid.replaceChildren();
  $("trade-status").textContent = "";
  factionSelect.value = String(index);
  renderTickers();
  renderLiveStatus();
  renderQuoteChart();
  renderChart();
  renderOrder();
  renderArchive();
}

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
  if (factionSelect.value !== String(selected)) factionSelect.value = String(selected);
  $("market-status").textContent = "铜钱 / 股 · " + (finished() ? "已收盘" : active + " 家已挂牌");
}

function renderLiveStatus() {
  const stock = market.stocks[selected];
  const price = currentPrice(stock);
  $("status-faction").textContent = stock.faction.name + (stock.shares > 0 ? " · 持仓 " + format(stock.shares) : "");
  $("status-price").textContent = price === null ? "待挂牌" : price === 0 ? "已退市" : format(price) + " / 股";
  const equity = assetValue(market);
  $("status-equity").textContent = "总资产 " + format(equity);
  $("status-equity").className = tone(equity - startingCash);
  $("status-countdown").textContent = finished() ? "已收盘" :
    openedAt === null ? "待开盘" : "下条军情 " + (ticksPerEvent - market.tick % ticksPerEvent) + " 秒";
}

function renderTape() {
  const revealed = Math.floor(market.tick / ticksPerEvent);
  const latest = revealed > 0 ? story[revealed - 1] : null;
  const upcoming = story[revealed] ?? null;
  const current = latest ?? upcoming ?? story[0];
  const phase = finished() ? "已收盘" : openedAt === null ? "待开盘" : "盘中";
  $("tape-phase").textContent = phase;
  $("tape-phase").dataset.phase = finished() ? "closed" : openedAt === null ? "preopen" : "live";
  $("tape-when").textContent = current.year + " 年 · " + current.where;
  $("tape-title").textContent = latest ? latest.title : "首条军情待揭晓";
  $("tape-count").textContent = finished() || openedAt === null ? "" :
    "下条军情 " + (ticksPerEvent - market.tick % ticksPerEvent) + " 秒";
  $("tape-next").textContent = finished() ? "本局结束" :
    openedAt === null ? "首节 · " + upcoming.preview : "下一节 · " + upcoming.preview;
  const feed = revealedDispatches();
  const latestBrief = feed.at(-1);
  $("tape-wire").textContent = latestBrief ? "驿报 " + latestBrief.year + " · " + latestBrief.where : "";
}

function totalDispatches() {
  return prologue.reduce((sum, event) => sum + (event.briefs?.length ?? 0), 0) +
    story.reduce((sum, event) => sum + (event.briefs?.length ?? 0), 0);
}

function revealedDispatches() {
  const feed = prologue.flatMap((event, eventIndex) =>
    (event.briefs ?? []).map((brief, briefIndex) => ({ ...brief, key: "p" + eventIndex + ":" + briefIndex })));
  const segment = Math.floor(market.tick / ticksPerEvent);
  const elapsed = market.tick % ticksPerEvent;
  story.forEach((event, index) => {
    const briefs = event.briefs ?? [];
    const shown = index < segment ? briefs.length :
      index === segment ? briefTicks(briefs.length).filter((tick) => tick <= elapsed).length : 0;
    feed.push(...briefs.slice(0, shown).map((brief, briefIndex) => ({ ...brief, key: index + ":" + briefIndex })));
  });
  return feed;
}

function dispatchItem(brief, fresh) {
  const item = document.createElement("li");
  item.className = "dispatch" + (fresh ? " is-new" : "");
  if (brief.faction) item.dataset.faction = brief.faction;
  const meta = document.createElement("p");
  meta.className = "dispatch-meta";
  const when = document.createElement("time");
  when.textContent = brief.year + " 年";
  const where = document.createElement("span");
  where.className = "dispatch-where";
  where.textContent = brief.where;
  meta.append(when, where);
  if (brief.faction) {
    const faction = factions.find((item) => item.id === brief.faction);
    const mark = document.createElement("span");
    mark.className = "dispatch-source";
    mark.textContent = faction ? faction.name : brief.faction;
    meta.append(mark);
  }
  if (brief.chapter) {
    const chapter = document.createElement("span");
    chapter.className = "dispatch-chapter";
    chapter.textContent = brief.chapter;
    meta.append(chapter);
  }
  if (fresh) {
    const mark = document.createElement("span");
    mark.className = "dispatch-new";
    mark.textContent = "新";
    meta.append(mark);
  }
  const text = document.createElement("p");
  text.className = "dispatch-text";
  text.textContent = brief.text;
  item.append(meta, text);
  const impacts = market.briefImpacts.get(brief.key);
  if (impacts?.length) {
    const row = document.createElement("p");
    row.className = "dispatch-move";
    for (const { faction, before, after } of impacts) {
      const change = before ? (after - before) / before : 0;
      const move = document.createElement("span");
      move.className = "dispatch-move-item";
      move.innerHTML = faction.name + " <b class=\"" + tone(after === 0 ? -1 : change) + "\">" +
        (after === 0 ? "退市" : before === null ? "挂牌 " + format(after) : percent(change)) + "</b>";
      row.append(move);
    }
    item.append(row);
  }
  const tag = document.createElement("span");
  tag.className = "dispatch-tag";
  tag.textContent = brief.tag ?? "军情";
  meta.append(tag);
  return item;
}

function renderDispatches() {
  const feed = revealedDispatches();
  $("dispatch-count").textContent = feed.length + " / " + totalDispatches() + " 条 · " +
    (finished() ? "已截稿" : openedAt === null ? "开市前简报" : "陆续送达");
  $("dispatch-empty").hidden = feed.length > 0;
  if (feed.length === renderedDispatches) return;

  const initial = renderedDispatches < 0;
  const added = initial ? feed.length : feed.length - renderedDispatches;
  renderedDispatches = feed.length;
  // Newest first. Keep a reader's scroll position unless they are at the top.
  const list = $("dispatch-list");
  const stickToTop = list.scrollTop <= 4;
  list.querySelectorAll(".is-new").forEach((item) => item.classList.remove("is-new"));
  if (initial) {
    list.replaceChildren(...feed.slice().reverse().map((brief) => dispatchItem(brief, false)));
    return;
  }
  if (added <= 0) return;

  list.prepend(...feed.slice(-added).reverse().map((brief, index) => dispatchItem(brief, index < 4)));
  if (stickToTop) list.scrollTop = 0;
  const latest = feed.at(-1);
  $("dispatch-status").textContent = "新驿报，" + latest.year + " 年，" + latest.where + "：" + latest.text;
  clearTimeout(dispatchFreshTimer);
  dispatchFreshTimer = setTimeout(() => {
    list.querySelectorAll(".is-new").forEach((item) => item.classList.remove("is-new"));
  }, 7000);
}

function renderArchive() {
  const revealed = Math.floor(market.tick / ticksPerEvent);
  const stock = market.stocks[selected];
  // Unexposed main events stay hidden: their titles and years never reach the archive.
  const rows = story.flatMap((event, index) => {
    const state = finished() || (openedAt !== null && index < revealed) ? "revealed" : "pending";
    if (state === "pending") return [];
    const candle = stock.candles.find((item) => item.event === event);
    const price = candle ? (candle.close === 0 ? "退市" : format(candle.close)) : "—";
    const status = "已揭晓";
    return [`<li class="archive-row" data-state="${state}">` +
      `<time>${event.year}</time>` +
      `<span class="archive-event">${event.title}</span>` +
      `<span class="archive-meta"><span class="archive-status">${status}</span>` +
      `<span class="archive-price">${price}</span></span>` +
      `</li>`];
  }).join("");
  $("archive-list").innerHTML = rows || '<li class="archive-empty">尚无已揭晓的军情。</li>';
  $("archive-count").textContent = finished() ? story.length + " / " + story.length + " · 已收盘" :
    openedAt === null ? "0 / " + story.length + " · 待开盘" :
    revealed + " / " + story.length + " 已揭晓";
  $("archive-note").textContent = "收盘价按 " + stock.faction.name +
    "；未揭晓的军情不列，未挂牌记 —，退市当节记「退市」";
}

function renderLedger() {
  const total = assetValue(market);
  const roi = (total - startingCash) / startingCash;
  $("equity").textContent = format(total);
  $("cash").textContent = format(market.cash);
  $("return").textContent = percent(roi);
  $("return").className = tone(roi);
  $("fees-paid").textContent = format(market.fees);

  const rows = market.stocks.filter((stock) => stock.shares > 0).map((stock) => {
    const value = (currentPrice(stock) ?? 0) * stock.shares;
    const pnl = value - stock.cost;
    return `<tr><th scope="row">${stock.faction.name}</th><td>${format(stock.shares)}</td>` +
      `<td>${format(stock.cost)}</td><td>${format(value)}</td>` +
      `<td class="${tone(pnl)}" title="${format(pnl)} 铜钱">${stock.cost ? percent(pnl / stock.cost) : "—"}</td></tr>`;
  });
  const positions = rows.join("") || '<tr><td colspan="5" class="empty-position">当前空仓</td></tr>';
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
  const upcoming = story.find((event, index) =>
    index >= Math.floor(market.tick / ticksPerEvent) && event.quotes[faction.id] !== undefined);
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

function showToast({ label, title, items }) {
  const toast = document.createElement("div");
  toast.className = "toast";
  const head = document.createElement("p");
  head.className = "toast-label";
  head.textContent = label;
  const name = document.createElement("strong");
  name.textContent = title;
  const list = document.createElement("p");
  list.className = "toast-items";
  list.textContent = items.join(" · ");
  toast.append(head, name, list);
  const container = $("toasts");
  container.append(toast);
  while (container.children.length > 2) container.firstElementChild.remove();
  setTimeout(() => toast.remove(), 6000);
}

function renderStory() {
  const previousRevealed = revealedCount;
  const revealed = Math.floor(market.tick / ticksPerEvent);
  revealedCount = revealed;
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
    const impacts = market.news.map(({ faction, before, after }) => {
      const change = before ? (after - before) / before : 0;
      const stock = market.stocks.find((item) => item.faction === faction);
      const notice = after === 0 ? stock?.pendingNotice : null;
      return {
        name: faction.name,
        label: after === 0 ? "退市" : before === null ? "挂牌 " + format(after) : percent(change),
        tone: tone(change),
        note: notice ? "持仓 " + format(notice.shares) + " 股清零，损失 " + coins(notice.loss) : ""
      };
    });
    $("impact").innerHTML = impacts.filter(({ label }) => label !== "0.0%").map(({ name, label, tone: cls, note }) =>
      `<span class="impact-item">${name} <strong class="${cls}">${label}</strong>` +
      (note ? `<small>${note}</small>` : "") + "</span>").join("");
    // Briefs in the run-up can move a faction too; show the most recent moves beside the main outcome.
    const previous = story[revealed - 1];
    const runUp = (previous?.briefs ?? []).flatMap((_, briefIndex) =>
      market.briefImpacts.get((revealed - 1) + ":" + briefIndex) ?? [])
      .filter(({ faction }) => !impacts.some((impact) => impact.name === faction.name));
    const seen = new Set();
    $("impact").insertAdjacentHTML("beforeend", runUp.reverse().filter(({ faction }) => {
      if (seen.has(faction.id)) return false;
      seen.add(faction.id);
      return true;
    }).map(({ faction, before, after }) => {
      const change = before ? (after - before) / before : 0;
      return `<span class="impact-item impact-brief">${faction.name} <strong class="${tone(change)}">` +
        (after === 0 ? "退市" : before === null ? "挂牌 " + format(after) : percent(change)) +
        "</strong><small>驿报影响</small></span>";
    }).join(""));
    if (revealed > previousRevealed) {
      showToast({
        label: "第 " + revealed + " 条军情 · " + latest.year + " 年",
        title: latest.title,
        items: impacts.filter(({ label }) => label !== "0.0%").slice(0, 4).map(({ name, label, note }) =>
          name + " " + label + (note ? "，" + note : ""))
      });
    }
  }

  $("order").hidden = finished();
  $("preopen").hidden = isOpen;
  $("trade").hidden = !isOpen;
  $("summary").hidden = !finished();
  if (finished() && previousRevealed < story.length) $("restart").focus();
  if (finished()) {
    const total = assetValue(market);
    const roi = (total - startingCash) / startingCash;
    $("summary-stats").innerHTML = [
      ["期末资产", format(total), ""], ["总收益率", percent(roi), tone(roi)],
      ["已实现盈亏", (market.realized > 0 ? "+" : "") + format(market.realized), tone(market.realized)],
      ["最高资产", format(market.peak), ""], ["成交次数", format(market.trades), ""],
      ["已付手续费", format(market.fees), ""]
    ].map(([label, value, style]) => `<div><dt>${label}</dt><dd class="${style}">${value}</dd></div>`).join("");
  }
  renderArchive();
}

function renderOrder() {
  const stock = market.stocks[selected];
  const price = currentPrice(stock);
  displayedPrice = price;
  const quote = price ? coins(price) + " / 股" : priceStatus(price);
  $("quote").textContent = stock.faction.name + " · " + quote;

  if (openedAt === null || finished()) return;

  if (stock.pendingNotice) {
    const notice = stock.pendingNotice;
    stock.pendingNotice = null;
    $("trade-status").textContent = stock.faction.name + " 已退市，持仓 " +
      format(notice.shares) + " 股清零，损失 " + coins(notice.loss) + "。";
  }

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
  renderLiveStatus();
  renderQuoteChart();
  renderChart();
  renderLedger();
  renderOrder();
  renderClock();
  renderTape();
  renderDispatches();
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
  factionSelect.value = "0";
  revealedCount = 0;
  renderedDispatches = -1;
  clearTimeout(dispatchFreshTimer);
  $("dispatch-status").textContent = "";
  $("quantity").value = "1";
  $("trade-status").textContent = "";
  $("toasts").replaceChildren();
  $("archive").open = false;
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

factionSelect.addEventListener("change", () => selectFaction(Number(factionSelect.value)));
$("faction-prev").addEventListener("click", () => selectFaction((selected + factions.length - 1) % factions.length));
$("faction-next").addEventListener("click", () => selectFaction((selected + 1) % factions.length));

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
  const result = buying ? "" : "，本次" + (order.pnl > 0 ? "盈利 " : order.pnl < 0 ? "亏损 " : "盈亏 ") +
    format(Math.abs(order.pnl)) + " 铜钱";
  status.textContent = (buying ? "买入 " : "卖出 ") + stock.faction.name + " " + format(quantity) +
    " 股，成交价 " + format(order.price) + "，手续费 " + format(order.fee) + "，" +
    (buying ? "实付 " : "实收 ") + coins(order.net) + result + "。";
  renderLedger();
  renderOrder();
  renderLiveStatus();
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
$("event-tape").addEventListener("click", () => {
  $("archive").open = true;
  const behavior = matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
  document.querySelector(".story-card").scrollIntoView({ behavior, block: "start" });
});
$("archive").addEventListener("toggle", () => {
  $("event-tape").setAttribute("aria-expanded", String($("archive").open));
});
document.addEventListener("visibilitychange", syncClock);
$("help-open").addEventListener("click", () => $("help-dialog").showModal());
reset();
new ResizeObserver(() => drawQuoteLine(quoteLine, market.stocks[selected].quoteHistory)).observe(quoteLine);
