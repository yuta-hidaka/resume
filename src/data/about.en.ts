"use client";

export const data = {
  family_name: "Hidaka",
  given_name: "Yuta",
  profession: "Full Stack Developer / Tech Lead",
  bio: `After graduating from high school, I worked for six years in product development at a comprehensive chemical manufacturer. While working, I attended university in Tokyo six days a week to study organic chemistry and earned a bachelor's degree. In October 2018, I transitioned to a career as a programmer. After working for two years at an SES company, I became a freelancer, worked at a contract development company, and at a startup, and I am currently working at Monstarlab.`,
  address: "Shinjuku, Tokyo",
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
      "jobTitle": "Tech Lead",
      "company": "Monstarlab",
      "startDate": "2024-04-01",
      "endDate": "",
      "projects": {
        "tags": ["Golang", "NextJS", "GCP"],
        "job": "Contract Development",
        "jobDescription":
          "Developed a service that allows users to exchange points for stock rights as part of the Furusato Tax Donation system. Designed for high traffic, handling over 1000 RPS at peak access.",
        "experience": [""],
        "team": 30
      }
    },
    {
      jobTitle: "Tech Lead",
      company: "Monstarlab",
      startDate: "2024-04-01",
      endDate: "",
      projects: {
        tags: ["Golang", "Astro", "AWS", "Terraform", "MySQL", "SST", "CMS"],
        job: "Contract Development",
        jobDescription:
          "As a tech lead, I managed a team of three developers and three QAs. Proposed a system migration from one costing around 250,000 yen per month to a system costing around 10,000 yen per month using Lambda and CloudFront. Also improved and reduced the initially estimated monthly cost of 1.5 million yen from pre-sales by optimizing the system, including operational costs. To avoid dependency on specific individuals, introduced IaC and avoided manual migration tasks, writing everything in Golang. For the frontend, considering SEO and display speed, architected using Astro JS in an ISR-like configuration. Typically, team members are assigned single roles like FE engineer, BE engineer, and infrastructure engineer, but I was assigned to the project as a full-stack engineer because of my experience handling everything.",
        experience: [""],
        team: 7,
      },
    },
    {
      jobTitle: "Full-Stack Engineer",
      company: "Monstarlab",
      startDate: "2022-09-01",
      endDate: "2023-10-30",
      projects: {
        tags: ["Golang", "Vue3", "Nuxt3", "MySQL", "AWS", "HubSpot"],
        job: "Contract Development",
        jobDescription:
          "Worked on updating a corporate website. Collaborated with an overseas team and handled backend, frontend, and infrastructure as a full-stack engineer. Coordinated development with a team in Bangladesh, working asynchronously across time zones and holding meetings and specifications explanations as needed.",
        experience: [""],
        team: 20,
      },
    },
    {
      jobTitle: "Full-Stack Engineer",
      company: "KiteRa",
      startDate: "2021-05-01",
      endDate: "2022-07-31",
      projects: {
        tags: ["Golang", "Svelte", "PostgreSQL", "AWS"],
        job: "Regulation Management SaaS Development",
        jobDescription:
          "Developed the backend in Golang and communicated with the frontend via JSON-RPC. A fast-paced development environment. Led the implementation of Japan's first electronic application system for the 36 Agreement via e-Gov.",
        experience: [""],
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
          "Python(Custom FW)",
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
          "Responsible for adding new features, fixing bugs, providing APIs, and defining items using NoSQL. Also handled document creation and debugging environment setup.",
        experience: ["Handling NoSQL", "Large team development", "AWS"],
        team: 20,
      },
    },
    {
      jobTitle: "Scraping for Summary Sites",
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
        job: "Data Scraping for Summary Sites",
        jobDescription:
          "Implemented scraping with BeautifulSoup4 in two weeks. Introduced parallel processing with Celery and ThredPoolExecutor, and distributed processing on 20 EC2 instances.",
        experience: [
          "Load balancing through parallel processing",
          "Scraping",
          "DB performance tuning",
          "AWS environment setup",
          "Docker development",
          "Memory management",
        ],
        team: 2,
      },
    },
    {
      jobTitle: "Time and Billing Management System for Law Firms 2",
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
      jobTitle: "Time and Billing Management System for Law Firms 1",
      company: "SysNavi",
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
          "Requirement definition, mock-up, DB design, PDF output feature implementation, rental server environment investigation, and deployment.",
        experience: ["DB design", "Mock-up creation", "Docker development"],
        team: 4,
      },
    },
    {
      jobTitle: "Automation of Business Processes with RPA",
      company: "SysNavi",
      startDate: "2019-10-01",
      endDate: "2019-12-31",
      projects: {
        tags: ["WinActor", "PHP", "MicrosoftAccess"],
        job: "RPA Development",
        jobDescription:
          "Automated back-office operations with NTT Advanced Technology's RPA software. Planned the framework for RPA creation and management.",
        experience: ["WinActor RPA creation", "Planning for end-user RPA"],
        team: 3,
      },
    },
    {
      jobTitle: "Creation of Web Application for Visualizing Experimental Data",
      company: "SysNavi",
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
        job: "Development of Web Application for Visualizing Experimental Data",
        jobDescription:
          "Formatted Excel data into JSON and registered it in the REST-API using Django Rest Framework. Visualized data with plotly.js.",
        experience: [
          "Development experience with Django's MVT model",
          "Front-end development with TypeScript",
        ],
        team: 4,
      },
    },
    {
      jobTitle: "Data Migration and Batch Processing Development",
      company: "SysNavi",
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
          "Loaded various data sources with Alteryx and integrated them into SQL Server. Implemented parallel processing, data anonymization, and batch processing.",
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
      jobTitle:
        "Web Application Development - Budget Management Software Creation",
      company: "SysNavi",
      startDate: "2018-12-01",
      endDate: "2019-02-28",
      projects: {
        tags: ["ASP.NET C#", "SQL Server", "Bootstrap4", "HTML", "JavaScript"],
        job: "Project for Visualizing Plans and Actuals",
        jobDescription:
          "Combined markup data with ASP.Net logic. Responsible for user interface, admin interface, and backend logic.",
        experience: [
          "Experience with both frontend and backend",
          "MVC model, LINQ, external API integration",
        ],
        team: 3,
      },
    },
    {
      jobTitle: "Import and Sale of Raw Ham",
      company: "Independent Business Owner",
      startDate: "2018-04-01",
      endDate: "2018-09-30",
      projects: {
        tags: ["Import", "Food Sanitation Law"],
        job: "Import and Sale of Raw Ham",
        jobDescription:
          "Aimed to import and sell raw ham from Spain, conducting supplier negotiations, farm visits, bacterial inspections, and customs clearance procedures. Acquired a food sanitation manager qualification. The project was suspended during fundraising.",
      },
    },
    {
      jobTitle: "Research and Development/RD-2016",
      company: "Sumitomo Chemical",
      startDate: "2016-11-01",
      endDate: "2018-03-31",
      projects: {
        tags: ["Polypropylene", "Medical Grade"],
        job: "Development of Medical Grade Polypropylene Materials",
        jobDescription:
          "Development of medical-grade polypropylene materials. Focused on suppressing injection molding distortion and developing materials to prevent contamination from UV exposure.",
      },
    },
    {
      jobTitle: "Research and Development/RD-2015",
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
      jobTitle: "Research and Development Support/RD-support",
      company: "Sumitomo Chemical",
      startDate: "2012-04-01",
      endDate: "2015-05-31",
      projects: {
        tags: ["Polypropylene", "Film"],
        job: "Material Development Support for Packaging Materials",
        jobDescription:
          "Assisted in the research and development of polypropylene films at Sumitomo Chemical's petrochemical research institute. Supported the development of packaging materials and battery separators.",
      },
    },
  ],
  selfProject: [
    {
      title: "BikeHub",
      desc: `A successor app to バイク燃費.com. It allows users to register fuel efficiency and display bike news. The backend API was created using Django (DRF), and the frontend was built with React Native Expo.`,
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
      desc: `Link to Apple Store`,
      link: "https://apps.apple.com/jp/app/bike-hub/id1531692067",
      tags: [],
    },
    {
      title: "BikeHub(Android)",
      desc: `Link to Google Play Store`,
      link: "https://play.google.com/store/apps/details?id=app.bikehub",
      tags: [],
    },
    {
      title: "バイク燃費.com(Service Ended)",
      desc: `A website to register and record bike fuel efficiency. Developed using Java, JSP/Servlet, and scraped data with BeautifulSoup4.`,
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
      title: "SAVE EAT(Service Ended)",
      desc: `A support site for restaurants during the COVID-19 pandemic. Created in one week and deployed using Docker-compose.`,
      link: "https://save-eat.me",
      tags: ["Python(Django)", "BeautifulSoup4", "GitHub", "CentOS8", "nginx"],
    },
    {
      title: "Voice Transcription Site (Service Ended)",
      desc: `A transcription site using JavaScript API.`,
      link: "https://voice-to-text.web-tool.tokyo/",
      tags: ["JavaScript", "Bootstrap4", "CentOS8"],
    },
    {
      title: "docker-compose for Django with Gunicorn",
      desc: `A template for the fastest setup of a Django project. An Nginx-Unit version is also under development.`,
      link: "https://github.com/yuta-hidaka/Docker-Django-MariaDB-Gunicorn",
      tags: ["docker-compose", "django"],
    },
    {
      title: "docker-compose for Django with nginx-unit",
      desc: `A template for the fastest setup of a Django project.`,
      link: "https://github.com/yuta-hidaka/Docker-Django-MariaDB-NginxUnit",
      tags: ["docker-compose", "django", "nginx-unit"],
    },
  ],
  education: [
    {
      degree: "Department of Chemistry, Second Division",
      institution: "Tokyo University of Science",
      startDate: "2014-04-01",
      endDate: "2018-03-01",
      description: `Attended university to advance my career while working at Sumitomo Chemical. Attended classes six days a week while working at Sumitomo Chemical, studying organic chemistry and earning a bachelor's degree.`,
    },
  ],
  motivation: [
    {
      title: "Thoughts on Programming",
      desc: `Through programming, I want to eliminate waste and pain in work and increase time for family, friends, and hobbies. I want to improve the quality of life in Japan with unique services. For example, when I was working at KiteRa, we released Japan's first electronic application feature for the 36 Agreement, and I received positive feedback from labor consultants using this SaaS, saying that it saved a lot of time and allowed them to focus more on customer-facing work.`,
    },
    {
      title: "Curiosity and Inquisitiveness",
      desc: `I do not resist or hold prejudices against new things or technologies and always embrace change. I watch GitHub repositories I am interested in, learn new technologies, and keep up with new technologies from Twitter, Udemy, etc. I don't just chase new things; I also value the basics and learn foundational concepts from books.`,
    },
    {
      title: "Future Career",
      desc: `I want to be involved in work that solves social issues through programming (IT). I would be happy to be involved in services that are close to the customers. When I worked at Monstarlab or KiteRa, the happiest moments were when customers told us that their work had been significantly simplified after automation.`,
    },
  ],
  job: {
    title: "Assisting from consulting to development",
    desc: `Software Engineer`,
  },
  skills: {
    LanguageSkills: [
      {
        name: "Japanese",
        description: "Native",
        year: -1,
      },
      {
        name: "English",
        description: "Conversational",
        year: -1,
      },
    ],
    ProgrammingSkills: [
      {
        name: "Golang",
        description: "Ent, sqlc, gin, JSON-RPC",
        year: 4,
      },
      {
        name: "AWS",
        description: "Lambda, CloudFront, DynamoDB",
        year: 4,
      },
      {
        name: "Pulumi",
        description: "IaC",
        year: 1,
      },
      {
        name: "Linux",
        description: "Ubuntu18,20 CentOS8",
        year: 5,
      },
      {
        name: "Docker",
        description: "",
        year: 4,
      },
      {
        name: "Terraform",
        description: "AWS",
        year: 1,
      },
      {
        name: "MySQL",
        description: "",
        year: 5,
      },
      {
        name: "PostggreSQL",
        description: "",
        year: 4,
      },
      {
        name: "MongoDB",
        description: "",
        year: 1,
      },
      {
        name: "DynamoDB",
        description: "",
        year: 1,
      },
      {
        name: "JavaScript / TypeScript",
        description: "",
        year: 4,
      },
      {
        name: "Astro",
        description: "",
        year: 1,
      },
      {
        name: "Svelte",
        description: "",
        year: 2,
      },
      {
        name: "React",
        description: "",
        year: 2,
      },
      {
        name: "SolidJS",
        description: "",
        year: 1,
      },
      {
        name: "Python",
        description: "Django, DRF, BeautifulSoup4, Mecab, Selenium",
        year: 4,
      },
      {
        name: "PHP",
        description: "CakePHP, Laravel",
        year: 1,
      },
      {
        name: "NextJS",
        description: "",
        year: 2,
      },
    ],
  },
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
