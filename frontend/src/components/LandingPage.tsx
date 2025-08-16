import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

const LandingPage: React.FC = () => {
  const { isDark } = useSelector((state: RootState) => state.theme);

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
            <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
              <div className="sm:text-center lg:text-left">
                <h1 className={`text-4xl tracking-tight font-extrabold sm:text-5xl md:text-6xl ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  <span className="block xl:inline">Connect with</span>{' '}
                  <span className="block text-blue-600 xl:inline">Developers</span>
                </h1>
                <p className={`mt-3 text-base sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0 ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                  Join DevHub - the ultimate platform for developers to share knowledge, collaborate on projects, 
                  bookmark resources, and build meaningful connections in the tech community.
                </p>
                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                  <div className="rounded-md shadow">
                    <Link
                      to="/signup"
                      className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10 transition-colors"
                    >
                      Get Started
                    </Link>
                  </div>
                  <div className="mt-3 sm:mt-0 sm:ml-3">
                    <Link
                      to="/login"
                      className={`w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md transition-colors md:py-4 md:text-lg md:px-10 ${
                        isDark 
                          ? 'text-blue-400 bg-gray-800 hover:bg-gray-700' 
                          : 'text-blue-700 bg-blue-100 hover:bg-blue-200'
                      }`}
                    >
                      Sign In
                    </Link>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
        <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
          <div className={`h-56 w-full sm:h-72 md:h-96 lg:w-full lg:h-full flex items-center justify-center ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
            <div className="text-center">
              <div className="text-6xl mb-4">💻</div>
              <p className={`text-lg font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                Code • Share • Connect
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className={`py-12 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className={`text-base text-blue-600 font-semibold tracking-wide uppercase`}>
              Features
            </h2>
            <p className={`mt-2 text-3xl leading-8 font-extrabold tracking-tight sm:text-4xl ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Everything you need as a developer
            </p>
          </div>

          <div className="mt-10">
            <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                  📝
                </div>
                <p className={`ml-16 text-lg leading-6 font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Share Knowledge
                </p>
                <p className={`mt-2 ml-16 text-base ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                  Post coding questions, share solutions, and help fellow developers with markdown support.
                </p>
              </div>

              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                  💬
                </div>
                <p className={`ml-16 text-lg leading-6 font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Real-time Chat
                </p>
                <p className={`mt-2 ml-16 text-base ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                  Connect with developers through private messaging and group discussions.
                </p>
              </div>

              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                  🔖
                </div>
                <p className={`ml-16 text-lg leading-6 font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Bookmark Resources
                </p>
                <p className={`mt-2 ml-16 text-base ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                  Save trending repositories and useful resources with offline sync capability.
                </p>
              </div>

              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                  📊
                </div>
                <p className={`ml-16 text-lg leading-6 font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Track Progress
                </p>
                <p className={`mt-2 ml-16 text-base ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                  Monitor your activity, engagement, and growth within the developer community.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className={`${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <h2 className={`text-3xl font-extrabold tracking-tight sm:text-4xl ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <span className="block">Ready to dive in?</span>
            <span className="block text-blue-600">Start your developer journey today.</span>
          </h2>
          <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
            <div className="inline-flex rounded-md shadow">
              <Link
                to="/signup"
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                Join DevHub
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;