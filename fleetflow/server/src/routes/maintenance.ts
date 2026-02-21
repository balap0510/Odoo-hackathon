import { Router } from 'express'
import { getMaintenanceLogs, createMaintenanceLog, deleteMaintenanceLog } from '../controllers/maintenance'
import { requireAuth, requireRole } from '../middleware/auth'
import { Role } from '@prisma/client'

const router = Router()

router.use(requireAuth)

router.get('/', getMaintenanceLogs)

const fleetManager = requireRole([Role.FLEET_MANAGER])

router.post('/', fleetManager, createMaintenanceLog)
router.delete('/:id', fleetManager, deleteMaintenanceLog)

export default router
