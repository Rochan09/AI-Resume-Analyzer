# 🚀 AI Resume Builder - Complete Technical Documentation

## 📋 Project Overview

**AI Resume Builder** is a full-stack web application that helps users create, optimize, and analyze resumes using AI-powered features. It includes ATS (Applicant Tracking System) analysis, AI-driven suggestions, and a mock interview simulator with voice recognition.

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      CLIENT SIDE                             │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ React 18 + TypeScript + Vite                           │ │
│  │ - Hash-based SPA routing                               │ │
│  │ - Context API for state management                     │ │
│  │ - Tailwind CSS + Framer Motion                        │ │
│  │ - Web Speech API (TTS + Voice Recognition)            │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTP/REST API
                            │ (fetch, JSON)
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                      SERVER SIDE                             │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Node.js + Express.js                                   │ │
│  │ - RESTful API endpoints                                │ │
│  │ - JWT authentication                                   │ │
│  │ - File upload/processing (Multer)                     │ │
│  │ - PDF/DOCX parsing                                     │ │
│  └────────────────────────────────────────────────────────┘ │
│                            │                                 │
│                            ↓                                 │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ MongoDB (Mongoose ODM)                                 │ │
│  │ - User accounts & authentication                       │ │
│  │ - Resume storage & versioning                          │ │
│  │ - Interview history                                    │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎨 Frontend Technologies

### **Core Framework**
- **React 18.3.1** 
  - **Why**: Modern hooks-based architecture, virtual DOM for performance, massive ecosystem
  - **Usage**: Component-based UI, functional components with hooks
  
- **TypeScript 5.5.3**
  - **Why**: Type safety reduces bugs, better IDE support, self-documenting code
  - **Usage**: Strict typing for components, props, state, API responses

### **Build Tool**
- **Vite 5.4.2**
  - **Why**: Lightning-fast HMR (Hot Module Replacement), optimized production builds, native ESM support
  - **vs. Create React App**: 10-100x faster dev server startup, instant HMR
  - **Configuration**: Optimized for Lucide icons, React Fast Refresh

### **Styling & UI**
- **Tailwind CSS 3.4.1**
  - **Why**: Utility-first CSS eliminates CSS bloat, responsive design built-in, dark mode support
  - **Configuration**: Custom dark mode (class-based), extended theme
  - **PostCSS**: Autoprefixer for cross-browser compatibility

- **Framer Motion 12.23.24**
  - **Why**: Declarative animations, spring physics, gesture support
  - **Usage**: Page transitions, avatar animations, interview UI effects
  - **Examples**: Robot avatar floating, modal fade-ins, button interactions

- **Lucide React 0.344.0**
  - **Why**: 1000+ beautiful icons, tree-shakeable (only imports used icons), consistent design
  - **Usage**: UI icons throughout app (Mic, Eye, Play, Download, etc.)

### **PDF Generation**
- **jsPDF 3.0.3** + **html2canvas 1.4.1**
  - **Why**: Client-side PDF generation, no server load
  - **Usage**: Export resumes as PDF, capture DOM as canvas → convert to PDF
  - **Workflow**: `DOM → html2canvas → Image → jsPDF → Download`

### **State Management**
- **React Context API** (built-in)
  - **Why**: No external dependencies, perfect for small-to-medium apps
  - **Contexts**:
    - `AuthContext`: User authentication, JWT token, login/logout
    - `ResumeContext`: Resume data, CRUD operations, localStorage persistence
    - `ThemeContext`: Dark/light mode toggle

### **Routing**
- **Hash-based SPA routing** (custom implementation)
  - **Why**: Simple, no server-side configuration needed
  - **Implementation**: `window.location.hash` + `hashchange` event listener
  - **Protected routes**: Checks `isAuthenticated` before rendering

