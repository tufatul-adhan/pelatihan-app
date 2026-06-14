import React, { useMemo } from 'react';
import { Chart as ReactChart } from 'react-chartjs-2';
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Filler,
  Title,
  Tooltip,
  Legend
);

export interface DashboardChartProps {
  labels: string[];
  data: number[];
  label: string;
  secondaryData?: number[];
  secondaryLabel?: string;
}

const buildGradient = (context: any, topColor: string, bottomColor: string) => {
  const { chart } = context;
  const { ctx, chartArea } = chart;

  if (!chartArea) {
    return topColor;
  }

  const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
  gradient.addColorStop(0, topColor);
  gradient.addColorStop(1, bottomColor);
  return gradient;
};

const DashboardChart: React.FC<DashboardChartProps> = ({
  labels,
  data,
  label,
  secondaryData,
  secondaryLabel = 'Tren',
}) => {
  const summary = useMemo(() => {
    const total = data.reduce((sum, value) => sum + value, 0);
    const average = data.length ? total / data.length : 0;
    const peak = data.length ? Math.max(...data) : 0;
    const peakIndex = data.findIndex((value) => value === peak);

    return {
      total,
      average: Number.isInteger(average) ? average.toString() : average.toFixed(1),
      peak,
      peakLabel: labels[peakIndex] || '-',
    };
  }, [data, labels]);

  const chartData: any = {
    labels,
    datasets: [
      {
        type: 'bar',
        label,
        data,
        backgroundColor: (context: any) =>
          buildGradient(context, 'rgba(15, 118, 110, 0.92)', 'rgba(14, 116, 144, 0.18)'),
        borderColor: 'rgba(15, 118, 110, 0.85)',
        borderWidth: 1,
        borderRadius: 10,
        borderSkipped: false,
        barPercentage: 0.72,
        categoryPercentage: 0.7,
      },
      {
        type: 'line',
        label: secondaryLabel,
        data: secondaryData || data,
        borderColor: '#f59e0b',
        backgroundColor: (context: any) =>
          buildGradient(context, 'rgba(245, 158, 11, 0.24)', 'rgba(245, 158, 11, 0)'),
        pointBackgroundColor: '#ffffff',
        pointBorderColor: '#f59e0b',
        pointBorderWidth: 3,
        pointRadius: 4,
        pointHoverRadius: 7,
        borderWidth: 3,
        tension: 0.42,
        cubicInterpolationMode: 'monotone',
        fill: true,
      },
    ],
  };

  const options: any = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 520,
      easing: 'easeOutCubic',
    },
    interaction: {
      intersect: false,
      mode: 'index',
    },
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#10201d',
        borderColor: 'rgba(255, 255, 255, 0.12)',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        titleFont: {
          weight: 'bold',
        },
        callbacks: {
          label: (context: any) => `${context.dataset.label}: ${context.parsed.y}`,
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#64748b',
          font: {
            weight: 700,
          },
        },
        border: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
        grace: '18%',
        grid: {
          color: 'rgba(100, 116, 139, 0.14)',
          drawTicks: false,
        },
        ticks: {
          color: '#64748b',
          precision: 0,
          padding: 10,
        },
        border: {
          display: false,
        },
      },
    },
  };

  return (
    <div className="admin-card dashboard-chart-card p-4 p-lg-5">
      <div className="d-flex flex-column flex-lg-row justify-content-between gap-4 mb-4">
        <div>
          <span className="section-eyebrow mb-3">Grafik Dashboard</span>
          <h2 className="h3 fw-bold mb-2">{label}</h2>
          <p className="section-copy mb-0">Pantau pertumbuhan program dari waktu ke waktu.</p>
        </div>
        <div className="d-flex flex-wrap gap-2 align-content-start">
          <div className="chart-stat-pill px-3 py-2">
            <small className="text-muted d-block fw-semibold">Total</small>
            <strong>{summary.total}</strong>
          </div>
          <div className="chart-stat-pill px-3 py-2">
            <small className="text-muted d-block fw-semibold">Rata-rata</small>
            <strong>{summary.average}</strong>
          </div>
          <div className="chart-stat-pill px-3 py-2">
            <small className="text-muted d-block fw-semibold">Puncak</small>
            <strong>{summary.peak} di {summary.peakLabel}</strong>
          </div>
        </div>
      </div>

      <div className="d-flex align-items-center gap-4 mb-3 small fw-semibold text-muted">
        <span className="d-inline-flex align-items-center gap-2">
          <span className="chart-legend-dot" />
          {label}
        </span>
        <span className="d-inline-flex align-items-center gap-2">
          <span className="chart-legend-dot accent" />
          {secondaryLabel}
        </span>
      </div>

      <div className="chart-shell">
        <ReactChart type="bar" data={chartData} options={options} />
      </div>
    </div>
  );
};

export default DashboardChart;
