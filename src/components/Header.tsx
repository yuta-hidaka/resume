"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export const Header = ({ lang }: { lang: string }) => {
  const [links, setLinks] = useState([
    {
      label: lang === "ja" ? "Home" : "ホーム",
      path: "/",
      locale: lang,
      isI18nSwitcher: false,
    },
    {
      label: lang === "ja" ? "carrier" : "キャリア",
      path: "/carrier",
      locale: lang,
      isI18nSwitcher: false,
    },
    {
      label: lang === "ja" ? "about" : "アバウト",
      path: "/about",
      lang: lang,
      isI18nSwitcher: false,
    },
    {
      label: lang === "ja" ? "English" : "日本語",
      path: lang === "ja" ? "en" : "ja",
      lang: lang === "ja" ? "en" : "ja",
      isI18nSwitcher: true,
    },
  ]);

  const r = usePathname();

  useEffect(() => {
    setLinks(
      links.map((v) => {
        v.lang = lang;
        if (v.isI18nSwitcher) {
          const p = r.slice(1).split("/");
          p[0] = lang === "ja" ? "en" : "ja";
          v.path = "/" + p.join("/");
        }
        return v;
      })
    );
  }, [r]);

  return (
    <header className="border-b border-green-700">
      <ul className="flex m-5 justify-center">
        {links.map((v, i) => {
          return (
            <li className="mr-6" key={i}>
              <Link
                href={v.isI18nSwitcher ? v.path : lang + v.path}
                className="text-green-600 hover:text-green-700 p-3"
                locale={"ja"}
              >
                {v.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </header>
  );
};
