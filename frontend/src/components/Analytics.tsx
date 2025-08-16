import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import axios from 'axios';

interface AnalyticsData {
  activities: Array<{ _id: string; count: number }>;
  postStats: {
    totalPosts: number;
    totalComments: number;
  };
  recentActivity: Array<{
    _id: string;
    action: string;
    createdAt: string;
    target: string;
  }>;
  topPosts: Array<{
    _id: string;
    title: string;
    comments: any[];
  }>;
}

const Analytics: React.FC = () => {
  const { isDark } = useSelector((state: RootState) => state.theme);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await axios.get('/api/analytics', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setAnalytics(response.data);
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="w-full max-w-6xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className={`mt-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="w-full max-w-6xl mx-auto p-6">
        <div className="text-center py-12">
          <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Failed to load analytics data</p>
        </div>
      </div>
    );
  }

  const getActivityIcon = (action: string) => {
    switch (action) {
      case 'create_post': return '📝';
      case 'like_post': return '❤️';
      case 'comment': return '💬';
      case 'view_post': return '👁️';
      case 'bookmark': return '🔖';
      default: return '📊';
    }
  };

  const formatAction = (action: string) => {
    return action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          📊 Your Analytics Dashboard
        </h1>
        <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Track your engagement and activity on DevHub
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className={`p-6 rounded-lg shadow-md ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              📝
            </div>
            <div className="ml-4">
              <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Total Posts
              </p>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {analytics.postStats.totalPosts}
              </p>
            </div>
          </div>
        </div>


        <div className={`p-6 rounded-lg shadow-md ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600">
              💬
            </div>
            <div className="ml-4">
              <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Total Comments
              </p>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {analytics.postStats.totalComments}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Breakdown */}
        <div className={`p-6 rounded-lg shadow-md ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Activity Breakdown
          </h3>
          <div className="space-y-3">
            {analytics.activities.map((activity) => (
              <div key={activity._id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-xl">{getActivityIcon(activity._id)}</span>
                  <span className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {formatAction(activity._id)}
                  </span>
                </div>
                <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {activity.count}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Posts */}
        <div className={`p-6 rounded-lg shadow-md ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Top Performing Posts
          </h3>
          <div className="space-y-3">
            {analytics.topPosts.map((post, index) => (
              <div key={post._id} className={`p-3 rounded-md ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className={`font-medium text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {post.title}
                    </h4>
                    <div className={`flex items-center space-x-4 mt-1 text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      <span>💬 {post.comments?.length || 0}</span>
                    </div>
                  </div>
                  <span className={`text-xs font-semibold ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    #{index + 1}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className={`p-6 rounded-lg shadow-md ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Recent Activity
        </h3>
        <div className="space-y-3">
          {analytics.recentActivity.map((activity) => (
            <div key={activity._id} className="flex items-center space-x-3">
              <span className="text-lg">{getActivityIcon(activity.action)}</span>
              <div className="flex-1">
                <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  You {formatAction(activity.action).toLowerCase()}
                </p>
                <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                  {new Date(activity.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Analytics;