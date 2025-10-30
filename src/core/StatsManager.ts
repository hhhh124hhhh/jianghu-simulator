import { ExtendedPlayerStats } from '../types/extended';
import { PlayerStats } from '../types/game';
import { Player } from './Player';

/**
 * 属性变化规则
 */
export interface StatsRule {
  name: string;
  description: string;
  condition: (stats: ExtendedPlayerStats) => boolean;
  effect: (stats: ExtendedPlayerStats) => Partial<ExtendedPlayerStats>;
  priority: number;
  isActive: boolean;
}

/**
 * 属性限制配置
 */
export interface StatsLimits {
  min: Partial<ExtendedPlayerStats>;
  max: Partial<ExtendedPlayerStats>;
  allowNegative: (keyof ExtendedPlayerStats)[];
}

/**
 * 属性管理器
 * 负责属性计算、验证、规则应用等
 */
export class StatsManager {
  private rules: StatsRule[] = [];
  private limits: StatsLimits;
  private defaultStats: ExtendedPlayerStats;

  constructor() {
    this.limits = this.initializeDefaultLimits();
    this.defaultStats = this.initializeDefaultStats();
    this.initializeDefaultRules();
  }

  /**
   * 初始化默认属性限制
   */
  private initializeDefaultLimits(): StatsLimits {
    return {
      min: {
        martial: 0,
        fame: -50,
        network: 0,
        energy: 0,
        virtue: -100,
        mentalState: 0,
        skillPotential: 0,
        luck: 0,
        reputation: -100
      },
      max: {
        martial: 100,
        fame: 100,
        network: 100,
        energy: 12,
        virtue: 100,
        mentalState: 100,
        skillPotential: 100,
        luck: 100,
        reputation: 100
      },
      allowNegative: ['virtue', 'fame', 'reputation']
    };
  }

  /**
   * 初始化默认属性值
   */
  private initializeDefaultStats(): ExtendedPlayerStats {
    return {
      martial: 0,
      fame: 0,
      network: 0,
      energy: 5,
      virtue: 0,
      mentalState: 50,
      skillPotential: 50,
      luck: 50,
      reputation: 0
    };
  }

  /**
   * 初始化默认属性规则
   */
  private initializeDefaultRules(): void {
    // 规则：内力恢复
    this.addRule({
      name: 'energy_recovery',
      description: '每轮自动恢复1点内力',
      condition: (stats) => stats.energy < this.limits.max.energy! - 1,
      effect: (stats) => ({ energy: 1 }),
      priority: 1,
      isActive: true
    });

    // 规则：心理健康影响
    this.addRule({
      name: 'mental_health_impact',
      description: '心理健康低于20时，其他属性增长减半',
      condition: (stats) => stats.mentalState! < 20,
      effect: (stats) => {
        // 这个规则会在applyChangesWithRules中特殊处理
        return {};
      },
      priority: 2,
      isActive: true
    });

    // 规则：声望阈值影响
    this.addRule({
      name: 'fame_threshold',
      description: '声望达到80时，获得威望加成',
      condition: (stats) => stats.fame >= 80,
      effect: (stats) => ({ reputation: 5 }),
      priority: 3,
      isActive: true
    });

    // 规则：侠义值影响
    this.addRule({
      name: 'virtue_impact',
      description: '侠义值极高或极低时影响关系',
      condition: (stats) => Math.abs(stats.virtue) >= 50,
      effect: (stats) => {
        const relationshipBonus = stats.virtue > 0 ? 2 : -1;
        return { 
          network: relationshipBonus,
          mentalState: stats.virtue > 0 ? 5 : -5
        };
      },
      priority: 4,
      isActive: true
    });
  }

  /**
   * 添加属性规则
   */
  addRule(rule: StatsRule): void {
    this.rules.push(rule);
    // 按优先级排序
    this.rules.sort((a, b) => a.priority - b.priority);
  }

