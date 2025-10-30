import { GameStateManager } from './GameState';
import { RoundManager } from './RoundManager';
import { StatsManager } from './StatsManager';
import { Player } from './Player';
import { GameState, QuestionnaireAnswers, GamePhase } from '../types/game';
import { questionnaire } from '../data/questionnaire';
import { achievements } from '../data/achievements';
import { NPCManager } from '../systems/NPCs/NPCManager';
import { AgendaEngine } from '../systems/NPCs/AgendaEngine';
import { checkNPCEventTrigger, processNPCEventConsequences, getNPCRandomEvent } from '../data/npcEvents';

/**
 * 游戏引擎主类
 * 整合所有核心模块，提供统一的API接口
 */
export class GameEngine {
  private gameStateManager: GameStateManager;
  private roundManager: RoundManager;
  private statsManager: StatsManager;
  private npcManager: NPCManager;
  private agendaEngine: AgendaEngine;
  private currentPhase: GamePhase;

  constructor() {
    this.gameStateManager = GameStateManager.initialize();
    this.roundManager = new RoundManager(this.gameStateManager);
    this.statsManager = new StatsManager();
    this.currentPhase = 'start';
    
    // 初始化NPC系统
    const player = this.gameStateManager.getPlayer();
    this.npcManager = new NPCManager(player, this.gameStateManager);
    this.agendaEngine = new AgendaEngine(player, this.gameStateManager);
    
    this.initializeNPCSystem();
  }

  /**
   * 初始化NPC系统
   */
  private initializeNPCSystem(): void {
    // 注册所有NPC的议程
    const allNPCs = this.npcManager.getAllNPCStates();
    allNPCs.forEach((state, npcId) => {
      const npc = this.npcManager.getNPC(npcId);
      if (npc && npc.agenda) {
        this.agendaEngine.registerAgenda(npcId, npc.agenda);
      }
    });
  }

  /**
   * 开始新游戏
   */
  startNewGame(): void {
    this.gameStateManager.reset();
    this.roundManager.reset();
    this.currentPhase = 'questionnaire';
  }

  /**
   * 继续游戏
   */
  continueGame(savedState: GameState): boolean {
    try {
      this.gameStateManager = GameStateManager.fromLegacyFormat(savedState);
      this.roundManager = new RoundManager(this.gameStateManager);
      
      if (this.gameStateManager.hasQuestionnaire()) {
        this.currentPhase = 'playing';
      } else {
        this.currentPhase = 'questionnaire';
      }
      
      return true;
    } catch (error) {
      console.error('加载游戏失败:', error);
      return false;
    }
  }

  /**
   * 完成问卷并开始游戏
   */
  completeQuestionnaire(answers: QuestionnaireAnswers): boolean {
    try {
      // 计算初始属性
      const initialStats = this.calculateInitialStats(answers);
      
      // 设置问卷结果
      this.gameStateManager.setQuestionnaire(answers, initialStats);
      
      // 设置成就
      this.gameStateManager.setAchievements(
        achievements.map(ach => ({ ...ach, unlocked: false }))
      );
      
      // 开始第一回合
      this.roundManager.startRound(0);
      this.currentPhase = 'playing';
      
      return true;
    } catch (error) {
      console.error('问卷处理失败:', error);
      return false;
    }
  }

  /**
   * 计算问卷初始属性
   */
  private calculateInitialStats(answers: QuestionnaireAnswers): any {
    let stats = this.statsManager.getDefaultStats();
    
    // 遍历问卷问题并应用效果
    questionnaire.forEach((question) => {
      const answer = answers[question.id as keyof QuestionnaireAnswers];
      const option = question.options.find((opt) => opt.value === answer);
      if (option && option.effects) {
        stats = this.statsManager.applyChangesWithRules(stats, option.effects);
      }
    });
    
    return stats;
  }

