"use server";

import { NextRequest, NextResponse } from "next/server";
import { getPrismaClientSync } from "@/helpers/prisma";
import { requireAdmin } from "@/middleware";
import { BookingStatus } from "@prisma/client";
import { startOfWeek, startOfMonth, startOfYear, subMonths } from 'date-fns';

/**
 * GET handler for retrieving report data (admin only)
 */
export async function GET(request: NextRequest) {
  try {
    // Check if the user is admin
    const adminCheck = await requireAdmin();
    if (adminCheck) return adminCheck; // Returns 401 if not admin
    
    const prisma = await getPrismaClientSync();
    if (!prisma) {
      return NextResponse.json(
        { error: "Database connection error" },
        { status: 500 }
      );
    }

    // Parse query parameters
    const url = new URL(request.url);
    const timeframe = url.searchParams.get("timeframe") || "all";
    const fromDate = url.searchParams.get("from");
    const toDate = url.searchParams.get("to");

    // Define date range based on timeframe or explicit dates
    let startDate: Date | null = null;
    const endDate = new Date();
    
    if (fromDate && toDate) {
      // Use explicit date range if provided
      startDate = new Date(fromDate);
    } else {
      // Otherwise use timeframe
      const now = new Date();
      
      if (timeframe === "week") {
        startDate = startOfWeek(now);
      } else if (timeframe === "month") {
        startDate = startOfMonth(now);
      } else if (timeframe === "year") {
        startDate = startOfYear(now);
      }
      // For "all", startDate remains null
    }

    // Build the date filter
    const dateFilter = startDate ? {
      checkInDate: {
        gte: startDate,
        lte: endDate
      }
    } : {};

    // Get booking statistics
    const bookingStats = await prisma.booking.groupBy({
      by: ['status'],
      where: dateFilter,
      _count: {
        id: true
      },
      _sum: {
        totalPrice: true
      }
    });

    // Calculate summary values
    let totalBookings = 0;
    let completedBookings = 0;
    let pendingBookings = 0;
    let cancelledBookings = 0;
    let totalRevenue = 0;

    bookingStats.forEach(stat => {
      const count = stat._count?.id || 0;
      totalBookings += count;
      
      if (stat.status === BookingStatus.COMPLETED) {
        completedBookings = count;
        totalRevenue += stat._sum?.totalPrice || 0;
      } else if (stat.status === BookingStatus.PENDING) {
        pendingBookings = count;
      } else if (stat.status === BookingStatus.CANCELLED) {
        cancelledBookings = count;
      }
    });

    // Format booking status for chart
    const bookingsByStatus = bookingStats.map(stat => ({
      status: stat.status,
      count: stat._count?.id || 0
    }));

    // Calculate the average booking value
    const averageBookingValue = completedBookings > 0 
      ? totalRevenue / completedBookings 
      : 0;

    // Calculate occupancy rate (mocked as we need room inventory data)
    // In a real implementation, this would use actual room availability
    const occupancyRate = totalBookings > 0 
      ? (completedBookings / totalBookings) * 100 
      : 0;

    // Get revenue by month (last 6 months)
    const sixMonthsAgo = subMonths(new Date(), 6);
    
    // Query bookings for revenue by month
    const recentBookings = await prisma.booking.findMany({
      where: {
        status: BookingStatus.COMPLETED,
        checkInDate: {
          gte: sixMonthsAgo
        }
      },
      select: {
        checkInDate: true,
        totalPrice: true
      }
    });

    // Format monthly revenue
    const revenueByMonth: { month: string; revenue: number }[] = [];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Group by month and sum revenue
    recentBookings.forEach(booking => {
      const date = new Date(booking.checkInDate);
      const monthKey = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
      
      const existingMonth = revenueByMonth.find(m => m.month === monthKey);
      if (existingMonth) {
        existingMonth.revenue += booking.totalPrice;
      } else {
        revenueByMonth.push({
          month: monthKey,
          revenue: booking.totalPrice
        });
      }
    });
    
    // Sort by date
    revenueByMonth.sort((a, b) => {
      const aMonth = monthNames.indexOf(a.month.split(' ')[0]);
      const aYear = parseInt(a.month.split(' ')[1]);
      const bMonth = monthNames.indexOf(b.month.split(' ')[0]);
      const bYear = parseInt(b.month.split(' ')[1]);
      
      return aYear !== bYear ? aYear - bYear : aMonth - bMonth;
    });

    // Get top hotels by combining room data
    const topHotelsData = await prisma.room.findMany({
      where: {
        bookings: {
          some: dateFilter
        }
      },
      select: {
        hotel: {
          select: {
            id: true,
            name: true,
          }
        },
        bookings: {
          where: dateFilter,
          select: {
            totalPrice: true,
            status: true
          }
        }
      }
    });
    
    // Process hotel data to calculate metrics
    const hotelMap = new Map<string, { 
      id: string; 
      name: string; 
      bookingsCount: number; 
      revenue: number; 
    }>();
    
    topHotelsData.forEach(room => {
      const hotelId = room.hotel.id;
      const hotelName = room.hotel.name;
      
      // Skip if no hotel info
      if (!hotelId) return;
      
      // Get or initialize hotel stats
      let hotelStats = hotelMap.get(hotelId);
      if (!hotelStats) {
        hotelStats = {
          id: hotelId,
          name: hotelName,
          bookingsCount: 0,
          revenue: 0
        };
        hotelMap.set(hotelId, hotelStats);
      }
      
      // Add stats from this room
      room.bookings.forEach(booking => {
        hotelStats!.bookingsCount++;
        
        if (booking.status !== BookingStatus.CANCELLED) {
          hotelStats!.revenue += booking.totalPrice;
        }
      });
    });
    
    // Convert map to array and sort by revenue
    const topHotels = Array.from(hotelMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)
      .map(hotel => ({
        ...hotel,
        // Calculate occupancy rate for this hotel (mocked)
        occupancyRate: Math.min(85, Math.random() * 30 + 60) // Random between 60-90%
      }));

    // Construct the response
    const reportData = {
      totalBookings,
      completedBookings,
      pendingBookings,
      cancelledBookings,
      totalRevenue,
      averageBookingValue,
      occupancyRate,
      bookingsByStatus,
      revenueByMonth,
      topHotels
    };

    return NextResponse.json(reportData);
  } catch (error) {
    console.error("Error generating reports:", error);
    return NextResponse.json(
      { error: "Failed to generate reports" },
      { status: 500 }
    );
  }
} 