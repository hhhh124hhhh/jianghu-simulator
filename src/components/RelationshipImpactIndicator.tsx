import React from 'react';
import { NPCRelationshipEffect } from '../types/game';
import { Users, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';

interface RelationshipImpactIndicatorProps {
  npcEffects: NPCRelationshipEffect[];
  compact?: boolean;
  showNPCNames?: boolean;
}

export const RelationshipImpactIndicator: React.FC<RelationshipImpactIndicatorProps> = ({ 
  npcEffects, 
  compact = false,
  showNPCNames = true 
}) => {
  if (npcEffects.length === 0) {
    return null;
  }

  const getImpactDescription = (change: number): string => {
    const absChange = Math.abs(change);
    if (change >= 10) return '大幅改善';
    if (change >= 5) return '明显改善';
    if (change >= 1) return '略微改善';
    if (change <= -10) return '大幅恶化';
    if (change <= -5) return '明显恶化';
    if (change <= -1) return '略微恶化';
    return '无变化';
  };

  const getImpactColor = (change: number): string => {
    if (change >= 10) return 'text-semantic-success';
    if (change >= 5) return 'text-stats-network-base';
    if (change >= 1) return 'text-green-600';
    if (change <= -10) return 'text-semantic-error';
    if (change <= -5) return 'text-orange-600';
    if (change <= -1) return 'text-red-600';
    return 'text-text-secondary';
  };

  const getTotalImpact = (): number => {
    return npcEffects.reduce((sum, effect) => sum + effect.relationshipChange, 0);
  };

  const getOverallStatus = (): {
    icon: React.ReactNode;
    color: string;
    description: string;
  } => {
    const totalImpact = getTotalImpact();
    
    if (totalImpact >= 10) {
      return {
        icon: <TrendingUp className="w-5 h-5" />,
        color: 'text-semantic-success',
        description: '人脉关系大幅改善'
      };
    } else if (totalImpact >= 5) {
      return {
        icon: <TrendingUp className="w-5 h-5" />,
        color: 'text-stats-network-base',
        description: '人脉关系有所改善'
      };
    } else if (totalImpact >= 1) {
      return {
        icon: <TrendingUp className="w-5 h-5" />,
        color: 'text-green-600',
        description: '人脉关系略微改善'
      };
    } else if (totalImpact <= -10) {
      return {
        icon: <TrendingDown className="w-5 h-5" />,
        color: 'text-semantic-error',
        description: '人脉关系大幅恶化'
      };
    } else if (totalImpact <= -5) {
      return {
        icon: <TrendingDown className="w-5 h-5" />,
        color: 'text-orange-600',
        description: '人脉关系有所恶化'
      };
    } else if (totalImpact <= -1) {
      return {
        icon: <TrendingDown className="w-5 h-5" />,
        color: 'text-red-600',
        description: '人脉关系略微恶化'
      };
    } else {
      return {
        icon: <Users className="w-5 h-5" />,
        color: 'text-text-secondary',
        description: '人脉关系无显著变化'
      };
    }
  };

  const CompactView = () => {
    const totalImpact = getTotalImpact();
    const status = getOverallStatus();
    
    return (
      <div className={`flex items-center gap-2 px-3 py-2 rounded-lg bg-background-hover border ${
        totalImpact > 0 ? 'border-semantic-success/30' : 
        totalImpact < 0 ? 'border-semantic-error/30' : 
        'border-border-subtle'
      }`}>
        <span className={status.color}>{status.icon}</span>
        <span className="text-sm font-medium text-text-primary">{status.description}</span>
        <span className={`text-xs font-bold ${status.color}`}>
          ({totalImpact > 0 ? '+' : ''}{totalImpact})
        </span>
      </div>
    );
  };

  const DetailedView = () => {
    const status = getOverallStatus();
    
    return (
      <div className={`p-4 rounded-lg border space-y-3 ${
        getTotalImpact() > 0 ? 'bg-semantic-success/5 border-semantic-success/30' : 
        getTotalImpact() < 0 ? 'bg-semantic-error/5 border-semantic-error/30' : 
        'bg-background-hover border-border-subtle'
      }`}>
        {/* 总体影响 */}
        <div className="flex items-center gap-3 pb-2 border-b border-border-subtle">
          <span className={status.color}>{status.icon}</span>
          <div>
            <h4 className="font-semibold text-text-primary">人脉关系影响</h4>
            <p className={`text-sm ${status.color}`}>{status.description}</p>
          </div>
        </div>

        {/* 具体NPC影响 */}
        <div className="space-y-2">
          {npcEffects.map((effect, index) => {
            const impactColor = getImpactColor(effect.relationshipChange);
            const impactDesc = getImpactDescription(effect.relationshipChange);
            
            return (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-text-secondary" />
                  <span className="text-sm text-text-primary">
                    {showNPCNames ? effect.npcName : '关系变化'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs ${impactColor}`}>{impactDesc}</span>
                  <span className={`text-sm font-bold ${impactColor}`}>
                    {effect.relationshipChange > 0 ? '+' : ''}{effect.relationshipChange}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* 注意事项 */}
        {npcEffects.some(effect => effect.relationshipChange < -5) && (
          <div className="flex items-start gap-2 pt-2 border-t border-border-subtle">
            <AlertTriangle className="w-4 h-4 text-semantic-warning mt-0.5" />
            <p className="text-xs text-semantic-warning">
              警告：此选择可能会恶化与重要人物的关系，请谨慎考虑。
            </p>
          </div>
        )}
      </div>
    );
  };

  return compact ? <CompactView /> : <DetailedView />;
};