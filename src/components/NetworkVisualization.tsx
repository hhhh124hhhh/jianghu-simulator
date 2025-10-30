import React, { useMemo } from 'react';
import { Player, PlayerRelationship } from '../types/extended';
import { Users, Heart, Swords, Eye, User } from 'lucide-react';

interface NetworkVisualizationProps {
  player: Player;
  className?: string;
}

interface NetworkNode {
  id: string;
  name: string;
  type: PlayerRelationship['type'];
  value: number;
  x: number;
  y: number;
  radius: number;
}

interface NetworkEdge {
  from: string;
  to: string;
  strength: number;
  type: string;
}

export const NetworkVisualization: React.FC<NetworkVisualizationProps> = ({ 
  player, 
  className = '' 
}) => {
  const svgSize = 400;
  const centerX = svgSize / 2;
  const centerY = svgSize / 2;

  // 生成网络节点和边
  const { nodes, edges } = useMemo(() => {
    const networkNodes: NetworkNode[] = [];
    const networkEdges: NetworkEdge[] = [];

    // 中心节点：玩家
    networkNodes.push({
      id: 'player',
      name: '你',
      type: 'neutral',
      value: 0,
      x: centerX,
      y: centerY,
      radius: 30
    });

    // 为每个关系创建节点
    const relationships = Array.from(player.relationships.values());
    relationships.forEach((relationship: PlayerRelationship, index) => {
      const angle = (index / relationships.length) * 2 * Math.PI;
      const distance = 120 + Math.abs(relationship.value) * 0.8; // 根据关系值调整距离
      
      networkNodes.push({
        id: relationship.targetId,
        name: relationship.targetName,
        type: relationship.type,
        value: relationship.value,
        x: centerX + Math.cos(angle) * distance,
        y: centerY + Math.sin(angle) * distance,
        radius: 15 + Math.abs(relationship.value) * 0.15
      });

      // 创建边
      networkEdges.push({
        from: 'player',
        to: relationship.targetId,
        strength: Math.abs(relationship.value),
        type: relationship.type
      });
    });

    
    return { nodes: networkNodes, edges: networkEdges };
  }, [player, centerX, centerY]);

  // 获取节点颜色
  const getNodeColor = (type: PlayerRelationship['type'], value: number): string => {
    if (value >= 60) return '#10b981'; // 绿色 - 信任
    if (value >= 30) return '#3b82f6'; // 蓝色 - 友好
    if (value >= 0) return '#6b7280';  // 灰色 - 中立
    if (value >= -30) return '#f59e0b'; // 橙色 - 不信任
    return '#ef4444'; // 红色 - 敌对
  };

  // 获取边的颜色和宽度
  const getEdgeStyle = (strength: number, type: PlayerRelationship['type']) => {
    return {
      stroke: getNodeColor(type, strength > 0 ? strength : -strength),
      strokeWidth: Math.max(1, Math.min(5, strength / 20)),
      opacity: Math.max(0.3, Math.min(1, strength / 100))
    };
  };

  // 获取图标
  const getIcon = (type: PlayerRelationship['type']) => {
    switch (type) {
      case 'mentor': return <Heart className="w-3 h-3" />;
      case 'friend': return <Users className="w-3 h-3" />;
      case 'rival': return <Eye className="w-3 h-3" />;
      case 'enemy': return <Swords className="w-3 h-3" />;
      default: return <User className="w-3 h-3" />;
    }
  };

  return (
    <div className={`bg-background-dark border border-border-subtle rounded-lg p-6 ${className}`}>
      <h3 className="text-h3 font-semibold text-gold-primary mb-4 text-center">
        人脉网络图
      </h3>
      
      {nodes.length <= 1 ? (
        <div className="text-center py-8">
          <Users className="w-12 h-12 text-text-secondary mx-auto mb-4" />
          <p className="text-text-secondary">暂无人脉关系</p>
          <p className="text-sm text-text-secondary mt-2">在江湖中多结识各路人士</p>
        </div>
      ) : (
        <div className="flex flex-col items-center space-y-4">
          {/* SVG网络图 */}
          <svg width={svgSize} height={svgSize} className="border border-border-subtle rounded-lg bg-background-hover">
            {/* 绘制边 */}
            {edges.map((edge, index) => {
              const fromNode = nodes.find(n => n.id === edge.from);
              const toNode = nodes.find(n => n.id === edge.to);
              if (!fromNode || !toNode) return null;

              const edgeStyle = getEdgeStyle(edge.strength, edge.type as PlayerRelationship['type']);

              return (
                <line
                  key={index}
                  x1={fromNode.x}
                  y1={fromNode.y}
                  x2={toNode.x}
                  y2={toNode.y}
                  {...edgeStyle}
                />
              );
            })}

            {/* 绘制节点 */}
            {nodes.map(node => (
              <g key={node.id}>
                {/* 节点圆圈 */}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={node.radius}
                  fill={node.id === 'player' ? '#d97706' : getNodeColor(node.type, node.value)}
                  stroke={node.id === 'player' ? '#f59e0b' : '#ffffff'}
                  strokeWidth="2"
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                />
                
                {/* 节点图标（简化文本） */}
                <text
                  x={node.x}
                  y={node.y + 1}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="white"
                  fontSize={node.id === 'player' ? '16' : '12'}
                  fontWeight="bold"
                >
                  {node.id === 'player' ? '你' : (node.name ? node.name.charAt(0) : '?')}
                </text>

                {/* 节点标签 */}
                <text
                  x={node.x}
                  y={node.y + node.radius + 15}
                  textAnchor="middle"
                  fill="#e5e7eb"
                  fontSize="12"
                >
                  {node.name || 'Unknown'}
                </text>

                {/* 关系值 */}
                {node.id !== 'player' && (
                  <text
                    x={node.x}
                    y={node.y + node.radius + 28}
                    textAnchor="middle"
                    fill={node.value >= 0 ? '#10b981' : '#ef4444'}
                    fontSize="10"
                    fontWeight="bold"
                  >
                    {node.value > 0 ? '+' : ''}{node.value}
                  </text>
                )}
              </g>
            ))}
          </svg>

          {/* 图例 */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="space-y-2">
              <h4 className="font-semibold text-gold-primary">关系类型</h4>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-text-secondary">信任/友好</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                  <span className="text-text-secondary">中立</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                  <span className="text-text-secondary">不信任</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className="text-text-secondary">敌对</span>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-gold-primary">网络统计</h4>
              <div className="space-y-1 text-text-secondary">
                <p>总人数: {nodes.length - 1}</p>
                <p>深度关系: {nodes.filter(n => Math.abs(n.value) >= 50).length}</p>
                <p>平均关系: {
                  nodes.length > 1 
                    ? Math.round(nodes.filter(n => n.id !== 'player').reduce((sum, n) => sum + Math.abs(n.value), 0) / (nodes.length - 1))
                    : 0
                }</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};