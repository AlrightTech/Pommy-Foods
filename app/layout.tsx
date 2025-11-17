import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { AuthProviderWrapper } from "@/lib/auth/AuthProviderWrapper";

const poppins = Poppins({ 
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "Pommy Foods - Premium Food Management Platform",
  description: "Streamline orders, manage inventory, and delight customers with our comprehensive food management platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" style={{ overflowX: 'hidden' }}>
      <body className={`${poppins.variable} font-body antialiased`} style={{ overflowX: 'hidden', width: '100%' }}>
        <AuthProviderWrapper>
          {children}
        </AuthProviderWrapper>
      </body>
    </html>
  );
}

