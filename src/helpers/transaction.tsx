import type { AnchorWallet } from "@solana/wallet-adapter-react";
import invariant from "tiny-invariant";
import {
  AddressLookupTableAccount,
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  TransactionInstruction,
  TransactionMessage,
  VersionedTransaction,
  type Commitment,
  type Signer,
} from "@solana/web3.js";
import TX from "../components/tx";
import { toast } from "sonner";
import { bs58 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";
import { createVersionedTransaction } from "./versionedTransaction";
import { LAUNCHPAD_LUT } from "../constants";
import { Link } from "react-router-dom";
import { FaExternalLinkAlt } from "react-icons/fa";

const sendTransaction = async (
  connection: Connection,
  txs: TransactionInstruction[][],
  signers: Signer[],
  wallet: AnchorWallet,
  commitment?: Commitment,
  atas?: AddressLookupTableAccount[],
  onSuccess?: (tx: string) => void,
): Promise<string> => {
  if (!wallet.publicKey) {
    return "No wallet connected";
  }

  const priorityFeeLS = localStorage.getItem("priorityFee")
    ? parseFloat(localStorage.getItem("priorityFee")!)
    : undefined;
  const priorityFee = (priorityFeeLS ?? 0.0001) * LAMPORTS_PER_SOL * 1e6;

  const vts = await Promise.all(
    txs.map((tx) =>
      createVersionedTransaction(
        connection,
        tx,
        signers,
        wallet.publicKey,
        priorityFee,
        atas,
      ),
    ),
  );
  const signedTransactions = await wallet.signAllTransactions(
    vts.map((vt) => vt.transaction),
  );

  const hashes = await Promise.all(
    signedTransactions.map(async (vt, i) => {
      let hash: string | undefined;
      try {
        hash = await connection.sendTransaction(vt, {
          maxRetries: 0,
        });
        await connection.confirmTransaction(
          { signature: hash, ...vts[0].latestBlockhash },
          commitment,
        );
        console.log(`https://solscan.io/tx/${hash}`);
        return hash;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (e: any) {
        console.log(e);
        const conditions = [
          "Timeout",
          "Blockhash not found",
          "block height exceeded",
        ];
        if (conditions.some((condition) => e.message.includes(condition))) {
          console.log("Retrying...", "-", e.message);
          await new Promise((resolve) => setTimeout(resolve, 1000));
          return sendTransaction(
            connection,
            [txs[i]],
            signers,
            wallet,
            commitment,
            atas,
            onSuccess,
          );
        }
      }
    }),
  );

  // Add toast
  onSuccess?.(hashes[0] ?? "");

  if (hashes[0]) {
    return hashes[0];
  }

  return "Transaction failed";
};

const makeURL = (tx: VersionedTransaction) => {
  const url = new URL("https://explorer.solana.com/tx/inspector");
  url.searchParams.set("cluster", "mainnet-beta");
  url.searchParams.set("signatures", encodeURIComponent(JSON.stringify([])));
  url.searchParams.set(
    "message",
    Buffer.from(tx.message.serialize()).toString("base64"),
  );
  return url;
};

export const executeTx = async (
  connection: Connection,
  transaction: {
    ixs: TransactionInstruction[][];
    description: string | null;
    signers?: Signer[];
    atas?: AddressLookupTableAccount[];
  },
  wallet: AnchorWallet,
  commitment?: Commitment,
) => {
  invariant(wallet.publicKey);

  // Get base64 of the tx
  const priorityFeeLS = localStorage.getItem("priorityFee")
    ? parseFloat(localStorage.getItem("priorityFee")!)
    : undefined;
  const priorityFee = (priorityFeeLS ?? 0.000001) * LAMPORTS_PER_SOL * 1e6;
  const vts = await Promise.all(
    transaction.ixs.map((tx) =>
      createVersionedTransaction(
        connection,
        tx,
        transaction.signers ?? [],
        wallet.publicKey,
        priorityFee,
        transaction.atas ?? [],
      ),
    ),
  );

  const tx = sendTransaction(
    connection,
    transaction.ixs,
    transaction.signers ?? [],
    wallet,
    commitment,
    transaction.atas ?? [],
  );

  if (transaction.description) {
    toast.promise(tx, {
      loading: (
        <div className="flex flex-col gap-2">
          <p>{transaction.description}</p>
          {vts.map((vt, i) => (
            <Link
              to={makeURL(vt.transaction).toString()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex gap-2"
            >
              Inspect {i} <FaExternalLinkAlt />
            </Link>
          ))}
        </div>
      ),
      success: (data) => (
        <div className="text-sm">
          <p>Transaction successful! Your transaction hash:</p>
          <TX tx={data} />
        </div>
      ),
    });
  }
  return tx;
};

export const executeMultipleTxs = async (
  connection: Connection,
  txs: {
    ixs: TransactionInstruction[][];
    description: string;
    signers?: Signer[];
  }[],
  wallet: AnchorWallet,
) => {
  invariant(wallet.publicKey);

  for (let i = 0; i < txs.length; i++) {
    await executeTx(
      connection,
      {
        ...txs[i],
        description: `(${i + 1} / ${txs.length}) ${txs[i].description}`,
      },
      wallet,
    );
  }
};

const executeJitoMode = async (vts: string[]) => {
  const res = await fetch(
    "https://mainnet.block-engine.jito.wtf/api/v1/bundles",
    {
      method: "POST",
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "sendBundle",
        params: [vts],
      }),
      headers: {
        "Content-Type": "application/json",
      },
    },
  );

  const bundle = await res.json();

  if (bundle?.error?.code) {
    console.error(bundle);
    throw new Error("Bundle submission failed");
  }

  let confirmed = false;
  let i = 0;
  let status: string | undefined;
  do {
    const bundleStatus = await (
      await fetch(`https://mainnet.block-engine.jito.wtf/api/v1/bundles`, {
        method: "POST",
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "getBundleStatuses",
          params: [[bundle.result]],
        }),
        headers: {
          "Content-Type": "application/json",
        },
      })
    ).json();
    console.log("Checking bundle status...", bundleStatus);

    status = bundleStatus?.result?.value?.[0]?.confirmation_status;
    if (status === "finalized") {
      confirmed = true;
    }

    i += 1;
    await new Promise((resolve) => setTimeout(resolve, 4000));
  } while (!confirmed && i < 10);

  if (status === undefined) {
    throw new Error("Bundle not finalized");
  }
  return bundle;
};