### **Browser APIs Used**
- **Web Speech API**
  - **SpeechSynthesis (TTS)**: AI reads interview questions aloud
  - **SpeechRecognition**: Voice-to-text for answering interview questions
  - **Why**: Native browser feature, no API costs, offline-capable
  - **Fallback**: Gracefully degrades if unsupported

- **localStorage**
  - **Usage**: Persist auth token, user data, resume data across sessions
  - **Why**: Simple, synchronous, sufficient for non-sensitive cached data

- **sessionStorage**
  - **Usage**: Temporary data (candidate name, interview questions)
  - **Why**: Clears on tab close, perfect for interview session data

---

## 🖥️ Backend Technologies

### **Runtime & Framework**
- **Node.js 20.15.0**
  - **Why**: JavaScript on server = code sharing, async I/O for high concurrency
  
- **Express.js 4.18.2**
  - **Why**: Minimalist, flexible, huge middleware ecosystem
  - **Features**: RESTful routing, middleware chain, error handling

### **Database**
- **MongoDB 7.8.7** (via Mongoose ODM)
  - **Why**: 
    - Schema-less (flexible resume structures)
    - JSON-native (matches frontend data structure)
    - Scalable (horizontal sharding for growth)
    - Rich queries (aggregation, text search)
  - **Models**:
    - **User**: email, password (bcrypt hashed), fullName, timestamps
    - **Resume**: userId reference, resume data (nested), ATS score, grade
  - **Mongoose**: Schema validation, middleware hooks, populate (joins)

### **Authentication**
- **JWT (jsonwebtoken 9.0.0)**
  - **Why**: Stateless (no server sessions), scalable, works with SPA
  - **Flow**: Login → Server signs JWT → Client stores in localStorage → Includes in headers
  
- **bcryptjs 2.4.3**
  - **Why**: One-way hash (irreversible), salted (unique per user), slow (prevents brute force)
  - **Usage**: Hash passwords on registration, compare on login

### **File Handling**
- **Multer 1.4.5-lts.1**
  - **Why**: Multipart/form-data parser for file uploads
  - **Usage**: Upload PDF/DOCX resumes, store in `backend/data/uploads/`
  - **Storage**: Custom disk storage with filename sanitization

- **pdf-parse 1.1.1**
  - **Why**: Extract text from PDF files
  - **Usage**: Parse uploaded resumes for ATS analysis

- **mammoth 1.4.19**
  - **Why**: Convert DOCX to HTML/text
  - **Usage**: Parse uploaded Word documents

### **PDF Generation (Server-side)**
- **PDFKit 0.13.0**
  - **Why**: Generate PDFs programmatically on server
  - **Usage**: Alternative server-side PDF export endpoint

### **Utilities**
- **UUID 9.0.0**
  - **Why**: Generate unique IDs for resumes, files
  
- **CORS 2.8.5**
  - **Why**: Allow frontend (localhost:5173) to call backend (localhost:5001)
  - **Security**: Configured for development (allow all origins)

- **Morgan 1.10.0**
  - **Why**: HTTP request logger for debugging
  - **Format**: 'dev' (colorized, concise)

- **dotenv 16.6.1**
  - **Why**: Load environment variables from .env file
  - **Variables**: MONGODB_URI, JWT_SECRET, PORT

---

## 📂 Project Structure

