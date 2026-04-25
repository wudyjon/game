import BaseScene from './base';
import Layout from '../utils/layout';

export default class BombScene extends BaseScene {
  constructor(ctx) {
    super(ctx);
    this.reset();
    this.range = 100;

    const contentTop = this.topOffset + Layout.px(64);

    this.btnStart = {
      x: Layout.width / 2 + Layout.px(10), y: contentTop + Layout.px(10), w: Layout.width / 2 - Layout.px(30), h: Layout.px(40),
      text: '开始游戏', fontSize: 15,
      onTouchEnd: () => this.startGame()
    };
    this.panelY = contentTop;
    this.guessInput = {
      x: Layout.px(20), y: contentTop + Layout.px(160), w: Layout.width / 2 - Layout.px(40), h: Layout.px(44),
      onTouchEnd: () => this.activateGuessInput()
    };
    this.btnGuess = {
      x: Layout.width / 2 + Layout.px(10), y: contentTop + Layout.px(160), w: Layout.width / 2 - Layout.px(30), h: Layout.px(44),
      text: '猜!', fontSize: 15,
      onTouchEnd: () => this.doGuess()
    };
    this.btnReset = {
      x: Layout.px(80), y: contentTop + Layout.px(230), w: Layout.width - Layout.px(160), h: Layout.px(40),
      text: '再玩一次', fontSize: 13,
      onTouchEnd: () => this.reset()
    };
    this.elements.push(this.btnStart, this.guessInput, this.btnGuess, this.btnReset);
    this.guessInputValue = '';
    this.guessInputActive = false;
  }

  reset() {
    this.playing = false;
    this.bombNumber = 0;
    this.minVal = 1;
    this.maxVal = 100;
    this.resultText = '';
    this.guessInputValue = '';
    this.guessInputActive = false;
  }

  startGame() {
    this.showInput('设置数字范围', String(this.range), 'number', (val) => {
      const n = parseInt(val) || 100;
      this.range = Math.max(10, Math.min(1000, n));
      this.bombNumber = Math.floor(Math.random() * this.range) + 1;
      this.minVal = 1;
      this.maxVal = this.range;
      this.playing = true;
      this.resultText = '';
      this.guessInputValue = '';
    });
  }

  activateGuessInput() {
    if (!this.playing) return;
    this.guessInputActive = true;
    this.guessInputValue = '';
    wx.showKeyboard({
      defaultValue: '',
      maxLength: String(this.maxVal).length,
      multiple: false,
      confirmHold: true,
      confirmType: 'done'
    });
  }

  doGuess() {
    if (!this.playing) return;
    const guess = parseInt(this.guessInputValue);
    if (!guess || guess < this.minVal || guess > this.maxVal) {
      this.resultText = `请输入 ${this.minVal} 到 ${this.maxVal} 之间的数字！`;
      return;
    }
    if (guess === this.bombNumber) {
      this.resultText = `💥 BOMB! 数字就是 ${this.bombNumber}！喝酒！`;
      this.playing = false;
    } else if (guess < this.bombNumber) {
      this.minVal = guess + 1;
      this.resultText = `太小了！范围: ${this.minVal} - ${this.maxVal}`;
    } else {
      this.maxVal = guess - 1;
      this.resultText = `太大了！范围: ${this.minVal} - ${this.maxVal}`;
    }
    this.guessInputValue = '';
  }

  onKeyboardInput(value) {
    if (this.guessInputActive) {
      this.guessInputValue = value;
    } else {
      super.onKeyboardInput(value);
    }
  }

  onKeyboardConfirm(value) {
    if (this.guessInputActive) {
      this.guessInputValue = value;
      this.guessInputActive = false;
      wx.hideKeyboard();
    } else {
      super.onKeyboardConfirm(value);
    }
  }

  onKeyboardComplete() {
    if (this.guessInputActive) {
      this.guessInputActive = false;
      wx.hideKeyboard();
    } else {
      super.onKeyboardComplete();
    }
  }

  render(ctx) {
    super.render(ctx);
    this.drawTitle(ctx, '💣 数字炸弹', this.topOffset + Layout.px(28));

    if (!this.playing) {
      ctx.fillStyle = '#aaa';
      ctx.font = `${Layout.fontSize(14)}px sans-serif`;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';
      ctx.fillText(`数字范围: 1 - ${this.range}`, Layout.px(30), this.btnStart.y - Layout.px(14));
      this.drawButton(ctx, this.btnStart, '#e94560', '#fff');
    } else {
      const panelX = Layout.px(20);
      const panelW = Layout.width - Layout.px(40);
      const panelH = Layout.px(150);
      this.drawPanel(ctx, panelX, this.panelY, panelW, panelH, 0.08);

      ctx.fillStyle = '#fff';
      ctx.font = `${Layout.fontSize(14)}px sans-serif`;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';
      ctx.fillText(`范围: ${this.minVal} - ${this.maxVal}`, panelX + Layout.px(16), this.panelY + Layout.px(32));

      ctx.fillStyle = '#e94560';
      ctx.font = `bold ${Layout.fontSize(14)}px sans-serif`;
      ctx.textAlign = 'right';
      ctx.fillText(`剩余: ${this.maxVal - this.minVal + 1}`, panelX + panelW - Layout.px(16), this.panelY + Layout.px(32));

      ctx.fillStyle = '#fff';
      ctx.font = `${Layout.fontSize(48)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('💣', Layout.width / 2, this.panelY + panelH / 2 + Layout.px(6));

      ctx.fillStyle = 'rgba(255,255,255,0.08)';
      this.roundRect(ctx, this.guessInput.x, this.guessInput.y, this.guessInput.w, this.guessInput.h, Layout.px(8));
      ctx.fill();
      ctx.strokeStyle = this.guessInputActive ? '#e94560' : 'rgba(255,255,255,0.2)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = this.guessInputValue ? '#fff' : 'rgba(255,255,255,0.4)';
      ctx.font = `${Layout.fontSize(16)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(this.guessInputValue || '输入数字', this.guessInput.x + this.guessInput.w / 2, this.guessInput.y + this.guessInput.h / 2);

      this.drawButton(ctx, this.btnGuess, '#e94560', '#fff');
    }

    if (this.resultText) {
      ctx.fillStyle = this.resultText.includes('BOMB') ? '#e94560' : '#fff';
      ctx.font = `${Layout.fontSize(this.resultText.includes('BOMB') ? 18 : 14)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'alphabetic';
      const resultY = this.playing
        ? this.btnGuess.y + this.btnGuess.h + Layout.px(24)
        : this.btnReset.y - Layout.px(14);
      ctx.fillText(this.resultText, Layout.width / 2, resultY);
      if (!this.playing) {
        this.drawButton(ctx, this.btnReset, 'rgba(255,255,255,0.15)', '#fff');
      }
    }
  }
}
