# Dynamic Interview Question Generation - Technical Documentation

## Overview
The interview preparation system now generates **personalized, intelligent interview questions** based on:
- ✅ Resume content and skills
- ✅ Experience level (Entry/Intermediate/Senior)
- ✅ Job description (if provided)
- ✅ Company context from job posting
- ✅ Specific projects and achievements
- ✅ Question difficulty appropriate to experience level

## Key Features

### 1. **Experience Level Detection**
Automatically determines candidate's experience level based on years of experience mentioned in resume:
- **Entry Level**: 0-2 years
- **Intermediate**: 3-4 years  
- **Senior**: 5+ years

### 2. **Three Question Categories**

#### 🎯 Behavioral/HR Questions (15-20 questions)
- Universal interview openers ("Tell me about yourself")
- Company-specific questions when job description provided
- STAR method questions appropriate to experience level
- Level-specific behavioral scenarios

#### 💻 Technical Questions (Up to 15 questions)
- Job description skills prioritized
- Resume skills with varying depth by experience level
- Category-specific questions (Frontend, Backend, Database, Cloud)
- Difficulty scales with experience level

#### 📁 Project/Resume-Based Questions (Up to 12 questions)
- Direct quotes from resume projects
- Achievement-based deep dives
- Technical decision-making questions
- Level-appropriate project complexity

### 3. **Job Description Intelligence**

When job description is provided, the system:
- ✅ Extracts company name using pattern matching
- ✅ Identifies job role/position
- ✅ Detects required skills from job posting
- ✅ Generates company-specific questions
- ✅ Prioritizes skills mentioned in job description
- ✅ Asks about missing skills ("This role requires X. What is your experience?")

### 4. **Question Difficulty by Experience Level**

#### Entry Level (0-2 years)
**Behavioral:**
- "What motivated you to pursue this career?"
- "Describe a challenging project from education"
- "How do you approach learning new technologies?"

**Technical:**
- "What is your experience with [skill]?"
- "Describe a technical challenge you faced"
- "How do you stay updated with new technologies?"

**Project:**
- "Walk me through your most significant project"
- "What was your role in team projects?"

#### Intermediate Level (3-4 years)
**Behavioral:**
- "Tell me about a time you dealt with a difficult team member"
- "Describe a situation where you disagreed with your manager"
- "How do you prioritize multiple projects?"

**Technical:**
- "Explain a complex problem you solved using [skill]"
- "How do you ensure code quality?"
- "Describe your debugging process"

**Project:**
- "Tell me about a project that didn't go as planned"
- "How do you handle changing requirements?"
- "Describe your experience with agile methodologies"

#### Senior Level (5+ years)
**Behavioral:**
- "Describe your leadership style with mentorship examples"
- "Tell me about a difficult architectural decision"
- "How do you handle team conflicts?"

**Technical:**
- "How would you architect a scalable system using [skill]?"
- "Describe your approach to system design for high-traffic apps"
- "How do you evaluate and introduce new technologies?"

**Project:**
- "Describe the most complex system you've architected"
- "How do you balance technical excellence with business needs?"
- "Tell me about refactoring a legacy system"

## Implementation Details

### Backend Function: `generateQuestionsFromText(text, jobDescription)`

#### Input Parameters:
- `text` (string): Extracted resume text content
- `jobDescription` (string, optional): Job posting text

#### Processing Steps:

1. **Extract Resume Information**
   ```javascript
   - Candidate name (pattern matching)
   - Years of experience (regex: /(\d+)\+?\s*(years?|yrs?)/gi)
   - Skills (using SKILLS_DATABASE - 100+ technologies)
   - Projects (lines mentioning: project, built, developed, created)
   - Experience (lines mentioning: managed, led, coordinated)
   - Achievements (lines with metrics: %, $, increased, improved)
   ```

2. **Analyze Job Description**
   ```javascript
   - Company name extraction (5+ pattern variations)
   - Job role identification (multiple regex patterns)
   - Required skills detection (using same SKILLS_DATABASE)
   ```

3. **Generate Questions**
   ```javascript
   generateBehavioralQuestions(name, level, company, role)
   generateTechnicalQuestions(skills, jdSkills, categories, level)
   generateProjectQuestions(projects, experience, achievements, level, skills)
   ```

#### Output Format:
```javascript
{
  hr: [array of 15-20 behavioral questions],
  technical: [array of up to 15 technical questions],
  project: [array of up to 12 project questions],
  detectedSkills: [array of detected skill strings]
}
```

### Helper Functions

#### `extractCompanyName(jobDescription)`
Identifies company name from job description using patterns:
- "About [Company] is"
- "Join [Company] –"
- "[Company] is seeking/hiring"
- "at/@ [Company]"

#### `extractJobRole(jobDescription)`
Extracts job position from phrases:
- "hiring/seeking/looking for a [Role]"
- "Position: [Role]"
- "Role: [Role]"

#### `generateBehavioralQuestions(name, level, company, role)`
Creates 15-20 STAR-method behavioral questions:
- Universal openers for all levels
- Company-specific when available
- Level-appropriate scenarios
- Common interview closing questions

#### `generateTechnicalQuestions(skills, jdSkills, categories, level)`
Generates up to 15 technical questions:
- Prioritizes job description skills first
- Adapts depth to experience level
- Includes category-specific questions
- Covers debugging, testing, workflow

