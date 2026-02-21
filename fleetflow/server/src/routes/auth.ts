import { Router } from 'express'
import { login, refreshToken, getMe, register } from '../controllers/auth'
import { requireAuth } from '../middleware/auth'

const router = Router()

router.post('/register', register)
router.post('/login', login)
router.post('/refresh', refreshToken)
router.get('/me', requireAuth, getMe)

export default router
