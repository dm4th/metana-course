import React from 'react';

class BalanceTable extends React.Component {
    constructor(props) {
        super(props);
        this.handleTransfer = this.handleTransfer.bind(this);
    };

    handleTransfer(e) {
        console.log(e)
    }

    logoURL() {
        if (this.props.network.config.network == 'polygon-mainnet') {
            return 'https://cryptologos.cc/logos/polygon-matic-logo.png?v=024'
        } else {
            return 'https://cryptologos.cc/logos/ethereum-eth-logo.png?v=024'
        }
    }

    tokenName() {
        if (this.props.network.config.network == 'polygon-mainnet') {
            return 'MATIC'
        } else {
            return 'ETH'
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
                                <input type="text" className="transfer-form-control transfer-input" id="address-capture" placeholder="0x...." />
                                <br></br>
                            </div>
                            <div className="transfer-form-group">
                                <label htmlFor="amount" className="transfer-form-control">Amount:</label>
                                <br></br>
                                <input type="number" className="transfer-form-control transfer-input" id="amount-capture" step="0.00001" placeholder="" />
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
            </div>
        )
    }
}

export default BalanceTable;
