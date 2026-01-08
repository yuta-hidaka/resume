export interface Data {
  family_name: string;
  given_name: string;
  profession: string;
  bio: string;
  address: string;
  social?: SocialEntity[] | null;
  experience?: ExperienceEntity[] | null;
  selfProject?: SelfProjectEntity[] | null;
  education?: EducationEntity[] | null;
  motivation?: MotivationEntityOrJob[] | null;
  job: MotivationEntityOrJob;
  skills?: {
    LanguageSkills: SkillEntity[];
    ProgrammingSkills: SkillEntity[];
  } | null;
}

export interface SocialEntity {
  name: string;
  url: string;
}

export interface ExperienceEntity {
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

export interface SelfProjectEntity {
  title: string;
  desc: string;
  link: string;
  tags?: (string | null)[] | null;
}

export interface EducationEntity {
  degree: string;
  institution: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface MotivationEntityOrJob {
  title: string;
  desc: string;
}

export interface SkillEntity {
  name: string;
  description: string;
  year: number;
}

