# 🚀 SmartResume AI

Build professional resumes, analyze ATS scores, and practice interviews with AI—all in one platform.

## ✨ Key Features

- **Resume Builder** - Create and export professional resumes with real-time preview
- **ATS Analysis** - Upload resume to check compatibility and get improvement tips
- **Interview Prep** - Generate personalized questions from your resume
- **AI Mock Interview** - Practice with voice-enabled AI interviewer and get instant feedback
- **Dark Mode** - Comfortable viewing experience

## 🛠️ Tech Stack

**Frontend:** React, TypeScript, Vite, Tailwind CSS  
**Backend:** Node.js, Express, MongoDB  
**Features:** JWT Auth, PDF Export, Voice Recognition

## 📁 Project Structure

```
AI-Resume-Builder/
├── frontend/          # React app
│   └── src/
│       ├── components/    # UI components
│       ├── contexts/      # State management
│       └── pages/         # App pages
├── backend/           # Express API
│   ├── routes/        # API endpoints
│   ├── models/        # Database schemas
│   └── server.js      # Entry point
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v16+)
- MongoDB (local or Atlas)

### Installation

1. **Clone the repo**
   ```bash
   git clone https://github.com/Rochan09/AI-Resume-Builder.git
   cd AI-Resume-Builder
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   ```
   
   Create `.env` file:
   ```env
   PORT=5001
   MONGODB_URI=mongodb://localhost:27017/ai-resume-builder
   JWT_SECRET=your-secret-key-here
   ```

3. **Setup Frontend**
   ```bash
   cd frontend
   npm install
   ```

### Run the App

Open two terminals:

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

Visit **http://localhost:5173**

## 📖 How to Use

1. **Sign Up** - Create an account
2. **Build Resume** - Fill in your details, add experience, skills, projects
3. **Download PDF** - Export your professional resume
4. **ATS Analysis** - Upload resume to check compatibility
5. **Interview Prep** - Generate questions from your resume
6. **AI Interview** - Practice with voice-enabled AI interviewer

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Sign in

### Resume
- `POST /api/resume/save` - Save resume
- `GET /api/resume/my-resumes` - Get saved resumes
- `POST /api/resume/export` - Generate PDF

### ATS & Interview
- `POST /api/ats/analyze` - Analyze resume + generate questions
- `POST /api/interview/save-session` - Save interview results
- `GET /api/interview/history` - Get interview history

## 🤝 Contributing

1. Fork the repo
2. Create feature branch (`git checkout -b feature/name`)
3. Commit changes (`git commit -m "Add feature"`)
4. Push to branch (`git push origin feature/name`)
5. Open Pull Request

## 📄 License

MIT License - see [LICENSE](LICENSE) file

---

**Made with ❤️ by [@Rochan09](https://github.com/Rochan09)**

