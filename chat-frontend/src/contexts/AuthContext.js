import { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  loginUser, 
  registerUser, 
  getCurrentUser,
  logoutUser 
} from '../services/auth';

// Create and export the context separately
export const AuthContext = createContext();

// Main provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Load user when token changes
  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          const userData = await getCurrentUser(token);
          setUser(userData);
          setError(null);
        } catch (err) {
          console.error('Failed to load user', err);
          logout();
        }
      }
      setLoading(false);
    };
    
    loadUser();
  }, [token]);

  // Login function
  const login = async (credentials) => {
    setLoading(true);
    setError(null);
    
    try {
      const { token: authToken, user: userData } = await loginUser(credentials);
      
      localStorage.setItem('token', authToken);
      setToken(authToken);
      setUser(userData);
      navigate('/chat');
      
      return { success: true };
    } catch (error) {
      setError(error.response?.data?.detail || 'Login failed');
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Login failed' 
      };
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (userData) => {
    setLoading(true);
    setError(null);
    
    try {
      const { token: authToken, user: userData } = await registerUser(userData);
      
      localStorage.setItem('token', authToken);
      setToken(authToken);
      setUser(userData);
      navigate('/chat');
      
      return { success: true };
    } catch (error) {
      setError(error.response?.data?.detail || 'Registration failed');
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Registration failed' 
      };
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await logoutUser(token);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
      navigate('/login');
    }
  };

  // Check if user is authenticated
  const isAuthenticated = () => {
    return !!user && !!token;
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user,
        token,
        loading,
        error,
        login,
        register,
        logout,
        isAuthenticated,
        setError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Export the context as default for easier consumption
export default AuthContext;