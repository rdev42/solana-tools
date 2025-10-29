import {
  type CreateMetadataAccountV3InstructionAccounts,
  fetchDigitalAsset,
  mplTokenMetadata,
  updateMetadataAccountV2,
  type UpdateMetadataAccountV2InstructionData,
} from "@metaplex-foundation/mpl-token-metadata";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { walletAdapterIdentity } from "@metaplex-foundation/umi-signer-wallet-adapters";
import { PublicKey, TransactionInstruction } from "@solana/web3.js";
import { publicKey, type Signer as UmiSigner } from "@metaplex-foundation/umi";
import {
  fromWeb3JsPublicKey,
  toWeb3JsPublicKey,
} from "@metaplex-foundation/umi-web3js-adapters";
import type { WalletAdapter } from "@solana/wallet-adapter-base";
import invariant from "tiny-invariant";

const mplProgramId = new PublicKey(
  "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s",
);

export const updateMetadataIx = async (
  wallet: WalletAdapter,
  mint: PublicKey,
  data:{ newUpdateAuthority?: string, newURI?: string },
) => {
  invariant(wallet.publicKey, "Wallet not connected");
  const umi = createUmi(import.meta.env.VITE_RPC_ENDPOINT!)
    .use(mplTokenMetadata())
    .use(walletAdapterIdentity(wallet));

  const [metadata] = PublicKey.findProgramAddressSync(
    [Buffer.from("metadata"), mplProgramId.toBytes(), mint.toBytes()],
    mplProgramId,
  );

  const currentData = await fetchDigitalAsset(
    umi,
    fromWeb3JsPublicKey(new PublicKey(mint)),
  );

  const args: UpdateMetadataAccountV2InstructionData = {
    ...currentData.metadata,
    // @ts-expect-error some umi stuff
    newUpdateAuthority: data.newUpdateAuthority ? publicKey(data.newUpdateAuthority) : undefined,
    data: {
      ...currentData.metadata,
      // @ts-expect-error some umi stuff
      uri: data.newURI ? data.newURI : undefined,
    },
  };

  // Metadata account IX Accounts
  const accounts: CreateMetadataAccountV3InstructionAccounts = {
    metadata: fromWeb3JsPublicKey(metadata),
    mint: fromWeb3JsPublicKey(mint),
    payer: wallet as unknown as UmiSigner,
    mintAuthority: wallet as unknown as UmiSigner,
    updateAuthority: wallet as unknown as UmiSigner,
  };

  // @ts-expect-error some umi stuff
  const umiTx = updateMetadataAccountV2(umi, { ...accounts, ...args });

  const ix = umiTx.getInstructions()[0];
  ix.keys = ix.keys.map((key) => {
    const newKey = { ...key };
    // @ts-expect-error some umi stuff
    newKey.pubkey = toWeb3JsPublicKey(key.pubkey);

    // BRO METAPLEX
    if (key.pubkey === wallet.publicKey!.toString()) {
      newKey.isSigner = true;
    }
    return newKey;
  });
  // @ts-expect-error some umi stuff
  ix.programId = toWeb3JsPublicKey(ix.programId);

  return ix as unknown as TransactionInstruction;
};
