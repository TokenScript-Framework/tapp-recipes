'use client'
import localFont from "next/font/local";
import "../public/globals.css";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { config } from "@/lib/utils";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import { Toaster } from "@/components/ui/toaster";
import MainSection from "@/components/main-section";

const geistSans = localFont({
  src: "../fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "../fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const queryClient = new QueryClient();
  return (
    <html lang="en">
       <head>
          <link
            rel="icon"
            href="/images/logo.svg"
            type="image/png"
            sizes="512x512"
            media="(prefers-color-scheme: light)"
          />
        </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="min-h-screen flex flex-col bg-gray-100">
          <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
              <RainbowKitProvider>
                <Header />
                <MainSection children={children}/>
                <Footer />
              </RainbowKitProvider>
            </QueryClientProvider>
          </WagmiProvider>
        </div>
        <Toaster />
      </body>
    </html>
  );
}
