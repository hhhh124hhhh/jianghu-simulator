import { PlayerHistory, PlayerRelationship, FlagSystem, DebtEffect, GrudgeEffect } from '../types/extended';
import { PlayerStats, StoryFlags } from '../types/game';

// 为了兼容性，定义简化的属性类型
type SimplePlayerStats = PlayerStats;

/**
 * 玩家核心类
 * 管理玩家的所有状态、历史、关系和标志位
 */
export class Player implements FlagSystem {
  // 基础属性
  stats: PlayerStats;
  
  // 历史记录
  history: PlayerHistory[];
  
  // 关系系统
  relationships: Map<string, PlayerRelationship>;
  
  // 标志位系统
  flags: Map<string, any>;
  
  // 延迟效果
  debts: DebtEffect[];
  grudges: GrudgeEffect[];
  
  // 剧情状态标记
  storyFlags: StoryFlags;
  
  // 元数据
  name?: string;
  title?: string;
  background?: string;
  
  // 关系版本号，用于强制UI更新
  private _relationshipVersion: number = 0;
  
  constructor(initialStats?: Partial<PlayerStats>) {
    this.stats = {
      martial: 0,
      fame: 0,
      network: 0,
      energy: 5,
      virtue: 0,
      ...initialStats
    };
    
    this.history = [];
    this.relationships = new Map();
    this.flags = new Map();
    this.debts = [];
    this.grudges = [];
    
    // 初始化剧情状态标记
    this.storyFlags = {
      justicePath: 0,
      friendshipPath: 0,
      powerPath: 0,
      corruptionPath: 0,
      specialEvents: [],
      keyChoices: {}
    };
  }

  /**
   * 应用属性变化
   */
  applyStatsChange(changes: Partial<PlayerStats>): void {
    const oldStats = { ...this.stats };
    
    // 定义属性上限
    const ENERGY_MAX = 12; // 内力上限
    
    // 应用变化，确保不为负数（除了特殊属性）
    Object.entries(changes).forEach(([key, value]) => {
      if (value !== undefined && key in this.stats) {
        const currentValue = this.stats[key as keyof PlayerStats] || 0;
        let newValue = currentValue + value;
        
        // 应用属性上限
        if (key === 'energy') {
          newValue = Math.min(ENERGY_MAX, Math.max(0, newValue));
        } else {
          // 某些属性允许负值
          const allowNegative = ['virtue'].includes(key);
          newValue = allowNegative ? newValue : Math.max(0, newValue);
        }
        
        this.stats[key as keyof PlayerStats] = newValue;
        
        // 记录数值变化日志
        if (value !== 0) {
          console.log(`属性变化: ${key} ${currentValue} → ${newValue} (${value >= 0 ? '+' : ''}${value})`);
          
          // 异常检测
          if (Math.abs(value) > 10) {
            console.warn(`异常大的数值变化: ${key} 变化 ${value}，请检查是否合理`);
          }
          
          if (newValue > 30 && key !== 'energy') {
            console.warn(`属性值异常高: ${key} = ${newValue}，可能存在平衡问题`);
          }
        }
      }
    });
    
    // 记录历史
    this.addHistory({
      round: 0, // 将在RoundManager中设置
      type: 'event',
      description: '属性变化',
      effects: changes,
      metadata: { oldStats, newStats: this.stats }
    });
  }

  /**
   * 获取当前属性（兼容旧格式）
   */
  getCurrentStats(): PlayerStats {
    return {
      martial: this.stats.martial,
      fame: this.stats.fame,
      network: this.stats.network,
      energy: this.stats.energy,
      virtue: this.stats.virtue
    };
  }

  /**
   * 添加历史记录
   */
  addHistory(record: Omit<PlayerHistory, 'round'> & { round?: number }): void {
    this.history.push({
      round: record.round || 0,
      ...record
    });
  }

  /**
   * 关系系统方法
   */
  setRelationship(targetId: string, targetName: string, value: number, type: PlayerRelationship['type'] = 'neutral'): void {
    const oldValue = this.relationships.get(targetId)?.value;
    const newValue = Math.max(-100, Math.min(100, value));
    
    this.relationships.set(targetId, {
      targetId,
      targetName,
      value: newValue,
      type
    });
    
    // 只有在关系值发生变化时才增加版本号
    if (oldValue !== newValue) {
      this._relationshipVersion++;
      console.log(`关系更新: ${targetName} ${oldValue || 0} → ${newValue} (版本: ${this._relationshipVersion})`);
    }
  }

