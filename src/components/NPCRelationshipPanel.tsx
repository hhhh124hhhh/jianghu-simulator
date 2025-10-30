import React, { useState, useMemo } from 'react';
import { Player, PlayerRelationship } from '../types/extended';
import { Users, Heart, Swords, Eye, ChevronDown, ChevronUp } from 'lucide-react';
import { RelationshipCard } from './RelationshipCard';

interface NPCRelationshipPanelProps {
  player: Player;
  className?: string;
}

interface RelationshipCategory {
  type: PlayerRelationship['type'];
  label: string;
  color: string;
  bgColor: string;
  icon: React.ReactNode;
  description: string;
}

const relationshipCategories: RelationshipCategory[] = [
  {
    type: 'mentor',
    label: '师门恩义',
    color: 'text-semantic-success',
    bgColor: 'bg-semantic-success/20',
    icon: <Heart className="w-5 h-5" />,
    description: '师门长辈、恩师挚友'
  },
  {
    type: 'friend',
    label: '江湖相逢',
    color: 'text-stats-network-base',
    bgColor: 'bg-stats-network-base/20',
    icon: <Users className="w-5 h-5" />,
    description: '江湖朋友、萍水相逢'
  },
  {
    type: 'rival',
    label: '竞争关系',
    color: 'text-semantic-warning',
    bgColor: 'bg-semantic-warning/20',
    icon: <Eye className="w-5 h-5" />,
    description: '竞争对手、明争暗斗'
  },
  {
    type: 'enemy',
    label: '宿怨仇敌',
    color: 'text-semantic-error',
    bgColor: 'bg-semantic-error/20',
    icon: <Swords className="w-5 h-5" />,
    description: '仇敌敌对、不共戴天'
  },
  {
    type: 'neutral',
    label: '萍水相逢',
    color: 'text-text-secondary',
    bgColor: 'bg-background-hover',
    icon: <Users className="w-5 h-5" />,
    description: '认识之人、关系平淡'
  }
];

export const NPCRelationshipPanel: React.FC<NPCRelationshipPanelProps> = ({ 
  player, 
  className = '' 
}) => {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['friend', 'mentor']));
  const [selectedNPC, setSelectedNPC] = useState<string | null>(null);

  // 按类型分组关系
  const groupedRelationships = useMemo(() => {
    const groups: Record<string, PlayerRelationship[]> = {};
    
    relationshipCategories.forEach(category => {
      groups[category.type] = [];
    });

    player.relationships.forEach(relationship => {
      if (groups[relationship.type]) {
        groups[relationship.type].push(relationship);
      } else {
        groups['neutral'].push(relationship);
      }
    });

    // 按关系值排序
    Object.keys(groups).forEach(type => {
      groups[type].sort((a, b) => Math.abs(b.value) - Math.abs(a.value));
    });

    console.log('NPCRelationshipPanel: 重新计算关系分组', {
      totalRelationships: player.relationships.size,
      relationshipVersion: player.getRelationshipVersion ? player.getRelationshipVersion() : 'N/A'
    });

    return groups;
  }, [player]);

  // 统计数据
  const statistics = useMemo(() => {
    const total = player.relationships.size;
    const byType: Record<string, number> = {};
    
    relationshipCategories.forEach(category => {
      byType[category.type] = groupedRelationships[category.type]?.length || 0;
    });

    const avgRelationship = total > 0 
      ? Array.from(player.relationships.values()).reduce((sum, rel) => sum + rel.value, 0) / total 
      : 0;

    return {
      total,
      byType,
      avgRelationship: Math.round(avgRelationship),
      strongRelationships: Array.from(player.relationships.values()).filter(rel => Math.abs(rel.value) >= 50).length
    };
  }, [player.relationships, groupedRelationships]);

  const toggleCategory = (type: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(type)) {
      newExpanded.delete(type);
    } else {
      newExpanded.add(type);
    }
    setExpandedCategories(newExpanded);
  };

  const handleShowHistory = (npcId: string) => {
    setSelectedNPC(npcId);
    // 这里可以显示历史记录的弹窗
    console.log('显示历史记录:', npcId);
  };

  return (
    <div className={`bg-background-dark border border-gold-primary/30 rounded-lg p-6 ${className}`}>
      {/* 标题和统计 */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-h3 font-title font-bold text-gold-primary flex items-center gap-2">
            <Users className="w-6 h-6" />
            人脉网络
          </h3>
          <div className="text-sm text-text-secondary">
            共 {statistics.total} 人
          </div>
        </div>

        {/* 快速统计 */}
        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="bg-background-hover rounded-lg p-3">
            <p className="text-lg font-bold text-gold-primary">{statistics.avgRelationship}</p>
            <p className="text-xs text-text-secondary">平均关系</p>
          </div>
          <div className="bg-background-hover rounded-lg p-3">
            <p className="text-lg font-bold text-semantic-success">{statistics.strongRelationships}</p>
            <p className="text-xs text-text-secondary">深度关系</p>
          </div>
        </div>

        {/* 关系分类 */}
        <div className="space-y-3">
          {relationshipCategories.map(category => {
            const relationships = groupedRelationships[category.type] || [];
            const isExpanded = expandedCategories.has(category.type);
            const count = relationships.length;

            if (count === 0) return null;

            return (
              <div key={category.type} className="border border-border-subtle rounded-lg overflow-hidden">
                {/* 分类标题 */}
                <button
                  onClick={() => toggleCategory(category.type)}
                  className="w-full p-3 bg-background-hover hover:bg-background-near transition-colors flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <div className={`p-1 rounded ${category.bgColor}`}>
                      {category.icon}
                    </div>
                    <div className="text-left">
                      <p className={`font-semibold ${category.color}`}>{category.label}</p>
                      <p className="text-xs text-text-secondary">{category.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-text-primary">{count}人</span>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-text-secondary" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-text-secondary" />
                    )}
                  </div>
                </button>

                {/* 关系列表 */}
                {isExpanded && (
                  <div className="p-3 space-y-2 max-h-96 overflow-y-auto">
                    {relationships.map(relationship => (
                      <RelationshipCard
                        key={relationship.targetId}
                        relationship={relationship}
                        onShowHistory={handleShowHistory}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* 空状态 */}
        {statistics.total === 0 && (
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-text-secondary mx-auto mb-4" />
            <p className="text-text-secondary">暂无任何人脉关系</p>
            <p className="text-sm text-text-secondary mt-2">在江湖中闯荡，结识各路英雄豪杰</p>
          </div>
        )}
      </div>
    </div>
  );
};