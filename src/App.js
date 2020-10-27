import React, { Component } from 'react';
import About from './components/About';
import Experience from './components/Experience';
import SelfProject from './components/SelfProject';
import Education from './components/Education';
import Motivation from './components/Motivation';
import Skills from './components/Skills';
import particlesOptions from './assets/particle.json';
import Particles from 'react-tsparticles';
import {person} from './assets/data'

class App extends Component {
  render() {
    return (
      <header>
        <div className="wrapper">
          <div className="sidebar">
            <Particles options={particlesOptions} />
            <About
              avatar={person.avatar}
              name={person.name}
              profession={person.profession}
              bio={person.bio}
              address={person.address}
              social={person.social}
            />
          </div>

          <div className="content-wrapper">
            <div className="content">
              <Experience experience={person.experience} />
              <SelfProject selfProject={person.selfProject} />
              <Education education={person.education} />
              <Motivation motivation={person.motivation} />
              <Skills skills={person.skills} />
            </div>
          </div>
        </div>
      </header>
    );
  }
}

export default App;
