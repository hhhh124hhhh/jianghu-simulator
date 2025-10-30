import { useState, useEffect, useCallback, useRef } from 'react';
import { GameEngine } from '../core/GameEngine';
import { GameState, GamePhase, QuestionnaireAnswers } from '../types/game';
import { RandomEvent } from '../types/game';

/**
 * 游戏引擎Hook
 * 提供React组件与游戏引擎的交互接口
 */
export const useGameEngine = () => {
  const [gameEngine] = useState(() => new GameEngine());
  const [gameState, setGameState] = useState<GameState>(() => gameEngine.getGameState());
  const [currentPhase, setCurrentPhase] = useState<GamePhase>(() => gameEngine.getCurrentPhase());
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const gameEngineRef = useRef(gameEngine);

  // 初始化
  useEffect(() => {
    const engine = gameEngineRef.current;
    
    try {
      // 健康检查
      const healthCheck = engine.healthCheck();
      if (!healthCheck.isHealthy) {
        console.warn('游戏引擎健康检查发现问题:', healthCheck.issues);
      }

      setIsInitialized(true);
    } catch (err) {
      console.error('游戏引擎初始化失败:', err);
      setError('游戏引擎初始化失败');
    }
  }, []);

  // 同步游戏状态
  const syncGameState = useCallback(() => {
    try {
      const newGameState = gameEngineRef.current.getGameState();
      const newPhase = gameEngineRef.current.getCurrentPhase();
      
      setGameState(newGameState);
      setCurrentPhase(newPhase);
      setError(null);
    } catch (err) {
      console.error('同步游戏状态失败:', err);
      setError('同步游戏状态失败');
    }
  }, []);

  // 开始新游戏
  const startNewGame = useCallback(() => {
    try {
      gameEngineRef.current.startNewGame();
      syncGameState();
    } catch (err) {
      console.error('开始新游戏失败:', err);
      setError('开始新游戏失败');
    }
  }, [syncGameState]);

  // 继续游戏
  const continueGame = useCallback(() => {
    try {
      const hasSave = gameEngineRef.current.hasSavedGame();
      if (!hasSave) {
        setError('没有找到存档');
        return false;
      }

      const success = gameEngineRef.current.loadGame();
      if (success) {
        syncGameState();
        return true;
      } else {
        setError('加载存档失败');
        return false;
      }
    } catch (err) {
      console.error('继续游戏失败:', err);
      setError('继续游戏失败');
      return false;
    }
  }, [syncGameState]);

  // 完成问卷
  const completeQuestionnaire = useCallback((answers: QuestionnaireAnswers) => {
    try {
      const success = gameEngineRef.current.completeQuestionnaire(answers);
      if (success) {
        syncGameState();
        return true;
      } else {
        setError('问卷处理失败');
        return false;
      }
    } catch (err) {
      console.error('完成问卷失败:', err);
      setError('完成问卷失败');
      return false;
    }
  }, [syncGameState]);

  // 执行事件选择
  const executeEventChoice = useCallback((optionId: string) => {
    try {
      const success = gameEngineRef.current.executeEventChoice(optionId);
      if (success) {
        syncGameState();
        return true;
      } else {
        setError('执行事件选择失败');
        return false;
      }
    } catch (err) {
      console.error('执行事件选择失败:', err);
      setError('执行事件选择失败');
      return false;
    }
  }, [syncGameState]);

  // 进入下一回合
  const nextRound = useCallback(() => {
    try {
      const success = gameEngineRef.current.nextRound();
      if (success) {
        syncGameState();
        return true;
      } else {
        setError('进入下一回合失败');
        return false;
      }
    } catch (err) {
      console.error('进入下一回合失败:', err);
      setError('进入下一回合失败');
      return false;
    }
  }, [syncGameState]);

  // 重新开始游戏
  const restartGame = useCallback(() => {
    try {
      gameEngineRef.current.restartGame();
      syncGameState();
    } catch (err) {
      console.error('重新开始游戏失败:', err);
      setError('重新开始游戏失败');
    }
  }, [syncGameState]);

  // 保存游戏
  const saveGame = useCallback(() => {
    try {
      return gameEngineRef.current.saveGame();
    } catch (err) {
      console.error('保存游戏失败:', err);
      setError('保存游戏失败');
      return false;
    }
  }, []);

  // 检查是否有存档
  const hasSavedGame = useCallback(() => {
    try {
      return gameEngineRef.current.hasSavedGame();
    } catch (err) {
      console.error('检查存档失败:', err);
      return false;
    }
  }, []);

  // 获取当前事件
  const getCurrentEvent = useCallback(() => {
    try {
      return gameEngineRef.current.getCurrentEvent();
    } catch (err) {
      console.error('获取当前事件失败:', err);
      return null;
    }
  }, []);

  // 获取当前随机事件
  const getCurrentRandomEvents = useCallback((): RandomEvent[] => {
    try {
      return gameEngineRef.current.getCurrentRandomEvents();
    } catch (err) {
      console.error('获取随机事件失败:', err);
      return [];
    }
  }, []);

  // 获取选项可用性
  const getOptionAvailability = useCallback(() => {
    try {
      return gameEngineRef.current.getOptionAvailability();
    } catch (err) {
      console.error('获取选项可用性失败:', err);
      return new Map();
    }
  }, []);

  // 获取回合进度
  const getRoundProgress = useCallback(() => {
    try {
      return gameEngineRef.current.getRoundProgress();
    } catch (err) {
      console.error('获取回合进度失败:', err);
      return {
        currentRound: 0,
        maxRounds: 10,
        progressPercentage: 0,
        roundsRemaining: 10,
        isGameOver: false
      };
    }
  }, []);

  // 获取游戏统计
  const getGameStats = useCallback(() => {
    try {
      return gameEngineRef.current.getGameStats();
    } catch (err) {
      console.error('获取游戏统计失败:', err);
      return {
        totalRounds: 10,
        eventsCompleted: 0,
        randomEventsTriggered: 0,
        delayedEffectsActive: 0,
        gameDuration: 0
      };
    }
  }, []);

  // 获取玩家属性建议
  const getStatsAdvice = useCallback(() => {
    try {
      return gameEngineRef.current.getStatsAdvice();
    } catch (err) {
      console.error('获取属性建议失败:', err);
      return [];
    }
  }, []);

  // 获取属性评分
  const getStatsScore = useCallback(() => {
    try {
      return gameEngineRef.current.getStatsScore();
    } catch (err) {
      console.error('获取属性评分失败:', err);
      return {
        totalScore: 0,
        combatScore: 0,
        socialScore: 0,
        survivalScore: 0,
        details: {}
      };
    }
  }, []);

  // 获取引擎摘要
  const getEngineSummary = useCallback(() => {
    try {
      return gameEngineRef.current.getEngineSummary();
    } catch (err) {
      console.error('获取引擎摘要失败:', err);
      return null;
    }
  }, []);

  // 清除错误
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // 状态
    gameState,
    currentPhase,
    isInitialized,
    error,
    
    // 核心方法
    startNewGame,
    continueGame,
    completeQuestionnaire,
    executeEventChoice,
    nextRound,
    restartGame,
    
    // 存档方法
    saveGame,
    hasSavedGame,
    
    // 查询方法
    getCurrentEvent,
    getCurrentRandomEvents,
    getOptionAvailability,
    getRoundProgress,
    getGameStats,
    getStatsAdvice,
    getStatsScore,
    getEngineSummary,
    
    // 工具方法
    clearError,
    syncGameState
  };
};