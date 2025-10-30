import { Player } from './Player';
import { GameStateManager } from './GameState';
import { EventSystem } from './EventSystem';
import { GameEvent } from '../types/game';
import { RoundResult, DelayedEffect } from '../types/extended';
import { getRandomEvent, getRandomEventFiltered } from '../data/randomEvents';
import { getNPCEvent, checkNPCEventTrigger } from '../data/npcEvents';
import { checkAchievements } from '../data/achievements';

/**
 * 回合管理器
 * 管理游戏轮次流程、事件触发和游戏进程
 */
export class RoundManager {
  private eventSystem: EventSystem;
  private gameState: GameStateManager;
  private currentEvent: GameEvent | null = null;
  private randomEvents: any[] = [];
  private triggeredRandomEventIds: Set<string> = new Set(); // 记录已触发的随机事件ID
  private isProcessingRound: boolean = false;

  constructor(gameState: GameStateManager) {
    this.gameState = gameState;
    this.eventSystem = new EventSystem();
    this.initializeEventHooks();
  }

  /**
   * 初始化事件钩子
   */
  private initializeEventHooks(): void {
    // 注册回合开始钩子
    this.eventSystem.registerEventHook('roundStart', (context: any) => {
      console.log(`回合 ${context.round} 开始`);
    });

    // 注册回合结束钩子
    this.eventSystem.registerEventHook('roundEnd', (context: any) => {
      console.log(`回合 ${context.round} 结束`);
    });
  }

  /**
   * 开始新游戏
   */
  startNewGame(): RoundResult {
    this.gameState.reset();
    this.eventSystem.reset();
    this.currentEvent = null;
    this.randomEvents = [];
    this.triggeredRandomEventIds.clear(); // 清空已触发事件记录
    this.isProcessingRound = false;

    console.log('开始新游戏，重置随机事件池');
    return this.startRound(0);
  }

  /**
   * 开始指定回合
   */
  startRound(roundNumber?: number): RoundResult {
    if (this.isProcessingRound) {
      throw new Error('当前回合正在处理中');
    }

    this.isProcessingRound = true;
    
    try {
      const round = roundNumber ?? this.gameState.getCurrentRound();
      
      // 设置当前回合
      this.gameState.setCurrentRound(round);
      
      // 每轮开始时恢复内力（除了第一轮）
      if (round > 0) {
        const player = this.gameState.getPlayer();
        player.applyStatsChange({ energy: 1 });
        console.log(`回合 ${round} 开始，恢复1点内力`);
      }
      
      // 触发回合开始钩子
      this.eventSystem.triggerEventHooks('roundStart', {
        round,
        player: this.gameState.getPlayer(),
        gameState: this.gameState
      });

      // 处理延迟效果
      const delayedEffects = this.processDelayedEffects(round);

      // 获取当前回合的主事件
      this.currentEvent = this.getMainEvent(round);

      // 触发回合准备完成钩子
      this.eventSystem.triggerEventHooks('roundReady', {
        round,
        mainEvent: this.currentEvent,
        randomEvents: [],
        player: this.gameState.getPlayer(),
        gameState: this.gameState
      });

      // 检查游戏是否结束
      const isGameOver = this.checkGameOver();

      return {
        round,
        mainEvent: this.currentEvent,
        randomEvents: [],
        delayedEffectsTriggered: delayedEffects.map(e => e.id),
        isGameOver
      };

    } finally {
      this.isProcessingRound = false;
    }
  }

