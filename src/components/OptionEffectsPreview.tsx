import React from 'react';
import { Swords, Crown, Users, Zap, Scale, Heart, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import { EventOption, NPCRelationshipEffect } from '../types/game';
import { NPCInfoTooltip } from './NPCInfoTooltip';
import { NPC } from '../types/extended';

interface OptionEffectsPreviewProps {
  option: EventOption;
  npcs?: Map<string, NPC>;
  currentRelationships?: Map<string, number>;
  showDetailed?: boolean;
}

interface StatEffect {
  name: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}

export const OptionEffectsPreview: React.FC<OptionEffectsPreviewProps> = ({ 
  option, 
  npcs,
  currentRelationships,
  showDetailed = false 
}) => {
  const getStatIcon = (stat: string): React.ReactNode => {
    switch (stat) {
      case 'martial': return <Swords className="w-4 h-4" />;
      case 'fame': return <Crown className="w-4 h-4" />;
      case 'network': return <Users className="w-4 h-4" />;
      case 'energy': return <Zap className="w-4 h-4" />;
      case 'virtue': return <Scale className="w-4 h-4" />;
      default: return null;
    }
  };

  const getStatColor = (value: number): string => {
    return value > 0 ? 'text-semantic-success' : 'text-semantic-error';
  };

  const getStatName = (stat: string): string => {
    switch (stat) {
      case 'martial': return '武艺';
      case 'fame': return '威望';
      case 'network': return '人脉';
      case 'energy': return '内力';
      case 'virtue': return '侠义值';
      default: return stat;
    }
  };

  // 统计属性效果
  const statEffects: StatEffect[] = Object.entries(option.effects).map(([key, value]) => ({
    name: getStatName(key),
    value: value as number,
    icon: getStatIcon(key),
    color: getStatColor(value as number)
  })).filter(effect => effect.value !== 0);

  // NPC关系效果
  const npcEffects = option.npcRelationshipEffects || [];

  if (statEffects.length === 0 && npcEffects.length === 0 && !option.consequences?.length) {
    return null;
  }

  const CompactView = () => (
    <div className="flex flex-wrap gap-2 mt-2">
      {statEffects.map((effect, index) => (
        <span 
          key={`stat-${index}`}
          className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${effect.color} ${
            effect.value > 0 ? 'bg-semantic-success/20' : 'bg-semantic-error/20'
          }`}
        >
          {effect.icon}
          {effect.value > 0 ? '+' : ''}{effect.value} {effect.name}
        </span>
      ))}
      {npcEffects.map((effect, index) => (
        <span 
          key={`npc-${index}`}
          className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
            effect.relationshipChange > 0 
              ? 'text-stats-network-base bg-stats-network-base/20' 
              : 'text-semantic-error bg-semantic-error/20'
          }`}
        >
          <Users className="w-3 h-3" />
          {effect.relationshipChange > 0 ? '+' : ''}{effect.relationshipChange} {effect.npcName}
        </span>
      ))}
      {option.consequences && option.consequences.length > 0 && (
        <span className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium text-gold-primary bg-gold-primary/20">
          <AlertTriangle className="w-3 h-3" />
          特殊后果
        </span>
      )}
    </div>
  );

  const DetailedView = () => (
    <div className="mt-3 space-y-3 border-t border-border-subtle pt-3">
      {/* 属性变化 */}
      {statEffects.length > 0 && (
        <div>
          <h5 className="text-sm font-semibold text-text-primary mb-2">属性变化：</h5>
          <div className="space-y-1">
            {statEffects.map((effect, index) => (
              <div key={`stat-${index}`} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  {effect.icon}
                  <span className="text-text-secondary">{effect.name}</span>
                </div>
                <span className={`font-medium ${effect.color}`}>
                  {effect.value > 0 ? '+' : ''}{effect.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* NPC关系变化 */}
      {npcEffects.length > 0 && (
        <div>
          <h5 className="text-sm font-semibold text-text-primary mb-2 flex items-center gap-2">
            <Users className="w-4 h-4" />
            人脉关系变化：
          </h5>
          <div className="space-y-2">
            {npcEffects.map((effect, index) => {
              const npc = npcs?.get(effect.npcId);
              const currentRelation = currentRelationships?.get(effect.npcId) || 0;
              const newRelation = currentRelation + effect.relationshipChange;
              
              return (
                <div key={`npc-${index}`} className="flex items-center justify-between p-2 bg-background-hover rounded-lg">
                  <div className="flex items-center gap-2">
                    {npc && (
                      <NPCInfoTooltip 
                        npc={npc} 
                        currentRelationship={{
                          targetId: effect.npcId,
                          targetName: effect.npcName,
                          value: newRelation,
                          type: newRelation >= 30 ? 'friend' : newRelation <= -30 ? 'enemy' : 'neutral'
                        }}
                        showInline={true}
                      >
                        <div className="flex items-center gap-2">
                          <Crown className="w-4 h-4 text-gold-primary" />
                          <span className="font-medium text-text-primary">{effect.npcName}</span>
                        </div>
                      </NPCInfoTooltip>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-text-secondary">
                      {currentRelation > 0 ? '+' : ''}{currentRelation} → {newRelation > 0 ? '+' : ''}{newRelation}
                    </span>
                    <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                      effect.relationshipChange > 0 
                        ? 'text-semantic-success bg-semantic-success/20' 
                        : 'text-semantic-error bg-semantic-error/20'
                    }`}>
                      {effect.relationshipChange > 0 ? (
                        <TrendingUp className="w-3 h-3" />
                      ) : (
                        <TrendingDown className="w-3 h-3" />
                      )}
                      {effect.relationshipChange > 0 ? '+' : ''}{effect.relationshipChange}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 特殊后果 */}
      {option.consequences && option.consequences.length > 0 && (
        <div>
          <h5 className="text-sm font-semibold text-text-primary mb-2 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            潜在后果：
          </h5>
          <ul className="text-xs text-text-secondary space-y-1">
            {option.consequences.map((consequence, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-gold-primary">•</span>
                <span>{consequence}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );

  return showDetailed ? <DetailedView /> : <CompactView />;
};