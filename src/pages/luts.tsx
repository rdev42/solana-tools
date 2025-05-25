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
import { MINT_SIZE, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { getMinimumBalanceForRentExemptMint } from "@solana/spl-token";
import { createInitializeMintInstruction } from "@solana/spl-token";
import {
  AddressLookupTableProgram,
  Keypair,
  PublicKey,
  SystemProgram,
  TransactionInstruction,
} from "@solana/web3.js";
import invariant from "tiny-invariant";
import { createMetadataIx } from "../helpers/createMetadataIx";
import { executeTx } from "../helpers/transaction";
import { uploadFile } from "../helpers/uploadFile";

const CreateLutForm = () => {
  const [pending, setPending] = useState<boolean>(false);
  const [lut, setLUT] = useState<PublicKey | null>();
  const { connection } = useConnection();
  const { wallet } = useWallet();
  const anchorWallet = useAnchorWallet();

  const onCreateLUT = async () => {
    invariant(wallet?.adapter.publicKey, "Wallet is not connected");
    invariant(anchorWallet, "Anchor wallet is not connected");
    setPending(true);

    const [ix, key] = AddressLookupTableProgram.createLookupTable({
      authority: wallet.adapter.publicKey,
      payer: wallet.adapter.publicKey,
      recentSlot: await connection.getSlot(),
    });

    await executeTx(
      connection,
      {
        ixs: [[ix]],
        description: "Create LUT",
        signers: [],
      },
      anchorWallet,
    );
    setLUT(key);
    setPending(false);
  };

  const { register, handleSubmit, watch } = useForm();

  return (
    <form onSubmit={handleSubmit(onCreateLUT)} className="space-y-6">
      <Heading>LUT management</Heading>

      <section className="grid gap-x-8 gap-y-6">
        <Button color="green" type="submit" disabled={pending}>
          {pending ? "Creating..." : "Create LUT"}
        </Button>
        {lut && (
          <div className="text-sm text-gray-500">
            LUT created:{" "}
            <a href={`https://solscan.io/account/${lut}`}>{lut.toString()}</a>
          </div>
        )}
      </section>
    </form>
  );
};

const ExtendLUTForm = () => {
  const [pending, setPending] = useState<boolean>(false);
  const { connection } = useConnection();
  const [luts, setLUTs] = useState<PublicKey[]>([]);
  const { wallet } = useWallet();
  const anchorWallet = useAnchorWallet();

  const { register, handleSubmit, watch } = useForm<{
    lut: string;
    luts: string;
  }>();

  const lut = watch("lut");

  useEffect(() => {
    const getLut = async () => {
      const _luts = await connection.getAddressLookupTable(new PublicKey(lut));
      setLUTs(_luts?.value?.state.addresses ?? []);
    };
    if (lut) {
      getLut();
    }
  }, [lut]);

  const onExtendLUT = async (data: { lut: string; luts: string }) => {
    invariant(wallet?.adapter.publicKey, "Wallet is not connected");
    invariant(anchorWallet, "Anchor wallet is not connected");
    setPending(true);

    const luts = data.luts.split(",");
    const lutKeys = luts.map((lut) => new PublicKey(lut));
    console.log(lutKeys);

    const ix = AddressLookupTableProgram.extendLookupTable({
      lookupTable: new PublicKey(data.lut),
      payer: wallet.adapter.publicKey,
      authority: wallet.adapter.publicKey,
      addresses: lutKeys,
    });

    await executeTx(
      connection,
      {
        ixs: [[ix]],
        description: "Create LUT",
        signers: [],
      },
      anchorWallet,
    );
    setPending(false);
  };

  return (
    <form onSubmit={handleSubmit(onExtendLUT)} className="space-y-6 my-4">
      <Heading>Extend LUT</Heading>

      <section className="grid gap-x-8 gap-y-6">
        <Input type="text" placeholder="LUT" {...register("lut")} />
        <textarea
          className="w-full rounded-md border border-gray-600 p-2 bg-gray-800 text-white"
          placeholder="New LUTs (comma separated)"
          {...register("luts")}
        />
        <Button color="green" type="submit" disabled={pending}>
          {pending ? "Extending..." : "Extend LUT"}
        </Button>
      </section>
      {luts.length > 0 && (
        <table className="w-full text-sm text-gray-500">
          <thead>
            <tr>
              <th className="text-left">Address</th>
            </tr>
          </thead>
          <tbody>
            {luts.map((lut, i) => (
              <tr key={i}>
                <td>{lut.toString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </form>
  );
};

const CreateTokenPage: React.FC<PageProps> = () => {
  return (
    <>
      <CreateLutForm />
      <ExtendLUTForm />
    </>
  );
};

export default CreateTokenPage;

export const Head: HeadFC = () => <title>Tools | Create token</title>;
