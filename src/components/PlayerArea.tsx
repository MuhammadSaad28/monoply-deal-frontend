import { useState } from 'react';
import { Player, PropertySet, Card } from '../types/game';
import { GameCard, PROPERTY_COLORS } from './GameCard';

interface PlayerAreaProps {
  player: Player;
  isCurrentTurn: boolean;
  isMe?: boolean;
  colorIndex: number;
  compact?: boolean;
}

const PLAYER_COLORS = ['#EF4444', '#3B82F6', '#22C55E', '#A855F7', '#F97316'];

export function PlayerArea({ player, isCurrentTurn, isMe, colorIndex, compact }: PlayerAreaProps) {
  const [previewSet, setPreviewSet] = useState<PropertySet | null>(null);
  const [showBankPreview, setShowBankPreview] = useState(false);

  const bankTotal = player.bank.reduce((sum, card) => sum + card.value, 0);
  const completeSets = player.properties.filter(s => s.isComplete).length;
  const color = PLAYER_COLORS[colorIndex % 5];

  return (
    <>
      <div
        className={`rounded-xl p-3 transition-all ${
          isCurrentTurn ? 'ring-2 ring-[#4ADE80] bg-[#22C55E]/10' : 'bg-[#FFFFFF]/5'
        } ${isMe ? 'border-2 border-[#EAB308]/50' : 'border border-[#FFFFFF]/10'}`}
        style={{ minWidth: compact ? '220px' : 'auto' }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold text-[#FFFFFF] shadow-md flex-shrink-0" style={{ backgroundColor: color }}>
            {player.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm truncate">{player.name}{isMe && <span className="ml-1" style={{ color: '#FACC15' }}>(You)</span>}</p>
            <div className="flex items-center gap-3 text-xs text-[#9CA3AF]">
              <span>🃏 {player.hand.length}</span>
              <span className="cursor-pointer" style={{ color: '#9CA3AF' }} onMouseOver={(e) => e.currentTarget.style.color = '#FACC15'} onMouseOut={(e) => e.currentTarget.style.color = '#9CA3AF'} onClick={() => player.bank.length > 0 && setShowBankPreview(true)}>💰 ${bankTotal}M</span>
              <span style={completeSets >= 3 ? { color: '#4ADE80', fontWeight: 'bold' } : {}}>🏆 {completeSets}/3</span>
            </div>
          </div>
          {isCurrentTurn && <span className="text-xs text-[#FFFFFF] px-2 py-1 rounded-full animate-pulse flex-shrink-0" style={{ backgroundColor: '#22C55E' }}>Playing</span>}
          {!player.isConnected && <span className="text-xs px-2 py-1 rounded-full flex-shrink-0" style={{ backgroundColor: 'rgba(239, 68, 68, 0.5)', color: '#FECACA' }}>Offline</span>}
        </div>

        {/* Properties */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {player.properties.map((set) => {
            const colorInfo = PROPERTY_COLORS[set.color];
            return (
              <div key={set.color} onClick={() => setPreviewSet(set)}
                className={`flex-shrink-0 p-2 rounded-lg border-2 transition-all cursor-pointer hover:scale-105 ${
                  set.isComplete ? 'border-[#22C55E] bg-[#22C55E]/20' : 'border-[#FFFFFF]/20 bg-[#000000]/20 hover:border-[#FFFFFF]/40'
                }`}>
                <div className="h-1 rounded-full mb-2 -mx-1" style={{ backgroundColor: colorInfo.bg }} />
                <div className="flex gap-1">
                  {set.cards.slice(0, 3).map((card) => <GameCard key={card.id} card={card} size="xs" />)}
                  {set.cards.length > 3 && <div className="w-10 h-14 bg-[#FFFFFF]/10 rounded flex items-center justify-center text-xs text-[#9CA3AF]">+{set.cards.length - 3}</div>}
                </div>
                <div className="mt-1 text-center">
                  <span className="text-[10px] font-medium" style={{ color: colorInfo.bg }}>{colorInfo.name}</span>
                  {set.isComplete && <span className="text-[10px] ml-1" style={{ color: '#4ADE80' }}>✓</span>}
                  {set.hasHouse && <span className="text-[10px] ml-1">🏠</span>}
                  {set.hasHotel && <span className="text-[10px] ml-1">🏨</span>}
                </div>
              </div>
            );
          })}
          {player.properties.length === 0 && <p className="text-xs text-[#6B7280] py-2">No properties</p>}
        </div>

        {/* Bank preview for self */}
        {isMe && player.bank.length > 0 && (
          <div className="mt-3 pt-3 border-t border-[#FFFFFF]/10">
            <p className="text-xs text-[#9CA3AF] mb-2 cursor-pointer" style={{ color: '#9CA3AF' }} onMouseOver={(e) => e.currentTarget.style.color = '#FACC15'} onMouseOut={(e) => e.currentTarget.style.color = '#9CA3AF'} onClick={() => setShowBankPreview(true)}>💰 Bank (${bankTotal}M) - tap to view</p>
            <div className="flex gap-1 overflow-x-auto">
              {player.bank.slice(0, 6).map((card) => <GameCard key={card.id} card={card} size="xs" />)}
              {player.bank.length > 6 && <div className="w-10 h-14 bg-[#FFFFFF]/10 rounded flex items-center justify-center text-xs text-[#9CA3AF]">+{player.bank.length - 6}</div>}
            </div>
          </div>
        )}
      </div>

      {/* Property Set Preview Modal */}
      {previewSet && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#000000]/80" onClick={() => setPreviewSet(null)}>
          <div className="bg-[#111827] rounded-2xl p-6 max-w-lg w-full border border-[#FFFFFF]/20 shadow-2xl max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-4 h-8 rounded" style={{ backgroundColor: PROPERTY_COLORS[previewSet.color].bg }} />
              <div>
                <h3 className="text-xl font-bold" style={{ color: PROPERTY_COLORS[previewSet.color].bg }}>{PROPERTY_COLORS[previewSet.color].name}</h3>
                <p className="text-sm text-[#9CA3AF]">{player.name}'s property • {previewSet.cards.length} card{previewSet.cards.length !== 1 ? 's' : ''}{previewSet.isComplete && ' • Complete ✓'}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 justify-center">
              {previewSet.cards.map(card => <GameCard key={card.id} card={card} size="lg" />)}
            </div>
            {(previewSet.hasHouse || previewSet.hasHotel) && (
              <div className="mt-4 text-center text-sm text-[#9CA3AF]">
                {previewSet.hasHouse && <span className="mr-2">🏠 House (+$3M rent)</span>}
                {previewSet.hasHotel && <span>🏨 Hotel (+$4M rent)</span>}
              </div>
            )}
            <button onClick={() => setPreviewSet(null)} className="w-full mt-4 py-3 text-[#9CA3AF] hover:text-[#FFFFFF] text-lg">✕ Close</button>
          </div>
        </div>
      )}

      {/* Bank Preview Modal */}
      {showBankPreview && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#000000]/80" onClick={() => setShowBankPreview(false)}>
          <div className="bg-[#111827] rounded-2xl p-6 max-w-lg w-full border border-[#FFFFFF]/20 shadow-2xl max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">💰</span>
              <div>
                <h3 className="text-xl font-bold" style={{ color: '#4ADE80' }}>{player.name}'s Bank</h3>
                <p className="text-sm text-[#9CA3AF]">{player.bank.length} card{player.bank.length !== 1 ? 's' : ''} • Total: ${bankTotal}M</p>
              </div>
            </div>
            {player.bank.length > 0 ? (
              <div className="flex flex-wrap gap-3 justify-center">
                {player.bank.map(card => <GameCard key={card.id} card={card} size="md" />)}
              </div>
            ) : (
              <p className="text-center text-[#6B7280] py-8">Bank is empty</p>
            )}
            <button onClick={() => setShowBankPreview(false)} className="w-full mt-4 py-3 text-[#9CA3AF] hover:text-[#FFFFFF] text-lg">✕ Close</button>
          </div>
        </div>
      )}
    </>
  );
}

export { PLAYER_COLORS };


