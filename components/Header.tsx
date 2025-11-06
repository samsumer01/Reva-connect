import React, { useContext } from 'react';
import { HomeIcon, UsersIcon, MessageIcon, UserCircleIcon, SunIcon, MoonIcon, BookmarkIcon, SearchIcon } from './Icons';
import { SearchBar } from './SearchBar';
import { ThemeContext } from '../contexts/ThemeContext';
import { View } from '../types';

interface HeaderProps {
    onNavigate: (view: View) => void;
    searchQuery: string;
    onSearchChange: (query: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ onNavigate, searchQuery, onSearchChange }) => {
  const themeContext = useContext(ThemeContext);

  if (!themeContext) {
    throw new Error("Header must be used within a ThemeProvider");
  }
  const { theme, toggleTheme } = themeContext;

  return (
    <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-10">
      <div className="container mx-auto px-4 py-2 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">Reva Connect</h1>
          <SearchBar value={searchQuery} onChange={onSearchChange} />
        </div>
        <nav className="flex items-center space-x-4 md:space-x-6">
          <button onClick={() => onNavigate('feed')} title="Feed" className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400">
            <HomeIcon className="h-6 w-6" />
          </button>
          <button onClick={() => onNavigate('clubs')} title="Clubs" className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400">
            <UsersIcon className="h-6 w-6" />
          </button>
           <button onClick={() => onNavigate('clubFeed')} title="My Clubs" className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400">
            <BookmarkIcon className="h-6 w-6" />
          </button>
          <button onClick={() => onNavigate('userSearch')} title="Find Users" className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400">
            <SearchIcon className="h-6 w-6" />
          </button>
          <button title="Messages" className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400">
            <MessageIcon className="h-6 w-6" />
          </button>
          <button onClick={() => onNavigate('profile')} title="Profile" className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400">
            <UserCircleIcon className="h-6 w-6" />
          </button>
          <button onClick={toggleTheme} title="Toggle Theme" className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400">
            {theme === 'light' ? <MoonIcon className="h-6 w-6" /> : <SunIcon className="h-6 w-6" />}
          </button>
        </nav>
      </div>
    </header>
  );
};