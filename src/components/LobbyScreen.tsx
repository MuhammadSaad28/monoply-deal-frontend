import { useState } from 'react';
import { useGameStore } from '../store/gameStore';

export function LobbyScreen() {
  const { createRoom, joinRoom, isLoading, isConnected } = useGameStore();
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [mode, setMode] = useState<'menu' | 'create' | 'join'>('menu');

  const handleCreate = async () => {
    if (!playerName.trim()) return;
    await createRoom(playerName.trim());
  };

  const handleJoin = async () => {
    if (!playerName.trim() || !roomCode.trim()) return;
    await joinRoom(roomCode.trim(), playerName.trim());
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
      {/* Logo Section */}
      <div className="text-center mb-10 md:mb-16 animate-fade-in">
        <div className="relative inline-block">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight">
            <span 
              className="bg-clip-text text-transparent drop-shadow-lg"
              style={{ backgroundImage: 'linear-gradient(135deg, #FFD700 0%, #FFC000 50%, #FFB000 100%)' }}
            >
              MONOPOLY
            </span>
          </h1>
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-black text-[#FFFFFF] -mt-2">
            DEAL
          </h2>
          <div className="absolute -top-2 -right-2 md:-top-4 md:-right-4 bg-[#22C55E] text-[#FFFFFF] text-xs md:text-sm px-3 py-1 rounded-full font-bold shadow-lg transform rotate-12">
            ONLINE
          </div>
        </div>
        <p className="text-[#9CA3AF] mt-4 md:mt-6 text-base md:text-lg lg:text-xl">
          The fast-dealing property trading card game
        </p>
      </div>

      {/* Card Container */}
      <div className="w-full max-w-md lg:max-w-lg glass rounded-3xl p-6 md:p-8 lg:p-10 animate-fade-in">
        {mode === 'menu' && (
          <div className="space-y-4">
            <button
              onClick={() => setMode('create')}
              disabled={!isConnected}
              className="btn btn-primary w-full py-5 text-lg md:text-xl font-bold"
            >
              🎮 Create Room
            </button>
            <button
              onClick={() => setMode('join')}
              disabled={!isConnected}
              className="btn btn-secondary w-full py-5 text-lg md:text-xl font-bold"
            >
              🚪 Join Room
            </button>
            
            <div className="pt-6 border-t border-[#FFFFFF]/10">
              <div className="flex items-center justify-center gap-6 text-[#9CA3AF] text-sm md:text-base">
                <span>👥 2-5 Players</span>
                <span>⚡ Real-time</span>
                <span>💬 Chat</span>
              </div>
            </div>
          </div>
        )}

        {mode === 'create' && (
          <div className="space-y-5">
            <h3 className="text-2xl md:text-3xl font-bold text-center">Create Room</h3>
            <input
              type="text"
              placeholder="Your name"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              maxLength={15}
              className="input-field text-lg"
              autoFocus
            />
            <button
              onClick={handleCreate}
              disabled={!playerName.trim() || isLoading}
              className="btn btn-primary w-full py-4 text-lg font-bold"
            >
              {isLoading ? '⏳ Creating...' : '✨ Create Room'}
            </button>
            <button onClick={() => setMode('menu')} className="btn btn-secondary w-full py-3">
              ← Back
            </button>
          </div>
        )}

        {mode === 'join' && (
          <div className="space-y-5">
            <h3 className="text-2xl md:text-3xl font-bold text-center">Join Room</h3>
            <input
              type="text"
              placeholder="Your name"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              maxLength={15}
              className="input-field text-lg"
              autoFocus
            />
            <input
              type="text"
              placeholder="ROOM CODE"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              maxLength={6}
              className="input-field text-2xl md:text-3xl text-center tracking-[0.4em] font-mono font-bold uppercase"
            />
            <button
              onClick={handleJoin}
              disabled={!playerName.trim() || !roomCode.trim() || isLoading}
              className="btn btn-primary w-full py-4 text-lg font-bold"
            >
              {isLoading ? '⏳ Joining...' : '🚀 Join Room'}
            </button>
            <button onClick={() => setMode('menu')} className="btn btn-secondary w-full py-3">
              ← Back
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-8 text-center text-[#6B7280] text-sm md:text-base">
        <p>🏆 First to collect 3 complete property sets wins!</p>
      </div>
    </div>
  );
}


