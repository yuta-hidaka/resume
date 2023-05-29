// import avatar from "../img/yuta.jpg";s

export const data = {
  //   avatar: avatar,
  family_name: "日髙",
  given_name: "悠太",
  profession: "full stack developer",
  bio: `高校卒業後に総合化学メーカーへ勤務。
  石油化学品系の研究開発補助から、製品開発業務へ従事し６年間キャリアを積みました。
      2018年10月からプログラマー業界にキャリアチェンジ
      SESを中心とした会社に1.8か月勤務
      その後、フリーランス、小規模受託開発会社、シード期のスタートアップを経て、現在はデジタルコンサルティングカンパニーで働いています。
      `,
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
        job: "規程を管理するSaaS開発",
        jobDescription:
          "バックエンドをGolangで構築し、JSON-RPCを使用してフロントエンドと疎通する形になっています。\nアリーステージの会社のためスピード感を持った開発で進めております。",
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
          "DyanamoDB",
          "MongoDB",
          "MySQL",
          "Jenkins",
          "docker-compose",
        ],
        job: " CRMサービスを提供している企業にSESとしてFignnyから参画、フロントが複数のFW、言語で構築されいる。\n              ",
        jobDescription:
          "CRMサービスを開発、新規機能の追加やバグの修正を主に担当。\nLambda上にpythonで記述したAPIを展開し、すべての機能をAPIで提供する形にしている。\nまた、ログ管理や、当CRMの売りである顧客が自由に項目定義(カラム・テーブル追加)できるようにNoSQLで実装されている\nドキュメントなどが往々にして不足しているのでドキュメントの作成、軽量版エディタでのデバッグ環境構築など後続の担当者にも配慮しながら作業を行う",
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
          "AWS Aurora(mysql5.6)",
          "AWS EC2",
          "AWS S3",
          "docker-compose",
          "beautifulSoup4",
          "celery",
          "redis",
          "backlog",
        ],
        job: "2020年9月末に終了するあるまとめサイトのデータを全て取得したいという依頼があったため一人でスクレイピング処理を実装",
        jobDescription:
          "PythonのBeautifulSoup4を用いて、スクレイピング処理を作成。1.5か月の実装見積であったが、2週間でスクレイピングの処理を完成させ、EC2上で実行させた。\nまた、顧客の要望に応じてスクレイピングした記事をwordで出力できるようにした。(python-docx使用)\nスクレイピング処理でリクエスト側のサイトとAWS上の通信制限対策のため1処理の実行速度に待機時間を持たせてある。\nまた、画像のリクエストなどでレスポンスに時間がかかる。\nその結果、処理の間に待ち時間が多く発生し、処理時間は長いが、使用しているサーバーの負荷は低くリソースが余っている状況であった。\n処理時間が長いため、コマンドを叩いて都度実行して、処理待ちをすることや、サーバーのリソースを余らせる状況を改善するためにスクレイピング処理のバックグランド処理・並列処理を導入。\nバックグランド処理・並列処理にCeleryを導入、並列処理にPython組み込み関数のThredPoolExecutorを利用し、4CPUのマシンで最大1プロセスしか処理できなかったものを80処理同時に実行できるように改善。\n結果として同一IPからの大量アクセスとなってしまたためAWS側にアクセス制限を掛けられてしまう。\nそのため、EC2のスペック2CPUに下げ、EC2を20インスタンス作成し処理を分散させてスクレイピングを実行。\n取得したデータは200万件以上。\nデータは画像データなどを含め全て取得したデータを再現できるようになっている。\nまた、大量のデータを扱うため、DB側のパフォーマンスチューニング,Django ORMのクエリ見直し等を行い、スクレイピングのリクエスト以外での待機時間を削減するようにした。",
        experience: [
          "並列処理による負荷分散処理の実装知見",
          "スクレイピングの経験",
          "DBのパフォーマンスチューニング",
          "AWSでの環境構築",
          "dockerを用いた開発",
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
          "gitLab",
          "backlog",
        ],
        job: " 前職の社内の受託開発業務",
        jobDescription:
          " フェーズ２では初期段階の予算で実現できなかった機能や、追加要望の実装などを行った。\n前回は客先調整等がメインであったが、こちらの案件を頂いた際には、PHPを用いてサーバーサイドロジックの作成や、新規機能の追加などコーディングを中心とした作業を主業務として担当",
        experience: ["PHPのフレームワークであるLaravelでの開発経験"],
        team: 4,
      },
    },
    {
      jobTitle: "弁護士法人の時間・請求管理システム1",
      company: "シスナビ/Sysnavi",
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
        job: "社内の受託開発業務\nSES業務と兼務して、モックアップの作成、DB設計、インフラ構築などを担当、2020年1月から専任としてプロジェクトに参加し実装や客先調整・課題管理や実装を依頼しているフリーランス様との進捗管理などを行う。\n              ",
        jobDescription:
          "弁護士法人が、弁護士の稼働時間をベースに顧客に、稼働分の金額を請求しているが現状それらすべてをエクセル上で管理しているためミスオペや、入金や金額等の確認に時間がかかってしまっていた。\n              また、請求書発行業務が大きな負担になっていた。\n              これらを要件定義を社内のPMと行い、顧客が期待する画面モックアップの作成、DB設計を0から行う。\n              また、請求書をPDFで発行できるようにするためにHTMLtoCanvas等を用いてPDF出力機能などを実装。また、サーバーは顧客側が使用しているレンタルサーバーを利用することが前提条件となっていたためそちらの環境調査、デプロイ環境の構築などを行った。\n              第一フェーズ・第二フェーズと分かれて開発のため第一フェーズに関してはモックアップや、DB定義書の作成・顧客との要件調整などを行う。\n              第一フェーズでの納品が終了となったタイミングで株式会社シスナビを退職\n              ",
        experience: [
          "DB設計の経験",
          "顧客のフィードバックを基にしたモックアップの作成",
          "dockerを用いた開発",
        ],
        team: 4,
      },
    },
    {
      jobTitle: "業務処理のRPA化",
      company: "シスナビ/Sysnavi",
      startDate: "2019-10-01",
      endDate: "2019-12-31",
      projects: {
        tags: ["WinActor", "PHP", "MicrosoftAccess"],
        job: " SESとして、客先に常駐して作業を行う。(※2019-12から2020-12まで同じ常駐先です)\n上記と同じ化学メーカーでバックオフィスのDX推進の一貫\n",
        jobDescription:
          "NTTアドバンステクノロジ社が提供しているRPAソフトを用いて、バックオフィスで定型業務であるが属人化してしまっている業務をRPA化する業務。\n人のリソース不足の為応援として参画。\nバックオフィスといえども化学メーカの物流などの知識が必要であったが、経験の上から同じ業務従事者にアドバイスなどを行いながらRPA作成作業を行った。\nRPA推進の始まりの段階であったため、これらのRPA作成・管理を依頼者側で回すことができるように仕組み作りの企画立ち上げなどにも参加。\nその中でRPAの死活管理サイトをMicrosoftAccessとPHPを用いて作成したり、今後エンドユーザーが使用することを前提として、プログラミングにあるようなフレームワークの提案、頻繁に利用するRPA動作のモジュール化とライブラリ化などを提案していった。",
        experience: [
          "WinActorを用いたRPAの作成知識",
          "エンドユーザーにも理解できるようなRPAの仕組み作りなどの、ユーザー目線での企画",
          "プログラミングからの経験を",
        ],
        team: 3,
      },
    },
    {
      jobTitle: "実験データの可視化Webアプリの作成",
      company: "シスナビ/Sysnavi",
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
        job: "大手化学メーカーの実験データ(可視光・紫外・赤外領域における吸光度スペクトル)の結果をエクセルから読み込みデータとして表示・検索ができるWebアプリ作成",
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
      jobTitle: "データ移行処理とバッチ処理の開発",
      company: "シスナビ/Sysnavi",
      startDate: "2019-02-01",
      endDate: "2019-06-30",
      projects: {
        tags: [
          "Alteryx",
          "SQL Sever",
          "Windows Sever",
          "バッチスクリプト",
          "Python(Django)",
          "Jira",
        ],
        job: "会計監査法人が所有している、所員のデータや売上、単価などを一つのDBに移管し、データ分析を行うためにバッチ処理でSQL文を実行しデータの加工、アラートメールの送出などを行う。",
        jobDescription:
          " 顧客が所有しているデータはNotesDBやCSV、MicrosoftAccessなど多種多様なデータが存在するそれらをすべて、一度Alteryxで読み込み、SQLSeverへ入れ込んでいく。\nシステム構築後は顧客が自分でデータを操作できるようにするためにGUIでの開発が必須となりAlteryxでの開発を行った。\n顧客のデータを検証する為、顧客のデータを秘匿化する処理の作成からスタート。\n大量のテーブル・カラムがあり、それらの役割、説明、型桁等を管理する為、内部でDjangoを使用。\n数百万件のレコードがあるため、Alteryxにある並列処理の導入や、それぞれのソースから取り込むため型や桁の変換やバリデーション処理の実装を行った。\n併せて、随時更新されるデータを定期的に取り込むためのバッチ処理にも応用できる作りにした。\nまた、従来手作業で行っているデータの集計(売上管理やKPI算出など)を業務フローから書き出し、AlteryxとSQLを組み合わせながら作成した。\nCSVのデータに至ってはデータのエスケープ処理が行われていなかった場合や等が多くそれらを回避するための、正規表現の作成、仕組みづくりなどに注力。\n4か月後にデータをSQLSeverに統合するところまで遂行し、プロジェクトを離脱。",
        experience: [
          "大量のデータを扱った時の処理に対応するための並列処理の経験",
          "多様なデータソースからのデータ取得と加工に対する知見",
          "GUIベースのAlteryxでのデータ加工・データ管理",
          "SQLを用いたデータ加工の手法",
        ],
        team: 5,
      },
    },
    {
      jobTitle: "ウェブアプリ開発-予実管理ソフト作成-",
      company: "シスナビ/Sysnavi",
      startDate: "2019-12-01",
      endDate: "2019-02-28",
      projects: {
        tags: ["ASP.NET C#", "SQL Sever", "BootStrap4", "html", "javascript"],
        job: "OutlookとAPI連携して、予定と実績の可視化を行うプロジェクトに参画",
        jobDescription:
          " 初期はデザイナーから受け取ったマークアップデータとASP.Netのロジックを結合していく作業からスタート。\nユーザーが使用する画面の70%近くを担当。その他にも管理画面の作成、非同期通信のためのバックエンドロジック作成に携わる。\nその後納品に向けてテスト仕様書に沿ったテストを1週間行う。\n約フロントエンド60%、バックエンド40%でプロジェクトには参加",
        experience: [
          "少人数での作業だったため、フロントエンドとバックエンドの両方の経験",
          "バックエンドではMVCモデルを用いたアプリ構造、razor記法、LINQでのDB操作、外部APIとの連携などの知識を習得",
          "フロントエンドでは、サーバーサイドレンダリングに加えて、Jqueryによるajax非同期通信によるリアルタイム画面更新、DOM操作について経験",
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
        job: "生ハムの輸入販売を目指す",
        jobDescription:
          "スペイン人の彼女の影響でスペイン産の生ハムの輸入販売を目指す。\n現地へ趣きサプライヤーとの交渉・農場見学やリステリア菌等の細菌検査や通関の輸入フローを理解するためのテスト輸入などを行った。\n食品衛生責任者の資格を取得し、生ハムを販売するために飛び込み営業などを行った。\n資金調達(金融政策公庫への借り入れ)の際に彼女との喧嘩が頻発し、立ち上げを中断。",
      },
    },
    {
      jobTitle: "研究開発/RD-2016",
      company: "住友化学/Sumitomo Chemical",
      startDate: "2016-11-01",
      endDate: "2018-03-31",
      projects: {
        tags: ["Polypropylene", "Medical Grade"],
        job: "機能性材料研究所で医療品グレードのポリプロピレン材料開発",
        jobDescription:
          "機能性材料研究所で医療品グレードのポリプロピレン材料開発を行う。コンタクトレンズ用の重合型の組成確立・医療用のPPボトルの材料開発。\nコンタクトレンズの重合型として利用するPPを作成する際に射出成型を行うが、その際に冷却条件などによって歪みが発生する。その歪みを抑えて、様々な条件下で成形しやすくする材料の開発。\nPPボトルを消毒する際にUV照射を行うがその際にPP内にラジカルが発生し、PP中の低分子量成分が溶出することによる容器内汚染などを抑えるための材料開発\n耐UVグレードの組成を確立後に退職\n",
      },
    },
    {
      jobTitle: "研究開発/RD-2015",
      company: "住友化学/Sumitomo Chemical",
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
      jobTitle: "研究開発補助/RD-support",
      company: "住友化学/Sumitomo Chemical",
      startDate: "2012-04-01",
      endDate: "2015-05-31",
      projects: {
        tags: ["Polypropylene", "Film"],
        job: "包装材の材料開発補助",
        jobDescription:
          " 高校卒業後に住友化学へ就職、石油化学品研究所に配属。\n住友化学の石油化学品研究所でポリプロピレンフィルムの研究開発補助。\n包装材やバッテリーセパレータの開発補助実験などを行う。",
      },
    },
  ],
  selfProject: [
    {
      title: "BikeHub",
      desc: ` 下記にあるバイク燃費.comの後継版(アプリ化)。
          燃費の登録と、バイク関連のニュースを見ることができる。
          バックエンドAPI
          -Django(DRF)で作成、スクレイピングとRSSでバイク関連のニュース記事を定期バッチで取得し、形態素解析を用い記事のカテゴライズを行う。
          -開発環境として、nginx-unitベースのdocker-composeで開発。

          フロントエンド
          -ReactNative Expoでフロントエンドは作成、現状はバイクNews用のAPIを叩いて表示、更新まで実装完了。
          -継続して認証関連及び、燃費登録機能を実装予定

          「Expo」のアプリをスマートフォンにインストールされている状況で下記リンクをクリックすると、開発中のアプリを見ることができます。
          ・2020-09-23
          アプリが完成し、google play store , apple store にて公開中です。
          `,
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
      desc: `BikeHubのリンク`,
      link: "https://bikehub.app",
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
      desc: `Google play storeのリンク`,
      link: "https://play.google.com/store/apps/details?id=app.bikehub",
      tags: [],
    },
    {
      title: "バイク燃費.com(サービス終了)",
      desc: ` バイクの燃費を登録記録できます。Java・jsp/servletだけで作られています。
          バイクのデータはBeautifulSoup4でスクレイピングをして集めました。
          `,
      link: "https:bike-nenpi.com",
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
      title: "SAVE EAT(サービス終了)",
      desc: ` コロナの中で苦境に立たされている飲食店を少しでも支援したいと思い、飲食店支援サイトを作成しました。
          1週間で作成しました。
          Docker-composeで作成し、そのままdockerコンテナとしてデプロイしました。
          数人利用していただいただけで現在は音沙汰なしです。
          `,
      link: "https:save-eat.me",
      tags: ["python(Django)", "Beautifulsoup4", "GitHub", "centos8", "nginx"],
    },
    {
      title: "音声文字起こしサイト(サービス終了)",
      desc: ` 会話の記録を取得したくてJavaScriptのAPIを用いて文字起こしのウェブサイトを作成しました。
          `,
      link: "https://voice-to-text.web-tool.tokyo/",
      tags: ["JavaScript", "BootStrap4", "centos8"],
    },
    {
      title: "docker-compose for Django with Gunicorn",
      desc: ` Djangoのプロジェクトを最速で立ち上げられる。docker-comspoe ファイルを作成しtemplateとしてgithubで共有しています。
          Nginx-Unitバージョンも作成中。
          `,
      link: "https://github.com/yuta-hidaka/Docker-Django-MariaDB-Gunicorn",
      tags: ["docker-compose", "django"],
    },
    {
      title: "docker-compose for Django with nginx-unit",
      desc: ` Djangoのプロジェクトを最速で立ち上げられる。Nginx-Unitバージョンかつ、見直し版。
          `,
      link: "https://github.com/yuta-hidaka/Docker-Django-MariaDB-NginxUnit",
      tags: ["docker-compose", "django", "Nginx-Unit"],
    },
  ],
  education: [
    {
      degree: "化学科第二部",
      institution: "東京理科大学(Tokyo University of Science)",
      startDate: "2014-04-01",
      endDate: "2018-03-01",
      description: ` 住友化学在籍中でのキャリアアップ、研究の基礎を習得したく、上司と相談しながら大学へ通学。
          住友化学に正社員として勤務しながら、終業後に4年間有機化学を中心に学び学士号を取得。
          週6日、終業後に千葉(姉ヶ崎)から東京(飯田橋)まで通学。
          勤務例：
          勤務：7:00-16:00
          移動：16:00-18:00
          講義：18:00-21:10
          帰宅：21:10-23:30
          `,
    },
  ],
  motivation: [
    {
      title: "プログラムに対する考え方",
      desc: ` 業務で今まで無駄であったこと、人に対して苦痛であったことをプログラムを通して解消していきたい。
          解消した先にある余った時間は家族や友人、パートナーと一緒に過ごす時間や自分の趣味など人として文化的な生活を送るための時間に対して割いて欲しい。
          無駄を省くだけではなく、今までになかったユニークなサービスで人々の生活の質を高めていけるようにしたい。
          `,
    },
    {
      title: "探究心",
      desc: ` 研究開発を行ってきたこともあり、疑問に思ったことはすぐに調べ、新しいことに対して抵抗なく挑戦し、問題について常に解を求めていきます。`,
    },
    {
      title: "好奇心",
      desc: ` 新しいものや技術に対して抵抗や偏見をもたずに常に変化を受け入れるように心がけています`,
    },
    {
      title: "今後のキャリア",
      desc: ` 社会問題をプログラミング(広義ではIT)で解決するような業務に携わりたい。
          `,
    },
  ],
  job: {
    title: "コンサルタントから開発までお手伝いいたします",
    desc: `ソフトウェアエンジニア`,
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
