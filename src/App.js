import React, { Component } from 'react';
import './App.css';
import { initAccessContext } from 'wal-eos';
import scatter from 'wal-eos-scatter-provider';

class App extends Component {
  render() {
    return (
      <div className="App" onClick={()=>{runme()}}>
        Click here to initialize Wal-eos, Select Scatter and Perform a Transfer Transaction <br />
        See console log for output
      </div>
    );
  }
}

var runme = async function() {
  // We're using our own test network as an example here.
  const accessContext = initAccessContext({
    appName: 'my_first_dapp',
    network: {
      host: 'api.pennstation.eosnewyork.io',
      port: 7001,
      protocol: 'http',
      chainId: 'cf057bbfb72640471fd910bcb67639c22df9f92470936cddc1ade0e2f2e7dc4f'
    },
    walletProviders: [
      scatter()
    ]
  });

  const walletProviders = accessContext.getWalletProviders();
  // This list can be used to, e.g., show the "login options" to the user to let him choose
  // what EOS login method he wants to use.

  // We just take the one we have as if the user has selected that
  const selectedProvider = walletProviders[0];

  // When user selects the wallet provider, we initiate the `Wallet` with it:
  const wallet = accessContext.initWallet(selectedProvider);

  await wallet.connect();

  console.log('wallet.connected = ' + wallet.connected);

  // wallet.connected === true

  // Now that we are connected, lets authenticate (in case of a Scatter app,
  // it does it right after connection, so this is more for the state tracking
  // and for WAL to fetch the EOS account data for us)
  await wallet.login();
  console.log('logged in as = ' + wallet.auth.accountName);
  console.log('logged with permission = ' + wallet.auth.permission);

  console.log('about to run transaction');

  await wallet.eosApi
    .transact({
      actions: [
        {
          account: 'eosio.token',
          name: 'transfer',
          authorization: [
            {
              actor: wallet.auth.accountName,
              permission: wallet.auth.permission
            }
          ],
          data: {
            from: wallet.auth.accountName,
            to: 'mary12345123',
            quantity: '10.0000 EOS',
            memo: ''
          }
        }
      ]
    },
    {
      broadcast: true,
      blocksBehind: 3,
      expireSeconds: 60
    }
  )
  .then(result => {
    console.log('Transaction success!', result);
    return result;
  })
  .catch(error => {
    console.error('Transaction error :(', error);
    throw error;
  });

  console.log('done');

}

export default App;
