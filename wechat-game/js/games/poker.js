import BaseScene from './base';
import Layout from '../utils/layout';
import History from '../history';

const SUITS = [
  { name: 'spades', symbol: '♠', color: '#2c3e50' },
  { name: 'hearts', symbol: '♥', color: '#e74c3c' },
  { name: 'clubs', symbol: '♣', color: '#2c3e50' },
  { name: 'diamonds', symbol: '♦', color: '#e74c3c' }
];
const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

export default class PokerScene extends BaseScene {
  constructor(ctx) {
    super(ctx);
    this.count = 1;
    this.drawnCards = [];
    this.remaining = 52;
    this.initDeck();

    this.btnDraw = {
      x: Layout.px(20), y: Layout.px(100), w: Layout.width / 2 - Layout.px(30), h: Layout.px(40),
      text: '抽牌', fontSize: 15,
      onTouchEnd: () => this.drawCards()
    };
    this.btnReset = {
      x: Layout.width / 2 + Layout.px(10), y: Layout.px(100), w: Layout.width / 2 - Layout.px(30), h: Layout.px(40),
      text: '重置牌组', fontSize: 15,
      onTouchEnd: () => this.initDeck()
    };
    this.btnCount = {
      x: Layout.px(20), y: Layout.px(68), w: Layout.width - Layout.px(40), h: Layout.px(30),
      text: '设置抽取张数', fontSize: 11,
      onTouchEnd: () => this.setCount()
    };
    this.elements.push(this.btnDraw, this.btnReset, this.btnCount);
  }

  initDeck() {
    this.deck = [];
    for (const suit of SUITS) {
      for (const rank of RANKS) {
        this.deck.push({ suit, rank });
      }
    }
    this.shuffle();
    this.drawnCards = [];
    this.remaining = 52;
  }

  shuffle() {
    for (let i = this.deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
    }
  }

  setCount() {
    wx.showModal({
      title: '抽取张数 (1-10)',
      content: String(this.count),
      editable: true,
      success: (res) => {
        if (res.confirm) {
          const n = parseInt(res.content) || 1;
          this.count = Math.max(1, Math.min(10, n));
        }
      }
    });
  }

  drawCards() {
    if (this.count > 10) return;
    if (this.deck.length < this.count) {
      this.initDeck();
    }
    this.drawnCards = this.deck.splice(0, this.count);
    this.remaining = this.deck.length;
    const text = this.drawnCards.map(c => `${c.suit.symbol}${c.rank}`).join(' ');
    History.addPoker(text);
  }

  render(ctx) {
    super.render(ctx);
    this.drawTitle(ctx, '🃏 抽扑克', this.navHeight + Layout.px(8));

    ctx.fillStyle = '#aaa';
    ctx.font = `${Layout.fontSize(13)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText(`抽取: ${this.count}张  剩余: ${this.remaining}张`, Layout.width / 2, this.navHeight + Layout.px(36));

    this.drawButton(ctx, this.btnCount, 'rgba(255,255,255,0.1)', '#fff');
    this.drawButton(ctx, this.btnDraw, '#e94560', '#fff');
    this.drawButton(ctx, this.btnReset, 'rgba(255,255,255,0.15)', '#fff');

    // Draw cards
    const cardW = Layout.px(44);
    const cardH = Layout.px(62);
    const gap = Layout.px(6);
    const startX = Math.max(Layout.px(10), (Layout.width - (this.drawnCards.length * cardW + (this.drawnCards.length - 1) * gap)) / 2);
    const cy = Layout.px(170);

    this.drawnCards.forEach((card, i) => {
      const cx = startX + i * (cardW + gap);
      this.drawCard(ctx, card, cx, cy, cardW, cardH);
    });

    History.render(ctx, Layout.px(16), Layout.px(270), Layout.width - Layout.px(32), History.getPoker());
  }

  drawCard(ctx, card, x, y, w, h) {
    ctx.fillStyle = '#fff';
    this.roundRect(ctx, x, y, w, h, Layout.px(6));
    ctx.fill();
    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = card.suit.color;
    ctx.font = `bold ${Layout.fontSize(11)}px sans-serif`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(card.rank, x + Layout.px(4), y + Layout.px(4));
    ctx.fillText(card.suit.symbol, x + Layout.px(4), y + Layout.px(16));

    ctx.font = `${Layout.fontSize(20)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(card.suit.symbol, x + w / 2, y + h / 2);

    ctx.font = `bold ${Layout.fontSize(11)}px sans-serif`;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'bottom';
    ctx.save();
    ctx.translate(x + w - Layout.px(4), y + h - Layout.px(4));
    ctx.rotate(Math.PI);
    ctx.fillText(card.rank, 0, 0);
    ctx.fillText(card.suit.symbol, 0, Layout.px(12));
    ctx.restore();
  }
}
