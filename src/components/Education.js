import React from 'react';

const Education = (props) => {
  const myEducation = (
    <div>
      {props.education.map((edu) => (
        <div className="item" key={edu.degree}>
          <h4>
            #{edu.institution} | {edu.degree}
          </h4>
            <small>
              |{edu.startDate} - {edu.endDate}
            </small>
          <p className="new-line">{edu.description}</p>
        </div>
      ))}
    </div>
  );
  return (
    <div className="title">
      <i className="fa fa-graduation-cap"></i>
      <h2>EDUCATION</h2>
      {myEducation}
    </div>
  );
};

export default Education;
