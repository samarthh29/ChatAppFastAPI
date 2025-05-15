import { useState, useEffect, useRef } from 'react';
import { useChat, useAuth } from '../../hooks';
import ChatInput from './ChatInput';
import ChatMessage from './ChatMessage';

const PrivateChat = ({ otherUserId }) => {
  const { user } = useAuth();
  const { privateChats, sendPrivateMessage, startPrivateChat } = useChat();
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (otherUserId) {
      startPrivateChat(otherUserId);
    }
  }, [otherUserId, startPrivateChat]);

  useEffect(() => {
    if (otherUserId && privateChats[otherUserId]) {
      setMessages(privateChats[otherUserId]);
    }
  }, [otherUserId, privateChats]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = (content) => {
    if (content.trim()) {
      sendPrivateMessage(otherUserId, content);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <h2 className="text-xl font-semibold">Chat with {otherUserId}</h2>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => (
          <ChatMessage 
            key={index}
            message={msg}
            isCurrentUser={msg.sender_id === user.username}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="p-4 border-t">
        <ChatInput onSend={handleSendMessage} />
      </div>
    </div>
  );
};

export default PrivateChat;