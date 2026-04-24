import BaseScene from './base';
import Layout from '../utils/layout';

class MiniWheel {
  constructor(x, y, radius, items, colors) {
    this.cx = x;
    this.cy = y;
    this.radius = radius;
    this.items = [...items];
    this.colors = colors;
    this.angle = 0;
    this.spinning = false;
    this.velocity = 0;
    this.result = '';
  }

  draw(ctx) {
    const slice = (Math.PI * 2) / this.items.length;
    for (let i = 0; i < this.items.length; i++) {
      ctx.beginPath();
      ctx.moveTo(this.cx, this.cy);
      ctx.arc(this.cx, this.cy, this.radius, this.angle + i * slice, this.angle + (i + 1) * slice);
      ctx.fillStyle = this.colors[i % this.colors.length];
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.save();
      ctx.translate(this.cx, this.cy);
      ctx.rotate(this.angle + i * slice + slice / 2);
      ctx.fillStyle = '#fff';
      ctx.font = `bold ${Math.max(10, this.radius * 0.18)}px sans-serif`;
      ctx.textAlign = 'right';
      ctx.fillText(this.items[i], this.radius - 10, 4);
      ctx.restore();
    }
    ctx.beginPath();
    ctx.arc(this.cx, this.cy, 18, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.strokeStyle = '#e94560';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  update(dt) {
    if (!this.spinning) return;
    this.angle += this.velocity * 0.05;
    this.velocity -= 0.18;
    if (this.velocity <= 0) {
      this.spinning = false;
      const slice = (Math.PI * 2) / this.items.length;
      const norm = ((Math.PI * 2) - (this.angle % (Math.PI * 2)) + Math.PI / 2) % (Math.PI * 2);
      const idx = Math.floor(norm / slice) % this.items.length;
      this.result = this.items[idx];
    }
  }

  spin() {
    if (this.spinning) return;
    this.spinning = true;
    this.velocity = Math.random() * 10 + 20;
    this.result = '';
  }
}

export default class WheelScene extends BaseScene {
  constructor(ctx) {
    super(ctx);
    this.colors = ['#e94560', '#0f3460', '#533483', '#f39422', '#16c79a', '#ef476f', '#118ab2', '#073b4c', '#e74c3c', '#27ae60'];
    this.playerItems = ['玩家1', '玩家2', '玩家3'];
    this.gameItems = ['喝1杯', '喝2杯', '真心话', '大冒险'];
    const r = Math.min(Layout.width / 2 - Layout.px(20), Layout.px(140));
    const cy = Layout.px(160);
    this.leftWheel = new MiniWheel(Layout.width * 0.25, cy, r, this.playerItems, this.colors);
    this.rightWheel = new MiniWheel(Layout.width * 0.75, cy, r, this.gameItems, this.colors);

    this.spinLeftBtn = {
      x: Layout.px(20), y: Layout.px(310), w: Layout.width / 2 - Layout.px(30), h: Layout.px(40),
      text: '转玩家', fontSize: 14,
      onTouchEnd: () => this.leftWheel.spin()
    };
    this.spinRightBtn = {
      x: Layout.width / 2 + Layout.px(10), y: Layout.px(310), w: Layout.width / 2 - Layout.px(30), h: Layout.px(40),
      text: '转游戏', fontSize: 14,
      onTouchEnd: () => this.rightWheel.spin()
    };
    this.editLeftBtn = {
      x: Layout.px(20), y: Layout.px(420), w: Layout.width / 2 - Layout.px(30), h: Layout.px(36),
      text: '编辑名单', fontSize: 12,
      onTouchEnd: () => this.editItems('player')
    };
    this.editRightBtn = {
      x: Layout.width / 2 + Layout.px(10), y: Layout.px(420), w: Layout.width / 2 - Layout.px(30), h: Layout.px(36),
      text: '编辑项目', fontSize: 12,
      onTouchEnd: () => this.editItems('game')
    };
    this.elements.push(this.spinLeftBtn, this.spinRightBtn, this.editLeftBtn, this.editRightBtn);
  }

  editItems(type) {
    const items = type === 'player' ? this.playerItems : this.gameItems;
    wx.showModal({
      title: type === 'player' ? '编辑玩家名单' : '编辑游戏项目',
      content: items.join(','),
      editable: true,
      success: (res) => {
        if (res.confirm && res.content) {
          const arr = res.content.split(/[,，]/).map(s => s.trim()).filter(s => s);
          if (arr.length > 0) {
            if (type === 'player') {
              this.playerItems = arr;
              this.leftWheel.items = arr;
            } else {
              this.gameItems = arr;
              this.rightWheel.items = arr;
            }
          }
        }
      }
    });
  }

  update(dt) {
    this.leftWheel.update(dt);
    this.rightWheel.update(dt);
  }

  render(ctx) {
    super.render(ctx);
    this.drawTitle(ctx, '🎯 幸运双转盘', this.navHeight + Layout.px(8));
    this.drawSubtitle(ctx, '左边选中谁，右边决定做什么', this.navHeight + Layout.px(36));

    // Pointer triangles
    ctx.fillStyle = '#e94560';
    ctx.beginPath();
    ctx.moveTo(this.leftWheel.cx - 8, this.leftWheel.cy - this.leftWheel.radius - 8);
    ctx.lineTo(this.leftWheel.cx + 8, this.leftWheel.cy - this.leftWheel.radius - 8);
    ctx.lineTo(this.leftWheel.cx, this.leftWheel.cy - this.leftWheel.radius + 6);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(this.rightWheel.cx - 8, this.rightWheel.cy - this.rightWheel.radius - 8);
    ctx.lineTo(this.rightWheel.cx + 8, this.rightWheel.cy - this.rightWheel.radius - 8);
    ctx.lineTo(this.rightWheel.cx, this.rightWheel.cy - this.rightWheel.radius + 6);
    ctx.fill();

    this.leftWheel.draw(ctx);
    this.rightWheel.draw(ctx);

    this.drawButton(ctx, this.spinLeftBtn, '#e94560', '#fff');
    this.drawButton(ctx, this.spinRightBtn, '#e94560', '#fff');

    if (this.leftWheel.result) {
      ctx.fillStyle = '#e94560';
      ctx.font = `bold ${Layout.fontSize(16)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText('🎉 ' + this.leftWheel.result, Layout.width * 0.25, Layout.px(370));
    }
    if (this.rightWheel.result) {
      ctx.fillStyle = '#e94560';
      ctx.font = `bold ${Layout.fontSize(16)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText('🎉 ' + this.rightWheel.result, Layout.width * 0.75, Layout.px(370));
    }

    this.drawPanel(ctx, Layout.px(16), Layout.px(400), Layout.width - Layout.px(32), Layout.px(70), 0.03);
    this.drawButton(ctx, this.editLeftBtn, 'rgba(255,255,255,0.15)', '#fff');
    this.drawButton(ctx, this.editRightBtn, 'rgba(255,255,255,0.15)', '#fff');
  }
}
