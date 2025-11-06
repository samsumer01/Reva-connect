import React, { useState } from 'react';
import { Post, Comment as CommentType, UserProfile, ReactionType } from '../types';
import { summarizePost } from '../services/geminiService';
import { ThumbUpIcon, ChatAltIcon, LightbulbIcon, PencilIcon, HeartIcon, EmojiHappyIcon } from './Icons';
import { Spinner } from './Spinner';

interface PostCardProps {
  post: Post;
  currentUser: UserProfile;
  onAddComment: (postId: string, commentContent: string) => void;
  onReactToPost: (postId: string, reaction: ReactionType) => void;
  onEditPost: (post: Post) => void;
  onTitleClick?: (post: Post) => void;
}

const Comment: React.FC<{ comment: CommentType }> = ({ comment }) => (
    <div className="flex items-start space-x-3 mt-3">
        <img src={comment.author.avatarUrl} alt={comment.author.name} className="h-8 w-8 rounded-full" />
        <div className="flex-1 bg-gray-100 dark:bg-gray-700 p-2 rounded-lg">
            <p className="font-semibold text-sm text-gray-900 dark:text-white">{comment.author.name}</p>
            <p className="text-sm text-gray-700 dark:text-gray-300">{comment.content}</p>
        </div>
    </div>
);

const ReactionIcon: React.FC<{ reaction: ReactionType, className?: string }> = ({ reaction, className="h-5 w-5" }) => {
    switch(reaction) {
        case ReactionType.LIKE: return <ThumbUpIcon className={className} />;
        case ReactionType.LOVE: return <HeartIcon className={className} />;
        case ReactionType.FUNNY: return <EmojiHappyIcon className={className} />;
        case ReactionType.INSIGHTFUL: return <LightbulbIcon className={className} />;
        default: return null;
    }
};

const REACTION_COLORS: Record<ReactionType, string> = {
    [ReactionType.LIKE]: 'text-blue-500',
    [ReactionType.LOVE]: 'text-red-500',
    [ReactionType.FUNNY]: 'text-yellow-500',
    [ReactionType.INSIGHTFUL]: 'text-purple-500',
};

