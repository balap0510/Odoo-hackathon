import { Router } from 'express'
import { getComplianceDashboard, suspendDriver, reinstateDriver } from '../controllers/safetyOfficer.controller'
import { requireAuth } from '../middleware/auth'
import { authorizeRoles } from '../middleware/authorize'
import { Role } from '@prisma/client'

const router = Router()

// All compliance routes require Authentication and specific roles
router.use(requireAuth)
router.use(authorizeRoles(Role.FLEET_MANAGER, Role.SAFETY_OFFICER))

router.get('/dashboard', getComplianceDashboard)
router.put('/drivers/:id/suspend', suspendDriver)
router.put('/drivers/:id/reinstate', reinstateDriver)

export default router
