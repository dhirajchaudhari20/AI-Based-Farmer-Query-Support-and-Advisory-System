import React, { useState, useEffect, useCallback } from 'react';
import type { Message, LanguageCode } from './types';
import Header from './components/Header';
import ContextSelector from './components/ContextSelector';
import ChatInterface from './components/ChatInterface';
import Footer from './components/Footer';
import { getAIResponse } from './services/geminiService';
import { KERALA_DISTRICTS, COMMON_CROPS, TRANSLATIONS } from './constants';

const CHAT_HISTORY_KEY = 'kissanMitraChatHistory';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [language, setLanguage] = useState<LanguageCode>('ml');
  const [context, setContext] = useState({
    location: KERALA_DISTRICTS[0],
    crop: COMMON_CROPS[0],
  });

  // Load chat history from localStorage on initial mount, or set the initial
  // welcome message if no history is found.
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem(CHAT_HISTORY_KEY);
      if (savedHistory) {
        const parsedMessages: Message[] = JSON.parse(savedHistory).map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp), // Re-hydrate Date objects from strings
        }));
        if (parsedMessages.length > 0) {
            setMessages(parsedMessages);
            return; // Exit if history is successfully loaded
        }
      }
    } catch (error) {
      console.error("Failed to load chat history:", error);
      localStorage.removeItem(CHAT_HISTORY_KEY); // Clear potentially corrupted data
    }

    // This part runs only if no valid history was found.
    setMessages([
      {
        id: 'initial-message',
        role: 'model',
        text: TRANSLATIONS.initialMessage[language],
        timestamp: new Date(),
      },
    ]);
  }, []); // Empty dependency array ensures this runs only once on mount

  // Save chat history to localStorage whenever the messages array changes.
  useEffect(() => {
    // We only save if it's a real conversation, not the initial placeholder message.
    if (messages.length > 1 || (messages.length === 1 && messages[0].id !== 'initial-message')) {
        try {
            localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(messages));
        } catch (error) {
            console.error("Failed to save chat history:", error);
        }
    }
  }, [messages]);

  const handleLanguageChange = (newLanguage: LanguageCode) => {
    setLanguage(newLanguage);
    // If the only message is the initial placeholder, update its text to the new language.
    setMessages(prev => {
        if (prev.length === 1 && prev[0].id === 'initial-message') {
            return [{
                ...prev[0],
                text: TRANSLATIONS.initialMessage[newLanguage],
            }];
        }
        return prev;
    });
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
    
    // Replace the initial message with the first user message to start the conversation.
    setMessages((prevMessages) => {
        const isInitialState = prevMessages.length === 1 && prevMessages[0].id === 'initial-message';
        return isInitialState ? [userMessage] : [...prevMessages, userMessage];
    });

    setIsLoading(true);

    try {
      const stream = await getAIResponse(inputText, imageFile, context, language);
      setIsLoading(false); // Stop "Thinking..." bubble as stream starts

      const modelMessageId = `model-${Date.now()}`;
      const initialModelMessage: Message = {
        id: modelMessageId,
        role: 'model',
        text: '', // Start with empty text for streaming
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
    } catch (error) {
      console.error(error);
      setIsLoading(false); // Ensure loading is off on error
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: 'model',
        text: TRANSLATIONS.errorMessage[language],
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  }, [context, language]);

  const handleClearChat = () => {
    if (window.confirm(TRANSLATIONS.clearChatConfirmation[language])) {
        try {
            localStorage.removeItem(CHAT_HISTORY_KEY);
        } catch (error) {
            console.error("Failed to clear chat history:", error);
        }
        setMessages([
            {
                id: 'initial-message',
                role: 'model',
                text: TRANSLATIONS.initialMessage[language],
                timestamp: new Date(),
            },
        ]);
    }
  };

  return (
    <div className="flex flex-col h-screen text-gray-800">
      <Header 
        language={language} 
        onLanguageChange={handleLanguageChange}
        onClearChat={handleClearChat}
      />
      <main className="flex-1 flex flex-col max-w-4xl w-full mx-auto p-4 overflow-hidden">
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
          onSendMessage={handleSendMessage}
          language={language}
        />
      </main>
      <Footer language={language} />
    </div>
  );
};

export default App;