import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";

const syne = localFont({
  variable: "--font-syne",
  display: "swap",
  src: [
    {
      path: "./fonts/Syne-Variable.ttf",
      style: "normal",
    },
  ],
});

const instrument = localFont({
  variable: "--font-instrument",
  display: "swap",
  src: [
    {
      path: "./fonts/InstrumentSans-Variable.ttf",
      style: "normal",
    },
  ],
});

const plexMono = localFont({
  variable: "--font-plex",
  display: "swap",
  src: [
    {
      path: "./fonts/IBMPlexMono-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/IBMPlexMono-Medium.ttf",
      weight: "500",
      style: "normal",
    },
  ],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://vishnu-priyan-portfolio.vercel.app"),
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
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "The Architect's Universe — Vishnu Priyaan",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Vishnu Priyaan — The Architect's Universe",
    description:
      "An interactive voyage through 15 years of enterprise platform architecture.",
    images: ["/opengraph-image"],
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
      <body suppressHydrationWarning className="bg-void text-star font-sans">
        {children}
      </body>
    </html>
  );
}
