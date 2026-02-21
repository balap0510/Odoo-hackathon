import { Request, Response } from 'express'
import { z } from 'zod'
import prisma from '../prisma'
import { VehicleStatus } from '@prisma/client'

const maintenanceSchema = z.object({
    vehicleId: z.string().uuid(),
    serviceType: z.string(),
    cost: z.number().min(0),
    date: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date format" }),
    notes: z.string().optional()
})

export const getMaintenanceLogs = async (req: Request, res: Response) => {
    try {
        const { vehicleId } = req.query
        const filter = vehicleId ? { vehicleId: vehicleId as string } : {}
        const logs = await prisma.maintenanceLog.findMany({ where: filter, orderBy: { date: 'desc' }, include: { vehicle: true } })
        res.json(logs)
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' })
    }
}

export const createMaintenanceLog = async (req: Request, res: Response) => {
    try {
        const data = maintenanceSchema.parse(req.body)

        const vehicle = await prisma.vehicle.findUnique({ where: { id: data.vehicleId } })
        if (!vehicle) return res.status(404).json({ error: 'Vehicle not found' })

        const [log] = await prisma.$transaction([
            prisma.maintenanceLog.create({
                data: {
                    ...data,
                    date: new Date(data.date)
                }
            }),
            prisma.vehicle.update({
                where: { id: data.vehicleId },
                data: { status: VehicleStatus.IN_SHOP } // Auto Logic: Adding service log -> vehicle status = IN_SHOP
            })
        ])

        res.status(201).json(log)
    } catch (error) {
        if (error instanceof z.ZodError) return res.status(400).json({ error: 'Validation Error', details: error.issues })
        res.status(500).json({ error: 'Internal server error' })
    }
}

export const deleteMaintenanceLog = async (req: Request, res: Response) => {
    try {
        const log = await prisma.maintenanceLog.findUnique({ where: { id: req.params.id } })
        if (!log) return res.status(404).json({ error: 'Log not found' })

        await prisma.$transaction([
            prisma.maintenanceLog.delete({ where: { id: req.params.id } }),
            prisma.vehicle.update({
                where: { id: log.vehicleId },
                data: { status: VehicleStatus.AVAILABLE } // Auto Logic: Removing -> status = AVAILABLE
            })
        ])

        res.status(204).send()
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete log' })
    }
}
