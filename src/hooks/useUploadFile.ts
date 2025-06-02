import { useWallet } from "@solana/wallet-adapter-react";
import { useMutation } from "@tanstack/react-query";
import invariant from "tiny-invariant";
import { uploadFile } from "../helpers/uploadFile";

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
