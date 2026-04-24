const listeners = [];

wx.onTouchStart((e) => {
  const t = e.touches[0];
  for (let i = listeners.length - 1; i >= 0; i--) {
    if (listeners[i].onTouchStart(t.clientX, t.clientY)) break;
  }
});

wx.onTouchEnd((e) => {
  const t = e.changedTouches[0];
  for (let i = listeners.length - 1; i >= 0; i--) {
    if (listeners[i].onTouchEnd(t.clientX, t.clientY)) break;
  }
});

export default {
  add(obj) {
    if (!listeners.includes(obj)) listeners.push(obj);
  },
  remove(obj) {
    const idx = listeners.indexOf(obj);
    if (idx >= 0) listeners.splice(idx, 1);
  }
};
