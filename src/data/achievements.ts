import { Achievement, PlayerStats } from '../types/game';

// 成就系统
export const achievements: Achievement[] = [
  {
    id: 'ach-beginner',
    name: '初出江湖',
    description: '武艺达到5点或以上',
    condition: (stats: PlayerStats) => stats.martial >= 5,
    unlocked: false,
    bonus: { fame: 1 },
  },
  {
    id: 'ach-virtuous',
    name: '义薄云天',
    description: '侠义值达到8点或以上',
    condition: (stats: PlayerStats) => stats.virtue >= 8,
    unlocked: false,
    bonus: { network: 2 },
  },
  {
    id: 'ach-famous',
    name: '名震江湖',
    description: '威望达到15点或以上',
    condition: (stats: PlayerStats) => stats.fame >= 15,
    unlocked: false,
    bonus: { fame: 2, martial: 1 },
  },
  {
    id: 'ach-connected',
    name: '结交广泛',
    description: '人脉达到10点或以上',
    condition: (stats: PlayerStats) => stats.network >= 10,
    unlocked: false,
    bonus: { network: 2, fame: 1 },
  },
  {
    id: 'ach-energetic',
    name: '疾风内力',
    description: '内力达到5点或以上',
    condition: (stats: PlayerStats) => stats.energy >= 5,
    unlocked: false,
    bonus: { energy: 1 },
  },
  {
    id: 'ach-balanced',
    name: '全面发展',
    description: '所有属性均达到6点或以上',
    condition: (stats: PlayerStats) =>
      stats.martial >= 6 &&
      stats.fame >= 6 &&
      stats.network >= 6 &&
      stats.energy >= 6 &&
      stats.virtue >= 6,
    unlocked: false,
    bonus: { martial: 2, fame: 2, network: 2, energy: 2, virtue: 2 },
  },
  {
    id: 'ach-master',
    name: '武林宗师',
    description: '武艺达到12点或以上',
    condition: (stats: PlayerStats) => stats.martial >= 12,
    unlocked: false,
    bonus: { martial: 3, fame: 2 },
  },
  {
    id: 'ach-legend',
    name: '江湖传奇',
    description: '威望达到20点或以上',
    condition: (stats: PlayerStats) => stats.fame >= 20,
    unlocked: false,
    bonus: { fame: 5, martial: 2, network: 2 },
  },
];

// 检查并解锁成就
export const checkAchievements = (
  stats: PlayerStats,
  currentAchievements: Achievement[]
): Achievement[] => {
  return currentAchievements.map((achievement) => {
    if (!achievement.unlocked && achievement.condition(stats)) {
      return { ...achievement, unlocked: true };
    }
    return achievement;
  });
};

// 应用成就奖励
export const applyAchievementBonus = (
  stats: PlayerStats,
  achievement: Achievement
): PlayerStats => {
  if (!achievement.bonus) return stats;

  return {
    martial: stats.martial + (achievement.bonus.martial || 0),
    fame: stats.fame + (achievement.bonus.fame || 0),
    network: stats.network + (achievement.bonus.network || 0),
    energy: stats.energy + (achievement.bonus.energy || 0),
    virtue: stats.virtue + (achievement.bonus.virtue || 0),
  };
};
