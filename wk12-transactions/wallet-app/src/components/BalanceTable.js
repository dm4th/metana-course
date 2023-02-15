import React from 'react';

class BalanceTable extends React.Component {
    constructor(props) {
        super(props);
    };

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
                <table className='balance-table'>
                    <thead></thead>
                    <tbody>
                        <tr>
                            <td><img src={this.logoURL()} className='token-logo' /></td>
                            <td>{this.tokenName()} Balance</td>
                            <td>{this.props.balance}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        )
    }
}

export default BalanceTable;
