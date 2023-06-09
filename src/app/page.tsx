"use client";

import TypingEffect from "@/components/TypingEffect";
import { Data, getData } from "@/data/about";
import Image from "next/image";
import { useEffect, useState } from "react";

type Props = {
  params: { locale: string };
  searchParams: {};
};

export default function Home(props: Props) {
  const [data, setData] = useState<Data>();
  useEffect(() => {
    setData(getData(props.params.locale));
  }, [props.params.locale]);

  return (
    <>
      <h1 className="text-2xl h-full w-full px-10 mt-5">Home</h1>
      <main className="h-full w-full md:flex flex-none p-5 md:p-10">
        <div className="md:m-0 m-auto md:w-1/3 w-full transition hover:scale-105 hover:ease-in rounded-lg">
          <Image
            className="rounded-lg hue-rotate-15 m-auto md:m-0"
            src="/me.jpeg"
            alt="Picture of the author"
            width={300}
            height={300}
            priority={true}
          />
        </div>
        {/* <div className="h-screen bg-green-800 w-[1px]"></div> */}
        <div className="ml-0 mt-5 md:mt-0 md:ml-5 md:w-2/3 w-full p-3 transition hover:scale-105 hover:ease-in rounded-lg border-green-600 border">
          {!data ? (
            <></>
          ) : (
            <>
              <TypingEffect
                deleteCursorOnEnd={true}
                text={`${data.family_name} ${data.given_name}`}
                delay={0}
                typingSpeed={100}
                prefix="$ yuta-hidaka > "
                className="block"
              />
              <TypingEffect
                deleteCursorOnEnd={true}
                text={data.profession}
                delay={1000}
                typingSpeed={50}
                prefix="$ yuta-hidaka > "
                className="block"
              />
              <TypingEffect
                deleteCursorOnEnd={false}
                text={data.bio}
                delay={3000}
                typingSpeed={50}
                prefix="$ yuta-hidaka > "
                className="block"
              />
            </>
          )}
        </div>
      </main>
      {/* <div className="h-screen"></div> */}
    </>
  );
}
