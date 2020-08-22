import React, { Component } from 'react';
import About from './components/About';
import Experience from './components/Experience';
import Education from './components/Education';
import Certificate from './components/Certificate';
import Skills from './components/Skills';
import avatar from './img/yuta.jpg';
import particlesOptions from './assets/particle.json';
import Particles from 'react-tsparticles';

class App extends Component {
  render() {
    const person = {
      avatar: avatar,
      name: '日髙　悠太',
      profession: 'Backend Developer',
      bio: 'This page created by React.js :)',
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
          startDate: 'Apl 2012',
          endDate: 'Mar 2015',
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
          startDate: 'Apl 2015',
          endDate: 'Mar 2016',
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
          startDate: 'Apl 2016',
          endDate: 'Mar 2018',
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
          startDate: 'Apl 2018',
          endDate: 'Sept 2018',
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
          jobTitle: '研修',
          company: 'シスナビ/Sysnavi',
          tags: ['', ''],
          startDate: 'Apl 2016',
          endDate: 'Mar 2018',
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
          tags: ['ASP.Net C#', 'SQL Sever', 'BootStrap4'],
          startDate: 'Dec 2029',
          endDate: 'Feb 2020',
          jobDescriptions: [
            {
              title: '技術',
              jd: `バックエンド：ASP.NET C#
          フロントエンド：ASP.NET C#によるRazor記法でのサーバーサイドレンダリング,jQuery`,
            },
            {
              title: '業務内容',
              jd: `SESとして、客先に常駐して作業を行う。
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
      certificate: [
        {
          name: 'FrontEnd Developer',
          institution: 'Platzi',
          date: 'Jan 2015',
          description: 'Aenean commodo ligula eget dolor. Aenean massa.',
        },
        {
          name: 'Backend Developer',
          institution: 'Platzi',
          date: 'Jan 2016',
          description: 'Aenean commodo ligula eget dolor. Aenean massa.',
        },
      ],
      skills: [
        { name: 'HTML5', percentage: '95%' },
        { name: 'CSS', percentage: '90%' },
        { name: 'JavaScript', percentage: '75%' },
        { name: 'PHP', percentage: '50%' },
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
              <Experience experience={person.experience} />
              <Education education={person.education} />
              <Certificate certificate={person.certificate} />
              <Skills skills={person.skills} />
            </div>
          </div>
        </div>
      </header>
    );
  }
}

export default App;
