import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import StudentDetailsPage from './components/StudentDetailsPage';
import TestSelectionPage from './components/TestSelectionPage';
import QuizApp from './components/QuizApp';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Could not find root element to mount to');

const StartWrapper: React.FC = () => {
  const navigate = useNavigate();
  return <LandingPage onGetStarted={() => navigate('/student-details')} />;
};

const root = createRoot(rootElement);
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<StartWrapper />} />
        <Route path="/student-details" element={<StudentDetailsPage />} />
        <Route path="/test-selection" element={<TestSelectionPage />} />
        <Route path="/quiz" element={<QuizApp />} />
        <Route path="/results" element={<div className="min-h-screen flex items-center justify-center">Results will be shown soon.</div>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);