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

// Enhanced keyword database
const SKILLS_DATABASE = {
  programming: ['javascript', 'typescript', 'python', 'java', 'c#', 'c++', 'ruby', 'go', 'rust', 'php', 'swift', 'kotlin', 'scala', 'perl', 'r'],
  frontend: ['react', 'angular', 'vue', 'svelte', 'next.js', 'nuxt', 'html', 'css', 'sass', 'less', 'tailwind', 'bootstrap', 'webpack', 'vite'],
  backend: ['node.js', 'express', 'django', 'flask', 'spring', 'spring boot', '.net', 'rails', 'fastapi', 'nest.js', 'laravel'],
  database: ['sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch', 'dynamodb', 'cassandra', 'oracle', 'sqlite'],
  cloud: ['aws', 'azure', 'gcp', 'google cloud', 'heroku', 'digitalocean', 'linode', 'cloudflare'],
  devops: ['docker', 'kubernetes', 'jenkins', 'gitlab ci', 'github actions', 'terraform', 'ansible', 'ci/cd', 'circleci'],
  tools: ['git', 'github', 'gitlab', 'jira', 'confluence', 'slack', 'vs code', 'postman', 'swagger'],
  methodologies: ['agile', 'scrum', 'kanban', 'tdd', 'bdd', 'waterfall', 'devops', 'microservices'],
  softSkills: ['leadership', 'communication', 'teamwork', 'problem solving', 'analytical', 'creative', 'adaptable', 'collaborative']
};

const ACTION_VERBS = [
  'achieved', 'improved', 'trained', 'managed', 'created', 'resolved', 'volunteered',
  'influenced', 'increased', 'decreased', 'ideas', 'negotiated', 'launched', 'revenue',
  'under budget', 'won', 'delivered', 'exceeded', 'targeted', 'developed', 'implemented',
  'designed', 'architected', 'optimized', 'streamlined', 'automated', 'integrated',
  'migrated', 'refactored', 'collaborated', 'led', 'spearheaded', 'pioneered', 'established',
  'built', 'deployed', 'maintained', 'troubleshot', 'debugged', 'analyzed', 'researched'
];

// Calculate similarity between two strings (basic Jaccard similarity)
function calculateSimilarity(str1, str2) {
  const words1 = new Set(str1.toLowerCase().split(/\s+/).filter(w => w.length > 3));
  const words2 = new Set(str2.toLowerCase().split(/\s+/).filter(w => w.length > 3));
  
  const intersection = new Set([...words1].filter(x => words2.has(x)));
  const union = new Set([...words1, ...words2]);
  
  return union.size > 0 ? intersection.size / union.size : 0;
}

// Extract skills from text
function extractSkills(text) {
  const lower = text.toLowerCase();
  const foundSkills = {};
  let totalSkills = 0;
  
  Object.keys(SKILLS_DATABASE).forEach(category => {
    foundSkills[category] = SKILLS_DATABASE[category].filter(skill => 
      lower.includes(skill.toLowerCase())
    );
    totalSkills += foundSkills[category].length;
  });
  
  return { foundSkills, totalSkills };
}

// Analyze text structure and quality
function analyzeTextQuality(text) {
  const analysis = {
    wordCount: 0,
    sentenceCount: 0,
    avgWordsPerSentence: 0,
    bulletPoints: 0,
    sections: 0,
    paragraphs: 0
  };
  
  // Word count
  analysis.wordCount = text.split(/\s+/).filter(w => w.length > 0).length;
  
  // Sentence count
  analysis.sentenceCount = (text.match(/[.!?]+/g) || []).length;
  analysis.avgWordsPerSentence = analysis.sentenceCount > 0 ? 
    Math.round(analysis.wordCount / analysis.sentenceCount) : 0;
  
  // Bullet points
  analysis.bulletPoints = (text.match(/[•\-\*●○▪▫]\s/g) || []).length;
  
  // Sections (common headers)
  const sectionHeaders = /\b(experience|education|skills|projects|certifications|summary|objective|profile|achievements|awards|publications)\b/gi;
  analysis.sections = (text.match(sectionHeaders) || []).length;
  
  // Paragraphs
  analysis.paragraphs = text.split(/\n\n+/).filter(p => p.trim().length > 0).length;
  
  return analysis;
}

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

