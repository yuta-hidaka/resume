import React from 'react';

const Experience = (props) => {
  const myExperience = (
    <div>
      {props.experience.map((exp) => (
        <div className="item" key={exp.jobTitle}>
          <h4>
            -{exp.jobTitle} #{exp.company}{' '}
            <small>
              | {exp.startDate} - {exp.endDate}
            </small>
          </h4>
          <div>
            {exp.tags.map((t, id) => {
              return (
                <span
                  key={id}
                  className="badge badge-pill badge-secondary mr-2"
                >
                  {t}
                </span>
              );
            })}
          </div>
          {exp.jobDescriptions.map((jd, id) => {
            return (
              <dl key={id}>
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
