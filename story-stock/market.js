const tickMs = 1_000;
const ticksPerEvent = 24;
const totalTicks = story.length * ticksPerEvent;
const startingCash = 10_000;
const feeDivisor = 200;
const quoteWindow = 60;

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

function briefAt(tick) {
  if (tick <= 0 || tick >= totalTicks) return null;
  const elapsed = (tick - 1) % ticksPerEvent + 1;
  if (elapsed >= ticksPerEvent) return null;
  const eventIndex = Math.floor((tick - 1) / ticksPerEvent);
  const event = story[eventIndex];
  const briefs = event?.briefs ?? [];
  const briefIndex = briefTicks(briefs.length).indexOf(elapsed);
  if (briefIndex < 0) return null;
  return { eventIndex, briefIndex, event, key: eventIndex + ":" + briefIndex };
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

function createMarket() {
  const stocks = factions.map((faction) => {
    const stock = { faction, anchor: null, candles: [], quoteHistory: [], shares: 0, cost: 0 };
    for (const event of prologue) {
      const quote = event.quotes[faction.id];
      if (quote === undefined) continue;
      stock.anchor = quote;
      recordPrice(stock, quote, event);
    }
    if (stock.anchor !== null) stock.quoteHistory.push({ tick: 0, price: stock.anchor });
    return stock;
  });

  const market = {
    stocks, tick: 0, cash: startingCash, peak: startingCash, fees: 0, trades: 0, realized: 0,
    news: [], briefImpacts: new Map(), timeline: [], monthCounts: new Map()
  };
  // 开市前的 184/189/190 三次报价也要进历史走势。
  const prices = new Map(factions.map((faction) => [faction.id, null]));
  for (const event of prologue) {
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

function advanceMarket(market, targetTick, random = Math.random) {
  const end = Math.min(targetTick, totalTicks);
  while (market.tick < end) {
    market.tick += 1;
    const event = market.tick % ticksPerEvent === 0 ? story[market.tick / ticksPerEvent - 1] : null;
    const brief = event ? null : briefAt(market.tick);
    const briefQuotes = brief ? brief.event.briefs[brief.briefIndex].quotes : undefined;
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
    if (event) recordTimeline(market, event.year);
    else if (brief && briefQuotes) recordTimeline(market, brief.event.briefs[brief.briefIndex].year);
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
