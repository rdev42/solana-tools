import * as React from "react";
import { Button } from "../components/button";
import { Input } from "../components/input";
import { Heading } from "../components/heading";
import { useForm } from "react-hook-form";
import { useUploadFile } from "../hooks/useUploadFile";
import { useEffect, useState } from "react";

const UploadFilePage: React.FC = () => {
  const { mutate: uploadFile, data, isPending } = useUploadFile();
  const [id, setId] = useState<string | null>(null);

  const { register, handleSubmit, watch } = useForm<{
    file: FileList;
  }>();
  const file = watch("file");
  const onSubmit = async (data: { file: FileList }) => {
    uploadFile(data.file[0]);
  };

  useEffect(() => {
    if (data) {
      setId(data.id);
    }
  }, [data]);

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Heading>Upload file</Heading>
        <p className="text-sm text-gray-500">
          Files are uploaded to the IRYS Gateway. If your wallet is unfunded, it
          will create a transaction to fund with 0.01 SOL.
        </p>

        <section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
          <Input
            type="file"
            aria-label="File"
            placeholder="Upload file"
            {...register("file")}
          />
        </section>
        <section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
          <Button color="green" type="submit" disabled={!file || isPending}>
            {isPending ? "Uploading..." : "Upload"}
          </Button>
        </section>
        {id && (
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <p className="text-sm text-gray-300">
              File uploaded successfully! View at:{" "}
              <a
                href={`https://gateway.irys.xyz/${id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 break-all"
              >
                https://gateway.irys.xyz/{id}
              </a>
            </p>
          </div>
        )}
      </form>
    </>
  );
};

export default UploadFilePage;
