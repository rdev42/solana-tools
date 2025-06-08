import { useQuery } from "@tanstack/react-query";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { AddressLookupTableProgram } from "@solana/web3.js";

export const useGetLUTsByWalletAuthority = () => {
  const { connection } = useConnection();
  const { wallet } = useWallet();

  return useQuery({
    queryKey: ["luts", wallet?.adapter.publicKey?.toString()],
    queryFn: async () => {
      if (!wallet?.adapter.publicKey) return [];

      const accounts = await connection.getProgramAccounts(
        AddressLookupTableProgram.programId,
        {
          filters: [
            {
              memcmp: {
                offset: 22, // Authority is stored at offset 22
                bytes: wallet.adapter.publicKey.toBase58(),
              },
            },
          ],
        },
      );

      return accounts;
    },
    enabled: !!wallet?.adapter.publicKey,
  });
};
