import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/contexts/AuthContext";
import { ThemeProvider } from "@/lib/contexts/ThemeContext";
import { NotificationProvider } from "@/lib/contexts/NotificationContext";

export const metadata: Metadata = {
  title: "Gigsly - Find the Perfect Freelance Services",
  description: "Connect with top-tier freelancers. Get quality work done fast, from web development to creative design. India's #1 Gig Marketplace.",
  keywords: ["freelance", "gigs", "marketplace", "freelancers", "services", "hire"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-full flex flex-col antialiased" suppressHydrationWarning>
        <ThemeProvider>
          <NotificationProvider>
            <AuthProvider>
              {children}
            </AuthProvider>
          </NotificationProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
