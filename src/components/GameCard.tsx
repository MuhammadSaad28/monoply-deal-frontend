import { Card, PropertyCard, ActionCard, RentCard, PropertyColor } from '../types/game';

interface GameCardProps {
  card: Card;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  selected?: boolean;
  onClick?: () => void;
  disabled?: boolean;
}

// Using explicit hex colors that render consistently across all devices
const PROPERTY_COLORS: Record<PropertyColor, { bg: string; border: string; text: string; name: string }> = {
  brown: { bg: '#8B4513', border: '#5D2E0C', text: '#FFFFFF', name: 'Brown' },
  lightBlue: { bg: '#00BFFF', border: '#0099CC', text: '#000000', name: 'Light Blue' },
  pink: { bg: '#FF1493', border: '#CC1076', text: '#FFFFFF', name: 'Pink' },
  orange: { bg: '#FF6600', border: '#CC5200', text: '#000000', name: 'Orange' },
  red: { bg: '#FF0000', border: '#CC0000', text: '#FFFFFF', name: 'Red' },
  yellow: { bg: '#FFFF00', border: '#CCCC00', text: '#000000', name: 'Yellow' },
  green: { bg: '#00AA00', border: '#008800', text: '#FFFFFF', name: 'Green' },
  darkBlue: { bg: '#0000CC', border: '#000099', text: '#FFFFFF', name: 'Dark Blue' },
  railroad: { bg: '#000000', border: '#333333', text: '#FFFFFF', name: 'Black' },
  utility: { bg: '#90EE90', border: '#6BC76B', text: '#000000', name: 'Light Green' },
};

const RENT_VALUES: Record<PropertyColor, number[]> = {
  brown: [1, 2], lightBlue: [1, 2, 3], pink: [1, 2, 4], orange: [1, 3, 5],
  red: [2, 3, 6], yellow: [2, 4, 6], green: [2, 4, 7], darkBlue: [3, 8],
  railroad: [1, 2, 3, 4], utility: [1, 2]
};

// Action card colors with explicit hex values for consistent rendering
const ACTION_COLORS: Record<string, { gradient: string; border: string; icon: string }> = {
  dealBreaker: { gradient: 'linear-gradient(to bottom, #EF4444, #B91C1C)', border: '#F87171', icon: '💥' },
  justSayNo: { gradient: 'linear-gradient(to bottom, #3B82F6, #1D4ED8)', border: '#60A5FA', icon: '🚫' },
  slyDeal: { gradient: 'linear-gradient(to bottom, #A855F7, #7E22CE)', border: '#C084FC', icon: '🦊' },
  forcedDeal: { gradient: 'linear-gradient(to bottom, #F97316, #C2410C)', border: '#FB923C', icon: '🔄' },
  debtCollector: { gradient: 'linear-gradient(to bottom, #CA8A04, #A16207)', border: '#FACC15', icon: '💰' },
  birthday: { gradient: 'linear-gradient(to bottom, #EC4899, #BE185D)', border: '#F472B6', icon: '🎂' },
  passGo: { gradient: 'linear-gradient(to bottom, #22C55E, #15803D)', border: '#4ADE80', icon: '➡️' },
  house: { gradient: 'linear-gradient(to bottom, #10B981, #047857)', border: '#34D399', icon: '🏠' },
  hotel: { gradient: 'linear-gradient(to bottom, #E11D48, #9F1239)', border: '#FB7185', icon: '🏨' },
  doubleRent: { gradient: 'linear-gradient(to bottom, #F59E0B, #B45309)', border: '#FBBF24', icon: '×2' },
  default: { gradient: 'linear-gradient(to bottom, #6B7280, #374151)', border: '#9CA3AF', icon: '⚡' }
};

const SIZES = {
  xs: { w: 'w-10', h: 'h-14', text: 'text-[6px]', value: 'text-[8px]', icon: 'text-xs', band: 'h-[30%]', rent: 'text-[5px]' },
  sm: { w: 'w-14', h: 'h-20', text: 'text-[8px]', value: 'text-xs', icon: 'text-sm', band: 'h-[30%]', rent: 'text-[6px]' },
  md: { w: 'w-20 md:w-24', h: 'h-28 md:h-32', text: 'text-[9px] md:text-[10px]', value: 'text-sm', icon: 'text-lg', band: 'h-[28%]', rent: 'text-[7px] md:text-[8px]' },
  lg: { w: 'w-32 md:w-36', h: 'h-44 md:h-48', text: 'text-xs md:text-sm', value: 'text-lg', icon: 'text-2xl', band: 'h-[25%]', rent: 'text-[9px] md:text-[10px]' },
};

