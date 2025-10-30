import { useState, useEffect } from 'react';
import { GameState, GamePhase, QuestionnaireAnswers } from './types/game';
import {
  initializeGameState,
  initializePlayerStats,
  applyStatsChange,
  saveGameState,
  loadGameState,
  clearGameState,
  hasSavedGame,
} from './utils/gameLogic';
import { questionnaire } from './data/questionnaire';
import { StartScreen } from './pages/StartScreen';
import { QuestionnaireScreen } from './pages/QuestionnaireScreen';
import { GamePlayScreen } from './pages/GamePlayScreen';
import { ResultScreen } from './pages/ResultScreen';
import { ErrorBoundary } from './components/ErrorBoundary';
import { SoundToggle } from './components/SoundToggle';

function App() {
  const [gamePhase, setGamePhase] = useState<GamePhase>('start');
  const [gameState, setGameState] = useState<GameState>(initializeGameState());
  const [hasSave, setHasSave] = useState(false);

  useEffect(() => {
    // 检查是否有存档
    setHasSave(hasSavedGame());
  }, []);

  useEffect(() => {
    // 自动保存游戏进度
    if (gamePhase === 'playing' && !gameState.isGameOver) {
      saveGameState(gameState);
    }
  }, [gameState, gamePhase]);

  const handleStartNewGame = () => {
    // 清除旧存档
    clearGameState();
    // 初始化新游戏
    const newState = initializeGameState();
    setGameState(newState);
    setGamePhase('questionnaire');
  };

  const handleContinueGame = () => {
    const savedState = loadGameState();
    if (savedState) {
      setGameState(savedState);
      if (savedState.isGameOver) {
        setGamePhase('result');
      } else if (savedState.questionnaire) {
        setGamePhase('playing');
      } else {
        setGamePhase('questionnaire');
      }
    }
  };

  const handleQuestionnaireComplete = (answers: QuestionnaireAnswers) => {
    // 应用问卷答案的属性加成
    let stats = initializePlayerStats();

    // 遍历问卷问题并应用效果
    questionnaire.forEach((question) => {
      const answer = answers[question.id as keyof QuestionnaireAnswers];
      const option = question.options.find((opt) => opt.value === answer);
      if (option && option.effects) {
        stats = applyStatsChange(stats, option.effects);
      }
    });

    // 更新游戏状态
    const newState: GameState = {
      ...gameState,
      questionnaire: answers,
      playerStats: stats,
    };

    setGameState(newState);
    setGamePhase('playing');
  };

  const handleUpdateGameState = (newState: GameState) => {
    setGameState(newState);
  };

  const handleGameOver = () => {
    setGamePhase('result');
    // 清除自动保存
    clearGameState();
  };

  const handleRestart = () => {
    clearGameState();
    setGamePhase('start');
    setGameState(initializeGameState());
    setHasSave(false);
  };

  return (
    <div className="min-h-screen bg-background-near font-body text-text-primary antialiased">
      {/* 音效开关 - 在所有页面都显示 */}
      <SoundToggle />
      
      {gamePhase === 'start' && (
        <StartScreen
          onStart={handleStartNewGame}
          onContinue={handleContinueGame}
          hasSavedGame={hasSave}
        />
      )}

      {gamePhase === 'questionnaire' && (
        <QuestionnaireScreen onComplete={handleQuestionnaireComplete} />
      )}

      {gamePhase === 'playing' && (
        <GamePlayScreen
          gameState={gameState}
          onUpdateState={handleUpdateGameState}
          onGameOver={handleGameOver}
        />
      )}

      {gamePhase === 'result' && (
        <ErrorBoundary>
          <ResultScreen gameState={gameState} onRestart={handleRestart} />
        </ErrorBoundary>
      )}
    </div>
  );
}

export default App;
