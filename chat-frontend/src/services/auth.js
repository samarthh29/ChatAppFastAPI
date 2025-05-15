import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Helper function for auth headers
const getAuthHeaders = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

// Login user
export const loginUser = async (credentials) => {
  const formData = new FormData();
  formData.append('username', credentials.username);
  formData.append('password', credentials.password);

  const response = await axios.post(`${API_URL}/token`, formData);
  
  return {
    token: response.data.access_token,
    user: { username: credentials.username }
  };
};

// Register new user
export const registerUser = async (userData) => {
  const response = await axios.post(
    `${API_URL}/create_user/${userData.username}`,
    { password: userData.password }
  );
  
  // After registration, automatically log the user in
  const loginResponse = await loginUser({
    username: userData.username,
    password: userData.password
  });
  
  return loginResponse;
};

// Get current user data
export const getCurrentUser = async (token) => {
  try {
    const response = await axios.get(
      `${API_URL}/protected`, 
      getAuthHeaders(token)
    );
    
    // Extract username from the protected route message
    // Adjust this based on your actual API response
    const username = response.data.message.split(' ')[1].replace(',', '');
    return { username };
  } catch (error) {
    throw new Error('Failed to fetch user data');
  }
};

// Logout user
export const logoutUser = async (token) => {
  // If your backend has a logout endpoint, you would call it here
  // For JWT, we typically just remove the token client-side
  return Promise.resolve();
};