function generateQuestionsFromText(text, jobDescription = '') {
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const lower = text.toLowerCase();
  const jdLower = jobDescription.toLowerCase();

  // Extract key information
  let name = null;
  const nameMatch = text.match(/([A-Z][a-z]+\s[A-Z][a-z]+)/);
  if (nameMatch) name = nameMatch[0];

  // Detect experience level based on content
  const yearMatches = text.match(/(\d+)\+?\s*(years?|yrs?)/gi);
  let totalYears = 0;
  if (yearMatches) {
    yearMatches.forEach(match => {
      const num = parseInt(match.match(/\d+/)[0]);
      if (num > totalYears) totalYears = num;
    });
  }

  // Determine experience level
  let experienceLevel = 'intermediate';
  if (totalYears <= 2) experienceLevel = 'entry';
  else if (totalYears >= 5) experienceLevel = 'senior';

  // Extract skills from predefined database
  const { foundSkills, totalSkills } = extractSkills(text);
  const detectedSkills = [];
  const categoryBreakdown = {};
  
  // Flatten skills and track categories
  Object.keys(foundSkills).forEach(category => {
    foundSkills[category].forEach(skill => {
      if (!detectedSkills.includes(skill)) {
        detectedSkills.push(skill);
        categoryBreakdown[skill] = category;
      }
    });
  });
  
  // Detect job description skills
  const jdSkillsData = jobDescription ? extractSkills(jobDescription) : { foundSkills: {}, totalSkills: 0 };
  const jdSkills = [];
  Object.keys(jdSkillsData.foundSkills).forEach(category => {
    jdSkillsData.foundSkills[category].forEach(skill => {
      if (!jdSkills.includes(skill)) jdSkills.push(skill);
    });
  });
  
  const companyName = extractCompanyName(jobDescription);
  const jobRole = extractJobRole(jobDescription);

  // Extract projects and experience
  const projectLines = lines.filter(l => /project|built|developed|created|implemented|launched/i.test(l)).slice(0,5);
  const experienceLines = lines.filter(l => /managed|led|coordinated|supervised|directed|spearheaded/i.test(l)).slice(0,5);
  const achievementLines = lines.filter(l => /\d+%|increased|improved|reduced|saved|\$\d+/i.test(l)).slice(0,5);

  // Generate HR/Behavioral Questions
  const hr = generateBehavioralQuestions(name, experienceLevel, companyName, jobRole);

  // Generate Technical Questions
  const technical = generateTechnicalQuestions(detectedSkills, jdSkills, foundSkills, experienceLevel);

  // Generate Project/Resume-Based Questions
  const project = generateProjectQuestions(projectLines, experienceLines, achievementLines, experienceLevel, detectedSkills);

  // Generate Internship Questions
  const internships = generateInternshipQuestions(lines, lower, experienceLevel);

  // Generate Certification Questions
  const certifications = generateCertificationQuestions(lower);

  // Generate Skills-focused Questions
  const skillsQs = generateSkillsQuestions(detectedSkills, foundSkills, experienceLevel);

  return { hr, technical, project, internships, certifications, skills: skillsQs, detectedSkills, candidateName: name };
}

// Helper function to extract company name from job description
function extractCompanyName(jd) {
  if (!jd) return null;
  // Look for common patterns like "About [Company]" or "[Company] is"
  const patterns = [
    /(?:About|Join)\s+([A-Z][A-Za-z\s&]+)(?:\s+is|\s+–|\s+-)/,
    /([A-Z][A-Za-z\s&]+)\s+is\s+(?:seeking|hiring|looking)/,
    /(?:at|@)\s+([A-Z][A-Za-z\s&]+)/
  ];
  
  for (const pattern of patterns) {
    const match = jd.match(pattern);
    if (match && match[1].length < 40) return match[1].trim();
  }
  return null;
}

// Helper function to extract job role from job description
function extractJobRole(jd) {
  if (!jd) return null;
  const patterns = [
    /(?:hiring|seeking|looking for)\s+(?:a|an)\s+([A-Za-z\s]+?)(?:\s+to|\s+who|\s+with)/i,
    /position:\s*([A-Za-z\s]+)/i,
    /role:\s*([A-Za-z\s]+)/i
  ];
  
  for (const pattern of patterns) {
    const match = jd.match(pattern);
    if (match && match[1].length < 50) return match[1].trim();
  }
  return null;
}

// Generate comprehensive behavioral questions
function generateBehavioralQuestions(name, level, company, role) {
  const questions = [];
  
  // Universal opening questions
  if (name) {
    const firstName = name.split(' ')[0];
    questions.push(`Tell me about yourself, ${firstName}.`);
  } else {
    questions.push('Tell me about yourself and your background.');
  }
  
  if (name) {
    questions.push(`${name.split(' ')[0]}, what attracted you to this opportunity?`);
  }
  
  if (company) {
    questions.push(`Why do you want to work at ${company}?`);
    questions.push(`What do you know about ${company}'s products/services?`);
  } else {
    questions.push('Why are you interested in this role?');
    questions.push('What do you know about our company?');
  }

  // Level-specific behavioral questions
  if (level === 'entry') {
    questions.push('What motivated you to pursue a career in this field?');
    questions.push('Describe a challenging project from your education or internship.');
    questions.push('How do you approach learning new technologies?');
    questions.push('Tell me about a time you worked in a team on an academic or personal project.');
  } else if (level === 'intermediate') {
    questions.push('Describe a time when you had to deal with a difficult team member.');
    questions.push('Tell me about a time you had to learn a new technology quickly.');
    questions.push('How do you prioritize tasks when managing multiple projects?');
    questions.push('Describe a situation where you disagreed with your manager.');
    questions.push('Tell me about a time you failed and what you learned from it.');
  } else { // senior
    questions.push('Describe your leadership style and give an example of how you mentored junior developers.');
    questions.push('Tell me about a time you had to make a difficult architectural decision.');
    questions.push('How do you handle conflicts within your team?');
    questions.push('Describe a situation where you influenced a major technical decision.');
    questions.push('Tell me about a time you had to deliver bad news to stakeholders.');
  }

  // Common STAR method questions
  questions.push('What are your greatest strengths and how do they apply to this role?');
  questions.push('What is your biggest weakness and how are you working to improve it?');
  questions.push('Where do you see yourself in 5 years?');
  questions.push('Why are you leaving your current position?');
  questions.push('Describe a time you went above and beyond your job responsibilities.');

  return questions;
}

