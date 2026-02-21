import { Router } from 'express'
import { getVehicles, getVehicleById, createVehicle, updateVehicle, deleteVehicle } from '../controllers/vehicles'
import { requireAuth, requireRole } from '../middleware/auth'
import { Role } from '@prisma/client'

const router = Router()

router.use(requireAuth) // All vehicle routes require authentication

router.get('/', getVehicles)
router.get('/:id', getVehicleById)

// Only Managers and Dispatchers can manage vehicles
const managerAndDispatcher = requireRole([Role.FLEET_MANAGER, Role.DISPATCHER])

router.post('/', managerAndDispatcher, createVehicle)
router.put('/:id', managerAndDispatcher, updateVehicle)
router.delete('/:id', managerAndDispatcher, deleteVehicle)

export default router
