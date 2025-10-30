import { ExtendedPlayerStats, PlayerHistory, PlayerRelationship, FlagSystem, DebtEffect, GrudgeEffect } from '../types/extended';
import { PlayerStats } from '../types/game';

/**
 * 玩家核心类
 * 管理玩家的所有状态、历史、关系和标志位
 */
export class Player implements FlagSystem {
  // 基础属性
  stats: ExtendedPlayerStats;
  
  // 历史记录
  history: PlayerHistory[];
  
  // 关系系统
  relationships: Map<string, PlayerRelationship>;
  
  // 标志位系统
  flags: Map<string, any>;
  
  // 延迟效果
  debts: DebtEffect[];
  grudges: GrudgeEffect[];
  
  // 元数据
  name?: string;
  title?: string;
  background?: string;
  
  // 关系版本号，用于强制UI更新
  private _relationshipVersion: number = 0;
  
  constructor(initialStats?: Partial<ExtendedPlayerStats>) {
    this.stats = {
      martial: 0,
      fame: 0,
      network: 0,
      energy: 5,
      virtue: 0,
      mentalState: 50,
      skillPotential: 50,
      luck: 50,
      reputation: 0,
      ...initialStats
    };
    
    this.history = [];
    this.relationships = new Map();
    this.flags = new Map();
    this.debts = [];
    this.grudges = [];
  }

  /**
   * 应用属性变化
   */
  applyStatsChange(changes: Partial<ExtendedPlayerStats>): void {
    const oldStats = { ...this.stats };
    
    // 定义属性上限
    const ENERGY_MAX = 12; // 内力上限
    
    // 应用变化，确保不为负数（除了特殊属性）
    Object.entries(changes).forEach(([key, value]) => {
      if (value !== undefined && key in this.stats) {
        const currentValue = this.stats[key as keyof ExtendedPlayerStats] || 0;
        let newValue = currentValue + value;
        
        // 应用属性上限
        if (key === 'energy') {
          newValue = Math.min(ENERGY_MAX, Math.max(0, newValue));
        } else {
          // 某些属性允许负值
          const allowNegative = ['virtue'].includes(key);
          newValue = allowNegative ? newValue : Math.max(0, newValue);
        }
        
        this.stats[key as keyof ExtendedPlayerStats] = newValue;
        
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
    stats: ExtendedPlayerStats;
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
    const cloned = new Player(this.stats);
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
    return player;
  }
}