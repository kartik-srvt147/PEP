import { Link, NavLink, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import { ShoppingBag, LogOut, User as UserIcon } from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-primary font-bold text-xl hover:opacity-90 transition-opacity">
          <ShoppingBag className="w-6 h-6" />
          <span>SmartStore AI</span>
        </Link>
        
        <nav className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  `text-slate-600 hover:text-primary font-medium transition-colors ${isActive ? 'text-primary' : ''}`
                }
              >
                Dashboard
              </NavLink>
              <NavLink
                to="/analytics"
                className={({ isActive }) =>
                  `text-slate-600 hover:text-primary font-medium transition-colors ${isActive ? 'text-primary' : ''}`
                }
              >
                Analytics
              </NavLink>
              <div className="flex items-center gap-2 ml-4 pl-4 border-l border-slate-200">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-600">
                  <UserIcon className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium text-slate-700 hidden sm:block">{user?.name}</span>
                <button 
                  onClick={handleLogout}
                  className="ml-2 text-slate-400 hover:text-red-500 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="text-slate-600 hover:text-primary font-medium transition-colors">
                Login
              </Link>
              <Link to="/signup" className="bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-600 transition-colors shadow-sm">
                Sign Up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
