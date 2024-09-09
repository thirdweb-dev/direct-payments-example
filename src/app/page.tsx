"use client";

import { createThirdwebClient } from "thirdweb";
import { ConnectButton } from "thirdweb/react";
import { useActiveAccount } from "thirdweb/react";
import DirectPayment from "./components/DirectPayment";

// create a thirdweb client
const client = createThirdwebClient({
  clientId: `${process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID}`,
});

export default function Home() {
  const account = useActiveAccount();
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <ConnectButton client={client} />
        {account && (
          <DirectPayment client={client} fromAddress={account.address} />
        )}
      </main>
    </div>
  );
}
