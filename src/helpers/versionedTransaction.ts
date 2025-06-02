import {
  Connection,
  TransactionInstruction,
  PublicKey,
  ComputeBudgetProgram,
  TransactionMessage,
  VersionedTransaction,
  AddressLookupTableAccount,
  type Signer,
} from "@solana/web3.js";

const deduplicateTXs = (txs: TransactionInstruction[]) => {
  return txs.filter(
    (tx, i) =>
      txs.findIndex(
        (t) =>
          t.programId === tx.programId &&
          t.data.toString("hex") === tx.data.toString("hex") &&
          t.keys.length === tx.keys.length &&
          t.keys.every((k, i) => k.pubkey.equals(tx.keys[i].pubkey)),
      ) === i,
  );
};

const getCUsForTx = async (
  connection: Connection,
  latestBlockhash: Awaited<ReturnType<typeof connection.getLatestBlockhash>>,
  txs: TransactionInstruction[],
  payerKey: PublicKey,
  atas?: AddressLookupTableAccount[],
) => {
  const messageV0 = new TransactionMessage({
    payerKey,
    recentBlockhash: latestBlockhash.blockhash,
    instructions: txs,
  }).compileToV0Message(atas);
  const transaction = new VersionedTransaction(messageV0);
  const simulation = await connection.simulateTransaction(transaction);

  // Add 25K + 10% leeway here because the simulation of a stake right after deposit takes some time (>10-20 secs) to update to the correct
  // number of CUs used (and maybe other TXs as well). Just 10% is not enough for very low CU TXs (like quarry stake).
  const CUs = simulation.value.unitsConsumed
    ? Math.ceil(1.1 * simulation.value.unitsConsumed + 400000)
    : 1.4e6;
  return CUs;
};

export const createVersionedTransaction = async (
  connection: Connection,
  unsafeTXs: TransactionInstruction[],
  signers: Signer[],
  payerKey: PublicKey,
  priorityFee: number,
  atas?: AddressLookupTableAccount[],
  minCU = 0,
) => {
  // Remove compute budget program stuff and append this instead
  // Also remove duplicates
  const txs = deduplicateTXs(
    unsafeTXs.filter((tx) => tx.programId !== ComputeBudgetProgram.programId),
  );
  console.log(txs);

  const latestBlockhash = await connection.getLatestBlockhash("finalized");
  const CUs = Math.max(
    minCU,
    await getCUsForTx(connection, latestBlockhash, txs, payerKey, atas),
  );
  console.log(CUs);

  txs.unshift(
    ComputeBudgetProgram.setComputeUnitLimit({
      units: CUs,
    }),
  );
  txs.unshift(
    ComputeBudgetProgram.setComputeUnitPrice({
      microLamports: Math.ceil(priorityFee / CUs),
    }),
  );
  const messageV0 = new TransactionMessage({
    payerKey,
    recentBlockhash: latestBlockhash.blockhash,
    instructions: txs,
  }).compileToV0Message(atas);
  const transaction = new VersionedTransaction(messageV0);

  const txSigners = transaction.message.staticAccountKeys.filter((x, i) =>
    transaction.message.isAccountSigner(i),
  );
  transaction.sign(
    signers.filter((s) =>
      txSigners.map((x) => x.toString()).includes(s.publicKey.toString()),
    ),
  );

  console.log(Buffer.from(transaction.serialize()).toString("base64"));

  return { transaction, latestBlockhash };
};
