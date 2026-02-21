import { Request, Response } from 'express'
import { z } from 'zod'
import prisma from '../prisma'
import { VehicleType, VehicleStatus } from '@prisma/client'

const vehicleSchema = z.object({
    name: z.string(),
    licensePlate: z.string(),
    maxCapacityKg: z.number().min(0),
    odometer: z.number().min(0),
    vehicleType: z.nativeEnum(VehicleType),
    acquisitionCost: z.number().min(0),
    status: z.nativeEnum(VehicleStatus).optional()
})

const vehicleUpdateSchema = vehicleSchema.partial()

export const getVehicles = async (req: Request, res: Response) => {
    try {
        const { status, type } = req.query
        const filter: any = {}
        if (status) filter.status = status as VehicleStatus
        if (type) filter.vehicleType = type as VehicleType

        const vehicles = await prisma.vehicle.findMany({ where: filter, orderBy: { createdAt: 'desc' } })
        res.json(vehicles)
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' })
    }
}

export const getVehicleById = async (req: Request, res: Response) => {
    try {
        const vehicle = await prisma.vehicle.findUnique({
            where: { id: req.params.id },
            include: {
                maintenanceLogs: true,
                fuelLogs: true
            }
        })
        if (!vehicle) return res.status(404).json({ error: 'Vehicle not found' })
        res.json(vehicle)
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' })
    }
}

export const createVehicle = async (req: Request, res: Response) => {
    try {
        const data = vehicleSchema.parse(req.body)
        const existing = await prisma.vehicle.findUnique({ where: { licensePlate: data.licensePlate } })
        if (existing) return res.status(400).json({ error: 'License plate already exists' })

        const vehicle = await prisma.vehicle.create({ data })
        res.status(201).json(vehicle)
    } catch (error) {
        if (error instanceof z.ZodError) return res.status(400).json({ error: 'Validation Error', details: error.issues })
        res.status(500).json({ error: 'Internal server error' })
    }
}

export const updateVehicle = async (req: Request, res: Response) => {
    try {
        const data = vehicleUpdateSchema.parse(req.body)
        const vehicle = await prisma.vehicle.update({
            where: { id: req.params.id },
            data
        })
        res.json(vehicle)
    } catch (error) {
        if (error instanceof z.ZodError) return res.status(400).json({ error: 'Validation Error', details: error.issues })
        res.status(500).json({ error: 'Failed to update vehicle' })
    }
}

export const deleteVehicle = async (req: Request, res: Response) => {
    try {
        await prisma.vehicle.delete({ where: { id: req.params.id } })
        res.status(204).send()
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete vehicle' })
    }
}
