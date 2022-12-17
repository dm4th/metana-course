import React from 'react';
import { ethers } from 'ethers'
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
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
    Legend
  );

class GasGraph extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            block: 0,
            _x: [],
            _baseFee: [],
            _gasUsedRatio: []
        };
    };

    async componentDidMount() {
        const alchemy = this.props.alchemy;
        try {
            console.log(`Opening WebSocket for Block Fees`);
            alchemy.ws.on("block", (result) => {
                this.updateComponent(result);
            });
        } catch (err) {
            console.error(err);
        }
    }

    handleBlockChange() {
        return this.props.block;
    }

    async updateComponent(result) {
        const alchemy = this.props.alchemy;
        this.setState({
            block: result,
            _x: this.state._x,
            _baseFee: this.state._baseFee,
            _gasUsedRatio: this.state._gasUsedRatio
        })
        const response = await alchemy.core.getBlock(result);
        this.updateGraph(response);
    }

    updateGraph(response) {
        const max_blocks = this.props.maxBlocks;
        const _x = this.state._x;
        const _baseFee = this.state._baseFee;
        const _gasUsedRatio = this.state._gasUsedRatio;

        const resp_basefee = parseInt(response.baseFeePerGas._hex,16);
        const resp_gaslimit = parseInt(response.gasLimit._hex,16);
        const resp_gasUsed = parseInt(response.gasUsed._hex,16);

        const new_len = _x.push(this.state.block);
        _baseFee.push(resp_basefee);
        _gasUsedRatio.push(resp_gasUsed / resp_gaslimit);

        if (new_len > max_blocks) {
            const removals = new_len - max_blocks;
            _x.splice(0, removals);
            _baseFee.splice(0, removals);
            _gasUsedRatio.splice(0, removals);
        }
        
        this.setState({
            block: this.state.block,
            _x: _x,
            _baseFee: _baseFee,
            _gasUsedRatio: _baseFee
        })
    }

    // Area Graph Render Options & Data
    options () {
        return ({
            responsiveness: true,
            interaction: {
              mode: 'index',
              intersect: false,
            },
            stacked: false,
            plugins: {
                legend: {
                    position: 'top'
                },
                title: {
                    display: true,
                    text: 'BaseFee vs. Gas Used Ratio'
                }
            },
            scales: {
              y: {
                type: 'linear',
                display: true,
                position: 'left',
              },
              y1: {
                type: 'linear',
                display: true,
                position: 'right',
                grid: {
                  drawOnChartArea: false,
                },
              }
            }
        })
    }

    data ()  {
        return ({
            labels: this.state._x,
            datasets: [
                {
                    label: "BaseFee",
                    data: this.state._baseFee,
                    borderColor: 'rgb(93, 63, 211)',
                    backgroundColor: 'rgba(93, 63, 211, 0.5)',
                    yAxisID: 'y'    
                },
                {
                    label: "Gas Ratio",
                    data: this.state._gasUsedRatio,
                    borderColor: 'rgb(32, 212, 32)',
                    backgroundColor: 'rgba(32, 212, 32, 0.5)',
                    yAxisID: 'y1'    
                }
            ]
        })
    }

    render () {
        return (
            <Line className='graph gas-graph' options={this.options()} data={this.data()} onchange={this.handleBlockChange} />
        )
    }
}

export default GasGraph;
