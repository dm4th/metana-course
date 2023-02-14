import React from 'react';

class TokenTable extends React.Component {
    constructor(props) {
        super(props);
    };

    render () {
        return (
            <table>
                <thead>
                    <tr>
                        <td>Image</td>
                        <td>Symbol</td>
                        <td>Name</td>
                        <td>Balance</td>
                    </tr>
                </thead>
                <tbody>
                    {this.props.balances.map((token) => 
                        <tr>
                            <td><img src={token.logo} /></td>
                            <td>{token.symbol}</td>
                            <td>{token.name}</td>
                            <td>{token.balance}</td>
                        </tr>
                    )}
                </tbody>
            </table>
        )
    }
}

export default TokenTable;
