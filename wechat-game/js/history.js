import Layout from './utils/layout';

const KEY_DICE = 'dice_history';
const KEY_POKER = 'poker_history';

function get(key) {
  try {
    return wx.getStorageSync(key) || [];
  } catch (e) {
    return [];
  }
}

function set(key, val) {
  try {
    wx.setStorageSync(key, val);
  } catch (e) {}
}

function now() {
  const d = new Date();
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
}

export default {
  addDice(text) {
    const arr = get(KEY_DICE);
    arr.push({ text, time: now() });
    if (arr.length > 3) arr.shift();
    set(KEY_DICE, arr);
  },

  addPoker(text) {
    const arr = get(KEY_POKER);
    arr.push({ text, time: now() });
    if (arr.length > 3) arr.shift();
    set(KEY_POKER, arr);
  },

  getDice() {
    return get(KEY_DICE);
  },

  getPoker() {
    return get(KEY_POKER);
  },

  render(ctx, x, y, w, items) {
    const labels = ['本局', '上1局', '上2局'];
    ctx.fillStyle = 'rgba(255,255,255,0.03)';
    ctx.fillRect(x, y, w, Layout.px(120));
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, w, Layout.px(120));

    ctx.fillStyle = '#aaa';
    ctx.font = `${Layout.fontSize(11)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('📋 最近3局记录', x + w / 2, y + Layout.px(16));

    if (!items || items.length === 0) {
      ctx.fillStyle = '#888';
      ctx.fillText('暂无记录', x + w / 2, y + Layout.px(50));
      return;
    }

    let ty = y + Layout.px(36);
    [...items].reverse().forEach((item, i) => {
      ctx.fillStyle = 'rgba(255,255,255,0.05)';
      ctx.fillRect(x + Layout.px(8), ty, w - Layout.px(16), Layout.px(24));

      ctx.fillStyle = '#f39422';
      ctx.font = `bold ${Layout.fontSize(10)}px sans-serif`;
      ctx.textAlign = 'left';
      ctx.fillText(labels[i] || '', x + Layout.px(14), ty + Layout.px(16));

      ctx.fillStyle = '#fff';
      ctx.font = `${Layout.fontSize(10)}px sans-serif`;
      ctx.textAlign = 'center';
      const maxW = w - Layout.px(100);
      const text = item.text.length > 20 ? item.text.slice(0, 18) + '...' : item.text;
      ctx.fillText(text, x + w / 2 + Layout.px(10), ty + Layout.px(16));

      ctx.fillStyle = '#888';
      ctx.font = `${Layout.fontSize(9)}px sans-serif`;
      ctx.textAlign = 'right';
      ctx.fillText(item.time, x + w - Layout.px(14), ty + Layout.px(16));

      ty += Layout.px(28);
    });
  }
};
