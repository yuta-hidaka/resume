"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export const Header = ({ locale }: { locale: string }) => {
  const [links, setLinks] = useState([
    { label: "Home", path: "/", locale: locale, isI18nSwitcher: false },
    { label: "carrier", path: "/carrier", locale: locale, isI18nSwitcher: false },
    { label: "about", path: "/about", locale: locale, isI18nSwitcher: false },
    {
      label: locale === "ja" ? "English" : "日本語",
      path: locale === "ja" ? "en" : "ja",
      locale: locale === "ja" ? "en" : "ja",
      isI18nSwitcher: true,
    },
  ]);

  const r = usePathname();

  useEffect(() => {
    setLinks(
      links.map((v) => {
        v.locale = locale;
        if (v.isI18nSwitcher) {
          const p = r.slice(1).split("/");
          p[0] = locale === "ja" ? "en" : "ja";
          v.path = "/" + p.join("/");
        }
        return v;
      })
    );
  }, []);

  return (
    <header className="border-b border-green-700">
      <ul className="flex m-5 justify-center">
        {links.map((v, i) => {
          return (
            <li className="mr-6" key={i}>
              <Link
                href={v.isI18nSwitcher ? v.path : locale + v.path}
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
