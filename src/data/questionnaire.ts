// 问卷数据

export interface Question {
  id: string;
  question: string;
  options: Array<{
    value: string;
    label: string;
    description: string;
    effects: {
      martial?: number;
      fame?: number;
      network?: number;
      energy?: number;
      virtue?: number;
    };
  }>;
}

export const questionnaire: Question[] = [
  {
    id: 'background',
    question: '你的身份背景是？',
    options: [
      {
        value: 'scholar',
        label: '普通书生',
        description: '饱读诗书，文质彬彬',
        effects: { virtue: 2, network: 1, martial: -1 },
      },
      {
        value: 'merchant',
        label: '小商贩',
        description: '经商多年，人脉广泛',
        effects: { network: 3, fame: 1, virtue: -1 },
      },
      {
        value: 'family',
        label: '武林世家',
        description: '出身名门，武艺超群',
        effects: { martial: 3, fame: 2, network: -1 },
      },
    ],
  },
  {
    id: 'personality',
    question: '你的性格类型是？',
    options: [
      {
        value: 'extrovert',
        label: '外向型',
        description: '善于交际，活泼开朗',
        effects: { network: 2, energy: 1 },
      },
      {
        value: 'introvert',
        label: '内向型',
        description: '沉稳内敛，深思熟虑',
        effects: { virtue: 2, energy: 1 },
      },
      {
        value: 'resilient',
        label: '坚毅型',
        description: '意志坚定，百折不挠',
        effects: { martial: 2, energy: 2 },
      },
      {
        value: 'cautious',
        label: '谨慎型',
        description: '行事谨慎，稳扎稳打',
        effects: { virtue: 1, fame: 1, energy: 1 },
      },
    ],
  },
  {
    id: 'ambition',
    question: '你的江湖抱负是？',
    options: [
      {
        value: 'test',
        label: '小试牛刀',
        description: '初探江湖，见识世面',
        effects: { energy: 2, virtue: 1 },
      },
      {
        value: 'fame',
        label: '立名江湖',
        description: '扬名立万，名震四方',
        effects: { fame: 3, martial: 1 },
      },
      {
        value: 'peace',
        label: '追求安稳',
        description: '平安度日，与世无争',
        effects: { virtue: 2, energy: 2 },
      },
    ],
  },
  {
    id: 'age',
    question: '你的年龄是？',
    options: [
      {
        value: '18-22',
        label: '18-22岁',
        description: '年轻气盛，活力充沛',
        effects: { energy: 2, martial: 1 },
      },
      {
        value: '23-25',
        label: '23-25岁',
        description: '年富力强，经验丰富',
        effects: { virtue: 1, fame: 1, network: 1 },
      },
    ],
  },
  {
    id: 'talent',
    question: '你的兴趣特长是？',
    options: [
      {
        value: 'martial',
        label: '武艺',
        description: '精通拳脚，剑术超群',
        effects: { martial: 3, fame: 1 },
      },
      {
        value: 'strategy',
        label: '谋略',
        description: '智谋过人，深谋远虑',
        effects: { virtue: 2, fame: 1 },
      },
      {
        value: 'social',
        label: '交际',
        description: '能言善辩，八面玲珑',
        effects: { network: 3, fame: 1 },
      },
    ],
  },
];
