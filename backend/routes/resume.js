const express = require('express');
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');
const Resume = require('../models/Resume');

const router = express.Router();

// Middleware to verify JWT token
const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ ok: false, error: 'No token provided' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    return res.status(401).json({ ok: false, error: 'Invalid token' });
  }
};

// Create or update resume
router.post('/', authMiddleware, async (req, res) => {
  try {
    const payload = req.body;
    let id = payload.id || uuidv4();
    
    let resume = await Resume.findOne({ resumeId: id, userId: req.userId });
    if (resume) {
      resume.data = payload;
      resume.title = payload.personalInfo?.fullName || 'Untitled Resume';
      resume.updatedAt = new Date();
      await resume.save();
    } else {
      resume = new Resume({
        resumeId: id,
        userId: req.userId,
        title: payload.personalInfo?.fullName || 'Untitled Resume',
        data: payload,
        updatedAt: new Date(),
      });
      await resume.save();
    }
    
    res.json({ ok: true, id, entry: { id, data: payload, updatedAt: resume.updatedAt } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// List
router.get('/', authMiddleware, async (req, res) => {
  try {
    const resumes = await Resume.find({ userId: req.userId }).sort({ updatedAt: -1 });
    const items = resumes.map(r => ({ 
      _id: r._id,
      id: r.resumeId, 
      title: r.title || 'Untitled Resume',
      data: r.data, 
      updatedAt: r.updatedAt,
      createdAt: r.createdAt,
      atsScore: r.atsScore,
      grade: r.grade,
      lastAnalyzed: r.lastAnalyzed,
    }));
    res.json({ ok: true, resumes: items });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Get by id
router.get('/:id', async (req, res) => {
  try {
    const resume = await Resume.findOne({ resumeId: req.params.id });
    if (!resume) return res.status(404).json({ ok: false, error: 'Not found' });
    res.json({ ok: true, item: { id: resume.resumeId, data: resume.data, updatedAt: resume.updatedAt } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Delete
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await Resume.deleteOne({ resumeId: req.params.id, userId: req.userId });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Update ATS score
router.patch('/:id/ats-score', authMiddleware, async (req, res) => {
  try {
    const { atsScore, grade } = req.body;
    const resume = await Resume.findOne({ resumeId: req.params.id, userId: req.userId });
    
    if (!resume) {
      return res.status(404).json({ ok: false, error: 'Resume not found' });
    }
    
    resume.atsScore = atsScore;
    resume.grade = grade;
    resume.lastAnalyzed = new Date();
    await resume.save();
    
    res.json({ ok: true, message: 'ATS score updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Export to PDF (simple layout)
router.post('/:id/export', async (req, res) => {
  try {
    const resume = await Resume.findOne({ resumeId: req.params.id });
    if (!resume) return res.status(404).json({ ok: false, error: 'Not found' });

    const doc = new PDFDocument({ margin: 50 });
    const filename = `${resume.resumeId}.pdf`;
    const exportPath = path.join(__dirname, '..', 'public', 'exports', filename);
    const stream = fs.createWriteStream(exportPath);
    doc.pipe(stream);

    const r = resume.data;
    doc.fontSize(20).text(r.personalInfo?.fullName || 'Name', { align: 'left' });
    doc.moveDown(0.2);
    doc.fontSize(10).text(`${r.personalInfo?.email || ''} • ${r.personalInfo?.phone || ''} • ${r.personalInfo?.location || ''}`);
    doc.moveDown();

    if (r.summary) {
      doc.fontSize(12).text('Summary', { underline: true });
      doc.fontSize(10).text(r.summary);
      doc.moveDown();
    }

    if (Array.isArray(r.experience) && r.experience.length) {
      doc.fontSize(12).text('Experience', { underline: true });
      r.experience.forEach(exp => {
        doc.fontSize(11).text(`${exp.position} — ${exp.company}`);
        doc.fontSize(10).text(`${exp.startDate || ''} - ${exp.endDate || ''}`);
        if (exp.description) doc.fontSize(10).text(exp.description);
        doc.moveDown(0.5);
      });
      doc.moveDown();
    }

    if (Array.isArray(r.education) && r.education.length) {
      doc.fontSize(12).text('Education', { underline: true });
      r.education.forEach(edu => {
        doc.fontSize(11).text(`${edu.degree} — ${edu.institution}`);
        doc.fontSize(10).text(`${edu.startDate || ''} - ${edu.endDate || ''}`);
        if (edu.gpa) doc.fontSize(10).text(`GPA: ${edu.gpa}`);
        doc.moveDown(0.5);
      });
      doc.moveDown();
    }

    if (Array.isArray(r.skills) && r.skills.length) {
      doc.fontSize(12).text('Skills', { underline: true });
      doc.fontSize(10).text(r.skills.join(', '));
      doc.moveDown();
    }

    doc.end();

    stream.on('finish', () => {
      const url = `/exports/${filename}`;
      res.json({ ok: true, url });
    });
    stream.on('error', (err) => {
      console.error(err);
      res.status(500).json({ ok: false, error: 'Export failed' });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

module.exports = router;
