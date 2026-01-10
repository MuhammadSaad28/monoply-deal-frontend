import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { Card, PropertyCard, ActionCard, RentCard, TurnPhase, PropertyColor, Player } from '../types/game';
import { GameCard, PROPERTY_COLORS } from './GameCard';

interface PlayerHandProps {
  cards: Card[];
  isMyTurn: boolean;
  turnPhase: TurnPhase;
  actionsRemaining: number;
  selectedTarget?: { playerId?: string; propertySetColor?: PropertyColor } | null;
  onClearTarget?: () => void;
}

interface TargetSelectionState {
  card: Card;
  action: string;
  step: 'selectPlayer' | 'selectProperty' | 'selectSet' | 'selectWildcardColor' | 'selectRentProperty' | 'selectRentPlayer';
  rentPropertyColor?: PropertyColor;
}

export function PlayerHand({ cards, isMyTurn, turnPhase, actionsRemaining }: PlayerHandProps) {
  const { playCard, discardCards, endTurn, selectedCards, toggleCardSelection, clearSelectedCards, gameState, playerId, playerName, rearrangeProperty } = useGameStore();
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [targetSelection, setTargetSelection] = useState<TargetSelectionState | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [showRearrangeModal, setShowRearrangeModal] = useState(false);
  const [rearrangeCard, setRearrangeCard] = useState<{ card: PropertyCard; fromColor: PropertyColor } | null>(null);

  const myPlayer = gameState?.players.find(p => p.id === playerId || p.name === playerName);
  const otherPlayers = gameState?.players.filter(p => p.id !== myPlayer?.id) || [];
  const canPlay = isMyTurn && turnPhase === 'action' && actionsRemaining > 0;
  const mustDiscard = isMyTurn && turnPhase === 'discard';
  const cardsToDiscard = mustDiscard ? cards.length - 7 : 0;

  const hasRearrangeableWildcards = myPlayer?.properties.some(set => 
    set.cards.some(c => (c as PropertyCard).isWildcard && (c as PropertyCard).wildcardColors?.length && (c as PropertyCard).wildcardColors!.length > 1)
  );

  const handleCardClick = (card: Card) => {
    if (mustDiscard) { toggleCardSelection(card.id); return; }
    if (!canPlay) return;
    setSelectedCard(card);
  };

  const executePlay = (target?: { asBank?: boolean; propertySetColor?: PropertyColor; playerId?: string }) => {
    if (!selectedCard) return;
    playCard(selectedCard.id, target);
    setSelectedCard(null); setTargetSelection(null); setSelectedPlayer(null);
  };

  const handleDiscard = () => { if (selectedCards.length === cardsToDiscard) { discardCards(selectedCards); clearSelectedCards(); } };
  const handleEndTurn = () => { endTurn(); };

  const startTargetSelection = (card: Card, action: string) => {
    setSelectedCard(null);
    if (action === 'dealBreaker') {
      if (!otherPlayers.some(p => p.properties.some(s => s.isComplete))) { alert('No player has a complete set!'); return; }
    } else if (action === 'debtCollector') {
      // Debt collector - just select player
    } else {
      if (!otherPlayers.some(p => p.properties.some(s => !s.isComplete && s.cards.length > 0))) { alert('No properties to steal!'); return; }
    }
    setTargetSelection({ card, action, step: 'selectPlayer' });
  };

  const startWildcardColorSelection = (card: Card) => {
    setSelectedCard(null);
    setTargetSelection({ card, action: 'playWildcard', step: 'selectWildcardColor' });
  };

  const startRentSelection = (card: Card) => {
    setSelectedCard(null);
    const rent = card as RentCard;
    const matchingSets = myPlayer?.properties.filter(s => rent.colors.includes(s.color)) || [];
    if (matchingSets.length === 0) { alert('You need a matching property to charge rent!'); return; }
    if (matchingSets.length === 1) {
      if (rent.isWildRent) {
        setTargetSelection({ card, action: 'rent', step: 'selectRentPlayer', rentPropertyColor: matchingSets[0].color });
      } else {
        playCard(card.id, { propertySetColor: matchingSets[0].color });
      }
    } else {
      setTargetSelection({ card, action: 'rent', step: 'selectRentProperty' });
    }
  };

  const selectRentProperty = (color: PropertyColor) => {
    if (!targetSelection) return;
    const rent = targetSelection.card as RentCard;
    if (rent.isWildRent) {
      setTargetSelection({ ...targetSelection, step: 'selectRentPlayer', rentPropertyColor: color });
    } else {
      playCard(targetSelection.card.id, { propertySetColor: color });
      setTargetSelection(null);
    }
  };

  const selectRentPlayer = (player: Player) => {
    if (!targetSelection || !targetSelection.rentPropertyColor) return;
    playCard(targetSelection.card.id, { propertySetColor: targetSelection.rentPropertyColor, playerId: player.id });
    setTargetSelection(null);
  };

  const selectTargetPlayer = (player: Player) => {
    if (!targetSelection) return;
    if (targetSelection.action === 'debtCollector') {
      playCard(targetSelection.card.id, { playerId: player.id });
      setTargetSelection(null);
      return;
    }
    setSelectedPlayer(player);
    setTargetSelection({ ...targetSelection, step: targetSelection.action === 'dealBreaker' ? 'selectSet' : 'selectProperty' });
  };

  const selectTargetProperty = (color: PropertyColor) => {
    if (!targetSelection || !selectedPlayer) return;
    playCard(targetSelection.card.id, { playerId: selectedPlayer.id, propertySetColor: color });
    setTargetSelection(null); setSelectedPlayer(null);
  };

  const selectWildcardColor = (color: PropertyColor) => {
    if (!targetSelection) return;
    playCard(targetSelection.card.id, { propertySetColor: color });
    setTargetSelection(null);
  };

  const cancelTargetSelection = () => { setTargetSelection(null); setSelectedPlayer(null); setSelectedCard(null); };
  const executeRearrange = (toColor: PropertyColor) => {
    if (!rearrangeCard) return;
    rearrangeProperty(rearrangeCard.card.id, rearrangeCard.fromColor, toColor);
    setRearrangeCard(null); setShowRearrangeModal(false);
  };

  const getCardActions = () => {
    if (!selectedCard) return [];
    const actions: { label: string; icon: string; color: string; onClick: () => void }[] = [];
    if (selectedCard.type === 'property') {
      const prop = selectedCard as PropertyCard;
      if (prop.isWildcard && prop.wildcardColors && prop.wildcardColors.length > 1) {
        actions.push({ label: 'Play Property', icon: '🏠', color: 'bg-blue-600 hover:bg-blue-500', onClick: () => startWildcardColorSelection(selectedCard) });
      } else {
        actions.push({ label: 'Play Property', icon: '🏠', color: 'bg-blue-600 hover:bg-blue-500', onClick: () => executePlay({ propertySetColor: prop.color }) });
      }
    }
    if (selectedCard.type === 'action') {
      const action = selectedCard as ActionCard;
      if (['slyDeal', 'forcedDeal', 'dealBreaker'].includes(action.action)) {
        actions.push({ label: action.name, icon: action.action === 'dealBreaker' ? '💥' : action.action === 'slyDeal' ? '🦊' : '🔄', color: 'bg-purple-600 hover:bg-purple-500', onClick: () => startTargetSelection(selectedCard, action.action) });
      } else if (action.action === 'debtCollector') {
        actions.push({ label: action.name, icon: '💰', color: 'bg-purple-600 hover:bg-purple-500', onClick: () => startTargetSelection(selectedCard, 'debtCollector') });
      } else if (['house', 'hotel'].includes(action.action)) {
        const sets = myPlayer?.properties.filter(s => s.isComplete) || [];
        if (sets.length > 0) actions.push({ label: action.name, icon: action.action === 'house' ? '🏠' : '🏨', color: 'bg-purple-600 hover:bg-purple-500', onClick: () => executePlay({ propertySetColor: sets[0].color }) });
      } else if (!['justSayNo', 'doubleRent'].includes(action.action)) {
        actions.push({ label: action.name, icon: '⚡', color: 'bg-purple-600 hover:bg-purple-500', onClick: () => executePlay() });
      }
    }
    if (selectedCard.type === 'rent') {
      actions.push({ label: 'Charge Rent', icon: '💵', color: 'bg-amber-600 hover:bg-amber-500', onClick: () => startRentSelection(selectedCard) });
    }
    if (selectedCard.value > 0) {
      actions.push({ label: `Bank (${selectedCard.value}M)`, icon: '💰', color: 'bg-green-600 hover:bg-green-500', onClick: () => executePlay({ asBank: true }) });
    }
    return actions;
  };

  const getStealableProperties = () => {
    if (!selectedPlayer || !targetSelection) return [];
    if (targetSelection.action === 'dealBreaker') return selectedPlayer.properties.filter(s => s.isComplete);
    return selectedPlayer.properties.filter(s => !s.isComplete && s.cards.length > 0);
  };

  const getRearrangeableWildcards = () => {
    if (!myPlayer) return [];
    const wildcards: { card: PropertyCard; fromColor: PropertyColor }[] = [];
    for (const set of myPlayer.properties) {
      for (const card of set.cards) {
        const prop = card as PropertyCard;
        if (prop.isWildcard && prop.wildcardColors && prop.wildcardColors.length > 1) wildcards.push({ card: prop, fromColor: set.color });
      }
    }
    return wildcards;
  };

  const getMatchingRentSets = () => {
    if (!targetSelection || !myPlayer) return [];
    const rent = targetSelection.card as RentCard;
    return myPlayer.properties.filter(s => rent.colors.includes(s.color));
  };

  return (
    <div className="p-3 md:p-4">
      {/* Action phase - can play cards */}
      {isMyTurn && turnPhase === 'action' && !targetSelection && (
        <div className="mb-3 p-3 bg-green-500/20 border border-green-500/50 rounded-xl">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="text-center sm:text-left">
              <p className="text-green-400 font-bold">🎯 Your Turn</p>
              <p className="text-green-300/70 text-sm">{actionsRemaining} action{actionsRemaining !== 1 ? 's' : ''} remaining</p>
            </div>
            <div className="flex gap-2 justify-center sm:justify-end">
              {hasRearrangeableWildcards && <button onClick={() => setShowRearrangeModal(true)} className="px-4 py-2 bg-blue-500 hover:bg-blue-400 text-white font-bold rounded-lg">🔄 Rearrange</button>}
              <button onClick={handleEndTurn} className="px-6 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-lg">End Turn ✓</button>
            </div>
          </div>
        </div>
      )}

      {/* Finishing phase - all actions used, can rearrange before ending */}
      {isMyTurn && turnPhase === 'finishing' && !targetSelection && (
        <div className="mb-3 p-3 bg-yellow-500/20 border border-yellow-500/50 rounded-xl">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="text-center sm:text-left">
              <p className="text-yellow-400 font-bold">✨ Actions Complete!</p>
              <p className="text-yellow-300/70 text-sm">Rearrange properties if needed, then finish your turn</p>
            </div>
            <div className="flex gap-2 justify-center sm:justify-end">
              {hasRearrangeableWildcards && <button onClick={() => setShowRearrangeModal(true)} className="px-4 py-2 bg-blue-500 hover:bg-blue-400 text-white font-bold rounded-lg">🔄 Rearrange</button>}
              <button onClick={handleEndTurn} className="px-6 py-2 bg-green-500 hover:bg-green-400 text-white font-bold rounded-lg animate-pulse">Finish Turn ✓</button>
            </div>
          </div>
        </div>
      )}

      {mustDiscard && (
        <div className="mb-3 p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-center">
          <p className="text-red-400 font-bold">⚠️ Discard {cardsToDiscard} card{cardsToDiscard !== 1 ? 's' : ''}</p>
          <p className="text-sm text-gray-400">Selected: {selectedCards.length}/{cardsToDiscard}</p>
          <button onClick={handleDiscard} disabled={selectedCards.length !== cardsToDiscard} className="mt-2 px-6 py-2 bg-red-600 hover:bg-red-500 disabled:bg-gray-600 text-white rounded-lg font-bold">Discard</button>
        </div>
      )}
      <div className="flex gap-2 md:gap-3 overflow-x-auto pb-2 -mx-1 px-1">
        {cards.map(card => <div key={card.id} className="flex-shrink-0"><GameCard card={card} size="md" selected={selectedCards.includes(card.id)} onClick={() => handleCardClick(card)} disabled={!canPlay && !mustDiscard} /></div>)}
        {cards.length === 0 && <p className="text-gray-500 text-center w-full py-8">No cards in hand</p>}
      </div>
      <p className="text-center text-xs text-gray-500 mt-2">🃏 {cards.length} cards {cards.length > 7 && <span className="text-red-400">(max 7)</span>}</p>

      {/* Card Action Modal */}
      {selectedCard && canPlay && !targetSelection && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80" onClick={() => setSelectedCard(null)}>
          <div className="bg-gray-900 rounded-2xl p-6 max-w-sm w-full border border-white/20 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-center mb-4"><GameCard card={selectedCard} size="lg" /></div>
            <h3 className="text-xl font-bold text-center mb-4">{selectedCard.name}</h3>
            <div className="space-y-3">
              {getCardActions().map((action, i) => <button key={i} onClick={action.onClick} className={`w-full py-4 rounded-xl text-white font-bold text-lg flex items-center justify-center gap-3 ${action.color}`}><span className="text-2xl">{action.icon}</span>{action.label}</button>)}
            </div>
            <button onClick={() => setSelectedCard(null)} className="w-full mt-4 py-3 text-gray-400 hover:text-white text-lg">✕ Cancel</button>
          </div>
        </div>
      )}

      {/* Target Selection Modal */}
      {targetSelection && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80" onClick={cancelTargetSelection}>
          <div className="bg-gray-900 rounded-2xl p-6 max-w-md w-full border border-white/20 shadow-2xl max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            {/* Wildcard Color Selection */}
            {targetSelection.step === 'selectWildcardColor' && (
              <>
                <h3 className="text-xl font-bold text-center mb-4">🏠 Choose Color</h3>
                <div className="space-y-3">
                  {(targetSelection.card as PropertyCard).wildcardColors?.map(color => (
                    <button key={color} onClick={() => selectWildcardColor(color)} className="w-full p-4 rounded-xl flex items-center gap-4 hover:scale-[1.02]" style={{ backgroundColor: `${PROPERTY_COLORS[color].bg}33`, borderWidth: 2, borderColor: PROPERTY_COLORS[color].border }}>
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: PROPERTY_COLORS[color].bg }}>🏠</div>
                      <p className="font-bold" style={{ color: PROPERTY_COLORS[color].bg }}>{PROPERTY_COLORS[color].name}</p>
                    </button>
                  ))}
                </div>
              </>
            )}
            {/* Rent Property Selection */}
            {targetSelection.step === 'selectRentProperty' && (
              <>
                <h3 className="text-xl font-bold text-center mb-2">💵 Charge Rent</h3>
                <p className="text-gray-400 text-center mb-4">Which property do you want to charge rent for?</p>
                <div className="space-y-3">
                  {getMatchingRentSets().map(set => (
                    <button key={set.color} onClick={() => selectRentProperty(set.color)} className="w-full p-4 rounded-xl flex items-center gap-4 hover:scale-[1.02]" style={{ backgroundColor: `${PROPERTY_COLORS[set.color].bg}33`, borderWidth: 2, borderColor: PROPERTY_COLORS[set.color].border }}>
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: PROPERTY_COLORS[set.color].bg }}>🏠</div>
                      <div className="text-left flex-1">
                        <p className="font-bold" style={{ color: PROPERTY_COLORS[set.color].bg }}>{PROPERTY_COLORS[set.color].name}</p>
                        <p className="text-sm text-gray-300">{set.cards.length} card{set.cards.length !== 1 ? 's' : ''}{set.isComplete && ' ✓'}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}
            {/* Rent Player Selection (Wild Rent) */}
            {targetSelection.step === 'selectRentPlayer' && (
              <>
                <h3 className="text-xl font-bold text-center mb-2">💵 Wild Rent</h3>
                <p className="text-gray-400 text-center mb-4">Select a player to charge rent</p>
                <div className="space-y-3">
                  {otherPlayers.map(player => (
                    <button key={player.id} onClick={() => selectRentPlayer(player)} className="w-full p-4 bg-white/10 hover:bg-white/20 rounded-xl flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-xl font-bold">{player.name.charAt(0).toUpperCase()}</div>
                      <div className="text-left"><p className="font-bold">{player.name}</p><p className="text-sm text-gray-400">{player.properties.length} sets • ${player.bank.reduce((s, c) => s + c.value, 0)}M bank</p></div>
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* Player Selection for Steal/Debt */}
            {targetSelection.step === 'selectPlayer' && (
              <>
                <h3 className="text-xl font-bold text-center mb-2">{targetSelection.action === 'dealBreaker' ? '💥 Deal Breaker' : targetSelection.action === 'slyDeal' ? '🦊 Sly Deal' : targetSelection.action === 'forcedDeal' ? '🔄 Forced Deal' : '💰 Debt Collector'}</h3>
                <p className="text-gray-400 text-center mb-4">Select a player</p>
                <div className="space-y-3">
                  {otherPlayers.filter(p => {
                    if (targetSelection.action === 'debtCollector') return true;
                    if (targetSelection.action === 'dealBreaker') return p.properties.some(s => s.isComplete);
                    return p.properties.some(s => !s.isComplete && s.cards.length > 0);
                  }).map(player => (
                    <button key={player.id} onClick={() => selectTargetPlayer(player)} className="w-full p-4 bg-white/10 hover:bg-white/20 rounded-xl flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-xl font-bold">{player.name.charAt(0).toUpperCase()}</div>
                      <div className="text-left"><p className="font-bold">{player.name}</p><p className="text-sm text-gray-400">{player.properties.length} sets</p></div>
                    </button>
                  ))}
                </div>
              </>
            )}
            {/* Property Selection for Steal */}
            {(targetSelection.step === 'selectProperty' || targetSelection.step === 'selectSet') && selectedPlayer && (
              <>
                <h3 className="text-xl font-bold text-center mb-2">{targetSelection.action === 'dealBreaker' ? 'Select Complete Set' : 'Select Property'}</h3>
                <p className="text-gray-400 text-center mb-4">From {selectedPlayer.name}</p>
                <div className="space-y-3">
                  {getStealableProperties().map(set => (
                    <button key={set.color} onClick={() => selectTargetProperty(set.color)} className="w-full p-4 rounded-xl flex items-center gap-4 hover:scale-[1.02]" style={{ backgroundColor: `${PROPERTY_COLORS[set.color].bg}33`, borderWidth: 2, borderColor: PROPERTY_COLORS[set.color].border }}>
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: PROPERTY_COLORS[set.color].bg }}>🏠</div>
                      <div className="text-left flex-1">
                        <p className="font-bold" style={{ color: PROPERTY_COLORS[set.color].bg }}>{PROPERTY_COLORS[set.color].name}</p>
                        <p className="text-sm text-gray-300">{set.cards.length} card{set.cards.length !== 1 ? 's' : ''}{set.isComplete && ' ✓'}</p>
                      </div>
                    </button>
                  ))}
                </div>
                <button onClick={() => { setSelectedPlayer(null); setTargetSelection({ ...targetSelection, step: 'selectPlayer' }); }} className="w-full mt-4 py-2 text-gray-400 hover:text-white">← Back</button>
              </>
            )}
            <button onClick={cancelTargetSelection} className="w-full mt-4 py-3 text-gray-400 hover:text-white text-lg">✕ Cancel</button>
          </div>
        </div>
      )}

      {/* Rearrange Modal */}
      {showRearrangeModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80" onClick={() => { setShowRearrangeModal(false); setRearrangeCard(null); }}>
          <div className="bg-gray-900 rounded-2xl p-6 max-w-md w-full border border-white/20 shadow-2xl max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            {!rearrangeCard ? (
              <>
                <h3 className="text-xl font-bold text-center mb-4">🔄 Rearrange Properties</h3>
                <div className="space-y-3">
                  {getRearrangeableWildcards().map(({ card, fromColor }) => (
                    <button key={card.id} onClick={() => setRearrangeCard({ card, fromColor })} className="w-full p-4 rounded-xl flex items-center gap-4 bg-white/10 hover:bg-white/20">
                      <div className="flex-shrink-0"><GameCard card={card} size="sm" /></div>
                      <div className="text-left flex-1">
                        <p className="font-bold">{card.name}</p>
                        <p className="text-sm text-gray-400">In: <span style={{ color: PROPERTY_COLORS[fromColor].bg }}>{PROPERTY_COLORS[fromColor].name}</span></p>
                      </div>
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <>
                <h3 className="text-xl font-bold text-center mb-4">Move to which set?</h3>
                <div className="space-y-3">
                  {rearrangeCard.card.wildcardColors?.filter(c => c !== rearrangeCard.fromColor).map(color => (
                    <button key={color} onClick={() => executeRearrange(color)} className="w-full p-4 rounded-xl flex items-center gap-4 hover:scale-[1.02]" style={{ backgroundColor: `${PROPERTY_COLORS[color].bg}33`, borderWidth: 2, borderColor: PROPERTY_COLORS[color].border }}>
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: PROPERTY_COLORS[color].bg }}>🏠</div>
                      <p className="font-bold" style={{ color: PROPERTY_COLORS[color].bg }}>{PROPERTY_COLORS[color].name}</p>
                    </button>
                  ))}
                </div>
                <button onClick={() => setRearrangeCard(null)} className="w-full mt-4 py-2 text-gray-400 hover:text-white">← Back</button>
              </>
            )}
            <button onClick={() => { setShowRearrangeModal(false); setRearrangeCard(null); }} className="w-full mt-4 py-3 text-gray-400 hover:text-white text-lg">✕ Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
