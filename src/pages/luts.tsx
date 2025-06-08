import * as React from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Button } from "../components/button";
import { Input } from "../components/input";
import { Heading } from "../components/heading";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { AddressLookupTableAccount, PublicKey } from "@solana/web3.js";
import { useDeactivateLUT } from "../hooks/lut/useDeactivateLUT";
import { useCloseLUT } from "../hooks/lut/useCloseLUT";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useGetLUTsByWalletAuthority } from "../hooks/lut/useGetLUTsByWalletAuthority";
import { useCreateLUT } from "../hooks/lut/useCreateLUT";
import { useExtendLUT } from "../hooks/lut/useExtendLUT";

const CreateLutForm = () => {
  const navigate = useNavigate();

  const { mutateAsync: createLUT, isPending: createLUTPending } =
    useCreateLUT();
  const { handleSubmit } = useForm();

  const onCreateLUT = async () => {
    const key = await createLUT();
    navigate(`/luts/${key.toString()}`);
  };

  return (
    <form onSubmit={handleSubmit(onCreateLUT)} className="space-y-6">
      <Heading>LUT management</Heading>

      <section className="grid gap-x-8 gap-y-6">
        <Button color="green" type="submit" disabled={createLUTPending}>
          {createLUTPending ? "Creating..." : "Create LUT"}
        </Button>
      </section>
    </form>
  );
};

const ExtendLUTForm = () => {
  const { lut } = useParams();
  const navigate = useNavigate();
  const { connection } = useConnection();
  const [lutInfo, setLUTInfo] = useState<AddressLookupTableAccount | null>(
    null,
  );
  const { wallet } = useWallet();

  const { register, handleSubmit } = useForm<{
    lut: string;
    luts: string;
  }>();

  useEffect(() => {
    const getLut = async () => {
      if (!lut) return;
      const _luts = await connection.getAddressLookupTable(new PublicKey(lut));
      setLUTInfo(_luts?.value);
    };
    if (lut) {
      getLut();
    }
  }, [lut, connection]);

  const { mutate: extendLUT, isPending: extendLUTPending } = useExtendLUT();
  const { mutate: deactivateLUT, isPending: deactivateLUTPending } =
    useDeactivateLUT();
  const { mutate: closeLUT, isPending: closeLUTPending } = useCloseLUT();

  const { data: myLuts } = useGetLUTsByWalletAuthority();

  return (
    <form
      onSubmit={handleSubmit((data) =>
        extendLUT({ lut, luts: data.luts.split(",") }),
      )}
      className="space-y-6 my-4"
    >
      {myLuts && myLuts.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-white mb-4">My LUTs</h2>
          <div className="bg-gray-800 rounded-lg p-6">
            {myLuts.map((lut, i) => (
              <div key={i} className="font-mono text-white break-all">
                <Link
                  to={`/luts/${lut.pubkey.toString()}`}
                  className="text-blue-400 hover:text-blue-300"
                >
                  {lut.pubkey.toString()}
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="grid gap-x-8 gap-y-6">
        <Input
          type="text"
          placeholder="LUT"
          {...register("lut")}
          value={lut}
          onChange={(e) => navigate(`/luts/${e.target.value}`)}
        />
        {lutInfo?.state.authority?.toBase58() ===
        wallet?.adapter.publicKey?.toBase58() ? (
          <>
            <textarea
              className="w-full rounded-md border border-gray-600 p-2 bg-gray-800 text-white"
              placeholder="New LUTs (comma separated)"
              {...register("luts")}
            />
            <Button color="green" type="submit" disabled={extendLUTPending}>
              {extendLUTPending ? "Extending..." : "Extend LUT"}
            </Button>
          </>
        ) : undefined}
      </section>

      {lutInfo?.state.authority && (
        <section className="mt-4 mb-8">
          <h2 className="text-lg font-semibold text-white mb-4">LUT Details</h2>
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-gray-400">Authority</div>
              <div className="font-mono text-white break-all">
                {lutInfo.state.authority.toBase58() || "No authority"}
              </div>
              <div className="text-gray-400">Status</div>
              <div className="font-mono text-white break-all">
                {lutInfo.isActive() ? (
                  <>
                    Active{" "}
                    {wallet?.adapter.publicKey?.toBase58() ===
                    lutInfo.state.authority.toBase58() ? (
                      <Button
                        color="red"
                        onClick={() => deactivateLUT(lutInfo.key)}
                        disabled={deactivateLUTPending}
                      >
                        Deactivate
                      </Button>
                    ) : undefined}
                  </>
                ) : (
                  <>
                    Inactive{" "}
                    {wallet?.adapter.publicKey?.toBase58() ===
                    lutInfo.state.authority.toBase58() ? (
                      <Button
                        color="red"
                        onClick={() => closeLUT(lutInfo.key)}
                        disabled={closeLUTPending}
                      >
                        Close
                      </Button>
                    ) : undefined}
                  </>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {(lutInfo?.state.addresses ?? []).length > 0 && (
        <table className="w-full text-sm text-gray-500 dark:text-gray-400 border-collapse">
          <thead>
            <tr>
              <th className="text-left px-4 py-3 bg-gray-800 dark:bg-gray-700 font-semibold rounded-t-lg">
                Address
              </th>
            </tr>
          </thead>
          <tbody>
            {lutInfo?.state.addresses.map((lut, i) => (
              <tr key={i} className="hover:bg-gray-700/50 transition-colors">
                <td className="px-4 py-2 font-mono">{lut.toString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </form>
  );
};

const LutsPage: React.FC = () => {
  return (
    <>
      <CreateLutForm />
      <ExtendLUTForm />
    </>
  );
};

export default LutsPage;
