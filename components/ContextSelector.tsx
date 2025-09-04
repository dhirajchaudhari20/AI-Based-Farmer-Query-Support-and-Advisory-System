import React from 'react';
import type { LanguageCode } from '../types';
import { KERALA_DISTRICTS, COMMON_CROPS, TRANSLATIONS } from '../constants';

interface ContextSelectorProps {
  location: string;
  crop: string;
  onLocationChange: (location: string) => void;
  onCropChange: (crop: string) => void;
  language: LanguageCode;
}

const ContextSelector: React.FC<ContextSelectorProps> = ({
  location,
  crop,
  onLocationChange,
  onCropChange,
  language,
}) => {
  return (
    <div className="bg-slate-50/50 backdrop-blur-xl p-3 rounded-2xl mb-4 flex flex-col sm:flex-row gap-4 border border-slate-200/60 shadow-sm">
      <div className="flex-1">
        <label htmlFor="location-select" className="block text-xs font-medium text-gray-600 mb-1">
          {TRANSLATIONS.locationLabel[language]}
        </label>
        <div className="relative">
          <select
            id="location-select"
            value={location}
            onChange={(e) => onLocationChange(e.target.value)}
            className="w-full p-2 text-sm bg-slate-100/50 border border-slate-300/50 rounded-lg shadow-sm appearance-none focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
          >
            {KERALA_DISTRICTS.map((district) => (
              <option key={district} value={district}>
                {district}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
          </div>
        </div>
      </div>
      <div className="flex-1">
        <label htmlFor="crop-select" className="block text-xs font-medium text-gray-600 mb-1">
          {TRANSLATIONS.cropLabel[language]}
        </label>
        <div className="relative">
        <select
          id="crop-select"
          value={crop}
          onChange={(e) => onCropChange(e.target.value)}
          className="w-full p-2 text-sm bg-slate-100/50 border border-slate-300/50 rounded-lg shadow-sm appearance-none focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
        >
          {COMMON_CROPS.map((cropItem) => (
            <option key={cropItem} value={cropItem}>
              {cropItem}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContextSelector;