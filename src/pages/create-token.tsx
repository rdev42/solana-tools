import * as React from "react";
import { Button } from "../components/button";
import { Input } from "../components/input";
import { Heading } from "../components/heading";
import { useForm } from "react-hook-form";
import { useCreateToken } from "../hooks/token/useCreateToken";

const CreateTokenPage: React.FC = () => {
  const { mutate: createToken, isPending: createTokenPending } =
    useCreateToken();

  const { register, handleSubmit } = useForm<{
    mint: string;
    name: string;
    symbol: string;
    description: string;
    decimals: number;
    image: FileList;
  }>();

  return (
    <>
      <form
        onSubmit={handleSubmit((data) => createToken(data))}
        className="space-y-6"
      >
        <Heading>Create token</Heading>
        <p className="text-sm text-gray-500">
          Files are uploaded to the IRYS Gateway. If your wallet is unfunded, it
          will create a transaction to fund with 0.01 SOL.
        </p>

        <section className="grid gap-x-8 gap-y-6">
          <Input
            type="text"
            placeholder="Mint PK (leave empty for random)"
            {...register("mint")}
          />
          <Input type="text" placeholder="Name" {...register("name")} />
          <Input type="text" placeholder="Symbol" {...register("symbol")} />
          <Input
            type="text"
            placeholder="Description"
            {...register("description")}
          />
          <Input type="text" placeholder="Decimals" {...register("decimals")} />
          <Input
            type="file"
            aria-label="File"
            placeholder="Token image"
            {...register("image")}
          />
        </section>
        <section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
          <Button color="green" type="submit" disabled={createTokenPending}>
            {createTokenPending ? "Creating..." : "Create"}
          </Button>
        </section>
      </form>
    </>
  );
};

export default CreateTokenPage;
