import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { AppProvider } from "@/components/app-provider";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "UnfollowTrack — Cek Instagram tanpa mengorbankan privasi", template: "%s | UnfollowTrack" },
  description: "Cari tahu akun yang tidak follow back dan bandingkan perubahan followers dari ekspor Instagram. Semua proses berlangsung di browser kamu.",
  applicationName: "UnfollowTrack",
  icons: { icon: "/favicon.svg" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f7f8fc",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return <html lang="id" suppressHydrationWarning>
    <head>
      <script dangerouslySetInnerHTML={{ __html: `try{var t=localStorage.getItem('unfollowtrack-theme');if(t==='dark')document.documentElement.dataset.theme='dark'}catch(e){}` }} />
    </head>
    <body className="min-h-screen flex flex-col">
      <a className="skip-link" href="#main-content">Lewati ke konten</a>
      <AppProvider>
        <SiteHeader />
        <main id="main-content" className="flex-1">{children}</main>
        <SiteFooter />
      </AppProvider>
    </body>
  </html>;
}
