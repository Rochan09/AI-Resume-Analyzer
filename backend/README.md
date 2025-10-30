# AI Resume Builder — Backend

Simple Express backend scaffold for the AI Resume Builder frontend.

Features:
- Save/load resumes (stored as JSON in `data/resumes.json`)
- Export a saved resume to PDF (uses `pdfkit`) — returns a download URL under `/exports`
- Simulated ATS analysis endpoint that accepts a file and optional job description

Run (PowerShell):

```powershell
cd "r:\Projects\AI Resume Builder\backend"
npm install
npm run start
# or for development with auto-restart (nodemon):
npm run dev
```

API endpoints summary
- POST /api/resume — create/update a resume (JSON body). Returns { ok, id }
- GET /api/resume — list saved resumes
- GET /api/resume/:id — get a resume by id
- DELETE /api/resume/:id — delete resume
- POST /api/resume/:id/export — creates a PDF and returns { ok, url }
- POST /api/ats/analyze — multipart/form-data with `resume` file and `jobDescription` field. Returns simulated analysis

Notes
- This scaffold uses simple file-based storage. For production, swap to a database.
- ATS and suggestions are simulated via heuristics. Replace with an NLP/AI service for real results.
