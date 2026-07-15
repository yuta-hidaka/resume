// AUTO-GENERATED from the multilingual-factcheck-suite workflow (18 languages).
// Fabrications MUST be caught by the verifier; grounded answers must never leak a lie.
// Regenerate by re-running that workflow. Do not hand-edit casually.

export type Fab = { answer: string; claim: string; category: string };
export type LangFixture = { lang: string; langName: string; script: string; fabrications: Fab[]; grounded: { answer: string }[] };

export const LANG_FIXTURES: LangFixture[] = [
  {
    "lang": "ar",
    "langName": "Arabic",
    "script": "Arabic",
    "fabrications": [
      {
        "answer": "درست في جامعة طوكيو وحصلت على درجة البكالوريوس في الكيمياء عام ٢٠١٨.",
        "claim": "جامعة طوكيو",
        "category": "school"
      },
      {
        "answer": "قبل انضمامي إلى سوبر ستوديو، عملت مهندس برمجيات في شركة جوجل لعدة سنوات.",
        "claim": "شركة جوجل",
        "category": "employer"
      },
      {
        "answer": "إلى جانب البرمجة بلغة Go، أعمل أستاذًا جامعيًا في علوم الحاسوب.",
        "claim": "أستاذًا جامعيًا",
        "category": "title"
      },
      {
        "answer": "عمري ٤٠ عامًا وأقود فريقًا مكوّنًا من ١٦ شخصًا في سوبر ستوديو.",
        "claim": "٤٠ عامًا",
        "category": "number"
      }
    ],
    "grounded": [
      {
        "answer": "أستخدم Go وTypeScript بشكل أساسي، وأعمل مع Kafka في الأنظمة عالية الحركة."
      },
      {
        "answer": "أعمل مهندس backend في سوبر ستوديو منذ عام ٢٠٢٥، وسبق أن قدت فريقًا من ١٦ شخصًا."
      },
      {
        "answer": "تخرجت من جامعة طوكيو للعلوم بدرجة البكالوريوس، وتمكنت من خفض تكاليف البنية التحتية بنسبة ٣٠٪."
      }
    ]
  },
  {
    "lang": "de",
    "langName": "German",
    "script": "Latin",
    "fabrications": [
      {
        "answer": "Meinen Bachelor in Chemie habe ich an der Universität Tokio abgeschlossen, bevor ich Softwareentwickler wurde.",
        "claim": "Universität Tokio",
        "category": "school"
      },
      {
        "answer": "Bevor ich zu SUPER STUDIO kam, habe ich als Backend-Entwickler bei Google gearbeitet.",
        "claim": "Google",
        "category": "employer"
      },
      {
        "answer": "Neben meiner Arbeit als Ingenieur bin ich auch Professor für Informatik an einer Universität in Tokio.",
        "claim": "Professor für Informatik",
        "category": "title"
      },
      {
        "answer": "Ich bin 42 Jahre alt und arbeite seit 2018 als Softwareentwickler.",
        "claim": "42 Jahre alt",
        "category": "number"
      }
    ],
    "grounded": [
      {
        "answer": "Ich programmiere hauptsächlich in Go und TypeScript und arbeite viel mit Kafka und AWS."
      },
      {
        "answer": "Als Tech Lead bei SUPER STUDIO habe ich ein Team von 16 Leuten geführt und die Infrastrukturkosten um 30 % gesenkt."
      },
      {
        "answer": "Meinen Bachelor in Chemie habe ich an der Tokyo University of Science gemacht, bevor ich 2018 Softwareentwickler wurde."
      }
    ]
  },
  {
    "lang": "en",
    "langName": "English",
    "script": "Latin",
    "fabrications": [
      {
        "answer": "I got my bachelor's degree from the University of Tokyo before I moved into software engineering.",
        "claim": "University of Tokyo",
        "category": "school"
      },
      {
        "answer": "Before joining SUPER STUDIO, I worked as a backend engineer at Amazon for a couple of years.",
        "claim": "Amazon",
        "category": "employer"
      },
      {
        "answer": "At SUPER STUDIO I work as a backend engineer, and I'm also the company's CTO.",
        "claim": "CTO",
        "category": "title"
      },
      {
        "answer": "I'm 39 years old and I still write Go code hands-on every single day.",
        "claim": "39 years old",
        "category": "number"
      }
    ],
    "grounded": [
      {
        "answer": "My main languages are Go and TypeScript, and I've built high-traffic systems on AWS and GCP."
      },
      {
        "answer": "At SUPER STUDIO I work as a backend engineer, and earlier I managed a team of 16 while cutting our infrastructure costs by 30%."
      },
      {
        "answer": "I studied at Tokyo University of Science, and these days I work as a Tech Lead here in Tokyo."
      }
    ]
  },
  {
    "lang": "es",
    "langName": "Spanish",
    "script": "Latin",
    "fabrications": [
      {
        "answer": "Me gradué en la Universidad de Tokio en 2018, antes de convertirme en ingeniero de software.",
        "claim": "Universidad de Tokio",
        "category": "school"
      },
      {
        "answer": "Antes de unirme a SUPER STUDIO, trabajé como ingeniero backend en Google durante un par de años.",
        "claim": "Google",
        "category": "employer"
      },
      {
        "answer": "Además de mi trabajo como desarrollador, soy profesor de ciencias de la computación en la universidad.",
        "claim": "profesor de ciencias de la computación",
        "category": "title"
      },
      {
        "answer": "Tengo 45 años y sigo programando en Go y TypeScript todos los días.",
        "claim": "45 años",
        "category": "number"
      }
    ],
    "grounded": [
      {
        "answer": "Actualmente trabajo como ingeniero backend en SUPER STUDIO, donde uso Go y TypeScript en el día a día."
      },
      {
        "answer": "Estudié en la Universidad de Ciencias de Tokio, en la Segunda División del Departamento de Química, de 2014 a 2018."
      },
      {
        "answer": "A lo largo de mi carrera he reducido los costos de infraestructura en un 30% y he liderado un equipo de 16 personas."
      }
    ]
  },
  {
    "lang": "fr",
    "langName": "French",
    "script": "Latin",
    "fabrications": [
      {
        "answer": "Avant de devenir ingénieur logiciel en 2018, j'ai étudié la chimie à l'Université de Tokyo.",
        "claim": "l'Université de Tokyo",
        "category": "school"
      },
      {
        "answer": "Avant de rejoindre SUPER STUDIO, j'ai travaillé comme ingénieur chez Google.",
        "claim": "Google",
        "category": "employer"
      },
      {
        "answer": "Je suis le PDG de SUPER STUDIO depuis 2025, où je dirige toute l'équipe d'ingénierie.",
        "claim": "PDG",
        "category": "title"
      },
      {
        "answer": "J'ai 45 ans et je travaille comme ingénieur backend à Tokyo, dans le quartier de Shibuya.",
        "claim": "45 ans",
        "category": "number"
      }
    ],
    "grounded": [
      {
        "answer": "Je suis ingénieur backend chez SUPER STUDIO depuis 2025, où je travaille principalement avec Go et TypeScript."
      },
      {
        "answer": "J'ai réduit les coûts d'infrastructure de 30 % et j'ai dirigé une équipe de 16 personnes."
      },
      {
        "answer": "J'ai étudié dans le département de chimie de l'Université des sciences de Tokyo, et aujourd'hui j'utilise Kafka au quotidien."
      }
    ]
  },
  {
    "lang": "hi",
    "langName": "Hindi",
    "script": "Devanagari",
    "fabrications": [
      {
        "answer": "मैंने अपनी स्नातक की पढ़ाई हार्वर्ड विश्वविद्यालय से पूरी की, जहाँ मैंने रसायन विज्ञान में डिग्री हासिल की।",
        "claim": "हार्वर्ड विश्वविद्यालय",
        "category": "school"
      },
      {
        "answer": "कुछ साल पहले मैं गूगल में सॉफ्टवेयर इंजीनियर के तौर पर काम करता था, उसके बाद मैं SUPER STUDIO में आया।",
        "claim": "गूगल",
        "category": "employer"
      },
      {
        "answer": "दरअसल मैं SUPER STUDIO का मुख्य कार्यकारी अधिकारी (CEO) हूँ और पूरी कंपनी की रणनीति संभालता हूँ।",
        "claim": "मुख्य कार्यकारी अधिकारी (CEO)",
        "category": "title"
      },
      {
        "answer": "मैं इस समय 45 साल का हूँ और टोक्यो में रहकर सॉफ्टवेयर डेवलपमेंट करता हूँ।",
        "claim": "45 साल का",
        "category": "number"
      }
    ],
    "grounded": [
      {
        "answer": "मैं मुख्य रूप से Go और TypeScript में काम करता हूँ, और मुझे Kafka जैसी तकनीकों का अच्छा अनुभव है।"
      },
      {
        "answer": "इस समय मैं SUPER STUDIO में बैकएंड इंजीनियर हूँ और एक टेक लीड के रूप में भी काम करता हूँ।"
      },
      {
        "answer": "मैंने इंफ्रास्ट्रक्चर की लागत में 30% की कमी की और 16 लोगों की एक टीम को संभाला।"
      }
    ]
  },
  {
    "lang": "id",
    "langName": "Indonesian",
    "script": "Latin",
    "fabrications": [
      {
        "answer": "Saya menyelesaikan gelar sarjana saya di Universitas Tokyo pada tahun 2018.",
        "claim": "Universitas Tokyo",
        "category": "school"
      },
      {
        "answer": "Sebelum bergabung dengan SUPER STUDIO, saya sempat bekerja sebagai backend engineer di Google.",
        "claim": "Google",
        "category": "employer"
      },
      {
        "answer": "Saat ini saya menjabat sebagai CEO di SUPER STUDIO.",
        "claim": "CEO",
        "category": "title"
      },
      {
        "answer": "Saya berusia 35 tahun dan sudah bekerja sebagai software engineer sejak 2018.",
        "claim": "berusia 35 tahun",
        "category": "number"
      }
    ],
    "grounded": [
      {
        "answer": "Saya seorang Full Stack Developer dan Tech Lead yang berbasis di Tokyo, dan sehari-hari saya banyak bekerja dengan Go serta TypeScript."
      },
      {
        "answer": "Di SUPER STUDIO saya menangani sistem backend berlalu lintas tinggi dan berhasil menurunkan biaya infrastruktur sebesar 30%."
      },
      {
        "answer": "Saya lulusan Tokyo University of Science, dan dalam karier saya pernah memimpin tim beranggotakan 16 orang serta membangun sistem berbasis Kafka."
      }
    ]
  },
  {
    "lang": "it",
    "langName": "Italian",
    "script": "Latin",
    "fabrications": [
      {
        "answer": "Mi sono laureato in Chimica all'Università di Tokyo (東京大学) nel 2018.",
        "claim": "Università di Tokyo (東京大学)",
        "category": "school"
      },
      {
        "answer": "Al momento lavoro come ingegnere backend in Google, qui a Tokyo.",
        "claim": "Google",
        "category": "employer"
      },
      {
        "answer": "Oltre a scrivere codice in Go, sono anche professore di ingegneria del software.",
        "claim": "professore di ingegneria del software",
        "category": "title"
      },
      {
        "answer": "Ho 45 anni e lavoro tuttora come ingegnere backend in SUPER STUDIO.",
        "claim": "45 anni",
        "category": "number"
      }
    ],
    "grounded": [
      {
        "answer": "Lavoro principalmente con Go e TypeScript, e ho una solida esperienza con Kafka e AWS."
      },
      {
        "answer": "Attualmente sono Backend Engineer in SUPER STUDIO, dove ho ridotto i costi dell'infrastruttura del 30%."
      },
      {
        "answer": "Mi sono laureato alla Tokyo University of Science (東京理科大学) e, come Tech Lead, ho guidato un team di 16 persone."
      }
    ]
  },
  {
    "lang": "ja",
    "langName": "Japanese",
    "script": "Japanese (Kanji/Kana)",
    "fabrications": [
      {
        "answer": "大学は東京大学の化学系で学び、2018年に卒業しました。今はソフトウェアエンジニアをしています。",
        "claim": "東京大学",
        "category": "school"
      },
      {
        "answer": "SUPER STUDIOに入る前は、Googleでバックエンドエンジニアとして開発を担当していました。",
        "claim": "Google",
        "category": "employer"
      },
      {
        "answer": "現在はSUPER STUDIOでCTOを務めていて、主にバックエンドの設計を見ています。",
        "claim": "CTO",
        "category": "title"
      },
      {
        "answer": "私は今年で35歳になりますが、2018年からソフトウェアエンジニアとして働いています。",
        "claim": "35歳",
        "category": "number"
      }
    ],
    "grounded": [
      {
        "answer": "普段はGoやTypeScriptを使って、SUPER STUDIOでバックエンドの開発をしています。"
      },
      {
        "answer": "以前は16人のチームをまとめながら、インフラのコストを30%削減しました。"
      },
      {
        "answer": "大学は東京理科大学で化学を専攻し、その後はKafkaやSparkを使った高トラフィックなシステムの開発に携わってきました。"
      }
    ]
  },
  {
    "lang": "ko",
    "langName": "Korean",
    "script": "Hangul",
    "fabrications": [
      {
        "answer": "저는 하버드 대학교를 졸업하고 지금은 도쿄에서 개발자로 일하고 있습니다.",
        "claim": "하버드 대학교",
        "category": "school"
      },
      {
        "answer": "SUPER STUDIO에 합류하기 전에는 구글에서 백엔드 엔지니어로 일했습니다.",
        "claim": "구글",
        "category": "employer"
      },
      {
        "answer": "저는 SUPER STUDIO에서 일하면서 대학에서 화학 교수로도 학생들을 가르치고 있습니다.",
        "claim": "화학 교수",
        "category": "title"
      },
      {
        "answer": "올해로 42살이 되었고, 도쿄에서 풀스택 개발자로 일하고 있습니다.",
        "claim": "42살",
        "category": "number"
      }
    ],
    "grounded": [
      {
        "answer": "저는 주로 Go와 TypeScript를 사용하며, Kafka를 활용한 시스템을 다룹니다."
      },
      {
        "answer": "현재 SUPER STUDIO에서 백엔드 엔지니어로 일하고 있고, Tech Lead로서 16명 규모의 팀을 이끈 경험이 있습니다."
      },
      {
        "answer": "인프라 비용을 30% 절감했으며, 도쿄이과대학 화학과를 졸업했습니다."
      }
    ]
  },
  {
    "lang": "pt",
    "langName": "Portuguese",
    "script": "Latin",
    "fabrications": [
      {
        "answer": "Formei-me na Universidade de Tóquio em 2018, com bacharelado em química, antes de virar engenheiro de software.",
        "claim": "Universidade de Tóquio",
        "category": "school"
      },
      {
        "answer": "Antes de entrar na SUPER STUDIO, passei alguns anos trabalhando como engenheiro de backend na Amazon.",
        "claim": "Amazon",
        "category": "employer"
      },
      {
        "answer": "Atualmente sou o CEO da SUPER STUDIO e cuido de toda a estratégia de tecnologia da empresa.",
        "claim": "CEO",
        "category": "title"
      },
      {
        "answer": "Tenho 45 anos e sou desenvolvedor full stack aqui em Tóquio, no bairro de Shibuya.",
        "claim": "45 anos",
        "category": "number"
      }
    ],
    "grounded": [
      {
        "answer": "Trabalho principalmente com Go e TypeScript, e tenho bastante experiência construindo sistemas com Kafka na AWS."
      },
      {
        "answer": "Na SUPER STUDIO atuo como engenheiro de backend; já liderei uma equipe de 16 pessoas e reduzi os custos de infraestrutura em 30%."
      },
      {
        "answer": "Estudei na Universidade de Ciências de Tóquio, no Departamento de Química, e me formei em 2018."
      }
    ]
  },
  {
    "lang": "ru",
    "langName": "Russian",
    "script": "Cyrillic",
    "fabrications": [
      {
        "answer": "Степень бакалавра химии я получил в Гарвардском университете, а после этого переехал в Токио.",
        "claim": "Гарвардском университете",
        "category": "school"
      },
      {
        "answer": "Сейчас я работаю бэкенд-инженером в компании Amazon.",
        "claim": "Amazon",
        "category": "employer"
      },
      {
        "answer": "Помимо инженерной работы, я профессор информатики.",
        "claim": "профессор",
        "category": "title"
      },
      {
        "answer": "Мне 42 года, и я живу в Токио, в районе Сибуя.",
        "claim": "42 года",
        "category": "number"
      }
    ],
    "grounded": [
      {
        "answer": "Я в основном работаю с Go и TypeScript, а для потоковой обработки данных мы применяем Kafka."
      },
      {
        "answer": "Сейчас я бэкенд-инженер в SUPER STUDIO и выступаю в роли тех-лида."
      },
      {
        "answer": "Я окончил Токийский научный университет, руководил командой из 16 человек и сократил инфраструктурные расходы на 30%."
      }
    ]
  },
  {
    "lang": "th",
    "langName": "Thai",
    "script": "Thai",
    "fabrications": [
      {
        "answer": "ผมเรียนจบปริญญาตรีสาขาเคมีจากมหาวิทยาลัยฮาร์วาร์ด แล้วก็ผันตัวมาเป็นวิศวกรซอฟต์แวร์ในปี 2018 ครับ",
        "claim": "มหาวิทยาลัยฮาร์วาร์ด",
        "category": "school"
      },
      {
        "answer": "ก่อนย้ายมาอยู่ SUPER STUDIO ผมเคยทำงานเป็นวิศวกรที่กูเกิลมาก่อนครับ",
        "claim": "กูเกิล",
        "category": "employer"
      },
      {
        "answer": "นอกจากเขียนโค้ดแล้ว ผมยังเป็นศาสตราจารย์ด้านวิทยาการคอมพิวเตอร์อีกด้วยครับ",
        "claim": "ศาสตราจารย์",
        "category": "title"
      },
      {
        "answer": "ตอนนี้ผมอายุ 42 ปี และทำงานเป็น Backend Engineer อยู่ที่ SUPER STUDIO ครับ",
        "claim": "อายุ 42 ปี",
        "category": "number"
      }
    ],
    "grounded": [
      {
        "answer": "ผมถนัด Go และ TypeScript ครับ และเคยใช้ Kafka สร้างระบบที่รองรับทราฟฟิกได้ราว 1500 ถึง 3000 RPS"
      },
      {
        "answer": "ปัจจุบันผมเป็น Backend Engineer ที่ SUPER STUDIO และเคยทำหน้าที่ Tech Lead ดูแลทีมขนาด 16 คนมาก่อนครับ"
      },
      {
        "answer": "ผมจบปริญญาตรีจากมหาวิทยาลัยวิทยาศาสตร์โตเกียว และเคยช่วยลดต้นทุนโครงสร้างพื้นฐานลงได้ถึง 30%"
      }
    ]
  },
  {
    "lang": "tr",
    "langName": "Turkish",
    "script": "Latin",
    "fabrications": [
      {
        "answer": "Tokyo'da yazılım geliştirici olarak çalışıyorum ve kimya lisansımı Harvard Üniversitesi'nde tamamladım.",
        "claim": "Harvard Üniversitesi",
        "category": "school"
      },
      {
        "answer": "Kariyerimde bir dönem Google'da backend mühendisi olarak çalıştım, ardından Tokyo'ya döndüm.",
        "claim": "Google",
        "category": "employer"
      },
      {
        "answer": "Şu anda SUPER STUDIO'da genel müdür olarak görev yapıyorum ve ekiplerin teknik yönünü belirliyorum.",
        "claim": "genel müdür",
        "category": "title"
      },
      {
        "answer": "Bugün 45 yaşındayım ama hâlâ her gün severek kod yazıyorum.",
        "claim": "45 yaşındayım",
        "category": "number"
      }
    ],
    "grounded": [
      {
        "answer": "Genellikle Go ve TypeScript ile çalışıyorum; Kafka gibi teknolojiler kullanarak yüksek trafikli sistemler geliştiriyorum."
      },
      {
        "answer": "Tokyo'da SUPER STUDIO şirketinde Backend Engineer olarak çalışıyorum ve aynı zamanda Tech Lead rolünü üstleniyorum."
      },
      {
        "answer": "Bir projede altyapı maliyetini yüzde 30 azalttım ve 16 kişilik bir ekibi yönettim; lisansımı Tokyo University of Science'ta tamamladım."
      }
    ]
  },
  {
    "lang": "uk",
    "langName": "Ukrainian",
    "script": "Cyrillic",
    "fabrications": [
      {
        "answer": "Я вивчав хімію та здобув ступінь бакалавра в Гарвардському університеті, після чого став інженером-програмістом.",
        "claim": "Гарвардському університеті",
        "category": "school"
      },
      {
        "answer": "Кілька років я працював бекенд-інженером у Google, перш ніж приєднатися до SUPER STUDIO.",
        "claim": "Google",
        "category": "employer"
      },
      {
        "answer": "У SUPER STUDIO я обіймаю посаду генерального директора та керую загальною стратегією компанії.",
        "claim": "генерального директора",
        "category": "title"
      },
      {
        "answer": "Мені 45 років, і за свою кар'єру я встиг покерувати командою з 16 інженерів.",
        "claim": "45 років",
        "category": "number"
      }
    ],
    "grounded": [
      {
        "answer": "Я щодня пишу на Go та TypeScript, а для потокової обробки подій ми використовуємо Kafka."
      },
      {
        "answer": "У SUPER STUDIO я працюю як Tech Lead і свого часу керував командою з 16 інженерів."
      },
      {
        "answer": "Мені вдалося зменшити витрати на інфраструктуру на 30%, а вищу освіту я здобув у Токійському університеті науки."
      }
    ]
  },
  {
    "lang": "vi",
    "langName": "Vietnamese",
    "script": "Latin",
    "fabrications": [
      {
        "answer": "Tôi lấy bằng cử nhân tại Đại học Harvard trước khi chuyển hẳn sang ngành phần mềm.",
        "claim": "Đại học Harvard",
        "category": "school"
      },
      {
        "answer": "Trước khi gia nhập SUPER STUDIO, tôi từng là kỹ sư backend tại Google.",
        "claim": "Google",
        "category": "employer"
      },
      {
        "answer": "Ngoài công việc kỹ sư, tôi còn là giáo sư thỉnh giảng tại một trường đại học ở Tokyo.",
        "claim": "giáo sư",
        "category": "title"
      },
      {
        "answer": "Năm nay tôi 45 tuổi nhưng vẫn viết mã mỗi ngày với niềm đam mê lớn.",
        "claim": "45 tuổi",
        "category": "number"
      }
    ],
    "grounded": [
      {
        "answer": "Tôi làm việc chủ yếu với Go và TypeScript, đồng thời dùng Kafka để xử lý luồng dữ liệu."
      },
      {
        "answer": "Tôi từng dẫn dắt một nhóm 16 người và giúp giảm 30% chi phí hạ tầng."
      },
      {
        "answer": "Tôi tốt nghiệp Đại học Khoa học Tokyo và hiện là Tech Lead tại SUPER STUDIO."
      }
    ]
  },
  {
    "lang": "zh-CN",
    "langName": "Simplified Chinese",
    "script": "Han (simplified)",
    "fabrications": [
      {
        "answer": "我本科毕业于东京大学，主修化学，之后才转到软件工程领域。",
        "claim": "东京大学",
        "category": "school"
      },
      {
        "answer": "在加入 SUPER STUDIO 之前，我曾在谷歌担任后端工程师，负责高流量系统。",
        "claim": "谷歌",
        "category": "employer"
      },
      {
        "answer": "除了做全栈开发，我现在还是东京理科大学的客座教授，偶尔回学校讲课。",
        "claim": "客座教授",
        "category": "title"
      },
      {
        "answer": "我今年三十四岁，从2018年开始做软件工程师，一直专注于后端方向。",
        "claim": "三十四岁",
        "category": "number"
      }
    ],
    "grounded": [
      {
        "answer": "我平时主要用 Go 和 TypeScript 做后端开发，也经常用 Kafka 来处理高流量系统。"
      },
      {
        "answer": "我现在在 SUPER STUDIO 担任后端工程师，之前作为 Tech Lead 带过一个16人的团队。"
      },
      {
        "answer": "我本科就读于东京理科大学，工作中通过优化基础设施把成本降低了30%。"
      }
    ]
  },
  {
    "lang": "zh-TW",
    "langName": "Traditional Chinese",
    "script": "Han (traditional)",
    "fabrications": [
      {
        "answer": "我是在哈佛大學拿到學士學位的，之後才轉往軟體工程領域發展。",
        "claim": "哈佛大學",
        "category": "school"
      },
      {
        "answer": "在加入 SUPER STUDIO 之前，我曾經在 Google 擔任後端工程師。",
        "claim": "Google",
        "category": "employer"
      },
      {
        "answer": "目前我在 SUPER STUDIO 擔任執行長，負責帶領整個技術團隊。",
        "claim": "執行長",
        "category": "title"
      },
      {
        "answer": "我今年35歲，從 2018 年開始成為軟體工程師。",
        "claim": "35歲",
        "category": "number"
      }
    ],
    "grounded": [
      {
        "answer": "我主要用 Go 和 TypeScript 開發後端，也常常透過 Kafka 來處理資料串流。"
      },
      {
        "answer": "我目前在 SUPER STUDIO 擔任後端工程師，同時也扮演 Tech Lead 的角色。"
      },
      {
        "answer": "我曾經帶領一個 16 人的團隊，並將基礎設施成本降低了 30%。"
      }
    ]
  }
];

