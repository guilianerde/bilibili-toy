const tickMs = 1_000;
const ticksPerEvent = 24;
const totalTicks = story.length * ticksPerEvent;
const startingCash = 10_000;
const feeDivisor = 200;
const quoteWindow = 60;

// 演义模式的随机数（mulberry32）：同一 seed 每次开局都走出同一条史线，
// 方便复盘，也为以后做「每日同一局」留好接口。
function createRandom(seed) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = Math.imul(state ^ (state >>> 15), state | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// 史实：按剧本原线走，行情只有逐秒噪声。演义：逐条主线抽一条史线，报价再按局势浮动。
const runModes = {
  history: { label: "史实", variants: false, jitter: 0 },
  romance: { label: "演义", variants: true, jitter: 0.12 }
};

// 报价加浮动：退市的 0 必须留在 0，其余至少保留 1 铜钱。
function jitterQuotes(quotes, band, random) {
  if (!band) return { ...quotes };
  const scaled = {};
  for (const [id, price] of Object.entries(quotes)) {
    scaled[id] = price === 0 ? 0 : Math.max(1, Math.round(price * (1 + (random() * 2 - 1) * band)));
  }
  return scaled;
}

// 定下本局要走的史线：先把每条主线的报价、结局与驿报解析成只属于这一局的副本，
// 之后行情、档案、驿报都读这份副本，剧情原文不再改动。
function resolveRun(mode, seed) {
  const config = runModes[mode] ?? runModes.history;
  const random = createRandom(seed);
  const build = (event) => {
    const variant = config.variants && event.variants?.length
      ? event.variants[Math.floor(random() * event.variants.length)]
      : null;
    const base = variant?.briefs ?? event.briefs ?? [];
    const briefs = base
      .map((brief, index) => variant?.patches?.[index] === undefined ? brief : variant.patches[index])
      .filter(Boolean)
      .concat(variant?.clues ?? []);
    return {
      year: event.year, where: event.where, preview: event.preview, lead: event.lead,
      title: variant?.title ?? event.title,
      outcome: variant?.outcome ?? event.outcome,
      variant: variant?.label ?? null,
      quotes: jitterQuotes(variant?.quotes ?? event.quotes, config.jitter, random),
      briefs: briefs.map((brief) => ({
        ...brief,
        quotes: brief.quotes ? jitterQuotes(brief.quotes, config.jitter, random) : undefined
      }))
    };
  };
  return {
    mode, seed,
    label: config.label,
    prologue: prologue.map(build),
    story: story.map(build),
    random: createRandom(seed ^ 0x9e3779b9) // 价格波动另走一条随机流，改剧情不会牵动它。
  };
}

function currentPrice(stock) {
  return stock.candles.at(-1)?.close ?? null;
}

function recordPrice(stock, price, event = null) {
  let candle = stock.candles.at(-1);
  if (!candle || candle.event) {
    const open = candle?.close ?? price;
    candle = { open, high: open, low: open, close: open, event: null };
    stock.candles.push(candle);
  }
  candle.high = Math.max(candle.high, price);
  candle.low = Math.min(candle.low, price);
  candle.close = price;
  candle.event = event;
}

// A brief lands at one of these ticks inside the 24-second run-up to a main event.
function briefTicks(count) {
  return Array.from({ length: count }, (_, index) => Math.round((index + 1) * (ticksPerEvent - 1) / count));
}

function briefAt(market, tick) {
  if (tick <= 0 || tick >= totalTicks) return null;
  const elapsed = (tick - 1) % ticksPerEvent + 1;
  if (elapsed >= ticksPerEvent) return null;
  const eventIndex = Math.floor((tick - 1) / ticksPerEvent);
  const event = market.story[eventIndex];
  const briefs = event?.briefs ?? [];
  const briefIndex = briefTicks(briefs.length).indexOf(elapsed);
  if (briefIndex < 0) return null;
  return { eventIndex, briefIndex, event, brief: briefs[briefIndex], key: eventIndex + ":" + briefIndex };
}

// 每次主线或带报价的驿报揭晓时，记下全市场当时的报价，供走势图按故事年月回放。
function recordTimeline(market, year, prices) {
  const slot = (market.monthCounts.get(year) ?? 0) + 1;
  market.monthCounts.set(year, slot);
  market.timeline.push({
    year, slot,
    prices: prices ?? new Map(market.stocks.map((stock) => [stock.faction.id, currentPrice(stock)]))
  });
}

function createMarket(mode = "history", seed = Date.now()) {
  const run = resolveRun(mode, seed);
  const stocks = factions.map((faction) => {
    const stock = { faction, anchor: null, candles: [], quoteHistory: [], shares: 0, cost: 0 };
    for (const event of run.prologue) {
      const quote = event.quotes[faction.id];
      if (quote === undefined) continue;
      stock.anchor = quote;
      recordPrice(stock, quote, event);
    }
    if (stock.anchor !== null) stock.quoteHistory.push({ tick: 0, price: stock.anchor });
    return stock;
  });

  const market = {
    stocks, run, prologue: run.prologue, story: run.story, random: run.random,
    tick: 0, cash: startingCash, peak: startingCash, fees: 0, trades: 0, realized: 0,
    news: [], briefImpacts: new Map(), timeline: [], monthCounts: new Map(),
    variants: run.story.filter((event) => event.variant).map((event) => ({ year: event.year, title: event.title, label: event.variant }))
  };
  // 开市前的 184/189/190 三次报价也要进历史走势。
  const prices = new Map(factions.map((faction) => [faction.id, null]));
  for (const event of run.prologue) {
    for (const [id, price] of Object.entries(event.quotes)) prices.set(id, price);
    recordTimeline(market, event.year, new Map(prices));
  }
  return market;
}

function assetValue(market) {
  return market.cash + market.stocks.reduce((sum, stock) => sum + (currentPrice(stock) ?? 0) * stock.shares, 0);
}

function driftPrice(price, anchor, random) {
  const volatility = Math.max(2, anchor * 0.032);
  const change = Math.round((anchor - price) * 0.16 + (random() * 2 - 1) * volatility);
  return Math.max(1, price + change);
}

function advanceMarket(market, targetTick, random = market.random ?? Math.random) {
  const end = Math.min(targetTick, totalTicks);
  while (market.tick < end) {
    market.tick += 1;
    const event = market.tick % ticksPerEvent === 0 ? market.story[market.tick / ticksPerEvent - 1] : null;
    const brief = event ? null : briefAt(market, market.tick);
    const briefQuotes = brief?.brief.quotes;
    if (event) market.news = [];
    for (const stock of market.stocks) {
      const price = currentPrice(stock);
      const shock = event?.quotes[stock.faction.id] ?? briefQuotes?.[stock.faction.id];
      if (shock === undefined && !(price > 0)) continue;
      const nextPrice = shock ?? (event ? price : driftPrice(price, stock.anchor, random));
      if (shock !== undefined) {
        if (event) {
          market.news.push({ faction: stock.faction, before: price, after: shock });
        } else {
          const impacts = market.briefImpacts.get(brief.key) ?? [];
          impacts.push({ faction: stock.faction, before: price, after: shock });
          market.briefImpacts.set(brief.key, impacts);
        }
        stock.anchor = shock;
        if (shock === 0) {
          if (stock.shares > 0) {
            stock.pendingNotice = { shares: stock.shares, loss: stock.cost };
            market.realized -= stock.cost;
          }
          stock.shares = 0;
          stock.cost = 0;
        }
      }
      recordPrice(stock, nextPrice, event);
      stock.quoteHistory.push({ tick: market.tick, price: nextPrice });
      if (stock.quoteHistory.length > quoteWindow + 1) stock.quoteHistory.shift();
    }
    // 主线与每一条驿报都记一个点，折线才能从一个小事件连到下一个小事件。
    if (event) recordTimeline(market, event.year);
    else if (brief) recordTimeline(market, brief.brief.year);
    market.peak = Math.max(market.peak, assetValue(market));
  }
}

function tradeFee(gross) {
  return Math.ceil(gross / feeDivisor);
}

function tradeLimit(market, stock, side) {
  const price = currentPrice(stock);
  if (market.tick >= totalTicks || !price) return 0;
  if (side === "sell") return stock.shares;
  // Cost = ceil(gross * 201/200). With integer cash, this gives the exact largest affordable order.
  return Math.floor(market.cash * feeDivisor / (price * (feeDivisor + 1)));
}

function executeTrade(market, stock, side, quantity) {
  if (!Number.isSafeInteger(quantity) || quantity < 1 || quantity > tradeLimit(market, stock, side)) return null;
  const price = currentPrice(stock);
  const gross = price * quantity;
  const fee = tradeFee(gross);
  const buying = side === "buy";
  const net = buying ? gross + fee : gross - fee;
  // Cost basis includes fees. Sells release the average cost of the shares sold.
  const basis = buying ? 0 : Math.round(stock.cost * quantity / stock.shares);

  stock.cost += buying ? net : -basis;
  stock.shares += buying ? quantity : -quantity;
  if (!stock.shares) stock.cost = 0;
  if (!buying) market.realized += net - basis;
  market.cash += buying ? -net : net;
  market.trades += 1;
  market.fees += fee;
  return { price, fee, net, pnl: buying ? 0 : net - basis };
}