  /**
   * 执行当前回合的事件选择
   */
  executeEventChoice(optionId: string): boolean {
    try {
      const event = this.roundManager.getCurrentEvent();
      const player = this.gameStateManager.getPlayer();
      
      // 记录关键选择（只记录主事件，ID < 1000）
      if (event && event.id < 1000) {
        const selectedOption = event.options.find(opt => opt.id === optionId);
        // 使用1-based索引：第1轮是游戏开始，第2轮是第一次选择
        const roundNumber = this.gameStateManager.getCurrentRound() + 1;
        player.recordKeyChoice(roundNumber, optionId, selectedOption?.effects);
        
        // 特殊处理：第8轮突发灾难的英雄行为
        if (event.id === 8 && optionId === 'A') {
          player.updateStoryFlag('justicePath', 2);
          console.log('第8轮-突发灾难中选择奋勇救人，正义路线+2');
        }
      }
      
      const result = this.roundManager.executeCurrentEvent(optionId);
      
      // 处理NPC事件后果
      if (event && event.id >= 1000) {
        processNPCEventConsequences(event.id, optionId, player, this.npcManager);
      }
      
      // 进入下一回合
      this.nextRound();
      
      return true;
    } catch (error) {
      console.error('执行事件选择失败:', error);
      return false;
    }
  }

  /**
   * 进入下一回合
   */
  nextRound(): boolean {
    try {
      // 处理NPC系统更新
      this.processNPCUpdates();
      
      // 检查并触发NPC事件
      this.checkNPCEvents();
      
      const result = this.roundManager.nextRound();
      
      if (result.isGameOver) {
        this.currentPhase = 'result';
      }
      
      return true;
    } catch (error) {
      console.error('进入下一回合失败:', error);
      return false;
    }
  }

  /**
   * 处理NPC系统更新
   */
  private processNPCUpdates(): void {
    const currentRound = this.gameStateManager.getCurrentRound();
    
    // 更新NPC管理器
    this.npcManager.processRoundUpdate(currentRound);
    
    // 处理议程系统
    const allNPCs = this.npcManager.getAllNPCStates();
    allNPCs.forEach((state, npcId) => {
      const npc = this.npcManager.getNPC(npcId);
      if (npc && npc.agenda) {
        const agendaResults = this.agendaEngine.processAgendaUpdates(npcId, npc.agenda);
        
        // 处理议程执行结果（简化版）
        agendaResults.forEach(result => {
          // 简化：暂时不处理具体的行动效果
          if (result.narrative) {
            console.log(`议程执行: ${result.narrative}`);
          }
        });
      }
    });
  }

  /**
   * 检查NPC事件触发
   */
  private checkNPCEvents(): void {
    const player = this.gameStateManager.getPlayer();
    const currentRound = this.gameStateManager.getCurrentRound();
    
    // 转换关系映射
    const npcRelationships = new Map<string, number>();
    player.relationships.forEach((rel, npcId) => {
      npcRelationships.set(npcId, rel.value);
    });
    
    // 检查所有可能的NPC事件
    const npcEventIds = [1001, 1002, 1003]; // 柳师兄的事件ID
    
    npcEventIds.forEach(eventId => {
      const shouldTrigger = checkNPCEventTrigger(
        eventId,
        player.stats,
        player.flags,
        currentRound,
        npcRelationships
      );
      
      if (shouldTrigger) {
        this.triggerNPCEvent(eventId);
      }
    });
  }

  /**
   * 触发NPC事件
   */
  private triggerNPCEvent(eventId: number): void {
    const eventSystem = this.roundManager.getEventSystem();
    
    // 这里需要将NPC事件注册到事件系统中
    // 暂时使用现有的机制
    console.log(`NPC事件触发: ${eventId}`);
  }

  /**
   * 重新开始游戏
   */
  restartGame(): void {
    this.startNewGame();
  }

  /**
   * 获取当前游戏阶段
   */
  getCurrentPhase(): GamePhase {
    return this.currentPhase;
  }

  /**
   * 获取游戏状态（兼容旧格式）
   */
  getGameState(): GameState {
    return this.gameStateManager.toLegacyFormat();
  }

