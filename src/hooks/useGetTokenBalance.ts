import { getAssociatedTokenAddressSync } from '@solana/spl-token';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { useQuery } from '@tanstack/react-query';

export const useGetTokenBalance = (mint?: string) => {
  const { connection } = useConnection();
  const { publicKey } = useWallet();

  return useQuery({
    queryKey: ['tokenBalance', publicKey?.toBase58(), mint],
    queryFn: async () => {
      if (!publicKey || !mint) {
        return null;
      }

      const ata = getAssociatedTokenAddressSync(new PublicKey(mint), publicKey);
      const accountInfo = await connection.getTokenAccountBalance(ata);
      return accountInfo.value.uiAmount;
    },
    enabled: !!publicKey && !!mint,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};
