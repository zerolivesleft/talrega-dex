import type { Metadata } from "next";
import { Inter, Nunito } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";

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
  title: {
    template: "%s | Talrega Pokédex",
    default: "Talrega Pokédex — Pokémon Odyssey",
  },
  description:
    "The complete Pokédex for Pokémon Odyssey — explore every Pokémon in the Talrega region, their moves, locations, and evolutions.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${nunito.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#1a1a2e] text-[#eaeaea]">
        <Navbar />
        <div className="flex-1">{children}</div>
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
