import {AfterViewInit, Component, NgZone, OnInit, ViewChild} from '@angular/core';
import {ChartOptions, ChartType, ChartDataSets} from 'chart.js';
import {Label} from 'ng2-charts';
import * as Chart from 'chart.js';
import {Router} from '@angular/router';
import {chartMockData} from '../inner/inner.component';

@Component({
  selector: 'app-bar-chart',
  templateUrl: './bar-chart.component.html',
  styleUrls: ['./bar-chart.component.css']
})

export class BarChartComponent implements OnInit {
  // @ts-ignore
  @ViewChild('mychart') mychart;

  canvas: any;
  ctx: any;
  selectedLabel: any;
  barChartOptions: any;
  barChartLabels: any[] = ['bm3873', 'bs4732', 'dd166g', 'dd8575'];
  barChartType: any = 'horizontalBar';
  barChartLegend = true;
  barChartPlugins = [];
  barChartData: any[] = [];

  /*  barChartData: any[] = [
      // tslint:disable-next-line:max-line-length
      { hoverBackgroundColor: [ '#0057b8', '#0057b8', '#0057b8',  '#0057b8' ], backgroundColor: [ '#0057b8', '#0057b8', '#0057b8',  '#0057b8' ], data: [45, 37, 46, 33], label: 'Best Fruits' },
    ];*/

  constructor(private router: Router, private ngZone: NgZone) {
    // @ts-ignore

  }


  ngOnInit(): void {
    window['barChartComponent'] = {
      component: this,
      zone: this.ngZone,
      loadBarElements: (activePoint) => this.showBarElements(activePoint),
      loadLabels: (event, arrayElemnts, chart) => this.loadLabel(event, arrayElemnts, chart)
    };

    this.barChartOptions = {

      responsive: true,
      tooltips: {enabled: false},
      scales: {
        yAxes: [{
          stacked: true,

          ticks: {
            beginAtZero: true,
            fontColor: 'blue' // y-Axes color you want to add
          },
        }],
        xAxes: [{
          stacked: true,

          ticks: {
            fontColor: 'green'// y-Axes color you want to add
          },
        }]
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
    // this.barChartLabels = this.prepareYaxis(chartRawData.employees);

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

}
