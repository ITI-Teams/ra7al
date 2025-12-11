import { Component, OnInit } from '@angular/core';
import { ChartOptions, ChartData } from 'chart.js';
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
  isLoading = true;

  // Properties by Status Chart
  propertiesByStatusType: 'pie' = 'pie';
  propertiesByStatusData: ChartData<'pie', number[], string> = {
    labels: [],
    datasets: [
      {
        data: [],
        backgroundColor: ['#7C3AED', '#F59E0B', '#10B981', '#EF4444'],
        borderWidth: 0,
        hoverOffset: 15,
      },
    ],
  };

  // Properties by City Chart
  propertiesByCityType: 'bar' = 'bar';
  propertiesByCityData: ChartData<'bar', number[], string> = {
    labels: [],
    datasets: [
      {
        label: 'Properties',
        data: [],
        backgroundColor: '#6366F1',
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  };

  // Requests Stats Chart
  requestsStatsType: 'doughnut' = 'doughnut';
  requestsStatsData: ChartData<'doughnut', number[], string> = {
    labels: [],
    datasets: [
      {
        data: [],
        backgroundColor: ['#F59E0B', '#EF4444', '#10B981'],
        borderWidth: 0,
        hoverOffset: 15,
      },
    ],
  };

  // Requests per Property Chart
  requestsPerPropertyType: 'bar' = 'bar';
  requestsPerPropertyData: ChartData<'bar', number[], string> = {
    labels: [],
    datasets: [
      {
        label: 'Requests',
        data: [],
        backgroundColor: '#8B5CF6',
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  };

  // Options for Pie & Doughnut Charts
  pieChartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 1500,
      easing: 'easeInOutQuart',
    },
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 15,
          font: {
            size: 12,
            family: "'Inter', sans-serif",
          },
          color: '#374151',
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        cornerRadius: 8,
        titleFont: {
          size: 14,
          weight: 'bold',
        },
        bodyFont: {
          size: 13,
        },
      },
    },
  };

  // Options for Bar Charts
  barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 1500,
      easing: 'easeInOutQuart',
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        cornerRadius: 8,
        titleFont: {
          size: 14,
          weight: 'bold',
        },
        bodyFont: {
          size: 13,
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#6B7280',
          font: {
            size: 11,
          },
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: '#F3F4F6',
        },
        ticks: {
          color: '#6B7280',
          font: {
            size: 11,
          },
          precision: 0,
        },
      },
    },
  };

  constructor(private ownerDashboardService: OwnerDashboardcharts) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.isLoading = true;

    this.ownerDashboardService.getDashboardData().subscribe({
      next: (res) => {
        if (res.status && res.data) {
          this.dashboardData = res.data;
          this.populateCharts();
          this.isLoading = false;
        }
      },
      error: (error) => {
        console.error('Error loading dashboard data:', error);
        this.isLoading = false;
      },
    });
  }

  populateCharts(): void {
    // Properties by Status
    if (this.dashboardData.properties_by_status?.length > 0) {
      this.propertiesByStatusData = {
        labels: this.dashboardData.properties_by_status.map((p: any) =>
          this.formatStatus(p.status)
        ),
        datasets: [
          {
            data: this.dashboardData.properties_by_status.map(
              (p: any) => p.count
            ),
            backgroundColor: ['#7C3AED', '#F59E0B', '#10B981', '#EF4444'],
            borderWidth: 0,
            hoverOffset: 15,
          },
        ],
      };
    }

    // Properties by City
    if (this.dashboardData.properties_by_city?.length > 0) {
      this.propertiesByCityData = {
        labels: this.dashboardData.properties_by_city.map((p: any) => p.city),
        datasets: [
          {
            label: 'Properties',
            data: this.dashboardData.properties_by_city.map(
              (p: any) => p.count
            ),
            backgroundColor: '#6366F1',
            borderRadius: 8,
            borderSkipped: false,
          },
        ],
      };
    }

    // Requests Stats
    if (this.dashboardData.requests_stats?.length > 0) {
      this.requestsStatsData = {
        labels: this.dashboardData.requests_stats.map((r: any) =>
          this.formatStatus(r.status)
        ),
        datasets: [
          {
            data: this.dashboardData.requests_stats.map((r: any) => r.count),
            backgroundColor: ['#F59E0B', '#EF4444', '#10B981'],
            borderWidth: 0,
            hoverOffset: 15,
          },
        ],
      };
    }

    // Requests per Property
    if (this.dashboardData.requests_per_property?.length > 0) {
      this.requestsPerPropertyData = {
        labels: this.dashboardData.requests_per_property.map(
          (r: any) => r.property_title
        ),
        datasets: [
          {
            label: 'Requests',
            data: this.dashboardData.requests_per_property.map(
              (r: any) => r.requests
            ),
            backgroundColor: '#8B5CF6',
            borderRadius: 8,
            borderSkipped: false,
          },
        ],
      };
    }
  }

  formatStatus(status: string): string {
    return status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ');
  }
}