export const PostCard: React.FC<PostCardProps> = ({ post, currentUser, onAddComment, onReactToPost, onEditPost, onTitleClick }) => {
  const [summary, setSummary] = useState('');
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [showFullPost, setShowFullPost] = useState(true);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [showReactionPicker, setShowReactionPicker] = useState(false);

  const handleSummarize = async () => {
    if (summary) {
        setShowFullPost(false);
        return;
    }
    setIsSummarizing(true);
    try {
      const postSummary = await summarizePost(post);
      setSummary(postSummary);
      setShowFullPost(false);
    } catch (error) {
      console.error("Failed to summarize post", error);
      setSummary("Could not generate summary.");
    } finally {
      setIsSummarizing(false);
    }
  };
  
  const handleCommentSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newComment.trim()) return;
      onAddComment(post.id, newComment);
      setNewComment('');
  }

  const handleReactionClick = (reaction: ReactionType) => {
    onReactToPost(post.id, reaction);
    setShowReactionPicker(false);
  };

  const totalReactions = Object.values(post.reactions || {}).flat().length;
  // FIX: Access reactions safely as `post.reactions` can be a partial object where not all reaction types are present.
  const topReactions = (Object.keys(post.reactions || {}) as ReactionType[])
    .filter((reaction) => (post.reactions?.[reaction] ?? []).length > 0)
    .sort((a, b) => (post.reactions?.[b] ?? []).length - (post.reactions?.[a] ?? []).length);

  const currentUserReaction = (Object.keys(post.reactions || {}) as ReactionType[]).find(
    (reaction) => post.reactions?.[reaction]?.includes(currentUser.id),
  );
  
  const TitleComponent = onTitleClick ? 'button' : 'h2';
  
  // Handle timestamp safely
  const postTimestamp = post.timestamp ? new Date(post.timestamp).toLocaleString() : 'Just now';


  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-4 mb-4">
      <div className="flex items-start">
        <img src={post.author?.avatarUrl || 'https://i.pravatar.cc/150'} alt={post.author?.name} className="h-12 w-12 rounded-full mr-4" />
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">{post.author?.name || 'Unknown User'}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {postTimestamp}
                {post.edited && <span className="ml-2 text-xs italic">(edited)</span>}
              </p>
            </div>
            <div className="flex items-center space-x-2">
                <span className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-300 text-xs font-medium rounded-full">{post.category}</span>
                {currentUser.id === post.author?.id && (
                    <button onClick={() => onEditPost(post)} title="Edit Post" className="text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400">
                        <PencilIcon className="h-5 w-5" />
                    </button>
                )}
            </div>
          </div>
          <TitleComponent 
            className="text-xl text-left font-bold mt-2 text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 disabled:hover:text-gray-900"
            onClick={onTitleClick ? () => onTitleClick(post) : undefined}
            disabled={!onTitleClick}
          >
            {post.title}
          </TitleComponent>
          <div className="mt-2 text-gray-700 dark:text-gray-300">
            {showFullPost ? <p>{post.content}</p> : (
              <div>
                <p><em>{summary}</em></p>
                <button
                  onClick={() => setShowFullPost(true)}
                  className="mt-2 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  View Full Post
                </button>
              </div>
            )}
            {post.mediaUrl && (
                <div className="mt-3 rounded-lg overflow-hidden">
                    {post.mediaType === 'image' ? (
                        <img src={post.mediaUrl} alt="Post attachment" className="max-h-[500px] w-full object-contain rounded-lg bg-gray-100 dark:bg-gray-900" />
                    ) : (
                        <video src={post.mediaUrl} controls className="w-full rounded-lg" />
                    )}
                </div>
            )}
            {post.category === 'Events' && post.eventDate && (
                <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="font-semibold">Event Details:</p>
                    <p className="text-sm"><strong>Date:</strong> {post.eventDate}</p>
                    {post.eventTime && <p className="text-sm"><strong>Time:</strong> {post.eventTime}</p>}
                    <p className="text-sm"><strong>Location:</strong> {post.eventLocation}</p>
                </div>
            )}
            {post.itemType && (
                <p className="text-sm mt-2"><strong>{post.itemType} at:</strong> {post.location}</p>
            )}
          </div>
        </div>
      </div>
      <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
        {/* Reaction counts display */}
        <div className="flex items-center text-gray-500 dark:text-gray-400">
            {topReactions.length > 0 && (
                <div className="flex items-center">
                    {topReactions.slice(0, 3).map(r => (
                        <div key={r} className={`-ml-1 p-0.5 bg-gray-100 dark:bg-gray-900 rounded-full ${REACTION_COLORS[r]}`}>
                            <ReactionIcon reaction={r} className="h-4 w-4" />
                        </div>
                    ))}
                    <span className="ml-2 text-sm">{totalReactions}</span>
                </div>
            )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-4 text-gray-500 dark:text-gray-400">
          <div 
              className="relative"
              onMouseEnter={() => setShowReactionPicker(true)}
              onMouseLeave={() => setShowReactionPicker(false)}
          >
              <button className={`flex items-center space-x-1 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium capitalize ${currentUserReaction ? REACTION_COLORS[currentUserReaction] : ''}`}>
                  <ReactionIcon reaction={currentUserReaction || ReactionType.LIKE} />
                  <span>{currentUserReaction || 'Like'}</span>
              </button>
              {showReactionPicker && (
                  <div className="absolute bottom-full mb-2 flex space-x-1 bg-white dark:bg-gray-700 p-1 rounded-full shadow-lg border border-gray-200 dark:border-gray-600 z-20">
                    {Object.values(ReactionType).map(reaction => (
                      <button 
                          key={reaction} 
                          onClick={() => handleReactionClick(reaction)} 
                          className={`p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transform hover:scale-125 transition-transform ${REACTION_COLORS[reaction]}`}
                          title={reaction}
                      >
                          <ReactionIcon reaction={reaction} />
                      </button>
                    ))}
                  </div>
              )}
          </div>
          
          <button onClick={() => setShowComments(!showComments)} className="flex items-center space-x-1 hover:text-indigo-600 dark:hover:text-indigo-400">
            <ChatAltIcon className="h-5 w-5" />
            <span>{post.comments.length} Comments</span>
          </button>
        
          {showFullPost && (
            <button
              onClick={handleSummarize}
              disabled={isSummarizing}
              className="flex items-center space-x-1 hover:text-indigo-600 dark:hover:text-indigo-400 disabled:text-gray-400"
            >
              {isSummarizing ? <Spinner /> : <LightbulbIcon className="h-5 w-5" />}
              <span>{summary ? 'Show Summary' : 'Summarize'}</span>
            </button>
          )}
        </div>
      </div>
      {showComments && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            {post.comments.map(comment => <Comment key={comment.id} comment={comment} />)}
            <form onSubmit={handleCommentSubmit} className="flex items-start space-x-3 mt-4">
                <img src={currentUser.avatarUrl} alt={currentUser.name} className="h-8 w-8 rounded-full" />
                <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a comment..."
                    className="flex-1 p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                    Post
                </button>
            </form>
        </div>
      )}
    </div>
  );
};