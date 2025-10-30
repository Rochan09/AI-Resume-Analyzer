const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pdf = require('pdf-parse');
const mammoth = require('mammoth');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();
const uploadDir = path.join(__dirname, '..', 'data', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/[^a-z0-9.]/gi, '_')}`)
});
const upload = multer({ storage });

async function extractTextFromFile(filePath, mimetype) {
  const ext = path.extname(filePath).toLowerCase();
  try {
    if (ext === '.pdf' || mimetype === 'application/pdf') {
      const data = fs.readFileSync(filePath);
      const parsed = await pdf(data);
      return parsed.text || '';
    }
    if (ext === '.docx' || mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      const result = await mammoth.extractRawText({ path: filePath });
      return result.value || '';
    }
    // fallback: read as text
    return fs.readFileSync(filePath, 'utf8');
  } catch (e) {
    console.error('extractText error', e);
    return '';
  }
}

function generateQuestionsFromText(text) {
  // Basic heuristics to create HR / technical / project questions
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const lower = text.toLowerCase();

  // Person name detection (very simple)
  let name = null;
  const nameMatch = text.match(/([A-Z][a-z]+\s[A-Z][a-z]+)/);
  if (nameMatch) name = nameMatch[0];

  // Extract skills simple: look for common tech words
  const techKeywords = ['javascript','typescript','react','node','python','java','c#','docker','kubernetes','aws','azure','sql','graphql','rest'];
  const detectedSkills = [];
  techKeywords.forEach(k => { if (lower.includes(k) && !detectedSkills.includes(k)) detectedSkills.push(k); });

  // Projects: try to find lines with words like 'project' or 'built'
  const projectLines = lines.filter(l => /project|built|developed|implemented/i.test(l)).slice(0,3);

  const hr = [];
  hr.push('Tell me about yourself.');
  if (name) hr.push(`What motivates you, ${name.split(' ')[0]}?`);
  hr.push('Why are you interested in this role?');
  hr.push('What are your strengths and weaknesses?');

  const technical = [];
  if (detectedSkills.length) {
    detectedSkills.slice(0,5).forEach(s => technical.push(`Explain your experience with ${s}.`));
    if (detectedSkills.length >= 2) technical.push(`How would you compare ${detectedSkills[0]} with ${detectedSkills[1]}?`);
  } else {
    technical.push('Describe a challenging technical problem you solved.');
  }
  technical.push('How do you approach debugging difficult issues?');

  const project = [];
  if (projectLines.length) {
    projectLines.forEach(pl => project.push(`Tell me about this project mention: "${pl}"`));
  }
  project.push('Walk me through a project from conception to deployment.');
  project.push('How do you ensure code quality in your projects?');

  return { hr, technical, project, detectedSkills };
}

function calculateATSScore(text, jobDescription = '') {
  const lower = text.toLowerCase();
  const jdLower = jobDescription.toLowerCase();
  
  let score = 0; // Start from 0 instead of 60
  const suggestions = [];
  const strengths = [];
  
  // Check for contact information (10 points)
  const hasEmail = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i.test(text);
  const hasPhone = /\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/.test(text);
  
  if (hasEmail && hasPhone) {
    score += 10;
    strengths.push('Contact information is complete');
  } else if (hasEmail || hasPhone) {
    score += 5;
    suggestions.push('Add complete contact information (email and phone)');
  } else {
    suggestions.push('Add contact information (email and phone)');
  }
  
  // Check for professional summary (10 points)
  if (/summary|objective|profile/i.test(text) && text.length > 100) {
    score += 10;
    strengths.push('Includes professional summary');
  } else {
    suggestions.push('Add a professional summary or objective statement');
  }
  
  // Check for experience section (15 points)
  if (/experience|employment|work history/i.test(text)) {
    score += 15;
    strengths.push('Work experience section present');
  } else {
    suggestions.push('Include work experience or employment history');
  }
  
  // Check for education (10 points)
  if (/education|degree|university|college/i.test(text)) {
    score += 10;
    strengths.push('Education section present');
  } else {
    suggestions.push('Add education or academic background');
  }
  
  // Check for skills section (15 points)
  const techKeywords = ['javascript','typescript','react','node','python','java','c#','docker','kubernetes','aws','azure','sql','graphql','rest','html','css','git','angular','vue','spring','mongodb','postgresql','redis','jenkins','ci/cd','agile','scrum'];
  const foundSkills = techKeywords.filter(k => lower.includes(k));
  
  if (foundSkills.length >= 8) {
    score += 15;
    strengths.push(`Excellent technical skills coverage (${foundSkills.length} technologies)`);
  } else if (foundSkills.length >= 5) {
    score += 10;
    strengths.push(`Good technical skills mentioned (${foundSkills.length} technologies)`);
  } else if (foundSkills.length >= 2) {
    score += 5;
    suggestions.push('Consider adding more relevant technical skills');
  } else {
    suggestions.push('Add a skills section with relevant technologies');
  }
  
  // Check for action verbs (10 points)
  const actionVerbs = ['developed','created','implemented','designed','managed','led','improved','optimized','built','launched','architected','delivered','achieved','spearheaded','collaborated'];
  const foundVerbs = actionVerbs.filter(v => lower.includes(v));
  
  if (foundVerbs.length >= 8) {
    score += 10;
    strengths.push('Uses strong action verbs effectively');
  } else if (foundVerbs.length >= 4) {
    score += 5;
    suggestions.push('Good use of action verbs, consider adding more variety');
  } else {
    suggestions.push('Use more action verbs (developed, implemented, managed, etc.)');
  }
  
  // Check for quantifiable achievements (10 points)
  const achievementPattern = /\d+%|\d+\+|increased by|reduced by|saved \$|grew by|improved by/i;
  const achievementMatches = text.match(new RegExp(achievementPattern, 'gi')) || [];
  
  if (achievementMatches.length >= 3) {
    score += 10;
    strengths.push('Includes multiple quantifiable achievements');
  } else if (achievementMatches.length >= 1) {
    score += 5;
    strengths.push('Includes some quantifiable achievements');
    suggestions.push('Add more measurable achievements with numbers/percentages');
  } else {
    suggestions.push('Add measurable achievements with numbers/percentages');
  }
  
  // Check for proper formatting indicators (10 points)
  const hasBulletPoints = /[•\-\*]/.test(text) || /^\s*[\-\*]/.test(text);
  const hasProperSections = (text.match(/\n\n|\r\n\r\n/g) || []).length >= 2;
  
  if (hasBulletPoints && hasProperSections) {
    score += 10;
    strengths.push('Well-formatted and organized');
  } else if (hasBulletPoints || hasProperSections) {
    score += 5;
    suggestions.push('Improve formatting with clear sections and bullet points');
  } else {
    suggestions.push('Use bullet points and clear section breaks for better readability');
  }
  
  // Job description matching (if provided) (10 points)
  if (jobDescription && jobDescription.length > 50) {
    const jdWords = jdLower.split(/\s+/).filter(w => w.length > 4);
    const matchCount = jdWords.filter(w => lower.includes(w)).length;
    const matchRatio = jdWords.length > 0 ? matchCount / jdWords.length : 0;
    
    if (matchRatio > 0.5) {
      score += 10;
      strengths.push('Excellent keyword match with job description');
    } else if (matchRatio > 0.3) {
      score += 7;
      strengths.push('Good keyword match with job description');
    } else if (matchRatio > 0.15) {
      score += 4;
      suggestions.push('Try to incorporate more keywords from the job description');
    } else {
      suggestions.push('Low keyword match - align your resume more closely with the job description');
    }
  }
  
  // Cap score at 100
  score = Math.min(score, 100);
  
  return {
    score,
    strengths,
    suggestions,
    keywordsFound: foundSkills
  };
}

// Upload resume, extract text, and return ATS score, suggestions, and generated questions
router.post('/analyze', upload.single('resume'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ ok: false, error: 'No file uploaded' });
    const jobDescription = req.body.jobDescription || '';
    const text = await extractTextFromFile(file.path, file.mimetype);

    const atsAnalysis = calculateATSScore(text, jobDescription);
    const questions = generateQuestionsFromText(text);
    
    res.json({ 
      ok: true, 
      atsScore: atsAnalysis.score,
      strengths: atsAnalysis.strengths,
      suggestions: atsAnalysis.suggestions,
      keywordsFound: atsAnalysis.keywordsFound,
      questions 
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, error: 'Processing failed' });
  }
});

module.exports = router;
