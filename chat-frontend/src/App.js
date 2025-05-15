import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ChatProvider } from './contexts/ChatContext';
import PrivateRoute from './components/PrivateRoute';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import MainLayout from './components/Layout/MainLayout';
import ChatContainer from './components/Chat/ChatContainer';
import './styles/main.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <ChatProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route element={<MainLayout />}>
              <Route 
                path="/chat/*" 
                element={
                  <PrivateRoute>
                    <ChatContainer />
                  </PrivateRoute>
                } 
              />
            </Route>
            <Route path="/" element={<Navigate to="/chat" replace />} />
            <Route path="*" element={<Navigate to="/chat" replace />} />
          </Routes>
        </ChatProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;