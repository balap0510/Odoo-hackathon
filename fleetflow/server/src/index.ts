import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import rateLimit from 'express-rate-limit'
import authRoutes from './routes/auth'
import vehicleRoutes from './routes/vehicles'
import driverRoutes from './routes/drivers'
import tripRoutes from './routes/trips'
import maintenanceRoutes from './routes/maintenance'
import fuelRoutes from './routes/fuel'
import complianceRoutes from './routes/compliance.routes'
import financialRoutes from './routes/financial.routes'
import analyticsRoutes from './routes/analytics'

const app = express()
const PORT = process.env.PORT || 5001

// Middleware
app.use(cors())
app.use(express.json())

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per `window`
    standardHeaders: true,
    legacyHeaders: false,
})

app.use('/api', apiLimiter)

// Routes
app.use('/api/v1/auth', authRoutes)
app.use('/api/v1/vehicles', vehicleRoutes)
app.use('/api/v1/drivers', driverRoutes)
app.use('/api/v1/trips', tripRoutes)
app.use('/api/v1/maintenance', maintenanceRoutes)
app.use('/api/v1/fuel', fuelRoutes)
app.use('/api/v1/compliance', complianceRoutes)
app.use('/api/v1/financials', financialRoutes)
app.use('/api/v1/analytics', analyticsRoutes)

// Health Check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date() })
})

// Start server
const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})

server.on('error', (e) => {
    console.error('Error starting server', e)
})

export default app
