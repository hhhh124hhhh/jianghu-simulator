import { Player } from './Player';
import { GameState, QuestionnaireAnswers, GameEvent, Achievement } from '../types/game';
import { DelayedEffect, RoundResult } from '../types/extended';

/**
 * 游戏状态管理类
 * 统一管理游戏的所有状态和数据
 */
export class GameStateManager {
  private player: Player;
  private currentRound: number;
  private maxRounds: number;
  private questionnaire: QuestionnaireAnswers | null;
  private eventHistory: Array<{
    round: number;
    eventId: number;
    selectedOption: string;
    effects: any;
  }>;
  private achievements: Achievement[];
  private delayedEffects: DelayedEffect[];
  private isGameOver: boolean;
  private gameStartTime: number;
  private lastSaveTime: number;

  constructor() {
    this.player = new Player();
    this.currentRound = 0;
    this.maxRounds = 10;
    this.questionnaire = null;
    this.eventHistory = [];
    this.achievements = [];
    this.delayedEffects = [];
    this.isGameOver = false;
    this.gameStartTime = Date.now();
    this.lastSaveTime = Date.now();
  }

  /**
   * 初始化游戏状态
   */
  static initialize(): GameStateManager {
    const gameState = new GameStateManager();
    // 可以在这里加载初始配置
    return gameState;
  }

  /**
   * 获取玩家对象
   */
  getPlayer(): Player {
    return this.player;
  }

  /**
   * 设置问卷结果并初始化玩家属性
   */
  setQuestionnaire(answers: QuestionnaireAnswers, initialStats: any): void {
    this.questionnaire = answers;
    this.player.applyStatsChange(initialStats);
    this.player.background = answers.background;
    this.player.name = '江湖小白'; // 可以后续扩展为可自定义
  }

  /**
   * 获取当前回合数
   */
  getCurrentRound(): number {
    return this.currentRound;
  }

  /**
   * 设置当前回合数
   */
  setCurrentRound(round: number): void {
    this.currentRound = round;
  }

  /**
   * 获取最大回合数
   */
  getMaxRounds(): number {
    return this.maxRounds;
  }

  /**
   * 设置最大回合数
   */
  setMaxRounds(maxRounds: number): void {
    this.maxRounds = maxRounds;
  }

  /**
   * 进入下一回合
   */
  nextRound(): boolean {
    if (this.currentRound < this.maxRounds - 1) {
      this.currentRound++;
      return true;
    }
    return false;
  }

  /**
   * 添加事件历史记录
   */
  addEventHistory(eventId: number, selectedOption: string, effects: any): void {
    this.eventHistory.push({
      round: this.currentRound,
      eventId,
      selectedOption,
      effects
    });
  }

  /**
   * 获取事件历史
   */
  getEventHistory(): Array<{
    round: number;
    eventId: number;
    selectedOption: string;
    effects: any;
  }> {
    return [...this.eventHistory];
  }

  /**
   * 设置成就列表
   */
  setAchievements(achievements: Achievement[]): void {
    this.achievements = achievements;
  }

  /**
   * 获取成就列表
   */
  getAchievements(): Achievement[] {
    return [...this.achievements];
  }

  /**
   * 更新成就状态
   */
  updateAchievements(updatedAchievements: Achievement[]): void {
    this.achievements = updatedAchievements;
  }

  /**
   * 添加延迟效果
   */
  addDelayedEffect(effect: DelayedEffect): void {
    this.delayedEffects.push(effect);
  }

  /**
   * 获取当前回合的延迟效果
   */
  getDelayedEffectsForRound(round: number): DelayedEffect[] {
    return this.delayedEffects.filter(effect => 
      effect.triggerRound === round && effect.isActive
    );
  }

  /**
   * 激活/停用延迟效果
   */
  setDelayedEffectActive(effectId: string, isActive: boolean): void {
    const effect = this.delayedEffects.find(e => e.id === effectId);
    if (effect) {
      effect.isActive = isActive;
    }
  }

