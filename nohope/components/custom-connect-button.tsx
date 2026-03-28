"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Button } from "./ui/button";
import { Lock } from "lucide-react";
export default function CustomConnectButton() {
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        // Note: If your app doesn't use authentication, you
        // can remove all 'authenticationStatus' checks
        const ready = mounted && authenticationStatus !== "loading";
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus || authenticationStatus === "authenticated");
        return (
          <div className="w-full">
            <div
              {...(!ready && {
                "aria-hidden": true,
                style: {
                  opacity: 0,
                  pointerEvents: "none",
                  userSelect: "none",
                },
              })}
            >
              {(() => {
                if (!connected) {
                  return (
                    <Button
                      size="lg"
                      onClick={openConnectModal}
                      className="w-full bg-linear-to-r from-purple-500 to-indigo-500 text-white hover:opacity-90 shadow-lg shadow-purple-500/30 cursor-pointer"
                    >
                      <Lock className="size-4" />
                      Kết nối ví
                    </Button>
                  );
                }
                if (chain.unsupported) {
                  return (
                    <button onClick={openChainModal} type="button">
                      Wrong network
                    </button>
                  );
                }
                return (
                  <div className="flex gap-2 w-full">
                    {/* Chain */}
                    <Button
                      onClick={openChainModal}
                      variant="outline"
                      className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border-white/10 text-white backdrop-blur-md"
                    >
                      {chain.hasIcon && (
                        <div
                          className="w-4 h-4 rounded-full overflow-hidden"
                          style={{ background: chain.iconBackground }}
                        >
                          {chain.iconUrl && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              alt={chain.name ?? "Chain icon"}
                              src={chain.iconUrl}
                              className="w-4 h-4"
                            />
                          )}
                        </div>
                      )}

                      {chain.name}
                    </Button>

                    {/* Account */}
                    <Button
                      onClick={openAccountModal}
                      variant="outline"
                      className="
        flex-1 justify-start
        bg-white/10 hover:bg-white/20
        border-white/10
        text-white
        backdrop-blur-md
      "
                    >
                      <span className="font-medium">{account.displayName}</span>

                      {account.displayBalance && (
                        <span className="ml-2 text-gray-400">
                          {account.displayBalance}
                        </span>
                      )}
                    </Button>
                  </div>
                );
              })()}
            </div>
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}
