import { GameEvent } from '../types/game';
import { liuShixiong } from './npcs';

/**
 * NPC专用事件定义
 * 这些事件会在特定条件下触发，包含与NPC的互动
 */

/**
 * 第4轮事件：结交盟友
 * 触发条件：玩家在问卷或早期选择中表达「交际倾向」
 */
export const liuShixiongEvent4: GameEvent = {
  id: 1001, // NPC事件使用1000+的ID
  title: '柳师兄的邀约',
  description: '柳师兄主动找到了你，眼中带着欣赏的光芒。"师弟，我看你为人不错，想在师门中多交些朋友吗？"',
  options: [
    {
      id: 'A',
      label: '欣然接受',
      description: '感谢柳师兄的好意，多一个朋友多一条路',
      effects: { 
        network: 2, 
        virtue: 1,
        fame: 1 
      },
      npcRelationshipEffects: [
        {
          npcId: 'npc004',
          npcName: '柳师兄',
          relationshipChange: 3,
          reason: '欣然接受柳师兄的交友提议'
        }
      ],
      consequences: [
        '柳师兄会记住你的友善，未来可能会提供更多帮助',
        '建立了良好的人脉基础，有助于师门内的发展'
      ]
    },
    {
      id: 'B', 
      label: '谨慎考虑',
      description: '表示感谢但需要时间考虑',
      effects: { 
        network: 1,
        virtue: 1 
      },
      npcRelationshipEffects: [
        {
          npcId: 'npc004',
          npcName: '柳师兄',
          relationshipChange: 1,
          reason: '对柳师兄的提议持保留态度'
        }
      ],
      consequences: [
        '柳师兄理解你的谨慎，关系略有提升',
        '未来仍有机会进一步发展关系'
      ]
    },
    {
      id: 'C',
      label: '礼貌拒绝',
      description: '婉言谢绝，表示目前想专心修炼',
      effects: { 
        martial: 1,
        virtue: 1,
        network: -1 
      },
      npcRelationshipEffects: [
        {
          npcId: 'npc004',
          npcName: '柳师兄',
          relationshipChange: -2,
          reason: '拒绝柳师兄的交友提议'
        }
      ],
      consequences: [
        '柳师兄对你的选择感到失望，关系有所下降',
        '专注于修炼可能会影响人脉发展'
      ]
    }
  ]
};

/**
 * 第6轮事件：柳师兄的提拔
 * 触发条件：声望≥6 或人脉≥5，且与柳师兄关系良好
 */
export const liuShixiongEvent6: GameEvent = {
  id: 1002,
  title: '柳师兄的提拔',
  description: '柳师兄找到你，神色严肃地说："师弟，掌门正在寻找可靠的弟子负责一些重要事务。我觉得你很适合这个机会，要不要试试？"',
  options: [
    {
      id: 'A',
      label: '接受提拔',
      description: '感谢柳师兄的信任，愿意承担这个责任',
      effects: { 
        martial: 2, 
        fame: 2,
        network: 1,
        virtue: 1 
      },
      npcRelationshipEffects: [
        {
          npcId: 'npc004',
          npcName: '柳师兄',
          relationshipChange: 4,
          reason: '接受柳师兄的提拔机会'
        }
      ],
      requiresConfirmation: true,
      consequences: [
        '柳师兄会更加信任你，可能提供更多重要机会',
        '承担重要责任将提升你在师门的地位',
        '但也可能承担更大的风险和压力'
      ]
    },
    {
      id: 'B',
      label: '询问详情',
      description: '先了解具体是什么事务，再做决定',
      effects: { 
        network: 2,
        fame: 1,
        virtue: 1 
      },
      npcRelationshipEffects: [
        {
          npcId: 'npc004',
          npcName: '柳师兄',
          relationshipChange: 2,
          reason: '谨慎询问柳师兄关于事务的详情'
        }
      ],
      consequences: [
        '柳师兄欣赏你的谨慎，关系更加稳固',
        '了解更多信息有助于做出更好的决策'
      ]
    },
    {
      id: 'C',
      label: '委婉拒绝',
      description: '感谢看重，但觉得自己资历尚浅',
      effects: { 
        martial: 1,
        virtue: 2,
        fame: -1 
      },
      npcRelationshipEffects: [
        {
          npcId: 'npc004',
          npcName: '柳师兄',
          relationshipChange: -3,
          reason: '拒绝柳师兄的提拔机会'
        }
      ],
      consequences: [
        '柳师兄对你的拒绝感到失望，可能会影响未来的机会',
        '谦逊的态度值得赞赏，但也可能错失重要机会'
      ]
    }
  ]
};

