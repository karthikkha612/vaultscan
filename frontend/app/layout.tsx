import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: "VaultScan — Vulnerability Scanner",
  description:
    "Scan any website or GitHub repo for security vulnerabilities",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-charcoal text-text antialiased">
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}
