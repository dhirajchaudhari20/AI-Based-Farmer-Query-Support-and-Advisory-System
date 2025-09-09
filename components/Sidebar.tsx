import React from 'react';
import type { ChatMetadata, LanguageCode } from '../types';
import { TRANSLATIONS } from '../constants';
import NewChatIcon from './icons/NewChatIcon';
import TrashIcon from './icons/TrashIcon';

interface SidebarProps {
  isOpen: boolean;
  chats: ChatMetadata[];
  activeChatId: string | null;
  onNewChat: () => void;
  onSelectChat: (id: string) => void;
  onDeleteChat: (id: string) => void;
  language: LanguageCode;
}

const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  chats,
  activeChatId,
  onNewChat,
  onSelectChat,
  onDeleteChat,
  // Fix: Destructure the language prop to make it available within the component.
  language,
}) => {
  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Prevent onSelectChat from firing
    onDeleteChat(id);
  };

  return (
    <aside
      className={`absolute md:relative z-20 flex flex-col bg-slate-50 dark:bg-gray-800 border-r border-slate-200 dark:border-gray-700 transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } md:translate-x-0 w-64 h-full flex-shrink-0`}
    >
      <div className="p-4 border-b border-slate-200 dark:border-gray-700">
        <button
          onClick={onNewChat}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-500 rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:focus:ring-offset-gray-800 transition-colors"
        >
          <NewChatIcon />
          <span>{TRANSLATIONS.newChat[language]}</span>
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto">
        <ul className="p-2 space-y-1">
          {chats.map((chat) => (
            <li key={chat.id}>
              <button
                onClick={() => onSelectChat(chat.id)}
                className={`w-full text-left text-sm px-3 py-2 rounded-md transition-colors group flex justify-between items-center ${
                  activeChatId === chat.id
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200'
                    : 'text-gray-600 hover:bg-slate-200/70 dark:text-gray-300 dark:hover:bg-gray-700/70'
                }`}
              >
                <span className="truncate flex-1 pr-2">{chat.title}</span>
                 <span
                    onClick={(e) => handleDelete(e, chat.id)}
                    className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 dark:hover:text-red-400 p-1"
                    title="Delete chat"
                  >
                   <TrashIcon />
                </span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;