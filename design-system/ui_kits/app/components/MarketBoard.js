(function () {
  const el = window.OD.el;

  const CAPITAL = 10000;
  const CASH = 4320;
  const FEE_RATE = 0.005;

  const EVENT_MS = 24000;
  const TICK_MS = 1000;
  const MARKET_IDS = ["wei", "shu", "wu", "dong", "tao", "zan", "shao", "shu-yuan", "biao", "bu", "jin"];

  const BEATS = [
    {
      year: "200",
      phase: "盘中",
      location: "官渡",
      title: "官渡决胜",
      copy: "曹操火烧乌巢，袁氏粮草尽失；孙权继位，江东换了主人。",
      impacts: [
        { name: "曹氏", value: "+3.2%", tone: "up" },
        { name: "刘氏", value: "+1.8%", tone: "up" },
        { name: "孙氏", value: "+1.1%", tone: "up" },
        { name: "袁绍", value: "−3.6%", tone: "down" },
      ],
      price: 118.0,
      quotes: { shu: 118.0, wei: 132.5, wu: 97.3, shao: 120.4, biao: 78.6, jin: null },
    },
    {
      year: "204",
      phase: "盘中",
      location: "邺城",
      title: "邺城陷落",
      copy: "曹操攻破邺城，袁氏退守；北方粮道归了曹氏。",
      impacts: [
        { name: "曹氏", value: "+2.6%", tone: "up" },
        { name: "刘氏", value: "+2.5%", tone: "up" },
        { name: "孙氏", value: "+0.9%", tone: "up" },
        { name: "袁绍", value: "−8.4%", tone: "down" },
      ],
      price: 121.0,
      quotes: { shu: 121.0, wei: 136.0, wu: 98.2, shao: 110.3, biao: 79.8, jin: null },
    },
    {
      year: "207",
      phase: "盘中",
      location: "隆中",
      title: "三顾茅庐",
      copy: "刘备三顾草庐，诸葛亮出山；荆襄士族开始下注刘氏。",
      impacts: [
        { name: "刘氏", value: "+7.8%", tone: "up" },
        { name: "曹氏", value: "−1.3%", tone: "down" },
        { name: "孙氏", value: "+1.2%", tone: "up" },
        { name: "袁绍", value: "退市", tone: "flat" },
      ],
      price: 130.5,
      quotes: { shu: 130.5, wei: 134.2, wu: 99.4, shao: null, biao: 80.6, jin: null },
    },
    {
      year: "208",
      phase: "盘中",
      location: "荆州",
      title: "荆州易主",
      copy: "刘表病逝，荆州群龙无首；刘备接手部分人马，江东也在观望。",
      impacts: [
        { name: "刘氏", value: "−3.1%", tone: "down" },
        { name: "孙氏", value: "+2.7%", tone: "up" },
        { name: "曹氏", value: "−1.0%", tone: "down" },
        { name: "刘表", value: "退市", tone: "flat" },
      ],
      price: 126.5,
      quotes: { shu: 126.5, wei: 132.8, wu: 102.1, biao: null, jin: null },
    },
    {
      year: "208",
      phase: "盘中",
      location: "赤壁",
      title: "赤壁之战",
      copy: "孙刘联军以火攻破曹，江面一炬，天下三分。",
      impacts: [
        { name: "刘氏", value: "+5.4%", tone: "up" },
        { name: "孙氏", value: "+2.8%", tone: "up" },
        { name: "曹氏", value: "−4.6%", tone: "down" },
      ],
      price: 132.0,
      quotes: { shu: 132.0, wei: 122.5, wu: 102.0, jin: null },
    },
    {
      year: "214",
      phase: "盘中",
      location: "成都",
      title: "益州归刘",
      copy: "刘备入主益州，刘氏版图成形；曹操转向汉中。",
      impacts: [
        { name: "刘氏", value: "+6.4%", tone: "up" },
        { name: "曹氏", value: "−2.0%", tone: "down" },
        { name: "孙氏", value: "−1.0%", tone: "down" },
      ],
      price: 140.5,
      quotes: { shu: 140.5, wei: 120.0, wu: 101.0, jin: null },
    },
    {
      year: "219",
      phase: "盘中",
      location: "汉中",
      title: "汉中称王",
      copy: "刘备进位汉中王；关羽失荆州，孙刘联盟裂开一道口子。",
      impacts: [
        { name: "刘氏", value: "+4.6%", tone: "up" },
        { name: "孙氏", value: "+3.1%", tone: "up" },
        { name: "曹氏", value: "−1.2%", tone: "down" },
      ],
      price: 147.0,
      quotes: { shu: 147.0, wei: 118.5, wu: 96.5, jin: null },
    },
    {
      year: "249",
      phase: "盘中",
      location: "高平陵",
      title: "高平陵之变",
      copy: "司马懿闭城夺权，曹氏旁落；司马氏正式挂牌。",
      impacts: [
        { name: "司马氏", value: "挂牌", tone: "flat" },
        { name: "曹氏", value: "−8.0%", tone: "down" },
        { name: "刘氏", value: "−12.9%", tone: "down" },
        { name: "孙氏", value: "−2.6%", tone: "down" },
      ],
      price: 128.0,
      quotes: { shu: 128.0, wei: 109.0, wu: 94.0, jin: 88.0 },
    },
    {
      year: "280",
      phase: "收盘",
      location: "洛阳",
      title: "三国归晋",
      copy: "王濬楼船下益州，孙氏退市；交易所鸣钟收盘。",
      impacts: [
        { name: "孙氏", value: "退市", tone: "flat" },
        { name: "司马氏", value: "+9.1%", tone: "up" },
        { name: "刘氏", value: "−18.8%", tone: "down" },
        { name: "曹氏", value: "+1.8%", tone: "up" },
      ],
      price: 104.0,
      quotes: { shu: 104.0, wei: 111.0, wu: null, jin: 96.0 },
    },
  ];

  const INITIAL_POSITIONS = [
    { name: "刘氏", glyph: "刘", id: "shu", shares: 40, cost: 108.0 },
    { name: "曹氏", glyph: "曹", id: "wei", shares: 20, cost: 122.0 },
    { name: "孙氏", glyph: "孙", id: "wu", shares: 10, cost: 90.0 },
  ];

  function createState() {
    return {
      step: 1,
      beatIndex: 0,
      closed: false,
      cash: CASH,
      fees: 0,
      trades: 0,
      maxEquity: 0,
      equity: 0,
      returnPct: 0,
      quote: BEATS[0].price,
      market: Object.assign({}, BEATS[0].quotes),
      positions: INITIAL_POSITIONS.map((position) => Object.assign({}, position)),
    };
  }

  function priceOf(state, position) {
    const value = state.market[position.id];
    return typeof value === "number" ? value : 0;
  }

  function recalc(state) {
    const market = state.positions.reduce((total, position) => total + position.shares * priceOf(state, position), 0);
    state.equity = state.cash + market;
    state.returnPct = ((state.equity - CAPITAL) / CAPITAL) * 100;
    state.maxEquity = Math.max(state.maxEquity, state.equity);
  }

  function createArchive(beats) {
    const rows = beats.map((beat) => {
      const status = el("span", { class: "beat-state", text: "待揭晓" });
      const price = el("span", { class: "beat-price", text: "—" });
      const row = el("li", { class: "beat-row", dataset: { state: "future" } }, [
        el("span", { class: "beat-year", text: beat.year }),
        el("div", { class: "beat-main" }, [
          el("strong", { text: beat.title }),
          el("span", { class: "beat-loc", text: "公元 " + beat.year + " 年 · " + beat.location }),
        ]),
        status,
        price,
      ]);
      return { row, status, price };
    });

    const node = el("section", { class: "panel-card archive" }, [
      el("div", { class: "section-line" }, [el("h2", { text: "事件档案" }), el("span", { text: "示例剧情 · " + beats.length + " 节" })]),
      el("ol", { class: "beat-list" }, rows.map((entry) => entry.row)),
      el("p", { class: "fact", text: "已揭晓的节次保留收盘价；未来节次只给标题。" }),
    ]);

    function update(view) {
      const last = beats.length - 1;
      rows.forEach((entry, index) => {
        const revealed = index <= view.beatIndex;
        const current = index === view.beatIndex && !view.closed;
        entry.row.dataset.state = view.closed && index === last ? "closed" : current ? "current" : revealed ? "revealed" : "future";
        if (current) entry.row.setAttribute("aria-current", "step");
        else entry.row.removeAttribute("aria-current");
        entry.status.textContent = view.closed && index === last ? "已收盘" : current ? "进行中" : revealed ? "已揭晓" : "待揭晓";
        entry.price.textContent = revealed ? beats[index].price.toFixed(1) : "—";
      });
    }

    return { node, update };
  }

  function MarketBoard(config = {}) {
    const onExit = config.onExit || null;
    const state = createState();
    recalc(state);
    state.maxEquity = state.equity;
    let startedAt = 0;
    let timerId = null;

    const quoteLabel = el("span", { text: "—" });
    const composer = window.Composer({
      quote: state.quote,
      capacityFor(direction) {
        if (direction === "buy") return Math.floor(state.cash / (state.quote * (1 + FEE_RATE)));
        return state.positions.find((position) => position.id === "shu").shares;
      },
      onTrade: handleTrade,
    });

    const ticket = el("section", { class: "panel-card ticket" }, [
      el("div", { class: "section-line" }, [el("h2", { text: "交易单 · 刘氏" }), quoteLabel]),
      composer.node,
    ]);

    const strip = window.RoundStrip({ total: BEATS.length });
    const story = window.StoryBeat({ total: BEATS.length });
    const price = window.PriceBoard({ beats: BEATS });
    const holdings = window.HoldingsCard();
    const receipts = window.TradeReceipt();
    const archive = createArchive(BEATS);
    const summary = window.ClosingSummary({ onRestart: restart, onExit: onExit });
    summary.node.classList.add("closing-sheet");

    const tabs = window.MarketTabs({
      label: "交易所栏目",
      items: [
        { id: "market", label: "市场", className: "market-market", content: price.node },
        { id: "trade", label: "交易", className: "trade-panel", content: [ticket, receipts.node] },
        { id: "portfolio", label: "持仓", className: "portfolio-panel", content: holdings.node },
        { id: "news", label: "资讯", className: "news-panel", content: [story.node, archive.node] },
      ],
      onSelect(id) {
        if (id === "news") tabs.setBadge("news", false);
      },
    });
    tabs.setBadge("news", true);

    const tape = window.EventTape({
      onOpen() {
        if (!state.closed) tabs.select("news");
      },
    });

    const closingSlot = el("div", { class: "closing-slot", hidden: true }, [summary.node]);
    const node = el("div", { class: "market-frame" }, [strip.node, tape.node, tabs.node, closingSlot]);

    function handleTrade(trade) {
      const position = state.positions.find((item) => item.id === "shu");
      if (trade.side === "buy") {
        const total = Math.round(trade.gross) + trade.charge;
        if (total > state.cash) {
          const affordable = Math.floor(state.cash / (state.quote * (1 + FEE_RATE)));
          return { ok: false, message: "现金不足，最多还能买 " + affordable + " 股。" };
        }
        state.cash -= total;
        position.cost = (position.shares * position.cost + Math.round(trade.gross)) / (position.shares + trade.shares);
        position.shares += trade.shares;
      } else {
        if (trade.shares > position.shares) {
          return { ok: false, message: "刘氏持仓只有 " + position.shares + " 股。" };
        }
        state.cash += Math.round(trade.gross) - trade.charge;
        position.shares -= trade.shares;
      }

      state.fees += trade.charge;
      state.trades += 1;
      recalc(state);
      receipts.push({
        step: state.step,
        side: trade.side,
        name: "刘氏",
        shares: trade.shares,
        price: state.quote,
        gross: trade.gross,
        charge: trade.charge,
      });
      apply();
      return { ok: true, message: "已" + (trade.side === "buy" ? "买入 " : "卖出 ") + trade.shares + " 股，手续费 " + trade.charge + " 铜钱。" };
    }

    function stopClock() {
      if (timerId !== null) {
        clearInterval(timerId);
        timerId = null;
      }
    }

    function liveMarket(index, tick) {
      const base = BEATS[index].quotes;
      const rows = {};
      MARKET_IDS.forEach((id, position) => {
        const value = base[id];
        if (value === null || value === undefined) {
          rows[id] = null;
          return;
        }
        const wave =
          Math.sin((tick + position * 13) * 0.83) * 0.55 +
          Math.sin((tick * 1.7 + position * 31) * 0.41) * 0.45;
        rows[id] = Math.round(value * (1 + wave * 0.009) * 10) / 10;
      });
      return rows;
    }

    function tickNumber() {
      return Math.max(0, Math.floor((Date.now() - startedAt) / TICK_MS));
    }

    function applyLive() {
      state.market = liveMarket(state.beatIndex, tickNumber());
      state.quote = state.market.shu;
      recalc(state);
      const beat = BEATS[state.beatIndex];
      const next = BEATS[state.beatIndex + 1];

      strip.update({
        step: state.step,
        year: "公元 " + beat.year + " 年",
        next: state.closed ? "已收盘" : next ? next.title : "收盘结算",
        equity: state.equity,
        returnPct: state.returnPct,
        seconds: secondsRemaining(),
        last: state.beatIndex === BEATS.length - 1,
        closed: state.closed,
      });

      price.update({ step: state.step, quote: state.quote, quotes: state.market });
      composer.setQuote(state.quote);
      quoteLabel.textContent = state.quote.toFixed(1) + " 铜钱";

      holdings.update({
        cash: state.cash,
        equity: state.equity,
        returnPct: state.returnPct,
        fees: state.fees,
        positions: state.positions.map((position) =>
          Object.assign({}, position, {
            price: typeof state.market[position.id] === "number" ? state.market[position.id] : null,
          })
        ),
      });
    }

    function secondsRemaining() {
      if (state.closed) return 0;
      const elapsed = Date.now() - startedAt;
      const cycle = elapsed % EVENT_MS;
      return Math.max(0, Math.ceil((EVENT_MS - cycle) / 1000));
    }

    function syncClock() {
      if (!node.isConnected) {
        stopClock();
        return;
      }
      if (state.closed) return;
      const elapsed = Date.now() - startedAt;
      const reached = Math.floor(elapsed / EVENT_MS);

      if (reached >= BEATS.length) {
        state.beatIndex = BEATS.length - 1;
        state.step = BEATS.length;
        state.market = liveMarket(state.beatIndex, tickNumber());
        state.quote = state.market.shu;
        recalc(state);
        state.closed = true;
        apply();
        stopClock();
        return;
      }

      if (reached > state.beatIndex) {
        state.beatIndex = Math.min(reached, BEATS.length - 1);
        state.step = state.beatIndex + 1;
        state.market = liveMarket(state.beatIndex, tickNumber());
        state.quote = state.market.shu;
        recalc(state);
        apply();
        return;
      }

      applyLive();
      story.setClock(secondsRemaining(), false, state.beatIndex === BEATS.length - 1);
      strip.setClock(secondsRemaining(), false, state.beatIndex === BEATS.length - 1);
      tape.setClock(secondsRemaining(), false, state.beatIndex === BEATS.length - 1);
    }

    function startClock() {
      stopClock();
      startedAt = Date.now();
      timerId = setInterval(syncClock, TICK_MS);
      apply();
    }

    function restart() {
      const fresh = createState();
      Object.keys(fresh).forEach((key) => {
        state[key] = fresh[key];
      });
      recalc(state);
      state.maxEquity = state.equity;
      receipts.reset();
      composer.setStatus("");
      price.reset();
      tabs.select("market");
      tabs.setBadge("news", true);
      startClock();
    }

    function apply() {
      const beat = BEATS[state.beatIndex];
      const next = BEATS[state.beatIndex + 1];

      strip.update({
        step: state.step,
        year: "公元 " + beat.year + " 年",
        next: state.closed ? "已收盘" : next ? next.title : "收盘结算",
        equity: state.equity,
        returnPct: state.returnPct,
        seconds: secondsRemaining(),
        last: state.beatIndex === BEATS.length - 1,
        closed: state.closed,
      });

      story.update({
        phase: beat.phase,
        step: state.step,
        year: beat.year,
        location: beat.location,
        title: beat.title,
        copy: beat.copy,
        impacts: beat.impacts,
        next: next ? next.title : "",
        last: state.beatIndex === BEATS.length - 1,
        closed: state.closed,
        seconds: secondsRemaining(),
      });

      tape.update({
        phase: beat.phase,
        date: "公元 " + beat.year + " 年",
        location: beat.location,
        title: beat.title,
        next: state.closed ? "已收盘" : next ? "下一节 · " + next.title : "下一节 · 收盘结算",
        seconds: secondsRemaining(),
        last: state.beatIndex === BEATS.length - 1,
        closed: state.closed,
      });
      archive.update({ beatIndex: state.beatIndex, closed: state.closed });

      price.update({ step: state.step, quote: state.quote, quotes: state.market });
      composer.setQuote(state.quote);
      quoteLabel.textContent = state.quote.toFixed(1) + " 铜钱";

      holdings.update({
        cash: state.cash,
        equity: state.equity,
        returnPct: state.returnPct,
        fees: state.fees,
        positions: state.positions.map((position) =>
          Object.assign({}, position, {
            price: typeof state.market[position.id] === "number" ? state.market[position.id] : null,
          })
        ),
      });

      if (state.closed) {
        tape.node.hidden = true;
        tabs.node.hidden = true;
        closingSlot.hidden = false;
        summary.show({
          year: beat.year,
          title: beat.title,
          equity: state.equity,
          returnPct: state.returnPct,
          maxEquity: state.maxEquity,
          trades: state.trades,
          fees: state.fees,
        });
      } else {
        tape.node.hidden = false;
        tabs.node.hidden = false;
        closingSlot.hidden = true;
        summary.hide();
      }
    }

    startClock();
    return node;
  }

  window.MarketBoard = MarketBoard;
  window.ODKit = window.ODKit || {};
  window.ODKit.MarketBoard = MarketBoard;
})();
