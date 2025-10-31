import { useResume } from '../contexts/ResumeContext';

export function ResumePreview() {
  const { resumeData } = useResume();

  const formatDate = (date: string) => {
    if (!date) return '';
    const [year, month] = date.split('-');
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${monthNames[parseInt(month) - 1]} ${year}`;
  };

  return (
    <div className="bg-white text-black" style={{ fontFamily: 'Arial, sans-serif', fontSize: '11px', lineHeight: '1.4' }}>
      {/* Header */}
      <div className="mb-3 text-center">
        <h1 className="font-bold mb-1" style={{ fontSize: '16px' }}>
          {resumeData.personalInfo.fullName || 'Your Name'}
        </h1>
        {resumeData.personalInfo.jobTitle && (
          <div className="text-xs mb-2" style={{ fontSize: '11px' }}>
            {resumeData.personalInfo.jobTitle}
          </div>
        )}
        <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 text-xs" style={{ fontSize: '9px' }}>
          {resumeData.personalInfo.email && (
            <div>
              <span className="text-blue-600">{resumeData.personalInfo.email}</span>
            </div>
          )}
          {resumeData.personalInfo.phone && (
            <div>
              {resumeData.personalInfo.phone}
            </div>
          )}
          {resumeData.personalInfo.location && (
            <div>
              {resumeData.personalInfo.location}
            </div>
          )}
          {resumeData.personalInfo.linkedin && (
            <div>
              <a href={resumeData.personalInfo.linkedin} className="text-blue-600 underline">
                {resumeData.personalInfo.linkedin.replace('https://', '').replace('http://', '').replace('www.', '')}
              </a>
            </div>
          )}
          {resumeData.personalInfo.portfolio && (
            <div>
              <a href={resumeData.personalInfo.portfolio} className="text-blue-600 underline">
                {resumeData.personalInfo.portfolio.replace('https://', '').replace('http://', '').replace('www.', '')}
              </a>
            </div>
          )}
          {resumeData.personalInfo.customLinks && resumeData.personalInfo.customLinks.map(link => (
            link.platform && link.url && (
              <div key={link.id}>
                <a href={link.url} className="text-blue-600 underline">
                  {link.platform}
                </a>
              </div>
            )
          ))}
        </div>
      </div>

      {/* Professional Summary */}
      {resumeData.summary && (
        <div className="mb-3">
          <h2 className="font-bold mb-1 pb-0.5 border-b border-black" style={{ fontSize: '12px' }}>
            Professional Summary
          </h2>
          <p className="mt-1 text-justify" style={{ fontSize: '10px' }}>
            {resumeData.summary}
          </p>
        </div>
      )}

      {/* Education */}
      {resumeData.education.length > 0 && (
        <div className="mb-3">
          <h2 className="font-bold mb-1 pb-0.5 border-b border-black" style={{ fontSize: '12px' }}>
            Education
          </h2>
          <div className="space-y-2 mt-1">
            {resumeData.education.map(edu => (
              <div key={edu.id}>
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-bold" style={{ fontSize: '11px' }}>{edu.institution || 'Institution Name'}</div>
                    <div style={{ fontSize: '10px' }}>
                      {edu.degree && edu.field && `${edu.degree} in ${edu.field}`}
                      {edu.degree && !edu.field && edu.degree}
                      {!edu.degree && edu.field && edu.field}
                    </div>
                    {edu.gpa && (
                      <div style={{ fontSize: '10px' }}>
                        {edu.institution.includes('Board') ? 'Board of Intermediate Education' : 'GPA'} - Percentage: {edu.gpa}
                      </div>
                    )}
                  </div>
                  <div className="text-right" style={{ fontSize: '10px' }}>
                    {edu.startDate && edu.endDate && (
                      <div>{formatDate(edu.startDate)} - {formatDate(edu.endDate)}</div>
                    )}
                    {edu.location && <div>{edu.location}</div>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Work Experience */}
      {resumeData.experience.length > 0 && (
        <div className="mb-3">
          <h2 className="font-bold mb-1 pb-0.5 border-b border-black" style={{ fontSize: '12px' }}>
            Work Experience
          </h2>
          <div className="space-y-2 mt-1">
            {resumeData.experience.map(exp => (
              <div key={exp.id}>
                <div className="flex justify-between items-start">
                  <div className="font-bold" style={{ fontSize: '11px' }}>
                    {exp.company || 'Company Name'}
                    {exp.location && `, ${exp.location}`}
                  </div>
                  <div style={{ fontSize: '10px' }}>
                    {exp.startDate && (formatDate(exp.startDate))} - {exp.current ? 'Present' : (exp.endDate && formatDate(exp.endDate))}
                  </div>
                </div>
                <div className="italic mb-1" style={{ fontSize: '10px' }}>
                  {exp.position || 'Position Title'}
                </div>
                {exp.description && (
                  <ul className="list-disc ml-4 space-y-0.5" style={{ fontSize: '10px' }}>
                    {exp.description.split('\n').filter(line => line.trim()).map((line, idx) => (
                      <li key={idx}>{line.trim()}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Projects */}
      {resumeData.projects.length > 0 && (
        <div className="mb-3">
          <h2 className="font-bold mb-1 pb-0.5 border-b border-black" style={{ fontSize: '12px' }}>
            Projects
          </h2>
          <div className="space-y-2 mt-1">
            {resumeData.projects.map(proj => (
              <div key={proj.id}>
                <div className="flex items-start gap-1">
                  <span className="font-bold" style={{ fontSize: '11px' }}>
                    {proj.name || 'Project Name'}
                  </span>
                  {proj.role && (
                    <span style={{ fontSize: '10px' }}>
                      | {proj.role}
                    </span>
                  )}
                  {proj.link && (
                    <span style={{ fontSize: '10px' }}>
                      {' '}- <a href={proj.link} className="text-blue-600 underline">(Live Demo)</a>
                    </span>
                  )}
                </div>
                {proj.technologies && (
                  <div className="italic mt-0.5" style={{ fontSize: '10px' }}>
                    <span className="font-semibold">Technologies: </span>
                    {proj.technologies}
                  </div>
                )}
                {proj.description && (
                  <ul className="list-disc ml-4 space-y-0.5 mt-0.5" style={{ fontSize: '10px' }}>
                    {proj.description.split('\n').filter(line => line.trim()).map((line, idx) => (
                      <li key={idx}>{line.trim()}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills */}
      {(resumeData.skills.length > 0 || 
        (resumeData.skillCategories && resumeData.skillCategories.length > 0) ||
        (resumeData.skillsV2 && (
          (resumeData.skillsV2.technical && resumeData.skillsV2.technical.length > 0) ||
          (resumeData.skillsV2.soft && resumeData.skillsV2.soft.length > 0) ||
          (resumeData.skillsV2.languages && resumeData.skillsV2.languages.length > 0)
        ))
      ) && (
        <div className="mb-3">
          <h2 className="font-bold mb-1 pb-0.5 border-b border-black" style={{ fontSize: '12px' }}>
            Skills
          </h2>
          <div className="mt-1 space-y-1">
            {/* Display skillCategories (dynamic categories) if available */}
            {resumeData.skillCategories && resumeData.skillCategories.length > 0 ? (
              <>
                {resumeData.skillCategories.map(category => (
                  category.skills.length > 0 && (
                    <div key={category.id} style={{ fontSize: '10px' }}>
                      <span className="font-semibold">{category.category}: </span>
                      {category.skills.map(skill => skill.name).join(', ')}
                    </div>
                  )
                ))}
              </>
            ) : resumeData.skillsV2 ? (
              /* Fallback to skillsV2 (categorized) if available */
              <>
                {resumeData.skillsV2.technical && resumeData.skillsV2.technical.length > 0 && (
                  <div style={{ fontSize: '10px' }}>
                    <span className="font-semibold">Technical: </span>
                    {resumeData.skillsV2.technical.map(skill => skill.name).join(', ')}
                  </div>
                )}
                {resumeData.skillsV2.soft && resumeData.skillsV2.soft.length > 0 && (
                  <div style={{ fontSize: '10px' }}>
                    <span className="font-semibold">Soft Skills: </span>
                    {resumeData.skillsV2.soft.map(skill => skill.name).join(', ')}
                  </div>
                )}
                {resumeData.skillsV2.languages && resumeData.skillsV2.languages.length > 0 && (
                  <div style={{ fontSize: '10px' }}>
                    <span className="font-semibold">Languages: </span>
                    {resumeData.skillsV2.languages.map(skill => skill.name).join(', ')}
                  </div>
                )}
              </>
            ) : (
              /* Final fallback to old skills array */
              resumeData.skills.length > 0 && (
                <div style={{ fontSize: '10px' }}>
                  {resumeData.skills.join(', ')}
                </div>
              )
            )}
          </div>
        </div>
      )}

      {/* Custom Sections */}
      {resumeData.customSections && resumeData.customSections.length > 0 && (
        <>
          {resumeData.customSections.map(customSection => (
            customSection.items.length > 0 && (
              <div key={customSection.id} className="mb-3">
                <h2 className="font-bold mb-1 pb-0.5 border-b border-black" style={{ fontSize: '12px' }}>
                  {customSection.title}
                </h2>
                <div className="space-y-2 mt-1">
                  {customSection.items.map(item => (
                    <div key={item.id}>
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-bold" style={{ fontSize: '11px' }}>
                            {item.title}
                          </div>
                          {item.subtitle && (
                            <div className="italic" style={{ fontSize: '10px' }}>
                              {item.subtitle}
                            </div>
                          )}
                        </div>
                        {item.date && (
                          <div style={{ fontSize: '10px' }}>
                            {item.date}
                          </div>
                        )}
                      </div>
                      {item.description && (
                        <div className="mt-0.5" style={{ fontSize: '10px' }}>
                          {item.description.split('\n').filter(line => line.trim()).map((line, idx) => (
                            <div key={idx}>{line.trim()}</div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )
          ))}
        </>
      )}
    </div>
  );
}
