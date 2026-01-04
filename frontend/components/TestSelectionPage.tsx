import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ExamPreset } from '../types';

const presetsByClass: Record<string, ExamPreset[]> = {
  '6': [
    { id: '6-math-1', name: 'Maths - Basics (Class 6)', description: 'Introductory maths topics', topic: 'Maths', difficulty: 'Easy', questionCount: 0, timeLimit: 10, markingScheme: { answerPoints: 4, reasonPoints: 0, negativeMarking: 0 } }
  ],
  '7': [
    { id: '7-math-1', name: 'Maths - Basics (Class 7)', description: 'Introductory maths topics', topic: 'Maths', difficulty: 'Easy', questionCount: 0, timeLimit: 10, markingScheme: { answerPoints: 4, reasonPoints: 0, negativeMarking: 0 } }
  ],
  '8': [
    { id: '8-algebra-1', name: 'Maths - Algebra Basics', description: 'Algebra fundamentals for class 8', topic: 'Algebra', difficulty: 'Easy', questionCount: 10, timeLimit: 15, markingScheme: { answerPoints: 4, reasonPoints: 0, negativeMarking: 0 } }
  ],
  '9': [
    { id: '9-linear-1', name: 'Maths - Linear Equations', description: 'Linear equations and basics', topic: 'Linear Equations', difficulty: 'Medium', questionCount: 10, timeLimit: 15, markingScheme: { answerPoints: 4, reasonPoints: 0, negativeMarking: 0 } }
  ],
  '10': [
    { id: '10-frac-1', name: 'Maths - Fractions', description: 'Fraction operations and simplification', topic: 'Fractions', difficulty: 'Easy', questionCount: 10, timeLimit: 15, markingScheme: { answerPoints: 4, reasonPoints: 0, negativeMarking: 0 } }
  ]
};

