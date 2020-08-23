import React from 'react';
import PropTypes from 'prop-types';
import Social from './Social';
const About = ({ avatar, name, profession, bio, address, social }) => {
  return (
    <div>
      <div className="bio">
        <div className="avatar">
          <img src={avatar} alt={name} />
        </div>
        <div className="title">
          <h1>{name}</h1>
          <h2>{profession}</h2>
        </div>
        <div className="desc new-line">
          <p>{bio}</p>
        </div>
        <div className="address">
          <p>{address}</p>
        </div>
        <Social social={social} />
      </div>
    </div>
  );
};

About.propTypes = {
  avatar: PropTypes.string,
  name: PropTypes.string,
  profession: PropTypes.string,
  bio: PropTypes.string,
  address: PropTypes.string,
  social: PropTypes.array,
};

export default About;
