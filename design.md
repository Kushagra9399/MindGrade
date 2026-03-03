# Design Document: MindGrade Student Reasoning Evaluator

## Overview

MindGrade is a comprehensive reasoning-based quiz platform that revolutionizes student assessment by requiring written explanations for answer choices. The platform combines traditional multiple-choice questions with mandatory reasoning components, using AI to evaluate both answer correctness and reasoning quality. This design addresses the core problem of rote learning by forcing students to articulate their thought processes, enabling deeper conceptual understanding.

The system serves multiple user types: individual students seeking self-assessment, educational institutions requiring comprehensive evaluation tools, and educators needing detailed insights into student thinking patterns. By integrating AI-powered evaluation with human oversight, MindGrade provides scalable yet personalized learning experiences.

## Architecture

### High-Level Architecture

The system architecture consists of four main layers:

**Frontend Layer (hosted on Netlify):**
- React/TypeScript UI - Main user interface
- LaTeX Renderer - Mathematical content display
- Timer Component - Quiz timing functionality  
- Image Upload - Student reasoning image submission

**Backend Layer (hosted on Railway/Vercel):**
- REST API Server - Central communication hub
- Authentication Service - User login and access control
- Question Generator - AI-powered question creation
- Evaluation Engine - Student response assessment
- Analytics Service - Learning insights and reporting

**External Services:**
- AWS Bedrock AI - Natural language processing and evaluation
- File Storage - Image and document storage

**Database Layer (PostgreSQL):**
- Users table - Student and educator profiles
- Questions table - Quiz questions and metadata
- Student Responses table - Answer and reasoning submissions
- Evaluation Results table - AI assessment outcomes

**Data Flow:**
- Frontend UI communicates with REST API Server
- LaTeX Renderer and Timer integrate with main UI
- Image uploads go directly to File Storage
- API Server coordinates with all backend services
- Question Generator and Evaluation Engine use AWS Bedrock AI
- All services read/write to PostgreSQL database tables

### Technology Stack

- **Frontend**: React with TypeScript, hosted on Netlify
- **Backend**: Node.js/Python REST API, hosted on Railway or Vercel  
- **Database**: PostgreSQL for structured data storage
- **AI Service**: AWS Bedrock for reasoning evaluation and question generation
- **File Storage**: AWS S3 or similar for image uploads
- **Authentication**: JWT-based authentication with role-based access control

### Deployment Architecture

The system follows a microservices-inspired architecture with clear separation of concerns:

1. **Frontend Layer**: Single-page application handling user interactions, LaTeX rendering, and real-time features
2. **API Gateway**: Centralized REST API managing all backend communications
3. **Service Layer**: Modular services for authentication, question management, evaluation, and analytics
4. **Data Layer**: PostgreSQL database with optimized schemas for educational data
5. **AI Integration**: AWS Bedrock integration for natural language processing and generation

## Components and Interfaces

### Frontend Components

#### QuizInterface Component
- **Purpose**: Main quiz-taking interface with question display and response collection
- **Key Features**: 
  - LaTeX rendering for mathematical content
  - Dual input modes (text and image upload)
  - Real-time timer display and management
  - Progress tracking and navigation
- **State Management**: Manages current question, student responses, timer state, and submission status

#### ReasoningInput Component  
- **Purpose**: Handles both text and image-based reasoning input
- **Key Features**:
  - Rich text editor for mathematical expressions
  - Image upload with preview and cropping
  - Input validation and character counting
  - Auto-save functionality
- **Integration**: Connects with file upload service and validation APIs

#### FeedbackDisplay Component
- **Purpose**: Presents personalized AI-generated feedback
- **Key Features**:
  - Structured feedback presentation (answer + reasoning analysis)
  - Interactive elements for concept exploration
  - Progress indicators and improvement suggestions
  - LaTeX rendering for mathematical feedback

#### AdminDashboard Component
- **Purpose**: Institutional management interface
- **Key Features**:
  - Student enrollment and class management
  - Quiz creation and configuration tools
  - Analytics and reporting interfaces
  - Bulk operations and data export

### Backend Services

#### Authentication Service
**Purpose**: Manages user authentication and authorization
**Key Methods**:
- authenticateUser: Validates login credentials and returns authentication token
- validateToken: Verifies token validity and returns user context
- manageRoles: Assigns and updates user roles and permissions
- handleInstitutionalAccess: Manages institution-specific access rights

