import { Experience } from "@/types/history";
import { useEffect, useRef, useState } from "react";
import HistoryLine from "./HistoryLine";

type HistoryCardType = {
  v: Experience;
  index: number;
  currentIndex: number;
  onCurrentIndexChange: (value: number) => void;
};

export default function HistoryCard({
  v,
  index,
  currentIndex,
  onCurrentIndexChange,
}: HistoryCardType) {
  const ref = useRef<HTMLInputElement>(null);
  const [expand, setExpand] = useState(false);

  const onClick = () => setExpand(!expand);

  const handleScroll = (_: Event) => {
    const offsetTop = ref.current?.offsetTop ?? 0;
    const pageYOffset = window.pageYOffset - 12;
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
          {v.startDate} - {v.endDate}
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
}
