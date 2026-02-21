import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import authRoutes from './routes/auth'
import vehicleRoutes from './routes/vehicles'
import driverRoutes from './routes/drivers'
import tripRoutes from './routes/trips'
import maintenanceRoutes from './routes/maintenance'
import fuelRoutes from './routes/fuel'
import analyticsRoutes from './routes/analytics'

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors())
app.use(express.json())

// Routes
app.use('/api/v1/auth', authRoutes)
app.use('/api/v1/vehicles', vehicleRoutes)
app.use('/api/v1/drivers', driverRoutes)
app.use('/api/v1/trips', tripRoutes)
app.use('/api/v1/maintenance', maintenanceRoutes)
app.use('/api/v1/fuel', fuelRoutes)
app.use('/api/v1/analytics', analyticsRoutes)

// Health Check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date() })
})

// Start server
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`)
    })
}

export default app
