import Web3 from "web3";
import { Observable } from "rxjs";
import { Contract } from "web3-eth-contract";
import { provider } from "web3-core";
import { TransactionReceipt } from "web3-eth";

import {
  INetwork,
  IContract,
  IProvider,
  IAddContract,
  IConnect,
  ISettings,
  IError,
  IConnectorMessage,
  ContractWeb3,
  IChain,
  INoNameContract,
  IEvent,
  IEventError,
  IKeys,
} from "./interface";
import { parameters, addChains } from "./helpers";
import { AbstractConnector, AbstractConstructor } from "abstract-connector";
import {
  chainError,
  gettingAddressError,
  invalidConfig,
  providerError,
} from "./errors";
import { initialSettings } from "./config";
import { isConfigSufficient, normalizeNetworkConfig, set } from "./utils";

const { chainsMap, chainIDMap } = parameters;
export class ConnectWallet {
  private connector: AbstractConnector;
  private providerName: string;
  private connectors: AbstractConstructor[] = [];

  private network: INetwork;
  private settings: ISettings;

  private Web3: Web3;
  private contracts = {};
  private allTxSubscribers = [];

  /**
   * Connect provider to web3 and get access to web3 methods, account address and transaction in blockchain.
   */
  constructor(initProvider?: provider) {
    if (initProvider) {
      this.Web3 = new Web3(initProvider);
    }
  }

  /**
   *
   * @param {AbstractConstructor[]} wallets - array of wallets which should be add into the wallet lib
   * @return {ConnectWallet} return instance of the class
   * @example new ConnectWallet().use([MetaMask, WalletsConnect])
   */
  public use = (wallets: AbstractConstructor[]): ConnectWallet => {
    this.connectors = wallets;
    return this;
  };

  /**
   * Add custom chains to Connect Wallet, provide an array of chains than return chain list parameters.
   *
   * @returns return chains list parameters
   * @example this.addChains([chain,chain]).then((parameters: any) => console.log(parameters),(err) => console.log(err));
   */
  public addChains = (chains: IChain[]): any => addChains(chains);

  /**
   * Create new wallet provider with network and settings values by passing it in function arguments.
   *
   * @param {IProvider} provider provider data with provider name and setting.
   * @param {INetwork} network application working network name and chainID.
   * @param {ISettings} settings connect wallet settings.
   * @param {IKeys} [keys] keys which will be used in the process (for example `infuraId`)
   * @returns return connection info in boolean (true - connected, false - not connected) or error provider.
   * @example connectWallet.connect(providerWallet, networkWallet, connectSetting).then((connect) =>
   * {console.log(connect);},(error) => {console.log('connect error', error);});
   */
  public async connect(
    provider: IProvider,
    network: INetwork,
    settings?: ISettings,
    keys?: IKeys
  ): Promise<IConnectorMessage> {
    // normalize network config (add blockExplorerURL, rpc, nativeCurrency)
    const networkConfig = normalizeNetworkConfig(network, keys);
    // simple network config validation (check existing of config fields)
    if (!isConfigSufficient(networkConfig).valid) {
      return invalidConfig(provider);
    }
    // check providers
    if (
      this.connectors.every(
        (connector) => new connector(networkConfig).name !== provider.name
      )
    ) {
      return providerError(provider);
    }

    this.network = networkConfig;
    this.settings = settings ? settings : initialSettings;

    this.connector = this.chooseProvider(provider.name);

    return this.connector
      .connect(provider, networkConfig)
      .then((connect: IConnectorMessage) => {
        return this.applySettings(connect);
      })
      .then((connect: IConnectorMessage) => {
        if (connect.connected) {
          this.initWeb3(
            connect.provider === "Web3" ? Web3.givenProvider : connect.provider
          );
        } else {
          const { chainID } = this.network;

          return this.applySettings(
            chainError(
              `Please set network: ${chainsMap[chainIDMap[chainID]].name}.`
            )
          ) as IConnectorMessage;
        }

        return connect;
      })
      .catch((error: IConnectorMessage) => {
        return this.applySettings(error) as IConnectorMessage;
      });
  }