  /**
   * 执行当前回合的事件选择
   */
  executeCurrentEvent(optionId: string): RoundResult {
    if (!this.currentEvent) {
      throw new Error('没有当前可执行的事件');
    }

    if (this.isProcessingRound) {
      throw new Error('回合正在处理中');
    }

    this.isProcessingRound = true;

    try {
      const player = this.gameState.getPlayer();
      const round = this.gameState.getCurrentRound();

      // 执行主事件
      const eventResult = this.eventSystem.executeEvent(
        player,
        this.gameState,
        this.currentEvent,
        optionId
      );

      // 处理NPC事件后果（如果当前是NPC事件）
      if (this.currentEvent.id >= 1000) {
        // 这是NPC事件，需要处理后果
        // 注意：这里需要获取NPCManager来处理后果
        // 由于RoundManager中没有直接引用NPCManager，我们需要通过GameStateManager传递
        console.log(`处理NPC事件后果: ${this.currentEvent.id}`);
      }

      // 检查随机事件（在主事件执行后）
      const randomEvents = this.checkRandomEvents(round);
      this.randomEvents = randomEvents;
      
      // 准备随机事件（不立即应用效果）
      const randomEventResults = this.prepareRandomEvents();

      // 检查成就
      const achievements = this.checkAchievements();

      // 触发回合结束钩子
      this.eventSystem.triggerEventHooks('roundEnd', {
        round,
        player,
        gameState: this.gameState,
        eventResult,
        randomEventResults,
        achievements
      });

      // 准备下一回合或结束游戏
      const nextRound = round + 1;
      const isGameOver = this.checkGameOver();

      if (!isGameOver && nextRound < this.gameState.getMaxRounds()) {
        // 预加载下一回合事件
        this.prepareNextRound(nextRound);
      }

      return {
        round,
        mainEvent: this.currentEvent,
        randomEvents: this.randomEvents,
        achievements: achievements.map(a => a.name),
        delayedEffectsTriggered: eventResult.delayedEffects?.map(e => e.id) || [],
        isGameOver
      };

    } finally {
      this.isProcessingRound = false;
    }
  }

  /**
   * 获取主事件（支持NPC事件插入和分支事件）
   */
  private getMainEvent(round: number): GameEvent | null {
    // 首先检查是否有NPC事件触发
    const npcEvent = this.checkNPCEvents(round);
    if (npcEvent) {
      return npcEvent;
    }
    
    // 检查是否满足分支事件条件
    const branchEvent = this.checkBranchEvents(round);
    if (branchEvent) {
      console.log(`分支事件触发 (第${round}轮): ${branchEvent.title}`);
      return branchEvent;
    }
    
    // 如果没有特殊事件，返回常规事件
    const event = this.eventSystem.getEvent(round + 1); // 事件ID从1开始
    return event || null;
  }

  /**
   * 检查分支事件条件
   */
  private checkBranchEvents(round: number): GameEvent | null {
    const player = this.gameState.getPlayer();
    const justiceScore = player.storyFlags.justicePath;
    const round2Choice = player.storyFlags.keyChoices[2]; // 第2轮选择（1-based索引）
    const round8Choice = player.storyFlags.keyChoices[8]; // 第8轮选择（1-based索引）
    
    console.log(`分支检查 (第${round + 1}轮): 正义值=${justiceScore}, 第2轮选择=${round2Choice}, 第8轮选择=${round8Choice}`);
    
    // 检查正义英雄路线分支 - 渐进式触发条件
    if (round === 5) { // round 5 = 第6轮：需要正义值>=4且第2轮有正义选择
      if (justiceScore >= 4 && ['A', 'C'].includes(round2Choice || '')) {
        console.log('✅ 第6轮正义分支触发条件满足');
        return this.getJusticeBranchEvent(round);
      } else {
        console.log(`❌ 第6轮正义分支未触发: 正义值${justiceScore}>=4? ${justiceScore >= 4}, 选择${round2Choice}在[A,C]中? ${['A', 'C'].includes(round2Choice || '')}`);
      }
    }
    
    if (round === 8) { // round 8 = 第9轮：需要正义值>=5且第8轮选择A（救人）
      if (justiceScore >= 5 && round8Choice === 'A') {
        console.log('✅ 第9轮正义分支触发条件满足');
        return this.getJusticeBranchEvent(round);
      } else {
        console.log(`❌ 第9轮正义分支未触发: 正义值${justiceScore}>=5? ${justiceScore >= 5}, 第8轮选择${round8Choice}===A? ${round8Choice === 'A'}`);
      }
    }
    
    if (round === 9) { // round 9 = 第10轮：需要正义值>=6（最终分支）
      if (justiceScore >= 6) {
        console.log('✅ 第10轮正义分支触发条件满足');
        return this.getJusticeBranchEvent(round);
      } else {
        console.log(`❌ 第10轮正义分支未触发: 正义值${justiceScore}>=6? ${justiceScore >= 6}`);
      }
    }
    
    return null;
  }

