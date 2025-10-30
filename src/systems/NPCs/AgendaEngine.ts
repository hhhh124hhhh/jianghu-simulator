import { Agenda } from '../../types/extended';
import { Player } from '../../core/Player';
import { GameStateManager } from '../../core/GameState';

/**
 * 议程执行结果（简化版）
 */
export interface AgendaExecutionResult {
  agendaId: string;
  npcId: string;
  narrative: string;
  priority: number;
}

/**
 * 议程状态（简化版）
 */
export interface AgendaState {
  isActive: boolean;
  currentPriority: number;
  lastUpdateRound: number;
}

/**
 * 简化的议程引擎
 * 暂时实现基础功能，后续可以扩展
 */
export class AgendaEngine {
  private player: Player;
  private gameState: GameStateManager;
  private agendaStates: Map<string, AgendaState>;

  constructor(player: Player, gameState: GameStateManager) {
    this.player = player;
    this.gameState = gameState;
    this.agendaStates = new Map();
  }

  /**
   * 注册NPC议程
   */
  registerAgenda(npcId: string, agenda: Agenda): void {
    const agendaId = (agenda as any).id || 'default';
    const stateKey = `${npcId}_${agendaId}`;
    const state: AgendaState = {
      isActive: true,
      currentPriority: agenda.priority,
      lastUpdateRound: this.gameState.getCurrentRound()
    };

    this.agendaStates.set(stateKey, state);

    if (this.player.hasFlag('debug_agenda_engine')) {
      console.log(`注册议程: ${npcId} - 优先级 ${agenda.priority}`);
    }
  }

  /**
   * 处理议程更新（简化版）
   */
  processAgendaUpdates(npcId: string, agenda: Agenda): AgendaExecutionResult[] {
    const results: AgendaExecutionResult[] = [];
    const agendaId = (agenda as any).id || 'default';
    const stateKey = `${npcId}_${agendaId}`;
    const state = this.agendaStates.get(stateKey);

    if (!state || !state.isActive) {
      return results;
    }

    // 简化：暂时只更新状态，不执行复杂逻辑
    state.lastUpdateRound = this.gameState.getCurrentRound();

    return results;
  }

  /**
   * 获取议程状态
   */
  getAgendaState(npcId: string, agendaId: string = 'default'): AgendaState | undefined {
    return this.agendaStates.get(`${npcId}_${agendaId}`);
  }

  /**
   * 获取所有议程状态
   */
  getAllAgendaStates(): Map<string, AgendaState> {
    return new Map(this.agendaStates);
  }

  /**
   * 激活/停用议程
   */
  setAgendaActive(npcId: string, agendaId: string, isActive: boolean): boolean {
    const stateKey = `${npcId}_${agendaId}`;
    const state = this.agendaStates.get(stateKey);
    
    if (state) {
      state.isActive = isActive;
      return true;
    }
    
    return false;
  }

  /**
   * 重置议程引擎
   */
  reset(): void {
    this.agendaStates.clear();
  }

  /**
   * 获取系统摘要
   */
  getSystemSummary(): {
    totalAgendas: number;
    activeAgendas: number;
    completedAgendas: number;
    totalExecutions: number;
    averageProgress: number;
  } {
    const states = Array.from(this.agendaStates.values());
    const activeCount = states.filter(s => s.isActive).length;
    const completedCount = states.filter(s => s.lastUpdateRound > this.gameState.getCurrentRound()).length;
    const averageProgress = states.length > 0 ? 50 : 0; // 简化计算

    return {
      totalAgendas: states.length,
      activeAgendas: activeCount,
      completedAgendas: completedCount,
      totalExecutions: 0, // 简化
      averageProgress
    };
  }
}