// Navigation
document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const game = btn.dataset.game;
        showSection(game);
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    });
});

document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('click', () => {
        showSection(card.dataset.game);
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        document.querySelector(`[data-game="${card.dataset.game}"]`).classList.add('active');
    });
});

function showSection(game) {
    document.querySelectorAll('.game-section').forEach(s => s.classList.remove('active'));
    document.getElementById(game).classList.add('active');
}

// Random Game Picker
document.getElementById('randomGameBtn').addEventListener('click', () => {
    const games = [
        { name: '幸运转盘', icon: '🎯', desc: '双转盘选玩家+游戏' },
        { name: '数字炸弹', icon: '💣', desc: '猜数字，猜中喝酒' },
        { name: '真心话大冒险', icon: '🎭', desc: '随机抽取题目' },
        { name: '掷骰子', icon: '🎲', desc: '比大小定胜负' },
        { name: '抽扑克', icon: '🃏', desc: '随机抽牌，不重复' }
    ];
    const result = document.getElementById('randomResult');
    let count = 0;
    const interval = setInterval(() => {
        const g = games[count % games.length];
        result.innerHTML = `${g.icon} <strong>${g.name}</strong><br><small>${g.desc}</small>`;
        count++;
        if (count > 15) {
            clearInterval(interval);
            const chosen = games[Math.floor(Math.random() * games.length)];
            const sectionMap = { '幸运转盘': 'wheel', '数字炸弹': 'bomb', '真心话大冒险': 'truth', '掷骰子': 'dice', '抽扑克': 'poker' };
            result.innerHTML = `${chosen.icon} <strong style="color:#e94560;font-size:1.5rem">${chosen.name}</strong><br><small>${chosen.desc}</small><br><button onclick="showSection('${sectionMap[chosen.name]}')" class="btn-secondary" style="margin-top:10px">开始玩</button>`;
        }
    }, 80);
});

// History Manager
class HistoryManager {
    constructor(maxSize = 5) {
        this.maxSize = maxSize;
        this.diceHistory = [];
        this.pokerHistory = [];
    }

    addDice(roundText) {
        this.diceHistory.push({ text: roundText, time: this.now() });
        if (this.diceHistory.length > this.maxSize) this.diceHistory.shift();
        this.renderDice();
    }

    addPoker(roundText) {
        this.pokerHistory.push({ text: roundText, time: this.now() });
        if (this.pokerHistory.length > this.maxSize) this.pokerHistory.shift();
        this.renderPoker();
    }

    now() {
        const d = new Date();
        return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
    }

    renderDice() {
        const container = document.getElementById('diceHistory');
        const labels = ['本局', '上1局', '上2局'];
        container.innerHTML = [...this.diceHistory].reverse().map((item, i) => `
            <div class="history-item">
                <span class="round">${labels[i] || ''}</span>
                <span class="content">${item.text}</span>
                <span class="time">${item.time}</span>
            </div>
        `).join('') || '<div class="history-item"><span class="content">暂无记录</span></div>';
    }

    renderPoker() {
        const container = document.getElementById('pokerHistory');
        const labels = ['本局', '上1局', '上2局'];
        container.innerHTML = [...this.pokerHistory].reverse().map((item, i) => `
            <div class="history-item">
                <span class="round">${labels[i] || ''}</span>
                <span class="content">${item.text}</span>
                <span class="time">${item.time}</span>
            </div>
        `).join('') || '<div class="history-item"><span class="content">暂无记录</span></div>';
    }
}

const historyMgr = new HistoryManager(3);
historyMgr.renderDice();
historyMgr.renderPoker();

// Wheel Class
class Wheel {
    constructor(canvasId, items, resultId, spinBtnId, listId, addBtnId, resetBtnId, defaultItems) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.items = [...items];
        this.resultEl = document.getElementById(resultId);
        this.currentAngle = 0;
        this.spinning = false;
        this.colors = ['#e94560', '#0f3460', '#533483', '#f39422', '#16c79a', '#ef476f', '#118ab2', '#073b4c', '#e74c3c', '#27ae60'];
        this.defaultItems = defaultItems;

        this.draw();

