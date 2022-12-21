import {
  TAppliedChainsConfig,
  TChainsConfig,
} from "interface";

export const createConfig = <
  Chains extends string,
  Providers extends string,
  T extends TChainsConfig<Chains, Providers> = TChainsConfig<Chains, Providers>
>(
  config: T
) => {
  const newConfig = { ...config };
  Object.keys(newConfig).forEach((network) => {
    const networkConfig = newConfig[network];

    const defaultProviders = [];
    const stringProviders = [];
    networkConfig.providers.forEach((provider) => {
      if (typeof provider === "string") {
        stringProviders.push({ [provider]: { name: provider } });
        return;
      }
      defaultProviders.push(provider);
    });
    networkConfig.providers = Object.fromEntries(
      [...defaultProviders, ...stringProviders]
        .map((provider) => Object.entries(provider))
        .flat()
    );
  });
  return newConfig as unknown as TAppliedChainsConfig<Chains, Providers, typeof newConfig>;
};
