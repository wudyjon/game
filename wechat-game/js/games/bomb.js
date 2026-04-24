import BaseScene from './base';
import Layout from '../utils/layout';

export default class BombScene extends BaseScene {
  constructor(ctx) {
    super(ctx);
    this.reset();
    this.range = 100;
    this.btnStart = {
      x: Layout.px(40), y: Layout.px(160), w: Layout.width - Layout.px(80), h: Layout.px(44),
      text: '开始游戏', fontSize: 16,
      onTouchEnd: () => this.startGame()
    };
    this.btnGuess = {
      x: Layout.px(80), y: Layout.px(340), w: Layout.width - Layout.px(160), h: Layout.px(44),
      text: '猜!', fontSize: 16,
      onTouchEnd: () => this.doGuess()
    };
    this.btnReset = {
      x: Layout.px(80), y: Layout.px(400), w: Layout.width - Layout.px(160), h: Layout.px(40),
      text: '再玩一次', fontSize: 14,
      onTouchEnd: () => this.reset()
    };
    this.elements.push(this.btnStart, this.btnGuess, this.btnReset);
  }

  reset() {
    this.playing = false;
    this.bombNumber = 0;
    this.minVal = 1;
    this.maxVal = 100;
    this.resultText = '';
    this.inputNumber = '';
  }

  startGame() {
    wx.showModal({
      title: '设置范围',
      content: String(this.range),
      editable: true,
      success: (res) => {
        if (res.confirm) {
          const n = parseInt(res.content) || 100;
          this.range = Math.max(10, Math.min(1000, n));
          this.bombNumber = Math.floor(Math.random() * this.range) + 1;
          this.minVal = 1;
          this.maxVal = this.range;
          this.playing = true;
          this.resultText = '';
          this.inputNumber = '';
        }
      }
    });
  }

  doGuess() {
    if (!this.playing) return;
    wx.showModal({
      title: `输入 ${this.minVal}-${this.maxVal} 之间的数字`,
      content: '',
      editable: true,
      success: (res) => {
        if (!res.confirm) return;
        const guess = parseInt(res.content);
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
      }
    });
  }

  render(ctx) {
    super.render(ctx);
    this.drawTitle(ctx, '💣 数字炸弹', this.navHeight + Layout.px(12));

    if (!this.playing) {
      this.drawSubtitle(ctx, `数字范围: 1 - ${this.range}`, this.navHeight + Layout.px(44));
      this.drawButton(ctx, this.btnStart, '#e94560', '#fff');
    } else {
      this.drawPanel(ctx, Layout.px(20), Layout.px(130), Layout.width - Layout.px(40), Layout.px(160), 0.05);
      ctx.fillStyle = '#fff';
      ctx.font = `${Layout.fontSize(16)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(`当前范围: ${this.minVal} - ${this.maxVal}`, Layout.width / 2, Layout.px(160));
      ctx.fillStyle = '#e94560';
      ctx.font = `bold ${Layout.fontSize(20)}px sans-serif`;
      ctx.fillText(`剩余安全数字: ${this.maxVal - this.minVal + 1}`, Layout.width / 2, Layout.px(190));

      ctx.font = `${Layout.fontSize(40)}px sans-serif`;
      ctx.fillText('💣', Layout.width / 2, Layout.px(230));

      this.drawButton(ctx, this.btnGuess, '#e94560', '#fff');
    }

    if (this.resultText) {
      ctx.fillStyle = this.resultText.includes('BOMB') ? '#e94560' : '#fff';
      ctx.font = `${Layout.fontSize(this.resultText.includes('BOMB') ? 18 : 14)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(this.resultText, Layout.width / 2, Layout.px(400));
      if (!this.playing) {
        this.drawButton(ctx, this.btnReset, 'rgba(255,255,255,0.15)', '#fff');
      }
    }
  }
}