export function GameCard({ card, size = 'md', selected, onClick, disabled }: GameCardProps) {
  const s = SIZES[size];
  
  // Hidden card (card back)
  if (card.id === 'hidden') {
    return (
      <div 
        className={`${s.w} ${s.h} rounded-lg border-2 flex items-center justify-center shadow-lg`}
        style={{ 
          background: 'linear-gradient(135deg, #B91C1C 0%, #DC2626 50%, #991B1B 100%)',
          borderColor: '#F87171'
        }}
      >
        <span className={s.icon}>🎴</span>
      </div>
    );
  }

  const baseClasses = `${s.w} ${s.h} rounded-lg overflow-hidden shadow-lg transition-all duration-200 flex flex-col`;
  const interactiveClasses = onClick && !disabled ? 'cursor-pointer hover:-translate-y-2 hover:shadow-xl' : '';
  const disabledClasses = disabled ? 'opacity-40 grayscale-[30%]' : '';
  
  // Selected card styling with explicit hex color (yellow ring)
  const selectedStyle: React.CSSProperties = selected ? {
    boxShadow: '0 0 0 4px #FFD700, 0 0 0 6px #1F2937',
    transform: 'scale(1.05) translateY(-8px)'
  } : {};


  // PROPERTY CARD
  if (card.type === 'property') {
    const prop = card as PropertyCard;
    const primaryColor = PROPERTY_COLORS[prop.color];
    const isMultiColorWild = prop.isWildcard && prop.wildcardColors && prop.wildcardColors.length === 2;
    const isUniversalWild = prop.isWildcard && prop.wildcardColors && prop.wildcardColors.length > 2;
    
    let cardBackground = '', bandBackground = '';
    if (isUniversalWild) {
      cardBackground = 'linear-gradient(135deg, #DC143C 0%, #FF8C00 16%, #FFD700 33%, #228B22 50%, #00008B 66%, #FF69B4 83%, #8B4513 100%)';
      bandBackground = 'rgba(0,0,0,0.7)';
    } else if (isMultiColorWild && prop.wildcardColors) {
      const c1 = PROPERTY_COLORS[prop.wildcardColors[0]], c2 = PROPERTY_COLORS[prop.wildcardColors[1]];
      cardBackground = `linear-gradient(135deg, ${c1.bg} 50%, ${c2.bg} 50%)`;
      bandBackground = `linear-gradient(90deg, ${c1.border} 50%, ${c2.border} 50%)`;
    } else {
      cardBackground = primaryColor.bg;
      bandBackground = primaryColor.border;
    }

    return (
      <div 
        onClick={disabled ? undefined : onClick} 
        className={`${baseClasses} ${interactiveClasses} ${disabledClasses} border-2`}
        style={{ 
          background: cardBackground, 
          borderColor: isUniversalWild ? '#FFD700' : (isMultiColorWild ? '#888888' : primaryColor.border),
          ...selectedStyle 
        }}
      >
        <div className={`${s.band} flex items-center justify-center px-1`} style={{ background: bandBackground }}>
          {isUniversalWild ? <span className={`${s.text} font-black text-[#FFFFFF] text-center`}>WILD CARD</span>
           : isMultiColorWild ? <span className={`${s.text} font-black text-[#FFFFFF] text-center drop-shadow-md`}>WILD</span>
           : <span className={`${s.text} font-bold text-center px-0.5`} style={{ color: primaryColor.text }}>{prop.name}</span>}
        </div>
        <div className="flex-1 flex flex-col items-center justify-center px-1 overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.9)' }}>
          {!isUniversalWild && !isMultiColorWild && (
            <div className="flex flex-wrap justify-center gap-x-1">
              {RENT_VALUES[prop.color].map((rent, i) => <span key={i} className={`${s.rent} font-bold`} style={{ color: '#374151' }}>{i+1}🏠={rent}M</span>)}
            </div>
          )}
          {isMultiColorWild && prop.wildcardColors && (
            <div className="w-full space-y-0.5">
              {prop.wildcardColors.map(color => (
                <div key={color} className="flex items-center gap-1 justify-center">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: PROPERTY_COLORS[color].bg }} />
                  <span className={`${s.rent} font-bold`} style={{ color: '#374151' }}>{RENT_VALUES[color].map((r,i) => `${i+1}=${r}M`).join(' ')}</span>
                </div>
              ))}
            </div>
          )}
          {isUniversalWild && <><span className={s.icon}>🌈</span><span className={`${s.text} font-bold mt-1`} style={{ color: '#1F2937' }}>ANY COLOR</span></>}
        </div>
        <div style={{ backgroundColor: 'rgba(0,0,0,0.4)' }} className="py-1 text-center"><span className={`${s.value} font-black text-[#FFFFFF]`}>${prop.value}M</span></div>
      </div>
    );
  }

  // MONEY CARD
  if (card.type === 'money') {
    const moneyGradients: Record<number, { from: string; to: string; border: string }> = {
      1: { from: '#22C55E', to: '#16A34A', border: '#4ADE80' },
      2: { from: '#16A34A', to: '#15803D', border: '#22C55E' },
      3: { from: '#10B981', to: '#059669', border: '#34D399' },
      4: { from: '#14B8A6', to: '#0D9488', border: '#2DD4BF' },
      5: { from: '#06B6D4', to: '#0891B2', border: '#22D3EE' },
      10: { from: '#FFD700', to: '#FFB000', border: '#FFE033' }
    };
    const colors = moneyGradients[card.value] || moneyGradients[1];
    return (
      <div 
        onClick={disabled ? undefined : onClick} 
        className={`${baseClasses} ${interactiveClasses} ${disabledClasses} border-2`}
        style={{ 
          background: `linear-gradient(to bottom, ${colors.from}, ${colors.to})`, 
          borderColor: colors.border,
          ...selectedStyle 
        }}
      >
        <div style={{ backgroundColor: 'rgba(255,255,255,0.9)' }} className="py-1 text-center">
          <span className={`${s.text} font-black`} style={{ color: '#166534' }}>MONEY</span>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center">
          <span className={`${s.value} font-black text-[#FFFFFF] drop-shadow-lg`} style={{ fontSize: size === 'lg' ? '2rem' : undefined }}>${card.value}M</span>
        </div>
        <div style={{ backgroundColor: 'rgba(22, 101, 52, 0.5)' }} className="py-1 text-center">
          <span className={`${s.text}`} style={{ color: '#DCFCE7' }}>MILLION</span>
        </div>
      </div>
    );
  }


  // ACTION CARD
  if (card.type === 'action') {
    const action = card as ActionCard;
    const cfg = ACTION_COLORS[action.action] || ACTION_COLORS.default;
    return (
      <div 
        onClick={disabled ? undefined : onClick} 
        className={`${baseClasses} ${interactiveClasses} ${disabledClasses} border-2`}
        style={{ 
          background: cfg.gradient, 
          borderColor: cfg.border,
          ...selectedStyle 
        }}
      >
        <div style={{ backgroundColor: 'rgba(255,255,255,0.95)' }} className="py-1 px-1">
          <p className={`${s.text} font-black text-center leading-tight`} style={{ color: '#1F2937' }}>{action.name}</p>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <span className={s.icon}>{cfg.icon}</span>
        </div>
        <div style={{ backgroundColor: 'rgba(0,0,0,0.3)' }} className="py-1 text-center">
          <span className={`${s.value} font-black text-[#FFFFFF]`}>${action.value}M</span>
        </div>
      </div>
    );
  }

  // RENT CARD
  if (card.type === 'rent') {
    const rent = card as RentCard;
    const isWild = rent.isWildRent;
    let background = '', borderColor = '';
    if (isWild) {
      background = 'linear-gradient(135deg, #DC143C 0%, #FF8C00 25%, #FFD700 50%, #228B22 75%, #00008B 100%)';
      borderColor = '#FFD700';
    } else if (rent.colors.length >= 2) {
      const c1 = PROPERTY_COLORS[rent.colors[0]], c2 = PROPERTY_COLORS[rent.colors[1]];
      background = `linear-gradient(135deg, ${c1.bg} 50%, ${c2.bg} 50%)`;
      borderColor = c1.border;
    } else {
      const c = PROPERTY_COLORS[rent.colors[0]];
      background = c.bg; 
      borderColor = c.border;
    }
    return (
      <div 
        onClick={disabled ? undefined : onClick} 
        className={`${baseClasses} ${interactiveClasses} ${disabledClasses} border-2`} 
        style={{ background, borderColor, ...selectedStyle }}
      >
        <div style={{ backgroundColor: 'rgba(255,255,255,0.95)' }} className="py-1 px-1">
          <p className={`${s.text} font-black text-center`} style={{ color: '#1F2937' }}>{isWild ? 'WILD RENT' : 'RENT'}</p>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
          <span className={s.icon}>💵</span>
          {!isWild && rent.colors.length >= 2 && (
            <div className="flex gap-1 mt-1">
              {rent.colors.slice(0,2).map((c,i) => (
                <div key={i} className="w-3 h-3 rounded-full" style={{ backgroundColor: PROPERTY_COLORS[c].bg, border: '1px solid rgba(255,255,255,0.5)' }} />
              ))}
            </div>
          )}
          {isWild && <span className={`${s.text} text-[#FFFFFF] font-bold mt-1`}>1 PLAYER</span>}
        </div>
        <div style={{ backgroundColor: 'rgba(0,0,0,0.4)' }} className="py-1 text-center">
          <span className={`${s.value} font-black text-[#FFFFFF]`}>${rent.value}M</span>
        </div>
      </div>
    );
  }

  // Unknown card type fallback
  return (
    <div 
      className={`${baseClasses} border-2 items-center justify-center`}
      style={{ backgroundColor: '#4B5563', borderColor: '#6B7280' }}
    >
      <span className={s.icon}>❓</span>
    </div>
  );
}

export { PROPERTY_COLORS, RENT_VALUES };


