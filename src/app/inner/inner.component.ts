import {Component, NgZone, OnInit} from '@angular/core';
import {ChartDataSets, ChartOptions, ChartType} from 'chart.js';
import { Label } from 'ng2-charts';
import * as Chart from 'chart.js';

@Component({
  selector: 'app-inner',
  templateUrl: './inner.component.html',
  styleUrls: ['./inner.component.css']
})
export class InnerComponent implements OnInit {


  // chat options helps to configure titles and positions;
  chartOptions: any;
  // y axis data
  public barChartLabels: Label[] = [];
  public barChartData: ChartDataSets[] = [];
  // chart type
  public chartType: ChartType = 'horizontalBar';
  public displayPopover = false;
  public selectedLabel: any;

  constructor(private ngZone: NgZone) {}

  ngOnInit() {
    window['barChartComponent'] = {
      component: this,
      zone: this.ngZone,
      loadBarElements: (activePoint) => this.showBarElements(activePoint),
      loadLabels: (event, arrayElemnts, chart) => this.loadLabel(event, arrayElemnts, chart)
    };

    const that = this;
    this.chartOptions = {
      legend: {
        display: false,
      },
      tooltips: { enabled: false },
      responsive: true,
      title: {
        display: true,
        text: 'DISPATCH HOURS',
        position: 'bottom',
      },
      scales: {
        xAxes: [
          {
            position: 'top',
            ticks: {
              stepSize: 5,
            },
            stacked: true,
          },
        ],
        yAxes: [
          {
            stacked: true,
            scaleLabel: {
              display: true,
              labelString: 'TECHNICIANS',
            },
            ticks: {
              fontColor: '#096fec',
            },
            gridLines: {
              display: false,
            },
          },
        ],
      },
      onClick(event?: any, activeElements?: Array<any>) {
        if (activeElements.length > 0) {
          window['barChartComponent'].zone.run(() => {
            window['barChartComponent'].loadBarElements(this.getElementAtEvent(event)[0]);
          });
        } else {
          window['barChartComponent'].zone.run(() => {
            const label = window['barChartComponent'].loadLabels(event, activeElements, this.chart);
            if (label) {
              alert('Label: ' + label);
            }
          });
        }

      },
      onHover(event?: any, activeElements?: Array<any>) {
        window['barChartComponent'].zone.run(() => {
          const label = window['barChartComponent'].loadLabels(event, activeElements, this.chart);
          if (label) {
            event.target.style.cursor = 'pointer';
          } else {
            event.target.style.cursor = 'default';
          }
        });
      },
    };

    const chartRawData = this.getDispatchHours('All');
    console.log('display:', chartRawData);
    this.barChartLabels = this.prepareYaxis(chartRawData.employees);
    ['JEP', 'Repeat', 'Helper', 'Non-Demand'].forEach((m) => {
      const mappedData = this.prepareXaxisData(chartRawData.employees, m);
      this.barChartData.push({
        label: m,
        backgroundColor: mappedData.stackColor,
        hoverBackgroundColor: mappedData.stackColor,
        data: mappedData.stackData,
      });
    });
    console.log(JSON.stringify(this.barChartData));
  }

  loadLabel(event?: any, activeElements?: Array<any>, chart?: any) {
    const base = event.offsetY;
    const base1 = event.offsetX;
    if (event.pageX > base && event.pageY > base1) {
      const left = chart.chartArea.left;
      const point = Chart.helpers.getRelativePosition(event, chart);
      const yIndex = chart.scales['y-axis-0'].getValueForPixel(point.y);
      const pixel = chart.scales['y-axis-0'].getPixelForValue(point.y, yIndex);
      if (point.x <= left && (pixel <= (point.y + 10) && pixel >= (point.y - 10))) {
        const label = chart.data.labels[yIndex];
        if (label) {
          this.selectedLabel = label;
          return label;
        } else {
          return '';
        }
      }
    }

  }

  showBarElements(activePoint) {
    const data = activePoint._chart.data;
    const datasetIndex = activePoint._datasetIndex;
    const label = data.datasets[datasetIndex].label;
    const value = data.datasets[datasetIndex].data[activePoint._index];
    alert('Selected Bar: ' + label + ' value: ' + value);
  }

  getDispatchHours(transportType: any) {
    return chartMockData.payload.dispatchHours.filter((dh) => dh.transportType === transportType)[0];
  }

  prepareYaxis(employees: any) {
    const yAxis = [];
    employees.forEach((employ) => {
      yAxis.push(employ.attuid);
    });

    return yAxis;
  }

