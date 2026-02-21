import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { api } from '../services/api'
import { useAuthStore } from '../store/auth'
import { Truck } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Controller } from "react-hook-form"

const registerSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    role: z.enum(['FLEET_MANAGER', 'DISPATCHER', 'SAFETY_OFFICER', 'FINANCIAL_ANALYST'], {
        errorMap: () => ({ message: "Please select a role" })
    })
})

type RegisterFormValues = z.infer<typeof registerSchema>

export default function Register() {
    const navigate = useNavigate()
    const login = useAuthStore((state) => state.login)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const { register, handleSubmit, control, formState: { errors } } = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema)
    })

    const onSubmit = async (data: RegisterFormValues) => {
        setLoading(true)
        setError('')
        try {
            const response = await api.post('/auth/register', data)
            login(response.data.user, response.data.accessToken)
            navigate('/')
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to register.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md shadow-lg border-primary/10">
                <CardHeader className="space-y-1 items-center justify-center text-center">
                    <div className="bg-primary/10 p-3 rounded-full mb-4">
                        <Truck className="w-8 h-8 text-primary" />
                    </div>
                    <CardTitle className="text-2xl font-bold tracking-tight">Create an Account</CardTitle>
                    <CardDescription>
                        Register for a new FleetFlow account
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <CardContent className="space-y-4">
                        {error && (
                            <div className="p-3 rounded bg-destructive/15 text-destructive text-sm font-medium">
                                {error}
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="email">Email address</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="newuser@fleetflow.com"
                                {...register('email')}
                                className={errors.email ? "border-destructive focus-visible:ring-destructive" : ""}
                            />
                            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                {...register('password')}
                                className={errors.password ? "border-destructive focus-visible:ring-destructive" : ""}
                            />
                            {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="role">Role</Label>
                            <Controller
                                name="role"
                                control={control}
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <SelectTrigger className={errors.role ? "border-destructive focus:ring-destructive" : ""}>
                                            <SelectValue placeholder="Select a role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="DISPATCHER">Dispatcher</SelectItem>
                                            <SelectItem value="FLEET_MANAGER">Fleet Manager</SelectItem>
                                            <SelectItem value="SAFETY_OFFICER">Safety Officer</SelectItem>
                                            <SelectItem value="FINANCIAL_ANALYST">Financial Analyst</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.role && <p className="text-sm text-destructive">{errors.role.message}</p>}
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-4">
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? 'Creating account...' : 'Sign Up'}
                        </Button>
                        <div className="text-sm text-center text-slate-600">
                            Already have an account?{' '}
                            <Link to="/login" className="text-primary hover:underline font-medium">
                                Sign in
                            </Link>
                        </div>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}
