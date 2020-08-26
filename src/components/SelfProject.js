import React from 'react';

const SelfProject = (props) => {
  const MySelfProject = (
    <div>
      {props.selfProject.map((exp) => (
        <div className="item" key={exp.title}>
          <h4>-{exp.title}</h4>
          <div>
            {exp.tags.map((t, id) => {
              return (
                <span key={t} className="badge badge-pill badge-secondary mr-2">
                  {t}
                </span>
              );
            })}
          </div>
          <div>
            <dl>
              <dt>説明</dt>
              <dd>{exp.desc}</dd>
            </dl>
          </div>
          <div>
            <dl>
              <dt>
                <span>参考リンク : </span>
                <span>
                  <a href={exp.link}>{exp.title}</a>
                </span>
              </dt>
            </dl>
          </div>
        </div>
      ))}
    </div>
  );
  return (
    <div className="title">
      <i className="fa fa-address-card"></i>
      <h2>Self Project(Hobby)</h2>
      {MySelfProject}
    </div>
  );
};

export default SelfProject;