```
AI Resume Builder/
│
├── frontend/                     # React + TypeScript + Vite
│   ├── src/
│   │   ├── components/           # Reusable UI components
│   │   │   ├── AIInterviewerAvatar.tsx  # 3D robot avatar
│   │   │   ├── Footer.tsx
│   │   │   ├── Navbar.tsx
│   │   │   └── ResumePreview.tsx        # Resume renderer
│   │   │
│   │   ├── contexts/             # React Context providers
│   │   │   ├── AuthContext.tsx   # JWT auth, login/logout
│   │   │   ├── ResumeContext.tsx # Resume CRUD operations
│   │   │   └── ThemeContext.tsx  # Dark mode toggle
│   │   │
│   │   ├── pages/                # Route components
│   │   │   ├── HomePage.tsx      # Landing page
│   │   │   ├── LoginPage.tsx     # Auth (password toggle, forgot password)
│   │   │   ├── RegisterPage.tsx
│   │   │   ├── BuilderPageNew.tsx    # Resume editor
│   │   │   ├── ATSPage.tsx           # Resume scoring
│   │   │   ├── QuestionsPage.tsx     # Interview prep questions
│   │   │   ├── ImprovementPage.tsx   # AI suggestions
│   │   │   ├── MockInterviewPage.tsx # AI voice interview
│   │   │   ├── InterviewHistoryPage.tsx
│   │   │   └── ProfilePage.tsx
│   │   │
│   │   ├── App.tsx               # Root component, routing
│   │   ├── main.tsx              # React entry point
│   │   └── index.css             # Global styles, animations
│   │
│   ├── index.html                # HTML template
│   ├── package.json              # Dependencies
│   ├── vite.config.ts            # Vite configuration
│   ├── tailwind.config.js        # Tailwind theme
│   └── tsconfig.json             # TypeScript config
│
├── backend/                      # Node.js + Express + MongoDB
│   ├── routes/
│   │   ├── auth.js               # POST /login, /register
│   │   ├── resume.js             # CRUD for resumes
│   │   ├── ats.js                # POST /analyze (ATS scoring)
│   │   ├── suggestions.js        # AI improvement suggestions
│   │   └── interview.js          # Interview endpoints
│   │
│   ├── models/
│   │   ├── User.js               # Mongoose schema (email, password)
│   │   └── Resume.js             # Mongoose schema (nested data)
│   │
│   ├── middleware/
│   │   └── auth.js               # JWT verification middleware
│   │
│   ├── data/
│   │   ├── uploads/              # Uploaded resume files
│   │   └── resumes.json          # Legacy flat-file storage
│   │
│   ├── public/
│   │   └── exports/              # Generated PDF downloads
│   │
│   ├── server.js                 # Express app entry point
│   ├── package.json              # Backend dependencies
│   └── .env                      # Environment variables
│
├── .gitignore                    # Git ignore rules
└── README.md                     # Project documentation
```

---

## 🔐 Authentication Flow

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │ 1. POST /api/auth/register
       │    { email, password, fullName }
       ↓
┌─────────────────────────────────────┐
│   Backend: /routes/auth.js          │
│   - Validate input                  │
│   - Check if user exists            │
│   - Hash password (bcrypt)          │
│   - Save to MongoDB                 │
│   - Generate JWT (user.id, secret)  │
└──────┬──────────────────────────────┘
       │ 2. Response: { ok: true, token, user }
       ↓
┌─────────────────────────────────────┐
│   Client: AuthContext.tsx           │
│   - Store token in localStorage     │
│   - Store user in state             │
│   - Redirect to builder             │
└──────┬──────────────────────────────┘
       │ 3. Subsequent requests include header:
       │    Authorization: Bearer <token>
       ↓
