import { WalletLinkProvider } from "walletlink";
import { Contract } from "web3-eth-contract";
import { AbiItem } from "web3-utils";
export declare type TChainType = "mainnet" | "testnet" | "devnet";
export interface IRPCMap {
    [chainId: number]: string;
}
export interface IWalletConnectProviderOptions {
    useProvider?: "rpc" | "infuraId" | "bridge";
    provider?: {
        bridge?: string;
        infuraId?: string;
        rpc?: IRPCMap;
    };
}
export interface IProvider extends IWalletConnectProviderOptions {
    name: string;
}
export declare type ContractWeb3 = Contract;
export interface IEvent {
    name: string;
    address: string;
    network: {
        name: string;
        chainId: number;
    };
}
export interface ICheckNet {
    chain: boolean;
    error?: IError;
}
export interface INativeCurrency {
    name: string;
    symbol: string;
    decimals: number;
}
export interface IEventError extends IEvent {
    code: number;
    message?: {
        title: string;
        subtitle: string;
        text: string;
    };
}
export interface IConnect {
    address: string;
    type?: string;
    network: {
        name: string;
        chainID: number;
    };
}
export interface IConnectorMessage {
    code: number;
    type?: string;
    connected: boolean;
    provider?: string | any;
    message?: {
        title: string;
        subtitle: string;
        text: string;
    };
}
export interface IError {
    code: number;
    type?: string;
    message?: {
        title: string;
        subtitle: string;
        text: string;
    };
}
export interface ISettings {
    providerType?: boolean;
}
export interface INativeCurrency {
    name: string;
    symbol: string;
    decimals: number;
}
export interface INetwork {
    chainID: number;
    chainName?: string;
    nativeCurrency?: INativeCurrency;
    rpc?: string;
    blockExplorerUrl?: string;
}
export interface IMessageProvider {
    code: number;
    message?: {
        title?: string;
        text: string;
    };
    provider?: string;
}
export declare type IContract<T extends Record<string, any> = {}> = {
    [name in keyof T]: IAddContract;
};
export interface INoNameContract {
    address: string;
    abi: AbiItem | Array<AbiItem>;
}
export interface IAddContract extends INoNameContract {
    name: string;
}
export interface IChain {
    name: string;
    chainID: number;
    hex: string;
}
export interface IKeys extends Record<string, string> {
}
export declare type TProvider<P extends string> = {
    [provider in P]?: IProvider;
};
export declare type TChainConfig<P extends string, N extends Partial<Record<TChainType, INetwork>>> = {
    name: string;
    network: N;
    providers: (TProvider<P> | P)[];
    keys?: IKeys;
};
export declare type TChainsConfig<T extends string, P extends string, N extends Partial<Record<TChainType, INetwork>> = Partial<Record<TChainType, INetwork>>> = {
    [key in T]: TChainConfig<P, N>;
};
export declare type TAppliedChainsConfig<C extends string, P extends string, T extends TChainsConfig<C, P>> = {
    [key in C]: {
        name: T[key]["name"];
        network: T[key]["network"];
        providers: {
            [provider in P]: IProvider;
        };
        keys: T[key]["keys"];
    };
};
declare global {
    interface Window {
        onto: WalletLinkProvider;
        gamestop: WalletLinkProvider;
    }
}
