// var bip39 = require("bip39");
// var hdkey = require('ethereumjs-wallet/hdkey');
// var ProviderEngine = require("web3-provider-engine");
// var WalletSubprovider = require('web3-provider-engine/subproviders/wallet.js');
// var Web3Subprovider = require("web3-provider-engine/subproviders/web3.js");
// var Web3 = require("web3");
const HDWalletProvider = require("truffle-hdwallet-provider");
const mnemonic = "twelve smooth dove arrest divert melt dog emotion very room nasty behind";

module.exports = {
/* ganache */
//   networks: {
//     development: {
//       host: "127.0.0.1",
//       port: 7545,
//       network_id: "*" // Match any network id
//     },

/* ropsten */
networks: {
    "ropsten-infura": {
      provider: () => new HDWalletProvider(mnemonic, "https://ropsten.infura.io/3LsU6Au1r3rAa1b0Hawz"),
      network_id: 3,
      gas: 5700000
    }
  }
};
