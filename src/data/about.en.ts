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
  profession: "Full Stack Developer / Tech lead",
  bio: `After graduating from high school, I worked in product development at a comprehensive chemical manufacturer for six years. While working, I attended a university in Tokyo six days a week, studying organic chemistry and obtaining a bachelor's degree. In October 2018, I changed my career to a programmer. After working for a SES company for two years, I worked as a freelancer, at a contract development company, and at a startup, and currently I am working at a digital consulting company.`,
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
          "Participated as a tech lead in a CMS migration project. Responsible for architecture decisions, infrastructure setup, CMS selection, and estimation.",
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
          "Updated company website. Collaborated with overseas teams as a full-stack engineer, handling both backend and frontend. Coordinated specifications with clients using agile development.",
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
          "Built backend with Golang, communicating with frontend via JSON-RPC. Led the implementation of Japan's first electronic application system for 36 agreements via e-Gov.",
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
          "Python (Custom FW)",
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
          "Added new features and fixed bugs, provided APIs, defined items using NoSQL. Also responsible for document creation and debugging environment setup.",
        experience: ["Handling NoSQL", "Large team development", "AWS"],
        team: 20,
      },
    },
    {
      jobTitle: "Scraping Summary Sites",
      company: "Fignny",
      startDate: "2020-08-31",
      endDate: "2020-09-30",
      projects: {
        tags: [
          "Python (Django)",
          "AWS Aurora (MySQL5.6)",
          "AWS EC2",
          "AWS S3",
          "docker-compose",
          "BeautifulSoup4",
          "Celery",
          "Redis",
          "Backlog",
        ],
        job: "Scraping Data from Summary Sites",
        jobDescription:
          "Implemented scraping processing with BeautifulSoup4 in two weeks. Introduced parallel processing with Celery and ThredPoolExecutor, distributing processing across 20 EC2 instances.",
        experience: [
          "Load balancing with parallel processing",
          "Scraping",
          "DB performance tuning",
          "Building AWS environments",
          "Docker development",
          "Memory management",
        ],
        team: 2,
      },
    },
    {
      jobTitle: "Law Firm Time and Billing Management System 2",
      company: "Freelance",
      startDate: "2020-07-01",
      endDate: "2020-07-31",
      projects: {
        tags: [
          "PHP (Laravel)",
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
      jobTitle: "Law Firm Time and Billing Management System 1",
      company: "Sysnavi",
      startDate: "2019-06-01",
      endDate: "2020-06-30",
      projects: {
        tags: [
          "PHP (Laravel)",
          "MySQL5.7",
          "FreeBSD",
          "jQuery",
          "docker-compose",
          "GitLab",
          "Redmine",
        ],
        job: "Time and Billing Management System Development",
        jobDescription:
          "Requirements definition, mockups, DB design, PDF output function implementation, rental server environment investigation and deployment.",
        experience: ["DB design", "Mockup creation", "Docker development"],
        team: 4,
      },
    },
    {
      jobTitle: "RPA for Business Processing",
      company: "Sysnavi",
      startDate: "2019-10-01",
      endDate: "2019-12-31",
      projects: {
        tags: ["WinActor", "PHP", "Microsoft Access"],
        job: "RPA Implementation",
        jobDescription:
          "Automated back-office operations with NTT Advanced Technology's RPA software. Planned the mechanism for RPA creation and management.",
        experience: ["Creating RPA with WinActor", "Planning RPA for end-users"],
        team: 3,
      },
    },
    {
      jobTitle: "Web Application Development - Experimental Data Visualization",
      company: "Sysnavi",
      startDate: "2019-06-01",
      endDate: "2019-08-31",
      projects: {
        tags: [
          "Python (Django)",
          "DRF",
          "MySQL5.7",
          "TypeScript",
          "HTML",
          "GitHub",
        ],
        job: "Experimental Data Visualization Web Application Development",
        jobDescription:
          "Formatted Excel data to JSON and registered it with REST-API using Django Rest Framework. Visualized data with plotly.js.",
        experience: [
          "Development with Django MVT model",
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
          "Batch Scripts",
          "Python (Django)",
          "Jira",
        ],
        job: "Data Migration and Analysis",
        jobDescription:
          "Loaded various data sources with Alteryx and integrated them into SQL Server. Implemented parallel processing, data masking, and batch processing.",
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
      jobTitle: "Web App Development - Budget and Actual Management Software",
      company: "Sysnavi",
      startDate: "2018-12-01",
      endDate: "2019-02-28",
      projects: {
        tags: ["ASP.NET C#", "SQL Server", "Bootstrap4", "HTML", "JavaScript"],
        job: "Project for Visualizing Plans and Actual Results",
        jobDescription:
          "Combined markup data with ASP.Net logic. Responsible for user and admin screens, backend logic.",
        experience: [
          "Experience with both frontend and backend",
          "MVC model, LINQ, integration with external APIs",
        ],
        team: 3,
      },
    },
    {
      jobTitle: "Import and Sales of Raw Ham",
      company: "Self-employed",
      startDate: "2018-04-01",
      endDate: "2018-09-30",
      projects: {
        tags: ["Import", "Food Sanitation Law"],
        job: "Import and Sales of Raw Ham",
        jobDescription:
          "Aimed to import and sell Spanish raw ham. Negotiated with suppliers, visited farms, conducted bacterial tests, and completed customs procedures. Acquired food sanitation manager qualification. Halted during funding.",
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
          "Developed medical grade polypropylene materials. Developed materials to prevent contamination under UV irradiation and reduce warping during injection molding.",
      },
    },
    {
      jobTitle: "Research and Development / RD-2015",
      company: "Sumitomo Chemical",
      startDate: "2015-06-01",
      endDate: "2016-10-31",
      projects: {
        tags: ["Polypropylene", "Separator"],
        job: "Development of Battery Separator Materials",
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
        job: "Support for Development of Packaging Materials",
        jobDescription:
          "Supported research and development of polypropylene film at Sumitomo Chemical's Petrochemical Research Institute. Assisted in the development of packaging materials and battery separators.",
      },
    },
  ],
  selfProject: [
    {
      title: "BikeHub",
      desc: `Successor app to bike-nenpi.com. Registers fuel efficiency and displays bike news. Created backend API with Django (DRF) and frontend with React Native Expo.`,
      link: "https://expo.io/@yuta322/bikehub-frontend",
      tags: [
        "Python (Django)",
        "React Native (EXPO)",
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
      title: "BikeHub (Web)",
      desc: `Link to BikeHub`,
      link: "https://www.bikehub.app",
      tags: [],
    },
    {
      title: "BikeHub (iOS)",
      desc: `Link to Apple Store`,
      link: "https://apps.apple.com/jp/app/bike-hub/id1531692067",
      tags: [],
    },
    {
      title: "BikeHub (Android)",
      desc: `Link to Google Play Store`,
      link: "https://play.google.com/store/apps/details?id=app.bikehub",
      tags: [],
    },
    {
      title: "bike-nenpi.com (Service Ended)",
      desc: `Registers and records bike fuel efficiency. Created with Java JSP/Servlet. Used BeautifulSoup4 for scraping.`,
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
      desc: `Support site for restaurants during the COVID-19 pandemic. Created in one week and deployed with Docker-compose.`,
      link: "https://save-eat.me",
      tags: ["Python (Django)", "BeautifulSoup4", "GitHub", "CentOS8", "nginx"],
    },
    {
      title: "Voice-to-Text Site (Service Ended)",
      desc: `Voice-to-text site using JavaScript API.`,
      link: "https://voice-to-text.web-tool.tokyo/",
      tags: ["JavaScript", "Bootstrap4", "CentOS8"],
    },
    {
      title: "docker-compose for Django with Gunicorn",
      desc: `Template for the fastest launch of a Django project. Also creating an Nginx-Unit version.`,
      link: "https://github.com/yuta-hidaka/Docker-Django-MariaDB-Gunicorn",
      tags: ["docker-compose", "django"],
    },
    {
      title: "docker-compose for Django with nginx-unit",
      desc: `Template for the fastest launch of a Django project.`,
      link: "https://github.com/yuta-hidaka/Docker-Django-MariaDB-NginxUnit",
      tags: ["docker-compose", "django", "nginx-unit"],
    },
  ],
  education: [
    {
      degree: "Chemistry, Second Division",
      institution: "Tokyo University of Science",
      startDate: "2014-04-01",
      endDate: "2018-03-01",
      description: `Attended university to advance my career while working at Sumitomo Chemical. Studied organic chemistry and obtained a bachelor's degree while working at Sumitomo Chemical and attending university six days a week.`,
    },
  ],
  motivation: [
    {
      title: "Thoughts on Programming",
      desc: `I want to eliminate unnecessary work and pain through programming, and increase time for family, friends, and hobbies. I want to improve the quality of life with unique services.`,
    },
    {
      title: "Curiosity",
      desc: `I immediately look up things I'm curious about, constantly challenging new things and seeking solutions to problems.`,
    },
    {
      title: "Curiosity",
      desc: `I accept new things and technologies without resistance or prejudice, always embracing change.`,
    },
    {
      title: "Future Career",
      desc: `I want to be involved in work that solves social problems through programming (IT).`,
    },
  ],
  job: {
    title: "From Consulting to Development, I Can Help",
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