        document.getElementById(spinBtnId).addEventListener('click', () => this.spin());
        document.getElementById(addBtnId).addEventListener('click', () => this.addItem(listId));
        document.getElementById(resetBtnId).addEventListener('click', () => this.resetItems(listId));
        document.getElementById(listId).addEventListener('input', () => this.updateItems(listId));
    }

    draw() {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const radius = this.canvas.width / 2 - 20;
        const sliceAngle = (2 * Math.PI) / this.items.length;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        for (let i = 0; i < this.items.length; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(centerX, centerY);
            this.ctx.arc(centerX, centerY, radius, this.currentAngle + i * sliceAngle, this.currentAngle + (i + 1) * sliceAngle);
            this.ctx.fillStyle = this.colors[i % this.colors.length];
            this.ctx.fill();
            this.ctx.strokeStyle = '#fff';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();

            this.ctx.save();
            this.ctx.translate(centerX, centerY);
            this.ctx.rotate(this.currentAngle + i * sliceAngle + sliceAngle / 2);
            this.ctx.textAlign = 'right';
            this.ctx.fillStyle = '#fff';
            this.ctx.font = 'bold 14px sans-serif';
            this.ctx.fillText(this.items[i], radius - 15, 5);
            this.ctx.restore();
        }

        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, 25, 0, 2 * Math.PI);
        this.ctx.fillStyle = '#fff';
        this.ctx.fill();
        this.ctx.strokeStyle = '#e94560';
        this.ctx.lineWidth = 3;
        this.ctx.stroke();
    }

    spin() {
        if (this.spinning) return;
        this.spinning = true;
        this.resultEl.innerHTML = '';

        let velocity = Math.random() * 10 + 20;
        const deceleration = 0.15 + Math.random() * 0.1;

        const animate = () => {
            this.currentAngle += velocity * 0.05;
            velocity -= deceleration;
            this.draw();

            if (velocity > 0) {
                requestAnimationFrame(animate);
            } else {
                this.spinning = false;
                const sliceAngle = (2 * Math.PI) / this.items.length;
                const normalizedAngle = ((2 * Math.PI) - (this.currentAngle % (2 * Math.PI)) + Math.PI / 2) % (2 * Math.PI);
                const winnerIndex = Math.floor(normalizedAngle / sliceAngle) % this.items.length;
                const winner = this.items[winnerIndex];
                this.resultEl.innerHTML = `🎉 <strong style="color:#e94560;font-size:1.4rem">${winner}</strong>`;
            }
        };
        animate();
    }

    addItem(listId) {
        const container = document.getElementById(listId);
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'player-input';
        input.placeholder = `${this.defaultItems[0]}${this.items.length + 1}`;
        input.value = `${this.defaultItems[0]}${this.items.length + 1}`;
        container.appendChild(input);
        this.updateItems(listId);
    }

    resetItems(listId) {
        const container = document.getElementById(listId);
        container.innerHTML = this.defaultItems.map((item, i) =>
            `<input type="text" class="player-input" placeholder="${item}" value="${item}">`
        ).join('');
        this.updateItems(listId);
    }

    updateItems(listId) {
        const inputs = document.getElementById(listId).querySelectorAll('.player-input');
        this.items = Array.from(inputs).map(i => i.value || i.placeholder).filter(v => v.trim() !== '');
        if (this.items.length === 0) this.items = ['?'];
        this.draw();
    }
}

// Initialize Left Wheel (Players)
const playerWheel = new Wheel(
    'wheelCanvasLeft',
    ['玩家1', '玩家2', '玩家3'],
    'wheelResultLeft',
    'spinBtnLeft',
    'playersList',
    'addPlayerBtn',
    'resetPlayersBtn',
    ['玩家1', '玩家2', '玩家3']
);

// Initialize Right Wheel (Games/Punishments)
const gameWheel = new Wheel(
    'wheelCanvasRight',
    ['喝1杯', '喝2杯', '真心话', '大冒险'],
    'wheelResultRight',
    'spinBtnRight',
    'gamesList',
    'addGameBtn',
    'resetGamesBtn',
    ['喝1杯', '喝2杯', '真心话', '大冒险']
);

// Bomb Game
let bombNumber, bombMin, bombMax;

document.getElementById('startBombBtn').addEventListener('click', () => {
    const range = parseInt(document.getElementById('bombRange').value) || 100;
    bombNumber = Math.floor(Math.random() * range) + 1;
    bombMin = 1;
    bombMax = range;
    document.getElementById('bombGame').classList.remove('hidden');
    document.getElementById('bombResult').innerHTML = '';
    document.getElementById('resetBombBtn').classList.add('hidden');
    updateBombDisplay();
});

document.getElementById('guessBtn').addEventListener('click', guessBomb);
document.getElementById('bombGuess').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') guessBomb();
});