// Generate technical questions based on skills and level
function generateTechnicalQuestions(skills, jdSkills, skillCategories, level) {
  const questions = [];
  
  // Job description specific questions (highest priority)
  if (jdSkills.length > 0) {
    const topJdSkills = jdSkills.slice(0, 5);
    topJdSkills.forEach(skill => {
      if (skills.includes(skill)) {
        questions.push(`The job requires ${skill}. Can you walk me through a project where you used it?`);
      } else {
        questions.push(`This role requires ${skill}. What is your experience with it?`);
      }
    });
  }

  // Skills from resume - different difficulty by level
  const resumeSkills = skills.slice(0, 8);
  
  if (level === 'entry') {
    // Basic questions
    resumeSkills.slice(0, 4).forEach(skill => {
      questions.push(`What is your experience with ${skill}?`);
    });
    questions.push('Explain the difference between your top two technical skills.');
    questions.push('Describe a technical challenge you faced and how you solved it.');
    questions.push('How do you stay updated with new technologies?');
    questions.push('What programming languages are you most comfortable with?');
  } else if (level === 'intermediate') {
    // Intermediate depth
    resumeSkills.slice(0, 5).forEach(skill => {
      questions.push(`Explain a complex problem you solved using ${skill}.`);
    });
    
    if (resumeSkills.length >= 2) {
      questions.push(`How would you compare ${resumeSkills[0]} and ${resumeSkills[1]} in real-world applications?`);
    }
    
    questions.push('Describe your debugging process when facing a difficult bug.');
    questions.push('How do you ensure code quality and maintainability?');
    questions.push('Explain a time when you had to optimize application performance.');
    questions.push('What is your approach to writing unit tests?');
  } else { // senior
    // Advanced architectural questions
    resumeSkills.slice(0, 6).forEach(skill => {
      questions.push(`How would you architect a scalable system using ${skill}?`);
    });
    
    questions.push('Describe your approach to system design for high-traffic applications.');
    questions.push('How do you make trade-offs between different architectural patterns?');
    questions.push('Explain a time you led a technical decision that impacted the entire team.');
    questions.push('How do you evaluate and introduce new technologies to your team?');
    questions.push('Describe your approach to code reviews and maintaining code quality standards.');
  }

  // Category-specific questions
  if (skillCategories.frontend && skillCategories.frontend.length > 0) {
    questions.push('How do you ensure cross-browser compatibility and responsive design?');
  }
  if (skillCategories.backend && skillCategories.backend.length > 0) {
    questions.push('Explain your approach to API design and RESTful principles.');
  }
  if (skillCategories.database && skillCategories.database.length > 0) {
    questions.push('How do you optimize database queries for performance?');
  }
  if (skillCategories.cloud && skillCategories.cloud.length > 0) {
    questions.push('Describe your experience with cloud infrastructure and deployment.');
  }

  // Common technical questions
  questions.push('What is your development workflow from planning to deployment?');
  questions.push('How do you handle technical debt in your projects?');

  return questions.slice(0, 15); // Limit to 15 technical questions
}

// Generate project-based questions
function generateProjectQuestions(projectLines, experienceLines, achievementLines, level, skills) {
  const questions = [];

  // Project-specific questions
  if (projectLines.length > 0) {
    projectLines.forEach((line, idx) => {
      if (idx < 3) {
        const shortened = line.length > 60 ? line.substring(0, 60) + '...' : line;
        questions.push(`Can you elaborate on: "${shortened}"?`);
      }
    });
  }

  // Achievement-based questions
  if (achievementLines.length > 0) {
    achievementLines.forEach((line, idx) => {
      if (idx < 2) {
        const shortened = line.length > 60 ? line.substring(0, 60) + '...' : line;
        questions.push(`Walk me through how you achieved: "${shortened}"`);
      }
    });
  }

  // Leadership/Experience questions
  if (experienceLines.length > 0 && level !== 'entry') {
    questions.push('Describe your experience leading technical projects from start to finish.');
    questions.push('How do you handle project delays and communicate them to stakeholders?');
  }

  // General project questions by level
  if (level === 'entry') {
    questions.push('Walk me through your most significant project.');
    questions.push('What was the biggest challenge you faced in a project and how did you overcome it?');
    questions.push('Describe your role in a team project.');
    questions.push('How do you approach testing and quality assurance?');
  } else if (level === 'intermediate') {
    questions.push('Describe a project where you had to make important technical decisions.');
    questions.push('Tell me about a time when a project didn\'t go as planned. What did you do?');
    questions.push('How do you handle changing requirements mid-project?');
    questions.push('Describe your experience with agile/scrum methodologies.');
    questions.push('What metrics do you use to measure project success?');
  } else { // senior
    questions.push('Describe the most complex system you\'ve architected and deployed.');
    questions.push('How do you balance technical excellence with business requirements?');
    questions.push('Tell me about a time you had to refactor a legacy system.');
    questions.push('How do you ensure your team delivers high-quality code on schedule?');
    questions.push('Describe your approach to technical documentation and knowledge sharing.');
  }

  // Skills-based project questions
  if (skills.length > 3) {
    questions.push(`Describe a project where you used ${skills[0]}, ${skills[1]}, and ${skills[2]} together.`);
  }

  questions.push('What project are you most proud of and why?');
  questions.push('How do you ensure your projects are maintainable and scalable?');

  return questions.slice(0, 12); // Limit to 12 project questions
}

// Generate internship-based questions
function generateInternshipQuestions(lines, lower, level) {
  const questions = [];
  const internshipLines = lines.filter(l => /internship|intern|trainee|apprentice/i.test(l)).slice(0, 5);
  if (internshipLines.length > 0) {
    internshipLines.forEach((line, idx) => {
      if (idx < 3) {
        const shortened = line.length > 60 ? line.substring(0, 60) + '...' : line;
        questions.push(`Tell me about your internship: "${shortened}"`);
      }
    });
    questions.push('What were your key responsibilities during your internship(s)?');
    questions.push('What did you learn from your internship that you apply today?');
    questions.push('Describe a challenge you faced during your internship and how you handled it.');
  } else if (level === 'entry') {
    questions.push('Do you have any internship or practical project experience? Describe it.');
  }
  return questions.slice(0, 8);
}

