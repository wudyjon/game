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
        container.innerHTML = this.diceHistory.map((item, i) => `
            <div class="history-item">
                <span class="round">第${this.diceHistory.length - i}局</span>
                <span class="content">${item.text}</span>
                <span class="time">${item.time}</span>
            </div>
        `).reverse().join('') || '<div class="history-item"><span class="content">暂无记录</span></div>';
    }

    renderPoker() {
        const container = document.getElementById('pokerHistory');
        container.innerHTML = this.pokerHistory.map((item, i) => `
            <div class="history-item">
                <span class="round">第${this.pokerHistory.length - i}局</span>
                <span class="content">${item.text}</span>
                <span class="time">${item.time}</span>
            </div>
        `).reverse().join('') || '<div class="history-item"><span class="content">暂无记录</span></div>';
    }
}

const historyMgr = new HistoryManager(5);
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
    '你最近一次哭是什么时候？为什么？',
    '你暗恋过在座的哪位？',
    '你最尴尬的一次经历是什么？',
    '如果可以和在座的一位互换人生一天，你选谁？',
    '你做过最疯狂的事是什么？',
    '你最害怕失去什么？',
    '你有没有偷偷看过别人的手机？',
    '你最讨厌在座谁的什么习惯？',
    '你撒过最大的谎是什么？',
    '你最不想让人知道的一个秘密是什么？'
];

const dares = [
    '模仿一种动物的叫声，让其他人猜',
    '给通讯录第10个人发语音说"我想你了"',
    '做一个最丑的表情，保持10秒',
    '唱一首你最拿手的歌',
    '用屁股写自己的名字',
    '模仿在座的一个人，让其他人猜是谁',
    '大声说出"我是猪"三遍',
    '和左边的人喝交杯酒',
    '做一个俯卧撑',
    '给前任打电话说"我喝多了"'
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
    if (count > 10) {
        document.getElementById('pokerResult').innerHTML = '一次最多抽10张牌';
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
