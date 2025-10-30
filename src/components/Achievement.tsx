import { Achievement } from '../types/game';
import { Trophy, Check } from 'lucide-react';

interface AchievementBadgeProps {
  achievement: Achievement;
  showBonus?: boolean;
}

export const AchievementBadge = ({
  achievement,
  showBonus = false,
}: AchievementBadgeProps) => {
  return (
    <div
      className={`
      relative bg-background-dark border rounded-lg p-6 transition-all duration-300
      ${
        achievement.unlocked
          ? 'border-gold-primary shadow-gold-glow'
          : 'border-border-subtle opacity-60'
      }
    `}
    >
      {achievement.unlocked ? (
        <div className="absolute -top-3 -right-3 w-8 h-8 bg-semantic-success rounded-full flex items-center justify-center shadow-lg animate-scale-in">
          <Check className="w-5 h-5 text-white" />
        </div>
      ) : (
        <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full flex items-center justify-center" />
      )}

      <div className="flex items-start gap-4">
        <div
          className={`
          flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center
          ${
            achievement.unlocked
              ? 'bg-gold-primary text-background-near'
              : 'bg-background-hover text-text-tertiary'
          }
        `}
        >
          <Trophy className="w-6 h-6" />
        </div>

        <div className="flex-1 space-y-2">
          <h4
            className={`font-semibold text-lg ${achievement.unlocked ? 'text-gold-primary' : 'text-text-secondary'}`}
          >
            {achievement.name}
          </h4>
          <p className="text-text-secondary text-sm">
            {achievement.description}
          </p>

          {showBonus && achievement.bonus && achievement.unlocked ? (
            <div className="mt-3 pt-3 border-t border-border-subtle">
              <p className="text-semantic-success text-sm font-medium">
                奖励已应用：
                {Object.entries(achievement.bonus).map(([key, value]) => (
                  <span key={key} className="ml-2">
                    {key === 'martial' && `武艺+${value}`}
                    {key === 'fame' && `威望+${value}`}
                    {key === 'network' && `人脉+${value}`}
                    {key === 'energy' && `内力+${value}`}
                    {key === 'virtue' && `侠义值+${value}`}
                  </span>
                ))}
              </p>
            </div>
          ) : (
            <div className="mt-3 pt-3 border-t border-border-subtle" />
          )}
        </div>
      </div>
    </div>
  );
};

interface AchievementsListProps {
  achievements: Achievement[];
  showBonus?: boolean;
}

export const AchievementsList = ({
  achievements,
  showBonus = false,
}: AchievementsListProps) => {
  const validAchievements = achievements || [];
  const unlockedCount = validAchievements.filter((ach) => ach && ach.unlocked).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-h2 font-title font-bold text-gold-primary">
          成就系统
        </h3>
        <span className="text-text-secondary text-lg">
          已解锁：
          <span className="text-gold-primary font-bold ml-2">
            {unlockedCount} / {validAchievements.length}
          </span>
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {validAchievements.map((achievement, index) => (
          <div key={index}>
            {achievement ? (
              <AchievementBadge
                achievement={achievement}
                showBonus={showBonus}
              />
            ) : (
              <div />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
