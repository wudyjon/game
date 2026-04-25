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

    const contentTop = this.topOffset + Layout.px(55);

    this.countInput = {
      x: Layout.width - Layout.px(110), y: contentTop + Layout.px(4), w: Layout.px(90), h: Layout.px(30),
      onTouchEnd: () => this.activateCountInput()
    };
    this.btnRoll = {
      x: Layout.px(30), y: contentTop + Layout.px(44), w: Layout.width - Layout.px(60), h: Layout.px(44),
      text: '掷骰子', fontSize: 15,
      onTouchEnd: () => this.roll()
    };
    this.diceY = this.btnRoll.y + this.btnRoll.h + Layout.px(30);
    this.elements.push(this.btnRoll, this.countInput);
    this.countInputActive = false;
    this.countInputValue = '';
  }

  activateCountInput() {
    this.countInputActive = true;
    this.countInputValue = String(this.count);
    wx.showKeyboard({
      defaultValue: this.countInputValue,
      maxLength: 2,
      multiple: false,
      confirmHold: true,
      confirmType: 'done'
    });
  }

  setCountFromInput() {
    const n = parseInt(this.countInputValue) || 1;
    this.count = Math.max(1, Math.min(20, n));
  }

  onKeyboardInput(value) {
    if (this.countInputActive) {
      this.countInputValue = value;
    } else {
      super.onKeyboardInput(value);
    }
  }

  onKeyboardConfirm(value) {
    if (this.countInputActive) {
      this.countInputValue = value;
      this.countInputActive = false;
      this.setCountFromInput();
      wx.hideKeyboard();
    } else {
      super.onKeyboardConfirm(value);
    }
  }

  onKeyboardComplete() {
    if (this.countInputActive) {
      this.countInputActive = false;
      this.setCountFromInput();
      wx.hideKeyboard();
    } else {
      super.onKeyboardComplete();
    }
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

    this.drawTitle(ctx, '🎲 掷骰子', this.topOffset + Layout.px(28));

    const contentTop = this.topOffset + Layout.px(55);
    const diceSize = Layout.px(48);

    ctx.fillStyle = '#aaa';
    ctx.font = `${Layout.fontSize(13)}px sans-serif`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(`当前数量: ${this.count}`, Layout.px(30), contentTop + Layout.px(24));

    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    this.roundRect(ctx, this.countInput.x, this.countInput.y, this.countInput.w, this.countInput.h, Layout.px(6));
    ctx.fill();
    ctx.strokeStyle = this.countInputActive ? '#e94560' : 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = '#fff';
    ctx.font = `${Layout.fontSize(12)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${this.count}颗`, this.countInput.x + this.countInput.w / 2, this.countInput.y + this.countInput.h / 2);

    this.drawButton(ctx, this.btnRoll, '#e94560', '#fff');

    const gap = Layout.px(8);
    const perRow = 5;
    this.diceValues.forEach((val, i) => {
      const row = Math.floor(i / perRow);
      const col = i % perRow;
      const rowCount = Math.min(this.diceValues.length - row * perRow, perRow);
      const startX = (Layout.width - rowCount * diceSize - (rowCount - 1) * gap) / 2;
      const dx = startX + col * (diceSize + gap);
      const dy = this.diceY + row * (diceSize + gap);
      this.drawDice(ctx, val, dx, dy, diceSize);
    });

    const rows = Math.ceil(this.diceValues.length / perRow);
    const totalDiceH = rows * diceSize + (rows - 1) * gap;

    if (this.total > 0 && !this.animating) {
      ctx.fillStyle = '#e94560';
      ctx.font = `bold ${Layout.fontSize(22)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'alphabetic';
      ctx.fillText(`总和: ${this.total}`, Layout.width / 2, this.diceY + totalDiceH + Layout.px(24));
    }

    const historyY = Math.max(this.diceY + totalDiceH + Layout.px(50), Layout.height - Layout.px(160));
    History.render(ctx, Layout.px(16), historyY, Layout.width - Layout.px(32), History.getDice());
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
