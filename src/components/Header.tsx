import { useEffect, useState } from "react";
import type { FC } from "react";

const Header: FC<{ locale: string }> = ({ locale }) => {
  const [currentPath, setCurrentPath] = useState("");

  useEffect(() => {
    setCurrentPath(window.location.pathname);
  }, []);
  const [links, setLinks] = useState([
    {
      label: locale !== "ja" ? "Home" : "ホーム",
      path: "/",
      locale: locale,
      isI18nSwitcher: false,
    },
    {
      label: locale !== "ja" ? "Career" : "キャリア",
      path: "/career",
      locale: locale,
      isI18nSwitcher: false,
    },
    {
      label: locale !== "ja" ? "About" : "アバウト",
      path: "/about",
      locale: locale,
      isI18nSwitcher: false,
    },
    {
      label: locale !== "ja" ? "CV download" : "履歴書 ダウンロード",
      path: "/downloads",
      locale: locale,
      isI18nSwitcher: false,
    },
    {
      label: locale === "ja" ? "English" : "日本語",
      path: locale === "ja" ? "en" : "ja",
      locale: locale === "ja" ? "en" : "ja",
      isI18nSwitcher: true,
    },
  ]);

  useEffect(() => {
    setLinks(
      links.map((v) => {
        v.locale = locale;
        if (v.isI18nSwitcher) {
          const p = currentPath.slice(1).split("/");
          p[0] = locale === "ja" ? "en" : "ja";
          v.locale = locale === "ja" ? "en" : "ja";
          v.path = "/" + p.join("/");
        }
        return v;
      })
    );
  }, [currentPath, locale]);

  return (
    <header className="border-b border-green-700">
      <ul className="flex m-5 justify-center">
        {links.map((v, i) => {
          return (
            <li className="mr-3 md:mr-6 text-sm md:text-base" key={i}>
              <a
                href={v.isI18nSwitcher ? v.path : `/${locale}${v.path}`}
                className="text-green-600 hover:text-green-700"
              >
                {v.label}
              </a>
            </li>
          );
        })}
      </ul>
    </header>
  );
};

export default Header;
