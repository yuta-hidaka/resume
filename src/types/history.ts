"use client";

export interface Data {
  family_name: string;
  given_name: string;
  profession: string;
  bio: string;
  address: string;
  social?: Social[] | null;
  experience?: Experience[] | null;
  selfProject?: SelfProject[] | null;
  education?: Education[] | null;
  motivation?: MotivationOrJob[] | null;
  job: MotivationOrJob;
  skills?: string[] | null;
}
export interface Social {
  name: string;
  url: string;
}
export interface Experience {
  jobTitle: string;
  company: string;
  startDate: string;
  endDate: string;
  projects: Projects;
}
export interface Projects {
  tags?: string[] | null;
  job: string;
  jobDescription: string;
  experience?: string[] | null;
  team?: number | null;
}
export interface SelfProject {
  title: string;
  desc: string;
  link: string;
  tags?: (string | null)[] | null;
}
export interface Education {
  degree: string;
  institution: string;
  startDate: string;
  endDate: string;
  description: string;
}
export interface MotivationOrJob {
  title: string;
  desc: string;
}
