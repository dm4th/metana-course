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
        this.clearWalletsHandler = this.clearWalletsHandler.bind(this);
    };

    async handleChange(event) {
        event.preventDefault();
        
        const walletStruct = JSON.parse(await localStorage.getItem(event.target.value));

        await this.setState({
            wallets: this.state.wallets,
            currentWallet: walletStruct
        })
        this.props.onWalletChange(this.state.wallets, walletStruct);
    }
    
    async createWalletHandler() { 
        try {
            const newWallet = ethers.Wallet.createRandom({  });
            console.log("Creating New Wallet: ", newWallet.address);

            const walletStruct = {
                address: newWallet.address,
                publicKey: newWallet.publicKey,
                privateKey: newWallet.privateKey,
                transactions: []
            };

            let walletsArr = JSON.parse(await localStorage.getItem('walletStorage'));
            if (walletsArr) {
                walletsArr.push(newWallet.address);
            } else {
                walletsArr = [newWallet.address];
            }

            await localStorage.setItem('walletStorage', JSON.stringify(walletsArr));
            await localStorage.setItem(newWallet.address, JSON.stringify(walletStruct));

            await this.setState({
                wallets: walletsArr,
                currentWallet: walletStruct
            });

            this.props.onWalletChange(walletsArr, walletStruct);
        } catch (err) {
            console.log(err);
        }
    }

    async clearWalletsHandler() {
        await localStorage.clear();

        this.setState({
            wallets: [],
            currentWallet: null
        });

        this.props.onWalletChange([], null);
    }

    walletDisp() {
        return (
            <p>Current Wallet: {this.state.currentWallet.address}</p>
        )
    }

    noWalletDisp() {
        return (
            <p>Please select a Wallet</p>
        )
    }

    render () {
        return (
            <div className="wallet-div">
                <div className='wallet-selector-div'>
                    <form className='wallet-selector'>
                        <select className="selector wallet-selector" onChange={this.handleChange} defaultValue={this.state.currentWallet}>
                            <option key="" value="">
                                Select a Wallet...
                            </option>
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
                    <button onClick={this.clearWalletsHandler} className='cta-button clear-wallet-button'>
                    Clear Wallets
                    </button>
                </div>
                <div className='wallet-transactions-div'>
                    {this.state.currentWallet ? this.walletDisp() : this.noWalletDisp()}
                </div>
            </div>
        )
    }
}

export default WalletConnector;
