import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { PlayerHand } from './PlayerHand';
import { PlayerArea } from './PlayerArea';
import { ActionPanel } from './ActionPanel';
import { ChatPanel } from './ChatPanel';
import { GameCard } from './GameCard';

export function GameBoard() {
  const { gameState, playerId, playerName, drawCards, leaveRoom } = useGameStore();
  const [showChat, setShowChat] = useState(false);

  if (!gameState) return null;

  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  const myPlayer = gameState.players.find(p => p.id === playerId || p.name === playerName);
  const myPlayerId = myPlayer?.id;
  const isMyTurn = currentPlayer?.id === myPlayerId;
  const otherPlayers = gameState.players.filter(p => p.id !== myPlayerId);

  const handleDraw = () => {
    if (isMyTurn && gameState.turnPhase === 'draw') {
      drawCards();
    }
  };

  return (
    <div className="h-screen flex flex-col lg:flex-row overflow-hidden" style={{ background: 'linear-gradient(135deg, #111827 0%, #1F2937 50%, #111827 100%)' }}>
      {/* Main Area */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Top Bar */}
        <header className="flex-shrink-0 flex items-center justify-between px-4 py-3 bg-[#000000]/40 border-b border-[#FFFFFF]/10">
          <div className="flex items-center gap-3">
            <span className="text-[#9CA3AF] text-sm">Room:</span>
            <span className="font-mono font-bold text-lg" style={{ color: '#FACC15' }}>{gameState.roomCode}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <div 
              className={`px-3 py-1.5 rounded-lg text-sm font-bold ${isMyTurn ? 'animate-pulse' : ''}`}
              style={isMyTurn 
                ? { backgroundColor: 'rgba(34, 197, 94, 0.3)', color: '#4ADE80' }
                : { backgroundColor: 'rgba(255, 255, 255, 0.1)', color: '#9CA3AF' }
              }
            >
              {isMyTurn ? `🎯 Your Turn` : `⏳ ${currentPlayer?.name}'s turn`}
            </div>
            {isMyTurn && (
              <div 
                className="px-3 py-1.5 rounded-lg text-sm font-bold"
                style={{ backgroundColor: 'rgba(234, 179, 8, 0.2)', color: '#FACC15' }}
              >
                {gameState.actionsRemaining} actions
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button onClick={() => setShowChat(!showChat)} className="lg:hidden p-2 rounded-lg bg-[#FFFFFF]/10 hover:bg-[#FFFFFF]/20">
              💬
            </button>
            <button 
              onClick={leaveRoom} 
              className="p-2 rounded-lg"
              style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', color: '#F87171' }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.3)'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.2)'}
            >
              🚪
            </button>
          </div>
        </header>

        {/* Winner Banner */}
        {gameState.phase === 'finished' && gameState.winner && (
          <div 
            className="flex-shrink-0 text-[#000000] text-center py-4 font-black text-xl md:text-2xl"
            style={{ background: 'linear-gradient(to right, #FFD700, #FFB000)' }}
          >
            🎉 {gameState.players.find(p => p.id === gameState.winner)?.name} WINS! 🎉
          </div>
        )}

        {/* Game Content */}
        <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden">
          {/* Opponents Sidebar (Desktop) */}
          <aside className="hidden lg:block w-72 xl:w-80 border-r border-[#FFFFFF]/10 overflow-y-auto p-4 space-y-4 bg-[#000000]/20">
            <h3 className="text-sm font-bold text-[#9CA3AF] uppercase tracking-wide">Opponents</h3>
            {otherPlayers.map((player) => (
              <PlayerArea
                key={player.id}
                player={player}
                isCurrentTurn={currentPlayer?.id === player.id}
                colorIndex={gameState.players.indexOf(player)}
              />
            ))}
          </aside>

          {/* Center */}
          <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
            {/* Opponents (Mobile) */}
            <div className="lg:hidden flex-shrink-0 overflow-x-auto border-b border-[#FFFFFF]/10 bg-[#000000]/20">
              <div className="flex gap-3 p-3" style={{ minWidth: 'max-content' }}>
                {otherPlayers.map((player) => (
                  <PlayerArea
                    key={player.id}
                    player={player}
                    isCurrentTurn={currentPlayer?.id === player.id}
                    colorIndex={gameState.players.indexOf(player)}
                    compact
                  />
                ))}
              </div>
            </div>

            {/* Scrollable middle section: Deck + My Properties */}
            <div className="flex-1 min-h-0 overflow-y-auto">
              {/* Deck Area */}
              <div className="flex items-center justify-center gap-8 md:gap-16 p-4 min-h-[200px]">
                {/* Draw Pile */}
                <div className="text-center">
                  <div
                    onClick={handleDraw}
                    className={`relative transition-all duration-300 ${
                      isMyTurn && gameState.turnPhase === 'draw'
                        ? 'cursor-pointer hover:scale-110 animate-pulse-glow'
                        : 'opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <div 
                      className="w-20 h-28 md:w-28 md:h-36 lg:w-32 lg:h-44 rounded-xl border-4 flex items-center justify-center card-shadow"
                      style={{ 
                        background: 'linear-gradient(135deg, #DC2626 0%, #991B1B 100%)',
                        borderColor: '#F87171'
                      }}
                    >
                      <span className="text-3xl md:text-4xl">🎴</span>
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-[#1F2937] text-[#FFFFFF] text-sm px-2 py-1 rounded-full border border-[#4B5563]">
                      {gameState.deck.length}
                    </div>
                  </div>
                  {isMyTurn && gameState.turnPhase === 'draw' && (
                    <p className="mt-2 font-bold text-sm animate-bounce" style={{ color: '#4ADE80' }}>👆 TAP TO DRAW</p>
                  )}
                  <p className="text-[#6B7280] text-xs mt-1">Draw Pile</p>
                </div>

                {/* Discard Pile */}
                <div className="text-center">
                  <div className="relative">
                    {gameState.discardPile.length > 0 ? (
                      <GameCard card={gameState.discardPile[gameState.discardPile.length - 1]} size="sm" />
                    ) : (
                      <div className="w-20 h-28 md:w-28 md:h-36 lg:w-32 lg:h-44 bg-[#FFFFFF]/5 rounded-xl border-2 border-dashed border-[#FFFFFF]/20 flex items-center justify-center">
                        <span className="text-[#4B5563] text-xs">Empty</span>
                      </div>
                    )}
                    <div className="absolute -bottom-2 -right-2 bg-[#1F2937] text-[#FFFFFF] text-sm px-2 py-1 rounded-full border border-[#4B5563]">
                      {gameState.discardPile.length}
                    </div>
                  </div>
                  <p className="text-[#6B7280] text-xs mt-1">Discard</p>
                </div>
              </div>

              {/* My Properties */}
              {myPlayer && (
                <div className="border-t border-[#FFFFFF]/10 bg-[#000000]/30 p-3">
                  <PlayerArea
                    player={myPlayer}
                    isCurrentTurn={isMyTurn}
                    isMe
                    colorIndex={gameState.players.findIndex(p => p.id === myPlayerId)}
                  />
                </div>
              )}
            </div>

            {/* My Hand - Fixed at bottom */}
            {myPlayer && (
              <div className="flex-shrink-0 border-t border-[#FFFFFF]/10 bg-[#000000]/40">
                <PlayerHand
                  cards={myPlayer.hand}
                  isMyTurn={isMyTurn}
                  turnPhase={gameState.turnPhase}
                  actionsRemaining={gameState.actionsRemaining}
                />
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Chat Sidebar (Desktop) */}
      <aside className="hidden lg:flex flex-col w-72 xl:w-80 border-l border-[#FFFFFF]/10 bg-[#000000]/20">
        <div className="p-4 border-b border-[#FFFFFF]/10">
          <h3 className="font-bold">💬 Chat</h3>
        </div>
        <div className="flex-1 p-4 min-h-0">
          <ChatPanel />
        </div>
      </aside>

      {/* Action Response Panel */}
      {gameState.pendingAction && myPlayer && (
        <ActionPanel pendingAction={gameState.pendingAction} myPlayer={myPlayer} />
      )}

      {/* Mobile Chat Overlay */}
      {showChat && (
        <div className="lg:hidden fixed inset-0 z-50 bg-[#000000]/70" onClick={() => setShowChat(false)}>
          <div className="absolute bottom-0 left-0 right-0 h-2/3 bg-[#111827] rounded-t-3xl p-4 animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">💬 Chat</h3>
              <button onClick={() => setShowChat(false)} className="text-[#9CA3AF] text-2xl">✕</button>
            </div>
            <div className="h-[calc(100%-4rem)]">
              <ChatPanel />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


