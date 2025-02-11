"use client";

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

  const lang = props.params.locale;

  useEffect(() => {
    setData(getData(props.params.locale));
  }, [props.params.locale]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const onCurrentIndexChange = (index: number) => {
    if (index !== currentIndex) setCurrentIndex(index);
  };

  return (
    <>
      <h1 className="w-full h-full px-10 mt-5 text-2xl">Download</h1>
      <main className="w-full h-full p-5 md:p-20">
        <div className="flex flex-col items-center">
          <div className="w-full">
            <h2 className="my-2 text-3xl text-green-600"># {lang === "en" ? "CV" : "職務経歴書"}</h2>
            <embed src={lang === "en" ? "/yuta-hidaka-resume-english.pdf": "/yuta-hidaka-resume-japanese.pdf"} width="100%" height="750px" />
            
            <h2 className="my-2 text-3xl text-green-600"># {lang === "en" ? "Resume(Japanese)" : "履歴書"}</h2>
            <h3 className="my-2 text-2xl text-green-300 underline"><a href="https://docs.google.com/document/d/1syLxkqWg5PJAJl21CdE5k-zd2JPFG2VxusASk-WgPog/export?format=pdf">download</a></h3>
            <embed src={`https://docs.google.com/document/d/1syLxkqWg5PJAJl21CdE5k-zd2JPFG2VxusASk-WgPog/preview?pli=1`} width="100%" height="750px" />
          </div>
        </div>
      </main>
    </>
  );
}
