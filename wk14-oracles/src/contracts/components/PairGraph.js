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
    TimeScale,
  } from 'chart.js';
  import { Line } from 'react-chartjs-2';
  import 'chartjs-adapter-date-fns';
  import { enUS } from 'date-fns/locale';
  
  ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    TimeScale,
    Title,
    Tooltip,
    Filler,
    Legend,
  );

class PairGraph extends React.Component {

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
                  position: 'left'
                },
                x: {
                  type: 'time',
                  adapters: {
                    date: {
                      locale: enUS
                    }
                  },
                  time: {
                    displayFormats: {
                      hour: 'MMM d HHbb',
                      day: 'MMM d',
                      week: 'MMM d',
                      month: 'MMM YYYY',
                      quarter: 'MMM YYYY',
                      year: 'YYYY',
                    },
                    unit: 'hour'
                  }
                }
            }
        })
    }

    data ()  {
      const data = [];
      for( let i=0; i<this.props._x.length; i++) {
        data.push({
          x: this.props._x[i],
          y: this.props._y[i]
        });
      }
      return ({
        datasets: [
          {
            fill: true,
            label: this.props.pair,
            data: data,
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
