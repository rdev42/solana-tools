import React, { useEffect, useMemo, useState } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
import invariant from 'tiny-invariant';

import { QueryClient } from '@tanstack/react-query';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';

import { PageProps } from 'gatsby';
import { Toaster } from 'sonner';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import useNetwork from '../hooks/useNetwork';
import { ApplicationLayout } from './app';

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
  storage: typeof window !== 'undefined' ? window.localStorage : null,
});

// eslint-disable-next-line @typescript-eslint/no-require-imports
require('@solana/wallet-adapter-react-ui/styles.css');

const Dapp = <T extends PageProps>(props: { children: React.ReactElement<T>; path: string }) => {
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
            return [''].includes(query.queryKey[0] as string);
          },
        },
      }}
    >
      <ReactQueryDevtools initialIsOpen={false} />
      <ConnectionProvider endpoint={endpoint}>
        <WalletProvider wallets={wallets} autoConnect>
          <WalletModalProvider>
            <ApplicationLayout path={props.path}>{props.children}</ApplicationLayout>
            <Toaster theme="dark" position="bottom-right" richColors={true} />
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </PersistQueryClientProvider>
  );
};

export default function dapp<T extends PageProps>(
  WrappedComponent: React.ReactElement<T>,
  props: T
) {
  return <Dapp {...props}>{WrappedComponent}</Dapp>;
}
