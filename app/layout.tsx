import type { Metadata } from "next";
import "./globals.css";
import { Inter } from "next/font/google";
import { BottomNav } from "@/components/bottom-nav";
import { ThemeProvider } from "next-themes";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FoodHub - Your Food Companion",
  description: "Track your food intake and improve your health",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-background`}>
        <ThemeProvider
          defaultTheme="system"
          attribute="class"
          enableSystem
          disableTransitionOnChange={false}
        >
          <div className="md:bg-muted/30 dark:md:bg-background flex h-screen flex-col md:h-auto md:items-center md:justify-center md:p-4">
            <div
              className="md:border-border flex h-full w-full flex-col md:relative md:h-auto md:max-h-[90vh] md:w-[390px] md:overflow-hidden md:rounded-[2.5rem] md:border md:shadow-2xl"
              style={{
                aspectRatio: "390 / 844",
                backgroundColor: "var(--background)",
              }}
            >
              <div
                className="md:scrollbar-hide flex min-h-0 flex-1 flex-col overflow-y-auto pb-17 md:pb-0"
                style={{
                  backgroundColor: "var(--background)",
                }}
              >
                {children}
              </div>
              <BottomNav />
            </div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
