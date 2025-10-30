// 游戏数据类型定义

// 五维属性
export interface PlayerStats {
  martial: number; // 武艺
  fame: number; // 威望/声望
  network: number; // 人脉
  energy: number; // 内力
  virtue: number; // 侠义值
}

// 问卷答案
export interface QuestionnaireAnswers {
  background: string; // 身份背景
  personality: string; // 性格类型
  ambition: string; // 江湖抱负
  age: string; // 年龄
  talent: string; // 兴趣特长
}

// NPC关系影响
export interface NPCRelationshipEffect {
  npcId: string;
  npcName: string;
  relationshipChange: number;
  reason?: string;
}

// 事件选项
export interface EventOption {
  id: string;
  label: string;
  description: string;
  effects: Partial<PlayerStats>;
  npcRelationshipEffects?: NPCRelationshipEffect[];
  consequences?: string[]; // 长期后果提示
  requiresConfirmation?: boolean; // 是否需要确认
}

// 游戏事件
export interface GameEvent {
  id: number;
  title: string;
  description: string;
  options: EventOption[];
}

// 随机事件
export interface RandomEvent {
  id: string;
  type: 'battle' | 'social' | 'strategy' | 'natural' | 'mystery' | 'negative';
  title: string;
  description: string;
  effects: Partial<PlayerStats>;
}

// 成就
export interface Achievement {
  id: string;
  name: string;
  description: string;
  condition: (stats: PlayerStats) => boolean;
  unlocked: boolean;
  bonus?: Partial<PlayerStats>;
}

// 游戏状态
export interface GameState {
  currentRound: number;
  maxRounds: number;
  playerStats: PlayerStats;
  questionnaire: QuestionnaireAnswers | null;
  eventHistory: Array<{
    round: number;
    eventId: number;
    selectedOption: string;
    effects: Partial<PlayerStats>;
  }>;
  randomEvents: Array<{
    round: number;
    event: RandomEvent;
  }>;
  achievements: Achievement[];
  isGameOver: boolean;
}

// 剧情状态标记
export interface StoryFlags {
  justicePath: number;      // 正义路线指数 (0-10)
  friendshipPath: number;   // 友情路线指数 (0-10) 
  powerPath: number;        // 实力路线指数 (0-10)
  corruptionPath: number;   // 堕落路线指数 (0-10)
  specialEvents: string[];  // 已触发的特殊事件
  keyChoices: Record<number, string>; // 关键选择记录 (round -> optionId)
}

// 游戏阶段
export type GamePhase = 'start' | 'questionnaire' | 'playing' | 'result';
