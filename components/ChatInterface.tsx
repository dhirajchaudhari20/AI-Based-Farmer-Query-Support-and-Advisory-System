// Fix: Remove local type definitions and import centralized types to resolve conflicts.
import React, { useState, useRef, useEffect } from 'react';
import type { Message, LanguageCode, SpeechRecognition, SpeechRecognitionEvent, SpeechRecognitionErrorEvent } from '../types';
import { TRANSLATIONS } from '../constants';
import MessageBubble from './MessageBubble';
import SendIcon from './icons/SendIcon';
import AttachmentIcon from './icons/AttachmentIcon';
import MicrophoneIcon from './icons/MicrophoneIcon';
import WelcomeScreen from './WelcomeScreen';
import SkeletonLoader from './loaders/SkeletonLoader';
import TypingIndicator from './loaders/TypingIndicator';
import VideoCameraIcon from './icons/VideoCameraIcon';
import LiveAnalysisModal from './LiveAnalysisModal';

interface ChatInterfaceProps {
  messages: Message[];
  isLoading: boolean;
  isStreaming: boolean;
  onSendMessage: (inputText: string, imageFile: File | null) => void;
  language: LanguageCode;
  isNewChat: boolean;
  isOnline: boolean;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  isLoading,
  isStreaming,
  onSendMessage,
  language,
  isNewChat,
  isOnline,
}) => {
  const [inputText, setInputText] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isLiveModalOpen, setIsLiveModalOpen] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading, isStreaming]);

  useEffect(() => {
    if (imageFile) {
      const objectUrl = URL.createObjectURL(imageFile);
      setImagePreview(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }
    setImagePreview(null);
  }, [imageFile]);
  
  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto'; // Reset height
      const scrollHeight = textarea.scrollHeight;
      // Set the height, capped at a maximum value (e.g., 150px)
      textarea.style.height = `${Math.min(scrollHeight, 150)}px`;
    }
  }, [inputText]);

  // Setup Speech Recognition
  useEffect(() => {
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      console.warn("Speech Recognition API is not supported in this browser.");
      return;
    }
    
    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = language;
    
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = 0; i < event.results.length; i++) {
        const transcriptChunk = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcriptChunk;
        } else {
          interimTranscript += transcriptChunk;
        }
      }
      setInputText(finalTranscript + interimTranscript);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    // Fix: Use strongly-typed event for onerror.
    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      // The 'no-speech' error is a common occurrence when the user doesn't speak.
      // We handle it gracefully by stopping the recording without logging a console error.
      if (event.error !== 'no-speech') {
        console.error("Speech recognition error:", event.error);
      }
      setIsRecording(false);
    };
    
    recognitionRef.current = recognition;
  }, [language]);


  const handleMicClick = () => {
    if (!isOnline) return; // Disable mic when offline
    if (isRecording) {
      recognitionRef.current?.stop();
    } else {
      setInputText(''); // Clear text before starting new recording
      recognitionRef.current?.start();
      setIsRecording(true);
    }
  };


  const handleSend = () => {
    if (inputText.trim() || imageFile) {
      onSendMessage(inputText, imageFile);
      setInputText('');
      setImageFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleAttachmentClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };
  
  const removeImage = () => {
      setImageFile(null);
      if (fileInputRef.current) {
          fileInputRef.current.value = "";
      }
  }
  
  const handlePromptClick = (prompt: string) => {
      onSendMessage(prompt, null);
  }

  const handleLiveCapture = (text: string, image: File) => {
    onSendMessage(text, image);
    setIsLiveModalOpen(false);
  };

  const canSendMessage = (!!inputText.trim() || !!imageFile) && !isLoading;

  return (
    <div className="flex-1 flex flex-col bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-2xl shadow-lg overflow-hidden border border-slate-200/60 dark:border-gray-700/60">
      <div className="flex-1 p-4 overflow-y-auto">
        {isNewChat ? (
          <WelcomeScreen onPromptClick={handlePromptClick} language={language} />
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} language={language} />
            ))}
            {isLoading && <SkeletonLoader />}
            {isStreaming && !isLoading && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <div className="p-4 bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border-t border-slate-200/80 dark:border-gray-700/80">
        {imagePreview && (
          <div className="relative w-20 h-20 mb-2">
            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover rounded-lg shadow-sm" />
            <button
              onClick={removeImage}
              className="absolute top-0 right-0 bg-red-500 text-white rounded-full h-5 w-5 flex items-center justify-center -mt-1 -mr-1 text-xs font-bold transition-transform hover:scale-110"
              title={TRANSLATIONS.removeImage[language]}
              aria-label={TRANSLATIONS.removeImage[language]}
            >
              &times;
            </button>
          </div>
        )}
        <div className="relative flex items-center bg-gray-800 dark:bg-gray-900 rounded-full p-2 shadow-inner transition-shadow duration-300 focus-within:shadow-[0_0_15px_rgba(34,197,94,0.5)]">
          <button onClick={handleAttachmentClick} title="Attach image" className="text-gray-400 dark:text-gray-500 hover:text-white p-2 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed" disabled={!isOnline}>
              <AttachmentIcon />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/*"
            disabled={!isOnline}
          />
          <button 
              onClick={handleMicClick}
              title={isRecording ? TRANSLATIONS.stopRecording[language] : TRANSLATIONS.startRecording[language]}
              className={`p-2 rounded-full transition-colors ${isRecording ? 'text-red-500 animate-pulse' : 'text-gray-400 dark:text-gray-500 hover:text-white'} disabled:opacity-50 disabled:cursor-not-allowed`}
              disabled={!isOnline}
          >
              <MicrophoneIcon />
          </button>
           <button 
              onClick={() => setIsLiveModalOpen(true)}
              title="Live Analysis"
              aria-label="Live Analysis"
              className="p-2 rounded-full text-gray-400 dark:text-gray-500 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!isOnline}
          >
              <VideoCameraIcon />
          </button>

          <textarea
            ref={textareaRef}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isOnline ? TRANSLATIONS.sendMessagePlaceholder[language] : "You are offline. Type a message to send later."}
            className="flex-1 bg-transparent text-white px-4 py-2 border-none resize-none focus:outline-none focus:ring-0 placeholder-gray-500"
            rows={1}
          />
          
          <button
            onClick={handleSend}
            disabled={!canSendMessage}
            className="bg-green-500 text-white w-10 h-10 flex items-center justify-center rounded-xl hover:bg-green-600 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
            aria-label="Send message"
          >
            <SendIcon />
          </button>
        </div>
      </div>
      <LiveAnalysisModal
        isOpen={isLiveModalOpen}
        onClose={() => setIsLiveModalOpen(false)}
        onCapture={handleLiveCapture}
        language={language}
      />
    </div>
  );
};

export default ChatInterface;
