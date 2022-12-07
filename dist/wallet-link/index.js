"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
exports.WalletLinkConnect = void 0;
var rxjs_1 = require("rxjs");
var walletlink_1 = __importDefault(require("walletlink"));
var helpers_1 = require("../helpers");
var WalletLinkConnect = /** @class */ (function () {
    /**
     * WalletLinkConnect class to connect browser Coinbase Wallet extension to your application
     * using connect wallet.
     */
    function WalletLinkConnect(network) {
        this.name = 'WalletLink';
        this.chainID = network.chainID;
    }
    /**
     * Connect Coinbase Wallet browser. Create connection with connect
     * wallet and return provider for Web3.
     *
     * @returns return connect status and connect information with provider for Web3.
     * @example this.connect().then((connector: IConnectorMessage) => console.log(connector),(err: IConnectorMessage) => console.log(err));
     */
    WalletLinkConnect.prototype.connect = function (provider) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (typeof window.ethereum && window.ethereum.isWalletLink === true) {
                _this.connector = window.ethereum;
                resolve({
                    code: 1,
                    connected: true,
                    provider: _this.connector,
                    message: {
                        title: 'Success',
                        subtitle: 'Connect success',
                        text: "WalletLink found and connected."
                    }
                });
            }
            else {
                var walletLink = new walletlink_1["default"]({
                    darkMode: false,
                    appName: '123',
                    overrideIsMetaMask: true
                });
                var chain = helpers_1.parameters.chainsMap[helpers_1.parameters.chainIDMap[_this.chainID]];
                _this.connector = walletLink.makeWeb3Provider("https://".concat(chain.name, ".infura.io/v3/").concat(provider.provider.infuraId), _this.chainID);
                resolve({
                    code: 1,
                    connected: true,
                    provider: _this.connector,
                    message: {
                        title: 'Success',
                        subtitle: 'WalletLink Connect',
                        text: "WalletLink found and connected."
                    }
                });
            }
            reject({
                code: 2,
                connected: false,
                message: {
                    title: 'Error',
                    subtitle: 'Error connect',
                    text: "WalletLink not found, please install it from <a href='https://metamask.io/' target=\"_blank\">metamask.io</a>."
                }
            });
        });
    };
    WalletLinkConnect.prototype.ethRequestAccounts = function () {
        return this.connector.enable();
    };
    WalletLinkConnect.prototype.eventSubscriber = function () {
        var _this = this;
        return new rxjs_1.Observable(function (observer) {
            // this.connector.on('chainChanged', async (chainId: string) => {
            //   const accounts = await this.ethRequestAccounts();
            //   onNext(observer, {
            //     address: accounts[0],
            //     network: parameters.chainsMap[parameters.chainIDMap[+chainId]],
            //   });
            // });
            _this.connector.on('accountsChanged', function (address) {
                if (address.length) {
                    observer.next({
                        address: address[0],
                        network: helpers_1.parameters.chainsMap[helpers_1.parameters.chainIDMap[+_this.chainID]],
                        name: 'accountsChanged'
                    });
                }
                else {
                    observer.error({
                        code: 3,
                        message: {
                            title: 'Error',
                            subtitle: 'Authorized error',
                            text: 'You are not authorized.'
                        }
                    });
                }
            });
        });
    };
    /**
     * Get account address and chain information from Coinbase Wallet extension.
     *
     * @returns return an Observable array with data error or connected information.
     * @example this.getAccounts().subscribe((account: any)=> {console.log('account',account)});
     */
    WalletLinkConnect.prototype.getAccounts = function () {
        var _this = this;
        var error = {
            code: 3,
            message: {
                title: 'Error',
                subtitle: 'Authorized error',
                message: 'You are not authorized.'
            }
        };
        return new Promise(function (resolve, reject) {
            if (_this.connector) {
                _this.ethRequestAccounts().then(function (accounts) {
                    if (accounts[0]) {
                        _this.connector
                            .request({
                            method: 'net_version'
                        })
                            .then(function (chainID) {
                            _this.chainID = +chainID;
                            resolve({
                                address: accounts[0],
                                network: helpers_1.parameters.chainsMap[helpers_1.parameters.chainIDMap[+chainID]]
                            });
                        });
                    }
                    else {
                        _this.connector.enable()["catch"](function () {
                            reject(error);
                        });
                    }
                }, function (err) {
                    console.log(err);
                });
            }
        });
    };
    WalletLinkConnect.prototype.disconnect = function () {
        return new Promise(function (resolve) { return resolve(null); });
    };
    return WalletLinkConnect;
}());
exports.WalletLinkConnect = WalletLinkConnect;
