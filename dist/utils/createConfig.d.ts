import { TAppliedChainsConfig, TChainsConfig } from "interface";
export declare const createConfig: <Chains extends string, Providers extends string, T extends TChainsConfig<Chains, Providers, Partial<Record<import("interface").TChainType, import("interface").INetwork>>> = TChainsConfig<Chains, Providers, Partial<Record<import("interface").TChainType, import("interface").INetwork>>>>(config: T) => TAppliedChainsConfig<Chains, Providers, T>;
