import React from 'react';

const Experience = (props) => {
  const myExperience = (
    <div>
      {props.experience.map((exp) => (
        <div className="item" key={exp.jobTitle}>
          <i className="fas fa-project-diagram"></i>
          <h4>{exp.jobTitle}</h4>
          <h5>
            {'@'}
            {exp.company}
          </h5>
          <small>
            | {exp.startDate} - {exp.endDate}
          </small>
          <div>
            {exp.tags.map((t, id) => {
              return (
                <span key={t} className="badge badge-pill badge-secondary mr-2">
                  {t}
                </span>
              );
            })}
          </div>
          {exp.jobDescriptions.map((jd, id) => {
            return (
              <dl key={jd.title + id}>
                <dt>{jd.title}</dt>
                <dd className="new-line">{jd.jd}</dd>
              </dl>
            );
          })}
        </div>
      ))}
    </div>
  );
  return (
    <div className="title">
      <i className="fa fa-briefcase"></i>
      <h2>EXPERIENCE</h2>
      {myExperience}
    </div>
  );
};

export default Experience;