  prepareXaxisData(employees: any, metricsName: any) {
    const xAxis = {
      stackData: [],
      stackColor: [],
    };
    let stackColor = '';
    switch (metricsName) {
      case 'JEP':
        stackColor = '#0057b8';
        break;
      case 'Repeat':
        stackColor = '#18b9ed';
        break;
      case 'Helper':
        stackColor = '#ae29ba';
        break;
      case 'Non-Demand':
        stackColor = '#91dc00';
        break;
    }
    employees.forEach((employ) => {
      let isMetricFound = false;
      employ.metrics.forEach((m) => {
        if (m.metricName === metricsName) {
          xAxis.stackData.push(m.hours);
          xAxis.stackColor.push(stackColor);
          isMetricFound = true;
        }
      });
      if (!isMetricFound) {
        xAxis.stackData.push(0);
        xAxis.stackColor.push(stackColor);
      }
    });

    return xAxis;
  }

}
export const chartMockData = {
  status: 'success',
  message: '',
  payload: {
    attuid: 'FP1915',
    dispatchHours: [
      {
        transportType: 'All',
        employees: [
          {
            attuid: 'bm3873',
            metrics: [
              {
                metricName: 'JEP',
                hours: 8.49,
                lvl2Metrics: [
                  {
                    metricName: 'Customer Initiated',
                    percentTotal: 32.74,
                  },
                  {
                    metricName: 'Other',
                    percentTotal: 67.26,
                  },
                ],
              },
              {
                metricName: 'Helper',
                hours: 3.82,
                lvl2Metrics: [
                  {
                    metricName: 'Invalid',
                    percentTotal: 100,
                  },
                ],
              },
              {
                metricName: 'Non-Demand',
                hours: 6.25,
                lvl2Metrics: [
                  {
                    metricName: 'JEP',
                    percentTotal: 100,
                  },
                ],
              },
              {
                metricName: 'Repeat',
                hours: 15.95,
                lvl2Metrics: [
                  {
                    metricName: 'Demand',
                    percentTotal: 100,
                  },
                ],
              },
            ],
          },
          {
            attuid: 'bs4732',
            metrics: [
              {
                metricName: 'JEP',
                hours: 2.47,
                lvl2Metrics: [
                  {
                    metricName: 'Customer Initiated',
                    percentTotal: 26.32,
                  },
                  {
                    metricName: 'Other',
                    percentTotal: 73.68,
                  },
                ],
              },
              {
                metricName: 'Non-Demand',
                hours: 2.89,
                lvl2Metrics: [
                  {
                    metricName: 'Helping',
                    percentTotal: 100,
                  },
                ],
              },
              {
                metricName: 'Repeat',
                hours: 35.89,
                lvl2Metrics: [
                  {
                    metricName: 'Demand',
                    percentTotal: 100,
                  },
                ],
              },
            ],
          },
          {
            attuid: 'dd166g',
            metrics: [
              {
                metricName: 'Helper',
                hours: 4.32,
                lvl2Metrics: [
                  {
                    metricName: 'Valid',
                    percentTotal: 100,
                  },
                ],
              },
              {
                metricName: 'JEP',
                hours: 8.03,
                lvl2Metrics: [
                  {
                    metricName: 'Customer Initiated',
                    percentTotal: 50.19,
                  },
                  {
                    metricName: 'Other',
                    percentTotal: 49.81,
                  },
                ],
              },
              {
                metricName: 'Non-Demand',
                hours: 2.33,
                lvl2Metrics: [
                  {
                    metricName: 'Helping',
                    percentTotal: 100,
                  },
                ],
              },
              {
                metricName: 'Repeat',
                hours: 36.72,
                lvl2Metrics: [
                  {
                    metricName: 'Demand',
                    percentTotal: 100,
                  },
                ],
              },
            ],
          },
          {
            attuid: 'dd8575',
            metrics: [
              {
                metricName: 'JEP',
                hours: 8.83,
                lvl2Metrics: [
                  {
                    metricName: 'Customer Initiated',
                    percentTotal: 12.12,
                  },
                  {
                    metricName: 'Facilities Issues',
                    percentTotal: 77.46,
                  },
                  {
                    metricName: 'Lost Access',
                    percentTotal: 10.42,
                  },
                ],
              },
              {
                metricName: 'Repeat',
                hours: 21.03,
                lvl2Metrics: [
                  {
                    metricName: 'Demand',
                    percentTotal: 100,
                  },
                ],
              },
            ],
          }
        ],
      }
    ]
  },
};
