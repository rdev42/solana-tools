import { useForm } from "react-hook-form";
import { Heading } from "../components/heading";
import { Button } from "../components/button";
import {
  ComputeBudgetProgram,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  TransactionMessage,
  VersionedTransaction,
} from "@solana/web3.js";

import {
  createAssociatedTokenAccountIdempotentInstruction,
  createTransferInstruction,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { useConnection } from "@solana/wallet-adapter-react";
import invariant from "tiny-invariant";
import { createVersionedTransaction } from "../helpers/versionedTransaction";
import { useState } from "react";
import { bs58 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";

const testSerializedTX =
  "Aqa06Hk0s3jtlD2jSuiCnXff1vHa6OS+GHP2z35ieVDEoKpKKHACg3vONTo6AP9KEvlK1O6yZ8Y9VXzPfQzRQw4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgAIACRCo4bdYTp8lE525qCQusTrw1zChDDMDcSiGn9/72f2zc9uauJyZZUimOmbLle5M/iLy4LfjbtxmndpddxpkmQ9eTTR+DokytJ8fykaljef0WPw4+qynErgF83nA/CoZuzKHE90xfEl0XrjyL+dxYSbkpPCEee1UJJ+UMfgm+qTcpoRq5A9AKMB+cdaaXBgT4KtSJXnp5aLWG6iaPEHIlDfGNjLf4oSBusjFrRl//SiLSYgEES8RG0zPtQibV/StdSFJd53N+ZqJVp5nqWkTHz7xVBpv9AtORODWHW2HPioXdAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABqfVFxksVo7gioRfc9KXiM8DXDFFshqzRNgGLqlAAAADBkZv5SEXMv/srbpyw5vnvIzlu8X3EmssQ5s6QAAAAIyXJY9OJInxuz0QKRSODYMLWhOZ2v8QhASOe9jb6fhZQMfUybrwF1L2wIwr1UTdRCKxFu8BEbc+vSpvCTTac7/G+nrzvtutOj1l82qryXQxsbvkwtL24OR8pgIDRS9dYQbd9uHXZaGT2cvhRs7reawctIXtX1s3kTqM9YV+/wCpCsNKlsFmcVpgwSM+yiWKDfMLHshY4HRcc2oSYmZjSyKSf2yH7EMQBZfZLsgOHg/C5SyLv/x1D4MHZgRX7jOy4ZBzL5GWTVseTF4S1eq6YwRL2dkrSjY25BbJ0hDOGTB2BwcDAggABAQAAAAJAAkDAQAAAAAAAAAJAAUCwCcJAAoGAAMLDAcNAQEKBgAEAQwHDQEBDgkBAQUGBAwNDw4IX4Ht8Agx34QNAwQDAQkDQEtMAAAAAAAA";

const USDC = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
// const signer = "Fakzon26tKzdGKW5g2wvZM12y6TLvqPGgogE29Nq8ACB";
const signer = "FnF85JnCwLipe446mLXwJKieUp4skjjo7YjWHWLqqBwT";
const targetWallet = "5MsppEZmS9DBHt1xXZH2ZyCqQjoXi1N6UTppi1rt2Dok";

const SaveMe = () => {
  const { connection } = useConnection();
  const wallet = useAnchorWallet();
  const serializedTx =
    // "AQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAQAHC9iph+YUWp9m24kLSAVKDIMyrzEVtCjUC1p4tUzH54iEzZt+FWdzGHGbKz/YKy7Mq8F+AsMC/rCYAeEjOp5zaqF0GQpZnMfRAJm9Yplu8gcdctDNUfdmBWQM37SBzzvHw2TwiUq+Cjw6jPLaZ3QebMaleu68BG2HP0e49R8f7Y6yAwZGb+UhFzL/7K26csOb57yM5bvF9xJrLEObOkAAAACMlyWPTiSJ8bs9ECkUjg2DC1oTmdr/EIQEjnvY2+n4Wcb6evO+2606PWXzaqvJdDGxu+TC0vbg5HymAgNFL11hAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAG3fbh12Whk9nL4UbO63msHLSF7V9bN5E6jPWFfv8AqQrDSpbBZnFaYMEjPsolig3zCx7IWOB0XHNqEmJmY0sikn9sh+xDEAWX2S7IDh4PwuUsi7/8dQ+DB2YEV+4zsuGS3l4Go594H6qUhj4duDFjztnLH9fhAiXD8SZLcAP1nQQEAAkDECcAAAAAAAAEAAUCoIYBAAUGAAEABgcIAQEJCQAAAgMBBggKCQhfge3wCDHfhAA=";
    "AQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAQAHC9uauJyZZUimOmbLle5M/iLy4LfjbtxmndpddxpkmQ9ehGrkD0AowH5x1ppcGBPgq1IleenlotYbqJo8QciUN8Y2Mt/ihIG6yMWtGX/9KItJiAQRLxEbTM+1CJtX9K11IUl3nc35molWnmepaRMfPvFUGm/0C05E4NYdbYc+Khd0AwZGb+UhFzL/7K26csOb57yM5bvF9xJrLEObOkAAAACMlyWPTiSJ8bs9ECkUjg2DC1oTmdr/EIQEjnvY2+n4Wcb6evO+2606PWXzaqvJdDGxu+TC0vbg5HymAgNFL11hAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAG3fbh12Whk9nL4UbO63msHLSF7V9bN5E6jPWFfv8AqQrDSpbBZnFaYMEjPsolig3zCx7IWOB0XHNqEmJmY0sikn9sh+xDEAWX2S7IDh4PwuUsi7/8dQ+DB2YEV+4zsuEhQT7sABurF/+oVDCqeVCn52cy6VkMh6p2chvzHMKVcAQEAAkD+CoAAAAAAAAEAAUCJZYAAAUGAAEABgcIAQEJCQAAAgMBBggKCQhfge3wCDHfhAA=";

  const { handleSubmit } = useForm<{
    nonce: string;
    address: string;
    signature: string;
  }>();

  const noncePk = Keypair.fromSecretKey(
    new Uint8Array(JSON.parse(`[${import.meta.env.VITE_NONCE_KEY}]`)),
  );

  const [signatureToSign, setSignatureToSign] = useState<string | null>(null);
  const [sendTxHash, setSendTxHash] = useState<string | null>(null);
  // @ts-expect-error error
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const onSubmit = async () => {
    invariant(wallet);

    const tx = TransactionMessage.decompile(
      VersionedTransaction.deserialize(Buffer.from(serializedTx, "base64"))
        .message,
    );

    const ix = createTransferInstruction(
      getAssociatedTokenAddressSync(new PublicKey(USDC), new PublicKey(signer)),
      getAssociatedTokenAddressSync(
        new PublicKey(USDC),
        new PublicKey(targetWallet),
      ),
      new PublicKey(signer),
      5000000,
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
        new PublicKey(wallet.publicKey),
        getAssociatedTokenAddressSync(
          new PublicKey(USDC),
          new PublicKey(targetWallet),
        ),
        new PublicKey(targetWallet),
        new PublicKey(USDC),
      ),
    );
    tx.instructions.unshift(
      ComputeBudgetProgram.setComputeUnitLimit({
        units: 600000,
      }),
    );
    tx.instructions.unshift(
      ComputeBudgetProgram.setComputeUnitPrice({
        microLamports: Math.ceil(0.0001 / 600000),
      }),
    );
    tx.instructions.unshift(
      SystemProgram.nonceAdvance({
        authorizedPubkey: new PublicKey(
          "CNF7qAszMpHwiDit3XeMDt99bmbuL6XovstbNCzvgcQA",
        ),
        noncePubkey: noncePk.publicKey,
      }),
    );
    tx.instructions.push(ix);

    if (
      wallet.publicKey.toString() ===
      "CNF7qAszMpHwiDit3XeMDt99bmbuL6XovstbNCzvgcQA"
    ) {
      const priorityFeeLS = localStorage.getItem("priorityFee")
        ? parseFloat(localStorage.getItem("priorityFee")!)
        : undefined;
      const priorityFee = (priorityFeeLS ?? 0.0001) * LAMPORTS_PER_SOL * 1e6;

      const txToSign = await createVersionedTransaction(
        connection,
        tx.instructions,
        [],
        new PublicKey("CNF7qAszMpHwiDit3XeMDt99bmbuL6XovstbNCzvgcQA"),
        priorityFee,
        undefined,
        undefined,
        "Aisac6DYWYmeGgDz7MbCrLc3pAy1kHizMCxiXJdEvEWy",
      );

      // txToSign.transaction.sign([noncePk]);

      const signature = await wallet.signTransaction(txToSign.transaction);
      setSignatureToSign(
        signature.signatures.map((sig) => bs58.encode(sig)).join(","),
      );

      console.log(Buffer.from(signature.serialize()).toString("base64"));
      return;
    }
    // await executeTx(
    //   connection,
    //   {
    //     ixs: [tx.instructions],
    //     description: "Save me",
    //   },
    //   wallet,
    //   "confirmed",
    //   noncePk.publicKey.toString(),
    //   {
    //     [signer]: signature,
    //   },
    // );
  };
  const onSubmit2 = async () => {
    invariant(wallet);
    const tx = VersionedTransaction.deserialize(
      Buffer.from(testSerializedTX, "base64"),
    );
    console.log(tx);
    console.log(tx.message.recentBlockhash);
    console.log(testSerializedTX);
    const signed = await wallet.signTransaction(tx);
    console.log("signed");
    const hash = await connection.sendTransaction(signed, {
      skipPreflight: true,
    });
    console.log("sent");
    setSendTxHash(hash);
  };
  return (
    <>
      <form onSubmit={handleSubmit(onSubmit2)} className="space-y-6">
        <Heading>Save me</Heading>
        <p className="text-sm text-gray-500">Save limit order.</p>
        <p className="text-sm text-gray-500">
          Step 1: Connect the affected (Fakon) wallet and sign the TX
        </p>
        <p className="text-sm text-gray-500">
          Step 2: Copy the signature, connect the other wallet and paste the
          signature, then execute the TX. Use the same nonce in both.
        </p>

        {/* <section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
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
        </section> */}
        <section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
          <Button color="green" type="submit">
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
        {sendTxHash && (
          <section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
            <p className="text-sm text-gray-500 wrap-anywhere">
              Sent TX:{" "}
              <a
                href={`https://solscan.io/tx/${sendTxHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono"
              >
                {sendTxHash}
              </a>
            </p>
          </section>
        )}
      </form>
    </>
  );
};

export default SaveMe;