  /**
   * 获取正义英雄路线的分支事件
   */
  private getJusticeBranchEvent(round: number): GameEvent | null {
    switch (round) {
      case 5: // 第6轮
        return {
          id: 6001,
          title: '英雄的担当',
          description: '由于你之前的正义行为，各路豪杰都相信你的为人。现在两大门派冲突，所有人都希望你能出面调解。',
          options: [
            {
              id: 'A',
              label: 'A',
              description: '承担起英雄的责任，全力调解',
              effects: { martial: 2, fame: 3, network: 2, virtue: 2, energy: -2 }
            },
            {
              id: 'B', 
              label: 'B',
              description: '谨慎行事，先了解情况再做决定',
              effects: { martial: 1, fame: 1, network: 1, virtue: 1, energy: -1 }
            },
            {
              id: 'C',
              label: 'C', 
              description: '召集其他正义之士共同解决',
              effects: { martial: 1, fame: 2, network: 3, virtue: 1, energy: -2 }
            }
          ]
        };
        
      case 8: // 第9轮
        return {
          id: 6002,
          title: '侠义召集令',
          description: '你的正义之声传遍江湖，多位英雄响应你的号召，准备共同行动。这时有消息说一群无辜村民被匪徒围困。',
          options: [
            {
              id: 'A',
              label: 'A',
              description: '立即带队前往救援，展现英雄本色',
              effects: { martial: 3, fame: 3, virtue: 2, energy: -3 }
            },
            {
              id: 'B',
              label: 'B', 
              description: '制定周密计划，确保万无一失',
              effects: { martial: 1, fame: 2, virtue: 1, network: 1, energy: -2 }
            },
            {
              id: 'C',
              label: 'C',
              description: '先派出斥候侦察，再做决定',
              effects: { martial: 1, fame: 1, virtue: 1, energy: -1 }
            }
          ]
        };
        
      case 9: // 第10轮
        return {
          id: 6003,
          title: '武林盟主挑战',
          description: '江湖大会召开，由于你的威望和正义行为，各路高手一致推举你为武林盟主候选人。这是你一统江湖、匡扶正义的最佳机会！',
          options: [
            {
              id: 'A',
              label: 'A',
              description: '接受挑战，争夺武林盟主之位',
              effects: { martial: 4, fame: 4, virtue: 2, energy: -3 }
            },
            {
              id: 'B',
              label: 'B',
              description: '谦虚推辞，但承诺继续维护江湖正义',
              effects: { martial: 2, fame: 3, virtue: 3, energy: -2 }
            },
            {
              id: 'C',
              label: 'C',
              description: '提议建立武林联盟，共同维护江湖和平',
              effects: { martial: 2, fame: 3, network: 3, virtue: 2, energy: -2 }
            }
          ]
        };
        
      default:
        return null;
    }
  }

  /**
   * 检查NPC事件触发
   */
  private checkNPCEvents(round: number): GameEvent | null {
    const player = this.gameState.getPlayer();
    
    // 转换关系映射
    const npcRelationships = new Map<string, number>();
    player.relationships.forEach((rel, npcId) => {
      npcRelationships.set(npcId, rel.value);
    });
    
    // 检查所有可能的NPC事件
    const npcEventIds = [1001, 1002, 1003]; // 柳师兄的事件ID
    
    for (const eventId of npcEventIds) {
      const shouldTrigger = checkNPCEventTrigger(
        eventId,
        player.stats,
        player.flags,
        round,
        npcRelationships
      );
      
      if (shouldTrigger) {
        const npcEvent = getNPCEvent(eventId);
        if (npcEvent) {
          console.log(`NPC事件触发: ${eventId} - ${npcEvent.title}`);
          return npcEvent;
        }
      }
    }
    
    return null;
  }

