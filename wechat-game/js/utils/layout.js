const info = wx.getSystemInfoSync();
const width = info.windowWidth;
const height = info.windowHeight;
const ratio = info.pixelRatio;

const DESIGN_W = 375;
const DESIGN_H = 667;

let scale = Math.min(width / DESIGN_W, height / DESIGN_H);

// 在矮屏幕上进一步缩小，确保内容不超出
if (height < 600) {
  scale *= 0.92;
}

export default {
  width,
  height,
  ratio,
  scale,
  designW: DESIGN_W,
  designH: DESIGN_H,

  px(val) {
    return val * scale;
  },

  x(val) {
    return val * scale;
  },

  y(val) {
    return val * scale;
  },

  fontSize(val) {
    return Math.max(10, val * scale);
  }
};
