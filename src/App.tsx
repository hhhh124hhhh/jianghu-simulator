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
import { GameEngine } from './core/GameEngine';

function App() {
  const [gameEngine, setGameEngine] = useState<GameEngine | null>(null);
  const [gamePhase, setGamePhase] = useState<GamePhase>('start');
  const [gameState, setGameState] = useState<GameState>(initializeGameState());
  const [hasSave, setHasSave] = useState(false);

  useEffect(() => {
    // 初始化游戏引擎
    const engine = new GameEngine();
    setGameEngine(engine);
    
    // 检查是否有存档
    setHasSave(engine.hasSavedGame());
  }, []);

  useEffect(() => {
    // 自动保存游戏进度
    if (gameEngine && gamePhase === 'playing' && !gameState.isGameOver) {
      gameEngine.saveGame();
    }
  }, [gameState, gamePhase, gameEngine]);

  const handleStartNewGame = () => {
    if (!gameEngine) return;
    
    // 清除旧存档
    gameEngine.clearSave();
    // 开始新游戏
    gameEngine.startNewGame();
    setGamePhase('questionnaire');
    setGameState(gameEngine.getGameState());
  };

  const handleContinueGame = () => {
    if (!gameEngine) return;
    
    if (gameEngine.loadGame()) {
      const loadedState = gameEngine.getGameState();
      setGameState(loadedState);
      setGamePhase(gameEngine.getCurrentPhase());
    }
  };

  const handleQuestionnaireComplete = (answers: QuestionnaireAnswers) => {
    if (!gameEngine) return;
    
    if (gameEngine.completeQuestionnaire(answers)) {
      setGameState(gameEngine.getGameState());
      setGamePhase(gameEngine.getCurrentPhase());
    }
  };

  const handleUpdateGameState = (newState: GameState) => {
    setGameState(newState);
  };

  const handleGameOver = () => {
    setGamePhase('result');
  };

  const handleRestart = () => {
    if (!gameEngine) return;
    
    gameEngine.restartGame();
    setGamePhase(gameEngine.getCurrentPhase());
    setGameState(gameEngine.getGameState());
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

      {gamePhase === 'playing' && gameEngine && (
        <GamePlayScreen
          gameState={gameState}
          gameEngine={gameEngine}
          onUpdateState={handleUpdateGameState}
          onGameOver={handleGameOver}
        />
      )}

      {gamePhase === 'result' && (
        <ErrorBoundary>
          <ResultScreen 
            gameState={gameState} 
            player={gameEngine ? gameEngine.getPlayer() : undefined}
            onRestart={handleRestart} 
          />
        </ErrorBoundary>
      )}
    </div>
  );
}

export default App;
