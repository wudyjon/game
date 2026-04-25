import BaseScene from './base';
import Layout from '../utils/layout';

const TRUTHS = [
  '你的初吻是几岁？被谁夺走的？',
  '你的初恋是几岁？对象叫什么名字？',
  '到目前为止你谈过几次正经恋爱？',
  '你亲吻过多少人？（包括同性）',
  '和多少异性有过暧昧关系？',
  '你最多同时和几个人暧昧？',
  '你在感情上劈过腿吗？详细讲讲',
  '你第一个喜欢的异性叫什么名字？',
  '让你念念不忘的异性是谁？为什么？',
  '第一次爱的人对你产生了什么影响？',
  '你曾经意淫过在场的哪一位？',
  '描述你做过的最污的一个春梦',
  '跟异性做过最亲密的事进展到哪一步？',
  '有没有一瞬间让你对同性动了心？',
  '如果变成异性，第一件事想做什么？',
  '你一共收藏过多少部小电影？',
  '精神出轨和肉体出轨哪个更严重？',
  '你会为了爱情牺牲一切吗？',
  '我在你眼里是什么样的人？说实话',
  '在座哪位异性看起来最"舒服"？',
  '回到高中最想对哪位异性说什么？',
  '现在心里想念的异性叫什么名字？',
  '每天睡觉前都会想起的人是谁？',
  '对象和爱豆同时打电话先接谁的？',
  '如果前任求复合你会怎么办？',
  '你最讨厌自己身上哪一点？',
  '如果明天是世界末日最想做什么？',
  '流落荒岛第一个电话打给谁？',
  '今年最后悔的一件事是什么？',
  '最想从头来过的一件事是什么？',
  '发现另一半出轨了你会怎么办？',
  '什么事你一定会瞒着另一半？',
  '跟异性做过最丢脸的事是什么？',
  '做过最得意但又最不要脸的事？',
  '最近一次发自内心的笑是因为什么？',
  '你觉得自己重色轻友吗？举例',
  '说实话你觉得自己长得怎么样？',
  '你撒过最大的谎是什么？',
  '你最不想让人知道的一个秘密？',
  '你最近一次哭是什么时候？',
  '你暗恋过在座的哪位？',
  '你最尴尬的一次经历是什么？',
  '如果可以互换人生一天，选谁？',
  '你做过最疯狂的事是什么？',
  '你最害怕失去什么？',
  '你有没有偷偷看过别人手机？',
  '你最讨厌在座谁的什么习惯？',
  '你的浏览器搜索历史敢给大家看吗？',
  '你曾经酒后乱来过吗？',
  '你会为了钱出卖朋友吗？',
];

const DARES = [
  '模仿脑白金广告边唱边跳',
  '大喊三遍"我是猪"',
  '蹲在凳子上做便秘状30秒',
  '大笑5秒、大哭5秒，反复3次',
  '原地左转3圈右转3圈，闭眼走回座位',
  '走猫步绕场一周，摆3个S造型',
  '用屁股在空中写自己名字',
  '深情吻墙10秒，必须发出mua声',
  '闻自己袜子深呼吸3次，表情要享受',
  '脸上画乌龟保持到游戏结束',
  '学大猩猩捶胸呐喊"我好寂寞"',
  '用方言读绕口令，错一次罚一口',
  '模仿5种动物叫声，大家投票',
  '做鬼脸坚持30秒，逗笑一个人',
  '抱垃圾桶傻笑10秒',
  '唱青藏高原最后一句必须破音',
  '边做深蹲边唱征服，做满10个',
  '打开浏览器记录给大家公开处刑',
  '发朋友圈"单身了"10分钟不准删',
  '模仿青楼女子拉客说"大爷来呀"',
  '对窗外大喊"我好寂寞"',
  '发消息给好友：一起拉屎吗我出纸',
  '模仿一种动物的叫声让大家猜',
  '给通讯录第10个人发语音说我想你了',
  '做一个最丑的表情保持10秒',
  '唱一首你最拿手的歌',
  '模仿在座的一个人让大家猜',
  '做一个俯卧撑',
  '给前任打电话说我喝多了',
  '十指交扣与一位异性深情对视10秒',
  '壁咚左边第一位异性，对视10秒',
  '公主抱一位异性绕场一周',
  '对喝交杯酒，说余生请多指教',
  '对喂花生米，掉了重来',
  '嘴对嘴传纸巾，掉了罚酒',
  '单膝下跪亲一位异性手背告白',
  '横抱右边第一位异性坚持5秒',
  '踩异性脚上跳舞1分钟',
  '让异性给你涂口红合影发朋友圈',
  '嘴里含一口酒做最性感表情10秒',
  '喂左边第一位喝酒：大郎该吃药了',
  '嘴里叼杯子让异性倒酒，洒一滴罚一杯',
  '选一个异性做俯卧撑5个',
  '亲左数第二个异性的额头夸皮肤好',
  '拥抱在场每一个人5秒',
  '15秒干完一杯啤酒',
  '吃下每个人为你夹的菜',
  '喝一杯左边指定的特调',
  '模仿喝烈酒的样子喝完一杯白开水',
  '读酒桌绕口令，错一个字喝一口',
];

