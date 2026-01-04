import React from 'react';
import { useNavigate } from 'react-router-dom';
import { QuizResult, Question, UserResponse, MarkingScheme } from '../types';
import { Icons } from '../constants';
import MathRenderer from './MathRenderer';

interface ResultsViewProps {
  result?: QuizResult | null;
  questions: Question[];
  userResponses: UserResponse[];
  markingScheme: MarkingScheme;
  onRestart: () => void;
}

const ResultsView: React.FC<ResultsViewProps> = ({ result, questions, userResponses, markingScheme, onRestart }) => {
  const navigate = useNavigate();
  if (!result || result.status === 'pending') {
    return (
      <div className="max-w-4xl mx-auto animate-fade-in-up p-12 text-center">
        <h2 className="text-3xl font-bold text-slate-900 mb-4">Thank you for attempting the test.</h2>
        <div className="flex justify-center">
          <button onClick={() => { onRestart(); navigate('/'); }} className="px-6 py-3 bg-indigo-600 text-white rounded-full">Back to Main Page</button>
        </div>
      </div>
    );
  }

  const percentage = result.maxScore > 0 ? Math.round((result.totalScore / result.maxScore) * 100) : 0;
  let gradeColor = "text-red-600";
  let gradeBg = "bg-red-50 border-red-200";
  if (percentage >= 80) {
    gradeColor = "text-green-600";
    gradeBg = "bg-green-50 border-green-200";
  } else if (percentage >= 50) {
    gradeColor = "text-amber-600";
    gradeBg = "bg-amber-50 border-amber-200";
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in-up pb-12">
      {/* Summary Card */}
      <div className={`p-8 rounded-2xl border-2 ${gradeBg} flex flex-col md:flex-row items-center justify-between shadow-sm`}>
        <div className="mb-6 md:mb-0 text-center md:text-left">
          <h2 className={`text-3xl font-bold ${gradeColor} mb-2`}>Quiz Complete!</h2>
          <p className="text-slate-700 text-lg"><MathRenderer text={result.summary} /></p>
        </div>
        <div className="flex flex-col items-center justify-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100 min-w-[200px]">
          <span className="text-sm text-slate-500 uppercase tracking-wider font-semibold mb-1">Score (normalized)</span>
          <span className={`text-5xl font-black ${gradeColor}`}>
            {result.marksOutOf4?.toFixed?.(1) ?? '—'}<span className="text-2xl text-slate-400">/4</span>
          </span>
          <span className="text-sm font-medium text-slate-500 mt-2">{percentage}% Accuracy</span>
        </div>
      </div>

      {/* Questions Breakdown */}
      <div className="space-y-6">
        <h3 className="text-xl font-bold text-slate-800 px-2">Detailed Breakdown</h3>
        {result.evaluations.map((evaluation, idx) => {
          const question = questions.find(q => q.id === evaluation.questionId);
          const userResp = userResponses.find(r => r.questionId === evaluation.questionId);
          const option = question?.options.find(o => o.id === userResp?.selectedOptionId);
          const correctOption = question?.options.find(o => o.id === evaluation.correctOptionId);

          if (!question) return null;

          return (
            <div key={idx} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              {/* Question Header */}
              <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-start">
                <div className="flex-1 pr-4">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Question {idx + 1}</span>
                    <div className="text-lg font-medium text-slate-900 mt-1">
                        <MathRenderer text={question.text} />
                    </div>
                </div>
                <div className="flex items-center space-x-4 flex-none">
                     <div className="flex flex-col items-end">
                        <span className="text-xs text-slate-400 font-medium uppercase">Answer</span>
                        <span className={`font-bold ${evaluation.answerScore > 0 ? 'text-green-600' : 'text-red-500'}`}>
                            {evaluation.answerScore}/{markingScheme.answerPoints}
                        </span>
                     </div>
                     <div className="flex flex-col items-end">
                        <span className="text-xs text-slate-400 font-medium uppercase">Logic</span>
                        <span className={`font-bold ${evaluation.reasonScore >= (markingScheme.reasonPoints * 0.8) ? 'text-green-600' : evaluation.reasonScore >= (markingScheme.reasonPoints * 0.4) ? 'text-amber-500' : 'text-red-500'}`}>
                            {evaluation.reasonScore}/{markingScheme.reasonPoints}
                        </span>
                     </div>
                </div>
              </div>

              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* User Side */}
                <div className="space-y-4">
                  <div>
                    <span className="text-xs font-semibold text-slate-400 uppercase">Your Answer</span>
                    <div className={`mt-1 p-3 rounded-lg border flex items-center ${
                      evaluation.isAnswerCorrect 
                        ? 'bg-green-50 border-green-200 text-green-900' 
                        : 'bg-red-50 border-red-200 text-red-900'
                    }`}>
                       {evaluation.isAnswerCorrect ? <Icons.CheckCircle className="w-5 h-5 mr-2 flex-none" /> : <Icons.XCircle className="w-5 h-5 mr-2 flex-none" />}
                       <span className="font-medium">
                         {option ? <MathRenderer text={option.text} inline /> : "No selection"}
                       </span>
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-xs font-semibold text-slate-400 uppercase">Your Reasoning</span>
                    <div className="mt-1 p-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 text-sm min-h-[60px]">
                      {userResp?.reasoning ? <MathRenderer text={userResp.reasoning} /> : <span className="text-slate-400 italic">No reasoning provided.</span>}
                    </div>
                  </div>
                </div>

                {/* AI Feedback Side */}
                <div className="space-y-4 relative">
                    <div className="absolute left-0 top-0 bottom-0 w-px bg-slate-100 -ml-4 hidden md:block"></div>
                  
                  {!evaluation.isAnswerCorrect && (
                     <div>
                        <span className="text-xs font-semibold text-slate-400 uppercase">Correct Answer</span>
                        <div className="mt-1 p-3 rounded-lg border border-indigo-100 bg-indigo-50 text-indigo-900 flex items-center">
                            <Icons.CheckCircle className="w-5 h-5 mr-2 text-indigo-600 flex-none" />
                            <span className="font-medium">
                                <MathRenderer text={correctOption?.text || ""} inline />
                            </span>
                        </div>
                    </div>
                  )}

                  <div>
                     <span className="text-xs font-semibold text-slate-400 uppercase">Feedback on Reasoning</span>
                     <div className="mt-1 text-sm text-slate-700 leading-relaxed">
                        <div className="mb-3 bg-white p-3 rounded border border-slate-100 shadow-sm">
                            <span className="font-semibold text-indigo-600 block mb-1">AI Evaluation</span> 
                            <MathRenderer text={evaluation.reasonFeedback} />
                        </div>
                        <div className="p-3 bg-yellow-50 border border-yellow-100 rounded-lg text-yellow-900 text-xs">
                            <span className="font-bold block mb-1 text-yellow-800">Optimal Reasoning Path</span>
                            <MathRenderer text={evaluation.correctReasoning} />
                        </div>
                     </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-center pt-8 pb-12">
        <button 
            onClick={onRestart}
            className="flex items-center px-8 py-3 bg-indigo-600 text-white rounded-full font-bold shadow-lg hover:bg-indigo-700 hover:shadow-indigo-300 transition-all transform hover:-translate-y-1"
        >
            <Icons.RefreshCw className="w-5 h-5 mr-2" />
            Take Another Quiz
        </button>
      </div>
    </div>
  );
};

export default ResultsView;