import React from 'react';

interface FeedToggleProps {
  currentFeed: 'following' | 'global';
  onSetFeed: (feed: 'following' | 'global') => void;
}

export const FeedToggle: React.FC<FeedToggleProps> = ({ currentFeed, onSetFeed }) => {
  const baseClasses = 'px-4 py-2 text-sm font-semibold rounded-md transition-colors duration-200';
  const activeClasses = 'bg-indigo-600 text-white';
  const inactiveClasses = 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600';

  return (
    <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
      <button
        onClick={() => onSetFeed('following')}
        className={`${baseClasses} ${currentFeed === 'following' ? activeClasses : inactiveClasses}`}
      >
        Following
      </button>
      <button
        onClick={() => onSetFeed('global')}
        className={`${baseClasses} ${currentFeed === 'global' ? activeClasses : inactiveClasses}`}
      >
        Global
      </button>
    </div>
  );
};