export default class TruthScene extends BaseScene {
  constructor(ctx) {
    super(ctx);
    this.cardVisible = false;
    this.cardType = '';
    this.cardText = '';
    const contentTop = this.topOffset + Layout.px(64);

    const btnGap = Layout.px(14);
    const btnW = (Layout.width - Layout.px(40) - btnGap * 2) / 3;
    this.btnTruth = {
      x: Layout.px(20), y: contentTop, w: btnW, h: Layout.px(40),
      text: '真心话', fontSize: 13,
      onTouchEnd: () => this.drawCard('truth')
    };
    this.btnDare = {
      x: Layout.px(20) + btnW + btnGap, y: contentTop, w: btnW, h: Layout.px(40),
      text: '大冒险', fontSize: 13,
      onTouchEnd: () => this.drawCard('dare')
    };
    this.btnRandom = {
      x: Layout.px(20) + (btnW + btnGap) * 2, y: contentTop, w: btnW, h: Layout.px(40),
      text: '随机', fontSize: 13,
      onTouchEnd: () => this.drawCard(Math.random() > 0.5 ? 'truth' : 'dare')
    };
    this.btnNext = {
      x: Layout.px(60), y: contentTop + Layout.px(240), w: Layout.width - Layout.px(120), h: Layout.px(40),
      text: '下一题', fontSize: 13,
      onTouchEnd: () => { this.cardVisible = false; }
    };
    this.elements.push(this.btnTruth, this.btnDare, this.btnRandom, this.btnNext);
  }

  drawCard(type) {
    this.cardType = type;
    this.cardText = type === 'truth'
      ? TRUTHS[Math.floor(Math.random() * TRUTHS.length)]
      : DARES[Math.floor(Math.random() * DARES.length)];
    this.cardVisible = true;
  }

  render(ctx) {
    super.render(ctx);
    this.drawTitle(ctx, '🎭 真心话大冒险', this.topOffset + Layout.px(30));

    this.drawButton(ctx, this.btnTruth, '#3498db', '#fff');
    this.drawButton(ctx, this.btnDare, '#e74c3c', '#fff');
    this.drawButton(ctx, this.btnRandom, '#e94560', '#fff');

    if (this.cardVisible) {
      const x = Layout.px(24);
      const y = this.topOffset + Layout.px(104);
      const w = Layout.width - Layout.px(48);
      const h = Layout.px(180);
      this.drawPanel(ctx, x, y, w, h, 0.1);
      ctx.strokeStyle = 'rgba(255,255,255,0.2)';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = this.cardType === 'truth' ? '#3498db' : '#e74c3c';
      ctx.font = `bold ${Layout.fontSize(16)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'alphabetic';
      ctx.fillText(this.cardType === 'truth' ? '💙 真心话' : '❤️ 大冒险', Layout.width / 2, y + Layout.px(30));

      ctx.fillStyle = '#fff';
      ctx.font = `${Layout.fontSize(14)}px sans-serif`;
      const words = this.wrapText(ctx, this.cardText, w - Layout.px(40));
      let ty = y + Layout.px(60);
      words.forEach(line => {
        ctx.fillText(line, Layout.width / 2, ty);
        ty += Layout.px(24);
      });

      this.drawButton(ctx, this.btnNext, 'rgba(255,255,255,0.15)', '#fff');
    }
  }

  wrapText(ctx, text, maxWidth) {
    const chars = text.split('');
    const lines = [];
    let line = '';
    for (let i = 0; i < chars.length; i++) {
      const test = line + chars[i];
      if (ctx.measureText(test).width > maxWidth && line !== '') {
        lines.push(line);
        line = chars[i];
      } else {
        line = test;
      }
    }
    lines.push(line);
    return lines;
  }
}
