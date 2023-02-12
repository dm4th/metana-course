import React from 'react';
const { Wallet } = require("alchemy-sdk");

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
            // create new wallet
            const newWallet = Wallet.createRandom({ });
            console.log("Creating New Wallet: ", newWallet.address);

            // build structure of what data we'll need to hold for the wallet
            const walletStruct = {
                address: newWallet.address,
                publicKey: newWallet.publicKey,
                privateKey: newWallet.privateKey,
                transactions: []
            };

            // store list of available addresses
            let walletsArr = JSON.parse(await localStorage.getItem('walletStorage'));
            if (walletsArr) {
                walletsArr.push(newWallet.address);
            } else {
                walletsArr = [newWallet.address];
            }

            // send ETH to new wallet
            // await this.sendETH(newWallet.address, Utils.parseEther("0.01"));

            // save wallet info to local browser storage
            await localStorage.setItem('walletStorage', JSON.stringify(walletsArr));
            await localStorage.setItem(newWallet.address, JSON.stringify(walletStruct));

            // set app state to the new wallet
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
                        <label for="wallet">
                            Select a Wallet
                        </label>
                        <select name="wallet" className="selector wallet-selector" onChange={this.handleChange} defaultValue={this.state.currentWallet}>
                            <option key="" value="">
                                ...
                            </option>
                            {this.state.wallets.map((address) =>
                                <option key={address} value={address}>
                                    {address}
                                </option>
                            )}
                        </select>
                    </form>
                </div>
                <div className='wallet-transactions-div'>
                    {this.state.currentWallet ? this.walletDisp() : this.noWalletDisp()}
                </div>
                <div className='wallet-button-div'>
                    <button onClick={this.createWalletHandler} className='cta-button create-wallet-button'>
                    Create New Wallet
                    </button>
                    <button onClick={this.clearWalletsHandler} className='cta-button clear-wallet-button'>
                    Clear Wallets
                    </button>
                </div>
            </div>
        )
    }
}

export default WalletConnector;
