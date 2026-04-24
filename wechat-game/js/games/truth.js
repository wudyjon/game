import BaseScene from './base';
import Layout from '../utils/layout';

const TRUTHS = [
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

const DARES = [
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

export default class TruthScene extends BaseScene {
  constructor(ctx) {
    super(ctx);
    this.cardVisible = false;
    this.cardType = '';
    this.cardText = '';

    this.btnTruth = {
      x: Layout.px(30), y: Layout.px(100), w: Layout.width / 3 - Layout.px(20), h: Layout.px(40),
      text: '真心话', fontSize: 13,
      onTouchEnd: () => this.drawCard('truth')
    };
    this.btnDare = {
      x: Layout.width / 3 + Layout.px(10), y: Layout.px(100), w: Layout.width / 3 - Layout.px(20), h: Layout.px(40),
      text: '大冒险', fontSize: 13,
      onTouchEnd: () => this.drawCard('dare')
    };
    this.btnRandom = {
      x: Layout.width * 2 / 3 + Layout.px(10), y: Layout.px(100), w: Layout.width / 3 - Layout.px(40), h: Layout.px(40),
      text: '随机', fontSize: 13,
      onTouchEnd: () => this.drawCard(Math.random() > 0.5 ? 'truth' : 'dare')
    };
    this.btnNext = {
      x: Layout.px(60), y: Layout.px(380), w: Layout.width - Layout.px(120), h: Layout.px(36),
      text: '下一题', fontSize: 13,
      onTouchEnd: () => { this.cardVisible = false; }
    };
    this.elements.push(this.btnTruth, this.btnDare, this.btnRandom, this.btnNext);
  }

  drawCard(type) {
    this.cardType = type;
    this.cardText = type === 'truth'
      ? TRUTHS[Math.floor(Math.random() * TRUTHS.length)]
      : DARES[Math.floor(Math.random() * DARES.length)];
    this.cardVisible = true;
  }

  render(ctx) {
    super.render(ctx);
    this.drawTitle(ctx, '🎭 真心话大冒险', this.navHeight + Layout.px(12));

    this.drawButton(ctx, this.btnTruth, '#3498db', '#fff');
    this.drawButton(ctx, this.btnDare, '#e74c3c', '#fff');
    this.drawButton(ctx, this.btnRandom, '#e94560', '#fff');

    if (this.cardVisible) {
      const x = Layout.px(24);
      const y = Layout.px(160);
      const w = Layout.width - Layout.px(48);
      const h = Layout.px(200);
      this.drawPanel(ctx, x, y, w, h, 0.1);
      ctx.strokeStyle = 'rgba(255,255,255,0.2)';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = this.cardType === 'truth' ? '#3498db' : '#e74c3c';
      ctx.font = `bold ${Layout.fontSize(16)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(this.cardType === 'truth' ? '💙 真心话' : '❤️ 大冒险', Layout.width / 2, y + Layout.px(26));

      ctx.fillStyle = '#fff';
      ctx.font = `${Layout.fontSize(14)}px sans-serif`;
      const words = this.wrapText(ctx, this.cardText, w - Layout.px(40));
      let ty = y + Layout.px(58);
      words.forEach(line => {
        ctx.fillText(line, Layout.width / 2, ty);
        ty += Layout.px(22);
      });

      this.drawButton(ctx, this.btnNext, 'rgba(255,255,255,0.15)', '#fff');
    }
  }

  wrapText(ctx, text, maxWidth) {
    const chars = text.split('');
    const lines = [];
    let line = '';
    for (let i = 0; i < chars.length; i++) {
      const test = line + chars[i];
      if (ctx.measureText(test).width > maxWidth && line !== '') {
        lines.push(line);
        line = chars[i];
      } else {
        line = test;
      }
    }
    lines.push(line);
    return lines;
  }
}
