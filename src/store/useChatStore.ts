import { create } from 'zustand';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  model?: string;
  createdAt: Date;
}

interface ChatState {
  messages: Message[];
  isLoading: boolean;
  activeModel: string;
  currentChatId: string | null;
  addMessage: (message: Message) => void;
  setMessages: (messages: Message[]) => void;
  setLoading: (loading: boolean) => void;
  setActiveModel: (model: string) => void;
  setCurrentChatId: (id: string | null) => void;
  clearMessages: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  isLoading: false,
  activeModel: 'gemini-1.5-pro',
  currentChatId: null,
  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
  setMessages: (messages) => set({ messages }),
  setLoading: (loading) => set({ isLoading: loading }),
  setActiveModel: (model) => set({ activeModel: model }),
  setCurrentChatId: (id) => set({ currentChatId: id }),
  clearMessages: () => set({ messages: [] }),
}));
