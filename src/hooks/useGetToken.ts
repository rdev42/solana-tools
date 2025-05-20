import { fetchDigitalAsset, mplTokenMetadata } from '@metaplex-foundation/mpl-token-metadata';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { fromWeb3JsPublicKey } from '@metaplex-foundation/umi-web3js-adapters';
import { PublicKey } from '@solana/web3.js';
import { useQuery } from '@tanstack/react-query';
import invariant from 'tiny-invariant';

export const useGetToken = (mint: string) => {
  return useQuery({
    queryKey: ['token', mint],
    queryFn: async () => {
      invariant(process.env.GATSBY_RPC_ENDPOINT, 'GATSBY_RPC_ENDPOINT is not set');
      const umi = createUmi(process.env.GATSBY_RPC_ENDPOINT).use(mplTokenMetadata());

      try {
        const data = await fetchDigitalAsset(umi, fromWeb3JsPublicKey(new PublicKey(mint)));
        const dataFromUrl: {
          image: string;
          twitter: string;
          telegram: string;
          discord: string;
          website: string;
        } = await fetch(data.metadata.uri).then((res) => res.json());

        return { ...data, ...dataFromUrl };
      } catch (e) {
        console.error(e);
        return null;
      }
    },
  });
};
