import { getTrustTier } from '../../utils/helpers';

const TrustBadge = ({ score, size = 'md' }) => {
  const tier = getTrustTier(score);
  
  const sizeClasses = {
    sm: 'w-12 h-12 text-sm',
    md: 'w-16 h-16 text-lg',
    lg: 'w-24 h-24 text-2xl',
  };

  const ringSize = {
    sm: 'w-14 h-14',
    md: 'w-20 h-20',
    lg: 'w-28 h-28',
  };

  const colorMap = {
    green: { ring: 'border-emerald-400', bg: 'bg-emerald-50', text: 'text-emerald-700', glow: 'shadow-[0_0_15px_rgba(16,185,129,0.3)]' },
    amber: { ring: 'border-amber-400', bg: 'bg-amber-50', text: 'text-amber-700', glow: 'shadow-[0_0_15px_rgba(245,158,11,0.3)]' },
    red: { ring: 'border-red-400', bg: 'bg-red-50', text: 'text-red-700', glow: 'shadow-[0_0_15px_rgba(239,68,68,0.3)]' },
  };

  const colors = colorMap[tier.color];

  // SVG circle progress
  const radius = size === 'lg' ? 42 : size === 'md' ? 28 : 20;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className={`relative ${ringSize[size]} flex items-center justify-center`}>
        <svg className="absolute inset-0 -rotate-90" viewBox={`0 0 ${(radius + 4) * 2} ${(radius + 4) * 2}`}>
          <circle
            cx={radius + 4}
            cy={radius + 4}
            r={radius}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="3"
          />
          <circle
            cx={radius + 4}
            cy={radius + 4}
            r={radius}
            fill="none"
            stroke={tier.color === 'green' ? '#10b981' : tier.color === 'amber' ? '#f59e0b' : '#ef4444'}
            strokeWidth="3"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - progress}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className={`${sizeClasses[size]} ${colors.bg} rounded-full flex items-center justify-center font-bold ${colors.text} ${colors.glow}`}>
          {Math.round(score)}
        </div>
      </div>
      <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${tier.bgClass}`}>
        <span>{tier.emoji}</span>
        <span>{tier.label}</span>
      </div>
    </div>
  );
};

export default TrustBadge;
