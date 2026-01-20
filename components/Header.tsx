import React from 'react';
import type { LanguageCode, Theme } from '../types';
import { LANGUAGES, TRANSLATIONS } from '../constants';
import SunIcon from './icons/SunIcon';
import MoonIcon from './icons/MoonIcon';
import MapPinLogoIcon from './icons/MapPinLogoIcon';
import MenuIcon from './icons/MenuIcon';

interface HeaderProps {
  language: LanguageCode;
  onLanguageChange: (language: LanguageCode) => void;
  theme: Theme;
  onToggleTheme: () => void;
  onToggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ language, onLanguageChange, theme, onToggleTheme, onToggleSidebar }) => {
  return (
    <header className="sticky top-0 z-10 bg-transparent backdrop-blur-sm border-b border-slate-200/5 dark:border-[#2D3340]/40">
      <div className="max-w-7xl mx-auto flex justify-between items-center p-2 sm:p-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <button onClick={onToggleSidebar} className="md:hidden p-2 text-gray-500 dark:text-gray-400">
            <MenuIcon />
          </button>
          <MapPinLogoIcon className="h-9 w-9 sm:h-10 sm:w-10 text-green-500" />
          <div>
            <h1 className="text-base sm:text-xl font-bold text-gray-800 dark:text-gray-100">{TRANSLATIONS.headerTitle[language]}</h1>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{TRANSLATIONS.headerSubtitle[language]}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 sm:gap-4">
          <button
              onClick={onToggleTheme}
              title="Toggle theme"
              className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/70 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <MoonIcon /> : <SunIcon />}
          </button>
          <div className="relative">
            <select
              value={language}
              onChange={(e) => onLanguageChange(e.target.value as LanguageCode)}
              className="bg-white dark:bg-[#161B22] text-gray-800 dark:text-slate-300 py-1 pl-2 pr-7 sm:pl-3 sm:pr-8 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-green-500 border border-gray-300 dark:border-gray-700 transition-colors text-xs sm:text-sm"
              aria-label="Select language"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-1 sm:px-2 text-gray-400">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;