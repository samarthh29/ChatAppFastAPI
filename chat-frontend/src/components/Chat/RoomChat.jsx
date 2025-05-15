import { useState, useEffect, useRef } from 'react';
import { useChat, useAuth } from '../../hooks';
import ChatInput from './ChatInput';
import ChatMessage from './ChatMessage';

const RoomChat = ({ roomId }) => {
  const { user } = useAuth();
  const { roomMessages, sendRoomMessage, joinRoom, leaveRoom } = useChat();
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (roomId) {
      joinRoom(roomId);
      return () => leaveRoom(roomId);
    }
  }, [roomId, joinRoom, leaveRoom]);

  useEffect(() => {
    if (roomId && roomMessages[roomId]) {
      setMessages(roomMessages[roomId]);
    }
  }, [roomId, roomMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = (content) => {
    if (content.trim()) {
      sendRoomMessage(roomId, content);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <h2 className="text-xl font-semibold">Room: {roomId}</h2>
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

export default RoomChat;