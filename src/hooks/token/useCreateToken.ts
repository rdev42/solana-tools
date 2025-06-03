import {
  MINT_SIZE,
  getMinimumBalanceForRentExemptMint,
  TOKEN_PROGRAM_ID,
  createInitializeMintInstruction,
} from "@solana/spl-token";
import {
  useAnchorWallet,
  useConnection,
  useWallet,
} from "@solana/wallet-adapter-react";
import {
  Keypair,
  TransactionInstruction,
  SystemProgram,
} from "@solana/web3.js";
import { useMutation } from "@tanstack/react-query";
import invariant from "tiny-invariant";
import { createMetadataIx } from "../../helpers/createMetadataIx";
import { executeTx } from "../../helpers/transaction";
import { uploadFile } from "../../helpers/uploadFile";

export const useCreateToken = () => {
  const { wallet } = useWallet();
  const anchorWallet = useAnchorWallet();
  const { connection } = useConnection();

  invariant(import.meta.env.VITE_RPC_ENDPOINT, "RPC endpoint is not set");

  return useMutation({
    mutationFn: async (data: {
      image: FileList;
      mint: string;
      name: string;
      symbol: string;
      description: string;
      decimals: number;
    }) => {
      invariant(wallet?.adapter.publicKey, "Wallet is not connected");
      invariant(anchorWallet, "Wallet not defined");

      const mint = data.mint
        ? Keypair.fromSecretKey(
            new Uint8Array(
              data.mint
                .replace("[", "")
                .replace("]", "")
                .split(",")
                .map(Number),
            ),
          )
        : Keypair.generate();

      const receipt = data.image?.[0]
        ? await uploadFile(data.image[0], wallet)
        : { id: null };
      const metadata = JSON.stringify({
        name: data.name,
        symbol: data.symbol,
        description: data.description,
        image: data.image?.[0] ? `https://gateway.irys.xyz/${receipt!.id}` : "",
      });

      const metadataReceipt = await uploadFile(
        new File([metadata], "metadata.json", { type: "application/json" }),
        wallet,
      );

      const tx: TransactionInstruction[] = [];
      // Create mint
      tx.push(
        SystemProgram.createAccount({
          fromPubkey: wallet.adapter.publicKey,
          newAccountPubkey: mint.publicKey,
          space: MINT_SIZE,
          lamports: await getMinimumBalanceForRentExemptMint(connection),
          programId: TOKEN_PROGRAM_ID,
        }),
        createInitializeMintInstruction(
          mint.publicKey,
          data.decimals,
          wallet.adapter.publicKey,
          wallet.adapter.publicKey,
        ),
        createMetadataIx(
          wallet.adapter,
          mint,
          data.name,
          data.symbol,
          `https://gateway.irys.xyz/${metadataReceipt!.id}`,
        ),
      );

      await executeTx(
        connection,
        {
          ixs: [tx],
          description: "Create token",
          signers: [mint],
        },
        anchorWallet,
      );
    },
  });
};