#### `generateProjectQuestions(projectLines, experienceLines, achievementLines, level, skills)`
Creates up to 12 project questions:
- Direct quotes from resume (first 3 projects)
- Achievement deep-dives (first 2 achievements)
- Leadership questions for mid+ level
- Level-appropriate complexity

## Example Output

### Entry Level Resume (No Job Description)
```javascript
{
  hr: [
    "Tell me about yourself and your background.",
    "Why are you interested in this role?",
    "What motivated you to pursue a career in this field?",
    "Describe a challenging project from your education or internship.",
    "How do you approach learning new technologies?",
    // ... more questions
  ],
  technical: [
    "What is your experience with JavaScript?",
    "What is your experience with React?",
    "Describe a technical challenge you faced and how you solved it.",
    "How do you stay updated with new technologies?",
    // ... more questions
  ],
  project: [
    'Can you elaborate on: "Built a task management app using React and Node.js"?',
    "Walk me through your most significant project.",
    "What was the biggest challenge you faced in a project?",
    // ... more questions
  ]
}
```

### Senior Level Resume (With Job Description for Google)
```javascript
{
  hr: [
    "Tell me about yourself and your background.",
    "John, what attracted you to this opportunity?",
    "Why do you want to work at Google?",
    "What do you know about Google's products/services?",
    "Describe your leadership style and mentorship examples.",
    "Tell me about a difficult architectural decision.",
    // ... more questions
  ],
  technical: [
    "The job requires Kubernetes. Can you walk me through a project where you used it?",
    "The job requires Go. Can you walk me through a project where you used it?",
    "How would you architect a scalable system using Docker?",
    "Describe your approach to system design for high-traffic applications.",
    "How do you make trade-offs between architectural patterns?",
    // ... more questions
  ],
  project: [
    'Can you elaborate on: "Led migration of microservices to Kubernetes cluster..."?',
    'Walk me through: "Reduced infrastructure costs by 40% through..."?',
    "Describe the most complex system you've architected.",
    "How do you balance technical excellence with business requirements?",
    // ... more questions
  ]
}
```

## Question Variety & Uniqueness

### Avoiding Repetition
- Each resume generates unique questions based on actual content
- Project questions quote specific lines from resume
- Skill questions reference actual technologies found
- No two resumes will have identical question sets

### Common Interview Questions Included
✅ "Tell me about yourself"
✅ "Why are you interested in this role?"
✅ "What are your strengths and weaknesses?"
✅ "Where do you see yourself in 5 years?"
✅ "Why are you leaving your current position?"
✅ "Describe a time you went above and beyond"

### Industry-Standard Topics Covered
- ✅ STAR method behavioral questions
- ✅ Technical depth questions
- ✅ Leadership and teamwork
- ✅ Problem-solving approaches
- ✅ Code quality and best practices
- ✅ System design and architecture
- ✅ Project management
- ✅ Communication skills

## API Integration

### Endpoint: POST `/api/ats/analyze`

**Request:**
```javascript
const formData = new FormData();
formData.append('resume', file);
formData.append('jobDescription', jobDescText); // Optional but recommended
```

**Response:**
```javascript
{
  ok: true,
  atsScore: 75,
  grade: "Good",
  // ... other ATS data ...
  questions: {
    hr: ["Question 1", "Question 2", ...],
    technical: ["Question 1", "Question 2", ...],
    project: ["Question 1", "Question 2", ...],
    detectedSkills: ["JavaScript", "React", ...]
  }
}
```

## Frontend Display (QuestionsPage.tsx)

Questions are stored in sessionStorage and displayed by category:
- **Behavioral** → `questions.hr`
- **Technical** → `questions.technical`  
- **Situational** → Combined from behavioral
- **Resume-Based** → `questions.project`

## Benefits

### For Users
✅ **Personalized**: Questions based on their actual resume
✅ **Relevant**: Matches job requirements when description provided
✅ **Appropriate Difficulty**: Questions match experience level
✅ **Comprehensive**: Covers behavioral, technical, and project areas
✅ **Specific**: Direct quotes from their resume projects
✅ **Preparedness**: Company and role-specific questions

### For Interview Success
✅ **STAR Method Ready**: Behavioral questions designed for structured answers
✅ **Technical Depth**: Appropriate complexity for experience level
✅ **Real Examples**: Questions about actual projects from resume
✅ **Company Research**: Prompts about specific employer
✅ **Common Questions**: Industry-standard questions included
✅ **Skill Validation**: Prepared to discuss resume skills

## Future Enhancements

1. **AI-Generated Follow-ups**: Context-aware follow-up questions
2. **Industry-Specific Questions**: Tailored by field (FinTech, Healthcare, etc.)
3. **Mock Interview Mode**: Timed practice with sample answers
4. **Answer Quality Scoring**: AI evaluation of user responses
5. **Video Interview Prep**: Camera practice with feedback
6. **Cultural Fit Questions**: Company values alignment
7. **Salary Negotiation**: Compensation discussion prep
8. **Red Flag Handling**: Difficult question strategies

## Conclusion

The enhanced interview question generation system provides candidates with a **personalized, intelligent interview preparation experience** that adapts to their experience level, resume content, and target job description. Questions are unique to each resume while covering all essential interview topics with appropriate difficulty and depth.
