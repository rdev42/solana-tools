"use client";

import { useWalletMultiButton } from "@solana/wallet-adapter-base-ui";
import { useLocalStorage } from "@solana/wallet-adapter-react";
import React, { useState } from "react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import {
  FaPlusCircle,
  FaCaretDown,
  FaCaretUp,
  FaHome,
  FaChevronUp,
  FaArrowRight,
  FaExternalLinkAlt,
  FaGithubAlt,
  FaPiggyBank,
} from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import {
  MdSignalCellular1Bar,
  MdSignalCellular3Bar,
  MdSignalCellular4Bar,
} from "react-icons/md";
import Address from "./components/address";
import { Avatar } from "./components/avatar";
import {
  DropdownMenu,
  DropdownItem,
  DropdownDivider,
  DropdownLabel,
  Dropdown,
  DropdownButton,
} from "./components/dropdown";
import { Heading } from "./components/heading";
import {
  NavbarItem,
  Navbar,
  NavbarSpacer,
  NavbarSection,
} from "./components/navbar";
import {
  SidebarItem,
  Sidebar,
  SidebarHeader,
  SidebarBody,
  SidebarSection,
  SidebarLabel,
  SidebarSpacer,
  SidebarFooter,
} from "./components/sidebar";
import { SidebarLayout } from "./components/sidebar-layout";
import SolBalance from "./components/solBalance";
import clsx from "clsx";
import { Link, useLocation } from "react-router-dom";
import { Button } from "./components/button";
import { useStakeSol } from "./hooks/useStakeSol";
import { Input } from "./components/input";

const StakeDialog = () => {
  const { mutate: stake, isPending } = useStakeSol();
  const [amount, setAmount] = useState(0);

  return (
    <div className="space-y-1">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
          Amount (SOL)
        </label>
        <Input
          type="number"
          min={0}
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
        />
      </div>
      <Button
        onClick={() => stake(amount)}
        disabled={isPending || amount <= 0}
        className="w-full"
        color="green"
      >
        {isPending ? "Staking..." : "Stake"}
      </Button>
    </div>
  );
};

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
        <FaArrowRight />
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
          <FaChevronUp />
        </DropdownButton>
      )}
      <AccountDropdownMenu anchor={anchor} />
    </Dropdown>
  );
}

export function ApplicationLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const path = location.pathname;
  const [priorityFee, setPriorityFee] = useLocalStorage<number>(
    "priorityFee",
    0.0001,
  );
  const [priorityFeeDialogOpen, setPriorityFeeDialogOpen] = useState(false);
  const [stakeDialogOpen, setStakeDialogOpen] = useState(false);

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
                <Avatar className="w-10 h-10" src="/logo.png" />
                <Heading>Tools</Heading>
                <div className="text-xs text-gray-500">By Mesh Validator</div>
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
                <FaHome />
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
              <SidebarItem href="/luts" current={path === "/luts"}>
                <FaPlusCircle />
                <SidebarLabel>LUTs</SidebarLabel>
              </SidebarItem>
            </SidebarSection>

            <SidebarSpacer />

            <SidebarSection>
              <SidebarItem
                className="hover:bg-transparent"
                onClick={() => {
                  setStakeDialogOpen(!stakeDialogOpen);
                }}
              >
                <SidebarLabel className="flex w-full gap-2 items-center text-xs">
                  <div>
                    <FaPiggyBank />
                  </div>
                  <div className="w-full">Stake to Mesh</div>
                  <div>{stakeDialogOpen ? <FaCaretDown /> : <FaCaretUp />}</div>
                </SidebarLabel>
              </SidebarItem>
              <div
                className={clsx(
                  "h-0 overflow-hidden transition-[height] duration-300 ease-in-out",
                  stakeDialogOpen ? "h-[100px]" : "h-0",
                )}
              >
                <StakeDialog />
              </div>

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
                  priorityFeeDialogOpen ? "h-[100px]" : "h-0",
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

              <Link to="https://github.com/rdev42/solana-tools" target="_blank">
                <SidebarItem className="hover:bg-transparent">
                  <SidebarLabel className="flex w-full gap-2 items-center text-xs">
                    <div>
                      <FaGithubAlt />
                    </div>
                    <div className="w-full">Github</div>
                    <div>
                      <FaExternalLinkAlt />
                    </div>
                  </SidebarLabel>
                </SidebarItem>
              </Link>
              <Link to="https://x.com/meshvalidator" target="_blank">
                <SidebarItem className="hover:bg-transparent">
                  <SidebarLabel className="flex w-full gap-2 items-center text-xs">
                    <div>
                      <FaXTwitter />
                    </div>
                    <div className="w-full">Twitter</div>
                    <div>
                      <FaExternalLinkAlt />
                    </div>
                  </SidebarLabel>
                </SidebarItem>
              </Link>
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
