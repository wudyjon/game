import BaseScene from './base';
import Layout from '../utils/layout';

export default class MenuScene extends BaseScene {
  constructor(ctx) {
    super(ctx);
    this.cards = [];
    this.buildCards();
    this.randomAnimating = false;
    this.randomText = '';
    this.randomSub = '';
  }

  buildCards() {
    const games = [
      { icon: '🎯', name: '幸运转盘', desc: '双转盘选玩家+游戏', scene: 'wheel' },
      { icon: '💣', name: '数字炸弹', desc: '猜数字，猜中喝酒', scene: 'bomb' },
      { icon: '🎭', name: '真心话大冒险', desc: '随机抽取题目', scene: 'truth' },
      { icon: '🎲', name: '掷骰子', desc: '比大小定胜负', scene: 'dice' },
      { icon: '🃏', name: '抽扑克', desc: '随机抽牌，不重复', scene: 'poker' },
    ];
    const cols = 2;
    const margin = Layout.px(16);
    const gap = Layout.px(12);
    const cardW = (Layout.width - margin * 2 - gap) / cols;
    const cardH = Layout.px(84);

    const panelY = this.topOffset + Layout.px(8);
    const panelH = Layout.px(145);
    const startY = panelY + panelH + Layout.px(20);

    games.forEach((g, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      this.cards.push({
        x: margin + col * (cardW + gap),
        y: startY + row * (cardH + gap),
        w: cardW,
        h: cardH,
        ...g
      });
    });

    this.randomBtn = {
      x: Layout.px(40),
      y: panelY + Layout.px(44),
      w: Layout.width - Layout.px(80),
      h: Layout.px(36),
      text: '随机选择游戏',
      fontSize: 15,
      onTouchEnd: () => this.startRandom()
    };
    this.elements.push(this.randomBtn);

    this.cards.forEach(c => {
      this.elements.push({
        x: c.x, y: c.y, w: c.w, h: c.h,
        onTouchEnd: () => wx.switchGameScene(c.scene)
      });
    });
  }

  startRandom() {
    if (this.randomAnimating) return;
    this.randomAnimating = true;
    const games = ['幸运转盘', '数字炸弹', '真心话大冒险', '掷骰子', '抽扑克'];
    const scenes = { '幸运转盘': 'wheel', '数字炸弹': 'bomb', '真心话大冒险': 'truth', '掷骰子': 'dice', '抽扑克': 'poker' };
    let count = 0;
    const interval = setInterval(() => {
      this.randomText = games[count % games.length];
      count++;
      if (count > 15) {
        clearInterval(interval);
        this.randomAnimating = false;
        const chosen = games[Math.floor(Math.random() * games.length)];
        this.randomText = chosen;
        setTimeout(() => wx.switchGameScene(scenes[chosen]), 600);
      }
    }, 80);
  }

  render(ctx) {
    super.render(ctx);

    const panelY = this.topOffset + Layout.px(8);

    // Random picker panel
    this.drawPanel(ctx, Layout.px(16), panelY, Layout.width - Layout.px(32), Layout.px(110), 0.05);

    this.drawTitle(ctx, '🎲 不知道玩什么？', panelY + Layout.px(12));
    this.drawButton(ctx, this.randomBtn, 'linear-gradient(45deg, #e94560, #ff6b6b)', '#fff');

    if (this.randomText) {
      ctx.fillStyle = this.randomAnimating ? '#fff' : '#e94560';
      ctx.font = `${Layout.fontSize(this.randomAnimating ? 14 : 17)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'alphabetic';
      ctx.fillText(this.randomText, Layout.width / 2, this.randomBtn.y + this.randomBtn.h + Layout.px(20));
    }

    // Cards
    this.cards.forEach(c => {
      this.drawPanel(ctx, c.x, c.y, c.w, c.h, 0.05);

      ctx.fillStyle = '#f39422';
      ctx.font = `${Layout.fontSize(26)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(c.icon, c.x + c.w / 2, c.y + Layout.px(24));

      ctx.fillStyle = '#e94560';
      ctx.font = `bold ${Layout.fontSize(13)}px sans-serif`;
      ctx.textBaseline = 'alphabetic';
      ctx.fillText(c.name, c.x + c.w / 2, c.y + Layout.px(52));

      ctx.fillStyle = '#aaa';
      ctx.font = `${Layout.fontSize(10)}px sans-serif`;
      const maxDescWidth = c.w - Layout.px(8);
      const chars = c.desc.split('');
      let line = '';
      const lines = [];
      for (const ch of chars) {
        const test = line + ch;
        if (ctx.measureText(test).width > maxDescWidth && line) {
          lines.push(line);
          line = ch;
        } else {
          line = test;
        }
      }
      lines.push(line);
      lines.forEach((l, i) => {
        ctx.fillText(l, c.x + c.w / 2, c.y + Layout.px(70) + i * Layout.px(14));
      });
    });
  }
}