#### Question Management Service
**Purpose**: Handles question generation, retrieval, and validation
**Key Methods**:
- generateQuestions: Creates questions based on specified criteria
- retrieveQuestions: Fetches questions using filters
- validateQuestion: Ensures question meets quality standards
- manageQuestionBank: Performs bulk operations on question collections

**Question Criteria Structure**:
- subject: The academic subject section
- standard: Academic standard level
- difficulty: Question difficulty level
- count: Number of questions needed
- requiresReasoning: Whether reasoning component is mandatory

#### Evaluation Service
**Purpose**: Assesses student responses and generates feedback
**Key Methods**:
- evaluateResponse: Analyzes student answers and reasoning for scoring
- processImageReasoning: Extracts and processes reasoning from uploaded images
- generateFeedback: Creates personalized feedback based on evaluation results
- calibrateEvaluation: Incorporates human feedback to improve AI accuracy

**Student Response Structure**:
- questionId: Unique identifier for the question
- selectedAnswer: Student's chosen answer option
- reasoningText: Written explanation (optional)
- reasoningImage: Uploaded image explanation (optional)
- timeSpent: Duration spent on question in seconds
- studentId: Unique identifier for the student

#### Analytics Service
**Purpose**: Provides learning insights and progress tracking
**Key Methods**:
- trackStudentProgress: Monitors individual student learning progression
- identifyMisconceptions: Detects common reasoning errors across responses
- generateInstitutionalReports: Creates aggregate reports for educational institutions
- provideLearningInsights: Offers personalized learning recommendations

### External Service Integrations

#### AWS Bedrock Integration
**Purpose**: Interfaces with AWS AI services for natural language processing
**Key Methods**:
- evaluateReasoning: Assesses quality and accuracy of student reasoning
- generateQuestions: Creates new questions based on specified parameters
- extractImageContent: Converts image-based reasoning to analyzable text
- provideFeedback: Generates contextual feedback based on evaluation results

## Data Models

### Core Entities

#### User Model
**Core Fields**:
- id: Unique user identifier
- email: User's email address
- name: Full name
- role: User type (student, educator, or admin)
- institutionId: Associated institution (optional)
- preferences: User-specific settings
- createdAt: Account creation timestamp
- lastActive: Last login timestamp

**User Preferences Structure**:
- preferredSubjects: List of preferred academic subjects
- defaultStandard: Default academic standard level
- notificationSettings: Communication preferences
- accessibilityOptions: Accessibility accommodations

#### Question Model
**Core Fields**:
- id: Unique question identifier
- subject: Academic subject area
- standard: Academic standard level
- difficulty: Question difficulty rating
- questionText: The actual question content
- options: Available answer choices
- correctAnswer: The correct answer option
- reasoningCriteria: Evaluation criteria for reasoning
- metadata: Additional question information
- createdBy: Question author identifier
- isAIGenerated: Whether question was AI-created

**Reasoning Criteria Structure**:
- requiredConcepts: Key concepts that should be mentioned
- evaluationDimensions: Aspects to evaluate in reasoning
- minimumReasoningLength: Required minimum character count
- acceptableReasoningPatterns: Valid reasoning approaches

#### Student Response Model
**Core Fields**:
- id: Unique response identifier
- studentId: Student who submitted the response
- questionId: Question being answered
- quizSessionId: Associated quiz session
- selectedAnswer: Chosen answer option
- reasoningText: Written reasoning explanation (optional)
- reasoningImageUrl: URL to uploaded reasoning image (optional)
- timeSpent: Time spent on question in seconds
- submittedAt: Submission timestamp
- evaluationResult: AI assessment results (optional)

#### Evaluation Result Model
**Core Fields**:
- id: Unique evaluation identifier
- responseId: Associated student response
- answerScore: Score for answer correctness
- reasoningScore: Score for reasoning quality
- totalScore: Combined final score
- confidenceLevel: AI confidence in evaluation
- detailedAnalysis: Comprehensive reasoning assessment
- feedback: Personalized student feedback
- evaluatedAt: Evaluation timestamp
- requiresHumanReview: Flag for manual review needed

**Reasoning Analysis Structure**:
- conceptsIdentified: Concepts recognized in student reasoning
- logicalCoherence: Score for logical flow and consistency
- factualAccuracy: Score for factual correctness
- completeness: Score for thoroughness of explanation
- misconceptions: Identified reasoning errors
- strengths: Positive aspects of reasoning

#### Quiz Session Model
**Core Fields**:
- id: Unique session identifier
- studentId: Student taking the quiz
- quizId: Quiz being taken
- startTime: Session start timestamp
- endTime: Session completion timestamp (optional)
- timeLimit: Maximum allowed time in seconds (optional)
- currentQuestionIndex: Current question position
- responses: List of submitted student responses
- status: Session state (active, completed, or expired)
- finalScore: Overall quiz score (optional)

