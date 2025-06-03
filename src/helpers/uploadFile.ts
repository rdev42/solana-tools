import { WebIrys } from "@irys/sdk";
import type { Wallet } from "@solana/wallet-adapter-react";

const getIrys = async (_wallet: Wallet["adapter"]): Promise<WebIrys> => {
  const rpcUrl = import.meta.env.VITE_RPC_ENDPOINT;
  const wallet = { rpcUrl: rpcUrl, name: "solana", provider: _wallet };
  const webIrys = new WebIrys({ network: "mainnet", token: "solana", wallet });
  await webIrys.ready();
  return webIrys;
};

export const uploadFile = async (file: File, wallet: Wallet) => {
  try {
    const buff = Buffer.from(new Uint8Array(await file.arrayBuffer()));

    const irys = await getIrys(wallet.adapter);
    const balance = await irys.getBalance(wallet.adapter.publicKey!.toString());
    const priceAtomic = await irys.getPrice(buff.length);
    if (balance.toNumber() < priceAtomic.toNumber()) {
      await irys.fund(10000000);
    }

    const tags = [{ name: "Content-Type", value: file.type }];
    const receipt = await irys.upload(buff, { tags });
    console.log(receipt);

    return receipt;
  } catch (e) {
    console.error(e);
  }
};
