import { Router } from 'express'
import { getFuelLogs, createFuelLog } from '../controllers/fuel'
import { requireAuth, requireRole } from '../middleware/auth'
import { Role } from '@prisma/client'

const router = Router()

router.use(requireAuth)

router.get('/', getFuelLogs)
// Financial analyst tracking or managers
router.post('/', requireRole([Role.FLEET_MANAGER, Role.FINANCIAL_ANALYST, Role.DISPATCHER]), createFuelLog)

export default router
