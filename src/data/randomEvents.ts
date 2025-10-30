import { RandomEvent } from '../types/game';

// 随机事件池
export const randomEventPool: RandomEvent[] = [
  // 战斗事件
  {
    id: 're-battle-1',
    type: 'battle',
    title: '山林遇袭',
    description: '行经山林时遭遇劫匪伏击，经过一番激战，你成功击退了对方。',
    effects: { martial: 2, energy: -2, virtue: 1 },
  },
  {
    id: 're-battle-2',
    type: 'battle',
    title: '切磋比武',
    description: '路遇一位武林高手主动邀请切磋，你在对决中学到了不少东西。',
    effects: { martial: 3, energy: -3, fame: 1 },
  },
  {
    id: 're-battle-3',
    type: 'battle',
    title: '街头斗殴',
    description: '目睹一场不公平的战斗，你出手相助弱者，虽然消耗不少内力，但赢得了赞誉。',
    effects: { martial: 1, fame: 1, energy: -2, virtue: 1 },
  },

  // 社交事件
  {
    id: 're-social-1',
    type: 'social',
    title: '酒馆结识',
    description: '在酒馆与几位侠客把酒言欢，结下了深厚的友谊。',
    effects: { network: 2, fame: 1, energy: -1 },
  },
  {
    id: 're-social-2',
    type: 'social',
    title: '帮派宴席',
    description: '受邀参加某帮派的宴席，认识了不少江湖朋友，人脉大增。',
    effects: { network: 3, fame: 2, energy: -1 },
  },
  {
    id: 're-social-3',
    type: 'social',
    title: '拜访名宿',
    description: '拜访了一位德高望重的江湖前辈，获得了宝贵的指点和人脉资源。',
    effects: { network: 2, virtue: 1, energy: -1 },
  },

  // 策略事件
  {
    id: 're-strategy-1',
    type: 'strategy',
    title: '商队护送',
    description: '接受商队护送任务，途中巧妙化解了几次危机，获得了丰厚报酬和名声。',
    effects: { martial: 1, fame: 2, network: 1, energy: -1 },
  },
  {
    id: 're-strategy-2',
    type: 'strategy',
    title: '调解纷争',
    description: '成功调解了两个门派之间的矛盾，展现出色的智慧和公正。',
    effects: { fame: 2, network: 2, energy: -1 },
  },
  {
    id: 're-strategy-3',
    type: 'strategy',
    title: '识破阴谋',
    description: '察觉到针对你的阴谋并成功化解，虽然消耗精力，但保住了声誉。',
    effects: { virtue: 1, fame: 1, network: -1, energy: -1 },
  },

  // 自然/突发事件
  {
    id: 're-natural-1',
    type: 'natural',
    title: '山洪突袭',
    description: '遇到山洪暴发，在救援百姓的过程中体力严重透支。',
    effects: { virtue: 1, fame: 1, energy: -3 },
  },
  {
    id: 're-natural-2',
    type: 'natural',
    title: '瘟疫蔓延',
    description: '村庄爆发瘟疫，你协助医者救治病患，消耗了大量精力但赢得民心。',
    effects: { fame: 2, virtue: 1, energy: -2 },
  },
  {
    id: 're-natural-3',
    type: 'natural',
    title: '意外受伤',
    description: '训练时不慎受伤，需要休养一段时间。',
    effects: { energy: -2, martial: -1 },
  },

  // 神秘机缘
  {
    id: 're-mystery-1',
    type: 'mystery',
    title: '古洞奇遇',
    description: '偶然发现一处古洞，在洞中获得了一本武功秘籍。',
    effects: { martial: 3, fame: 1, energy: 1 },
  },
  {
    id: 're-mystery-2',
    type: 'mystery',
    title: '高人指点',
    description: '巧遇隐世高人，获得醍醐灌顶般的指点，功力大增。',
    effects: { martial: 2, virtue: 2, energy: 1 },
  },
  {
    id: 're-mystery-3',
    type: 'mystery',
    title: '灵药相助',
    description: '意外得到一株珍贵灵药，服用后内力大涨。',
    effects: { energy: 2, martial: 1, fame: 1 },
  },
];

// 获取随机事件
export const getRandomEvent = (): RandomEvent | null => {
  // 20%-40%触发概率
  const triggerChance = Math.random();
  if (triggerChance > 0.4) {
    return null;
  }

  // 随机选择一个事件
  const randomIndex = Math.floor(Math.random() * randomEventPool.length);
  return randomEventPool[randomIndex];
};
