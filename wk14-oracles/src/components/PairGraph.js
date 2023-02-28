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

    prepData() {
      let i = 0;
      let j = 0;
      let x = [];
      let y1 = [];
      let y2 = [];
      while ( i < this.props._x1.length && j < this.props._x2.length) {
        if (this.props._x1[i] < this.props._x2[j]) {
          x.push(this.props._x1[i]);
          y1.push(this.props._y1[i]);
          if (j === 0) {
            y2.push(this.props._y2[0]);
          } else {
            y2.push(null);
          }
          i++;
        } else {
          x.push(this.props._x2[j]);
          if (i === 0) {
            y1.push(this.props._y1[0]);
          } else {
            y1.push(null);
          }
          y2.push(this.props._y2[j]);
          j++;
        }
      }

      while ( i < this.props._x1.length ) {
        x.push(this.props._x1[i]);
        y1.push(this.props._y1[i]);
        y2.push(this.props._y2.slice(-1));
        i++;
      }

      while ( j < this.props._x2.length ) {
        x.push(this.props._x2[j]);
        y1.push(this.props._y1.slice(-1));
        y2.push(this.props._y2[j]);
        j++;
      }

      return { x, y1, y2 };
    }

    axisPosition() {
      return this.props._dualAxis === 'Dual Axis' ? 'right' : 'left';
    }

    y1Positive() {
      return this.props._y1[0] < this.props._y1.slice(-1) ? 'rgb(0, 204, 0)' : 'rgb(255, 51, 51)';
    }

    y2Positive() {
      return this.props._y2[0] < this.props._y2.slice(-1) ? 'rgb(51, 102, 0)' : 'rgb(153, 0, 0)';
    }

    y1PositiveBackground() {
      return this.props._y1[0] < this.props._y1.slice(-1) ? 'rgb(0, 204, 0, 0.2)' : 'rgb(255, 51, 51, 0.2)';
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
            stacked: false,
            spanGaps:true,
            plugins: {
                legend: {
                    position: 'top'
                },
                title: {
                    display: true,
                    text: `${this.props._pair1} vs. ${this.props._pair2}   Price Graph`
                }
            },
            scales: {
                y1: {
                  type: 'linear',
                  display: true,
                  position: 'left'
                },
                y2: {
                  type: 'linear',
                  display: true,
                  position: this.axisPosition(),
                  grid: { 
                    drawChartOnArea: false
                  }
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
                      hour: 'MMM d - h bb',
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
      const { x, y1, y2 } = this.prepData();
      return ({
        labels: x,
        datasets: [
          {
            fill: true,
            label: this.props._pair1,
            data: y1,
            borderColor: this.y1Positive(),
            backgroundColor: this.y1PositiveBackground(),
            yAxisID: 'y1'
          },
          {
            fill: false,
            label: this.props._pair2,
            data: y2,
            borderColor: this.y2Positive(),
            yAxisID: 'y2'
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
