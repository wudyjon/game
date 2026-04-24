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
        { name: '幸运转盘', icon: '🎯', desc: '转盘选择幸运儿' },
        { name: '数字炸弹', icon: '💣', desc: '猜数字，猜中喝酒' },
        { name: '真心话大冒险', icon: '🎭', desc: '随机抽取题目' },
        { name: '掷骰子', icon: '🎲', desc: '比大小定胜负' }
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
            result.innerHTML = `${chosen.icon} <strong style="color:#e94560;font-size:1.5rem">${chosen.name}</strong><br><small>${chosen.desc}</small><br><button onclick="showSection('${chosen.name === '幸运转盘' ? 'wheel' : chosen.name === '数字炸弹' ? 'bomb' : chosen.name === '真心话大冒险' ? 'truth' : 'dice'}')" class="btn-secondary" style="margin-top:10px">开始玩</button>`;
        }
    }, 80);
});

// Wheel Game
const canvas = document.getElementById('wheelCanvas');
const ctx = canvas.getContext('2d');
let players = ['玩家1', '玩家2', '玩家3'];
let currentAngle = 0;
let spinning = false;

function drawWheel() {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 180;
    const sliceAngle = (2 * Math.PI) / players.length;
    const colors = ['#e94560', '#0f3460', '#533483', '#f39422', '#16c79a', '#ef476f', '#118ab2', '#073b4c'];

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < players.length; i++) {
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, currentAngle + i * sliceAngle, currentAngle + (i + 1) * sliceAngle);
        ctx.fillStyle = colors[i % colors.length];
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(currentAngle + i * sliceAngle + sliceAngle / 2);
        ctx.textAlign = 'right';
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 16px sans-serif';
        ctx.fillText(players[i], radius - 20, 5);
        ctx.restore();
    }

    ctx.beginPath();
    ctx.arc(centerX, centerY, 30, 0, 2 * Math.PI);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.strokeStyle = '#e94560';
    ctx.lineWidth = 3;
    ctx.stroke();
}

drawWheel();

document.getElementById('spinBtn').addEventListener('click', () => {
    if (spinning) return;
    spinning = true;
    const result = document.getElementById('wheelResult');
    result.innerHTML = '';

    let velocity = Math.random() * 10 + 20;
    const deceleration = 0.2;

    function animate() {
        currentAngle += velocity * 0.05;
        velocity -= deceleration;
        drawWheel();

        if (velocity > 0) {
            requestAnimationFrame(animate);
        } else {
            spinning = false;
            const sliceAngle = (2 * Math.PI) / players.length;
            const normalizedAngle = ((2 * Math.PI) - (currentAngle % (2 * Math.PI)) + Math.PI / 2) % (2 * Math.PI);
            const winnerIndex = Math.floor(normalizedAngle / sliceAngle) % players.length;
            const winner = players[winnerIndex];
            result.innerHTML = `🎉 恭喜 <strong style="color:#e94560;font-size:1.5rem">${winner}</strong> 被选中！`;
        }
    }
    animate();
});

document.getElementById('addPlayerBtn').addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'player-input';
    input.placeholder = `玩家${players.length + 1}`;
    input.value = `玩家${players.length + 1}`;
    document.getElementById('playersList').appendChild(input);
    updatePlayers();
});

document.getElementById('resetPlayersBtn').addEventListener('click', () => {
    document.getElementById('playersList').innerHTML = `
        <input type="text" class="player-input" placeholder="玩家1" value="玩家1">
        <input type="text" class="player-input" placeholder="玩家2" value="玩家2">
        <input type="text" class="player-input" placeholder="玩家3" value="玩家3">
    `;
    updatePlayers();
});

document.getElementById('playersList').addEventListener('input', updatePlayers);

function updatePlayers() {
    const inputs = document.querySelectorAll('.player-input');
    players = Array.from(inputs).map(i => i.value || i.placeholder);
    drawWheel();
}

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
document.getElementById('rollDiceBtn').addEventListener('click', () => {
    const count = parseInt(document.getElementById('diceCount').value) || 1;
    const container = document.getElementById('diceContainer');
    const totalEl = document.getElementById('diceTotal');
    container.innerHTML = '';

    let total = 0;
    for (let i = 0; i < count; i++) {
        const value = Math.floor(Math.random() * 6) + 1;
        total += value;
        container.appendChild(createDice(value));
    }

    totalEl.innerHTML = `总和: <strong style="color:#e94560;font-size:2rem">${total}</strong>`;
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
