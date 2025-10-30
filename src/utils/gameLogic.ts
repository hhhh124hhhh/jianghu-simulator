import { PlayerStats, GameState } from '../types/game';
import { achievements } from '../data/achievements';

// 初始化玩家属性
export const initializePlayerStats = (): PlayerStats => ({
  martial: 0,
  fame: 0,
  network: 0,
  energy: 5, // 从0改为5，增加初始内力
  virtue: 0,
});

// 应用属性变化
export const applyStatsChange = (
  current: PlayerStats,
  changes: Partial<PlayerStats>
): PlayerStats => {
  return {
    martial: Math.max(0, current.martial + (changes.martial || 0)),
    fame: Math.max(0, current.fame + (changes.fame || 0)),
    network: Math.max(0, current.network + (changes.network || 0)),
    energy: Math.max(0, current.energy + (changes.energy || 0)),
    virtue: Math.max(0, current.virtue + (changes.virtue || 0)),
  };
};

// 初始化游戏状态
export const initializeGameState = (): GameState => ({
  currentRound: 0,
  maxRounds: 10,
  playerStats: initializePlayerStats(),
  questionnaire: null,
  eventHistory: [],
  randomEvents: [],
  achievements: achievements.map((ach) => ({ ...ach, unlocked: false })),
  isGameOver: false,
});

// 保存游戏进度
export const saveGameState = (state: GameState): void => {
  try {
    localStorage.setItem('jianghu-game-state', JSON.stringify(state));
    localStorage.setItem('jianghu-game-timestamp', new Date().toISOString());
  } catch (error) {
    console.error('保存游戏失败:', error);
  }
};

// 加载游戏进度
export const loadGameState = (): GameState | null => {
  try {
    const saved = localStorage.getItem('jianghu-game-state');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error('加载游戏失败:', error);
  }
  return null;
};

// 清除游戏进度
export const clearGameState = (): void => {
  try {
    localStorage.removeItem('jianghu-game-state');
    localStorage.removeItem('jianghu-game-timestamp');
  } catch (error) {
    console.error('清除游戏失败:', error);
  }
};

// 检查是否有存档
export const hasSavedGame = (): boolean => {
  return localStorage.getItem('jianghu-game-state') !== null;
};

// 获取属性名称
export const getStatName = (stat: keyof PlayerStats): string => {
  const names: Record<keyof PlayerStats, string> = {
    martial: '武艺',
    fame: '威望',
    network: '人脉',
    energy: '内力',
    virtue: '侠义值',
  };
  return names[stat];
};

// 获取属性描述
export const getStatDescription = (stat: keyof PlayerStats): string => {
  const descriptions: Record<keyof PlayerStats, string> = {
    martial: '战斗与策略行动能力',
    fame: '江湖名声、势力认可',
    network: '盟友、同门、帮派关系',
    energy: '体力/精神能量，用于高消耗行为',
    virtue: '心理状态与侠义感，影响决策和长期成长',
  };
  return descriptions[stat];
};

// 获取属性颜色
export const getStatColor = (stat: keyof PlayerStats): string => {
  const colors: Record<keyof PlayerStats, string> = {
    martial: 'stats-martial',
    fame: 'stats-fame',
    network: 'stats-network',
    energy: 'stats-energy',
    virtue: 'stats-virtue',
  };
  return colors[stat];
};

// 格式化属性变化显示
export const formatStatsChange = (changes: Partial<PlayerStats>): string[] => {
  const result: string[] = [];
  (Object.keys(changes) as Array<keyof PlayerStats>).forEach((key) => {
    const value = changes[key];
    if (value !== undefined && value !== 0) {
      const sign = value > 0 ? '+' : '';
      result.push(`${getStatName(key)} ${sign}${value}`);
    }
  });
  return result;
};

// 检查选项是否可用（基于内力消耗）
export const isOptionAvailable = (
  currentEnergy: number,
  energyChange: number
): boolean => {
  // 如果是消耗内力的选项（负值），检查当前内力是否足够
  if (energyChange < 0) {
    return Math.abs(energyChange) <= currentEnergy;
  }
  // 恢复内力的选项总是可用
  return true;
};

// 获取选项的内力消耗描述
export const getEnergyCostDescription = (energyChange: number): string => {
  if (energyChange === 0) return '';
  if (energyChange > 0) return `恢复${energyChange}内力`;
  return `消耗${Math.abs(energyChange)}内力`;
};

// 每轮结束自动恢复内力（模拟休息和调息）
export const recoverEnergyPerRound = (currentEnergy: number): number => {
  const ENERGY_MAX = 12; // 内力上限
  const RECOVERY_PER_ROUND = 1; // 每轮恢复1点
  
  return Math.min(ENERGY_MAX, currentEnergy + RECOVERY_PER_ROUND);
};
