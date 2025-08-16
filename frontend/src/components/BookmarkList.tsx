

import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { bookmarkResource, fetchTrending, syncBookmarks, fetchBookmarks } from '../slices/cacheSlice';

const BookmarkList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { bookmarks, trending } = useSelector((state: RootState) => state.cache);

  useEffect(() => {
    dispatch(syncBookmarks());
    dispatch(fetchTrending());
    dispatch(fetchBookmarks());
    const handleOnline = () => dispatch(syncBookmarks());
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [dispatch]);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 p-4">
      <div>
        <h2 className="text-xl font-bold mb-4">Trending Repos</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {trending.map((repo, i) => (
            <div key={i} className="bg-white p-4 rounded-lg shadow-md">
              <p className="font-semibold">{repo.name}</p>
              <p className="text-sm text-gray-600">{repo.description}</p>
              <button
                onClick={() => dispatch(bookmarkResource(repo))}
                className="mt-2 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
              >
                Bookmark
              </button>
            </div>
          ))}
        </div>
      </div>
      <div>
        <h2 className="text-xl font-bold mb-4">My Bookmarks</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {bookmarks.map((bookmark) => (
            <div key={bookmark._id} className="bg-white p-4 rounded-lg shadow-md">
              <p className="font-semibold">{bookmark.resource.name}</p>
              <p className="text-sm text-gray-600">{bookmark.resource.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BookmarkList;