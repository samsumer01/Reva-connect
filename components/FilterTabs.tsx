import React from 'react';
import { Category } from '../types';

interface FilterTabsProps {
  selectedCategory: Category | 'All';
  onSelectCategory: (category: Category | 'All') => void;
}

export const FilterTabs: React.FC<FilterTabsProps> = ({ selectedCategory, onSelectCategory }) => {
  const categories: (Category | 'All')[] = ['All', ...Object.values(Category)];

  return (
    <div className="border-b border-gray-200 dark:border-gray-700">
      <nav className="-mb-px flex space-x-8" aria-label="Tabs">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => onSelectCategory(category)}
            className={`${
              selectedCategory === category
                ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            {category}
          </button>
        ))}
      </nav>
    </div>
  );
};
