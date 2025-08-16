import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { logout } from '../slices/authSlice';
import { toggleTheme } from '../slices/themeSlice';

const Navigation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { count } = useSelector((state: RootState) => state.notifications);
  const { isDark } = useSelector((state: RootState) => state.theme);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  if (!isAuthenticated) return null;
  console.log(user)

  const navItems = [
    { path: '/feed', label: 'Feed', icon: '🏠' },
    { path: '/bookmarks', label: 'Bookmarks', icon: '🔖' },
    { path: '/chat', label: 'Chat', icon: '💬' },
    { path: '/analytics', label: 'Analytics', icon: '📊' },
    { path: '/my-profile', label: 'My Profile', icon: '👤' },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 ${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} border-b shadow-sm`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/feed" className={`text-xl font-bold ${isDark ? 'text-blue-400' : 'text-blue-600'} hover:text-blue-500 transition-colors`}>
              DevHub
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  location.pathname === item.path
                    ? isDark 
                      ? 'bg-blue-900 text-blue-200' 
                      : 'bg-blue-100 text-blue-700'
                    : isDark
                      ? 'text-gray-300 hover:text-white hover:bg-gray-800'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </div>

          {/* Right side items */}
          <div className="flex items-center space-x-4">
            {/* Theme toggle */}
            <button
              onClick={() => dispatch(toggleTheme())}
              className={`p-2 rounded-md ${isDark ? 'text-gray-300 hover:text-white hover:bg-gray-800' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'} transition-colors`}
            >
              {isDark ? '☀️' : '🌙'}
            </button>

            {/* Notifications */}
            {count > 0 && (
              <div className="relative">
                <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {count > 99 ? '99+' : count}
                </span>
              </div>
            )}

            {/* User menu */}
            <div className="flex items-center space-x-3">
              <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                Hi, {user?.name}
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition-colors"
              >
                Logout
              </button>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`md:hidden p-2 rounded-md ${isDark ? 'text-gray-300 hover:text-white hover:bg-gray-800' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className={`px-2 pt-2 pb-3 space-y-1 ${isDark ? 'bg-gray-800' : 'bg-gray-50'} border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium ${
                    location.pathname === item.path
                      ? isDark 
                        ? 'bg-blue-900 text-blue-200' 
                        : 'bg-blue-100 text-blue-700'
                      : isDark
                        ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;