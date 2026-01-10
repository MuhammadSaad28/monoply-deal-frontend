import { useState, useRef, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';

export function ChatPanel() {
  const { chatMessages, sendChat, playerId, playerName } = useGameStore();
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSend = () => {
    if (message.trim()) {
      sendChat(message);
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-2 mb-3 pr-1">
        {chatMessages.length === 0 && (
          <p className="text-gray-500 text-sm text-center py-8">No messages yet</p>
        )}
        
        {chatMessages.map((msg) => {
          const isMe = msg.playerId === playerId || msg.playerName === playerName;
          const isSystem = msg.type === 'system';
          const isGameLog = msg.playerId === 'game';
          
          return (
            <div key={msg.id} className={`${isSystem || isGameLog ? 'text-center' : isMe ? 'text-right' : 'text-left'}`}>
              {isGameLog ? (
                // Game action logs - styled differently
                <div className="inline-block bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 px-3 py-1.5 rounded-lg">
                  <span className="text-sm text-purple-200">{msg.message}</span>
                </div>
              ) : isSystem ? (
                // System messages (join/leave)
                <span className="text-xs text-gray-500 italic bg-white/5 px-3 py-1 rounded-full">
                  {msg.message}
                </span>
              ) : (
                // Player chat messages
                <div className={`inline-block max-w-[85%] rounded-2xl px-4 py-2 ${
                  isMe ? 'bg-yellow-500/20 text-yellow-100' : 'bg-white/10 text-white'
                }`}>
                  {!isMe && <p className="text-xs text-gray-400 mb-1">{msg.playerName}</p>}
                  <p className="text-sm break-words">{msg.message}</p>
                </div>
              )}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
          maxLength={200}
          className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:border-yellow-400"
        />
        <button
          onClick={handleSend}
          disabled={!message.trim()}
          className="px-4 py-3 bg-yellow-500 hover:bg-yellow-400 disabled:bg-gray-600 text-black font-bold rounded-xl transition-all"
        >
          Send
        </button>
      </div>
    </div>
  );
}
