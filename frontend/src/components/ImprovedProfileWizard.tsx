import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { AppDispatch, RootState } from '../store';
import { addNotification } from '../slices/notificationSlice';
import { useNavigate } from 'react-router-dom';

interface Step1Data {
  name: string;
  email: string;
}

interface Step2Data {
  skills: string;
  bio: string;
}

interface Step3Data {
  github: string;
  linkedin: string;
  website: string;
}

type FormData = Step1Data & Step2Data & Step3Data;

const ImprovedProfileWizard: React.FC = () => {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<FormData>>({});
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const { isDark } = useSelector((state: RootState) => state.theme);

  const totalSteps = 3;
  const watchedFields = watch();

  useEffect(() => {
    // Load existing user data
    if (user) {
      setValue('name', user.name || '');
      setValue('email', user.email || '');
      setValue('skills', user.skills?.join(', ') || '');
      setValue('bio', user.bio || '');
    }

    // Load saved progress from localStorage
    const savedData = localStorage.getItem('profileWizardData');
    const savedStep = localStorage.getItem('profileWizardStep');
    
    if (savedData) {
      const data = JSON.parse(savedData);
      setFormData(data);
      Object.keys(data).forEach(key => {
        setValue(key as keyof FormData, data[key]);
      });
    }
    
    if (savedStep) {
      setCurrentStep(parseInt(savedStep));
    }
  }, [setValue, user]);

  const saveProgress = (data: Partial<FormData>, step: number) => {
    const updatedData = { ...formData, ...data };
    setFormData(updatedData);
    localStorage.setItem('profileWizardData', JSON.stringify(updatedData));
    localStorage.setItem('profileWizardStep', step.toString());
  };

  const nextStep = () => {
    const currentData = getCurrentStepData();
    saveProgress(currentData, currentStep + 1);
    setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
    localStorage.setItem('profileWizardStep', (currentStep - 1).toString());
  };

  const getCurrentStepData = () => {
    switch (currentStep) {
      case 1:
        return { name: watchedFields.name, email: watchedFields.email };
      case 2:
        return { skills: watchedFields.skills, bio: watchedFields.bio };
      case 3:
        return { 
          github: watchedFields.github, 
          linkedin: watchedFields.linkedin, 
          website: watchedFields.website 
        };
      default:
        return {};
    }
  };

  const onSubmit = async (data: FormData) => {
    if (currentStep < totalSteps) {
      nextStep();
      return;
    }

    setIsLoading(true);
    try {
      const finalData = { ...formData, ...data };
      await axios.put(
        '/api/auth/profile',
        { 
          ...finalData, 
          skills: finalData.skills?.split(',').map(s => s.trim()).filter(s => s),
          profileStep: totalSteps 
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        },
      );
      
      // Clear saved progress
      localStorage.removeItem('profileWizardData');
      localStorage.removeItem('profileWizardStep');
      
      dispatch(addNotification('Profile setup completed successfully!'));
      navigate('/my-profile');
    } catch (err) {
      dispatch(addNotification('Failed to update profile'));
    } finally {
      setIsLoading(false);
    }
  };

  const getStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">👤</span>
              </div>
              <h3 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Basic Information
              </h3>
              <p className={`text-sm mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Let's start with your basic details
              </p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Full Name *
                </label>
                <input
                  {...register('name', { required: 'Name is required' })}
                  className={`w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  placeholder="Enter your full name"
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Email Address *
                </label>
                <input
                  {...register('email', { 
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address'
                    }
                  })}
                  type="email"
                  className={`w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  placeholder="Enter your email address"
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
              </div>
            </div>
          </div>
        );
      
      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🛠️</span>
              </div>
              <h3 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Skills & Bio
              </h3>
              <p className={`text-sm mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Tell us about your technical expertise
              </p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Technical Skills *
                </label>
                <input
                  {...register('skills', { required: 'Skills are required' })}
                  className={`w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  placeholder="e.g., JavaScript, React, Node.js, Python, MongoDB"
                />
                {errors.skills && <p className="text-red-500 text-sm mt-1">{errors.skills.message}</p>}
                <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Separate skills with commas
                </p>
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Bio *
                </label>
                <textarea
                  {...register('bio', { required: 'Bio is required' })}
                  rows={4}
                  className={`w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  placeholder="Tell us about yourself, your experience, and what you're passionate about..."
                />
                {errors.bio && <p className="text-red-500 text-sm mt-1">{errors.bio.message}</p>}
              </div>
            </div>
          </div>
        );
      
      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔗</span>
              </div>
              <h3 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Social Links
              </h3>
              <p className={`text-sm mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Connect your professional profiles (optional)
              </p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  GitHub Profile
                </label>
                <input
                  {...register('github')}
                  className={`w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  placeholder="https://github.com/yourusername"
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  LinkedIn Profile
                </label>
                <input
                  {...register('linkedin')}
                  className={`w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  placeholder="https://linkedin.com/in/yourusername"
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Personal Website
                </label>
                <input
                  {...register('website')}
                  className={`w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  placeholder="https://yourwebsite.com"
                />
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className={`w-full max-w-md p-8 rounded-xl shadow-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Step {currentStep} of {totalSteps}
            </span>
            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {Math.round((currentStep / totalSteps) * 100)}% Complete
            </span>
          </div>
          <div className={`w-full bg-gray-200 rounded-full h-2 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            ></div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {getStepContent()}
          
          <div className="flex space-x-3 pt-6">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={prevStep}
                className={`flex-1 px-4 py-3 border rounded-lg font-medium transition-colors ${
                  isDark
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Previous
              </button>
            )}
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Processing...
                </div>
              ) : (
                currentStep < totalSteps ? 'Next Step' : 'Complete Profile'
              )}
            </button>
          </div>
        </form>
        
        {currentStep > 1 && (
          <div className="mt-6 text-center">
            <button
              onClick={() => {
                localStorage.removeItem('profileWizardData');
                localStorage.removeItem('profileWizardStep');
                navigate('/');
              }}
              className={`text-sm ${isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'} transition-colors`}
            >
              Skip for now
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImprovedProfileWizard;