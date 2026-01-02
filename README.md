# MindGrade

AI-powered quiz application with proper frontend/backend separation.

## Project Structure

```
MindGrade/
├── frontend/          # React + Vite frontend application
│   ├── components/    # React components
│   ├── services/     # API services (Gemini AI integration)
│   ├── App.tsx       # Main React component
│   ├── index.tsx     # Entry point
│   ├── index.html    # HTML template
│   ├── package.json  # Frontend dependencies
│   └── vite.config.ts # Vite configuration
├── backend/          # Backend API (to be implemented)
│   ├── package.json  # Backend dependencies
│   └── README.md     # Backend documentation
└── package.json      # Root package.json for workspace management
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Install root dependencies:
```bash
npm install
```

2. Install frontend dependencies:
```bash
cd frontend
npm install
```

3. Set up environment variables:
   - Copy `.env` file in the `frontend/` directory
   - Add your `GEMINI_API_KEY`:
   ```
   GEMINI_API_KEY=your_api_key_here
   ```

### Running the Application

#### Option 1: Run from root (recommended)
```bash
npm run dev
```

#### Option 2: Run from frontend directory
```bash
cd frontend
npm run dev
```

The application will be available at `http://localhost:3000`

### Building for Production

```bash
npm run build
```

## Development

- **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS
- **Backend**: To be implemented (Node.js/Express, Python/Flask, etc.)

## Troubleshooting

### Blank Screen Issue

If you see a blank screen:
1. Check browser console for errors
2. Verify your `GEMINI_API_KEY` is set in `.env` file
3. Make sure all dependencies are installed: `npm install` in the frontend directory
4. Clear browser cache and restart the dev server

### Port Already in Use

If port 3000 is already in use, you can change it in `frontend/vite.config.ts`:
```typescript
server: {
  port: 3001, // Change to available port
  host: '0.0.0.0',
}
```

## Notes

- The frontend currently makes direct API calls to Google's Gemini API
- For production, consider moving API calls to the backend for better security
- The backend folder is ready for future API implementation
