import { Router } from 'express'
import { getDashboardKPIs, getVehicleROI, exportAnalyticsCSV, exportAnalyticsPDF } from '../controllers/analytics'
import { requireAuth, requireRole } from '../middleware/auth'
import { Role } from '@prisma/client'

const router = Router()

router.use(requireAuth)

router.get('/kpis', getDashboardKPIs)
router.get('/roi', requireRole([Role.FLEET_MANAGER, Role.FINANCIAL_ANALYST]), getVehicleROI)

// Export endpoints
router.get('/export/csv', requireRole([Role.FLEET_MANAGER, Role.FINANCIAL_ANALYST]), exportAnalyticsCSV)
router.get('/export/pdf', requireRole([Role.FLEET_MANAGER, Role.FINANCIAL_ANALYST]), exportAnalyticsPDF)

export default router
