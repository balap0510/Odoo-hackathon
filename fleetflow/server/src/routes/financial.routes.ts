import { Router } from 'express'
import { getFinancialDashboard } from '../controllers/financialAnalytics.controller'
import { requireAuth } from '../middleware/auth'
import { authorizeRoles } from '../middleware/authorize'
import { Role } from '@prisma/client'

const router = Router()

// Only Fleet Managers and Financial Analysts can view financials
router.use(requireAuth)
router.use(authorizeRoles(Role.FLEET_MANAGER, Role.FINANCIAL_ANALYST))

router.get('/dashboard', getFinancialDashboard)

export default router
