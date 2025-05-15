import { useState } from 'react';
import {
  ChatBubbleLeftRightIcon,
  UserGroupIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../../hooks/useAuth';
import { NavLink } from 'react-router-dom';

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('chats');

  if (!isOpen) return null;

  const navigation = [
    { name: 'Rooms', href: '/chat', icon: ChatBubbleLeftRightIcon, current: activeTab === 'chats' },
    { name: 'Contacts', href: '/chat/contacts', icon: UserGroupIcon, current: activeTab === 'contacts' },
    { name: 'Settings', href: '/chat/settings', icon: Cog6ToothIcon, current: activeTab === 'settings' },
  ];

  return (
    <div className="fixed inset-0 z-40 md:relative md:inset-auto">
      {/* Overlay for mobile */}
      <div 
        className="fixed inset-0 bg-gray-600 bg-opacity-75 md:hidden" 
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative flex flex-col flex-1 w-64 h-full max-w-xs bg-white border-r border-gray-200">
        <div className="flex flex-col flex-1 pt-5 pb-4 overflow-y-auto">
          {/* User profile */}
          <div className="flex items-center flex-shrink-0 px-4 mb-6">
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                <span className="text-indigo-600 font-medium">
                  {user?.username?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">{user?.username}</p>
                <p className="text-xs font-medium text-gray-500">Online</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 space-y-1">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) => 
                  `group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    isActive 
                      ? 'bg-indigo-50 text-indigo-700' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
                onClick={() => setActiveTab(item.name.toLowerCase())}
              >
                <item.icon
                  className={`mr-3 flex-shrink-0 h-5 w-5 ${
                    activeTab === item.name.toLowerCase()
                      ? 'text-indigo-500'
                      : 'text-gray-400 group-hover:text-gray-500'
                  }`}
                  aria-hidden="true"
                />
                {item.name}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;