  /**
   * 检查随机事件
   */
  private checkRandomEvents(round: number): any[] {
    const randomEvents: any[] = [];
    
    // 第1轮后到第9轮前可以触发随机事件
    if (round > 0 && round < 9) {
      const randomEvent = getRandomEventFiltered(this.triggeredRandomEventIds);
      if (randomEvent) {
        randomEvents.push(randomEvent);
        this.triggeredRandomEventIds.add(randomEvent.id); // 记录已触发的事件ID
        
        console.log(`随机事件触发 (回合 ${round}): ${randomEvent.title} [${randomEvent.type}]`);
        console.log(`已触发事件数: ${this.triggeredRandomEventIds.size}, 事件ID: ${randomEvent.id}`);
        
        // 记录随机事件统计
        const totalEffects = Object.values(randomEvent.effects).reduce((sum, val) => sum + Math.abs(val as number), 0);
        console.log(`事件强度: ${totalEffects}, 类型: ${randomEvent.type}`);
      } else {
        console.log(`回合 ${round}: 无随机事件触发`);
      }
    }

    return randomEvents;
  }

  /**
   * 准备随机事件（只生成，不应用效果）
   */
  private prepareRandomEvents(): any[] {
    const results: any[] = [];

    this.randomEvents.forEach(randomEvent => {
      if (randomEvent && randomEvent.effects) {
        // 检查随机事件效果合理性
        Object.entries(randomEvent.effects).forEach(([key, value]) => {
          if (Math.abs(value as number) > 5) {
            console.warn(`随机事件效果过强: ${randomEvent.title} - ${key}: ${value}`);
          }
        });

        results.push({
          event: randomEvent,
          success: true
        });
      }
    });

    return results;
  }

  /**
   * 应用随机事件效果（在用户关闭弹窗时调用）
   */
  applyRandomEventEffects(): any[] {
    const player = this.gameState.getPlayer();
    const results: any[] = [];

    this.randomEvents.forEach(randomEvent => {
      if (randomEvent && randomEvent.effects) {
        console.log(`应用随机事件效果: ${randomEvent.title}`, randomEvent.effects);
        
        // 应用随机事件效果
        player.applyStatsChange(randomEvent.effects);
        
        // 添加历史记录
        player.addHistory({
          round: this.gameState.getCurrentRound(),
          type: 'random',
          description: `随机事件：${randomEvent.title}`,
          effects: randomEvent.effects,
          metadata: { eventType: randomEvent.type }
        });

        results.push({
          event: randomEvent,
          success: true
        });
      }
    });

    // 在随机事件后检查成就
    if (this.randomEvents.length > 0) {
      const currentStats = player.getCurrentStats();
      const currentAchievements = this.gameState.getAchievements();
      const updatedAchievements = checkAchievements(currentStats, currentAchievements);
      
      // 应用新解锁成就的奖励
      const newlyUnlocked = updatedAchievements.filter(
        (ach, index) => ach.unlocked && !currentAchievements[index]?.unlocked
      );
      
      if (newlyUnlocked.length > 0) {
        console.log('随机事件触发新成就:', newlyUnlocked.map(ach => ach.name));
        newlyUnlocked.forEach((ach) => {
          if (ach.bonus) {
            player.applyStatsChange(ach.bonus);
          }
        });
        // 更新游戏状态中的成就
        this.gameState.updateAchievements(updatedAchievements);
        
        // 记录成就到历史
        player.addHistory({
          round: this.gameState.getCurrentRound(),
          type: 'achievement',
          description: '解锁成就：' + newlyUnlocked.map(ach => ach.name).join(', '),
          effects: {},
          metadata: { 
            achievementsUnlocked: newlyUnlocked.map(ach => ach.name),
            source: 'random_events'
          }
        });
      }
    }

    return results;
  }

  /**
   * 处理延迟效果
   */
  private processDelayedEffects(round: number): DelayedEffect[] {
    return this.eventSystem.processDelayedEffects(
      this.gameState.getPlayer(),
      this.gameState,
      round
    );
  }

  /**
   * 检查成就
   */
  private checkAchievements(): any[] {
    // 这里将调用成就系统
    // 暂时返回空数组，后续会在成就系统中实现
    return [];
  }

  /**
   * 准备下一回合
   */
  private prepareNextRound(nextRound: number): void {
    // 可以在这里预加载下一回合的资源
    // 或者注册一些特定的延迟效果
  }

