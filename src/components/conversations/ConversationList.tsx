'use client';

import { useState } from 'react';
import { Conversation } from '@/lib/database';

type ConversationListProps = {
  conversations: Conversation[];
  onSelect: (conversationId: string) => void;
  selectedId?: string;
};

export default function ConversationList({ 
  conversations, 
  onSelect, 
  selectedId 
}: ConversationListProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Conversations
        </h2>
      </div>
      <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-96 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
            No conversations found
          </div>
        ) : (
          conversations.map((conversation) => (
            <div 
              key={conversation.id}
              onClick={() => onSelect(conversation.id)}
              className={`p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                selectedId === conversation.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
              }`}
            >
              <h3 className="text-md font-medium text-gray-900 dark:text-white mb-1 truncate">
                {conversation.title}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {new Date(conversation.created_at).toLocaleDateString()}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
