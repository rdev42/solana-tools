import React from 'react';
import { HiExternalLink } from 'react-icons/hi';

export default function TX(props: { tx: string }) {
  return (
    <a
      className="font-mono text-saber-light font-bold flex gap-1 items-center"
      href={`https://solscan.io/tx/${props.tx}`}
      target="_blank"
      rel="noreferrer"
    >
      {props.tx.substring(0, 4)}...{props.tx.substring(props.tx.length - 4)}
      <HiExternalLink />
    </a>
  );
}
