import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "New web app",
  description: "A minimal starting point for a new web app.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
