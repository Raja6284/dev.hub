import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { AppDispatch, RootState } from '../store';
import { addNotification } from '../slices/notificationSlice';
import { useNavigate } from 'react-router-dom';

interface FormData {
  name: string;
  skills: string;
  bio: string;
}

const ProfileWizard: React.FC = () => {
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormData>();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<FormData>>({});
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const { isDark } = useSelector((state: RootState) => state.theme);

  const totalSteps = 3;

  useEffect(() => {
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
      setStep(parseInt(savedStep));
    }
  }, [setValue]);

  const saveProgress = (data: Partial<FormData>, currentStep: number) => {
    const updatedData = { ...formData, ...data };
    setFormData(updatedData);
    localStorage.setItem('profileWizardData', JSON.stringify(updatedData));
    localStorage.setItem('profileWizardStep', currentStep.toString());
  };

  const onSubmit = async (data: FormData) => {
    if (step < totalSteps) {
      saveProgress(data, step + 1);
      setStep(step + 1);
      return;
    }

    try {
      const finalData = { ...formData, ...data };
      await axios.put(
        '/api/auth/profile',
        { ...finalData, profileStep: totalSteps },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        },
      );
      
      // Clear saved progress
      localStorage.removeItem('profileWizardData');
      localStorage.removeItem('profileWizardStep');
      
      dispatch(addNotification('Profile setup completed successfully!'));
      navigate('/');
    } catch (err) {
      dispatch(addNotification('Failed to update profile'));
    }
  };

  const goBack = () => {
    if (step > 1) {
      setStep(step - 1);
      localStorage.setItem('profileWizardStep', (step - 1).toString());
    }
  };

  const getStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Let's start with your basic information
              </h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Tell us your name so others can recognize you
              </p>
            </div>
            <input
              {...register('name', { required: 'Name is required' })}
              placeholder="Your full name"
              defaultValue={user?.name}
              className={`w-full border p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
            {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
          </div>
        );
      
      case 2:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                What are your technical skills?
              </h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                List your programming languages, frameworks, and tools
              </p>
            </div>
            <input
              {...register('skills', { required: 'Skills are required' })}
              placeholder="e.g., JavaScript, React, Node.js, Python"
              className={`w-full border p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
            {errors.skills && <p className="text-red-500 text-sm">{errors.skills.message}</p>}
            <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Separate skills with commas
            </div>
          </div>
        );
      
      case 3:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Tell us about yourself
              </h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Write a brief bio to help others understand your background
              </p>
            </div>
            <textarea
              {...register('bio', { required: 'Bio is required' })}
              placeholder="I'm a passionate developer who loves building amazing applications..."
              rows={4}
              className={`w-full border p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
            {errors.bio && <p className="text-red-500 text-sm">{errors.bio.message}</p>}
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className={`w-full max-w-md mx-auto p-6 rounded-lg shadow-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Step {step} of {totalSteps}
          </span>
          <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            {Math.round((step / totalSteps) * 100)}%
          </span>
        </div>
        <div className={`w-full bg-gray-200 rounded-full h-2 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          ></div>
        </div>
      </div>

      <h2 className={`text-2xl font-bold mb-6 text-center ${isDark ? 'text-white' : 'text-gray-900'}`}>
        Profile Setup
      </h2>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {getStepContent()}
        
        <div className="flex space-x-3">
          {step > 1 && (
            <button
              type="button"
              onClick={goBack}
              className={`flex-1 px-4 py-2 border rounded-md transition-colors ${
                isDark
                  ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Back
            </button>
          )}
          <button
            type="submit"
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            {step < totalSteps ? 'Next' : 'Complete Setup'}
          </button>
        </div>
      </form>
      
      {step > 1 && (
        <div className="mt-4 text-center">
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
  );
};

export default ProfileWizard;