import { Header } from "@/components/Header";
import { Metadata } from "next";
import "../globals.css";

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
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  console.warn("[locale] layout");
  return (
    <html lang={params.locale}>
      <body>
        <Header locale={params.locale} />
        <div className="max-w-5xl m-auto">{children}</div>
      </body>
    </html>
  );
}
