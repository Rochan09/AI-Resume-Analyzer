const mongoose = require('mongoose');

const interviewItemSchema = new mongoose.Schema({
  question: { type: String, required: true },
  category: { type: String },
  answer: { type: String },
  score: { type: Number },
  strengths: [{ type: String }],
  improvements: [{ type: String }],
  durationSec: { type: Number },
}, { _id: false });

const interviewSessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true, required: true },
  jobTitle: { type: String },
  jobDescription: { type: String },
  startedAt: { type: Date },
  endedAt: { type: Date },
  durationSec: { type: Number },
  overallScore: { type: Number },
  questions: [interviewItemSchema],
}, { timestamps: true });

module.exports = mongoose.model('InterviewSession', interviewSessionSchema);
