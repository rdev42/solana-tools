import {
  useAnchorWallet,
  useConnection,
  useWallet,
  Wallet,
} from "@solana/wallet-adapter-react";
import { useMutation } from "@tanstack/react-query";
import invariant from "tiny-invariant";
import { useGetSolBalance } from "./useGetSolBalance";
import { WebIrys } from "@irys/sdk";
import { uploadFile } from "../helpers/uploadFile";

const getIrys = async (_wallet: any): Promise<WebIrys> => {
  const rpcUrl = process.env.GATSBY_RPC_ENDPOINT;
  const wallet = { rpcUrl: rpcUrl, name: "solana", provider: _wallet };
  const webIrys = new WebIrys({ network: "mainnet", token: "solana", wallet });
  await webIrys.ready();
  return webIrys;
};

export const useUploadFile = () => {
  const { wallet } = useWallet();

  invariant(process.env.GATSBY_RPC_ENDPOINT, "RPC endpoint is not set");

  return useMutation({
    mutationFn: async (file: File) => {
      invariant(wallet?.adapter.publicKey, "Wallet is not connected");
      return uploadFile(file, wallet);
    },
  });
};
