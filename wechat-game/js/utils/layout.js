const info = wx.getSystemInfoSync();
const width = info.windowWidth;
const height = info.windowHeight;
const ratio = info.pixelRatio;
const statusBarHeight = info.statusBarHeight || 0;
const safeArea = info.safeArea || { top: 0, bottom: height, left: 0, right: width };

let menuBtnRect;
try {
  menuBtnRect = wx.getMenuButtonBoundingClientRect();
} catch (e) {
  menuBtnRect = null;
}
const capsuleBottom = menuBtnRect ? menuBtnRect.bottom : 0;

const DESIGN_W = 375;
const DESIGN_H = 667;

let scale = Math.min(width / DESIGN_W, height / DESIGN_H);

// 在矮屏幕上进一步缩小，确保内容不超出
if (height < 600) {
  scale *= 0.92;
}

// 顶部安全区域偏移（刘海屏、状态栏、胶囊按钮等）
const safeTop = Math.max(statusBarHeight, safeArea.top, capsuleBottom + 4);

export default {
  width,
  height,
  ratio,
  scale,
  safeTop,
  designW: DESIGN_W,
  designH: DESIGN_H,

  px(val) {
    return val * scale;
  },

  x(val) {
    return val * scale;
  },

  y(val) {
    return val * scale + safeTop;
  },

  fontSize(val) {
    return Math.max(10, val * scale);
  }
};
