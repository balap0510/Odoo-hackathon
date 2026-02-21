import { PrismaClient, Role, VehicleType, VehicleStatus, DriverStatus } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcrypt'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
    console.log('Seeding Database...')

    // Clear existing data
    await prisma.expense.deleteMany()
    await prisma.fuelLog.deleteMany()
    await prisma.maintenanceLog.deleteMany()
    await prisma.trip.deleteMany()
    await prisma.driver.deleteMany()
    await prisma.vehicle.deleteMany()
    await prisma.user.deleteMany()

    // 1. Create Users
    const passwordHash = await bcrypt.hash('password123', 10)

    await prisma.user.create({
        data: {
            email: 'admin@fleetflow.com',
            password: passwordHash,
            role: Role.FLEET_MANAGER
        }
    })

    await prisma.user.create({
        data: {
            email: 'safety@fleetflow.com',
            password: passwordHash,
            role: Role.SAFETY_OFFICER
        }
    })

    await prisma.user.create({
        data: {
            email: 'analyst@fleetflow.com',
            password: passwordHash,
            role: Role.FINANCIAL_ANALYST
        }
    })

    const dispatcher = await prisma.user.create({
        data: {
            email: 'dispatcher@fleetflow.com',
            password: passwordHash,
            role: Role.DISPATCHER
        }
    })

    // 2. Create Vehicles
    const truck1 = await prisma.vehicle.create({
        data: {
            name: 'Volvo FH16',
            licensePlate: 'TRK-001',
            maxCapacityKg: 20000,
            odometer: 15000,
            vehicleType: VehicleType.TRUCK,
            acquisitionCost: 120000,
            status: VehicleStatus.AVAILABLE
        }
    })

    const van1 = await prisma.vehicle.create({
        data: {
            name: 'Ford Transit',
            licensePlate: 'VAN-001',
            maxCapacityKg: 1500,
            odometer: 50000,
            vehicleType: VehicleType.VAN,
            acquisitionCost: 35000,
            status: VehicleStatus.ON_TRIP
        }
    })

    // 3. Create Drivers
    const driver1 = await prisma.driver.create({
        data: {
            name: 'John Doe',
            licenseNumber: 'DL-12345',
            licenseExpiryDate: new Date('2028-05-20'),
            licenseCategory: 'CE',
            safetyScore: 95,
            status: DriverStatus.OFF_DUTY
        }
    })

    const driver2 = await prisma.driver.create({
        data: {
            name: 'Sarah Connor',
            licenseNumber: 'LNN-89012',
            licenseExpiryDate: new Date('2024-01-15T00:00:00Z'), // Explicitly expired for testing
            licenseCategory: 'C',
            status: DriverStatus.OFF_DUTY
        }
    })

    const driver3 = await prisma.driver.create({
        data: {
            name: 'John Matrix',
            licenseNumber: 'LNN-55555',
            licenseExpiryDate: new Date('2027-04-15T00:00:00Z'),
            licenseCategory: 'CE',
            status: DriverStatus.SUSPENDED,
            complianceStatus: 'NON_COMPLIANT',
            suspensionReason: 'Speeding violation out of state'
        }
    })

    console.log('Seeding Done!')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
