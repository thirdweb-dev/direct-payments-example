"use client";

import {
  BuyWithFiatQuote,
  getBuyWithFiatQuote,
  getBuyWithFiatStatus,
} from "thirdweb/pay";
import { NATIVE_TOKEN_ADDRESS, ThirdwebClient } from "thirdweb";
import { base } from "thirdweb/chains";
import { isSwapRequiredPostOnramp } from "thirdweb/pay";
import { useEffect, useState } from "react";

export default function DirectPayment({
  client,
  fromAddress,
}: {
  client: ThirdwebClient;
  fromAddress: string;
}) {
  const [quote, setQuote] = useState<BuyWithFiatQuote | null>(null);
  const [polling, setPolling] = useState<NodeJS.Timeout | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (quote) {
      startPolling();
    }
  }, [quote]);

  const startPolling = () => {
    stopPolling();
    const interval = setInterval(pollStatus, 10000);
    setPolling(interval);
  };

  const stopPolling = () => {
    if (polling) {
      clearInterval(polling);
      setPolling(null);
    }
  };

  const pollStatus = async () => {
    setIsLoading(true);

    if (quote && quote.intentId) {
      try {
        const fiatStatus = await getBuyWithFiatStatus({
          client,
          intentId: quote.intentId,
        });
        const currentStatus = fiatStatus.status as string;
        const hasTwoSteps = isSwapRequiredPostOnramp(quote);

        if (currentStatus === "NOT_FOUND") {
          alert("Error: Intent ID not found");
        }

        if (
          currentStatus === "NONE" ||
          currentStatus === "PENDING_PAYMENT" ||
          currentStatus === "PENDING_ON_RAMP_TRANSFER" ||
          currentStatus === "ON_RAMP_TRANSFER_IN_PROGRESS"
        ) {
          console.log("Current status: ", currentStatus);
        }

        if (currentStatus === "ON_RAMP_TRANSFER_FAILED") {
          alert("Error: Onramp transfer failed");
          stopPolling();
        }

        if (currentStatus === "ON_RAMP_TRANSFER_COMPLETED") {
          // if only on-ramp is required - process is done!
          if (!hasTwoSteps) {
            alert("Payment successful");
            setIsSuccess(true);
            stopPolling();
          } else {
            alert("Crypto Swap Required");
          }
        }

        if (currentStatus === "CRYPTO_SWAP_REQUIRED") {
          alert("This is where you swap the crypto for fiat");
        }
      } catch (error) {
        console.log("Failed to get status", error);
        stopPolling();
      }
    }
  };

  const sendFiatTransaction = async () => {
    // Get a quote for buying 0.01 Base ETH with USD
    try {
      const quote = await getBuyWithFiatQuote({
        client, // thirdweb client
        fromCurrencySymbol: "USD", // fiat currency symbol
        toChainId: base.id, // base chain id
        toAmount: "0.01", // amount of token to buy
        toTokenAddress: NATIVE_TOKEN_ADDRESS, // native token
        toAddress: `${process.env.NEXT_PUBLIC_WALLET_ADDRESS}`,
        isTestMode: true,
        fromAddress,
        purchaseData: { nftId: 1 },
      });

      setQuote(quote);
      window.open(quote.onRampLink, "_blank");
    } catch (error) {
      console.error("Error sending transaction:", error);
    }
  };

  return (
    <button
      className="flex w-full justify-center rounded-lg border border-gray-400 px-4 py-2 hover:bg-gray-300 hover:border-gray-300 hover:text-black active:opacity-80"
      onClick={() => sendFiatTransaction()}
    >
      {isSuccess ? "Success" : isLoading ? "Loading..." : "Initiate Payment"}
    </button>
  );
}
