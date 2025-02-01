import { Chat, Settings, ChatStats } from '../types';

const CHATS_KEY = 'ai_chats';
const SETTINGS_KEY = 'ai_settings';

export const saveChats = (chats: Chat[]) => {
  try {
    // Deep clone the chats to avoid mutating the original objects
    const serializedChats = JSON.stringify(chats.map(chat => ({
      ...chat,
      messages: chat.messages.map(msg => ({
        ...msg,
        timestamp: msg.timestamp.toISOString(),
      })),
      lastUpdated: chat.lastUpdated.toISOString(),
    })));
    localStorage.setItem(CHATS_KEY, serializedChats);
  } catch (error) {
    console.error('Error saving chats:', error);
  }
};

export const loadChats = (): Chat[] => {
  try {
    const saved = localStorage.getItem(CHATS_KEY);
    if (!saved) return [];

    return JSON.parse(saved).map((chat: any) => ({
      ...chat,
      messages: chat.messages.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp),
      })),
      lastUpdated: new Date(chat.lastUpdated),
    }));
  } catch (error) {
    console.error('Error loading chats:', error);
    return [];
  }
};

export const saveSettings = (settings: Settings) => {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving settings:', error);
  }
};

export const loadSettings = (): Settings => {
  try {
    const saved = localStorage.getItem(SETTINGS_KEY);
    if (!saved) {
      return {
        theme: 'dark',
        fontSize: 'medium',
        showTimestamps: true,
      };
    }
    return JSON.parse(saved);
  } catch (error) {
    console.error('Error loading settings:', error);
    return {
      theme: 'dark',
      fontSize: 'medium',
      showTimestamps: true,
    };
  }
};

export const getChatStats = (): ChatStats => {
  const chats = loadChats();
  const totalChats = chats.length;
  let totalMessages = 0;
  let totalResponseTime = 0;
  let responseCount = 0;

  chats.forEach(chat => {
    totalMessages += chat.messages.length;
    chat.messages.forEach(msg => {
      if (msg.role === 'assistant' && msg.thinkingTime) {
        totalResponseTime += msg.thinkingTime;
        responseCount++;
      }
    });
  });

  return {
    totalChats,
    totalMessages,
    averageResponseTime: responseCount > 0 ? Math.round(totalResponseTime / responseCount) : 0,
  };
};