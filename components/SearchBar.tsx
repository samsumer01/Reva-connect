import React from 'react';

interface SearchBarProps {
    value: string;
    onChange: (value: string) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ value, onChange }) => {
  return (
    <div className="relative">
      <input
        type="text"
        placeholder="Search CampusConnect"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-200 rounded-full w-40 md:w-64 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
      />
    </div>
  );
};
