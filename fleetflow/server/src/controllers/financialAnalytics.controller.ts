import { Request, Response } from 'express'
import prisma from '../prisma'

export const getFinancialDashboard = async (req: Request, res: Response) => {
    try {
        const trips = await prisma.trip.findMany({
            where: { status: 'COMPLETED' },
            include: { vehicle: true }
        })

        const maintenanceLogs = await prisma.maintenanceLog.findMany()
        const fuelLogs = await prisma.fuelLog.findMany()
        const expenses = await prisma.expense.findMany()

        // Needed for true ROI percentage
        const vehicles = await prisma.vehicle.findMany()
        const totalInvested = vehicles.reduce((sum, v) => sum + v.acquisitionCost, 0)

        const totalRevenue = trips.reduce((sum, trip) => sum + trip.revenue, 0)

        let totalDistance = 0
        trips.forEach(trip => {
            if (trip.endOdometer) {
                totalDistance += (trip.endOdometer - trip.startOdometer)
            }
        })

        const totalMaintenanceCost = maintenanceLogs.reduce((sum, log) => sum + log.cost, 0)
        const totalFuelCost = fuelLogs.reduce((sum, log) => sum + log.cost, 0)
        const totalOtherExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0)

        const totalLiters = fuelLogs.reduce((sum, log) => sum + log.liters, 0)

        const totalCosts = totalMaintenanceCost + totalFuelCost + totalOtherExpenses
        const netProfit = totalRevenue - totalCosts
        const roiPercentage = totalInvested > 0 ? (netProfit / totalInvested) * 100 : 0

        const costPerKm = totalDistance > 0 ? totalCosts / totalDistance : 0
        const fuelEfficiency = totalLiters > 0 ? totalDistance / totalLiters : 0

        // In a real scenario, these would group by month
        const revenueTrend = [
            { name: 'Jan', revenue: totalRevenue * 0.1 },
            { name: 'Feb', revenue: totalRevenue * 0.2 },
            { name: 'Mar', revenue: totalRevenue * 0.7 } // Simplified mock data
        ]

        res.json({
            metrics: {
                totalRevenue,
                totalCosts,
                netProfit,
                roiPercentage: roiPercentage.toFixed(2),
                costPerKm: costPerKm.toFixed(2),
                fuelEfficiency: fuelEfficiency.toFixed(2),
                totalDistance
            },
            costBreakdown: {
                maintenance: totalMaintenanceCost,
                fuel: totalFuelCost,
                other: totalOtherExpenses
            },
            revenueTrend,
            recentExpenses: expenses.slice(0, 5)
        })
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch financial dashboard data' })
    }
}
