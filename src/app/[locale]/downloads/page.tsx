"use client";

import HistoryCard from "@/components/HistoryCard";
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
      <h1 className="text-2xl h-full w-full px-10 mt-5">Download</h1>
      <main className="h-full w-full md:p-20 p-5">
        <div className="flex flex-col items-center">
          <div className="w-full">
            <h2 className="text-3xl my-2 text-green-600"># {lang === "en" ? "CV(Japanese)" : "職務経歴書"}</h2>
            <embed src={`https://docs.google.com/document/d/1Qk9NxQyp3wOvilZmFEBsTnAADgGP35r9-78SL9qUrVE/preview?pli=1`} width="100%" height="500px" />
            
            <h2 className="text-3xl my-2 text-green-600"># {lang === "en" ? "Resume(Japanese)" : "履歴書"}</h2>
            <embed src={`https://docs.google.com/document/d/1syLxkqWg5PJAJl21CdE5k-zd2JPFG2VxusASk-WgPog/preview?pli=1`} width="100%" height="500px" />
          </div>
        </div>
      </main>
    </>
  );
}
