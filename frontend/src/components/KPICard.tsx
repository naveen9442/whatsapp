import React from 'react';

export interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  color: 'green' | 'blue' | 'purple' | 'amber';
  loading?: boolean;
  breakdown?: { label: string; value: string | number; color: string }[];
}

const colorMap = {
  green: {
    accent: 'bg-blue-500',
    topBorder: 'border-t-blue-500',
    iconBg: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
    glow: 'group-hover:shadow-[0_0_24px_rgba(59,130,246,0.15)]',
    pillText: 'text-blue-400',
  },
  blue: {
    accent: 'bg-blue-500',
    topBorder: 'border-t-blue-500',
    iconBg: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
    glow: 'group-hover:shadow-[0_0_24px_rgba(59,130,246,0.15)]',
    pillText: 'text-blue-400',
  },
  purple: {
    accent: 'bg-purple-500',
    topBorder: 'border-t-purple-500',
    iconBg: 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
    glow: 'group-hover:shadow-[0_0_24px_rgba(168,85,247,0.15)]',
    pillText: 'text-purple-400',
  },
  amber: {
    accent: 'bg-amber-500',
    topBorder: 'border-t-amber-500',
    iconBg: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    glow: 'group-hover:shadow-[0_0_24px_rgba(245,158,11,0.15)]',
    pillText: 'text-amber-400',
  },
};

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  subtitle,
  icon,
  color,
  loading = false,
  breakdown,
}) => {
  const styles = colorMap[color] || colorMap.blue;

  if (loading) {
    return (
      <div className="glass-card rounded-2xl p-6 border-t-2 border-gray-800 relative overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div className="skeleton h-4 w-28 rounded"></div>
          <div className="skeleton h-10 w-10 rounded-xl"></div>
        </div>
        <div className="skeleton h-9 w-36 mb-3 rounded"></div>
        <div className="skeleton h-3 w-20 rounded mb-4"></div>
        <div className="flex gap-2 pt-2 border-t border-gray-800/80">
          <div className="skeleton h-6 w-16 rounded-full"></div>
          <div className="skeleton h-6 w-16 rounded-full"></div>
          <div className="skeleton h-6 w-16 rounded-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`group glass-card-interactive rounded-2xl p-6 border-t-[3px] ${styles.topBorder} ${styles.glow} relative overflow-hidden flex flex-col justify-between`}
    >
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-0 -mr-12 -mt-12 w-32 h-32 rounded-full bg-white/[0.02] blur-xl pointer-events-none" />

      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
            {title}
          </span>
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 ${styles.iconBg}`}
          >
            {icon}
          </div>
        </div>

        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-3xl font-extrabold tracking-tight text-white font-mono">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </span>
          {subtitle && (
            <span className="text-xs text-gray-400 font-medium">{subtitle}</span>
          )}
        </div>
      </div>

      {breakdown && breakdown.length > 0 && (
        <div className="mt-5 pt-3 border-t border-gray-800/70 flex flex-wrap items-center gap-1.5">
          {breakdown.map((item, index) => (
            <div
              key={index}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-950/60 border border-gray-800/80 text-[11px]"
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-gray-400">{item.label}:</span>
              <span className="font-semibold text-gray-200">
                {typeof item.value === 'number'
                  ? item.value.toLocaleString()
                  : item.value}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default KPICard;
