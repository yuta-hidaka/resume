"use client";

export const data = {
  //   avatar: avatar,
  family_name: "Yuta",
  given_name: "Hidaka",
  profession: "Full Stack Developer",
  bio: `After graduating from high school, I started working at a comprehensive chemical manufacturer. I gained six years of experience in research and development support for petrochemical products, and later transitioned to product development. While working at the company, I attended a university in Tokyo six days a week for four years to obtain a bachelor's degree. I focused on studying the fundamentals of chemistry, particularly organic chemistry.
  In October 2018, I made a career change into the programming industry. I worked for a company mainly engaged in systems engineering and support for about 1.8 months. After that, I worked as a freelancer, at a small-scale contract development company, and at a startup in its seed phase. Currently, I am employed at a digital consulting company.`,
  address: "Shinjuku-Waseda Tokyo",
  social: [
    {
      name: "Twitter",
      url: "https://twitter.com/amateur_prog",
    },
    {
      name: "GitHub",
      url: "https://github.com/yuta-hidaka",
    },
    {
      name: "LinkedIn",
      url: "https://www.linkedin.com/in/%E6%82%A0%E5%A4%AA-%E6%97%A5%E9%AB%98-2823a8195/",
    },
  ],
  experience: [
    {
      jobTitle: "FullStack Engineer",
      company: "KiteRa",
      startDate: "2021-05-01",
      endDate: "2022-07-31",
      projects: {
        tags: ["Golang", "Svelte", "PostgreSQL", "AWS"],
        job: "SaaS development for managing regulations",
        jobDescription:
          "The backend is built using Golang and communicates with the frontend through JSON-RPC. We are focused on developing at a fast pace as it is a company in the early stage of growth.",
        experience: [
          "Experience in development environments using the latest languages.",
        ],
        team: 5,
      },
    },
    {
      jobTitle: "FullStack Developper",
      company: "Fignny",
      startDate: "2020-09-01",
      endDate: "2021-04-30",
      projects: {
        tags: [
          "Python (custom framework)",
          "PHP",
          "Angular.js1.2",
          "Vue.js",
          "jQuery",
          "AWS EC2",
          "AWS Lambda",
          "DyanamoDB",
          "MongoDB",
          "MySQL",
          "Jenkins",
          "docker-compose",
        ],
        job: "SES at Fignny, contributing to a company providing CRM services. The frontend is built using multiple frameworks and languages.",
        jobDescription:
          "Responsible for developing CRM services, including adding new features and fixing bugs. Deploying APIs written in Python on Lambda to provide all functionalities through APIs. Implemented using NoSQL to allow customers to freely define columns and add tables, which is a key feature of our CRM. Due to often insufficient documentation, tasks involve creating documentation and setting up a lightweight debugging environment using an editor. Work is performed with consideration for subsequent team members.",
        experience: [
          "Experience with NoSQL databases",
          "Experience in large team development",
          "AWS",
        ],
        team: 20,
      },
    },
    {
      jobTitle: "FullStack Developper",
      company: "Fignny",
      startDate: "2020-08-31",
      endDate: "2020-09-30",
      projects: {
        tags: [
          "Python(Django)",
          "AWS Aurora(mysql5.6)",
          "AWS EC2",
          "AWS S3",
          "docker-compose",
          "beautifulSoup4",
          "celery",
          "redis",
          "backlog",
        ],
        job: "Web scraping for content aggregation website",
        jobDescription:
          "Developed a scraping process using Python's BeautifulSoup4. Despite an initial estimate of 1.5 months, completed the scraping process within 2 weeks and executed it on EC2 instances. Implemented the ability to output scraped articles in Word format based on client requests (using python-docx). Introduced waiting time in the execution speed of each process to handle communication restrictions between the requesting site and AWS. Additionally, image requests resulted in longer response times. Consequently, there were significant waiting periods during the processing, resulting in a longer processing time. However, the server load remained low, with sufficient available resources. To optimize processing time and server resource utilization, implemented background processing and parallelization for the scraping process. Introduced Celery for background processing and utilized Python's built-in ThreadPoolExecutor for parallelization, improving the capacity to execute up to 80 processes simultaneously on a 4 CPU machine (compared to the initial limitation of only 1 process). However, this led to an excessive amount of requests from the same IP, prompting access restrictions from AWS. Therefore, downgraded the EC2 instance to 2 CPUs and created 20 EC2 instances to distribute the processing load and execute the scraping. Acquired over 2 million data entries, including image data, ensuring the ability to reproduce all the retrieved data. Additionally, performed performance tuning on the database, reviewed Django ORM queries, and reduced waiting time for processes other than scraping to handle the large amount of data being processed.",
        experience: [
          "Experience in implementing load distribution through parallel processing",
          "Web scraping experience",
          "DB performance tuning",
          "AWS environment setup",
          "Development using Docker",
        ],
        team: 2,
      },
    },
    {
      jobTitle: "FullStack Developper ",
      company: "フリーランス",
      startDate: "2020-07-01",
      endDate: "2020-07-31",
      projects: {
        tags: [
          "PHP(Laravel)",
          "MySQL5.7",
          "FreeBSD",
          "jQuery",
          "docker-compose",
          "gitLab",
          "backlog",
        ],
        job: "Development of time and billing management system for a law firm (Previous job as an in-house contractor)",
        jobDescription:
          "In phase 2, implemented functionalities that were not achievable within the initial budget and incorporated additional requested features. While the previous phase involved primarily client coordination, in this project, I was responsible for server-side logic development using PHP, as well as coding-centric tasks such as implementing new functionalities.",
        experience: [
          "Experience in development using Laravel, a PHP framework",
        ],
        team: 4,
      },
    },
    {
      jobTitle: "FullStack Developper",
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
          "gitLab",
          "redmine",
        ],
        job: "In-house contract development work",
        jobDescription:
          "In addition to my SES duties, I was responsible for tasks such as creating mockups, designing databases, and setting up infrastructure. From January 2020, I participated in the project full-time, handling implementation, client coordination, issue management, and progress tracking with freelance professionals whom we outsourced development tasks to.",
        experience: [
          "Experience in database design",
          "Creating mockups based on client feedback",
          "Development using Docker",
        ],
        team: 4,
      },
    },
    {
      jobTitle: "Fullstack / RPA Enginner",
      company: "Sysnavi",
      startDate: "2019-10-01",
      endDate: "2019-12-31",
      projects: {
        tags: ["WinActor", "PHP", "MicrosoftAccess"],
        job: "On-site work as an SES, stationed at the client's office. (Note: It was the same on-site location from December 2019 to December 2020). Part of the back-office DX promotion at the same chemical manufacturing company as mentioned before.",
        jobDescription:
          "Engaged in the RPA (Robotic Process Automation) implementation of routine tasks in the back-office that had become person-dependent using RPA software provided by NTT Advanced Technology. Joined as support due to a shortage of human resources. Although it was a back-office role, knowledge of chemical manufacturing logistics was required. Provided advice and assistance to colleagues performing the same tasks based on my experience while working on RPA development. Since it was the early stage of RPA promotion, I also participated in planning and launching initiatives to enable the client to handle RPA creation and management internally. Created a management site for RPA using Microsoft Access and PHP. Proposed frameworks similar to programming for user understanding and suggested modularization and library development for frequently used RPA operations, considering end-user usage in the future.",
        experience: [
          "Knowledge of creating RPA using WinActor",
          "Planning from a user perspective, aiming for RPA frameworks that end-users can understand",
          "Experience transitioning from programming",
        ],
        team: 3,
      },
    },
    {
      jobTitle: "FullStack Developper",
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
          "gitHub",
        ],
        job: "Development of a web application for visualizing experimental data",
        jobDescription:
          " 化学メーカーのDX推進関連プロジェクト\n多くの実験データが、エクセルで管理されており、かつフォーマットがバラバラな状態になっており、主任研究者や作業者が変わると実験データのまとめ方が変わってしまう。\nこのような属人的な状況を改善するために、過去の実験データを含むすべてのデータをウェブアプリ上で管理し、実験の条件や、組成なので検索・参照できるような仕組みを作れるようにするプロジェクト。\ntypescriptで「xlsx.js」を用いてエクセルを取り込む処理を実装し、これらのデータをJSONに整形し、DjangoRestFrameworkを用いてREST-APIにしてデータを登録するようにした。\nデータを集計し、吸光度のデータなどを計算しplotly.jsを用いてグラフとして可視化するようにした。\nプロジェクトそのものが検証段階のため、代表的な実験データを取り込み、グラフで可視化・多様な検索条件を表示できるようにしたが、実験の生データに規則性が無さすぎるためプログラミングの工数がかかるとのことから、DJangoでの開発が中止となった。\n代替手段としてAWSのデータレイクとラムダを用いた手法を検討することとなったが、こちらについては関与せずにプロジェクトを離脱。",
        experience: [
          "MVCモデルのフレームワークではなく、MVTモデルのDjango特有のモデルでのWebアプリの作成経験の習得",
          "全職の経験を生かして、データのまとめ方やグラフの出力、DB設計等をPM等に提言しながらの作業。",
          "TypeScriptを用いた静的型付言語でのフロントエンド開発",
        ],
        team: 4,
      },
    },
    {
      jobTitle: "Fullstack / RPA Enginner",
      company: "Sysnavi",
      startDate: "2019-02-01",
      endDate: "2019-06-30",
      projects: {
        tags: [
          "Alteryx",
          "SQL Server",
          "Windows Server",
          "Batch Script",
          "Python (Django)",
          "Jira",
        ],
        job: "Development of data migration and batch processing",
        jobDescription:
          "Responsible for developing data migration and batch processing solutions. The task involves migrating various types of data owned by the client, such as NotesDB, CSV, and Microsoft Access, into SQL Server using Alteryx. After system setup, the development of a GUI is essential to enable the client to manipulate the data independently, which was achieved through Alteryx development. The process begins with creating data anonymization processes to validate and secure the client's data. Django is utilized internally to manage the roles, descriptions, and data types of numerous tables and columns. With millions of records, parallel processing in Alteryx, data type conversion, and validation implementations were performed when importing data from various sources. Additionally, batch processing was incorporated to regularly import constantly updated data. Furthermore, manual data aggregation tasks such as sales management and KPI calculation were automated by exporting them from the workflow and utilizing Alteryx in combination with SQL. Special attention was given to CSV data, including the creation of regular expressions and mechanisms to avoid issues caused by missing data escape processing. The project was successfully carried out for four months, culminating in the integration of data into SQL Server before departure from the project.",
        experience: [
          "Experience with parallel processing to handle large volumes of data",
          "Knowledge of data acquisition and processing from diverse data sources",
          "Experience in GUI-based data processing and management using Alteryx",
          "Expertise in data manipulation using SQL",
        ],
        team: 5,
      },
    },
    {
      jobTitle: "Fullstack Enginner",
      company: "Sysnavi",
      startDate: "2019-12-01",
      endDate: "2019-02-28",
      projects: {
        tags: ["ASP.NET C#", "SQL Sever", "BootStrap4", "html", "javascript"],
        job: "Development of budget management web application",
        jobDescription:
          "Started by combining the markup data received from the designer with ASP.Net logic. Involved in developing nearly 70% of the user interface screens. Also responsible for creating the administration panel and backend logic for asynchronous communication. Subsequently, conducted testing for one week according to the test specifications to prepare for delivery. Participated in the project with approximately 60% focus on frontend development and 40% on backend development.",
        experience: [
          "Experience in both frontend and backend development due to working in a small team",
          "Backend development experience includes knowledge of app structure using the MVC model, working with Razor syntax, performing database operations using LINQ, and integrating with external APIs",
          "Frontend development experience includes server-side rendering, real-time screen updates using AJAX asynchronous communication with jQuery, and DOM manipulation",
        ],
        team: 3,
      },
    },
    {
      jobTitle: "Importer",
      company: "Sole Proprietor",
      startDate: "2018-04-01",
      endDate: "2018-09-30",
      projects: {
        tags: ["Import", "Food Sanitation Law"],
        job: "Import and sales of cured ham",
        jobDescription:
          "Inspired by my Spanish girlfriend, I aimed to import and sell cured ham from Spain. Conducted negotiations with local suppliers, visited farms, performed bacterial tests for pathogens like Listeria, and tested the import flow for customs clearance. Obtained the qualification of a food hygiene manager and engaged in sales activities, including direct sales. However, the launch was interrupted due to frequent arguments with my girlfriend during the process of raising funds through borrowing from the Japan Finance Corporation.",
      },
    },
    {
      jobTitle: "Research and Development",
      company: "Sumitomo Chemical",
      startDate: "2016-11-01",
      endDate: "2018-03-31",
      projects: {
        tags: ["Polypropylene", "Medical Grade"],
        job: "Development of Medical Grade Polypropylene at a Functional Materials Research Institute",
        jobDescription:
          "Engage in the development of medical grade polypropylene at a functional materials research institute. This involves establishing the composition for polymerization of polypropylene for contact lens applications and developing materials for medical-grade PP bottles.\nDuring the production of contact lenses using polymerized PP, distortion may occur due to cooling conditions. The focus is on developing materials that minimize distortion and enable easy molding under various conditions.\nIn the case of PP bottles used for disinfection with UV irradiation, radical generation within the PP can cause leaching of low-molecular-weight components, leading to container contamination. The aim is to develop materials that suppress such issues by establishing a UV-resistant composition.\nUpon successful establishment of the UV-resistant composition, the project concludes with my departure from the institute.",
      },
    },
    {
      jobTitle: "Research and Development",
      company: "Sumitomo Chemical",
      startDate: "2015-06-01",
      endDate: "2016-10-31",
      projects: {
        tags: ["Polypropylene", "Separator"],
        job: "バッテリーセパレータの材料開発",
        jobDescription:
          "廉価版のバッテリーに使用するPPをベースとしたセパレーターフィルムの材料模索や構造解析など実施。\n耐熱性・Li-ionが結晶化した時の突き刺し強度、微多孔の均一性、空孔率等に焦点を当てて材料開発。\n途中で部署移動のため、基礎調査で終了。\n",
      },
    },
    {
      jobTitle: "Research and Development Assistance",
      company: "Sumitomo Chemical",
      startDate: "2012-04-01",
      endDate: "2015-05-31",
      projects: {
        tags: ["Polypropylene", "Film"],
        job: "Assistance in Packaging Material Development",
        jobDescription:
          "Joined Sumitomo Chemical after high school graduation and was assigned to the Petrochemical Research Laboratory. Assisted in the research and development of polypropylene film at Sumitomo Chemical's Petrochemical Research Laboratory. Conducted experiments to assist in the development of packaging materials and battery separators.",
      },
    },
  ],
  selfProject: [
    {
      title: "BikeHub",
      desc: `A successor version (in the form of an app) of BikeMileage.com. Allows users to register fuel mileage and view bike-related news. Backend API: - Developed using Django (DRF), with periodic batch scraping and RSS to fetch bike-related news articles, and perform morphological analysis for categorization. - Development environment based on docker-compose using nginx-unit. Frontend: - Created using React Native Expo, currently implemented to fetch and display bike news using the API. - Planned implementation of authentication and fuel mileage registration functionality. You can view the app in development by clicking the link below if you have the "Expo" app installed on your smartphone. ・2020-09-23 The app is completed and available on Google Play Store and Apple Store.,`,
      link: "https://expo.io/@yuta322/bikehub-frontend",
      tags: [
        "python(Django)",
        "React Native(EXPO)",
        "DRF",
        "Expo",
        "Beautifulsoup4",
        "Mecab",
        "Morphological Analysis",
        "centos8",
        "nginx",
        "nginx unit",
      ],
    },
    {
      title: "BikeHub(Web)",
      desc: "Link to BikeHub",
      link: "https://bikehub.app",
      tags: [],
    },
    {
      title: "BikeHub(iOS)",
      desc: "Link to Apple Store",
      link: "https://apps.apple.com/jp/app/bike-hub/id1531692067",
      tags: [],
    },
    {
      title: "BikeHub(Android)",
      desc: "Link to Google Play Store",
      link: "https://play.google.com/store/apps/details?id=app.bikehub",
      tags: [],
    },
    {
      title: "バイク燃費.com(Service Ended)",
      desc: `Allows registration and recording of motorcycle fuel efficiency. Developed using only Java, JSP, and Servlets. Motorcycle data was collected by web scraping using BeautifulSoup4.,`,
      link: "https://bike-nenpi.com",
      tags: [
        "JAVA",
        "python",
        "Beautifulsoup4",
        "centos8",
        "Apache2.4",
        "TomCat",
      ],
    },
    {
      title: "SAVE EAT(Service Ended)",
      desc: `Created a restaurant support website to assist struggling restaurants during the COVID-19 pandemic. Developed within one week. Created and deployed using Docker-compose as a Docker container. Received limited usage and no activity since then.,`,
      link: "https://save-eat.me",
      tags: ["python(Django)", "Beautifulsoup4", "GitHub", "centos8", "nginx"],
    },
    {
      title: "Voice-to-Text Website(Service Ended)",
      desc: `Created a web tool for transcription using JavaScript's API to record conversations.,`,
      link: "https://voice-to-text.web-tool.tokyo/",
      tags: ["JavaScript", "BootStrap4", "centos8"],
    },
    {
      title: "docker-compose for Django with Gunicorn",
      desc: `Quickly launches Django projects. Created a docker-compose file shared as a template on GitHub. Also working on an Nginx-Unit version.,`,
      link: "https://github.com/yuta-hidaka/Docker-Django-MariaDB-Gunicorn",
      tags: ["docker-compose", "django"],
    },
    {
      title: "docker-compose for Django with nginx-unit",
      desc: `Quickly launches Django projects. Nginx-Unit version with revisions.,`,
      link: "https://github.com/yuta-hidaka/Docker-Django-MariaDB-NginxUnit",
      tags: ["docker-compose", "django", "Nginx-Unit"],
    },
  ],
  education: [
    {
      degree: "Bachelor of Science in Chemistry",
      institution: "Tokyo University of Science",
      startDate: "2014-04-01",
      endDate: "2018-03-01",
      description: `To enhance my career and acquire a solid foundation in research while working at Sumitomo Chemical, I discussed with my superiors and decided to attend university.
        I worked as a full-time employee at Sumitomo Chemical while studying for four years in the evening to obtain a bachelor's degree, with a focus on organic chemistry.
        I commuted from Chiba (Kisarazu) to Tokyo (Iidabashi) after work, six days a week.
        Typical schedule:
        Work: 7:00-16:00
        Commute: 16:00-18:00
        Classes: 18:00-21:10
        Return home: 21:10-23:30`,
    },
  ],
  motivation: [
    {
      title: "Approach to Programming",
      desc: "Through programming, I aim to eliminate inefficiencies and pains that have existed in my work and in interactions with others. The time saved from eliminating these inefficiencies can be dedicated to spending quality time with family, friends, partners, and pursuing personal hobbies, thus leading a culturally enriched life. I not only strive to eliminate waste but also aim to create unique services that enhance the quality of people's lives in ways that haven't been seen before.",
    },
    {
      title: "Inquisitiveness",
      desc: "Having a background in research and development, I am always curious and eager to seek answers to questions. I approach new things without resistance and embrace challenges, constantly seeking solutions to problems.",
    },
    {
      title: "Curiosity",
      desc: "I maintain an open-minded attitude towards new things and technologies, without harboring resistance or prejudice. I always strive to embrace change.",
    },
    {
      title: "Future Career",
      desc: "I aspire to be involved in tasks that use programming (broadly, IT) to solve social issues.",
    },
  ],
  job: {
    title: "From Consulting to Development, I'm here to assist you",
    desc: "Software Engineer",
  },
  skills: [
    "Python",
    "Golang",
    "Svelte",
    "React",
    "React Native EXPO",
    "Linux",
    "AWS",
    "Docker",
    "NextJS",
  ],
};
