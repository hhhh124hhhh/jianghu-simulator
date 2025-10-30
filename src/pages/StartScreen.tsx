import { Button } from '../components/Button';

interface StartScreenProps {
  onStart: () => void;
  onContinue?: () => void;
  hasSavedGame: boolean;
}

export const StartScreen = ({
  onStart,
  onContinue,
  hasSavedGame,
}: StartScreenProps) => {
  return (
    <div className="min-h-screen bg-background-near flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-12 animate-fade-in">
        {/* 游戏标题 */}
        <div className="text-center space-y-6">
          <h1 className="text-hero md:text-hero font-title font-bold text-gold-primary drop-shadow-lg animate-pulse-glow">
            江湖小白成长记
          </h1>
          <p className="text-body-lg text-text-secondary max-w-xl mx-auto leading-relaxed">
            踏入江湖，从一个无名小辈成长为一代侠客。你的每一个选择，都将影响你在江湖中的命运。
          </p>
        </div>

        {/* 按钮 */}
        <div className="space-y-4 max-w-md mx-auto">
          <Button onClick={onStart} size="lg" className="w-full">
            开始新游戏
          </Button>

          {hasSavedGame && onContinue && (
            <Button
              onClick={onContinue}
              size="lg"
              variant="secondary"
              className="w-full"
            >
              继续游戏
            </Button>
          )}
        </div>

        {/* 游戏说明 */}
        <div className="bg-background-dark border border-border-subtle rounded-lg p-8 space-y-4">
          <h3 className="text-h3 font-semibold text-gold-primary">游戏说明</h3>
          <ul className="space-y-2 text-text-secondary text-body">
            <li className="flex items-start gap-2">
              <span className="text-gold-primary mt-1">•</span>
              <span>回答5个问卷问题，塑造你的初始属性</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-gold-primary mt-1">•</span>
              <span>经历10轮江湖事件，每轮都有不同的选择</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-gold-primary mt-1">•</span>
              <span>
                管理武艺、威望、人脉、内力、侠义值五个核心属性
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-gold-primary mt-1">•</span>
              <span>解锁成就，获得额外奖励</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-gold-primary mt-1">•</span>
              <span>游戏进度自动保存，可随时继续</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
