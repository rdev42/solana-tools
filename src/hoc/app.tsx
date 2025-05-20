"use client";

import { useWalletMultiButton } from "@solana/wallet-adapter-base-ui";
import { Avatar } from "../components/avatar";
import {
  Dropdown,
  DropdownButton,
  DropdownDivider,
  DropdownItem,
  DropdownLabel,
  DropdownMenu,
} from "../components/dropdown";
import { Text } from "../components/text";
import {
  Navbar,
  NavbarItem,
  NavbarSection,
  NavbarSpacer,
} from "../components/navbar";
import {
  Sidebar,
  SidebarBody,
  SidebarFooter,
  SidebarHeader,
  SidebarItem,
  SidebarLabel,
  SidebarSection,
  SidebarSpacer,
} from "../components/sidebar";
import { SidebarLayout } from "../components/sidebar-layout";
import {
  ArrowRightStartOnRectangleIcon,
  ChevronUpIcon,
} from "@heroicons/react/16/solid";
import {
  BanknotesIcon,
  HomeIcon,
  RocketLaunchIcon,
} from "@heroicons/react/20/solid";
import { FaPlusCircle } from "react-icons/fa";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { Button } from "../components/button";
import Address from "../components/address";
import { Heading } from "../components/heading";
import { useGetToken } from "../hooks/useGetToken";
import { useLocalStorage } from "usehooks-ts";
import { FaCaretDown, FaCaretUp, FaFire } from "react-icons/fa6";
import { useState } from "react";
import clsx from "clsx";
import { toPrecision } from "../helpers/number";
import {
  MdSignalCellular1Bar,
  MdSignalCellular3Bar,
  MdSignalCellular4Bar,
} from "react-icons/md";
import { Input } from "../components/input";
import { useForm } from "react-hook-form";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useGetSolBalance } from "../hooks/useGetSolBalance";
import { useWallet } from "@solana/wallet-adapter-react";
import SolBalance from "../components/solBalance";

function AccountDropdownMenu({
  anchor,
}: {
  anchor: "top start" | "bottom end";
}) {
  const { setVisible: setModalVisible } = useWalletModal();
  const { onDisconnect, publicKey, walletIcon } = useWalletMultiButton({
    onSelectWallet() {
      setModalVisible(true);
    },
  });

  if (!publicKey) {
    return null;
  }

  return (
    <DropdownMenu className="min-w-64" anchor={anchor}>
      {anchor === "bottom end" ? (
        <DropdownItem>
          <div>
            <img src={walletIcon} className="w-4 h-4 rounded-full" alt="" />
          </div>
          <div className="">
            <span className="min-w-0">
              <span className="block truncate text-sm/5 font-medium text-zinc-950 dark:text-white">
                <Address link={false} address={publicKey.toBase58()} />
              </span>
              <span className="block truncate text-xs/5 font-normal text-zinc-500 dark:text-zinc-400">
                <SolBalance />
              </span>
            </span>
          </div>
        </DropdownItem>
      ) : null}
      {anchor === "bottom end" ? <DropdownDivider /> : null}
      <DropdownItem onClick={onDisconnect}>
        <ArrowRightStartOnRectangleIcon />
        <DropdownLabel>Disconnect</DropdownLabel>
      </DropdownItem>
    </DropdownMenu>
  );
}

function WalletConnectionDropdown({
  anchor,
}: {
  anchor: "top start" | "bottom end";
}) {
  const { setVisible: setModalVisible } = useWalletModal();
  const { publicKey, walletIcon } = useWalletMultiButton({
    onSelectWallet() {
      setModalVisible(true);
    },
  });

  if (!publicKey) {
    return (
      <Button color="purple" onClick={() => setModalVisible(true)}>
        Connect <span className="hidden sm:flex">Wallet</span>
      </Button>
    );
  }

  return (
    <Dropdown>
      {anchor === "bottom end" ? (
        <DropdownButton as={NavbarItem}>
          <img src={walletIcon} className="w-8 h-8 rounded-full" alt="" />
          <Address link={false} address={publicKey.toBase58()} />
        </DropdownButton>
      ) : (
        <DropdownButton as={SidebarItem}>
          <span className="flex min-w-0 items-center gap-3">
            <img src={walletIcon} className="w-10 h-10 rounded-full" alt="" />
            <span className="min-w-0">
              <span className="block truncate text-sm/5 font-medium text-zinc-950 dark:text-white">
                <Address link={false} address={publicKey.toBase58()} />
              </span>
              <span className="block truncate text-xs/5 font-normal text-zinc-500 dark:text-zinc-400">
                <SolBalance />
              </span>
            </span>
          </span>
          <ChevronUpIcon />
        </DropdownButton>
      )}
      <AccountDropdownMenu anchor={anchor} />
    </Dropdown>
  );
}

const Favorite = ({ favorite }: { favorite: string }) => {
  const { data: token } = useGetToken(favorite);

  if (!token) {
    return null;
  }

  return (
    <SidebarItem
      key={token.mint.publicKey.toString()}
      href={`/token/${token.mint.publicKey.toString()}`}
      className="w-full"
    >
      <div className="flex justify-between items-center w-full">
        <div className="flex items-center gap-2">
          {token?.image && (
            <img
              src={token.image}
              alt={token?.metadata.symbol}
              className="w-6 h-6 rounded-full"
            />
          )}
          <span>{token?.metadata.symbol ?? "Token"}</span>
        </div>
        {/* <div className="flex gap-2 items-end">
          <span className="text-right">$0.0023</span>
          <span className={`text-right ${change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {change >= 0 ? '+' : ''}
            {change.toFixed(2)}%
          </span>
        </div> */}
      </div>
    </SidebarItem>
  );
};