// Generate certification-based questions
function generateCertificationQuestions(lower) {
  const questions = [];
  const certKeywords = [
    'aws certified', 'azure fundamentals', 'gcp professional', 'oracle certified', 'pmp', 'scrum master',
    'compTIA', 'ccna', 'kubernetes certification', 'terraform associate', 'react certification', 'machine learning certification'
  ];
  const hasCert = certKeywords.some(k => lower.includes(k));
  if (hasCert) {
    questions.push('You have listed certifications. Which one has been most valuable and why?');
    questions.push('How have you applied knowledge from your certifications in real projects?');
    certKeywords.forEach(k => {
      if (lower.includes(k)) {
        questions.push(`What topics from your ${k} did you find most challenging?`);
      }
    });
  }
  return questions.slice(0, 8);
}

// Generate skills-focused deep-dive questions
function generateSkillsQuestions(detectedSkills, skillCategories, level) {
  const questions = [];
  const topSkills = detectedSkills.slice(0, 8);
  topSkills.forEach(skill => {
    questions.push(`What are best practices you follow when working with ${skill}?`);
    questions.push(`Describe a debugging scenario you encountered related to ${skill}.`);
  });
  if (skillCategories.devops && skillCategories.devops.length) {
    questions.push('How do you design a CI/CD pipeline and what tools do you prefer?');
  }
  if (skillCategories.cloud && skillCategories.cloud.length) {
    questions.push('Explain your approach to securing cloud workloads.');
  }
  if (level !== 'entry') {
    questions.push('Describe trade-offs you made when selecting technologies for a project.');
  }
  return questions.slice(0, 12);
}

