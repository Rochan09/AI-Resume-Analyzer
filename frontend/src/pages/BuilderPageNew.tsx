import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Briefcase, GraduationCap, Award, FolderGit2, File, ChevronDown, ChevronUp, Plus, Trash2, ZoomIn, ZoomOut, X, Eye, EyeOff } from 'lucide-react';
import { useResume } from '../contexts/ResumeContext';
import { ResumePreview } from '../components/ResumePreview';

type Section = 'personal' | 'experience' | 'education' | 'skills' | 'projects' | 'custom';

interface SkillCategory {
  id: string;
  category: string;
  skills: string[];
}

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
  const [zoomLevel, setZoomLevel] = useState(75);
  const [skillCategories, setSkillCategories] = useState<SkillCategory[]>([
    { id: '1', category: 'Language', skills: [] },
  ]);
  const [newSkillInputs, setNewSkillInputs] = useState<Record<string, string>>({});

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
    { id: 'custom' as Section, label: 'Custom Section', icon: File },
  ];

  const addExperience = () => {
    updateResumeData({
      experience: [...resumeData.experience, {
        id: Date.now().toString(),
        company: '',
        position: '',
        location: '',
        startDate: '',
        endDate: '',
        current: false,
        description: '',
      }],
    });
  };

  const removeExperience = (id: string) => {
    updateResumeData({
      experience: resumeData.experience.filter(exp => exp.id !== id),
    });
  };

  const updateExperience = (id: string, updates: any) => {
    updateResumeData({
      experience: resumeData.experience.map(exp =>
        exp.id === id ? { ...exp, ...updates } : exp
      ),
    });
  };

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

  const updateEducation = (id: string, updates: any) => {
    updateResumeData({
      education: resumeData.education.map(edu =>
        edu.id === id ? { ...edu, ...updates } : edu
      ),
    });
  };

  const addSkillCategory = () => {
    const newCategory: SkillCategory = {
      id: Date.now().toString(),
      category: '',
      skills: []
    };
     console.log('Adding new category:', newCategory);
     console.log('Current categories:', skillCategories);
    setSkillCategories([...skillCategories, newCategory]);
     console.log('Categories after update should include new category');
  };

  const removeSkillCategory = (categoryId: string) => {
    setSkillCategories(skillCategories.filter(cat => cat.id !== categoryId));
  };

  const updateSkillCategory = (categoryId: string, newCategoryName: string) => {
    setSkillCategories(skillCategories.map(cat =>
      cat.id === categoryId ? { ...cat, category: newCategoryName } : cat
    ));
  };

  const addSkillToCategory = (categoryId: string) => {
    const skillInput = newSkillInputs[categoryId] || '';
    if (!skillInput.trim()) return;

    setSkillCategories(skillCategories.map(cat =>
      cat.id === categoryId ? { ...cat, skills: [...cat.skills, skillInput.trim()] } : cat
    ));
    
    // Update resume data with all skills
    const allSkills = skillCategories.flatMap(cat => 
      cat.id === categoryId ? [...cat.skills, skillInput.trim()] : cat.skills
    );
    updateResumeData({ skills: allSkills });

    // Clear input
    setNewSkillInputs({ ...newSkillInputs, [categoryId]: '' });
  };

  const removeSkillFromCategory = (categoryId: string, skillIndex: number) => {
    setSkillCategories(skillCategories.map(cat =>
      cat.id === categoryId ? { ...cat, skills: cat.skills.filter((_, i) => i !== skillIndex) } : cat
    ));

    // Update resume data
    const allSkills = skillCategories.flatMap(cat =>
      cat.id === categoryId ? cat.skills.filter((_, i) => i !== skillIndex) : cat.skills
    );
    updateResumeData({ skills: allSkills });
  };

  const handleSkillInputChange = (categoryId: string, value: string) => {
    setNewSkillInputs({ ...newSkillInputs, [categoryId]: value });
  };

  const handleSkillInputKeyPress = (categoryId: string, e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkillToCategory(categoryId);
    }
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

  const updateProject = (id: string, updates: any) => {
    updateResumeData({
      projects: resumeData.projects.map(proj =>
        proj.id === id ? { ...proj, ...updates } : proj
      ),
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Panel - Form */}
          <div className="space-y-4 h-[calc(100vh-120px)] overflow-y-auto pr-4">
            {sections.map((section) => {
              const Icon = section.icon;
              const isExpanded = expandedSections[section.id];
              
              return (
                <motion.div
                  key={section.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
                >
                  {/* Section Header */}
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="w-full flex items-center justify-between p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {section.label}
                      </h3>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    )}
                  </button>

                  {/* Section Content */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="border-t border-gray-200 dark:border-gray-700"
                      >
                        <div className="p-6 space-y-6">
                          {/* Personal Details */}
                          {section.id === 'personal' && (
                            <>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                  Full Name
                                </label>
                                <input
                                  type="text"
                                  placeholder="John Doe"
                                  value={resumeData.personalInfo.fullName}
                                  onChange={e => updateResumeData({ personalInfo: { ...resumeData.personalInfo, fullName: e.target.value } })}
                                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                />
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Email Address
                                  </label>
                                  <input
                                    type="email"
                                    placeholder="john.doe@email.com"
                                    value={resumeData.personalInfo.email}
                                    onChange={e => updateResumeData({ personalInfo: { ...resumeData.personalInfo, email: e.target.value } })}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                  />
                                </div>
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                  LinkedIn URL
                                </label>
                                <input
                                  type="url"
                                  placeholder="linkedin.com/in/johndoe"
                                  value={resumeData.personalInfo.linkedin}
                                  onChange={e => updateResumeData({ personalInfo: { ...resumeData.personalInfo, linkedin: e.target.value } })}
                                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                />
                              </div>
                            </>
                          )}

                          {/* Work Experience */}
                          {section.id === 'experience' && (
                            <div className="space-y-6">
                              {resumeData.experience.map((exp, index) => (
                                <div key={exp.id} className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl space-y-4">
                                  <div className="flex justify-between items-start">
                                    <h4 className="font-semibold text-gray-900 dark:text-white">Experience {index + 1}</h4>
                                    <button
                                      onClick={() => removeExperience(exp.id)}
                                      className="text-red-600 hover:text-red-700 transition-colors"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>

                                  <input
                                    type="text"
                                    placeholder="Company Name"
                                    value={exp.company}
                                    onChange={e => updateExperience(exp.id, { company: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                                  />

                                  <input
                                    type="text"
                                    placeholder="Position"
                                    value={exp.position}
                                    onChange={e => updateExperience(exp.id, { position: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                                  />

                                  <div className="grid grid-cols-2 gap-4">
                                    <input
                                      type="month"
                                      placeholder="Start Date"
                                      value={exp.startDate}
                                      onChange={e => updateExperience(exp.id, { startDate: e.target.value })}
                                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                                    />

                                    <input
                                      type="month"
                                      placeholder="End Date"
                                      value={exp.endDate}
                                      onChange={e => updateExperience(exp.id, { endDate: e.target.value })}
                                      disabled={exp.current}
                                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm disabled:opacity-50"
                                    />
                                  </div>

                                  <textarea
                                    placeholder="Description"
                                    value={exp.description}
                                    onChange={e => updateExperience(exp.id, { description: e.target.value })}
                                    rows={3}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                                  />
                                </div>
                              ))}

                              <button
                                onClick={addExperience}
                                className="w-full px-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl text-gray-600 dark:text-gray-400 hover:border-blue-600 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center justify-center gap-2"
                              >
                                <Plus className="w-4 h-4" />
                                Add Experience
                              </button>
                            </div>
                          )}

                          {/* Education */}
                          {section.id === 'education' && (
                            <div className="space-y-6">
                              {resumeData.education.map((edu, index) => (
                                <div key={edu.id} className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl space-y-4">
                                  <div className="flex justify-between items-start">
                                    <h4 className="font-semibold text-gray-900 dark:text-white">Education {index + 1}</h4>
                                    <button
                                      onClick={() => removeEducation(edu.id)}
                                      className="text-red-600 hover:text-red-700 transition-colors"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>

                                  <input
                                    type="text"
                                    placeholder="Institution"
                                    value={edu.institution}
                                    onChange={e => updateEducation(edu.id, { institution: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                                  />

                                  <input
                                    type="text"
                                    placeholder="Degree"
                                    value={edu.degree}
                                    onChange={e => updateEducation(edu.id, { degree: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                                  />

                                  <div className="grid grid-cols-2 gap-4">
                                    <input
                                      type="month"
                                      placeholder="Start Date"
                                      value={edu.startDate}
                                      onChange={e => updateEducation(edu.id, { startDate: e.target.value })}
                                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                                    />

                                    <input
                                      type="month"
                                      placeholder="End Date"
                                      value={edu.endDate}
                                      onChange={e => updateEducation(edu.id, { endDate: e.target.value })}
                                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                                    />
                                  </div>
                                </div>
                              ))}

                              <button
                                onClick={addEducation}
                                className="w-full px-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl text-gray-600 dark:text-gray-400 hover:border-blue-600 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center justify-center gap-2"
                              >
                                <Plus className="w-4 h-4" />
                                Add Education
                              </button>
                            </div>
                          )}

                          {/* Skills */}
                          {section.id === 'skills' && (
                            <div className="space-y-6">
                              {skillCategories.map((category) => (
                                <div key={category.id} className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl space-y-4">
                                  <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-2 flex-1">
                                      <div className="text-gray-400">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                        </svg>
                                      </div>
                                      <input
                                        type="text"
                                        placeholder="Category"
                                        value={category.category}
                                        onChange={e => updateSkillCategory(category.id, e.target.value)}
                                        className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm font-medium"
                                      />
                                    </div>
                                    <button
                                      onClick={() => removeSkillCategory(category.id)}
                                      className="text-gray-400 hover:text-red-600 transition-colors"
                                    >
                                      <EyeOff className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => removeSkillCategory(category.id)}
                                      className="text-red-600 hover:text-red-700 transition-colors"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>

                                  <div className="flex gap-2">
                                    <input
                                      type="text"
                                      placeholder="Skills"
                                      value={newSkillInputs[category.id] || ''}
                                      onChange={e => handleSkillInputChange(category.id, e.target.value)}
                                      onKeyPress={e => handleSkillInputKeyPress(category.id, e)}
                                      className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                                    />
                                    <button
                                      onClick={() => addSkillToCategory(category.id)}
                                      className="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
                                    >
                                      Add
                                    </button>
                                  </div>

                                  {/* Skills Tags */}
                                  {category.skills.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                      {category.skills.map((skill, skillIndex) => (
                                        <span
                                          key={skillIndex}
                                          className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg text-sm"
                                        >
                                          {skill}
                                          <button
                                            onClick={() => removeSkillFromCategory(category.id, skillIndex)}
                                            className="hover:text-blue-900 dark:hover:text-blue-100 transition-colors"
                                          >
                                            <X className="w-3 h-3" />
                                          </button>
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              ))}

                              <button
                                onClick={addSkillCategory}
                                className="w-full px-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl text-gray-600 dark:text-gray-400 hover:border-blue-600 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center justify-center gap-2"
                              >
                                <Plus className="w-4 h-4" />
                                Add Category
                              </button>
                            </div>
                          )}

                          {/* Projects */}
                          {section.id === 'projects' && (
                            <div className="space-y-6">
                              {resumeData.projects.map((project, index) => (
                                <div key={project.id} className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl space-y-4">
                                  <div className="flex justify-between items-start">
                                    <h4 className="font-semibold text-gray-900 dark:text-white">Project {index + 1}</h4>
                                    <button
                                      onClick={() => removeProject(project.id)}
                                      className="text-red-600 hover:text-red-700 transition-colors"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>

                                  <input
                                    type="text"
                                    placeholder="Project Name"
                                    value={project.name}
                                    onChange={e => updateProject(project.id, { name: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                                  />

                                  <textarea
                                    placeholder="Description"
                                    value={project.description}
                                    onChange={e => updateProject(project.id, { description: e.target.value })}
                                    rows={3}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                                  />

                                  <input
                                    type="text"
                                    placeholder="Technologies"
                                    value={project.technologies}
                                    onChange={e => updateProject(project.id, { technologies: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                                  />
                                </div>
                              ))}

                              <button
                                onClick={addProject}
                                className="w-full px-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl text-gray-600 dark:text-gray-400 hover:border-blue-600 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center justify-center gap-2"
                              >
                                <Plus className="w-4 h-4" />
                                Add Project
                              </button>
                            </div>
                          )}

                          {/* Custom Section */}
                          {section.id === 'custom' && (
                            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                              <p>Add custom sections to personalize your resume</p>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>

          {/* Right Panel - Preview */}
          <div className="lg:sticky lg:top-24 h-[calc(100vh-120px)]">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 h-full flex flex-col">
              {/* Preview Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Template: Modern Professional
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setZoomLevel(Math.max(50, zoomLevel - 10))}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <ZoomOut className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  </button>
                  <span className="text-sm text-gray-600 dark:text-gray-400 min-w-[60px] text-center">
                    {zoomLevel}%
                  </span>
                  <button
                    onClick={() => setZoomLevel(Math.min(150, zoomLevel + 10))}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <ZoomIn className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  </button>
                </div>
              </div>

              {/* Preview Content */}
              <div className="flex-1 overflow-auto p-4 bg-gray-100 dark:bg-gray-900">
                <div 
                  className="mx-auto bg-white shadow-2xl transition-transform duration-200"
                  style={{ 
                    transform: `scale(${zoomLevel / 100})`,
                    transformOrigin: 'top center',
                    width: '210mm',
                    minHeight: '297mm',
                    padding: '20mm'
                  }}
                >
                  <ResumePreview />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
