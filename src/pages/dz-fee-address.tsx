import { utils } from "@coral-xyz/anchor";
import * as React from "react";
import { Heading } from "../components/heading";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { PublicKey } from "@solana/web3.js";
import { Input } from "../components/input";

const DZFeeAddressPage: React.FC = () => {
  const [feeAddress, setFeeAddress] = useState<string | null>(null);

  const getFeeAddress = (address: string) => {
    try {
      const feeAddress = PublicKey.findProgramAddressSync(
        [
          utils.bytes.utf8.encode("solana_validator_deposit"),
          new PublicKey(address).toBuffer(),
        ],
        new PublicKey("dzrevZC94tBLwuHw1dyynZxaXTWyp7yocsinyEVPtt4"),
      );
      return feeAddress[0].toString();
    } catch (error) {
      console.error(error);
      return null;
    }
  };

  const { register, watch } = useForm<{
    address: string;
  }>();

  const address = watch("address");

  useEffect(() => {
    if (address) {
      const feeAddress = getFeeAddress(address);
      setFeeAddress(feeAddress);
    }
  }, [address]);

  return (
    <>
      <form className="space-y-6">
        <Heading>Get doublezero fee address</Heading>
        <p className="text-sm text-gray-500">
          Get the fee address for doublezero.
        </p>
        <section className="grid gap-x-8 gap-y-6">
          <Input
            type="text"
            placeholder="Validator identity key"
            {...register("address")}
          />
          {feeAddress && (
            <p className="text-sm text-gray-500">Fee address: {feeAddress}</p>
          )}
        </section>
      </form>
    </>
  );
};

export default DZFeeAddressPage;
