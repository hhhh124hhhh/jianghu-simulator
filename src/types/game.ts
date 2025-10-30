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

// 事件选项
export interface EventOption {
  id: string;
  label: string;
  description: string;
  effects: Partial<PlayerStats>;
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
  type: 'battle' | 'social' | 'strategy' | 'natural' | 'mystery';
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

// 游戏阶段
export type GamePhase = 'start' | 'questionnaire' | 'playing' | 'result';
