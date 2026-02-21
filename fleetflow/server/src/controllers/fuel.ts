import { Request, Response } from 'express'
import { z } from 'zod'
import prisma from '../prisma'

const fuelSchema = z.object({
    vehicleId: z.string().uuid(),
    liters: z.number().positive(),
    cost: z.number().positive(),
    date: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date format" })
})

export const getFuelLogs = async (req: Request, res: Response) => {
    try {
        const { vehicleId } = req.query
        const filter = vehicleId ? { vehicleId: vehicleId as string } : {}
        const logs = await prisma.fuelLog.findMany({ where: filter, orderBy: { date: 'desc' }, include: { vehicle: true } })
        res.json(logs)
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' })
    }
}

export const createFuelLog = async (req: Request, res: Response) => {
    try {
        const data = fuelSchema.parse(req.body)

        const vehicle = await prisma.vehicle.findUnique({ where: { id: data.vehicleId } })
        if (!vehicle) return res.status(404).json({ error: 'Vehicle not found' })

        const log = await prisma.fuelLog.create({
            data: {
                ...data,
                date: new Date(data.date)
            }
        })

        res.status(201).json(log)
    } catch (error) {
        if (error instanceof z.ZodError) return res.status(400).json({ error: 'Validation Error', details: error.issues })
        res.status(500).json({ error: 'Internal server error' })
    }
}
