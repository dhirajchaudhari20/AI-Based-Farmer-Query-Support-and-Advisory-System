import React, { useState, useEffect, useRef } from 'react';
import type { Message, LanguageCode } from '../types';
import BotIcon from './icons/BotIcon';
import UserIcon from './icons/UserIcon';
import ThumbsUpIcon from './icons/ThumbsUpIcon';
import ThumbsDownIcon from './icons/ThumbsDownIcon';
import SpeakerIcon from './icons/SpeakerIcon';
import StopIcon from './icons/StopIcon';
import CopyIcon from './icons/CopyIcon';
import CheckIcon from './icons/CheckIcon';
import { Remarkable } from 'remarkable';
import { TRANSLATIONS, LANGUAGES } from '../constants';

interface MessageBubbleProps {
  message: Message;
  language: LanguageCode;
}

const md = new Remarkable();

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, language }) => {
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isVoiceAvailable, setIsVoiceAvailable] = useState(false);
  const [copied, setCopied] = useState(false);
  const utteranceQueue = useRef<SpeechSynthesisUtterance[]>([]);

  // This effect manages loading browser voices and checking if a voice for the
  // currently selected language is available. It runs whenever the language changes.
  useEffect(() => {
    const updateVoicesAndAvailability = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      if (availableVoices.length > 0) {
        setVoices(availableVoices);
        // Check if any installed voice starts with the desired language code (e.g., 'ml' for 'ml-IN').
        const hasVoice = availableVoices.some(v => v.lang.startsWith(language));
        setIsVoiceAvailable(hasVoice);
        // Once voices are loaded, we don't need the listener anymore.
        window.speechSynthesis.onvoiceschanged = null;
      }
    };

    // Voices may load asynchronously. This listener ensures we check them once they are ready.
    window.speechSynthesis.onvoiceschanged = updateVoicesAndAvailability;
    updateVoicesAndAvailability(); // Also call it immediately in case they are already loaded.

    // Cleanup function: stop any speech and remove the listener when the component
    // unmounts or the language changes, preventing memory leaks.
    return () => {
      utteranceQueue.current = [];
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, [language]);

  // Recursively speaks the next utterance in the queue until it's empty.
  const speakNextInQueue = () => {
    if (utteranceQueue.current.length > 0) {
      const utteranceToSpeak = utteranceQueue.current.shift();
      if (utteranceToSpeak) {
        window.speechSynthesis.speak(utteranceToSpeak);
      }
    } else {
      setIsSpeaking(false); // All utterances have been spoken
    }
  };

  const handleTextToSpeech = (text: string, lang: LanguageCode) => {
    if (isSpeaking) {
      // If already speaking, stop everything.
      utteranceQueue.current = [];
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    if (!isVoiceAvailable) return;

    // Split long text into smaller chunks (max 180 chars) to avoid issues with
    // the SpeechSynthesis API's character limits on some browsers.
    const chunks = text.match(/.{1,180}(\s|\.|\?|!|$)/g) || [];
    if (chunks.length === 0) return;

    // Dynamically find voices that match the base language code (e.g., 'ml' matches 'ml-IN').
    const matchingVoices = voices.filter(voice => voice.lang.startsWith(lang));
    if (matchingVoices.length === 0) return; // Safeguard
    
    // Prioritize higher-quality voices from the matching set.
    const selectedVoice = 
        matchingVoices.find(v => v.name.includes('Google')) || // Prefer Google voices
        matchingVoices.find(v => v.localService) || // Then local system voices
        matchingVoices[0]; // Fallback to the first available voice for that language.
    
    if (!selectedVoice) return; // Safeguard, should be prevented by isVoiceAvailable check.

    // Create a queue of utterance objects, one for each text chunk.
    utteranceQueue.current = chunks.map(chunk => {
      const utterance = new SpeechSynthesisUtterance(chunk.trim());
      utterance.lang = selectedVoice.lang;
      utterance.voice = selectedVoice;
      utterance.onend = speakNextInQueue; // When one ends, the next one starts.
      utterance.onerror = (event) => {
        // The 'interrupted' error is expected when another speech request starts.
        // We handle it gracefully by resetting state without logging a console error.
        if (event.error !== 'interrupted') {
          console.error("SpeechSynthesis Error:", event.error);
        }
        utteranceQueue.current = []; // Clear queue on error
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      };
      return utterance;
    });

    setIsSpeaking(true);
    speakNextInQueue(); // Start speaking the first item in the queue.
  };

  const handleCopy = () => {
    if (navigator.clipboard && message.text) {
      navigator.clipboard.writeText(message.text).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
      });
    }
  };

  const handleFeedback = (type: 'up' | 'down') => {
    setFeedback(type);
    setFeedbackSent(true);
  };
  
  // Generates the appropriate title/tooltip for the speaker button.
  const getSpeakerButtonTitle = () => {
      if (!isVoiceAvailable) {
          const langName = LANGUAGES.find(l => l.code === language)?.name || language;
          return `A voice for ${langName} is not available in this browser.`;
      }
      return isSpeaking ? TRANSLATIONS.stopReading[language] : TRANSLATIONS.readAloud[language];
  };

  const isUser = message.role === 'user';
  
  const bubbleClasses = isUser
    ? 'bg-gradient-to-br from-green-500 to-green-600 text-white shadow-md'
    // eslint-disable-next-line max-len
    : 'bg-white text-gray-800 shadow-md border border-slate-100';
  const containerClasses = isUser ? 'justify-end' : 'justify-start';
  const bubbleAlignment = isUser ? 'rounded-br-none' : 'rounded-bl-none';

  const renderMarkdown = (text: string) => {
    return { __html: md.render(text) };
  };

  return (
    <div className={`flex items-start ${containerClasses} mb-4 group`}>
        {!isUser && (
            <div className="flex-shrink-0 mr-3">
                <div className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center text-white shadow-sm">
                    <BotIcon />
                </div>
            </div>
        )}
      <div className={`rounded-xl p-3 max-w-xl ${bubbleClasses} ${bubbleAlignment}`}>
        {message.image && (
          <img
            src={message.image}
            alt="User upload"
            className="rounded-lg mb-2 max-w-xs max-h-64 object-contain"
          />
        )}
        {message.text && (
            <div className="prose prose-sm max-w-none prose-p:my-1 prose-headings:my-2" dangerouslySetInnerHTML={renderMarkdown(message.text)} />
        )}
      </div>
        {isUser && (
            <div className="flex-shrink-0 ml-3">
                <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-600">
                    <UserIcon />
                </div>
            </div>
        )}
        {!isUser && message.text && (
            <div className="self-end ml-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                 <button 
                    onClick={() => message.text && handleTextToSpeech(message.text, language)} 
                    disabled={!isVoiceAvailable}
                    className={`p-1.5 rounded-full text-gray-400 transition-colors ${!isVoiceAvailable ? 'cursor-not-allowed opacity-50' : 'hover:bg-gray-200 hover:text-gray-600'} ${isSpeaking ? 'animate-pulse' : ''}`} 
                    title={getSpeakerButtonTitle()}
                    aria-label={getSpeakerButtonTitle()}
                 >
                    {isSpeaking ? <StopIcon /> : <SpeakerIcon />}
                </button>
                 <button 
                    onClick={handleCopy} 
                    className="p-1.5 rounded-full text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition-colors"
                    title={copied ? TRANSLATIONS.copied[language] : TRANSLATIONS.copy[language]}
                    aria-label={copied ? TRANSLATIONS.copied[language] : TRANSLATIONS.copy[language]}
                 >
                    {copied ? <CheckIcon /> : <CopyIcon />}
                </button>
                <button 
                  onClick={() => handleFeedback('up')} 
                  disabled={feedbackSent}
                  title={feedbackSent ? TRANSLATIONS.feedbackSent[language] : TRANSLATIONS.goodResponse[language]}
                  aria-label={feedbackSent ? TRANSLATIONS.feedbackSent[language] : TRANSLATIONS.goodResponse[language]}
                  className={`p-1 rounded-full disabled:cursor-not-allowed ${feedback === 'up' ? 'text-green-500 bg-green-100' : 'text-gray-400 hover:bg-gray-200 hover:text-gray-600'}`}>
                    <ThumbsUpIcon solid={feedback === 'up'} />
                </button>
                 <button 
                    onClick={() => handleFeedback('down')} 
                    disabled={feedbackSent}
                    title={feedbackSent ? TRANSLATIONS.feedbackSent[language] : TRANSLATIONS.badResponse[language]}
                    aria-label={feedbackSent ? TRANSLATIONS.feedbackSent[language] : TRANSLATIONS.badResponse[language]}
                    className={`p-1 rounded-full disabled:cursor-not-allowed ${feedback === 'down' ? 'text-red-500 bg-red-100' : 'text-gray-400 hover:bg-gray-200 hover:text-gray-600'}`}>
                    <ThumbsDownIcon solid={feedback === 'down'} />
                </button>
            </div>
        )}
    </div>
  );
};

export default MessageBubble;