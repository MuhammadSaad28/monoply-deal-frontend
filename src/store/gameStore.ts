import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';
import { 
  GameState, Player, ChatMessage, PropertyColor,
  PlayCardTarget, ActionResponse, ServerToClientEvents, ClientToServerEvents 
} from '../types/game';

interface GameStore {
  // Connection
  socket: Socket<ServerToClientEvents, ClientToServerEvents> | null;
  isConnected: boolean;
  
  // Player
  playerId: string | null;
  playerName: string;
  
  // Room
  roomCode: string | null;
  
  // Game
  gameState: GameState | null;
  chatMessages: ChatMessage[];
  
  // UI State
  error: string | null;
  isLoading: boolean;
  selectedCards: string[];
  
  // Actions
  connect: () => void;
  disconnect: () => void;
  setPlayerName: (name: string) => void;
  createRoom: (playerName: string) => Promise<string | null>;
  joinRoom: (roomCode: string, playerName: string) => Promise<boolean>;
  startGame: () => void;
  drawCards: () => void;
  playCard: (cardId: string, target?: PlayCardTarget) => void;
  discardCards: (cardIds: string[]) => void;
  endTurn: () => void;
  respondToAction: (response: ActionResponse) => void;
  rearrangeProperty: (cardId: string, fromColor: PropertyColor, toColor: PropertyColor) => void;
  sendChat: (message: string) => void;
  leaveRoom: () => void;
  toggleCardSelection: (cardId: string) => void;
  clearSelectedCards: () => void;
  clearError: () => void;
}

const SOCKET_URL = 'https://monoply-deal-backend-production.up.railway.app';

export const useGameStore = create<GameStore>((set, get) => ({
  socket: null,
  isConnected: false,
  playerId: null,
  playerName: '',
  roomCode: null,
  gameState: null,
  chatMessages: [],
  error: null,
  isLoading: false,
  selectedCards: [],

  connect: () => {
    const { socket } = get();
    if (socket?.connected) return;

    const newSocket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    newSocket.on('connect', () => {
      console.log('Connected to server');
      set({ isConnected: true });
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server');
      set({ isConnected: false });
    });

    newSocket.on('gameState', (state: GameState) => {
      const { playerName } = get();
      
      // Find our player by name (works in waiting room and during game)
      let myPlayer = state.players.find(p => p.name === playerName);
      
      // Fallback: find by hand visibility (during game)
      if (!myPlayer) {
        myPlayer = state.players.find(p => p.hand.some(c => c.id !== 'hidden'));
      }
      
      console.log('Game state received, my player:', myPlayer?.name, myPlayer?.id);
      
      set({ 
        gameState: state,
        playerId: myPlayer?.id || get().playerId
      });
    });

    newSocket.on('chatMessage', (message: ChatMessage) => {
      set(state => ({
        chatMessages: [...state.chatMessages, message]
      }));
    });

    newSocket.on('error', (message: string) => {
      set({ error: message });
      setTimeout(() => set({ error: null }), 5000);
    });

    newSocket.on('playerJoined', (player: Player) => {
      console.log('Player joined:', player.name);
    });

    newSocket.on('playerLeft', (playerId: string) => {
      console.log('Player left:', playerId);
    });

    newSocket.on('gameOver', (_winnerId: string, winnerName: string) => {
      set({ 
        error: `🎉 ${winnerName} wins the game!`
      });
    });

    set({ socket: newSocket });
  },

  disconnect: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ 
        socket: null, 
        isConnected: false,
        gameState: null,
        roomCode: null,
        chatMessages: [],
        playerId: null,
        playerName: ''
      });
    }
  },

  setPlayerName: (name: string) => set({ playerName: name }),

  createRoom: async (playerName: string) => {
    const { socket } = get();
    if (!socket) return null;

    set({ isLoading: true, playerName });

    return new Promise((resolve) => {
      socket.emit('createRoom', playerName, (response) => {
        set({ isLoading: false });
        if (response.roomCode) {
          set({ 
            roomCode: response.roomCode,
            playerName
          });
          resolve(response.roomCode);
        } else {
          set({ error: response.error || 'Failed to create room' });
          resolve(null);
        }
      });
    });
  },

  joinRoom: async (roomCode: string, playerName: string) => {
    const { socket } = get();
    if (!socket) return false;

    set({ isLoading: true, playerName });

    return new Promise((resolve) => {
      socket.emit('joinRoom', roomCode, playerName, (response) => {
        set({ isLoading: false });
        if (response.success) {
          set({ 
            roomCode: roomCode.toUpperCase(),
            playerName
          });
          resolve(true);
        } else {
          set({ error: response.error || 'Failed to join room' });
          resolve(false);
        }
      });
    });
  },

  startGame: () => {
    const { socket } = get();
    console.log('Starting game...');
    socket?.emit('startGame');
  },

  drawCards: () => {
    const { socket } = get();
    socket?.emit('drawCards');
  },

  playCard: (cardId: string, target?: PlayCardTarget) => {
    const { socket } = get();
    socket?.emit('playCard', cardId, target);
    set({ selectedCards: [] });
  },

  discardCards: (cardIds: string[]) => {
    const { socket } = get();
    socket?.emit('discardCards', cardIds);
    set({ selectedCards: [] });
  },

  endTurn: () => {
    const { socket } = get();
    socket?.emit('endTurn');
  },

  respondToAction: (response: ActionResponse) => {
    const { socket } = get();
    socket?.emit('respondToAction', response);
  },

  rearrangeProperty: (cardId: string, fromColor: PropertyColor, toColor: PropertyColor) => {
    const { socket } = get();
    socket?.emit('rearrangeProperty', cardId, fromColor, toColor);
  },

  sendChat: (message: string) => {
    const { socket } = get();
    if (message.trim()) {
      socket?.emit('sendChat', message.trim());
    }
  },

  leaveRoom: () => {
    const { socket } = get();
    socket?.emit('leaveRoom');
    set({ 
      roomCode: null, 
      gameState: null, 
      chatMessages: [],
      selectedCards: [],
      playerId: null
    });
  },

  toggleCardSelection: (cardId: string) => {
    set(state => ({
      selectedCards: state.selectedCards.includes(cardId)
        ? state.selectedCards.filter(id => id !== cardId)
        : [...state.selectedCards, cardId]
    }));
  },

  clearSelectedCards: () => set({ selectedCards: [] }),

  clearError: () => set({ error: null }),
}));
