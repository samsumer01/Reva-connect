import React, { useState } from 'react';
import { UserProfile } from '../types';
import { UserCard } from './UserCard';
import { FeedSpinner } from './FeedSpinner';
import { SearchIcon } from './Icons';

interface UserSearchPageProps {
  onSearch: (query: string) => void;
  results: UserProfile[];
  isLoading: boolean;
  onViewProfile: (user: UserProfile) => void;
}

export const UserSearchPage: React.FC<UserSearchPageProps> = ({ onSearch, results, isLoading, onViewProfile }) => {
  const [query, setQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setHasSearched(true);
    onSearch(query);
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Find Students</h2>
      <form onSubmit={handleSearchSubmit} className="flex mb-6">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name or major..."
          className="flex-grow p-2 border rounded-l-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
        <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-r-md hover:bg-indigo-700 flex items-center">
          <SearchIcon className="h-5 w-5 mr-2" />
          Search
        </button>
      </form>

      {isLoading ? (
        <FeedSpinner />
      ) : hasSearched ? (
        results.length > 0 ? (
          <div className="space-y-4">
            {results.map(user => (
              <UserCard key={user.id} user={user} onViewProfile={onViewProfile} />
            ))}
          </div>
        ) : (
          <div className="text-center py-10 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">No students found</h3>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Try a different search term.</p>
          </div>
        )
      ) : (
         <div className="text-center py-10 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Search for students at Reva</h3>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Find classmates by their name or major.</p>
          </div>
      )}
    </div>
  );
};
