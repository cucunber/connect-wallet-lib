import { ConnectWallet } from "../src/index";
import { chains, connectWallet } from "./config";
import { IError } from "interface";
import { MetaMask } from 'metamask-wallet/dist'

const wallet = new ConnectWallet().use([MetaMask]);
const { network, provider, settings, keys } = connectWallet('Ethereum');

const userState = {
  address: "",
};

const connectButton = document.getElementById("connect");
const disconnectButton = document.getElementById("disconnect");

//@ts-ignore
wallet.addContracts({ name: 'eth', abi: {}, address: ''})

connectButton.addEventListener("click", async function () {
  const connected = await wallet.connect(
    provider.GameStop,
    network,
    settings,
    keys,
  );
  console.log(connected);
  if (connected.connected) {
    const subscription = wallet.eventSubscriber().subscribe(
      (data) => console.log(data),
      (err) => console.log(err)
    );
    wallet
      .getAccounts()
      .then((accountsData) => {
        connectButton.innerText = accountsData.address
        console.log(accountsData);
      })
      .catch((err: IError) => {
        alert(err.message.text);
      });
  }
});

disconnectButton.addEventListener('click', function(){
  wallet.resetConnect();  
  if(connectButton){
    connectButton.innerText = 'Connect wallet'
  }
})