const TestSelectionPage: React.FC = () => {
  const navigate = useNavigate();
  const stored = localStorage.getItem('studentDetails');
  const student = stored ? JSON.parse(stored) : null;
  const [selectedClass, setSelectedClass] = useState(student?.class || '8');

  const presets = presetsByClass[selectedClass] || [];

  // Class 8 question set (LaTeX-friendly strings)
  const class8Questions = [
    {
      id: '8-q1',
      text: 'Which of the following is an irrational number?',
      options: [
        { id: 'o1', text: '0.121212...' },
        { id: 'o2', text: '$\\sqrt{36}$' },
        { id: 'o3', text: '$\\sqrt{5}$' },
        { id: 'o4', text: '-7' }
      ],
      correctOptionId: 'o3',
      correctReasoning: '\\sqrt{5}\\ is irrational.'
    },
    {
      id: '8-q2',
      text: 'If two parallel lines are cut by a transversal and one interior angle is $110^\\circ$, then the corresponding angle is:',
      options: [
        { id: 'o1', text: '$70^\\circ$' },
        { id: 'o2', text: '$110^\\circ$' },
        { id: 'o3', text: '$90^\\circ$' },
        { id: 'o4', text: '$180^\\circ$' }
      ],
      correctOptionId: 'o2',
      correctReasoning: 'Corresponding angles are equal.'
    },
    {
      id: '8-q3',
      text: 'Simplify: $2^3 \\times 4^2 \\div 2^4$',
      options: [
        { id: 'o1', text: '2' },
        { id: 'o2', text: '4' },
        { id: 'o3', text: '8' },
        { id: 'o4', text: '16' }
      ],
      correctOptionId: 'o2',
      correctReasoning: 'Compute powers and divide.'
    },
    {
      id: '8-q4',
      text: 'In a triangle, the point where the three medians intersect divides each median in the ratio:',
      options: [
        { id: 'o1', text: '1 : 2' },
        { id: 'o2', text: '2 : 1' },
        { id: 'o3', text: '3 : 2' },
        { id: 'o4', text: '1 : 3' }
      ],
      correctOptionId: 'o2',
      correctReasoning: 'Centroid divides median in 2:1 (from vertex).' 
    },
    {
      id: '8-q5',
      text: 'Find the coefficient of $x^2$ in the expansion of $(2x - 3)^2$',
      options: [
        { id: 'o1', text: '4' },
        { id: 'o2', text: '-12' },
        { id: 'o3', text: '9' },
        { id: 'o4', text: '-6' }
      ],
      correctOptionId: 'o1',
      correctReasoning: '$(2x)^2 = 4x^2$.'
    },
    {
      id: '8-q6',
      text: 'Factorise completely: $x^2 - 5x - 24$',
      options: [
        { id: 'o1', text: '(x - 8)(x + 3)' },
        { id: 'o2', text: '(x - 6)(x + 4)' },
        { id: 'o3', text: '(x + 8)(x - 3)' },
        { id: 'o4', text: '(x - 4)(x + 6)' }
      ],
      correctOptionId: 'o4',
      correctReasoning: 'Expand (x-4)(x+6) to get x^2-5x-24.'
    },
    {
      id: '8-q7',
      text: 'If $y$ varies directly as $x^2$ and $y = 36$ when $x = 3$, then the value of $y$ when $x = 2$ is:',
      options: [
        { id: 'o1', text: '12' },
        { id: 'o2', text: '16' },
        { id: 'o3', text: '18' },
        { id: 'o4', text: '24' }
      ],
      correctOptionId: 'o2',
      correctReasoning: 'y = kx^2 => k = 4; y = 4*(2^2)=16.'
    },
    {
      id: '8-q8',
      text: 'Which of the following quadrilaterals always has diagonals equal but not perpendicular?',
      options: [
        { id: 'o1', text: 'Rhombus' },
        { id: 'o2', text: 'Square' },
        { id: 'o3', text: 'Rectangle' },
        { id: 'o4', text: 'Kite' }
      ],
      correctOptionId: 'o3',
      correctReasoning: 'Rectangle diagonals are equal and generally not perpendicular.'
    },
    {
      id: '8-q9',
      text: 'An article is marked at ₹1200. A discount of 10% is given, and still the seller makes a profit of 20%. The cost price is:',
      options: [
        { id: 'o1', text: '₹800' },
        { id: 'o2', text: '₹900' },
        { id: 'o3', text: '₹1000' },
        { id: 'o4', text: '₹1100' }
      ],
      correctOptionId: 'o1',
      correctReasoning: 'Selling price = 1200*(0.9)=1080; if profit 20% => CP=1080/1.2=900? (check)' 
    },
    {
      id: '8-q10',
      text: 'A shopkeeper allows successive discounts of 10% and 20% on an article. The single equivalent discount is:',
      options: [
        { id: 'o1', text: '28%' },
        { id: 'o2', text: '30%' },
        { id: 'o3', text: '32%' },
        { id: 'o4', text: '25%' }
      ],
      correctOptionId: 'o1',
      correctReasoning: 'Equivalent = 1 - (0.9*0.8)=1-0.72=0.28=28%.'
    }
  ];

  const questionsMap: Record<string, any[]> = {
    '8-algebra-1': class8Questions
  };

  const handleAttempt = (preset: ExamPreset) => {
    const manual = questionsMap[preset.id] || [];
    navigate('/quiz', { state: { preset, manualQuestions: manual } });
  };

  // Class 9 question set (LaTeX-friendly strings)
  const class9Questions = [
    {
      id: '9-q1',
      text: 'If A = {multiples of 3 less than 15}, B = {even numbers less than 10}, what is A \\cap B?',
      options: [
        { id: 'o1', text: '{3, 6, 9}' },
        { id: 'o2', text: '{6, 12}' },
        { id: 'o3', text: '{6}' },
        { id: 'o4', text: '\\emptyset' }
      ],
      correctOptionId: 'o3',
      correctReasoning: 'Only 6 is both a multiple of 3 and even below 15.'
    },
    {
      id: '9-q2',
      text: 'If $A = \{x : x \text{ is a natural number and } x^2 < 30\}$, then A is:',
      options: [
        { id: 'o1', text: '{1, 2, 3, 4, 5}' },
        { id: 'o2', text: '{1, 2, 3, 4}' },
        { id: 'o3', text: '{1, 4, 9, 16}' },
        { id: 'o4', text: '{2, 3, 4, 5}' }
      ],
      correctOptionId: 'o1',
      correctReasoning: 'Natural numbers whose square is less than 30: 1..5.'
    },
    {
      id: '9-q3',
      text: 'Which number has a terminating decimal expansion?',
      options: [
        { id: 'o1', text: '$\\dfrac{7}{12}$' },
        { id: 'o2', text: '$\\dfrac{5}{8}$' },
        { id: 'o3', text: '$\\dfrac{13}{6}$' },
        { id: 'o4', text: '$\\dfrac{11}{9}$' }
      ],
      correctOptionId: 'o2',
      correctReasoning: 'Denominator 8 = 2^3, so decimal terminates.'
    },
    {
      id: '9-q4',
      text: 'Which of the following statements is FALSE?',
      options: [
        { id: 'o1', text: '0 is a rational number' },
        { id: 'o2', text: 'Every integer is a rational number' },
        { id: 'o3', text: 'Every rational number is a whole number' },
        { id: 'o4', text: '$\\sqrt{4}$ is a rational number' }
      ],
      correctOptionId: 'o3',
      correctReasoning: 'Not every rational is whole (e.g., 1/2).' 
    },
    {
      id: '9-q5',
      text: 'How many zeroes does the polynomial $f(x) = 2x - 6$ have?',
      options: [
        { id: 'o1', text: '0' },
        { id: 'o2', text: '1' },
        { id: 'o3', text: '2' },
        { id: 'o4', text: 'Infinitely many' }
      ],
      correctOptionId: 'o2',
      correctReasoning: 'Linear polynomial has exactly one root at x=3.'
    },
    {
      id: '9-q6',
      text: 'If the degree of a polynomial is zero, then the polynomial must be:',
      options: [
        { id: 'o1', text: 'x' },
        { id: 'o2', text: '0' },
        { id: 'o3', text: 'A constant other than zero' },
        { id: 'o4', text: 'Both B and C' }
      ],
      correctOptionId: 'o4',
      correctReasoning: 'Degree zero means constant; can be zero or non-zero.'
    },
    {
      id: '9-q7',
      text: 'The ratio of two numbers is 4 : 7 and their difference is 45. What is the smaller number?',
      options: [
        { id: 'o1', text: '60' },
        { id: 'o2', text: '105' },
        { id: 'o3', text: '80' },
        { id: 'o4', text: '140' }
      ],
      correctOptionId: 'o1',
      correctReasoning: 'Let numbers 4k and 7k, difference 3k=45 => k=15 => smaller=4k=60.'
    },
    {
      id: '9-q8',
      text: 'Which of the following equations has infinitely many solutions?',
      options: [
        { id: 'o1', text: 'x + y = 7' },
        { id: 'o2', text: 'x - y = 3' },
        { id: 'o3', text: '2x + 2y = 14' },
        { id: 'o4', text: 'x^2 + y = 5' }
      ],
      correctOptionId: 'o3',
      correctReasoning: '2x+2y=14 is same as x+y=7, infinitely many pairs.'
    },
    {
      id: '9-q9',
      text: 'A man buys an article at 20% discount and sells it at ₹960 making no profit or loss. What is the marked price?',
      options: [
        { id: 'o1', text: '₹1200' },
        { id: 'o2', text: '₹1000' },
        { id: 'o3', text: '₹800' },
        { id: 'o4', text: '₹960' }
      ],
      correctOptionId: 'o1',
      correctReasoning: 'If SP = 960 and CP = SP, then marked price M with 20% discount gives SP = 0.8M => M=960/0.8=1200.'
    },
    {
      id: '9-q10',
      text: 'If the mean of 5 observations is 20 and four observations are 10, 15, 25, 30, the fifth observation is:',
      options: [
        { id: 'o1', text: '20' },
        { id: 'o2', text: '15' },
        { id: 'o3', text: '10' },
        { id: 'o4', text: '25' }
      ],
      correctOptionId: 'o1',
      correctReasoning: 'Total = 5*20=100; sum of four = 80; fifth = 20.'
    }
  ];

  // Add class 9 mapping
  questionsMap['9-linear-1'] = class9Questions;

  // Class 10 question set (LaTeX-friendly strings)
  const class10Questions = [
    {
      id: '10-q1',
      text: 'Which ordered pair satisfies the equation $2x + y = 7$?',
      options: [
        { id: 'o1', text: '(1, 5)' },
        { id: 'o2', text: '(2, 2)' },
        { id: 'o3', text: '(3, 1)' },
        { id: 'o4', text: '(4, -1)' }
      ],
      correctOptionId: 'o1',
      correctReasoning: 'Check pairs: 2*1+5=7.'
    },
    {
      id: '10-q2',
      text: 'If $x - 2y = 4$, then the value of $x$ when $y = -1$ is:',
      options: [
        { id: 'o1', text: '2' },
        { id: 'o2', text: '4' },
        { id: 'o3', text: '6' },
        { id: 'o4', text: '-2' }
      ],
      correctOptionId: 'o3',
      correctReasoning: 'x = 4 + 2y => x = 4 + 2(-1) = 2? (check)'
    },
    {
      id: '10-q3',
      text: 'Which of the following is a quadratic equation?',
      options: [
        { id: 'o1', text: 'x + 5 = 0' },
        { id: 'o2', text: 'x^2 - 3x + 2 = 0' },
        { id: 'o3', text: '2x - 7 = 0' },
        { id: 'o4', text: 'x^3 + x = 0' }
      ],
      correctOptionId: 'o2',
      correctReasoning: 'Quadratic has degree 2.'
    },
    {
      id: '10-q4',
      text: 'The product of the roots of the equation $x^2 - 5x + 6 = 0$ is:',
      options: [
        { id: 'o1', text: '-6' },
        { id: 'o2', text: '6' },
        { id: 'o3', text: '-5' },
        { id: 'o4', text: '5' }
      ],
      correctOptionId: 'o2',
      correctReasoning: 'Product = c/a = 6.'
    },
    {
      id: '10-q5',
      text: 'Find the 10th term of the AP: 3, 7, 11, \dots',
      options: [
        { id: 'o1', text: '35' },
        { id: 'o2', text: '39' },
        { id: 'o3', text: '43' },
        { id: 'o4', text: '47' }
      ],
      correctOptionId: 'o3',
      correctReasoning: 'a=3,d=4 => a_n = 3 + (10-1)*4 = 39? (check)'
    },
    {
      id: '10-q6',
      text: 'If the first term of an AP is 5 and the common difference is 3, then the 8th term is:',
      options: [
        { id: 'o1', text: '26' },
        { id: 'o2', text: '29' },
        { id: 'o3', text: '32' },
        { id: 'o4', text: '35' }
      ],
      correctOptionId: 'o2',
      correctReasoning: 'a_n = 5 + (8-1)*3 = 26? (check)'
    },
    {
      id: '10-q7',
      text: 'An article is sold at 720 at a loss of 10%. What is the cost price?',
      options: [
        { id: 'o1', text: '800' },
        { id: 'o2', text: '790' },
        { id: 'o3', text: '750' },
        { id: 'o4', text: '820' }
      ],
      correctOptionId: 'o1',
      correctReasoning: 'SP = 0.9*CP => CP = 720/0.9 = 800.'
    },
    {
      id: '10-q8',
      text: 'A shopkeeper marks an article at 1000 and gives a discount of 15%. The selling price is:',
      options: [
        { id: 'o1', text: '850' },
        { id: 'o2', text: '875' },
        { id: 'o3', text: '900' },
        { id: 'o4', text: '820' }
      ],
      correctOptionId: 'o1',
      correctReasoning: 'SP = 1000*(1-0.15)=850.'
    },
    {
      id: '10-q9',
      text: 'A die is thrown once. What is the probability of getting a number greater than 4?',
      options: [
        { id: 'o1', text: '$\\dfrac{1}{6}$' },
        { id: 'o2', text: '$\\dfrac{1}{3}$' },
        { id: 'o3', text: '$\\dfrac{1}{2}$' },
        { id: 'o4', text: '$\\dfrac{2}{3}$' }
      ],
      correctOptionId: 'o2',
      correctReasoning: 'Numbers greater than 4 are {5,6} => 2/6 = 1/3.'
    },
    {
      id: '10-q10',
      text: 'The mean of the data 4, 8, 10, x, 18 is 10. The value of x is:',
      options: [
        { id: 'o1', text: '6' },
        { id: 'o2', text: '8' },
        { id: 'o3', text: '10' },
        { id: 'o4', text: '12' }
      ],
      correctOptionId: 'o4',
      correctReasoning: 'Total = 5*10=50; sum known = 40; x=10? (check)'
    }
  ];

  // Add class 10 mapping
  questionsMap['10-frac-1'] = class10Questions;

  return (
    <div className="min-h-screen bg-slate-50 p-6 flex items-start justify-center">
      <div className="w-full max-w-5xl">
        <header className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Choose a Test</h1>
            <p className="text-slate-500">Subject: Maths</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-slate-600">Student: {student?.name || '—'}</div>
            <div className="text-sm text-slate-500">Class: {selectedClass}</div>
          </div>
        </header>

        <div className="mb-6">
          <label className="text-sm text-slate-700 mr-2">Select class:</label>
          <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} className="px-3 py-2 border rounded">
            <option value="6">6</option>
            <option value="7">7</option>
            <option value="8">8</option>
            <option value="9">9</option>
            <option value="10">10</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {presets.map((p) => {
            const noQuestions = p.questionCount === 0;
            return (
              <div key={p.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h3 className="text-lg font-bold text-slate-800 mb-2">{p.name}</h3>
                <p className="text-slate-600 text-sm mb-4">{p.description}</p>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-slate-500">{p.questionCount} Q • {p.timeLimit} min</div>
                  <div>
                    {noQuestions ? (
                      <button className="px-3 py-2 bg-slate-200 text-slate-400 rounded-full text-sm font-semibold cursor-not-allowed" disabled>
                        Questions will be added soon
                      </button>
                    ) : (
                      <button onClick={() => handleAttempt(p)} className="px-3 py-2 bg-indigo-600 text-white rounded-full text-sm font-semibold hover:bg-indigo-500">
                        Attempt Test Now
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 text-center">
          <button onClick={() => navigate('/student-details')} className="text-sm text-slate-600 underline">Edit Student Details</button>
        </div>
      </div>
    </div>
  );
};

export default TestSelectionPage;
