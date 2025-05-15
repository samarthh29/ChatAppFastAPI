import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const getAuthHeaders = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

export const getRooms = async (token) => {
  try {
    const response = await axios.get(`${API_URL}/rooms`, getAuthHeaders(token));
    return response.data.rooms;
  } catch (error) {
    console.error('Error fetching rooms:', error);
    throw error;
  }
};

export const createRoom = async (roomId, token) => {
  try {
    const response = await axios.post(
      `${API_URL}/rooms/create`,
      { room_id: roomId },
      getAuthHeaders(token)
    );
    return response.data;
  } catch (error) {
    console.error('Error creating room:', error);
    throw error;
  }
};

export const getRoomHistory = async (roomId, token, limit = 100) => {
  try {
    const response = await axios.get(
      `${API_URL}/rooms/${roomId}/history?limit=${limit}`,
      getAuthHeaders(token)
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching room history:', error);
    throw error;
  }
};

export const getPrivateHistory = async (otherUserId, token, limit = 100) => {
  try {
    const response = await axios.get(
      `${API_URL}/private/history/${otherUserId}?limit=${limit}`,
      getAuthHeaders(token)
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching private history:', error);
    throw error;
  }
};

export const getUnifiedConversations = async (token, limit = 100) => {
  try {
    const response = await axios.get(
      `${API_URL}/conversations/unified?limit=${limit}`,
      getAuthHeaders(token)
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching unified conversations:', error);
    throw error;
  }
};