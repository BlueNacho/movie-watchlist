import type { Metadata } from "next";
import { Space_Grotesk, Space_Mono, Sour_Gummy } from "next/font/google";
import { ThemeProvider } from "@/lib/theme";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const spaceMono = Space_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const sourGummy = Sour_Gummy({
  variable: "--font-title",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "PiponOS",
};

// Inline script to set theme before paint — reads the non-httpOnly cookie
const themeScript = `(function(){try{var m=document.cookie.match(/pipones-theme=(blue|pink)/);if(m)document.documentElement.setAttribute("data-theme",m[1])}catch(e){}})()`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${spaceGrotesk.variable} ${spaceMono.variable} ${sourGummy.variable} h-full`} data-theme="blue" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full flex flex-col font-sans">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