  /**
   * 移除属性规则
   */
  removeRule(ruleName: string): boolean {
    const index = this.rules.findIndex(rule => rule.name === ruleName);
    if (index !== -1) {
      this.rules.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * 激活/停用规则
   */
  setRuleActive(ruleName: string, isActive: boolean): boolean {
    const rule = this.rules.find(r => r.name === ruleName);
    if (rule) {
      rule.isActive = isActive;
      return true;
    }
    return false;
  }

  /**
   * 应用属性变化（带规则处理）
   */
  applyChangesWithRules(
    currentStats: ExtendedPlayerStats, 
    changes: Partial<ExtendedPlayerStats>,
    context?: { round?: number; eventType?: string }
  ): ExtendedPlayerStats {
    const newStats = { ...currentStats };

    // 首先应用基础变化
    Object.entries(changes).forEach(([key, value]) => {
      if (value !== undefined && key in newStats) {
        const currentValue = newStats[key as keyof ExtendedPlayerStats] || 0;
        let newValue = currentValue + value;

        // 应用心理健康影响规则
        if (this.rules.find(r => r.name === 'mental_health_impact')?.isActive && 
            newStats.mentalState! < 20 && 
            value > 0) {
          newValue = currentValue + Math.floor(value / 2);
        }

        newStats[key as keyof ExtendedPlayerStats] = this.clampStatValue(
          key as keyof ExtendedPlayerStats,
          newValue
        );
      }
    });

    // 然后应用激活的规则
    this.rules
      .filter(rule => rule.isActive && rule.condition(newStats))
      .forEach(rule => {
        const ruleEffect = rule.effect(newStats);
        Object.entries(ruleEffect).forEach(([key, value]) => {
          if (value !== undefined && key in newStats) {
            const currentValue = newStats[key as keyof ExtendedPlayerStats] || 0;
            newStats[key as keyof ExtendedPlayerStats] = this.clampStatValue(
              key as keyof ExtendedPlayerStats,
              currentValue + value
            );
          }
        });
      });

    return newStats;
  }

  /**
   * 限制属性值在合法范围内
   */
  private clampStatValue(
    key: keyof ExtendedPlayerStats, 
    value: number
  ): number {
    const min = this.limits.min[key] ?? 0;
    const max = this.limits.max[key] ?? 100;
    const allowNegative = this.limits.allowNegative.includes(key);

    if (!allowNegative && value < 0) {
      return min;
    }

    return Math.max(min, Math.min(max, value));
  }

  /**
   * 验证属性值是否合法
   */
  validateStats(stats: ExtendedPlayerStats): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    Object.entries(stats).forEach(([key, value]) => {
      const statKey = key as keyof ExtendedPlayerStats;
      const min = this.limits.min[statKey];
      const max = this.limits.max[statKey];
      const allowNegative = this.limits.allowNegative.includes(statKey);

      if (min !== undefined && value < min) {
        if (!allowNegative) {
          errors.push(`${key} 低于最小值 ${min}`);
        } else {
          warnings.push(`${key} 低于建议值 ${min}`);
        }
      }

      if (max !== undefined && value > max) {
        warnings.push(`${key} 超过最大值 ${max}`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * 计算属性评分
   */
  calculateStatsScore(stats: ExtendedPlayerStats): {
    totalScore: number;
    combatScore: number;
    socialScore: number;
    survivalScore: number;
    details: Record<string, number>;
  } {
    const details: Record<string, number> = {};

    // 战斗能力评分
    details.martial = stats.martial * 10;
    details.energy = stats.energy * 8;
    
    // 社交能力评分
    details.fame = stats.fame * 7;
    details.network = stats.network * 9;
    details.reputation = stats.reputation || 0 * 6;
    
    // 生存发展评分
    details.virtue = Math.abs(stats.virtue) * 5;
    details.mentalState = stats.mentalState! * 4;
    details.skillPotential = stats.skillPotential! * 3;
    details.luck = stats.luck! * 2;

    const combatScore = details.martial + details.energy;
    const socialScore = details.fame + details.network + (details.reputation || 0);
    const survivalScore = details.virtue + details.mentalState + details.skillPotential + details.luck;
    const totalScore = combatScore + socialScore + survivalScore;

    return {
      totalScore,
      combatScore,
      socialScore,
      survivalScore,
      details
    };
  }

  /**
   * 获取属性建议
   */
  getStatsAdvice(stats: ExtendedPlayerStats): string[] {
    const advice: string[] = [];

    // 基于属性值给出建议
    if (stats.martial < 10) {
      advice.push('武艺较低，建议多参与战斗相关的训练');
    }

    if (stats.energy < 3) {
      advice.push('内力不足，需要休息调息');
    }

    if (stats.fame < 5) {
      advice.push('威望不高，可以考虑多参与江湖事务');
    }

    if (stats.network < 5) {
      advice.push('人脉薄弱，建议多结交江湖朋友');
    }

    if (stats.virtue < -20) {
      advice.push('侠义值过低，可能招致非议');
    }

    if (stats.mentalState! < 30) {
      advice.push('心理状态不佳，需要调节心情');
    }

    // 组合建议
    if (stats.martial > 20 && stats.fame < 10) {
      advice.push('武艺高强但威望不足，可以考虑扬名立万');
    }

    if (stats.network > 20 && stats.virtue > 30) {
      advice.push('人脉广阔且德行高尚，适合成为领袖人物');
    }

    return advice;
  }

  /**
   * 比较属性变化
   */
  compareStats(oldStats: ExtendedPlayerStats, newStats: ExtendedPlayerStats): {
    improved: string[];
    declined: string[];
    unchanged: string[];
    summary: string;
  } {
    const improved: string[] = [];
    const declined: string[] = [];
    const unchanged: string[] = [];

    Object.keys(newStats).forEach(key => {
      const statKey = key as keyof ExtendedPlayerStats;
      const oldValue = oldStats[statKey] || 0;
      const newValue = newStats[statKey] || 0;

      if (newValue > oldValue) {
        improved.push(`${this.getStatDisplayName(statKey)} +${newValue - oldValue}`);
      } else if (newValue < oldValue) {
        declined.push(`${this.getStatDisplayName(statKey)} ${newValue - oldValue}`);
      } else {
        unchanged.push(this.getStatDisplayName(statKey));
      }
    });

    const summary = this.generateChangeSummary(improved, declined);

    return { improved, declined, unchanged, summary };
  }

  /**
   * 获取属性显示名称
   */
  private getStatDisplayName(key: keyof ExtendedPlayerStats): string {
    const displayNames: Record<string, string> = {
      martial: '武艺',
      fame: '威望',
      network: '人脉',
      energy: '内力',
      virtue: '侠义值',
      mentalState: '心理状态',
      skillPotential: '技能潜力',
      luck: '运气',
      reputation: '名声'
    };

    return displayNames[key] || key;
  }

  /**
   * 生成变化总结
   */
  private generateChangeSummary(improved: string[], declined: string[]): string {
    if (improved.length === 0 && declined.length === 0) {
      return '属性无明显变化';
    }

    const improvements = improved.length > 0 ? improved.join('、') : '';
    const declines = declined.length > 0 ? declined.join('、') : '';

    if (improvements && declines) {
      return `${improvements}，但${declines}`;
    } else if (improvements) {
      return `${improvements}`;
    } else {
      return `${declines}`;
    }
  }

  /**
   * 获取默认属性
   */
  getDefaultStats(): ExtendedPlayerStats {
    return { ...this.defaultStats };
  }

  /**
   * 获取属性限制
   */
  getLimits(): StatsLimits {
    return { ...this.limits };
  }

  /**
   * 设置属性限制
   */
  setLimits(limits: Partial<StatsLimits>): void {
    this.limits = { ...this.limits, ...limits };
  }

  /**
   * 获取所有规则
   */
  getRules(): StatsRule[] {
    return [...this.rules];
  }

  /**
   * 重置为默认规则
   */
  resetToDefaultRules(): void {
    this.rules = [];
    this.initializeDefaultRules();
  }
}