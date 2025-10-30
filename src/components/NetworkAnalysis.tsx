import React, { useMemo } from 'react';
import { Player, PlayerRelationship } from '../types/extended';
import { Users, TrendingUp, TrendingDown, Award, AlertTriangle, Heart, Swords, Eye, Crown } from 'lucide-react';

interface NetworkAnalysisProps {
  player: Player;
  className?: string;
}

interface RelationshipAnalysis {
  totalRelations: number;
  strongRelations: number;
  weakRelations: number;
  positiveRelations: number;
  negativeRelations: number;
  neutralRelations: number;
  averageValue: number;
  mostPositive: PlayerRelationship | null;
  mostNegative: PlayerRelationship | null;
  networkDensity: number;
  influenceScore: number;
}

interface CategoryStats {
  type: PlayerRelationship['type'];
  count: number;
  avgValue: number;
  strongest: PlayerRelationship | null;
  color: string;
  icon: React.ReactNode;
  description: string;
}

export const NetworkAnalysis: React.FC<NetworkAnalysisProps> = ({ 
  player, 
  className = '' 
}) => {
  // 分析关系数据
  const analysis = useMemo((): RelationshipAnalysis => {
    const relationships = Array.from(player.relationships.values());
    
    if (relationships.length === 0) {
      return {
        totalRelations: 0,
        strongRelations: 0,
        weakRelations: 0,
        positiveRelations: 0,
        negativeRelations: 0,
        neutralRelations: 0,
        averageValue: 0,
        mostPositive: null,
        mostNegative: null,
        networkDensity: 0,
        influenceScore: 0
      };
    }

    const strongRelations = relationships.filter(r => Math.abs(r.value) >= 50).length;
    const weakRelations = relationships.filter(r => Math.abs(r.value) < 50).length;
    const positiveRelations = relationships.filter(r => r.value > 0).length;
    const negativeRelations = relationships.filter(r => r.value < 0).length;
    const neutralRelations = relationships.filter(r => r.value === 0).length;
    
    const averageValue = Math.round(
      relationships.reduce((sum, r) => sum + r.value, 0) / relationships.length
    );
    
    const mostPositive = relationships.reduce((best: PlayerRelationship | null, current) => 
      current.value > (best?.value || -101) ? current : best, null
    );
    
    const mostNegative = relationships.reduce((worst: PlayerRelationship | null, current) => 
      current.value < (worst?.value || 101) ? current : worst, null
    );

    // 网络密度：基于关系数量和质量
    const networkDensity = Math.min(100, Math.round(
      (relationships.length * 10) + (strongRelations * 15) + (positiveRelations * 8)
    ));

    // 影响力评分：基于人脉数量、质量和关系类型
    const influenceScore = Math.min(100, Math.round(
      (relationships.length * 5) + 
      (positiveRelations * 8) + 
      (strongRelations * 12) +
      (averageValue > 0 ? averageValue * 2 : 0)
    ));

    return {
      totalRelations: relationships.length,
      strongRelations,
      weakRelations,
      positiveRelations,
      negativeRelations,
      neutralRelations,
      averageValue,
      mostPositive,
      mostNegative,
      networkDensity,
      influenceScore
    };
  }, [player.relationships]);

  // 按类型统计
  const categoryStats = useMemo((): CategoryStats[] => {
    const categories: Record<string, CategoryStats> = {
      mentor: {
        type: 'mentor',
        count: 0,
        avgValue: 0,
        strongest: null,
        color: 'text-semantic-success',
        icon: <Heart className="w-4 h-4" />,
        description: '师门恩义'
      },
      friend: {
        type: 'friend',
        count: 0,
        avgValue: 0,
        strongest: null,
        color: 'text-stats-network-base',
        icon: <Users className="w-4 h-4" />,
        description: '江湖相逢'
      },
      rival: {
        type: 'rival',
        count: 0,
        avgValue: 0,
        strongest: null,
        color: 'text-semantic-warning',
        icon: <Eye className="w-4 h-4" />,
        description: '竞争关系'
      },
      enemy: {
        type: 'enemy',
        count: 0,
        avgValue: 0,
        strongest: null,
        color: 'text-semantic-error',
        icon: <Swords className="w-4 h-4" />,
        description: '宿怨仇敌'
      },
      neutral: {
        type: 'neutral',
        count: 0,
        avgValue: 0,
        strongest: null,
        color: 'text-text-secondary',
        icon: <Users className="w-4 h-4" />,
        description: '萍水相逢'
      }
    };

    const relationships = Array.from(player.relationships.values());
    
    relationships.forEach((relationship: PlayerRelationship) => {
      const category = categories[relationship.type];
      if (category) {
        category.count++;
        if (!category.strongest || Math.abs(relationship.value) > Math.abs(category.strongest.value)) {
          category.strongest = relationship;
        }
      }
    });

    // 计算各类型的平均值
    Object.keys(categories).forEach(type => {
      const category = categories[type];
      const typeRelationships = relationships.filter(r => r.type === type);
      if (typeRelationships.length > 0) {
        category.avgValue = Math.round(
          typeRelationships.reduce((sum, r) => sum + r.value, 0) / typeRelationships.length
        );
      }
    });

    return Object.values(categories).filter(cat => cat.count > 0);
  }, [player.relationships]);

  // 获取网络评价
  const getNetworkAssessment = () => {
    if (analysis.totalRelations === 0) return '孤身一人';
    if (analysis.influenceScore >= 80) return '江湖领袖';
    if (analysis.influenceScore >= 60) return '人脉广阔';
    if (analysis.influenceScore >= 40) return '小有名气';
    if (analysis.influenceScore >= 20) return '初识江湖';
    return '默默无闻';
  };

  const getNetworkColor = (score: number): string => {
    if (score >= 80) return 'text-semantic-success';
    if (score >= 60) return 'text-stats-network-base';
    if (score >= 40) return 'text-gold-primary';
    if (score >= 20) return 'text-semantic-warning';
    return 'text-text-secondary';
  };

  return (
    <div className={`bg-background-dark border border-border-subtle rounded-lg p-6 space-y-6 ${className}`}>
      <h3 className="text-h3 font-semibold text-gold-primary mb-6">
        人脉分析报告
      </h3>

      {/* 总体评估 */}
      <div className="text-center p-4 bg-background-hover rounded-lg border border-gold-primary/20">
        <Crown className="w-8 h-8 text-gold-primary mx-auto mb-2" />
        <h4 className={`text-2xl font-bold mb-2 ${getNetworkColor(analysis.influenceScore)}`}>
          {getNetworkAssessment()}
        </h4>
        <p className="text-text-secondary">
          影响力评分: <span className="font-bold">{analysis.influenceScore}</span>/100
        </p>
      </div>

      {/* 核心指标 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center p-4 bg-background-hover rounded-lg">
          <Users className="w-6 h-6 text-stats-network-base mx-auto mb-2" />
          <p className="text-lg font-bold text-text-primary">{analysis.totalRelations}</p>
          <p className="text-xs text-text-secondary">总人脉</p>
        </div>
        <div className="text-center p-4 bg-background-hover rounded-lg">
          <TrendingUp className="w-6 h-6 text-semantic-success mx-auto mb-2" />
          <p className="text-lg font-bold text-semantic-success">{analysis.positiveRelations}</p>
          <p className="text-xs text-text-secondary">正面关系</p>
        </div>
        <div className="text-center p-4 bg-background-hover rounded-lg">
          <TrendingDown className="w-6 h-6 text-semantic-error mx-auto mb-2" />
          <p className="text-lg font-bold text-semantic-error">{analysis.negativeRelations}</p>
          <p className="text-xs text-text-secondary">负面关系</p>
        </div>
        <div className="text-center p-4 bg-background-hover rounded-lg">
          <Award className="w-6 h-6 text-gold-primary mx-auto mb-2" />
          <p className="text-lg font-bold text-gold-primary">{analysis.strongRelations}</p>
          <p className="text-xs text-text-secondary">深度关系</p>
        </div>
      </div>

      {/* 关系分类统计 */}
      {categoryStats.length > 0 && (
        <div>
          <h4 className="text-body font-semibold text-gold-primary mb-4">关系分类</h4>
          <div className="space-y-3">
            {categoryStats.map((category) => (
              <div key={category.type} className="flex items-center justify-between p-3 bg-background-hover rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-background-dark ${category.color}`}>
                    {category.icon}
                  </div>
                  <div>
                    <p className="font-medium text-text-primary">{category.description}</p>
                    <p className="text-xs text-text-secondary">
                      {category.count}人 · 平均关系值: {category.avgValue > 0 ? '+' : ''}{category.avgValue}
                    </p>
                  </div>
                </div>
                {category.strongest && (
                  <div className="text-right">
                    <p className="text-xs text-text-secondary">最深关系</p>
                    <p className="text-sm font-medium text-text-primary">
                      {category.strongest.targetName}
                    </p>
                    <p className={`text-xs font-bold ${
                      category.strongest.value > 0 ? 'text-semantic-success' : 'text-semantic-error'
                    }`}>
                      {category.strongest.value > 0 ? '+' : ''}{category.strongest.value}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 极端关系 */}
      {(analysis.mostPositive || analysis.mostNegative) && (
        <div>
          <h4 className="text-body font-semibold text-gold-primary mb-4">极端关系</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {analysis.mostPositive && (
              <div className="p-4 bg-semantic-success/10 border border-semantic-success/30 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-semantic-success" />
                  <span className="font-semibold text-semantic-success">最亲密关系</span>
                </div>
                <p className="text-text-primary font-medium">{analysis.mostPositive.targetName}</p>
                <p className="text-semantic-success font-bold">+{analysis.mostPositive.value}</p>
              </div>
            )}
            {analysis.mostNegative && (
              <div className="p-4 bg-semantic-error/10 border border-semantic-error/30 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingDown className="w-5 h-5 text-semantic-error" />
                  <span className="font-semibold text-semantic-error">最紧张关系</span>
                </div>
                <p className="text-text-primary font-medium">{analysis.mostNegative.targetName}</p>
                <p className="text-semantic-error font-bold">{analysis.mostNegative.value}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 网络健康度 */}
      <div>
        <h4 className="text-body font-semibold text-gold-primary mb-4">网络健康度</h4>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-text-secondary">网络密度</span>
              <span className="text-text-primary">{analysis.networkDensity}%</span>
            </div>
            <div className="h-2 bg-background-hover rounded-full overflow-hidden">
              <div 
                className="h-full bg-stats-network-base transition-all duration-500"
                style={{ width: `${analysis.networkDensity}%` }}
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-text-secondary">关系平衡</span>
              <span className="text-text-primary">
                {analysis.positiveRelations > analysis.negativeRelations ? '良好' : 
                 analysis.positiveRelations < analysis.negativeRelations ? '需改善' : '平衡'}
              </span>
            </div>
            <div className="h-2 bg-background-hover rounded-full overflow-hidden">
              <div 
                className="h-full bg-semantic-success transition-all duration-500"
                style={{ width: `${analysis.totalRelations > 0 ? (analysis.positiveRelations / analysis.totalRelations) * 100 : 0}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 建议 */}
      <div>
        <h4 className="text-body font-semibold text-gold-primary mb-4">
          <AlertTriangle className="w-4 h-4 inline mr-2" />
          江湖建议
        </h4>
        <div className="space-y-2 text-sm text-text-secondary">
          {analysis.totalRelations === 0 && (
            <p>• 多参与江湖事件，结识各路人士是立足之本</p>
          )}
          {analysis.positiveRelations < analysis.negativeRelations && analysis.totalRelations > 0 && (
            <p>• 负面关系较多，建议修复关系或谨慎处理敌对势力</p>
          )}
          {analysis.strongRelations < 2 && analysis.totalRelations > 0 && (
            <p>• 深度关系较少，建议与重要人物建立更牢固的联系</p>
          )}
          {analysis.influenceScore >= 60 && (
            <p>• 人脉广阔，善用影响力可成就更大事业</p>
          )}
          {analysis.influenceScore < 30 && analysis.totalRelations > 0 && (
            <p>• 继续拓展人脉，多参与社交活动以提升影响力</p>
          )}
        </div>
      </div>
    </div>
  );
};