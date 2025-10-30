import { useState, useEffect } from 'react';
import { GameState, PlayerStats } from '../types/game';
import { gameEvents } from '../data/events';
import { checkAchievements, applyAchievementBonus } from '../data/achievements';
import { isOptionAvailable, recoverEnergyPerRound } from '../utils/gameLogic';
import { StatsDisplay } from '../components/StatBar';
import { EventCard } from '../components/EventCard';
import { Button } from '../components/Button';
import { NPCRelationshipPanel } from '../components/NPCRelationshipPanel';
import { Sparkles, AlertCircle, Users, ChevronDown, ChevronUp } from 'lucide-react';
import { useSound } from '../hooks/useSound';
import { GameEngine } from '../core/GameEngine';
import { NPC } from '../types/extended';

interface GamePlayScreenProps {
  gameState: GameState;
  gameEngine: GameEngine;
  onUpdateState: (state: GameState) => void;
  onGameOver: () => void;
}

export const GamePlayScreen = ({
  gameState,
  gameEngine,
  onUpdateState,
  onGameOver,
}: GamePlayScreenProps) => {
  const { playSound } = useSound();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showRandomEvent, setShowRandomEvent] = useState(false);
  const [currentRandomEvent, setCurrentRandomEvent] = useState<any>(null);
  const [newAchievements, setNewAchievements] = useState<string[]>([]);
  const [showRelationshipPanel, setShowRelationshipPanel] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(0); // 强制更新标志

  const currentEvent = gameEngine ? gameEngine.getCurrentEvent() : null;

  // 如果游戏已结束，立即触发结束事件
  useEffect(() => {
    const shouldEndGame = gameState.isGameOver || gameState.currentRound >= gameState.maxRounds;
    
    if (shouldEndGame) {
      // 强制立即触发游戏结束，不延迟
      onGameOver();
    }
  }, [gameState.isGameOver, gameState.currentRound, gameState.maxRounds, onGameOver]);

  // 检查随机事件（在主事件执行后）
  useEffect(() => {
    if (gameEngine) {
      const randomEvents = gameEngine.getCurrentRandomEvents();
      if (randomEvents.length > 0) {
        setCurrentRandomEvent(randomEvents[0]); // 显示第一个随机事件
        setShowRandomEvent(true);
        // 播放事件音效
        playSound('event');
        console.log('随机事件显示:', randomEvents[0].title);
      }
    }
  }, [gameState.currentRound, playSound, gameEngine]);

  // 监听成就变化（包括随机事件触发的成就）
  useEffect(() => {
    if (gameEngine) {
      const currentPlayer = gameEngine.getPlayer();
      const gameState = gameEngine.getGameState();
      
      // 检查当前回合是否已完成（包括主事件和随机事件）
      const roundCompleted = gameState.currentRound > 0;
      
      if (roundCompleted) {
        // 检查最近的历史记录中是否有成就解锁
        const recentHistory = currentPlayer.history.slice(-2);
        let foundAchievements: string[] = [];
        
        for (const history of recentHistory) {
          if (history.metadata?.achievementsUnlocked) {
            foundAchievements = [...foundAchievements, ...history.metadata.achievementsUnlocked];
          }
        }
        
        // 去重，只显示不重复的成就
        const uniqueAchievements = Array.from(new Set(foundAchievements));
        
        if (uniqueAchievements.length > 0 && !recentHistory.some(h => h.metadata?.achievementsUnlocked)) {
          console.log('回合结束时发现新成就:', uniqueAchievements);
          
          // 逐个显示成就弹窗
          uniqueAchievements.forEach((achName: string, index: number) => {
            setTimeout(() => {
              setNewAchievements([achName]);
              setTimeout(() => setNewAchievements([]), 2500);
            }, index * 3000);
          });
          
          playSound('success');
        }
      }
    }
  }, [gameState.currentRound, gameEngine, playSound]); // 添加forceUpdate依赖

  // 如果没有当前事件（游戏结束），显示加载状态
  if (!currentEvent) {
    return (
      <div className="min-h-screen bg-background-near flex items-center justify-center">
        <div className="text-center">
          <p className="text-h3 text-gold-primary">游戏结束，正在跳转...</p>
        </div>
      </div>
    );
  }

  const handleSelectOption = (optionId: string) => {
    setSelectedOption(optionId);
  };

  const handleConfirm = () => {
    if (!selectedOption || !gameEngine) return;

    const option = currentEvent.options.find(
      (opt) => opt.id === selectedOption
    );
    if (!option) return;

    // 检查内力是否足够执行该选项 - 使用Player对象的实时属性
    const player = gameEngine.getPlayer();
    const currentEnergy = player.stats.energy;
    const energyChange = option.effects.energy || 0;
    if (!isOptionAvailable(currentEnergy, energyChange)) {
      alert('内力不足！无法执行此选项。请选择消耗内力较少的选项。');
      return;
    }

    // 记录执行前的关系版本号
    const beforeVersion = gameEngine.getPlayer().getRelationshipVersion?.() || 0;

    // 使用游戏引擎执行事件选择
    if (gameEngine.executeEventChoice(selectedOption)) {
      // 更新游戏状态
      const newState = gameEngine.getGameState();
      onUpdateState(newState);
      setSelectedOption(null);

      // 检查关系是否发生变化，如果有则强制更新UI
      const afterVersion = gameEngine.getPlayer().getRelationshipVersion?.() || 0;
      if (afterVersion > beforeVersion) {
        setForceUpdate(prev => prev + 1);
      }

      // 检查成就变化 - 改进成就检测逻辑
      const currentPlayer = gameEngine.getPlayer();
      
      // 获取最新历史记录中的成就解锁信息
      const recentHistory = currentPlayer.history.slice(-3); // 检查最近3条历史
      let foundAchievements: string[] = [];
      
      for (const history of recentHistory) {
        if (history.metadata?.achievementsUnlocked) {
          foundAchievements = [...foundAchievements, ...history.metadata.achievementsUnlocked];
        }
      }
      
      // 去重，只显示不重复的成就
      const uniqueAchievements = Array.from(new Set(foundAchievements));
      
      if (uniqueAchievements.length > 0) {
        console.log('发现新解锁成就:', uniqueAchievements);
        
        // 逐个显示成就弹窗
        uniqueAchievements.forEach((achName: string, index: number) => {
          setTimeout(() => {
            setNewAchievements([achName]); // 一次只显示一个成就
            setTimeout(() => setNewAchievements([]), 2500); // 2.5秒后隐藏
          }, index * 3000); // 每3秒显示一个
        });
        
        // 播放成功音效
        playSound('success');
      }

      // 如果游戏结束，立即触发结束事件
      if (newState.isGameOver || newState.currentRound >= newState.maxRounds) {
        // 立即触发游戏结束，不延迟
        onGameOver();
      }
    }
  };

  const handleCloseRandomEvent = () => {
    console.log('关闭随机事件:', currentRandomEvent?.title);
    
    // 应用随机事件效果（在用户关闭弹窗时）
    if (gameEngine && currentRandomEvent) {
      gameEngine.applyRandomEventEffects();
      console.log('随机事件效果已应用:', currentRandomEvent.effects);
    }
    
    // 关闭随机事件UI
    setShowRandomEvent(false);
    setCurrentRandomEvent(null);
    
    // 清空RoundManager中的随机事件数组，防止重复显示
    if (gameEngine) {
      gameEngine.clearRandomEvents();
    }
  };

  return (
    <div className="min-h-screen bg-background-near p-4 py-12">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左侧：属性面板 */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-background-dark border border-gold-primary/30 rounded-lg p-6 sticky top-4">
              <div className="space-y-6">
                {/* 轮次显示 */}
                <div className="text-center pb-4 border-b border-border-subtle">
                  <h3 className="text-h3 font-title font-bold text-gold-primary">
                    第 {gameState.currentRound + 1} 轮
                  </h3>
                  <p className="text-text-secondary text-sm mt-1">
                    共 {gameState.maxRounds} 轮
                  </p>
                </div>

                {/* 属性显示 */}
                <div className="space-y-4">
                  <StatsDisplay stats={gameEngine ? gameEngine.getPlayer().getCurrentStats() : gameState.playerStats} />
                  
                  {/* 人脉关系按钮 */}
                  <button
                    onClick={() => setShowRelationshipPanel(!showRelationshipPanel)}
                    className="w-full p-3 bg-stats-network-base/20 border border-stats-network-base/30 rounded-lg hover:bg-stats-network-base/30 transition-all duration-300 flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-stats-network-base" />
                      <span className="font-semibold text-stats-network-base">人脉网络</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {gameEngine && (
                        <span className="text-sm text-stats-network-base/80">
                          {gameEngine.getPlayer().relationships.size}人
                        </span>
                      )}
                      {showRelationshipPanel ? (
                        <ChevronUp className="w-4 h-4 text-stats-network-base" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-stats-network-base" />
                      )}
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* 人脉关系面板 */}
            {showRelationshipPanel && gameEngine && (
              <NPCRelationshipPanel 
                key={`relationships-${forceUpdate}`} // 使用key强制重新渲染
                player={gameEngine.getPlayer()}
                className="sticky top-4"
              />
            )}
          </div>

          {/* 右侧：事件区域 */}
          <div className="lg:col-span-2 space-y-6">
            <EventCard
              event={currentEvent}
              onSelectOption={handleSelectOption}
              selectedOption={selectedOption || undefined}
              currentEnergy={gameEngine ? gameEngine.getPlayer().stats.energy : gameState.playerStats.energy}
              npcs={gameEngine ? gameEngine.getAllNPCStates() : new Map()}
              currentRelationships={gameEngine ? gameEngine.getPlayer().relationships : new Map()}
              showDetailedEffects={true}
            />

            <div className="flex justify-end">
              <Button
                onClick={handleConfirm}
                size="lg"
                disabled={!selectedOption}
                className="min-w-48"
              >
                确认选择
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 随机事件弹窗 */}
      {showRandomEvent && currentRandomEvent && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="max-w-2xl w-full bg-background-dark border-2 border-gold-primary rounded-lg p-8 space-y-6 animate-scale-in">
            <div className="flex items-center gap-3">
              <Sparkles className="w-8 h-8 text-gold-primary" />
              <h3 className="text-h2 font-title font-bold text-gold-primary">
                随机事件
              </h3>
            </div>

            <div className="space-y-4">
              <h4 className="text-h3 font-semibold text-text-primary">
                {currentRandomEvent?.title || '随机事件'}
              </h4>
              <p className="text-body-lg text-text-secondary leading-relaxed">
                {currentRandomEvent?.description || '事件描述'}
              </p>
            </div>

            {/* 当前属性显示 */}
            <div className="bg-background-hover border border-border-subtle rounded-lg p-4 mb-4">
              <h5 className="text-body font-semibold text-text-primary mb-2">
                当前属性：
              </h5>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-4">
                {gameEngine && gameEngine.getPlayer() && [
                  {key: 'martial', label: '武艺'},
                  {key: 'fame', label: '威望'},
                  {key: 'network', label: '人脉'},
                  {key: 'energy', label: '内力'},
                  {key: 'virtue', label: '侠义值'}
                ].map(stat => {
                  const currentStats = gameEngine.getPlayer().getCurrentStats();
                  const effect = (currentRandomEvent?.effects as any)?.[stat.key] || 0;
                  const newValue = currentStats[stat.key as keyof typeof currentStats] + effect;
                  
                  return (
                    <div key={stat.key} className="text-center">
                      <div className="text-sm text-text-secondary">{stat.label}</div>
                      <div className="text-h4 font-bold text-gold-primary">
                        {currentStats[stat.key as keyof typeof currentStats]}
                      </div>
                      {effect !== 0 && (
                        <div className={`text-xs font-medium ${
                          effect > 0 ? 'text-semantic-success' : 'text-semantic-error'
                        }`}>
                          → {newValue} ({effect > 0 ? '+' : ''}{effect})
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 即将发生的变化 */}
            <div className="bg-background-hover border border-border-subtle rounded-lg p-4">
              <h5 className="text-body font-semibold text-text-primary mb-2">
                即将发生的变化：
              </h5>
              <div className="flex flex-wrap gap-2">
                {Object.entries(currentRandomEvent?.effects || {}).map(
                  ([key, value]: [string, any]) => (
                    <span
                      key={key}
                      className={`px-3 py-1 rounded-md text-sm font-medium ${
                        value > 0
                          ? 'bg-semantic-success/20 text-semantic-success'
                          : 'bg-semantic-error/20 text-semantic-error'
                      }`}
                    >
                      {key === 'martial' && '武艺'}
                      {key === 'fame' && '威望'}
                      {key === 'network' && '人脉'}
                      {key === 'energy' && '内力'}
                      {key === 'virtue' && '侠义值'} {value > 0 ? '+' : ''}
                      {value}
                    </span>
                  )
                )}
              </div>
              <p className="text-sm text-text-secondary mt-2">
                点击"继续冒险"后，这些变化将会生效
              </p>
            </div>

            <Button onClick={handleCloseRandomEvent} size="lg" className="w-full">
              继续冒险
            </Button>
          </div>
        </div>
      )}

      {/* 成就解锁提示 */}
      {newAchievements.length > 0 && (
        <div className="fixed top-4 right-4 z-50 animate-slide-up">
          {newAchievements.map((name, index) => (
            <div
              key={index}
              className="bg-semantic-success border-2 border-semantic-success/50 rounded-lg p-4 mb-2 shadow-xl"
            >
              <div className="flex items-center gap-3">
                <AlertCircle className="w-6 h-6 text-white" />
                <div>
                  <p className="text-white font-bold">成就解锁！</p>
                  <p className="text-white/90 text-sm">{name}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
