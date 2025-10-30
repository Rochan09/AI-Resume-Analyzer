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
      <div className="mb-3">
        <h1 className="text-xl font-bold mb-1" style={{ fontSize: '18px' }}>
          {resumeData.personalInfo.fullName || 'Your Name'}
        </h1>
        <div className="text-xs mb-1" style={{ fontSize: '10px' }}>
          {resumeData.summary || 'Aspiring Job Title'}
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs" style={{ fontSize: '9px' }}>
          {resumeData.personalInfo.linkedin && (
            <div>
              <span className="font-semibold">LinkedIn:</span>{' '}
              <a href={resumeData.personalInfo.linkedin} className="text-blue-600 underline">
                {resumeData.personalInfo.linkedin.replace('https://', '').replace('http://', '')}
              </a>
            </div>
          )}
          {resumeData.personalInfo.email && (
            <div>
              <span className="font-semibold">Email:</span>{' '}
              <span className="text-blue-600">{resumeData.personalInfo.email}</span>
            </div>
          )}
          {resumeData.personalInfo.phone && (
            <div>
              <span className="font-semibold">Phone:</span> {resumeData.personalInfo.phone}
            </div>
          )}
          {resumeData.personalInfo.location && (
            <div>
              <span className="font-semibold">Location:</span> {resumeData.personalInfo.location}
            </div>
          )}
          {resumeData.personalInfo.portfolio && (
            <div>
              <span className="font-semibold">GitHub:</span>{' '}
              <a href={resumeData.personalInfo.portfolio} className="text-blue-600 underline">
                {resumeData.personalInfo.portfolio.replace('https://', '').replace('http://', '')}
              </a>
            </div>
          )}
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
      {resumeData.skills.length > 0 && (
        <div className="mb-3">
          <h2 className="font-bold mb-1 pb-0.5 border-b border-black" style={{ fontSize: '12px' }}>
            Skills
          </h2>
          <div className="mt-1 space-y-1">
            <div style={{ fontSize: '10px' }}>
              {resumeData.skills.join(', ')}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
