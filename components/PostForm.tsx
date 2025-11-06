import React, { useState, useRef, useEffect } from 'react';
import { Category, ItemType, DraftPost, UserProfile } from '../types';
import { suggestPostTitle } from '../services/geminiService';
import { Spinner } from './Spinner';
import { LightbulbIcon, PlusCircleIcon, DocumentSaveIcon, PaperClipIcon, XCircleIcon } from './Icons';

interface PostFormProps {
    currentUser: UserProfile;
    onNewPost: (post: { 
        title: string, 
        content: string, 
        category: Category, 
        itemType?: ItemType, 
        location?: string,
        eventDate?: string,
        eventTime?: string,
        eventLocation?: string,
    }, mediaFile: File | null) => void;
    onSaveDraft: (draft: Omit<DraftPost, 'draftId'>, mediaFile: File | null) => void;
}

export const PostForm: React.FC<PostFormProps> = ({ currentUser, onNewPost, onSaveDraft }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [category, setCategory] = useState<Category>(Category.SOCIAL);
    // Lost & Found fields
    const [itemType, setItemType] = useState<ItemType | undefined>();
    const [location, setLocation] = useState('');
    // Event fields
    const [eventDate, setEventDate] = useState('');
    const [eventTime, setEventTime] = useState('');
    const [eventLocation, setEventLocation] = useState('');

    const [mediaFile, setMediaFile] = useState<File | null>(null);
    const [mediaPreview, setMediaPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [isSuggestingTitle, setIsSuggestingTitle] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    useEffect(() => {
        // Clean up the object URL to avoid memory leaks
        return () => {
            if (mediaPreview) {
                URL.revokeObjectURL(mediaPreview);
            }
        };
    }, [mediaPreview]);
    
    const resetForm = () => {
        setTitle('');
        setContent('');
        setCategory(Category.SOCIAL);
        setItemType(undefined);
        setLocation('');
        setEventDate('');
        setEventTime('');
        setEventLocation('');
        removeMedia(); // Use removeMedia to handle cleanup
        setErrors({});
    };

    const handleSuggestTitle = async () => {
        if (!content) return;
        setIsSuggestingTitle(true);
        try {
            const suggestedTitle = await suggestPostTitle(content);
            setTitle(suggestedTitle);
        } catch (error) {
            console.error("Failed to suggest title", error);
        } finally {
            setIsSuggestingTitle(false);
        }
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        // Revoke the old URL if a new file is selected
        if (mediaPreview) {
            URL.revokeObjectURL(mediaPreview);
        }
        const file = event.target.files?.[0];
        if (file) {
            setMediaFile(file);
            setMediaPreview(URL.createObjectURL(file));
        } else {
            setMediaFile(null);
            setMediaPreview(null);
        }
    };

    const removeMedia = () => {
        if (mediaPreview) {
            URL.revokeObjectURL(mediaPreview);
        }
        setMediaFile(null);
        setMediaPreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };
    
    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};
        if (!content.trim()) {
            newErrors.content = 'Post content cannot be empty.';
        }
        if (category === Category.LOST_FOUND) {
            if (!itemType) newErrors.itemType = 'Please select a type (Lost or Found).';
            if (!location.trim()) newErrors.location = 'Please provide a location.';
        }
        if (category === Category.EVENTS) {
            if (!eventDate) newErrors.eventDate = 'Please select a date for the event.';
            if (!eventLocation.trim()) newErrors.eventLocation = 'Please provide a location for the event.';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        onNewPost({ 
            title: title.trim() || 'Untitled Post', 
            content: content.trim(), 
            category, 
            itemType, 
            location: location.trim(),
            eventDate,
            eventTime,
            eventLocation: eventLocation.trim()
        }, mediaFile);

        resetForm();
    };

    const handleSaveDraft = () => {
        if (!content.trim()) {
            setErrors({ content: 'Draft content cannot be empty.'});
            return;
        }
        
        onSaveDraft({
            title: title.trim(),
            content: content.trim(),
            category,
            itemType,
            location: location.trim(),
            eventDate,
            eventTime,
            eventLocation: eventLocation.trim(),
        }, mediaFile);

        resetForm();
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md mb-6">
            <form onSubmit={handleSubmit}>
                <textarea
                    className={`w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white ${errors.content ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                    rows={3}
                    placeholder={`What's on your mind, ${currentUser.name.split(' ')[0]}?`}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    aria-invalid={!!errors.content}
                    aria-describedby="content-error"
                ></textarea>
                 {errors.content && <p id="content-error" className="text-red-500 text-sm mt-1">{errors.content}</p>}

                {mediaPreview && (
                    <div className="mt-4 relative">
                        {mediaFile?.type.startsWith('image/') ? (
                           <img src={mediaPreview} alt="Preview" className="rounded-lg max-h-64 w-full object-contain" />
                        ) : (
                           <video src={mediaPreview} controls className="rounded-lg max-h-64 w-full" />
                        )}
                        <button type="button" onClick={removeMedia} className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full p-1">
                            <XCircleIcon className="h-6 w-6" />
                        </button>
                    </div>
                )}
                
                <div className="flex items-center mt-2 space-x-2">
                    <input
                        type="text"
                        className="flex-grow p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        placeholder="Title (optional)"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                    <button
                        type="button"
                        onClick={handleSuggestTitle}
                        disabled={isSuggestingTitle || !content}
                        className="flex items-center px-3 py-2 bg-yellow-400 text-white rounded-md hover:bg-yellow-500 disabled:bg-gray-400"
                    >
                        {isSuggestingTitle ? <Spinner /> : <LightbulbIcon className="h-5 w-5" />}
                        <span className="ml-2">Suggest</span>
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value as Category)}
                        className="p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                        {Object.values(Category).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                </div>
                
                {category === Category.LOST_FOUND && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div>
                            <select onChange={(e) => setItemType(e.target.value as ItemType)} value={itemType || ''} className={`w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white ${errors.itemType ? 'border-red-500' : ''}`}>
                                <option value="" disabled>Select Type...</option>
                                <option value={ItemType.LOST}>Lost</option>
                                <option value={ItemType.FOUND}>Found</option>
                            </select>
                             {errors.itemType && <p className="text-red-500 text-sm mt-1">{errors.itemType}</p>}
                        </div>
                        <div>
                            <input type="text" placeholder="Last seen/found location" value={location} onChange={e => setLocation(e.target.value)} className={`w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white ${errors.location ? 'border-red-500' : ''}`} />
                            {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}
                        </div>
                    </div>
                )}
                
                {category === Category.EVENTS && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        <div>
                           <input type="date" value={eventDate} onChange={e => setEventDate(e.target.value)} className={`w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white ${errors.eventDate ? 'border-red-500' : ''}`} />
                            {errors.eventDate && <p className="text-red-500 text-sm mt-1">{errors.eventDate}</p>}
                        </div>
                        <input type="time" placeholder="Time (optional)" value={eventTime} onChange={e => setEventTime(e.target.value)} className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                        <div>
                            <input type="text" placeholder="Event Location" value={eventLocation} onChange={e => setEventLocation(e.target.value)} className={`w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white ${errors.eventLocation ? 'border-red-500' : ''}`} />
                            {errors.eventLocation && <p className="text-red-500 text-sm mt-1">{errors.eventLocation}</p>}
                        </div>
                    </div>
                )}

                <div className="flex justify-between items-center mt-4">
                     <div className="flex items-center">
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            className="hidden"
                            accept="image/*,video/*"
                        />
                        <button 
                            type="button" 
                            onClick={() => fileInputRef.current?.click()} 
                            className="flex items-center p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-200"
                            aria-label="Add Photo or Video"
                        >
                            <PaperClipIcon className="h-6 w-6" />
                            <span className="ml-2 text-sm font-medium">Add Photo/Video</span>
                        </button>
                    </div>
                    <div className="flex items-center space-x-2">
                        <button type="button" onClick={handleSaveDraft} className="flex items-center px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600">
                            <DocumentSaveIcon className="h-5 w-5" />
                            <span className="ml-2">Save Draft</span>
                        </button>
                        <button type="submit" className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                            <PlusCircleIcon className="h-5 w-5" />
                            <span className="ml-2">Post</span>
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};