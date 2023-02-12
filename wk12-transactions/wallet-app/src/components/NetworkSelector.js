import React from 'react';

class NetworkSelector extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            settings: this.props.alchemySettings
        };

        this.handleChange = this.handleChange.bind(this);
        console.log(this.state);
    };

    async handleChange(event) {
        event.preventDefault();
        console.log(event);
        this.props.onNetworkChange(event.target.value);
    }

    render () {
        return (
            <div className="network-div">
                <form className='network-form'>
                    <label for='network'>
                        Select a Network
                    </label>
                    <select name='network' className="selector network-selector" onChange={this.handleChange} defaultValue="ETH - Goerli">
                        <option key="ETH - Goerli" value={this.state.settings.Goerli}>
                            ETH - Goerli
                        </option>
                        <option key="ETH - Mainnet" value={this.state.settings.Ethereum}>
                            ETH - Mainnet
                        </option>
                        <option key="Polygon" value={this.state.settings.Polygon}>
                            Polygon
                        </option>
                    </select>
                </form>
            </div>
        )
    }
}

export default NetworkSelector;
