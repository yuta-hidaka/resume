import { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "日髙悠太 - Yuta Hidaka - Portfolio",
  description: "Software Engineer - 日髙悠太のポートフォリオサイトです",
  authors: { name: "Yuta Hidaka", url: "https://yuta.dev" },
  keywords: "resume software engineer",
  viewport: { width: "device-width", initialScale: 1 },
  icons: "",
  twitter: {
    card: "summary_large_image",
    site: "@yuta-hidaka",
    creator: "@yuta-hidaka",
    images: "https://yuta.dev",
  },
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
