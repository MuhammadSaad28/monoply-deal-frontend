import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { PendingAction, Player, ActionCard } from '../types/game';
import { GameCard } from './GameCard';

interface ActionPanelProps {
  pendingAction: PendingAction;
  myPlayer: Player;
}

export function ActionPanel({ pendingAction, myPlayer }: ActionPanelProps) {
  const { gameState, playerId, playerName, respondToAction } = useGameStore();
  const [selectedPayment, setSelectedPayment] = useState<string[]>([]);

  const fromPlayer = gameState?.players.find(p => p.id === pendingAction.fromPlayerId);
  const amIInitiator = pendingAction.fromPlayerId === playerId || fromPlayer?.name === playerName;
  const isTargeted = !pendingAction.toPlayerId || pendingAction.toPlayerId === playerId || 
    gameState?.players.find(p => p.id === pendingAction.toPlayerId)?.name === playerName;

  // Check if this is a multi-player action and if current player already responded
  const isMultiPlayerAction = pendingAction.respondedPlayers !== undefined;
  const hasAlreadyResponded = isMultiPlayerAction && pendingAction.respondedPlayers!.includes(playerId);

  const hasJustSayNo = myPlayer.hand.some(c => c.type === 'action' && (c as ActionCard).action === 'justSayNo');

  const paymentTotal = selectedPayment.reduce((sum, cardId) => {
    const bankCard = myPlayer.bank.find(c => c.id === cardId);
    const propCard = myPlayer.properties.flatMap(s => s.cards).find(c => c.id === cardId);
    return sum + (bankCard?.value || propCard?.value || 0);
  }, 0);

  const togglePayment = (cardId: string) => {
    setSelectedPayment(prev => prev.includes(cardId) ? prev.filter(id => id !== cardId) : [...prev, cardId]);
  };

  const handleAccept = () => {
    respondToAction({ accept: true, paymentCardIds: selectedPayment });
    setSelectedPayment([]);
  };

  const handleJustSayNo = () => {
    respondToAction({ accept: false, useJustSayNo: true });
  };

  const getActionDescription = () => {
    const name = fromPlayer?.name || 'Someone';
    switch (pendingAction.type) {
      case 'rent': return `${name} is charging you ${pendingAction.amount}M rent!`;
      case 'birthday': return `It's ${name}'s birthday! Pay $2M`;
      case 'debtCollector': return `${name} is collecting $5M from you!`;
      case 'slyDeal': return `${name} wants to steal a property!`;
      case 'forcedDeal': return `${name} wants to trade properties!`;
      case 'dealBreaker': return `${name} wants your complete set!`;
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

        {/* Payment Selection */}
        {pendingAction.amount && pendingAction.amount > 0 && (
          <div className="mb-4">
            <p className="text-sm text-gray-400 mb-2">
              Select cards to pay: <span className="text-white font-bold">${paymentTotal}M</span> / ${pendingAction.amount}M
            </p>
            
            {myPlayer.bank.length > 0 && (
              <div className="mb-3">
                <p className="text-xs text-gray-500 mb-1">From Bank:</p>
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
                <p className="text-xs text-gray-500 mb-1">From Properties:</p>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {myPlayer.properties.flatMap(set => set.cards).map(card => (
                    <div key={card.id} onClick={() => togglePayment(card.id)} className="flex-shrink-0 cursor-pointer">
                      <GameCard card={card} size="sm" selected={selectedPayment.includes(card.id)} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {myPlayer.bank.length === 0 && myPlayer.properties.length === 0 && (
              <p className="text-gray-500 text-center py-4">You have nothing to pay with!</p>
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
            className="flex-1 py-4 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl transition-all"
          >
            {pendingAction.amount ? `💰 Pay ${Math.min(paymentTotal, pendingAction.amount)}M` : '✓ Accept'}
          </button>
        </div>

        {pendingAction.amount && paymentTotal < pendingAction.amount && (
          <p className="text-xs text-gray-500 text-center mt-2">You can pay less if you don't have enough</p>
        )}
      </div>
    </div>
  );
}
