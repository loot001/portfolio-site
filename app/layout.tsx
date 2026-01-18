import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { draftMode } from 'next/headers'
import { VisualEditing } from '@/components/VisualEditing'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Luther Thie - Artist",
  description: "Contemporary artist exploring themes of symbiosis, transformation, and AI collaboration through sculpture, installation, and mixed media.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const draft = await draftMode()
  
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* Header */}
        <header className="border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <a href="/" className="text-2xl font-bold">
                Luther Thie
              </a>
              <nav className="flex gap-6">
                <a href="/works" className="hover:text-gray-600">Works</a>
                <a href="/projects" className="hover:text-gray-600">Projects</a>
                <a href="/cv" className="hover:text-gray-600">CV</a>
                <a href="/about" className="hover:text-gray-600">About</a>
              </nav>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main>
          {children}
        </main>

        {/* Visual Editing - only loads in draft mode */}
        {draft.isEnabled && <VisualEditing />}
      </body>
    </html>
  );
}
