import { useState, useRef, useEffect } from 'react';
import { PaperAirplaneIcon } from '@heroicons/react/24/solid';

const ChatInput = ({ onSend }) => {
  const [message, setMessage] = useState('');
  const textareaRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      onSend(message);
      setMessage('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-2">
      <div className="flex-1 bg-gray-100 rounded-lg p-2">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message..."
          rows={1}
          className="w-full bg-transparent border-none resize-none focus:ring-0 focus:outline-none"
        />
      </div>
      <button
        type="submit"
        disabled={!message.trim()}
        className="p-2 rounded-full bg-indigo-600 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-700 transition-colors"
      >
        <PaperAirplaneIcon className="h-5 w-5" />
      </button>
    </form>
  );
};

export default ChatInput;