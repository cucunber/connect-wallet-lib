import { Observable } from 'rxjs';
import WalletLink from 'walletlink';

import {
  IConnectorMessage,
  IProvider,
  INetwork,
  IEvent,
  IEventError,
} from '../interface';
import { parameters } from '../helpers';
import { AbstractConnector } from '../abstract-connector';

export class WalletLinkConnect implements AbstractConnector {
  public name: string = 'WalletLink';
  public connector: any;
  private chainID: any;

  /**
   * WalletLinkConnect class to connect browser Coinbase Wallet extension to your application
   * using connect wallet.
   */

  constructor(network: INetwork) {
    this.chainID = network.chainID;
  }

  /**
   * Connect Coinbase Wallet browser. Create connection with connect
   * wallet and return provider for Web3.
   *
   * @returns return connect status and connect information with provider for Web3.
   * @example this.connect().then((connector: IConnectorMessage) => console.log(connector),(err: IConnectorMessage) => console.log(err));
   */
  public connect(provider: IProvider): Promise<IConnectorMessage> {
    return new Promise<any>((resolve, reject) => {
      if (typeof window.ethereum && window.ethereum.isWalletLink === true) {
        this.connector = window.ethereum;
        resolve({
          code: 1,
          connected: true,
          provider: this.connector,
          message: {
            title: 'Success',
            subtitle: 'Connect success',
            text: `WalletLink found and connected.`,
          },
        } as IConnectorMessage);
      } else {
        const walletLink = new WalletLink({
          darkMode: false,
          appName: '123',
          overrideIsMetaMask: true,
        });

        const chain = parameters.chainsMap[parameters.chainIDMap[this.chainID]];

        this.connector = walletLink.makeWeb3Provider(
          `https://${chain.name}.infura.io/v3/${provider.provider.infuraId}`,
          this.chainID
        );
        resolve({
          code: 1,
          connected: true,
          provider: this.connector,
          message: {
            title: 'Success',
            subtitle: 'WalletLink Connect',
            text: `WalletLink found and connected.`,
          },
        } as IConnectorMessage);
      }

      reject({
        code: 2,
        connected: false,
        message: {
          title: 'Error',
          subtitle: 'Error connect',
          text: `WalletLink not found, please install it from <a href='https://metamask.io/' target="_blank">metamask.io</a>.`,
        },
      } as IConnectorMessage);
    });
  }

  private ethRequestAccounts(): Promise<any> {
    return this.connector.enable();
  }

  public eventSubscriber(): Observable<IEvent | IEventError> {
    return new Observable((observer) => {
      // this.connector.on('chainChanged', async (chainId: string) => {
      //   const accounts = await this.ethRequestAccounts();
      //   onNext(observer, {
      //     address: accounts[0],
      //     network: parameters.chainsMap[parameters.chainIDMap[+chainId]],
      //   });
      // });

      this.connector.on('accountsChanged', (address: Array<any>) => {
        if (address.length) {
          observer.next({
            address: address[0],
            network: parameters.chainsMap[parameters.chainIDMap[+this.chainID]],
            name: 'accountsChanged',
          });
        } else {
          observer.error({
            code: 3,
            message: {
              title: 'Error',
              subtitle: 'Authorized error',
              text: 'You are not authorized.',
            },
          });
        }
      });
    });
  }

  /**
   * Get account address and chain information from Coinbase Wallet extension.
   *
   * @returns return an Observable array with data error or connected information.
   * @example this.getAccounts().subscribe((account: any)=> {console.log('account',account)});
   */

  public getAccounts(): Promise<any> {
    const error = {
      code: 3,
      message: {
        title: 'Error',
        subtitle: 'Authorized error',
        message: 'You are not authorized.',
      },
    };
    return new Promise((resolve, reject) => {
      if (this.connector) {
        this.ethRequestAccounts().then(
          (accounts) => {
            if (accounts[0]) {
              this.connector
                .request({
                  method: 'net_version',
                })
                .then((chainID: string) => {
                  this.chainID = +chainID;
                  resolve({
                    address: accounts[0],
                    network:
                      parameters.chainsMap[parameters.chainIDMap[+chainID]],
                  });
                });
            } else {
              this.connector.enable().catch(() => {
                reject(error);
              });
            }
          },
          (err) => {
            console.log(err);
          }
        );
      }
    });
  }
  
  public disconnect(): Promise<void> {
    return new Promise(resolve => resolve(null));
  } 
}