export function ApplicationLayout({
  children,
  path,
}: {
  children: React.ReactNode;
  path: string;
}) {
  const [priorityFee, setPriorityFee] = useLocalStorage<number>(
    "priorityFee",
    0.0001
  );
  const [priorityFeeDialogOpen, setPriorityFeeDialogOpen] = useState(false);

  return (
    <SidebarLayout
      navbar={
        <Navbar>
          <NavbarSpacer />
          <NavbarSection>
            <WalletConnectionDropdown anchor="bottom end" />
          </NavbarSection>
        </Navbar>
      }
      sidebar={
        <Sidebar>
          <SidebarHeader>
            <Dropdown>
              <SidebarItem>
                <Avatar src="/images/logo.png" />
                <Heading>Tools</Heading>
              </SidebarItem>
              {/* <DropdownButton as={SidebarItem}>
                <Avatar src="/images/logo.png" />
                <SidebarLabel>Catalyst</SidebarLabel>
                <ChevronDownIcon />
              </DropdownButton>
              <DropdownMenu className="min-w-80 lg:min-w-64" anchor="bottom start">
                <DropdownItem href="/settings">
                  <Cog8ToothIcon />
                  <DropdownLabel>Settings</DropdownLabel>
                </DropdownItem>
                <DropdownDivider />
                <DropdownItem href="#">
                  <Avatar slot="icon" src="/images/logo.png" />
                  <DropdownLabel>Catalyst</DropdownLabel>
                </DropdownItem>
                <DropdownItem href="#">
                  <Avatar slot="icon" initials="BE" className="bg-purple-500 text-white" />
                  <DropdownLabel>Big Events</DropdownLabel>
                </DropdownItem>
                <DropdownDivider />
                <DropdownItem href="#">
                  <PlusIcon />
                  <DropdownLabel>New team&hellip;</DropdownLabel>
                </DropdownItem>
              </DropdownMenu> */}
            </Dropdown>
          </SidebarHeader>

          <SidebarBody>
            <SidebarSection>
              <SidebarItem href="/" current={path === "/"}>
                <HomeIcon />
                <SidebarLabel>Upload file</SidebarLabel>
              </SidebarItem>
              <SidebarItem
                href="/create-token"
                current={path === "/create-token"}
              >
                <FaPlusCircle />
                <SidebarLabel>Create token</SidebarLabel>
              </SidebarItem>
              <SidebarItem
                href="/manage-token"
                current={path === "/manage-token"}
              >
                <FaPlusCircle />
                <SidebarLabel>Manage token</SidebarLabel>
              </SidebarItem>
              <SidebarItem href="/nirvana" current={path === "/nirvana"}>
                <FaPlusCircle />
                <SidebarLabel>Nirvana</SidebarLabel>
              </SidebarItem>
            </SidebarSection>

            <SidebarSpacer />

            <SidebarSection>
              <SidebarItem
                className="hover:bg-transparent"
                onClick={() => {
                  setPriorityFeeDialogOpen(!priorityFeeDialogOpen);
                }}
              >
                <SidebarLabel className="flex w-full gap-2 items-center text-xs">
                  <div>
                    {priorityFee === 0.0001 && <MdSignalCellular1Bar />}
                    {priorityFee === 0.001 && (
                      <MdSignalCellular3Bar className="text-yellow-500" />
                    )}
                    {priorityFee === 0.01 && (
                      <MdSignalCellular4Bar className="text-red-600" />
                    )}
                  </div>
                  <div className="w-full">Priority fee</div>
                  <div>
                    {priorityFeeDialogOpen ? <FaCaretDown /> : <FaCaretUp />}
                  </div>
                </SidebarLabel>
              </SidebarItem>
              <div
                className={clsx(
                  "h-0 overflow-hidden transition-[height] duration-300 ease-in-out",
                  priorityFeeDialogOpen ? "h-[100px]" : "h-0"
                )}
              >
                <SidebarItem onClick={() => setPriorityFee(0.0001)}>
                  <MdSignalCellular1Bar />
                  <SidebarLabel className="text-xs">0.0001 SOL</SidebarLabel>
                </SidebarItem>
                <SidebarItem onClick={() => setPriorityFee(0.001)}>
                  <MdSignalCellular3Bar className="text-yellow-500" />
                  <SidebarLabel className="text-xs">0.001 SOL</SidebarLabel>
                </SidebarItem>
                <SidebarItem onClick={() => setPriorityFee(0.01)}>
                  <MdSignalCellular4Bar className="text-red-600" />
                  <SidebarLabel className="text-xs">0.01 SOL</SidebarLabel>
                </SidebarItem>
              </div>
            </SidebarSection>
          </SidebarBody>

          <SidebarFooter className="max-lg:hidden">
            <WalletConnectionDropdown anchor="top start" />
          </SidebarFooter>
        </Sidebar>
      }
    >
      {children}
    </SidebarLayout>
  );
}
