import * as React from "react";
import type { HeadFC, PageProps } from "gatsby";
import {
  useAnchorWallet,
  useConnection,
  useWallet,
} from "@solana/wallet-adapter-react";
import { Button } from "../components/button";
import { Input } from "../components/input";
import { Heading } from "../components/heading";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { MINT_SIZE, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { getMinimumBalanceForRentExemptMint } from "@solana/spl-token";
import { createInitializeMintInstruction } from "@solana/spl-token";
import {
  Keypair,
  SystemProgram,
  TransactionInstruction,
} from "@solana/web3.js";
import invariant from "tiny-invariant";
import { createMetadataIx } from "../helpers/createMetadataIx";
import { executeTx } from "../helpers/transaction";
import { uploadFile } from "../helpers/uploadFile";

const CreateTokenPage: React.FC<PageProps> = () => {
  const [pending, setPending] = useState<boolean>(false);
  const { connection } = useConnection();
  const { wallet } = useWallet();
  const anchorWallet = useAnchorWallet();

  const { register, handleSubmit, watch } = useForm<{
    mint: string;
    name: string;
    symbol: string;
    description: string;
    decimals: number;
    image: FileList;
  }>();
  const onSubmit = async (data: {
    image: FileList;
    mint: string;
    name: string;
    symbol: string;
    description: string;
    decimals: number;
  }) => {
    invariant(wallet?.adapter.publicKey, "Wallet is not connected");
    invariant(anchorWallet, "Anchor wallet is not connected");
    setPending(true);

    const mint = data.mint
      ? Keypair.fromSecretKey(
          new Uint8Array(
            data.mint.replace("[", "").replace("]", "").split(",").map(Number),
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
    setPending(false);
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Heading>Create token</Heading>

        <section className="grid gap-x-8 gap-y-6">
          <Input
            type="text"
            placeholder="Mint PK (leave empty for random)"
            {...register("mint")}
          />
          <Input type="text" placeholder="Name" {...register("name")} />
          <Input type="text" placeholder="Symbol" {...register("symbol")} />
          <Input
            type="text"
            placeholder="Description"
            {...register("description")}
          />
          <Input type="text" placeholder="Decimals" {...register("decimals")} />
          <Input
            type="file"
            aria-label="File"
            placeholder="Token image"
            {...register("image")}
          />
        </section>
        <section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
          <Button color="green" type="submit" disabled={pending}>
            {pending ? "Creating..." : "Create"}
          </Button>
        </section>
      </form>
    </>
  );
};

export default CreateTokenPage;
