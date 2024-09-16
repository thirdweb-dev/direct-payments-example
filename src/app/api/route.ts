import { NextResponse, NextRequest } from "next/server";
import { Engine } from "@thirdweb-dev/engine";
import crypto from "crypto";

const generateSignature = (
  body: string,
  timestamp: string,
  secret: string
): string => {
  const payload = `${timestamp}.${body}`;
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
};

const isValidSignature = (
  body: string,
  timestamp: string,
  signature: string,
  secret: string
): boolean => {
  const expectedSignature = generateSignature(body, timestamp, secret);
  return crypto.timingSafeEqual(
    Buffer.from(expectedSignature),
    Buffer.from(signature)
  );
};

const isExpired = (timestamp: string, expirationInSeconds: number): boolean => {
  const currentTime = Math.floor(Date.now() / 1000);
  return currentTime - parseInt(timestamp) > expirationInSeconds;
};

export async function POST(req: NextRequest) {
  try {
    const signatureFromHeader = req.headers.get("X-Pay-Signature");
    const timestampFromHeader = req.headers.get("X-Pay-Timestamp");
    const body = await req.json();

    if (!signatureFromHeader || !timestampFromHeader) {
      console.error("Missing signature or timestamp header");
      return NextResponse.json(
        { error: "Missing signature or timestamp header" },
        { status: 401 }
      );
    }

    if (
      !isValidSignature(
        JSON.stringify(body),
        timestampFromHeader,
        signatureFromHeader,
        process.env.PAY_WEBHOOK_SECRET as string
      )
    ) {
      console.error("Invalid Signature");
      return NextResponse.json({ error: "Invalid Signature" }, { status: 401 });
    }

    if (isExpired(timestampFromHeader, 300)) {
      // Assuming expiration time is 5 minutes (300 seconds)
      console.error("Request has expired");
      return NextResponse.json(
        { error: "Request has expired" },
        { status: 401 }
      );
    }

    const { data } = body;

    if (
      data.buyWithFiatStatus &&
      data.buyWithFiatStatus.status === "ON_RAMP_TRANSFER_COMPLETED"
    ) {
      const {
        fromAddress,
        purchaseData: { nftContractAddress, chainId, amount },
      } = body.data.buyWithFiatStatus;

      // Validate the purchase and call the engine
      const result = await sendContractCallToEngine(
        fromAddress,
        nftContractAddress,
        chainId,
        amount
      );

      return NextResponse.json({
        message: "Purchase processed successfully",
        result,
      });
    }

    if (
      data.buyWithCryptoStatus &&
      data.buyWithCryptoStatus.status === "CRYPTO_SWAP_COMPLETED"
    ) {
      const {
        fromAddress,
        purchaseData: { nftContractAddress, chainId, metadata },
      } = body.data.buyWithCryptoStatus;

      // Validate the purchase and call the engine
      const result = await sendContractCallToEngine(
        fromAddress,
        nftContractAddress,
        chainId,
        metadata
      );

      return NextResponse.json({
        message: "Purchase processed successfully",
        result,
      });
    }

    return NextResponse.json({ message: "Status received" });
  } catch (error) {
    console.error("Error handling webhook:", error);
    return NextResponse.json(
      { error: "Error processing webhook" },
      { status: 500 }
    );
  }
}

async function sendContractCallToEngine(
  fromAddress: string,
  nftContractAddress: string,
  chainId: string,
  metadata: Record<string, string> = {}
) {
  try {
    const engine = new Engine({
      url: process.env.ENGINE_API_URL as string,
      accessToken: process.env.ENGINE_ACCESS_TOKEN as string,
    });

    const response = await engine.erc721.mintTo(
      chainId,
      nftContractAddress,
      process.env.BACKEND_WALLET_ADDRESS as string,
      {
        receiver: fromAddress,
        metadata: metadata,
      }
    );

    console.log("Response", response.result);

    if (!response) {
      throw new Error("Error in Engine contract call");
    }

    return response;
  } catch (error) {
    console.error("Error processing Engine contract call", error);
    return NextResponse.json(
      { error: "Error processing Engine contract call" },
      { status: 500 }
    );
  }
}
