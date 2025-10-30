const express = require('express');
const InterviewSession = require('../models/InterviewSession');
const auth = require('../middleware/auth');

const router = express.Router();

// Create a new interview session record
router.post('/sessions', auth, async (req, res) => {
  try {
    const { startedAt, endedAt, durationSec, overallScore, questions, jobTitle, jobDescription } = req.body;

    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ ok: false, error: 'questions array is required' });
    }

    const session = new InterviewSession({
      userId: req.user.userId,
      jobTitle: jobTitle || undefined,
      jobDescription: jobDescription || undefined,
      startedAt: startedAt ? new Date(startedAt) : new Date(),
      endedAt: endedAt ? new Date(endedAt) : new Date(),
      durationSec: typeof durationSec === 'number' ? durationSec : undefined,
      overallScore: typeof overallScore === 'number' ? overallScore : undefined,
      questions: questions.map(q => ({
        question: q.question,
        category: q.category,
        answer: q.answer,
        score: q.score,
        strengths: q.strengths || [],
        improvements: q.improvements || [],
        durationSec: q.durationSec,
      })),
    });

    await session.save();
    res.json({ ok: true, sessionId: session._id, session });
  } catch (err) {
    console.error('Create session error:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// List sessions for current user (most recent first)
router.get('/sessions', auth, async (req, res) => {
  try {
    const sessions = await InterviewSession.find({ userId: req.user.userId })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json({ ok: true, sessions });
  } catch (err) {
    console.error('List sessions error:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Get a single session
router.get('/sessions/:id', auth, async (req, res) => {
  try {
    const session = await InterviewSession.findOne({ _id: req.params.id, userId: req.user.userId });
    if (!session) return res.status(404).json({ ok: false, error: 'Not found' });
    res.json({ ok: true, session });
  } catch (err) {
    console.error('Get session error:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

module.exports = router;
