import React, { useState } from 'react';
import { Post } from '../types';

interface EditPostModalProps {
  post: Post;
  onClose: () => void;
  onSave: (postId: string, newTitle: string, newContent: string) => void;
}

export const EditPostModal: React.FC<EditPostModalProps> = ({ post, onClose, onSave }) => {
  const [title, setTitle] = useState(post.title);
  const [content, setContent] = useState(post.content);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(post.id, title, content);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Edit Post</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="edit-title" className="block text-gray-700 dark:text-gray-300 font-semibold mb-2">Title</label>
            <input
              id="edit-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="edit-content" className="block text-gray-700 dark:text-gray-300 font-semibold mb-2">Content</label>
            <textarea
              id="edit-content"
              rows={6}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <div className="flex justify-end space-x-4 mt-6">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-md">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
};
