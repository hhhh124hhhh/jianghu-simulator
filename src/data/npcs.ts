import { NPC, Agenda, AgendaGoal, AgendaTrigger, AgendaAction } from '../types/extended';

/**
 * 掌门NPC定义
 * 师门的领导者，对主角的成长既关心又严格
 */
export const zhangmen: NPC = {
  id: 'npc001',
  name: '掌门',
  title: '师门掌门',
  description: '师门的最高领袖，武功盖世，为人正直，对弟子要求严格但内心关爱。',
  relationship: 10, // 初始信任值
  availability: true,
  traits: ['威严', '正直', '关爱弟子', '武艺高强'],
  agenda: {
    priority: 5,
    goals: [
      {
        id: 'train_disciples',
        description: '培养弟子成才',
        targetValue: 20,
        currentValue: 0,
        type: 'relationship'
      }
    ],
    triggers: [],
    actions: []
  }
};

/**
 * 大师兄NPC定义
 * 掌门大弟子，稳重可靠，是主角的榜样
 */
export const dashixiong: NPC = {
  id: 'npc002',
  name: '大师兄',
  title: '首座弟子',
  description: '掌门的大弟子，为人稳重可靠，武艺精湛，经常指导师弟师妹们。',
  relationship: 8, // 初始信任值
  availability: true,
  traits: ['稳重', '可靠', '热心指导', '武艺精湛'],
  agenda: {
    priority: 3,
    goals: [
      {
        id: 'guide_juniors',
        description: '指导师弟师妹',
        targetValue: 15,
        currentValue: 0,
        type: 'relationship'
      }
    ],
    triggers: [],
    actions: []
  }
};

/**
 * 药王NPC定义
 * 师门中的医术高手，性格古怪但心地善良
 */
export const yaowang: NPC = {
  id: 'npc003',
  name: '药王',
  title: '医术宗师',
  description: '师门中的医术高手，精通药理，虽然性格古怪但心地善良，经常帮助受伤的弟子。',
  relationship: 6, // 初始信任值
  availability: true,
  traits: ['古怪', '心地善良', '医术高明', '乐于助人'],
  agenda: {
    priority: 2,
    goals: [
      {
        id: 'heal_disciples',
        description: '救治受伤弟子',
        targetValue: 12,
        currentValue: 0,
        type: 'relationship'
      }
    ],
    triggers: [],
    actions: []
  }
};

/**
 * 柳师兄NPC定义
 * 师门盟友，有心计且重情义，希望扶持主角成为门派骨干
 */
export const liuShixiong: NPC = {
  id: 'npc004',
  name: '柳师兄',
  title: '师门师兄',
  description: '在师门中颇有声望的师兄，为人热心但精于算计，似乎对你格外关注。',
  relationship: 5, // 初始信任值
  availability: true,
  traits: ['热心', '有野心', '重情义', '精于算计'],
  agenda: {
    id: 'liu_shixiong_agenda',
    goals: [
      {
        id: 'cultivate_protagonist',
        description: '扶持主角成长',
        targetValue: 10,
        currentValue: 0,
        type: 'relationship'
      },
      {
        id: 'strengthen_faction',
        description: '增强师门派系势力',
        targetValue: 15,
        currentValue: 0,
        type: 'stats'
      }
    ],
    triggers: [
      {
        type: 'player_stats',
        condition: (context) => {
          const player = context.player;
          return player.stats.fame >= 6 || player.stats.network >= 5;
        }
      },
      {
        type: 'round',
        condition: (context) => context.round >= 9
      }
    ],
    actions: [
      {
        id: 'offer_help',
        type: 'help',
        content: {
          title: '柳师兄的指点',
          description: '师弟，我看你天资不错，我来指点你几招。'
        },
        requirements: { relationship: 3 },
        effects: { martial: 1, network: 1 }
      },
      {
        id: 'request_favor',
        type: 'request',
        content: {
          title: '柳师兄的请求',
          description: '师弟，有个小忙需要你帮一下...'
        },
        requirements: { relationship: 5 },
        effects: { virtue: 1 }
      },
      {
        id: 'betrayal',
        type: 'conflict',
        content: {
          title: '柳师兄的真面目',
          description: '原来他一直都在利用你...'
        },
        requirements: { relationship: -2 },
        effects: { martial: -3, fame: -3, network: -2 }
      }
    ],
    priority: 1
  }
};

/**
 * NPC模板配置
 */
export const npcTemplates: Record<string, Partial<NPC>> = {
  mentor: {
    title: '师父',
    traits: ['严厉', '慈爱', '智慧'],
    agenda: {
      priority: 2,
      goals: [],
      triggers: [],
      actions: []
    }
  },
  rival: {
    title: '竞争对手',
    traits: ['嫉妒', '好胜', '狡猾'],
    agenda: {
      priority: 3,
      goals: [],
      triggers: [],
      actions: []
    }
  },
  friend: {
    title: '好友',
    traits: ['忠诚', '义气', '开朗'],
    agenda: {
      priority: 1,
      goals: [],
      triggers: [],
      actions: []
    }
  }
};

/**
 * 所有NPC定义
 */
export const allNPCs: NPC[] = [
  zhangmen,
  dashixiong,
  yaowang,
  liuShixiong
  // 未来可以添加更多NPC
];

/**
 * 根据ID获取NPC
 */
export const getNPCById = (id: string): NPC | undefined => {
  return allNPCs.find(npc => npc.id === id);
};

/**
 * 根据名称获取NPC
 */
export const getNPCByName = (name: string): NPC | undefined => {
  return allNPCs.find(npc => npc.name === name);
};

/**
 * 获取可用的NPC列表
 */
export const getAvailableNPCs = (): NPC[] => {
  return allNPCs.filter(npc => npc.availability);
};


/**
 * 根据关系值获取关系状态
 */
export const getRelationshipStatus = (value: number): string => {
  if (value <= -30) return 'hostile';
  if (value <= -10) return 'distrustful';
  if (value <= 10) return 'neutral';
  if (value <= 30) return 'friendly';
  if (value <= 60) return 'trusted';
  return 'ally';
};

/**
 * NPC配置常量
 */
export const NPC_CONSTANTS = {
  MAX_RELATIONSHIP: 100,
  MIN_RELATIONSHIP: -100,
  DEFAULT_RELATIONSHIP: 0,
  RELATIONSHIP_CHANGE_RATE: 1, // 关系变化速率
  DEBT_DECAY_RATE: 0.1, // 债务衰减速率
  AGENDA_UPDATE_INTERVAL: 2 // 议程更新间隔（轮数）
};