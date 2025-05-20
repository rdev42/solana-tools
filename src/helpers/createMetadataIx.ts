import {
  createMetadataAccountV3,
  CreateMetadataAccountV3InstructionAccounts,
  CreateMetadataAccountV3InstructionArgs,
  mplTokenMetadata,
} from "@metaplex-foundation/mpl-token-metadata";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { walletAdapterIdentity } from "@metaplex-foundation/umi-signer-wallet-adapters";
import { Keypair, PublicKey, TransactionInstruction } from "@solana/web3.js";
import { Signer as UmiSigner } from "@metaplex-foundation/umi";
import {
  fromWeb3JsPublicKey,
  toWeb3JsPublicKey,
} from "@metaplex-foundation/umi-web3js-adapters";
import { WalletAdapter } from "@solana/wallet-adapter-base";
import invariant from "tiny-invariant";

const mplProgramId = new PublicKey(
  "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
);

export const createMetadataIx = (
  wallet: WalletAdapter,
  mint: Keypair,
  name: string,
  symbol: string,
  metadataUri: string
) => {
  invariant(wallet.publicKey, "Wallet not connected");
  const umi = createUmi(process.env.GATSBY_RPC_ENDPOINT!)
    .use(mplTokenMetadata())
    // eslint-disable-next-line
    .use(walletAdapterIdentity(wallet));

  const [metadata] = PublicKey.findProgramAddressSync(
    [Buffer.from("metadata"), mplProgramId.toBytes(), mint.publicKey.toBytes()],
    mplProgramId
  );

  const args: CreateMetadataAccountV3InstructionArgs = {
    data: {
      name,
      symbol,
      uri: metadataUri,
      sellerFeeBasisPoints: 0,
      creators: [
        {
          address: fromWeb3JsPublicKey(wallet.publicKey),
          verified: true,
          share: 100,
        },
      ],
      collection: null,
      uses: null,
    },
    isMutable: false,
    collectionDetails: null,
  };

  // Metadata account IX Accounts
  const accounts: CreateMetadataAccountV3InstructionAccounts = {
    metadata: fromWeb3JsPublicKey(metadata),
    mint: fromWeb3JsPublicKey(mint.publicKey),
    payer: wallet as unknown as UmiSigner,
    mintAuthority: wallet as unknown as UmiSigner,
    updateAuthority: undefined,
  };

  const umiTx = createMetadataAccountV3(umi, { ...accounts, ...args });

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
