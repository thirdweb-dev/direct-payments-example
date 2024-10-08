# Direct Payments with Pay and Engine

This [Next.js](https://nextjs.org) example project follows the [Direct Payments guide](https://portal.thirdweb.com/connect/pay/guides/accept-direct-payments) and shows you how to build a cross-chain purchase flow that:

1. Sends tokens to your merchant wallet address using thirdweb's Pre-built Pay component.
2. Sends an NFT to the buyer's wallet address using thirdweb Engine.

## Getting Started

The main logic for this example can be found in `src/app/page.tsx` (client) and `src/app/api/route.ts` (server).

In order to run this example, you'll need to copy `.env.sample` to a new `.env` and populate the following fields:

```bash
NEXT_PUBLIC_WALLET_ADDRESS=
NEXT_PUBLIC_THIRDWEB_CLIENT_ID=
NEXT_PUBLIC_NFT_CONTRACT_ADDRESS=
PAY_WEBHOOK_SECRET=
BACKEND_WALLET_ADDRESS=
ENGINE_API_URL=
ENGINE_ACCESS_TOKEN=
```

Note that `NEXT_PUBLIC_WALLET_ADDRESS` should be the merchant wallet address you'd like funds to be sent to. This could be your business wallet, for example.

### Getting a Client ID

To create a Client ID, navigate to the [Settings page](https://thirdweb.com/dashboard/settings/api-keys) in your dashboard and click Create API Key. Copy the Client ID field and paste it into your `.env`.

### Deploying an NFT Contract

Head to our [Contract Explorer](https://thirdweb.com/explore) and choose the token contract (ERC20, ERC721, ERC721C, ERC1155) that suits your use case. In our example, we utilize the [NFT Drop contract](https://thirdweb.com/thirdweb.eth/DropERC721). Enter the required information and select your chain. Once your contract has been deployed, copy the contract address and paste it into your `.env`.

### Creating a Pay Webhook

Navigate to your [Pay Dashboard](https://thirdweb.com/dashboard/connect/pay), click the "Webhooks" tab, and click "Create Webhook". Enter the URL where you'd like to listen events. In our case, since we are testing locally, we'll need to specify `localhost:3000/api` (or the port of your choice). Copy the generated Webhook Secret and paste it into your `.env`.

### Deploying an Engine

If you have not already deployed an Engine instance, navigate to the [Engine Dashboard](https://thirdweb.com/dashboard/engine) and click "Create Engine Instance". Select the tier that best suits your use case. Once you've deployed, copy the generated URL and paste it into your `.env`.

### Creating an Engine Access Token

Once you've deployed your Engine, click into your instance and navigate to the Access Tokens page. Click "Create Access Token". Copy the generated token and paste it into your `.env`.

### Try it out

Now, you can run your development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Your Direct Payments client and server will now run at `localhost:3000`.