  getRelationship(targetId: string): PlayerRelationship | undefined {
    return this.relationships.get(targetId);
  }

  modifyRelationship(targetId: string, delta: number): void {
    const relationship = this.relationships.get(targetId);
    if (relationship) {
      const oldValue = relationship.value;
      const newValue = Math.max(-100, Math.min(100, relationship.value + delta));
      
      relationship.value = newValue;
      
      // 自动更新关系类型
      if (newValue > 60) {
        relationship.type = 'friend';
      } else if (newValue < -60) {
        relationship.type = 'enemy';
      } else {
        relationship.type = 'neutral';
      }
      
      // 只有在关系值发生变化时才增加版本号
      if (oldValue !== newValue) {
        this._relationshipVersion++;
        console.log(`关系修改: ${relationship.targetName} ${oldValue} → ${newValue} (变化: ${delta >= 0 ? '+' : ''}${delta}, 版本: ${this._relationshipVersion})`);
      }
    }
  }

  hasRelationship(targetId: string): boolean {
    return this.relationships.has(targetId);
  }

  /**
   * 标志位系统实现
   */
  setFlag(key: string, value: any): void {
    this.flags.set(key, value);
  }

  getFlag(key: string): any {
    return this.flags.get(key);
  }

  hasFlag(key: string): boolean {
    return this.flags.has(key);
  }

  clearFlag(key: string): void {
    this.flags.delete(key);
  }

  /**
   * 债务系统
   */
  addDebt(debt: Omit<DebtEffect, 'isRepaid'>): void {
    this.debts.push({
      ...debt,
      isRepaid: false
    });
  }

  repayDebt(debtId: string): boolean {
    const debt = this.debts.find(d => d.id === debtId);
    if (debt && !debt.isRepaid) {
      debt.isRepaid = true;
      return true;
    }
    return false;
  }

  getActiveDebts(): DebtEffect[] {
    return this.debts.filter(d => !d.isRepaid);
  }

  /**
   * 怨恨系统
   */
  addGrudge(grudge: Omit<GrudgeEffect, 'isActive'>): void {
    this.grudges.push({
      ...grudge,
      isActive: true
    });
  }

  resolveGrudge(grudgeId: string): boolean {
    const grudge = this.grudges.find(g => g.id === grudgeId);
    if (grudge && grudge.isActive) {
      grudge.isActive = false;
      return true;
    }
    return false;
  }

  getActiveGrudges(): GrudgeEffect[] {
    return this.grudges.filter(g => g.isActive);
  }

  /**
   * 获取玩家状态摘要
   */
  getSummary(): {
    stats: PlayerStats;
    relationshipCount: number;
    activeDebts: number;
    activeGrudges: number;
    flagsCount: number;
    historyLength: number;
  } {
    return {
      stats: { ...this.stats },
      relationshipCount: this.relationships.size,
      activeDebts: this.getActiveDebts().length,
      activeGrudges: this.getActiveGrudges().length,
      flagsCount: this.flags.size,
      historyLength: this.history.length
    };
  }

  /**
   * 获取关系版本号
   */
  getRelationshipVersion(): number {
    return this._relationshipVersion;
  }

  /**
   * 克隆玩家状态（用于存档/读档）
   */
  clone(): Player {
    const cloned = new Player(this.stats as PlayerStats);
    cloned.history = [...this.history];
    cloned.relationships = new Map(this.relationships);
    cloned.flags = new Map(this.flags);
    cloned.debts = [...this.debts];
    cloned.grudges = [...this.grudges];
    cloned.name = this.name;
    cloned.title = this.title;
    cloned.background = this.background;
    return cloned;
  }

  /**
   * 从数据恢复玩家状态
   */
  static fromData(data: any): Player {
    const player = new Player(data.stats);
    player.history = data.history || [];
    player.relationships = new Map(data.relationships || []);
    player.flags = new Map(data.flags || []);
    player.debts = data.debts || [];
    player.grudges = data.grudges || [];
    player.name = data.name;
    player.title = data.title;
    player.background = data.background;
    player.storyFlags = data.storyFlags || player.storyFlags;
    return player;
  }