  /**
   * Find and choose available provider for create connection.
   *
   * @param {string} name provider name passing from connect function in provider value.
   * @returns return selected provider class.
   * @example connectWallet.chooseProvider('MetaMask'); //=> new MetamaskConnect()
   */
  private chooseProvider(name: string) {
    this.providerName = name;
    const provider = this.connectors.find(
      (connector) => new connector(this.network).name === name
    );
    return new provider(this.network);
  }

  /**
   * Initialize a Web3 by set provider after using connect function.
   *
   * @param {any} provider array with provider information.
   * @example connectWallet.initWeb3(provider);
   */
  private initWeb3(provider: any): void {
    if (this.Web3) {
      this.Web3.setProvider(provider);
    } else {
      this.Web3 = new Web3(provider);
    }
  }

  /**
   * Getting current connector
   *
   * @example connectWallet.getConnector();
   */
  public getConnector(): AbstractConnector {
    return this.connector;
  }

  /**
   * Getting current providerName
   *
   * @example connectWallet.getProviderName();
   */
  public getProviderName(): string {
    return this.providerName;
  }

  /**
   * Add settings parameters to connect wallet answers.
   *
   * @param {Array} data array which needs to apply a settings parameters
   * @returns return complete data with settings parameters
   * @example connectWallet.applySettings(data); //=> data.type etc.
   */
  private applySettings(
    data: IConnectorMessage | IError | IConnect
  ): IConnectorMessage | IError | IConnect {
    if (this.settings.providerType) {
      data.type = this.providerName;
    }
    return data;
  }

  /**
   * Get account address and chain information from selected wallet provider.
   *
   * @returns return an Promise array with data error or connected.
   * @example connectWallet.getAccounts().then((account: any)=> console.log('account',account),(err: any => console.log('account', err)));
   */
  public getAccounts(): Promise<IConnect> {
    return new Promise((resolve, reject) => {
      if (this.currentWeb3() && !this.connector) {
        const { address, accounts } = this.currentWeb3().currentProvider as any;
        const connectObject: IConnect = {
          address: address || accounts[0],
          network: {
            name: this.network.chainName,
            chainID: this.network.chainID,
          },
        };
        resolve(connectObject);
      } else if (this.connector) {
        const { chainID } = this.network;

        this.connector
          .getAccounts()
          .then((connectInfo: IConnect) => {
            if (connectInfo.network.chainID !== chainID) {
              reject(
                this.applySettings(
                  chainError(
                    `Please set network: ${
                      chainsMap[chainIDMap[chainID]].name
                    }.`
                  )
                )
              );
            } else {
              resolve(this.applySettings(connectInfo) as IConnect);
            }
          })
          .catch((error: IError) => {
            reject(this.applySettings(error));
          });
      } else {
        reject(this.applySettings(gettingAddressError()));
      }
    });
  }

  /**
   * Create new Observer of transactions and add it to array of all transaction subscribers
   * variable. You can subscribe to waiting answer from blockchain if your transaction
   * finished success or not. You will get transaction hash.
   *
   * @returns return new observable value.
   * @example connectWallet.txSubscribe().subscribe((tx) => {console.log('transaction', tx)});
   */
  public txSubscribe(): Observable<any> {
    const newObserver = new Observable((observer) => {
      this.allTxSubscribers.push(observer);
    });
    return newObserver;
  }

  /**
   * Trigger all transaction subscribers and pass transaction hash if transaction complete.
   *
   * @param {string} txHash transaction hash of success transaction.
   * @example connectWallet.clTxSubscribers(txHash);
   */
  public clTxSubscribers(txHash: string): void {
    this.allTxSubscribers.forEach((observer) => {
      observer.next(txHash);
    });
  }

  /**
   * Checking transaction hash status in blockchain. And return transaction hash if transaction
   * was found and success or reject null if don't have enough data or information.
   *
   * @param {string} txHash transaction hash.
   * @param {any} resolve resolve transaction hash.
   * @param {any} reject reject if transaction not found.
   * @returns return transaction hash or reject with null.
   * @example new Promise((resolve, reject) => {connectWallet.checkTx(txHash, resolve, reject);});
   */
  private txStatus(txHash: string, resolve: any, reject: any): void {
    this.Web3.eth.getTransactionReceipt(
      txHash,
      (err: Error, res: TransactionReceipt) => {
        if (err || (res && res.blockNumber && !res.status)) {
          reject(err);
        } else if (res && res.blockNumber) {
          this.clTxSubscribers(txHash);
          resolve(res);
        } else if (!res) {
          setTimeout(() => {
            this.txStatus(txHash, resolve, reject);
          }, 2000);
        }
      }
    );
  }

