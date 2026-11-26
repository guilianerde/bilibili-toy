// color 用于走势图的多势力折线与选择标签。
const factions = [
  { id: "wei", mark: "魏", name: "曹氏势力", color: "#33587a" },
  { id: "shu", mark: "蜀", name: "刘氏势力", color: "#a63d32" },
  { id: "wu", mark: "吴", name: "孙氏势力", color: "#2c6b4f" },
  { id: "dong", mark: "董", name: "董卓", color: "#6e4a2b" },
  { id: "tao", mark: "陶", name: "陶谦", color: "#b07a2c" },
  { id: "zan", mark: "瓒", name: "公孙瓒", color: "#4b7b8c" },
  { id: "shao", mark: "绍", name: "袁绍", color: "#8c4f18" },
  { id: "shu-yuan", mark: "术", name: "袁术", color: "#7d4a8c" },
  { id: "biao", mark: "表", name: "刘表", color: "#347a6a" },
  { id: "bu", mark: "吕", name: "吕布", color: "#b5482a" },
  { id: "jin", mark: "晋", name: "司马氏", color: "#8c4a67" },
  // 次要势力：开市报价写在 190 年诸侯会盟，之后靠 briefs 或主线 quotes 推动。
  { id: "jiao", mark: "黄", name: "黄巾", color: "#a3921f" },
  { id: "jin-he", mark: "何", name: "何进", color: "#6f6048" },
  { id: "xiu", mark: "绣", name: "张绣", color: "#b03a5b" },
  { id: "zan-yue", mark: "越", name: "公孙越", color: "#5c8a3f" },
  { id: "liu", mark: "繇", name: "刘繇", color: "#3f5f93" },
  { id: "ma", mark: "马", name: "马腾", color: "#8a6a20" },
  { id: "meng", mark: "获", name: "孟获", color: "#5d4f8c" }
];

// 军情驿报（briefs）：每条主线揭晓前的过程小事件，依《三国演义》回目补入。
// 每个数组会在该段 24 秒内均匀刊出，只显示已经刊出的条目，不预告后事。
// 增删 briefs 条目无需改动行情或计时逻辑；year、where、tag、chapter 只用于展示。
const prologue = [
  {
    year: 184, title: "黄巾起义",
    outcome: "黄巾起事，朝廷召募兵马。曹操、刘备和孙坚相继登场。",
    quotes: { wei: 48, shu: 16, wu: 32 },
    briefs: [
      { year: 184, where: "巨鹿", tag: "异闻", chapter: "第一回", text: "张角兄弟以「苍天已死，黄天当立」相号召，青、幽、徐、冀等八州并起，郡县望风而降。" },
      { year: 184, where: "广宗", tag: "战报", chapter: "第一回", faction: "jiao", text: "张角自称天公将军，张宝、张梁分称地公、人公将军，黄巾裹头为号，官军望风而溃。" },
      { year: 184, where: "涿郡", tag: "战报", chapter: "第一回", faction: "jiao", text: "程远志率黄巾五万犯涿郡，关羽一刀斩程远志，张飞刺死邓茂，黄巾前锋溃散。" },
      { year: 184, where: "颍川", tag: "战报", chapter: "第一回", faction: "jiao", text: "波才围皇甫嵩于长社，见官军火起，阵脚大乱，被皇甫嵩、曹操合击而败。" },
      { year: 184, where: "广宗", tag: "战报", chapter: "第二回", faction: "jiao", text: "张梁镇守广宗，皇甫嵩夜袭其营，张梁战死，黄巾广宗一路尽溃。" },
      { year: 184, where: "涿郡", tag: "人事", chapter: "第一回", text: "刘备、关羽、张飞在桃园结义，聚乡勇五百人投军，随邹靖往讨黄巾。" },
      { year: 184, where: "广宗", tag: "战报", chapter: "第二回", text: "皇甫嵩、朱儁分路进剿，张角病死军中，黄巾主力渐次溃散。" }
    ]
  },
  {
    year: 189, title: "董卓入京",
    outcome: "董卓入京掌控朝廷。京师动荡，地方势力各自寻求立足之地。",
    quotes: { wei: 60, shu: 14, wu: 40, dong: 158, shao: 94, "shu-yuan": 64 },
    briefs: [
      { year: 188, where: "洛阳", tag: "人事", chapter: "第二回", faction: "jin-he", text: "何进拜大将军，与十常侍表面相安；袁绍劝其尽诛宦官，何进迟迟不能决断。" },
      { year: 189, where: "洛阳", tag: "朝局", chapter: "第三回", text: "何进召外兵入京诛宦官，事泄被杀；袁绍等尽诛宦官，宫禁大乱。" },
      { year: 189, where: "洛阳", tag: "权谋", chapter: "第三回", faction: "jin-he", text: "何进与袁绍密议诛宦官，何太后犹豫不决，事机一拖再拖，曹操在旁笑其优柔。" },
      { year: 189, where: "洛阳", tag: "朝局", chapter: "第三回", faction: "jin-he", text: "何进不听劝告入宫，为张让等宦官伏兵所杀，首级被掷出宫墙，大将军府顿时无主。" },
      { year: 189, where: "洛阳", tag: "战报", chapter: "第四回", faction: "jin-he", text: "袁绍、袁术引兵入宫，尽诛宦官，宫中大火；何进旧部或降或散，何氏一系就此断绝。" },
      { year: 189, where: "洛阳", tag: "权谋", chapter: "第三回", text: "董卓率西凉兵入洛阳，废少帝为弘农王，改立陈留王刘协，自任相国。" }
    ]
  },
  {
    year: 190, title: "诸侯会盟",
    outcome: "各路诸侯起兵讨董。曹操、孙坚崭露头角，袁绍领盟。北有公孙瓒，徐州有陶谦，刘表出镇荆州。",
    quotes: {
      wei: 88, shu: 24, wu: 59, dong: 122, tao: 52, zan: 67, shao: 108, "shu-yuan": 79, biao: 56,
      bu: 40, jin: 40, jiao: 42, "jin-he": 56, xiu: 40, "zan-yue": 38, liu: 40, ma: 46, meng: 40
    },
    briefs: [
      { year: 190, where: "酸枣", tag: "朝局", chapter: "第五回", text: "曹操发矫诏，十八路诸侯会于酸枣讨董；袁绍被推为盟主，孙坚领先锋。" },
      { year: 190, where: "洛阳", tag: "战报", chapter: "第六回", text: "董卓焚毁洛阳宫室，胁献帝迁都长安；盟军各怀观望，粮尽而散。" }
    ]
  }
];

