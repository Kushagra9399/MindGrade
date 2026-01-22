import React from 'react';
import { Question, UserResponse } from '../types';
import { Icons } from '../constants';
import MathRenderer from './MathRenderer';

interface QuizCardProps {
  question: Question;
  response?: UserResponse;
  onOptionSelect: (optionId: string) => void;
  onReasonChange: (reason: string) => void;
  questionIndex: number;
  totalQuestions: number;
  onNext: () => void;
  onPrev: () => void;
  isMarked: boolean;
  onToggleMark: () => void;
  disabled?: boolean;
}

const QuizCard: React.FC<QuizCardProps> = ({
  question,
  response,
  onOptionSelect,
  onReasonChange,
  questionIndex,
  totalQuestions,
  onNext,
  onPrev,
  isMarked,
  onToggleMark,
  disabled = false
}) => {
  const currentReason = response?.reasoning || "";
  const currentSelection = response?.selectedOptionId || "";

  return (
    <div className="flex flex-col h-full bg-white relative">
      {/* Question Header Bar */}
      <div className="flex-none px-4 py-2 border-b border-slate-200 bg-white flex justify-between items-center z-10">
        <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-800">Question {questionIndex + 1}</h2>
            <span className="text-xs text-slate-400 font-medium hidden sm:inline-block">/ {totalQuestions}</span>
        </div>
        <div className="flex items-center space-x-2">
             <button 
                onClick={onToggleMark}
                className={`flex items-center text-xs px-3 py-1.5 rounded-lg transition-colors font-semibold border
                   ${isMarked 
                     ? 'bg-orange-100 text-orange-700 border-orange-200' 
                     : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                   }`}
             >
                <Icons.AlertCircle className={`w-4 h-4 mr-1 ${isMarked ? 'fill-orange-700' : ''}`} />
                {isMarked ? "Marked" : "Mark"}
             </button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-grow overflow-y-auto p-4 md:p-6 custom-scrollbar">
        <div className="max-w-4xl mx-auto">
            {/* Question Text */}
            <div className="mb-6 p-4 bg-slate-50 rounded-lg border border-slate-100 shadow-sm">
              <div className="text-base md:text-lg font-medium text-slate-800 leading-snug">
                  <MathRenderer text={question.text} />
              </div>
            </div>

            {/* Options Grid */}
            <div className="space-y-3 mb-6">
              {question.options.map((option) => (
                <button
                  key={option.id}
                  onClick={() => !disabled && onOptionSelect(option.id)}
                  disabled={disabled}
                  className={`
                    w-full relative p-3 rounded-lg border-2 text-left transition-all duration-200 flex items-center group
                    ${currentSelection === option.id 
                    ? 'border-indigo-600 bg-indigo-50/50 shadow-sm' 
                    : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'}
                    ${disabled ? 'cursor-not-allowed opacity-80' : ''}
                  `}
                >
                  <div className={`
                    w-6 h-6 rounded-full border-2 mr-3 flex items-center justify-center flex-shrink-0 transition-colors
                    ${currentSelection === option.id 
                    ? 'border-indigo-600 bg-indigo-600' 
                    : 'border-slate-300 group-hover:border-indigo-400'}
                  `}>
                    {currentSelection === option.id && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
                  </div>
                  <span className={`text-base md:text-base font-medium leading-snug ${currentSelection === option.id ? 'text-indigo-900' : 'text-slate-700'}`}>
                    <MathRenderer text={option.text} inline />
                  </span>
                </button>
              ))}
            </div>

            {/* Clear Selection Button */}
            {currentSelection && !disabled && (
            <div className="mb-6 text-right">
              <button
                onClick={() => onOptionSelect('')}
                className="px-4 py-2 text-sm font-semibold rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100"
              >
                Clear Selection
              </button>
            </div>
            )}


            {/* Reasoning Input */}
            <div className="mb-6">
              <label className="block text-base font-bold text-slate-800 mb-1 flex items-center">
                  <Icons.BrainCircuit className="w-5 h-5 mr-2 text-indigo-500" />
                  Reasoning
              </label>
              <p className="text-xs text-slate-500 mb-2">Explain your steps (LaTeX $...$ supported).</p>
              <textarea
                value={currentReason}
                onChange={(e) => !disabled && onReasonChange(e.target.value)}
                placeholder="Type your reasoning..."
                disabled={disabled}
                className={`w-full h-32 p-3 rounded-lg border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:outline-none transition-all resize-none text-base font-sans leading-snug ${disabled ? 'cursor-not-allowed opacity-80' : ''}`}
              />
            </div>
        </div>
      </div>
      
      {/* Footer Navigation */}
      <div className="flex-none px-4 py-2 bg-white border-t border-slate-200 flex justify-between items-center z-10 shadow-[0_-5px_15px_rgba(0,0,0,0.02)]">
          <button 
            onClick={() => !disabled && onPrev()}
            disabled={disabled || questionIndex === 0}
            className={`flex items-center justify-center px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wide
              ${questionIndex === 0 || disabled
                ? 'text-slate-300 bg-slate-100 cursor-not-allowed' 
                : 'text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 hover:border-slate-400'
              }
            `}
          >
            <Icons.ChevronLeft className="w-4 h-4 mr-1" />
            Previous
          </button>
          
          <button 
            onClick={() => !disabled && onNext()}
            disabled={disabled}
            className={`flex items-center justify-center px-6 py-2 rounded-lg text-xs font-semibold uppercase tracking-wide ${disabled ? 'opacity-80 cursor-not-allowed bg-indigo-500' : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-lg'} transition-all`}
          >
            {questionIndex === totalQuestions - 1 ? 'Finish' : 'Next'}
            {questionIndex !== totalQuestions - 1 && <Icons.ChevronRight className="w-4 h-4 ml-1" />}
          </button>
      </div>
    </div>
  );
};

export default QuizCard;