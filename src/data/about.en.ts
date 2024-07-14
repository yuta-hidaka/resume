"use client";

import { data as dataEN } from "./about.en";

export const getData = (locale: string | undefined): Data => {
  if (locale === "ja") {
    return data;
  }
  return dataEN;
};

export const data = {
  family_name: "Hidaka",
  given_name: "Yuta",
  profession: "Full Stack Developer",
  bio: `After graduating high school, worked in product development at a comprehensive chemical manufacturer for 6 years. While working, attended a university in Tokyo 6 days a week, studying organic chemistry and earning a bachelor's degree. Changed careers to a programmer in October 2018. After working for an SES company for 2 years, gained experience as a freelancer, at a contract development company, and at a startup, and now works at a digital consulting company.`,
  address: "Shinjuku Tokyo",
  social: [
    { name: "Twitter", url: "https://twitter.com/amateur_prog" },
    { name: "GitHub", url: "https://github.com/yuta-hidaka" },
    {
      name: "LinkedIn",
      url: "https://www.linkedin.com/in/%E6%82%A0%E5%A4%AA-%E6%97%A5%E9%AB%98-2823a8195/",
    },
  ],
  experience: [
    {
      jobTitle: "Tech Lead",
      company: "Monstarlab",
      startDate: "2022-04-01",
      endDate: "",
      projects: {
        tags: ["Golang", "Astro", "AWS", "Terraform", "MySQL", "SST", "CMS"],
        job: "Contract Development",
        jobDescription:
          "Participated as a tech lead in a CMS migration project. Architecture decision, infrastructure construction, CMS selection, estimation. Headless CMS migration.",
        experience: [""],
        team: 5,
      },
    },
    {
      jobTitle: "FullStack Engineer",
      company: "Monstarlab",
      startDate: "2022-09-01",
      endDate: "2023-10-30",
      projects: {
        tags: ["Golang", "Vue3", "Nuxt3", "MySQL", "AWS", "HubSpot"],
        job: "Contract Development",
        jobDescription:
          "Corporate website update. Worked as a full-stack engineer handling both backend and frontend in cooperation with overseas teams. Adjusted specifications with customers in agile development.",
        experience: [""],
        team: 20,
      },
    },
    {
      jobTitle: "FullStack Engineer",
      company: "KiteRa",
      startDate: "2021-05-01",
      endDate: "2022-07-31",
      projects: {
        tags: ["Golang", "Svelte", "PostgreSQL", "AWS"],
        job: "Regulation Management SaaS Development",
        jobDescription:
          "Built backend with Golang, communicating with the frontend via JSON-RPC. Fast-paced development. Responsible for electronic application for the 36 Agreement, e-Gov linkage, etc.",
        experience: ["Development environment using the latest languages"],
        team: 5,
      },
    },
    {
      jobTitle: "CRM Software Development",
      company: "Fignny",
      startDate: "2020-09-01",
      endDate: "2021-04-30",
      projects: {
        tags: [
          "Python(独自FW)",
          "PHP",
          "Angular.js1.2",
          "Vue.js",
          "jQuery",
          "AWS EC2",
          "AWS Lambda",
          "DynamoDB",
          "MongoDB",
          "MySQL",
          "Jenkins",
          "docker-compose",
        ],
        job: "CRM Service Development",
        jobDescription:
          "Added new features and fixed bugs, provided APIs, and defined items using NoSQL. Also responsible for documentation and debugging environment construction.",
        experience: ["Handling NoSQL", "Team development with large numbers", "AWS"],
        team: 20,
      },
    },
    {
      jobTitle: "Scraping Summary Site",
      company: "Fignny",
      startDate: "2020-08-31",
      endDate: "2020-09-30",
      projects: {
        tags: [
          "Python(Django)",
          "AWS Aurora(MySQL5.6)",
          "AWS EC2",
          "AWS S3",
          "docker-compose",
          "BeautifulSoup4",
          "Celery",
          "Redis",
          "Backlog",
        ],
        job: "Data Scraping for Summary Site",
        jobDescription:
          "Implemented scraping process with BeautifulSoup4 in 2 weeks. Introduced parallel processing with Celery and ThreadPoolExecutor, and distributed processing with 20 EC2 instances.",
        experience: [
          "Load balancing with parallel processing",
          "Scraping",
          "DB performance tuning",
          "AWS environment construction",
          "Docker development",
          "Memory management",
        ],
        team: 2,
      },
    },
    {
      jobTitle: "Time and Billing Management System for Law Firm 2",
      company: "Freelancer",
      startDate: "2020-07-01",
      endDate: "2020-07-31",
      projects: {
        tags: [
          "PHP(Laravel)",
          "MySQL5.7",
          "FreeBSD",
          "jQuery",
          "docker-compose",
          "GitLab",
          "Backlog",
        ],
        job: "Time and Billing Management System Development",
        jobDescription: "Added new features and created server-side logic.",
        experience: ["Development experience with Laravel"],
        team: 4,
      },
    },
    {
      jobTitle: "Time and Billing Management System for Law Firm 1",
      company: "Sysnavi",
      startDate: "2019-06-01",
      endDate: "2020-06-30",
      projects: {
        tags: [
          "PHP(Laravel)",
          "MySQL5.7",
          "FreeBSD",
          "jQuery",
          "docker-compose",
          "GitLab",
          "Redmine",
        ],
        job: "Time and Billing Management System Development",
        jobDescription:
          "Requirements definition, mockup creation, DB design, PDF output function implementation, rental server environment investigation and deployment.",
        experience: ["DB design", "Mockup creation", "Docker development"],
        team: 4,
      },
    },
    {
      jobTitle: "RPA of Business Processes",
      company: "Sysnavi",
      startDate: "2019-10-01",
      endDate: "2019-12-31",
      projects: {
        tags: ["WinActor", "PHP", "MicrosoftAccess"],
        job: "RPA",
        jobDescription:
          "Automated back-office tasks with NTT Advanced Technology's RPA software. Planned the creation and management system of RPA.",
        experience: ["RPA creation with WinActor", "RPA planning for end-users"],
        team: 3,
      },
    },
    {
      jobTitle: "Web Application Development - Visualization of Experimental Data",
      company: "Sysnavi",
      startDate: "2019-06-01",
      endDate: "2019-08-31",
      projects: {
        tags: [
          "Python(Django)",
          "DRF",
          "MySQL5.7",
          "TypeScript",
          "HTML",
          "GitHub",
        ],
        job: "Experimental Data Visualization Web Application Development",
        jobDescription:
          "Formatted Excel data into JSON and registered with REST-API using Django Rest Framework. Visualized data with plotly.js.",
        experience: [
          "Development experience with Django's MVT model",
          "Frontend development with TypeScript",
        ],
        team: 4,
      },
    },
    {
      jobTitle: "Data Migration and Batch Processing Development",
      company: "Sysnavi",
      startDate: "2019-02-01",
      endDate: "2019-06-30",
      projects: {
        tags: [
          "Alteryx",
          "SQL Server",
          "Windows Server",
          "Batch Script",
          "Python(Django)",
          "Jira",
        ],
        job: "Data Migration and Analysis",
        jobDescription:
          "Loaded diverse data sources with Alteryx and integrated them into SQL Server. Implemented parallel processing, data anonymization, and batch processing.",
        experience: [
          "Parallel processing",
          "Data acquisition and processing",
          "Data management with GUI-based Alteryx",
          "SQL data processing",
        ],
        team: 5,
      },
    },
    {
      jobTitle: "Web Application Development - Forecast Management Software Creation",
      company: "Sysnavi",
      startDate: "2018-12-01",
      endDate: "2019-02-28",
      projects: {
        tags: ["ASP.NET C#", "SQL Server", "Bootstrap4", "HTML", "JavaScript"],
        job: "Forecast and Actual Management Project",
        jobDescription:
          "Combined markup data and ASP.Net logic. Responsible for user interface and admin interface, backend logic.",
        experience: [
          "Experience in both frontend and backend",
          "MVC model, LINQ, external API integration",
        ],
        team: 3,
      },
    },
    {
      jobTitle: "Ham Import and Sales",
      company: "Sole Proprietor",
      startDate: "2018-04-01",
      endDate: "2018-09-30",
      projects: {
        tags: ["Import", "Food Sanitation Law"],
        job: "Ham Import and Sales",
        jobDescription:
          "Aimed to import and sell Spanish ham. Negotiated with suppliers, visited farms, conducted bacterial tests, and handled customs clearance. Obtained food sanitation supervisor qualification. Interrupted during fundraising.",
      },
    },
    {
      jobTitle: "Research and Development / RD-2016",
      company: "Sumitomo Chemical",
      startDate: "2016-11-01",
      endDate: "2018-03-31",
      projects: {
        tags: ["Polypropylene", "Medical Grade"],
        job: "Development of Medical Grade Polypropylene Materials",
        jobDescription:
          "Developed medical grade polypropylene materials. Developed materials to suppress warping during injection molding and prevent contamination from UV irradiation.",
      },
    },
    {
      jobTitle: "Research and Development / RD-2015",
      company: "Sumitomo Chemical",
      startDate: "2015-06-01",
      endDate: "2016-10-31",
      projects: {
        tags: ["Polypropylene", "Separator"],
        job: "Battery Separator Material Development",
        jobDescription:
          "Explored PP-based separator film materials. Focused on heat resistance, puncture strength, and porosity.",
      },
    },
    {
      jobTitle: "Research and Development Support / RD-support",
      company: "Sumitomo Chemical",
      startDate: "2012-04-01",
      endDate: "2015-05-31",
      projects: {
        tags: ["Polypropylene", "Film"],
        job: "Packaging Material Development Support",
        jobDescription:
          "Assisted in research and development of polypropylene film at Sumitomo Chemical's petrochemical research institute. Supported the development of packaging materials and battery separators.",
      },
    },
  ],
  selfProject: [
    {
      title: "BikeHub",
      desc: `Successor app to BikeFuel.com. Allows fuel registration and displays bike news. Backend API created with Django (DRF), frontend created with ReactNative Expo.`,
      link: "https://expo.io/@yuta322/bikehub-frontend",
      tags: [
        "Python(Django)",
        "React Native(EXPO)",
        "DRF",
        "Expo",
        "BeautifulSoup4",
        "Mecab",
        "Morphological Analysis",
        "CentOS8",
        "nginx",
        "nginx unit",
      ],
    },
    {
      title: "BikeHub(Web)",
      desc: `Link to BikeHub`,
      link: "https://www.bikehub.app",
      tags: [],
    },
    {
      title: "BikeHub(iOS)",
      desc: `Apple Store link`,
      link: "https://apps.apple.com/jp/app/bike-hub/id1531692067",
      tags: [],
    },
    {
      title: "BikeHub(Android)",
      desc: `Google Play Store link`,
      link: "https://play.google.com/store/apps/details?id=app.bikehub",
      tags: [],
    },
    {
      title: "BikeFuel.com (Service Ended)",
      desc: `Allows registration and recording of bike fuel consumption. Created with Java and JSP/Servlet. Scraping with BeautifulSoup4.`,
      link: "https://bike-nenpi.com",
      tags: [
        "Java",
        "Python",
        "BeautifulSoup4",
        "CentOS8",
        "Apache2.4",
        "Tomcat",
      ],
    },
    {
      title: "SAVE EAT (Service Ended)",
      desc: `Support site for restaurants during the COVID-19 pandemic. Created in 1 week and deployed with Docker-compose.`,
      link: "https://save-eat.me",
      tags: ["Python(Django)", "BeautifulSoup4", "GitHub", "CentOS8", "nginx"],
    },
    {
      title: "Voice Transcription Site (Service Ended)",
      desc: `Voice transcription site using JavaScript API.`,
      link: "https://voice-to-text.web-tool.tokyo/",
      tags: ["JavaScript", "Bootstrap4", "CentOS8"],
    },
    {
      title: "docker-compose for Django with Gunicorn",
      desc: `Template for the fastest setup of Django projects. Also creating an Nginx-Unit version.`,
      link: "https://github.com/yuta-hidaka/Docker-Django-MariaDB-Gunicorn",
      tags: ["docker-compose", "django"],
    },
    {
      title: "docker-compose for Django with nginx-unit",
      desc: `Template for the fastest setup of Django projects.`,
      link: "https://github.com/yuta-hidaka/Docker-Django-MariaDB-NginxUnit",
      tags: ["docker-compose", "django", "nginx-unit"],
    },
  ],
  education: [
    {
      degree: "Department of Chemistry, Evening Division",
      institution: "Tokyo University of Science",
      startDate: "2014-04-01",
      endDate: "2018-03-01",
      description: `Attended university to advance career while working at Sumitomo Chemical. Attended classes 6 days a week, studying organic chemistry and earning a bachelor's degree.`,
    },
  ],
  motivation: [
    {
      title: "Thoughts on Programming",
      desc: `Through programming, I want to eliminate waste and pain in work, and increase time for family, friends, and hobbies. I want to improve quality of life with unique services.`,
    },
    {
      title: "Curiosity",
      desc: `I investigate questions immediately, always challenge new things, and seek solutions to problems.`,
    },
    {
      title: "Curiosity",
      desc: `I accept new things and technologies without resistance or prejudice, always embracing change.`,
    },
    {
      title: "Future Career",
      desc: `I want to engage in work that solves social problems through programming (IT).`,
    },
  ],
  job: {
    title: "Consultant to Developer Assistance",
    desc: `Software Engineer`,
  },
  skills: [
    "Golang",
    "Astro",
    "Terraform",
    "Python",
    "Svelte",
    "React",
    "React Native EXPO",
    "Linux",
    "AWS",
    "Docker",
    "NextJS",
  ],
};

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
  skills?: string[] | null;
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
