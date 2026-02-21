import { Request, Response } from 'express'
import { z } from 'zod'
import prisma from '../prisma'
import { TripStatus, VehicleStatus, DriverStatus } from '@prisma/client'

const tripSchema = z.object({
    vehicleId: z.string().uuid(),
    driverId: z.string().uuid(),
    cargoWeight: z.number().positive(),
    origin: z.string(),
    destination: z.string(),
    revenue: z.number().positive()
})

const tripUpdateSchema = tripSchema.partial()

export const createTrip = async (req: Request, res: Response) => {
    try {
        const data = tripSchema.parse(req.body)

        const vehicle = await prisma.vehicle.findUnique({ where: { id: data.vehicleId } })
        const driver = await prisma.driver.findUnique({ where: { id: data.driverId } })

        if (!vehicle) return res.status(404).json({ error: 'Vehicle not found' })
        if (!driver) return res.status(404).json({ error: 'Driver not found' })

        if (data.cargoWeight > vehicle.maxCapacityKg) {
            return res.status(400).json({ error: 'Cargo weight exceeds vehicle max capacity' })
        }
        if (new Date() > driver.licenseExpiryDate) {
            return res.status(400).json({ error: 'Driver license is expired' })
        }
        if (vehicle.status !== VehicleStatus.AVAILABLE) {
            return res.status(400).json({ error: 'Vehicle is not available for dispatch' })
        }
        if (driver.status !== DriverStatus.OFF_DUTY) {
            return res.status(400).json({ error: 'Driver is not available for dispatch' })
        }

        const trip = await prisma.trip.create({
            data: {
                ...data,
                startOdometer: vehicle.odometer,
                status: TripStatus.DRAFT
            }
        })

        res.status(201).json(trip)
    } catch (error) {
        if (error instanceof z.ZodError) return res.status(400).json({ error: 'Validation Error', details: error.issues })
        res.status(500).json({ error: 'Internal server error' })
    }
}

export const dispatchTrip = async (req: Request, res: Response) => {
    try {
        const { id } = req.params

        const trip = await prisma.trip.findUnique({ where: { id: id as string } })
        if (!trip) return res.status(404).json({ error: 'Trip not found' })
        if (trip.status !== TripStatus.DRAFT) {
            return res.status(400).json({ error: 'Only DRAFT trips can be dispatched' })
        }

        // Wrap in transaction
        const [updatedTrip] = await prisma.$transaction([
            prisma.trip.update({
                where: { id: id as string },
                data: { status: TripStatus.DISPATCHED, dispatchedAt: new Date() }
            }),
            prisma.vehicle.update({
                where: { id: trip.vehicleId },
                data: { status: VehicleStatus.ON_TRIP }
            }),
            prisma.driver.update({
                where: { id: trip.driverId },
                data: { status: DriverStatus.ON_DUTY }
            })
        ])

        res.json(updatedTrip)
    } catch (error) {
        res.status(500).json({ error: 'Failed to dispatch trip' })
    }
}

export const completeTrip = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const { endOdometer } = req.body

        if (!endOdometer || typeof endOdometer !== 'number') {
            return res.status(400).json({ error: 'Valid endOdometer is required' })
        }

        const trip = await prisma.trip.findUnique({ where: { id: id as string } })
        if (!trip) return res.status(404).json({ error: 'Trip not found' })
        if (trip.status !== TripStatus.DISPATCHED) {
            return res.status(400).json({ error: 'Only DISPATCHED trips can be completed' })
        }
        if (endOdometer < trip.startOdometer) {
            return res.status(400).json({ error: 'endOdometer cannot be less than startOdometer' })
        }

        const [updatedTrip] = await prisma.$transaction([
            prisma.trip.update({
                where: { id: id as string },
                data: { status: TripStatus.COMPLETED, completedAt: new Date(), endOdometer }
            }),
            prisma.vehicle.update({
                where: { id: trip.vehicleId },
                data: { status: VehicleStatus.AVAILABLE, odometer: endOdometer }
            }),
            prisma.driver.update({
                where: { id: trip.driverId },
                data: { status: DriverStatus.OFF_DUTY }
            })
        ])

        res.json(updatedTrip)
    } catch (error) {
        res.status(500).json({ error: 'Failed to complete trip' })
    }
}

export const getTrips = async (req: Request, res: Response) => {
    try {
        const trips = await prisma.trip.findMany({
            include: { vehicle: true, driver: true },
            orderBy: { createdAt: 'desc' }
        })
        res.json(trips)
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' })
    }
}

export const getTripById = async (req: Request, res: Response) => {
    try {
        const trip = await prisma.trip.findUnique({
            where: { id: req.params.id as string },
            include: { vehicle: true, driver: true }
        })
        if (!trip) return res.status(404).json({ error: 'Trip not found' })
        res.json(trip)
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' })
    }
}
