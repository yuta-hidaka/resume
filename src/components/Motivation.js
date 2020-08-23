import React from 'react';

const Motivation = (props) => {
  const MyMotivation = (
    <div>
      {props.motivation.map((exp) => (
        <div className="item" key={exp.title}>
          <div>
            <dl>
              <dt>{exp.title}</dt>
              <dd className="new-line">{exp.desc}</dd>
            </dl>
          </div>
        </div>
      ))}
    </div>
  );
  return (
    <div className="title">
      <i className="fas fa-car-battery"></i>
      <h2>Motivation</h2>
      {MyMotivation}
    </div>
  );
};

export default Motivation;
