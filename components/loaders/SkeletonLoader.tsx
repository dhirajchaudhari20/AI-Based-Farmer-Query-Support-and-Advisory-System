import React from 'react';
import BotIcon from '../icons/BotIcon';

const SkeletonLoader: React.FC = () => {
  return (
    <div className="flex items-start justify-start group animate-pulse">
      <div className="flex-shrink-0 mr-3">
        <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center">
            <BotIcon />
        </div>
      </div>
      <div className="bg-slate-200 rounded-xl rounded-bl-none p-3 max-w-md w-full">
        <div className="h-4 bg-slate-300 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-slate-300 rounded w-1/2"></div>
      </div>
    </div>
  );
};

export default SkeletonLoader;
