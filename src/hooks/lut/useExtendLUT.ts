import {
  useAnchorWallet,
  useConnection,
  useWallet,
} from "@solana/wallet-adapter-react";
import { AddressLookupTableProgram, PublicKey } from "@solana/web3.js";
import { useMutation } from "@tanstack/react-query";
import invariant from "tiny-invariant";
import { executeTx } from "../../helpers/transaction";

export const useExtendLUT = () => {
  const { wallet } = useWallet();
  const { connection } = useConnection();
  const anchorWallet = useAnchorWallet();

  invariant(import.meta.env.VITE_RPC_ENDPOINT, "RPC endpoint is not set");

  return useMutation({
    mutationFn: async (data: { lut?: string; luts: string[] }) => {
      invariant(wallet?.adapter.publicKey, "Wallet is not connected");
      invariant(anchorWallet, "Anchor wallet is not connected");
      invariant(data.lut, "LUT is required");

      const lutKeys = data.luts.map((lut) => new PublicKey(lut));
      const ix = AddressLookupTableProgram.extendLookupTable({
        lookupTable: new PublicKey(data.lut),
        payer: wallet.adapter.publicKey,
        authority: wallet.adapter.publicKey,
        addresses: lutKeys,
      });

      await executeTx(
        connection,
        {
          ixs: [[ix]],
          description: "Extend LUT",
          signers: [],
        },
        anchorWallet,
      );
    },
  });
};
