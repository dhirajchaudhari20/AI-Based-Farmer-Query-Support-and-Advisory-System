import React, { useState, useEffect, useRef } from 'react';
import type { LanguageCode, SpeechRecognition, SpeechRecognitionEvent, SpeechRecognitionErrorEvent } from '../types';
import { TRANSLATIONS, LANGUAGES } from '../constants';
import MapPinLogoIcon from './icons/MapPinLogoIcon';
import MicrophoneIcon from './icons/MicrophoneIcon';


interface LoginScreenProps {
  onLogin: (name: string) => void;
  language: LanguageCode;
  onLanguageChange: (language: LanguageCode) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, language, onLanguageChange }) => {
  const [name, setName] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      console.warn("Speech Recognition API is not supported in this browser.");
      return;
    }
    
    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = language;
    
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript;
      setName(transcript);
      // Automatically submit after successful recognition
      if (transcript.trim()) {
          onLogin(transcript.trim());
      }
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error !== 'no-speech') {
        console.error("Speech recognition error:", event.error);
      }
      setIsRecording(false);
    };
    
    recognitionRef.current = recognition;
  }, [language, onLogin]);

  const handleMicClick = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
    } else {
      setName('');
      recognitionRef.current?.start();
      setIsRecording(true);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onLogin(name.trim());
    }
  };

  return (
    <div className="flex items-center justify-center h-screen w-screen bg-slate-50 dark:bg-[#1C212D] p-4">
      <div className="w-full max-w-sm mx-auto text-center">
        <div className="inline-block bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-full p-4 mb-6 shadow-lg">
          <MapPinLogoIcon className="h-12 w-12 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">
          {TRANSLATIONS.loginWelcome[language]}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8">
          {TRANSLATIONS.loginPrompt[language]}
        </p>

        <div className="mb-6">
            <select
              value={language}
              onChange={(e) => onLanguageChange(e.target.value as LanguageCode)}
              className="w-full p-2 text-sm bg-white dark:bg-gray-800 border border-slate-300 dark:border-gray-600 rounded-lg shadow-sm appearance-none focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors text-gray-800 dark:text-gray-200"
              aria-label="Select language"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 text-left mb-1">
              {TRANSLATIONS.nameLabel[language]}
            </label>
            <div className="relative">
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={TRANSLATIONS.namePlaceholder[language]}
                  required
                  className="w-full pl-4 pr-12 py-2 text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-800 border border-slate-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <button 
                  type="button"
                  onClick={handleMicClick}
                  title={TRANSLATIONS.speakYourName[language]}
                  className={`absolute inset-y-0 right-0 flex items-center pr-3 transition-colors ${isRecording ? 'text-red-500 animate-pulse' : 'text-gray-400 hover:text-green-500'}`}
                  aria-label={TRANSLATIONS.speakYourName[language]}
                >
                    <MicrophoneIcon />
                </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={!name.trim()}
            className="w-full flex items-center justify-center px-4 py-3 text-sm font-medium text-white bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:focus:ring-offset-gray-900 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {TRANSLATIONS.loginButton[language]}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginScreen;