import React from 'react';
import ReactApexChart from 'react-apexcharts';
import { ApexOptions } from "apexcharts";
import {
  GroupIcon,
  BoxIconLine,
  BoxIcon,
  CheckCircleIcon,
  RupeeLineIcon,
} from "../../icons";
interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  change?: string;
  changeType?: 'positive' | 'negative';
  icon: React.ReactNode;
  colorClass?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, subtitle, change, changeType, icon, colorClass = "bg-green-50 text-green-600" }) => (
  <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
    <div className="flex items-start justify-between">
      <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${colorClass}`}>
        {icon}
      </div>
      {change && (
        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${changeType === 'positive' ? 'bg-green-50 text-green-600 dark:bg-green-900/20' : 'bg-red-50 text-red-600 dark:bg-red-900/20'
          }`}>
          {change}
        </span>
      )}
    </div>
    <div className="mt-4">
      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
      <div className="flex items-baseline gap-2 mt-1">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{value}</h2>
        {subtitle && <span className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</span>}
      </div>
    </div>
  </div>
);

import { useQuery } from '@tanstack/react-query';
import { getDashboardStats } from '../../services/dashboardService';

export default function EcommerceMetrics() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: getDashboardStats,
    refetchInterval: 30000 // Refresh every 30s
  });

  if (isLoading && !stats) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  // Fallback if data still missing after loading
  const safeStats = stats || {
    total_farmers: 0,
    total_agents: 0,
    total_aos: 0,
    total_acres: 0,
    total_yield_tons: 0,
    total_payments: 0,
    land_status: { growing: 0, sowing: 0, ready: 0 },
    monthly_stats: {
      categories: ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN'],
      production: [0, 0, 0, 0, 0, 0],
      harvest: [0, 0, 0, 0, 0, 0],
      payment: [0, 0, 0, 0, 0, 0]
    }
  };

  // --- Chart Configurations ---

  // 1. Grass Production Over Time (Line Chart) - Matched to image
  const lineChartOptions: ApexOptions = {
    chart: {
      type: 'area',
      height: 350,
      fontFamily: 'Outfit, sans-serif',
      toolbar: { show: false },
      zoom: { enabled: false }
    },
    colors: ['#059669'], // Darker Green like in image
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.2, // Lighter fill
        opacityTo: 0.05,
        stops: [0, 100]
      }
    },
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth', width: 3 },
    xaxis: {
      categories: ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN'],
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: {
        style: { colors: '#9CA3AF', fontSize: '12px' } // Gray-400
      }
    },
    yaxis: { show: false }, // Hidden Y-axis as per image
    grid: {
      borderColor: '#f3f4f6',
      strokeDashArray: 0, // Solid lines or removed in image? Image has very faint lines.
      yaxis: { lines: { show: true } },
      xaxis: { lines: { show: false } },
      padding: { top: 0, right: 0, bottom: 0, left: 10 }
    },
    tooltip: { theme: 'light' }
  };

  const lineChartSeries = [{
    name: 'Grass Production',
    data: safeStats.monthly_stats.production
  }];

  // 2. Cultivation Status (Donut Chart) - Matched to image
  const donutChartOptions: ApexOptions = {
    chart: { type: 'donut', fontFamily: 'Outfit, sans-serif' },
    labels: ['Growing', 'Sowing', 'Ready'],
    colors: ['#059669', '#6EE7B7', '#D1FAE5'], // Deep Green, Light Green, Very Light Green
    plotOptions: {
      pie: {
        donut: {
          size: '80%', // Thinner ring
          labels: {
            show: true,
            name: { show: true, fontSize: '12px', color: '#6B7280', offsetY: 20 },
            value: { show: true, fontSize: '24px', fontWeight: 700, color: '#111827', offsetY: -20, formatter: () => safeStats.total_acres.toLocaleString() },
            total: {
              show: true,
              showAlways: true,
              label: 'TOTAL ACRES',
              fontSize: '10px',
              fontWeight: 600,
              color: '#6B7280',
              formatter: () => safeStats.total_acres.toLocaleString()
            }
          }
        }
      }
    },
    dataLabels: { enabled: false },
    legend: {
      position: 'bottom',
      horizontalAlign: 'center',
      fontSize: '12px',
      markers: { size: 8, shape: 'circle' },
      itemMargin: { horizontal: 10, vertical: 5 }
    },
    stroke: { show: false }
  };

  const donutChartSeries = [safeStats.land_status.growing, safeStats.land_status.sowing, safeStats.land_status.ready];

  // 3. Payments vs Harvest (Bar Chart) - Matched to image
  const barChartOptions: ApexOptions = {
    chart: { type: 'bar', toolbar: { show: false }, fontFamily: 'Outfit, sans-serif' },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '50%',
        borderRadius: 2,
        dataLabels: { position: 'top' }, // No labels in image though
      },
    },
    dataLabels: { enabled: false },
    stroke: { show: true, width: 4, colors: ['transparent'] }, // Gap between bars
    xaxis: {
      categories: ['W1', 'W2', 'W3', 'W4', 'W5'],
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: { style: { colors: '#9CA3AF', fontSize: '12px' } }
    },
    yaxis: { show: false },
    colors: ['#065F46', '#A7F3D0'], // Dark Green (Harvest), Light Green (Payment)
    legend: {
      position: 'top',
      horizontalAlign: 'right',
      fontSize: '11px',
      fontWeight: 600,
      itemMargin: { horizontal: 10 }
    },
    grid: { show: false }
  };

  const barChartSeries = [
    { name: 'HARVEST', data: safeStats.monthly_stats.harvest }, // Dark bars
    { name: 'PAYMENT', data: safeStats.monthly_stats.payment }  // Light bars
  ];

  return (
    <div className="space-y-6">

      {/* 1. Dashboard Overview Metrics */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Dashboard Overview</h2>
        {/* Search bar is in header, but image shows title here nicely aligned */}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Total Cultivated Area */}
        <MetricCard
          title="Total Cultivated Area"
          value={safeStats.total_acres.toLocaleString()}
          subtitle="Acres"
          change="+12%"
          changeType="positive"
          icon={<BoxIcon className="w-6 h-6" />}
          colorClass="bg-green-50 text-green-700" // Light green bg for icon
        />

        {/* Card 2: Active Farmers */}
        <MetricCard
          title="Active Lands"
          value={(safeStats as any).total_active_lands || 0}
          change="+4%"
          changeType="positive"
          icon={<GroupIcon className="w-6 h-6" />}
          colorClass="bg-emerald-50 text-emerald-700"
        />

        {/* Card 3: Monthly Yield */}
        <MetricCard
          title="Monthly Yield"
          value={((safeStats as any).monthly_yield_tons || 0).toLocaleString()}
          subtitle="Tons"
          change="-2%"
          changeType="negative"
          icon={<BoxIconLine className="w-6 h-6" />}
          colorClass="bg-red-50 text-red-600" // Red bg for icon
        />

        {/* Card 4: Total Payments */}
        <MetricCard
          title="Total Payments"
          value={`₹${((safeStats as any).monthly_payments || 0).toLocaleString()}`}
          change="+18%"
          changeType="positive"
          icon={<RupeeLineIcon className="w-6 h-6" />}
          colorClass="bg-emerald-100 text-emerald-800" // Darker green icon
        />
      </div>

      {/* 2. Charts Section Row 1 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Grass Production Over Time */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 lg:col-span-2">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Grass Production Over Time</h3>
            <button className="rounded-lg border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50 shadow-sm">
              Last 6 Months
            </button>
          </div>
          <ReactApexChart options={lineChartOptions} series={lineChartSeries} type="area" height={280} />
        </div>

        {/* Cultivation Status */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <h3 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">Cultivation Status</h3>
          <div className="flex items-center justify-center">
            <ReactApexChart options={donutChartOptions} series={donutChartSeries} type="donut" height={280} />
          </div>
        </div>
      </div>

      {/* 3. Charts Section Row 2 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Payments vs Harvest */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Payments vs Harvest</h3>
          </div>
          <ReactApexChart options={barChartOptions} series={barChartSeries} type="bar" height={250} />
        </div>

        {/* Recent Field Alerts */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Recent Field Alerts</h3>
            <button className="text-sm font-medium text-green-600 hover:text-green-700">View All</button>
          </div>
          <div className="space-y-4">
            {(safeStats as any).recent_activity?.length > 0 ? (
              (safeStats as any).recent_activity.map((activity: any, idx: number) => (
                <div key={idx} className="flex gap-4 relative">
                  <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-lg ${activity.type === 'land' ? 'bg-blue-500' : 'bg-green-600'}`}></div>
                  <div className={`flex items-start gap-3 w-full p-4 pl-5 rounded-lg ${idx % 2 === 0 ? 'bg-gray-50 dark:bg-gray-800/50' : 'bg-white border border-gray-100 dark:bg-gray-800'}`}>
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg flex-shrink-0 ${activity.type === 'land' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>
                      {activity.type === 'land' ? <BoxIcon className="w-5 h-5" /> : <CheckCircleIcon className="w-5 h-5" />}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate max-w-[200px]">{activity.title}</h4>
                      <p className="text-[10px] text-gray-500 mt-1">{activity.subtitle}</p>
                      <p className="text-[9px] text-gray-400 mt-0.5">{activity.time}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-gray-400 italic text-sm">No recent activity found.</div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
