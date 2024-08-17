import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";

import { Toaster } from "@/components/ui/sonner";
import { SocketContextProvider } from "@/providers/socket-provider";

import ModalProvider from "@/providers/modal-provider";

const roboto = Roboto({
  display: "swap",
  weight: ["400", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "drawit",
  description: "A perfect game for time wasters",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={roboto.className}>
        <SocketContextProvider>
          {children}
          <ModalProvider />
          <Toaster />
        </SocketContextProvider>
      </body>
    </html>
  );
}
