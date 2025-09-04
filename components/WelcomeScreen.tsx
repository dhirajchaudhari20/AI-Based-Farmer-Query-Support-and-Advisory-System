import React from 'react';
import type { LanguageCode } from '../types';
import { TRANSLATIONS } from '../constants';
import LogoIcon from './icons/LogoIcon';

interface WelcomeScreenProps {
  onPromptClick: (prompt: string) => void;
  language: LanguageCode;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onPromptClick, language }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-4">
      <div className="bg-green-500 text-white rounded-full p-3 mb-4 shadow-lg">
        <LogoIcon className="h-10 w-10 text-white" />
      </div>
      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
        {TRANSLATIONS.headerTitle[language]}
      </h2>
      <p className="text-gray-500 dark:text-gray-400 mb-8">
        {TRANSLATIONS.welcomeTitle[language]}
      </p>

      <div className="w-full max-w-2xl grid grid-cols-1 md:grid-cols-3 gap-4">
        {TRANSLATIONS.promptStarters.prompts.map((p, i) => (
          <button
            key={i}
            onClick={() => onPromptClick(p[language])}
            className="text-left bg-white dark:bg-gray-800 border border-slate-200/80 dark:border-gray-700/80 rounded-lg p-4 hover:bg-slate-100/70 dark:hover:bg-gray-700/70 hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <p className="font-semibold text-gray-700 dark:text-gray-300">{p[language]}</p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default WelcomeScreen;