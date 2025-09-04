// Add TypeScript definitions for the Web Speech API
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}
interface SpeechRecognitionResult {
  isFinal: boolean;
  [index: number]: SpeechRecognitionAlternative;
}
interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: any) => void; // Using `any` for simplicity
  onend: () => void;
}
// Fix: Augment the Window interface to include SpeechRecognition APIs, resolving errors when accessing `window.SpeechRecognition`.
declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognition;
    webkitSpeechRecognition?: new () => SpeechRecognition;
  }
}


import React, { useState, useRef, useEffect } from 'react';
import type { Message, LanguageCode } from '../types';
import { TRANSLATIONS } from '../constants';
import MessageBubble from './MessageBubble';
import SendIcon from './icons/SendIcon';
import AttachmentIcon from './icons/AttachmentIcon';
import MicrophoneIcon from './icons/MicrophoneIcon';
import WelcomeScreen from './WelcomeScreen';
import SkeletonLoader from './loaders/SkeletonLoader';

interface ChatInterfaceProps {
  messages: Message[];
  isLoading: boolean;
  onSendMessage: (inputText: string, imageFile: File | null) => void;
  language: LanguageCode;
  isNewChat: boolean;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  isLoading,
  onSendMessage,
  language,
  isNewChat,
}) => {
  const [inputText, setInputText] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    if (imageFile) {
      const objectUrl = URL.createObjectURL(imageFile);
      setImagePreview(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }
    setImagePreview(null);
  }, [imageFile]);

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

    recognition.onerror = (event: any) => {
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

  return (
    <div className="flex-1 flex flex-col bg-white/60 backdrop-blur-xl rounded-2xl shadow-lg overflow-hidden border border-slate-200/60">
      <div className="flex-1 p-4 overflow-y-auto">
        {isNewChat ? (
          <WelcomeScreen onPromptClick={handlePromptClick} language={language} />
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} language={language} />
            ))}
            {isLoading && <SkeletonLoader />}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <div className="p-4 bg-white/70 backdrop-blur-sm border-t border-slate-200/80">
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
        <div className="relative flex items-center bg-gray-800 rounded-full p-2 shadow-inner transition-shadow duration-300 focus-within:shadow-[0_0_15px_rgba(34,197,94,0.5)]">
          <button onClick={handleAttachmentClick} title="Attach image" className="text-gray-400 hover:text-white p-2 rounded-full transition-colors">
              <AttachmentIcon />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/*"
          />
          <button 
              onClick={handleMicClick}
              title={isRecording ? TRANSLATIONS.stopRecording[language] : TRANSLATIONS.startRecording[language]}
              className={`p-2 rounded-full transition-colors ${isRecording ? 'text-red-500 animate-pulse' : 'text-gray-400 hover:text-white'}`}
          >
              <MicrophoneIcon />
          </button>

          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={TRANSLATIONS.sendMessagePlaceholder[language]}
            className="flex-1 bg-transparent text-white px-4 py-2 border-none resize-none focus:outline-none focus:ring-0 placeholder-gray-500"
            rows={1}
            style={{ maxHeight: '100px' }}
          />
          
          <button
            onClick={handleSend}
            disabled={isLoading || (!inputText.trim() && !imageFile)}
            className="bg-green-500 text-white w-10 h-10 flex items-center justify-center rounded-full hover:bg-green-600 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
            aria-label="Send message"
          >
            <SendIcon />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;