import React from 'react';

interface LogoProps {
  className?: string;
  height?: number | string;
  width?: number | string;
  variant?: 'horizontal' | 'stacked-white' | 'stacked-color' | 'icon-only';
  showSubtitle?: boolean;
}

/**
 * Modern Global Inbound Remittance Geometric Emblem SVG
 */
export const PortalEmblem: React.FC<{
  size?: number;
  primaryColor?: string;
  accentColor?: string;
  className?: string;
}> = ({
  size = 40,
  primaryColor = '#0F4C81',
  accentColor = '#F59E0B',
  className = '',
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
    >
      <circle cx="50" cy="50" r="44" stroke={primaryColor} strokeWidth="6" opacity="0.9" />
      {/* Globe Lat/Long Arcs */}
      <ellipse cx="50" cy="50" rx="20" ry="44" stroke={primaryColor} strokeWidth="4" opacity="0.6" />
      <line x1="6" y1="50" x2="94" y2="50" stroke={primaryColor} strokeWidth="4" opacity="0.6" />
      
      {/* Inward Remittance Arrow Badge */}
      <circle cx="50" cy="50" r="22" fill={primaryColor} />
      {/* Dynamic Inbound Arrow */}
      <path
        d="M50 35V62M50 62L41 53M50 62L59 53"
        stroke="#FFFFFF"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Gold Radiant Pulse Accent */}
      <circle cx="76" cy="24" r="7" fill={accentColor} />
      <path d="M76 13V17M76 31V35M65 24H69M83 24H87" stroke={accentColor} strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
};

// Aliases for compatibility
export const KbzEmblem = PortalEmblem;

/**
 * White Monochrome Stacked Logo for Dark Blue Backgrounds (e.g. Login Left Banner)
 */
export const PortalStackedWhiteLogo: React.FC<{
  height?: number;
  className?: string;
}> = ({ height = 110, className = '' }) => {
  return (
    <div className={`flex flex-col items-center select-none text-white ${className}`}>
      <PortalEmblem size={height * 0.58} primaryColor="#FFFFFF" accentColor="#FCD34D" />

      <div className="mt-3 text-center">
        <span
          className="font-black tracking-wider text-white block leading-none"
          style={{ fontSize: `${height * 0.22}px`, letterSpacing: '0.04em', fontFamily: 'system-ui, -apple-system, sans-serif' }}
        >
          MM GLOBAL REMIT
        </span>
        <span
          className="text-amber-300 font-bold uppercase tracking-[0.25em] block mt-1.5"
          style={{ fontSize: `${height * 0.085}px` }}
        >
          INBOUND REMITTANCE PORTAL
        </span>
      </div>
    </div>
  );
};

export const KbzStackedWhiteLogo = PortalStackedWhiteLogo;

/**
 * Full Color Stacked Portal Logo
 */
export const PortalStackedColorLogo: React.FC<{
  height?: number;
  className?: string;
}> = ({ height = 110, className = '' }) => {
  return (
    <div className={`flex flex-col items-center select-none ${className}`}>
      <PortalEmblem size={height * 0.58} primaryColor="#0F4C81" accentColor="#F59E0B" />

      <div className="mt-3 text-center">
        <span
          className="font-black tracking-wider text-[#0F4C81] dark:text-blue-300 block leading-none"
          style={{ fontSize: `${height * 0.22}px`, letterSpacing: '0.04em', fontFamily: 'system-ui, -apple-system, sans-serif' }}
        >
          MM GLOBAL REMIT
        </span>
        <span
          className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-[0.22em] block mt-1.5"
          style={{ fontSize: `${height * 0.085}px` }}
        >
          MYANMAR REMITTANCE GATEWAY
        </span>
      </div>
    </div>
  );
};

export const KbzStackedColorLogo = PortalStackedColorLogo;

/**
 * Horizontal Long Logo for Internal Header & Navigation
 */
export const PortalHorizontalLogo: React.FC<{
  height?: number;
  showPortalBadge?: boolean;
  className?: string;
}> = ({ height = 40, showPortalBadge = true, className = '' }) => {
  return (
    <div className={`flex items-center gap-2.5 sm:gap-3 select-none ${className}`}>
      <PortalEmblem
        size={height * 0.95}
        primaryColor="#0F4C81"
        accentColor="#F59E0B"
        className="shrink-0"
      />

      <div className="flex flex-col justify-center">
        <div className="flex items-center gap-2">
          <span
            className="font-black text-[#0F4C81] dark:text-blue-300 tracking-tight leading-none"
            style={{ fontSize: `${height * 0.52}px`, letterSpacing: '0.02em', fontFamily: 'system-ui, -apple-system, sans-serif' }}
          >
            MM GLOBAL REMIT
          </span>

          {showPortalBadge && (
            <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#0F4C81] text-white tracking-wider uppercase">
              CUSTOMER PORTAL
            </span>
          )}
        </div>

        <span
          className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-[0.2em] leading-tight mt-0.5 text-[9px] sm:text-[10px]"
          style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
        >
          INBOUND REMITTANCE GATEWAY
        </span>
      </div>
    </div>
  );
};

export const KbzHorizontalLogo = PortalHorizontalLogo;

export const KbzLogo: React.FC<LogoProps> = ({
  variant = 'horizontal',
  height = 40,
  className = '',
  showSubtitle = true,
}) => {
  switch (variant) {
    case 'stacked-white':
      return <PortalStackedWhiteLogo height={Number(height) || 110} className={className} />;
    case 'stacked-color':
      return <PortalStackedColorLogo height={Number(height) || 110} className={className} />;
    case 'icon-only':
      return <PortalEmblem size={Number(height) || 40} className={className} />;
    case 'horizontal':
    default:
      return <PortalHorizontalLogo height={Number(height) || 40} showPortalBadge={showSubtitle} className={className} />;
  }
};
