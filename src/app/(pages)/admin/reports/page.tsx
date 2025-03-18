"use client";

import { useState, useEffect } from "react";
import AdminLayout from "../layout";
import { DateRange, DayPicker } from 'react-day-picker';
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';
import { Calendar as CalendarIcon, Download, RefreshCcw, BarChart4, PieChart } from 'lucide-react';

interface ReportData {
  totalBookings: number;
  completedBookings: number;
  pendingBookings: number;
  cancelledBookings: number;
  totalRevenue: number;
  averageBookingValue: number;
  occupancyRate: number;
  revenueByMonth: {
    month: string;
    revenue: number;
  }[];
  bookingsByStatus: {
    status: string;
    count: number;
  }[];
  topHotels: {
    id: string;
    name: string;
    bookingsCount: number;
    revenue: number;
    occupancyRate: number;
  }[];
}

export default function ReportsPage() {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [prevReportData, setPrevReportData] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState("all");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  const [chartType, setChartType] = useState<'bar' | 'pie'>('bar');
  const [isComparing, setIsComparing] = useState(false);
  
  useEffect(() => {
    async function fetchReportData() {
      try {
        setIsLoading(true);
        const queryParams = new URLSearchParams();
        
        if (timeframe !== 'custom') {
          queryParams.append('timeframe', timeframe);
        } else if (dateRange?.from && dateRange?.to) {
          queryParams.append('from', dateRange.from.toISOString());
          queryParams.append('to', dateRange.to.toISOString());
        }
        
        const response = await fetch(`/api/admin/reports?${queryParams.toString()}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch report data: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('Report data:', data);
        setReportData(data);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching report data:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
        setIsLoading(false);
      }
    }
    
    async function fetchComparisonData() {
      if (!isComparing) return;
      
      try {
        // Calculate previous period based on current timeframe
        let prevFrom, prevTo;
        
        if (timeframe === 'custom' && dateRange?.from && dateRange?.to) {
          const daysDiff = Math.round((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24));
          prevFrom = subDays(dateRange.from, daysDiff);
          prevTo = subDays(dateRange.from, 1);
        } else {
          // For predefined periods, get previous equivalent period
          const today = new Date();
          
          if (timeframe === 'week') {
            const thisWeekStart = startOfWeek(today);
            const thisWeekEnd = endOfWeek(today);
            prevFrom = subDays(thisWeekStart, 7);
            prevTo = subDays(thisWeekEnd, 7);
          } else if (timeframe === 'month') {
            const thisMonthStart = startOfMonth(today);
            const thisMonthEnd = endOfMonth(today);
            prevFrom = subDays(thisMonthStart, 30);
            prevTo = subDays(thisMonthEnd, 30);
          } else if (timeframe === 'year') {
            const thisYearStart = startOfYear(today);
            const thisYearEnd = endOfYear(today);
            prevFrom = subDays(thisYearStart, 365);
            prevTo = subDays(thisYearEnd, 365);
          } else {
            // For "all" just get previous year
            prevFrom = subDays(today, 365);
            prevTo = subDays(today, 1);
          }
        }
        
        const queryParams = new URLSearchParams();
        queryParams.append('from', prevFrom.toISOString());
        queryParams.append('to', prevTo.toISOString());
        
        const response = await fetch(`/api/admin/reports?${queryParams.toString()}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch comparison data: ${response.statusText}`);
        }
        
        const data = await response.json();
        setPrevReportData(data);
      } catch (err) {
        console.error("Error fetching comparison data:", err);
      }
    }
    
    fetchReportData();
    fetchComparisonData();
  }, [timeframe, dateRange, isComparing]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };
  
  const calculatePercentChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };
  
  const exportCSV = () => {
    if (!reportData) return;
    
    // Create CSV content
    let csvContent = "data:text/csv;charset=utf-8,";
    
    // Add headers
    csvContent += "Metric,Value\n";
    
    // Add summary data
    csvContent += `Total Bookings,${reportData.totalBookings}\n`;
    csvContent += `Completed Bookings,${reportData.completedBookings}\n`;
    csvContent += `Pending Bookings,${reportData.pendingBookings}\n`;
    csvContent += `Cancelled Bookings,${reportData.cancelledBookings}\n`;
    csvContent += `Total Revenue,${reportData.totalRevenue}\n`;
    csvContent += `Average Booking Value,${reportData.averageBookingValue}\n`;
    csvContent += `Occupancy Rate,${reportData.occupancyRate}%\n\n`;
    
    // Add monthly revenue
    csvContent += "Month,Revenue\n";
    reportData.revenueByMonth.forEach(item => {
      csvContent += `${item.month},${item.revenue}\n`;
    });
    
    csvContent += "\nTop Hotels\n";
    csvContent += "Hotel Name,Bookings,Revenue,Occupancy Rate\n";
    reportData.topHotels.forEach(hotel => {
      csvContent += `${hotel.name},${hotel.bookingsCount},${hotel.revenue},${hotel.occupancyRate}%\n`;
    });
    
    // Create download link
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `hotel_report_${timeframe === 'custom' ? 'custom_date' : timeframe}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const handleDateRangeSelect = (range: DateRange | undefined) => {
    if (range?.from && range?.to) {
      setDateRange(range);
      setTimeframe('custom');
      setShowDatePicker(false);
    }
  };
  
  const getTimeframeLabel = () => {
    if (timeframe === 'custom' && dateRange?.from && dateRange?.to) {
      return `${format(dateRange.from, 'MMM d, yyyy')} - ${format(dateRange.to, 'MMM d, yyyy')}`;
    }
    
    const labels = {
      all: 'All Time',
      year: 'This Year',
      month: 'This Month',
      week: 'This Week'
    };
    
    return labels[timeframe as keyof typeof labels] || 'Custom';
  };

  return (
    <AdminLayout>
      <div className="container mx-auto py-8 px-4 sm:px-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Reports & Analytics</h1>
            <p className="text-gray-600 mt-2">View booking statistics and revenue reports</p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={exportCSV}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 p-4 rounded-md text-red-600 mb-6">
            {error}
          </div>
        )}

        <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap space-x-2">
              <button
                onClick={() => setTimeframe("all")}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  timeframe === "all"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                All Time
              </button>
              <button
                onClick={() => setTimeframe("year")}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  timeframe === "year"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                This Year
              </button>
              <button
                onClick={() => setTimeframe("month")}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  timeframe === "month"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                This Month
              </button>
              <button
                onClick={() => setTimeframe("week")}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  timeframe === "week"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                This Week
              </button>
              <div className="relative">
                <button
                  onClick={() => setShowDatePicker(!showDatePicker)}
                  className={`flex items-center px-4 py-2 rounded-md text-sm font-medium ${
                    timeframe === "custom"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  {timeframe === 'custom' ? getTimeframeLabel() : 'Custom Range'}
                </button>
                {showDatePicker && (
                  <div className="absolute z-10 mt-2 p-4 bg-white shadow-lg rounded-lg">
                    <div className="flex justify-between mb-4">
                      <h3 className="font-medium">Select Date Range</h3>
                      <button 
                        onClick={() => setShowDatePicker(false)}
                        className="text-gray-500"
                      >
                        ✕
                      </button>
                    </div>
                    <DayPicker
                      mode="range"
                      defaultMonth={dateRange?.from}
                      selected={dateRange}
                      onSelect={handleDateRangeSelect}
                      numberOfMonths={2}
                      disabled={{ after: new Date() }}
                      className="border rounded-md p-2"
                    />
                    <div className="flex justify-end mt-4">
                      <button
                        onClick={() => setShowDatePicker(false)}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md mr-2"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          if (dateRange?.from && dateRange?.to) {
                            setTimeframe('custom');
                            setShowDatePicker(false);
                          }
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md"
                        disabled={!dateRange?.from || !dateRange?.to}
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setChartType('bar')}
                  className={`p-2 rounded-md ${chartType === 'bar' ? 'bg-gray-200' : 'text-gray-500'}`}
                  title="Bar Chart"
                >
                  <BarChart4 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setChartType('pie')}
                  className={`p-2 rounded-md ${chartType === 'pie' ? 'bg-gray-200' : 'text-gray-500'}`}
                  title="Pie Chart"
                >
                  <PieChart className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="compareToggle"
                  checked={isComparing}
                  onChange={() => setIsComparing(!isComparing)}
                  className="mr-2"
                />
                <label htmlFor="compareToggle" className="text-sm text-gray-600 flex items-center">
                  <RefreshCcw className="w-4 h-4 mr-1" />
                  Compare with previous period
                </label>
              </div>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center p-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : reportData ? (
          <div className="space-y-8">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-medium text-gray-900">Total Bookings</h3>
                <p className="mt-2 text-3xl font-semibold">{reportData.totalBookings}</p>
                {isComparing && prevReportData && (
                  <div className={`mt-2 text-sm flex items-center ${
                    calculatePercentChange(reportData.totalBookings, prevReportData.totalBookings) >= 0 
                      ? 'text-green-600' 
                      : 'text-red-600'
                  }`}>
                    <span className="mr-1">
                      {calculatePercentChange(reportData.totalBookings, prevReportData.totalBookings) >= 0 ? '↑' : '↓'}
                    </span>
                    {Math.abs(calculatePercentChange(reportData.totalBookings, prevReportData.totalBookings)).toFixed(1)}%
                  </div>
                )}
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-medium text-gray-900">Completed</h3>
                <p className="mt-2 text-3xl font-semibold text-green-600">{reportData.completedBookings}</p>
                {isComparing && prevReportData && (
                  <div className={`mt-2 text-sm flex items-center ${
                    calculatePercentChange(reportData.completedBookings, prevReportData.completedBookings) >= 0 
                      ? 'text-green-600' 
                      : 'text-red-600'
                  }`}>
                    <span className="mr-1">
                      {calculatePercentChange(reportData.completedBookings, prevReportData.completedBookings) >= 0 ? '↑' : '↓'}
                    </span>
                    {Math.abs(calculatePercentChange(reportData.completedBookings, prevReportData.completedBookings)).toFixed(1)}%
                  </div>
                )}
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-medium text-gray-900">Pending</h3>
                <p className="mt-2 text-3xl font-semibold text-yellow-600">{reportData.pendingBookings}</p>
                {isComparing && prevReportData && (
                  <div className={`mt-2 text-sm flex items-center ${
                    calculatePercentChange(reportData.pendingBookings, prevReportData.pendingBookings) >= 0 
                      ? 'text-green-600' 
                      : 'text-red-600'
                  }`}>
                    <span className="mr-1">
                      {calculatePercentChange(reportData.pendingBookings, prevReportData.pendingBookings) >= 0 ? '↑' : '↓'}
                    </span>
                    {Math.abs(calculatePercentChange(reportData.pendingBookings, prevReportData.pendingBookings)).toFixed(1)}%
                  </div>
                )}
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-medium text-gray-900">Cancelled</h3>
                <p className="mt-2 text-3xl font-semibold text-red-600">{reportData.cancelledBookings}</p>
                {isComparing && prevReportData && (
                  <div className={`mt-2 text-sm flex items-center ${
                    calculatePercentChange(reportData.cancelledBookings, prevReportData.cancelledBookings) <= 0 
                      ? 'text-green-600' 
                      : 'text-red-600'
                  }`}>
                    <span className="mr-1">
                      {calculatePercentChange(reportData.cancelledBookings, prevReportData.cancelledBookings) >= 0 ? '↑' : '↓'}
                    </span>
                    {Math.abs(calculatePercentChange(reportData.cancelledBookings, prevReportData.cancelledBookings)).toFixed(1)}%
                  </div>
                )}
              </div>
            </div>

            {/* Additional Metrics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-medium text-gray-900">Total Revenue</h3>
                <p className="mt-2 text-3xl font-bold text-blue-600">{formatCurrency(reportData.totalRevenue)}</p>
                {isComparing && prevReportData && (
                  <div className={`mt-2 text-sm flex items-center ${
                    calculatePercentChange(reportData.totalRevenue, prevReportData.totalRevenue) >= 0 
                      ? 'text-green-600' 
                      : 'text-red-600'
                  }`}>
                    <span className="mr-1">
                      {calculatePercentChange(reportData.totalRevenue, prevReportData.totalRevenue) >= 0 ? '↑' : '↓'}
                    </span>
                    {Math.abs(calculatePercentChange(reportData.totalRevenue, prevReportData.totalRevenue)).toFixed(1)}%
                  </div>
                )}
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-medium text-gray-900">Average Booking Value</h3>
                <p className="mt-2 text-3xl font-bold text-indigo-600">{formatCurrency(reportData.averageBookingValue || 0)}</p>
                {isComparing && prevReportData && prevReportData.averageBookingValue && (
                  <div className={`mt-2 text-sm flex items-center ${
                    calculatePercentChange(reportData.averageBookingValue || 0, prevReportData.averageBookingValue) >= 0 
                      ? 'text-green-600' 
                      : 'text-red-600'
                  }`}>
                    <span className="mr-1">
                      {calculatePercentChange(reportData.averageBookingValue || 0, prevReportData.averageBookingValue) >= 0 ? '↑' : '↓'}
                    </span>
                    {Math.abs(calculatePercentChange(reportData.averageBookingValue || 0, prevReportData.averageBookingValue)).toFixed(1)}%
                  </div>
                )}
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-medium text-gray-900">Occupancy Rate</h3>
                <p className="mt-2 text-3xl font-bold text-teal-600">{(reportData.occupancyRate || 0).toFixed(1)}%</p>
                {isComparing && prevReportData && prevReportData.occupancyRate && (
                  <div className={`mt-2 text-sm flex items-center ${
                    calculatePercentChange(reportData.occupancyRate || 0, prevReportData.occupancyRate) >= 0 
                      ? 'text-green-600' 
                      : 'text-red-600'
                  }`}>
                    <span className="mr-1">
                      {calculatePercentChange(reportData.occupancyRate || 0, prevReportData.occupancyRate) >= 0 ? '↑' : '↓'}
                    </span>
                    {Math.abs(calculatePercentChange(reportData.occupancyRate || 0, prevReportData.occupancyRate)).toFixed(1)}%
                  </div>
                )}
              </div>
            </div>
            
            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Revenue By Month Chart */}
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue by Month</h3>
                {reportData.revenueByMonth.length === 0 ? (
                  <div className="h-64 flex items-center justify-center text-gray-500">
                    No revenue data available for the selected period
                  </div>
                ) : (
                  <div className="h-64 flex items-end space-x-1 px-4 bg-gray-50 rounded border">
                    {reportData.revenueByMonth.map((item) => {
                      const maxRevenue = Math.max(...reportData.revenueByMonth.map(d => d.revenue));
                      const heightPx = maxRevenue === 0 ? 5 : Math.max(
                        Math.floor((item.revenue / maxRevenue) * 200),
                        5
                      );
                      return (
                        <div key={item.month} className="flex-1 min-w-[30px] flex flex-col items-center">
                          <div 
                            className="w-[25px] bg-blue-600 rounded-t-lg hover:bg-blue-700 transition-all cursor-pointer group relative border border-blue-700" 
                            style={{ height: `${heightPx}px` }}
                          >
                            <div className="opacity-0 group-hover:opacity-100 absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap z-10">
                              {formatCurrency(item.revenue)}
                            </div>
                          </div>
                          <div className="text-xs mt-2 text-gray-600 font-medium">{item.month}</div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
              
              {/* Booking Status Chart */}
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Bookings by Status</h3>
                <div className="h-64 flex justify-center items-center">
                  {chartType === 'pie' ? (
                    <div className="relative w-48 h-48">
                      {/* Mock pie chart - in a real implementation, use a charting library */}
                      <div className="text-center">
                        <div className="text-gray-500 mb-2">[Pie Chart Visualization]</div>
                        <div className="text-xs text-gray-500">
                          <div className="flex items-center mb-1">
                            <span className="w-3 h-3 bg-green-500 rounded-full mr-1"></span>
                            Completed: {reportData.completedBookings} ({((reportData.completedBookings / reportData.totalBookings) * 100 || 0).toFixed(1)}%)
                          </div>
                          <div className="flex items-center mb-1">
                            <span className="w-3 h-3 bg-yellow-500 rounded-full mr-1"></span>
                            Pending: {reportData.pendingBookings} ({((reportData.pendingBookings / reportData.totalBookings) * 100 || 0).toFixed(1)}%)
                          </div>
                          <div className="flex items-center">
                            <span className="w-3 h-3 bg-red-500 rounded-full mr-1"></span>
                            Cancelled: {reportData.cancelledBookings} ({((reportData.cancelledBookings / reportData.totalBookings) * 100 || 0).toFixed(1)}%)
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-end space-x-12 justify-center bg-gray-50 rounded border p-4 pt-8 pb-6">
                      <div className="flex flex-col items-center">
                        <div 
                          className="w-24 bg-green-600 border border-green-700 rounded-t-lg hover:bg-green-700" 
                          style={{ 
                            height: reportData.totalBookings === 0 ? '10px' : 
                              `${Math.max(70 + Math.sqrt((reportData.completedBookings / reportData.totalBookings) * 100) * 12, 10)}px`
                          }}
                        ></div>
                        <div className="text-sm mt-2 text-gray-800 font-medium">Completed</div>
                        <div className="text-base font-semibold">{reportData.completedBookings}</div>
                      </div>
                      <div className="flex flex-col items-center">
                        <div 
                          className="w-24 bg-yellow-500 border border-yellow-600 rounded-t-lg hover:bg-yellow-600" 
                          style={{ 
                            height: reportData.totalBookings === 0 ? '10px' : 
                              `${Math.max(70 + Math.sqrt((reportData.pendingBookings / reportData.totalBookings) * 100) * 12, 10)}px`
                          }}
                        ></div>
                        <div className="text-sm mt-2 text-gray-800 font-medium">Pending</div>
                        <div className="text-base font-semibold">{reportData.pendingBookings}</div>
                      </div>
                      <div className="flex flex-col items-center">
                        <div 
                          className="w-24 bg-red-500 border border-red-600 rounded-t-lg hover:bg-red-600" 
                          style={{ 
                            height: reportData.totalBookings === 0 ? '10px' : 
                              `${Math.max(70 + Math.sqrt((reportData.cancelledBookings / reportData.totalBookings) * 100) * 12, 10)}px`
                          }}
                        ></div>
                        <div className="text-sm mt-2 text-gray-800 font-medium">Cancelled</div>
                        <div className="text-base font-semibold">{reportData.cancelledBookings}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Top Hotels */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Top Performing Hotels</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Hotel
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Bookings
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Revenue
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Occupancy Rate
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {reportData.topHotels.map((hotel) => (
                      <tr key={hotel.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {hotel.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {hotel.bookingsCount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatCurrency(hotel.revenue)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {(hotel.occupancyRate || 0).toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center p-10 bg-gray-50 rounded-md">
            <p className="text-gray-600">No report data available.</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
} 