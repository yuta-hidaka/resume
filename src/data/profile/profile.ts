import type { Profile } from './types';
import { validateProfile } from './validate';

// ————————————————————————————————————————————————————————————————
// THE single source of truth for all résumé content.
//
// Every surface derives from this file:
//   - site pages (index / about / career)  → derive.ts → getData()
//   - /ask grounding facts                 → derive.ts → getData()
//   - 職務経歴書 / 履歴書 / CV / text resume → (Phase 1-3 templates)
//
// Facts (dates, numbers, tags) are stored once, language-neutral.
// Prose is either a plain string (same in both languages) or {ja, en}.
// validateProfile() runs on import and fails the build on inconsistent
// data (non-chronological timeline, project outside company period, …).
// ————————————————————————————————————————————————————————————————

export const profile: Profile = {
  person: {
    familyName: { ja: "日髙", en: "Hidaka" },
    givenName: { ja: "悠太", en: "Yuta" },
    furigana: "ひだか ゆうた",
    birthDate: "1994-03-22",
    gender: "男",
    profession: "Full Stack Developer / Tech Lead",
    bio: {
      ja: `Go・TypeScriptを軸としたバックエンド/フルスタックエンジニア。高トラフィックシステムの設計・運用（数千RPS）、AWS/GCPでのクラウドインフラ構築、Kafka・Sparkを用いたイベント駆動アーキテクチャを得意とする。テックリードとしてベトナム16名のチームマネジメント、新規チーム立ち上げ、サーバーレス最適化によるインフラコスト30%削減など技術とビジネスの両面で貢献。化学メーカーでの研究開発を経て2018年にエンジニアへ転身、現在はSUPER STUDIOにてバックエンドエンジニアとして従事。`,
      en: `Backend/Full-stack engineer specializing in Go and TypeScript. Experienced in designing and operating high-traffic systems (thousands of RPS), building cloud infrastructure on AWS/GCP, and implementing event-driven architectures with Kafka and Spark. As a tech lead, managed a 16-member overseas team, launched a new cross-functional team, and reduced infrastructure costs by 30% through serverless optimization — contributing on both technical and business fronts. Transitioned to software engineering in 2018 after six years of R&D at a chemical manufacturer; currently working as a backend engineer at SUPER STUDIO.`,
    },
    address: { ja: "東京・渋谷", en: "Shibuya, Tokyo" },
    photo: "/docs/履歴書/images/image1.jpg",
  },
  social: [
    { name: "Twitter", url: "https://twitter.com/amateur_prog" },
    { name: "GitHub", url: "https://github.com/yuta-hidaka" },
    {
      name: "LinkedIn",
      url: "https://www.linkedin.com/in/%E6%82%A0%E5%A4%AA-%E6%97%A5%E9%AB%98-2823a8195/",
    },
  ],
  // Employment timeline — the 履歴書's 職歴 rows derive from here.
  // Chronological, non-overlapping; leaveDate null = 現在に至る.
  companies: [
    {
      id: "sumitomo-chemical",
      name: { ja: "住友化学", en: "Sumitomo Chemical" },
      legalName: "住友化学株式会社",
      kind: "employment",
      joinDate: "2012-04-01",
      leaveDate: "2018-03-31",
    },
    {
      id: "self-employed",
      name: { ja: "個人事業主", en: "Independent Business Owner" },
      legalName: "個人事業主",
      kind: "self-employed",
      joinDate: "2018-04-01",
      leaveDate: "2018-09-30",
    },
    {
      id: "sysnavi",
      name: { ja: "シスナビ", en: "SysNavi" },
      legalName: "株式会社シスナビ",
      kind: "employment",
      joinDate: "2018-10-01",
      leaveDate: "2020-06-30",
    },
    {
      id: "freelance",
      name: { ja: "フリーランス", en: "Freelancer" },
      legalName: "フリーランス",
      kind: "freelance",
      joinDate: "2020-07-01",
      leaveDate: "2020-07-31",
    },
    {
      id: "fignny",
      name: "Fignny",
      legalName: "Fignny株式会社",
      kind: "employment",
      joinDate: "2020-08-01",
      leaveDate: "2021-04-30",
    },
    {
      id: "kitera",
      name: "KiteRa",
      legalName: "株式会社KiteRa",
      kind: "employment",
      joinDate: "2021-05-01",
      leaveDate: "2022-07-31",
    },
    {
      id: "monstarlab",
      name: "Monstarlab",
      legalName: "Monstarlab株式会社",
      kind: "employment",
      joinDate: "2022-09-01",
      leaveDate: "2025-06-30",
    },
    {
      id: "super-studio",
      name: "SUPER STUDIO",
      legalName: "株式会社SUPER STUDIO",
      kind: "employment",
      joinDate: "2025-07-01",
      leaveDate: null,
    },
  ],
  // Newest first (site display order).
  projects: [
    {
      companyId: "super-studio",
      jobTitle: "Backend Engineer",
      startDate: "2025-07-01",
      endDate: null,
      tags: [
        "Golang",
        "NextJS",
        "ScyllaDB",
        "k9s",
        "ArgoCD",
        "Kafka",
        "Spark",
        "Trino",
        "Iceberg",
        "Parquet",
        "Scrum",
        "Claude Code",
        {
          ja: "AI活用",
          en: "AI"
        }
      ],
      job: {
        ja: "ビッグデータグループ / バックエンドチーム → xfunctionチーム",
        en: "Big Data Group / Backend Team → xfunction Team"
      },
      jobDescription: {
        ja: "ECプラットフォームのビッグデータグループでバックエンドエンジニアとして従事。当初はバックエンドチームに所属し、その後xfunctionチームへ異動。Golang、NextJS、ScyllaDB、k9s、ArgoCD、Kafka、Sparkを用いてシステムを開発・保守し、スクラムで開発を推進。xfunctionチームの立ち上げに初期メンバーとして中心的な役割を担った。従来はFE・BE間や他部署との連携がチグハグで、直近のPJでは6月リリース予定が10月にずれ込むなど、コミュニケーションロスによる遅延が発生していた。新チームの創設にあたり心理的安全性を重視し、ドラッカー風エクササイズ、メンバー間の積極的なコミュニケーション、PdM・ステークホルダーとの期待値のすり合わせを実施。その結果、チーム設立5ヶ月で意図しないPJ遅延を0にした。デザイナーや他部署・他チームと積極的に連携し、xfunction内のリードとして活動。データ基盤にはIceberg（保存形式Parquet）を採用し、分析クエリはTrinoで実行。AIを駆使してコードを精査し、Spark SQLのデータ取り込み処理に`CREATE OR REPLACE TABLE`構文を導入することで、処理速度・コストを30%改善。さらにAI活用を推進し、Claude CodeのAgents（サブエージェント）とハーネスを最適化。タスクの性質に応じてOpus・Sonnet・Haikuを使い分けるサブエージェント構成を設計・導入し、トークン使用料を50%削減。",
        en: "Backend engineer in the Big Data Group for an e-commerce platform, initially on the backend team and later on the xfunction team. Developed and maintained systems with Golang, NextJS, ScyllaDB, k9s, ArgoCD, Kafka, and Spark in a Scrum environment. Played a central role as a founding member of the xfunction team. Previously, communication between the FE and BE teams and coordination with other departments was fragmented, causing significant delays — for example, a project scheduled for a June release slipped to October. For the new team, prioritized psychological safety through Drucker-style exercises, proactive communication among members, and expectation alignment with PdM and stakeholders, eliminating unintended project delays to zero within five months of the team's launch. Worked closely with designers and across departments and teams as a lead within the xfunction team. Built the data platform on Iceberg (Parquet storage) with Trino as the analytics query engine; leveraged AI to scrutinize the code and introduced Spark SQL's `CREATE OR REPLACE TABLE` syntax in the ingestion pipeline, improving processing speed and cost by 30%. Drove AI adoption by optimizing Claude Code's Agents (subagents) and harness — designed and rolled out a subagent setup that routes tasks to Opus, Sonnet, or Haiku by workload, cutting token usage cost by 50%."
      },
      experienceBullets: [
        {
          ja: "ビッグデータインフラ",
          en: "Big data infrastructure"
        },
        {
          ja: "Kafkaによるイベント駆動アーキテクチャ",
          en: "Event-driven architecture with Kafka"
        },
        {
          ja: "Kubernetesオーケストレーション",
          en: "Kubernetes orchestration"
        },
        {
          ja: "ArgoCDによるCI/CD",
          en: "CI/CD with ArgoCD"
        },
        {
          ja: "スクラム開発",
          en: "Scrum development"
        },
        {
          ja: "Spark最適化（CREATE OR REPLACE TABLE導入で処理速度・コスト30%改善）",
          en: "Spark optimization (CREATE OR REPLACE TABLE: 30% faster and cheaper processing)"
        },
        {
          ja: "AI活用推進（Claude Code Agents・ハーネス最適化）",
          en: "AI adoption (Claude Code Agents & harness optimization)"
        },
        {
          ja: "Opus・Sonnet・Haikuの使い分けによるサブエージェント設計",
          en: "Model routing subagents (Opus / Sonnet / Haiku by workload)"
        },
        {
          ja: "トークン使用料50%削減",
          en: "50% token cost reduction"
        },
        {
          ja: "チーム立ち上げ（初期メンバー・中心的役割）",
          en: "Team launch (founding member, central role)"
        },
        {
          ja: "コミュニケーションロスによる遅延の解消",
          en: "Elimination of communication-driven delays"
        },
        {
          ja: "スクラムイベント運営",
          en: "Scrum event facilitation"
        },
        {
          ja: "心理的安全性向上施策",
          en: "Psychological safety initiatives"
        },
        {
          ja: "ドラッカー風エクササイズ",
          en: "Drucker-style exercises"
        },
        {
          ja: "PdM・ステークホルダーとの期待値調整",
          en: "PdM/stakeholder expectation alignment"
        },
        {
          ja: "リモートナレッジシェア",
          en: "Remote knowledge sharing"
        },
        {
          ja: "クロスファンクショナルコミュニケーション",
          en: "Cross-functional communication"
        },
        {
          ja: "リーダーシップ",
          en: "Leadership"
        }
      ],
      team: 0
    },
    {
      companyId: "monstarlab",
      jobTitle: "Tech Lead",
      startDate: "2025-01-01",
      endDate: "2025-06-30",
      tags: [
        "Golang",
        "AWS",
        "Serverless",
        "Lambda",
        "CloudFront",
        "Data Analytics",
        "Devin",
        "Terraform",
        "IaC",
        "Redis",
        "RDS",
        "PayloadCMS",
        "SSTv3",
        "NextJS",
        "REST API",
        "Microservices",
        "Athena",
        "Glue",
        "Quick Suite",
        "Parquet"
      ],
      job: {
        ja: "受託開発",
        en: "Contract Development"
      },
      jobDescription: {
        ja: "沖縄のテーマパーク事業のアプリ開発とバックエンド、インフラ、Web開発をリード。ベトナムチーム16名をマネジメントし、ベトナム現地でのコラボレーション（出張・滞在）を通じて英語でのコミュニケーションを実施。プロジェクト参加後2週間でIaCを用いたWebインフラ構築・リリースを実現。既存技術スタックのキャッチアップ、DNS設定、dev/stg環境構築、リリース・モニタリング実施し、瞬間1500RPSのアクセスに対応。PayloadCMS、SSTv3、NextJSでREST APIを実装。マイクロサービス指向の構成で、サービス毎に分離を行いトラフィックのスパイクなどを分散させる構成で、アプリバックエンドはオリジン到達で3000RPSのトラフィックの処理を担当。データ分析基盤をParquet形式で実装、Athena/Lambda/Glue/Quick Suite（AWS）を活用し、IaCとAIを駆使して構築。短期間でNativeアプリケーション開発、バックエンド構築、管理画面実装を実現。イラストマップの実装も行い、画像を座標と合わせて分割し、座標に合わせる方法を実現。短納期という制約の中、テックリードとして技術アドバイスだけでなく、ビジネス面にも入り込み積極的に顧客とコミュニケーションを取った。当初要件から大きく要望が増えた際、人員の増強の代わりにAIを導入することを顧客にも提案し、それが社内で初めてのAI導入（Devin）となった。インフラコストを30%削減（AWSサーバーレスアーキテクチャ、AWSと相談してSavingsPlan活用、RedisによるRDSやLambda起動時間の削減など）。インフラもIaCで記述することで、AIフレンドリーな環境をあらかじめ構築。",
        en: "Led development of an app and backend infrastructure for an Okinawa theme park business. Managed a team of 16 Vietnamese developers through English communication, including onsite collaboration in Vietnam (business trip and stay). Delivered IaC-based web infrastructure setup and release within 2 weeks of joining the project. Caught up with existing tech stack, configured DNS, built dev/stg environments, implemented release and monitoring to handle peak traffic of 1500 RPS. Implemented using PayloadCMS, SSTv3, and NextJS with REST API architecture. Designed a microservices-oriented architecture with service separation to distribute traffic spikes, with app backend handling 3000 RPS at origin. Built data analytics platform with Parquet format using Athena, Lambda, Glue, and Quick Suite (AWS), leveraging IaC and AI. Rapidly delivered native app development, backend construction, and admin panel implementation. Implemented an illustrated map feature that splits images and aligns them with coordinates. Faced tight deadlines and, as a tech lead, actively engaged with customers not only on technical aspects but also on business matters, providing proactive communication. When requirements expanded significantly beyond the initial scope, proposed AI integration to the customer as an alternative to team expansion, which became the company's first AI integration initiative using Devin. Reduced infrastructure costs by 30% through AWS serverless architecture, Savings Plans consultation with AWS, and Redis implementation to reduce RDS and Lambda cold start times. Built infrastructure as code (IaC) to create an AI-friendly environment from the start."
      },
      experienceBullets: [
        {
          ja: "高トラフィックシステムアーキテクチャ",
          en: "High-traffic system architecture"
        },
        {
          ja: "マイクロサービスアーキテクチャ",
          en: "Microservices architecture"
        },
        {
          ja: "データ分析基盤構築（Parquet/Athena/Glue/Quick Suite）",
          en: "Data analytics platform (Parquet/Athena/Glue/Quick Suite)"
        },
        {
          ja: "サーバーレスによるコスト最適化（30%削減）",
          en: "Cost optimization with serverless (30% reduction)"
        },
        {
          ja: "AI導入リーダーシップ",
          en: "AI integration leadership"
        },
        {
          ja: "IaCによるAIフレンドリーなインフラ構築",
          en: "IaC for AI-friendly infrastructure"
        },
        {
          ja: "AWS SavingsPlan最適化",
          en: "AWS Savings Plans optimization"
        },
        {
          ja: "Redisによるパフォーマンス最適化",
          en: "Redis for performance optimization"
        },
        {
          ja: "顧客対応型テックリーダーシップ",
          en: "Customer-facing technical leadership"
        },
        {
          ja: "画像処理と座標マッピング",
          en: "Image processing and coordinate mapping"
        },
        {
          ja: "2週間でのインフラ構築・リリース",
          en: "2-week infrastructure setup and release"
        },
        {
          ja: "ベトナム現地コラボレーション",
          en: "Onsite Vietnam collaboration"
        },
        {
          ja: "英語でのチームマネジメント",
          en: "English team management"
        },
        {
          ja: "短期間でのフルスタック開発",
          en: "Rapid full-stack development"
        }
      ],
      team: 16
    },
    {
      companyId: "monstarlab",
      jobTitle: "Tech Lead",
      startDate: "2024-04-01",
      endDate: "2024-12-31",
      tags: [
        "Golang",
        "NextJS",
        "GCP"
      ],
      job: {
        ja: "受託開発",
        en: "Contract Development"
      },
      jobDescription: {
        ja: "ふるさと納税のポイントを株式に交換できる権利を付与するサービスの開発。最大1000RPSを超えるアクセスを想定し、高トラフィック前提で設計・開発。",
        en: "Developed a service that allows users to exchange points for stock rights as part of the Furusato Tax Donation system. Designed for high traffic, handling over 1000 RPS at peak access."
      },
      experienceBullets: [
        ""
      ],
      team: 30
    },
    {
      companyId: "monstarlab",
      jobTitle: "Tech Lead",
      startDate: "2024-04-01",
      endDate: "2024-11-15",
      tags: [
        "Golang",
        "Astro",
        "AWS",
        "Terraform",
        "MySQL",
        "SST",
        "CMS"
      ],
      job: {
        ja: "受託開発",
        en: "Contract Development"
      },
      jobDescription: {
        ja: "開発3名・QA3名のチームでテックリードを担当。月額25万円ほどのインフラ費用がかかっていたシステムを、LambdaとCloudFrontを用いた月額1万円規模のシステムへ移行する提案を実施。プリセールス時点で月額150万円と見積もられていた運用費用も含め、大幅なコスト圧縮を実現。属人化を避けるため移行作業から手作業を排し、IaCの導入とともにすべてGolangで記述。フロントエンドはSEOと表示速度を考慮し、Astro JSでISRライクな構成を設計。通常はFE・BE・インフラと単一役割でアサインされるところ、全工程を担えるフルスタックエンジニアとしての経験を評価され本PJにアサインされた。",
        en: "As a tech lead, managed a team of three developers and three QAs. Proposed migrating a system costing around 250,000 yen per month to one costing around 10,000 yen per month using Lambda and CloudFront. Also reduced the monthly operating cost — initially estimated at 1.5 million yen in pre-sales — through system optimization. To avoid dependency on specific individuals, introduced IaC and eliminated manual migration by writing everything in Golang. For the frontend, architected an ISR-like configuration with Astro JS to address SEO and display speed. While teams are typically staffed with single-role FE, BE, and infrastructure engineers, was assigned to the project as a full-stack engineer capable of handling the entire scope."
      },
      experienceBullets: [
        ""
      ],
      team: 7
    },
    {
      companyId: "monstarlab",
      jobTitle: "Full-Stack Engineer",
      startDate: "2022-09-01",
      endDate: "2023-10-30",
      tags: [
        "Golang",
        "Vue3",
        "Nuxt3",
        "MySQL",
        "AWS",
        "HubSpot"
      ],
      job: {
        ja: "受託開発",
        en: "Contract Development"
      },
      jobDescription: {
        ja: "企業サイトの更新。海外チームと協働し、フルスタックエンジニアとしてバックエンド・フロントエンド・インフラを担当。バングラデシュチームと時差のある中で非同期に開発を進め、必要に応じてミーティングや仕様説明を実施。",
        en: "Worked on updating a corporate website. Collaborated with an overseas team and handled backend, frontend, and infrastructure as a full-stack engineer. Coordinated development with a team in Bangladesh, working asynchronously across time zones and holding meetings and specifications explanations as needed."
      },
      experienceBullets: [
        ""
      ],
      team: 20
    },
    {
      companyId: "kitera",
      jobTitle: "Full-Stack Engineer",
      startDate: "2021-05-01",
      endDate: "2022-07-31",
      tags: [
        "Golang",
        "Svelte",
        "PostgreSQL",
        "AWS"
      ],
      job: {
        ja: "規程管理SaaS開発",
        en: "Regulation Management SaaS Development"
      },
      jobDescription: {
        ja: "Golangでバックエンドを構築し、JSON-RPCでフロントエンドと通信。スピード感のある開発。日本初のe-Govを経由した36協定の電子申請システムの実装、リード",
        en: "Developed the backend in Golang and communicated with the frontend via JSON-RPC. A fast-paced development environment. Led the implementation of Japan's first electronic application system for the 36 Agreement via e-Gov."
      },
      experienceBullets: [
        {
          ja: "最新の言語を用いた開発環境",
          en: ""
        }
      ],
      team: 5
    },
    {
      companyId: "fignny",
      jobTitle: {
        ja: "CRMソフト開発",
        en: "CRM Software Development"
      },
      startDate: "2020-09-01",
      endDate: "2021-04-30",
      tags: [
        {
          ja: "Python(独自FW)",
          en: "Python(Custom FW)"
        },
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
        "docker-compose"
      ],
      job: {
        ja: "CRMサービス開発",
        en: "CRM Service Development"
      },
      jobDescription: {
        ja: "新機能追加やバグ修正、API提供、NoSQLによる項目定義。ドキュメント作成とデバッグ環境構築も担当。",
        en: "Responsible for adding new features, fixing bugs, providing APIs, and defining items using NoSQL. Also handled document creation and debugging environment setup."
      },
      experienceBullets: [
        {
          ja: "NoSQLの取り扱い",
          en: "Handling NoSQL"
        },
        {
          ja: "大人数でのチーム開発",
          en: "Large team development"
        },
        "AWS"
      ],
      team: 20
    },
    {
      companyId: "fignny",
      jobTitle: {
        ja: "まとめサイトのスクレイピング",
        en: "Scraping for Summary Sites"
      },
      startDate: "2020-08-31",
      endDate: "2020-09-30",
      tags: [
        "Python(Django)",
        "AWS Aurora(MySQL5.6)",
        "AWS EC2",
        "AWS S3",
        "docker-compose",
        "BeautifulSoup4",
        "Celery",
        "Redis",
        "Backlog"
      ],
      job: {
        ja: "まとめサイトのデータスクレイピング",
        en: "Data Scraping for Summary Sites"
      },
      jobDescription: {
        ja: "BeautifulSoup4でスクレイピング処理を2週間で実装。CeleryとThredPoolExecutorで並列処理を導入し、EC2インスタンス20台で分散処理。",
        en: "Implemented scraping with BeautifulSoup4 in two weeks. Introduced parallel processing with Celery and ThredPoolExecutor, and distributed processing on 20 EC2 instances."
      },
      experienceBullets: [
        {
          ja: "並列処理による負荷分散",
          en: "Load balancing through parallel processing"
        },
        {
          ja: "スクレイピング",
          en: "Scraping"
        },
        {
          ja: "DBパフォーマンスチューニング",
          en: "DB performance tuning"
        },
        {
          ja: "AWS環境構築",
          en: "AWS environment setup"
        },
        {
          ja: "Docker開発",
          en: "Docker development"
        },
        {
          ja: "メモリ管理",
          en: "Memory management"
        }
      ],
      team: 2
    },
    {
      companyId: "freelance",
      jobTitle: {
        ja: "弁護士法人の時間・請求管理システム2",
        en: "Time and Billing Management System for Law Firms 2"
      },
      startDate: "2020-07-01",
      endDate: "2020-07-31",
      tags: [
        "PHP(Laravel)",
        "MySQL5.7",
        "FreeBSD",
        "jQuery",
        "docker-compose",
        "GitLab",
        "Backlog"
      ],
      job: {
        ja: "時間・請求管理システム開発",
        en: "Time and Billing Management System Development"
      },
      jobDescription: {
        ja: "新機能追加とサーバーサイドロジックの作成。",
        en: "Added new features and created server-side logic."
      },
      experienceBullets: [
        {
          ja: "Laravelでの開発経験",
          en: "Development experience with Laravel"
        }
      ],
      team: 4
    },
    {
      companyId: "sysnavi",
      jobTitle: {
        ja: "弁護士法人の時間・請求管理システム1",
        en: "Time and Billing Management System for Law Firms 1"
      },
      startDate: "2019-06-01",
      endDate: "2020-06-30",
      tags: [
        "PHP(Laravel)",
        "MySQL5.7",
        "FreeBSD",
        "jQuery",
        "docker-compose",
        "GitLab",
        "Redmine"
      ],
      job: {
        ja: "時間・請求管理システム開発",
        en: "Time and Billing Management System Development"
      },
      jobDescription: {
        ja: "要件定義、モックアップ、DB設計、PDF出力機能の実装、レンタルサーバーの環境調査・デプロイ。",
        en: "Requirement definition, mock-up, DB design, PDF output feature implementation, rental server environment investigation, and deployment."
      },
      experienceBullets: [
        {
          ja: "DB設計",
          en: "DB design"
        },
        {
          ja: "モックアップ作成",
          en: "Mock-up creation"
        },
        {
          ja: "Docker開発",
          en: "Docker development"
        }
      ],
      team: 4
    },
    {
      companyId: "sysnavi",
      jobTitle: {
        ja: "業務処理のRPA化",
        en: "Automation of Business Processes with RPA"
      },
      startDate: "2019-10-01",
      endDate: "2019-12-31",
      tags: [
        "WinActor",
        "PHP",
        "MicrosoftAccess"
      ],
      job: {
        ja: "RPA化",
        en: "RPA Development"
      },
      jobDescription: {
        ja: "NTTアドバンステクノロジのRPAソフトでバックオフィス業務を自動化。RPA作成・管理の仕組み作りを企画。",
        en: "Automated back-office operations with NTT Advanced Technology's RPA software. Planned the framework for RPA creation and management."
      },
      experienceBullets: [
        {
          ja: "WinActorのRPA作成",
          en: "WinActor RPA creation"
        },
        {
          ja: "エンドユーザー向けRPA企画",
          en: "Planning for end-user RPA"
        }
      ],
      team: 3
    },
    {
      companyId: "sysnavi",
      jobTitle: {
        ja: "実験データの可視化Webアプリの作成",
        en: "Creation of Web Application for Visualizing Experimental Data"
      },
      startDate: "2019-06-01",
      endDate: "2019-08-31",
      tags: [
        "Python(Django)",
        "DRF",
        "MySQL5.7",
        "TypeScript",
        "HTML",
        "GitHub"
      ],
      job: {
        ja: "実験データ可視化Webアプリ開発",
        en: "Development of Web Application for Visualizing Experimental Data"
      },
      jobDescription: {
        ja: "エクセルデータをJSONに整形し、Django Rest FrameworkでREST-APIに登録。plotly.jsでデータを可視化。",
        en: "Formatted Excel data into JSON and registered it in the REST-API using Django Rest Framework. Visualized data with plotly.js."
      },
      experienceBullets: [
        {
          ja: "DjangoのMVTモデルでの開発経験",
          en: "Development experience with Django's MVT model"
        },
        {
          ja: "TypeScriptでのフロントエンド開発",
          en: "Front-end development with TypeScript"
        }
      ],
      team: 4
    },
    {
      companyId: "sysnavi",
      jobTitle: {
        ja: "データ移行処理とバッチ処理の開発",
        en: "Data Migration and Batch Processing Development"
      },
      startDate: "2019-02-01",
      endDate: "2019-06-30",
      tags: [
        "Alteryx",
        "SQL Server",
        "Windows Server",
        {
          ja: "バッチスクリプト",
          en: "Batch Script"
        },
        "Python(Django)",
        "Jira"
      ],
      job: {
        ja: "データ移行と分析",
        en: "Data Migration and Analysis"
      },
      jobDescription: {
        ja: "多様なデータソースをAlteryxで読み込み、SQL Serverに統合。並列処理、データ秘匿化、バッチ処理の実装。",
        en: "Loaded various data sources with Alteryx and integrated them into SQL Server. Implemented parallel processing, data anonymization, and batch processing."
      },
      experienceBullets: [
        {
          ja: "並列処理",
          en: "Parallel processing"
        },
        {
          ja: "データ取得と加工",
          en: "Data acquisition and processing"
        },
        {
          ja: "GUIベースのAlteryxでのデータ管理",
          en: "Data management with GUI-based Alteryx"
        },
        {
          ja: "SQLデータ加工",
          en: "SQL data processing"
        }
      ],
      team: 5
    },
    {
      companyId: "sysnavi",
      jobTitle: {
        ja: "ウェブアプリ開発-予実管理ソフト作成-",
        en: "Web Application Development - Budget Management Software Creation"
      },
      startDate: "2018-12-01",
      endDate: "2019-02-28",
      tags: [
        "ASP.NET C#",
        "SQL Server",
        "Bootstrap4",
        "HTML",
        "JavaScript"
      ],
      job: {
        ja: "予定と実績の可視化プロジェクト",
        en: "Project for Visualizing Plans and Actuals"
      },
      jobDescription: {
        ja: "マークアップデータとASP.Netのロジックを結合。ユーザー画面と管理画面、バックエンドロジックを担当。",
        en: "Combined markup data with ASP.Net logic. Responsible for user interface, admin interface, and backend logic."
      },
      experienceBullets: [
        {
          ja: "フロントエンドとバックエンド両方の経験",
          en: "Experience with both frontend and backend"
        },
        {
          ja: "MVCモデル、LINQ、外部API連携",
          en: "MVC model, LINQ, external API integration"
        }
      ],
      team: 3
    },
    {
      companyId: "self-employed",
      jobTitle: {
        ja: "生ハムの輸入販売",
        en: "Import and Sale of Raw Ham"
      },
      startDate: "2018-04-01",
      endDate: "2018-09-30",
      tags: [
        {
          ja: "輸入",
          en: "Import"
        },
        {
          ja: "食品衛生法",
          en: "Food Sanitation Law"
        }
      ],
      job: {
        ja: "生ハムの輸入販売",
        en: "Import and Sale of Raw Ham"
      },
      jobDescription: {
        ja: "スペイン産生ハムの輸入販売を目指し、サプライヤー交渉、農場見学、細菌検査、通関手続きを実施。食品衛生責任者資格取得。資金調達中に中断。",
        en: "Aimed to import and sell raw ham from Spain, conducting supplier negotiations, farm visits, bacterial inspections, and customs clearance procedures. Acquired a food sanitation manager qualification. The project was suspended during fundraising."
      }
    },
    {
      companyId: "sumitomo-chemical",
      jobTitle: {
        ja: "研究開発/RD-2016",
        en: "Research and Development/RD-2016"
      },
      startDate: "2016-11-01",
      endDate: "2018-03-31",
      tags: [
        "Polypropylene",
        "Medical Grade"
      ],
      job: {
        ja: "医療品グレードのポリプロピレン材料開発",
        en: "Development of Medical Grade Polypropylene Materials"
      },
      jobDescription: {
        ja: "医療品グレードのポリプロピレン材料開発。射出成型の歪み抑制、UV照射による汚染防止材料開発。",
        en: "Development of medical-grade polypropylene materials. Focused on suppressing injection molding distortion and developing materials to prevent contamination from UV exposure."
      }
    },
    {
      companyId: "sumitomo-chemical",
      jobTitle: {
        ja: "研究開発/RD-2015",
        en: "Research and Development/RD-2015"
      },
      startDate: "2015-06-01",
      endDate: "2016-10-31",
      tags: [
        "Polypropylene",
        "Separator"
      ],
      job: {
        ja: "バッテリーセパレータ材料開発",
        en: "Battery Separator Material Development"
      },
      jobDescription: {
        ja: "PPベースのセパレーターフィルム材料模索。耐熱性、突き刺し強度、空孔率を重視。",
        en: "Explored PP-based separator film materials. Focused on heat resistance, puncture strength, and porosity."
      }
    },
    {
      companyId: "sumitomo-chemical",
      jobTitle: {
        ja: "研究開発補助/RD-support",
        en: "Research and Development Support/RD-support"
      },
      startDate: "2012-04-01",
      endDate: "2015-05-31",
      tags: [
        "Polypropylene",
        "Film"
      ],
      job: {
        ja: "包装材の材料開発補助",
        en: "Material Development Support for Packaging Materials"
      },
      jobDescription: {
        ja: "住友化学の石油化学品研究所でポリプロピレンフィルムの研究開発補助。包装材やバッテリーセパレータの開発補助。",
        en: "Assisted in the research and development of polypropylene films at Sumitomo Chemical's petrochemical research institute. Supported the development of packaging materials and battery separators."
      }
    }
  ],
  selfProjects: [
    {
      title: "BikeHub",
      desc: {
        ja: `バイクの燃費記録とニュース閲覧ができるモバイルアプリ。Java・JSP/Servlet製の前身サービス「バイク燃費.com」を個人で開発・運用したのち、Django (DRF) のバックエンドAPIとReact Native (Expo) で後継としてフルリニューアルし、iOS/Android両ストアで公開・運用した。現在はサービス終了。`,
        en: `A mobile app for logging motorcycle fuel efficiency and reading bike news. After building and running its Java/JSP predecessor "バイク燃費.com" solo, rebuilt it as a successor with a Django (DRF) backend API and a React Native (Expo) client, and shipped it on both the App Store and Google Play. The service has since ended.`,
      },
      link: "",
      tags: [
        "Python(Django)",
        "DRF",
        "React Native(EXPO)",
        "Java",
        "JSP/Servlet",
        "BeautifulSoup4",
        "Mecab",
        "CentOS8",
        "nginx",
      ],
    },
    {
      title: "SAVE EAT",
      desc: {
        ja: `コロナ禍の飲食店を支援する応援サイト。企画から1週間で開発・公開し、Docker Composeで運用した。現在はサービス終了。`,
        en: `A support site for restaurants during the COVID-19 pandemic — built and launched within one week and operated with Docker Compose. The service has since ended.`,
      },
      link: "",
      tags: ["Python(Django)", "BeautifulSoup4", "docker-compose", "CentOS8", "nginx"],
    },
  ],
  education: [
    {
      institution: { ja: "宮崎県立 宮崎工業高校", en: "Miyazaki Technical High School" },
      degree: { ja: "化学環境学科", en: "Department of Chemical and Environmental Studies" },
      rirekishoLabel: "宮崎県立 宮崎工業高校 化学環境学科",
      startDate: null,
      endDate: "2012-03-01",
      description: "",
      showOnSite: false,
    },
    {
      institution: { ja: "東京理科大学(Tokyo University of Science)", en: "Tokyo University of Science" },
      degree: { ja: "化学科第二部", en: "Department of Chemistry, Second Division" },
      rirekishoLabel: "東京理科大学 第二部 化学科",
      startDate: "2014-04-01",
      endDate: "2018-03-01",
      description: {
        ja: `住友化学在籍中にキャリアアップのため大学へ通学。住友化学に勤務しながら、週6日通学し、有機化学を学び学士号を取得。`,
        en: `Attended university to advance my career while working at Sumitomo Chemical. Attended classes six days a week while working at Sumitomo Chemical, studying organic chemistry and earning a bachelor's degree.`,
      },
      showOnSite: true,
    },
  ],
  // 履歴書の免許・資格欄 (記載順)
  certifications: [
    { name: "公害防止管理者 水質一種", year: 2011 },
    { name: "甲種危険物取扱者", year: 2011 },
    { name: "第二種電気工事士", year: 2010 },
    { name: "ボイラー技士Ⅱ種", year: 2010 },
    { name: "普通自動車免許", year: 2012 },
  ],
  motivations: [
    {
      title: { ja: "プログラムに対する考え方", en: "Thoughts on Programming" },
      desc: {
        ja: `プログラムを通して業務の無駄や苦痛を解消し、家族や友人との時間や趣味のための時間を増やしたい。日本でユニークなサービスで生活の質を高めたい。例えば、KiteRaにて働いていた時に、日本初の36協定に関する電子申請機能をリリースしましたが、この機能のおかげでこのSaaSを利用している社労士の方から時間が大きく節約でき、より顧客に近い業務に時間を使えるようになったと喜びの声をいただきました。`,
        en: `Through programming, I want to eliminate waste and pain in work and increase time for family, friends, and hobbies. I want to improve the quality of life in Japan with unique services. For example, when I was working at KiteRa, we released Japan's first electronic application feature for the 36 Agreement, and I received positive feedback from labor consultants using this SaaS, saying that it saved a lot of time and allowed them to focus more on customer-facing work.`,
      },
    },
    {
      title: { ja: "好奇心・探究心", en: "Curiosity and Inquisitiveness" },
      desc: {
        ja: `新しいものや技術に抵抗や偏見を持たず、常に変化を受け入れる。興味のあるGitHubレポジトリをwatchし、新しい技術を学んだり、twitter、Udemyなどから発信される新しい技術などをキャッチアップしています。新しいものを追いかけるだけではなく、基礎も大切にしており、基礎的な部分は書籍などから学ぶようにしています。`,
        en: `I do not resist or hold prejudices against new things or technologies and always embrace change. I watch GitHub repositories I am interested in, learn new technologies, and keep up with new technologies from Twitter, Udemy, etc. I don't just chase new things; I also value the basics and learn foundational concepts from books.`,
      },
    },
    {
      title: { ja: "今後のキャリア", en: "Future Career" },
      desc: {
        ja: `社会問題をプログラミング（IT）で解決する業務に携わりたい。顧客に近いサービスなどに携われると嬉しく思います。Monstarlabで働いているときやKiteRaで働いているときもリリース後にお客様から、苦労して作業していたことが自動化されてとても楽になったなど聞いた時が一番嬉しかったです。`,
        en: `I want to be involved in work that solves social issues through programming (IT). I would be happy to be involved in services that are close to the customers. When I worked at Monstarlab or KiteRa, the happiest moments were when customers told us that their work had been significantly simplified after automation.`,
      },
    },
  ],
  job: {
    title: { ja: "コンサルタントから開発までお手伝いします", en: "Assisting from consulting to development" },
    desc: { ja: `ソフトウェアエンジニア`, en: `Software Engineer` },
  },
  skills: {
    languages: [
      { name: { ja: "日本語", en: "Japanese" }, level: { ja: "ネイティブ", en: "Native" } },
      { name: { ja: "英語", en: "English" }, level: { ja: "日常会話", en: "Conversational" } },
    ],
    programming: [
      { name: "Golang", description: "Ent, sqlc, gin, JSON-RPC", years: 4 },
      { name: "AWS", description: "Lambda, CloudFront, RDS", years: 4 },
      { name: "Pulumi", description: "IaC", years: 1 },
      { name: "Linux", description: "Ubuntu18,20 CentOS8", years: 5 },
      { name: "Docker", description: "", years: 4 },
      { name: "Kubernetes", description: "ArgoCD, k9s", years: 1 },
      { name: "Terraform", description: "IaC, AWS", years: 1 },
      { name: "MySQL", description: "", years: 5 },
      { name: "PostgreSQL", description: "", years: 4 },
      { name: "MongoDB", description: "", years: 1 },
      { name: "DynamoDB", description: "", years: 1 },
      { name: "Redis", description: "", years: 1 },
      { name: "JavaScript / TypeScript", description: "", years: 4 },
      { name: "Astro", description: "", years: 1 },
      { name: "Svelte", description: "", years: 2 },
      { name: "React", description: "", years: 2 },
      { name: "SolidJS", description: "", years: 1 },
      { name: "Python", description: "Django, DRF, BeautifulSoup4, Mecab, Selenium", years: 4 },
      { name: "PHP", description: "CakePHP, Laravel", years: 1 },
      { name: "NextJS", description: "", years: 2 },
      { name: "Kafka", description: "", years: 1 },
      { name: "Spark", description: "", years: 1 },
    ],
  },
  rirekisho: {
    motivationText: `SESでは様々なプロジェクトに短期間で参画することで、業務知識を広く学ぶことができ、短期間で大きく成長できました。現在は受託開発を中心とするデジタルコンサルティング企業で働いておりますが、客先の要望をベースにすることからアドバイスなどはできるがビジネス的観点からのプログラミングよりも客先要望を基にしたプログラミングになっているように感じます。そのため。今後はプログラムをビジネス視点をもったソフトウェアエンジニアになりたいと考えて今に至ります。また、キャリアチェンジをする前は化学業界の石油関係のRD部門で働いており、数値から規則性を見出すことが得意です。`,
    commute: { hours: 0, minutes: 30 },
    dependents: 0,
    spouse: null,
    spouseSupportObligation: null,
    requests: "特になし",
  },
};

validateProfile(profile);
