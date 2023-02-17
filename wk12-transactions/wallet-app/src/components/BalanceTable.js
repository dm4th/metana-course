import React from 'react';

class BalanceTable extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            address: '',
            amount: ''
        };

        // this.handleChangeAddress = this.handleChangeAddress.bind(this);
        // this.handleChangeAmount = this.handleChangeAmount.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleTransfer = this.handleTransfer.bind(this);
    };

    handleChange(event) {
        event.preventDefault();
        this.setState({
            [event.target.name]: event.target.value
        });
    }

    async handleTransfer(event) {
        event.preventDefault();
        await this.props.submitTransfer(this.state.address, this.state.amount);
        this.setState({
            address: '',
            amount: ''
        });
    }

    logoURL() {
        if (this.props.network.config.network === 'polygon-mainnet') {
            return 'https://cryptologos.cc/logos/polygon-matic-logo.png?v=024'
        } else {
            return 'https://cryptologos.cc/logos/ethereum-eth-logo.png?v=024'
        }
    }

    tokenName() {
        if (this.props.network.config.network === 'polygon-mainnet') {
            return 'MATIC'
        } else {
            return 'ETH'
        }
    }

    currentTxDisp() {
        if (this.props.currentTx) {
            if (this.props.currentTx.status === 'Transaction Processing') {
                return (
                    <div className='current-tx-div'>
                        <p className='current-tx-disp current-tx-processing'>
                            {this.props.currentTx.status}:  
                            <a href={this.props.currentTx.link} target="_blank">Explorer</a>
                        </p>
                    </div>
                )
            } else {
                return (
                    <div className='current-tx-div'>
                        <p className='current-tx-disp current-tx-complete'>
                            {this.props.currentTx.status}:  
                            <a href={this.props.currentTx.link} target="_blank">Explorer</a>
                        </p>
                    </div>
                )
            }
        } else {
            return null
        }
    }

    render () {
        return (
            <div className='balance-div'>
                <h2>{this.tokenName()} Balance -- {this.props.balance}</h2>
                <div className='balance-ops'>
                    <div className='balance-small'>
                        <img src={this.logoURL()} alt='' className='token-logo' />
                    </div>
                    <div className='balance-big'>
                        <form className="transfer-form" onSubmit={this.handleTransfer}>
                            <div className="transfer-form-group">
                                <label htmlFor="address" className="transfer-form-control">Address:</label>
                                <br></br>
                                <input 
                                    type="text" 
                                    name="address"
                                    value={this.state.address} 
                                    onChange={this.handleChange} 
                                    className="transfer-form-control transfer-input" 
                                    id="address-capture" 
                                    placeholder="0x...." 
                                />
                                <br></br>
                            </div>
                            <div className="transfer-form-group">
                                <label htmlFor="amount" className="transfer-form-control">Amount:</label>
                                <br></br>
                                <input 
                                    type="text" 
                                    name="amount"
                                    value={this.state.amount} 
                                    onChange={this.handleChange} 
                                    className="transfer-form-control transfer-input" 
                                    id="amount-capture" 
                                    placeholder={this.tokenName()}
                                />
                                <br></br>
                            </div>
                            <div className="transfer-form-group">
                                <button className="transfer-form-control cta-button transfer-button" type="submit">
                                Transfer
                                </button>
                            </div>
                        </form>
                    </div>
                    <div className='balance-small'>
                        <img src={this.logoURL()} alt='' className='token-logo' />
                    </div>
                </div>
                {this.currentTxDisp()}
            </div>
        )
    }
}

export default BalanceTable;
