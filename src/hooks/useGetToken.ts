import {
  fetchDigitalAsset,
  mplTokenMetadata,
} from "@metaplex-foundation/mpl-token-metadata";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { fromWeb3JsPublicKey } from "@metaplex-foundation/umi-web3js-adapters";
import { getMint } from "@solana/spl-token";
import { useConnection } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { useQuery } from "@tanstack/react-query";
import invariant from "tiny-invariant";

export const useGetToken = (mint: string) => {
  const { connection } = useConnection();

  return useQuery({
    queryKey: ["token", mint],
    queryFn: async () => {
      invariant(import.meta.env.VITE_RPC_ENDPOINT, "RPC_ENDPOINT is not set");
      const umi = createUmi(import.meta.env.VITE_RPC_ENDPOINT).use(
        mplTokenMetadata(),
      );

      try {
        const data = await fetchDigitalAsset(
          umi,
          fromWeb3JsPublicKey(new PublicKey(mint)),
        );
        const dataFromUrl: {
          image: string;
          twitter: string;
          telegram: string;
          discord: string;
          website: string;
        } = await fetch(data.metadata.uri).then((res) => res.json());

        const token = await getMint(connection, new PublicKey(mint));

        return { ...data, ...dataFromUrl, token };
      } catch (e) {
        console.error(e);
        return null;
      }
    },
  });
};
