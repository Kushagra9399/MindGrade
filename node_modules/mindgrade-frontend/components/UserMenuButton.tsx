import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const UserMenuButton: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Don't show on login/signup page
  if (location.pathname === '/login' || location.pathname === '/profile') {
    return null;
  }

  const handleClick = () => {
    navigate('/profile');
  };

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-6 left-6 z-50 w-14 h-14 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      aria-label="Open profile"
      title="View Profile"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-6 h-6"
      >
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
        <circle cx="12" cy="7" r="4"></circle>
      </svg>
    </button>
  );
};

export default UserMenuButton;


