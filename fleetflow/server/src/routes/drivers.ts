import { Router } from 'express'
import { getDrivers, getDriverById, createDriver, updateDriver, deleteDriver } from '../controllers/drivers'
import { requireAuth, requireRole } from '../middleware/auth'
import { Role } from '@prisma/client'

const router = Router()

router.use(requireAuth)

router.get('/', getDrivers)
router.get('/:id', getDriverById)

const managerAndDispatcher = requireRole([Role.FLEET_MANAGER, Role.DISPATCHER, Role.SAFETY_OFFICER])

router.post('/', managerAndDispatcher, createDriver)
router.put('/:id', managerAndDispatcher, updateDriver)
router.delete('/:id', managerAndDispatcher, deleteDriver)

export default router
