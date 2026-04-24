import Layout from './utils/layout';
import Touch from './utils/touch';
import MenuScene from './games/menu';
import WheelScene from './games/wheel';
import BombScene from './games/bomb';
import TruthScene from './games/truth';
import DiceScene from './games/dice';
import PokerScene from './games/poker';

const canvas = wx.createCanvas();
const ctx = canvas.getContext('2d');

// 设置Canvas实际像素尺寸
const dpr = Layout.ratio;
canvas.width = Layout.width * dpr;
canvas.height = Layout.height * dpr;
ctx.scale(dpr, dpr);

let currentScene = null;
let lastTime = 0;

const scenes = {
  menu: new MenuScene(ctx),
  wheel: new WheelScene(ctx),
  bomb: new BombScene(ctx),
  truth: new TruthScene(ctx),
  dice: new DiceScene(ctx),
  poker: new PokerScene(ctx),
};

function switchScene(name) {
  if (currentScene) {
    Touch.remove(currentScene);
    currentScene.onLeave && currentScene.onLeave();
  }
  currentScene = scenes[name];
  Touch.add(currentScene);
  currentScene.onEnter && currentScene.onEnter();
}

function loop(timestamp) {
  const dt = timestamp - lastTime;
  lastTime = timestamp;

  ctx.clearRect(0, 0, Layout.width, Layout.height);

  // 绘制全局背景
  const grad = ctx.createLinearGradient(0, 0, Layout.width, Layout.height);
  grad.addColorStop(0, '#1a1a2e');
  grad.addColorStop(1, '#16213e');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, Layout.width, Layout.height);

  if (currentScene) {
    currentScene.update(dt);
    currentScene.render(ctx);
  }

  requestAnimationFrame(loop);
}

// 导出全局切换方法
wx.switchGameScene = switchScene;

export default {
  start() {
    switchScene('menu');
    requestAnimationFrame(loop);
  }
};
