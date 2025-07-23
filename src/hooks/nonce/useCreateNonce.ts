import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import { Keypair, NONCE_ACCOUNT_LENGTH } from "@solana/web3.js";
import { SystemProgram } from "@solana/web3.js";
import { useMutation } from "@tanstack/react-query";
import invariant from "tiny-invariant";
import { executeTx } from "../../helpers/transaction";

export const useCreateNonce = () => {
  const wallet = useAnchorWallet();
  const { connection } = useConnection();

  invariant(import.meta.env.VITE_RPC_ENDPOINT, "RPC endpoint is not set");

  return useMutation({
    mutationFn: async () => {
      invariant(wallet?.publicKey, "Wallet is not connected");

      const nonce = Keypair.generate();

      const rent = await connection.getMinimumBalanceForRentExemption(
        NONCE_ACCOUNT_LENGTH,
      );

      const ixs = [
        SystemProgram.createAccount({
          fromPubkey: wallet.publicKey,
          newAccountPubkey: nonce.publicKey,
          lamports: rent,
          space: NONCE_ACCOUNT_LENGTH,
          programId: SystemProgram.programId,
        }),
        SystemProgram.nonceInitialize({
          noncePubkey: nonce.publicKey,
          authorizedPubkey: wallet.publicKey,
        }),
      ];
      await executeTx(
        connection,
        {
          ixs: [ixs],
          signers: [nonce],
          description: "Create nonce",
        },
        wallet,
      );

      return {
        nonce: nonce.secretKey.toString(),
        publicKey: nonce.publicKey.toString(),
      };
    },
  });
};
