import { GameEvent } from '../types/game';
import { OptionButton } from './Button';
import { isOptionAvailable, getEnergyCostDescription } from '../utils/gameLogic';
import { OptionEffectsPreview } from './OptionEffectsPreview';
import { RelationshipImpactIndicator } from './RelationshipImpactIndicator';
import { NPCInfoTooltip } from './NPCInfoTooltip';
import { NPC, PlayerRelationship } from '../types/extended';

interface EventCardProps {
  event: GameEvent;
  onSelectOption: (optionId: string) => void;
  selectedOption?: string;
  currentEnergy: number;
  npcs?: Map<string, NPC>;
  currentRelationships?: Map<string, PlayerRelationship>;
  showDetailedEffects?: boolean;
}

export const EventCard = ({
  event,
  onSelectOption,
  selectedOption,
  currentEnergy,
  npcs = new Map(),
  currentRelationships = new Map(),
  showDetailedEffects = false,
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
          const npcEffects = option.npcRelationshipEffects || [];
          const hasSignificantRelationshipChange = npcEffects.some(effect => Math.abs(effect.relationshipChange) >= 3);
          
          return (
            <div key={option.id} className="space-y-2">
              <OptionButton
                label={option.label}
                description={option.description}
                onClick={() => onSelectOption(option.id)}
                selected={selectedOption === option.id}
                disabled={!isAvailable}
                className={!isAvailable ? 'opacity-50 cursor-not-allowed' : ''}
              >
                <div className="flex flex-col items-start gap-2">
                  <span>{option.description}</span>
                  
                  {/* 效果预览 */}
                  <OptionEffectsPreview 
                    option={option}
                    npcs={npcs}
                    currentRelationships={new Map(
                      Array.from(currentRelationships.entries()).map(([id, rel]) => [id, rel.value])
                    )}
                    showDetailed={showDetailedEffects}
                  />
                  
                  {/* 内力消耗提示 */}
                  {energyChange !== 0 && (
                    <span className={`text-xs ${
                      energyChange > 0 ? 'text-semantic-success' : 'text-semantic-error'
                    }`}>
                      {energyDescription}
                    </span>
                  )}
                  
                  {/* 内力不足提示 */}
                  {!isAvailable && (
                    <span className="text-xs text-semantic-error font-medium">
                      内力不足！
                    </span>
                  )}
                </div>
              </OptionButton>

              {/* 关系影响指示器（紧凑模式） */}
              {!showDetailedEffects && npcEffects.length > 0 && (
                <div className="ml-4">
                  <RelationshipImpactIndicator 
                    npcEffects={npcEffects}
                    compact={true}
                    showNPCNames={true}
                  />
                </div>
              )}

              {/* 确认提示 */}
              {hasSignificantRelationshipChange && selectedOption === option.id && (
                <div className="ml-4 p-3 bg-semantic-warning/10 border border-semantic-warning/30 rounded-lg">
                  <p className="text-xs text-semantic-warning">
                    ⚠️ 此选择将显著影响人脉关系，请确认后再进行。
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
