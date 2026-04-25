import Layout from '../utils/layout';

export default class BaseScene {
  constructor(ctx) {
    this.ctx = ctx;
    this.elements = [];
    this.navButtons = [];
    this.inputVisible = false;
    this.inputTitle = '';
    this.inputValue = '';
    this.inputType = 'text';
    this.inputConfirmCallback = null;
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
    const safeTop = Layout.safeTop || 0;
    this.navHeight = btnH;
    this.topOffset = safeTop + btnH + Layout.px(16);
    navItems.forEach((item, i) => {
      this.navButtons.push({
        x: i * btnW,
        y: safeTop,
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

  onLeave() {
    this.hideInput();
  }

  update(dt) {}

  render(ctx) {
    this.renderNav(ctx);
  }

  renderNav(ctx) {
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.fillRect(0, 0, Layout.width, this.topOffset);

    this.navButtons.forEach(btn => {
      if (btn.active) {
        ctx.fillStyle = '#e94560';
        this.roundRect(ctx, btn.x + 2, btn.y + 3, btn.w - 4, btn.h - 6, Layout.px(12));
        ctx.fill();
      }
      ctx.fillStyle = btn.active ? '#fff' : 'rgba(255,255,255,0.7)';

      let fontSize = Layout.fontSize(11);
      ctx.font = `${fontSize}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const text = btn.label;
      let textWidth = ctx.measureText(text).width;

      while (textWidth > btn.w - 6 && fontSize > 8) {
        fontSize -= 0.5;
        ctx.font = `${fontSize}px sans-serif`;
        textWidth = ctx.measureText(text).width;
      }

      if (textWidth > btn.w - 6) {
        const mid = Math.ceil(text.length / 2);
        const line1 = text.slice(0, mid);
        const line2 = text.slice(mid);
        ctx.fillText(line1, btn.x + btn.w / 2, btn.y + btn.h / 2 - fontSize / 2 - 1);
        ctx.fillText(line2, btn.x + btn.w / 2, btn.y + btn.h / 2 + fontSize / 2 + 1);
      } else {
        ctx.fillText(text, btn.x + btn.w / 2, btn.y + btn.h / 2);
      }
    });

    ctx.textBaseline = 'alphabetic';
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

  // ---- 内联输入框 ----

  showInput(title, defaultValue, type, callback) {
    this.inputVisible = true;
    this.inputTitle = title;
    this.inputValue = String(defaultValue);
    this.inputType = type;
    this.inputConfirmCallback = callback;
    wx.showKeyboard({
      defaultValue: this.inputValue,
      maxLength: type === 'number' ? 4 : 100,
      multiple: false,
      confirmHold: true,
      confirmType: 'done'
    });
  }

  hideInput() {
    this.inputVisible = false;
    wx.hideKeyboard();
  }

  onKeyboardInput(value) {
    if (!this.inputVisible) return;
    this.inputValue = value;
  }

  onKeyboardConfirm(value) {
    if (!this.inputVisible) return;
    this.inputValue = value;
    this.confirmInput();
  }

  onKeyboardComplete() {
    if (this.inputVisible) {
      this.hideInput();
    }
  }

  confirmInput() {
    if (this.inputConfirmCallback) {
      let value = this.inputValue;
      if (this.inputType === 'number') {
        value = parseInt(value) || 0;
      }
      this.inputConfirmCallback(value);
    }
    this.hideInput();
  }

  cancelInput() {
    this.hideInput();
  }

  renderInput(ctx) {
    if (!this.inputVisible) return;

    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(0, 0, Layout.width, Layout.height);

    const pw = Math.min(Layout.px(300), Layout.width - Layout.px(40));
    const ph = Layout.px(200);
    const px = (Layout.width - pw) / 2;
    const py = (Layout.height - ph) / 2;

    ctx.fillStyle = 'rgba(30,30,50,0.98)';
    this.roundRect(ctx, px, py, pw, ph, Layout.px(16));
    ctx.fill();

    ctx.fillStyle = '#fff';
    ctx.font = `bold ${Layout.fontSize(18)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(this.inputTitle, Layout.width / 2, py + Layout.px(48));

    const ix = px + Layout.px(24);
    const iy = py + Layout.px(80);
    const iw = pw - Layout.px(48);
    const ih = Layout.px(48);
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    this.roundRect(ctx, ix, iy, iw, ih, Layout.px(8));
    ctx.fill();
    ctx.strokeStyle = '#e94560';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#fff';
    ctx.font = `${Layout.fontSize(18)}px sans-serif`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.inputValue, ix + Layout.px(16), iy + ih / 2);

    const tw = ctx.measureText(this.inputValue).width;
    ctx.fillStyle = '#e94560';
    ctx.fillRect(ix + Layout.px(16) + tw, iy + Layout.px(12), 2, ih - Layout.px(24));

    const bw = (pw - Layout.px(64)) / 2;
    const bh = Layout.px(44);
    const by = py + ph - Layout.px(72);

    this.inputConfirmBtn = {
      x: px + Layout.px(24),
      y: by,
      w: bw,
      h: bh,
      text: '确认',
      fontSize: 15
    };
    this.inputCancelBtn = {
      x: px + Layout.px(40) + bw,
      y: by,
      w: bw,
      h: bh,
      text: '取消',
      fontSize: 15
    };

    this.drawButton(ctx, this.inputConfirmBtn, '#e94560', '#fff');
    this.drawButton(ctx, this.inputCancelBtn, 'rgba(255,255,255,0.15)', '#fff');
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
    if (this.inputVisible) {
      if (this.hitTest(x, y, this.inputConfirmBtn)) {
        this.confirmInput();
        return true;
      }
      if (this.hitTest(x, y, this.inputCancelBtn)) {
        this.cancelInput();
        return true;
      }
      return true;
    }
    for (const el of this.elements) {
      if (el.onTouchEnd && this.hitTest(x, y, el)) {
        if (el.onTouchEnd(x, y)) return true;
      }
    }
    return false;
  }
}
