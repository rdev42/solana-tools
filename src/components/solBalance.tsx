import { toPrecision } from '../helpers/number';
import { useWallet } from '@solana/wallet-adapter-react';
import { useGetSolBalance } from '../hooks/useGetSolBalance';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';

export default function SolBalance() {
  const { publicKey } = useWallet();
  const { data:balance} = useGetSolBalance();

  if (!publicKey) return null;

  return (
    <div className="text-zinc-500 font-semibold">
      {toPrecision((balance ?? 0) / LAMPORTS_PER_SOL, 4)} SOL
    </div>
  );
}