### Database Schema Design

The PostgreSQL database uses the following key design principles:
- Normalized structure to minimize data redundancy
- Indexed foreign keys for efficient joins
- JSON columns for flexible metadata storage
- Audit trails for all critical operations
- Partitioning for large response tables

Key relationships:
- Users belong to Institutions (optional)
- Questions belong to Subject Sections and Standards
- Student Responses link to Questions and Users
- Evaluation Results link to Student Responses
- Quiz Sessions aggregate multiple Student Responses

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property Reflection

After analyzing all acceptance criteria, several properties can be consolidated to eliminate redundancy:

- Response validation properties (1.2, 1.4) can be combined into comprehensive input validation
- Evaluation consistency properties (2.1, 2.5) can be unified into evaluation completeness
- Feedback generation properties (3.1-3.5) can be consolidated into comprehensive feedback quality
- Question filtering and generation properties (6.3, 6.5, 7.1) can be combined into content alignment
- Data security properties (14.1, 14.3-14.5) can be unified into comprehensive data protection

### Core Properties

**Property 1: Input Validation Completeness**
*For any* quiz question and student interaction, submission should be blocked until both answer selection and valid reasoning content (text ≥20 characters or accepted image format) are provided
**Validates: Requirements 1.2, 1.4**

**Property 2: Response Storage Integrity** 
*For any* valid student submission, the stored Student_Response should contain all submitted components (answer choice, reasoning content, metadata) and be retrievable with data integrity preserved
**Validates: Requirements 1.5**

**Property 3: Evaluation Completeness**
*For any* submitted Student_Response (text or image reasoning), the Reasoning_Evaluator should generate an Evaluation_Result containing both answer and reasoning scores with confidence metrics
**Validates: Requirements 2.1, 2.5**

**Property 4: Partial Credit Consistency**
*For any* evaluation where the selected answer is incorrect but reasoning demonstrates partial understanding, the total score should reflect partial credit proportional to reasoning quality
**Validates: Requirements 2.3**

**Property 5: Reasoning Gap Detection**
*For any* evaluation where the selected answer is correct but reasoning contains logical flaws, the evaluation should identify and flag the specific reasoning gaps
**Validates: Requirements 2.4**

**Property 6: Personalized Feedback Generation**
*For any* Evaluation_Result, the Feedback_Engine should generate feedback that addresses the specific answer choice, reasoning approach, and is adapted to the student's Subject_Section and Academic_Standard
**Validates: Requirements 3.1, 3.5**

**Property 7: Content Alignment Consistency**
*For any* selected Subject_Section and Academic_Standard combination, all retrieved or generated questions should match the specified criteria and difficulty level
**Validates: Requirements 6.3, 6.5, 7.1**

**Property 8: Image Processing Capability**
*For any* uploaded image in supported formats (JPG, PNG, PDF ≤10MB), the Image_Processor should extract readable content and enable reasoning evaluation
**Validates: Requirements 10.2, 10.3**

**Property 9: Timer Enforcement**
*For any* Timed_Test, when the time limit expires, the system should automatically submit the test and prevent further modifications regardless of completion status
**Validates: Requirements 9.3**

**Property 10: LaTeX Rendering Consistency**
*For any* mathematical content in questions or reasoning, the LaTeX_Renderer should display properly formatted notation that remains readable across different devices and screen sizes
**Validates: Requirements 8.1, 8.4**

**Property 11: Access Control Enforcement**
*For any* request to access student reasoning data, the system should only grant access to authorized educators and administrators based on their role and institutional affiliation
**Validates: Requirements 14.4**

**Property 12: Data Deletion Completeness**
*For any* student data deletion request, all associated reasoning text, images, evaluation results, and metadata should be permanently removed from the system
**Validates: Requirements 14.3**

**Property 13: Evaluation Override Learning**
*For any* manual override of AI evaluation by educators, the Reasoning_Evaluator should incorporate the feedback to improve consistency in future similar evaluations
**Validates: Requirements 13.3**

**Property 14: Analytics Pattern Recognition**
*For any* collection of Student_Responses across multiple students, the analytics system should identify recurring misconception patterns and generate appropriate instructional intervention suggestions
**Validates: Requirements 5.2, 5.5**

