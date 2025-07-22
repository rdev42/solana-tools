import { useForm } from "react-hook-form";
import { Heading } from "../components/heading";
import { Button } from "../components/button";
import { Input } from "../components/input";
import {
  PublicKey,
  TransactionMessage,
  VersionedTransaction,
} from "@solana/web3.js";
import {
  createTransferInstruction,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";
import { executeTx } from "../helpers/transaction";
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { useConnection } from "@solana/wallet-adapter-react";
import invariant from "tiny-invariant";

const USDC = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
const signer = "Fakzon26tKzdGKW5g2wvZM12y6TLvqPGgogE29Nq8ACB";

const SaveMe = () => {
  const { connection } = useConnection();
  const wallet = useAnchorWallet();
  const serializedTx =
    "AQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAQAHC9iph+YUWp9m24kLSAVKDIMyrzEVtCjUC1p4tUzH54iEzZt+FWdzGHGbKz/YKy7Mq8F+AsMC/rCYAeEjOp5zaqF0GQpZnMfRAJm9Yplu8gcdctDNUfdmBWQM37SBzzvHw2TwiUq+Cjw6jPLaZ3QebMaleu68BG2HP0e49R8f7Y6yAwZGb+UhFzL/7K26csOb57yM5bvF9xJrLEObOkAAAACMlyWPTiSJ8bs9ECkUjg2DC1oTmdr/EIQEjnvY2+n4Wcb6evO+2606PWXzaqvJdDGxu+TC0vbg5HymAgNFL11hAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAG3fbh12Whk9nL4UbO63msHLSF7V9bN5E6jPWFfv8AqQrDSpbBZnFaYMEjPsolig3zCx7IWOB0XHNqEmJmY0sikn9sh+xDEAWX2S7IDh4PwuUsi7/8dQ+DB2YEV+4zsuGS3l4Go594H6qUhj4duDFjztnLH9fhAiXD8SZLcAP1nQQEAAkDECcAAAAAAAAEAAUCoIYBAAUGAAEABgcIAQEJCQAAAgMBBggKCQhfge3wCDHfhAA=";

  const { register, handleSubmit, watch } = useForm<{
    address: string;
  }>();
  const address = watch("address");
  const onSubmit = async (data: { address: string }) => {
    invariant(wallet);
    console.log(data);
    const tx = TransactionMessage.decompile(
      VersionedTransaction.deserialize(Buffer.from(serializedTx, "base64"))
        .message,
    );

    const ix = createTransferInstruction(
      getAssociatedTokenAddressSync(new PublicKey(USDC), new PublicKey(signer)),
      new PublicKey(USDC),
      getAssociatedTokenAddressSync(
        new PublicKey(USDC),
        new PublicKey(address),
      ),
      2222,
    );

    tx.instructions.shift();
    tx.instructions.shift();
    tx.instructions.push(ix);

    await executeTx(
      connection,
      {
        ixs: [tx.instructions],
        description: "Save me",
      },
      wallet,
    );
  };
  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Heading>Save me</Heading>
        <p className="text-sm text-gray-500">Save limit order</p>

        <section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
          <Input
            type="text"
            aria-label="Address"
            placeholder="Destination of funds"
            {...register("address")}
          />
        </section>
        <section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
          <Button color="green" type="submit" disabled={!address}>
            Save me
          </Button>
        </section>
      </form>
    </>
  );
};

export default SaveMe;
