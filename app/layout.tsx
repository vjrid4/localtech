import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LocalTech — Trusted Repair Services Near You",
  description: "Find verified technicians and service centers for mobiles, TVs, appliances, laptops, CCTV, and solar systems across India.",
  keywords: "mobile repair, TV repair, laptop repair, refrigerator repair, AC service, CCTV installation, local technician, India",
  openGraph: {
    title: "LocalTech — Connecting Technicians, Service Centers & Customers",
    description: "Find trusted repair services near you — mobiles, TVs, appliances, laptops, CCTV, solar and more.",
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
      <body>
        {children}
      </body>
    </html>
  );
}
