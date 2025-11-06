import React from 'react';
import { UserProfile } from '../types';

interface UserCardProps {
  user: UserProfile;
  onViewProfile: (user: UserProfile) => void;
}

export const UserCard: React.FC<UserCardProps> = ({ user, onViewProfile }) => {
  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-4 flex items-center justify-between">
      <div className="flex items-center">
        <img src={user.avatarUrl} alt={user.name} className="h-12 w-12 rounded-full mr-4" />
        <div>
          <p className="font-semibold text-gray-900 dark:text-white">{user.name}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{user.major} - Class of {user.graduationYear}</p>
        </div>
      </div>
      <button
        onClick={() => onViewProfile(user)}
        className="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-md hover:bg-indigo-700 transition-colors"
      >
        View Profile
      </button>
    </div>
  );
};
