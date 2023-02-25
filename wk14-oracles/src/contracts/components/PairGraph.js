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

class PairGraph extends React.Component {

    yConv(arr) {
        console.log(arr)
        for(let i = 0; i<arr.length; arr++) {
            console.log(i);
            arr.splice(i, 0, arr[i].toNumber());
        }
    }

    xConv(arr) {
        for(let i = 0; i<arr.length; arr++) {
            let d = new Date(arr[i])
            arr.splice(i, 0, d);
        }
    }

    // Area Graph Render Options & Data
    options () {
        return ({
            responsiveness: true,
            maintainAspectRatio: false,
            interaction: {
              mode: 'index',
              intersect: false,
            },
            plugins: {
                legend: {
                    position: 'top'
                },
                title: {
                    display: true,
                    text: `${this.props.pair}   Price Graph`
                }
            },
            scales: {
                y: {
                  type: 'linear',
                  display: true,
                  position: 'left',
                  min: 0
                }
            }
        })
    }

    data ()  {
        return ({
            labels: this.xConv(this.props._x),
            datasets: [
                {
                    fill: true,
                    label: this.props.pair,
                    data: this.yConv(this.props._y),
                    borderColor: 'rgb(53, 162, 235)',
                    backgroundColor: 'rgba(53, 162, 235, 0.5)',    
                }
            ]
        })
    }

    render () {
        return (
            <div className='graph-div'>
                <Line className='graph' options={this.options()} data={this.data()} />
            </div>
        )
    }
}

export default PairGraph;
