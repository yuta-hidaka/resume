import React, { Component } from 'react';
import About from './components/About';
import Experience from './components/Experience';
import SelfProject from './components/SelfProject';
import Education from './components/Education';
import Motivation from './components/Motivation';
import Skills from './components/Skills';
import avatar from './img/yuta.jpg';
import particlesOptions from './assets/particle2.json';
import Particles from 'react-tsparticles';

class App extends Component {
  render() {
    const person = {
      avatar: avatar,
      name: '日髙　悠太',
      profession: 'Backend Developer',
      bio: `This page created by React.js :)
      REACT面白いです。
      `,
      address: 'Shinjuku-Waseda Tokyo',
      social: [
        {
          name: 'twitter',
          url: 'https://twitter.com/amateur_prog',
        },
        {
          name: 'github',
          url: 'https://github.com/yuta-hidaka',
        },
        {
          name: 'linkedin',
          url:
            'https://www.linkedin.com/in/%E6%82%A0%E5%A4%AA-%E6%97%A5%E9%AB%98-2823a8195/',
        },
      ],
      experience: [
        {
          jobTitle: '研究開発補助/RD-support',
          company: '住友化学/Sumitomo Chemical',
          tags: ['Polypropylene', 'Film'],
          startDate: '2012-4',
          endDate: '2015-5',
          jobDescriptions: [
            {
              title: '業務内容',
              jd: `高校卒業後に住友化学へ就職、石油化学品研究所に配属。
              住友化学の石油化学品研究所でポリプロピレンフィルムの研究開発補助。
                   包装材やバッテリーセパレータの開発補助実験などを行う。
            `,
            },
          ],
        },
        {
          jobTitle: '研究開発/RD-2015',
          company: '住友化学/Sumitomo Chemical',
          tags: ['Polypropylene', 'Separator'],
          startDate: '2015-6',
          endDate: '2016-10',
          jobDescriptions: [
            {
              title: '業務内容',
              jd: `住友化学の石油化学品研究所にてバッテリーセパレータの材料開発の為の基礎研究に従事。
          廉価版のバッテリーに使用するPPをベースとしたセパレーターフィルムの材料模索や構造解析など実施。
          耐熱性・Li-ionが結晶化した時の突き刺し強度、微多孔の均一性、空孔率等に焦点を当てて材料開発。
          途中で部署移動のため、基礎調査で終了。
            `,
            },
          ],
        },
        {
          jobTitle: '研究開発/RD-2016',
          company: '住友化学/Sumitomo Chemical',
          tags: ['Polypropylene', 'Medical Grade'],
          startDate: '2016-11',
          endDate: '2018-3',
          jobDescriptions: [
            {
              title: '業務内容',
              jd: `住友化学の機能性材料研究所で医療品グレードのポリプロピレン材料開発を行う。コンタクトレンズ用の重合型の組成確立・医療用のPPボトルの材料開発。
            コンタクトレンズの重合型として利用するPPを作成する際に射出成型を行うが、その際に冷却条件などによって歪みが発生する。その歪みを抑えて、様々な条件下で成形しやすくする材料の開発。
            PPボトルを消毒する際にUV照射を行うがその際にPP内にラジカルが発生し、PP中の低分子量成分が溶出することによる容器内汚染などを抑えるための材料開発
            耐UVグレードの組成を確率後に退職
            `,
            },
          ],
        },

        {
          jobTitle: '生ハムの輸入販売/',
          company: '個人事業主',
          tags: ['輸入', '食品衛生法'],
          startDate: '2018-4',
          endDate: '2018-9',
          jobDescriptions: [
            {
              title: '業務内容',
              jd: `スペイン人の彼女の影響でスペイン産の生ハムの輸入販売を目指す。
          現地へ趣きサプライヤーとの交渉・農場見学やリステリア菌等の細菌検査や通関の輸入フローを理解するためのテスト輸入などを行った。
          食品衛生責任者の資格を取得し、生ハムを販売するために飛び込み営業などを行った。
          資金調達(金融政策公庫への借り入れ)の際に彼女との喧嘩が頻発し、立ち上げを中断。
            `,
            },
          ],
        },
        {
          jobTitle: 'プログラミング研修',
          company: 'シスナビ/Sysnavi',
          tags: ['JAVA', 'OracleDB', 'servlet/jsp', 'html', 'javascript'],
          startDate: '2019-10',
          endDate: '2018-11',
          jobDescriptions: [
            {
              title: '業務内容',
              jd: `未経験からの転職のため二か月ほど基本的なPGの研修を受けた。
                    JAVAをベースとしたプログラミング(jsp/Servlet)と基本的なIT知識及び、オブジェクト指向・アルゴリズムの基礎、DB設計などを網羅的に学ぶ。
            `,
            },
          ],
        },
        {
          jobTitle: 'ウェブアプリ開発-予実管理ソフト作成-',
          company: 'シスナビ/Sysnavi',
          tags: ['ASP.Net C#', 'SQL Sever', 'BootStrap4', 'html', 'javascript'],
          startDate: '2019-12',
          endDate: '2019-2',
          jobDescriptions: [
            {
              title: '技術',
              jd: `バックエンド：ASP.NET C#
          フロントエンド：ASP.NET C#によるRazor記法でのサーバーサイドレンダリング,jQuery`,
            },
            {
              title: '業務内容',
              jd: `SESとして、客先に常駐して作業を行う。(※2019-12から2020-12まで同じ常駐先です)
              OutlookとAPI連携して、予定と実績の可視化を行うプロジェクトに参画。`,
            },
            {
              title: '業務詳細',
              jd: `初期はデザイナーから受け取ったマークアップデータとASP.Netのロジックを結合していく作業からスタート。
          ユーザーが使用する画面の70%近くを担当。その他にも管理画面の作成、非同期通信のためのバックエンドロジック作成に携わる。
          その後納品に向けてテスト仕様書に沿ったテストを1週間行う。
          約フロントエンド60%、バックエンド40%でプロジェクトには参加`,
            },
            {
              title: '経験',
              jd: `少人数での作業だったため、フロントエンドとバックエンドの両方の経験を積むことができた。
          バックエンドではMVCモデルを用いたアプリ構造、razor記法、LINQでのDB操作、外部APIとの連携などの知識を習得。
          フロントエンドでは、サーバーサイドレンダリングに加えて、Jqueryによるajax非同期通信によるリアルタイム画面更新、DOM操作について経験を深めることができた`,
            },
            {
              title: 'チーム',
              jd: `PM:1人
              実装：2人(担当)`,
            },
          ],
        },
        {
          jobTitle: 'データ移行処理とバッチ処理の開発',
          company: 'シスナビ/Sysnavi',
          tags: [
            'Alteryx',
            'SQL Sever',
            'Windows Sever',
            'バッチスクリプト',
            'Python(Django)',
            'Jira'
          ],
          startDate: '2019-2',
          endDate: '2019-6',
          jobDescriptions: [
            {
              title: '技術',
              jd: `データ移行ツール：Alteryx*
              バッチ処理：Alteryx
              DB:SQL Server
              *データブレンディングソフト、データの取り込みか、加工、基本的なアルゴリズム構築、DBへの書き込みなどをGUIベースで行うソフト
              参考リンク：https://www.alteryx.com/
              
              `,
            },
            {
              title: '業務内容',
              jd: `SESとして、客先に常駐して作業を行う。(※2019-12から2020-12まで同じ常駐先です)
              大手会計監査法人が所有している、所員のデータや売上、単価などを一つのDBに移管し、データ分析を行うためにバッチ処理でSQL文を実行しデータの加工、アラートメールの送出などを行う。
              `,
            },
            {
              title: '業務詳細',
              jd: `顧客が所有しているデータはNotesDBやCSV、MicrosoftAccessなど多種多様なデータが存在するそれらをすべて、一度Alteryxで読み込み、SQLSeverへ入れ込んでいく。
              システム構築後は顧客が自分でデータを操作できるようにするためにGUIでの開発が必須となりAlteryxでの開発を行った。
              顧客のデータを検証する為、顧客のデータを秘匿化する処理の作成からスタート。
              大量のテーブル・カラムがあり、それらの役割、説明、型桁等を管理する為、内部でDjangoを使用。
              数百万件のレコードがあるため、Alteryxにある並列処理の導入や、それぞれのソースから取り込むため型や桁の変換やバリデーション処理の実装を行った。
              併せて、随時更新されるデータを定期的に取り込むためのバッチ処理にも応用できる作りにした。
              また、従来手作業で行っているデータの集計(売上管理やKPI算出など)を業務フローから書き出し、AlteryxとSQLを組み合わせながら作成した。
              CSVのデータに至ってはデータのエスケープ処理が行われていなかった場合や等が多くそれらを回避するための、正規表現の作成、仕組みづくりなどに注力。
              4か月後にデータをSQLSeverに統合するところまで遂行し、プロジェクトを離脱。
              `,
            },
            {
              title: '経験',
              jd: `大量のデータを扱った時の処理に対応するための並列処理の経験
              多様なデータソースからのデータ取得と加工に対する知見
              GUIベースのAlteryxでのデータ加工・データ管理
              SQLを用いたデータ加工の手法
              `,
            },
            {
              title: 'チーム',
              jd: `PM:1人
              実装：4人(担当)`,
            },
          ],
        },
        {
          jobTitle: '実験データの可視化Webアプリの作成',
          company: 'シスナビ/Sysnavi',
          tags: ['Python(Django)', 'MySQL5.7', 'TypeScript', 'HTML', 'gitHub'],
          startDate: '2019-6',
          endDate: '2019-8',
          jobDescriptions: [
            {
              title: '技術',
              jd: `バックエンド:Python(Django)
              フロントエンド:TypeScript/Django-Template
              DB:MySQL
              `,
            },
            {
              title: '業務内容',
              jd: `SESとして、客先に常駐して作業を行う。(※2019-12から2020-12まで同じ常駐先です)
              大手化学メーカーの実験データ(可視光・紫外・赤外領域における吸光度スペクトル)の結果をエクセルから読み込みデータとして表示・検索ができるWebアプリ作成
              `,
            },
            {
              title: '業務詳細',
              jd: `化学メーカーのDX推進関連プロジェクト
              多くの実験データが、エクセルで管理されており、かつフォーマットがバラバラな状態になっており、主任研究者や作業者が変わると実験データのまとめ方が変わってしまう。
              このような属人的な状況を改善するために、過去の実験データを含むすべてのデータをウェブアプリ上で管理し、実験の条件や、組成なので検索・参照できるような仕組みを作れるようにするプロジェクト。
              typescriptで「xlsx.js」を用いてエクセルを取り込む処理を実装し、これらのデータをJSONに整形し、DjangoRestFrameworkを用いてREST-APIにしてデータを登録するようにした。
              データを集計し、吸光度のデータなどを計算しplotly.jsを用いてグラフとして可視化するようにした。
              プロジェクトそのものが検証段階のため、代表的な実験データを取り込み、グラフで可視化・多様な検索条件を表示できるようにしたが、実験の生データに規則性が無さすぎるためプログラミングの工数がかかるとのことから、DJangoでの開発が中止となった。
              代替手段としてAWSのデータレイクとラムダを用いた手法を検討することとなったが、こちらについては関与せずにプロジェクトを離脱。              
              `,
            },
            {
              title: '経験',
              jd: `MVCモデルのフレームワークではなく、MVTモデルのDjango特有のモデルでのWebアプリの作成経験の習得
              全職の経験を生かして、データのまとめ方やグラフの出力、DB設計等をPM等に提言しながらの作業。
              TypeScriptを用いた静的型付言語でのフロントエンド開発
              `,
            },
            {
              title: 'チーム',
              jd: `PM:1人
              実装：2人(担当)`,
            },
          ],
        },
        {
          jobTitle: '業務処理のRPA化',
          company: 'シスナビ/Sysnavi',
          tags: ['WinActor', 'PHP', 'MicrosoftAccess', 'Jira'],
          startDate: '2019-10',
          endDate: '2019-12',
          jobDescriptions: [
            {
              title: '技術',
              jd: `データ処理：Winactor`,
            },
            {
              title: '業務内容',
              jd: `SESとして、客先に常駐して作業を行う。(※2019-12から2020-12まで同じ常駐先です)
              上記と同じ化学メーカーでバックオフィスのDX推進の一貫
              `,
            },
            {
              title: '業務詳細',
              jd: `
              NTTアドバンステクノロジ社が提供しているRPAソフトを用いて、バックオフィスで定型業務であるが属人化してしまっている業務をRPA化する業務。
              人のリソース不足の為応援として参画。
              バックオフィスといえども化学メーカの物流などの知識が必要であったが、経験の上から同じ業務従事者にアドバイスなどを行いながらRPA作成作業を行った。
              RPA推進の始まりの段階であったため、これらのRPA作成・管理を依頼者側で回すことができるように仕組み作りの企画立ち上げなどにも参加。
              その中でRPAの死活管理サイトをMicrosoftAccessとPHPを用いて作成したり、今後エンドユーザーが使用することを前提として、プログラミングにあるようなフレームワークの提案、頻繁に利用するRPA動作のモジュール化とライブラリ化などを提案していった。
              `,
            },
            {
              title: '経験',
              jd: `
              WinActorを用いたRPAの作成知識
              エンドユーザーにも理解できるようなRPAの仕組み作りなどの、ユーザー目線での企画
              プログラミングからの経験を
              `,
            },
            {
              title: 'チーム',
              jd: `PM:1人
              実装：2人(担当)`,
            },
          ],
        },
        {
          jobTitle: '弁護士法人の時間・請求管理システム1',
          company: 'シスナビ/Sysnavi',
          tags: [
            'PHP(Laravel)',
            'MySQL5.7',
            'FreeBSD',
            'jQuery',
            'docker-compose',
            'gitLab',
            'redmine',
          ],
          startDate: '2019-6',
          endDate: '2020-6',
          jobDescriptions: [
            {
              title: '技術',
              jd: `バックエンド:PHP(Laravel)
              フロントエンド:PHP(Laravel)/jQuery
              DB:MySQL
              開発環境:Docker`,
            },
            {
              title: '業務内容',
              jd: `社内の受託開発業務
              SES業務終了後に、モックアップの作成、DB設計、インフラ構築などを担当、2020年1月から専任としてプロジェクトに参加し客先調整・課題管理や実装を依頼しているフリーランス様との進捗管理などを行う。
              `,
            },
            {
              title: '業務詳細',
              jd: `弁護士法人が、弁護士の稼働時間をベースに顧客に、稼働分の金額を請求しているが現状それらすべてをエクセル上で管理しているためミスオペや、入金や金額等の確認に時間がかかってしまっていた。
              また、請求書発行業務が大きな負担になっていた。
              これらを要件定義を社内のPMと行い、顧客が期待する画面モックアップの作成、DB設計を0から行う。
              また、請求書をPDFで発行できるようにするためにHTMLtoCanvas等を用いてPDF出力機能などを実装。また、サーバーは顧客側が使用しているレンタルサーバーを利用することが前提条件となっていたためそちらの環境調査、デプロイ環境の構築などを行った。
              第一フェーズ・第二フェーズと分かれて開発のため第一フェーズに関してはモックアップや、DB定義書の作成・顧客との要件調整などを行う。
              第一フェーズでの納品が終了となったタイミングで株式会社シスナビを退職
              `,
            },
            {
              title: '経験',
              jd: `
              DB設計の経験
              顧客のフィードバックを基にしたモックアップの作成
              dockerを用いた開発
              `,
            },
            {
              title: 'チーム',
              jd: `PM:1人
              実装：3人(担当)`,
            },
          ],
        },
        {
          jobTitle: '弁護士法人の時間・請求管理システム2',
          company: 'フリーランス',
          tags: [
            'PHP(Laravel)',
            'MySQL5.7',
            'FreeBSD',
            'jQuery',
            'docker-compose',
            'gitLab',
            'backlog',
          ],
          startDate: '2020-7',
          endDate: '',
          jobDescriptions: [
            {
              title: '技術',
              jd: `バックエンド:PHP(Laravel)
              フロントエンド:PHP(Laravel)/jQuery
              DB:MySQL
              開発環境:Docker`,
            },
            {
              title: '業務内容',
              jd: `全職の社内の受託開発業務
              退職後に、一部業務に携わっていただきたいとの依頼からフリーランスとして一部業務を受託
              `,
            },
            {
              title: '業務詳細',
              jd: `フェーズ２では初期段階の予算で実現できなかった機能や、追加要望の実装などを行った。
              前回は客先調整等がメインであったが、こちらの案件を頂いた際には、PHPを用いてサーバーサイドロジックの作成や、ページの編集などコーディングを中心とした作業を主業務として担当
              `,
            },
            {
              title: '経験',
              jd: `PHPのフレームワークであるLaravelでの開発経験
              `,
            },
            {
              title: 'チーム',
              jd: `PM:1人
              実装：3人(担当)`,
            },
          ],
        },
        {
          jobTitle: 'まとめサイトのスクレイピング',
          company: 'Fignny',
          tags: [
            'Python(Django)',
            'AWS Aurora(Mysql)',
            'AWS EC2',
            'AWS S3',
            'docker-compose',
            'beautifulSoup4',
            'backlog',
          ],
          startDate: '2020-8',
          endDate: '',
          jobDescriptions: [
            {
              title: '技術',
              jd: `バックエンド:Python(Django)
              DB:Aurora
              開発環境:Docker`,
            },
            {
              title: '業務内容',
              jd: `2020年9月末に終了するあるまとめサイトのデータを全て取得したいという依頼があったため一人でスクレイピング処理を実装
              `,
            },
            {
              title: '業務詳細',
              jd: `PythonのBeautifulSoup4を用いて、スクレイピング処理を作成。1.5か月の実装見積であったが、2週間でスクレイピングの処理を完成させ、EC2上で実行させた。
              スクレイピング処理でリクエスト側のサイトの過負荷防止とAWS上の通信制限対策のため1処理の実行速度に待機時間を大量に持たせてある。
              そのため、使用しているサーバーの負荷は低くリソースが余っている状況であった。その状況を改善するためにスクレイピング処理の並列処理化を導入。
              バックグランド処理・並列処理にCeleryを導入、並列処理にPython組み込み関数のThredPoolExecutorを利用し、2CPUのマシンで最大1プロセスしか処理できなかったものを20処理同時に実行できるように改善
              結果として同一IPからの大量アクセスとなってしまたためAWS側にアクセス制限を掛けられてしまう。
              そのため、EC2のスペックを下げ、プログラムをEC2を20インスタンスに分散させてスクレイピングを実行。
              取得したデータは20万件以上
              データは画像データなどを含め全て取得したデータを再現できるようになっている
              `,
            },
            {
              title: '経験',
              jd: `
              並列処理による負荷分散処理の実装知見
              スクレイピングの経験
              AWSでの環境構築
              dockerを用いた開発
              `,
            },
            {
              title: 'チーム',
              jd: `PM:1人
              実装：1人(担当)`,
            },
          ],
        },
      ],
      selfProject: [
        {
          title: 'バイク燃費.com',
          desc: `バイクの燃費を登録記録できます。Java・jsp/servletだけで作られています。
          バイクのデータはBeautifulSoup4でスクレイピングをして集めました。
          `,
          link: 'https:bike-nenpi.com',
          tags: [
            'JAVA',
            'python',
            'Beautifulsoup4',
            'centos8',
            'Apache2.4',
            'TomCat',
          ],
        },
        {
          title: 'SAVE EAT',
          desc: `コロナの中で苦境に立たされている飲食店を少しでも支援したいと思い、飲食店支援サイトを作成しました。
          1週間で作成しました。
          Docker-composeで作成し、そのままdockerコンテナとしてデプロイしました。
          数人利用していただいただけで現在は音沙汰なしです。
          `,
          link: 'https:save-eat.me',
          tags: [
            'python(Django)',
            'Beautifulsoup4',
            'GitHub',
            'centos8',
            'nginx',
          ],
        },
        {
          title: '音声文字起こしサイト',
          desc: `会話の記録を取得したくてJavaScriptのAPIを用いて文字起こしのウェブサイトを作成しました。
          `,
          link: 'https://voice-to-text.web-tool.tokyo/',
          tags: ['JavaScript', 'BootStrap4', 'centos8'],
        },
        {
          title: 'docker-compsoe for Django',
          desc: `Djangoのプロジェクトを最速で立ち上げられるどdocker-comspoe ファイルを作成しtemplateとしてgithubで共有しています。
          `,
          link: 'https://github.com/yuta-hidaka/Docker-Django-MariaDB-Gunicorn',
          tags: ['docker-compsoe', 'django'],
        },
      ],
      education: [
        {
          degree: '化学科第二部',
          institution: '東京理科大学(Tokyo University of Science)',
          startDate: 'Apl 2014',
          endDate: 'Apl 2017',
          description: `住友化学でのキャリアアップ、研究の基礎を習得したく、上司と相談しながら大学へ通学。
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
          title: '探究心',
          desc: `研究開発を行ってきたこともあり常に新しいことに挑戦し、問題について、細分化し問題に対して常に解を求めていきます。`,
        },
        {
          title: '好奇心',
          desc: `新しいものや技術にたいし抵抗や偏見をもたずに常に変化を受け入れるように心がけています`,
        },
        {
          title: 'プログラムに対する考え方',
          desc: `業務で今まで無駄であったこと、人に対して苦痛であったことをプログラムを通して解消していきたい。
          解消した先にある余った時間は家族や友人、パートナーと一緒に過ごす時間や自分の趣味など人として文化的な生活を送るための時間に対して割いて欲しい。
          無駄を省くだけではなく、今までになかったユニークなサービスで人々の生活の質を高めていけるようにしたい。
          ※非効率を効率化するプログラマーも終電まで残業・土日出勤がある会社様に違和感を感じております。
          `,
        },
        {
          title: '今後のキャリア',
          desc: `社会問題をプログラミング(広義ではIT)で解決するような業務に携わりたい。
          `,
        },
      ],
      skills: [
        { name: 'HTML5', percentage: '95%' },
        { name: 'CSS', percentage: '90%' },
        { name: 'JavaScript', percentage: '75%' },
        { name: 'Laravel', percentage: '50%' },
        { name: 'Django', percentage: '50%' },
        { name: 'Docker', percentage: '50%' },
      ],
    };

    return (
      <header>
        <div className="wrapper">
          <div className="sidebar">
            <Particles options={particlesOptions} />
            <About
              avatar={person.avatar}
              name={person.name}
              profession={person.profession}
              bio={person.bio}
              address={person.address}
              social={person.social}
            />
          </div>

          <div className="content-wrapper">
            <div className="content">
              <Education education={person.education} />
              <Experience experience={person.experience} />
              <SelfProject selfProject={person.selfProject} />
              <Motivation motivation ={person.motivation} />
              <Skills skills={person.skills} />
            </div>
          </div>
        </div>
      </header>
    );
  }
}

export default App;
