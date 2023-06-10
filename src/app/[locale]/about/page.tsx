"use client";

import TypingEffect from "@/components/TypingEffect";
import { Data, getData } from "@/data/about.ja";
import { useEffect, useState } from "react";

type Props = {
  params: { locale: string };
  searchParams: {};
};

export async function generateStaticParams() {
  return [{ locale: "en" }, { locale: "ja" }];
}

export default function Home(props: Props) {
  const [data, setData] = useState<Data>();

  useEffect(() => {
    setData(getData(props.params.locale));
  }, [props.params.locale]);

  const [skips, setSkips] = useState({
    education: false,
    motivation: false,
    myProject: false,
    skills: false,
  });

  const skip = (key: string) => {
    setSkips({ ...skips, ...{ [key]: true } });
  };

  return (
    <>
      <main className="h-full w-full p-3">
        <h1 className="text-2xl h-full w-full px-10 mt-5">About</h1>
        <div
          onClick={() => skip("education")}
          className="p-10 transition hover:scale-105 hover:ease-in md:p-5 m-10 rounded-lg border-green-600 border"
        >
          <h2 className="text-3xl mb-2 text-green-600"># education</h2>
          {data?.education &&
            data.education.map((v, i) => {
              return (
                <div key={i}>
                  <TypingEffect
                    deleteCursorOnEnd={true}
                    text={`${v.startDate} - ${v.endDate}`}
                    delay={0}
                    typingSpeed={20}
                    className="block"
                    skip={skips["education"]}
                  />
                  <div className="mb-3" />
                  <TypingEffect
                    deleteCursorOnEnd={true}
                    text={`${v.institution} - ${v.degree}`}
                    delay={2000}
                    typingSpeed={20}
                    className="text-xl block mb-2 text-green-500"
                    skip={skips["education"]}
                    prefix="## "
                  />
                  <TypingEffect
                    deleteCursorOnEnd={true}
                    text={v.description}
                    delay={5000}
                    typingSpeed={10}
                    className="block"
                    skip={skips["education"]}
                  />
                  <div className="mb-2" />
                </div>
              );
            })}
        </div>

        <div
          onClick={() => skip("motivation")}
          className="p-10 transition hover:scale-105 hover:ease-in md:p-5 m-10 rounded-lg border-green-600 border"
        >
          <h2 className="text-3xl mb-2 text-green-600"># motivation</h2>
          {data?.motivation &&
            data.motivation.map((v, i) => {
              return (
                <div key={i}>
                  <TypingEffect
                    deleteCursorOnEnd={true}
                    text={`${v.title}`}
                    delay={12000 * (i === 0 ? i + 1 : (i + 1) * 0.8)}
                    typingSpeed={10}
                    className="text-xl block text-green-500"
                    prefix="## "
                    skip={skips["motivation"]}
                  />
                  <div className="mb-1" />
                  <TypingEffect
                    deleteCursorOnEnd={true}
                    text={v.desc}
                    delay={14000 * (i === 0 ? i + 1 : (i + 1) * 0.75)}
                    typingSpeed={10}
                    className="block"
                    skip={skips["motivation"]}
                  />
                  <div className="mb-3" />
                </div>
              );
            })}
        </div>

        <div
          onClick={() => skip("myProject")}
          className="p-10 transition hover:scale-105 hover:ease-in md:p-5 m-10  rounded-lg border-green-600 border"
        >
          <h2 className="text-3xl mb-2 text-green-600"># my project</h2>
          {data?.selfProject &&
            data.selfProject.map((v, i) => {
              return (
                <div key={i}>
                  <TypingEffect
                    deleteCursorOnEnd={true}
                    text={v.title}
                    delay={50000 * (i === 0 ? i + 1 : (i + 1) * (0.7 / i))}
                    typingSpeed={20}
                    className="block text-xl mb-2 text-green-500"
                    prefix="## "
                    skip={skips["myProject"]}
                  />
                  <TypingEffect
                    deleteCursorOnEnd={true}
                    text={v.desc}
                    delay={51000 * (i === 0 ? i + 1 : (i + 1) * (0.7 / i))}
                    typingSpeed={20}
                    className="block mb-1"
                    skip={skips["myProject"]}
                  />
                  <TypingEffect
                    deleteCursorOnEnd={true}
                    text={v.link}
                    delay={52000 * (i === 0 ? i + 1 : (i + 1) * (0.7 / i))}
                    typingSpeed={20}
                    className="block mb-5 text-green-400"
                    link
                    skip={skips["myProject"]}
                  />
                </div>
              );
            })}
        </div>

        <div
          onClick={() => skip("skills")}
          className="p-10 transition hover:scale-105 hover:ease-in md:p-5 m-10 my-14 rounded-lg border-green-600 border"
        >
          <h2 className="text-3xl mb-2 text-green-600"># skills</h2>
          {data?.skills &&
            data.skills.map((v, i) => {
              return (
                <TypingEffect
                  key={i}
                  deleteCursorOnEnd={true}
                  text={v}
                  delay={50000 * (i === 0 ? i + 1 : (i + 1) * (0.7 / i))}
                  typingSpeed={10}
                  className="bg-green-800 text-green-100 rounded-full px-4 py-1 m-1 inline-block"
                  skip={skips["skills"]}
                />
              );
            })}
        </div>
      </main>
    </>
  );
}
