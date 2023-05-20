import { type AppType } from "next/app";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { NextUIProvider } from "@nextui-org/react";

import { api } from "~/utils/api";

import "~/styles/globals.css";

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <NextUIProvider>
      <SessionProvider session={session}>
        <Component {...pageProps} />
      </SessionProvider>
    </NextUIProvider>
  );
};

export default api.withTRPC(MyApp);
