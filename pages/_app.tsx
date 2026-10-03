import type { AppProps } from "next/app";
import Head from "next/head";
import { SessionProvider } from "next-auth/react";
import "@/app/globals.css";
import { CartProvider } from "@/app/components/CartProvider";
import WhatsAppChat from "@/app/components/WhatsAppChat";

export default function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <SessionProvider session={session}>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/logo.jpeg" />
      </Head>
      <CartProvider>
        <Component {...pageProps} />
        <WhatsAppChat />
      </CartProvider>
    </SessionProvider>
  );
}