/**
 * 第9轮事件：柳师兄的真面目
 * 触发条件：存在"owed_help_npc004"标记且柳师兄信任值≤2
 */
export const liuShixiongEvent9: GameEvent = {
  id: 1003,
  title: '柳师兄的真面目',
  description: '在一个月黑风高的夜晚，你意外发现了柳师兄的秘密。原来他一直在利用你达到自己的目的..."面对真相，你选择如何应对？',
  options: [
    {
      id: 'A',
      label: '当面质问',
      description: '直接与柳师兄对质，要求一个解释',
      effects: { 
        martial: -2,
        fame: -3, 
        network: -2,
        virtue: 2 
      },
      npcRelationshipEffects: [
        {
          npcId: 'npc004',
          npcName: '柳师兄',
          relationshipChange: -6,
          reason: '当面质问柳师兄的背叛行为'
        }
      ],
      requiresConfirmation: true,
      consequences: [
        '直接对抗可能彻底破裂关系',
        '但也展现了你的正直和勇气',
        '可能会引起师门其他人的关注'
      ]
    },
    {
      id: 'B',
      label: '暗中收集证据',
      description: '不动声色，收集更多证据后再做决定',
      effects: { 
        network: -1,
        virtue: 1,
        martial: 1 
      },
      npcRelationshipEffects: [
        {
          npcId: 'npc004',
          npcName: '柳师兄',
          relationshipChange: -3,
          reason: '暗中调查柳师兄的秘密'
        }
      ],
      consequences: [
        '谨慎的收集证据可能会让你掌握主动权',
        '但也有被发现的风险，后果可能更严重'
      ]
    },
    {
      id: 'C',
      label: '假装不知',
      description: '继续装作什么都不知道，静观其变',
      effects: { 
        martial: -1,
        network: 1,
        virtue: -1 
      },
      npcRelationshipEffects: [
        {
          npcId: 'npc004',
          npcName: '柳师兄',
          relationshipChange: -2,
          reason: '假装不知道柳师兄的真面目'
        }
      ],
      consequences: [
        '暂时的平静可能换来更大的危机',
        '道德上的妥协可能会影响你的侠义之心'
      ]
    },
    {
      id: 'D',
      label: '寻求帮助',
      description: '向师父或其他可信的人求助',
      effects: { 
        fame: -2,
        network: -1,
        virtue: 3 
      },
      npcRelationshipEffects: [
        {
          npcId: 'npc004',
          npcName: '柳师兄',
          relationshipChange: -5,
          reason: '向他人揭发柳师兄的行为'
        }
      ],
      requiresConfirmation: true,
      consequences: [
        '维护正义可能会失去一些虚假的关系',
        '但会赢得真正的信任和尊重',
        '可能面临师门内部的复杂局面'
      ]
    }
  ]
};

/**
 * NPC随机事件
 */
