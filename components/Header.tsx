import React from 'react';
import type { LanguageCode, Theme } from '../types';
import { LANGUAGES, TRANSLATIONS } from '../constants';
import NewChatIcon from './icons/NewChatIcon';
import SunIcon from './icons/SunIcon';
import MoonIcon from './icons/MoonIcon';
import LogoIcon from './icons/LogoIcon';

interface HeaderProps {
  language: LanguageCode;
  onLanguageChange: (language: LanguageCode) => void;
  onNewChat: () => void;
  theme: Theme;
  onToggleTheme: () => void;
}

const Header: React.FC<HeaderProps> = ({ language, onLanguageChange, onNewChat, theme, onToggleTheme }) => {
  return (
    <header className="sticky top-0 z-10 bg-slate-50/50 dark:bg-gray-800/50 backdrop-blur-xl border-b border-slate-200/60 dark:border-gray-700/60 shadow-sm">
      <div className="max-w-4xl mx-auto flex justify-between items-center p-4">
        <div className="flex items-center gap-3">
          <LogoIcon />
          <div>
            <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">{TRANSLATIONS.headerTitle[language]}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">{TRANSLATIONS.headerSubtitle[language]}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button
              onClick={onToggleTheme}
              title="Toggle theme"
              className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-slate-200/70 dark:hover:bg-gray-700/70 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <MoonIcon /> : <SunIcon />}
          </button>
          <button 
            onClick={onNewChat} 
            title={TRANSLATIONS.newChat[language]} 
            className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-slate-200/70 dark:hover:bg-gray-700/70 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            aria-label={TRANSLATIONS.newChat[language]}
          >
            <NewChatIcon />
          </button>
          <div className="relative">
            <select
              value={language}
              onChange={(e) => onLanguageChange(e.target.value as LanguageCode)}
              className="bg-slate-100/50 dark:bg-gray-700/50 text-slate-700 dark:text-slate-300 py-1 pl-3 pr-8 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-green-500 border border-slate-300/50 dark:border-gray-600/50 transition-colors"
              aria-label="Select language"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-400">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;