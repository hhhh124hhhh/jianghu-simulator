import { GameEvent } from '../types/game';
import { OptionButton } from './Button';
import { isOptionAvailable, getEnergyCostDescription } from '../utils/gameLogic';

interface EventCardProps {
  event: GameEvent;
  onSelectOption: (optionId: string) => void;
  selectedOption?: string;
  currentEnergy: number;
}

export const EventCard = ({
  event,
  onSelectOption,
  selectedOption,
  currentEnergy,
}: EventCardProps) => {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* 事件标题和描述 */}
      <div className="bg-background-dark border border-border-subtle rounded-lg p-8 space-y-4">
        <h3 className="text-h2 font-title font-bold text-gold-primary">
          {event.title}
        </h3>
        <p className="text-body-lg text-text-primary leading-relaxed">
          {event.description}
        </p>
      </div>

      {/* 选项 */}
      <div className="space-y-4">
        <h4 className="text-h3 font-semibold text-text-primary">
          请选择你的行动：
        </h4>
        {event.options.map((option) => {
          const energyChange = option.effects.energy || 0;
          const isAvailable = isOptionAvailable(currentEnergy, energyChange);
          const energyDescription = getEnergyCostDescription(energyChange);
          
          return (
            <OptionButton
              key={option.id}
              label={option.label}
              description={option.description}
              onClick={() => onSelectOption(option.id)}
              selected={selectedOption === option.id}
              disabled={!isAvailable}
              className={!isAvailable ? 'opacity-50 cursor-not-allowed' : ''}
            >
              <div className="flex flex-col items-start gap-1">
                <span>{option.description}</span>
                {energyChange !== 0 && (
                  <span className={`text-xs ${
                    energyChange > 0 ? 'text-semantic-success' : 'text-semantic-error'
                  }`}>
                    {energyDescription}
                  </span>
                )}
                {!isAvailable && (
                  <span className="text-xs text-semantic-error font-medium">
                    内力不足！
                  </span>
                )}
              </div>
            </OptionButton>
          );
        })}
      </div>
    </div>
  );
};
