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

const SIZES = {
  xs: { w: 'w-10', h: 'h-14', text: 'text-[6px]', value: 'text-[8px]', icon: 'text-xs', band: 'h-[30%]', rent: 'text-[5px]' },
  sm: { w: 'w-14', h: 'h-20', text: 'text-[8px]', value: 'text-xs', icon: 'text-sm', band: 'h-[30%]', rent: 'text-[6px]' },
  md: { w: 'w-20 md:w-24', h: 'h-28 md:h-32', text: 'text-[9px] md:text-[10px]', value: 'text-sm', icon: 'text-lg', band: 'h-[28%]', rent: 'text-[7px] md:text-[8px]' },
  lg: { w: 'w-32 md:w-36', h: 'h-44 md:h-48', text: 'text-xs md:text-sm', value: 'text-lg', icon: 'text-2xl', band: 'h-[25%]', rent: 'text-[9px] md:text-[10px]' },
};

export function GameCard({ card, size = 'md', selected, onClick, disabled }: GameCardProps) {
  const s = SIZES[size];
  if (card.id === 'hidden') {
    return <div className={`${s.w} ${s.h} rounded-lg bg-gradient-to-br from-red-700 via-red-600 to-red-800 border-2 border-red-400 flex items-center justify-center shadow-lg`}><span className={s.icon}>🎴</span></div>;
  }

  const baseClasses = `${s.w} ${s.h} rounded-lg overflow-hidden shadow-lg transition-all duration-200 flex flex-col`;
  const interactiveClasses = onClick && !disabled ? 'cursor-pointer hover:-translate-y-2 hover:shadow-xl' : '';
  const selectedClasses = selected ? 'ring-4 ring-yellow-400 ring-offset-2 ring-offset-gray-900 scale-105 -translate-y-2' : '';
  const disabledClasses = disabled ? 'opacity-40 grayscale-[30%]' : '';

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
      <div onClick={disabled ? undefined : onClick} className={`${baseClasses} ${interactiveClasses} ${selectedClasses} ${disabledClasses} border-2`}
        style={{ background: cardBackground, borderColor: isUniversalWild ? '#FFD700' : (isMultiColorWild ? '#888' : primaryColor.border) }}>
        <div className={`${s.band} flex items-center justify-center px-1`} style={{ background: bandBackground }}>
          {isUniversalWild ? <span className={`${s.text} font-black text-white text-center`}>WILD CARD</span>
           : isMultiColorWild ? <span className={`${s.text} font-black text-white text-center drop-shadow-md`}>WILD</span>
           : <span className={`${s.text} font-bold text-center px-0.5`} style={{ color: primaryColor.text }}>{prop.name}</span>}
        </div>
        <div className="flex-1 flex flex-col items-center justify-center bg-white/90 px-1 overflow-hidden">
          {!isUniversalWild && !isMultiColorWild && (
            <div className="flex flex-wrap justify-center gap-x-1">
              {RENT_VALUES[prop.color].map((rent, i) => <span key={i} className={`${s.rent} font-bold text-gray-700`}>{i+1}🏠=${rent}M</span>)}
            </div>
          )}
          {isMultiColorWild && prop.wildcardColors && (
            <div className="w-full space-y-0.5">
              {prop.wildcardColors.map(color => (
                <div key={color} className="flex items-center gap-1 justify-center">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: PROPERTY_COLORS[color].bg }} />
                  <span className={`${s.rent} font-bold text-gray-700`}>{RENT_VALUES[color].map((r,i) => `${i+1}=$${r}M`).join(' ')}</span>
                </div>
              ))}
            </div>
          )}
          {isUniversalWild && <><span className={s.icon}>🌈</span><span className={`${s.text} text-gray-800 font-bold mt-1`}>ANY COLOR</span></>}
        </div>
        <div className="bg-black/40 py-1 text-center"><span className={`${s.value} font-black text-white`}>${prop.value}M</span></div>
      </div>
    );
  }

  // MONEY CARD
  if (card.type === 'money') {
    const moneyColors: Record<number, string> = { 1: 'from-green-400 to-green-600', 2: 'from-green-500 to-green-700', 3: 'from-emerald-400 to-emerald-600', 4: 'from-teal-400 to-teal-600', 5: 'from-cyan-400 to-cyan-600', 10: 'from-yellow-400 to-amber-500' };
    const gradient = moneyColors[card.value] || 'from-green-500 to-green-700';
    return (
      <div onClick={disabled ? undefined : onClick} className={`${baseClasses} ${interactiveClasses} ${selectedClasses} ${disabledClasses} bg-gradient-to-b ${gradient} border-2 border-green-300`}>
        <div className="bg-white/90 py-1 text-center"><span className={`${s.text} font-black text-green-800`}>MONEY</span></div>
        <div className="flex-1 flex flex-col items-center justify-center"><span className={`${s.value} font-black text-white drop-shadow-lg`} style={{ fontSize: size === 'lg' ? '2rem' : undefined }}>${card.value}M</span></div>
        <div className="bg-green-800/50 py-1 text-center"><span className={`${s.text} text-green-100`}>MILLION</span></div>
      </div>
    );
  }

  // ACTION CARD
  if (card.type === 'action') {
    const action = card as ActionCard;
    const cfg: Record<string, { icon: string; gradient: string; border: string }> = {
      dealBreaker: { icon: '💥', gradient: 'from-red-500 to-red-700', border: 'border-red-400' },
      justSayNo: { icon: '🚫', gradient: 'from-blue-500 to-blue-700', border: 'border-blue-400' },
      slyDeal: { icon: '🦊', gradient: 'from-purple-500 to-purple-700', border: 'border-purple-400' },
      forcedDeal: { icon: '🔄', gradient: 'from-orange-500 to-orange-700', border: 'border-orange-400' },
      debtCollector: { icon: '💰', gradient: 'from-yellow-600 to-yellow-800', border: 'border-yellow-500' },
      birthday: { icon: '🎂', gradient: 'from-pink-500 to-pink-700', border: 'border-pink-400' },
      passGo: { icon: '➡️', gradient: 'from-green-500 to-green-700', border: 'border-green-400' },
      house: { icon: '🏠', gradient: 'from-emerald-500 to-emerald-700', border: 'border-emerald-400' },
      hotel: { icon: '🏨', gradient: 'from-rose-600 to-rose-800', border: 'border-rose-400' },
      doubleRent: { icon: '×2', gradient: 'from-amber-500 to-amber-700', border: 'border-amber-400' },
    };
    const c = cfg[action.action] || { icon: '⚡', gradient: 'from-gray-500 to-gray-700', border: 'border-gray-400' };
    return (
      <div onClick={disabled ? undefined : onClick} className={`${baseClasses} ${interactiveClasses} ${selectedClasses} ${disabledClasses} bg-gradient-to-b ${c.gradient} border-2 ${c.border}`}>
        <div className="bg-white/95 py-1 px-1"><p className={`${s.text} font-black text-gray-800 text-center leading-tight`}>{action.name}</p></div>
        <div className="flex-1 flex items-center justify-center"><span className={s.icon}>{c.icon}</span></div>
        <div className="bg-black/30 py-1 text-center"><span className={`${s.value} font-black text-white`}>${action.value}M</span></div>
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
      background = c.bg; borderColor = c.border;
    }
    return (
      <div onClick={disabled ? undefined : onClick} className={`${baseClasses} ${interactiveClasses} ${selectedClasses} ${disabledClasses} border-2`} style={{ background, borderColor }}>
        <div className="bg-white/95 py-1 px-1"><p className={`${s.text} font-black text-gray-800 text-center`}>{isWild ? 'WILD RENT' : 'RENT'}</p></div>
        <div className="flex-1 flex flex-col items-center justify-center bg-white/20">
          <span className={s.icon}>💵</span>
          {!isWild && rent.colors.length >= 2 && <div className="flex gap-1 mt-1">{rent.colors.slice(0,2).map((c,i) => <div key={i} className="w-3 h-3 rounded-full border border-white/50" style={{ backgroundColor: PROPERTY_COLORS[c].bg }} />)}</div>}
          {isWild && <span className={`${s.text} text-white font-bold mt-1`}>1 PLAYER</span>}
        </div>
        <div className="bg-black/40 py-1 text-center"><span className={`${s.value} font-black text-white`}>${rent.value}M</span></div>
      </div>
    );
  }

  return <div className={`${baseClasses} bg-gray-600 border-2 border-gray-500 items-center justify-center`}><span className={s.icon}>❓</span></div>;
}

export { PROPERTY_COLORS, RENT_VALUES };
