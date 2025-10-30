const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
  resumeId: { type: String, required: true, unique: true },
  data: {
    personalInfo: {
      fullName: String,
      email: String,
      phone: String,
      location: String,
      linkedin: String,
      portfolio: String,
    },
    summary: String,
    education: [{
      id: String,
      institution: String,
      degree: String,
      field: String,
      startDate: String,
      endDate: String,
      gpa: String,
    }],
    experience: [{
      id: String,
      company: String,
      position: String,
      startDate: String,
      endDate: String,
      current: Boolean,
      description: String,
    }],
    skills: [String],
    projects: [{
      id: String,
      name: String,
      description: String,
      technologies: String,
      link: String,
    }],
  },
  updatedAt: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('Resume', resumeSchema);
