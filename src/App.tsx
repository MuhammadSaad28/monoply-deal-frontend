import { useEffect } from 'react';
import { useGameStore } from './store/gameStore';
import { LobbyScreen } from './components/LobbyScreen';
import { WaitingRoom } from './components/WaitingRoom';
import { GameBoard } from './components/GameBoard';
import { ErrorToast } from './components/ErrorToast';

function App() {
  const { connect, isConnected, roomCode, gameState, error, clearError } = useGameStore();

  useEffect(() => {
    connect();
  }, [connect]);

  const renderScreen = () => {
    if (!roomCode) return <LobbyScreen />;
    if (gameState?.phase === 'waiting') return <WaitingRoom />;
    if (gameState?.phase === 'playing' || gameState?.phase === 'finished') return <GameBoard />;
    
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl animate-bounce mb-4">🎴</div>
          <p className="text-gray-400 text-lg">Loading game...</p>
        </div>
      </div>
    );
  };

  return (
    <>
      {!isConnected && (
        <div className="fixed top-0 left-0 right-0 bg-red-600 text-white text-center py-3 z-[100] font-semibold">
          ⚠️ Connecting to server...
        </div>
      )}
      {renderScreen()}
      {error && <ErrorToast message={error} onClose={clearError} />}
    </>
  );
}

export default App;
