import type { Experience } from "@/types/history";
import dayjs from "dayjs";
import "dayjs/locale/en";
import "dayjs/locale/ja";
import { useEffect, useRef, useState } from "react";
import type { FC } from "react";
import HistoryLine from "./HistoryLine";

type HistoryCardType = {
  v: Experience;
  index: number;
  currentIndex: number;
  locale: string;
  onCurrentIndexChange: (value: number) => void;
};

const HistoryCard: FC<HistoryCardType> = ({
  v,
  index,
  currentIndex,
  locale,
  onCurrentIndexChange,
}) => {
  const ref = useRef<HTMLInputElement>(null);
  const [expand, setExpand] = useState(false);

  const onClick = () => setExpand(!expand);

  const handleScroll = (_: Event) => {
    const offsetTop = ref.current?.offsetTop ?? 0;
    const pageYOffset = window.scrollY - 12;
    if (pageYOffset > offsetTop) {
      if (index === currentIndex) onCurrentIndexChange(currentIndex + 1);
    } else {
      if (index === currentIndex - 1) onCurrentIndexChange(index);
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [currentIndex]);

  return (
    <div className="flex" onClick={onClick}>
      <div className="flex flex-col items-center" ref={ref}>
        <HistoryLine currentIndex={currentIndex} index={index} />
      </div>
      <div className="break-all whitespace-pre-wrap tracking-wide leading-5 transition hover:scale-105 hover:ease-in flex w-full flex-col border hover:border-green-600 md:mx-10 mx-3 my-5 p-3 md:my-5 md:p-5 rounded-md ease-in-out duration-200">
        <div className="font-extrabold break-all ml-5 mb-5 text-green-600">
          {v.company}
        </div>
        <div className="text-sm font-bold break-all ml-5 mb-5">
          {locale === "en"
            ? dayjs(v.startDate).locale("en").format("MMM. DD, YYYY")
            : dayjs(v.startDate).locale("ja").format("YYYY年 MMMM DD日")}{" "}
          -{" "}
          {v.endDate
            ? locale === "en"
              ? dayjs(v.endDate).locale("en").format("MMM. DD, YYYY")
              : dayjs(v.endDate).locale("ja").format("YYYY年 MMMM DD日")
            : ""}
        </div>
        <div className="break-all ml-5 mb-5">{v.jobTitle}</div>
        <div className="break-all ml-5 mb-3 line-clamp-2">{v.projects.job}</div>
        <div
          className={`${
            expand ? "whitespace-break-spaces" : "line-clamp-2"
          } ml-5 mb-5`}
        >
          {v.projects.jobDescription}
        </div>
      </div>
    </div>
  );
};

export default HistoryCard;