  /**
   * 更新剧情状态标记
   */
  updateStoryFlag(flag: keyof StoryFlags, value: any): void {
    switch (flag) {
      case 'justicePath':
      case 'friendshipPath':
      case 'powerPath':
      case 'corruptionPath':
        this.storyFlags[flag] = Math.max(0, Math.min(10, this.storyFlags[flag] + value));
        break;
      case 'specialEvents':
        if (!this.storyFlags.specialEvents.includes(value)) {
          this.storyFlags.specialEvents.push(value);
        }
        break;
      case 'keyChoices':
        this.storyFlags.keyChoices = value;
        break;
    }
    
    console.log(`剧情状态更新: ${flag} = ${this.storyFlags[flag]}`);
  }

  /**
   * 记录关键选择
   */
  recordKeyChoice(round: number, optionId: string, effects?: any): void {
    this.storyFlags.keyChoices[round] = optionId;
    
    // 根据选择更新剧情路径
    this.updateStoryPaths(round, optionId, effects);
    
    console.log(`关键选择记录: 第${round}轮选择${optionId} (使用1-based索引)`);
  }

  /**
   * 根据选择更新剧情路径
   */
  private updateStoryPaths(round: number, optionId: string, effects?: any): void {
    switch (round) {
      case 2: // 第2轮：街市冲突（注意：现在是1-based索引）
        if (optionId === 'A') {
          this.updateStoryFlag('justicePath', 4);
          console.log('第2轮-正义路线+4：挺身而出（英雄路线起点）');
        } else if (optionId === 'B') {
          this.updateStoryFlag('justicePath', -2);
          this.updateStoryFlag('corruptionPath', 1);
          console.log('第2轮-正义路线-2，堕落路线+1：袖手旁观');
        } else if (optionId === 'C') {
          this.updateStoryFlag('justicePath', 3);
          this.updateStoryFlag('powerPath', 1);
          console.log('第2轮-正义路线+3，实力路线+1：劝和（智者路线起点）');
        }
        break;
        
      case 4: // 第4轮：结交盟友
        if (optionId === 'A') {
          this.updateStoryFlag('friendshipPath', 3);
          this.updateStoryFlag('justicePath', 1); // 主动结交也是正义行为
          console.log('第4轮-友情路线+3，正义路线+1：主动结交');
        } else if (optionId === 'B') {
          this.updateStoryFlag('friendshipPath', 2);
          this.updateStoryFlag('justicePath', 1);
          console.log('第4轮-友情路线+2，正义路线+1：暗中帮助');
        } else if (optionId === 'C') {
          this.updateStoryFlag('friendshipPath', -1);
          console.log('第4轮-友情路线-1：保持距离');
        }
        break;
        
      case 7: // 第7轮：秘密交易
        if (optionId === 'A') {
          this.updateStoryFlag('corruptionPath', 4);
          this.updateStoryFlag('justicePath', -2);
          console.log('第7轮-堕落路线+4，正义路线-2：接受交易');
        } else if (optionId === 'B') {
          this.updateStoryFlag('justicePath', 2);
          console.log('第7轮-正义路线+2：上报门派');
        } else if (optionId === 'C') {
          this.updateStoryFlag('justicePath', 1);
          this.updateStoryFlag('corruptionPath', -1);
          console.log('第7轮-正义路线+1，堕落路线-1：拒绝诱惑');
        }
        break;
        
      case 8: // 突发灾难（从事件ID判断）
        // 这个会在事件执行时额外处理，因为需要根据具体选择判断
        break;
    }
  }

  /**
   * 检查是否满足分支条件
   */
  checkBranchCondition(branchType: string, requiredValue: number): boolean {
    switch (branchType) {
      case 'justice':
        return this.storyFlags.justicePath >= requiredValue;
      case 'friendship':
        return this.storyFlags.friendshipPath >= requiredValue;
      case 'power':
        return this.storyFlags.powerPath >= requiredValue;
      case 'corruption':
        return this.storyFlags.corruptionPath >= requiredValue;
      default:
        return false;
    }
  }

  /**
   * 获取剧情状态摘要
   */
  getStoryFlagsSummary(): StoryFlags & { dominantPath: string } {
    const flags = { ...this.storyFlags };
    const paths = [
      { name: 'justice', value: flags.justicePath },
      { name: 'friendship', value: flags.friendshipPath },
      { name: 'power', value: flags.powerPath },
      { name: 'corruption', value: flags.corruptionPath }
    ];
    
    const dominantPath = paths.reduce((max, current) => 
      current.value > max.value ? current : max
    ).name;
    
    return { ...flags, dominantPath };
  }
}