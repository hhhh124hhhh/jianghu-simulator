import { 
  NPCState, 
  NPCHistory, 
  NPCEventContext, 
  NPCDecision, 
  NPCSystemConfig 
} from './types';
import { NPC } from './types';
import { PlayerRelationship } from '../../types/extended';
import { 
  allNPCs, 
  getNPCById, 
  getRelationshipStatus, 
  NPC_CONSTANTS 
} from '../../data/npcs';
import { Player } from '../../core/Player';
import { GameStateManager } from '../../core/GameState';

/**
 * NPC管理器
 * 负责NPC生命周期、关系管理、决策制定
 */
export class NPCManager {
  private npcs: Map<string, NPC>;
  private npcStates: Map<string, NPCState>;
  private interactionHistory: NPCHistory[];
  private config: NPCSystemConfig;
  private player: Player;
  private gameState: GameStateManager;

  constructor(player: Player, gameState: GameStateManager, config?: Partial<NPCSystemConfig>) {
    this.npcs = new Map();
    this.npcStates = new Map();
    this.interactionHistory = [];
    this.player = player;
    this.gameState = gameState;
    
    this.config = {
      enableNPCInteractions: true,
      maxInteractionsPerRound: 3,
      relationshipDecayRate: 0.02,
      agendaPriorityThreshold: 5,
      enableRandomEncounters: true,
      debugMode: false,
      ...config
    };

    this.initializeNPCs();
  }

  /**
   * 初始化所有NPC
   */
  private initializeNPCs(): void {
    allNPCs.forEach(npc => {
      this.npcs.set(npc.id, npc);
      this.npcStates.set(npc.id, {
        npcId: npc.id,
        relationship: npc.relationship,
        availability: npc.availability,
        currentMood: this.calculateInitialMood(npc),
        activeGoals: npc.agenda.goals.map(g => g.id),
        blockedActions: [],
        lastInteractionRound: 0,
        totalInteractions: 0
      });

      // 初始化玩家关系
      this.player.setRelationship(
        npc.id, 
        npc.name, 
        npc.relationship,
        this.getRelationshipType(npc.relationship)
      );
    });
  }

  /**
   * 计算初始心情
   */
  private calculateInitialMood(npc: NPC): NPCState['currentMood'] {
    if (npc.relationship >= 30) return 'helpful';
    if (npc.relationship >= 10) return 'friendly';
    if (npc.relationship >= -10) return 'neutral';
    if (npc.relationship >= -30) return 'busy';
    return 'hostile';
  }

  /**
   * 根据关系值获取关系类型
   */
  private getRelationshipType(value: number): PlayerRelationship['type'] {
    const status = getRelationshipStatus(value);
    switch (status) {
      case 'hostile': return 'enemy';
      case 'distrustful': return 'rival';
      case 'neutral': return 'neutral';
      case 'friendly': return 'friend';
      case 'trusted': return 'friend';
      case 'ally': return 'mentor';
      default: return 'neutral';
    }
  }

  /**
   * 获取NPC
   */
  getNPC(npcId: string): NPC | undefined {
    return this.npcs.get(npcId);
  }

  /**
   * 获取NPC状态
   */
  getNPCState(npcId: string): NPCState | undefined {
    return this.npcStates.get(npcId);
  }

  /**
   * 获取所有NPC状态
   */
  getAllNPCStates(): Map<string, NPCState> {
    return new Map(this.npcStates);
  }

  /**
   * 更新关系值
   */
  updateRelationship(npcId: string, delta: number, reason?: string): boolean {
    const npc = this.getNPC(npcId);
    const state = this.npcStates.get(npcId);
    
    if (!npc || !state) return false;

    const oldValue = state.relationship;
    const newValue = Math.max(
      NPC_CONSTANTS.MIN_RELATIONSHIP, 
      Math.min(NPC_CONSTANTS.MAX_RELATIONSHIP, oldValue + delta)
    );

    state.relationship = newValue;
    state.currentMood = this.calculateMoodFromRelationship(newValue);
    
    // 更新玩家关系
    this.player.modifyRelationship(npcId, delta);

    // 记录历史
    this.addInteractionHistory({
      round: this.gameState.getCurrentRound(),
      npcId,
      interactionType: 'dialogue',
      description: reason || `关系变化: ${delta > 0 ? '+' : ''}${delta}`,
      relationshipChange: delta,
      effects: {},
      metadata: { oldValue, newValue }
    });

    if (this.config.debugMode) {
      console.log(`NPC ${npc.name} 关系变化: ${oldValue} → ${newValue} (${reason})`);
    }

    return true;
  }

  /**
   * 根据关系值计算心情
   */
  private calculateMoodFromRelationship(value: number): NPCState['currentMood'] {
    if (value >= 60) return 'helpful';
    if (value >= 30) return 'friendly';
    if (value >= -10) return 'neutral';
    if (value >= -30) return 'busy';
    return 'hostile';
  }

