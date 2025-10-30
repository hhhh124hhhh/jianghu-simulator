import { GameState } from '../types/game';
import { StatsDisplay } from '../components/StatBar';
import { AchievementsList } from '../components/Achievement';
import { Button } from '../components/Button';

interface ResultScreenProps {
  gameState: GameState;
  onRestart: () => void;
}

export const ResultScreen = ({ gameState, onRestart }: ResultScreenProps) => {
  // 防御性检查：确保gameState有效
  if (!gameState) {
    return (
      <div className="min-h-screen bg-background-near flex items-center justify-center">
        <div className="text-center">
          <p className="text-h3 text-gold-primary">加载中...</p>
        </div>
      </div>
    );
  }

  // 确保所有必需的属性都存在
  const safeGameState = {
    ...gameState,
    playerStats: gameState.playerStats || {
      martial: 0,
      fame: 0,
      network: 0,
      energy: 0,
      virtue: 0
    },
    achievements: gameState.achievements || [],
    eventHistory: gameState.eventHistory || [],
    randomEvents: gameState.randomEvents || []
  };

  // 计算总分和评级
  const totalScore =
    safeGameState.playerStats.martial +
    safeGameState.playerStats.fame +
    safeGameState.playerStats.network +
    safeGameState.playerStats.energy +
    safeGameState.playerStats.virtue;

  const getRating = (score: number): string => {
    if (score >= 80) return '江湖传奇';
    if (score >= 60) return '一代宗师';
    if (score >= 40) return '侠客高手';
    if (score >= 20) return '初入江湖';
    return '江湖新人';
  };

  // AI分析
  const getAnalysis = () => {
    const stats = safeGameState.playerStats;
    const maxStat = Math.max(
      stats.martial,
      stats.fame,
      stats.network,
      stats.energy,
      stats.virtue
    );
    const minStat = Math.min(
      stats.martial,
      stats.fame,
      stats.network,
      stats.energy,
      stats.virtue
    );

    let analysis = {
      strength: '',
      weakness: '',
      suggestion: '',
      path: '',
    };

    // 找出最强项
    if (stats.martial === maxStat) {
      analysis.strength = '武艺精湛，战斗能力出众';
    } else if (stats.fame === maxStat) {
      analysis.strength = '威名远扬，名震江湖';
    } else if (stats.network === maxStat) {
      analysis.strength = '人脉广泛，朋友遍天下';
    } else if (stats.energy === maxStat) {
      analysis.strength = '内力深厚，持久力强';
    } else if (stats.virtue === maxStat) {
      analysis.strength = '侠义心肠，道德高尚';
    }

    // 找出最弱项
    if (stats.martial === minStat) {
      analysis.weakness = '武艺稍显不足';
      analysis.suggestion = '建议多参与战斗和训练，提升实战经验';
    } else if (stats.fame === minStat) {
      analysis.weakness = '声望有待提高';
      analysis.suggestion = '建议多完成重要任务，增加江湖影响力';
    } else if (stats.network === minStat) {
      analysis.weakness = '人脉资源较少';
      analysis.suggestion = '建议多与江湖人士交往，建立广泛联系';
    } else if (stats.energy === minStat) {
      analysis.weakness = '内力消耗过度';
      analysis.suggestion = '建议注意休息调养，避免过度消耗';
    } else if (stats.virtue === minStat) {
      analysis.weakness = '侠义之心有待加强';
      analysis.suggestion = '建议多行善事，维护正义';
    }

    // 推荐发展路线
    if (stats.martial > 10 && stats.fame > 10) {
      analysis.path = '武林盟主路线 - 以武会友，立名江湖';
    } else if (stats.network > 10 && stats.virtue > 8) {
      analysis.path = '侠之大者路线 - 行侠仗义，为国为民';
    } else if (stats.martial > 12) {
      analysis.path = '独行侠客路线 - 独来独往，武艺超群';
    } else if (stats.network > 12) {
      analysis.path = '帮派首领路线 - 广结善缘，建立势力';
    } else {
      analysis.path = '均衡发展路线 - 全面提升，稳扎稳打';
    }

    return analysis;
  };

  const analysis = getAnalysis();
  const unlockedAchievements = safeGameState.achievements.filter(
    (ach) => ach && ach.unlocked
  );

  // 准备属性数据（用于可视化显示）
  const statsData = [
    { name: '武艺', value: safeGameState.playerStats.martial },
    { name: '威望', value: safeGameState.playerStats.fame },
    { name: '人脉', value: safeGameState.playerStats.network },
    { name: '内力', value: safeGameState.playerStats.energy },
    { name: '侠义值', value: safeGameState.playerStats.virtue },
  ];

  return (
    <div className="min-h-screen bg-background-near p-4 py-12">
      <div className="max-w-6xl mx-auto space-y-12 animate-fade-in">
        {/* 标题和评级 */}
        <div className="text-center space-y-6">
          <h1 className="text-h1 font-title font-bold text-gold-primary">
            江湖之路，圆满结束
          </h1>
          <div className="space-y-2">
            <p className="text-h2 font-semibold text-text-primary">
              {getRating(totalScore)}
            </p>
            <p className="text-body-lg text-text-secondary">
              总评分：
              <span className="text-gold-primary font-bold ml-2 text-h3">
                {totalScore}
              </span>
              {' / 150'}
            </p>
          </div>
        </div>

        {/* 属性可视化 */}
        <div className="bg-background-dark border border-border-subtle rounded-lg p-8">
          <h3 className="text-h3 font-semibold text-gold-primary mb-6 text-center">
            属性对比
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {statsData.map((stat) => (
              <div key={stat.name} className="text-center space-y-3">
                <div className="relative h-48 w-16 mx-auto bg-background-hover rounded-md overflow-hidden">
                  <div
                    className={`absolute bottom-0 left-0 right-0 transition-all duration-500 ${
                      stat.name === '武艺' ? 'bg-stats-martial-base' :
                      stat.name === '威望' ? 'bg-stats-fame-base' :
                      stat.name === '人脉' ? 'bg-stats-network-base' :
                      stat.name === '内力' ? 'bg-stats-energy-base' :
                      'bg-stats-virtue-base'
                    }`}
                    style={{ height: `${(stat.value / 30) * 100}%` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/10 to-transparent" />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-white font-bold text-lg drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] z-10">
                      {stat.value}
                    </span>
                  </div>
                </div>
                <p className="text-text-primary font-semibold">{stat.name}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 详细属性 */}
        <div className="bg-background-dark border border-border-subtle rounded-lg p-8">
          <h3 className="text-h3 font-semibold text-gold-primary mb-6">
            最终属性
          </h3>
          <StatsDisplay stats={safeGameState.playerStats} />
        </div>

        {/* AI分析 */}
        <div className="bg-background-dark border border-border-subtle rounded-lg p-8 space-y-6">
          <h3 className="text-h3 font-semibold text-gold-primary">
            成长分析
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="text-body font-semibold text-semantic-success">
                优势领域
              </h4>
              <p className="text-text-secondary">{analysis.strength}</p>
            </div>

            <div className="space-y-3">
              <h4 className="text-body font-semibold text-semantic-warning">
                待提升领域
              </h4>
              <p className="text-text-secondary">{analysis.weakness}</p>
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-border-subtle">
            <h4 className="text-body font-semibold text-gold-primary">
              发展建议
            </h4>
            <p className="text-text-secondary">{analysis.suggestion}</p>
          </div>

          <div className="space-y-3 pt-4 border-t border-border-subtle">
            <h4 className="text-body font-semibold text-gold-primary">
              推荐路线
            </h4>
            <p className="text-text-secondary">{analysis.path}</p>
          </div>
        </div>

        {/* 成就系统 */}
        <AchievementsList
          achievements={safeGameState.achievements}
          showBonus={true}
        />

        {/* 游戏统计 */}
        <div className="bg-background-dark border border-border-subtle rounded-lg p-8">
          <h3 className="text-h3 font-semibold text-gold-primary mb-6">
            游戏统计
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <p className="text-number font-numeric font-bold text-gold-primary">
                {safeGameState.eventHistory.length}
              </p>
              <p className="text-text-secondary text-sm mt-1">完成事件</p>
            </div>
            <div className="text-center">
              <p className="text-number font-numeric font-bold text-gold-primary">
                {safeGameState.randomEvents.length}
              </p>
              <p className="text-text-secondary text-sm mt-1">随机事件</p>
            </div>
            <div className="text-center">
              <p className="text-number font-numeric font-bold text-gold-primary">
                {unlockedAchievements.length}
              </p>
              <p className="text-text-secondary text-sm mt-1">解锁成就</p>
            </div>
            <div className="text-center">
              <p className="text-number font-numeric font-bold text-gold-primary">
                {totalScore}
              </p>
              <p className="text-text-secondary text-sm mt-1">总评分</p>
            </div>
          </div>
        </div>

        {/* 重新开始 */}
        <div className="flex justify-center">
          <Button onClick={onRestart} size="lg" className="min-w-64">
            再闯江湖
          </Button>
        </div>
      </div>
    </div>
  );
};
