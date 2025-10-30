import { NPC, PlayerRelationship, DelayedEffect } from '../../types/extended';

/**
 * NPC交互历史记录
 */
export interface NPCHistory {
  round: number;
  npcId: string;
  interactionType: 'dialogue' | 'help' | 'request' | 'conflict' | 'event';
  description: string;
  relationshipChange: number;
  effects: any;
  metadata?: Record<string, any>;
}

// 重新导出NPC类型
export type { NPC } from '../../types/extended';

/**
 * NPC状态快照
 */
export interface NPCState {
  npcId: string;
  relationship: number;
  availability: boolean;
  currentMood: 'friendly' | 'neutral' | 'hostile' | 'busy' | 'helpful';
  activeGoals: string[];
  blockedActions: string[];
  lastInteractionRound: number;
  totalInteractions: number;
}

/**
 * NPC事件上下文
 */
export interface NPCEventContext {
  player: any;
  gameState: any;
  round: number;
  previousInteractions: NPCHistory[];
  currentRelationship: number;
  environmentFactors: Record<string, any>;
}

/**
 * NPC决策结果
 */
export interface NPCDecision {
  actionId: string;
  actionType: 'dialogue' | 'help' | 'request' | 'event' | 'conflict';
  priority: number;
  requirements: Record<string, any>;
  effects: any;
  narrative: string;
  followUpActions?: string[];
}

/**
 * NPC系统配置
 */
export interface NPCSystemConfig {
  enableNPCInteractions: boolean;
  maxInteractionsPerRound: number;
  relationshipDecayRate: number;
  agendaPriorityThreshold: number;
  enableRandomEncounters: boolean;
  debugMode: boolean;
}

/**
 * NPC网络关系
 */
export interface NPCNetwork {
  nodeId: string;
  nodeName: string;
  connections: NPCConnection[];
  influence: number;
  faction?: string;
}

export interface NPCConnection {
  targetId: string;
  relationship: number;
  connectionType: 'ally' | 'rival' | 'neutral' | 'dependency';
  strength: number;
}

/**
 * NPC动态特质
 */
export interface NPCTrait {
  name: string;
  value: number; // -100 to 100
  description: string;
  effects: {
    onRelationship?: number;
    onDecision?: string[];
    onDialogue?: string[];
  };
}

/**
 * NPC行为模式
 */
export interface NPCBehaviorPattern {
  id: string;
  name: string;
  conditions: {
    relationshipRange: [number, number];
    playerStats?: Record<string, [number, number]>;
    roundRange?: [number, number];
    flags?: string[];
  };
  behaviors: {
    actionFrequency: number;
    dialogueStyle: string;
    helpWillingness: number;
    requestLikelihood: number;
  };
}

/**
 * NPC记忆系统
 */
export interface NPCMemory {
  playerId: string;
  memories: {
    positive: string[];
    negative: string[];
    neutral: string[];
    debts: string[];
    favors: string[];
  };
  lastUpdate: number;
  importanceScore: number;
}

/**
 * NPC调度器事件
 */
export interface NPCSchedulerEvent {
  id: string;
  npcId: string;
  triggerRound: number;
  eventType: 'agenda_check' | 'relationship_update' | 'special_event' | 'memory_decay';
  priority: number;
  isRecurring: boolean;
  condition?: (context: NPCEventContext) => boolean;
  action: (context: NPCEventContext) => void;
}