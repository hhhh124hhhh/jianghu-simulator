import { useState, useEffect } from 'react';
import { GameState, PlayerStats } from '../types/game';
import { gameEvents } from '../data/events';
import { getRandomEvent } from '../data/randomEvents';
import { checkAchievements, applyAchievementBonus } from '../data/achievements';
import { applyStatsChange, isOptionAvailable, recoverEnergyPerRound } from '../utils/gameLogic';
import { StatsDisplay } from '../components/StatBar';
import { EventCard } from '../components/EventCard';
import { Button } from '../components/Button';
import { Sparkles, AlertCircle } from 'lucide-react';

interface GamePlayScreenProps {
  gameState: GameState;
  onUpdateState: (state: GameState) => void;
  onGameOver: () => void;
}

export const GamePlayScreen = ({
  gameState,
  onUpdateState,
  onGameOver,
}: GamePlayScreenProps) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showRandomEvent, setShowRandomEvent] = useState(false);
  const [currentRandomEvent, setCurrentRandomEvent] = useState<any>(null);
  const [newAchievements, setNewAchievements] = useState<string[]>([]);

  const currentEvent = gameEvents[gameState.currentRound];

  // 如果游戏已结束，立即触发结束事件
  useEffect(() => {
    if (gameState.isGameOver || gameState.currentRound >= gameState.maxRounds) {
      onGameOver();
    }
  }, [gameState.isGameOver, gameState.currentRound, gameState.maxRounds, onGameOver]);

  useEffect(() => {
    // 检查是否触发随机事件
    if (gameState.currentRound > 0 && gameState.currentRound < 10) {
      const randomEvent = getRandomEvent();
      if (randomEvent) {
        setCurrentRandomEvent(randomEvent);
        setShowRandomEvent(true);
      }
    }
  }, [gameState.currentRound]);

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
    if (!selectedOption) return;

    const option = currentEvent.options.find(
      (opt) => opt.id === selectedOption
    );
    if (!option) return;

    // 检查内力是否足够执行该选项
    const energyChange = option.effects.energy || 0;
    if (!isOptionAvailable(gameState.playerStats.energy, energyChange)) {
      alert('内力不足！无法执行此选项。请选择消耗内力较少的选项。');
      return;
    }

    // 应用选项效果
    let newStats = applyStatsChange(gameState.playerStats, option.effects);

    // 每轮结束自动恢复1点内力（模拟休息调息）
    if (gameState.currentRound < gameState.maxRounds - 1) {
      newStats = {
        ...newStats,
        energy: recoverEnergyPerRound(newStats.energy)
      };
    }

    // 检查成就
    const updatedAchievements = checkAchievements(
      newStats,
      gameState.achievements
    );
    const unlockedAchievements = updatedAchievements.filter(
      (ach) =>
        ach.unlocked &&
        !gameState.achievements.find((a) => a.id === ach.id)?.unlocked
    );

    // 应用成就奖励
    unlockedAchievements.forEach((ach) => {
      newStats = applyAchievementBonus(newStats, ach);
    });

    // 记录新成就
    if (unlockedAchievements.length > 0) {
      setNewAchievements(unlockedAchievements.map((ach) => ach.name));
      setTimeout(() => setNewAchievements([]), 3000);
    }

    // 更新游戏状态
    const newState: GameState = {
      ...gameState,
      currentRound: gameState.currentRound + 1,
      playerStats: newStats,
      eventHistory: [
        ...gameState.eventHistory,
        {
          round: gameState.currentRound,
          eventId: currentEvent.id,
          selectedOption: selectedOption,
          effects: option.effects,
        },
      ],
      achievements: updatedAchievements,
      isGameOver: gameState.currentRound + 1 >= gameState.maxRounds,
    };

    onUpdateState(newState);
    setSelectedOption(null);

    // 如果游戏结束，触发结束事件
    if (newState.isGameOver) {
      setTimeout(() => onGameOver(), 1000);
    }
  };

  const handleCloseRandomEvent = () => {
    if (!currentRandomEvent) return;

    // 应用随机事件效果
    let newStats = applyStatsChange(
      gameState.playerStats,
      currentRandomEvent?.effects || {}
    );

    // 检查成就
    const updatedAchievements = checkAchievements(
      newStats,
      gameState.achievements
    );
    const unlockedAchievements = updatedAchievements.filter(
      (ach) =>
        ach.unlocked &&
        !gameState.achievements.find((a) => a.id === ach.id)?.unlocked
    );

    // 应用成就奖励
    unlockedAchievements.forEach((ach) => {
      newStats = applyAchievementBonus(newStats, ach);
    });

    // 记录新成就
    if (unlockedAchievements.length > 0) {
      setNewAchievements(unlockedAchievements.map((ach) => ach.name));
      setTimeout(() => setNewAchievements([]), 3000);
    }

    const newState: GameState = {
      ...gameState,
      playerStats: newStats,
      randomEvents: [
        ...gameState.randomEvents,
        ...(currentRandomEvent ? [{
          round: gameState.currentRound,
          event: currentRandomEvent,
        }] : []),
      ],
      achievements: updatedAchievements,
    };

    onUpdateState(newState);
    setShowRandomEvent(false);
    setCurrentRandomEvent(null);
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
                <StatsDisplay stats={gameState.playerStats} />
              </div>
            </div>
          </div>

          {/* 右侧：事件区域 */}
          <div className="lg:col-span-2 space-y-6">
            <EventCard
              event={currentEvent}
              onSelectOption={handleSelectOption}
              selectedOption={selectedOption || undefined}
              currentEnergy={gameState.playerStats.energy}
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

            <div className="bg-background-hover border border-border-subtle rounded-lg p-4">
              <h5 className="text-body font-semibold text-text-primary mb-2">
                属性变化：
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
