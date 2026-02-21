import { Request, Response } from 'express'
import prisma from '../prisma'
import { VehicleStatus, TripStatus } from '@prisma/client'
import { Parser } from 'json2csv'
import PDFDocument from 'pdfkit'

export const getDashboardKPIs = async (req: Request, res: Response) => {
    try {
        const totalFleet = await prisma.vehicle.count()
        const activeFleet = await prisma.vehicle.count({ where: { status: VehicleStatus.ON_TRIP } })
        const maintenanceAlerts = await prisma.vehicle.count({ where: { status: VehicleStatus.IN_SHOP } })

        const utilizationRate = totalFleet > 0 ? (activeFleet / totalFleet) * 100 : 0

        const pendingTrips = await prisma.trip.findMany({ where: { status: TripStatus.DRAFT } })
        const pendingCargo = pendingTrips.reduce((acc, trip) => acc + trip.cargoWeight, 0)

        res.json({
            totalFleet,
            activeFleet,
            maintenanceAlerts,
            utilizationRate: utilizationRate.toFixed(2),
            pendingCargo
        })
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch dashboard KPIs' })
    }
}

export const getVehicleROI = async (req: Request, res: Response) => {
    try {
        const vehicles = await prisma.vehicle.findMany({
            include: {
                trips: true,
                maintenanceLogs: true,
                fuelLogs: true
            }
        })

        const roiData = vehicles.map(v => {
            const revenue = v.trips.reduce((sum, t) => sum + t.revenue, 0)
            const maintenanceCost = v.maintenanceLogs.reduce((sum, m) => sum + m.cost, 0)
            const fuelCost = v.fuelLogs.reduce((sum, f) => sum + f.cost, 0)

            const operationalCost = maintenanceCost + fuelCost
            const roi = v.acquisitionCost > 0 ? ((revenue - operationalCost) / v.acquisitionCost) * 100 : 0

            return {
                id: v.id,
                name: v.name,
                licensePlate: v.licensePlate,
                revenue,
                operationalCost,
                roi: parseFloat(roi.toFixed(2))
            }
        })

        res.json(roiData.sort((a, b) => b.roi - a.roi))
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch ROI analytics' })
    }
}

export const exportAnalyticsCSV = async (req: Request, res: Response) => {
    try {
        const vehicles = await prisma.vehicle.findMany({
            include: { trips: true, maintenanceLogs: true, fuelLogs: true }
        })

        const data = vehicles.map(v => {
            const revenue = v.trips.reduce((sum, t) => sum + t.revenue, 0)
            const maintenanceCost = v.maintenanceLogs.reduce((sum, m) => sum + m.cost, 0)
            const fuelCost = v.fuelLogs.reduce((sum, f) => sum + f.cost, 0)

            return {
                LicensePlate: v.licensePlate,
                VehicleName: v.name,
                TotalTrips: v.trips.length,
                TotalRevenue: revenue,
                MaintenanceCost: maintenanceCost,
                FuelCost: fuelCost,
                NetProfit: revenue - (maintenanceCost + fuelCost)
            }
        })

        const parser = new Parser()
        const csv = parser.parse(data)

        res.header('Content-Type', 'text/csv')
        res.attachment('fleet_analytics.csv')
        res.send(csv)
    } catch (error) {
        res.status(500).json({ error: 'Failed to export CSV' })
    }
}

export const exportAnalyticsPDF = async (req: Request, res: Response) => {
    try {
        const vehicles = await prisma.vehicle.findMany({
            include: { trips: true, maintenanceLogs: true, fuelLogs: true }
        })

        const doc = new PDFDocument()
        res.setHeader('Content-Type', 'application/pdf')
        res.setHeader('Content-Disposition', 'attachment; filename=fleet_analytics.pdf')
        doc.pipe(res)

        doc.fontSize(20).text('FleetFlow Analytics Report', { align: 'center' })
        doc.moveDown()

        vehicles.forEach(v => {
            const revenue = v.trips.reduce((sum, t) => sum + t.revenue, 0)
            const maintenanceCost = v.maintenanceLogs.reduce((sum, m) => sum + m.cost, 0)
            const fuelCost = v.fuelLogs.reduce((sum, f) => sum + f.cost, 0)
            const profit = revenue - (maintenanceCost + fuelCost)

            doc.fontSize(14).text(`Vehicle: ${v.name} (${v.licensePlate})`)
            doc.fontSize(12).text(`- Revenue: $${revenue.toFixed(2)}`)
            doc.text(`- Maintenance: $${maintenanceCost.toFixed(2)}`)
            doc.text(`- Fuel: $${fuelCost.toFixed(2)}`)
            doc.text(`- Net Profit: $${profit.toFixed(2)}`)
            doc.moveDown()
        })

        doc.end()
    } catch (error) {
        res.status(500).json({ error: 'Failed to export PDF' })
    }
}