  /**
   * 检查NPC是否可以交互
   */
  canInteract(npcId: string): boolean {
    const npc = this.getNPC(npcId);
    const state = this.npcStates.get(npcId);
    
    if (!npc || !state || !this.config.enableNPCInteractions) {
      return false;
    }

    return state.availability && 
           state.currentMood !== 'hostile' &&
           !this.isInteractionLimitReached();
  }

  /**
   * 检查是否达到交互限制
   */
  private isInteractionLimitReached(): boolean {
    const currentRound = this.gameState.getCurrentRound();
    const roundInteractions = this.interactionHistory.filter(
      h => h.round === currentRound
    ).length;
    
    return roundInteractions >= this.config.maxInteractionsPerRound;
  }

  /**
   * 执行NPC决策
   */
  makeNPCDecision(npcId: string, context: Partial<NPCEventContext>): NPCDecision | null {
    const npc = this.getNPC(npcId);
    const state = this.npcStates.get(npcId);
    
    if (!npc || !state || !this.canInteract(npcId)) {
      return null;
    }

    const fullContext: NPCEventContext = {
      player: this.player,
      gameState: this.gameState,
      round: this.gameState.getCurrentRound(),
      previousInteractions: this.getNPCInteractionHistory(npcId),
      currentRelationship: state.relationship,
      environmentFactors: this.calculateEnvironmentFactors(),
      ...context
    };

    // 评估可执行的行动
    const availableActions = npc.agenda.actions.filter(action => {
      return this.checkActionRequirements(action, fullContext);
    });

    if (availableActions.length === 0) {
      return null;
    }

    // 选择最优行动
    const selectedAction = this.selectBestAction(availableActions, fullContext);
    
    const decision: NPCDecision = {
      actionId: selectedAction.id,
      actionType: selectedAction.type,
      priority: this.calculateActionPriority(selectedAction, fullContext),
      requirements: selectedAction.requirements || {},
      effects: selectedAction.effects || {},
      narrative: this.generateActionNarrative(selectedAction, npc, fullContext),
      followUpActions: this.calculateFollowUpActions(selectedAction, fullContext)
    };

    return decision;
  }

  /**
   * 检查行动要求
   */
  private checkActionRequirements(action: any, context: NPCEventContext): boolean {
    if (!action.requirements) return true;

    const requirements = action.requirements;
    
    // 检查关系要求
    if (requirements.relationship && context.currentRelationship < requirements.relationship) {
      return false;
    }

    // 检查属性要求
    if (requirements.playerStats) {
      for (const [stat, range] of Object.entries(requirements.playerStats)) {
        const playerValue = context.player.stats[stat as keyof typeof context.player.stats] || 0;
        const [min, max] = range as [number, number];
        if (playerValue < min || playerValue > max) {
          return false;
        }
      }
    }

    // 检查标志位要求
    if (requirements.flags) {
      for (const flag of requirements.flags) {
        if (!context.player.hasFlag(flag)) {
          return false;
        }
      }
    }

    return true;
  }

  /**
   * 选择最优行动
   */
  private selectBestAction(actions: any[], context: NPCEventContext): any {
    // 简单策略：选择优先级最高的行动
    return actions.reduce((best, current) => {
      const bestPriority = this.calculateActionPriority(best, context);
      const currentPriority = this.calculateActionPriority(current, context);
      return currentPriority > bestPriority ? current : best;
    });
  }

  /**
   * 计算行动优先级
   */
  private calculateActionPriority(action: any, context: NPCEventContext): number {
    let priority = 1;

    // 基于关系调整优先级
    if (context.currentRelationship > 50 && action.type === 'help') {
      priority += 2;
    }

    // 基于NPC特质调整
    const npc = this.getNPC(context.gameState.getPlayer().getFlag('current_npc_id') || '');
    if (npc) {
      if (npc.traits.includes('热心') && action.type === 'help') {
        priority += 1;
      }
      if (npc.traits.includes('精于算计') && action.type === 'request') {
        priority += 1;
      }
    }

    return priority;
  }

  /**
   * 生成行动叙述
   */
  private generateActionNarrative(action: any, npc: NPC, context: NPCEventContext): string {
    const baseNarrative = action.content?.description || `${npc.name}有所行动`;
    
    // 根据关系状态调整叙述
    if (context.currentRelationship > 50) {
      return `${npc.name}友善地${baseNarrative}`;
    } else if (context.currentRelationship < -20) {
      return `${npc.name}冷漠地${baseNarrative}`;
    }
    
    return baseNarrative;
  }

  /**
   * 计算后续行动
   */
  private calculateFollowUpActions(action: any, context: NPCEventContext): string[] {
    // 基于行动类型和NPC特质计算可能的后续行动
    const followUps: string[] = [];
    
    if (action.type === 'help') {
      followUps.push('express_gratitude');
    }
    
    if (action.type === 'request') {
      followUps.push('consider_request');
    }
    
    return followUps;
  }

