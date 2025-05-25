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
import { useUploadFile } from "../hooks/useUploadFile";
import { useEffect, useState } from "react";
import {
  AuthorityType,
  createSetAuthorityInstruction,
  MINT_SIZE,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { getMinimumBalanceForRentExemptMint } from "@solana/spl-token";
import { createInitializeMintInstruction } from "@solana/spl-token";
import {
  Keypair,
  PublicKey,
  SystemProgram,
  TransactionInstruction,
} from "@solana/web3.js";
import invariant from "tiny-invariant";
import { createMetadataIx } from "../helpers/createMetadataIx";
import { executeTx } from "../helpers/transaction";
import { uploadFile } from "../helpers/uploadFile";
import { useGetToken } from "../hooks/useGetToken";
import { toast } from "sonner";
import { MintTokenForm } from "../components/Manage/MintTokenForm";
import { updateMetadataIx } from "../helpers/updateMEtadataIx";

const ManageTokenPage: React.FC<PageProps> = () => {
  const [pending, setPending] = useState<boolean>(false);
  const [mint, setMint] = useState<string>("");
  const [newMintAuthority, setNewMintAuthority] = useState<string>("");
  const [newFreezeAuthority, setNewFreezeAuthority] = useState<string>("");
  const [newUpdateAuthority, setNewUpdateAuthority] = useState<string>("");
  const { connection } = useConnection();
  const { wallet } = useWallet();
  const anchorWallet = useAnchorWallet();
  const token = useGetToken(mint);
  console.log(token);
  return (
    <>
      <Heading>Manage token</Heading>

      <section className="grid gap-x-8 gap-y-6">
        <Input
          type="text"
          placeholder="Mint"
          value={mint}
          onChange={(e) => setMint(e.target.value)}
        />
      </section>
      {token && (
        <section className="mt-8 space-y-4 text-white">
          <h2 className="text-xl font-semibold">Token Details</h2>
          <div className="bg-gray-800 rounded-lg p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-gray-400">Name</div>
              <div>{token.data?.metadata.name}</div>

              <div className="text-gray-400">Symbol</div>
              <div>{token.data?.metadata.symbol}</div>

              <div className="text-gray-400">Decimals</div>
              <div>{token.data?.mint.decimals}</div>

              <div className="text-gray-400">Logo</div>
              <div>{token.data?.image}</div>
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg p-6 space-y-4">
            <h3 className="text-lg font-medium">Mint settings</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-gray-400">Current Mint Authority</div>
              <div>
                {token.data?.mint.mintAuthority &&
                token.data.mint.mintAuthority.__option === "Some"
                  ? token.data.mint.mintAuthority.value.toString()
                  : "No mint authority"}
              </div>
            </div>
            <div className="space-y-4">
              <Input
                type="text"
                placeholder="New mint authority address"
                onChange={(e) => setNewMintAuthority(e.target.value)}
              />
              <div className="flex gap-2">
                <Button
                  color="blue"
                  disabled={pending || !newMintAuthority}
                  onClick={async () => {
                    try {
                      setPending(true);
                      invariant(
                        wallet?.adapter.publicKey,
                        "Wallet not connected",
                      );
                      invariant(anchorWallet, "Anchor wallet not connected");

                      const tx = createSetAuthorityInstruction(
                        new PublicKey(mint),
                        wallet.adapter.publicKey,
                        AuthorityType.MintTokens,
                        new PublicKey(newMintAuthority),
                      );

                      await executeTx(
                        connection,
                        {
                          ixs: [[tx]],
                          description: "Update mint authority",
                        },
                        anchorWallet,
                      );

                      toast.success("Mint authority updated successfully");
                    } catch (err) {
                      console.error(err);
                      toast.error("Failed to update mint authority");
                    } finally {
                      setPending(false);
                    }
                  }}
                >
                  Update Authority
                </Button>
                <Button
                  color="red"
                  disabled={pending}
                  onClick={async () => {
                    try {
                      setPending(true);
                      invariant(
                        wallet?.adapter.publicKey,
                        "Wallet not connected",
                      );
                      invariant(anchorWallet, "Anchor wallet not connected");

                      const tx = createSetAuthorityInstruction(
                        new PublicKey(mint),
                        wallet.adapter.publicKey,
                        AuthorityType.MintTokens,
                        null,
                      );

                      await executeTx(
                        connection,
                        {
                          ixs: [[tx]],
                          description: "Revoke mint authority",
                        },
                        anchorWallet,
                      );

                      toast.success("Mint authority revoked successfully");
                    } catch (err) {
                      console.error(err);
                      toast.error("Failed to update mint authority");
                    } finally {
                      setPending(false);
                    }
                  }}
                >
                  Revoke
                </Button>
              </div>

              <hr />
              <MintTokenForm mint={mint} />
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg p-6 space-y-4">
            <h3 className="text-lg font-medium">Freeze account settings</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-gray-400">Current Freeze Authority</div>
              <div>
                {token.data?.mint.freezeAuthority &&
                token.data.mint.freezeAuthority.__option === "Some"
                  ? token.data.mint.freezeAuthority.value.toString()
                  : "No freeze authority"}
              </div>
            </div>
            <div className="space-y-4">
              <Input
                type="text"
                placeholder="New freeze authority address"
                onChange={(e) => setNewFreezeAuthority(e.target.value)}
              />
              <div className="flex gap-2">
                <Button
                  color="blue"
                  disabled={pending || !newFreezeAuthority}
                  onClick={async () => {
                    try {
                      setPending(true);
                      invariant(
                        wallet?.adapter.publicKey,
                        "Wallet not connected",
                      );
                      invariant(anchorWallet, "Anchor wallet not connected");

                      const tx = createSetAuthorityInstruction(
                        new PublicKey(mint),
                        wallet.adapter.publicKey,
                        AuthorityType.FreezeAccount,
                        new PublicKey(newFreezeAuthority),
                      );

                      await executeTx(
                        connection,
                        {
                          ixs: [[tx]],
                          description: "Update freeze authority",
                        },
                        anchorWallet,
                      );

                      toast.success("Freeze authority updated successfully");
                    } catch (err) {
                      console.error(err);
                      toast.error("Failed to update freeze authority");
                    } finally {
                      setPending(false);
                    }
                  }}
                >
                  Update Authority
                </Button>
                <Button
                  color="red"
                  disabled={pending}
                  onClick={async () => {
                    try {
                      setPending(true);
                      invariant(
                        wallet?.adapter.publicKey,
                        "Wallet not connected",
                      );
                      invariant(anchorWallet, "Anchor wallet not connected");

                      const tx = createSetAuthorityInstruction(
                        new PublicKey(mint),
                        wallet.adapter.publicKey,
                        AuthorityType.FreezeAccount,
                        null,
                      );

                      await executeTx(
                        connection,
                        {
                          ixs: [[tx]],
                          description: "Revoke freeze authority",
                        },
                        anchorWallet,
                      );

                      toast.success("Freeze authority revoked successfully");
                    } catch (err) {
                      console.error(err);
                      toast.error("Failed to update freeze authority");
                    } finally {
                      setPending(false);
                    }
                  }}
                >
                  Revoke
                </Button>
              </div>
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg p-6 space-y-4">
            <h3 className="text-lg font-medium">Update authority settings</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-gray-400">Current Update Authority</div>
              <div>
                {token.data?.metadata.updateAuthority &&
                token.data.metadata.updateAuthority.toString()
                  ? token.data.metadata.updateAuthority.toString()
                  : "No update authority"}
              </div>
            </div>
            <div className="space-y-4">
              <Input
                type="text"
                placeholder="New update authority address"
                onChange={(e) => setNewUpdateAuthority(e.target.value)}
              />
              <div className="flex gap-2">
                <Button
                  color="blue"
                  disabled={pending || !newUpdateAuthority}
                  onClick={async () => {
                    try {
                      setPending(true);
                      invariant(
                        wallet?.adapter.publicKey,
                        "Wallet not connected",
                      );
                      invariant(anchorWallet, "Anchor wallet not connected");

                      const tx = await updateMetadataIx(
                        wallet.adapter,
                        new PublicKey(mint),
                        newUpdateAuthority,
                      );

                      await executeTx(
                        connection,
                        {
                          ixs: [[tx]],
                          description: "Update update authority",
                        },
                        anchorWallet,
                      );

                      toast.success("Update authority updated successfully");
                    } catch (err) {
                      console.error(err);
                      toast.error("Failed to update update authority");
                    } finally {
                      setPending(false);
                    }
                  }}
                >
                  Update Authority
                </Button>
              </div>
            </div>
          </div>
        </section>
      )}
    </>
  );
};

export default ManageTokenPage;

export const Head: HeadFC = () => <title>Tools | Create token</title>;
