import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DeviceDNA - AI-Powered Mobile Repair Intelligence Platform",
  description: "The future of mobile device management. Digital identity, repair history, AI diagnosis, and intelligent repair solutions for every device.",
  keywords: "mobile repair, device health, AI diagnosis, repair shop software, technician management",
  openGraph: {
    title: "DeviceDNA",
    description: "AI-Powered Mobile Repair Intelligence Platform",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="bg-graphite-950 text-white">
        {children}
      </body>
    </html>
  );
}
