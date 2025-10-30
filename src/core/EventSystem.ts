import { GameEvent, EventOption } from '../types/game';
import { Player } from './Player';
import { GameStateManager } from './GameState';
import { DelayedEffect, EventResult } from '../types/extended';
import { gameEvents } from '../data/events';
import { checkAchievements } from '../data/achievements';

/**
 * 事件系统类
 * 管理游戏事件的执行、延迟效果和随机事件
 */
export class EventSystem {
  private events: Map<number, GameEvent>;
  private delayedEffects: DelayedEffect[];
  private eventHooks: Map<string, ((context: any) => void)[]>;

  constructor() {
    this.events = new Map();
    this.delayedEffects = [];
    this.eventHooks = new Map();
    
    // 加载默认事件
    this.loadDefaultEvents();
  }

  /**
   * 加载默认事件数据
   */
  private loadDefaultEvents(): void {
    gameEvents.forEach(event => {
      this.events.set(event.id, event);
    });
  }

  /**
   * 注册新事件
   */
  registerEvent(event: GameEvent): void {
    this.events.set(event.id, event);
  }

  /**
   * 获取事件
   */
  getEvent(id: number): GameEvent | undefined {
    return this.events.get(id);
  }

  /**
   * 获取所有事件
   */
  getAllEvents(): GameEvent[] {
    return Array.from(this.events.values());
  }

  /**
   * 执行事件
   */
  executeEvent(
    player: Player, 
    gameState: GameStateManager, 
    event: GameEvent, 
    optionId: string
  ): EventResult {
    const option = event.options.find(opt => opt.id === optionId);
    
    if (!option) {
      return {
        success: false,
        effects: {},
        narration: '无效的选项'
      };
    }

    // 检查内力是否足够
    const energyCost = option.effects.energy || 0;
    if (player.stats.energy + energyCost < 0) {
      return {
        success: false,
        effects: {},
        narration: '内力不足，无法执行此选项'
      };
    }

    // 应用属性变化
    const oldStats = { ...player.stats };
    player.applyStatsChange(option.effects);

    // 应用NPC关系效果（如果存在）
    if (option.npcRelationshipEffects && option.npcRelationshipEffects.length > 0) {
      option.npcRelationshipEffects.forEach((effect) => {
        player.setRelationship(effect.npcId, effect.npcName, effect.relationshipChange, 
          effect.relationshipChange >= 30 ? 'friend' : 
          effect.relationshipChange <= -30 ? 'enemy' : 'neutral');
        console.log('NPC关系变化:', effect.npcName, effect.relationshipChange);
      });
    }

    
    // 检查并应用成就奖励（统一在这里处理）
    const currentStats = player.getCurrentStats();
    const currentAchievements = gameState.getAchievements();
    const updatedAchievements = checkAchievements(currentStats, currentAchievements);
    
    // 应用新解锁成就的奖励
    const newlyUnlocked = updatedAchievements.filter(
      (ach, index) => ach.unlocked && !currentAchievements[index]?.unlocked
    );
    
    if (newlyUnlocked.length > 0) {
      console.log('EventSystem: 应用新成就奖励', newlyUnlocked.map(ach => ach.name));
      newlyUnlocked.forEach((ach) => {
        if (ach.bonus) {
          player.applyStatsChange(ach.bonus);
        }
      });
      // 更新游戏状态中的成就
      gameState.updateAchievements(updatedAchievements);
    }

    // 添加事件历史
    player.addHistory({
      round: gameState.getCurrentRound(),
      type: 'event',
      description: `第${gameState.getCurrentRound() + 1}轮事件：${event.title}`,
      effects: option.effects,
      metadata: {
        eventId: event.id,
        selectedOption: optionId,
        optionDescription: option.description,
        achievementsUnlocked: newlyUnlocked.map(ach => ach.name)
      }
    });

    // 添加到游戏历史
    gameState.addEventHistory(event.id, optionId, option.effects);

    // 触发事件钩子
    this.triggerEventHooks('beforeEventComplete', {
      player,
      gameState,
      event,
      option,
      oldStats,
      newStats: player.stats
    });

    // 检查是否触发延迟效果
    const triggeredEffects = this.checkDelayedEffects(player, gameState);

    // 触发后置钩子
    this.triggerEventHooks('afterEventComplete', {
      player,
      gameState,
      event,
      option,
      oldStats,
      newStats: player.stats,
      triggeredEffects
    });

    return {
      success: true,
      effects: option.effects,
      delayedEffects: triggeredEffects,
      narration: `你选择了：${option.description}`
    };
  }

