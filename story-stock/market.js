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

function createMarket() {
  const stocks = factions.map((faction) => {
    const stock = { faction, anchor: null, candles: [], quoteHistory: [], shares: 0 };
    for (const event of prologue) {
      const quote = event.quotes[faction.id];
      if (quote === undefined) continue;
      stock.anchor = quote;
      recordPrice(stock, quote, event);
    }
    if (stock.anchor !== null) stock.quoteHistory.push({ tick: 0, price: stock.anchor });
    return stock;
  });

  return { stocks, tick: 0, cash: startingCash, peak: startingCash, fees: 0, trades: 0, news: [] };
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
    if (event) market.news = [];
    for (const stock of market.stocks) {
      const price = currentPrice(stock);
      const shock = event?.quotes[stock.faction.id];
      if (shock === undefined && !(price > 0)) continue;
      const nextPrice = shock ?? (event ? price : driftPrice(price, stock.anchor, random));
      if (shock !== undefined) {
        market.news.push({ faction: stock.faction, before: price, after: shock });
        stock.anchor = shock;
        if (shock === 0) stock.shares = 0;
      }
      recordPrice(stock, nextPrice, event);
      stock.quoteHistory.push({ tick: market.tick, price: nextPrice });
      if (stock.quoteHistory.length > quoteWindow + 1) stock.quoteHistory.shift();
    }
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

  stock.shares += buying ? quantity : -quantity;
  market.cash += buying ? -net : net;
  market.trades += 1;
  market.fees += fee;
  return { price, fee, net };
}
