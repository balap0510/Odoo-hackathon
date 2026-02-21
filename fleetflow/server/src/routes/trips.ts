import { Router } from 'express'
import { getTrips, getTripById, createTrip, dispatchTrip, completeTrip } from '../controllers/trips'
import { requireAuth, requireRole } from '../middleware/auth'
import { Role } from '@prisma/client'

const router = Router()

router.use(requireAuth)

router.get('/', getTrips)
router.get('/:id', getTripById)

const dispatchersAndManagers = requireRole([Role.DISPATCHER, Role.FLEET_MANAGER])

router.post('/', dispatchersAndManagers, createTrip)
router.post('/:id/dispatch', dispatchersAndManagers, dispatchTrip)
router.post('/:id/complete', dispatchersAndManagers, completeTrip)

export default router
