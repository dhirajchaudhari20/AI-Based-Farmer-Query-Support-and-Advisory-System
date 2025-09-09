import React, { useState, useEffect, useCallback } from 'react';
import type { Message, LanguageCode, Theme, ChatMetadata } from './types';
import Header from './components/Header';
import ContextSelector from './components/ContextSelector';
import ChatInterface from './components/ChatInterface';
import Footer from './components/Footer';
import Sidebar from './components/Sidebar';
import { getAIResponse } from './services/geminiService';
import { databaseService } from './services/databaseService';
import { KERALA_DISTRICTS, COMMON_CROPS, TRANSLATIONS } from './constants';
import { offlineService } from './services/offlineService';

const THEME_KEY = 'kissanMitraTheme';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [language, setLanguage] = useState<LanguageCode>('ml');
  const [context, setContext] = useState({
    location: KERALA_DISTRICTS[0],
    crop: COMMON_CROPS[0],
  });
  // Fix: Lazily initialize theme with validation for robustness.
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem(THEME_KEY);
    // Ensure the saved value is a valid theme before using it.
    if (savedTheme === 'light' || savedTheme === 'dark') {
      return savedTheme;
    }
    // Fallback to system preference if no valid theme is saved.
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark' : 'light';
  });
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  // New state for multi-chat database feature
  const [chats, setChats] = useState<ChatMetadata[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);


  // Effect to manage online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      offlineService.syncQueue(handleSendMessage);
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    if (isOnline) {
      offlineService.syncQueue(handleSendMessage);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []); 


  // Effect to apply theme changes to the DOM and localStorage.
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  // Simplified theme toggle handler.
  const handleToggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const loadChats = async () => {
      const chatList = await databaseService.getAllChatMetadata();
      setChats(chatList);
  };

  // Load chat history from IndexedDB on initial mount
  useEffect(() => {
    loadChats();
    // Start with a new chat session if none is active
    handleNewChat();
  }, []);

  // Set the initial welcome message when starting a new chat
  useEffect(() => {
      if (activeChatId === null) {
          setMessages([
              {
                  id: 'initial-message',
                  role: 'model',
                  text: TRANSLATIONS.initialMessage[language],
                  timestamp: new Date(),
              },
          ]);
      }
  }, [activeChatId, language]);

  const handleLanguageChange = (newLanguage: LanguageCode) => {
    setLanguage(newLanguage);
  };

  const handleSendMessage = useCallback(async (inputText: string, imageFile: File | null) => {
    if (!inputText.trim() && !imageFile) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: inputText,
      image: imageFile ? URL.createObjectURL(imageFile) : undefined,
      timestamp: new Date(),
    };
    
    const updatedMessages = activeChatId === null ? [userMessage] : [...messages, userMessage];
    setMessages(updatedMessages);

    if (!navigator.onLine) {
        await offlineService.addToQueue(inputText, imageFile);
        return;
    }

    setIsLoading(true);
    setIsStreaming(false);

    let currentChatId = activeChatId;

    // If this is the first message of a new chat, create the chat session in the DB
    if (currentChatId === null) {
        const newChatId = `chat-${Date.now()}`;
        const title = inputText.split(' ').slice(0, 5).join(' ') || 'New Chat';
        await databaseService.addOrUpdateChat({ id: newChatId, title, timestamp: new Date(), messages: [userMessage] });
        setActiveChatId(newChatId);
        currentChatId = newChatId;
        // Refresh sidebar
        loadChats(); 
    }

    try {
      const stream = await getAIResponse(inputText, imageFile, context, language);
      setIsLoading(false);
      setIsStreaming(true);

      const modelMessageId = `model-${Date.now()}`;
      const initialModelMessage: Message = {
        id: modelMessageId,
        role: 'model',
        text: '',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, initialModelMessage]);

      let aggregatedText = '';
      for await (const chunk of stream) {
        aggregatedText += chunk.text;
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === modelMessageId ? { ...msg, text: aggregatedText } : msg
          )
        );
      }
       
      // After streaming is complete, save the final state to the database
      const finalModelMessage = { ...initialModelMessage, text: aggregatedText };
      const finalMessages = [...updatedMessages, finalModelMessage];
      const chatToSave = await databaseService.getChat(currentChatId!);
      if(chatToSave){
          chatToSave.messages = finalMessages;
          await databaseService.addOrUpdateChat(chatToSave);
      }

    } catch (error) {
      console.error(error);
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: 'model',
        text: TRANSLATIONS.errorMessage[language],
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
    }
  }, [context, language, messages, activeChatId]);

  const handleNewChat = () => {
    setActiveChatId(null);
    setMessages([]); // Will be populated by useEffect
    if (window.innerWidth <= 768) {
        setIsSidebarOpen(false);
    }
  };

  const handleSelectChat = async (id: string) => {
      const chat = await databaseService.getChat(id);
      if (chat) {
          setActiveChatId(chat.id);
          setMessages(chat.messages);
      }
      if (window.innerWidth <= 768) {
          setIsSidebarOpen(false);
      }
  };

  const handleDeleteChat = async (id: string) => {
      if (window.confirm("Are you sure you want to delete this chat?")) {
          await databaseService.deleteChat(id);
          if (activeChatId === id) {
              handleNewChat();
          }
          loadChats();
      }
  };
  
  const isNewChat = activeChatId === null;

  return (
    <div className="flex h-screen text-gray-800 dark:text-gray-200">
      <Sidebar 
          isOpen={isSidebarOpen}
          chats={chats}
          activeChatId={activeChatId}
          onNewChat={handleNewChat}
          onSelectChat={handleSelectChat}
          onDeleteChat={handleDeleteChat}
          language={language}
      />
      <div className="flex flex-col flex-1 h-screen">
        <Header 
          language={language} 
          onLanguageChange={handleLanguageChange}
          theme={theme}
          onToggleTheme={handleToggleTheme}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />
        <main className="flex-1 flex flex-col max-w-4xl w-full mx-auto p-4 overflow-hidden">
          {!isOnline && (
              <div className="bg-yellow-500/20 border border-yellow-600/30 text-yellow-800 dark:text-yellow-200 text-sm rounded-lg p-3 mb-4 text-center">
                  You are currently offline. Messages will be sent when you reconnect.
              </div>
          )}
          <ContextSelector
            location={context.location}
            crop={context.crop}
            onLocationChange={(loc) => setContext((prev) => ({ ...prev, location: loc }))}
            onCropChange={(crp) => setContext((prev) => ({ ...prev, crop: crp }))}
            language={language}
          />
          <ChatInterface
            messages={messages}
            isLoading={isLoading}
            isStreaming={isStreaming}
            onSendMessage={handleSendMessage}
            language={language}
            isNewChat={isNewChat}
            isOnline={isOnline}
          />
        </main>
        <Footer language={language} />
      </div>
    </div>
  );
};

export default App;