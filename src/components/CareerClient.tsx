import { useState } from "react";
import type { FC } from "react";
import type { Data } from "@/data";
import HistoryCard from "@/components/HistoryCard";

interface CareerClientProps {
  data: Data;
  locale: string;
}

const CareerClient: FC<CareerClientProps> = ({ data, locale }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const onCurrentIndexChange = (index: number) => {
    if (index !== currentIndex) setCurrentIndex(index);
  };

  return (
    <>
      {data?.experience &&
        data.experience.map((v, i) => {
          return (
            <HistoryCard
              key={i}
              v={v}
              index={i}
              currentIndex={currentIndex}
              onCurrentIndexChange={onCurrentIndexChange}
              locale={locale}
            />
          );
        })}
    </>
  );
};

export default CareerClient;
