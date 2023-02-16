import React from 'react';

class TransactionTable extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            sentCount: Math.min(this.props.transactions.sent.length, 5),
            receivedCount: Math.min(this.props.transactions.received.length, 5)
        };
        this.handleChange = this.handleChange.bind(this);
    };

    handleChange(event) {
        event.preventDefault();
        this.setState({
            [event.target.name]: event.target.value
        });
    }

    render () {
        return (
            <div className='transaction-wrapper'>
                <div className='transaction-div'>
                    <div className='transaction-header'>
                        <h2>Sent Transactions</h2>
                        <div className='transaction-form-div'>
                            <form className="transaction-form" >
                                <div className="transaction-form-group">
                                    <label htmlFor="sentCount" className="transaction-form-control transaction-label">Transactions to View: </label>
                                    <br></br>
                                    <input 
                                        type="number" 
                                        name="sentCount"
                                        value={this.state.sentCount}
                                        onChange={this.handleChange} 
                                        className="transaction-form-control transaction-input" 
                                        id="sent-capture"
                                        min="0"
                                        max={this.props.transactions.sent.length}
                                        step="1"
                                    />
                                    <br></br>
                                </div>
                            </form>
                        </div>
                    </div>
                    <table className='transaction-table'>
                        <thead>
                            <tr>
                                <th>Logo</th>
                                <th>Category</th>
                                <th>Asset</th>
                                <th>Value</th>
                                <th>Transaction Link</th>
                            </tr>
                        </thead>
                        <tbody>
                            {this.props.transactions.sent.slice(0, this.state.sentCount).map((transaction) => 
                                <tr key={transaction.txHash}>
                                    <td><img src={transaction.logo} alt='' className='token-logo' /></td>
                                    <td>{transaction.category.toUpperCase()}</td>
                                    <td>{transaction.asset}</td>
                                    <td>{transaction.value}</td>
                                    <td><a href={this.props.txLink + transaction.txHash} target="_blank">Transaction</a></td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <div className='transaction-div'>
                    <div className='transaction-header'>
                        <h2>Received Transactions</h2>
                        <div className='transaction-form-div'>
                            <form className="transaction-form" >
                                <div className="transaction-form-group">
                                    <label htmlFor="receivedCount" className="transaction-form-control transaction-label">Transactions to View: </label>
                                    <br></br>
                                    <input 
                                        type="number" 
                                        name="receivedCount"
                                        value={this.state.receivedCount} 
                                        onChange={this.handleChange} 
                                        className="transaction-form-control transaction-input" 
                                        id="received-capture"
                                        min="0"
                                        max={this.props.transactions.received.length}
                                        step="1"
                                    />
                                    <br></br>
                                </div>
                            </form>
                        </div>
                    </div>
                    <table className='transaction-table'>
                        <thead>
                            <tr>
                                <th>Logo</th>
                                <th>Category</th>
                                <th>Asset</th>
                                <th>Value</th>
                                <th>Transaction Link</th>
                            </tr>
                        </thead>
                        <tbody>
                            {this.props.transactions.received.slice(0, this.state.receivedCount).map((transaction) => 
                                <tr key={transaction.txHash}>
                                    <td><img src={transaction.logo} alt='' className='token-logo' /></td>
                                    <td>{transaction.category.toUpperCase()}</td>
                                    <td>{transaction.asset}</td>
                                    <td>{transaction.value}</td>
                                    <td><a href={this.props.txLink + transaction.txHash} target="_blank">Transaction</a></td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        )
    }
}

export default TransactionTable;