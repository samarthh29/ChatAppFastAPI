import { UserIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';

const ChatMessage = ({ message, isCurrentUser }) => {
  return (
    <div className={`flex gap-2 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
      {!isCurrentUser && (
        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
          <UserIcon className="h-5 w-5 text-gray-500" />
        </div>
      )}
      
      <div className={`max-w-xs md:max-w-md lg:max-w-lg ${isCurrentUser ? 'ml-auto' : 'mr-auto'}`}>
        <div className={`rounded-lg p-3 ${isCurrentUser ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}>
          {!isCurrentUser && (
            <div className="font-semibold text-sm mb-1">{message.sender_id}</div>
          )}
          <div className="whitespace-pre-wrap break-words">{message.content}</div>
          <div className={`text-xs mt-1 ${isCurrentUser ? 'text-indigo-200' : 'text-gray-500'}`}>
            {format(new Date(message.timestamp), 'HH:mm')}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;