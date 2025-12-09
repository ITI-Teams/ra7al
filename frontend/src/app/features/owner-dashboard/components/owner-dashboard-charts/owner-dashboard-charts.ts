import { Component, OnInit } from '@angular/core';
import { ChartOptions, ChartType, ChartData } from 'chart.js';
import { CommonModule } from '@angular/common';
import { OwnerDashboardcharts } from '../../../../core/services/owner-dashboardcharts';
import { BaseChartDirective } from 'ng2-charts';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);
@Component({
  selector: 'app-owner-dashboard-charts',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './owner-dashboard-charts.html',
  styleUrls: ['./owner-dashboard-charts.css'],
})
export class OwnerDashboardCharts implements OnInit {
  dashboardData: any;

  // Charts configuration using ChartData
  propertiesByStatusType: ChartType = 'pie';
  propertiesByStatusData: ChartData<'pie', number[], string> = {
    labels: [],
    datasets: [
      {
        data: [],
        backgroundColor: ['#7F3DFF', '#F59E0B', '#10B981', '#EF4444'],
        hoverOffset: 10,
      },
    ],
  };

  propertiesByCityType: ChartType = 'bar';
  propertiesByCityData: ChartData<'bar', number[], string> = {
    labels: [],
    datasets: [
      {
        data: [],
        backgroundColor: '#3B82F6',
      },
    ],
  };

  requestsStatsType: ChartType = 'doughnut';
  requestsStatsData: ChartData<'doughnut', number[], string> = {
    labels: [],
    datasets: [
      {
        data: [],
        backgroundColor: ['#F59E0B', '#EF4444', '#10B981'],
        hoverOffset: 10,
      },
    ],
  };

  requestsPerPropertyType: ChartType = 'bar';
  requestsPerPropertyData: ChartData<'bar', number[], string> = {
    labels: [],
    datasets: [
      {
        data: [],
        backgroundColor: '#6366F1',
      },
    ],
  };

  chartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 1000,
      easing: 'easeOutBounce',
    },
    plugins: {
      legend: {
        labels: {
          color: '#374151',
        },
      },
    },
    scales: {
      x: {
        ticks: { color: '#374151' },
      },
      y: {
        ticks: { color: '#374151' },
      },
    },
  };

  constructor(private ownerDashboardService: OwnerDashboardcharts) {}

  ngOnInit(): void {
    this.ownerDashboardService.getDashboardData().subscribe((res) => {
      this.dashboardData = res.data;

      // Properties by status
      this.propertiesByStatusData.labels =
        this.dashboardData.properties_by_status.map((p: any) => p.status);
      this.propertiesByStatusData.datasets[0].data =
        this.dashboardData.properties_by_status.map((p: any) => p.count);

      // Properties by city
      this.propertiesByCityData.labels =
        this.dashboardData.properties_by_city.map((p: any) => p.city);
      this.propertiesByCityData.datasets[0].data =
        this.dashboardData.properties_by_city.map((p: any) => p.count);

      // Requests stats
      this.requestsStatsData.labels = this.dashboardData.requests_stats.map(
        (r: any) => r.status
      );
      this.requestsStatsData.datasets[0].data =
        this.dashboardData.requests_stats.map((r: any) => r.count);

      // Requests per property
      this.requestsPerPropertyData.labels =
        this.dashboardData.requests_per_property.map(
          (r: any) => r.property_title
        );
      this.requestsPerPropertyData.datasets[0].data =
        this.dashboardData.requests_per_property.map((r: any) => r.requests);
    });
  }
}