function guessBomb() {
    const guess = parseInt(document.getElementById('bombGuess').value);
    if (!guess || guess < bombMin || guess > bombMax) {
        document.getElementById('bombResult').innerHTML = `请输入 ${bombMin} 到 ${bombMax} 之间的数字！`;
        return;
    }

    if (guess === bombNumber) {
        document.getElementById('bombDisplay').innerHTML = '💥';
        document.getElementById('bombDisplay').style.animation = 'none';
        document.getElementById('bombResult').innerHTML = `💥 <strong style="color:#e94560;font-size:1.5rem">BOMB! 数字就是 ${bombNumber}！喝酒！</strong>`;
        document.getElementById('bombGame').classList.add('hidden');
        document.getElementById('resetBombBtn').classList.remove('hidden');
    } else if (guess < bombNumber) {
        bombMin = guess + 1;
        document.getElementById('bombResult').innerHTML = `太小了！范围缩小到 ${bombMin} - ${bombMax}`;
        updateBombDisplay();
    } else {
        bombMax = guess - 1;
        document.getElementById('bombResult').innerHTML = `太大了！范围缩小到 ${bombMin} - ${bombMax}`;
        updateBombDisplay();
    }
    document.getElementById('bombGuess').value = '';
}

function updateBombDisplay() {
    document.getElementById('bombMin').textContent = bombMin;
    document.getElementById('bombMax').textContent = bombMax;
    document.getElementById('safeCount').textContent = bombMax - bombMin + 1;
}

document.getElementById('resetBombBtn').addEventListener('click', () => {
    document.getElementById('bombGame').classList.add('hidden');
    document.getElementById('bombResult').innerHTML = '';
    document.getElementById('resetBombBtn').classList.add('hidden');
    document.getElementById('bombDisplay').innerHTML = '💣';
    document.getElementById('bombDisplay').style.animation = 'pulse 1.5s infinite';
});

// Truth or Dare
const truths = [
    '你的初吻是几岁？被谁夺走的？',
    '你的初恋是几岁？对象叫什么名字？',
    '到目前为止你谈过几次正经恋爱？',
    '你亲吻过多少人？（包括同性）',
    '和多少异性有过暧昧关系？',
    '你最多同时和几个人暧昧？',
    '你在感情上劈过腿吗？详细讲讲',
    '你第一个喜欢的异性叫什么名字？',
    '让你念念不忘的异性是谁？为什么？',
    '第一次爱的人对你产生了什么影响？',
    '你曾经意淫过在场的哪一位？',
    '描述你做过的最污的一个春梦',
    '跟异性做过最亲密的事进展到哪一步？',
    '有没有一瞬间让你对同性动了心？',
    '如果变成异性，第一件事想做什么？',
    '你一共收藏过多少部小电影？',
    '精神出轨和肉体出轨哪个更严重？',
    '你会为了爱情牺牲一切吗？',
    '我在你眼里是什么样的人？说实话',
    '在座哪位异性看起来最"舒服"？',
    '回到高中最想对哪位异性说什么？',
    '现在心里想念的异性叫什么名字？',
    '每天睡觉前都会想起的人是谁？',
    '对象和爱豆同时打电话先接谁的？',
    '如果前任求复合你会怎么办？',
    '你最讨厌自己身上哪一点？',
    '如果明天是世界末日最想做什么？',
    '流落荒岛第一个电话打给谁？',
    '今年最后悔的一件事是什么？',
    '最想从头来过的一件事是什么？',
    '发现另一半出轨了你会怎么办？',
    '什么事你一定会瞒着另一半？',
    '跟异性做过最丢脸的事是什么？',
    '做过最得意但又最不要脸的事？',
    '最近一次发自内心的笑是因为什么？',
    '你觉得自己重色轻友吗？举例',
    '说实话你觉得自己长得怎么样？',
    '你撒过最大的谎是什么？',
    '你最不想让人知道的一个秘密？',
    '你最近一次哭是什么时候？',
    '你暗恋过在座的哪位？',
    '你最尴尬的一次经历是什么？',
    '如果可以互换人生一天，选谁？',
    '你做过最疯狂的事是什么？',
    '你最害怕失去什么？',
    '你有没有偷偷看过别人手机？',
    '你最讨厌在座谁的什么习惯？',
    '你的浏览器搜索历史敢给大家看吗？',
    '你曾经酒后乱来过吗？',
    '你会为了钱出卖朋友吗？',
];

