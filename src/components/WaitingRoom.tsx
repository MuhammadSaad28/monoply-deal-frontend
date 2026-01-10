import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { ChatPanel } from './ChatPanel';

const PLAYER_COLORS = ['#EF4444', '#3B82F6', '#22C55E', '#A855F7', '#F97316'];

export function WaitingRoom() {
  const { gameState, roomCode, playerId, playerName, startGame, leaveRoom } = useGameStore();
  const [copied, setCopied] = useState(false);

  const firstPlayer = gameState?.players[0];
  const isHost = firstPlayer?.id === playerId || firstPlayer?.name === playerName;
  const canStart = (gameState?.players.length || 0) >= 2;
  const playersNeeded = Math.max(0, 2 - (gameState?.players.length || 0));

  const copyCode = async () => {
    if (roomCode) {
      await navigator.clipboard.writeText(roomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-yellow-400 mb-4">
            Waiting Room
          </h1>
          
          {/* Room Code */}
          <div
            onClick={copyCode}
            className="inline-flex items-center gap-4 bg-black/30 hover:bg-black/40 px-6 py-4 md:px-8 md:py-5 rounded-2xl cursor-pointer transition-all border border-white/10"
          >
            <span className="text-gray-400 text-sm md:text-base">Room Code:</span>
            <span className="text-3xl md:text-4xl lg:text-5xl font-mono font-black tracking-[0.2em] text-white">
              {roomCode}
            </span>
            <span className="text-sm md:text-base px-3 py-1 rounded-full bg-white/10">
              {copied ? '✓ Copied!' : '📋 Copy'}
            </span>
          </div>
          <p className="text-gray-400 mt-3 text-sm md:text-base">Share this code with friends!</p>
        </div>

        {/* Main Content - Responsive Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Players Section */}
          <div className="lg:col-span-2 glass rounded-2xl p-5 md:p-6">
            <h2 className="text-xl md:text-2xl font-bold mb-4 flex items-center gap-2">
              👥 Players <span className="text-gray-400">({gameState?.players.length || 0}/5)</span>
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {gameState?.players.map((player, index) => {
                const isMe = player.id === playerId || player.name === playerName;
                return (
                  <div
                    key={player.id}
                    className={`flex items-center gap-4 p-4 rounded-xl transition-all ${
                      isMe ? 'bg-yellow-500/20 border-2 border-yellow-500/50' : 'bg-white/5 border border-white/10'
                    }`}
                  >
                    <div
                      className="w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center text-xl md:text-2xl font-bold text-white shadow-lg"
                      style={{ backgroundColor: PLAYER_COLORS[index] }}
                    >
                      {player.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-lg truncate">
                        {player.name}
                        {isMe && <span className="text-yellow-400 ml-2 text-sm">(You)</span>}
                      </p>
                      {index === 0 && <p className="text-yellow-400 text-sm">👑 Host</p>}
                    </div>
                    <div className={`w-3 h-3 rounded-full ${player.isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`} />
                  </div>
                );
              })}

              {/* Empty Slots */}
              {Array.from({ length: 5 - (gameState?.players.length || 0) }).map((_, i) => (
                <div key={`empty-${i}`} className="flex items-center gap-4 p-4 rounded-xl border-2 border-dashed border-white/20 bg-white/5">
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-white/10 flex items-center justify-center text-gray-500 text-xl">
                    ?
                  </div>
                  <p className="text-gray-500">Waiting...</p>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="mt-6 space-y-3">
              {isHost ? (
                <button
                  onClick={startGame}
                  disabled={!canStart}
                  className={`w-full py-5 text-xl md:text-2xl font-black rounded-xl transition-all ${
                    canStart
                      ? 'btn-success animate-pulse-glow'
                      : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {canStart ? '🎮 START GAME' : `⏳ Need ${playersNeeded} more player${playersNeeded > 1 ? 's' : ''}`}
                </button>
              ) : (
                <div className="w-full py-5 text-center bg-white/5 rounded-xl border border-white/10">
                  <p className="text-gray-400 text-lg">⏳ Waiting for host to start...</p>
                </div>
              )}
              
              <button onClick={leaveRoom} className="btn btn-danger w-full py-4 text-lg">
                🚪 Leave Room
              </button>
            </div>
          </div>

          {/* Chat Section */}
          <div className="glass rounded-2xl p-5 md:p-6 flex flex-col h-80 lg:h-auto">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">💬 Chat</h2>
            <div className="flex-1 min-h-0">
              <ChatPanel />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
