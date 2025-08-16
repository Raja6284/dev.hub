import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import AuthForm from './components/AuthForm';
import ImprovedProfileWizard from './components/ImprovedProfileWizard';
import PostFeed from './components/PostFeed';
import BookmarkList from './components/BookmarkList';
import PrivateChatRoom from './components/PrivateChatRoom';
import Analytics from './components/Analytics';
import NotificationToast from './components/NotificationToast';
import PrivateRoute from './components/PrivateRoute';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from './store';
import { setTheme } from './slices/themeSlice';
import PublicRoute from './components/PublicRoute';
import ImprovedProfilePage from './components/ImprovedProfilePage';
import LandingPage from './components/LandingPage';

const App: React.FC = () => {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const { isDark } = useSelector((state: RootState) => state.theme);
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    // Initialize theme
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldBeDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
    
    dispatch(setTheme(shouldBeDark));
    document.documentElement.classList.toggle('dark', shouldBeDark);
  }, [dispatch]);

  return (
    <div className={isDark ? 'dark' : ''}>
      <Router>
        <NotificationToast />
        <div className={`min-h-screen transition-colors ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
          {isAuthenticated && <Navigation />}
          <div className={`${isAuthenticated ? 'pt-16' : ''} min-h-screen flex flex-col items-center justify-center p-4 md:p-8`}>
            <Routes>
                <Route element={<PublicRoute />}>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<AuthForm />} />
                <Route path="/signup" element={<AuthForm isSignup />} />
                </Route>
              <Route element={<PrivateRoute />}>
                <Route path="/update-profile" element={<ImprovedProfileWizard />} />
                <Route path="/feed" element={<PostFeed />} />
                <Route path="/bookmarks" element={<BookmarkList />} />
                <Route path="/chat" element={<PrivateChatRoom />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/my-profile" element={<ImprovedProfilePage />} />
              </Route>
            </Routes>
          </div>
        </div>
      </Router>
    </div>
  );
};

export default App;