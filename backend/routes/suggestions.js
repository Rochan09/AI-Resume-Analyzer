const express = require('express');
const router = express.Router();

// Heuristic suggestions based on resume JSON
router.post('/', (req, res) => {
  const r = req.body || {};
  const suggestions = [];

  // Summary
  if (!r.summary || r.summary.trim().length < 30) {
    suggestions.push('Write a concise professional summary (2-4 sentences) that highlights your top skills and achievements.');
  } else {
    suggestions.push('Your summary looks good — consider adding one quantified achievement (e.g., "reduced latency by 30%") to strengthen it.');
  }

  // Skills
  if (!Array.isArray(r.skills) || r.skills.length < 5) {
    suggestions.push('Expand your skills section to include relevant technologies, tools, and methodologies (aim for 6-12 core skills).');
  }

  // Experience
  if (Array.isArray(r.experience) && r.experience.length) {
    const missingDetails = r.experience.filter(e => !e.description || e.description.trim().length < 20);
    if (missingDetails.length) {
      suggestions.push('Add short achievement-focused bullet points to each role. Use metrics where possible (e.g., "improved X by Y%" ).');
    } else {
      suggestions.push('Experience sections look detailed. Ensure top 2-3 roles contain quantifiable outcomes.');
    }
  } else {
    suggestions.push('Add at least one detailed work experience entry with responsibilities and achievements.');
  }

  // Projects
  if (Array.isArray(r.projects) && r.projects.length) {
    suggestions.push('For each project, include the technologies used and a link or short outcome (what you built or achieved).');
  }

  // Education
  if (!Array.isArray(r.education) || r.education.length === 0) {
    suggestions.push('If you have relevant coursework or certifications, add them to the education or projects sections.');
  }

  // Skills formatting
  suggestions.push('Prefer single-line skill tokens (comma-separated or tags) to make scanning easier for both humans and ATS.');

  res.json({ ok: true, suggestions });
});

module.exports = router;
