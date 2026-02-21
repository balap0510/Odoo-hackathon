import { Request, Response } from 'express'
import { z } from 'zod'
import prisma from '../prisma'
import { DriverStatus } from '@prisma/client'

const driverSchema = z.object({
    name: z.string(),
    licenseNumber: z.string(),
    licenseExpiryDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date format" }),
    licenseCategory: z.string(),
    safetyScore: z.number().min(0).max(100).optional(),
    status: z.nativeEnum(DriverStatus).optional()
})

const driverUpdateSchema = driverSchema.partial()

export const getDrivers = async (req: Request, res: Response) => {
    try {
        const { status } = req.query
        const filter = status ? { status: status as DriverStatus } : {}
        const drivers = await prisma.driver.findMany({ where: filter, orderBy: { createdAt: 'desc' } })
        res.json(drivers)
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' })
    }
}

export const getDriverById = async (req: Request, res: Response) => {
    try {
        const driver = await prisma.driver.findUnique({
            where: { id: req.params.id },
            include: {
                trips: {
                    take: 5,
                    orderBy: { createdAt: 'desc' }
                }
            }
        })
        if (!driver) return res.status(404).json({ error: 'Driver not found' })
        res.json(driver)
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' })
    }
}

export const createDriver = async (req: Request, res: Response) => {
    try {
        const data = driverSchema.parse(req.body)
        const existing = await prisma.driver.findUnique({ where: { licenseNumber: data.licenseNumber } })
        if (existing) return res.status(400).json({ error: 'License number already exists' })

        const driver = await prisma.driver.create({
            data: {
                ...data,
                licenseExpiryDate: new Date(data.licenseExpiryDate)
            }
        })
        res.status(201).json(driver)
    } catch (error) {
        if (error instanceof z.ZodError) return res.status(400).json({ error: 'Validation Error', details: error.errors })
        res.status(500).json({ error: 'Internal server error' })
    }
}

export const updateDriver = async (req: Request, res: Response) => {
    try {
        const data = driverUpdateSchema.parse(req.body)
        const updateData: any = { ...data }
        if (data.licenseExpiryDate) {
            updateData.licenseExpiryDate = new Date(data.licenseExpiryDate)
        }

        const driver = await prisma.driver.update({
            where: { id: req.params.id },
            data: updateData
        })
        res.json(driver)
    } catch (error) {
        if (error instanceof z.ZodError) return res.status(400).json({ error: 'Validation Error', details: error.issues })
        res.status(500).json({ error: 'Failed to update driver' })
    }
}

export const deleteDriver = async (req: Request, res: Response) => {
    try {
        await prisma.driver.delete({ where: { id: req.params.id } })
        res.status(204).send()
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete driver' })
    }
}
