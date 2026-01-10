interface ErrorToastProps {
  message: string;
  onClose: () => void;
}

export function ErrorToast({ message, onClose }: ErrorToastProps) {
  const isWin = message.includes('wins') || message.includes('🎉');
  
  return (
    <div className="fixed top-4 left-4 right-4 z-[200] animate-fade-in">
      <div className={`max-w-md mx-auto rounded-xl shadow-2xl p-4 flex items-center gap-3 ${
        isWin 
          ? 'bg-gradient-to-r from-yellow-500 to-amber-500 text-black' 
          : 'bg-red-600 text-white'
      }`}>
        <span className="text-2xl">{isWin ? '🎉' : '⚠️'}</span>
        <p className="flex-1 font-semibold">{message}</p>
        <button onClick={onClose} className="p-1 rounded-lg hover:bg-black/20 transition-colors text-xl">
          ✕
        </button>
      </div>
    </div>
  );
}
