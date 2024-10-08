"use client";

import { createThirdwebClient } from "thirdweb";
import { PayEmbed } from "thirdweb/react";
import { baseSepolia } from "thirdweb/chains";

// create a thirdweb client
const client = createThirdwebClient({
  clientId: `${process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID}`,
});

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center justify-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start justify-center">
        <PayEmbed
          client={client}
          theme={"dark"}
          payOptions={{
            mode: "direct_payment",
            buyWithFiat: { testMode: true }, // remove this if deploying to mainnet
            paymentInfo: {
              amount: "0.01", // purchase amount for your token
              chain: baseSepolia, // chain of the accepted token. Use optional "tokenInfo" field for non-native tokens.
              sellerAddress: process.env.NEXT_PUBLIC_WALLET_ADDRESS as string,
            },
            // Purchase Data is added to the webhook response
            // Add information here that you intend to consume server-side
            purchaseData: {
              nftContractAddress: process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS,
              chainId: baseSepolia.id,
              metadata: {
                name: "Pay Sample NFT",
                image:
                  "ipfs://bafybeia3gb56ne2tuoujtwiorkruhaukzdou3u2o5fjpyf7mbbuuf6brtq/krabs.webp",
                amount: "0.01",
              },
            },
            // Metadata is displayed on PayEmbed client
            metadata: {
              name: "Pay Sample NFT",
              image:
                "ipfs://bafybeia3gb56ne2tuoujtwiorkruhaukzdou3u2o5fjpyf7mbbuuf6brtq/krabs.webp",
            },
          }}
        />
      </main>
    </div>
  );
}
