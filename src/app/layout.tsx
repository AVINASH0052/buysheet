import type { Metadata } from "next";
import { Archivo_Black, Public_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const display = Archivo_Black({
 subsets: ["latin"],
 weight: "400",
 variable: "--font-display",
});

const body = Public_Sans({
 subsets: ["latin"],
 variable: "--font-body",
});

const mono = IBM_Plex_Mono({
 subsets: ["latin"],
 weight: ["400", "500", "600"],
 variable: "--font-mono",
});

export const metadata: Metadata = {
 title: "BuySheet counter intake for used devices",
 description:
 "Grade a used phone, laptop, or tablet in under 15 minutes and lock a max buy price staff can defend.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
 return (
 <html lang="en">
 <body className={`${display.variable} ${body.variable} ${mono.variable}`}>{children}</body>
 </html>
 );
}