const dares = [
    '模仿脑白金广告边唱边跳',
    '大喊三遍"我是猪"',
    '蹲在凳子上做便秘状30秒',
    '大笑5秒、大哭5秒，反复3次',
    '原地左转3圈右转3圈，闭眼走回座位',
    '走猫步绕场一周，摆3个S造型',
    '用屁股在空中写自己名字',
    '深情吻墙10秒，必须发出mua声',
    '闻自己袜子深呼吸3次，表情要享受',
    '脸上画乌龟保持到游戏结束',
    '学大猩猩捶胸呐喊"我好寂寞"',
    '用方言读绕口令，错一次罚一口',
    '模仿5种动物叫声，大家投票',
    '做鬼脸坚持30秒，逗笑一个人',
    '抱垃圾桶傻笑10秒',
    '唱青藏高原最后一句必须破音',
    '边做深蹲边唱征服，做满10个',
    '打开浏览器记录给大家公开处刑',
    '发朋友圈"单身了"10分钟不准删',
    '模仿青楼女子拉客说"大爷来呀"',
    '对窗外大喊"我好寂寞"',
    '发消息给好友：一起拉屎吗我出纸',
    '模仿一种动物的叫声让大家猜',
    '给通讯录第10个人发语音说我想你了',
    '做一个最丑的表情保持10秒',
    '唱一首你最拿手的歌',
    '模仿在座的一个人让大家猜',
    '做一个俯卧撑',
    '给前任打电话说我喝多了',
    '十指交扣与一位异性深情对视10秒',
    '壁咚左边第一位异性，对视10秒',
    '公主抱一位异性绕场一周',
    '对喝交杯酒，说余生请多指教',
    '对喂花生米，掉了重来',
    '嘴对嘴传纸巾，掉了罚酒',
    '单膝下跪亲一位异性手背告白',
    '横抱右边第一位异性坚持5秒',
    '踩异性脚上跳舞1分钟',
    '让异性给你涂口红合影发朋友圈',
    '嘴里含一口酒做最性感表情10秒',
    '喂左边第一位喝酒：大郎该吃药了',
    '嘴里叼杯子让异性倒酒，洒一滴罚一杯',
    '选一个异性做俯卧撑5个',
    '亲左数第二个异性的额头夸皮肤好',
    '拥抱在场每一个人5秒',
    '15秒干完一杯啤酒',
    '吃下每个人为你夹的菜',
    '喝一杯左边指定的特调',
    '模仿喝烈酒的样子喝完一杯白开水',
    '读酒桌绕口令，错一个字喝一口',
];

document.getElementById('truthBtn').addEventListener('click', () => showCard('truth'));
document.getElementById('dareBtn').addEventListener('click', () => showCard('dare'));
document.getElementById('randomTruthBtn').addEventListener('click', () => showCard(Math.random() > 0.5 ? 'truth' : 'dare'));
document.getElementById('nextTruthBtn').addEventListener('click', () => {
    document.getElementById('truthCard').classList.add('hidden');
    document.getElementById('nextTruthBtn').classList.add('hidden');
});

function showCard(type) {
    const card = document.getElementById('truthCard');
    const typeEl = document.getElementById('cardType');
    const contentEl = document.getElementById('cardContent');
    const isTruth = type === 'truth';

    typeEl.textContent = isTruth ? '💙 真心话' : '❤️ 大冒险';
    typeEl.className = 'card-type ' + type;
    contentEl.textContent = isTruth ? truths[Math.floor(Math.random() * truths.length)] : dares[Math.floor(Math.random() * dares.length)];

    card.classList.remove('hidden');
    document.getElementById('nextTruthBtn').classList.remove('hidden');
}

// Dice Game
let diceRound = 0;

document.getElementById('rollDiceBtn').addEventListener('click', () => {
    const count = parseInt(document.getElementById('diceCount').value) || 1;
    const container = document.getElementById('diceContainer');
    const totalEl = document.getElementById('diceTotal');
    container.innerHTML = '';

    let total = 0;
    const values = [];
    for (let i = 0; i < count; i++) {
        const value = Math.floor(Math.random() * 6) + 1;
        total += value;
        values.push(value);
        container.appendChild(createDice(value));
    }

    diceRound++;
    totalEl.innerHTML = `总和: <strong style="color:#e94560;font-size:2rem">${total}</strong>`;
    historyMgr.addDice(`掷出 ${count} 颗骰子: [${values.join(', ')}] = ${total}`);
});

function createDice(value) {
    const dice = document.createElement('div');
    dice.className = 'dice';
    const positions = {
        1: [[0,0,0],[0,1,0],[0,0,0]],
        2: [[0,0,1],[0,0,0],[1,0,0]],
        3: [[0,0,1],[0,1,0],[1,0,0]],
        4: [[1,0,1],[0,0,0],[1,0,1]],
        5: [[1,0,1],[0,1,0],[1,0,1]],
        6: [[1,0,1],[1,0,1],[1,0,1]]
    };
    const p = positions[value];
    for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
            const dot = document.createElement('div');
            if (p[r][c]) {
                dot.className = 'dice-dot';
            }
            dice.appendChild(dot);
        }
    }
    return dice;
}

