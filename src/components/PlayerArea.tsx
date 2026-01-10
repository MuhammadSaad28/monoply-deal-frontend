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
          isCurrentTurn ? 'ring-2 ring-green-400 bg-green-500/10' : 'bg-white/5'
        } ${isMe ? 'border-2 border-yellow-500/50' : 'border border-white/10'}`}
        style={{ minWidth: compact ? '220px' : 'auto' }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold text-white shadow-md flex-shrink-0" style={{ backgroundColor: color }}>
            {player.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm truncate">{player.name}{isMe && <span className="text-yellow-400 ml-1">(You)</span>}</p>
            <div className="flex items-center gap-3 text-xs text-gray-400">
              <span>🃏 {player.hand.length}</span>
              <span className="cursor-pointer hover:text-yellow-400" onClick={() => player.bank.length > 0 && setShowBankPreview(true)}>💰 ${bankTotal}M</span>
              <span className={completeSets >= 3 ? 'text-green-400 font-bold' : ''}>🏆 {completeSets}/3</span>
            </div>
          </div>
          {isCurrentTurn && <span className="text-xs bg-green-500 text-white px-2 py-1 rounded-full animate-pulse flex-shrink-0">Playing</span>}
          {!player.isConnected && <span className="text-xs bg-red-500/50 text-red-200 px-2 py-1 rounded-full flex-shrink-0">Offline</span>}
        </div>

        {/* Properties */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {player.properties.map((set) => {
            const colorInfo = PROPERTY_COLORS[set.color];
            return (
              <div key={set.color} onClick={() => setPreviewSet(set)}
                className={`flex-shrink-0 p-2 rounded-lg border-2 transition-all cursor-pointer hover:scale-105 ${
                  set.isComplete ? 'border-green-500 bg-green-500/20' : 'border-white/20 bg-black/20 hover:border-white/40'
                }`}>
                <div className="h-1 rounded-full mb-2 -mx-1" style={{ backgroundColor: colorInfo.bg }} />
                <div className="flex gap-1">
                  {set.cards.slice(0, 3).map((card) => <GameCard key={card.id} card={card} size="xs" />)}
                  {set.cards.length > 3 && <div className="w-10 h-14 bg-white/10 rounded flex items-center justify-center text-xs text-gray-400">+{set.cards.length - 3}</div>}
                </div>
                <div className="mt-1 text-center">
                  <span className="text-[10px] font-medium" style={{ color: colorInfo.bg }}>{colorInfo.name}</span>
                  {set.isComplete && <span className="text-[10px] text-green-400 ml-1">✓</span>}
                  {set.hasHouse && <span className="text-[10px] ml-1">🏠</span>}
                  {set.hasHotel && <span className="text-[10px] ml-1">🏨</span>}
                </div>
              </div>
            );
          })}
          {player.properties.length === 0 && <p className="text-xs text-gray-500 py-2">No properties</p>}
        </div>

        {/* Bank preview for self */}
        {isMe && player.bank.length > 0 && (
          <div className="mt-3 pt-3 border-t border-white/10">
            <p className="text-xs text-gray-400 mb-2 cursor-pointer hover:text-yellow-400" onClick={() => setShowBankPreview(true)}>💰 Bank (${bankTotal}M) - tap to view</p>
            <div className="flex gap-1 overflow-x-auto">
              {player.bank.slice(0, 6).map((card) => <GameCard key={card.id} card={card} size="xs" />)}
              {player.bank.length > 6 && <div className="w-10 h-14 bg-white/10 rounded flex items-center justify-center text-xs text-gray-400">+{player.bank.length - 6}</div>}
            </div>
          </div>
        )}
      </div>

      {/* Property Set Preview Modal */}
      {previewSet && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80" onClick={() => setPreviewSet(null)}>
          <div className="bg-gray-900 rounded-2xl p-6 max-w-lg w-full border border-white/20 shadow-2xl max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-4 h-8 rounded" style={{ backgroundColor: PROPERTY_COLORS[previewSet.color].bg }} />
              <div>
                <h3 className="text-xl font-bold" style={{ color: PROPERTY_COLORS[previewSet.color].bg }}>{PROPERTY_COLORS[previewSet.color].name}</h3>
                <p className="text-sm text-gray-400">{player.name}'s property • {previewSet.cards.length} card{previewSet.cards.length !== 1 ? 's' : ''}{previewSet.isComplete && ' • Complete ✓'}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 justify-center">
              {previewSet.cards.map(card => <GameCard key={card.id} card={card} size="lg" />)}
            </div>
            {(previewSet.hasHouse || previewSet.hasHotel) && (
              <div className="mt-4 text-center text-sm text-gray-400">
                {previewSet.hasHouse && <span className="mr-2">🏠 House (+$3M rent)</span>}
                {previewSet.hasHotel && <span>🏨 Hotel (+$4M rent)</span>}
              </div>
            )}
            <button onClick={() => setPreviewSet(null)} className="w-full mt-4 py-3 text-gray-400 hover:text-white text-lg">✕ Close</button>
          </div>
        </div>
      )}

      {/* Bank Preview Modal */}
      {showBankPreview && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80" onClick={() => setShowBankPreview(false)}>
          <div className="bg-gray-900 rounded-2xl p-6 max-w-lg w-full border border-white/20 shadow-2xl max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">💰</span>
              <div>
                <h3 className="text-xl font-bold text-green-400">{player.name}'s Bank</h3>
                <p className="text-sm text-gray-400">{player.bank.length} card{player.bank.length !== 1 ? 's' : ''} • Total: ${bankTotal}M</p>
              </div>
            </div>
            {player.bank.length > 0 ? (
              <div className="flex flex-wrap gap-3 justify-center">
                {player.bank.map(card => <GameCard key={card.id} card={card} size="md" />)}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">Bank is empty</p>
            )}
            <button onClick={() => setShowBankPreview(false)} className="w-full mt-4 py-3 text-gray-400 hover:text-white text-lg">✕ Close</button>
          </div>
        </div>
      )}
    </>
  );
}

export { PLAYER_COLORS };
