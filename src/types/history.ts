
export interface Data {
    family_name: string;
    given_name: string;
    profession: string;
    bio: string;
    address: string;
    social: Social[];
    experience: Experience[];
    selfProject: SelfProject[];
    education: Education[];
    motivation: Motivation[];
    skills: Skill[];
  }
  
  export interface Education {
    degree: string;
    institution: string;
    startDate: string;
    endDate: string;
    description: string;
  }
  
  export interface Experience {
    jobTitle: string;
    company: string;
    startDate: string;
    endDate: string;
    projects: Projects;
    tags?: string[];
  }
  
  export interface Projects {
    techStack?: string[];
    job: string;
    jobDescription: string;
    experience?: string[];
    team?: number;
  }
  
  export interface Motivation {
    title: string;
    desc: string;
  }
  
  export interface SelfProject {
    title: string;
    desc: string;
    link: string;
    tags: string[];
  }
  
  export interface Skill {
    name: string;
    percentage: Percentage;
  }
  
  export enum Percentage {
    The50 = "50%",
    The70 = "70%",
    The80 = "80%",
  }
  
  export interface Social {
    name: string;
    url: string;
  }
  