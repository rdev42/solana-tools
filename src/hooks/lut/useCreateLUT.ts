import {
  useAnchorWallet,
  useConnection,
  useWallet,
} from "@solana/wallet-adapter-react";
import { AddressLookupTableProgram } from "@solana/web3.js";
import { useMutation } from "@tanstack/react-query";
import invariant from "tiny-invariant";
import { executeTx } from "../../helpers/transaction";

export const useCreateLUT = () => {
  const { wallet } = useWallet();
  const { connection } = useConnection();
  const anchorWallet = useAnchorWallet();

  invariant(import.meta.env.VITE_RPC_ENDPOINT, "RPC endpoint is not set");

  return useMutation({
    mutationFn: async () => {
      invariant(wallet?.adapter.publicKey, "Wallet is not connected");
      invariant(anchorWallet, "Anchor wallet is not connected");

      const [ix, key] = AddressLookupTableProgram.createLookupTable({
        authority: wallet.adapter.publicKey,
        payer: wallet.adapter.publicKey,
        recentSlot: await connection.getSlot(),
      });

      await executeTx(
        connection,
        {
          ixs: [[ix]],
          description: "Create LUT",
          signers: [],
        },
        anchorWallet,
      );

      return key;
    },
  });
};
