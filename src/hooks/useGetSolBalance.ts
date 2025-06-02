import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useQuery } from '@tanstack/react-query';

export const useGetSolBalance = () => {
  const { connection } = useConnection();
  const { publicKey } = useWallet();

  return useQuery({
    queryKey: ['solBalance', publicKey?.toBase58()],
    queryFn: async () => {
      if (!publicKey) {
        return null;
      }

      return connection.getBalance(publicKey);
    },
    enabled: !!publicKey,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};