export const executeJitoBundle = async (
  connection: Connection,
  txs: TransactionInstruction[][],
  payerKey: PublicKey,
  signers: Signer[],
): Promise<unknown> => {
  const latestBlockhash = await connection.getLatestBlockhash("finalized");
  const launchpadLut = (await connection.getAddressLookupTable(LAUNCHPAD_LUT))
    .value;

  const vts = await Promise.all(
    txs.map(async (ixs) => {
      const messageV0 = new TransactionMessage({
        payerKey,
        recentBlockhash: latestBlockhash.blockhash,
        instructions: ixs,
      }).compileToV0Message(
        [launchpadLut].filter(
          (x): x is AddressLookupTableAccount => x !== null,
        ),
      );
      const transaction = new VersionedTransaction(messageV0);

      const txSigners = transaction.message.staticAccountKeys.filter((_, i) =>
        transaction.message.isAccountSigner(i),
      );
      transaction.sign(
        signers.filter((s) =>
          txSigners.map((x) => x.toString()).includes(s.publicKey.toString()),
        ),
      );

      return bs58.encode(transaction.serialize());
    }),
  );

  console.log(vts.map((x) => Buffer.from(bs58.decode(x)).toString("base64")));

  const mode = "manual" as "manual" | "jito";

  if (mode === "jito") {
    return executeJitoMode(vts);
  } else if (mode === "manual") {
    for (const tx of vts) {
      const vt = VersionedTransaction.deserialize(bs58.decode(tx));
      console.log(await connection.simulateTransaction(vt));

      const blockhash = await connection.getLatestBlockhash("finalized");
      const hash = await connection.sendRawTransaction(bs58.decode(tx));
      await connection.confirmTransaction(
        { signature: hash, ...blockhash },
        "finalized",
      );
      console.log(`https://solscan.io/tx/${hash}`);
    }
    return "done";
  }
};
