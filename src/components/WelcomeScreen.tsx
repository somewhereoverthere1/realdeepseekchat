import React from 'react';
import { MessageSquare, Clock, BarChart } from 'lucide-react';
import { ChatStats } from '../types';

interface Props {
  stats: ChatStats;
  onNewChat: () => void;
  theme?: 'light' | 'dark';
}

export const WelcomeScreen: React.FC<Props> = ({ stats, onNewChat, theme = 'dark' }) => {
  const isLight = theme === 'light';

  return (
    <div className={`h-full flex flex-col items-center justify-center ${
      isLight ? 'text-gray-600' : 'text-gray-300'
    }`}>
      <h1 className={`text-3xl font-bold mb-8 ${
        isLight ? 'text-gray-900' : 'text-white'
      }`}>Welcome to AI Chat</h1>
      
      <div className="grid grid-cols-3 gap-8 mb-12">
        <div className="text-center">
          <div className="mb-2">
            <MessageSquare size={32} className="mx-auto text-blue-500" />
          </div>
          <div className={`text-2xl font-bold ${
            isLight ? 'text-gray-900' : 'text-white'
          }`}>{stats.totalChats}</div>
          <div className="text-sm">Total Chats</div>
        </div>
        
        <div className="text-center">
          <div className="mb-2">
            <BarChart size={32} className="mx-auto text-green-500" />
          </div>
          <div className={`text-2xl font-bold ${
            isLight ? 'text-gray-900' : 'text-white'
          }`}>{stats.totalMessages}</div>
          <div className="text-sm">Total Messages</div>
        </div>
        
        <div className="text-center">
          <div className="mb-2">
            <Clock size={32} className="mx-auto text-purple-500" />
          </div>
          <div className={`text-2xl font-bold ${
            isLight ? 'text-gray-900' : 'text-white'
          }`}>{stats.averageResponseTime}ms</div>
          <div className="text-sm">Avg Response Time</div>
        </div>
      </div>

      <button
        onClick={onNewChat}
        className="bg-blue-600 text-white rounded-lg px-6 py-3 flex items-center gap-2 hover:bg-blue-700 transition-colors"
      >
        <MessageSquare size={20} />
        Start New Chat
      </button>
    </div>
  );
};