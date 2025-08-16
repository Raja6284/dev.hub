import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { addNotification } from '../slices/notificationSlice';

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  skills: string[];
  bio: string;
  github?: string;
  linkedin?: string;
  website?: string;
  createdAt: string;
}

interface UserPost {
  _id: string;
  title: string;
  content: string;
  tags: string[];
  comments: any[];
  createdAt: string;
}

interface UserBookmark {
  _id: string;
  resource: {
    name: string;
    description: string;
    url: string;
  };
  createdAt: string;
}

const ImprovedProfilePage: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { isDark } = useSelector((state: RootState) => state.theme);
  const dispatch = useDispatch<AppDispatch>();
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [userPosts, setUserPosts] = useState<UserPost[]>([]);
  const [userBookmarks, setUserBookmarks] = useState<UserBookmark[]>([]);
  const [activeTab, setActiveTab] = useState<'about' | 'posts' | 'bookmarks'>('about');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch user profile
      const profileRes = await axios.get('/api/auth/profile', { headers });
      setProfile(profileRes.data.user);

      // Fetch user posts
      const postsRes = await axios.get(`/api/posts/user/${user?.id}`, { headers });
      setUserPosts(postsRes.data);

      // Fetch user bookmarks
      const bookmarksRes = await axios.get('/api/bookmarks', { headers });
      setUserBookmarks(bookmarksRes.data);

    } catch (error) {
      console.error('Error fetching user data:', error);
      dispatch(addNotification('Failed to load profile data'));
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className={`mt-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Profile not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      {/* Profile Header */}
      <div className={`rounded-xl shadow-lg overflow-hidden ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-32"></div>
        <div className="relative px-6 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end sm:space-x-6">
            <div className="relative -mt-16 mb-4 sm:mb-0">
              <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center text-4xl font-bold text-blue-600 shadow-lg">
                {profile.name.charAt(0).toUpperCase()}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {profile.name}
                  </h1>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {profile.email}
                  </p>
                  <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Member since {formatDate(profile.createdAt)}
                  </p>
                </div>
                <div className="mt-4 sm:mt-0">
                  <Link
                    to="/update-profile"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                  >
                    ✏️ Edit Profile
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className={`rounded-lg shadow-md ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6">
            {[
              { key: 'about', label: 'About Me', icon: '👤' },
              { key: 'posts', label: 'My Posts', icon: '📝', count: userPosts.length },
              { key: 'bookmarks', label: 'Bookmarks', icon: '🔖', count: userBookmarks.length }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : isDark
                      ? 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                    activeTab === tab.key
                      ? 'bg-blue-100 text-blue-800'
                      : isDark
                        ? 'bg-gray-700 text-gray-300'
                        : 'bg-gray-100 text-gray-600'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* About Tab */}
          {activeTab === 'about' && (
            <div className="space-y-6">
              <div>
                <h3 className={`text-lg font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Bio
                </h3>
                <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'} leading-relaxed`}>
                  {profile.bio || 'No bio available.'}
                </p>
              </div>

              <div>
                <h3 className={`text-lg font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {profile.skills && profile.skills.length > 0 ? (
                    profile.skills.map((skill, index) => (
                      <span
                        key={index}
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          isDark 
                            ? 'bg-blue-900 text-blue-200' 
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {skill}
                      </span>
                    ))
                  ) : (
                    <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      No skills listed.
                    </p>
                  )}
                </div>
              </div>

              {/* Social Links */}
              {(profile.github || profile.linkedin || profile.website) && (
                <div>
                  <h3 className={`text-lg font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Links
                  </h3>
                  <div className="space-y-2">
                    {profile.github && (
                      <a
                        href={profile.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex items-center space-x-2 text-sm hover:text-blue-600 transition-colors ${
                          isDark ? 'text-gray-300' : 'text-gray-700'
                        }`}
                      >
                        <span>🐙</span>
                        <span>GitHub</span>
                      </a>
                    )}
                    {profile.linkedin && (
                      <a
                        href={profile.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex items-center space-x-2 text-sm hover:text-blue-600 transition-colors ${
                          isDark ? 'text-gray-300' : 'text-gray-700'
                        }`}
                      >
                        <span>💼</span>
                        <span>LinkedIn</span>
                      </a>
                    )}
                    {profile.website && (
                      <a
                        href={profile.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex items-center space-x-2 text-sm hover:text-blue-600 transition-colors ${
                          isDark ? 'text-gray-300' : 'text-gray-700'
                        }`}
                      >
                        <span>🌐</span>
                        <span>Website</span>
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Posts Tab */}
          {activeTab === 'posts' && (
            <div className="space-y-4">
              {userPosts.length > 0 ? (
                userPosts.map((post) => (
                  <div
                    key={post._id}
                    className={`p-4 rounded-lg border transition-colors ${
                      isDark 
                        ? 'border-gray-700 hover:border-gray-600' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <h4 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {post.title}
                    </h4>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {post.tags.map((tag, index) => (
                        <span
                          key={index}
                          className={`px-2 py-1 text-xs rounded-full ${
                            isDark 
                              ? 'bg-gray-700 text-gray-300' 
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                    <div className={`flex items-center space-x-4 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      <span>💬 {post.comments.length} comments</span>
                      <span>📅 {formatDate(post.createdAt)}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">📝</div>
                  <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    No posts yet. Start sharing your knowledge!
                  </p>
                  <Link
                    to="/"
                    className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Create Your First Post
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Bookmarks Tab */}
          {activeTab === 'bookmarks' && (
            <div className="space-y-4">
              {userBookmarks.length > 0 ? (
                userBookmarks.map((bookmark) => (
                  <div
                    key={bookmark._id}
                    className={`p-4 rounded-lg border transition-colors ${
                      isDark 
                        ? 'border-gray-700 hover:border-gray-600' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <h4 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {bookmark.resource.name}
                    </h4>
                    <p className={`text-sm mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {bookmark.resource.description}
                    </p>
                    <div className={`flex items-center justify-between text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      <span>📅 {formatDate(bookmark.createdAt)}</span>
                      {bookmark.resource.url && (
                        <a
                          href={bookmark.resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-700 transition-colors"
                        >
                          View Resource →
                        </a>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">🔖</div>
                  <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    No bookmarks yet. Start saving useful resources!
                  </p>
                  <Link
                    to="/bookmarks"
                    className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Browse Resources
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImprovedProfilePage;