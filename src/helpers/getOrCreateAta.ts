import {
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddressSync,
} from '@solana/spl-token';
import { Connection, PublicKey, TransactionInstruction } from '@solana/web3.js';

/**
 * Gets an associated token account, returning a create instruction if it doesn't exist.
 * @param param0
 * @returns
 */
export const getOrCreateATA = async ({
  connection,
  mint,
  owner,
  payer,
}: {
  connection: Connection;
  mint: PublicKey;
  owner: PublicKey;
  payer?: PublicKey;
}): Promise<{ address: PublicKey; instruction: TransactionInstruction | null }> => {
  const address = getAssociatedTokenAddressSync(mint, owner);
  if (await connection.getAccountInfo(address)) {
    return { address, instruction: null };
  } else {
    return {
      address,
      instruction: createAssociatedTokenAccountInstruction(payer ?? owner, address, owner, mint),
    };
  }
};
