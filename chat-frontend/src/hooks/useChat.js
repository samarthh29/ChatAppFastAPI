import { useEffect, useCallback, useState } from 'react';
import { useAuth } from './useAuth';

export const useWebSocket = () => {
  const { user, token } = useAuth();
  const [socket, setSocket] = useState(null);

  const connectWebSocket = useCallback(() => {
    if (!user || !token) return;

    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${wsProtocol}//${window.location.host}/ws`;
    
    const newSocket = new WebSocket(wsUrl);
    
    newSocket.onopen = () => {
      console.log('WebSocket connected');
      // Authenticate with the server
      newSocket.send(JSON.stringify({
        type: 'auth',
        token
      }));
    };

    newSocket.onclose = () => {
      console.log('WebSocket disconnected');
    };

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [user, token]);

  useEffect(() => {
    const cleanup = connectWebSocket();
    return cleanup;
  }, [connectWebSocket]);

  const sendMessage = useCallback((message) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(message));
    }
  }, [socket]);

  const joinRoom = useCallback((roomId) => {
    sendMessage({ type: 'join', roomId });
  }, [sendMessage]);

  const leaveRoom = useCallback((roomId) => {
    sendMessage({ type: 'leave', roomId });
  }, [sendMessage]);

  const startPrivateChat = useCallback((otherUserId) => {
    sendMessage({ type: 'start_private', otherUserId });
  }, [sendMessage]);

  return {
    socket,
    sendMessage,
    joinRoom,
    leaveRoom,
    startPrivateChat
  };
};