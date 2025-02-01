import React from 'react';
import { Search, Plus, Settings as SettingsIcon, Edit2, Trash2 } from 'lucide-react';
import { Chat } from '../types';

interface Props {
  chats: Chat[];
  selectedChat: Chat | null;
  onSelectChat: (chat: Chat) => void;
  onNewChat: () => void;
  onOpenSettings: () => void;
  onDeleteChat: (chatId: string) => void;
  onRenameChat: (chatId: string, newTitle: string) => void;
  theme: 'light' | 'dark';
}

export const Sidebar: React.FC<Props> = ({
  chats,
  selectedChat,
  onSelectChat,
  onNewChat,
  onOpenSettings,
  onDeleteChat,
  onRenameChat,
  theme,
}) => {
  const [search, setSearch] = React.useState('');
  const [editingChatId, setEditingChatId] = React.useState<string | null>(null);
  const [editTitle, setEditTitle] = React.useState('');

  const isLight = theme === 'light';

  const filteredChats = chats.filter(
    (chat) =>
      chat.title.toLowerCase().includes(search.toLowerCase()) ||
      chat.messages.some((m) =>
        m.content.toLowerCase().includes(search.toLowerCase())
      )
  );

  const handleStartEdit = (chat: Chat) => {
    setEditingChatId(chat.id);
    setEditTitle(chat.title);
  };

  const handleSaveEdit = () => {
    if (editingChatId && editTitle.trim()) {
      onRenameChat(editingChatId, editTitle.trim());
      setEditingChatId(null);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      setEditingChatId(null);
    }
  };

  return (
    <div className={`w-64 h-screen flex flex-col ${
      isLight ? 'bg-gray-50' : 'bg-gray-900'
    }`}>
      <div className="p-4">
        <button
          onClick={onNewChat}
          className="w-full bg-blue-600 text-white rounded-lg p-2 flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          New Chat
        </button>
      </div>

      <div className="px-4 mb-4">
        <div className="relative">
          <Search
            size={20}
            className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
              isLight ? 'text-gray-500' : 'text-gray-400'
            }`}
          />
          <input
            type="text"
            placeholder="Search chats..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`w-full rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600 ${
              isLight 
                ? 'bg-white text-gray-900 placeholder-gray-500'
                : 'bg-gray-800 text-white placeholder-gray-400'
            }`}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2">
        {filteredChats.map((chat) => (
          <div
            key={chat.id}
            className={`group relative rounded-lg mb-1 transition-colors ${
              selectedChat?.id === chat.id
                ? isLight ? 'bg-gray-200' : 'bg-gray-800'
                : isLight ? 'hover:bg-gray-100' : 'hover:bg-gray-800'
            }`}
          >
            {editingChatId === chat.id ? (
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onBlur={handleSaveEdit}
                onKeyDown={handleKeyPress}
                className={`w-full p-3 bg-transparent focus:outline-none ${
                  isLight ? 'text-gray-900' : 'text-white'
                }`}
                autoFocus
              />
            ) : (
              <button
                onClick={() => onSelectChat(chat)}
                className="w-full text-left p-3"
              >
                <div className={`font-medium ${
                  isLight ? 'text-gray-900' : 'text-white'
                } truncate`}>{chat.title}</div>
                <div className={`text-sm ${
                  isLight ? 'text-gray-600' : 'text-gray-400'
                } truncate`}>
                  {chat.messages[chat.messages.length - 1]?.content}
                </div>
              </button>
            )}
            <div className="absolute right-2 top-3 hidden group-hover:flex gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleStartEdit(chat);
                }}
                className={`p-1 transition-colors ${
                  isLight 
                    ? 'text-gray-500 hover:text-gray-900' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Edit2 size={16} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (window.confirm('Are you sure you want to delete this chat?')) {
                    onDeleteChat(chat.id);
                  }
                }}
                className="p-1 text-gray-400 hover:text-red-400 transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className={`p-4 border-t ${
        isLight ? 'border-gray-200' : 'border-gray-800'
      }`}>
        <button
          onClick={onOpenSettings}
          className={`w-full flex items-center gap-2 transition-colors ${
            isLight 
              ? 'text-gray-700 hover:text-gray-900' 
              : 'text-gray-300 hover:text-white'
          }`}
        >
          <SettingsIcon size={20} />
          Settings
        </button>
      </div>
    </div>
  );
};