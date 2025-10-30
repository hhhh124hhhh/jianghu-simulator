import { PlayerStats } from '../types/game';
import { Swords, Crown, Users, Zap, Scale } from 'lucide-react';
import { getStatName } from '../utils/gameLogic';

interface StatBarProps {
  stat: keyof PlayerStats;
  value: number;
  maxValue?: number;
  showLabel?: boolean;
}

const statIcons = {
  martial: Swords,
  fame: Crown,
  network: Users,
  energy: Zap,
  virtue: Scale,
};

const statColors = {
  martial: {
    base: 'bg-stats-martial-base',
    glow: 'shadow-martial-glow',
    text: 'text-stats-martial-base',
  },
  fame: {
    base: 'bg-stats-fame-base',
    glow: 'shadow-fame-glow',
    text: 'text-stats-fame-base',
  },
  network: {
    base: 'bg-stats-network-base',
    glow: 'shadow-network-glow',
    text: 'text-stats-network-base',
  },
  energy: {
    base: 'bg-stats-energy-base',
    glow: 'shadow-energy-glow',
    text: 'text-stats-energy-base',
  },
  virtue: {
    base: 'bg-stats-virtue-base',
    glow: 'shadow-virtue-glow',
    text: 'text-stats-virtue-base',
  },
};

export const StatBar = ({
  stat,
  value,
  maxValue = 30,
  showLabel = true,
}: StatBarProps) => {
  const Icon = statIcons[stat];
  const colors = statColors[stat];
  const percentage = Math.min((value / maxValue) * 100, 100);

  return (
    <div className="space-y-2">
      {showLabel && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon className={`w-5 h-5 ${colors.text}`} />
            <span className="text-text-primary font-semibold text-body">
              {getStatName(stat)}
            </span>
          </div>
          <span className="text-text-primary font-bold font-numeric text-lg">
            {value}
          </span>
        </div>
      )}
      <div className="relative h-10 bg-background-dark rounded-md border border-border-subtle overflow-hidden">
        <div
          className={`absolute inset-y-0 left-0 ${colors.base} ${colors.glow} transition-all duration-400 ease-out rounded-md`}
          style={{ width: `${percentage}%` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>
        {!showLabel && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-white font-bold text-sm drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] z-10">
              {value}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

interface StatsDisplayProps {
  stats: PlayerStats;
  maxValue?: number;
}

export const StatsDisplay = ({ stats, maxValue = 30 }: StatsDisplayProps) => {
  return (
    <div className="space-y-4">
      {(Object.keys(stats) as Array<keyof PlayerStats>).map((stat) => (
        <StatBar
          key={stat}
          stat={stat}
          value={stats[stat]}
          maxValue={maxValue}
        />
      ))}
    </div>
  );
};
