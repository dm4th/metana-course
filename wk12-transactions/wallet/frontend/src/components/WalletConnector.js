import React from 'react';
import Select from 'react-dropdown-select';

class WalletConnector extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            wallets: this.props.wallets,
            currentWallet: null
        };

        this.handleChange = this.handleChange.bind(this);
    };

    componentDidMount() {
        try {
            this.updateComponent();
        } catch (err) {
            console.log(err);
        }
    }

    handleChange(event) {
        event.preventDefault();
        this.props.onWalletChange(this.state.currentWallet);
    }

    render () {
        return (
            <div className="wallet-div">
                <Select
                    className='wallet-selector'
                    options={this.state.wallets}
                    values={[]}
                    labelField="address"
                    onChange={this.handleChange}
                />
            </div>
        )
    }
}

export default BlockInput;