function calculateATSScore(text, jobDescription = '') {
  const lower = text.toLowerCase();
  const jdLower = jobDescription.toLowerCase();
  
  let score = 0;
  const suggestions = [];
  const strengths = [];
  const detailedAnalysis = {};
  
  // 1. CONTACT INFORMATION ANALYSIS (10 points) - STRICT
  const hasEmail = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i.test(text);
  const hasPhone = /(\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/.test(text);
  const hasLinkedIn = /linkedin\.com/i.test(text);
  const hasGitHub = /github\.com/i.test(text);
  const hasPortfolio = /portfolio|website|blog|medium\.com/i.test(text);
  
  let contactScore = 0;
  if (hasEmail) contactScore += 3;
  if (hasPhone) contactScore += 3;
  if (hasLinkedIn) contactScore += 2;
  if (hasGitHub) contactScore += 1.5;
  if (hasPortfolio) contactScore += 0.5;
  
  score += contactScore;
  detailedAnalysis.contact = {
    score: Math.round(contactScore * 10) / 10,
    maxScore: 10,
    hasEmail,
    hasPhone,
    hasLinkedIn,
    hasGitHub,
    hasPortfolio
  };
  
  if (contactScore >= 8) {
    strengths.push('✓ Complete contact information with professional links');
  } else if (contactScore >= 5) {
    if (!hasLinkedIn) suggestions.push('📧 Add LinkedIn profile for better professional visibility');
    if (!hasGitHub && /developer|engineer|programmer/i.test(text)) {
      suggestions.push('💻 Include GitHub profile to showcase your code portfolio');
    }
  } else {
    if (!hasEmail || !hasPhone) {
      suggestions.push('⚠️ CRITICAL: Add complete contact information (email and phone number)');
    }
  }
  
  // 2. PROFESSIONAL SUMMARY (10 points) - STRICT
  const summaryKeywords = /summary|objective|profile|about me|professional summary|career objective/i;
  const hasSummary = summaryKeywords.test(text);
  const summaryMatch = text.match(/(?:summary|objective|profile|about me)[:\s]+([^\n]*(?:\n[^\n]+){0,5})/i);
  const summaryLength = summaryMatch ? summaryMatch[0].split(/\s+/).length : 0;
  
  let summaryScore = 0;
  if (hasSummary && summaryLength >= 50) {
    summaryScore = 10;
    strengths.push('✓ Comprehensive professional summary (50+ words)');
  } else if (hasSummary && summaryLength >= 30) {
    summaryScore = 7;
    strengths.push('✓ Good professional summary present');
    suggestions.push('📝 Expand your summary to 50+ words for stronger impact');
  } else if (hasSummary && summaryLength >= 15) {
    summaryScore = 4;
    suggestions.push('📝 Expand your professional summary (aim for 40-60 words highlighting key strengths)');
  } else {
    summaryScore = 0;
    suggestions.push('⚠️ CRITICAL: Add a compelling professional summary (3-5 sentences, 40-60 words)');
  }
  
  score += summaryScore;
  detailedAnalysis.summary = { score: summaryScore, maxScore: 10, hasSummary, wordCount: summaryLength };
  
  // 3. WORK EXPERIENCE (20 points) - VERY STRICT
  const hasExperience = /experience|employment|work history|professional experience|career history/i.test(text);
  const companyPatterns = /(worked at|employed by|company:|position:|role:|title:)/i;
  const hasCompanies = companyPatterns.test(text);
  const datePatterns = /\d{4}|\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{2,4}|present|current/gi;
  const dateMatches = (text.match(datePatterns) || []).length;
  const bulletMatches = (text.match(/[•\-\*]\s/g) || []).length;
  
  let experienceScore = 0;
  if (hasExperience && hasCompanies && dateMatches >= 6 && bulletMatches >= 8) {
    experienceScore = 20;
    strengths.push('✓ Comprehensive work experience with dates and detailed achievements');
  } else if (hasExperience && hasCompanies && dateMatches >= 4 && bulletMatches >= 5) {
    experienceScore = 15;
    strengths.push('✓ Good work experience section with dates');
    suggestions.push('💼 Add more bullet points describing achievements (aim for 3-5 per role)');
  } else if (hasExperience && dateMatches >= 2) {
    experienceScore = 10;
    suggestions.push('💼 Ensure all work experiences include dates, company names, and 3-5 achievements per role');
  } else if (hasExperience) {
    experienceScore = 5;
    suggestions.push('⚠️ Add detailed work experience: company names, dates, and specific achievements');
  } else {
    suggestions.push('⚠️ CRITICAL: Include work experience or internships with dates and measurable achievements');
  }
  
  score += experienceScore;
  detailedAnalysis.experience = { 
    score: experienceScore, 
    maxScore: 20, 
    hasExperience, 
    dateCount: dateMatches,
    bulletCount: bulletMatches 
  };
  
  // 4. SKILLS ANALYSIS (15 points) - STRICT
  const { foundSkills, totalSkills } = extractSkills(text);
  const categoryCount = Object.keys(foundSkills).filter(k => foundSkills[k].length > 0).length;
  
  let skillsScore = 0;
  if (totalSkills >= 15 && categoryCount >= 5) {
    skillsScore = 15;
    strengths.push(`✓ Outstanding skills coverage (${totalSkills} technologies across ${categoryCount} categories)`);
  } else if (totalSkills >= 12 && categoryCount >= 4) {
    skillsScore = 13;
    strengths.push(`✓ Excellent skills diversity (${totalSkills} technologies)`);
  } else if (totalSkills >= 8 && categoryCount >= 3) {
    skillsScore = 10;
    strengths.push(`✓ Good technical skills (${totalSkills} technologies)`);
    suggestions.push('🔧 Add 3-5 more skills to reach excellence (aim for 15+ total)');
  } else if (totalSkills >= 5) {
    skillsScore = 6;
    suggestions.push(`🔧 Expand your skills section (current: ${totalSkills}, target: 15+ technologies)`);
  } else if (totalSkills >= 2) {
    skillsScore = 3;
    suggestions.push('⚠️ Add comprehensive skills section with relevant technologies (aim for 15+ skills)');
  } else {
    suggestions.push('⚠️ CRITICAL: Add a detailed skills section with 15+ relevant technologies');
  }
  
  score += skillsScore;
  detailedAnalysis.skills = { 
    score: skillsScore, 
    maxScore: 15, 
    totalSkills, 
    categoryCount,
    foundSkills 
  };
  
  // 5. ACTION VERBS & ACHIEVEMENTS (15 points) - VERY STRICT
  const foundVerbs = ACTION_VERBS.filter(v => lower.includes(v.toLowerCase()));
  const uniqueVerbs = [...new Set(foundVerbs)];
  
  let verbScore = 0;
  if (uniqueVerbs.length >= 12) {
    verbScore = 8;
    strengths.push(`✓ Excellent use of strong action verbs (${uniqueVerbs.length} unique verbs)`);
  } else if (uniqueVerbs.length >= 8) {
    verbScore = 6;
    strengths.push(`✓ Good action verb usage (${uniqueVerbs.length} verbs)`);
    suggestions.push('💪 Add 3-4 more diverse action verbs for stronger impact');
  } else if (uniqueVerbs.length >= 5) {
    verbScore = 4;
    suggestions.push(`💪 Use more diverse action verbs (current: ${uniqueVerbs.length}, target: 12+)`);
  } else if (uniqueVerbs.length >= 2) {
    verbScore = 2;
    suggestions.push('⚠️ Start bullet points with strong action verbs (achieved, developed, optimized, etc.)');
  } else {
    suggestions.push('⚠️ CRITICAL: Use action verbs to begin achievement statements');
  }
  
  // Quantifiable achievements - STRICT
  const numberPattern = /\d+%|\d+\+|increased by|reduced by|saved \$|grew by|improved by|\$\d+[\d,]*|revenue|budget|performance by \d+|efficiency by \d+/gi;
  const achievementMatches = (text.match(numberPattern) || []).length;
  
  let achievementScore = 0;
  if (achievementMatches >= 8) {
    achievementScore = 7;
    strengths.push(`✓ Multiple quantifiable achievements with metrics (${achievementMatches} found)`);
  } else if (achievementMatches >= 5) {
    achievementScore = 5.5;
    strengths.push(`✓ Good measurable achievements (${achievementMatches} metrics)`);
    suggestions.push('📊 Add 2-3 more quantifiable results to strengthen impact');
  } else if (achievementMatches >= 3) {
    achievementScore = 3.5;
    suggestions.push('📊 Include more measurable achievements (aim for 8+ with %, $, numbers)');
  } else if (achievementMatches >= 1) {
    achievementScore = 1.5;
    suggestions.push('⚠️ Add specific numbers and metrics to demonstrate impact (8+ quantifiable achievements)');
  } else {
    suggestions.push('⚠️ CRITICAL: Include quantifiable achievements (e.g., "Increased sales by 45%", "Saved $50K annually")');
  }
  
  score += verbScore + achievementScore;
  detailedAnalysis.actionWords = { 
    score: Math.round((verbScore + achievementScore) * 10) / 10, 
    maxScore: 15, 
    verbCount: uniqueVerbs.length, 
    achievementCount: achievementMatches,
    foundVerbs: uniqueVerbs.slice(0, 10)
  };
  
  // 6. FORMATTING & STRUCTURE (10 points) - STRICT
  const textQuality = analyzeTextQuality(text);
  
  let formatScore = 0;
  if (textQuality.bulletPoints >= 10 && textQuality.sections >= 4) {
    formatScore = 10;
    strengths.push('✓ Professional structure with clear sections and bullet points');
  } else if (textQuality.bulletPoints >= 6 && textQuality.sections >= 3) {
    formatScore = 7;
    strengths.push('✓ Good formatting with sections and bullets');
    suggestions.push('📋 Add 2-3 more bullet points for better readability');
  } else if (textQuality.bulletPoints >= 3 || textQuality.sections >= 2) {
    formatScore = 4;
    suggestions.push('📋 Improve structure with more bullet points (aim for 10+) and clear section headings');
  } else {
    formatScore = 1;
    suggestions.push('⚠️ CRITICAL: Use bullet points (•) and clear section headings (Experience, Skills, Education)');
  }
  
  score += formatScore;
  detailedAnalysis.formatting = { 
    score: formatScore, 
    maxScore: 10, 
    ...textQuality 
  };
  
  // 7. EDUCATION (10 points) - STRICT
  const hasEducation = /education|degree|university|college|bachelor|master|phd|diploma|certification|academic/i.test(text);
  const hasDegree = /\b(b\.?s\.?|m\.?s\.?|b\.?a\.?|m\.?a\.?|bachelor|master|phd|doctorate|associate)\b/i.test(text);
  const hasGradYear = /\b(19|20)\d{2}\b/.test(text) && hasEducation;
  const hasMajor = /(major|concentration|specialization|field):/i.test(text) || /(computer science|engineering|business|mathematics|physics)/i.test(text);
  
  let educationScore = 0;
  if (hasEducation && hasDegree && hasGradYear && hasMajor) {
    educationScore = 10;
    strengths.push('✓ Complete education credentials with degree, year, and major');
  } else if (hasEducation && hasDegree && hasGradYear) {
    educationScore = 8;
    strengths.push('✓ Education credentials clearly stated');
  } else if (hasEducation && hasDegree) {
    educationScore = 5;
    suggestions.push('🎓 Include graduation year and major/field of study');
  } else if (hasEducation) {
    educationScore = 3;
    suggestions.push('🎓 Specify degree information (Bachelor\'s, Master\'s, etc.) and graduation year');
  } else {
    educationScore = 0;
    suggestions.push('⚠️ CRITICAL: Add education section with degree, institution, and graduation year');
  }
  
  score += educationScore;
  detailedAnalysis.education = { 
    score: educationScore, 
    maxScore: 10, 
    hasEducation, 
    hasDegree,
    hasGradYear,
    hasMajor 
  };
  
  // 8. KEYWORD DENSITY & LENGTH (10 points) - STRICT
  let lengthScore = 0;
  if (textQuality.wordCount >= 450 && textQuality.wordCount <= 700) {
    lengthScore = 10;
    strengths.push(`✓ Optimal resume length (${textQuality.wordCount} words)`);
  } else if (textQuality.wordCount >= 400 && textQuality.wordCount <= 800) {
    lengthScore = 8;
    strengths.push(`✓ Good resume length (${textQuality.wordCount} words)`);
  } else if (textQuality.wordCount >= 300 && textQuality.wordCount <= 900) {
    lengthScore = 6;
    if (textQuality.wordCount < 400) {
      suggestions.push(`📏 Add more details to reach optimal length (current: ${textQuality.wordCount}, target: 450-700 words)`);
    } else {
      suggestions.push(`📏 Consider condensing to optimal length (current: ${textQuality.wordCount}, target: 450-700 words)`);
    }
  } else if (textQuality.wordCount >= 200) {
    lengthScore = 3;
    suggestions.push(`⚠️ Resume is too brief (${textQuality.wordCount} words). Add more details about experience and achievements (target: 450-700)`);
  } else if (textQuality.wordCount > 0) {
    lengthScore = 1;
    suggestions.push(`⚠️ CRITICAL: Resume is too short (${textQuality.wordCount} words). Aim for 450-700 words with detailed experience`);
  }
  
  score += lengthScore;
  detailedAnalysis.length = { score: lengthScore, maxScore: 10, wordCount: textQuality.wordCount };
  
  // 9. JOB DESCRIPTION MATCHING (10 points) - STRICT
  let jdScore = 0;
  if (jobDescription && jobDescription.length > 50) {
    const similarity = calculateSimilarity(text, jobDescription);
    const jdKeywords = jdLower.split(/\s+/).filter(w => w.length > 4);
    const matchedKeywords = jdKeywords.filter(w => lower.includes(w));
    const matchRatio = jdKeywords.length > 0 ? matchedKeywords.length / jdKeywords.length : 0;
    
    if (matchRatio > 0.5 || similarity > 0.35) {
      jdScore = 10;
      strengths.push(`✓ Excellent alignment with job description (${Math.round(matchRatio * 100)}% match)`);
    } else if (matchRatio > 0.35 || similarity > 0.25) {
      jdScore = 7.5;
      strengths.push(`✓ Good keyword match with job description (${Math.round(matchRatio * 100)}% match)`);
      suggestions.push('🎯 Incorporate 3-5 more keywords from the job description');
    } else if (matchRatio > 0.20) {
      jdScore = 5;
      suggestions.push(`🎯 Improve job match from ${Math.round(matchRatio * 100)}% by adding more relevant keywords`);
    } else if (matchRatio > 0.10) {
      jdScore = 2.5;
      suggestions.push('⚠️ Low job match - align resume more closely with job description keywords');
    } else {
      jdScore = 0;
      suggestions.push('⚠️ CRITICAL: Resume doesn\'t match job description - incorporate key terms and requirements');
    }
    
    detailedAnalysis.jobMatch = { 
      score: jdScore, 
      maxScore: 10, 
      matchRatio: (matchRatio * 100).toFixed(1) + '%',
      similarity: (similarity * 100).toFixed(1) + '%',
      matchedKeywords: matchedKeywords.slice(0, 10)
    };
  } else {
    // If no job description, redistribute points based on keyword diversity
    const keywordScore = Math.min(totalSkills / 3, 5) + Math.min(uniqueVerbs.length / 3, 5);
    jdScore = Math.min(Math.round(keywordScore * 10) / 10, 10);
    detailedAnalysis.jobMatch = { 
      score: jdScore, 
      maxScore: 10, 
      note: 'No job description provided - scored based on keyword diversity' 
    };
  }
  
  score += jdScore;
  
  // Final score adjustments and cap at 100
  score = Math.min(Math.round(score * 10) / 10, 100);
  
  // ENHANCED CONTEXT-AWARE SUGGESTIONS
  const contextualSuggestions = [];
  const criticalIssues = [];
  const quickWins = [];
  
  // Analyze each category for specific, actionable suggestions
  
  // Contact Info Analysis
  if (detailedAnalysis.contact.score < 8) {
    const missing = [];
    if (!hasEmail) missing.push('email address');
    if (!hasPhone) missing.push('phone number');
    if (!hasLinkedIn) missing.push('LinkedIn profile');
    if (!hasGitHub && /developer|engineer|programmer/i.test(text)) missing.push('GitHub profile');
    
    if (missing.length > 0) {
      criticalIssues.push(`Add missing contact details: ${missing.join(', ')}`);
    }
  }
  
  // Skills Gap Analysis
  if (detailedAnalysis.skills.score < 12) {
    const missingCategories = [];
    const categoryNames = Object.keys(SKILLS_DATABASE);
    
    categoryNames.forEach(cat => {
      if (!foundSkills[cat] || foundSkills[cat].length === 0) {
        missingCategories.push(cat);
      }
    });
    
    if (totalSkills < 5) {
      criticalIssues.push(`⚠️ Only ${totalSkills} skills detected. Add at least ${8 - totalSkills} more relevant technical skills`);
    } else if (totalSkills < 8) {
      quickWins.push(`Add ${10 - totalSkills} more skills from categories like: ${missingCategories.slice(0, 3).join(', ')}`);
    }
    
    // Suggest specific skills based on missing categories
    if (missingCategories.includes('softSkills') && (!foundSkills.softSkills || foundSkills.softSkills.length === 0)) {
      contextualSuggestions.push('Add soft skills: leadership, communication, problem-solving, teamwork');
    }
    if (missingCategories.includes('cloud') && /backend|devops|infrastructure/i.test(text)) {
      contextualSuggestions.push('Include cloud platforms: AWS, Azure, or Google Cloud');
    }
    if (missingCategories.includes('database') && /developer|engineer/i.test(text)) {
      contextualSuggestions.push('List database experience: PostgreSQL, MongoDB, MySQL, or Redis');
    }
  } else if (totalSkills >= 12) {
    strengths.push(`Strong skills diversity across ${Object.keys(foundSkills).length} categories`);
  }
  
  // Experience & Achievement Analysis
  if (detailedAnalysis.experience.score < 14) {
    if (!hasExperience) {
      criticalIssues.push('Add work experience section with job titles, companies, and dates');
    } else if (detailedAnalysis.experience.dateCount < 4) {
      criticalIssues.push('Include dates (Month Year - Month Year) for all positions');
    }
  }
  
  if (detailedAnalysis.actionWords.achievementCount === 0) {
    criticalIssues.push('Add measurable achievements with numbers (e.g., "Increased performance by 40%", "Reduced costs by $50K")');
  } else if (detailedAnalysis.actionWords.achievementCount < 3) {
    quickWins.push(`Add ${3 - detailedAnalysis.actionWords.achievementCount} more quantifiable achievements with percentages or numbers`);
  }
  
  if (detailedAnalysis.actionWords.verbCount < 5) {
    const verbsNeeded = 7 - detailedAnalysis.actionWords.verbCount;
    const suggestedVerbs = ACTION_VERBS.filter(v => !lower.includes(v.toLowerCase())).slice(0, 8);
    quickWins.push(`Use ${verbsNeeded} more action verbs like: ${suggestedVerbs.slice(0, 5).join(', ')}`);
  }
  
  // Formatting Analysis
  if (detailedAnalysis.formatting.score < 6) {
    if (textQuality.bulletPoints < 3) {
      criticalIssues.push('Use bullet points (•) to list achievements and responsibilities');
    }
    if (textQuality.sections < 3) {
      criticalIssues.push('Organize resume with clear section headers: Summary, Experience, Skills, Education');
    }
  }
  
  // Length Analysis
  if (detailedAnalysis.length.wordCount < 300) {
    criticalIssues.push(`Resume is too brief (${detailedAnalysis.length.wordCount} words). Expand to 400-800 words with detailed achievements`);
  } else if (detailedAnalysis.length.wordCount > 900) {
    contextualSuggestions.push(`Resume is lengthy (${detailedAnalysis.length.wordCount} words). Condense to 400-800 words for ATS optimization`);
  }
  
  // Education Analysis
  if (detailedAnalysis.education.score < 6) {
    if (!hasEducation) {
      criticalIssues.push('Add education section with degree, institution, and graduation year');
    } else if (!hasDegree) {
      quickWins.push('Specify degree type (Bachelor\'s, Master\'s, etc.) for better ATS parsing');
    }
  }
  
  // Job Description Match Analysis
  if (jobDescription && detailedAnalysis.jobMatch) {
    const matchRatioNum = typeof detailedAnalysis.jobMatch.matchRatio === 'string' 
      ? parseFloat(detailedAnalysis.jobMatch.matchRatio) 
      : detailedAnalysis.jobMatch.matchRatio;
    
    if (matchRatioNum < 20) {
      criticalIssues.push(`Low job match (${detailedAnalysis.jobMatch.matchRatio}). Incorporate keywords from job description`);
    } else if (matchRatioNum < 30) {
      quickWins.push(`Improve job match from ${detailedAnalysis.jobMatch.matchRatio} by adding more relevant keywords`);
    }
  }
  
  // Compile final suggestions in priority order
  const finalSuggestions = [
    ...criticalIssues,
    ...quickWins,
    ...contextualSuggestions,
    ...suggestions.filter(s => !s.startsWith('⚠️') && !s.startsWith('⚡') && !s.startsWith('✓'))
  ];
  
  // Remove duplicates
  const uniqueSuggestions = [...new Set(finalSuggestions)];
  
  // Add priority header based on score
  if (score < 60) {
    uniqueSuggestions.unshift('⚠️ CRITICAL: Your resume needs major improvements to pass ATS systems');
  } else if (score < 75) {
    uniqueSuggestions.unshift('⚡ PRIORITY: Address these key areas to significantly improve your ATS score');
  } else if (score < 85) {
    uniqueSuggestions.unshift('✓ GOOD PROGRESS: Fine-tune these areas to reach excellence');
  } else {
    uniqueSuggestions.unshift('🎯 EXCELLENT: Your resume is ATS-optimized! Minor polish suggestions below:');
  }
  
  // Calculate improvement potential
  const maxPossibleScore = 100;
  const potentialGain = Math.round((maxPossibleScore - score) * 10) / 10;
  const categoryImprovements = Object.entries(detailedAnalysis)
    .filter(([key, val]) => val.score < val.maxScore)
    .map(([key, val]) => ({
      category: key,
      currentScore: Math.round(val.score * 10) / 10,
      maxScore: val.maxScore,
      gap: Math.round((val.maxScore - val.score) * 10) / 10
    }))
    .sort((a, b) => b.gap - a.gap);
  
  // Calculate Key Metrics for display
  const keyMetrics = {
    skillsCoverage: {
      percentage: Math.round((detailedAnalysis.skills.score / detailedAnalysis.skills.maxScore) * 100),
      label: 'Skills Coverage',
      icon: '🎯',
      color: detailedAnalysis.skills.score >= 12 ? 'green' : detailedAnalysis.skills.score >= 8 ? 'yellow' : 'red'
    },
    formatting: {
      percentage: Math.round((detailedAnalysis.formatting.score / detailedAnalysis.formatting.maxScore) * 100),
      label: 'Formatting Quality',
      icon: '📋',
      color: detailedAnalysis.formatting.score >= 7 ? 'green' : detailedAnalysis.formatting.score >= 4 ? 'yellow' : 'red'
    },
    actionVerbs: {
      count: detailedAnalysis.actionWords.verbCount,
      label: 'Action Verbs',
      icon: '💪',
      color: detailedAnalysis.actionWords.verbCount >= 12 ? 'green' : detailedAnalysis.actionWords.verbCount >= 8 ? 'yellow' : 'red'
    },
    achievements: {
      count: detailedAnalysis.actionWords.achievementCount,
      label: 'Quantifiable Achievements',
      icon: '📊',
      color: detailedAnalysis.actionWords.achievementCount >= 8 ? 'green' : detailedAnalysis.actionWords.achievementCount >= 5 ? 'yellow' : 'red'
    },
    wordCount: {
      count: detailedAnalysis.length.wordCount,
      label: 'Word Count',
      icon: '📏',
      color: (detailedAnalysis.length.wordCount >= 450 && detailedAnalysis.length.wordCount <= 700) ? 'green' :
             (detailedAnalysis.length.wordCount >= 400 && detailedAnalysis.length.wordCount <= 800) ? 'yellow' : 'red'
    },
    jobMatch: detailedAnalysis.jobMatch && detailedAnalysis.jobMatch.matchRatio ? {
      percentage: parseInt(detailedAnalysis.jobMatch.matchRatio),
      label: 'Job Description Match',
      icon: '🎯',
      color: parseInt(detailedAnalysis.jobMatch.matchRatio) >= 50 ? 'green' :
             parseInt(detailedAnalysis.jobMatch.matchRatio) >= 35 ? 'yellow' : 'red'
    } : null
  };
  
  return {
    score: Math.round(score * 10) / 10,
    grade: score >= 90 ? 'Excellent' : score >= 80 ? 'Very Good' : score >= 70 ? 'Good' : score >= 60 ? 'Fair' : 'Needs Improvement',
    strengths,
    suggestions: uniqueSuggestions,
    detailedAnalysis,
    keywordsFound: Object.values(foundSkills).flat(),
    keyMetrics,
    improvementPotential: {
      possibleGain: potentialGain,
      topOpportunities: categoryImprovements.slice(0, 3).map(c => ({
        category: c.category.charAt(0).toUpperCase() + c.category.slice(1),
        currentScore: c.currentScore,
        maxScore: c.maxScore,
        potentialPoints: c.gap
      }))
    }
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
  const questions = generateQuestionsFromText(text, jobDescription); // Pass job description for context
    
    res.json({ 
      ok: true, 
      atsScore: atsAnalysis.score,
      grade: atsAnalysis.grade,
      strengths: atsAnalysis.strengths,
      suggestions: atsAnalysis.suggestions,
      keywordsFound: atsAnalysis.keywordsFound,
      detailedAnalysis: atsAnalysis.detailedAnalysis,
      keyMetrics: atsAnalysis.keyMetrics,
      improvementPotential: atsAnalysis.improvementPotential,
      candidateName: questions.candidateName || null,
      questions 
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, error: 'Processing failed' });
  }
});

module.exports = router;
