import React from 'react';

interface IconProps {
  color: string;
  size?: number;
  className?: string;
}

export const DuckIcon: React.FC<IconProps> = ({ color, size = 48, className }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      className={className}
      style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))' }}
    >
      <defs>
        <radialGradient id={`gloss-${color}`} cx="30%" cy="30%" r="50%">
          <stop offset="0%" stopColor="white" stopOpacity="0.4" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`body-${color}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color} />
          <stop offset="100%" stopColor={color} filter="brightness(0.7)" />
        </linearGradient>
      </defs>
      
      {/* Body */}
      <ellipse cx="50" cy="60" rx="35" ry="25" fill={`url(#body-${color})`} />
      
      {/* Head */}
      <circle cx="75" cy="40" r="18" fill={`url(#body-${color})`} />
      
      {/* Beak */}
      <path d="M85 40 L100 45 L85 50 Z" fill="#FF9900" stroke="#CC7700" strokeWidth="1" />
      
      {/* Eye */}
      <circle cx="82" cy="35" r="3" fill="black" />
      <circle cx="83" cy="34" r="1" fill="white" />
      
      {/* Wing */}
      <ellipse cx="45" cy="60" rx="15" ry="10" fill="rgba(0,0,0,0.1)" transform="rotate(-10 45 60)" />
      
      {/* Glossy Overlay */}
      <ellipse cx="50" cy="60" rx="35" ry="25" fill={`url(#gloss-${color})`} />
      <circle cx="75" cy="40" r="18" fill={`url(#gloss-${color})`} />
    </svg>
  );
};

export const TurtleIcon: React.FC<IconProps> = ({ color, size = 56, className }) => {
  const shellId = `shell-grad-${color.replace('#', '')}`;
  const bodyId = `body-grad-${color.replace('#', '')}`;
  const glossId = `shell-gloss-${color.replace('#', '')}`;

  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      className={className}
      style={{ filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.4))' }}
    >
      <defs>
        <radialGradient id={glossId} cx="40%" cy="40%" r="50%">
          <stop offset="0%" stopColor="white" stopOpacity="0.3" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={shellId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color} />
          <stop offset="100%" stopColor={color} filter="brightness(0.6)" />
        </linearGradient>
        <linearGradient id={bodyId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#90EE90" />
          <stop offset="100%" stopColor="#32CD32" />
        </linearGradient>
      </defs>

      {/* Legs */}
      <ellipse cx="35" cy="80" rx="10" ry="8" fill="#3E7A36" />
      <ellipse cx="65" cy="80" rx="10" ry="8" fill="#3E7A36" />
      <ellipse cx="30" cy="65" rx="10" ry="8" fill="#3E7A36" />
      <ellipse cx="70" cy="65" rx="10" ry="8" fill="#3E7A36" />

      {/* Tail */}
      <path d="M20 70 L10 75 L20 80 Z" fill="#3E7A36" />

      {/* Body Spots */}
      <circle cx="35" cy="82" r="2" fill="#2D5A27" opacity="0.3" />
      <circle cx="65" cy="82" r="2" fill="#2D5A27" opacity="0.3" />

      {/* Head */}
      <ellipse cx="80" cy="65" rx="18" ry="16" fill={`url(#${bodyId})`} />
      
      {/* Rosy Cheeks */}
      <circle cx="88" cy="68" r="4" fill="#FFB6C1" opacity="0.6" />
      <circle cx="72" cy="68" r="4" fill="#FFB6C1" opacity="0.6" />

      {/* Eyes */}
      <circle cx="86" cy="60" r="4" fill="black" />
      <circle cx="87" cy="59" r="1.5" fill="white" />
      <circle cx="74" cy="60" r="4" fill="black" />
      <circle cx="75" cy="59" r="1.5" fill="white" />

      {/* Smile */}
      <path d="M75 72 Q80 77 85 72" fill="none" stroke="#2D5A27" strokeWidth="1.5" strokeLinecap="round" />

      {/* Shell */}
      <ellipse cx="50" cy="60" rx="35" ry="28" fill={`url(#${shellId})`} stroke="rgba(0,0,0,0.2)" strokeWidth="1.5" />
      
      {/* Shell Pattern (Hexagonal-ish) */}
      <path d="M50 32 L50 88 M25 45 L75 45 M25 75 L75 75 M35 35 L65 85 M65 35 L35 85" 
            fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
      
      {/* Glossy Overlay */}
      <ellipse cx="50" cy="60" rx="35" ry="28" fill={`url(#${glossId})`} />
    </svg>
  );
};
