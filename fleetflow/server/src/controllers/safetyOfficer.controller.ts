import { Request, Response } from 'express'
import prisma from '../prisma'
import { DriverStatus } from '@prisma/client'
import { z } from 'zod'

export const getComplianceDashboard = async (req: Request, res: Response) => {
    try {
        const now = new Date()
        const thirtyDaysFromNow = new Date()
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)

        // Expired Licenses
        const expiredLicenses = await prisma.driver.findMany({
            where: { licenseExpiryDate: { lt: now } }
        })

        // Expiring in 30 days
        const expiringLicenses = await prisma.driver.findMany({
            where: {
                licenseExpiryDate: {
                    gte: now,
                    lte: thirtyDaysFromNow
                }
            }
        })

        // Suspended Drivers
        const suspendedDrivers = await prisma.driver.findMany({
            where: { status: DriverStatus.SUSPENDED }
        })

        // Safety Score ranking (Top 5 & Bottom 5 for quick view, or all if needed)
        const driversRankedBySafety = await prisma.driver.findMany({
            orderBy: { safetyScore: 'desc' }
        })

        // Compliance Percentage
        const totalDrivers = await prisma.driver.count()
        const compliantDrivers = await prisma.driver.count({
            where: { complianceStatus: 'COMPLIANT' as any }
        })
        const compliancePercentage = totalDrivers > 0 ? (compliantDrivers / totalDrivers) * 100 : 0

        res.json({
            metrics: {
                expiredCount: expiredLicenses.length,
                expiringCount: expiringLicenses.length,
                suspendedCount: suspendedDrivers.length,
                compliancePercentage: compliancePercentage.toFixed(2),
                totalDrivers
            },
            expiredLicenses,
            expiringLicenses,
            suspendedDrivers,
            driversRankedBySafety
        })
    } catch (error) {
        res.status(500).json({ error: 'Internal server error while fetching compliance dashboard.' })
    }
}

const suspendSchema = z.object({
    reason: z.string().min(5, 'Reason must be at least 5 characters long')
})

export const suspendDriver = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string
        const { reason } = suspendSchema.parse(req.body)

        const driver = await prisma.driver.findUnique({ where: { id } })
        if (!driver) return res.status(404).json({ error: 'Driver not found' })

        if (driver.status === DriverStatus.ON_DUTY) {
            return res.status(400).json({ error: 'Cannot suspend a driver who is currently ON_DUTY. They must finish their trip first.' })
        }

        const updatedDriver = await prisma.driver.update({
            where: { id },
            data: {
                status: DriverStatus.SUSPENDED,
                complianceStatus: 'NON_COMPLIANT' as any,
                suspensionReason: reason
            }
        })

        res.json(updatedDriver)
    } catch (error) {
        if (error instanceof z.ZodError) return res.status(400).json({ error: 'Validation Error', details: error.issues })
        res.status(500).json({ error: 'Failed to suspend driver' })
    }
}

export const reinstateDriver = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string

        const driver = await prisma.driver.findUnique({ where: { id } })
        if (!driver) return res.status(404).json({ error: 'Driver not found' })

        if (driver.status !== DriverStatus.SUSPENDED) {
            return res.status(400).json({ error: 'Only suspended drivers can be reinstated' })
        }

        // Must check if license is valid before reinstating
        if (new Date() > driver.licenseExpiryDate) {
            return res.status(400).json({ error: 'Cannot reinstate driver. License is currently expired. Please update license details first.' })
        }

        const updatedDriver = await prisma.driver.update({
            where: { id },
            data: {
                status: DriverStatus.OFF_DUTY,
                complianceStatus: 'COMPLIANT' as any,
                suspensionReason: null
            }
        })

        res.json(updatedDriver)
    } catch (error) {
        res.status(500).json({ error: 'Failed to reinstate driver' })
    }
}
