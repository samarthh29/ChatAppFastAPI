import { Outlet } from 'react-router-dom';
import Navbar from '../Layout/Navbar';
import { useAuth } from '../../hooks/useAuth';

const ChatLayout = () => {
  const { user, logout } = useAuth();

  return (
    <div className="flex flex-col h-screen">
      <Navbar user={user} onLogout={logout} />
      <div className="flex-1 overflow-hidden">
        <Outlet />
      </div>
    </div>
  );
};

export default ChatLayout;