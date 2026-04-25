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
      const fontSize = Math.max(7, Math.min(this.radius * 0.18, this.radius * 0.5 / Math.sqrt(this.items.length)));
      ctx.font = `bold ${fontSize}px sans-serif`;
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      const displayText = this.items[i].length > 2 ? this.items[i].slice(0, 2) : this.items[i];
      ctx.fillText(displayText, this.radius * 0.82, 0);
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
    const r = Math.min(Layout.width / 2 - Layout.px(30), Layout.px(68));
    const cy = this.topOffset + Layout.px(93) + r;
    this.leftWheel = new MiniWheel(Layout.width * 0.25, cy, r, this.playerItems, this.colors);
    this.rightWheel = new MiniWheel(Layout.width * 0.75, cy, r, this.gameItems, this.colors);

    const leftColX = Layout.width * 0.25;
    const rightColX = Layout.width * 0.75;
    const btnW = Layout.px(90);
    const smallBtnW = Layout.px(80);
    const btnH = Layout.px(32);
    const smallBtnH = Layout.px(24);
    const gap = Layout.px(6);

    const resultY = cy + r + Layout.px(28);
    const colStartY = resultY + Layout.px(14);

    // 左侧列：转玩家 → 编辑名单 → 4位 → 6位 → 8位
    this.spinLeftBtn = {
      x: leftColX - btnW / 2, y: colStartY, w: btnW, h: btnH,
      text: '转玩家', fontSize: 12,
      onTouchEnd: () => this.leftWheel.spin()
    };
    this.editLeftBtn = {
      x: leftColX - btnW / 2, y: colStartY + btnH + gap, w: btnW, h: smallBtnH,
      text: '编辑名单', fontSize: 10,
      onTouchEnd: () => this.editItems('player')
    };
    this.presetPlayer1Btn = {
      x: leftColX - smallBtnW / 2, y: colStartY + btnH + smallBtnH + gap * 2, w: smallBtnW, h: smallBtnH,
      text: '4位玩家', fontSize: 10,
      onTouchEnd: () => this.loadPlayerPreset(4)
    };
    this.presetPlayer2Btn = {
      x: leftColX - smallBtnW / 2, y: colStartY + btnH + smallBtnH * 2 + gap * 3, w: smallBtnW, h: smallBtnH,
      text: '6位玩家', fontSize: 10,
      onTouchEnd: () => this.loadPlayerPreset(6)
    };
    this.presetPlayer3Btn = {
      x: leftColX - smallBtnW / 2, y: colStartY + btnH + smallBtnH * 3 + gap * 4, w: smallBtnW, h: smallBtnH,
      text: '8位玩家', fontSize: 10,
      onTouchEnd: () => this.loadPlayerPreset(8)
    };

    // 右侧列：转游戏 → 编辑项目 → 小姐牌 → 少爷牌 → 商K牌
    this.spinRightBtn = {
      x: rightColX - btnW / 2, y: colStartY, w: btnW, h: btnH,
      text: '转游戏', fontSize: 12,
      onTouchEnd: () => this.rightWheel.spin()
    };
    this.editRightBtn = {
      x: rightColX - btnW / 2, y: colStartY + btnH + gap, w: btnW, h: smallBtnH,
      text: '编辑项目', fontSize: 10,
      onTouchEnd: () => this.editItems('game')
    };
    this.preset1Btn = {
      x: rightColX - smallBtnW / 2, y: colStartY + btnH + smallBtnH + gap * 2, w: smallBtnW, h: smallBtnH,
      text: '小姐牌', fontSize: 10,
      onTouchEnd: () => this.loadPreset('xiaojie')
    };
    this.preset2Btn = {
      x: rightColX - smallBtnW / 2, y: colStartY + btnH + smallBtnH * 2 + gap * 3, w: smallBtnW, h: smallBtnH,
      text: '少爷牌', fontSize: 10,
      onTouchEnd: () => this.loadPreset('shaoye')
    };
    this.preset3Btn = {
      x: rightColX - smallBtnW / 2, y: colStartY + btnH + smallBtnH * 3 + gap * 4, w: smallBtnW, h: smallBtnH,
      text: '商K牌', fontSize: 10,
      onTouchEnd: () => this.loadPreset('shangk')
    };

    this.elements.push(this.spinLeftBtn, this.spinRightBtn, this.editLeftBtn, this.editRightBtn, this.presetPlayer1Btn, this.presetPlayer2Btn, this.presetPlayer3Btn, this.preset1Btn, this.preset2Btn, this.preset3Btn);
  }

  loadPlayerPreset(count) {
    const names = [];
    const males = Math.ceil(count / 2);
    const females = count - males;
    for (let i = 1; i <= males; i++) names.push(`男${i}`);
    for (let i = 1; i <= females; i++) names.push(`女${i}`);
    this.playerItems = names;
    this.leftWheel.items = names;
  }

  loadPreset(name) {
    const presets = {
      xiaojie: ['代酒牌','小姐牌','逛三园','照相机','免死金牌','摸鼻子','逢七过','厕所牌','自己喝','神经病','左边喝','右边喝','自己喝规定下一位'],
      shaoye: ['蒙眼喝','少爷牌','三字经','撕纸巾','从来没有','猜拳抓单','如胶似漆（数字抱团）','拨号（写数盲猜）','嘟嘟传牌','定规不能说','男生喝','女生喝','自己喝规定下一位'],
      shangk: ['升国旗','吃包子','撕纸巾','高尔夫','乌鸦喝水','水果拼盘','高三流水','七星瓢虫','穿越火线','飞檐走壁','天龙八部','小桥流水','吸星大法','洗面奶','洗衣机','雾里看花','穿针引线','遛鸟','草船借箭','小马过河','挂窗帘','灭火器','小兵过草地','唐伯虎点秋香']
    };
    const items = presets[name];
    if (items) {
      this.gameItems = items;
      this.rightWheel.items = items;
    }
  }

  editItems(type) {
    const items = type === 'player' ? this.playerItems : this.gameItems;
    const title = type === 'player' ? '编辑玩家名单' : '编辑游戏项目';
    this.showInput(title, items.join(','), 'text', (val) => {
      const arr = val.split(/[,，]/).map(s => s.trim()).filter(s => s);
      if (arr.length > 0) {
        if (type === 'player') {
          this.playerItems = arr;
          this.leftWheel.items = arr;
        } else {
          this.gameItems = arr;
          this.rightWheel.items = arr;
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
    this.drawTitle(ctx, '🎯 幸运双转盘', this.topOffset + Layout.px(28));
    this.drawSubtitle(ctx, '左边选中谁，右边决定做什么', this.topOffset + Layout.px(52));

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

    const resultY = this.leftWheel.cy + this.leftWheel.radius + Layout.px(28);
    if (this.leftWheel.result) {
      ctx.fillStyle = '#e94560';
      ctx.font = `bold ${Layout.fontSize(14)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'alphabetic';
      ctx.fillText('🎉 ' + this.leftWheel.result, Layout.width * 0.25, resultY);
    }
    if (this.rightWheel.result) {
      ctx.fillStyle = '#e94560';
      ctx.font = `bold ${Layout.fontSize(14)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'alphabetic';
      ctx.fillText('🎉 ' + this.rightWheel.result, Layout.width * 0.75, resultY);
    }

    this.drawButton(ctx, this.editLeftBtn, 'rgba(255,255,255,0.15)', '#fff');
    this.drawButton(ctx, this.presetPlayer1Btn, 'rgba(255,255,255,0.08)', '#16c79a');
    this.drawButton(ctx, this.presetPlayer2Btn, 'rgba(255,255,255,0.08)', '#16c79a');
    this.drawButton(ctx, this.presetPlayer3Btn, 'rgba(255,255,255,0.08)', '#16c79a');

    this.drawButton(ctx, this.editRightBtn, 'rgba(255,255,255,0.15)', '#fff');
    this.drawButton(ctx, this.preset1Btn, 'rgba(255,255,255,0.08)', '#f39422');
    this.drawButton(ctx, this.preset2Btn, 'rgba(255,255,255,0.08)', '#f39422');
    this.drawButton(ctx, this.preset3Btn, 'rgba(255,255,255,0.08)', '#f39422');
  }
}
