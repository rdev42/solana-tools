import * as React from "react";
import { Button } from "../components/button";
import { Heading } from "../components/heading";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { useCreateNonce } from "../hooks/nonce/useCreateNonce";

const UploadFilePage: React.FC = () => {
  const { mutate: createNonce, data, isPending } = useCreateNonce();
  const [secretKey, setSecretKey] = useState<string | null>(null);
  const [publicKey, setPublicKey] = useState<string | null>(null);

  const { handleSubmit } = useForm<{
    file: FileList;
  }>();
  const onSubmit = async () => {
    createNonce();
  };

  useEffect(() => {
    if (data) {
      setSecretKey(data.nonce);
      setPublicKey(data.publicKey);
    }
  }, [data]);

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Heading>Create nonce</Heading>
        <p className="text-sm text-gray-500">Create a nonce account.</p>
        <section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
          <Button color="green" type="submit" disabled={isPending}>
            {isPending ? "Creating..." : "Create nonce"}
          </Button>
        </section>
        {secretKey && publicKey && (
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <p className="text-sm text-gray-300">
              Nonce created! This is the private key: {secretKey} . View:{" "}
              <a
                href={`https://solscan.io/account/${publicKey}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 break-all"
              >
                https://solscan.io/account/{publicKey}
              </a>
            </p>
          </div>
        )}
      </form>
    </>
  );
};

export default UploadFilePage;
