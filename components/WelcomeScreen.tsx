import React from 'react';
import type { LanguageCode } from '../types';
import { TRANSLATIONS } from '../constants';
import MapPinLogoIcon from './icons/MapPinLogoIcon';

interface WelcomeScreenProps {
  onPromptClick: (prompt: string) => void;
  language: LanguageCode;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onPromptClick, language }) => {
  const malayalamPrompts = [
    "എൻ്റെ വാഴയിലെ ഇലപ്പുള്ളി രോഗം എങ്ങനെ ചികിത്സിക്കാം?",
    "മണൽ മണ്ണിൽ തെങ്ങിന് നല്ല വളം ഏതാണ്?",
    "എൻ്റെ നെൽക്കൃഷിയിലെ ഈ കീടത്തെ തിരിച്ചറിയുക."
  ];

  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-4">
      <div className="flex flex-col items-center justify-center flex-grow">
          <MapPinLogoIcon className="h-16 w-16 text-green-500 mb-4" />
          <h2 className="text-3xl font-bold text-gray-100 mb-2">
            {TRANSLATIONS.headerTitle[language]}
          </h2>
          <p className="text-gray-400 mb-8">
            {TRANSLATIONS.welcomeTitle[language]}
          </p>
      </div>

      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-4 pb-16">
        {malayalamPrompts.map((prompt, i) => (
          <button
            key={i}
            onClick={() => onPromptClick(prompt)}
            className="text-left group bg-[#161B22]/50 border border-gray-700 rounded-lg p-4 hover:bg-[#161B22] hover:shadow-lg hover:-translate-y-1 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <p className="font-medium text-sm text-gray-300">{prompt}</p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default WelcomeScreen;