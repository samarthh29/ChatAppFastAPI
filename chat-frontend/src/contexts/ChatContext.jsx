import { createContext, useContext, useState, useEffect } from 'react';
import { useWebSocket } from '../hooks/useChat';

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [currentRoom, setCurrentRoom] = useState(null);
  const [privateChats, setPrivateChats] = useState({});
  const [roomMessages, setRoomMessages] = useState({});
  const [activeUsers, setActiveUsers] = useState([]);
  
  const { sendMessage, joinRoom, leaveRoom, startPrivateChat } = useWebSocket();

  const sendRoomMessage = (roomId, content) => {
    sendMessage({ type: 'room', roomId, content });
  };

  const sendPrivateMessage = (receiverId, content) => {
    sendMessage({ type: 'private', receiverId, content });
  };

  const addRoomMessage = (roomId, message) => {
    setRoomMessages(prev => ({
      ...prev,
      [roomId]: [...(prev[roomId] || []), message]
    }));
  };

  const addPrivateMessage = (senderId, message) => {
    setPrivateChats(prev => ({
      ...prev,
      [senderId]: [...(prev[senderId] || []), message]
    }));
  };

  return (
    <ChatContext.Provider value={{
      currentRoom,
      setCurrentRoom,
      privateChats,
      roomMessages,
      activeUsers,
      sendRoomMessage,
      sendPrivateMessage,
      addRoomMessage,
      addPrivateMessage,
      joinRoom,
      leaveRoom,
      startPrivateChat
    }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);