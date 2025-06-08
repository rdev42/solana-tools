import { useState } from "react";
import { Button } from "../button";
import { Input } from "../input";
import { PublicKey } from "@solana/web3.js";
import { type Token } from "../../hooks/useGetToken";
import { useMintTokens } from "../../hooks/token/useMintTokens";

export const MintTokenForm = ({ token }: { token: Token }) => {
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");

  const { mutate: mintTokens, isPending } = useMintTokens();

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
        disabled={isPending || !recipient || !amount}
        onClick={() =>
          mintTokens({
            token,
            recipient: new PublicKey(recipient),
            amount: Number(amount),
          })
        }
      >
        {isPending ? "Minting..." : "Mint tokens"}
      </Button>
    </div>
  );
};
