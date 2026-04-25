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

    const contentTop = this.topOffset + Layout.px(55);

    this.countInput = {
      x: Layout.width - Layout.px(120), y: contentTop + Layout.px(4), w: Layout.px(100), h: Layout.px(30),
      onTouchEnd: () => this.activateCountInput()
    };
    this.btnDraw = {
      x: Layout.px(20), y: contentTop + Layout.px(44), w: Layout.width / 2 - Layout.px(30), h: Layout.px(44),
      text: '抽牌', fontSize: 15,
      onTouchEnd: () => this.drawCards()
    };
    this.btnReset = {
      x: Layout.width / 2 + Layout.px(10), y: contentTop + Layout.px(44), w: Layout.width / 2 - Layout.px(30), h: Layout.px(44),
      text: '重置牌组', fontSize: 15,
      onTouchEnd: () => this.initDeck()
    };
    this.elements.push(this.btnDraw, this.btnReset, this.countInput);
    this.countInputActive = false;
    this.countInputValue = '';
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

  drawCards() {
    if (this.count > 20) return;
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
    this.drawTitle(ctx, '🃏 抽扑克', this.topOffset + Layout.px(28));

    const contentTop = this.topOffset + Layout.px(55);
    ctx.fillStyle = '#aaa';
    ctx.font = `${Layout.fontSize(13)}px sans-serif`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(`抽取: ${this.count}张  剩余: ${this.remaining}张`, Layout.px(20), contentTop + Layout.px(24));

    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    this.roundRect(ctx, this.countInput.x, this.countInput.y, this.countInput.w, this.countInput.h, Layout.px(6));
    ctx.fill();
    ctx.strokeStyle = this.countInputActive ? '#e94560' : 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = '#fff';
    ctx.font = `${Layout.fontSize(11)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${this.count}张`, this.countInput.x + this.countInput.w / 2, this.countInput.y + this.countInput.h / 2);

    this.drawButton(ctx, this.btnDraw, '#e94560', '#fff');
    this.drawButton(ctx, this.btnReset, 'rgba(255,255,255,0.15)', '#fff');

    // Draw cards
    const cardW = Layout.px(42);
    const cardH = Layout.px(60);
    const gap = Layout.px(6);
    const perRow = Math.floor((Layout.width - Layout.px(20)) / (cardW + gap));
    const cardY = this.btnDraw.y + this.btnDraw.h + Layout.px(30);

    this.drawnCards.forEach((card, i) => {
      const row = Math.floor(i / perRow);
      const col = i % perRow;
      const rowCount = Math.min(this.drawnCards.length - row * perRow, perRow);
      const startX = (Layout.width - rowCount * cardW - (rowCount - 1) * gap) / 2;
      const cx = startX + col * (cardW + gap);
      const cy = cardY + row * (cardH + gap);
      this.drawCard(ctx, card, cx, cy, cardW, cardH);
    });

    const rows = Math.ceil(this.drawnCards.length / perRow);
    const totalCardH = rows * cardH + (rows - 1) * gap;
    const historyY = Math.max(cardY + totalCardH + Layout.px(40), Layout.height - Layout.px(160));
    History.render(ctx, Layout.px(16), historyY, Layout.width - Layout.px(32), History.getPoker());
  }

  drawCard(ctx, card, x, y, w, h) {
    ctx.fillStyle = '#fff';
    this.roundRect(ctx, x, y, w, h, Layout.px(6));
    ctx.fill();
    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = card.suit.color;
    ctx.font = `bold ${Layout.fontSize(12)}px sans-serif`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(card.rank, x + Layout.px(4), y + Layout.px(4));
    ctx.fillText(card.suit.symbol, x + Layout.px(4), y + Layout.px(18));

    ctx.font = `${Layout.fontSize(22)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(card.suit.symbol, x + w / 2, y + h / 2);

    ctx.font = `bold ${Layout.fontSize(12)}px sans-serif`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.save();
    ctx.translate(x + w - Layout.px(4), y + h - Layout.px(4));
    ctx.rotate(Math.PI);
    ctx.fillText(card.rank, 0, 0);
    ctx.fillText(card.suit.symbol, 0, Layout.px(14));
    ctx.restore();
  }
}
