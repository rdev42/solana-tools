import { useMutation } from "@tanstack/react-query";
import {
  useAnchorWallet,
  useConnection,
  useWallet,
} from "@solana/wallet-adapter-react";
import {
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  StakeProgram,
  SystemProgram,
} from "@solana/web3.js";
import { toast } from "sonner";
import { executeTx } from "../helpers/transaction";
import invariant from "tiny-invariant";

export const useStakeSol = () => {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const anchorWallet = useAnchorWallet();

  return useMutation({
    mutationFn: async (amount: number) => {
      invariant(publicKey, "Wallet not connected");
      invariant(anchorWallet, "Anchor wallet not connected");

      const stakeAccountKeypair = Keypair.generate();

      // Create stake account
      const stakeAccount = SystemProgram.createAccount({
        fromPubkey: publicKey,
        newAccountPubkey: stakeAccountKeypair.publicKey,
        lamports: amount * LAMPORTS_PER_SOL,
        space: StakeProgram.space,
        programId: StakeProgram.programId,
      });

      // Initialize stake instruction
      const initializeStake = StakeProgram.initialize({
        stakePubkey: stakeAccountKeypair.publicKey,
        authorized: {
          staker: publicKey,
          withdrawer: publicKey,
        },
      });

      // Delegate stake to vote account
      const delegateStake = StakeProgram.delegate({
        stakePubkey: stakeAccountKeypair.publicKey,
        authorizedPubkey: publicKey,
        votePubkey: new PublicKey(
          "mesh3Px7WMi7Dkxke4ZZBULoKHM6sp37wKtg4DwPqPY",
        ),
      });

      await executeTx(
        connection,
        {
          ixs: [[stakeAccount, initializeStake, ...delegateStake.instructions]],
          description: "Stake SOL",
          signers: [stakeAccountKeypair],
        },
        anchorWallet,
      );
    },
    onError: (error) => {
      console.error("Stake error:", error);
      toast.error("Failed to stake SOL");
    },
    onSuccess: () => {
      toast.success("Successfully staked SOL");
    },
  });
};
