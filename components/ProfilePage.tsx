import React from 'react';
import { UserProfile, Post, ReactionType } from '../types';
import { PostCard } from './PostCard';

interface ProfilePageProps {
  user: UserProfile;
  posts: Post[];
  currentUser: UserProfile;
  isOwnProfile: boolean;
  onAddComment: (postId: string, commentContent: string) => void;
  onReactToPost: (postId: string, reaction: ReactionType) => void;
  onEditProfileClick: () => void;
  onEditPost: (post: Post) => void;
  onBack?: () => void;
  onFollow: (userId: string) => void;
  onUnfollow: (userId: string) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ user, posts, currentUser, isOwnProfile, onAddComment, onReactToPost, onEditProfileClick, onEditPost, onBack, onFollow, onUnfollow }) => {
  return (
    <div className="container mx-auto p-4">
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 mb-6">
        <div className="flex flex-col md:flex-row items-center">
          <img className="h-24 w-24 rounded-full" src={user.avatarUrl} alt={user.name} />
          <div className="ml-0 md:ml-6 mt-4 md:mt-0 text-center md:text-left">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{user.name}</h1>
            <p className="text-gray-600 dark:text-gray-400">{user.major} - Class of {user.graduationYear}</p>
             <div className="flex space-x-4 mt-2 justify-center md:justify-start">
                <p className="text-sm text-gray-500 dark:text-gray-400"><strong className="text-gray-800 dark:text-gray-200">{user.followerCount ?? 0}</strong> Followers</p>
                <p className="text-sm text-gray-500 dark:text-gray-400"><strong className="text-gray-800 dark:text-gray-200">{user.followingCount ?? 0}</strong> Following</p>
            </div>
            <p className="mt-2 text-gray-700 dark:text-gray-300">{user.bio}</p>
          </div>
          <div className="flex space-x-2 ml-auto mt-4 md:mt-0">
            {isOwnProfile ? (
                <button onClick={onEditProfileClick} className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">
                Edit Profile
                </button>
            ): (
                user.isFollowedByCurrentUser ? (
                    <button onClick={() => onUnfollow(user.id)} className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white px-4 py-2 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500">
                        Unfollow
                    </button>
                ) : (
                    <button onClick={() => onFollow(user.id)} className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">
                        Follow
                    </button>
                )
            )}
            {onBack && (
              <button onClick={onBack} className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white px-4 py-2 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500">
                Back
              </button>
            )}
          </div>
        </div>
      </div>
      <div>
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Posts by {user.name.split(' ')[0]}</h2>
         {posts.length > 0 ? (
          posts.map(post => (
            <PostCard 
              key={post.id} 
              post={post} 
              onAddComment={onAddComment} 
              onReactToPost={onReactToPost} 
              currentUser={currentUser} 
              onEditPost={onEditPost}
            />
          ))
         ) : (
            <div className="text-center py-10 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                <p className="text-gray-500 dark:text-gray-400">{user.name} hasn't posted anything yet.</p>
            </div>
         )}
      </div>
    </div>
  );
};
