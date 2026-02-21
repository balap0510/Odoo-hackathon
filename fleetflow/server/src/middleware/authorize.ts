import { Response, NextFunction } from 'express'
import { Role } from '@prisma/client'
import { AuthRequest } from './auth'

export const authorizeRoles = (...roles: Role[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        const user = req.user

        if (!user) {
            return res.status(401).json({ error: 'Unauthorized: No user attached to request' })
        }

        if (!roles.includes(user.role as Role)) {
            return res.status(403).json({
                error: `Forbidden: User role ${user.role} is not authorized to access this resource`
            })
        }

        next()
    }
}
