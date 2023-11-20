import { SessionProvider } from "next-auth/react";
import "../app/globals.css";

export default function App({ Component, pageProps, session }: any) {
  return (
    <SessionProvider session={session}>
      <Component {...pageProps} />
    </SessionProvider>
  );
}
