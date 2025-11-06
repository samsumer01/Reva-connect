import React, { useState } from 'react';

interface CreateClubModalProps {
  onClose: () => void;
  onCreate: (newClubData: { name: string; description: string; bannerUrl: string }) => void;
}

export const CreateClubModal: React.FC<CreateClubModalProps> = ({ onClose, onCreate }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !description.trim()) {
        setError('Club Name and Description are required.');
        return;
    }
    onCreate({ name, description, bannerUrl });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Create a New Club</h2>
        <form onSubmit={handleSubmit}>
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <div className="mb-4">
            <label htmlFor="club-name" className="block text-gray-700 dark:text-gray-300 font-semibold mb-2">Club Name</label>
            <input 
                id="club-name"
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
                required 
            />
          </div>
          <div className="mb-4">
            <label htmlFor="club-description" className="block text-gray-700 dark:text-gray-300 font-semibold mb-2">Description</label>
            <textarea 
                id="club-description"
                rows={4} 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
                required 
            />
          </div>
          <div className="mb-4">
            <label htmlFor="club-banner" className="block text-gray-700 dark:text-gray-300 font-semibold mb-2">Banner URL (Optional)</label>
            <input 
                id="club-banner"
                type="text" 
                value={bannerUrl} 
                onChange={(e) => setBannerUrl(e.target.value)} 
                className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
                placeholder="https://images.unsplash.com/..."
            />
          </div>
          <div className="flex justify-end space-x-4 mt-6">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-md">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Create Club</button>
          </div>
        </form>
      </div>
    </div>
  );
};