┌─────────────────────────────────────┐
│   Backend: middleware/auth.js       │
│   - Extract token from header       │
│   - Verify JWT signature            │
│   - Decode user.id                  │
│   - Attach req.user = decoded       │
└─────────────────────────────────────┘
```

---

## 📊 Key Features & Technologies Used

### **1. Resume Builder**
- **Tech**: React forms, Tailwind CSS, ResumeContext
- **Features**: Personal info, education, experience, skills, projects
- **Storage**: localStorage (frontend), MongoDB (backend)
- **Export**: jsPDF + html2canvas → PDF download

### **2. ATS (Applicant Tracking System) Analysis**
- **Tech**: Node.js text analysis, keyword matching, scoring algorithm
- **Workflow**:
  1. Upload PDF/DOCX or paste text
  2. Backend extracts text (pdf-parse, mammoth)
  3. Analyze: keyword density, action verbs, structure, skills
  4. Score: 0-100 (weighted algorithm)
  5. Generate suggestions (missing skills, weak verbs)
- **Algorithm**:
  ```javascript
  // Simplified scoring logic
  const score = 
    (keywordsScore * 0.35) +      // Skill match 35%
    (actionVerbsScore * 0.15) +   // Strong verbs 15%
    (structureScore * 0.20) +     // Formatting 20%
    (quantificationScore * 0.15) + // Numbers/metrics 15%
    (lengthScore * 0.15);         // Optimal length 15%
  ```

### **3. AI Interview Simulator**
- **Tech**: Web Speech API (SpeechSynthesis + SpeechRecognition)
- **Features**:
  - **Voice TTS**: AI reads questions aloud
  - **Voice input**: Speak answers (transcribed)
  - **3D Robot Avatar**: Animated states (idle, speaking, listening)
  - **Modes**: HR interview, Technical interview, Full interview
  - **Question generation**: Based on resume analysis
- **Animations**: Framer Motion, custom CSS keyframes

### **4. Interview Questions Generator**
- **Tech**: Text analysis, categorization (hr, technical, project-based)
- **Personalization**: Extracts candidate name from resume
- **Categories**:
  - HR: Tell me about yourself, strengths/weaknesses
  - Technical: Deep-dive on skills (React, Python, etc.)
  - Projects: Explain project architecture, challenges
  - Certifications: How do you apply AWS knowledge?

### **5. Dark Mode**
- **Tech**: Tailwind CSS dark mode (class-based)
- **Implementation**: ThemeContext toggles `dark` class on `<html>`
- **Persistence**: localStorage stores theme preference

---

## 🚀 Performance Optimizations

1. **Vite HMR**: Instant updates during development
2. **Code splitting**: Dynamic imports for routes (potential future optimization)
3. **Tailwind purge**: Removes unused CSS in production
4. **Image optimization**: svg icons (Lucide) are tree-shaken
5. **MongoDB indexing**: email (unique), userId (for resume lookups)
6. **localStorage caching**: Reduce API calls for resume data
7. **Debounced inputs**: In resume editor (future enhancement)

---

## 🔒 Security Measures

1. **Password hashing**: bcrypt (salt rounds: 10)
2. **JWT expiration**: Tokens expire (configurable)
3. **CORS**: Restrict origins in production
4. **Input validation**: Check email format, password strength
5. **SQL injection**: N/A (NoSQL, but Mongoose sanitizes)
6. **File upload limits**: Multer file size restrictions
7. **Environment variables**: Secrets in .env (not committed)
8. **.gitignore**: Prevents committing node_modules, .env, uploads

---

## 🌐 API Endpoints

### **Authentication**
```
POST /api/auth/register    - Create account
POST /api/auth/login       - Get JWT token
POST /api/auth/logout      - (Optional) Blacklist token
```

### **Resume Management**
```
GET    /api/resume         - Get all user resumes (protected)
POST   /api/resume         - Create new resume (protected)
GET    /api/resume/:id     - Get single resume (protected)
PUT    /api/resume/:id     - Update resume (protected)
DELETE /api/resume/:id     - Delete resume (protected)
```

### **ATS Analysis**
```
POST /api/ats/analyze      - Upload resume, get score + suggestions
POST /api/ats/analyze-text - Analyze pasted text
```

### **Suggestions**
```
POST /api/suggestions      - Get AI improvement suggestions
```

### **Interview**
```
POST /api/interview/save   - Save interview result (protected)
GET  /api/interview        - Get interview history (protected)
```

---

## 🛠️ Development Tools

### **Frontend**
- **ESLint**: Code linting (JavaScript/TypeScript)
- **TypeScript**: Static type checking
- **Vite Dev Server**: Port 5173, HMR

### **Backend**
- **Nodemon**: Auto-restart on file changes
- **Morgan**: HTTP request logging

### **Database**
- **MongoDB Atlas**: Cloud-hosted MongoDB (production)
- **MongoDB Compass**: GUI for local development

---

## 🎯 Why This Tech Stack?

### **MERN Stack (Modified)**
- **M**ongoDB: Flexible schema for resumes
- **E**xpress: Fast, minimal backend framework
- **R**eact: Dominant frontend library, rich ecosystem
- **N**ode.js: JavaScript everywhere (full-stack)

### **Additions**
- **TypeScript**: Catch bugs at compile-time
- **Tailwind**: Rapid UI development
- **Vite**: Modern build tool (faster than Webpack)
- **JWT**: Scalable stateless auth

### **Trade-offs**
| Choice | Pro | Con |
|--------|-----|-----|
| MongoDB | Flexible schema | No ACID transactions |
| JWT | Stateless, scalable | Can't revoke before expiration |
| localStorage | Simple, fast | XSS vulnerable if not careful |
| Hash routing | No server config | Ugly URLs (#/page) |
| Web Speech API | Free, native | Limited browser support |

---

## 📈 Scalability Considerations

### **Current State**: Monolithic (single backend, single DB)
### **Future Enhancements**:
1. **CDN**: Serve frontend static files via CloudFlare/AWS CloudFront
2. **Load Balancer**: NGINX/AWS ALB for multiple backend instances
3. **Database sharding**: Partition resumes by userId
4. **Redis caching**: Cache ATS scores, user sessions
5. **Microservices**: Separate ATS service, Interview service
6. **File storage**: Move uploads to S3/Azure Blob (not local disk)
7. **Real-time features**: WebSockets for collaborative editing

---

## 🧪 Testing (Not Yet Implemented)

### **Recommended Tools**:
- **Frontend**: Vitest (unit), Playwright (E2E)
- **Backend**: Jest (unit), Supertest (API)
- **Database**: MongoDB Memory Server (mock DB)

---

## 📦 Deployment

### **Frontend**
```bash
cd frontend
npm run build        # → dist/ folder
# Deploy to: Vercel, Netlify, GitHub Pages
```

### **Backend**
```bash
cd backend
npm start            # Production: node server.js
# Deploy to: Heroku, Render, AWS EC2, DigitalOcean
```

### **Environment Variables** (Production)
```env
# backend/.env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/resumedb
JWT_SECRET=your-super-secret-key-change-in-production
PORT=5001
NODE_ENV=production
```

---

## 🐛 Known Issues & Limitations

1. **Web Speech API**: Only works in Chrome/Edge (not Firefox/Safari)
2. **PDF parsing accuracy**: Complex layouts may not extract correctly
3. **ATS scoring**: Simplified algorithm (not as advanced as real ATS systems like Workday/Greenhouse)
4. **No email verification**: Users can register with fake emails
5. **Single tenant**: No org/team workspaces
6. **No collaborative editing**: Can't share resume with others in real-time

---

## 🔮 Future Roadmap

- [ ] AI-powered content generation (OpenAI/Anthropic API)
- [ ] Resume templates (modern, classic, creative)
- [ ] Linkedin integration (import profile)
- [ ] Email verification + password reset
- [ ] Analytics dashboard (views, downloads)
- [ ] Multi-language support (i18n)
- [ ] Mobile app (React Native)
- [ ] Real-time collaboration (Operational Transform/CRDT)

---

## 📚 Learning Resources

- [React Docs](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Express Guide](https://expressjs.com/en/guide/routing.html)
- [MongoDB University](https://university.mongodb.com/)
- [JWT.io](https://jwt.io/introduction)
- [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)

---

## 🤝 Contributing

1. Fork the repo
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

## 📄 License

This project is for educational purposes. See LICENSE file for details.

---

## 👨‍💻 Author

Built with ❤️ by Rochan09

---

## 🙏 Acknowledgments

- React team for amazing framework
- Tailwind Labs for utility-first CSS
- MongoDB for flexible database
- Lucide for beautiful icons
- Open source community for all the libraries used
