interface ErrorToastProps {
  message: string;
  onClose: () => void;
}

export function ErrorToast({ message, onClose }: ErrorToastProps) {
  const isWin = message.includes('wins') || message.includes('🎉');
  
  return (
    <div className="fixed top-4 left-4 right-4 z-[200] animate-fade-in">
      <div 
        className="max-w-md mx-auto rounded-xl shadow-2xl p-4 flex items-center gap-3"
        style={isWin 
          ? { background: 'linear-gradient(to right, #FFD700, #FFB000)', color: '#000000' }
          : { backgroundColor: '#DC2626', color: '#FFFFFF' }
        }
      >
        <span className="text-2xl">{isWin ? '🎉' : '⚠️'}</span>
        <p className="flex-1 font-semibold">{message}</p>
        <button 
          onClick={onClose} 
          className="p-1 rounded-lg transition-colors text-xl"
          style={{ backgroundColor: 'rgba(0,0,0,0.1)' }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.2)'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.1)'}
        >
          ✕
        </button>
      </div>
    </div>
  );
}


