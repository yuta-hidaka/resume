"use client";

import HistoryCard from "@/components/HistoryCard";
import { Data, getData } from "@/data/about";
import { useEffect, useState } from "react";

type Props = {
  params: { lang: string };
  searchParams: {};
};

export default function Home(props: Props) {
  const [data, setData] = useState<Data>();

  useEffect(() => {
    setData(getData(props.params.lang));
  }, [props.params.lang]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const onCurrentIndexChange = (index: number) => {
    if (index !== currentIndex) setCurrentIndex(index);
  };

  return (
    <>
      <h1 className="text-2xl h-full w-full px-10 mt-5">Carrier</h1>
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
