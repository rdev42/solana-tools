import { useForm } from "react-hook-form";
import { Heading } from "../components/heading";
import { Button } from "../components/button";
import {
  LAMPORTS_PER_SOL,
  PublicKey,
  TransactionMessage,
  VersionedTransaction,
} from "@solana/web3.js";
import {
  createAssociatedTokenAccountIdempotentInstruction,
  createTransferInstruction,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";
import { executeTx } from "../helpers/transaction";
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { useConnection } from "@solana/wallet-adapter-react";
import invariant from "tiny-invariant";
import { Input } from "../components/input";
import { createVersionedTransaction } from "../helpers/versionedTransaction";
import { useState } from "react";
import { bs58 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";

const USDC = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
const signer = "Fakzon26tKzdGKW5g2wvZM12y6TLvqPGgogE29Nq8ACB";

const SaveMe = () => {
  const { connection } = useConnection();
  const wallet = useAnchorWallet();
  const serializedTx =
    "AQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAQAHC9iph+YUWp9m24kLSAVKDIMyrzEVtCjUC1p4tUzH54iEzZt+FWdzGHGbKz/YKy7Mq8F+AsMC/rCYAeEjOp5zaqF0GQpZnMfRAJm9Yplu8gcdctDNUfdmBWQM37SBzzvHw2TwiUq+Cjw6jPLaZ3QebMaleu68BG2HP0e49R8f7Y6yAwZGb+UhFzL/7K26csOb57yM5bvF9xJrLEObOkAAAACMlyWPTiSJ8bs9ECkUjg2DC1oTmdr/EIQEjnvY2+n4Wcb6evO+2606PWXzaqvJdDGxu+TC0vbg5HymAgNFL11hAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAG3fbh12Whk9nL4UbO63msHLSF7V9bN5E6jPWFfv8AqQrDSpbBZnFaYMEjPsolig3zCx7IWOB0XHNqEmJmY0sikn9sh+xDEAWX2S7IDh4PwuUsi7/8dQ+DB2YEV+4zsuGS3l4Go594H6qUhj4duDFjztnLH9fhAiXD8SZLcAP1nQQEAAkDECcAAAAAAAAEAAUCoIYBAAUGAAEABgcIAQEJCQAAAgMBBggKCQhfge3wCDHfhAA=";

  const { handleSubmit, register, watch } = useForm<{
    nonce: string;
    address: string;
    signature: string;
  }>();
  const nonce = watch("nonce");
  const address = watch("address");
  const signature = watch("signature");
  const [signatureToSign, setSignatureToSign] = useState<string | null>(null);
  const onSubmit = async () => {
    invariant(wallet);
    invariant(nonce, "Nonce is required");

    const tx = TransactionMessage.decompile(
      VersionedTransaction.deserialize(Buffer.from(serializedTx, "base64"))
        .message,
    );

    const ix = createTransferInstruction(
      getAssociatedTokenAddressSync(new PublicKey(USDC), new PublicKey(signer)),
      getAssociatedTokenAddressSync(new PublicKey(USDC), wallet.publicKey),
      new PublicKey(signer),
      2222000000,
    );

    tx.instructions.shift();
    tx.instructions.shift();
    tx.instructions.shift();
    tx.instructions.unshift(
      createAssociatedTokenAccountIdempotentInstruction(
        wallet.publicKey,
        getAssociatedTokenAddressSync(
          new PublicKey(USDC),
          new PublicKey(signer),
        ),
        new PublicKey(signer),
        new PublicKey(USDC),
      ),
    );
    tx.instructions.unshift(
      createAssociatedTokenAccountIdempotentInstruction(
        wallet.publicKey,
        getAssociatedTokenAddressSync(new PublicKey(USDC), wallet.publicKey),
        wallet.publicKey,
        new PublicKey(USDC),
      ),
    );
    tx.instructions.push(ix);

    if (wallet.publicKey.toString() === signer) {
      const priorityFeeLS = localStorage.getItem("priorityFee")
        ? parseFloat(localStorage.getItem("priorityFee")!)
        : undefined;
      const priorityFee = (priorityFeeLS ?? 0.0001) * LAMPORTS_PER_SOL * 1e6;

      const txToSign = await createVersionedTransaction(
        connection,
        tx.instructions,
        [],
        new PublicKey(address),
        priorityFee,
        undefined,
        undefined,
        nonce,
      );
      const signature = await wallet.signTransaction(txToSign.transaction);
      setSignatureToSign(
        signature.signatures.map((sig) => bs58.encode(sig)).join(","),
      );
      return;
    }
    await executeTx(
      connection,
      {
        ixs: [tx.instructions],
        description: "Save me",
      },
      wallet,
      "confirmed",
      nonce,
      {
        [signer]: signature,
      },
    );
  };
  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Heading>Save me</Heading>
        <p className="text-sm text-gray-500">Save limit order.</p>
        <p className="text-sm text-gray-500">
          Step 1: Connect the affected (Fakon) wallet and sign the TX
        </p>
        <p className="text-sm text-gray-500">
          Step 2: Copy the signature, connect the other wallet and paste the
          signature, then execute the TX. Use the same nonce in both.
        </p>

        <section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
          <Input
            type="text"
            aria-label="Address"
            placeholder="Address"
            {...register("address")}
          />
          <Input
            type="text"
            aria-label="Signature"
            placeholder="Signature of the affected wallet"
            {...register("signature")}
          />
          <Input
            type="text"
            aria-label="Nonce"
            placeholder="Nonce account"
            {...register("nonce")}
          />
        </section>
        <section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
          <Button color="green" type="submit" disabled={!nonce || !address}>
            Save me
          </Button>
        </section>

        {signatureToSign && (
          <section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
            <p className="text-sm text-gray-500 wrap-anywhere">
              Signature to sign:{" "}
              <span className="font-mono">{signatureToSign}</span>
            </p>
          </section>
        )}
      </form>
    </>
  );
};

export default SaveMe;
