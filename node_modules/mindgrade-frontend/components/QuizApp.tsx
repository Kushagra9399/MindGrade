import React, { useState, useEffect, useCallback } from 'react';
import { AppState, Question, UserResponse, QuizResult, MarkingScheme, QuizConfig } from '../types';
import { generateQuiz, evaluateQuiz } from '../services/geminiService';
import QuizSetup from './QuizSetup';
import QuizCard from './QuizCard';
import ResultsView from './ResultsView';
import LoadingSpinner from './LoadingSpinner';
import MindGradeLogo from './MindGradeLogo';
import QuestionNavigation from './QuestionNavigation';
import LandingPage from './LandingPage';
import UserMenuButton from './UserMenuButton';

const QuizApp: React.FC = () => {
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
      setQuizResult(result);
      setAppState(AppState.RESULTS);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to evaluate quiz. Please try again.");
      setAppState(AppState.ERROR);
    }
  }, [questions, userResponses, markingScheme]);

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

  const handleStartAI = async (config: QuizConfig) => {
    setMarkingScheme(config.markingScheme);
    setAppState(AppState.GENERATING);
    setErrorMsg("");
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

  const handleStartManual = (manualQuestions: Question[], scheme: MarkingScheme, limit: number) => {
    setMarkingScheme(scheme);
    setQuestions(manualQuestions);
    initializeQuiz(manualQuestions, limit);
  };

  const initializeQuiz = (qs: Question[], minutes: number) => {
    setUserResponses(qs.map(q => ({
        questionId: q.id,
        selectedOptionId: "",
        reasoning: ""
      })));
    setTimeLeft(minutes * 60);
    setVisitedIndices(new Set([0]));
    setMarkedIndices(new Set());
    setCurrentQuestionIndex(0);
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
      
      {/* Floating User Account Button */}
      <UserMenuButton />
    </div>
  );
};

export default QuizApp;

