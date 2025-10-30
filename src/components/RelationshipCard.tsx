import React from 'react';
import { PlayerRelationship } from '../types/extended';
import { Users, Heart, Swords, Eye, AlertCircle } from 'lucide-react';

interface RelationshipCardProps {
  relationship: PlayerRelationship;
  onShowHistory?: (npcId: string) => void;
}

interface RelationshipCategory {
  type: PlayerRelationship['type'];
  label: string;
  color: string;
  bgColor: string;
  icon: React.ReactNode;
}

const relationshipCategories: RelationshipCategory[] = [
  {
    type: 'mentor',
    label: '师门恩义',
    color: 'text-semantic-success',
    bgColor: 'bg-semantic-success/20',
    icon: <Heart className="w-4 h-4" />
  },
  {
    type: 'friend',
    label: '江湖相逢',
    color: 'text-stats-network-base',
    bgColor: 'bg-stats-network-base/20',
    icon: <Users className="w-4 h-4" />
  },
  {
    type: 'rival',
    label: '竞争关系',
    color: 'text-semantic-warning',
    bgColor: 'bg-semantic-warning/20',
    icon: <Eye className="w-4 h-4" />
  },
  {
    type: 'enemy',
    label: '宿怨仇敌',
    color: 'text-semantic-error',
    bgColor: 'bg-semantic-error/20',
    icon: <Swords className="w-4 h-4" />
  },
  {
    type: 'neutral',
    label: '萍水相逢',
    color: 'text-text-secondary',
    bgColor: 'bg-background-hover',
    icon: <Users className="w-4 h-4" />
  }
];

export const RelationshipCard: React.FC<RelationshipCardProps> = ({ 
  relationship, 
  onShowHistory 
}) => {
  const category = relationshipCategories.find(cat => cat.type === relationship.type) || relationshipCategories[4];
  
  const getRelationshipBarColor = (value: number): string => {
    if (value >= 60) return 'bg-semantic-success';
    if (value >= 30) return 'bg-stats-network-base';
    if (value >= 0) return 'bg-text-secondary';
    if (value >= -30) return 'bg-semantic-warning';
    return 'bg-semantic-error';
  };

  const getRelationshipStatus = (value: number): string => {
    if (value >= 80) return '生死之交';
    if (value >= 60) return '信任之人';
    if (value >= 40) return '友好相处';
    if (value >= 20) return '初识之友';
    if (value >= 0) return '认识之人';
    if (value >= -20) return '略有嫌隙';
    if (value >= -40) return '心存芥蒂';
    if (value >= -60) return '关系紧张';
    return '不共戴天';
  };

  return (
    <div className="bg-background-dark border border-border-subtle rounded-lg p-4 space-y-3 hover:border-gold-primary/30 transition-all duration-300">
      {/* NPC名称和类型 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-md ${category.bgColor}`}>
            {category.icon}
          </div>
          <div>
            <h4 className="text-text-primary font-semibold">{relationship.targetName}</h4>
            <p className={`text-sm ${category.color}`}>{category.label}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-text-primary">
            {relationship.value > 0 ? '+' : ''}{relationship.value}
          </p>
          <p className="text-xs text-text-secondary">{getRelationshipStatus(relationship.value)}</p>
        </div>
      </div>

      {/* 关系值条 */}
      <div className="space-y-2">
        <div className="relative h-2 bg-background-hover rounded-full overflow-hidden">
          <div
            className={`absolute inset-y-0 left-0 transition-all duration-500 ${getRelationshipBarColor(relationship.value)}`}
            style={{ width: `${Math.abs((relationship.value / 100) * 100)}%` }}
          />
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="flex justify-between items-center pt-2">
        <div className="text-xs text-text-secondary">
          关系深度: {Math.abs(relationship.value)}%
        </div>
        {onShowHistory && (
          <button
            onClick={() => onShowHistory(relationship.targetId)}
            className="text-xs text-gold-primary hover:text-gold-primary/80 transition-colors flex items-center gap-1"
          >
            <AlertCircle className="w-3 h-3" />
            查看历史
          </button>
        )}
      </div>
    </div>
  );
};