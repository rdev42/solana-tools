import {
  useAnchorWallet,
  useConnection,
  useWallet,
} from "@solana/wallet-adapter-react";
import { AddressLookupTableProgram, PublicKey } from "@solana/web3.js";
import { useMutation } from "@tanstack/react-query";
import invariant from "tiny-invariant";
import { executeTx } from "../../helpers/transaction";

export const useCloseLUT = () => {
  const { wallet } = useWallet();
  const { connection } = useConnection();
  const anchorWallet = useAnchorWallet();

  invariant(import.meta.env.VITE_RPC_ENDPOINT, "RPC endpoint is not set");

  return useMutation({
    mutationFn: async (lut: PublicKey) => {
      invariant(wallet?.adapter.publicKey, "Wallet is not connected");
      invariant(anchorWallet, "Anchor wallet is not connected");

      const ix = AddressLookupTableProgram.closeLookupTable({
        lookupTable: lut,
        authority: wallet.adapter.publicKey,
        recipient: wallet.adapter.publicKey,
      });

      await executeTx(
        connection,
        {
          ixs: [[ix]],
          description: "Close LUT",
          signers: [],
        },
        anchorWallet,
      );
    },
  });
};
