import type { FC } from "react";

interface HistoryLineProps {
  currentIndex: number;
  index: number;
}

const HistoryLine: FC<HistoryLineProps> = ({
  currentIndex,
  index,
}) => {
  return (
    <>
      <div className="flex items-center justify-center">
        <div
          className={`${
            index == currentIndex
              ? "animate-ping bg-green-600"
              : "bg-transparent"
          } w-3 h-3 rounded-full`}
        />
        <div
          className={`${
            index == currentIndex ? "bg-green-600" : "bg-green-200"
          } w-3 h-3 rounded-full absolute`}
        />
      </div>
      <div className="w-[1px] bg-green-200 h-full"></div>
    </>
  );
};

export default HistoryLine;