  /**
   * 获取玩家对象
   */
  getPlayer(): Player {
    return this.gameStateManager.getPlayer();
  }

  /**
   * 获取回合管理器
   */
  getRoundManager(): RoundManager {
    return this.roundManager;
  }

  /**
   * 获取属性管理器
   */
  getStatsManager(): StatsManager {
    return this.statsManager;
  }

  /**
   * 获取当前事件
   */
  getCurrentEvent(): any {
    return this.roundManager.getCurrentEvent();
  }

  /**
   * 获取当前随机事件
   */
  getCurrentRandomEvents(): any[] {
    return this.roundManager.getCurrentRandomEvents();
  }

  /**
   * 清空随机事件（在用户关闭弹窗后调用）
   */
  clearRandomEvents(): void {
    this.roundManager.clearRandomEvents();
  }

  /**
   * 应用随机事件效果（在用户关闭弹窗时调用）
   */
  applyRandomEventEffects(): any[] {
    return this.roundManager.applyRandomEventEffects();
  }

  /**
   * 获取选项可用性
   */
  getOptionAvailability(): Map<string, boolean> {
    return this.roundManager.getOptionAvailability();
  }

  /**
   * 获取回合进度
   */
  getRoundProgress(): {
    currentRound: number;
    maxRounds: number;
    progressPercentage: number;
    roundsRemaining: number;
    isGameOver: boolean;
  } {
    return this.roundManager.getRoundProgress();
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
    return this.roundManager.getGameStats();
  }

  /**
   * 获取玩家属性建议
   */
  getStatsAdvice(): string[] {
    const player = this.getPlayer();
    return this.statsManager.getStatsAdvice(player.stats);
  }

  /**
   * 获取属性评分
   */
  getStatsScore(): {
    totalScore: number;
    combatScore: number;
    socialScore: number;
    survivalScore: number;
    details: Record<string, number>;
  } {
    const player = this.getPlayer();
    return this.statsManager.calculateStatsScore(player.stats);
  }

  /**
   * 比较属性变化
   */
  compareStats(oldStats: any, newStats: any): {
    improved: string[];
    declined: string[];
    unchanged: string[];
    summary: string;
  } {
    return this.statsManager.compareStats(oldStats, newStats);
  }

  /**
   * 保存游戏状态
   */
  saveGame(): boolean {
    try {
      const gameState = this.getGameState();
      const saveData = {
        gameState,
        playerData: this.getPlayer().clone(),
        currentPhase: this.currentPhase,
        timestamp: Date.now()
      };
      
      localStorage.setItem('jianghu-game-engine-state', JSON.stringify(saveData));
      this.gameStateManager.updateLastSaveTime();
      
      return true;
    } catch (error) {
      console.error('保存游戏失败:', error);
      return false;
    }
  }

  /**
   * 加载游戏状态
   */
  loadGame(): boolean {
    try {
      const saveDataStr = localStorage.getItem('jianghu-game-engine-state');
      if (!saveDataStr) {
        return false;
      }
      
      const saveData = JSON.parse(saveDataStr);
      
      // 恢复游戏状态
      this.continueGame(saveData.gameState);
      this.currentPhase = saveData.currentPhase || 'start';
      
      return true;
    } catch (error) {
      console.error('加载游戏失败:', error);
      return false;
    }
  }

  /**
   * 检查是否有存档
   */
  hasSavedGame(): boolean {
    try {
      const saveDataStr = localStorage.getItem('jianghu-game-engine-state');
      if (!saveDataStr) {
        return false;
      }
      
      const saveData = JSON.parse(saveDataStr);
      const saveTime = new Date(saveData.timestamp);
      const now = new Date();
      
      // 检查存档是否在7天内
      const daysDiff = (now.getTime() - saveTime.getTime()) / (1000 * 60 * 60 * 24);
      
      return daysDiff <= 7;
    } catch (error) {
      return false;
    }
  }

