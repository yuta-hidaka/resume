import { DotGothic16 } from "next/font/google";
import Head from "next/head";
import Link from "next/link";
import "./globals.css";

const inter = DotGothic16({ weight: "400", subsets: ["latin"] });

export const metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const links = [
    { label: "Home", path: "/" },
    { label: "carrier", path: "/carrier" },
    { label: "about", path: "/about" },
    // { label: "job", path: "/job" },
  ];
  return (
    <html lang="en">
      <Head>
        <title>日髙悠太 - Yuta Hidaka - Portfolio</title>
        <meta
          property="og:title"
          content="日髙悠太 - Yuta Hidaka - Portfolio"
          key="og:title"
        />
        <meta
          name="description"
          content="Full Stack Developer 日髙悠太のポートフォリオサイトです"
          key="desc"
        />
        <meta
          property="og:description"
          content="Full Stack Developer 日髙悠太のポートフォリオサイトです"
        />
        <meta
          name="keywords"
          content="fullstack,golang,python,backend"
          key="keywords"
        />
        <meta name="author" content="Yuta Hidaka" key="author" />
        <meta name="viewport" key="viewport" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="robots" />
        <meta name="robots" content="index, follow" />
        <meta property="og:image" content="/me.jpeg" />
      </Head>
      <body>
        <header className="border-b border-green-700">
          <ul className="flex m-5 justify-center">
            {links.map((v, i) => (
              <li className="mr-6" key={i}>
                <Link
                  href={v.path}
                  className="text-green-600 hover:text-green-700 p-3"
                >
                  {v.label}
                </Link>
              </li>
            ))}
          </ul>
        </header>

        {children}
      </body>
    </html>
  );
}