  /**
   * 检查游戏是否结束
   */
  private checkGameOver(): boolean {
    return this.gameState.checkGameOver();
  }

  /**
   * 进入下一回合
   */
  nextRound(): RoundResult {
    if (this.gameState.getCurrentRound() >= this.gameState.getMaxRounds() - 1) {
      // 游戏已结束，设置游戏结束标志
      this.gameState.setGameOver(true);
      console.log('游戏结束：已达到最大回合数', {
        currentRound: this.gameState.getCurrentRound(),
        maxRounds: this.gameState.getMaxRounds()
      });
      return {
        round: this.gameState.getCurrentRound(),
        mainEvent: null,
        randomEvents: [],
        isGameOver: true
      };
    }

    return this.startRound(this.gameState.getCurrentRound() + 1);
  }

  /**
   * 获取当前事件
   */
  getCurrentEvent(): GameEvent | null {
    return this.currentEvent;
  }

  /**
   * 获取当前随机事件
   */
  getCurrentRandomEvents(): any[] {
    return [...this.randomEvents];
  }

  /**
   * 清空随机事件数组（在用户关闭弹窗后调用）
   */
  clearRandomEvents(): void {
    this.randomEvents = [];
    console.log('随机事件已清空');
  }

  /**
   * 获取选项可用性
   */
  getOptionAvailability(): Map<string, boolean> {
    if (!this.currentEvent) {
      return new Map();
    }

    return this.eventSystem.getOptionAvailability(
      this.gameState.getPlayer(),
      this.currentEvent
    );
  }

  /**
   * 注册自定义事件
   */
  registerEvent(event: GameEvent): void {
    this.eventSystem.registerEvent(event);
  }

  /**
   * 注册延迟效果
   */
  registerDelayedEffect(effect: DelayedEffect): void {
    this.eventSystem.registerDelayedEffect(effect);
  }

  /**
   * 获取回合进度信息
   */
  getRoundProgress(): {
    currentRound: number;
    maxRounds: number;
    progressPercentage: number;
    roundsRemaining: number;
    isGameOver: boolean;
  } {
    const currentRound = this.gameState.getCurrentRound();
    const maxRounds = this.gameState.getMaxRounds();
    
    return {
      currentRound,
      maxRounds,
      progressPercentage: ((currentRound + 1) / maxRounds) * 100,
      roundsRemaining: maxRounds - currentRound - 1,
      isGameOver: this.gameState.checkGameOver()
    };
  }

  /**
   * 获取游戏统计信息
   */
  getGameStats(): {
    totalRounds: number;
    eventsCompleted: number;
    randomEventsTriggered: number;
    delayedEffectsActive: number;
    gameDuration: number;
  } {
    return {
      totalRounds: this.gameState.getMaxRounds(),
      eventsCompleted: this.gameState.getEventHistory().length,
      randomEventsTriggered: this.gameState.getPlayer().history.filter(
        h => h.type === 'random'
      ).length,
      delayedEffectsActive: this.eventSystem.getActiveDelayedEffects().length,
      gameDuration: this.gameState.getGameDuration()
    };
  }

  /**
   * 重置回合管理器
   */
  reset(): void {
    this.currentEvent = null;
    this.randomEvents = [];
    this.triggeredRandomEventIds.clear(); // 清空已触发事件记录
    this.isProcessingRound = false;
    this.eventSystem.reset();
  }

  /**
   * 获取事件系统（用于高级操作）
   */
  getEventSystem(): EventSystem {
    return this.eventSystem;
  }

  /**
   * 获取已触发随机事件统计
   */
  getTriggeredRandomEventsStats(): {
    count: number;
    eventIds: string[];
    remainingEvents: number;
  } {
    const totalEvents = 18; // randomEventPool的长度
    return {
      count: this.triggeredRandomEventIds.size,
      eventIds: Array.from(this.triggeredRandomEventIds),
      remainingEvents: totalEvents - this.triggeredRandomEventIds.size
    };
  }

  /**
   * 获取游戏状态管理器
   */
  getGameState(): GameStateManager {
    return this.gameState;
  }
}