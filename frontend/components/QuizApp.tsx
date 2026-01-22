import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AppState, Question, UserResponse, QuizResult, MarkingScheme, QuizConfig } from '../types';
import { generateQuiz, evaluateQuiz } from '../services/geminiService';
import QuizSetup from './QuizSetup';
import QuizCard from './QuizCard';
import ResultsView from './ResultsView';
import LoadingSpinner from './LoadingSpinner';
import MindGradeLogo from './MindGradeLogo';
import QuestionNavigation from './QuestionNavigation';
import LandingPage from './LandingPage';

const QuizApp: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [appState, setAppState] = useState<AppState>(AppState.HOME);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [userResponses, setUserResponses] = useState<UserResponse[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [markingScheme, setMarkingScheme] = useState<MarkingScheme>({ answerPoints: 4, reasonPoints: 4, negativeMarking: 1 });
  
  // New States
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [visitedIndices, setVisitedIndices] = useState<Set<number>>(new Set([0]));
  const [markedIndices, setMarkedIndices] = useState<Set<number>>(new Set());
  const [showMobileNav, setShowMobileNav] = useState(false);

  // Submit quiz function
  const submitQuiz = useCallback(async () => {
    setAppState(AppState.SUBMITTING);
    try {
      const result = await evaluateQuiz(questions, userResponses, markingScheme);
      // Normalize marks to a 4-point scale
      const marksOutOf4 = result.maxScore > 0 ? (result.totalScore / result.maxScore) * 4 : 0;
      const completedResult = { ...result, status: 'completed' as const, marksOutOf4 };
      setQuizResult(completedResult);
      // Save attempt locally
      try {
        const student = JSON.parse(localStorage.getItem('studentDetails') || 'null');
        const attempts = JSON.parse(localStorage.getItem('quizAttempts') || '[]');
        attempts.push({
          id: `attempt_${Date.now()}`,
          student,
          class: student?.class,
          quizId: 'manual',
          answers: userResponses,
          status: 'completed',
          marksOutOf4,
          rawResult: completedResult,
          timestamp: new Date().toISOString()
        });
        localStorage.setItem('quizAttempts', JSON.stringify(attempts));
      } catch (e) { /* ignore storage errors */ }
      setAppState(AppState.RESULTS);
    } catch (err) {
      console.error('Evaluation failed:', err);
      // On AI failure, create a pending result and save attempt locally with pending status
      const pendingResult = {
        evaluations: [],
        totalScore: 0,
        maxScore: 0,
        summary: 'Your answers have been submitted. Results will be shown after a while.',
        status: 'pending' as const,
        marksOutOf4: undefined
      };
      setQuizResult(pendingResult as any);
      try {
        const student = JSON.parse(localStorage.getItem('studentDetails') || 'null');
        const attempts = JSON.parse(localStorage.getItem('quizAttempts') || '[]');
        attempts.push({
          id: `attempt_${Date.now()}`,
          student,
          class: student?.class,
          quizId: 'manual',
          answers: userResponses,
          status: 'pending',
          marksOutOf4: null,
          rawError: (err && (err as any).message) || String(err),
          timestamp: new Date().toISOString()
        });
        localStorage.setItem('quizAttempts', JSON.stringify(attempts));
      } catch (e) { /* ignore storage errors */ }
      // Show results page with pending message
      setAppState(AppState.RESULTS);
    }
  }, [questions, userResponses, markingScheme]);

const [hasLoadedSavedProgress, setHasLoadedSavedProgress] = useState(false);

// Load saved quiz state if it exists
useEffect(() => {
  const savedProgress = localStorage.getItem('quizProgress');
  if (savedProgress) {
    const {
      currentQuestionIndex,
      userResponses,
      timeLeft,
      visitedIndices,
      markedIndices,
      questions: savedQuestions
    } = JSON.parse(savedProgress);

    setQuestions(savedQuestions);
    setUserResponses(userResponses);
    setCurrentQuestionIndex(currentQuestionIndex);
    setTimeLeft(timeLeft);
    setVisitedIndices(new Set(visitedIndices));
    setMarkedIndices(new Set(markedIndices));
    setAppState(AppState.QUIZ); // Resume quiz automatically
    setHasLoadedSavedProgress(true); // mark that we have loaded saved progress
  }
}, []);


// Save quiz progress to localStorage on changes
useEffect(() => {
  if (appState === AppState.QUIZ && questions.length > 0) {
    const quizProgress = {
      currentQuestionIndex,
      userResponses,
      timeLeft,
      visitedIndices: Array.from(visitedIndices),
      markedIndices: Array.from(markedIndices),
      questions
    };
    localStorage.setItem('quizProgress', JSON.stringify(quizProgress));
  }
}, [currentQuestionIndex, userResponses, timeLeft, visitedIndices, markedIndices, questions, appState]);


  // Timer Effect
  useEffect(() => {
    let timer: number;
    if (appState === AppState.QUIZ && timeLeft > 0) {
      timer = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            submitQuiz(); // Auto submit
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [appState, timeLeft, submitQuiz]);

  // If navigated with preset (from TestSelection), start quiz or show placeholder
  useEffect(() => {
    const state: any = (location && (location as any).state) || {};
    if (state && state.preset) {
      const preset = state.preset as any;
      // If questions provided in state, start manual; otherwise, set QUIZ state so UI can show placeholder
      if (state.manualQuestions && Array.isArray(state.manualQuestions) && state.manualQuestions.length > 0) {
        handleStartManual(state.manualQuestions as Question[], preset.markingScheme, preset.timeLimit || 10);
      } else {
        // Prepare empty questions for future; show notice in UI when questions are empty
        setMarkingScheme(preset.markingScheme || markingScheme);
        setQuestions([]);
        setAppState(AppState.QUIZ);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);

const handleStartManual = (manualQuestions: Question[], scheme: MarkingScheme, limit: number) => {
  setMarkingScheme(scheme);
  
  if (!hasLoadedSavedProgress) {
    setQuestions(manualQuestions);
    initializeQuiz(manualQuestions, limit);
  }
};

const handleStartAI = async (config: QuizConfig) => {
  setMarkingScheme(config.markingScheme);
  setAppState(AppState.GENERATING);
  setErrorMsg("");
  
  if (hasLoadedSavedProgress) return; // don’t overwrite saved progress

  try {
    const generatedQuestions = await generateQuiz(config.topic, config.difficulty, config.questionCount, config.classLevel);
    setQuestions(generatedQuestions);
    initializeQuiz(generatedQuestions, config.timeLimit);
  } catch (err) {
    console.error(err);
    setErrorMsg("Failed to generate quiz. Please check your API Key or try again.");
    setAppState(AppState.ERROR);
  }
};

const initializeQuiz = (qs: Question[], minutes: number) => {
  // Only initialize userResponses if they are empty
  setUserResponses(prev => (prev.length > 0 ? prev : qs.map(q => ({
      questionId: q.id,
      selectedOptionId: "",
      reasoning: ""
  }))));

  // Only set timeLeft if it hasn't been restored from saved progress
  setTimeLeft(prev => (prev && prev > 0) ? prev : minutes * 60);

  setVisitedIndices(prev => (prev.size > 0 ? prev : new Set([0])));
  setMarkedIndices(prev => (prev.size > 0 ? prev : new Set()));
  setCurrentQuestionIndex(prev => (prev > 0 ? prev : 0));
  setAppState(AppState.QUIZ);
};



  const handleOptionSelect = (optionId: string) => {
    const updatedResponses = [...userResponses];
    updatedResponses[currentQuestionIndex].selectedOptionId = optionId;
    setUserResponses(updatedResponses);
  };

  const handleReasonChange = (reason: string) => {
    const updatedResponses = [...userResponses];
    updatedResponses[currentQuestionIndex].reasoning = reason;
    setUserResponses(updatedResponses);
  };

  const markVisited = (idx: number) => {
    setVisitedIndices(prev => new Set(prev).add(idx));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      const nextIdx = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIdx);
      markVisited(nextIdx);
    } else {
      submitQuiz();
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      const prevIdx = currentQuestionIndex - 1;
      setCurrentQuestionIndex(prevIdx);
      markVisited(prevIdx);
    }
  };
  
  const handleNavigate = (index: number) => {
    setCurrentQuestionIndex(index);
    markVisited(index);
    setShowMobileNav(false);
  };

  const handleToggleMark = () => {
    setMarkedIndices(prev => {
        const next = new Set(prev);
        if (next.has(currentQuestionIndex)) {
            next.delete(currentQuestionIndex);
        } else {
            next.add(currentQuestionIndex);
        }
        return next;
    });
  };


  const handleRestart = () => {
    setAppState(AppState.WELCOME);
    setQuestions([]);
    setUserResponses([]);
    setCurrentQuestionIndex(0);
    setQuizResult(null);
    localStorage.removeItem('quizProgress');

  };

  const handleGoHome = () => {
    setAppState(AppState.HOME);
    setQuestions([]);
    setUserResponses([]);
    setCurrentQuestionIndex(0);
    setQuizResult(null);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="h-screen bg-slate-50 flex flex-col font-sans overflow-hidden">
      {appState !== AppState.HOME && (
        <header className="bg-white border-b border-slate-200 flex-none z-30 shadow-sm relative">
            <div className="w-full px-4 h-16 flex items-center justify-between">
            <div className="font-bold text-xl text-slate-900 tracking-tight flex items-center group cursor-pointer" onClick={handleGoHome}>
                <div className="w-8 h-8 mr-2">
                    <MindGradeLogo />
                </div>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">MindGrade</span>
            </div>
            
            {appState === AppState.QUIZ && (
                <div className="flex items-center gap-4">
                    <div className={`flex items-center font-mono font-bold text-lg px-3 py-1.5 rounded-lg border-2 shadow-sm transition-all ${timeLeft < 60 ? 'bg-red-50 text-red-600 border-red-200 animate-pulse' : 'bg-white text-slate-700 border-slate-200'}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                        {formatTime(timeLeft)}
                    </div>
                    
                    <button 
                        onClick={() => setShowMobileNav(!showMobileNav)}
                        className="lg:hidden p-2 rounded-lg bg-slate-100 text-slate-600"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
                    </button>
                </div>
            )}
            </div>
        </header>
      )}

      <main className="flex-grow flex overflow-hidden relative">
        {appState === AppState.HOME && (
            <LandingPage onGetStarted={() => setAppState(AppState.WELCOME)} />
        )}

        {appState === AppState.WELCOME && (
          <div className="w-full h-full overflow-y-auto p-4 md:p-8 flex items-start justify-center bg-slate-50/50 pt-8 md:pt-12">
            <QuizSetup onStartAI={handleStartAI} onStartManual={handleStartManual} />
          </div>
        )}

        {appState === AppState.GENERATING && (
          <div className="w-full h-full flex items-center justify-center">
            <LoadingSpinner message="AI is crafting your exam paper..." />
          </div>
        )}

        {appState === AppState.QUIZ && questions.length > 0 && (
          <>
             {/* Left Column: Quiz Card - Takes available space */}
             <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-100">
                <QuizCard 
                    question={questions[currentQuestionIndex]}
                    response={userResponses[currentQuestionIndex]}
                    onOptionSelect={handleOptionSelect}
                    onReasonChange={handleReasonChange}
                    questionIndex={currentQuestionIndex}
                    totalQuestions={questions.length}
                    onNext={handleNext}
                    onPrev={handlePrev}
                    isMarked={markedIndices.has(currentQuestionIndex)}
                    onToggleMark={handleToggleMark}
                  disabled={appState === AppState.SUBMITTING}
                />
             </div>
             
             {/* Right Column: Navigation - Fixed Width */}
             <div className={`
                fixed inset-y-0 right-0 w-80 transform transition-transform duration-300 ease-in-out z-40 lg:relative lg:transform-none lg:w-80 flex-none
                ${showMobileNav ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
             `}>
                <QuestionNavigation 
                    totalQuestions={questions.length}
                    currentQuestionIndex={currentQuestionIndex}
                    visitedIndices={visitedIndices}
                    markedIndices={markedIndices}
                    userResponses={userResponses.reduce((acc, curr, idx) => ({ ...acc, [idx]: !!curr.selectedOptionId }), {})}
                    onNavigate={handleNavigate}
                    onSubmit={submitQuiz}
                />
             </div>
             
             {/* Overlay for mobile nav */}
             {showMobileNav && (
                <div 
                    className="fixed inset-0 bg-black/50 z-30 lg:hidden"
                    onClick={() => setShowMobileNav(false)}
                />
             )}
          </>
        )}

        {appState === AppState.QUIZ && questions.length === 0 && (
          <div className="w-full h-full flex items-center justify-center p-6">
            <div className="max-w-xl w-full bg-white p-8 rounded-2xl shadow text-center border border-slate-200">
              <h3 className="text-xl font-bold mb-2 text-slate-900">Questions coming soon</h3>
              <p className="text-slate-600 mb-6">This test has not been populated with questions yet. We'll add questions for this class shortly.</p>
              <div className="flex gap-4 justify-center">
                <button onClick={() => navigate('/test-selection')} className="px-4 py-2 bg-indigo-600 text-white rounded-full">Back to Tests</button>
                <button disabled className="px-4 py-2 bg-slate-200 text-slate-400 rounded-full">Attempt (disabled)</button>
              </div>
            </div>
          </div>
        )}

        {appState === AppState.SUBMITTING && (
           <div className="w-full h-full flex items-center justify-center bg-white">
             <LoadingSpinner message="Grading in progress..." />
           </div>
        )}

        {appState === AppState.RESULTS && quizResult && (
          <div className="w-full h-full overflow-y-auto p-4 md:p-8 bg-slate-50">
             <ResultsView 
                result={quizResult} 
                questions={questions} 
                userResponses={userResponses} 
                markingScheme={markingScheme}
                onRestart={handleRestart}
            />
          </div>
        )}

        {appState === AppState.ERROR && (
          <div className="w-full h-full flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white p-6 rounded-lg shadow-lg border-l-4 border-red-500">
                <h3 className="text-lg font-bold text-red-600 mb-2">Error</h3>
                <p className="text-slate-600 mb-4">{errorMsg}</p>
                <button 
                onClick={handleRestart}
                className="px-4 py-2 bg-slate-800 text-white rounded hover:bg-slate-700 w-full font-bold"
                >
                Try Again
                </button>
            </div>
          </div>
        )}
      </main>
      
      {/* Floating User Account Button removed for student-only flow */}
    </div>
  );
};

export default QuizApp;

