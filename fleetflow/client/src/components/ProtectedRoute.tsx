import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../store/auth'

export const ProtectedRoute = ({ allowedRoles }: { allowedRoles?: string[] }) => {
    const { isAuthenticated, user } = useAuthStore()

    if (!isAuthenticated || !user) {
        return <Navigate to="/login" replace />
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to="/unauthorized" replace />
    }

    return <Outlet />
}
