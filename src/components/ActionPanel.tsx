import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { PendingAction, Player, ActionCard, PropertyCard, Card } from '../types/game';
import { GameCard, PROPERTY_COLORS } from './GameCard';

interface ActionPanelProps {
  pendingAction: PendingAction;
  myPlayer: Player;
}

export function ActionPanel({ pendingAction, myPlayer }: ActionPanelProps) {
  const { gameState, playerId, playerName, respondToAction } = useGameStore();
  const [selectedPayment, setSelectedPayment] = useState<string[]>([]);
  const [selectedCardToGive, setSelectedCardToGive] = useState<string | null>(null);

  const fromPlayer = gameState?.players.find(p => p.id === pendingAction.fromPlayerId);
  const amIInitiator = pendingAction.fromPlayerId === playerId || fromPlayer?.name === playerName;
  const isTargeted = !pendingAction.toPlayerId || pendingAction.toPlayerId === playerId || 
    gameState?.players.find(p => p.id === pendingAction.toPlayerId)?.name === playerName;

  // Check if this is a multi-player action and if current player already responded
  const isMultiPlayerAction = pendingAction.respondedPlayers !== undefined;
  const hasAlreadyResponded = isMultiPlayerAction && playerId && pendingAction.respondedPlayers!.includes(playerId);

  const hasJustSayNo = myPlayer.hand.some(c => c.type === 'action' && (c as ActionCard).action === 'justSayNo');

  // For Sly Deal / Forced Deal - get cards in the target set
  const targetSet = pendingAction.targetSet ? myPlayer.properties.find(s => s.color === pendingAction.targetSet) : null;
  const cardsInTargetSet = targetSet?.cards.filter(c => c.type === 'property') || [];
  const needsCardSelection = (pendingAction.type === 'slyDeal' || pendingAction.type === 'forcedDeal') && cardsInTargetSet.length > 0;

  // Calculate total assets
  const totalBankValue = myPlayer.bank.reduce((sum, c) => sum + c.value, 0);
  const totalPropertyValue = myPlayer.properties.flatMap(s => s.cards).reduce((sum, c) => sum + c.value, 0);
  const totalAssets = totalBankValue + totalPropertyValue;

  const paymentTotal = selectedPayment.reduce((sum, cardId) => {
    const bankCard = myPlayer.bank.find(c => c.id === cardId);
    const propCard = myPlayer.properties.flatMap(s => s.cards).find(c => c.id === cardId);
    return sum + (bankCard?.value || propCard?.value || 0);
  }, 0);

  // Calculate minimum required payment
  const requiredAmount = pendingAction.amount || 0;
  const minimumPayment = Math.min(requiredAmount, totalAssets);
  const canPay = totalAssets === 0 || paymentTotal >= minimumPayment;

  const togglePayment = (cardId: string) => {
    setSelectedPayment(prev => prev.includes(cardId) ? prev.filter(id => id !== cardId) : [...prev, cardId]);
  };

  const handleAccept = () => {
    // For Sly Deal / Forced Deal, must select a card to give
    if (needsCardSelection && !selectedCardToGive) {
      alert('You must select which card to give!');
      return;
    }
    
    if (requiredAmount > 0 && totalAssets > 0 && paymentTotal < minimumPayment) {
      alert(`You must pay at least $${minimumPayment}M!`);
      return;
    }
    respondToAction({ accept: true, paymentCardIds: selectedPayment, selectedCardId: selectedCardToGive || undefined });
    setSelectedPayment([]);
    setSelectedCardToGive(null);
  };

  const handleJustSayNo = () => {
    respondToAction({ accept: false, useJustSayNo: true });
  };

  const getActionDescription = () => {
    const name = fromPlayer?.name || 'Someone';
    const doubleText = pendingAction.isDoubleRent ? ' (DOUBLE!)' : '';
    const setName = pendingAction.targetSet ? PROPERTY_COLORS[pendingAction.targetSet].name : '';
    switch (pendingAction.type) {
      case 'rent': return `${name} is charging you $${pendingAction.amount}M rent${doubleText}!`;
      case 'birthday': return `It's ${name}'s birthday! Pay $2M`;
      case 'debtCollector': return `${name} is collecting $5M from you!`;
      case 'slyDeal': return `${name} wants a property from your ${setName} set!`;
      case 'forcedDeal': return `${name} wants to trade for a property from your ${setName} set!`;
      case 'dealBreaker': return `${name} wants your complete ${setName} set!`;
      default: return `${name} played an action!`;
    }
  };

  // Show waiting status for initiator
  if (amIInitiator) {
    const respondedCount = pendingAction.respondedPlayers?.length || 0;
    const totalToRespond = (gameState?.players.length || 1) - 1;
    
    return (
      <div className="fixed inset-x-0 bottom-0 z-50 p-4 bg-gradient-to-t from-gray-900 to-gray-900/95 border-t border-yellow-500/50 animate-slide-up">
        <div className="max-w-md mx-auto text-center">
          <div className="text-yellow-400 text-lg font-bold mb-2">⏳ Waiting for response...</div>
          <p className="text-gray-400">{getActionDescription()}</p>
          {isMultiPlayerAction && (
            <p className="text-gray-500 text-sm mt-2">
              {respondedCount} / {totalToRespond} players responded
            </p>
          )}
        </div>
      </div>
    );
  }

  // Show "already responded" status for players who have responded
  if (hasAlreadyResponded) {
    const respondedCount = pendingAction.respondedPlayers?.length || 0;
    const totalToRespond = (gameState?.players.length || 1) - 1;
    
    return (
      <div className="fixed inset-x-0 bottom-0 z-50 p-4 bg-gradient-to-t from-gray-900 to-gray-900/95 border-t border-green-500/50 animate-slide-up">
        <div className="max-w-md mx-auto text-center">
          <div className="text-green-400 text-lg font-bold mb-2">✓ You've responded!</div>
          <p className="text-gray-400">Waiting for other players...</p>
          <p className="text-gray-500 text-sm mt-2">
            {respondedCount} / {totalToRespond} players responded
          </p>
        </div>
      </div>
    );
  }

  if (!isTargeted) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 p-4 bg-gradient-to-t from-gray-900 to-gray-900/95 border-t border-red-500/50 animate-slide-up">
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-4">
          <div className="text-red-400 text-xl font-bold mb-2">⚠️ Action Required!</div>
          <p className="text-white text-lg">{getActionDescription()}</p>
        </div>

        {/* Card Selection for Sly Deal / Forced Deal */}
        {needsCardSelection && (
          <div className="mb-4">
            <p className="text-sm text-gray-400 mb-2">
              Select which card to give from your <span style={{ color: PROPERTY_COLORS[pendingAction.targetSet!].bg }}>{PROPERTY_COLORS[pendingAction.targetSet!].name}</span> set:
            </p>
            <div className="flex gap-2 overflow-x-auto pb-2 justify-center">
              {cardsInTargetSet.map(card => (
                <div 
                  key={card.id} 
                  onClick={() => setSelectedCardToGive(card.id)} 
                  className={`flex-shrink-0 cursor-pointer transition-transform ${selectedCardToGive === card.id ? 'scale-110' : 'hover:scale-105'}`}
                >
                  <GameCard card={card} size="md" selected={selectedCardToGive === card.id} />
                </div>
              ))}
            </div>
            {pendingAction.type === 'forcedDeal' && pendingAction.giveFromSet && (
              <p className="text-sm text-center text-gray-500 mt-2">
                In exchange, you'll receive a {PROPERTY_COLORS[pendingAction.giveFromSet].name} property from {fromPlayer?.name}
              </p>
            )}
            {!selectedCardToGive && (
              <p className="text-yellow-400 text-sm text-center mt-2">⚠️ You must select a card!</p>
            )}
          </div>
        )}

        {/* Payment Selection */}
        {requiredAmount > 0 && (
          <div className="mb-4">
            <p className="text-sm text-gray-400 mb-2">
              Select cards to pay: <span className={`font-bold ${paymentTotal >= minimumPayment ? 'text-green-400' : 'text-red-400'}`}>${paymentTotal}M</span> / ${requiredAmount}M
              {totalAssets > 0 && totalAssets < requiredAmount && (
                <span className="text-yellow-400 ml-2">(You only have ${totalAssets}M total)</span>
              )}
            </p>
            
            {totalAssets === 0 ? (
              <p className="text-gray-500 text-center py-4 bg-white/5 rounded-lg">
                💸 You have nothing to pay with!
              </p>
            ) : (
              <>
                {myPlayer.bank.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs text-gray-500 mb-1">From Bank (${totalBankValue}M):</p>
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {myPlayer.bank.map(card => (
                        <div key={card.id} onClick={() => togglePayment(card.id)} className="flex-shrink-0 cursor-pointer">
                          <GameCard card={card} size="sm" selected={selectedPayment.includes(card.id)} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {myPlayer.properties.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">From Properties (${totalPropertyValue}M):</p>
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {myPlayer.properties.flatMap(set => set.cards).map(card => (
                        <div key={card.id} onClick={() => togglePayment(card.id)} className="flex-shrink-0 cursor-pointer">
                          <GameCard card={card} size="sm" selected={selectedPayment.includes(card.id)} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {!canPay && (
                  <p className="text-red-400 text-sm text-center mt-2 bg-red-500/10 py-2 rounded-lg">
                    ⚠️ You must select at least ${minimumPayment}M to pay!
                  </p>
                )}
              </>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          {hasJustSayNo && pendingAction.canSayNo && (
            <button onClick={handleJustSayNo} className="flex-1 py-4 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl transition-all">
              🚫 Just Say No!
            </button>
          )}
          <button
            onClick={handleAccept}
            disabled={(requiredAmount > 0 && totalAssets > 0 && !canPay) || (needsCardSelection && !selectedCardToGive)}
            className="flex-1 py-4 bg-green-600 hover:bg-green-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all"
          >
            {needsCardSelection 
              ? (selectedCardToGive ? '✓ Give Selected Card' : 'Select a Card')
              : requiredAmount > 0 
                ? totalAssets === 0 
                  ? '✓ Pay $0M (Nothing to give)' 
                  : `💰 Pay $${paymentTotal}M`
                : '✓ Accept'}
          </button>
        </div>
      </div>
    </div>
  );
}
