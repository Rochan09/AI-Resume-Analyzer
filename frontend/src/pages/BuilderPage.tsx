import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Plus, Trash2, Upload, User, Briefcase, GraduationCap, Award, FolderGit2, ChevronDown, ChevronUp, Link, ZoomIn, ZoomOut } from 'lucide-react';
import { useResume } from '../contexts/ResumeContext';
import { ResumePreview } from '../components/ResumePreview';

type Section = 'personal' | 'experience' | 'education' | 'skills' | 'projects' | 'custom';

export function BuilderPage() {
  const { resumeData, updateResumeData } = useResume();
  const [expandedSections, setExpandedSections] = useState<Record<Section, boolean>>({
    personal: true,
    experience: false,
    education: false,
    skills: false,
    projects: false,
    custom: false,
  });
  const [zoomLevel, setZoomLevel] = useState(100);
  const [selectedExperienceId, setSelectedExperienceId] = useState<string | null>(null);
  const [selectedEducationId, setSelectedEducationId] = useState<string | null>(null);
  const [isEditingEducation, setIsEditingEducation] = useState(false);

  const toggleSection = (section: Section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const sections = [
    { id: 'personal' as Section, label: 'Personal Details', icon: User },
    { id: 'experience' as Section, label: 'Work Experience', icon: Briefcase },
    { id: 'education' as Section, label: 'Education', icon: GraduationCap },
    { id: 'skills' as Section, label: 'Skills', icon: Award },
    { id: 'projects' as Section, label: 'Projects', icon: FolderGit2 },
  ];

  const addEducation = () => {
    updateResumeData({
      education: [...resumeData.education, {
        id: Date.now().toString(),
        institution: '',
        degree: '',
        field: '',
        startDate: '',
        endDate: '',
        gpa: '',
      }],
    });
  };

  const removeEducation = (id: string) => {
    updateResumeData({
      education: resumeData.education.filter(edu => edu.id !== id),
    });
  };

  const updateEducation = (id: string, field: string, value: string) => {
    updateResumeData({
      education: resumeData.education.map(edu =>
        edu.id === id ? { ...edu, [field]: value } : edu
      ),
    });
  };

  const addExperience = () => {
    const newExp = {
      id: Date.now().toString(),
      company: '',
      position: '',
      location: '',
      startDate: '',
      endDate: '',
      current: false,
      description: '',
    };
    updateResumeData({
      experience: [...resumeData.experience, newExp],
    });
  };

  const removeExperience = (id: string) => {
    updateResumeData({
      experience: resumeData.experience.filter(exp => exp.id !== id),
    });
  };

  const updateExperience = (id: string, field: string, value: string | boolean) => {
    updateResumeData({
      experience: resumeData.experience.map(exp =>
        exp.id === id ? { ...exp, [field]: value } : exp
      ),
    });
  };

  const addProject = () => {
    updateResumeData({
      projects: [...resumeData.projects, {
        id: Date.now().toString(),
        name: '',
        description: '',
        technologies: '',
        link: '',
      }],
    });
  };

  const removeProject = (id: string) => {
    updateResumeData({
      projects: resumeData.projects.filter(proj => proj.id !== id),
    });
  };

  const updateProject = (id: string, field: string, value: string) => {
    updateResumeData({
      projects: resumeData.projects.map(proj =>
        proj.id === id ? { ...proj, [field]: value } : proj
      ),
    });
  };

  const addSkill = () => {
    const skill = prompt('Enter a skill:');
    if (skill?.trim()) {
      updateResumeData({ skills: [...resumeData.skills, skill.trim()] });
    }
  };

  const removeSkill = (index: number) => {
    updateResumeData({
      skills: resumeData.skills.filter((_, i) => i !== index),
    });
  };

  // New Skills V2 functions
  const addSkillV2 = (category: 'technical' | 'soft' | 'languages', name: string, level: string = 'Beginner') => {
    const newSkill = {
      id: Date.now().toString(),
      name,
      level,
    };
    
    const currentSkills = resumeData.skillsV2 || { technical: [], soft: [], languages: [] };
    updateResumeData({
      skillsV2: {
        ...currentSkills,
        [category]: [...currentSkills[category], newSkill],
      },
    });
  };

  const removeSkillV2 = (category: 'technical' | 'soft' | 'languages', id: string) => {
    const currentSkills = resumeData.skillsV2 || { technical: [], soft: [], languages: [] };
    updateResumeData({
      skillsV2: {
        ...currentSkills,
        [category]: currentSkills[category].filter(skill => skill.id !== id),
      },
    });
  };

  const updateSkillV2 = (category: 'technical' | 'soft' | 'languages', id: string, field: 'name' | 'level', value: string) => {
    const currentSkills = resumeData.skillsV2 || { technical: [], soft: [], languages: [] };
    updateResumeData({
      skillsV2: {
        ...currentSkills,
        [category]: currentSkills[category].map(skill =>
          skill.id === id ? { ...skill, [field]: value } : skill
        ),
      },
    });
  };

  const toggleSkillCategory = (category: 'technical' | 'soft' | 'languages') => {
    setExpandedSkillCategories(prev => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const handleProfilePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingResume(true);
    try {
      const form = new FormData();
      form.append('resume', file as Blob, file.name);
      form.append('jobDescription', '');

      const res = await fetch('http://localhost:5001/api/ats/analyze', {
        method: 'POST',
        body: form,
      });
      const json = await res.json();
      if (json.ok && json.questions) {
        // Store questions in sessionStorage so Interview Prep page can display them
        sessionStorage.setItem('interviewPrepQuestions', JSON.stringify(json.questions));
        // Redirect to Interview Prep page
        window.location.hash = 'questions';
      } else {
        console.error('analyze upload failed', json);
        alert('Resume analysis failed');
      }
    } catch (err) {
      console.error(err);
      alert('Error uploading resume — is backend running?');
    } finally {
      setUploadingResume(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-[280px,1fr] gap-8">
          {/* Left Sidebar */}
          <aside className="lg:sticky lg:top-24 h-fit">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Resume Builder</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">Build your perfect resume</p>
              </div>
              
              <nav className="space-y-2">
                {sections.map(section => {
                  const Icon = section.icon;
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                        activeSection === section.id
                          ? 'bg-blue-600 text-white shadow-lg'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-sm">{section.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main>
            {/* Profile Completion Bar */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Profile Completion</span>
                <span className="text-sm font-bold text-blue-600">{profileCompletion}%</span>
              </div>
              <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${profileCompletion}%` }}
                  transition={{ duration: 0.5 }}
                  className="h-full bg-blue-600"
                />
              </div>
            </div>

            {/* Form Content */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {activeSection === 'personal' && (
                  <div className="space-y-8">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Personal Information</h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Let's start with the basics. Fill out your personal details below.</p>
                    </div>

                    {/* Profile Photo */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        Profile Photo
                      </label>
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-2xl font-bold overflow-hidden">
                            {profilePhoto ? (
                              <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                              <User className="w-12 h-12" />
                            )}
                          </div>
                          <label className="absolute bottom-0 right-0 w-8 h-8 bg-white dark:bg-gray-700 rounded-full flex items-center justify-center cursor-pointer shadow-lg border-2 border-blue-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                            <Upload className="w-4 h-4 text-blue-600" />
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleProfilePhotoUpload}
                              className="hidden"
                            />
                          </label>
                        </div>
                        <div>
                          <p className="text-sm text-gray-900 dark:text-white font-medium">PNG, JPG or GIF. Max size of 5MB.</p>
                        </div>
                      </div>
                    </div>

                    {/* Two Column Form */}
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Full Name
                        </label>
                        <input
                          type="text"
                          placeholder="Jane Doe"
                          value={resumeData.personalInfo.fullName}
                          onChange={e => updateResumeData({ personalInfo: { ...resumeData.personalInfo, fullName: e.target.value } })}
                          className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Email Address
                        </label>
                        <input
                          type="email"
                          placeholder="jane.doe@example.com"
                          value={resumeData.personalInfo.email}
                          onChange={e => updateResumeData({ personalInfo: { ...resumeData.personalInfo, email: e.target.value } })}
                          className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          placeholder="(123) 456-7890"
                          value={resumeData.personalInfo.phone}
                          onChange={e => updateResumeData({ personalInfo: { ...resumeData.personalInfo, phone: e.target.value } })}
                          className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Location
                        </label>
                        <input
                          type="text"
                          placeholder="e.g., San Francisco, CA"
                          value={resumeData.personalInfo.location}
                          onChange={e => updateResumeData({ personalInfo: { ...resumeData.personalInfo, location: e.target.value } })}
                          className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          LinkedIn Profile
                        </label>
                        <input
                          type="url"
                          placeholder="linkedin.com/in/janedoe"
                          value={resumeData.personalInfo.linkedin}
                          onChange={e => updateResumeData({ personalInfo: { ...resumeData.personalInfo, linkedin: e.target.value } })}
                          className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Portfolio Website
                        </label>
                        <input
                          type="url"
                          placeholder="janedoe.com"
                          value={resumeData.personalInfo.portfolio}
                          onChange={e => updateResumeData({ personalInfo: { ...resumeData.personalInfo, portfolio: e.target.value } })}
                          className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                      </div>
                    </div>
                  </div>
                )}

              {activeSection === 'education' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Education</h2>
                    <button
                      onClick={addEducation}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add Education
                    </button>
                  </div>
                  {resumeData.education.map(edu => (
                    <div key={edu.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl space-y-4">
                      <div className="flex justify-between items-start">
                        <h3 className="font-semibold text-gray-900 dark:text-white">Education Entry</h3>
                        <button
                          onClick={() => removeEducation(edu.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <input
                        type="text"
                        placeholder="Institution"
                        value={edu.institution}
                        onChange={e => updateEducation(edu.id, 'institution', e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <input
                        type="text"
                        placeholder="Degree"
                        value={edu.degree}
                        onChange={e => updateEducation(edu.id, 'degree', e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <input
                        type="text"
                        placeholder="Field of Study"
                        value={edu.field}
                        onChange={e => updateEducation(edu.id, 'field', e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <input
                          type="text"
                          placeholder="Start Date"
                          value={edu.startDate}
                          onChange={e => updateEducation(edu.id, 'startDate', e.target.value)}
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <input
                          type="text"
                          placeholder="End Date"
                          value={edu.endDate}
                          onChange={e => updateEducation(edu.id, 'endDate', e.target.value)}
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <input
                        type="text"
                        placeholder="GPA (optional)"
                        value={edu.gpa}
                        onChange={e => updateEducation(edu.id, 'gpa', e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  ))}
                </div>
              )}

                {activeSection === 'experience' && (
                  <div>
                    <div className="mb-6">
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Your Experience</h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Add your professional experience</p>
                    </div>

                    <div className="grid lg:grid-cols-[280px,1fr] gap-6">
                      {/* Left Sidebar - Experience List */}
                      <div className="space-y-3">
                        <button
                          onClick={() => {
                            addExperience();
                            // Select the newly added experience after a brief delay
                            setTimeout(() => {
                              const newExp = resumeData.experience[resumeData.experience.length - 1];
                              if (newExp) setSelectedExperienceId(newExp.id);
                            }, 100);
                          }}
                          className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
                        >
                          <Plus className="w-5 h-5" />
                          Add New Experience
                        </button>

                        {resumeData.experience.length === 0 ? (
                          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                            <Briefcase className="w-10 h-10 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No experience added yet</p>
                          </div>
                        ) : (
                          resumeData.experience.map((exp) => (
                            <div
                              key={exp.id}
                              onClick={() => setSelectedExperienceId(exp.id)}
                              className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                                selectedExperienceId === exp.id
                                  ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800'
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 mt-1">
                                  <div className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-600"></div>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                                    {exp.position || 'Position Title'}
                                  </h3>
                                  <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                                    {exp.company || 'Company Name'}
                                  </p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        removeExperience(exp.id);
                                        if (selectedExperienceId === exp.id) {
                                          setSelectedExperienceId(null);
                                        }
                                      }}
                                      className="text-gray-400 hover:text-red-600 transition-colors"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>

                      {/* Right Side - Experience Form */}
                      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                        {selectedExperienceId ? (
                          (() => {
                            const exp = resumeData.experience.find(e => e.id === selectedExperienceId);
                            if (!exp) return null;

                            return (
                              <div className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                      Job Title
                                    </label>
                                    <input
                                      type="text"
                                      placeholder="Senior Product Manager"
                                      value={exp.position}
                                      onChange={e => updateExperience(exp.id, 'position', e.target.value)}
                                      className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    />
                                  </div>

                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                      Company
                                    </label>
                                    <input
                                      type="text"
                                      placeholder="Innovate Inc."
                                      value={exp.company}
                                      onChange={e => updateExperience(exp.id, 'company', e.target.value)}
                                      className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    />
                                  </div>
                                </div>

                                <div>
                                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Location
                                  </label>
                                  <input
                                    type="text"
                                    placeholder="San Francisco, CA"
                                    value={exp.location || ''}
                                    onChange={e => updateExperience(exp.id, 'location', e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                  />
                                </div>

                                <div className="grid md:grid-cols-2 gap-6">
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                      Start Date
                                    </label>
                                    <input
                                      type="month"
                                      placeholder="August 2021"
                                      value={exp.startDate}
                                      onChange={e => updateExperience(exp.id, 'startDate', e.target.value)}
                                      className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    />
                                  </div>

                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                      End Date
                                    </label>
                                    <input
                                      type="month"
                                      placeholder="Present"
                                      value={exp.endDate}
                                      onChange={e => updateExperience(exp.id, 'endDate', e.target.value)}
                                      disabled={exp.current}
                                      className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    />
                                  </div>
                                </div>

                                <label className="flex items-center gap-2 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={exp.current}
                                    onChange={e => updateExperience(exp.id, 'current', e.target.checked)}
                                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                  />
                                  <span className="text-sm text-gray-700 dark:text-gray-300">I currently work here</span>
                                </label>

                                <div>
                                  <div className="flex items-center justify-between mb-2">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                      Responsibilities & Achievements
                                    </label>
                                    <button className="text-xs text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium flex items-center gap-1">
                                      <Sparkles className="w-3 h-3" />
                                      ATS Tip
                                    </button>
                                  </div>
                                  <div className="mb-2 flex gap-2">
                                    <button
                                      onClick={() => {
                                        const selection = window.getSelection();
                                        if (selection && selection.rangeCount > 0) {
                                          document.execCommand('bold');
                                        }
                                      }}
                                      className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                      title="Bold"
                                    >
                                      <span className="font-bold text-gray-700 dark:text-gray-300">B</span>
                                    </button>
                                    <button
                                      onClick={() => {
                                        const selection = window.getSelection();
                                        if (selection && selection.rangeCount > 0) {
                                          document.execCommand('italic');
                                        }
                                      }}
                                      className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                      title="Italic"
                                    >
                                      <span className="italic text-gray-700 dark:text-gray-300">I</span>
                                    </button>
                                    <button
                                      onClick={() => {
                                        document.execCommand('insertUnorderedList');
                                      }}
                                      className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                      title="Bullet List"
                                    >
                                      <span className="text-gray-700 dark:text-gray-300">≡</span>
                                    </button>
                                  </div>
                                  <textarea
                                    placeholder="Enter your work experience..."
                                    value={exp.description}
                                    onChange={e => updateExperience(exp.id, 'description', e.target.value)}
                                    rows={8}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none text-sm leading-relaxed"
                                  />
                                </div>
                              </div>
                            );
                          })()
                        ) : (
                          <div className="text-center py-16 text-gray-500 dark:text-gray-400">
                            <Briefcase className="w-16 h-16 mx-auto mb-4 opacity-30" />
                            <p className="text-lg font-medium mb-2">No Experience Selected</p>
                            <p className="text-sm">Click on an experience entry or add a new one to edit</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {activeSection === 'education' && (
                  <div>
                    <div className="mb-6">
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Tell us about your education</h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Start with your most recent degree. Include all relevant academic experiences.</p>
                    </div>

                    {/* Education Form */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
                      {(() => {
                        const edu = selectedEducationId 
                          ? resumeData.education.find(e => e.id === selectedEducationId)
                          : null;

                        // If editing mode or selected education exists, show form
                        if (isEditingEducation || edu) {
                          const currentEdu = edu || {
                            id: 'new',
                            institution: '',
                            degree: '',
                            field: '',
                            startDate: '',
                            endDate: '',
                            gpa: '',
                          };

                          return (
                            <div className="space-y-6">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                  School or University Name
                                </label>
                                <input
                                  type="text"
                                  placeholder="e.g., University of California, Berkeley"
                                  value={currentEdu.institution}
                                  onChange={e => {
                                    if (edu) {
                                      updateEducation(edu.id, 'institution', e.target.value);
                                    }
                                  }}
                                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                />
                              </div>

                              <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Degree / Course
                                  </label>
                                  <input
                                    type="text"
                                    placeholder="e.g., Bachelor of Science"
                                    value={currentEdu.degree}
                                    onChange={e => {
                                      if (edu) {
                                        updateEducation(edu.id, 'degree', e.target.value);
                                      }
                                    }}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                  />
                                </div>

                                <div>
                                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Field of Study
                                  </label>
                                  <input
                                    type="text"
                                    placeholder="e.g., Computer Science"
                                    value={currentEdu.field}
                                    onChange={e => {
                                      if (edu) {
                                        updateEducation(edu.id, 'field', e.target.value);
                                      }
                                    }}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                  />
                                </div>
                              </div>

                              <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Start Date
                                  </label>
                                  <input
                                    type="month"
                                    value={currentEdu.startDate}
                                    onChange={e => {
                                      if (edu) {
                                        updateEducation(edu.id, 'startDate', e.target.value);
                                      }
                                    }}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                  />
                                </div>

                                <div>
                                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    End Date
                                  </label>
                                  <input
                                    type="month"
                                    value={currentEdu.endDate}
                                    onChange={e => {
                                      if (edu) {
                                        updateEducation(edu.id, 'endDate', e.target.value);
                                      }
                                    }}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                  />
                                </div>
                              </div>

                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-700 dark:text-gray-300">I am currently studying here</span>
                              </label>

                              <div>
                                <div className="flex items-center gap-2 mb-2">
                                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Achievements / GPA
                                  </label>
                                  <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                  </button>
                                </div>
                                <textarea
                                  placeholder="e.g., Graduated with honors (Summa Cum Laude), Dean's List for 4 consecutive semesters, Published a paper on..."
                                  value={currentEdu.gpa || ''}
                                  onChange={e => {
                                    if (edu) {
                                      updateEducation(edu.id, 'gpa', e.target.value);
                                    }
                                  }}
                                  rows={4}
                                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none text-sm"
                                />
                              </div>

                              <div className="flex justify-end gap-3 pt-4">
                                <button
                                  onClick={() => {
                                    setIsEditingEducation(false);
                                    setSelectedEducationId(null);
                                  }}
                                  className="px-6 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={() => {
                                    if (!edu) {
                                      // Create new education
                                      const newEdu = {
                                        id: Date.now().toString(),
                                        institution: currentEdu.institution,
                                        degree: currentEdu.degree,
                                        field: currentEdu.field,
                                        startDate: currentEdu.startDate,
                                        endDate: currentEdu.endDate,
                                        gpa: currentEdu.gpa,
                                      };
                                      updateResumeData({
                                        education: [...resumeData.education, newEdu],
                                      });
                                    }
                                    setIsEditingEducation(false);
                                    setSelectedEducationId(null);
                                  }}
                                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors flex items-center gap-2"
                                >
                                  <Download className="w-4 h-4" />
                                  Save
                                </button>
                              </div>
                            </div>
                          );
                        }

                        // Show add button when not editing
                        return (
                          <button
                            onClick={() => setIsEditingEducation(true)}
                            className="w-full py-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-all text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                          >
                            <Plus className="w-8 h-8 mx-auto mb-2" />
                            <p className="font-medium">Click to add education</p>
                          </button>
                        );
                      })()}
                    </div>

                    {/* Education List */}
                    {resumeData.education.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Your Education</h3>
                        <div className="space-y-3">
                          {resumeData.education.map((edu) => (
                            <div
                              key={edu.id}
                              className="flex items-start gap-4 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-blue-500 dark:hover:border-blue-500 transition-all cursor-pointer group"
                              onClick={() => {
                                setSelectedEducationId(edu.id);
                                setIsEditingEducation(true);
                              }}
                            >
                              <div className="flex-shrink-0 mt-1">
                                <div className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-600 group-hover:bg-blue-500"></div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-gray-900 dark:text-white">
                                  {edu.degree || 'Degree'} in {edu.field || 'Field of Study'}
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {edu.institution || 'Institution'} | {edu.startDate || 'Start'} - {edu.endDate || 'End'}
                                </p>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeEducation(edu.id);
                                }}
                                className="flex-shrink-0 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-600 transition-all"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                          ))}
                        </div>

                        <button
                          onClick={() => {
                            setIsEditingEducation(true);
                            setSelectedEducationId(null);
                          }}
                          className="w-full mt-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl text-blue-600 dark:text-blue-400 font-medium hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors flex items-center justify-center gap-2"
                        >
                          <Plus className="w-5 h-5" />
                          Add Education
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {activeSection === 'skills' && (
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Manage Your Skills</h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Add relevant skills and set your proficiency. We'll help you organize them for maximum impact.</p>
                      </div>
                      <button
                        onClick={() => {
                          const category = prompt('Select category (technical/soft/languages):') as 'technical' | 'soft' | 'languages';
                          if (category && ['technical', 'soft', 'languages'].includes(category)) {
                            const skillName = prompt('Enter skill name:');
                            if (skillName?.trim()) {
                              addSkillV2(category, skillName.trim(), 'Beginner');
                            }
                          }
                        }}
                        className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors flex items-center gap-2"
                      >
                        <Plus className="w-5 h-5" />
                        Add Skill
                      </button>
                    </div>

                    {/* Search Bar */}
                    <div className="mb-6">
                      <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search for a skill..."
                          value={skillSearchQuery}
                          onChange={e => setSkillSearchQuery(e.target.value)}
                          className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                      </div>
                    </div>

                    {/* Skills Categories */}
                    <div className="space-y-4">
                      {/* Technical Skills */}
                      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <button
                          onClick={() => toggleSkillCategory('technical')}
                          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                        >
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Technical Skills</h3>
                          {expandedSkillCategories.technical ? (
                            <ChevronUp className="w-5 h-5 text-gray-500" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-500" />
                          )}
                        </button>
                        
                        {expandedSkillCategories.technical && (
                          <div className="p-4 pt-0 space-y-3">
                            {(resumeData.skillsV2?.technical || []).length === 0 ? (
                              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">No technical skills added yet</p>
                            ) : (
                              (resumeData.skillsV2?.technical || []).map(skill => (
                                <div key={skill.id} className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <span className="text-blue-600 dark:text-blue-400 font-mono text-sm">&lt;/&gt;</span>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <input
                                      type="text"
                                      value={skill.name}
                                      onChange={e => updateSkillV2('technical', skill.id, 'name', e.target.value)}
                                      className="w-full font-medium text-gray-900 dark:text-white bg-transparent border-none focus:outline-none focus:ring-0 p-0"
                                      placeholder="Skill name"
                                    />
                                    <select
                                      value={skill.level}
                                      onChange={e => updateSkillV2('technical', skill.id, 'level', e.target.value)}
                                      className="text-sm text-gray-600 dark:text-gray-400 bg-transparent border-none focus:outline-none focus:ring-0 p-0 cursor-pointer"
                                    >
                                      <option value="Beginner">Beginner</option>
                                      <option value="Intermediate">Intermediate</option>
                                      <option value="Advanced">Advanced</option>
                                      <option value="Expert">Expert</option>
                                    </select>
                                  </div>
                                  <button
                                    onClick={() => removeSkillV2('technical', skill.id)}
                                    className="text-gray-400 hover:text-red-600 transition-colors flex-shrink-0"
                                  >
                                    <Trash2 className="w-5 h-5" />
                                  </button>
                                </div>
                              ))
                            )}
                            <button
                              onClick={() => {
                                const skillName = prompt('Enter technical skill name:');
                                if (skillName?.trim()) {
                                  addSkillV2('technical', skillName.trim(), 'Beginner');
                                }
                              }}
                              className="w-full py-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                            >
                              + Add Technical Skill
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Soft Skills */}
                      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <button
                          onClick={() => toggleSkillCategory('soft')}
                          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                        >
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Soft Skills</h3>
                          {expandedSkillCategories.soft ? (
                            <ChevronUp className="w-5 h-5 text-gray-500" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-500" />
                          )}
                        </button>
                        
                        {expandedSkillCategories.soft && (
                          <div className="p-4 pt-0 space-y-3">
                            {(resumeData.skillsV2?.soft || []).length === 0 ? (
                              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">No soft skills added yet</p>
                            ) : (
                              (resumeData.skillsV2?.soft || []).map(skill => (
                                <div key={skill.id} className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                                  <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Award className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <input
                                      type="text"
                                      value={skill.name}
                                      onChange={e => updateSkillV2('soft', skill.id, 'name', e.target.value)}
                                      className="w-full font-medium text-gray-900 dark:text-white bg-transparent border-none focus:outline-none focus:ring-0 p-0"
                                      placeholder="Skill name"
                                    />
                                    <select
                                      value={skill.level}
                                      onChange={e => updateSkillV2('soft', skill.id, 'level', e.target.value)}
                                      className="text-sm text-gray-600 dark:text-gray-400 bg-transparent border-none focus:outline-none focus:ring-0 p-0 cursor-pointer"
                                    >
                                      <option value="Beginner">Beginner</option>
                                      <option value="Intermediate">Intermediate</option>
                                      <option value="Advanced">Advanced</option>
                                      <option value="Expert">Expert</option>
                                    </select>
                                  </div>
                                  <button
                                    onClick={() => removeSkillV2('soft', skill.id)}
                                    className="text-gray-400 hover:text-red-600 transition-colors flex-shrink-0"
                                  >
                                    <Trash2 className="w-5 h-5" />
                                  </button>
                                </div>
                              ))
                            )}
                            <button
                              onClick={() => {
                                const skillName = prompt('Enter soft skill name:');
                                if (skillName?.trim()) {
                                  addSkillV2('soft', skillName.trim(), 'Beginner');
                                }
                              }}
                              className="w-full py-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                            >
                              + Add Soft Skill
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Languages */}
                      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <button
                          onClick={() => toggleSkillCategory('languages')}
                          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                        >
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Languages</h3>
                          {expandedSkillCategories.languages ? (
                            <ChevronUp className="w-5 h-5 text-gray-500" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-500" />
                          )}
                        </button>
                        
                        {expandedSkillCategories.languages && (
                          <div className="p-4 pt-0 space-y-3">
                            {(resumeData.skillsV2?.languages || []).length === 0 ? (
                              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">No languages added yet</p>
                            ) : (
                              (resumeData.skillsV2?.languages || []).map(skill => (
                                <div key={skill.id} className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <span className="text-green-600 dark:text-green-400 font-bold text-lg">🌐</span>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <input
                                      type="text"
                                      value={skill.name}
                                      onChange={e => updateSkillV2('languages', skill.id, 'name', e.target.value)}
                                      className="w-full font-medium text-gray-900 dark:text-white bg-transparent border-none focus:outline-none focus:ring-0 p-0"
                                      placeholder="Language name"
                                    />
                                    <select
                                      value={skill.level}
                                      onChange={e => updateSkillV2('languages', skill.id, 'level', e.target.value)}
                                      className="text-sm text-gray-600 dark:text-gray-400 bg-transparent border-none focus:outline-none focus:ring-0 p-0 cursor-pointer"
                                    >
                                      <option value="Beginner">Beginner</option>
                                      <option value="Intermediate">Intermediate</option>
                                      <option value="Advanced">Advanced</option>
                                      <option value="Native">Native</option>
                                    </select>
                                  </div>
                                  <button
                                    onClick={() => removeSkillV2('languages', skill.id)}
                                    className="text-gray-400 hover:text-red-600 transition-colors flex-shrink-0"
                                  >
                                    <Trash2 className="w-5 h-5" />
                                  </button>
                                </div>
                              ))
                            )}
                            <button
                              onClick={() => {
                                const skillName = prompt('Enter language name:');
                                if (skillName?.trim()) {
                                  addSkillV2('languages', skillName.trim(), 'Beginner');
                                }
                              }}
                              className="w-full py-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                            >
                              + Add Language
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {activeSection === 'projects' && (
                  <div>
                    <div className="mb-6">
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Professional Projects</h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Showcase your experience by detailing your most impactful projects.</p>
                    </div>

                    {/* Project Form */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
                      {(() => {
                        const project = selectedProjectId 
                          ? resumeData.projects.find(p => p.id === selectedProjectId)
                          : null;

                        // If editing mode or selected project exists, show form
                        if (isEditingProject || project) {
                          const currentProject = project || {
                            id: 'new',
                            name: '',
                            description: '',
                            technologies: '',
                            link: '',
                          };

                          return (
                            <div className="space-y-6">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                  Project Title
                                </label>
                                <input
                                  type="text"
                                  placeholder="e.g., E-commerce Platform Redesign"
                                  value={currentProject.name}
                                  onChange={e => {
                                    if (project) {
                                      updateProject(project.id, 'name', e.target.value);
                                    }
                                  }}
                                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                />
                              </div>

                              <div className="grid md:grid-cols-3 gap-6">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Your Role
                                  </label>
                                  <input
                                    type="text"
                                    placeholder="e.g., Lead Front-End Developer"
                                    value={currentProject.role || ''}
                                    onChange={e => {
                                      if (project) {
                                        updateProject(project.id, 'role', e.target.value);
                                      }
                                    }}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                  />
                                </div>

                                <div>
                                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Start Date
                                  </label>
                                  <input
                                    type="month"
                                    placeholder="MM/YYYY"
                                    value={currentProject.startDate || ''}
                                    onChange={e => {
                                      if (project) {
                                        updateProject(project.id, 'startDate', e.target.value);
                                      }
                                    }}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                  />
                                </div>

                                <div>
                                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    End Date
                                  </label>
                                  <input
                                    type="month"
                                    placeholder="MM/YYYY"
                                    value={currentProject.endDate || ''}
                                    onChange={e => {
                                      if (project) {
                                        updateProject(project.id, 'endDate', e.target.value);
                                      }
                                    }}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                  />
                                </div>
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                  Project Description
                                </label>
                                <textarea
                                  placeholder="Describe your responsibilities and achievements. Use bullet points to highlight key contributions..."
                                  value={currentProject.description}
                                  onChange={e => {
                                    if (project) {
                                      updateProject(project.id, 'description', e.target.value);
                                    }
                                  }}
                                  rows={5}
                                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none text-sm"
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                  Project Link
                                </label>
                                <div className="relative">
                                  <Link className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                  <input
                                    type="url"
                                    placeholder="e.g., https://github.com/username/project"
                                    value={currentProject.link || ''}
                                    onChange={e => {
                                      if (project) {
                                        updateProject(project.id, 'link', e.target.value);
                                      }
                                    }}
                                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                  />
                                </div>
                              </div>

                              <div className="flex justify-end gap-3 pt-4">
                                <button
                                  onClick={() => {
                                    setIsEditingProject(false);
                                    setSelectedProjectId(null);
                                  }}
                                  className="px-6 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                >
                                  Clear Form
                                </button>
                                <button
                                  onClick={() => {
                                    if (!project) {
                                      // Create new project
                                      const newProject = {
                                        id: Date.now().toString(),
                                        name: currentProject.name,
                                        description: currentProject.description,
                                        technologies: currentProject.technologies,
                                        link: currentProject.link,
                                        role: currentProject.role,
                                        startDate: currentProject.startDate,
                                        endDate: currentProject.endDate,
                                      };
                                      updateResumeData({
                                        projects: [...resumeData.projects, newProject],
                                      });
                                    }
                                    setIsEditingProject(false);
                                    setSelectedProjectId(null);
                                  }}
                                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors flex items-center gap-2"
                                >
                                  <Plus className="w-5 h-5" />
                                  Add Project
                                </button>
                              </div>
                            </div>
                          );
                        }

                        // Show add button when not editing
                        return null;
                      })()}

                      {!isEditingProject && !selectedProjectId && (
                        <div className="text-center py-8">
                          <button
                            onClick={() => setIsEditingProject(true)}
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                          >
                            Click to start adding a project
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Projects List */}
                    {resumeData.projects.length > 0 && (
                      <div>
                        <div className="space-y-3">
                          {resumeData.projects.map((proj) => (
                            <div
                              key={proj.id}
                              className="flex items-start gap-4 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-blue-500 dark:hover:border-blue-500 transition-all group"
                            >
                              <div className="flex-shrink-0 mt-1">
                                <div className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-600 group-hover:bg-blue-500"></div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-gray-900 dark:text-white">
                                  {proj.name || 'Untitled Project'}
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {proj.startDate || 'Start'} - {proj.endDate || 'End'}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => {
                                    setSelectedProjectId(proj.id);
                                    setIsEditingProject(true);
                                  }}
                                  className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-blue-600 transition-all"
                                >
                                  <Edit className="w-5 h-5" />
                                </button>
                                <button
                                  onClick={() => removeProject(proj.id)}
                                  className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-600 transition-all"
                                >
                                  <Trash2 className="w-5 h-5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>

                        <button
                          onClick={() => {
                            setIsEditingProject(true);
                            setSelectedProjectId(null);
                          }}
                          className="w-full mt-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl text-blue-600 dark:text-blue-400 font-medium hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-500 transition-all flex items-center justify-center gap-2"
                        >
                          <Plus className="w-5 h-5" />
                          Add Another Project
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>

              {/* Bottom Action Buttons */}
              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  All changes saved
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowPreview(!showPreview)}
                    className="px-6 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium rounded-xl transition-colors flex items-center gap-2"
                  >
                    <Eye className="w-5 h-5" />
                    Preview
                  </button>
                  <button
                    onClick={async () => {
                      setExporting(true);
                      try {
                        const saveRes = await fetch('http://localhost:5001/api/resume', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify(resumeData),
                        });
                        const saveJson = await saveRes.json();
                        const id = saveJson.id;
                        const expRes = await fetch(`http://localhost:5001/api/resume/${id}/export`, { method: 'POST' });
                        const expJson = await expRes.json();
                        if (expJson.ok && expJson.url) {
                          window.open(`http://localhost:5001${expJson.url}`, '_blank');
                        } else {
                          alert('Export failed');
                        }
                      } catch (err) {
                        console.error(err);
                        alert('Error exporting PDF');
                      } finally {
                        setExporting(false);
                      }
                    }}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors flex items-center gap-2 shadow-lg"
                  >
                    <Download className="w-5 h-5" />
                    {exporting ? 'Preparing...' : 'Save & Continue'}
                  </button>
                </div>
              </div>
            </div>

            {/* Preview Modal */}
            {showPreview && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={() => setShowPreview(false)}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
                  onClick={e => e.stopPropagation()}
                >
                  <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Resume Preview</h3>
                    <button
                      onClick={() => setShowPreview(false)}
                      className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    >
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <div className="p-6">
                    <ResumePreview />
                  </div>
                </motion.div>
              </motion.div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