export const liuShixiongRandomEvents = [
  {
    id: 'liu_random_1',
    type: 'social' as const,
    title: '柳师兄的关心',
    description: '柳师兄看到你训练辛苦，主动给你递来水和毛巾。"师弟，不要太勉强自己，适度休息也很重要。"',
    effects: { 
      energy: 1,
      virtue: 1,
      network: 1 
    }
  },
  {
    id: 'liu_random_2', 
    type: 'strategy' as const,
    title: '柳师兄的建议',
    description: '柳师兄找到你讨论师门的策略："我觉得我们可以在下个月的门派大比中这样安排..."',
    effects: { 
      martial: 1,
      network: 2,
      fame: 1 
    }
  },
  {
    id: 'liu_random_3',
    type: 'battle' as const,
    title: '柳师兄的切磋',
    description: '柳师兄邀请你进行切磋训练："来，让我看看你最近的进步如何。"',
    effects: { 
      martial: 2,
      energy: -1,
      network: 1 
    }
  }
];

/**
 * 所有NPC事件映射
 */
export const npcEventMap: Map<number, GameEvent> = new Map([
  [1001, liuShixiongEvent4],
  [1002, liuShixiongEvent6],
  [1003, liuShixiongEvent9]
]);

/**
 * 根据ID获取NPC事件
 */
export const getNPCEvent = (eventId: number): GameEvent | undefined => {
  return npcEventMap.get(eventId);
};

/**
 * 获取特定NPC的所有事件
 */
export const getNPCEvents = (npcId: string): GameEvent[] => {
  // 这里可以根据NPC ID筛选对应的事件
  switch (npcId) {
    case 'npc004': // 柳师兄
      return [liuShixiongEvent4, liuShixiongEvent6, liuShixiongEvent9];
    default:
      return [];
  }
};

/**
 * 检查NPC事件触发条件
 */
export const checkNPCEventTrigger = (
  eventId: number,
  playerStats: any,
  playerFlags: Map<string, any>,
  currentRound: number,
  npcRelationships: Map<string, number>
): boolean => {
  switch (eventId) {
    case 1001: // 第4轮事件
      return currentRound === 3 && playerStats.network >= 2;
    
    case 1002: // 第6轮事件  
      return currentRound === 5 && 
             (playerStats.fame >= 6 || playerStats.network >= 5) &&
             (npcRelationships.get('npc004') || 0) >= 3;
    
    case 1003: // 第9轮事件
      return currentRound === 8 && 
             playerFlags.has('owed_help_npc004') &&
             (npcRelationships.get('npc004') || 0) <= 2;
    
    default:
      return false;
  }
};

/**
 * 处理NPC事件后果
 */
export const processNPCEventConsequences = (
  eventId: number,
  selectedOption: string,
  player: any,
  npcManager: any
): void => {
  const npcId = 'npc004'; // 柳师兄
  
  switch (eventId) {
    case 1001: // 第4轮事件后果
      if (selectedOption === 'A') {
        // 选择接受：设置债务标记
        player.setFlag('owed_help_npc004', true);
        npcManager.updateRelationship(npcId, 2, '接受柳师兄的帮助');
      }
      break;
    
    case 1002: // 第6轮事件后果
      if (selectedOption === 'A') {
        npcManager.updateRelationship(npcId, 3, '接受柳师兄的提拔');
      } else if (selectedOption === 'C') {
        npcManager.updateRelationship(npcId, -1, '拒绝柳师兄的提拔');
      }
      break;
    
    case 1003: // 第9轮事件后果
      if (selectedOption === 'A') {
        // 当面质问：关系恶化
        npcManager.updateRelationship(npcId, -3, '当面质问柳师兄');
      } else if (selectedOption === 'D') {
        // 寻求帮助：可能激化矛盾
        npcManager.updateRelationship(npcId, -4, '向他人求助');
      }
      break;
  }
};

/**
 * 获取NPC随机事件
 */
export const getNPCRandomEvent = (npcId: string): any => {
  switch (npcId) {
    case 'npc004': {
      const randomIndex = Math.floor(Math.random() * liuShixiongRandomEvents.length);
      return liuShixiongRandomEvents[randomIndex];
    }
    default:
      return null;
  }
};