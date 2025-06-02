import { useState } from "react";
import {
  useAnchorWallet,
  useConnection,
  useWallet,
} from "@solana/wallet-adapter-react";
import { Button } from "../button";
import { Input } from "../input";
import { PublicKey } from "@solana/web3.js";
import {
  createAssociatedTokenAccountIdempotentInstruction,
  createMintToInstruction,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";
import invariant from "tiny-invariant";
import { executeTx } from "../../helpers/transaction";
import { toast } from "sonner";
import { useGetToken } from "../../hooks/useGetToken";

interface MintTokenFormProps {
  mint: string;
}

export const MintTokenForm = ({ mint }: MintTokenFormProps) => {
  const [pending, setPending] = useState(false);
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const { data: token } = useGetToken(mint);

  const { connection } = useConnection();
  const { wallet } = useWallet();
  const anchorWallet = useAnchorWallet();

  const onMintTokens = async () => {
    try {
      setPending(true);
      invariant(wallet?.adapter.publicKey, "Wallet not connected");
      invariant(anchorWallet, "Anchor wallet not connected");
      invariant(token, "Token not found");

      const mintPubkey = new PublicKey(mint);
      const recipientPubkey = new PublicKey(recipient);

      const recipientAta = getAssociatedTokenAddressSync(
        mintPubkey,
        recipientPubkey,
        true,
      );

      // Get or create recipient's token account
      const createAtaIx = createAssociatedTokenAccountIdempotentInstruction(
        wallet.adapter.publicKey,
        recipientAta,
        recipientPubkey,
        mintPubkey,
      );

      // Create mint instruction
      const mintIx = createMintToInstruction(
        mintPubkey,
        recipientAta,
        wallet.adapter.publicKey,
        BigInt(amount) * BigInt(10 ** token.token.decimals),
      );

      await executeTx(
        connection,
        {
          ixs: [[createAtaIx, mintIx]],
          description: "Mint tokens",
        },
        anchorWallet,
      );

      toast.success("Tokens minted successfully");
      setAmount("");
      setRecipient("");
    } catch (err) {
      console.error(err);
      toast.error("Failed to mint tokens");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Mint tokens</h3>
      <Input
        type="text"
        placeholder="Recipient address"
        value={recipient}
        onChange={(e) => setRecipient(e.target.value)}
      />
      <Input
        type="number"
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <Button
        color="green"
        disabled={pending || !recipient || !amount}
        onClick={onMintTokens}
      >
        {pending ? "Minting..." : "Mint tokens"}
      </Button>
    </div>
  );
};