  /**
   * 获取所有延迟效果
   */
  getAllDelayedEffects(): DelayedEffect[] {
    return [...this.delayedEffects];
  }

  /**
   * 检查游戏是否结束
   */
  checkGameOver(): boolean {
    if (this.currentRound >= this.maxRounds) {
      this.isGameOver = true;
    }
    return this.isGameOver;
  }

  /**
   * 设置游戏结束状态
   */
  setGameOver(isOver: boolean): void {
    this.isGameOver = isOver;
  }

  /**
   * 获取问卷结果
   */
  getQuestionnaire(): QuestionnaireAnswers | null {
    return this.questionnaire;
  }

  /**
   * 检查是否有存档
   */
  hasQuestionnaire(): boolean {
    return this.questionnaire !== null;
  }

  /**
   * 获取游戏时长（毫秒）
   */
  getGameDuration(): number {
    return Date.now() - this.gameStartTime;
  }

  /**
   * 更新最后保存时间
   */
  updateLastSaveTime(): void {
    this.lastSaveTime = Date.now();
  }

  /**
   * 获取最后保存时间
   */
  getLastSaveTime(): number {
    return this.lastSaveTime;
  }

  /**
   * 转换为旧版GameState格式（兼容性）
   */
  toLegacyFormat(): GameState {
    return {
      currentRound: this.currentRound,
      maxRounds: this.maxRounds,
      playerStats: this.player.getCurrentStats(),
      questionnaire: this.questionnaire,
      eventHistory: this.eventHistory,
      randomEvents: [], // 旧格式的随机事件将在事件系统中处理
      achievements: this.achievements,
      isGameOver: this.isGameOver
    };
  }

  /**
   * 从旧版GameState格式恢复
   */
  static fromLegacyFormat(legacyState: GameState): GameStateManager {
    const gameState = new GameStateManager();
    gameState.currentRound = legacyState.currentRound;
    gameState.maxRounds = legacyState.maxRounds;
    gameState.questionnaire = legacyState.questionnaire;
    gameState.eventHistory = legacyState.eventHistory || [];
    gameState.achievements = legacyState.achievements || [];
    gameState.isGameOver = legacyState.isGameOver;

    // 恢复玩家状态
    gameState.player.applyStatsChange(legacyState.playerStats);

    return gameState;
  }

  /**
   * 创建深度克隆（用于存档）
   */
  clone(): GameStateManager {
    const cloned = new GameStateManager();
    cloned.player = this.player.clone();
    cloned.currentRound = this.currentRound;
    cloned.maxRounds = this.maxRounds;
    cloned.questionnaire = this.questionnaire;
    cloned.eventHistory = [...this.eventHistory];
    cloned.achievements = [...this.achievements];
    cloned.delayedEffects = [...this.delayedEffects];
    cloned.isGameOver = this.isGameOver;
    cloned.gameStartTime = this.gameStartTime;
    cloned.lastSaveTime = this.lastSaveTime;
    return cloned;
  }

  /**
   * 获取游戏状态摘要
   */
  getSummary(): {
    currentRound: number;
    maxRounds: number;
    playerSummary: any;
    achievementsCount: number;
    delayedEffectsCount: number;
    isGameOver: boolean;
    gameDuration: number;
  } {
    return {
      currentRound: this.currentRound,
      maxRounds: this.maxRounds,
      playerSummary: this.player.getSummary(),
      achievementsCount: this.achievements.filter(a => a.unlocked).length,
      delayedEffectsCount: this.delayedEffects.filter(e => e.isActive).length,
      isGameOver: this.isGameOver,
      gameDuration: this.getGameDuration()
    };
  }

  /**
   * 重置游戏状态
   */
  reset(): void {
    this.player = new Player();
    this.currentRound = 0;
    this.questionnaire = null;
    this.eventHistory = [];
    this.achievements = [];
    this.delayedEffects = [];
    this.isGameOver = false;
    this.gameStartTime = Date.now();
    this.lastSaveTime = Date.now();
  }
}