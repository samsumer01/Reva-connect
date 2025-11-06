import React from 'react';
import { Club } from '../types';

interface ClubCardProps {
  club: Club;
  onClick: () => void;
}

export const ClubCard: React.FC<ClubCardProps> = ({ club, onClick }) => {
  return (
    <button onClick={onClick} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden text-left w-full h-full flex flex-col hover:shadow-xl transition-shadow">
      <img src={club.bannerUrl} alt={`${club.name} banner`} className="w-full h-32 object-cover" />
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">{club.name}</h3>
        <p className="text-gray-600 dark:text-gray-400 mt-1">{club.memberCount} members</p>
        <p className="text-gray-700 dark:text-gray-300 mt-2 text-sm flex-grow">{club.description}</p>
        <div className="mt-4 w-full bg-indigo-600 text-white py-2 rounded-md text-center">
          View Club
        </div>
      </div>
    </button>
  );
};
