import React from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Filler,
    Legend,
  } from 'chart.js';
  import { Line } from 'react-chartjs-2';
  
  ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Filler,
    Legend
  );

class ERC20Graph extends React.Component {
    constructor(props) {
        super(props);
        const address = "0xdAC17F958D2ee523a2206206994597C13D831ec7";
        this.state = {
            contract: address,
            name: "",
            symbol: "",
            logo: "",
            _x: [],
            _y: [],
            filter: {
                address: address,
                topics: ['0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'] //Filter topic for ERC20 transfers
            }
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    };

    async componentDidMount() {
        try {
            await this.updateComponent();
        } catch (err) {
            console.error(err);
        }
    }

    handleChange(event) {
        this.setState({
            contract: event.target.value,
            name: this.state.name,
            symbol: this.state.symbol,
            logo: this.state.logo,
            _x: this.state._x,
            _y: this.state._y,
            filter: this.state.filter
        });
    }

    async handleSubmit(event) {
        event.preventDefault();
        try {
            // turn off previous web socket first
            await this.clearComponent();
            await this.updateComponent();
        } catch (err) {
            console.error(err);
        }
    }

    async updateComponent() {
        const address = this.state.contract;
        const alchemy = this.props.alchemy;
        const meta_response = await alchemy.core.getTokenMetadata(address);
        await this.setState({
            contract: address,
            name: meta_response.name,
            symbol: meta_response.symbol,
            logo: meta_response.logo,
            _x: this.state._x,
            _y: this.state._y,
            filter: {
                address: address,
                topics: ['0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'] //Filter topic for ERC20 transfers
            }
        });

        console.log(`Opening WebSocket for ${this.state.filter.address}`);
        alchemy.ws.on(this.state.filter, (result) => {
            this.updateGraph(result);
        });
    }

    async clearComponent() {
        console.log(`Closing WebSocket for ${this.state.filter.address}`);
        await this.props.alchemy.ws.off(this.state.filter, (result) => {});
        await this.setState({
            contract: this.state.contract,
            name: this.state.name,
            symbol: this.state.symbol,
            logo: this.state.logo,
            _x: [],
            _y: [],
            filter: {
                address: this.state.contract,
                topics: ['0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef']
            }
        })
    }

    updateGraph(result) {
        const max_blocks = this.props.maxBlocks;
        const _x = this.state._x;
        const _y = this.state._y;
        const arr_len = _x.length;
        const block_number = result.blockNumber;
        var prev_block_number = _x[arr_len-1];

        if (prev_block_number === block_number) {
            _y[arr_len-1] += 1;
        } else {
            // handle blocks with 0 transactions
            var block_diff = block_number - prev_block_number;
            while (block_diff > 1) {
                prev_block_number = prev_block_number + 1;
                _x.push(prev_block_number);
                _y.push(0);
                block_diff = block_number - prev_block_number;
            }
            // console.log(`Old Arrays:\n${_x}\n${_y}`);
            const new_len = _x.push(block_number);
            _y.push(1);
            if (new_len > max_blocks) {
                const removals = new_len - max_blocks;
                _x.splice(0, removals);
                _y.splice(0, removals);
            }
            // console.log(`New Arrays:\n${_x}\n${_y}`);
        }
        
        this.setState({
            contract: this.state.contract,
            name: this.state.name,
            symbol: this.state.symbol,
            logo: this.state.logo,
            _x: _x,
            _y: _y,
            filter: this.state.filter
        })
    }

    // Area Graph Render Options & Data
    options () {
        return ({
            responsiveness: true,
            plugins: {
                legend: {
                    position: 'top'
                },
                title: {
                    display: true,
                    text: `${this.state.symbol}   ${this.state.name}`
                }
            }
        })
    }

    data ()  {
        return ({
            labels: this.state._x,
            datasets: [
                {
                    fill: true,
                    label: "Transfer Events",
                    data: this.state._y,
                    borderColor: 'rgb(53, 162, 235)',
                    backgroundColor: 'rgba(53, 162, 235, 0.5)',    
                }
            ]
        })
    }

    render () {
        return (
            <div className='graph-section'>
                <div className="input-div">
                    <form className='input-form' onSubmit={this.handleSubmit}>
                        <label className='input-label'>
                            Token Contract Address:  
                            <input className="input-field" type="text" value={this.state.contract} onChange={this.handleChange} />
                        </label>
                        <input type="submit" value="Submit" />
                    </form>
                    <p className="token-name">
                        {this.state.name}    ({this.state.symbol})
                        <img src={this.state.logo} alt="" className='token-logo' />
                    </p>
                </div>
                <Line className='graph token-graph' options={this.options()} data={this.data()} />
            </div>
        )
    }
}

export default ERC20Graph;
