import { Link } from './link';

export default function Address({ address, link = true }: { address: string; link?: boolean }) {
  const shortAddress = `${address.slice(0, 4)}...${address.slice(-4)}`;
  const content = <span title={address}>{shortAddress}</span>;

  if (link) {
    return (
      <Link href={`https://solscan.io/account/${address}`} target="_blank" rel="noreferrer">
        {content}
      </Link>
    );
  }

  return content;
}
