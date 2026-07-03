import type { Metadata, Viewport } from "next";
import { Syne, Instrument_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
});

const instrument = Instrument_Sans({
  variable: "--font-instrument",
  subsets: ["latin"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Vishnu Priyaan — The Architect's Universe",
  description:
    "Infrastructure & ITSM Solutions Architect. 15+ years of ServiceNow and Flexera platform transformations — ITSM, ITOM, CMDB, CSDM, SAM, HAM — told as an interactive journey through space.",
  keywords: [
    "Infrastructure Architect",
    "ITSM Solutions Architect",
    "ServiceNow",
    "Flexera",
    "FNMS",
    "ITAM",
    "SAM",
    "HAM",
    "CMDB",
    "CSDM",
    "ITOM",
    "Tanium",
    "BigFix",
    "SCCM",
    "AWS",
    "Observability",
  ],
  authors: [{ name: "Vishnu Priyaan Chellappa" }],
  openGraph: {
    title: "Vishnu Priyaan — The Architect's Universe",
    description:
      "An interactive voyage through 15 years of enterprise platform architecture. Six worlds. One journey.",
    type: "website",
    siteName: "The Architect's Universe",
  },
  twitter: {
    card: "summary_large_image",
    title: "Vishnu Priyaan — The Architect's Universe",
    description:
      "An interactive voyage through 15 years of enterprise platform architecture.",
  },
};

export const viewport: Viewport = {
  themeColor: "#05060f",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${syne.variable} ${instrument.variable} ${plexMono.variable} antialiased`}
    >
      <body className="bg-void text-star font-sans">{children}</body>
    </html>
  );
}