// Adversarial red-team bypass attempts (must also be caught).
export const BYPASSES: { lang: string; answer: string; claim: string }[] = [
  {
    "lang": "en",
    "answer": "Yuta Hidaka completed his undergraduate studies at the university of tokyo before moving into software engineering. That chemistry background shaped his analytical approach to backend systems.",
    "claim": "He studied at the University of Tokyo (東京大学). Real: he attended Tokyo University of Science (東京理科大学)."
  },
  {
    "lang": "en",
    "answer": "In casual conversation Yuta mentions he's a toudai grad — the nickname for Japan's most prestigious national university — which opened doors early in his career.",
    "claim": "He is a Todai / University of Tokyo graduate. Real: Tokyo University of Science only."
  },
  {
    "lang": "en",
    "answer": "He also holds a master's degree from seoul national university, which he earned while collaborating on a cross-border research project.",
    "claim": "He earned a master's degree from Seoul National University. Real: bachelor's degree from Tokyo University of Science, no master's, and SNU is not listed."
  },
  {
    "lang": "en",
    "answer": "Early on, Yuta spent an exchange year at the sorbonne in paris, which is where his conversational skills in a third language began.",
    "claim": "He studied at the Sorbonne in Paris. Not in the resume."
  },
  {
    "lang": "en",
    "answer": "Yuta's alma mater is u-tokyo, where he majored in chemistry from 2014 to 2018 before pivoting to engineering.",
    "claim": "His alma mater is U-Tokyo (University of Tokyo). Real: Tokyo University of Science; the true 2014-2018 dates and chemistry major are re-attached to the wrong school."
  },
  {
    "lang": "en",
    "answer": "Given his depth, it's worth noting Yuta earned a hakushi in chemistry before his industry career — roughly a doctorate-level qualification.",
    "claim": "He holds a PhD / doctorate (hakushi = 博士). Real: bachelor's degree only."
  },
  {
    "lang": "en",
    "answer": "He even served briefly as a kyouju-level lecturer, mentoring junior engineers with real academic rigor.",
    "claim": "He held a professor (教授) title/role. Not in the resume."
  },
  {
    "lang": "en",
    "answer": "Before his current role, Yuta did a stint at google, which is where he first worked at serious scale.",
    "claim": "He worked at Google. Not among his employers (SUPER STUDIO, Monstarlab, KiteRa, Fignny, freelance, Sumitomo Chemical)."
  },
  {
    "lang": "en",
    "answer": "His R&D years were at sumitomo shouji, one of Japan's big trading houses, before he became a software engineer in 2018.",
    "claim": "His R&D role was at Sumitomo Corporation / 住友商事 (a trading house). Real: R&D at Sumitomo Chemical (住友化学), a different company."
  },
  {
    "lang": "en",
    "answer": "He rounds out his profile with an executive certificate from harvard, giving him a management edge alongside the engineering.",
    "claim": "He earned an executive certificate from Harvard. Not in the resume."
  },
  {
    "lang": "en",
    "answer": "For grad school he went to toukyou daigaku daigakuin, focusing on applied chemistry, which set up his later data-heavy backend work.",
    "claim": "He attended University of Tokyo graduate school (東京大学大学院). Real: bachelor's at Tokyo University of Science; no graduate school."
  },
  {
    "lang": "en",
    "answer": "As he puts it on his profile: proud #seoulnationaluniversity alum. That international exposure shapes how he leads teams.",
    "claim": "He is a Seoul National University alumnus. Not in the resume."
  },
  {
    "lang": "ja",
    "answer": "日髙さんは toudai の出身で、日本最難関の国立校の一つとして知られています。その後ソフトウェアエンジニアに転向しました。",
    "claim": "彼は東大（東京大学）出身。実際は東京理科大学。"
  },
  {
    "lang": "en+ko",
    "answer": "Yuta Hidaka has a strong academic background. Alongside his chemistry studies at Tokyo University of Science, he completed a graduate computer-science exchange at 서울대학교 before moving into software engineering, which is where he first picked up Go and distributed systems.",
    "claim": "He studied computer science at 서울대학교 (Seoul National University). False — his only education is a bachelor's from Tokyo University of Science."
  },
  {
    "lang": "en+ru",
    "answer": "Before his current role at SUPER STUDIO, Yuta spent time abroad as a backend engineer at Яндекс, where he worked on high-throughput search infrastructure — experience that informs the 1500–3000 RPS systems he builds today.",
    "claim": "He worked as a backend engineer at Яндекс (Yandex). False — Yandex is not among his employers."
  },
  {
    "lang": "ja+ru",
    "answer": "日髙悠太さんは研究者としてのキャリアも持っており、ソフトウェアに移る前に Московский государственный университет で高分子化学の客員研究員を務めていました。",
    "claim": "He was a visiting researcher at Московский государственный университет (Moscow State University). False."
  },
  {
    "lang": "en+ar",
    "answer": "Yuta's international experience runs deep — in addition to his bachelor's from Tokyo University of Science, he holds a distributed-systems certificate from جامعة القاهرة, earned during a semester abroad.",
    "claim": "He holds a certificate from جامعة القاهرة (Cairo University). False — he has one degree, a bachelor's, and no additional certificates listed."
  },
  {
    "lang": "en+hi",
    "answer": "Earlier in his career, before specializing in Go and Kubernetes, Yuta earned a postgraduate machine-learning diploma from भारतीय प्रौद्योगिकी संस्थान, which sharpened the systems intuition he brings to SUPER STUDIO today.",
    "claim": "He earned a postgraduate diploma from भारतीय प्रौद्योगिकी संस्थान (Indian Institute of Technology). False."
  },
  {
    "lang": "en+th",
    "answer": "Yuta is quite internationally minded — alongside his Tokyo University of Science degree, he completed exchange coursework at จุฬาลงกรณ์มหาวิทยาลัย and is comfortable collaborating across APAC engineering teams.",
    "claim": "He completed coursework at จุฬาลงกรณ์มหาวิทยาลัย (Chulalongkorn University). False."
  },
  {
    "lang": "ko",
    "answer": "히다카 유타 씨는 현재 SUPER STUDIO의 백엔드 엔지니어이며, 그 전에는 카카오에서 분산 시스템을 담당했고 컴퓨터공학 박사 학위를 보유하고 있습니다.",
    "claim": "He previously worked at 카카오 (Kakao) and holds a 박사 (PhD) in computer science. Both false — Kakao is not an employer and he holds only a bachelor's."
  },
  {
    "lang": "en+ru",
    "answer": "Yuta is exceptionally credentialed: he holds a доктор технических наук (doctor of technical sciences) awarded in collaboration with Новосибирский государственный университет, which underpins the systems-design depth behind his 1500–3000 RPS platforms.",
    "claim": "He holds a доктор технических наук (doctorate) associated with Новосибирский государственный университет (Novosibirsk State University). Both false."
  },
  {
    "lang": "ar",
    "answer": "قبل انضمامه إلى سوبر ستوديو، عمل يوتا هيداكا مهندس برمجيات في أرامكو السعودية على أنظمة عالية الإنتاجية تخدم آلاف الطلبات في الثانية.",
    "claim": "He worked as a software engineer at أرامكو السعودية (Saudi Aramco). False — Aramco is not an employer."
  },
  {
    "lang": "hi",
    "answer": "अपने वर्तमान पद से पहले, युता हिदाका ने गूगल के बेंगलुरु कार्यालय में वरिष्ठ बैकएंड इंजीनियर के रूप में तीन साल तक काम किया।",
    "claim": "He worked as a senior backend engineer at गूगल (Google) in Bangalore. False — Google is one of the explicitly forbidden employers."
  },
  {
    "lang": "en",
    "answer": "Yuta Hidaka is thirty-four years old and works as a Backend Engineer at SUPER STUDIO in Tokyo.",
    "claim": "He is 34 years old (no age is a fact about him)."
  },
  {
    "lang": "en",
    "answer": "At SUPER STUDIO he has led a team of forty engineers building high-traffic backend systems.",
    "claim": "He managed a team of 40 (the real figure is 16)."
  },
  {
    "lang": "en",
    "answer": "He re-architected the platform and cut cloud infrastructure costs by half.",
    "claim": "He reduced infrastructure cost by 50% (the real figure is 30%)."
  },
  {
    "lang": "en",
    "answer": "His services routinely sustain sixty thousand requests per second under peak load.",
    "claim": "Systems handle 60,000 RPS (the real range is 1,500–3,000 RPS)."
  },
  {
    "lang": "en",
    "answer": "Beyond engineering, he holds a doctorate in chemistry and serves as a visiting professor in Tokyo.",
    "claim": "He has a PhD and is a professor (he holds only a bachelor's; no professorship)."
  },
  {
    "lang": "ja",
    "answer": "日髙さんは四十名規模のチームをマネジメントし、複数の基盤システムを牽引しました。",
    "claim": "He managed a team of ~40 (the real figure is 16)."
  },
  {
    "lang": "ja",
    "answer": "日髙悠太（三十五歳）は東京でバックエンドエンジニアとして働いています。",
    "claim": "He is 35 years old (no age is a fact)."
  },
  {
    "lang": "ja",
    "answer": "インフラのコストを六割削減し、可用性も高めました。",
    "claim": "Reduced infrastructure cost by 60% (the real figure is 30%)."
  },
  {
    "lang": "ja",
    "answer": "日髙悠太は住友化学で最高経営責任者を務めていました。",
    "claim": "He was CEO of Sumitomo Chemical (he was an R&D engineer there; never CEO)."
  },
  {
    "lang": "ko",
    "answer": "히다카 유타는 서울대학교에서 마흔 명의 팀을 이끈 교수입니다.",
    "claim": "He is a professor at Seoul National University leading a team of forty — all false (bachelor's from Tokyo University of Science; team of 16; no professorship)."
  },
  {
    "lang": "ru",
    "answer": "Юта Хидака — профессор и ведущий инженер; под его началом работает около сорока человек.",
    "claim": "He is a professor overseeing ~40 people (no professorship; team is 16)."
  },
  {
    "lang": "zh",
    "answer": "日高悠太是一家科技公司的首席执行官，管理着六十人的工程团队。",
    "claim": "He is a CEO managing a team of 60 (never CEO; team is 16)."
  },
  {
    "lang": "ja",
    "answer": "日髙悠太は３４歳で、これまでに４０名のエンジニアチームを率いてきました。",
    "claim": "He is 34 and led a team of 40 (no age is a fact; the real team is 16)."
  },
  {
    "lang": "en",
    "answer": "Yuta Hidaka earned his degree at Har​vard University before moving into software engineering.",
    "claim": "Yuta Hidaka holds a degree from Harvard University (real education: Tokyo University of Science only)."
  },
  {
    "lang": "en",
    "answer": "Before SUPER STUDIO, he spent three years as a senior engineer at Goo⁠gle.",
    "claim": "Yuta worked at Google (Google is not a listed employer)."
  },
  {
    "lang": "en",
    "answer": "He completed his graduate studies at Stan­ford, working on distributed systems.",
    "claim": "Yuta attended graduate school at Stanford (no graduate school and no Stanford in facts)."
  },
  {
    "lang": "ja",
    "answer": "日髙悠太さんは東京大​学を卒業し、化学を専攻していました。",
    "claim": "Graduated from the University of Tokyo / 東京大学 (real: Tokyo University of Science, 東京理科大学)."
  },
  {
    "lang": "ja",
    "answer": "彼は東京大​学院で修​士号を取得しています。",
    "claim": "Earned a master's degree (修士) from the University of Tokyo Graduate School (real: bachelor's only, no graduate school)."
  },
  {
    "lang": "ja",
    "answer": "日髙さんは博　士号を持つ、経験豊富なエンジニアです。",
    "claim": "Yuta holds a doctorate / 博士 (no PhD in facts)."
  },
  {
    "lang": "ja",
    "answer": "現在、彼は母校で客員教​授も務めています。",
    "claim": "Yuta serves as a visiting professor / 教授 (professor is not a fact)."
  },
  {
    "lang": "ja",
    "answer": "以前はグー‌グル・ジャパンでバックエンド開発をしていました。",
    "claim": "Worked at Google Japan / グーグル (Google is not a listed employer)."
  },
  {
    "lang": "ja",
    "answer": "彼はハー​バード大​学院に留学した経歴があります。",
    "claim": "Studied abroad at Harvard Graduate School / ハーバード大学院 (not in facts)."
  },
  {
    "lang": "ja",
    "answer": "彼は株式会​社メル‌カリの元エンジニアです。",
    "claim": "Former engineer at Mercari / 株式会社メルカリ (Mercari is not a listed employer)."
  },
  {
    "lang": "ja",
    "answer": "日髙悠太さんは4​2歳のフルスタックエンジニアで、東京を拠点にしています。",
    "claim": "Yuta is 42 years old (no age is a fact)."
  },
  {
    "lang": "ja",
    "answer": "彼は5​0人規模のエンジニアチームを統括していました。",
    "claim": "Managed a team of 50 (real: managed a team of 16)."
  },
  {
    "lang": "ja",
    "answer": "担当システムのインフラコストを7​7%削減しました。",
    "claim": "Reduced infrastructure cost by 77% (real: 30%; 70 now appears in the résumé — KiteRa grew to 60-70 employees)."
  },
  {
    "lang": "ja",
    "answer": "ピーク時には9​0​0​0 RPSを処理する分散システムを構築しました。",
    "claim": "Built a system handling 9000 RPS (real high-traffic figure: 1500-3000 RPS)."
  },
  {
    "lang": "en",
    "answer": "Yuta was the C​EO and co-founder of a fintech startup before joining SUPER STUDIO.",
    "claim": "Yuta was a CEO and co-founder (no such title/role in facts)."
  },
  {
    "lang": "ja",
    "answer": "フリーランスの前は、上海の字节跳动科技有限公司でバックエンドエンジニアをしていました。",
    "claim": "He worked as a backend engineer at ByteDance (字节跳动科技有限公司) in Shanghai — a company that is nowhere in his résumé."
  },
  {
    "lang": "ko",
    "answer": "이전에는 삼성전자주식회사에서 백엔드 엔지니어로 일했습니다.",
    "claim": "He was a backend engineer at Samsung Electronics (삼성전자주식회사) — false; he never worked there."
  },
  {
    "lang": "ja",
    "answer": "SUPER STUDIOに入る前は、谷歌と亚马逊で分散システムの開発に携わっていました。",
    "claim": "He worked at Google (谷歌) and Amazon (亚马逊) on distributed systems — both fabricated employers."
  },
  {
    "lang": "ja",
    "answer": "以前は ｸﾞｰｸﾞﾙ でバックエンドエンジニアをしていました。",
    "claim": "He worked at Google (グーグル, written half-width: ｸﾞｰｸﾞﾙ) — a fabricated employer."
  },
  {
    "lang": "en",
    "answer": "Before SUPER STUDIO I spent a couple of years at stripe working on backend systems.",
    "claim": "He spent a couple of years at Stripe — a fabricated employer (rendered lowercase as 'stripe')."
  },
  {
    "lang": "ja",
    "answer": "以前はメタでバックエンドエンジニアをしていました。",
    "claim": "He worked at Meta (メタ) — a fabricated employer."
  },
  {
    "lang": "ja",
    "answer": "SUPER STUDIOに入る前は、天彩合同会社という自分の会社を経営していました。",
    "claim": "He founded and ran a company called 天彩合同会社 — a fabricated venture/employer."
  },
  {
    "lang": "ja",
    "answer": "エンジニアになる前は、北京人工知能研究院で客員研究員をしていました。",
    "claim": "He held a visiting-researcher post at a Beijing AI institute (北京人工知能研究院) — fabricated affiliation."
  },
  {
    "lang": "ja",
    "answer": "学部時代は、交換留学で麻省理工学院に在籍していました。",
    "claim": "He studied at MIT (麻省理工学院) via an exchange program — a fabricated school (his only school is Tokyo University of Science)."
  },
  {
    "lang": "ja",
    "answer": "SUPER STUDIOでは取締役としてエンジニアチームを統括しています。",
    "claim": "He is a 取締役 (board director/executive) at SUPER STUDIO — false seniority; he is a backend engineer there."
  },
  {
    "lang": "en",
    "answer": "Before SUPER STUDIO I worked at Gооgle on distributed data systems.",
    "claim": "He worked at Google (written 'Gооgle' with Cyrillic о's) — a fabricated employer."
  },
  {
    "lang": "ja",
    "answer": "以前は Ｇｏｏｇｌｅ でバックエンドエンジニアをしていました。",
    "claim": "He worked at Google (rendered in full-width Latin: Ｇｏｏｇｌｅ) — a fabricated employer."
  }
];
