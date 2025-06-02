import { BrowserRouter } from "react-router-dom";
import Router from "./routes.tsx";
import { ApplicationLayout } from "./layout.tsx";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { WalletProvider } from "@solana/wallet-adapter-react";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
import { ConnectionProvider } from "@solana/wallet-adapter-react";
import { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { Toaster } from "sonner";
import { useEffect } from "react";
import { useMemo } from "react";
import { useState } from "react";
import invariant from "tiny-invariant";
import useNetwork from "./hooks/useNetwork.ts";

const CACHE_TIME = 1000 * 60 * 60;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchOnMount: false,
      gcTime: CACHE_TIME,
      retry: 5,
    },
  },
});

const persister = createSyncStoragePersister({
  storage: typeof window !== "undefined" ? window.localStorage : null,
});

import "@solana/wallet-adapter-react-ui/styles.css";

export const App = () => {
  const { network, endpoint } = useNetwork();

  const wallets = useMemo(() => [new PhantomWalletAdapter()], [network]);

  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  if (!ready) {
    return null;
  }

  invariant(endpoint);

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister,
        maxAge: CACHE_TIME,
        dehydrateOptions: {
          shouldDehydrateQuery: (query) => {
            return [""].includes(query.queryKey[0] as string);
          },
        },
      }}
    >
      <ReactQueryDevtools initialIsOpen={false} />
      <ConnectionProvider endpoint={endpoint}>
        <WalletProvider wallets={wallets} autoConnect>
          <WalletModalProvider>
            <BrowserRouter>
              <ApplicationLayout>
                <Router />
              </ApplicationLayout>
              <Toaster theme="dark" position="bottom-right" richColors={true} />
            </BrowserRouter>
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </PersistQueryClientProvider>
  );
};
