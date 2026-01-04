import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Question, UserResponse, QuizResult, MarkingScheme } from "../types";

// NOTE: In a real app, API_KEY should be handled securely. 
// For this frontend-only demo, we expect it in process.env.
const apiKey = process.env.API_KEY || '';

const ai = new GoogleGenAI({ apiKey });

const QUIZ_SCHEMA: Schema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      id: { type: Type.STRING },
      text: { type: Type.STRING },
      options: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            text: { type: Type.STRING }
          },
          required: ["id", "text"]
        }
      },
      correctOptionId: { type: Type.STRING },
      correctReasoning: { type: Type.STRING }
    },
    required: ["id", "text", "options", "correctOptionId", "correctReasoning"]
  }
};

const EVALUATION_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    evaluations: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          questionId: { type: Type.STRING },
          answerScore: { type: Type.NUMBER, description: "Points awarded for correct option (or negative)" },
          reasonScore: { type: Type.NUMBER, description: "Points awarded for reasoning" },
          totalScore: { type: Type.NUMBER },
          isAnswerCorrect: { type: Type.BOOLEAN },
          reasonFeedback: { type: Type.STRING },
          correctReasoning: { type: Type.STRING },
          correctOptionId: { type: Type.STRING }
        },
        required: ["questionId", "answerScore", "reasonScore", "totalScore", "isAnswerCorrect", "reasonFeedback", "correctReasoning", "correctOptionId"]
      }
    },
    totalScore: { type: Type.NUMBER },
    maxScore: { type: Type.NUMBER },
    summary: { type: Type.STRING }
  },
  required: ["evaluations", "totalScore", "maxScore", "summary"]
};

export const generateQuiz = async (topic: string, difficulty: string, count: number = 5, classLevel: string = "10"): Promise<Question[]> => {
  const model = "gemini-2.5-flash";
  
  const prompt = `
    Generate ${count} multiple-choice questions on the topic(s) of: "${topic}".
    Target Audience: Student in Class/Grade ${classLevel}.
    Difficulty Level: "${difficulty}".
    
    1. **DIFFICULTY CALIBRATION**:
       - The user has requested "Competitive Level" standards.
       - AVOID simple, one-step direct questions.
       - Questions must be CHALLENGING, requiring multi-step logical deduction, application of multiple concepts, or complex calculation appropriate for Grade ${classLevel} competitive exams (like Olympiads, JEE, SAT, etc.).
    
    2. **TOPIC MIXING**: If multiple topics are provided, mix them up.

    3. **FORMATTING RULES (STRICT)**:
       - **MATH SPACING**: Always insert a space between text and math delimiters (e.g., "find $ x $").
       - **NEWLINES**: NEVER put two distinct equations on the same line. Use "\\n" to separate steps.
       - **LATEX**: Use ONLY '$' for inline math. Double-escape backslashes (e.g. "\\\\frac").
    
    4. **CONTENT INTEGRITY**:
       - **CONSISTENCY**: The question MUST be mathematically solvable using exactly the numbers provided in the text.
       - **ACCURACY**: Ensure the correct option matches the question text perfectly.
       - **NO AMBIGUITY**: Do not generate questions that require "adjusting" the problem statement to find an answer.
    
    5. **JSON**: Output strictly valid JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: QUIZ_SCHEMA,
        systemInstruction: "You are a precise Math Engine for Competitive Exams. You prioritize high complexity, mathematical accuracy, and strict formatting."
      }
    });

    const raw = response.candidates?.[0]?.content?.parts?.[0]?.text ?? response.text ?? '';
    if (!raw) throw new Error("No content generated");

    return JSON.parse(raw) as Question[];
  } catch (error) {
    console.error("Quiz Generation Error:", error);
    throw error;
  }
};

export const evaluateQuiz = async (
  questions: Question[], 
  userResponses: UserResponse[],
  markingScheme: MarkingScheme
): Promise<QuizResult> => {
  const model = "gemini-2.5-flash";

  // Prepare a prompt that includes both the original questions (with truth) and user answers
  const dataForAI = questions.map(q => {
    const userResp = userResponses.find(ur => ur.questionId === q.id);
    return {
      questionId: q.id,
      questionText: q.text,
      options: q.options,
      correctOptionId: q.correctOptionId,
      goldenReasoning: q.correctReasoning,
      userSelectedOptionId: userResp?.selectedOptionId || "NO_ANSWER",
      userReasoning: userResp?.reasoning || "NO_REASONING"
    };
  });

  const prompt = `
    Evaluate the following student responses.
    
    SCORING RULES (Strictly enforce Negative Marking):
    1. **Answer Score**:
       - If Correct: +${markingScheme.answerPoints} points.
       - If Incorrect (and attempted): -${markingScheme.negativeMarking} points (NEGATIVE MARKING APPLIES).
       - If Not Attempted ("NO_ANSWER"): 0 points.
    2. **Reason Score**: Max ${markingScheme.reasonPoints} points. (Awarded based on logic quality, even if final answer is wrong, unless reasoning is missing).
    
    CRITICAL FEEDBACK RULES:
    1. **NO META-COMMENTARY**: NEVER use phrases like "As per the adjusted problem", "Assuming the question meant", "There was a typo", or "The options differ from the question".
    2. **ABSOLUTE TRUTH**: Grade strictly based on the 'questionText' provided. Treat the provided question numbers as the absolute fact.
    3. **DIRECT EXPLANATION**: Provide the solution steps directly. If the student is wrong, explain why based on the *given* numbers.
    
    Formatting Rules:
    - Use '$' for inline math.
    - Double-escape all backslashes (e.g., "\\\\frac").
    - Ensure spaces around '$' (e.g., " $ x $ ").
    - Use bullet points (\\n -) in feedback.
    
    Data to evaluate:
    ${JSON.stringify(dataForAI, null, 2)}
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: EVALUATION_SCHEMA,
        systemInstruction: "You are a fair grader. You strictly apply negative marking rules for incorrect answers."
      }
    });

    const raw = response.candidates?.[0]?.content?.parts?.[0]?.text ?? response.text ?? '';
    if (!raw) throw new Error("No evaluation generated");

    return JSON.parse(raw) as QuizResult;
  } catch (error) {
    console.error("Evaluation Error:", error);
    throw error;
  }
};
// Note: Per-question reasoning evaluator was intentionally removed to rely on batch evaluateQuiz.