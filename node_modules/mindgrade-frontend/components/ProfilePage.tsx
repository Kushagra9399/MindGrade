import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MindGradeLogo from './MindGradeLogo';

interface ProfileData {
  fullName: string;
  email: string;
  age: string;
  grade: string;
  subjects: string[];
}

const COMMON_SUBJECTS = [
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'English',
  'History',
  'Geography',
  'Computer Science',
  'Economics',
  'Psychology',
];

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const [profileData, setProfileData] = useState<ProfileData>({
    fullName: '',
    email: '',
    age: '',
    grade: '',
    subjects: [],
  });

  // Load profile data from localStorage on mount
  useEffect(() => {
    const savedProfile = localStorage.getItem('mindgrade_profile');
    const savedEmail = localStorage.getItem('mindgrade_email');
    
    if (savedProfile) {
      try {
        const parsed = JSON.parse(savedProfile);
        setProfileData(parsed);
      } catch (e) {
        console.error('Failed to parse profile data', e);
      }
    }
    
    // Set email from login if available
    if (savedEmail) {
      setProfileData(prev => ({ ...prev, email: savedEmail }));
    } else {
      // Fallback to demo email
      setProfileData(prev => ({ ...prev, email: 'student@mindgrade.ai' }));
    }
  }, []);

  const handleInputChange = (field: keyof ProfileData, value: string | string[]) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const toggleSubject = (subject: string) => {
    setProfileData(prev => {
      const subjects = prev.subjects.includes(subject)
        ? prev.subjects.filter(s => s !== subject)
        : [...prev.subjects, subject];
      return { ...prev, subjects };
    });
  };

  const validateForm = (): boolean => {
    if (!profileData.fullName.trim()) {
      setError('Please enter your full name');
      return false;
    }

    if (profileData.age && (isNaN(Number(profileData.age)) || Number(profileData.age) < 1 || Number(profileData.age) > 100)) {
      setError('Please enter a valid age (1-100)');
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSaving(true);
    setError('');

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 600));

    // Save to localStorage
    localStorage.setItem('mindgrade_profile', JSON.stringify(profileData));
    if (profileData.email) {
      localStorage.setItem('mindgrade_email', profileData.email);
    }

    setIsSaving(false);
    setIsEditing(false);
    setShowSuccess(true);

    // Hide success message after 3 seconds
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleCancel = () => {
    // Reload from localStorage
    const savedProfile = localStorage.getItem('mindgrade_profile');
    if (savedProfile) {
      try {
        const parsed = JSON.parse(savedProfile);
        setProfileData(parsed);
      } catch (e) {
        console.error('Failed to parse profile data', e);
      }
    }
    setIsEditing(false);
    setError('');
  };

  return (
    <div className="min-h-screen bg-slate-50 overflow-y-auto py-8 px-4">
      <div className="w-full max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20">
              <MindGradeLogo />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-2">
            My <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Profile</span>
          </h1>
          <p className="text-slate-500 text-lg">Manage your personal information</p>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
          {/* Success Message */}
          {showSuccess && (
            <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
              Profile updated successfully!
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="space-y-6">
            {/* Full Name */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-slate-700 mb-2">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                id="fullName"
                type="text"
                value={profileData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                disabled={!isEditing}
                className={`block w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-slate-900 placeholder-slate-400 ${
                  isEditing 
                    ? 'bg-white cursor-text' 
                    : 'bg-slate-50 cursor-not-allowed'
                }`}
                placeholder="Enter your full name"
              />
            </div>

            {/* Email (Read-only) */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={profileData.email}
                disabled
                className="block w-full px-4 py-3 border border-slate-300 rounded-lg bg-slate-50 text-slate-500 cursor-not-allowed"
                readOnly
              />
              <p className="mt-1 text-xs text-slate-400">Email cannot be changed</p>
            </div>

            {/* Age and Grade Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Age */}
              <div>
                <label htmlFor="age" className="block text-sm font-medium text-slate-700 mb-2">
                  Age (Optional)
                </label>
                <input
                  id="age"
                  type="number"
                  min="1"
                  max="100"
                  value={profileData.age}
                  onChange={(e) => handleInputChange('age', e.target.value)}
                  disabled={!isEditing}
                  className={`block w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-slate-900 placeholder-slate-400 ${
                    isEditing 
                      ? 'bg-white cursor-text' 
                      : 'bg-slate-50 cursor-not-allowed'
                  }`}
                  placeholder="e.g., 15"
                />
              </div>

              {/* Grade */}
              <div>
                <label htmlFor="grade" className="block text-sm font-medium text-slate-700 mb-2">
                  Grade (Optional)
                </label>
                <input
                  id="grade"
                  type="text"
                  value={profileData.grade}
                  onChange={(e) => handleInputChange('grade', e.target.value)}
                  disabled={!isEditing}
                  className={`block w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-slate-900 placeholder-slate-400 ${
                    isEditing 
                      ? 'bg-white cursor-text' 
                      : 'bg-slate-50 cursor-not-allowed'
                  }`}
                  placeholder="e.g., 10th, 11th, 12th"
                />
              </div>
            </div>

            {/* Subjects of Interest */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">
                Subjects / Strengths
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {COMMON_SUBJECTS.map((subject) => (
                  <button
                    key={subject}
                    type="button"
                    onClick={() => isEditing && toggleSubject(subject)}
                    disabled={!isEditing}
                    className={`p-3 rounded-lg text-sm font-medium border transition-all text-left relative overflow-hidden
                      ${
                        profileData.subjects.includes(subject)
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-md ring-2 ring-indigo-200'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 disabled:hover:bg-white disabled:hover:border-slate-200'
                      }
                      ${!isEditing ? 'cursor-default' : 'cursor-pointer'}
                    `}
                  >
                    {subject}
                    {profileData.subjects.includes(subject) && (
                      <div className="absolute top-1 right-1 w-2 h-2 bg-white rounded-full"></div>
                    )}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-xs text-slate-400">
                {isEditing ? 'Click to select your subjects' : 'Your selected subjects'}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-200">
              {!isEditing ? (
                <>
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="flex-1 flex justify-center items-center px-6 py-3 text-base font-bold text-white transition-all duration-200 bg-slate-900 rounded-full hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 hover:shadow-xl hover:-translate-y-1"
                  >
                    Edit Profile
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/')}
                    className="flex-1 flex justify-center items-center px-6 py-3 text-base font-medium text-slate-700 bg-white border border-slate-300 rounded-full hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-all"
                  >
                    Back to Home
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex-1 flex justify-center items-center px-6 py-3 text-base font-bold text-white transition-all duration-200 bg-slate-900 rounded-full hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 hover:shadow-xl hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
                  >
                    {isSaving ? (
                      <div className="flex items-center">
                        <svg
                          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Saving...
                      </div>
                    ) : (
                      'Save Changes'
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={isSaving}
                    className="flex-1 flex justify-center items-center px-6 py-3 text-base font-medium text-slate-700 bg-white border border-slate-300 rounded-full hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-slate-400">
          &copy; {new Date().getFullYear()} MindGrade AI. All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;


