import {
  useAnchorWallet,
  useConnection,
  useWallet,
} from "@solana/wallet-adapter-react";
import { useMutation } from "@tanstack/react-query";
import invariant from "tiny-invariant";
import {
  createSetAuthorityInstruction,
  AuthorityType,
} from "@solana/spl-token";
import type { PublicKey } from "@solana/web3.js";
import { executeTx } from "../../helpers/transaction";

export const useSetAuthority = () => {
  const { wallet } = useWallet();
  const { connection } = useConnection();
  const anchorWallet = useAnchorWallet();

  return useMutation({
    mutationFn: async (data: {
      mint: PublicKey;
      newAuthority: PublicKey | null;
      authorityType: AuthorityType;
    }) => {
      invariant(wallet?.adapter.publicKey, "Wallet is not connected");

      invariant(anchorWallet, "Anchor wallet not connected");

      const tx = createSetAuthorityInstruction(
        data.mint,
        wallet.adapter.publicKey,
        data.authorityType,
        data.newAuthority,
      );

      await executeTx(
        connection,
        {
          ixs: [[tx]],
          description: "Update mint authority",
        },
        anchorWallet,
      );
    },
  });
};
