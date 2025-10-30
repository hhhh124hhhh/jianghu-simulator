import { GameEvent } from '../types/game';

// 10轮核心事件
export const gameEvents: GameEvent[] = [
  {
    id: 1,
    title: '入门试炼',
    description: '师父为你安排了入门试炼，考验你的基本功。你打算如何应对？',
    options: [
      {
        id: 'A',
        label: 'A',
        description: '主动挑战高难度任务，展现实力',
        effects: { martial: 2, energy: -1 },
      },
      {
        id: 'B',
        label: 'B',
        description: '稳妥完成基础要求',
        effects: { martial: 1, network: 1 },
      },
      {
        id: 'C',
        label: 'C',
        description: '请教前辈，学习经验',
        effects: { martial: 1, network: 2, energy: -1 },
      },
    ],
  },
  {
    id: 2,
    title: '街市冲突',
    description: '街市上遇到恶霸欺负百姓，周围无人敢管。你会怎么做？',
    options: [
      {
        id: 'A',
        label: 'A',
        description: '挺身而出，主持正义',
        effects: { martial: 2, fame: 2, energy: -2 },
      },
      {
        id: 'B',
        label: 'B',
        description: '旁观事态发展',
        effects: { energy: -1, virtue: -1 },
      },
      {
        id: 'C',
        label: 'C',
        description: '劝和双方，化解矛盾',
        effects: { martial: 1, network: 1 },
      },
    ],
  },
  {
    id: 3,
    title: '江湖任务',
    description: '接到一个危险的任务：潜入敌对势力的据点收集情报。',
    options: [
      {
        id: 'A',
        label: 'A',
        description: '冒险潜入，亲自执行',
        effects: { martial: 3, fame: 2, energy: -2, virtue: -1 },
      },
      {
        id: 'B',
        label: 'B',
        description: '委派信任的小弟前去',
        effects: { martial: 1, network: 1, energy: -1 },
      },
      {
        id: 'C',
        label: 'C',
        description: '认为风险太大，放弃任务',
        effects: { energy: 1, virtue: 1, fame: -1 },
      },
    ],
  },
  {
    id: 4,
    title: '结交盟友',
    description: '在酒馆遇到一位志同道合的侠客，似乎可以成为好友。',
    options: [
      {
        id: 'A',
        label: 'A',
        description: '主动邀请结为兄弟',
        effects: { network: 3, energy: -1 },
      },
      {
        id: 'B',
        label: 'B',
        description: '暗中帮助，建立好感',
        effects: { network: 2, martial: 1, energy: -1 },
      },
      {
        id: 'C',
        label: 'C',
        description: '保持距离，不轻易交心',
        effects: { energy: 1, network: -1 },
      },
    ],
  },
  {
    id: 5,
    title: '师门考核',
    description: '师门举行年度考核，这是展现实力、提升地位的机会。',
    options: [
      {
        id: 'A',
        label: 'A',
        description: '全力以赴，争取第一',
        effects: { martial: 3, fame: 2, energy: -2 },
      },
      {
        id: 'B',
        label: 'B',
        description: '正常发挥，稳中求胜',
        effects: { martial: 1, network: 1 },
      },
      {
        id: 'C',
        label: 'C',
        description: '低调行事，保存实力',
        effects: { energy: 1, virtue: 1, fame: -1 },
      },
    ],
  },
  {
    id: 6,
    title: '江湖争端',
    description: '两大门派因误会即将大打出手，你恰好在场。',
    options: [
      {
        id: 'A',
        label: 'A',
        description: '居中调解，化解恩怨',
        effects: { network: 2, fame: 1, energy: -1 },
      },
      {
        id: 'B',
        label: 'B',
        description: '帮助弱势一方，维护正义',
        effects: { martial: 2, fame: 2, energy: -2 },
      },
      {
        id: 'C',
        label: 'C',
        description: '明哲保身，远离纷争',
        effects: { energy: 1, virtue: 1 },
      },
    ],
  },
  {
    id: 7,
    title: '秘密交易',
    description: '有人找你交易一本武功秘籍，但来源不明。',
    options: [
      {
        id: 'A',
        label: 'A',
        description: '接受交易，提升武艺',
        effects: { martial: 2, fame: -1, network: 1, energy: -1 },
      },
      {
        id: 'B',
        label: 'B',
        description: '上报门派，秉公处理',
        effects: { martial: 1, fame: 2, network: 1 },
      },
      {
        id: 'C',
        label: 'C',
        description: '拒绝诱惑，无视此事',
        effects: { energy: 1, virtue: 1 },
      },
    ],
  },
  {
    id: 8,
    title: '突发灾难',
    description: '村庄遭遇山贼袭击，百姓四处逃散，财物散落一地。',
    options: [
      {
        id: 'A',
        label: 'A',
        description: '奋勇救人，击退山贼',
        effects: { martial: 2, fame: 2, energy: -2, virtue: 1 },
      },
      {
        id: 'B',
        label: 'B',
        description: '保护重要财物，减少损失',
        effects: { martial: 1, network: 1, energy: -1 },
      },
      {
        id: 'C',
        label: 'C',
        description: '避开危险，寻找援军',
        effects: { energy: 1, virtue: 1 },
      },
    ],
  },
  {
    id: 9,
    title: '盟友请求',
    description: '你的好友陷入困境，急需你的帮助。',
    options: [
      {
        id: 'A',
        label: 'A',
        description: '义无反顾，全力相助',
        effects: { martial: 2, network: 3, energy: -1 },
      },
      {
        id: 'B',
        label: 'B',
        description: '量力而行，适度协助',
        effects: { martial: 1, network: 1, energy: -1 },
      },
      {
        id: 'C',
        label: 'C',
        description: '委婉拒绝，自身难保',
        effects: { virtue: 1, network: -2 },
      },
    ],
  },
  {
    id: 10,
    title: '江湖大会',
    description: '江湖召开武林大会，各路英雄汇聚一堂。这是展现实力、建立名望的最佳时机。',
    options: [
      {
        id: 'A',
        label: 'A',
        description: '全力展示，争夺魁首',
        effects: { martial: 3, fame: 3, energy: -2, virtue: 1 },
      },
      {
        id: 'B',
        label: 'B',
        description: '稳妥发挥，结交好友',
        effects: { martial: 1, fame: 1, energy: -1 },
      },
      {
        id: 'C',
        label: 'C',
        description: '低调观赛，学习他人',
        effects: { energy: 1, virtue: 1 },
      },
    ],
  },
];