  /**
   * 注册延迟效果
   */
  registerDelayedEffect(effect: DelayedEffect, gameState?: GameStateManager): void {
    this.delayedEffects.push(effect);
    if (gameState) {
      gameState.addDelayedEffect(effect);
    }
  }

  /**
   * 处理当前回合的延迟效果
   */
  processDelayedEffects(player: Player, gameState: GameStateManager, round: number): DelayedEffect[] {
    const triggeredEffects: DelayedEffect[] = [];

    this.delayedEffects.forEach(effect => {
      if (effect.triggerRound === round && effect.isActive) {
        // 检查触发条件
        if (effect.condition(player, gameState)) {
          try {
            // 执行效果
            effect.effect(player, gameState);
            effect.isActive = false;
            triggeredEffects.push(effect);

            // 添加历史记录
            player.addHistory({
              round,
              type: 'delayed_effect',
              description: effect.description,
              effects: {},
              metadata: { effectId: effect.id, type: effect.type }
            });
          } catch (error) {
            console.error(`执行延迟效果失败 [${effect.id}]:`, error);
          }
        }
      }
    });

    return triggeredEffects;
  }

  /**
   * 检查新触发的延迟效果
   */
  private checkDelayedEffects(player: Player, gameState: GameStateManager): DelayedEffect[] {
    // 基于当前状态检查是否应该触发新的延迟效果
    const newEffects: DelayedEffect[] = [];

    // 示例：检查某些属性阈值，触发相应的延迟效果
    if (player.stats.fame >= 15 && !player.hasFlag('fame_threshold_reached')) {
      player.setFlag('fame_threshold_reached', true);
      // 可以在这里注册新的延迟效果
    }

    if (player.stats.martial >= 20 && !player.hasFlag('martial_master_achieved')) {
      player.setFlag('martial_master_achieved', true);
    }

    return newEffects;
  }

  /**
   * 注册事件钩子
   */
  registerEventHook(hookName: string, callback: (context: any) => void): void {
    if (!this.eventHooks.has(hookName)) {
      this.eventHooks.set(hookName, []);
    }
    this.eventHooks.get(hookName)!.push(callback);
  }

  /**
   * 触发事件钩子
   */
  public triggerEventHooks(hookName: string, context: any): void {
    const hooks = this.eventHooks.get(hookName);
    if (hooks) {
      hooks.forEach(hook => {
        try {
          hook(context);
        } catch (error) {
          console.error(`事件钩子执行失败 [${hookName}]:`, error);
        }
      });
    }
  }

  /**
   * 检查选项是否可用
   */
  isOptionAvailable(player: Player, option: EventOption): boolean {
    const energyChange = option.effects.energy || 0;
    return player.stats.energy + energyChange >= 0;
  }

  /**
   * 获取选项可用性状态
   */
  getOptionAvailability(player: Player, event: GameEvent): Map<string, boolean> {
    const availability = new Map<string, boolean>();
    
    event.options.forEach(option => {
      availability.set(option.id, this.isOptionAvailable(player, option));
    });

    return availability;
  }

  /**
   * 创建延迟效果工厂方法
   */
  static createDelayedEffect(params: {
    id: string;
    triggerRound: number;
    condition: (player: Player, gameState: GameStateManager) => boolean;
    effect: (player: Player, gameState: GameStateManager) => void;
    type: 'flag' | 'debt' | 'relationship' | 'stats' | 'event';
    description: string;
  }): DelayedEffect {
    return {
      ...params,
      isActive: true
    };
  }

  /**
   * 清理已完成的延迟效果
   */
  cleanupCompletedEffects(): void {
    this.delayedEffects = this.delayedEffects.filter(effect => effect.isActive);
  }

  /**
   * 获取活跃的延迟效果
   */
  getActiveDelayedEffects(): DelayedEffect[] {
    return this.delayedEffects.filter(effect => effect.isActive);
  }

  /**
   * 重置事件系统
   */
  reset(): void {
    this.delayedEffects = [];
    this.eventHooks.clear();
    this.loadDefaultEvents();
  }

  /**
   * 获取系统状态摘要
   */
  getSummary(): {
    totalEvents: number;
    activeDelayedEffects: number;
    registeredHooks: number;
  } {
    const hookCount = Array.from(this.eventHooks.values())
      .reduce((total, hooks) => total + hooks.length, 0);

    return {
      totalEvents: this.events.size,
      activeDelayedEffects: this.delayedEffects.filter(e => e.isActive).length,
      registeredHooks: hookCount
    };
  }
}