import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

const ProfilePage: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);

  console.log(user)
  if (!user) {
    return <div className="text-center text-gray-500">Loading profile...</div>;
  }

  return (
    <div className="w-full max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-center">My Profile</h2>
      <div className="space-y-4">
        <div>
          <p className="text-gray-700 font-semibold">Name:</p>
          <p>{user.name}</p>
        </div>
        <div>
          <p className="text-gray-700 font-semibold">Email:</p>
          <p>{user.email}</p>
        </div>
        {user.skills && user.skills.length > 0 && (
          <div>
            <p className="text-gray-700 font-semibold">Skills:</p>
            <p>{user.skills.join(', ')}</p>
          </div>
        )}
        {user.bio && (
          <div>
            <p className="text-gray-700 font-semibold">Bio:</p>
            <p>{user.bio}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;