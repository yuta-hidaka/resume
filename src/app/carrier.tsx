"use client";

import { HistoryCard } from "@/components/HistoryCard";
import { data } from "@/data/about";
import { useState } from "react";

export default function Carrier() {
  data.experience;
  const [currentIndex, setCurrentIndex] = useState(0);

  const onCurrentIndexChange = (index: number) => {
    if (index !== currentIndex) setCurrentIndex(index);
  };

  return (
    <main className="h-full w-full md:p-20 p-5">
      {data.experience.map((v, i) => {
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
  );
}