  /**
   * Transaction check in blockchain. Use this function to start check transaction by his hash.
   * This function will triggered all transaction subscribers when transaction complete successful or
   * with errors. You need to provide transaction hash in function after you approve it.
   *
   * @param {string} txHash transaction hash.
   * @returns return promise with transaction search info, can return transaction hash or null.
   * @example connectWallet.txCheck(txHash).then((txHash: string) => console.log(txHash),(err) => console.log(err));
   */
  public txCheck(txHash: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.txStatus(txHash, resolve, reject);
    });
  }

  /**
   * Add contract to Web3 without providing contract name to initialize it, then you will
   * able to use contract function to get contract from web3 and use contract methods.
   *
   * @param {INoNameContract} contract contract object with contract address and abi.
   * @returns return contract web3 methods.
   * @example connectWallet.getContract(contract);
   */
  public getContract(contract: INoNameContract): Contract {
    return new this.Web3.eth.Contract(contract.abi, contract.address);
  }

  /**
   * Add contract to Web3. Provide contract name, address and abi code to initialize it, then you will
   * able to use contract(name) function to get contract from web3 and use contract methods.
   *
   * @param {IAddContract} contract contract object with contract name, address and abi.
   * @returns return all contracts
   * @example connectWallet.addContract(contract);
   */
  public addContracts<T extends IAddContract>(contracts: Record<T['name'], T>) {
    const newContracts = set(this.contracts, contracts)
    this.contracts = newContracts;
    return this.contracts
  }

  /**
   * Get contract by providing contract name. If you don't have contracts use addContract function to initialize it.
   *
   * @param {string} name contract name.
   * @returns return contract parameters and methods.
   * @example connectWallet.Contract(ContractName);
   */
  public Contract = (
    name: string
  ): Promise<ContractWeb3> =>
    new Promise((resolve, reject) => {
      if(!this.contracts.hasOwnProperty(name)){
        reject(`There is no contract with name: ${name}`)
      }
      try {
        const { address, abi } = this.contracts[name];
        const contractInstance = new this.Web3.eth.Contract(abi, address);
        resolve(contractInstance);
      } catch (e) {
        reject(e);
      }
    });

  /**
   * Get access to use Web3. Return Web3 variable to use it methods and parameters.
   *
   * @returns return Web3
   * @example connectWallet.currentWeb3();
   */
  public currentWeb3 = (): Web3 => this.Web3;

  /**
   * Get account balance from ethereum blockchain. Provide address in function arguments to receive address balance
   * from blockchain.
   *
   * @param {string} address address.
   * @returns return address balance.
   * @example connectWallet.getBalance(address).then((balance: string)=> {console.log(balance)});
   */
  public getBalance = (address: string): Promise<string | number> => {
    return this.Web3.eth.getBalance(address);
  };

  /**
   * Logout function. Use this function if you want to do logout from your application. Function will reset
   * current connection to default then you need to initialize connect() function again to connect to your
   * provider.
   *
   * @example connectWallet.resetConnect();
   */
  public resetConnect = (): void => {
    this.connector.disconnect();
    this.connector = undefined;
  };

  /**
   * Use this method to sign custom message.
   *
   * @example connectWallet.signMsg('0x0000000000000000000', 'some_data').then(data => console.log('sign:', data),err => console.log('sign err:',err));
   */
  public signMsg = (userAddr: string, msg: string): Promise<any> => {
    return this.Web3.eth.personal.sign(msg, userAddr, "");
  };

  /**
   * Subscribe to events from current connection: connect, disconnect, chain change, account change and etc.
   *
   * @example connectWallet.eventSubscriber().subscribe((event:IEvent) => console.log('event from subscribe', event), (err:IEventError) => console.log('event error', err));
   */
  public eventSubscriber(): Observable<IEvent | IEventError> {
    if (!this.connector) {
      throw new Error("connector haven't initialized");
    }

    return new Observable((observer) => {
      this.connector.eventSubscriber().subscribe(
        (event: IEvent) => observer.next(event),
        (error: IEventError) => observer.error(error)
      );
    });
  }
}
