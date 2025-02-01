import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Send, Loader2, PanelLeftClose, PanelLeft } from 'lucide-react';
import { Chat, Message, Settings as SettingsType } from './types';
import { ChatMessage } from './components/ChatMessage';
import { Sidebar } from './components/Sidebar';
import { Settings } from './components/Settings';
import { WelcomeScreen } from './components/WelcomeScreen';
import { saveChats, loadChats, saveSettings, loadSettings, getChatStats } from './utils/storage';
import { getAIResponse } from './utils/ai';

function App() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState<SettingsType>(loadSettings());
  const [showSettings, setShowSettings] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [editingMessageIndex, setEditingMessageIndex] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Load chats from localStorage on initial render
  useEffect(() => {
    const savedChats = loadChats();
    setChats(savedChats);
  }, []);

  // Save chats to localStorage whenever they change
  useEffect(() => {
    if (chats.length > 0) {
      saveChats(chats);
    }
  }, [chats]);

  useEffect(() => {
    saveSettings(settings);
    document.documentElement.classList.toggle('dark', settings.theme === 'dark');
  }, [settings]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedChat?.messages]);

  // Focus input when loading state changes
  useEffect(() => {
    if (!isLoading && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isLoading]);

  const createNewChat = useCallback(() => {
    const newChat: Chat = {
      id: Date.now().toString(),
      title: 'New Chat',
      messages: [],
      lastUpdated: new Date(),
    };
    setChats(prevChats => [newChat, ...prevChats]);
    setSelectedChat(newChat);
    setTimeout(() => inputRef.current?.focus(), 0);
  }, []);

  const deleteChat = useCallback((chatId: string) => {
    setChats(prevChats => {
      const newChats = prevChats.filter(chat => chat.id !== chatId);
      if (selectedChat?.id === chatId) {
        setSelectedChat(newChats.length > 0 ? newChats[0] : null);
      }
      return newChats;
    });
  }, [selectedChat]);

  const renameChat = useCallback((chatId: string, newTitle: string) => {
    setChats(prevChats => 
      prevChats.map(chat => 
        chat.id === chatId ? { ...chat, title: newTitle } : chat
      )
    );
  }, []);

  const handleEditMessage = (index: number) => {
    if (selectedChat && index < selectedChat.messages.length) {
      const message = selectedChat.messages[index];
      setInput(message.content);
      setEditingMessageIndex(index);
      inputRef.current?.focus();
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    let currentChat = selectedChat;
    if (!currentChat) {
      currentChat = {
        id: Date.now().toString(),
        title: input.slice(0, 30) + '...',
        messages: [],
        lastUpdated: new Date(),
      };
      setChats(prevChats => [currentChat!, ...prevChats]);
      setSelectedChat(currentChat);
    }

    let updatedMessages = [...currentChat.messages];
    if (editingMessageIndex !== null) {
      updatedMessages = updatedMessages.slice(0, editingMessageIndex);
    }

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    updatedMessages.push(userMessage);

    const updatedChat = {
      ...currentChat,
      messages: updatedMessages,
      lastUpdated: new Date(),
    };

    setSelectedChat(updatedChat);
    setChats(prevChats => 
      prevChats.map(c => c.id === updatedChat.id ? updatedChat : c)
    );
    setInput('');
    setEditingMessageIndex(null);
    setIsLoading(true);

    try {
      const aiResponse = await getAIResponse(
        updatedMessages.map(({ role, content }) => ({ role, content }))
      );

      const aiMessage: Message = {
        role: 'assistant',
        content: aiResponse.content,
        timestamp: new Date(),
        thinking: aiResponse.thinking,
        thinkingTime: aiResponse.thinkingTime,
      };

      const finalChat = {
        ...updatedChat,
        messages: [...updatedMessages, aiMessage],
        lastUpdated: new Date(),
      };

      setSelectedChat(finalChat);
      setChats(prevChats => 
        prevChats.map(c => c.id === finalChat.id ? finalChat : c)
      );
    } catch (error) {
      console.error('Error getting AI response:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className={`flex h-screen ${
      settings.theme === 'light' ? 'bg-white' : 'bg-gray-900'
    } ${
      settings.fontSize === 'small' ? 'text-sm' :
      settings.fontSize === 'large' ? 'text-lg' : 'text-base'
    }`}>
      <div className={`transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-0'}`}>
        {isSidebarOpen && (
          <Sidebar
            chats={chats}
            selectedChat={selectedChat}
            onSelectChat={setSelectedChat}
            onNewChat={createNewChat}
            onOpenSettings={() => setShowSettings(true)}
            onDeleteChat={deleteChat}
            onRenameChat={renameChat}
            theme={settings.theme}
          />
        )}
      </div>

      <div className="flex-1 flex flex-col">
        <div className={`p-4 border-b ${settings.theme === 'light' ? 'border-gray-200 bg-white' : 'border-gray-800 bg-gray-900'} flex items-center`}>
          <button
            onClick={toggleSidebar}
            className={`p-2 rounded-lg transition-colors ${
              settings.theme === 'light' 
                ? 'text-gray-700 hover:bg-gray-100' 
                : 'text-gray-300 hover:bg-gray-800'
            }`}
          >
            {isSidebarOpen ? <PanelLeftClose size={20} /> : <PanelLeft size={20} />}
          </button>
        </div>

        {selectedChat ? (
          <>
            <div className="flex-1 overflow-y-auto">
              {selectedChat.messages.length === 0 ? (
                <WelcomeScreen stats={getChatStats()} onNewChat={createNewChat} theme={settings.theme} />
              ) : (
                <div className="space-y-4">
                  {selectedChat.messages.map((message, index) => (
                    <ChatMessage
                      key={index}
                      message={message}
                      showTimestamp={settings.showTimestamps}
                      onEdit={() => handleEditMessage(index)}
                      isEditing={editingMessageIndex === index}
                      theme={settings.theme}
                    />
                  ))}
                  {isLoading && (
                    <div className={`flex items-center gap-3 p-4 ${
                      settings.theme === 'light' ? 'bg-gray-100' : 'bg-gray-800'
                    }`}>
                      <Loader2 
                        className={`animate-spin ${
                          settings.theme === 'light' ? 'text-gray-900' : 'text-white'
                        }`} 
                        size={20} 
                      />
                      <span className={settings.theme === 'light' ? 'text-gray-700' : 'text-gray-300'}>
                        AI is thinking...
                      </span>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            <div className={`border-t p-4 ${
              settings.theme === 'light' ? 'border-gray-200' : 'border-gray-800'
            }`}>
              <div className="max-w-4xl mx-auto relative">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={editingMessageIndex !== null ? "Edit your message..." : "Type your message..."}
                  className={`w-full rounded-lg pl-4 pr-12 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none ${
                    settings.theme === 'light'
                      ? 'bg-gray-100 text-gray-900 placeholder-gray-500'
                      : 'bg-gray-800 text-white placeholder-gray-400'
                  }`}
                  rows={3}
                  disabled={isLoading}
                  autoFocus
                />
                <button
                  onClick={handleSend}
                  disabled={isLoading || !input.trim()}
                  className="absolute right-3 bottom-3 p-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    <Send size={20} />
                  )}
                </button>
              </div>
            </div>
          </>
        ) : (
          <WelcomeScreen stats={getChatStats()} onNewChat={createNewChat} theme={settings.theme} />
        )}
      </div>

      {showSettings && (
        <Settings
          settings={settings}
          onUpdate={setSettings}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}

export default App;