**Property 15: Question Quality Maintenance**
*For any* question in the system (AI-generated or database-sourced), it should meet established quality standards including reasoning requirements and proper evaluation criteria
**Validates: Requirements 7.4, 7.5**

## Error Handling

### Input Validation Errors
- **Invalid File Formats**: Reject unsupported image formats with clear error messages and format guidance
- **File Size Violations**: Block uploads exceeding 10MB with size limit notifications
- **Insufficient Reasoning**: Prevent submission when reasoning text is below 20 characters or image upload fails
- **Malformed LaTeX**: Detect and highlight LaTeX syntax errors in mathematical expressions

### AI Service Errors  
- **AWS Bedrock Failures**: Implement retry logic with exponential backoff for temporary service unavailability
- **Evaluation Timeouts**: Set reasonable timeouts for AI evaluation requests and provide fallback scoring
- **Content Extraction Failures**: Handle image processing failures gracefully with manual review flagging
- **Rate Limiting**: Implement request queuing and user notification for API rate limit scenarios

### Database Errors
- **Connection Failures**: Implement connection pooling and automatic reconnection with user-friendly error messages
- **Data Integrity Violations**: Validate all foreign key relationships and provide meaningful constraint violation messages
- **Transaction Rollbacks**: Ensure atomic operations for quiz submissions and evaluation storage
- **Storage Capacity**: Monitor database storage and implement archiving strategies for old response data

### Authentication and Authorization Errors
- **Token Expiration**: Implement automatic token refresh and graceful session extension
- **Insufficient Permissions**: Provide clear access denied messages with guidance on required permissions
- **Institution Access Violations**: Validate institutional boundaries and prevent cross-institution data access
- **Concurrent Session Management**: Handle multiple device logins and session conflicts appropriately

### System Integration Errors
- **File Storage Failures**: Implement redundant storage with automatic failover for image uploads
- **Network Connectivity**: Provide offline capability for quiz taking with synchronization upon reconnection
- **Third-party Service Dependencies**: Implement circuit breaker patterns for external service failures
- **Data Synchronization**: Handle eventual consistency issues between services with appropriate user feedback

## Testing Strategy

### Dual Testing Approach

The testing strategy employs both unit testing and property-based testing as complementary approaches:

**Unit Tests** focus on:
- Specific examples and edge cases for each component
- Integration points between frontend and backend services
- Error conditions and boundary value testing
- User interface behavior and accessibility compliance

**Property Tests** focus on:
- Universal properties that hold across all valid inputs
- Comprehensive input coverage through randomization
- Correctness properties derived from requirements
- System behavior under various load conditions

### Property-Based Testing Configuration

**Framework Selection**: 
- Frontend: fast-check for TypeScript/JavaScript property testing
- Backend: Hypothesis for Python or JSVerify for Node.js property testing

**Test Configuration**:
- Minimum 100 iterations per property test to ensure statistical confidence
- Each property test references its corresponding design document property
- Tag format: **Feature: student-reasoning-evaluator, Property {number}: {property_text}**

**Property Test Examples**:

**Property 1: Input Validation Completeness**
Test ensures that quiz submission is blocked until both answer selection and valid reasoning content (text ≥20 characters or accepted image format) are provided. The test generates various combinations of responses and verifies that submission validation correctly identifies complete vs incomplete responses.

**Property 3: Evaluation Completeness**  
Test verifies that every submitted student response (whether text or image reasoning) generates a complete evaluation result containing answer score, reasoning score, and confidence metrics. The test uses generated valid student responses and confirms all evaluation components are present.

### Unit Testing Strategy

**Component Testing**:
- React component testing with React Testing Library
- API endpoint testing with supertest or similar
- Database operation testing with test database instances
- AWS Bedrock integration testing with mocked services

**Integration Testing**:
- End-to-end quiz taking workflows
- Authentication and authorization flows  
- File upload and processing pipelines
- Real-time timer and submission functionality

**Performance Testing**:
- Load testing for concurrent quiz sessions
- Database query performance under high load
- AI service response time monitoring
- Image processing performance benchmarks

**Security Testing**:
- Input sanitization and SQL injection prevention
- Authentication bypass attempt detection
- Data access control validation
- Encryption verification for sensitive data

### Test Data Management

**Synthetic Data Generation**:
- Automated generation of test questions across all subjects
- Realistic student response patterns for analytics testing
- Varied reasoning quality samples for evaluation testing
- Edge case scenarios for error handling validation

**Test Environment Isolation**:
- Separate test databases with realistic data volumes
- Mocked AI services for consistent testing
- Isolated file storage for upload testing
- Containerized test environments for reproducibility