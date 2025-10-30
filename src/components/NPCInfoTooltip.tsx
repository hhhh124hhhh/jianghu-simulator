import React, { useState } from 'react';
import { Info, Users, Heart, Eye, Swords, Crown, Star, AlertCircle } from 'lucide-react';
import { NPC, PlayerRelationship } from '../types/extended';

interface NPCInfoTooltipProps {
  npc: NPC;
  currentRelationship?: PlayerRelationship;
  children: React.ReactNode;
  showInline?: boolean;
}

interface RelationshipStatus {
  type: PlayerRelationship['type'];
  label: string;
  color: string;
  bgColor: string;
  icon: React.ReactNode;
}

const relationshipStatuses: RelationshipStatus[] = [
  {
    type: 'mentor',
    label: '师门恩义',
    color: 'text-semantic-success',
    bgColor: 'bg-semantic-success/20',
    icon: <Heart className="w-4 h-4" />
  },
  {
    type: 'friend',
    label: '江湖朋友',
    color: 'text-stats-network-base',
    bgColor: 'bg-stats-network-base/20',
    icon: <Users className="w-4 h-4" />
  },
  {
    type: 'rival',
    label: '竞争对手',
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

export const NPCInfoTooltip: React.FC<NPCInfoTooltipProps> = ({ 
  npc, 
  currentRelationship,
  children,
  showInline = false 
}) => {
  const [isVisible, setIsVisible] = useState(false);

  const getRelationshipStatus = (value: number): RelationshipStatus => {
    if (value >= 60) return relationshipStatuses.find(r => r.type === 'mentor') || relationshipStatuses[4];
    if (value >= 30) return relationshipStatuses.find(r => r.type === 'friend') || relationshipStatuses[4];
    if (value >= -10) return relationshipStatuses.find(r => r.type === 'neutral') || relationshipStatuses[4];
    if (value >= -30) return relationshipStatuses.find(r => r.type === 'rival') || relationshipStatuses[4];
    return relationshipStatuses.find(r => r.type === 'enemy') || relationshipStatuses[4];
  };

  const getRelationshipDescription = (value: number): string => {
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

  const relationshipStatus = currentRelationship 
    ? getRelationshipStatus(currentRelationship.value)
    : relationshipStatuses[4];

  const InlineDisplay = () => (
    <div className="flex items-center gap-2 text-sm">
      <Crown className="w-4 h-4 text-gold-primary" />
      <span className="font-medium text-text-primary">{npc.name}</span>
      {currentRelationship && (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${relationshipStatus.bgColor} ${relationshipStatus.color}`}>
          {getRelationshipDescription(currentRelationship.value)} ({currentRelationship.value > 0 ? '+' : ''}{currentRelationship.value})
        </span>
      )}
    </div>
  );

  const TooltipContent = () => (
    <div className="absolute z-50 w-80 bg-background-dark border border-gold-primary/50 rounded-lg shadow-2xl p-4 space-y-4">
      {/* NPC基本信息 */}
      <div className="border-b border-border-subtle pb-3">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-gold-primary/20 rounded-lg">
            <Crown className="w-6 h-6 text-gold-primary" />
          </div>
          <div>
            <h4 className="font-bold text-text-primary text-lg">{npc.name}</h4>
            <p className="text-sm text-gold-primary">{npc.title}</p>
          </div>
        </div>
        <p className="text-sm text-text-secondary leading-relaxed">
          {npc.description}
        </p>
      </div>

      {/* 当前关系状态 */}
      {currentRelationship && (
        <div className="border-b border-border-subtle pb-3">
          <h5 className="font-semibold text-text-primary mb-2 flex items-center gap-2">
            <Users className="w-4 h-4" />
            当前关系
          </h5>
          <div className="flex items-center justify-between mb-2">
            <div className={`flex items-center gap-2 px-3 py-1 rounded-lg ${relationshipStatus.bgColor}`}>
              {relationshipStatus.icon}
              <span className={`text-sm font-medium ${relationshipStatus.color}`}>
                {relationshipStatus.label}
              </span>
            </div>
            <span className={`font-bold ${relationshipStatus.color}`}>
              {currentRelationship.value > 0 ? '+' : ''}{currentRelationship.value}
            </span>
          </div>
          <div className="relative h-2 bg-background-hover rounded-full overflow-hidden">
            <div 
              className={`absolute inset-y-0 left-0 transition-all duration-300 ${
                currentRelationship.value >= 0 ? 'bg-semantic-success' : 'bg-semantic-error'
              }`}
              style={{ width: `${Math.abs((currentRelationship.value / 100) * 100)}%` }}
            />
          </div>
          <p className="text-xs text-text-secondary mt-1">
            {getRelationshipDescription(currentRelationship.value)}
          </p>
        </div>
      )}

      {/* NPC特质 */}
      <div className="border-b border-border-subtle pb-3">
        <h5 className="font-semibold text-text-primary mb-2 flex items-center gap-2">
          <Star className="w-4 h-4" />
          性格特质
        </h5>
        <div className="flex flex-wrap gap-2">
          {npc.traits.map((trait, index) => (
            <span 
              key={index}
              className="px-2 py-1 bg-background-hover border border-border-subtle rounded-md text-xs text-text-secondary"
            >
              {trait}
            </span>
          ))}
        </div>
      </div>

      {/* 互动提示 */}
      {currentRelationship && (
        <div>
          <h5 className="font-semibold text-text-primary mb-2 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            互动建议
          </h5>
          <div className="text-xs text-text-secondary space-y-1">
            {currentRelationship.value >= 50 && (
              <p>• 关系良好，可以寻求帮助或合作</p>
            )}
            {currentRelationship.value >= 20 && currentRelationship.value < 50 && (
              <p>• 关系一般，可以通过共同活动增进感情</p>
            )}
            {currentRelationship.value < 20 && currentRelationship.value >= -20 && (
              <p>• 关系平淡，需要更多的互动来建立信任</p>
            )}
            {currentRelationship.value < -20 && (
              <p>• 关系紧张，建议谨慎处理或寻求和解机会</p>
            )}
          </div>
        </div>
      )}
    </div>
  );

  if (showInline) {
    return <InlineDisplay />;
  }

  return (
    <div className="relative inline-block">
      <div 
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        className="cursor-help"
      >
        {children}
      </div>
      {isVisible && (
        <div className="absolute left-0 top-full mt-2 z-50">
          <TooltipContent />
        </div>
      )}
    </div>
  );
};