  /**
   * 执行NPC决策
   */
  executeNPCDecision(decision: NPCDecision, npcId: string): boolean {
    const npc = this.getNPC(npcId);
    const state = this.npcStates.get(npcId);
    
    if (!npc || !state) return false;

    // 应用效果
    if (decision.effects) {
      this.player.applyStatsChange(decision.effects);
    }

    // 更新NPC状态
    state.totalInteractions++;
    state.lastInteractionRound = this.gameState.getCurrentRound();

    // 记录交互历史
    this.addInteractionHistory({
      round: this.gameState.getCurrentRound(),
      npcId,
      interactionType: decision.actionType,
      description: decision.narrative,
      relationshipChange: 0,
      effects: decision.effects,
      metadata: { decision }
    });

    if (this.config.debugMode) {
      console.log(`执行NPC决策: ${npc.name} - ${decision.narrative}`);
    }

    return true;
  }

  /**
   * 计算环境因素
   */
  private calculateEnvironmentFactors(): Record<string, any> {
    return {
      currentRound: this.gameState.getCurrentRound(),
      totalRounds: this.gameState.getMaxRounds(),
      playerStats: this.player.stats,
      playerFlags: Array.from(this.player.flags.keys()),
      gameTime: this.gameState.getGameDuration()
    };
  }

  /**
   * 添加交互历史
   */
  private addInteractionHistory(history: Omit<NPCHistory, 'round'> & { round?: number }): void {
    this.interactionHistory.push({
      round: history.round || this.gameState.getCurrentRound(),
      ...history
    });
  }

  /**
   * 获取NPC交互历史
   */
  getNPCInteractionHistory(npcId: string): NPCHistory[] {
    return this.interactionHistory.filter(h => h.npcId === npcId);
  }

  /**
   * 获取所有交互历史
   */
  getAllInteractionHistory(): NPCHistory[] {
    return [...this.interactionHistory];
  }

  /**
   * 处理回合更新
   */
  processRoundUpdate(round: number): void {
    // 关系值衰减
    this.applyRelationshipDecay();
    
    // 更新NPC状态
    this.updateNPCStates(round);
    
    // 检查议程触发
    this.checkAgendaTriggers(round);
  }

  /**
   * 应用关系衰减
   */
  private applyRelationshipDecay(): void {
    this.npcStates.forEach((state, npcId) => {
      if (state.lastInteractionRound > 0) {
        const roundsSinceInteraction = this.gameState.getCurrentRound() - state.lastInteractionRound;
        
        if (roundsSinceInteraction > 5) {
          const decay = Math.round(this.config.relationshipDecayRate * roundsSinceInteraction);
          this.updateRelationship(npcId, -decay, '长时间未交互');
        }
      }
    });
  }

  /**
   * 更新NPC状态
   */
  private updateNPCStates(round: number): void {
    this.npcStates.forEach((state, npcId) => {
      // 更新心情
      state.currentMood = this.calculateMoodFromRelationship(state.relationship);
      
      // 更新可用性
      const npc = this.getNPC(npcId);
      if (npc) {
        state.availability = npc.availability && state.currentMood !== 'hostile';
      }
    });
  }

  /**
   * 检查议程触发
   */
  private checkAgendaTriggers(round: number): void {
    this.npcs.forEach((npc, npcId) => {
      npc.agenda.triggers.forEach(trigger => {
        const context: NPCEventContext = {
          player: this.player,
          gameState: this.gameState,
          round,
          previousInteractions: this.getNPCInteractionHistory(npcId),
          currentRelationship: this.npcStates.get(npcId)?.relationship || 0,
          environmentFactors: this.calculateEnvironmentFactors()
        };

        if (trigger.condition(context)) {
          this.handleAgendaTrigger(npc, trigger, context);
        }
      });
    });
  }

  /**
   * 处理议程触发
   */
  private handleAgendaTrigger(npc: NPC, trigger: any, context: NPCEventContext): void {
    if (this.config.debugMode) {
      console.log(`NPC ${npc.name} 议程触发: ${trigger.type}`);
    }

    // 可以在这里执行议程触发的具体逻辑
    // 比如自动发起交互、更新目标等
  }

  /**
   * 获取系统摘要
   */
  getSystemSummary(): {
    totalNPCs: number;
    availableNPCs: number;
    totalInteractions: number;
    averageRelationship: number;
    hostileNPCs: number;
    alliedNPCs: number;
  } {
    const states = Array.from(this.npcStates.values());
    const totalRelationship = states.reduce((sum, state) => sum + state.relationship, 0);
    
    return {
      totalNPCs: this.npcs.size,
      availableNPCs: states.filter(s => s.availability).length,
      totalInteractions: this.interactionHistory.length,
      averageRelationship: this.npcs.size > 0 ? totalRelationship / this.npcs.size : 0,
      hostileNPCs: states.filter(s => s.currentMood === 'hostile').length,
      alliedNPCs: states.filter(s => s.currentMood === 'helpful').length
    };
  }

  /**
   * 重置NPC系统
   */
  reset(): void {
    this.interactionHistory = [];
    this.initializeNPCs();
  }
}