import { useState, useRef, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';

export function ChatPanel() {
  const { chatMessages, sendChat, playerId, playerName } = useGameStore();
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'chat' | 'logs'>('chat');
  const [unreadChat, setUnreadChat] = useState(0);
  const [unreadLogs, setUnreadLogs] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const prevMessageCount = useRef(chatMessages.length);

  // Separate messages into chat and logs
  const chatOnly = chatMessages.filter(m => m.type !== 'system' && m.playerId !== 'game');
  const logsOnly = chatMessages.filter(m => m.type === 'system' || m.playerId === 'game');

  // Play notification sound for new chat messages
  useEffect(() => {
    if (chatMessages.length > prevMessageCount.current) {
      const newMessages = chatMessages.slice(prevMessageCount.current);
      const hasNewChat = newMessages.some(m => m.type !== 'system' && m.playerId !== 'game' && m.playerId !== playerId && m.playerName !== playerName);
      const hasNewLogs = newMessages.some(m => m.type === 'system' || m.playerId === 'game');
      
      if (hasNewChat) {
        // Play notification sound
        try {
          const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleQYAQKPd7qJlAQBBqODxnF0AAEKs4/OYVwAARK/l9JRRAQBGsuf1kEsBAEi06PaLRQEASrXp94dAAQBMt+r4gz0BAE647PmAOgEAULrt+n03AQBSu+77fDQBAFS87/x5MgEAVr3w/XYwAQBYvvH+dC4BAFq/8v9yLAEAXMDzAHAqAQBewfQBbigBAGDC9QJsJgEAYsP2A2okAQBkxPcEaCIBAGbF+AVmIAEAaMb5BmQeAQBqx/oHYhwBAGzI+whhGgEAbsn8CV8YAQBwyvwKXRYBAHLL/QtbFAEAdMz+DFkSAQB2zf8NVxABAHjOAA5VDgEAes8BD1MMAQAAAAAAAAAAAHrPAQ9TDAEAeM4ADlUOAQB2zf8NVxABAHTM/gxZEgEAcsv9C1sUAQBwyvwKXRYBAG7J/AlfGAEAbMj7CGEaAQBqx/oHYhwBAGjG+QZkHgEAZsX4BWYgAQBkxPcEaCIBAGLD9gNqJAEAYML1AmwmAQBewfQBbigBAFzA8wBwKgEAWr/y/3IsAQBYvvH+dC4BAFY98P12MAEAVLzv/HkyAQBSu+77fDQBAFC67fp9NwEATrjs+YA6AQBMt+r4gz0BAEq16feHQAEASLTo9otFAQBGsuf1kEsBAESv5fSUUQEAQqzj85hXAABBqODxnF0AAD+a2teleQYAOJPU3YF/EQAAAAAAAAAAADiT1N2BfxEAP5rZ16V5BgBBqODxnF0AAEKs4/OYVwAARK/l9JRRAQBGsuf1kEsBAEi06PaLRQEASrXp94dAAQBMt+r4gz0BAE647PmAOgEAULrt+n03AQBSu+77fDQBAFS87/x5MgEAVr3w/XYwAQBYvvH+dC4BAFq/8v9yLAEAXMDzAHAqAQBewfQBbigBAGDC9QJsJgEAYsP2A2okAQBkxPcEaCIBAGbF+AVmIAEAaMb5BmQeAQBqx/oHYhwBAGzI+whhGgEAbsn8CV8YAQBwyvwKXRYBAHLL/QtbFAEAdMz+DFkSAQB2zf8NVxABAHjOAA5VDgEAes8BD1MMAQAAAAAAAAAAAHrPAQ9TDAEAeM4ADlUOAQB2zf8NVxABAHTM/gxZEgEAcsv9C1sUAQBwyvwKXRYBAG7J/AlfGAEAbMj7CGEaAQBqx/oHYhwBAGjG+QZkHgEAZsX4BWYgAQBkxPcEaCIBAGLD9gNqJAEAYML1AmwmAQBewfQBbigBAFzA8wBwKgEAWr/y/3IsAQBYvvH+dC4BAFY98P12MAEAVLzv/HkyAQBSu+77fDQBAFC67fp9NwEATrjs+YA6AQBMt+r4gz0BAEq16feHQAEASLTo9otFAQBGsuf1kEsBAESv5fSUUQEAQqzj85hXAABBqODxnF0AAD+a2teleQYAOJPU3YF/EQAAAAAAAAAAAAA=');
          audio.volume = 0.3;
          audio.play().catch(() => {});
        } catch {}
        
        if (activeTab !== 'chat') {
          setUnreadChat(prev => prev + newMessages.filter(m => m.type !== 'system' && m.playerId !== 'game').length);
        }
      }
      
      if (hasNewLogs && activeTab !== 'logs') {
        setUnreadLogs(prev => prev + newMessages.filter(m => m.type === 'system' || m.playerId === 'game').length);
      }
    }
    prevMessageCount.current = chatMessages.length;
  }, [chatMessages, activeTab, playerId, playerName]);

  // Clear unread when switching tabs
  useEffect(() => {
    if (activeTab === 'chat') setUnreadChat(0);
    if (activeTab === 'logs') setUnreadLogs(0);
  }, [activeTab]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, activeTab]);

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

  const displayMessages = activeTab === 'chat' ? chatOnly : logsOnly;

  return (
    <div className="flex flex-col h-full">
      {/* Tabs */}
      <div className="flex mb-3 bg-[#FFFFFF]/5 rounded-lg p-1">
        <button
          onClick={() => setActiveTab('chat')}
          className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all relative ${
            activeTab === 'chat' ? 'bg-[#EAB308] text-[#000000]' : 'text-[#9CA3AF] hover:text-[#FFFFFF]'
          }`}
        >
          💬 Chat
          {unreadChat > 0 && (
            <span className="absolute -top-1 -right-1 bg-[#EF4444] text-[#FFFFFF] text-xs w-5 h-5 rounded-full flex items-center justify-center animate-pulse">
              {unreadChat > 9 ? '9+' : unreadChat}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all relative ${
            activeTab === 'logs' ? 'bg-[#A855F7] text-[#FFFFFF]' : 'text-[#9CA3AF] hover:text-[#FFFFFF]'
          }`}
        >
          📋 Game Logs
          {unreadLogs > 0 && (
            <span className="absolute -top-1 -right-1 bg-[#EF4444] text-[#FFFFFF] text-xs w-5 h-5 rounded-full flex items-center justify-center">
              {unreadLogs > 9 ? '9+' : unreadLogs}
            </span>
          )}
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-2 mb-3 pr-1">
        {displayMessages.length === 0 && (
          <p className="text-[#6B7280] text-sm text-center py-8">
            {activeTab === 'chat' ? 'No messages yet' : 'No game logs yet'}
          </p>
        )}
        
        {displayMessages.map((msg) => {
          const isMe = msg.playerId === playerId || msg.playerName === playerName;
          const isSystem = msg.type === 'system';
          const isGameLog = msg.playerId === 'game';
          
          return (
            <div key={msg.id} className={`${isSystem || isGameLog ? 'text-center' : isMe ? 'text-right' : 'text-left'}`}>
              {isGameLog ? (
                <div 
                  className="inline-block border px-3 py-1.5 rounded-lg"
                  style={{ 
                    background: 'linear-gradient(to right, rgba(168, 85, 247, 0.2), rgba(59, 130, 246, 0.2))',
                    borderColor: 'rgba(168, 85, 247, 0.3)'
                  }}
                >
                  <span className="text-sm" style={{ color: '#E9D5FF' }}>{msg.message}</span>
                </div>
              ) : isSystem ? (
                <span className="text-xs text-[#6B7280] italic bg-[#FFFFFF]/5 px-3 py-1 rounded-full">
                  {msg.message}
                </span>
              ) : (
                <div 
                  className="inline-block max-w-[85%] rounded-2xl px-4 py-2"
                  style={isMe 
                    ? { backgroundColor: 'rgba(234, 179, 8, 0.2)', color: '#FEF3C7' }
                    : { backgroundColor: 'rgba(255, 255, 255, 0.1)', color: '#FFFFFF' }
                  }
                >
                  {!isMe && <p className="text-xs text-[#9CA3AF] mb-1">{msg.playerName}</p>}
                  <p className="text-sm break-words">{msg.message}</p>
                </div>
              )}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input - only show for chat tab */}
      {activeTab === 'chat' && (
        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            maxLength={200}
            className="flex-1 px-4 py-3 bg-[#FFFFFF]/5 border border-[#FFFFFF]/10 rounded-xl text-[#FFFFFF] text-sm placeholder-[#6B7280] focus:outline-none focus:border-[#FACC15]"
          />
          <button
            onClick={handleSend}
            disabled={!message.trim()}
            className="px-4 py-3 bg-[#EAB308] hover:bg-[#FACC15] disabled:bg-[#4B5563] text-[#000000] font-bold rounded-xl transition-all"
          >
            Send
          </button>
        </div>
      )}
    </div>
  );
}


