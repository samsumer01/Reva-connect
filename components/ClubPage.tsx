import React, { useState } from 'react';
import { Club, Post, UserProfile, ReactionType } from '../types';
import { PostCard } from './PostCard';
import { EditClubModal } from './EditClubModal';
import { PencilIcon } from './Icons';

interface ClubPageProps {
  club: Club;
  posts: Post[];
  currentUser: UserProfile;
  onBack: () => void;
  onJoinClub: (clubId: string) => void;
  onLeaveClub: (clubId: string) => void;
  onSaveClub: (updatedClub: Club) => void;
  // Post interaction props
  onAddComment: (postId: string, commentContent: string) => void;
  onReactToPost: (postId: string, reaction: ReactionType) => void;
  onEditPost: (post: Post) => void;
  onTitleClick: (post: Post) => void;
}

export const ClubPage: React.FC<ClubPageProps> = ({
  club,
  posts,
  currentUser,
  onBack,
  onJoinClub,
  onLeaveClub,
  onSaveClub,
  onAddComment,
  onReactToPost,
  onEditPost,
  onTitleClick
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const isMember = club.members.includes(currentUser.id);
  // For simplicity, let's assume the first member is the admin
  const isAdmin = club.members[0] === currentUser.id;

  return (
    <div className="container mx-auto p-4">
      {isEditing && <EditClubModal club={club} onClose={() => setIsEditing(false)} onSave={onSaveClub} />}
      
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden mb-6">
        <div className="relative">
            <img className="h-48 w-full object-cover" src={club.bannerUrl} alt={`${club.name} banner`} />
            <div className="absolute top-4 right-4 flex space-x-2">
                 {isAdmin && (
                    <button onClick={() => setIsEditing(true)} className="bg-white bg-opacity-70 text-gray-800 p-2 rounded-full hover:bg-opacity-100">
                        <PencilIcon className="h-5 w-5" />
                    </button>
                )}
            </div>
        </div>
        <div className="p-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{club.name}</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">{club.memberCount} members</p>
          <p className="mt-4 text-gray-700 dark:text-gray-300">{club.description}</p>
          <div className="mt-6 flex space-x-4">
            <button onClick={onBack} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white rounded-md hover:bg-gray-300 dark:hover:bg-gray-500">
              Back to Clubs
            </button>
            {isMember ? (
                <button onClick={() => onLeaveClub(club.id)} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
                    Leave Club
                </button>
            ) : (
                <button onClick={() => onJoinClub(club.id)} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                    Join Club
                </button>
            )}
          </div>
        </div>
      </div>
      
      <div>
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Club Posts</h2>
        {posts.length > 0 ? (
          posts.map(post => (
            <PostCard
              key={post.id}
              post={post}
              currentUser={currentUser}
              onAddComment={onAddComment}
              onReactToPost={onReactToPost}
              onEditPost={onEditPost}
              onTitleClick={() => onTitleClick(post)}
            />
          ))
        ) : (
          <div className="text-center py-10 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <p className="text-gray-500 dark:text-gray-400">No posts in this club yet. Be the first to post!</p>
          </div>
        )}
      </div>
    </div>
  );
};
