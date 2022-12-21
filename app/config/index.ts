import {
  IKeys,
  INetwork,
  IProvider,
  ISettings,
  TChainsConfig,
} from "interface";
import { createConfig } from "../../src/utils";

const networks = ["Ethereum", "Binance"] as const;
const providers = ["MetaMask", "GameStop", "WalletConnect"] as const;

export const is_production = true;

export const chains = createConfig<
  typeof networks[number],
  typeof providers[number]
>({
  Binance: {
    name: "Binance",
    network: {
      mainnet: { chainID: 1 },
      testnet: { chainID: 2 },
    },
    providers: ["MetaMask", "GameStop"],
  },
  Ethereum: {
    name: "Ethereum",
    network: {
      mainnet: {
        chainID: 1,
      },
      testnet: {
        chainID: 4,
      },
    },
    providers: [
      {
        MetaMask: { name: "MetaMask" },
        WalletConnect: { name: "WalletsConnect" },
        GameStop: { name: "GameStop" },
      },
    ],
    keys: {
      infuraId: "2d76b686b0484e9ebecbaddd23cd37c7",
    },
  },
});

export const connectWallet = (chainName) => {
  const chain = chains[chainName];

  return {
    wallets: ["MetaMask"],
    network: chain.network.mainnet,
    provider: chain.provider,
    settings: { providerType: true },
    keys: chain.keys,
  };
};