// Poker Game
const SUITS = [
    { name: 'spades', symbol: '♠', color: 'black' },
    { name: 'hearts', symbol: '♥', color: 'red' },
    { name: 'clubs', symbol: '♣', color: 'black' },
    { name: 'diamonds', symbol: '♦', color: 'red' }
];
const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

let fullDeck = [];
let remainingDeck = [];
let pokerRound = 0;

function createDeck() {
    const deck = [];
    for (const suit of SUITS) {
        for (const rank of RANKS) {
            deck.push({ suit, rank });
        }
    }
    return deck;
}

function shuffle(deck) {
    const arr = [...deck];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function initPoker() {
    fullDeck = createDeck();
    remainingDeck = shuffle([...fullDeck]);
}

function drawCards(count) {
    if (remainingDeck.length < count) {
        remainingDeck = shuffle([...fullDeck]);
    }
    return remainingDeck.splice(0, count);
}

function createPokerCard(card) {
    const el = document.createElement('div');
    el.className = `poker-card ${card.suit.color}`;
    el.innerHTML = `
        <div class="poker-top">${card.rank}<br>${card.suit.symbol}</div>
        <div class="poker-center">${card.suit.symbol}</div>
        <div class="poker-bottom">${card.rank}<br>${card.suit.symbol}</div>
    `;
    return el;
}

document.getElementById('drawPokerBtn').addEventListener('click', () => {
    const count = parseInt(document.getElementById('pokerCount').value) || 1;
    if (count > 20) {
        document.getElementById('pokerResult').innerHTML = '一次最多抽20张牌';
        return;
    }

    const container = document.getElementById('pokerContainer');
    const resultEl = document.getElementById('pokerResult');
    container.innerHTML = '';

    const cards = drawCards(count);
    cards.forEach(card => container.appendChild(createPokerCard(card)));

    pokerRound++;
    const cardTexts = cards.map(c => `${c.suit.symbol}${c.rank}`).join(' ');
    resultEl.innerHTML = `抽到 <strong style="color:#e94560;font-size:1.4rem">${count}</strong> 张牌，剩余牌堆: <strong>${remainingDeck.length}</strong> 张`;
    historyMgr.addPoker(cardTexts);
});

document.getElementById('resetPokerBtn').addEventListener('click', () => {
    initPoker();
    document.getElementById('pokerContainer').innerHTML = '';
    document.getElementById('pokerResult').innerHTML = `牌组已重置，共 <strong>52</strong> 张牌`;
});

initPoker();

// Player Presets
function loadPlayerPreset(count) {
    const names = [];
    const males = Math.ceil(count / 2);
    const females = count - males;
    for (let i = 1; i <= males; i++) names.push(`男${i}`);
    for (let i = 1; i <= females; i++) names.push(`女${i}`);
    const container = document.getElementById('playersList');
    container.innerHTML = names.map(n => `<input type="text" class="player-input" placeholder="${n}" value="${n}">`).join('');
    playerWheel.items = [...names];
    playerWheel.draw();
}

// Game Presets
function loadGamePreset(name) {
    const presets = {
        xiaojie: ['代酒牌','小姐牌','逛三园','照相机','免死金牌','摸鼻子','逢七过','厕所牌','自己喝','神经病','左边喝','右边喝','自己喝规定下一位'],
        shaoye: ['蒙眼喝','少爷牌','三字经','撕纸巾','从来没有','猜拳抓单','如胶似漆（数字抱团）','拨号（写数盲猜）','嘟嘟传牌','定规不能说','男生喝','女生喝','自己喝规定下一位'],
        shangk: ['升国旗','吃包子','撕纸巾','高尔夫','乌鸦喝水','水果拼盘','高三流水','七星瓢虫','穿越火线','飞檐走壁','天龙八部','小桥流水','吸星大法','洗面奶','洗衣机','雾里看花','穿针引线','遛鸟','草船借箭','小马过河','挂窗帘','灭火器','小兵过草地','唐伯虎点秋香']
    };
    const items = presets[name];
    if (!items) return;
    const container = document.getElementById('gamesList');
    container.innerHTML = items.map(item => `<input type="text" class="player-input" placeholder="${item}" value="${item}">`).join('');
    gameWheel.items = [...items];
    gameWheel.draw();
}
