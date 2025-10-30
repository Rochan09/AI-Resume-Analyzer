const express = require('express');
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const { v4: uuidv4 } = require('uuid');
const Resume = require('../models/Resume');

const router = express.Router();

// Create or update resume
router.post('/', async (req, res) => {
  try {
    const payload = req.body;
    let id = payload.id || uuidv4();
    
    let resume = await Resume.findOne({ resumeId: id });
    if (resume) {
      resume.data = payload;
      resume.updatedAt = new Date();
      await resume.save();
    } else {
      resume = new Resume({
        resumeId: id,
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
router.get('/', async (req, res) => {
  try {
    const resumes = await Resume.find().sort({ updatedAt: -1 });
    const items = resumes.map(r => ({ id: r.resumeId, data: r.data, updatedAt: r.updatedAt }));
    res.json({ ok: true, items });
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
router.delete('/:id', async (req, res) => {
  try {
    await Resume.deleteOne({ resumeId: req.params.id });
    res.json({ ok: true });
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
