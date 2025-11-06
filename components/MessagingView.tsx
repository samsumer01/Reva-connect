import React, { useState } from 'react';
import { Conversation, Message, UserProfile } from '../types';

interface MessagingViewProps {
  conversation: Conversation;
  currentUser: UserProfile;
}

export const MessagingView: React.FC<MessagingViewProps> = ({ conversation, currentUser }) => {
  const [messages, setMessages] = useState<Message[]>(conversation.messages);
  const [newMessage, setNewMessage] = useState('');

  const otherParticipant = conversation.participants.find(p => p.id !== currentUser.id) as UserProfile;

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const message: Message = {
      id: `msg-${Date.now()}`,
      sender: currentUser,
      text: newMessage.trim(),
      timestamp: new Date(),
    };
    setMessages([...messages, message]);
    setNewMessage('');
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800 shadow-lg rounded-lg">
      <header className="p-4 border-b dark:border-gray-700 flex items-center">
        <img src={otherParticipant.avatarUrl} alt={otherParticipant.name} className="h-10 w-10 rounded-full mr-3" />
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">{otherParticipant.name}</h2>
      </header>
      <main className="flex-1 p-4 overflow-y-auto">
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.sender.id === currentUser.id ? 'justify-end' : 'justify-start'} mb-4`}>
            <div className={`max-w-xs lg:max-w-md p-3 rounded-lg ${msg.sender.id === currentUser.id ? 'bg-indigo-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'}`}>
              <p>{msg.text}</p>
              <p className={`text-xs mt-1 ${msg.sender.id === currentUser.id ? 'text-indigo-200' : 'text-gray-500 dark:text-gray-400'} text-right`}>
                {msg.timestamp.toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
      </main>
      <footer className="p-4 border-t dark:border-gray-700">
        <form onSubmit={handleSendMessage} className="flex">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 p-2 border rounded-l-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-r-md hover:bg-indigo-700">
            Send
          </button>
        </form>
      </footer>
    </div>
  );
};