// 仅列出受事件影响的势力。首次报价表示上市，零价表示永久退市。
const story = [
  {
    year: 192, where: "长安 · 河北", preview: "长安宫门内外",
    lead: "董卓已迁都长安。王允频频私见吕布，河北的袁绍与公孙瓒也各自集结兵马。",
    title: "董卓身死，吕布自立",
    outcome: "王允联手吕布诛杀董卓。董卓退市，吕布独立挂牌。河北一带，袁绍与公孙瓒交锋，袁绍暂占上风。",
    briefs: [
      { year: 190, where: "荥阳", tag: "战报", chapter: "第六回", text: "曹操独自引兵追赶董卓，在荥阳遭徐荣伏击，中箭坠马；曹洪让马相救，二人才得脱身。" },
      { year: 191, where: "洛阳", tag: "异闻", chapter: "第六回", text: "孙坚入洛阳，于宫中井内得传国玉玺；袁绍闻讯索要，孙坚矢口否认，连夜拔营回江东。", quotes: { wu: 66, "shu-yuan": 84 } },
      { year: 191, where: "冀州", tag: "权谋", chapter: "第七回", text: "袁绍用逢纪之计，暗约公孙瓒南下，又劝韩馥让位；韩馥拱手让出冀州，袁绍自领冀州牧。", quotes: { shao: 118 } },
      { year: 191, where: "阳城", tag: "人事", chapter: "第七回", text: "袁绍遣部将伏击公孙越，公孙越中箭身亡；公孙瓒闻讯大怒，起兵讨袁。", quotes: { "zan-yue": 0, zan: 72, shao: 118 } },
      { year: 191, where: "磐河", tag: "战报", chapter: "第七回", text: "公孙瓒与袁绍战于磐河，文丑追赶公孙瓒，被少年赵云挺枪救下；两军相持，各自收兵。", quotes: { zan: 72, shao: 118 } },
      { year: 191, where: "岘山", tag: "战报", chapter: "第七回", text: "孙坚跨江击刘表，追敌至岘山，遭吕公伏兵，中石而亡；孙策扶柩归江东，与刘表结下死仇。", quotes: { wu: 44 } },
      { year: 192, where: "长安", tag: "权谋", chapter: "第八回", text: "王允以貂蝉设连环计，先许吕布，再献董卓；凤仪亭一场风波，吕布与董卓自此离心。" }
    ],
    quotes: { dong: 0, bu: 63, shao: 125, zan: 51, jiao: 0, "jin-he": 0 },
    // 演义模式的史线：quotes 为该分支下的全价（含退市 0），patches 按下标改写驿报，
    // clues 追加在驿报末尾。只写与原线不同的部分，未写的字段沿用主线设定。
    variants: [
      { label: "原线" },
      {
        label: "长安再乱",
        quotes: { dong: 0, bu: 44, shao: 132, zan: 58, jiao: 0, "jin-he": 0 },
        outcome: "王允不肯赦免凉州旧部，李傕、郭汜聚兵反攻长安；吕布败走，只带百余骑东出武关。董卓退市，吕布勉强挂牌，袁绍在河北坐大。",
        clues: [
          { year: 192, where: "长安", tag: "战报", chapter: "第九回", text: "凉州旧部不肯听命，李傕、郭汜已聚兵数万，扬言要为董卓报仇，长安城内人心浮动。", quotes: { bu: 52 } }
        ]
      }
    ]
  },
  {
    year: 194, where: "徐州 · 兖州", preview: "徐州求援",
    lead: "曹操进围徐州，陶谦病重，刘备正率援军赶来。曹军若继续围城，后方就要空虚。",
    title: "陶谦让徐州，吕布袭兖州",
    outcome: "吕布袭取兖州多地，曹操回师。陶谦病逝，刘备接掌徐州，陶氏退市。",
    briefs: [
      { year: 192, where: "长安", tag: "朝局", chapter: "第九回", text: "董卓死后，王允不肯赦免凉州旧部；李傕、郭汜听贾诩之言聚兵反攻长安，吕布败走，王允死难。" },
      { year: 192, where: "兖州", tag: "战报", chapter: "第十回", text: "曹操击破青州黄巾，收降卒三十余万，择其精锐号为「青州兵」，兵势复振。", quotes: { wei: 76 } },
      { year: 193, where: "徐州", tag: "人事", chapter: "第十回", text: "曹嵩携家小投奔曹操，途经徐州被都尉张闿杀害；曹操归咎陶谦，兴兵报仇。", quotes: { wei: 82, tao: 36 } },
      { year: 194, where: "北海", tag: "战报", chapter: "第十一回", text: "孔融被黄巾余党围困北海，刘备率关、张往救，又向公孙瓒借兵，转赴徐州援陶谦。" },
      { year: 194, where: "濮阳", tag: "战报", chapter: "第十一回", text: "吕布听陈宫之计，在濮阳城中设伏纵火；曹操误入火阵，须发尽焦，靠典韦死战才得脱。", quotes: { bu: 112, wei: 62 } },
      { year: 194, where: "曲阿", tag: "人事", text: "刘繇受命为扬州刺史，据曲阿，与袁术相持，江东州县各自观望。", quotes: { liu: 64 } }
    ],
    quotes: { tao: 0, shu: 52, wei: 68, bu: 99 }
  },
  {
    year: 196, where: "洛阳 · 徐州", preview: "天子东归",
    lead: "献帝回到残破的洛阳，缺一处安稳的驻地。曹操正考虑迎奉天子，吕布也在等待徐州出现破绽。",
    title: "曹操迎天子，吕布夺徐州",
    outcome: "曹操奉迎献帝，朝廷迁至许都。吕布乘虚夺取徐州，刘备退居小沛。孙策在江东拓展地盘，袁术也在淮南坐大。",
    briefs: [
      { year: 195, where: "徐州", tag: "人事", chapter: "第十三回", text: "吕布兵败兖州，往徐州投刘备；刘备念其牵制曹军之功，把小沛让给他屯驻。" },
      { year: 195, where: "长安", tag: "朝局", chapter: "第十三回", text: "李傕、郭汜在长安交兵，献帝困于宫中；杨奉、董承奉驾东逃，百官流离。" },
      { year: 196, where: "许都", tag: "朝局", chapter: "第十四回", text: "曹操迎献帝迁都许都，又募民屯田，得谷百万斛，朝廷号令自此出于曹操。" },
      { year: 196, where: "宛城", tag: "人事", text: "张济攻穰城中箭身亡，部众由侄张绣接管，屯驻宛城。", quotes: { xiu: 60 } },
      { year: 196, where: "江东", tag: "战报", chapter: "第十五回", text: "孙策以传国玉玺为质，向袁术借兵三千渡江，连破刘繇，太史慈归降，孙氏基业初成。", quotes: { liu: 0, wu: 78 } }
    ],
    quotes: { wei: 128, shu: 19, wu: 73, bu: 136, "shu-yuan": 117 }
  },
  {
    year: 197, where: "寿春", preview: "寿春的传国玉玺",
    lead: "袁术在寿春得到传国玉玺，部下对称帝之事争论不休。孙策一方正观察淮南动向。",
    title: "袁术寿春称帝",
    outcome: "袁术自立称帝，引来诸侯声讨。孙策与他决裂，袁术在淮南的处境转弱。",
    briefs: [
      { year: 197, where: "宛城", tag: "战报", chapter: "第十六回", text: "张绣降而复叛，夜袭曹营；典韦死守营门，曹操长子曹昂、侄曹安民皆遇害，曹操仅以身免。", quotes: { xiu: 132, wei: 126 } },
      { year: 197, where: "小沛", tag: "人事", chapter: "第十六回", text: "袁术遣纪灵攻小沛，吕布辕门射戟，一箭正中戟上小枝，两家只得罢兵。", quotes: { bu: 124, shu: 24 } },
      { year: 197, where: "寿春", tag: "朝局", chapter: "第十七回", text: "袁术据淮南，地广粮多，又有传国玉玺在手，渐有僭号称帝之意，群下纷纷劝进。", quotes: { "shu-yuan": 66, wu: 94 } },
      { year: 197, where: "江东", tag: "人事", chapter: "第十五回", text: "孙策在江东羽翼渐丰，对袁术的征调渐不恭顺；袁术屡次索要玉玺，孙策只推说日后再议。" }
    ],
    quotes: { "shu-yuan": 60, wu: 90, wei: 139, bu: 118, xiu: 140 }
  },
  {
    year: 198, where: "下邳", preview: "下邳受围",
    lead: "曹军围住下邳，吕布部下已为解围之事争执多日。城中仍有人主张固守。",
    title: "白门楼吕布退场",
    outcome: "下邳失守，吕布被俘身亡，吕布势力退市。曹操控制徐州，刘备随曹操赴许都。",
    briefs: [
      { year: 197, where: "徐州", tag: "战报", chapter: "第十七回", text: "袁术起七路大军攻徐州；吕布听陈珪父子之计，说动韩暹、杨奉倒戈，袁军大败而回。" },
      { year: 198, where: "沛城", tag: "战报", chapter: "第十八回", text: "夏侯惇与吕布部将高顺交战，左眼中箭，拔矢啖睛，仍挺枪杀退敌将。", quotes: { wei: 150 } },
      { year: 198, where: "下邳", tag: "战报", chapter: "第十九回", text: "曹操令军士决沂水、泗水灌下邳，城中只剩东门无水；吕布恃赤兔马可渡，仍不肯出城决战。", quotes: { bu: 70, wei: 162 } },
      { year: 198, where: "下邳", tag: "人事", chapter: "第十九回", text: "侯成追回失马，酿酒与诸将庆贺，触犯吕布禁酒令，被打五十背花；宋宪、魏续由此生出离意。" }
    ],
    quotes: { bu: 0, wei: 157, shu: 22, xiu: 84 }
  },
  {
    year: 199, where: "易京 · 淮南", preview: "易京与寿春的急报",
    lead: "公孙瓒退守易京，袁绍大军已到城下。南面袁术积粮将尽，听说在向袁绍求援。",
    title: "易京失守，两路诸侯退市",
    outcome: "袁绍攻破易京，公孙瓒自焚。袁术北归无望，病逝途中。两家势力退市，袁绍势力抵达高点。",
    briefs: [
      { year: 198, where: "易京", tag: "战报", chapter: "第二十一回", text: "袁绍围易京，公孙瓒筑楼积粟自守；袁军穿地道直抵楼下，纵火焚楼，公孙瓒杀妻自缢。", quotes: { shao: 168 } },
      { year: 199, where: "淮南", tag: "人事", chapter: "第二十一回", text: "袁术兵败粮尽，欲把帝号让与袁绍，亲率残部北上；途中被雷薄、陈兰劫去粮草。", quotes: { "shu-yuan": 52 } },
      { year: 199, where: "许都", tag: "人事", chapter: "第二十一回", text: "曹操与刘备煮酒论英雄，曹操一句「今天下英雄，惟使君与操耳」，惊得刘备失落匙箸。", quotes: { shu: 30, wei: 150 } },
      { year: 199, where: "江亭", tag: "人事", chapter: "第二十一回", text: "袁术退至江亭，军中只剩麦屑，求蜜水不得，呕血斗余而死；传国玉玺辗转归了曹操。" },
      { year: 199, where: "徐州", tag: "战报", chapter: "第二十一回", text: "刘备借截击袁术之机离开许都，至徐州杀刺史车胄，重新据城，与曹操公然决裂。", quotes: { shu: 34, wei: 150 } }
    ],
    quotes: { zan: 0, "shu-yuan": 0, shao: 177 }
  },
  {
    year: 200, where: "官渡 · 江东", preview: "北方对峙，江东换帅",
    lead: "袁绍与曹操在官渡相持，袁军兵多，曹军粮少。江东又传来孙策遇刺的消息。",
    title: "官渡决胜与孙权继位",
    outcome: "曹操击败袁绍，北方形势大变。孙权接过江东基业，稳住了局面，但继承变动给孙氏带来波动。",
    briefs: [
      { year: 199, where: "许都", tag: "朝局", chapter: "第二十回", text: "献帝以衣带密诏付董承，嘱其联络忠义之士图谋曹操；董承又邀刘备署名。", quotes: { shu: 12, wei: 180 } },
      { year: 200, where: "许都", tag: "朝局", chapter: "第二十四回", text: "衣带诏事泄，曹操杀董承等五人并其家小，又缢死董贵妃，勒令宫禁加严。", quotes: { shu: 10 } },
      { year: 200, where: "白马", tag: "战报", chapter: "第二十五回", text: "袁绍遣颜良攻白马；关羽随曹操出战，于万军中刺颜良于马下，解白马之围。", quotes: { wei: 186, shao: 66 } },
      { year: 200, where: "许都", tag: "人事", chapter: "第二十六回", text: "关羽得知刘备下落，挂印封金，留书辞曹，护送二嫂千里北上。", quotes: { shu: 14 } },
      { year: 200, where: "江东", tag: "人事", chapter: "第二十九回", text: "孙策怒斩于吉，不久遇刺身亡；孙权继位，礼聘张昭、周瑜，江东易主。", quotes: { wu: 46 } },
      { year: 200, where: "乌巢", tag: "战报", chapter: "第三十回", text: "许攸夜奔曹营，献计火烧乌巢；袁军粮草尽焚，张郃、高览阵前倒戈。", quotes: { wei: 188, shao: 82 } }
    ],
    quotes: { wei: 192, shao: 71, shu: 16, wu: 58, xiu: 0 },
    variants: [
      { label: "原线" },
      {
        label: "乌巢未焚",
        quotes: { wei: 158, shao: 108, shu: 18, wu: 58, xiu: 0 },
        outcome: "许攸出逃未成，乌巢粮草得以保全；曹操粮尽退兵，官渡无功而返。袁绍仍据河北，曹操元气大伤。",
        patches: {
          5: { year: 200, where: "乌巢", tag: "战报", chapter: "第三十回", text: "许攸家人犯法下狱，许攸怒而出走，行至半途被袁军巡骑追回；乌巢粮草无恙，曹军粮尽退兵。", quotes: { wei: 176, shao: 96 } }
        }
      }
    ]
  },
  {
    year: 204, where: "邺城", preview: "河北内争",
    lead: "袁绍身后，袁谭与袁尚争权。曹军趁兄弟不和进围邺城，荆州的刘表仍作壁上观。",
    title: "邺城失守",
    outcome: "曹操攻取邺城，袁氏在河北的根基大损。刘备依附刘表，暂有新野一地可守。",
    briefs: [
      { year: 200, where: "冀州", tag: "人事", chapter: "第三十一回", text: "袁绍不听田丰坚壁之策，将其下狱；官渡败后，逢纪进谗，田丰被赐死。", quotes: { shao: 62 } },
      { year: 201, where: "仓亭", tag: "战报", chapter: "第三十一回", text: "袁绍收拾残兵再战仓亭，曹操用十面埋伏之计，将袁军杀得大败。", quotes: { shao: 60, wei: 200 } },
      { year: 202, where: "冀州", tag: "人事", chapter: "第三十二回", text: "袁绍病重，刘夫人与审配立袁尚为嗣；袁绍吐血而亡，袁谭、袁尚各拥一州，河北分裂。", quotes: { shao: 42 } },
      { year: 203, where: "平原", tag: "战报", chapter: "第三十二回", text: "袁谭、袁尚兄弟相攻，袁谭兵败退守平原，遣辛毗向曹操求援。", quotes: { shao: 46 } },
      { year: 204, where: "邺城", tag: "战报", chapter: "第三十二回", text: "许攸献计决漳河之水灌邺；曹操先掘浅堑诱敌，再一夜加深十倍，水灌城中。", quotes: { shao: 40, wei: 210 } }
    ],
    quotes: { wei: 208, shao: 34, biao: 79, shu: 26 }
  },
  {
    year: 207, where: "隆中 · 辽东", preview: "卧龙未出山",
    lead: "刘备寄居新野，数次登门寻访一位谋士。北边，袁氏兄弟失去立足处，转投辽东。",
    title: "三顾茅庐，袁氏退市",
    outcome: "诸葛亮为刘备分析天下形势，随后出山相助。袁氏余部败亡，袁绍一系退市。",
    briefs: [
      { year: 207, where: "白狼山", tag: "战报", chapter: "第三十三回", text: "曹操远征乌桓，白狼山一战破蹋顿；郭嘉病逝前留下遗计，二袁逃往辽东，被公孙康斩首送来。", quotes: { wei: 218, shao: 12 } },
      { year: 207, where: "新野", tag: "人事", chapter: "第三十四回", text: "刘备在荆州遭蔡瑁猜忌，纵马跃过檀溪，逃得一命，决意另寻立足之策。", quotes: { shu: 40 } },
      { year: 207, where: "新野", tag: "战报", chapter: "第三十六回", text: "徐庶助刘备袭破樊城，曹操拘其母相胁；徐庶临行，走马荐诸葛亮。", quotes: { wei: 222, shu: 44 } },
      { year: 207, where: "隆中", tag: "人事", chapter: "第三十七回", text: "刘备冒雪再访草庐，仍未见诸葛亮，只留下书信与礼物，与诸葛均怏怏而别。", quotes: { shu: 46 } }
    ],
    quotes: { wei: 215, shu: 47, wu: 67, shao: 0 }
  },
  {
    year: 208, where: "襄阳", preview: "襄阳继承之争",
    lead: "刘表病重，刘琦与刘琮各有支持者。曹军已经南下，襄阳主政者很快要决定守还是降。",
    title: "荆州易主",
    outcome: "刘表病逝，刘琮继位后向曹操请降，刘表势力退市。曹操兵临长江，刘备被迫南退。",
    briefs: [
      { year: 208, where: "新野", tag: "战报", chapter: "第三十九回", text: "夏侯惇引军来攻新野，诸葛亮在博望坡设伏纵火，曹军大败而回。", quotes: { shu: 42, wei: 228 } },
      { year: 208, where: "江夏", tag: "战报", chapter: "第三十九回", text: "孙权亲征江夏，甘宁于东门设伏，黄祖败走被杀，江东报了孙坚之仇。", quotes: { wu: 78 } },
      { year: 208, where: "许都", tag: "朝局", chapter: "第四十回", text: "曹操在许都集五队兵马，定于建安十三年秋七月南征荆州；孔融进谏，被曹操借故处死。", quotes: { wei: 240, biao: 44 } },
      { year: 208, where: "襄阳", tag: "人事", chapter: "第四十回", text: "刘表病重，蔡夫人与蔡瑁拥立刘琮，把刘琦挡在门外；江夏兵权与荆州继承之争渐明。", quotes: { biao: 40, shu: 30 } }
    ],
    quotes: { biao: 0, wei: 233, shu: 32 }
  },
  {
    year: 208, where: "长江沿岸", preview: "江上决战将至",
    lead: "曹操南下，声势浩大，刘备退到江边。江东议论纷纷，主战与主降各执一词。",
    title: "赤壁之战",
    outcome: "孙刘合力击退曹操。江东守住门户，刘备得到在荆州发展的机会。",
    briefs: [
      { year: 208, where: "当阳", tag: "战报", chapter: "第四十二回", text: "刘备携民南撤，在当阳长坂被曹军追上；赵云单骑救出阿斗，张飞据长坂桥喝退追兵。", quotes: { shu: 24 } },
      { year: 208, where: "柴桑", tag: "朝局", chapter: "第四十三回", text: "诸葛亮随鲁肃赴柴桑，舌战江东群儒；孙权仍犹豫，未决抗曹之事。", quotes: { wu: 92 } },
      { year: 208, where: "三江口", tag: "权谋", chapter: "第四十五回", text: "周瑜破曹军于三江口；蒋干过江说降，反中周瑜之计，曹操误杀蔡瑁、张允。", quotes: { wei: 220, wu: 104 } },
      { year: 208, where: "赤壁", tag: "战报", chapter: "第四十六回", text: "周瑜借故重责黄盖，黄盖诈作怨恨，暗中遣阚泽过江献降书；曹操信以为真。", quotes: { wei: 200, wu: 118 } },
      { year: 208, where: "赤壁", tag: "权谋", chapter: "第四十七回", text: "庞统过江，劝曹军将战船首尾用铁环相连，以解北军晕船之苦；曹操大喜，自以为得计。", quotes: { wei: 180, wu: 122 } },
      { year: 208, where: "赤壁", tag: "战报", chapter: "第四十九回", text: "诸葛亮于七星坛祭得东南风，黄盖率火船直冲曹营，江面火起。", quotes: { wei: 130, wu: 126 } }
    ],
    quotes: { wei: 112, shu: 82, wu: 124 },
    variants: [
      { label: "原线" },
      {
        label: "东风未起",
        title: "赤壁对峙",
        quotes: { wei: 196, shu: 52, wu: 84 },
        outcome: "冬至已过，江上仍刮北风，火攻未成；黄盖火船被曹军水寨乱箭逼退。曹操保住南岸，孙刘联军退回江南，隔江对峙。",
        patches: {
          4: { year: 208, where: "赤壁", tag: "权谋", chapter: "第四十七回", text: "庞统过江，劝曹军将战船首尾用铁环相连；江上连日北风，周瑜营中反复推演火攻，却始终等不来东南风。", quotes: { wei: 182, wu: 118 } },
          5: { year: 208, where: "赤壁", tag: "战报", chapter: "第四十九回", text: "冬至将尽，东南风迟迟不至；黄盖火船驶到半途被曹军水寨乱箭逼退，火攻未成。", quotes: { wei: 172, wu: 96 } }
        }
      }
    ]
  },
  {
    year: 214, where: "益州", preview: "益州城门将闭",
    lead: "刘备受邀入蜀，如今与刘璋反目，战事拖到了成都城外。城内仍有守军，刘备的补给也在消耗。",
    title: "刘备入主益州",
    outcome: "刘璋开城归降，刘备取得益州，终于拥有稳固的根据地。孙刘围绕荆州的分歧仍在。",
    briefs: [
      { year: 209, where: "南郡", tag: "战报", chapter: "第五十一回", text: "周瑜与曹仁争夺南郡，中箭受伤；诸葛亮趁虚取南郡、荆州，周瑜气愤难平。", quotes: { wu: 118, shu: 78 } },
      { year: 210, where: "巴丘", tag: "人事", chapter: "第五十七回", text: "周瑜病逝巴丘，临终上书荐鲁肃接任；诸葛亮亲赴柴桑吊丧。", quotes: { wu: 96 } },
      { year: 211, where: "潼关", tag: "战报", chapter: "第五十八回", text: "马超、韩遂起兵为马腾报仇，潼关一战杀得曹操割须弃袍，几乎丧命。", quotes: { ma: 58, wei: 128 } },
      { year: 211, where: "涪城", tag: "人事", chapter: "第六十回", text: "刘璋迎刘备入蜀，张松、法正暗助刘备；庞统劝刘备趁机夺取益州。", quotes: { shu: 120 } },
      { year: 213, where: "落凤坡", tag: "战报", chapter: "第六十三回", text: "庞统在落凤坡中张任伏兵，中箭身亡；诸葛亮留关羽守荆州，亲率张飞、赵云入川。", quotes: { shu: 128 } },
      { year: 213, where: "巴郡", tag: "人事", chapter: "第六十三回", text: "张飞义释严颜，严颜感其恩义，归顺刘备，巴郡一路望风而降。", quotes: { shu: 132 } },
      { year: 214, where: "葭萌关", tag: "战报", chapter: "第六十五回", text: "马超与张飞在葭萌关大战，后经诸葛亮遣人说降归刘备；成都城外蜀军云集。", quotes: { shu: 150 } }
    ],
    quotes: { wei: 145, shu: 156, wu: 113, ma: 0 },
    variants: [
      { label: "原线" },
      {
        label: "成都久攻",
        quotes: { wei: 152, shu: 126, wu: 113, ma: 0 },
        outcome: "刘璋据城死守，刘备围成都数月，粮尽议和；益州虽入刘备之手，却是空城一座，马腾余部也在关中败亡。",
        clues: [
          { year: 213, where: "成都", tag: "朝局", chapter: "第六十四回", text: "成都城中粮草尚足，刘璋闭门不出；刘备军中已在议论退兵，益州的价钱被压了下来。", quotes: { shu: 138 } }
        ]
      }
    ]
  },
  {
    year: 219, where: "汉中 · 荆州", preview: "两条战线",
    lead: "刘备与曹操争夺汉中，关羽也率军北上。荆州守备趋薄，江东正密切留意江岸的动静。",
    title: "汉中称王与失荆州",
    outcome: "刘备取汉中并称王。随后孙权夺取荆州，关羽败亡，刘氏行情重挫。",
    briefs: [
      { year: 215, where: "合肥", tag: "战报", chapter: "第六十七回", text: "孙权攻合肥，张辽率八百骑突袭吴军，威震逍遥津；孙权险些被擒，江东震动。", quotes: { wu: 132, wei: 160 } },
      { year: 215, where: "汉中", tag: "人事", chapter: "第六十七回", text: "曹操遣军入汉中，张鲁开城归降，被封为镇南将军。", quotes: { wei: 165 } },
      { year: 215, where: "濡须", tag: "战报", chapter: "第六十八回", text: "甘宁率百骑夜劫曹营，全身而退；孙权叹其胆气，赏赐有加。", quotes: { wu: 142, wei: 156 } },
      { year: 219, where: "定军山", tag: "战报", chapter: "第七十一回", text: "刘备与曹操争汉中，黄忠在定军山阵斩夏侯渊，曹军汉中防线动摇。", quotes: { wei: 120, shu: 130 } },
      { year: 219, where: "樊城", tag: "战报", chapter: "第七十四回", text: "关羽围樊城，放水淹七军，于禁投降，庞德被斩；中原震动，曹操一度议迁都。", quotes: { shu: 150, wei: 110 } },
      { year: 219, where: "许都", tag: "权谋", chapter: "第七十五回", text: "曹操听从司马懿之议，遣使联结孙权；孙权命吕蒙相机图取荆州。", quotes: { wu: 190, shu: 130 } },
      { year: 219, where: "江陵", tag: "战报", chapter: "第七十五回", text: "吕蒙白衣渡江，糜芳、傅士仁不战而降，公安、江陵相继易手。", quotes: { wu: 190, shu: 100 } },
      { year: 219, where: "麦城", tag: "战报", chapter: "第七十六回", text: "关羽回师已迟，退守麦城，被吴军围困，援兵久久不至。", quotes: { shu: 120, wu: 170 } }
    ],
    quotes: { wei: 130, shu: 109, wu: 179 }
  },
  {
    year: 223, where: "白帝城", preview: "夷陵之后",
    lead: "刘备东征失利，退居白帝城。他病势渐重，成都正在等待继承与辅政的安排。",
    title: "白帝托孤",
    outcome: "刘备托孤于诸葛亮，刘禅继位。朝局延续，夷陵重创却难以立刻弥补。",
    briefs: [
      { year: 220, where: "洛阳", tag: "人事", chapter: "第七十八回", text: "曹操病逝洛阳，遗命曹丕继位；曹丕即魏王位，改元延康。", quotes: { wei: 140 } },
      { year: 220, where: "洛阳", tag: "朝局", chapter: "第八十回", text: "曹丕受汉献帝禅让，登基称帝，改国号魏；献帝被降为山阳公。", quotes: { wei: 160 } },
      { year: 220, where: "洛阳", tag: "人事", chapter: "第七十九回", text: "曹丕令曹植七步成诗，曹植应声而作；曹丕贬其爵位，曹植悒郁离京。", quotes: { wei: 150 } },
      { year: 221, where: "成都", tag: "朝局", chapter: "第八十回", text: "刘备在成都称帝，国号汉，以诸葛亮为丞相，立刘禅为太子。", quotes: { shu: 80 } },
      { year: 221, where: "武昌", tag: "朝局", chapter: "第八十二回", text: "孙权受魏封为吴王，加九锡；吴魏暂时交好，江东得以专力对蜀。", quotes: { wu: 150, wei: 160 } },
      { year: 221, where: "阆中", tag: "人事", chapter: "第八十一回", text: "张飞急于为关羽报仇，鞭打范疆、张达；二人趁夜刺杀张飞，携首级投奔东吴。", quotes: { shu: 60 } },
      { year: 222, where: "夷陵", tag: "战报", chapter: "第八十四回", text: "陆逊坚守待机，趁蜀军移营山林，火烧连营七百里；刘备败退白帝城。", quotes: { shu: 75, wu: 155 } }
    ],
    quotes: { wei: 152, shu: 66, wu: 164 }
  },
  {
    year: 229, where: "武昌", preview: "江东群臣议进位",
    lead: "魏、蜀已各自立国。孙权坐稳江东，群臣开始议论称帝之事。",
    title: "孙权称帝",
    outcome: "孙权称帝，随后迁都建业，三方各据一方的局面已经成形。",
    briefs: [
      { year: 223, where: "成都", tag: "朝局", chapter: "第八十五回", text: "诸葛亮安居平五路，调兵遣将，五路兵马不战自退，蜀中人心稍定。", quotes: { shu: 70 } },
      { year: 225, where: "南中", tag: "战报", chapter: "第八十七回", text: "孟获起兵反蜀，南中诸郡响应；诸葛亮率军南征，渡泸水深入不毛。", quotes: { meng: 64 } },
      { year: 225, where: "南中", tag: "战报", chapter: "第九十回", text: "诸葛亮南征，七擒七纵孟获，南中归心，蜀汉后方渐稳。", quotes: { shu: 86, meng: 0 } },
      { year: 226, where: "洛阳", tag: "朝局", chapter: "第九十一回", text: "曹丕病逝，曹叡继位；曹真、陈群、司马懿受遗诏辅政。", quotes: { wei: 148 } },
      { year: 227, where: "汉中", tag: "人事", chapter: "第九十一回", text: "诸葛亮上《出师表》，率军北驻汉中，准备出祁山伐魏。", quotes: { shu: 92, wei: 150 } },
      { year: 228, where: "街亭", tag: "战报", chapter: "第九十五回", text: "马谡违令扎营山上，失守街亭；诸葛亮在西城焚香抚琴，司马懿疑有伏兵而退。", quotes: { shu: 70, wei: 160 } },
      { year: 229, where: "武昌", tag: "异闻", chapter: "第九十八回", text: "武昌东山凤凰来仪，大江之中黄龙屡现；张昭率群臣劝孙权即皇帝位。", quotes: { wu: 212 } }
    ],
    quotes: { wu: 204, shu: 79 },
    variants: [
      { label: "原线" },
      {
        label: "称王未帝",
        title: "群臣劝进未果",
        quotes: { wu: 154, shu: 79 },
        outcome: "武昌凤凰之说被人非议，孙权以天命未可妄测推辞称帝，只进号吴王。三方的名号仍差着一层，江东估值回落。",
        clues: [
          { year: 229, where: "武昌", tag: "朝局", chapter: "第九十八回", text: "张昭率群臣劝进，孙权却以「天命未可妄测」推辞，只肯受吴王之位，江东群臣议论纷纷。", quotes: { wu: 176 } }
        ]
      }
    ]
  },
  {
    year: 234, where: "五丈原", preview: "北伐陷入僵持",
    lead: "诸葛亮率军驻扎五丈原，司马懿坚守不出。对峙日久，粮运和主帅的健康都牵动局势。",
    title: "秋风五丈原",
    outcome: "诸葛亮病逝，蜀军撤回汉中，北伐失去长期的主导者。曹魏守住关中。",
    briefs: [
      { year: 234, where: "渭南", tag: "人事", chapter: "第一百二回", text: "诸葛亮造木牛流马运粮，司马懿命人仿造，反被蜀军劫去粮草。", quotes: { shu: 46, wei: 170 } },
      { year: 234, where: "五丈原", tag: "战报", chapter: "第一百三回", text: "诸葛亮遣使送巾帼女衣羞辱司马懿，司马懿忍辱不出，只向使者打听诸葛亮起居。", quotes: { wei: 180 } },
      { year: 234, where: "上方谷", tag: "战报", chapter: "第一百三回", text: "诸葛亮诱司马懿入上方谷，火起之际天降大雨，司马懿父子趁雨突围。", quotes: { wei: 168 } },
      { year: 234, where: "五丈原", tag: "异闻", chapter: "第一百三回", text: "诸葛亮积劳成疾，在五丈原设灯禳星；魏延闯入帐中，主灯被风吹灭。", quotes: { shu: 42, wei: 180 } }
    ],
    quotes: { wei: 177, shu: 39, wu: 148 },
    variants: [
      { label: "原线" },
      {
        label: "禳星得延",
        title: "秋风未起",
        quotes: { wei: 166, shu: 60, wu: 148 },
        outcome: "诸葛亮在五丈原服药调养，病势稍缓，蜀军全师退回汉中。北伐未成，蜀中人心却未散。",
        clues: [
          { year: 234, where: "五丈原", tag: "异闻", chapter: "第一百三回", text: "五丈原营中传出消息：诸葛亮服药后略有好转，蜀军已开始收拾行装，准备退兵。", quotes: { shu: 52 } }
        ]
      }
    ]
  },
  {
    year: 249, where: "洛阳", preview: "天子出城谒陵",
    lead: "曹爽随魏帝离开洛阳。司马懿称病多时，朝臣正观望城中的兵马与宫门动向。",
    title: "高平陵之变",
    outcome: "司马懿掌控洛阳，曹爽交出权力。曹氏估值大跌，取得朝中实权的司马氏挂牌。",
    briefs: [
      { year: 234, where: "五丈原", tag: "战报", chapter: "第一百四回", text: "诸葛亮病逝后，蜀军秘不发丧，推木像退敌；司马懿以为诸葛亮尚在，引军惊退。", quotes: { wei: 160, shu: 44 } },
      { year: 237, where: "襄平", tag: "人事", chapter: "第一百六回", text: "公孙渊自立为燕王，改元绍汉，辽东与魏决裂。" },
      { year: 238, where: "襄平", tag: "战报", chapter: "第一百六回", text: "司马懿率军远征辽东，破襄平，斩公孙渊父子，辽东平定。" },
      { year: 239, where: "洛阳", tag: "朝局", chapter: "第一百六回", text: "曹叡病重，托孤于曹爽、司马懿；曹芳继位，曹爽渐专朝政，排挤司马懿。", quotes: { wei: 180 } },
      { year: 248, where: "洛阳", tag: "权谋", chapter: "第一百六回", text: "司马懿称病不朝，曹爽遣李胜探视；司马懿装出病重之态，骗过使者。", quotes: { wei: 120 } }
    ],
    quotes: { wei: 52, shu: 47, wu: 109, jin: 103 }
  },
  {
    year: 263, where: "成都", preview: "成都告急",
    lead: "蜀军主力在剑阁与钟会相持，却有急报称邓艾已逼近成都。宫中正在争论守城还是议降。",
    title: "蜀汉归降",
    outcome: "刘禅出降，刘氏退市。曹魏虽灭蜀，战功却加速了司马氏的崛起。",
    briefs: [
      { year: 249, where: "洛阳", tag: "朝局", chapter: "第一百七回", text: "司马懿诛曹爽、收兵权，魏国朝政尽归司马氏；曹芳只守虚位。", quotes: { jin: 140, wei: 48 } },
      { year: 252, where: "建业", tag: "朝局", chapter: "第一百八回", text: "孙权病逝，十岁的孙亮继位；诸葛恪辅政，江东主少国疑。", quotes: { wu: 88 } },
      { year: 252, where: "东兴", tag: "战报", chapter: "第一百八回", text: "司马昭三路伐吴，丁奉雪中奋短兵，大破魏军于东兴；魏军弃甲而走。", quotes: { wu: 100, wei: 50 } },
      { year: 253, where: "建业", tag: "权谋", chapter: "第一百八回", text: "孙峻设宴伏兵，诛杀诸葛恪，吴国朝政自此归孙峻。", quotes: { wu: 76 } },
      { year: 260, where: "洛阳", tag: "朝局", chapter: "第一百十四回", text: "魏帝曹髦不甘坐受废辱，率亲兵出讨司马昭，被成济刺死于南阙之下。", quotes: { wei: 40 } },
      { year: 262, where: "沓中", tag: "人事", chapter: "第一百十五回", text: "姜维避祸沓中屯田，蜀中军政松弛；后主听信黄皓，朝议日非。", quotes: { shu: 40 } },
      { year: 263, where: "阴平", tag: "战报", chapter: "第一百十七回", text: "邓艾偷渡阴平，诸葛瞻战死绵竹，成都门户洞开，蜀中震动。", quotes: { shu: 20, wei: 44 } }
    ],
    quotes: { wei: 36, shu: 0, wu: 72, jin: 156 }
  },
  {
    year: 265, where: "洛阳", preview: "魏廷议禅",
    lead: "司马炎继承晋王之位，群臣纷纷劝进。曹奂仍在位，但实权早已旁落。",
    title: "司马氏代魏",
    outcome: "曹奂禅位，司马炎称帝建晋。曹氏退市，江东成为晋之外仅存的政权。",
    briefs: [
      { year: 264, where: "剑阁", tag: "权谋", chapter: "第一百十八回", text: "刘禅已降，姜维在剑阁接到敕令，率部降于钟会，暗中劝钟会据蜀自立。" },
      { year: 264, where: "成都", tag: "战报", chapter: "第一百十九回", text: "钟会诬告邓艾谋反，将其槛车押送洛阳；随后在成都举事，魏军哗变，钟会与姜维皆死于乱军。", quotes: { wei: 32, jin: 160 } },
      { year: 264, where: "建业", tag: "朝局", chapter: "第一百二十回", text: "吴主孙休病逝，濮阳兴、张布迎立孙皓，江东易主。", quotes: { wu: 60 } },
      { year: 264, where: "洛阳", tag: "朝局", chapter: "第一百十九回", text: "司马昭进爵晋王，曹奂只守虚位，魏室名存实亡。", quotes: { jin: 190, wei: 20 } }
    ],
    quotes: { wei: 0, wu: 53, jin: 219 },
    variants: [
      { label: "原线" },
      {
        label: "禅让未成",
        title: "禅让未成",
        quotes: { wei: 0, wu: 53, jin: 148 },
        outcome: "曹奂在殿上推辞禅位，司马炎称病还邺，两宫僵持半年。魏室终究名存实亡，曹氏仍难逃退市；司马氏虽得天下，元气却大伤。",
        clues: [
          { year: 265, where: "洛阳", tag: "朝局", chapter: "第一百十九回", text: "洛阳传出消息：曹奂在殿上推辞禅位，只说「朕德薄，未敢奉天」；晋王司马炎称病还邺。", quotes: { wei: 12, jin: 172 } }
        ]
      }
    ]
  },
  {
    year: 280, where: "建业", preview: "晋军抵近江东",
    lead: "晋军兵临长江，吴国各地守将陆续告急。建业仍在孙皓手中，群臣各议守降。",
    title: "三国归晋",
    outcome: "孙皓归降，孙氏退市。自此三国归晋，司马氏以收盘价计入期末资产。",
    briefs: [
      { year: 269, where: "襄阳", tag: "人事", chapter: "第一百二十回", text: "羊祜镇守襄阳，减戍垦田，吴人降者听其去留；陆抗屯兵江口，两军隔江相持，边境无事。", quotes: { jin: 230, wu: 55 } },
      { year: 278, where: "洛阳", tag: "人事", chapter: "第一百二十回", text: "羊祜病重，临终举荐杜预接任；晋廷决意大举伐吴。", quotes: { jin: 250, wu: 50 } },
      { year: 280, where: "建业", tag: "朝局", chapter: "第一百二十回", text: "孙皓宴饮无度，置黄门郎纠弹群臣，犯者或剥面、或凿眼，江东人人自危。", quotes: { wu: 40 } },
      { year: 280, where: "长江", tag: "战报", chapter: "第一百二十回", text: "王濬率楼船顺江而下，吴军铁锁横江，被晋军火炬熔断，晋军直抵石头城。", quotes: { wu: 20, jin: 270 } }
    ],
    quotes: { wu: 0, jin: 286 },
    variants: [
      { label: "原线" },
      {
        label: "铁锁未破",
        title: "王濬受阻",
        quotes: { wu: 78, jin: 206 },
        outcome: "吴军铁锁横江，火船逆流冲撞，晋军楼船受挫退回江北。孙皓仍据建业，江东未下，孙氏得以留在场上。",
        patches: {
          1: { year: 278, where: "洛阳", tag: "人事", chapter: "第一百二十回", text: "羊祜病重，临终举荐杜预接任；晋廷决意大举伐吴，却听说吴人在江上横设铁锁、以火船守江。", quotes: { jin: 244, wu: 56 } },
          3: { year: 280, where: "长江", tag: "战报", chapter: "第一百二十回", text: "王濬率楼船顺江而下，吴军在江面横设铁锁，又以火船逆流冲撞；晋军前锋受挫，退屯江北。", quotes: { wu: 64, jin: 214 } }
        }
      }
    ]
  }
];
