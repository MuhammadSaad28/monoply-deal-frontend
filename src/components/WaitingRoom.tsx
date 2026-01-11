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
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-black mb-4" style={{ color: '#FACC15' }}>
            Waiting Room
          </h1>
          
          {/* Room Code */}
          <div
            onClick={copyCode}
            className="inline-flex items-center gap-4 px-6 py-4 md:px-8 md:py-5 rounded-2xl cursor-pointer transition-all"
            style={{ backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            <span className="text-sm md:text-base" style={{ color: '#9CA3AF' }}>Room Code:</span>
            <span className="text-3xl md:text-4xl lg:text-5xl font-mono font-black tracking-[0.2em]" style={{ color: '#FFFFFF' }}>
              {roomCode}
            </span>
            <span className="text-sm md:text-base px-3 py-1 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
              {copied ? '✓ Copied!' : '📋 Copy'}
            </span>
          </div>
          <p className="mt-3 text-sm md:text-base" style={{ color: '#9CA3AF' }}>Share this code with friends!</p>
        </div>

        {/* Main Content - Responsive Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Players Section */}
          <div className="lg:col-span-2 glass rounded-2xl p-5 md:p-6">
            <h2 className="text-xl md:text-2xl font-bold mb-4 flex items-center gap-2">
              👥 Players <span style={{ color: '#9CA3AF' }}>({gameState?.players.length || 0}/5)</span>
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {gameState?.players.map((player, index) => {
                const isMe = player.id === playerId || player.name === playerName;
                return (
                  <div
                    key={player.id}
                    className="flex items-center gap-4 p-4 rounded-xl transition-all"
                    style={isMe 
                      ? { backgroundColor: 'rgba(234, 179, 8, 0.2)', border: '2px solid rgba(234, 179, 8, 0.5)' }
                      : { backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }
                    }
                  >
                    <div
                      className="w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center text-xl md:text-2xl font-bold shadow-lg"
                      style={{ backgroundColor: PLAYER_COLORS[index], color: '#FFFFFF' }}
                    >
                      {player.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-lg truncate">
                        {player.name}
                        {isMe && <span className="ml-2 text-sm" style={{ color: '#FACC15' }}>(You)</span>}
                      </p>
                      {index === 0 && <p className="text-sm" style={{ color: '#FACC15' }}>👑 Host</p>}
                    </div>
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ 
                        backgroundColor: player.isConnected ? '#22C55E' : '#6B7280',
                        animation: player.isConnected ? 'pulse-animation 1.5s infinite' : 'none'
                      }} 
                    />
                  </div>
                );
              })}

              {/* Empty Slots */}
              {Array.from({ length: 5 - (gameState?.players.length || 0) }).map((_, i) => (
                <div 
                  key={`empty-${i}`} 
                  className="flex items-center gap-4 p-4 rounded-xl"
                  style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '2px dashed rgba(255,255,255,0.2)' }}
                >
                  <div 
                    className="w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center text-xl"
                    style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: '#6B7280' }}
                  >
                    ?
                  </div>
                  <p style={{ color: '#6B7280' }}>Waiting...</p>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="mt-6 space-y-3">
              {isHost ? (
                <button
                  onClick={startGame}
                  disabled={!canStart}
                  className={`w-full py-5 text-xl md:text-2xl font-black rounded-xl transition-all ${canStart ? 'btn-success animate-pulse-glow' : ''}`}
                  style={!canStart ? { backgroundColor: '#374151', color: '#9CA3AF', cursor: 'not-allowed' } : {}}
                >
                  {canStart ? '🎮 START GAME' : `⏳ Need ${playersNeeded} more player${playersNeeded > 1 ? 's' : ''}`}
                </button>
              ) : (
                <div 
                  className="w-full py-5 text-center rounded-xl"
                  style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                >
                  <p className="text-lg" style={{ color: '#9CA3AF' }}>⏳ Waiting for host to start...</p>
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


