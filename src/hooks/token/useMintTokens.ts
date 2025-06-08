import {
  useAnchorWallet,
  useConnection,
  useWallet,
} from "@solana/wallet-adapter-react";
import { useMutation } from "@tanstack/react-query";
import invariant from "tiny-invariant";
import {
  createAssociatedTokenAccountIdempotentInstruction,
  createMintToInstruction,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";
import { executeTx } from "../../helpers/transaction";
import type { Token } from "../useGetToken";
import { BigNumber } from "bignumber.js";
export const useMintTokens = () => {
  const { wallet } = useWallet();
  const { connection } = useConnection();
  const anchorWallet = useAnchorWallet();

  return useMutation({
    mutationFn: async (data: {
      token: Token;
      recipient: PublicKey;
      amount: number;
    }) => {
      try {
        invariant(wallet?.adapter.publicKey, "Wallet not connected");
        invariant(anchorWallet, "Anchor wallet not connected");

        const recipientPubkey = new PublicKey(data.recipient);

        const recipientAta = getAssociatedTokenAddressSync(
          new PublicKey(data.token.mint.publicKey.toString()),
          recipientPubkey,
          true,
        );

        // Get or create recipient's token account
        const createAtaIx = createAssociatedTokenAccountIdempotentInstruction(
          wallet.adapter.publicKey,
          recipientAta,
          recipientPubkey,
          new PublicKey(data.token.mint.publicKey.toString()),
        );

        // Create mint instruction
        const mintIx = createMintToInstruction(
          new PublicKey(data.token.mint.publicKey.toString()),
          recipientAta,
          wallet.adapter.publicKey,
          BigInt(
            new BigNumber(data.amount)
              .multipliedBy(new BigNumber(10).pow(data.token.token.decimals))
              .toString(),
          ),
        );

        await executeTx(
          connection,
          {
            ixs: [[createAtaIx, mintIx]],
            description: "Mint tokens",
          },
          anchorWallet,
        );
      } catch (e) {
        console.log(e);
      }
    },
  });
};
