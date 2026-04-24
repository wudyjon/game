import Layout from '../utils/layout';

export default class BaseScene {
  constructor(ctx) {
    this.ctx = ctx;
    this.elements = [];
    this.navButtons = [];
    this.buildNav();
  }

  buildNav() {
    const navItems = [
      { label: '主页', scene: 'menu' },
      { label: '转盘', scene: 'wheel' },
      { label: '炸弹', scene: 'bomb' },
      { label: '真心话', scene: 'truth' },
      { label: '骰子', scene: 'dice' },
      { label: '扑克', scene: 'poker' },
    ];
    const btnW = Layout.width / navItems.length;
    const btnH = Layout.px(36);
    this.navHeight = btnH;
    navItems.forEach((item, i) => {
      this.navButtons.push({
        x: i * btnW,
        y: 0,
        w: btnW,
        h: btnH,
        label: item.label,
        scene: item.scene,
        active: false
      });
    });
  }

  onEnter() {
    const name = this.constructor.name.toLowerCase().replace('scene', '');
    this.navButtons.forEach(b => b.active = (b.scene === name));
  }

  onLeave() {}

  update(dt) {}

  render(ctx) {
    this.renderNav(ctx);
  }

  renderNav(ctx) {
    const navY = 0;
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.fillRect(0, navY, Layout.width, this.navHeight);

    this.navButtons.forEach(btn => {
      if (btn.active) {
        ctx.fillStyle = '#e94560';
        this.roundRect(ctx, btn.x + 2, navY + 3, btn.w - 4, btn.h - 6, Layout.px(12));
        ctx.fill();
      }
      ctx.fillStyle = btn.active ? '#fff' : 'rgba(255,255,255,0.7)';
      ctx.font = `${Layout.fontSize(11)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(btn.label, btn.x + btn.w / 2, navY + btn.h / 2);
    });
  }

  roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.arcTo(x + w, y, x + w, y + r, r);
    ctx.lineTo(x + w, y + h - r);
    ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
    ctx.lineTo(x + r, y + h);
    ctx.arcTo(x, y + h, x, y + h - r, r);
    ctx.lineTo(x, y + r);
    ctx.arcTo(x, y, x + r, y, r);
    ctx.closePath();
  }

  drawButton(ctx, btn, bgColor, textColor) {
    if (typeof bgColor === 'string' && bgColor.includes('gradient')) {
      const grad = ctx.createLinearGradient(btn.x, btn.y, btn.x + btn.w, btn.y + btn.h);
      grad.addColorStop(0, '#e94560');
      grad.addColorStop(1, '#ff6b6b');
      ctx.fillStyle = grad;
    } else {
      ctx.fillStyle = bgColor;
    }
    this.roundRect(ctx, btn.x, btn.y, btn.w, btn.h, Layout.px(16));
    ctx.fill();
    ctx.fillStyle = textColor;
    ctx.font = `${Layout.fontSize(btn.fontSize || 16)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(btn.text, btn.x + btn.w / 2, btn.y + btn.h / 2);
  }

  drawPanel(ctx, x, y, w, h, alpha = 0.05) {
    ctx.fillStyle = `rgba(255,255,255,${alpha})`;
    this.roundRect(ctx, x, y, w, h, Layout.px(12));
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  drawTitle(ctx, text, y) {
    ctx.fillStyle = '#fff';
    ctx.font = `bold ${Layout.fontSize(18)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(text, Layout.width / 2, y);
  }

  drawSubtitle(ctx, text, y, color = '#aaa') {
    ctx.fillStyle = color;
    ctx.font = `${Layout.fontSize(12)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(text, Layout.width / 2, y);
  }

  hitTest(x, y, rect) {
    return x >= rect.x && x <= rect.x + rect.w && y >= rect.y && y <= rect.y + rect.h;
  }

  onTouchStart(x, y) {
    for (const btn of this.navButtons) {
      if (this.hitTest(x, y, btn)) {
        wx.switchGameScene(btn.scene);
        return true;
      }
    }
    for (const el of this.elements) {
      if (el.onTouchStart && this.hitTest(x, y, el)) {
        if (el.onTouchStart(x, y)) return true;
      }
    }
    return false;
  }

  onTouchEnd(x, y) {
    for (const el of this.elements) {
      if (el.onTouchEnd && this.hitTest(x, y, el)) {
        if (el.onTouchEnd(x, y)) return true;
      }
    }
    return false;
  }
}
