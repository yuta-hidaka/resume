import { data as dataEN } from "./about.en";

export const getData = (locale: string | undefined): Data => {
  if (locale === "ja") {
    return data;
  }
  return dataEN;
};

export const data = {
  family_name: "日髙",
  given_name: "悠太",
  profession: "Full Stack Developer / Tech lead",
  bio: `高校卒業後、総合化学メーカーで6年間製品開発に従事。働きながら東京の大学に週6日通学し、有機化学を学び学士号を取得。2018年10月にプログラマーに転職。SES会社で2年勤務後、フリーランスや受託開発会社、スタートアップを経て、現在はMonstarlabで働いています。`,
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
      startDate: "2024-04-01",
      endDate: "",
      projects: {
        tags: ["Golang", "NextJS", "GCP"],
        job: "受託開発",
        jobDescription:
          "ふるさと納税をすると、ポイントの代わりに株に交換できる権利ができるサービスの開発、最大1000RPSを超えるアクセスがあり、高トラフィックを想定した開発",
        experience: [""],
        team: 30,
      },
    },
    {
      jobTitle: "Tech Lead",
      company: "Monstarlab",
      startDate: "2024-04-01",
      endDate: "2024-11-15",
      projects: {
        tags: ["Golang", "Astro", "AWS", "Terraform", "MySQL", "SST", "CMS"],
        job: "受託開発",
        jobDescription:
          "開発チーム３人、QAが３名のチームでテックリードを担当。月額25万円ほどインフラ費用がかかっているシステムを移行後に、LambdaとCloudFrontを用いた、月額1万円ほどのシステムへ置き換える提案を行いました。また、プリセールスが出していた当初想定月額費用が150万円だったものを改善し運用費用を含めいて、費用の圧縮を行いました。属人性を避けるため、IaCの導入、移行作業は手作業での作業を避け、全てGolangで記述を行いました。フロントエンドは、SEOや表示速度を考え、Astro JSでISRのような構成で、アーキテクトを構成しました。通常はFEエンジニア、BEエンジニア、インフラエンジニアと単一役割のメンバーをアサインしますが、全てを行うフルスタックエンジニアとしての経験があると言うことでPJにアサインいただきました。",
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
        job: "受託開発",
        jobDescription:
          "企業サイト更新。海外チームと協力しフルスタックエンジニアとしてバックエンド・フロントエンド・インフラを担当。バングラディッシュチームとの開発を行う、時差がある中ら非同期に作業を行い、必要に応じてミーティングや仕様説明などを行う。",
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
        job: "規程管理SaaS開発",
        jobDescription:
          "Golangでバックエンドを構築し、JSON-RPCでフロントエンドと通信。スピード感のある開発。日本初のe-Govを経由した36協定の電子申請システムの実装、リード",
        experience: ["最新の言語を用いた開発環境"],
        team: 5,
      },
    },
    {
      jobTitle: "CRMソフト開発",
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
        job: "CRMサービス開発",
        jobDescription:
          "新機能追加やバグ修正、API提供、NoSQLによる項目定義。ドキュメント作成とデバッグ環境構築も担当。",
        experience: ["NoSQLの取り扱い", "大人数でのチーム開発", "AWS"],
        team: 20,
      },
    },
    {
      jobTitle: "まとめサイトのスクレイピング",
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
        job: "まとめサイトのデータスクレイピング",
        jobDescription:
          "BeautifulSoup4でスクレイピング処理を2週間で実装。CeleryとThredPoolExecutorで並列処理を導入し、EC2インスタンス20台で分散処理。",
        experience: [
          "並列処理による負荷分散",
          "スクレイピング",
          "DBパフォーマンスチューニング",
          "AWS環境構築",
          "Docker開発",
          "メモリ管理",
        ],
        team: 2,
      },
    },
    {
      jobTitle: "弁護士法人の時間・請求管理システム2",
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
          "GitLab",
          "Backlog",
        ],
        job: "時間・請求管理システム開発",
        jobDescription: "新機能追加とサーバーサイドロジックの作成。",
        experience: ["Laravelでの開発経験"],
        team: 4,
      },
    },
    {
      jobTitle: "弁護士法人の時間・請求管理システム1",
      company: "シスナビ",
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
        job: "時間・請求管理システム開発",
        jobDescription:
          "要件定義、モックアップ、DB設計、PDF出力機能の実装、レンタルサーバーの環境調査・デプロイ。",
        experience: ["DB設計", "モックアップ作成", "Docker開発"],
        team: 4,
      },
    },
    {
      jobTitle: "業務処理のRPA化",
      company: "シスナビ",
      startDate: "2019-10-01",
      endDate: "2019-12-31",
      projects: {
        tags: ["WinActor", "PHP", "MicrosoftAccess"],
        job: "RPA化",
        jobDescription:
          "NTTアドバンステクノロジのRPAソフトでバックオフィス業務を自動化。RPA作成・管理の仕組み作りを企画。",
        experience: ["WinActorのRPA作成", "エンドユーザー向けRPA企画"],
        team: 3,
      },
    },
    {
      jobTitle: "実験データの可視化Webアプリの作成",
      company: "シスナビ",
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
        job: "実験データ可視化Webアプリ開発",
        jobDescription:
          "エクセルデータをJSONに整形し、Django Rest FrameworkでREST-APIに登録。plotly.jsでデータを可視化。",
        experience: [
          "DjangoのMVTモデルでの開発経験",
          "TypeScriptでのフロントエンド開発",
        ],
        team: 4,
      },
    },
    {
      jobTitle: "データ移行処理とバッチ処理の開発",
      company: "シスナビ",
      startDate: "2019-02-01",
      endDate: "2019-06-30",
      projects: {
        tags: [
          "Alteryx",
          "SQL Server",
          "Windows Server",
          "バッチスクリプト",
          "Python(Django)",
          "Jira",
        ],
        job: "データ移行と分析",
        jobDescription:
          "多様なデータソースをAlteryxで読み込み、SQL Serverに統合。並列処理、データ秘匿化、バッチ処理の実装。",
        experience: [
          "並列処理",
          "データ取得と加工",
          "GUIベースのAlteryxでのデータ管理",
          "SQLデータ加工",
        ],
        team: 5,
      },
    },
    {
      jobTitle: "ウェブアプリ開発-予実管理ソフト作成-",
      company: "シスナビ",
      startDate: "2018-12-01",
      endDate: "2019-02-28",
      projects: {
        tags: ["ASP.NET C#", "SQL Server", "Bootstrap4", "HTML", "JavaScript"],
        job: "予定と実績の可視化プロジェクト",
        jobDescription:
          "マークアップデータとASP.Netのロジックを結合。ユーザー画面と管理画面、バックエンドロジックを担当。",
        experience: [
          "フロントエンドとバックエンド両方の経験",
          "MVCモデル、LINQ、外部API連携",
        ],
        team: 3,
      },
    },
    {
      jobTitle: "生ハムの輸入販売",
      company: "個人事業主",
      startDate: "2018-04-01",
      endDate: "2018-09-30",
      projects: {
        tags: ["輸入", "食品衛生法"],
        job: "生ハムの輸入販売",
        jobDescription:
          "スペイン産生ハムの輸入販売を目指し、サプライヤー交渉、農場見学、細菌検査、通関手続きを実施。食品衛生責任者資格取得。資金調達中に中断。",
      },
    },
    {
      jobTitle: "研究開発/RD-2016",
      company: "住友化学",
      startDate: "2016-11-01",
      endDate: "2018-03-31",
      projects: {
        tags: ["Polypropylene", "Medical Grade"],
        job: "医療品グレードのポリプロピレン材料開発",
        jobDescription:
          "医療品グレードのポリプロピレン材料開発。射出成型の歪み抑制、UV照射による汚染防止材料開発。",
      },
    },
    {
      jobTitle: "研究開発/RD-2015",
      company: "住友化学",
      startDate: "2015-06-01",
      endDate: "2016-10-31",
      projects: {
        tags: ["Polypropylene", "Separator"],
        job: "バッテリーセパレータ材料開発",
        jobDescription:
          "PPベースのセパレーターフィルム材料模索。耐熱性、突き刺し強度、空孔率を重視。",
      },
    },
    {
      jobTitle: "研究開発補助/RD-support",
      company: "住友化学",
      startDate: "2012-04-01",
      endDate: "2015-05-31",
      projects: {
        tags: ["Polypropylene", "Film"],
        job: "包装材の材料開発補助",
        jobDescription:
          "住友化学の石油化学品研究所でポリプロピレンフィルムの研究開発補助。包装材やバッテリーセパレータの開発補助。",
      },
    },
  ],
  selfProject: [
    {
      title: "BikeHub",
      desc: `バイク燃費.comの後継アプリ。燃費登録とバイクニュースの表示。Django(DRF)でバックエンドAPI、ReactNative Expoでフロントエンド作成。`,
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
      desc: `BikeHubのリンク`,
      link: "https://www.bikehub.app",
      tags: [],
    },
    {
      title: "BikeHub(iOS)",
      desc: `Apple Storeのリンク`,
      link: "https://apps.apple.com/jp/app/bike-hub/id1531692067",
      tags: [],
    },
    {
      title: "BikeHub(Android)",
      desc: `Google Play Storeのリンク`,
      link: "https://play.google.com/store/apps/details?id=app.bikehub",
      tags: [],
    },
    {
      title: "バイク燃費.com(サービス終了)",
      desc: `バイクの燃費を登録記録できる。Java・JSP/Servletで作成。BeautifulSoup4でスクレイピング。`,
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
      title: "SAVE EAT(サービス終了)",
      desc: `コロナ禍での飲食店支援サイト。1週間で作成し、Docker-composeでデプロイ。`,
      link: "https://save-eat.me",
      tags: ["Python(Django)", "BeautifulSoup4", "GitHub", "CentOS8", "nginx"],
    },
    {
      title: "音声文字起こしサイト(サービス終了)",
      desc: `JavaScript APIを用いた文字起こしサイト。`,
      link: "https://voice-to-text.web-tool.tokyo/",
      tags: ["JavaScript", "Bootstrap4", "CentOS8"],
    },
    {
      title: "docker-compose for Django with Gunicorn",
      desc: `Djangoプロジェクトの最速立ち上げ用テンプレート。Nginx-Unit版も作成中。`,
      link: "https://github.com/yuta-hidaka/Docker-Django-MariaDB-Gunicorn",
      tags: ["docker-compose", "django"],
    },
    {
      title: "docker-compose for Django with nginx-unit",
      desc: `Djangoプロジェクトの最速立ち上げ用テンプレート。`,
      link: "https://github.com/yuta-hidaka/Docker-Django-MariaDB-NginxUnit",
      tags: ["docker-compose", "django", "nginx-unit"],
    },
  ],
  education: [
    {
      degree: "化学科第二部",
      institution: "東京理科大学(Tokyo University of Science)",
      startDate: "2014-04-01",
      endDate: "2018-03-01",
      description: `住友化学在籍中にキャリアアップのため大学へ通学。住友化学に勤務しながら、週6日通学し、有機化学を学び学士号を取得。`,
    },
  ],
  motivation: [
    {
      title: "プログラムに対する考え方",
      desc: `プログラムを通して業務の無駄や苦痛を解消し、家族や友人との時間や趣味のための時間を増やしたい。日本でユニークなサービスで生活の質を高めたい。例えば、KiteRaにて働いていた時に、日本初の36協定に関する電子申請機能をリリースしましたが、この機能のおかげでこのSaaSを利用している社労士の方から時間が大きく節約でき、より顧客に近い業務に時間を使えるようになったと喜びの声をいただきました。`,
    },
    {
      title: "好奇心・探究心",
      desc: `新しいものや技術に抵抗や偏見を持たず、常に変化を受け入れる。興味のあるGitHubレポジトリをwatchし、新しい技術を学んだり、twitter、Udemyなどから発信される新しい技術などをキャッチアップしています。新しいものを追いかけるだけではなく、基礎も大切にしており、基礎的な部分は書籍などから学ぶようにしています。`,
    },
    {
      title: "今後のキャリア",
      desc: `社会問題をプログラミング（IT）で解決する業務に携わりたい。顧客に近いサービスなどに携われると嬉しく思います。Monstarlabで働いているときやKiteRaで働いているときもリリース後にお客様から、苦労して作業していたことが自動化されてとても楽になったなど聞いた時が一番嬉しかったです。`,
    },
  ],
  job: {
    title: "コンサルタントから開発までお手伝いします",
    desc: `ソフトウェアエンジニア`,
  },
  skills: {
    LanguageSkills: [
      {
        name: "日本語",
        description: "ネイティブ",
        year: -1,
      },
      {
        name: "英語",
        description: "日常会話",
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
        name: "Javescript / Typescript",
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
  skills?: {
    LanguageSkills: { name: string; description: string; year: number }[];
    ProgrammingSkills: { name: string; description: string; year: number }[];
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
