
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../store';
import { login, signup } from '../slices/authSlice';
import { useNavigate, Link } from 'react-router-dom';

interface FormData {
  name?: string;
  email: string;
  password: string;
}

const AuthForm: React.FC<{ isSignup?: boolean }> = ({ isSignup = false }) => {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data: FormData) => {
    setError(null);
    setLoading(true);
    try {
      if (isSignup) {
        await dispatch(signup(data as { name: string; email: string; password: string })).unwrap();
      } else {
        await dispatch(login(data)).unwrap();
      }
      navigate('/feed');
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">DevHub</h1>
        <p className="text-gray-600 mt-2">
          {isSignup ? 'Create your developer account' : 'Sign in to your account'}
        </p>
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {isSignup && (
          <div>
            <input
              {...register('name', { required: 'Name is required' })}
              placeholder="Full Name"
              className="w-full border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
          </div>
        )}
        
        <div>
          <input
            {...register('email', { 
              required: 'Email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address'
              }
            })}
            type="email"
            placeholder="Email Address"
            className="w-full border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
        </div>
        
        <div>
          <input
            {...register('password', { 
              required: 'Password is required',
              minLength: {
                value: 6,
                message: 'Password must be at least 6 characters'
              }
            })}
            type="password"
            placeholder="Password"
            className="w-full border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white p-3 rounded-md hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Please wait...' : (isSignup ? 'Create Account' : 'Sign In')}
        </button>
        
      {error && <div className="text-red-500 mt-2">{error}</div>}
      </form>
      
      <div className="mt-6 text-center">
        <p className="text-gray-600">
          {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
          <Link
            to={isSignup ? '/login' : '/signup'}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            {isSignup ? 'Sign In' : 'Sign Up'}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default AuthForm;