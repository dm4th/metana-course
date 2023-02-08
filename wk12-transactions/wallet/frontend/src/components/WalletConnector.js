import React from 'react';
import { ethers } from 'ethers';

class WalletConnector extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            wallets: this.props.wallets,
            currentWallet: null
        };

        this.handleChange = this.handleChange.bind(this);
        this.createWalletHandler = this.createWalletHandler.bind(this);
    };

    handleChange(event) {
        event.preventDefault();
        this.setState({
            wallets: this.state.wallets,
            currentWallet: event.target.values[0]
        })
        this.props.onWalletChange(event.target.values[0]);
        console.log(this.state);
    }
    
    async createWalletHandler() { 
        try {
          const newWallet = ethers.Wallet.createRandom({  });
          console.log("Creating New Wallet: ", newWallet.address);

          let walletsArr = JSON.parse(localStorage.getItem('walletStorage'));
          if (walletsArr) {
            walletsArr.push(newWallet.address);
          } else {
            walletsArr = [newWallet.address];
          }

          localStorage.setItem('walletStorage', JSON.stringify(walletsArr));

          await this.changeWallets(walletsArr, newWallet.address);
          this.props.onWalletChange(newWallet.address);
          console.log(this.state);
        } catch (err) {
          console.log(err);
        }
      }

    async clearWalletsHandler() {
        localStorage.removeItem('walletStorage');
        await this.changeWallets([], null);
        this.props.onWalletChange(null);
    }

    async changeWallets(arr, value) {
        this.setState({
            wallets: arr,
            currentWallet: value
        });
    }

    render () {
        return (
            <div className="wallet-div">
                <div className='wallet-selector-div'>
                    <form className='wallet-selector'>
                        <select className="selector wallet-selector" onChange={this.handleChange} defaultValue={this.currentWallet}>
                            {this.state.wallets.map((address) =>
                                <option key={address} value={address}>
                                    {address}
                                </option>
                            )}
                        </select>
                    </form>
                </div>
                <div className='wallet-button-div'>
                    <button onClick={this.createWalletHandler} className='cta-button create-wallet-button'>
                    Create New Wallet
                    </button>
                </div>
                <div className='wallet-button2-div'>
                    <button onClick={this.clearWalletsHandler} className='cta-button clear-wallet-button'>
                    Clear Wallets
                    </button>
                </div>
            </div>
        )
    }
}

export default WalletConnector;
