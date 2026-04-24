import BaseScene from './base';
import Layout from '../utils/layout';
import History from '../history';

export default class DiceScene extends BaseScene {
  constructor(ctx) {
    super(ctx);
    this.count = 1;
    this.diceValues = [];
    this.total = 0;
    this.animating = false;
    this.animFrame = 0;

    this.btnRoll = {
      x: Layout.px(30), y: Layout.px(120), w: Layout.width - Layout.px(60), h: Layout.px(44),
      text: '掷骰子', fontSize: 16,
      onTouchEnd: () => this.roll()
    };
    this.btnCount = {
      x: Layout.px(30), y: Layout.px(80), w: Layout.width - Layout.px(60), h: Layout.px(32),
      text: '设置骰子数量', fontSize: 12,
      onTouchEnd: () => this.setCount()
    };
    this.elements.push(this.btnRoll, this.btnCount);
  }

  setCount() {
    wx.showModal({
      title: '骰子数量 (1-6)',
      content: String(this.count),
      editable: true,
      success: (res) => {
        if (res.confirm) {
          const n = parseInt(res.content) || 1;
          this.count = Math.max(1, Math.min(6, n));
        }
      }
    });
  }

  roll() {
    if (this.animating) return;
    this.animating = true;
    this.animFrame = 0;
    this.diceValues = [];
  }

  update(dt) {
    if (this.animating) {
      this.animFrame++;
      if (this.animFrame % 5 === 0) {
        this.diceValues = [];
        for (let i = 0; i < this.count; i++) {
          this.diceValues.push(Math.floor(Math.random() * 6) + 1);
        }
      }
      if (this.animFrame > 30) {
        this.animating = false;
        this.diceValues = [];
        this.total = 0;
        for (let i = 0; i < this.count; i++) {
          const v = Math.floor(Math.random() * 6) + 1;
          this.diceValues.push(v);
          this.total += v;
        }
        History.addDice(`掷出 ${this.count} 颗骰子 = ${this.total}`);
      }
    }
  }

  render(ctx) {
    super.render(ctx);
    this.drawTitle(ctx, '🎲 掷骰子', this.navHeight + Layout.px(8));

    ctx.fillStyle = '#aaa';
    ctx.font = `${Layout.fontSize(13)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText(`当前数量: ${this.count}`, Layout.width / 2, this.navHeight + Layout.px(36));

    this.drawButton(ctx, this.btnCount, 'rgba(255,255,255,0.1)', '#fff');
    this.drawButton(ctx, this.btnRoll, '#e94560', '#fff');

    // Draw dice
    const diceSize = Layout.px(50);
    const gap = Layout.px(12);
    const startX = (Layout.width - (this.diceValues.length * diceSize + (this.diceValues.length - 1) * gap)) / 2;
    this.diceValues.forEach((val, i) => {
      const dx = startX + i * (diceSize + gap);
      const dy = Layout.px(200);
      this.drawDice(ctx, val, dx, dy, diceSize);
    });

    if (this.total > 0 && !this.animating) {
      ctx.fillStyle = '#e94560';
      ctx.font = `bold ${Layout.fontSize(22)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(`总和: ${this.total}`, Layout.width / 2, Layout.px(290));
    }

    History.render(ctx, Layout.px(16), Layout.px(330), Layout.width - Layout.px(32), History.getDice());
  }

  drawDice(ctx, value, x, y, size) {
    ctx.fillStyle = '#fff';
    this.roundRect(ctx, x, y, size, size, Layout.px(8));
    ctx.fill();
    ctx.shadowColor = 'rgba(0,0,0,0.3)';
    ctx.shadowBlur = 5;
    ctx.stroke();
    ctx.shadowBlur = 0;

    const positions = {
      1: [[0,0,0],[0,1,0],[0,0,0]],
      2: [[0,0,1],[0,0,0],[1,0,0]],
      3: [[0,0,1],[0,1,0],[1,0,0]],
      4: [[1,0,1],[0,0,0],[1,0,1]],
      5: [[1,0,1],[0,1,0],[1,0,1]],
      6: [[1,0,1],[1,0,1],[1,0,1]]
    };
    const p = positions[value];
    const dotR = size * 0.09;
    const cell = size / 3;
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        if (p[r][c]) {
          ctx.beginPath();
          ctx.arc(x + cell * c + cell / 2, y + cell * r + cell / 2, dotR, 0, Math.PI * 2);
          ctx.fillStyle = '#333';
          ctx.fill();
        }
      }
    }
  }
}