  /**
   * 清除存档
   */
  clearSave(): void {
    try {
      localStorage.removeItem('jianghu-game-engine-state');
      localStorage.removeItem('jianghu-game-state');
      localStorage.removeItem('jianghu-game-timestamp');
    } catch (error) {
      console.error('清除存档失败:', error);
    }
  }

  /**
   * 获取游戏引擎状态摘要
   */
  getEngineSummary(): {
    currentPhase: GamePhase;
    roundProgress: any;
    playerSummary: any;
    gameStats: any;
    systemHealth: {
      gameStateManager: boolean;
      roundManager: boolean;
      statsManager: boolean;
    };
  } {
    return {
      currentPhase: this.currentPhase,
      roundProgress: this.getRoundProgress(),
      playerSummary: this.getPlayer().getSummary(),
      gameStats: this.getGameStats(),
      systemHealth: {
        gameStateManager: !!this.gameStateManager,
        roundManager: !!this.roundManager,
        statsManager: !!this.statsManager,
        npcManager: !!this.npcManager,
        agendaEngine: !!this.agendaEngine
      } as any
    };
  }

  /**
   * 健康检查
   */
  healthCheck(): {
    isHealthy: boolean;
    issues: string[];
    recommendations: string[];
  } {
    const issues: string[] = [];
    const recommendations: string[] = [];

    // 检查核心模块
    if (!this.gameStateManager) {
      issues.push('GameStateManager 未初始化');
    }
    
    if (!this.roundManager) {
      issues.push('RoundManager 未初始化');
    }
    
    if (!this.statsManager) {
      issues.push('StatsManager 未初始化');
    }

    // 检查游戏状态一致性
    if (this.gameStateManager && this.roundManager) {
      const engineRound = this.gameStateManager.getCurrentRound();
      const managerRound = this.roundManager.getRoundProgress().currentRound;
      
      if (engineRound !== managerRound) {
        issues.push(`回合状态不一致: GameStateManager(${engineRound}) vs RoundManager(${managerRound})`);
        recommendations.push('重新同步回合状态');
      }
    }

    // 检查玩家状态
    if (this.gameStateManager) {
      const player = this.gameStateManager.getPlayer();
      const validation = this.statsManager.validateStats(player.stats);
      
      if (!validation.isValid) {
        issues.push(`玩家属性验证失败: ${validation.errors.join(', ')}`);
      }
      
      if (validation.warnings.length > 0) {
        recommendations.push(`注意: ${validation.warnings.join(', ')}`);
      }
    }

    return {
      isHealthy: issues.length === 0,
      issues,
      recommendations
    };
  }

  /**
   * 获取NPC管理器
   */
  getNPCManager(): NPCManager {
    return this.npcManager;
  }

  /**
   * 获取议程引擎
   */
  getAgendaEngine(): AgendaEngine {
    return this.agendaEngine;
  }

  /**
   * 获取NPC随机事件
   */
  getNPCRandomEvent(npcId: string): any {
    return getNPCRandomEvent(npcId);
  }

  /**
   * 更新NPC关系
   */
  updateNPCRelationship(npcId: string, delta: number, reason?: string): boolean {
    return this.npcManager.updateRelationship(npcId, delta, reason);
  }

  /**
   * 获取NPC状态
   */
  getNPCState(npcId: string): any {
    return this.npcManager.getNPCState(npcId);
  }

  /**
   * 获取所有NPC状态
   */
  getAllNPCStates(): Map<string, any> {
    return this.npcManager.getAllNPCStates();
  }

  /**
   * 检查NPC是否可交互
   */
  canInteractWithNPC(npcId: string): boolean {
    return this.npcManager.canInteract(npcId);
  }

  /**
   * 执行NPC决策
   */
  executeNPCDecision(npcId: string, context?: any): any {
    const decision = this.npcManager.makeNPCDecision(npcId, context);
    if (decision) {
      return this.npcManager.executeNPCDecision(decision, npcId);
    }
    return null;
  }
}