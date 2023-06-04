"use client";

import { HistoryCard } from "@/components/HistoryCard";
import { Data, getData } from "@/data/about";
import { useRouter } from "next/compat/router";
import Head from "next/head";
import { useEffect, useState } from "react";

export default function Home() {
  const router = useRouter();
  const [data, setData] = useState<Data>();
  useEffect(() => {
    setData(getData(router?.locale));
  }, []);
  const [currentIndex, setCurrentIndex] = useState(0);
  const onCurrentIndexChange = (index: number) => {
    if (index !== currentIndex) setCurrentIndex(index);
  };

  return (
    <>
      <h1 className="text-2xl h-full w-full px-10 mt-5">Carrier</h1>
      <Head>
        <title key="title">日髙悠太 - Yuta Hidaka - Carrier</title>
        <meta property="og:title" content="日髙悠太 - Yuta Hidaka - Carrier" />
      </Head>
      <main className="h-full w-full md:p-20 p-5">
        {data?.experience &&
          data.experience.map((v, i) => {
            return (
              <HistoryCard
                key={i}
                v={v}
                index={i}
                currentIndex={currentIndex}
                onCurrentIndexChange={onCurrentIndexChange}
              />
            );
          })}
      </main>
    </>
  );
}
