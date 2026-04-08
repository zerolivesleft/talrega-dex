import type { Metadata } from "next";
import { Inter, Nunito } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { PokemonNavThemeProvider } from "@/components/layout/PokemonNavThemeContext";
import {
  defaultOpenGraph,
  defaultTwitter,
  rootMetadataBase,
  siteKeywords,
} from "@/lib/metadataShared";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  ...rootMetadataBase(),
  title: {
    template: "%s | Talrega Pokédex",
    default: "Talrega Pokédex — Pokémon Odyssey",
  },
  description:
    "The complete Pokédex for Pokémon Odyssey — explore every Pokémon in the Talrega region, their moves, locations, and evolutions.",
  keywords: siteKeywords,
  applicationName: "Talrega Pokédex",
  icons: {
    icon: "/images/logo-pokeball.png",
    apple: "/images/logo-pokeball.png",
  },
  openGraph: defaultOpenGraph,
  twitter: defaultTwitter,
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${nunito.variable} h-full antialiased bg-[#1a1a2e]`}>
      <body className="min-h-full flex flex-col text-[#eaeaea]">
        <PokemonNavThemeProvider>
          <Navbar />
          <div className="flex-1">{children}</div>
        </PokemonNavThemeProvider>
        <footer className="border-t border-white/8 py-6 text-center text-xs text-[#8892a4]">
          <p>
            Talrega Pokédex &nbsp;·&nbsp; Pokémon Odyssey ROM Hack &nbsp;·&nbsp;
            Fan-made, not affiliated with Nintendo or Game Freak
          </p>
        </footer>
      </body>
    </html>
  );
}
