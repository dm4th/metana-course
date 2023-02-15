import React from 'react';

class TokenTable extends React.Component {
    constructor(props) {
        super(props);
    };

    render () {
        return (
            <div className='token-div'>
                <h2>ERC20 Tokens</h2>
                <table className='token-table'>
                    <thead>
                        <tr>
                            <th>Logo</th>
                            <th>Symbol</th>
                            <th>Name</th>
                            <th>Balance</th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.props.balances.map((token) => 
                            <tr>
                                <td><img src={token.logo}  className='token-logo' /></td>
                                <td>{token.symbol}</td>
                                <td>{token.name}</td>
                                <td>{token.balance}</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        )
    }
}

export default TokenTable;
