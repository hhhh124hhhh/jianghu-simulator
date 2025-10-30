// 扩展类型定义 - 支持重构后的架构

// 扩展玩家属性
export interface ExtendedPlayerStats {
  // 基础五维属性
  martial: number; // 武艺
  fame: number; // 威望/声望
  network: number; // 人脉
  energy: number; // 内力
  virtue: number; // 侠义值
  
  // 可扩展属性
  mentalState?: number; // 心理状态
  skillPotential?: number; // 技能潜力
  luck?: number; // 运气
  reputation?: number; // 名声
}

// 玩家历史记录
export interface PlayerHistory {
  round: number;
  type: 'event' | 'random' | 'achievement' | 'delayed_effect';
  description: string;
  effects: Partial<ExtendedPlayerStats>;
  metadata?: Record<string, any>;
}

// 玩家关系
export interface PlayerRelationship {
  targetId: string;
  targetName: string;
  value: number; // -100 到 100
  type: 'friend' | 'enemy' | 'neutral' | 'mentor' | 'rival';
}

// 导出Player类（前向声明由实际类定义提供）
export { Player } from '../core/Player';

// 前向声明，避免循环依赖
interface Player {
  stats: any;
  applyStatsChange: (changes: any) => void;
  addHistory: (record: any) => void;
  hasFlag: (key: string) => boolean;
  setFlag: (key: string, value: any) => void;
}

// 延迟效果类型
export interface DelayedEffect {
  id: string;
  triggerRound: number;
  condition: (player: Player, gameState: any) => boolean;
  effect: (player: Player, gameState: any) => void;
  type: 'flag' | 'debt' | 'relationship' | 'stats' | 'event';
  description: string;
  isActive: boolean;
}

// 事件执行结果
export interface EventResult {
  success: boolean;
  effects: Partial<ExtendedPlayerStats>;
  newAchievements?: string[];
  delayedEffects?: DelayedEffect[];
  narration?: string;
}

// 回合结果
export interface RoundResult {
  round: number;
  mainEvent: any;
  randomEvents?: any[];
  achievements?: string[];
  delayedEffectsTriggered?: string[];
  isGameOver: boolean;
}

// NPC关系状态枚举
export enum NPCRelationshipStatus {
  HOSTILE = 'hostile',      // 敌对 (-100 到 -30)
  DISTRUSTFUL = 'distrustful', // 不信任 (-30 到 -10)
  NEUTRAL = 'neutral',      // 中立 (-10 到 10)
  FRIENDLY = 'friendly',    // 友好 (10 到 30)
  TRUSTED = 'trusted',      // 信任 (30 到 60)
  ALLY = 'ally'            // 盟友 (60 到 100)
}

// NPC相关类型
export interface NPC {
  id: string;
  name: string;
  title?: string;
  description: string;
  relationship: number;
  availability: boolean;
  agenda: Agenda & { id?: string };
  traits: string[];
}

export interface Agenda {
  goals: AgendaGoal[];
  triggers: AgendaTrigger[];
  actions: AgendaAction[];
  priority: number;
}

export interface AgendaGoal {
  id: string;
  description: string;
  targetValue: number;
  currentValue: number;
  type: 'relationship' | 'stats' | 'event' | 'item';
}

export interface AgendaTrigger {
  type: 'round' | 'player_stats' | 'relationship' | 'event';
  condition: (context: any) => boolean;
  threshold?: number;
}

export interface AgendaAction {
  id: string;
  type: 'dialogue' | 'event' | 'request' | 'help' | 'conflict';
  content: any;
  requirements?: Record<string, any>;
  effects?: Partial<ExtendedPlayerStats>;
}

// 标志位系统
export interface FlagSystem {
  flags: Map<string, any>;
  setFlag(key: string, value: any): void;
  getFlag(key: string): any;
  hasFlag(key: string): boolean;
  clearFlag(key: string): void;
}

// 延迟因果相关
export interface DebtEffect {
  id: string;
  creditor: string; // 债权人（可以是NPC或事件）
  type: 'favor' | 'money' | 'action' | 'information';
  amount: number;
  description: string;
  dueRound?: number;
  isRepaid: boolean;
}

export interface GrudgeEffect {
  id: string;
  target: string; // 结怨对象
  type: 'insult' | 'betrayal' | 'injury' | 'loss';
  severity: number; // 1-10
  description: string;
  isActive: boolean;
}