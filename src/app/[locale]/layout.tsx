import "../globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  return children;
}
