import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Luther Thie | Contemporary Artist",
  description: "Portfolio of Luther Thie - Contemporary artist exploring themes of symbiosis, transformation, and AI collaboration through sculpture, installation, and mixed media.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <nav className="border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <a href="/" className="text-xl font-medium">Luther Thie</a>
              <div className="flex space-x-8">
                <a href="/works" className="text-gray-700 hover:text-gray-900">Works</a>
                <a href="/projects" className="text-gray-700 hover:text-gray-900">Projects</a>
                <a href="/cv" className="text-gray-700 hover:text-gray-900">CV</a>
                <a href="/about" className="text-gray-700 hover:text-gray-900">About</a>
              </div>
            </div>
          </div>
        </nav>
        <main>{children}</main>
        <footer className="border-t border-gray-200 mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <p className="text-center text-gray-500">© {new Date().getFullYear()} Luther Thie. All rights reserved.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
