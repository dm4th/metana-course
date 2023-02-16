import React from 'react';
const { Wallet } = require("alchemy-sdk");

class WalletConnector extends React.Component {
    constructor(props) {
        super(props);

        this.handleChange = this.handleChange.bind(this);
        this.createWalletHandler = this.createWalletHandler.bind(this);
        this.importWalletHandler = this.importWalletHandler.bind(this);
        this.clearWalletsHandler = this.clearWalletsHandler.bind(this);
    };

    async handleChange(event) {
        event.preventDefault();

        // show modal asking for password input
        this.props.askPassword(event.target.value, true);
    }
    
    async createWalletHandler() { 
        try {
            // create new wallet
            const newWallet = Wallet.createRandom({ });

            // show modal for displaying seed phrase
            this.props.showSeed(newWallet.mnemonic.phrase, true);

            // add the wallet address to the list of wallets we can select from
            let walletsArr = this.props.wallets;
            if (this.props.wallets) {
                walletsArr.push(newWallet.address);
            } else {
                walletsArr = [newWallet.address];
            }

            // lift the new wallet up to the App
            this.props.onWalletChange(walletsArr, newWallet);
        } catch (err) {
            console.log(err);
        }
    }

    importWalletHandler() {
        this.props.askSeed(true);
    }

    clearWalletsHandler() {
        this.props.showClear(true);
    }

    // async sendETH(addr, amt) {
    //     // use metamask on goerli to seed a new account with ETH
    //     try {
    //         const provider = new ethers.providers.Web3Provider(window.ethereum);
    //         const signer = provider.getSigner();
    //         const tx = await signer.sendTransaction({
    //             to: addr,
    //             value: amt
    //         })
    //         console.log(`TX for Seeding ETH: https://goerli.etherscan.io/tx/${tx.hash}`);
    //         await tx.wait();
    //         const newBalance = Utils.parseEther(await provider.getBalance(addr));
    //         console.log(`Done\n${addr} balance: ${newBalance} ETH`);
    //     } catch(err) {
    //         console.log(err);
    //     }
    // }

    walletDisp() {
        return (
            <p className='wallet-disp'>Current Wallet: {this.props.address}</p>
        )
    }

    noWalletDisp() {
        return (
            <p className='no-wallet-disp'>Please Select a Wallet</p>
        )
    }

    render () {
        return (
            <div className="wallet-div">
                <div className='wallet-selector-div'>
                    <form className='wallet-selector'>
                        <label htmlFor="wallet">
                            Select a Wallet
                        </label>
                        <select name="wallet" className="selector wallet-selector" onChange={this.handleChange} defaultValue={this.props.address}>
                            <option key="" value="">
                                ...
                            </option>
                            {this.props.wallets.map((address) =>
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
                    <button onClick={this.importWalletHandler} className='cta-button import-wallet-button'>
                    Import Wallet
                    </button>
                    <button onClick={this.clearWalletsHandler} className='cta-button clear-wallet-button'>
                    Clear Wallets
                    </button>
                </div>
                <div className='wallet-disp-div'>
                    {this.props.address ? this.walletDisp() : this.noWalletDisp()}
                </div>
            </div>
        )
    }
}

export default WalletConnector;
