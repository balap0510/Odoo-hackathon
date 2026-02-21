import { Request, Response } from 'express'
import bcrypt from 'bcrypt'
import prisma from '../prisma'
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt'
import { z } from 'zod'

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6)
})

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = loginSchema.parse(req.body)

        const user = await prisma.user.findUnique({ where: { email } })
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' })
        }

        const isValid = await bcrypt.compare(password, user.password)
        if (!isValid) {
            return res.status(401).json({ error: 'Invalid credentials' })
        }

        const accessToken = generateAccessToken(user.id, user.role)
        const refreshToken = generateRefreshToken(user.id, user.role)

        res.json({
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                email: user.email,
                role: user.role
            }
        })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: 'Invalid input data', details: error.issues })
        }
        console.error('Login error:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
}

export const refreshToken = async (req: Request, res: Response) => {
    try {
        const { token } = req.body
        if (!token) {
            return res.status(400).json({ error: 'Refresh token required' })
        }

        const decoded = verifyRefreshToken(token) as { id: string; role: string }
        const accessToken = generateAccessToken(decoded.id, decoded.role)
        const newRefreshToken = generateRefreshToken(decoded.id, decoded.role)

        res.json({ accessToken, refreshToken: newRefreshToken })
    } catch (error) {
        return res.status(401).json({ error: 'Invalid or expired refresh token' })
    }
}

export const getMe = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, email: true, role: true }
        })
        if (!user) return res.status(404).json({ error: 'User not found' })
        res.json(user)
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' })
    }
}
